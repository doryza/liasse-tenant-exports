const S = require('./lib/settings');
const T = require('./lib/i18n');
const B = require('./lib/booking');
const A = require('./lib/admin');
const getModules = require('./lib/modules');
const makeNotify = require('./lib/notify');
const makeVehicles = require('./lib/vehicles');
const assets = require('./lib/assets');

/** Bare paths 301 to their trailing-slash canonical form. */
const REDIRECTS = [
  ['/services', '/services/'], ['/rendez-vous', '/rendez-vous/'], ['/mon-compte', '/mon-compte/'],
  ['/carnet-d-entretien', '/carnet-d-entretien/'], ['/a-propos', '/a-propos/'], ['/contact', '/contact/'],
  ['/confidentialite', '/confidentialite/'],
  ['/en', '/en/'], ['/en/services', '/en/services/'], ['/en/appointment', '/en/appointment/'], ['/en/my-account', '/en/my-account/'],
  ['/en/maintenance-planner', '/en/maintenance-planner/'], ['/en/about', '/en/about/'], ['/en/contact', '/en/contact/'], ['/en/privacy', '/en/privacy/'],
  ['/reservation', '/rendez-vous/'], ['/booking', '/rendez-vous/'], ['/book', '/rendez-vous/'], ['/compte', '/mon-compte/'], ['/account', '/mon-compte/'],
];

/**
 * The platform gives every request a `tenantPath()` that is correct on custom
 * domains as well as under /pwa/<slug>. Fall back to the mount path when it
 * is absent (sandbox harnesses) so a missing helper can never take the site down.
 */
function tenantPath(req, target) {
  if (typeof req.tenantPath === 'function') return req.tenantPath(target);
  return String(req.baseUrl || '').replace(/\/$/, '') + target;
}
function absolute(req, target) {
  const host = req.get('host');
  return host ? `${req.protocol}://${host}${tenantPath(req, target)}` : tenantPath(req, target);
}

function list(raw) { try { const x = JSON.parse(raw || '[]'); return Array.isArray(x) ? x : []; } catch (e) { return String(raw || '').split('\n').filter(Boolean); } }
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const PHONE_RE = /^[+()\d .-]{7,40}$/;

module.exports = function (services) {
  const express = require('express');
  // Strict routing: every page lives at its trailing-slash URL and the bare
  // form 301s to it. Without `strict`, the canonical URL redirects to itself.
  const router = express.Router({ strict: true });
  const store = S(services);
  const notify = makeNotify(services);
  const cars = makeVehicles(services);
  const db = services.db;

  // A VIN photo (resized in the browser to ~1600 px) needs more room than
  // any other request; everything else keeps the tight limit.
  const jsonBody = express.json({ limit: '200kb' });
  const jsonPhoto = express.json({ limit: '4mb' });
  router.use((req, res, next) => (req.path === '/api/vin/photo' ? jsonPhoto : jsonBody)(req, res, next));
  router.use(express.urlencoded({ extended: false, limit: '30kb' }));

  function fail(req, res, e) {
    const code = e.code === '23505' ? 'conflict' : e.status ? e.code : 'server_error';
    const status = e.code === '23505' ? 409 : (e.status || 500);
    if (status >= 500) console.error('[garage-el]', req.method, req.path, e && (e.stack || e.message));
    const t = res.locals.t || T.fr;
    if (req.path.startsWith('/api/')) return res.status(status).json({ error: t[code] || t.server_error, code });
    return res.status(status).render('error', { page: 'error', errorText: t[code] || t.server_error });
  }
  const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { fail(req, res, e); } };

  async function publishedServices() { return db.all('SELECT * FROM services WHERE published=1 ORDER BY sort_order,id'); }

  // --- Request context ----------------------------------------------------
  router.use(wrap(async (req, res, next) => {
    const q = req.query.lang;
    const lang = (q === 'en' || q === 'fr') ? q
      : req.path.startsWith('/en/') || req.path === '/en' ? 'en'
        : (req.cookies && req.cookies.pwa_lang === 'en') ? 'en' : 'fr';
    if (q === 'en' || q === 'fr') res.cookie('pwa_lang', lang, { maxAge: 365 * 86400000, path: tenantPath(req, '/'), sameSite: 'lax', secure: true });
    req.lang = lang;
    const raw = await store.load();
    req.site = raw;
    const L = res.locals;
    L.lang = lang;
    L.page = 'home';
    L.user = null;
    L.tenantRoot = tenantPath(req, '/');
    L.urls = S.urls(lang);
    L.langLinks = { fr: '.?lang=fr', en: 'en/?lang=en' };
    L.safeJSON = S.safeJSON;
    L.money = (v) => S.money(v, lang);
    L.formatDate = (v) => S.date(v, lang);
    L.formatShort = (v) => S.shortDate(v, lang);
    L.formatTime = (v) => S.time(v, lang);
    L.formatDateTime = (v) => S.dateTime(v, lang);
    L.field = (row, key) => (lang === 'en' && row && row[key + '_en'] ? row[key + '_en'] : (row && row[key]) || '');
    L.listField = (row, key) => list(lang === 'en' && row && row[key + '_en'] ? row[key + '_en'] : row && row[key]);
    // Views run inside EJS's `with (locals)`: a local named like a global
    // shadows it. Every helper a template needs is handed over explicitly.
    L.lines = (value) => String(value == null ? '' : value).split('\n').map((x) => x.trim()).filter(Boolean);
    L.currentYear = new Date().getFullYear();
    L.todayWeekday = S.local(new Date()).weekday;
    L.jsonField = (value, key) => {
      if (value == null) return '';
      try { const p = JSON.parse(value); return (p && typeof p === 'object' && !Array.isArray(p)) ? (p[key] || '') : ''; } catch (e) { return key === 'fr' ? String(value) : ''; }
    };
    L.durationLabel = (min) => {
      const m = Number(min) || 0;
      if (!m) return '';
      const h = Math.floor(m / 60); const r = m % 60;
      return h ? (h + ' h' + (r ? ' ' + String(r).padStart(2, '0') : '')) : (r + ' min');
    };
    L.priceLabel = (s) => (s && Number(s.price_verified) && s.price_from_cents != null)
      ? (res.locals.t.price_from + ' ' + S.money(s.price_from_cents, lang)) : res.locals.t.price_on_estimate;
    L.assets = assets;
    L.vinPhoto = cars.canReadPhotos;
    L.serviceImage = (s) => (s && s.image_url) || assets.services[s && s.slug] || '';
    L.clock = (hhmm) => {
      if (!hhmm) return '';
      const [h, m] = String(hhmm).split(':').map(Number);
      if (lang === 'en') return (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h < 12 ? ' a.m.' : ' p.m.');
      return h + ' h' + (m ? ' ' + String(m).padStart(2, '0') : '');
    };
    L.fmt = (str, vars) => String(str || '').replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
    req.isPreview = !!(services.config.isPreview || services.config.preview || req.query.preview === '1');
    try { L.isOwner = !!services.admin.isAdmin(req); } catch (e) { L.isOwner = false; }
    L.settings = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, S.localized(v, lang)]));
    L.t = S.translate(raw, lang);
    L.flags = {
      contact: S.flag(raw, 'contact_verified'),
      address: S.flag(raw, 'address_verified'),
      hours: S.flag(raw, 'hours_verified'),
      privacy: S.flag(raw, 'privacy_approved'),
      bookingsLive: S.flag(raw, 'bookings_live'),
      messages: S.flag(raw, 'messages_enabled') && S.flag(raw, 'privacy_approved'),
      live: S.flag(raw, 'live_actions_enabled'),
    };
    L.phoneHref = 'tel:' + String(raw.contact_phone || '').replace(/[^+\d]/g, '');
    L.directionsHref = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(raw.business_address || '');
    // Keyless Google Maps embed: works on any tenant without an API key.
    L.mapEmbed = raw.business_address ? 'https://www.google.com/maps?q=' + encodeURIComponent(raw.business_address) + '&output=embed&hl=' + lang : null;
    if (!req.path.startsWith('/api/') && !/\.[a-z0-9]{2,5}$/i.test(req.path)) {
      L.hours = await db.all('SELECT * FROM hours ORDER BY weekday');
      L.upcomingClosures = await db.all("SELECT id, to_char(date,'YYYY-MM-DD') AS date, reason, reason_en FROM closures WHERE date >= CURRENT_DATE ORDER BY closures.date LIMIT 6");
      L.openState = S.openState(L.hours, L.upcomingClosures);
      L.navServices = await publishedServices();
    } else {
      L.hours = []; L.upcomingClosures = []; L.openState = { open: false }; L.navServices = [];
    }
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin') || req.path.includes('compte') || req.path.includes('account')) {
      res.set('Cache-Control', 'private, no-store');
    }
    next();
  }));

  router.use(wrap(async (req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits(path) VALUES($1)', [req.path.slice(0, 200)]); } catch (e) { /* analytics only */ }
    }
    next();
  }));

  // Same-origin guard for every state-changing request.
  router.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      if (req.get('X-Requested-With') !== 'liasse') return res.status(403).json({ error: res.locals.t.forbidden });
      const origin = req.get('origin');
      if (origin) {
        try { if (new URL(origin).host !== req.get('host')) return res.status(403).json({ error: res.locals.t.forbidden }); } catch (e) { return res.status(403).json({ error: res.locals.t.forbidden }); }
      }
    }
    return next();
  });

  for (const [from, to] of REDIRECTS) router.get(from, (req, res) => res.redirect(301, tenantPath(req, to)));

  function languageLinks(req, res, key, param) {
    const links = {};
    for (const lang of ['fr', 'en']) {
      const u = S.urls(lang);
      const base = param ? (u[key] || '') + param + '/' : (u[key] || u.home);
      links[lang] = base + '?lang=' + lang;
    }
    res.locals.langLinks = links;
  }

  /** Register one page in both languages. */
  function page(paths, key, view, load) {
    router.get(paths, services.auth.optionalAuth, wrap(async (req, res) => {
      res.locals.user = req.user || null;
      res.locals.page = key;
      languageLinks(req, res, key, req.params.slug || req.params.ref);
      const extra = load ? await load(req, res) : {};
      if (extra === null) throw S.error('not_found', 404);
      res.render(view, Object.assign({ page: key }, extra));
    }));
  }

  // --- Public pages -----------------------------------------------------------
  page(['/', '/en/'], 'home', 'index', async () => ({ services: await publishedServices() }));

  page(['/services/', '/en/services/'], 'services', 'services', async () => ({ services: await publishedServices() }));

  page(['/services/:slug/', '/en/services/:slug/'], 'service', 'service', async (req) => {
    const all = await publishedServices();
    const item = all.find((s) => s.slug === String(req.params.slug || '').slice(0, 80));
    if (!item) return null;
    const related = all.filter((s) => s.slug !== item.slug && Number(s.bookable) && Number(s.featured)).slice(0, 3);
    return { item, related };
  });

  page(['/rendez-vous/', '/en/appointment/'], 'booking', 'booking', async (req) => {
    const all = await publishedServices();
    const cfg = B.config(req.site);
    const preselect = String(req.query.service || '').slice(0, 80);
    return {
      bookable: all.filter((s) => Number(s.bookable)),
      preselect,
      bookingConfig: { courtesyCars: cfg.courtesyCars, slotMinutes: cfg.slotMinutes, makes: cars.MAKES },
    };
  });

  page(['/mon-compte/', '/en/my-account/'], 'account', 'account', async (req) => {
    if (!req.user) return { account: null };
    return { account: await accountData(req.user, req.site, req.lang) };
  });

  page(['/mon-compte/rendez-vous/:ref/', '/en/my-account/appointments/:ref/'], 'appointment', 'appointment', async (req) => {
    if (!req.user) return { appt: null, events: [] };
    const appt = await ownAppointment(req.user, req.params.ref);
    if (!appt) return null;
    const events = await db.all('SELECT status, note, created_at FROM appointment_events WHERE appointment_id=$1 ORDER BY created_at, id', [appt.id]);
    return { appt: publicAppointment(appt, req.site), events, justBooked: req.query.booked === '1' };
  });

  page(['/carnet-d-entretien/', '/en/maintenance-planner/'], 'planner', 'planner', async (req) => ({
    vehicles: req.user ? await db.all('SELECT * FROM vehicles WHERE user_id=$1 AND archived=0 ORDER BY id', [String(req.user.id)]) : [],
  }));

  page(['/a-propos/', '/en/about/'], 'about', 'about', async () => ({ services: await publishedServices() }));
  page(['/contact/', '/en/contact/'], 'contact', 'contact');
  page(['/confidentialite/', '/en/privacy/'], 'privacy', 'privacy');

  // --- Account data -------------------------------------------------------------
  function publicAppointment(a, raw) {
    return {
      id: a.id, reference: a.reference, status: a.status, preview: !!Number(a.preview),
      start_at: a.start_at, end_at: a.end_at, duration_min: a.duration_min,
      services: list(a.services), service_names: a.service_names, concern: a.concern || '',
      vehicle_id: a.vehicle_id, vehicle_label: a.vehicle_label, stay: a.stay,
      courtesy_car: !!Number(a.courtesy_car), towing: !!Number(a.towing), towing_address: a.towing_address || '',
      contact_name: a.contact_name, contact_phone: a.contact_phone, garage_note: a.garage_note || '',
      canChange: B.selfServiceOpen(a, raw), created_at: a.created_at,
    };
  }

  async function ownAppointment(user, ref) {
    return db.get('SELECT * FROM appointments WHERE reference=$1 AND user_id=$2', [clip(ref, 20), String(user.id)]);
  }

  async function accountData(user, raw, lang) {
    const uid = String(user.id);
    const profile = await db.get('SELECT * FROM customer_profiles WHERE user_id=$1', [uid]);
    const vehicles = await db.all('SELECT * FROM vehicles WHERE user_id=$1 AND archived=0 ORDER BY id', [uid]);
    const appts = await db.all("SELECT * FROM appointments WHERE user_id=$1 AND status <> 'holding' ORDER BY start_at DESC LIMIT 60", [uid]);
    const now = Date.now();
    const upcoming = appts.filter((a) => new Date(a.end_at).getTime() >= now && !['cancelled', 'completed', 'no_show'].includes(a.status)).reverse();
    const past = appts.filter((a) => !upcoming.includes(a));
    return {
      email: user.email || '', phone: user.phone || '',
      profile: profile || { first_name: '', last_name: '', phone: user.phone || '', language: lang },
      vehicles,
      upcoming: upcoming.map((a) => publicAppointment(a, raw)),
      past: past.map((a) => publicAppointment(a, raw)),
    };
  }

  function vehicleLabel(v) { return [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ').slice(0, 140); }

  function cleanVehicle(body) {
    const v = {
      year: body.year === '' || body.year == null ? null : Number(body.year),
      make: clip(body.make, 60), model: clip(body.model, 80), trim: clip(body.trim, 80),
      vin: makeVehicles.cleanVin(body.vin).slice(0, 17), plate: clip(body.plate, 12).toUpperCase(),
      odometer_km: body.odometer_km === '' || body.odometer_km == null ? null : Number(body.odometer_km),
    };
    if (v.year != null && !(Number.isInteger(v.year) && v.year >= 1950 && v.year <= 2100)) throw S.error('invalid');
    if (v.odometer_km != null && !(Number.isInteger(v.odometer_km) && v.odometer_km >= 0 && v.odometer_km <= 2000000)) throw S.error('invalid');
    if (v.vin && !makeVehicles.validVin(v.vin)) throw S.error('invalid');
    if (!v.make || !v.model) throw S.error('required');
    return v;
  }

  router.get('/api/me', services.auth.requireAuth, wrap(async (req, res) => res.json(await accountData(req.user, req.site, req.lang))));

  router.put('/api/me/profile', services.auth.requireAuth, wrap(async (req, res) => {
    const b = req.body || {};
    const p = { first_name: clip(b.first_name, 60), last_name: clip(b.last_name, 60), phone: clip(b.phone, 40), language: b.language === 'en' ? 'en' : 'fr' };
    if (p.phone && !PHONE_RE.test(p.phone)) throw S.error('invalid');
    const row = await db.get(
      `INSERT INTO customer_profiles(user_id, first_name, last_name, phone, language) VALUES($1,$2,$3,$4,$5)
       ON CONFLICT(user_id) DO UPDATE SET first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, phone=EXCLUDED.phone, language=EXCLUDED.language, updated_at=NOW() RETURNING *`,
      [String(req.user.id), p.first_name, p.last_name, p.phone, p.language]);
    res.json({ profile: row });
  }));

  router.post('/api/me/vehicles', services.auth.requireAuth, wrap(async (req, res) => {
    const v = cleanVehicle(req.body || {});
    const count = await db.get('SELECT COUNT(*)::int AS n FROM vehicles WHERE user_id=$1 AND archived=0', [String(req.user.id)]);
    if (count.n >= 12) throw S.error('rate_limit', 429);
    const row = await db.get('INSERT INTO vehicles(user_id,year,make,model,trim,vin,plate,odometer_km) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [String(req.user.id), v.year, v.make, v.model, v.trim, v.vin, v.plate, v.odometer_km]);
    res.status(201).json({ vehicle: row });
  }));

  router.put('/api/me/vehicles/:id', services.auth.requireAuth, wrap(async (req, res) => {
    const id = Number(req.params.id);
    const body = req.body || {};
    const old = await db.get('SELECT * FROM vehicles WHERE id=$1 AND user_id=$2 AND archived=0', [id, String(req.user.id)]);
    if (!old) throw S.error('not_found', 404);
    const v = cleanVehicle(Object.assign({}, old, body));
    const lastKm = body.last_oil_km === '' ? null : (body.last_oil_km != null ? Number(body.last_oil_km) : old.last_oil_km);
    if (lastKm != null && !(Number.isInteger(lastKm) && lastKm >= 0 && lastKm <= 2000000)) throw S.error('invalid');
    const row = await db.get('UPDATE vehicles SET year=$1,make=$2,model=$3,trim=$4,vin=$5,plate=$6,odometer_km=$7,last_oil_km=$8,updated_at=NOW() WHERE id=$9 RETURNING *',
      [v.year, v.make, v.model, v.trim, v.vin, v.plate, v.odometer_km, lastKm, id]);
    res.json({ vehicle: row });
  }));

  router.delete('/api/me/vehicles/:id', services.auth.requireAuth, wrap(async (req, res) => {
    const row = await db.get('UPDATE vehicles SET archived=1, updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING id', [Number(req.params.id), String(req.user.id)]);
    if (!row) throw S.error('not_found', 404);
    res.json({ success: true });
  }));

  // --- Vehicle lookup (public, cached) ------------------------------------------
  router.get('/api/vin/:vin', wrap(async (req, res) => {
    try { res.json(await cars.decodeVin(req.params.vin)); } catch (e) { throw S.error('vin_error', 503); }
  }));
  // VIN from a photo: 8 reads per visitor per 10 minutes (each costs the
  // platform a fraction of a cent; the cap only stops a stuck loop).
  const photoReads = new Map();
  router.post('/api/vin/photo', wrap(async (req, res) => {
    if (!cars.canReadPhotos) throw S.error('vin_error', 503);
    const who = String((req.user && req.user.id) || req.ip || 'anon');
    const now = Date.now();
    const recent = (photoReads.get(who) || []).filter((t) => now - t < 600000);
    if (recent.length >= 8) throw S.error('rate_limit', 429);
    recent.push(now); photoReads.set(who, recent);
    if (photoReads.size > 5000) photoReads.delete(photoReads.keys().next().value);
    const image = String((req.body && req.body.image) || '');
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(image)) throw S.error('invalid');
    try { res.json(await cars.readVinPhoto(image)); } catch (e) {
      console.error('[garage-el] vin photo', e && e.message);
      throw S.error(e && e.code === 'rate_limited' ? 'rate_limit' : 'vin_error', e && e.code === 'rate_limited' ? 429 : 503);
    }
  }));
  router.get('/api/models', wrap(async (req, res) => {
    try { res.json({ models: await cars.models(req.query.make, req.query.year) }); } catch (e) { res.json({ models: [] }); }
  }));

  // --- Availability ------------------------------------------------------------
  async function servicesFromSlugs(slugs) {
    const want = [...new Set((Array.isArray(slugs) ? slugs : String(slugs || '').split(',')).map((s) => clip(s, 80)).filter(Boolean))].slice(0, 12);
    if (!want.length) return [];
    return db.all('SELECT * FROM services WHERE published=1 AND bookable=1 AND slug = ANY($1) ORDER BY sort_order,id', [want]);
  }

  router.get('/api/availability', wrap(async (req, res) => {
    const rows = await servicesFromSlugs(req.query.services);
    const cfg = B.config(req.site);
    const minutes = B.durationFor(rows.length ? rows : [{ duration_min: 60 }], cfg);
    let excludeId = null;
    if (req.query.exclude) {
      // Rescheduling: only the owner may ignore their own appointment's cells.
      await new Promise((resolve) => services.auth.optionalAuth(req, res, resolve));
      if (req.user) { const own = await ownAppointment(req.user, req.query.exclude); if (own) excludeId = own.id; }
    }
    const from = /^\d{4}-\d{2}-\d{2}$/.test(req.query.from || '') ? req.query.from : undefined;
    const out = await B.availability(db, req.site, { from, days: Number(req.query.days) || 14, minutes, excludeId });
    res.json(out);
  }));

  // --- Booking ---------------------------------------------------------------
  router.post('/api/appointments', services.auth.requireAuth, wrap(async (req, res) => {
    const b = req.body || {};
    const uid = String(req.user.id);
    const raw = req.site;
    const cfg = B.config(raw);
    const lang = b.language === 'en' ? 'en' : req.lang;
    const requestKey = clip(b.requestKey, 64);
    if (requestKey) {
      const dup = await db.get('SELECT * FROM appointments WHERE user_id=$1 AND request_key=$2', [uid, requestKey]);
      if (dup) return res.json({ appointment: publicAppointment(dup, raw), url: tenantPath(req, '/' + S.urls(lang).appointment + dup.reference + '/?booked=1') });
    }
    const rows = await servicesFromSlugs(b.services);
    const concern = clip(b.concern, 2000);
    if (!rows.length && !concern) throw S.error('required');
    if (!b.consent) throw S.error('required');

    // Vehicle: one of theirs, or a new one saved to their garage.
    let vehicle = null;
    if (b.vehicleId) vehicle = await db.get('SELECT * FROM vehicles WHERE id=$1 AND user_id=$2 AND archived=0', [Number(b.vehicleId), uid]);
    if (!vehicle) {
      const v = cleanVehicle(b.vehicle || {});
      // The same car booked again (same VIN, or same year/make/model) is the
      // one already in their garage — never a duplicate.
      vehicle = await db.get(
        `SELECT * FROM vehicles WHERE user_id=$1 AND archived=0 AND (($2 <> '' AND vin=$2)
           OR ($2 = '' AND COALESCE(vin,'') = '' AND year IS NOT DISTINCT FROM $3 AND LOWER(make)=LOWER($4) AND LOWER(model)=LOWER($5))) ORDER BY id LIMIT 1`,
        [uid, v.vin, v.year, v.make, v.model]);
      if (vehicle && v.odometer_km != null) await db.run('UPDATE vehicles SET odometer_km=$1, updated_at=NOW() WHERE id=$2', [v.odometer_km, vehicle.id]);
      if (!vehicle) {
        vehicle = await db.get('INSERT INTO vehicles(user_id,year,make,model,trim,vin,plate,odometer_km) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
          [uid, v.year, v.make, v.model, v.trim, v.vin, v.plate, v.odometer_km]);
      }
    } else if (b.vehicle && b.vehicle.odometer_km != null && b.vehicle.odometer_km !== '') {
      const km = Number(b.vehicle.odometer_km);
      if (Number.isInteger(km) && km >= 0 && km <= 2000000) await db.run('UPDATE vehicles SET odometer_km=$1, updated_at=NOW() WHERE id=$2', [km, vehicle.id]);
    }

    const contact = b.contact || {};
    const first = clip(contact.first_name, 60); const last = clip(contact.last_name, 60); const phone = clip(contact.phone, 40);
    if (!first || !phone || !PHONE_RE.test(phone)) throw S.error('invalid');
    await db.run(
      `INSERT INTO customer_profiles(user_id, first_name, last_name, phone, language) VALUES($1,$2,$3,$4,$5)
       ON CONFLICT(user_id) DO UPDATE SET first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, phone=EXCLUDED.phone, language=EXCLUDED.language, updated_at=NOW()`,
      [uid, first, last, phone, lang]);

    const minutes = B.durationFor(rows.length ? rows : [{ duration_min: 60 }], cfg);
    const date = String(b.date || ''); const time = String(b.time || '');
    if (!(await B.isBookable(db, raw, { date, time, minutes }))) throw S.error('slot_taken', 409);
    const hours = await db.get('SELECT * FROM hours WHERE weekday=$1', [S.weekdayOf(date)]);
    const start = S.zoned(date, time);
    const end = new Date(start.getTime() + minutes * 60000);

    let courtesy = b.courtesyCar && cfg.courtesyCars > 0 ? 1 : 0;
    if (courtesy) {
      const day = (await B.availability(db, raw, { from: date, days: 1, minutes })).days.find((d) => d.date === date);
      if (!day || day.courtesyLeft < 1) courtesy = 0;
    }
    const towing = b.towing ? 1 : 0;
    const names = rows.map((s) => (lang === 'en' && s.name_en) || s.name);
    if (!rows.length) names.push(lang === 'en' ? 'Diagnosis' : 'Diagnostic');
    const preview = S.flag(raw, 'bookings_live') ? 0 : 1;
    const status = cfg.autoConfirm && !preview ? 'confirmed' : 'requested';

    let appt = null;
    for (let i = 0; i < 5 && !appt; i++) {
      try {
        appt = await db.get(
          `INSERT INTO appointments(reference,user_id,request_key,vehicle_id,vehicle_label,services,service_names,concern,start_at,end_at,duration_min,stay,courtesy_car,towing,towing_address,contact_name,contact_phone,contact_email,language,status,preview,consent,privacy_snapshot,confirmed_at)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,1,$22,$23) RETURNING *`,
          [B.reference((a, z) => services.crypto.randomInt(a, z)), uid, requestKey || null, vehicle.id, vehicleLabel(vehicle), JSON.stringify(rows.map((s) => s.slug)),
            names.join(', '), concern, start, end, minutes, b.stay === 'wait' ? 'wait' : 'drop', courtesy, towing, towing ? clip(b.towingAddress, 300) : null,
            (first + ' ' + last).trim(), phone, req.user.email || null, lang, status, preview, S.localized(raw.privacy_notice, lang).slice(0, 8000),
            status === 'confirmed' ? new Date() : null]);
      } catch (e) {
        if (e.code === '23505' && /reference/.test(e.message || e.detail || '')) continue;
        if (e.code === '23505' && requestKey) {
          const dup = await db.get('SELECT * FROM appointments WHERE user_id=$1 AND request_key=$2', [uid, requestKey]);
          if (dup) return res.json({ appointment: publicAppointment(dup, raw), url: tenantPath(req, '/' + S.urls(lang).appointment + dup.reference + '/?booked=1') });
        }
        throw e;
      }
    }
    if (!appt) throw S.error('server_error', 500);
    const held = await B.holdBay(db, raw, appt.id, start, minutes, S.toMinutes(hours.closes));
    if (!held) {
      await db.run('DELETE FROM appointments WHERE id=$1', [appt.id]);
      throw S.error('slot_taken', 409);
    }
    appt = await db.get('UPDATE appointments SET bay=$1 WHERE id=$2 RETURNING *', [held.bay, appt.id]);
    await db.run('INSERT INTO appointment_events(appointment_id,status,actor) VALUES($1,$2,$3)', [appt.id, status, 'customer']);

    const link = absolute(req, '/' + S.urls(lang).appointment + appt.reference + '/');
    notify.toCustomer(raw, appt, status === 'confirmed' ? 'confirmed' : 'requested', link).catch(() => {});
    notify.toGarage(raw, appt, absolute(req, '/admin/rendez-vous?date=' + date)).catch(() => {});
    res.status(201).json({ appointment: publicAppointment(appt, raw), url: tenantPath(req, '/' + S.urls(lang).appointment + appt.reference + '/?booked=1') });
  }));

  router.get('/api/appointments/:ref', services.auth.requireAuth, wrap(async (req, res) => {
    const appt = await ownAppointment(req.user, req.params.ref);
    if (!appt) throw S.error('not_found', 404);
    const events = await db.all('SELECT status, note, created_at FROM appointment_events WHERE appointment_id=$1 ORDER BY created_at, id', [appt.id]);
    res.json({ appointment: publicAppointment(appt, req.site), events });
  }));

  router.get('/api/appointments/:ref/calendar.ics', services.auth.requireAuth, wrap(async (req, res) => {
    const appt = await ownAppointment(req.user, req.params.ref);
    if (!appt) throw S.error('not_found', 404);
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${appt.reference}.ics"`);
    res.send(B.ics(appt, req.site.business_name || 'Garage', req.site.business_address || '', req.lang));
  }));

  router.post('/api/appointments/:ref/cancel', services.auth.requireAuth, wrap(async (req, res) => {
    const appt = await ownAppointment(req.user, req.params.ref);
    if (!appt) throw S.error('not_found', 404);
    if (!B.selfServiceOpen(appt, req.site)) throw S.error('too_late', 409);
    const row = await db.get("UPDATE appointments SET status='cancelled', cancelled_at=NOW(), cancelled_by='customer', updated_at=NOW() WHERE id=$1 RETURNING *", [appt.id]);
    await B.releaseBay(db, appt.id);
    await db.run('INSERT INTO appointment_events(appointment_id,status,note,actor) VALUES($1,$2,$3,$4)', [appt.id, 'cancelled', clip((req.body || {}).reason, 300) || null, 'customer']);
    notify.toCustomer(req.site, row, 'cancelled', absolute(req, '/' + S.urls(row.language).appointment + row.reference + '/')).catch(() => {});
    res.json({ appointment: publicAppointment(row, req.site) });
  }));

  router.post('/api/appointments/:ref/reschedule', services.auth.requireAuth, wrap(async (req, res) => {
    const appt = await ownAppointment(req.user, req.params.ref);
    if (!appt) throw S.error('not_found', 404);
    if (!B.selfServiceOpen(appt, req.site)) throw S.error('too_late', 409);
    const date = String((req.body || {}).date || ''); const time = String((req.body || {}).time || '');
    if (!(await B.isBookable(db, req.site, { date, time, minutes: appt.duration_min, excludeId: appt.id }))) throw S.error('slot_taken', 409);
    const hours = await db.get('SELECT * FROM hours WHERE weekday=$1', [S.weekdayOf(date)]);
    const start = S.zoned(date, time);
    // Release first, then hold; if the new time was lost in between, put the
    // old one back so the customer never ends up with nothing.
    await B.releaseBay(db, appt.id);
    let held = await B.holdBay(db, req.site, appt.id, start, appt.duration_min, S.toMinutes(hours.closes));
    if (!held) {
      const oldHours = await db.get('SELECT * FROM hours WHERE weekday=$1', [S.local(appt.start_at).weekday]);
      await B.holdBay(db, req.site, appt.id, new Date(appt.start_at), appt.duration_min, S.toMinutes((oldHours && oldHours.closes) || '23:59'));
      throw S.error('slot_taken', 409);
    }
    const row = await db.get(
      "UPDATE appointments SET start_at=$1, end_at=$2, bay=$3, status=CASE WHEN status='confirmed' AND $4 THEN 'confirmed' ELSE 'requested' END, reminder_sent_at=NULL, updated_at=NOW() WHERE id=$5 RETURNING *",
      [start, new Date(start.getTime() + appt.duration_min * 60000), held.bay, B.config(req.site).autoConfirm, appt.id]);
    await db.run('INSERT INTO appointment_events(appointment_id,status,note,actor) VALUES($1,$2,$3,$4)', [appt.id, row.status, 'rescheduled', 'customer']);
    notify.toCustomer(req.site, row, 'rescheduled', absolute(req, '/' + S.urls(row.language).appointment + row.reference + '/')).catch(() => {});
    notify.toGarage(req.site, row, absolute(req, '/admin/rendez-vous?date=' + date)).catch(() => {});
    res.json({ appointment: publicAppointment(row, req.site) });
  }));

  // --- Contact form -------------------------------------------------------------
  router.post('/api/messages', wrap(async (req, res) => {
    if (!res.locals.flags.messages) throw S.error('operation_disabled', 409);
    const b = req.body || {};
    const m = { first: clip(b.firstName, 60), last: clip(b.lastName, 60), email: clip(b.email, 190), phone: clip(b.phone, 40), subject: clip(b.subject, 160), body: clip(b.body, 4000) };
    if (!m.first || !m.body || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email) || !b.consent) throw S.error('invalid');
    const recent = await db.get("SELECT COUNT(*)::int AS n FROM messages WHERE email=$1 AND created_at > NOW() - INTERVAL '1 hour'", [m.email]);
    if (recent.n >= 3) throw S.error('rate_limit', 429);
    await db.run('INSERT INTO messages(first_name,last_name,email,phone,subject,body,consent,privacy_snapshot) VALUES($1,$2,$3,$4,$5,$6,1,$7)',
      [m.first, m.last, m.email, m.phone, m.subject, m.body, S.localized(req.site.privacy_notice, req.lang).slice(0, 8000)]);
    if (res.locals.flags.live) {
      const to = req.site.notification_email || services.config.contactEmail;
      if (to) services.email.send({ to, replyTo: m.email, subject: `Message du site — ${m.subject || m.first}`, text: `${m.first} ${m.last}\n${m.email} · ${m.phone}\n\n${m.body}` }).catch(() => {});
    }
    res.status(201).json({ success: true });
  }));

  // --- Admin --------------------------------------------------------------------
  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: res.locals.t.forbidden });
    next();
  }
  router.use('/api/admin', requireAdmin);
  const adminUser = () => ({ name: services.config.ownerName || 'Garage' });
  const STATUSES = ['requested', 'confirmed', 'in_progress', 'ready', 'completed', 'cancelled', 'no_show'];

  function adminAppointment(a) {
    return Object.assign({}, a, { services: list(a.services), local: S.local(a.start_at), localEnd: S.local(a.end_at) });
  }

  router.get('/api/admin/board', wrap(async (req, res) => {
    const today = S.local(new Date()).date;
    const from = /^\d{4}-\d{2}-\d{2}$/.test(req.query.from || '') ? req.query.from : today;
    const days = Math.max(1, Math.min(14, Number(req.query.days) || 7));
    const rows = await db.all(
      "SELECT * FROM appointments WHERE start_at >= $1 AND start_at < $2 AND status <> 'holding' ORDER BY start_at",
      [S.zoned(from, '00:00'), S.zoned(S.addDays(from, days), '00:00')]);
    const hours = await db.all('SELECT * FROM hours ORDER BY weekday');
    const closures = await db.all("SELECT id, to_char(date,'YYYY-MM-DD') AS date, reason, reason_en FROM closures WHERE date >= $1 AND date < $2", [from, S.addDays(from, days)]);
    res.json({ from, days, today, bays: B.config(req.site).bays, hours, closures, appointments: rows.map(adminAppointment) });
  }));

  router.put('/api/admin/appointments/:id', wrap(async (req, res) => {
    const id = Number(req.params.id);
    const b = req.body || {};
    const appt = await db.get('SELECT * FROM appointments WHERE id=$1', [id]);
    if (!appt) throw S.error('not_found', 404);
    const status = b.status && STATUSES.includes(b.status) ? b.status : appt.status;
    const garageNote = b.garage_note !== undefined ? clip(b.garage_note, 1000) : appt.garage_note;
    const internal = b.internal_note !== undefined ? clip(b.internal_note, 4000) : appt.internal_note;
    const row = await db.get(
      `UPDATE appointments SET status=$1, garage_note=$2, internal_note=$3,
         confirmed_at = CASE WHEN $1='confirmed' AND confirmed_at IS NULL THEN NOW() ELSE confirmed_at END,
         cancelled_at = CASE WHEN $1='cancelled' AND cancelled_at IS NULL THEN NOW() ELSE cancelled_at END,
         cancelled_by = CASE WHEN $1='cancelled' AND cancelled_by IS NULL THEN 'garage' ELSE cancelled_by END,
         updated_at=NOW() WHERE id=$4 RETURNING *`, [status, garageNote, internal, id]);
    if (['cancelled', 'no_show'].includes(status)) await B.releaseBay(db, id);
    if (status !== appt.status || (b.garage_note !== undefined && garageNote !== appt.garage_note)) {
      await db.run('INSERT INTO appointment_events(appointment_id,status,note,actor) VALUES($1,$2,$3,$4)', [id, status, garageNote !== appt.garage_note ? garageNote : null, 'garage']);
    }
    if (status !== appt.status && ['confirmed', 'in_progress', 'ready', 'completed', 'cancelled'].includes(status)) {
      notify.toCustomer(req.site, row, status, absolute(req, '/' + S.urls(row.language).appointment + row.reference + '/')).catch(() => {});
    }
    res.json({ appointment: adminAppointment(row) });
  }));

  router.get('/api/admin/settings', wrap(async (req, res) => res.json({ settings: await store.load() })));

  router.put('/api/admin/settings', wrap(async (req, res) => {
    const key = String(req.body.key || '');
    const value = String(req.body.value == null ? '' : req.body.value);
    if (!/^[a-zA-Z0-9_:-]{1,100}$/.test(key) || key.startsWith('_seed') || value.length > 20000) throw S.error('invalid');
    const m = getModules(req.lang);
    if (m.settingsFields.some((x) => x.name === key) && !['0', '1'].includes(value)) throw S.error('invalid');
    const numeric = m.bookingFields.find((x) => x.name === key);
    if (numeric && value !== '') {
      const n = Number(value);
      if (!Number.isInteger(n) || n < numeric.min || n > numeric.max) throw S.error('invalid');
      if (key === 'slot_minutes' && ![15, 30, 60].includes(n)) throw S.error('invalid');
    }
    if (key === 'privacy_approved' && value === '1' && !S.both(req.site.privacy_notice)) throw S.error('required');
    if (key === 'bookings_live' && value === '1' && !S.flag(req.site, 'privacy_approved')) throw S.error('required');
    if (['contact_email', 'notification_email'].includes(key) && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw S.error('invalid');
    if (key === 'contact_phone' && value && !PHONE_RE.test(value)) throw S.error('invalid');
    if (key.endsWith('_url') && !A.imageOK(value)) throw S.error('invalid');
    await db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()', [key, value]);
    res.json({ success: true });
  }));

  for (const base of getModules('fr').modules) {
    const key = base.key;
    router.get('/api/admin/' + key, wrap(async (req, res) => res.json({ [key]: await db.all('SELECT * FROM ' + key + ' ORDER BY id DESC') })));
    router.post('/api/admin/' + key, wrap(async (req, res) => {
      if (['customer_profiles', 'vehicles'].includes(key)) throw S.error('forbidden', 403);
      const m = getModules(req.lang).modules.find((x) => x.key === key);
      res.status(201).json({ [m.singular]: await A.save(db, m, req.body, null) });
    }));
    router.put('/api/admin/' + key + '/:id', wrap(async (req, res) => {
      if (!/^\d+$/.test(req.params.id)) throw S.error('invalid');
      const m = getModules(req.lang).modules.find((x) => x.key === key);
      res.json({ [m.singular]: await A.save(db, m, req.body, Number(req.params.id)) });
    }));
    router.delete('/api/admin/' + key + '/:id', wrap(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) throw S.error('invalid');
      if (key === 'customer_profiles') throw S.error('forbidden', 403);
      const row = key === 'vehicles'
        ? await db.get('UPDATE vehicles SET archived=1 WHERE id=$1 RETURNING id', [id])
        : await db.get('DELETE FROM ' + key + ' WHERE id=$1 RETURNING id', [id]);
      if (!row) throw S.error('not_found', 404);
      res.json({ success: true });
    }));
  }

  async function adminStats(raw) {
    const today = S.local(new Date()).date;
    const counts = {};
    for (const m of getModules('fr').modules) counts[m.key] = Number((await db.get('SELECT COUNT(*) AS n FROM ' + m.key)).n);
    const v = await db.get("SELECT COUNT(*) AS total,COUNT(*) FILTER(WHERE created_at>NOW()-INTERVAL '7 days') AS recent FROM site_visits");
    const a = await db.get(
      `SELECT COUNT(*) FILTER (WHERE status='requested') AS pending,
              COUNT(*) FILTER (WHERE status IN ('requested','confirmed','in_progress','ready') AND start_at >= $1 AND start_at < $2) AS today,
              COUNT(*) FILTER (WHERE status IN ('requested','confirmed') AND start_at >= $2 AND start_at < $3) AS week,
              COUNT(*) FILTER (WHERE preview=1) AS previews
       FROM appointments`, [S.zoned(today, '00:00'), S.zoned(S.addDays(today, 1), '00:00'), S.zoned(S.addDays(today, 8), '00:00')]);
    let userCount = 0; let pushCount = 0;
    try { userCount = Number(await services.auth.getUserCount()) || 0; } catch (e) {}
    try { pushCount = Number(await services.push.getSubscriptionCount()) || 0; } catch (e) {}
    const unpriced = await db.get('SELECT COUNT(*)::int AS n FROM services WHERE published=1 AND bookable=1 AND price_verified=0');
    return {
      counts, userCount, pushCount, today,
      totalVisits: Number(v.total), recentVisits: Number(v.recent),
      pending: Number(a.pending), todayCount: Number(a.today), weekCount: Number(a.week), previews: Number(a.previews),
      unpriced: unpriced.n, newMessages: Number((await db.get("SELECT COUNT(*) AS n FROM messages WHERE status='new'")).n),
    };
  }

  function adminPage(path, view, section, load) {
    router.get(path, wrap(async (req, res) => {
      if (!services.admin.isAdmin(req)) return res.redirect(tenantPath(req, '/admin/login'));
      res.locals.page = 'admin';
      const m = getModules(req.lang);
      const extra = load ? await load(req, res, m) : {};
      res.render(view, Object.assign({ page: 'admin', modules: m.modules, adminSection: section, adminUser: adminUser() }, extra));
    }));
  }

  adminPage('/admin', 'admin', 'dashboard', async (req) => ({
    stats: await adminStats(req.site),
    pendingRequests: (await db.all("SELECT * FROM appointments WHERE status='requested' ORDER BY start_at LIMIT 8")).map(adminAppointment),
    recentMessages: await db.all('SELECT * FROM messages ORDER BY created_at DESC LIMIT 5'),
    emailConfigured: !!(req.site.notification_email || services.config.contactEmail),
  }));
  adminPage('/admin/rendez-vous', 'admin-board', 'board', async (req) => ({ boardDate: /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '') ? req.query.date : null }));
  adminPage('/admin/settings', 'admin-settings', 'settings', async (req, res, m) => ({
    settingsFields: m.settingsFields, bookingFields: m.bookingFields, rawSettings: req.site,
  }));
  for (const mod of getModules('fr').modules) {
    adminPage('/admin/' + mod.key, 'admin-module', mod.key, async (req, res, m) => {
      const current = m.modules.find((x) => x.key === mod.key);
      return {
        items: await db.all('SELECT * FROM ' + mod.key + (mod.key === 'vehicles' ? ' WHERE archived=0' : '') + ' ORDER BY id DESC LIMIT 500'),
        module: current, fieldsJson: encodeURIComponent(JSON.stringify(current.fields)),
      };
    });
  }

  router.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: res.locals.t.not_found });
    res.status(404).render('error', { page: 'error', errorText: res.locals.t.not_found });
  });
  router.use((err, req, res, next) => fail(req, res, err));

  return router;
};
