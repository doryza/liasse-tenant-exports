/**
 * The garage's back office: today's cars, the bay board, booking a customer
 * who phoned, estimates and invoices, the customer file, services and prices,
 * opening hours, messages and the switches.
 *
 * Site TEXT is not edited here — headings, blurbs, the about page and the
 * privacy notice are edited in place on the site with the Liasse inline
 * editor (data-lk). This back office only holds the shop's data.
 *
 * Every page is admin-only (redirect to the platform login); every API sits
 * behind requireAdmin and the router's same-origin guard.
 */
const S = require('./settings');
const B = require('./booking');
const D = require('./documents');
const makeClients = require('./clients');
const config = require('./modules');

const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const list = (raw) => { try { const x = JSON.parse(raw || '[]'); return Array.isArray(x) ? x : []; } catch (e) { return String(raw || '').split('\n').filter(Boolean); } };
const PHONE_RE = /^[+()\d .-]{7,40}$/;
const STATUSES = ['requested', 'confirmed', 'in_progress', 'ready', 'completed', 'cancelled', 'no_show'];
const ACTIVE_TODAY = ['requested', 'confirmed', 'in_progress', 'ready', 'completed'];
const VEHICLE_CLASSES = ['voiture', 'vus', 'pickup', 'gros'];
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
const isTime = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || ''));

module.exports = function registerAdmin(router, ctx) {
  const { services, db, wrap, tenantPath, absolute, notify, cars, vehicleLabel, cleanVehicle, publishedServices } = ctx;
  const docs = D(db);
  const clients = makeClients(db);

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: res.locals.t.forbidden });
    next();
  }
  router.use('/api/admin', requireAdmin);

  const adminUser = () => ({ name: services.config.ownerName || 'Garage' });
  const today = () => S.local(new Date()).date;

  function adminAppointment(a) {
    return Object.assign({}, a, { services: list(a.services), local: S.local(a.start_at), localEnd: S.local(a.end_at), walkIn: String(a.user_id).startsWith('c:') });
  }

  function num(raw, key, fallback) { const n = Number(raw[key]); return raw[key] !== undefined && raw[key] !== '' && Number.isFinite(n) ? n : fallback; }
  function docSettings(raw) {
    return {
      labourRate: num(raw, 'labour_rate_cents', 0),
      chargeTaxes: raw.charge_taxes === undefined || raw.charge_taxes === '' ? true : raw.charge_taxes === '1',
      validDays: num(raw, 'estimate_valid_days', 30),
      warranty: raw.warranty_text || D.LEGAL_WARRANTY.fr,
      tps: raw.tps_number || '', tvq: raw.tvq_number || '', neq: raw.neq || '',
      footer: raw.document_footer || '',
    };
  }

  // =========================================================== pages
  function adminPage(paths, view, section, load) {
    router.get(paths, wrap(async (req, res) => {
      if (!services.admin.isAdmin(req)) return res.redirect(tenantPath(req, '/admin/login'));
      res.locals.page = 'admin';
      const extra = load ? await load(req, res) : {};
      if (extra === null) { res.status(404); return res.render('admin-missing', { page: 'admin', adminSection: section, adminUser: adminUser(), navCounts: { messages: 0, pending: 0 }, tr: (fr, en) => (req.lang === 'en' ? en : fr) }); }
      if (extra && extra.redirect) return res.redirect(tenantPath(req, extra.redirect));
      const counts = await db.get("SELECT (SELECT COUNT(*) FROM messages WHERE status='new')::int AS messages, (SELECT COUNT(*) FROM appointments WHERE status='requested' AND start_at >= NOW() - INTERVAL '1 day')::int AS pending");
      res.render(view, Object.assign({
        page: 'admin', adminSection: section, adminUser: adminUser(), docSettings: docSettings(req.site), navCounts: counts,
        // Render local (not a template const) so every include sees it.
        tr: (fr, en) => (req.lang === 'en' ? en : fr),
        cash: (c) => D.money(c, req.lang), qtyf: (n) => D.qty(n, req.lang),
      }, extra));
    }));
  }

  // Old addresses from the first version of this back office.
  const MOVED = { '/admin/settings': '/admin/reglages', '/admin/hours': '/admin/horaire', '/admin/closures': '/admin/horaire',
    '/admin/customer_profiles': '/admin/clients', '/admin/vehicles': '/admin/clients' };
  for (const [from, to] of Object.entries(MOVED)) router.get(from, (req, res) => res.redirect(301, tenantPath(req, to)));

  async function setupTodo(raw) {
    const effPrivacy = S.siteText(raw, 'privacy_notice', 'fr');
    const out = [];
    if (!S.flag(raw, 'contact_verified') || !S.flag(raw, 'address_verified')) out.push({ key: 'contact', href: 'admin/reglages#garage' });
    if (raw.hours_known === '0') out.push({ key: 'hours_unknown', href: 'admin/horaire' });
    else if (!S.flag(raw, 'hours_verified')) out.push({ key: 'hours', href: 'admin/horaire' });
    const tbc = await db.get('SELECT COUNT(*)::int AS n FROM services WHERE published=1 AND confirmed=0');
    if (tbc.n) out.push({ key: 'services_tbc', n: tbc.n, href: 'admin/services' });
    if (!docSettings(raw).labourRate) out.push({ key: 'rate', href: 'admin/reglages#factures' });
    const unpriced = await db.get('SELECT COUNT(*)::int AS n FROM services WHERE published=1 AND bookable=1 AND price_verified=0');
    if (unpriced.n) out.push({ key: 'prices', n: unpriced.n, href: 'admin/services' });
    if (!S.flag(raw, 'privacy_approved')) out.push({ key: 'privacy', href: 'admin/reglages#confidentialite', placeholders: S.hasPlaceholders(effPrivacy) });
    if (!S.flag(raw, 'bookings_live')) out.push({ key: 'booking', href: 'admin/reglages#reservation' });
    if (!S.flag(raw, 'live_actions_enabled')) out.push({ key: 'live', href: 'admin/reglages#envois' });
    return out;
  }

  adminPage('/admin', 'admin-today', 'today', async (req) => {
    const d = today();
    const appts = await db.all(
      `SELECT * FROM appointments WHERE start_at >= $1 AND start_at < $2 AND status = ANY($3) ORDER BY start_at`,
      [S.zoned(d, '00:00'), S.zoned(S.addDays(d, 1), '00:00'), ACTIVE_TODAY]);
    const pending = await db.all("SELECT * FROM appointments WHERE status='requested' AND start_at >= NOW() - INTERVAL '1 day' ORDER BY start_at LIMIT 12");
    const docsForToday = appts.length ? await db.all('SELECT id, kind, number, status, appointment_id FROM documents WHERE appointment_id = ANY($1) ORDER BY id', [appts.map((a) => a.id)]) : [];
    const money = await db.get(
      `SELECT COUNT(*) FILTER (WHERE kind='invoice' AND status='unpaid')::int AS unpaid_n,
              COALESCE(SUM(total_cents - paid_cents) FILTER (WHERE kind='invoice' AND status='unpaid'),0)::int AS unpaid_cents,
              COUNT(*) FILTER (WHERE kind='estimate' AND status='sent')::int AS waiting_n
       FROM documents`);
    const newMessages = (await db.get("SELECT COUNT(*)::int AS n FROM messages WHERE status='new'")).n;
    const docsByAppt = docsForToday.reduce((m, x) => { (m[x.appointment_id] = m[x.appointment_id] || []).push(x); return m; }, {});
    return {
      date: d, appointments: appts.map((a) => Object.assign(adminAppointment(a), { documents: docsByAppt[a.id] || [] })),
      pending: pending.map(adminAppointment), docsByAppt,
      money, newMessages, todo: await setupTodo(req.site),
    };
  });

  adminPage('/admin/rendez-vous', 'admin-board', 'board', async (req) => ({ boardDate: isDate(req.query.date) ? req.query.date : null }));

  adminPage('/admin/rendez-vous/nouveau', 'admin-book', 'board', async (req) => {
    let client = null; let vehicles = [];
    if (/^\d+$/.test(String(req.query.client || ''))) {
      client = await db.get('SELECT * FROM clients WHERE id=$1', [Number(req.query.client)]);
      if (client) vehicles = await clients.vehiclesOf(client);
    }
    const all = await publishedServices();
    return { customer: client, vehicles, bookable: all.filter((s) => Number(s.bookable)), bookCfg: B.config(req.site), makes: cars.MAKES };
  });

  adminPage('/admin/documents', 'admin-documents', 'documents', async (req) => {
    const kind = ['estimate', 'invoice'].includes(req.query.kind) ? req.query.kind : 'all';
    const filter = ['open', 'unpaid', 'paid', 'all'].includes(req.query.filter) ? req.query.filter : 'open';
    const q = clip(req.query.q, 80);
    const where = []; const args = [];
    if (kind !== 'all') { args.push(kind); where.push('kind=$' + args.length); }
    if (filter === 'open') where.push("status IN ('draft','sent','accepted','unpaid')");
    if (filter === 'unpaid') where.push("kind='invoice' AND status='unpaid'");
    if (filter === 'paid') where.push("status='paid'");
    if (q) { args.push('%' + q.toLowerCase() + '%'); where.push(`(LOWER(COALESCE(client_name,'')) LIKE $${args.length} OR LOWER(COALESCE(number,'')) LIKE $${args.length} OR LOWER(COALESCE(vehicle_label,'')) LIKE $${args.length} OR LOWER(COALESCE(vehicle_plate,'')) LIKE $${args.length})`); }
    const rows = await db.all(
      `SELECT id, kind, number, status, client_name, vehicle_label, vehicle_plate, total_cents, paid_cents,
              to_char(issued_on,'YYYY-MM-DD') AS issued_on, to_char(valid_until,'YYYY-MM-DD') AS valid_until, updated_at
       FROM documents ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY updated_at DESC LIMIT 300`, args);
    return { docs: rows, kind, filter, q };
  });

  adminPage('/admin/documents/:id', 'admin-document', 'documents', async (req) => {
    if (!/^\d+$/.test(req.params.id)) return null;
    const doc = await docs.load(Number(req.params.id));
    if (!doc) return null;
    const related = await db.all(`SELECT id, kind, number, status FROM documents WHERE id <> $1 AND (id = $2 OR source_id = $1 OR ($3::int IS NOT NULL AND appointment_id = $3)) ORDER BY id`,
      [doc.id, doc.source_id || 0, doc.appointment_id || null]);
    const priced = (await publishedServices()).map((s) => ({ id: s.id, name: s.name, duration_min: s.duration_min, price_cents: Number(s.price_verified) ? s.price_from_cents : null }));
    return { doc, related, priced };
  });

  adminPage('/admin/documents/:id/imprimer', 'admin-print', 'documents', async (req) => {
    if (!/^\d+$/.test(req.params.id)) return null;
    const doc = await docs.load(Number(req.params.id));
    if (!doc) return null;
    return { doc, autoPrint: req.query.print === '1' };
  });

  adminPage('/admin/clients', 'admin-clients', 'clients', async (req) => {
    await clients.syncOnline();
    const q = clip(req.query.q, 80);
    return { rows: await clients.search(q, 200), q };
  });

  adminPage('/admin/clients/:id', 'admin-client', 'clients', async (req) => {
    if (!/^\d+$/.test(req.params.id)) return null;
    const client = await db.get('SELECT * FROM clients WHERE id=$1', [Number(req.params.id)]);
    if (!client) return null;
    const appts = await db.all("SELECT * FROM appointments WHERE user_id=$1 AND status <> 'holding' ORDER BY start_at DESC LIMIT 100", [client.user_id]);
    const documents = await db.all(
      `SELECT id, kind, number, status, vehicle_label, total_cents, paid_cents, to_char(issued_on,'YYYY-MM-DD') AS issued_on
       FROM documents WHERE client_id=$1 ORDER BY created_at DESC LIMIT 100`, [client.id]);
    // Not `client`: EJS reads that data key as its own option (client-side compile) and loses include().
    return { customer: client, vehicles: await clients.vehiclesOf(client), appts: appts.map(adminAppointment), documents, makes: cars.MAKES };
  });

  adminPage('/admin/services', 'admin-services', 'services', async () => ({
    rows: await db.all('SELECT * FROM services ORDER BY sort_order, id'),
  }));

  adminPage('/admin/horaire', 'admin-hours', 'hours', async () => ({
    hours: await db.all('SELECT * FROM hours ORDER BY weekday'),
    closures: await db.all("SELECT id, to_char(date,'YYYY-MM-DD') AS date, reason, reason_en FROM closures WHERE date >= CURRENT_DATE - 1 ORDER BY closures.date"),
  }));

  adminPage('/admin/messages', 'admin-messages', 'messages', async (req) => {
    const box = ['new', 'all', 'archived'].includes(req.query.box) ? req.query.box : 'new';
    const where = box === 'new' ? "WHERE status IN ('new','read')" : box === 'archived' ? "WHERE status='archived'" : '';
    return { rows: await db.all(`SELECT * FROM messages ${where} ORDER BY created_at DESC LIMIT 200`), box };
  });

  adminPage('/admin/reglages', 'admin-settings', 'settings', async (req) => {
    const c = config(req.lang);
    const effPrivacy = { fr: S.siteText(req.site, 'privacy_notice', 'fr'), en: S.siteText(req.site, 'privacy_notice', 'en') };
    return { settingsFields: c.settingsFields, bookingFields: c.bookingFields, docFields: c.docFields, rawSettings: req.site, effPrivacy, todo: await setupTodo(req.site) };
  });

  // =========================================================== board + appointments
  router.get('/api/admin/board', wrap(async (req, res) => {
    const from = isDate(req.query.from) ? req.query.from : today();
    const days = Math.max(1, Math.min(14, Number(req.query.days) || 7));
    const rows = await db.all(
      "SELECT * FROM appointments WHERE start_at >= $1 AND start_at < $2 AND status <> 'holding' ORDER BY start_at",
      [S.zoned(from, '00:00'), S.zoned(S.addDays(from, days), '00:00')]);
    const hours = await db.all('SELECT * FROM hours ORDER BY weekday');
    const closures = await db.all("SELECT id, to_char(date,'YYYY-MM-DD') AS date, reason, reason_en FROM closures WHERE date >= $1 AND date < $2", [from, S.addDays(from, days)]);
    const withDocs = rows.length ? await db.all('SELECT id, kind, number, status, appointment_id FROM documents WHERE appointment_id = ANY($1)', [rows.map((a) => a.id)]) : [];
    res.json({ from, days, today: today(), bays: B.config(req.site).bays, hours, closures,
      appointments: rows.map((a) => Object.assign(adminAppointment(a), { documents: withDocs.filter((x) => x.appointment_id === a.id) })) });
  }));

  function customerLink(req, appt) {
    return String(appt.user_id).startsWith('c:') ? null : absolute(req, '/' + S.urls(appt.language).appointment + appt.reference + '/');
  }

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
      notify.toCustomer(req.site, row, status, customerLink(req, row)).catch(() => {});
    }
    res.json({ appointment: adminAppointment(row) });
  }));

  // The garage books its own customers without the online notice period
  // (a walk-in can have this afternoon) and further ahead.
  const shopRules = (raw) => Object.assign({}, raw, { lead_hours: '0', horizon_days: '120' });

  router.get('/api/admin/availability', wrap(async (req, res) => {
    const slugs = String(req.query.services || '').split(',').map((x) => clip(x, 80)).filter(Boolean).slice(0, 12);
    const rows = slugs.length ? await db.all('SELECT * FROM services WHERE slug = ANY($1)', [slugs]) : [];
    const cfg = B.config(req.site);
    let minutes = B.durationFor(rows.length ? rows : [{ duration_min: 60 }], cfg);
    const m = Number(req.query.minutes);
    if (Number.isInteger(m) && m >= 15 && m <= 600) minutes = m;
    const from = isDate(req.query.from) ? req.query.from : undefined;
    const excludeId = /^\d+$/.test(String(req.query.exclude || '')) ? Number(req.query.exclude) : null;
    res.json(await B.availability(db, shopRules(req.site), { from, days: Math.min(21, Number(req.query.days) || 14), minutes, excludeId }));
  }));

  // Set or change the time of an appointment (a request made while hours were
  // unpublished has no bay yet). Confirms it and tells the customer when live.
  router.put('/api/admin/appointments/:id/moment', wrap(async (req, res) => {
    const id = Number(req.params.id);
    const appt = await db.get('SELECT * FROM appointments WHERE id=$1', [id]);
    if (!appt || ['cancelled', 'no_show', 'completed'].includes(appt.status)) throw S.error('invalid');
    const b = req.body || {}; const date = String(b.date || ''); const time = String(b.time || '');
    if (!isDate(date) || !isTime(time)) throw S.error('invalid');
    const minutes = Number(appt.duration_min) || 60;
    if (!(await B.isBookable(db, shopRules(req.site), { date, time, minutes, excludeId: id }))) throw S.error('slot_taken', 409);
    const hours = await db.get('SELECT * FROM hours WHERE weekday=$1', [S.weekdayOf(date)]);
    const start = S.zoned(date, time); const end = new Date(start.getTime() + minutes * 60000);
    await B.releaseBay(db, id);
    const held = await B.holdBay(db, req.site, id, start, minutes, S.toMinutes(hours.closes));
    if (!held) throw S.error('slot_taken', 409);
    const row = await db.get(
      `UPDATE appointments SET start_at=$1, end_at=$2, bay=$3, status=CASE WHEN status='requested' THEN 'confirmed' ELSE status END,
         confirmed_at=COALESCE(confirmed_at, NOW()), updated_at=NOW() WHERE id=$4 RETURNING *`, [start, end, held.bay, id]);
    await db.run('INSERT INTO appointment_events(appointment_id,status,note,actor) VALUES($1,$2,$3,$4)', [id, row.status, 'rescheduled', 'garage']);
    notify.toCustomer(req.site, row, appt.status === 'requested' ? 'confirmed' : 'rescheduled', customerLink(req, row)).catch(() => {});
    res.json({ appointment: adminAppointment(row) });
  }));

  // Book for a customer who called or walked in. Same engine as online
  // booking (bays × slots, the bay_slots primary key refuses a double
  // booking) — but confirmed right away and never a preview.
  router.post('/api/admin/appointments', wrap(async (req, res) => {
    const b = req.body || {};
    const raw = req.site;
    const cfg = B.config(raw);
    let client = null;
    if (b.clientId) client = await db.get('SELECT * FROM clients WHERE id=$1', [Number(b.clientId)]);
    if (!client && b.newClient) client = await clients.create(b.newClient);
    if (!client) throw S.error('required');
    const uid = client.user_id;

    let vehicle = null;
    if (b.vehicleId) vehicle = await db.get('SELECT * FROM vehicles WHERE id=$1 AND user_id=$2 AND archived=0', [Number(b.vehicleId), uid]);
    if (!vehicle && b.vehicle) {
      const v = cleanVehicle(b.vehicle);
      vehicle = await db.get('INSERT INTO vehicles(user_id,year,make,model,trim,vin,plate,odometer_km) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [uid, v.year, v.make, v.model, v.trim, v.vin, v.plate, v.odometer_km]);
    }
    if (!vehicle) throw S.error('required');

    const slugs = Array.isArray(b.services) ? b.services.map((x) => clip(x, 80)).slice(0, 12) : [];
    const rows = slugs.length ? await db.all('SELECT * FROM services WHERE slug = ANY($1)', [slugs]) : [];
    const concern = clip(b.concern, 2000);
    if (!rows.length && !concern) throw S.error('required');
    let minutes = B.durationFor(rows.length ? rows : [{ duration_min: 60 }], cfg);
    if (b.minutes && Number.isInteger(Number(b.minutes)) && Number(b.minutes) >= 15 && Number(b.minutes) <= 600) minutes = Number(b.minutes);
    const date = String(b.date || ''); const time = String(b.time || '');
    if (!isDate(date) || !isTime(time)) throw S.error('invalid');
    if (!(await B.isBookable(db, shopRules(raw), { date, time, minutes }))) throw S.error('slot_taken', 409);
    const hours = await db.get('SELECT * FROM hours WHERE weekday=$1', [S.weekdayOf(date)]);
    const start = S.zoned(date, time);
    const end = new Date(start.getTime() + minutes * 60000);
    const names = rows.map((s) => s.name);
    if (!rows.length) names.push('Diagnostic');

    let appt = null;
    for (let i = 0; i < 5 && !appt; i++) {
      try {
        appt = await db.get(
          `INSERT INTO appointments(reference,user_id,vehicle_id,vehicle_label,services,service_names,concern,start_at,end_at,duration_min,stay,courtesy_car,towing,towing_address,contact_name,contact_phone,contact_email,language,status,preview,consent,internal_note,confirmed_at)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'fr','confirmed',0,0,$18,NOW()) RETURNING *`,
          [B.reference((a, z) => services.crypto.randomInt(a, z)), uid, vehicle.id, vehicleLabel(vehicle), JSON.stringify(rows.map((s) => s.slug)),
            names.join(', '), concern, start, end, minutes, b.stay === 'wait' ? 'wait' : 'drop', b.courtesyCar ? 1 : 0, b.towing ? 1 : 0,
            b.towing ? clip(b.towingAddress, 300) : null, client.name, client.phone || null, client.email || null, clip(b.internalNote, 4000) || null]);
      } catch (e) {
        if (e.code === '23505' && /reference/.test(e.message || e.detail || '')) continue;
        throw e;
      }
    }
    if (!appt) throw S.error('server_error', 500);
    const held = await B.holdBay(db, raw, appt.id, start, minutes, S.toMinutes(hours.closes));
    if (!held) { await db.run('DELETE FROM appointments WHERE id=$1', [appt.id]); throw S.error('slot_taken', 409); }
    appt = await db.get('UPDATE appointments SET bay=$1 WHERE id=$2 RETURNING *', [held.bay, appt.id]);
    await db.run('INSERT INTO appointment_events(appointment_id,status,actor) VALUES($1,$2,$3)', [appt.id, 'confirmed', 'garage']);
    await db.run('UPDATE clients SET updated_at=NOW() WHERE id=$1', [client.id]);
    if (b.notify) notify.toCustomer(raw, appt, 'confirmed', customerLink(req, appt)).catch(() => {});
    res.status(201).json({ appointment: adminAppointment(appt), client });
  }));

  // =========================================================== clients + vehicles
  router.get('/api/admin/clients', wrap(async (req, res) => {
    await clients.syncOnline();
    res.json({ clients: await clients.search(req.query.q, 20) });
  }));
  router.get('/api/admin/clients/:id', wrap(async (req, res) => {
    const client = await db.get('SELECT * FROM clients WHERE id=$1', [Number(req.params.id)]);
    if (!client) throw S.error('not_found', 404);
    res.json({ client, vehicles: await clients.vehiclesOf(client) });
  }));
  router.post('/api/admin/clients', wrap(async (req, res) => res.status(201).json({ client: await clients.create(req.body || {}) })));
  router.put('/api/admin/clients/:id', wrap(async (req, res) => res.json({ client: await clients.update(Number(req.params.id), req.body || {}) })));

  router.post('/api/admin/clients/:id/vehicles', wrap(async (req, res) => {
    const client = await db.get('SELECT * FROM clients WHERE id=$1', [Number(req.params.id)]);
    if (!client) throw S.error('not_found', 404);
    const v = cleanVehicle(req.body || {});
    const row = await db.get('INSERT INTO vehicles(user_id,year,make,model,trim,vin,plate,odometer_km,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [client.user_id, v.year, v.make, v.model, v.trim, v.vin, v.plate, v.odometer_km, clip((req.body || {}).notes, 2000) || null]);
    res.status(201).json({ vehicle: row });
  }));
  router.put('/api/admin/vehicles/:id', wrap(async (req, res) => {
    const old = await db.get('SELECT * FROM vehicles WHERE id=$1', [Number(req.params.id)]);
    if (!old) throw S.error('not_found', 404);
    const v = cleanVehicle(Object.assign({}, old, req.body || {}));
    const row = await db.get('UPDATE vehicles SET year=$1,make=$2,model=$3,trim=$4,vin=$5,plate=$6,odometer_km=$7,notes=$8,updated_at=NOW() WHERE id=$9 RETURNING *',
      [v.year, v.make, v.model, v.trim, v.vin, v.plate, v.odometer_km, clip((req.body || {}).notes !== undefined ? req.body.notes : old.notes, 2000) || null, old.id]);
    res.json({ vehicle: row });
  }));
  router.delete('/api/admin/vehicles/:id', wrap(async (req, res) => {
    const row = await db.get('UPDATE vehicles SET archived=1, updated_at=NOW() WHERE id=$1 RETURNING id', [Number(req.params.id)]);
    if (!row) throw S.error('not_found', 404);
    res.json({ success: true });
  }));

  // =========================================================== estimates + invoices
  const EDITABLE = { estimate: ['draft', 'sent'], invoice: ['draft'] };
  const canEdit = (doc) => (EDITABLE[doc.kind] || []).includes(doc.status);

  async function linesFromAppointment(appt, rate) {
    const slugs = list(appt.services);
    const rows = slugs.length ? await db.all('SELECT * FROM services WHERE slug = ANY($1)', [slugs]) : [];
    const out = rows.filter((s) => Number(s.duration_min) > 0).map((s) => ({
      kind: 'labour', description: s.name, quantity: Math.max(0.25, Math.round((Number(s.duration_min) / 60) * 4) / 4), unit: rate / 100,
    }));
    if (appt.concern) out.unshift({ kind: 'note', description: 'Demande du client : ' + appt.concern });
    return out;
  }

  router.post('/api/admin/documents', wrap(async (req, res) => {
    const b = req.body || {};
    const kind = b.kind === 'invoice' ? 'invoice' : 'estimate';
    const ds = docSettings(req.site);
    let appt = null; let client = null; let vehicle = null;
    if (b.appointmentId) appt = await db.get('SELECT * FROM appointments WHERE id=$1', [Number(b.appointmentId)]);
    if (appt) {
      client = await clients.forUser(appt.user_id, { name: appt.contact_name, phone: appt.contact_phone, email: appt.contact_email });
      if (appt.vehicle_id) vehicle = await db.get('SELECT * FROM vehicles WHERE id=$1', [appt.vehicle_id]);
    }
    if (!client && b.clientId) client = await db.get('SELECT * FROM clients WHERE id=$1', [Number(b.clientId)]);
    if (!vehicle && b.vehicleId && client) vehicle = await db.get('SELECT * FROM vehicles WHERE id=$1 AND user_id=$2', [Number(b.vehicleId), client.user_id]);
    const d = today();
    const lines = (appt ? await linesFromAppointment(appt, ds.labourRate) : []).map(D.cleanLine).filter(Boolean);
    const t = D.totals(lines, { chargeTaxes: ds.chargeTaxes });
    const number = kind === 'estimate' ? await docs.nextNumber('estimate', d.slice(0, 4)) : null;
    const doc = await db.get(
      `INSERT INTO documents(kind, number, status, client_id, vehicle_id, appointment_id, client_name, client_phone, client_email, client_address,
         vehicle_label, vehicle_plate, vehicle_vin, odometer_km, issued_on, valid_until, delivered_on, labour_rate_cents, charge_taxes,
         subtotal_cents, tps_cents, tvq_cents, total_cents, warranty_text)
       VALUES($1,$2,'draft',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING id`,
      [kind, number, client ? client.id : null, vehicle ? vehicle.id : null, appt ? appt.id : null,
        client ? client.name : null, client ? client.phone : null, client ? client.email : null, client ? client.address : null,
        vehicle ? vehicleLabel(vehicle) : (appt ? appt.vehicle_label : null), vehicle ? vehicle.plate : null, vehicle ? vehicle.vin : null,
        vehicle ? vehicle.odometer_km : null, d, kind === 'estimate' ? S.addDays(d, ds.validDays) : null, kind === 'invoice' ? d : null,
        ds.labourRate || null, ds.chargeTaxes ? 1 : 0, t.subtotal, t.tps, t.tvq, t.total, kind === 'invoice' ? ds.warranty : null]);
    await docs.writeLines(doc.id, lines);
    res.status(201).json({ id: doc.id, url: tenantPath(req, '/admin/documents/' + doc.id) });
  }));

  router.put('/api/admin/documents/:id', wrap(async (req, res) => {
    const doc = await docs.load(Number(req.params.id));
    if (!doc) throw S.error('not_found', 404);
    const b = req.body || {};
    // Notes can always change; the money only while the document is open.
    const notesOnly = !canEdit(doc);
    const fields = {
      customer_note: clip(b.customer_note, 3000) || null,
      internal_note: clip(b.internal_note, 4000) || null,
    };
    if (!notesOnly) {
      let client = doc.client_id ? await db.get('SELECT * FROM clients WHERE id=$1', [doc.client_id]) : null;
      if (b.clientId && Number(b.clientId) !== doc.client_id) client = await db.get('SELECT * FROM clients WHERE id=$1', [Number(b.clientId)]);
      let vehicle = null;
      if (b.vehicleId && client) vehicle = await db.get('SELECT * FROM vehicles WHERE id=$1 AND user_id=$2', [Number(b.vehicleId), client.user_id]);
      const odo = b.odometer_km === '' || b.odometer_km == null ? null : Number(String(b.odometer_km).replace(/\D/g, ''));
      if (odo != null && !(Number.isInteger(odo) && odo >= 0 && odo <= 2000000)) throw S.error('invalid');
      const rate = D.parseMoney(b.labour_rate);
      if (Number.isNaN(rate) || (rate != null && (rate < 0 || rate > 100000))) throw S.error('invalid');
      const lines = (Array.isArray(b.lines) ? b.lines.slice(0, 120) : []).map(D.cleanLine).filter(Boolean);
      const chargeTaxes = b.charge_taxes === undefined ? !!Number(doc.charge_taxes) : !!b.charge_taxes;
      const t = D.totals(lines, { chargeTaxes });
      Object.assign(fields, {
        client_id: client ? client.id : doc.client_id,
        vehicle_id: vehicle ? vehicle.id : (b.vehicleId === null ? null : doc.vehicle_id),
        client_name: clip(b.client_name, 120) || null, client_phone: clip(b.client_phone, 40) || null,
        client_email: clip(b.client_email, 200) || null, client_address: clip(b.client_address, 300) || null,
        vehicle_label: clip(b.vehicle_label, 140) || null, vehicle_plate: clip(b.vehicle_plate, 12).toUpperCase() || null,
        vehicle_vin: clip(b.vehicle_vin, 17).toUpperCase() || null, odometer_km: odo,
        issued_on: isDate(b.issued_on) ? b.issued_on : doc.issued_on,
        valid_until: doc.kind === 'estimate' && isDate(b.valid_until) ? b.valid_until : doc.valid_until,
        delivered_on: doc.kind === 'invoice' && isDate(b.delivered_on) ? b.delivered_on : doc.delivered_on,
        labour_rate_cents: rate, charge_taxes: chargeTaxes ? 1 : 0, return_parts: b.return_parts ? 1 : 0,
        warranty_text: doc.kind === 'invoice' ? (clip(b.warranty_text, 2000) || null) : null,
        subtotal_cents: t.subtotal, tps_cents: t.tps, tvq_cents: t.tvq, total_cents: t.total,
      });
      await docs.writeLines(doc.id, lines);
      // Keep the customer file current with what was typed on the document.
      if (client && fields.client_address && !client.address) await db.run('UPDATE clients SET address=$1, updated_at=NOW() WHERE id=$2', [fields.client_address, client.id]);
      if (vehicle && odo != null && (vehicle.odometer_km == null || odo > vehicle.odometer_km)) await db.run('UPDATE vehicles SET odometer_km=$1, updated_at=NOW() WHERE id=$2', [odo, vehicle.id]);
    }
    const keys = Object.keys(fields);
    await db.run(`UPDATE documents SET ${keys.map((k, i) => k + '=$' + (i + 1)).join(', ')}, updated_at=NOW() WHERE id=$${keys.length + 1}`, [...Object.values(fields), doc.id]);
    res.json({ document: await docs.load(doc.id), notesOnly });
  }));

  // Status moves. Issuing an invoice gives it its number (numbers are never
  // reused or skipped by drafts). An issued invoice is never deleted: it is
  // cancelled, and a corrected copy is made.
  router.post('/api/admin/documents/:id/status', wrap(async (req, res) => {
    const doc = await docs.load(Number(req.params.id));
    if (!doc) throw S.error('not_found', 404);
    const to = String((req.body || {}).status || '');
    const allowed = doc.kind === 'estimate'
      ? { draft: ['sent', 'accepted', 'declined'], sent: ['accepted', 'declined', 'draft'], accepted: ['sent'], declined: ['sent'], invoiced: [] }
      : { draft: ['unpaid'], unpaid: ['paid', 'void'], paid: ['unpaid'], void: [] };
    if (!(allowed[doc.status] || []).includes(to)) throw S.error('invalid');
    if (['sent', 'accepted', 'unpaid'].includes(to) && (!doc.client_name || !doc.lines.some((l) => l.kind !== 'note'))) throw S.error('required');
    let number = doc.number;
    if (doc.kind === 'invoice' && to === 'unpaid' && !number) number = await docs.nextNumber('invoice', (doc.issued_on || today()).slice(0, 4));
    const paid = to === 'paid' ? doc.total_cents : (to === 'unpaid' && doc.status === 'paid' ? 0 : doc.paid_cents);
    await db.run(
      `UPDATE documents SET status=$1, number=$2, paid_cents=$3,
         paid_on = CASE WHEN $1='paid' THEN COALESCE(paid_on, CURRENT_DATE) WHEN $1='unpaid' THEN NULL ELSE paid_on END,
         payment_method = CASE WHEN $1='paid' THEN COALESCE($4, payment_method) WHEN $1='unpaid' THEN NULL ELSE payment_method END,
         updated_at=NOW() WHERE id=$5`,
      [to, number, paid, D.PAYMENT_METHODS.includes((req.body || {}).method) ? req.body.method : null, doc.id]);
    res.json({ document: await docs.load(doc.id) });
  }));

  async function copyDocument(src, kind) {
    const ds = docSettings(await ctx.store.load());
    const d = today();
    const number = kind === 'estimate' ? await docs.nextNumber('estimate', d.slice(0, 4)) : null;
    const row = await db.get(
      `INSERT INTO documents(kind, number, status, client_id, vehicle_id, appointment_id, source_id, client_name, client_phone, client_email, client_address,
         vehicle_label, vehicle_plate, vehicle_vin, odometer_km, issued_on, valid_until, delivered_on, labour_rate_cents, charge_taxes,
         subtotal_cents, tps_cents, tvq_cents, total_cents, return_parts, customer_note, warranty_text)
       VALUES($1,$2,'draft',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26) RETURNING id`,
      [kind, number, src.client_id, src.vehicle_id, src.appointment_id, src.id, src.client_name, src.client_phone, src.client_email, src.client_address,
        src.vehicle_label, src.vehicle_plate, src.vehicle_vin, src.odometer_km, d, kind === 'estimate' ? S.addDays(d, ds.validDays) : null,
        kind === 'invoice' ? d : null, src.labour_rate_cents, src.charge_taxes, src.subtotal_cents, src.tps_cents, src.tvq_cents, src.total_cents,
        src.return_parts, src.customer_note, kind === 'invoice' ? (src.warranty_text || ds.warranty) : null]);
    await docs.writeLines(row.id, src.lines.map((l, i) => Object.assign({}, l, { position: i })));
    return row.id;
  }

  router.post('/api/admin/documents/:id/invoice', wrap(async (req, res) => {
    const doc = await docs.load(Number(req.params.id));
    if (!doc || doc.kind !== 'estimate') throw S.error('not_found', 404);
    if (doc.status === 'invoiced') {
      const existing = await db.get("SELECT id FROM documents WHERE source_id=$1 AND kind='invoice' ORDER BY id DESC LIMIT 1", [doc.id]);
      if (existing) return res.json({ id: existing.id, url: tenantPath(req, '/admin/documents/' + existing.id) });
    }
    const id = await copyDocument(doc, 'invoice');
    await db.run("UPDATE documents SET status='invoiced', updated_at=NOW() WHERE id=$1", [doc.id]);
    res.status(201).json({ id, url: tenantPath(req, '/admin/documents/' + id) });
  }));

  router.post('/api/admin/documents/:id/copy', wrap(async (req, res) => {
    const doc = await docs.load(Number(req.params.id));
    if (!doc) throw S.error('not_found', 404);
    const id = await copyDocument(doc, doc.kind);
    res.status(201).json({ id, url: tenantPath(req, '/admin/documents/' + id) });
  }));

  router.post('/api/admin/documents/:id/payment', wrap(async (req, res) => {
    const doc = await docs.load(Number(req.params.id));
    if (!doc || doc.kind !== 'invoice' || !['unpaid', 'paid'].includes(doc.status)) throw S.error('invalid');
    const b = req.body || {};
    const amount = D.parseMoney(b.amount);
    if (!Number.isFinite(amount) || amount === null || amount <= 0 || amount > 10000000) throw S.error('invalid');
    const method = D.PAYMENT_METHODS.includes(b.method) ? b.method : null;
    const paid = Math.min(doc.total_cents, doc.paid_cents + amount);
    const status = paid >= doc.total_cents ? 'paid' : 'unpaid';
    await db.run('UPDATE documents SET paid_cents=$1, status=$2, payment_method=COALESCE($3, payment_method), paid_on=$4, updated_at=NOW() WHERE id=$5',
      [paid, status, method, isDate(b.date) ? b.date : today(), doc.id]);
    res.json({ document: await docs.load(doc.id) });
  }));

  router.delete('/api/admin/documents/:id', wrap(async (req, res) => {
    const doc = await docs.load(Number(req.params.id));
    if (!doc) throw S.error('not_found', 404);
    // Only drafts go away; an invoice with a number is cancelled, never deleted.
    if (doc.status !== 'draft' || (doc.kind === 'invoice' && doc.number)) throw S.error('invalid');
    await db.run('DELETE FROM documents WHERE id=$1', [doc.id]);
    res.json({ success: true });
  }));

  // =========================================================== services + prices
  function serviceFields(b, old = {}) {
    const has = (k) => Object.prototype.hasOwnProperty.call(b, k);
    const pick = (k, n) => (has(k) ? clip(b[k], n) : (old[k] == null ? '' : old[k]));
    const out = {
      name: pick('name', 200), name_en: pick('name_en', 200), tagline: pick('tagline', 400), tagline_en: pick('tagline_en', 400),
      body: pick('body', 8000), body_en: pick('body_en', 8000),
    };
    if (!out.name) throw S.error('required');
    for (const k of ['signs', 'signs_en']) {
      if (has(k)) out[k] = JSON.stringify((Array.isArray(b[k]) ? b[k] : String(b[k] || '').split('\n')).map((x) => clip(x, 200)).filter(Boolean).slice(0, 12));
    }
    if (has('duration_min')) {
      const n = Number(b.duration_min);
      if (!Number.isInteger(n) || n < 0 || n > 600) throw S.error('invalid');
      out.duration_min = n;
    }
    if (has('price')) {
      const cents = D.parseMoney(b.price);
      if (Number.isNaN(cents) || (cents != null && (cents <= 0 || cents > 10000000))) throw S.error('invalid');
      out.price_from_cents = cents;
      out.price_verified = cents != null ? 1 : 0; // typing a price is confirming it; clearing it = « Sur estimation »
    }
    for (const k of ['bookable', 'published', 'featured', 'confirmed']) if (has(k)) out[k] = b[k] ? 1 : 0;
    // Sites whose services are sized (tires, rust-proofing: Martin & Martin) opt in.
    if (ctx.vehicleClasses && has('vehicle_classes')) {
      const want = (Array.isArray(b.vehicle_classes) ? b.vehicle_classes : String(b.vehicle_classes || '').split(','))
        .map((x) => String(x).trim()).filter((x) => VEHICLE_CLASSES.includes(x));
      out.vehicle_classes = [...new Set(want)].join(',') || null;
    }
    if (has('image_url')) {
      const u = clip(b.image_url, 600);
      if (u) { try { if (new URL(u).protocol !== 'https:') throw new Error(); } catch (e) { throw S.error('invalid'); } }
      out.image_url = u || null;
    }
    return out;
  }

  router.put('/api/admin/services/:id', wrap(async (req, res) => {
    const old = await db.get('SELECT * FROM services WHERE id=$1', [Number(req.params.id)]);
    if (!old) throw S.error('not_found', 404);
    const f = serviceFields(req.body || {}, old);
    const keys = Object.keys(f);
    const row = await db.get(`UPDATE services SET ${keys.map((k, i) => k + '=$' + (i + 1)).join(', ')}, updated_at=NOW() WHERE id=$${keys.length + 1} RETURNING *`, [...Object.values(f), old.id]);
    res.json({ service: row });
  }));

  router.post('/api/admin/services', wrap(async (req, res) => {
    const f = serviceFields(Object.assign({ duration_min: 60, bookable: 1, published: 0 }, req.body || {}));
    let slug = S.slugify(f.name) || 'service';
    for (let i = 2; await db.get('SELECT 1 FROM services WHERE slug=$1', [slug]); i++) slug = S.slugify(f.name) + '-' + i;
    const last = await db.get('SELECT COALESCE(MAX(sort_order),0)::int AS n FROM services');
    const keys = ['slug', 'sort_order', 'icon', ...Object.keys(f)];
    const row = await db.get(`INSERT INTO services(${keys.join(',')}) VALUES(${keys.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING *`,
      [slug, last.n + 1, 'wrench', ...Object.values(f)]);
    res.status(201).json({ service: row });
  }));

  router.post('/api/admin/services/order', wrap(async (req, res) => {
    const ids = Array.isArray((req.body || {}).ids) ? req.body.ids.map(Number).filter(Number.isInteger).slice(0, 200) : [];
    for (let i = 0; i < ids.length; i++) await db.run('UPDATE services SET sort_order=$1 WHERE id=$2', [i + 1, ids[i]]);
    res.json({ success: true });
  }));

  router.delete('/api/admin/services/:id', wrap(async (req, res) => {
    // Hidden rather than deleted: past appointments and documents name it.
    const row = await db.get('UPDATE services SET published=0, bookable=0, updated_at=NOW() WHERE id=$1 RETURNING id', [Number(req.params.id)]);
    if (!row) throw S.error('not_found', 404);
    res.json({ success: true });
  }));

  // =========================================================== hours + closures
  router.put('/api/admin/hours/:weekday', wrap(async (req, res) => {
    const wd = Number(req.params.weekday);
    if (!(wd >= 1 && wd <= 7)) throw S.error('invalid');
    const b = req.body || {};
    const closed = b.closed ? 1 : 0;
    if (!closed && (!isTime(b.opens) || !isTime(b.closes) || b.closes <= b.opens)) throw S.error('invalid');
    const row = await db.get(
      `INSERT INTO hours(weekday, opens, closes, closed) VALUES($1,$2,$3,$4)
       ON CONFLICT(weekday) DO UPDATE SET opens=EXCLUDED.opens, closes=EXCLUDED.closes, closed=EXCLUDED.closed, updated_at=NOW() RETURNING *`,
      [wd, closed ? null : b.opens, closed ? null : b.closes, closed]);
    // Entering hours publishes them: the site stops saying « à confirmer ».
    await db.run("INSERT INTO admin_settings(key,value) VALUES('hours_known','1') ON CONFLICT(key) DO UPDATE SET value='1',updated_at=NOW()");
    res.json({ hour: row });
  }));
  router.post('/api/admin/closures', wrap(async (req, res) => {
    const b = req.body || {};
    if (!isDate(b.date)) throw S.error('invalid');
    const row = await db.get(
      `INSERT INTO closures(date, reason, reason_en) VALUES($1,$2,$3)
       ON CONFLICT(date) DO UPDATE SET reason=EXCLUDED.reason, reason_en=EXCLUDED.reason_en, updated_at=NOW()
       RETURNING id, to_char(date,'YYYY-MM-DD') AS date, reason, reason_en`, [b.date, clip(b.reason, 120) || null, clip(b.reason_en, 120) || null]);
    res.status(201).json({ closure: row });
  }));
  router.delete('/api/admin/closures/:id', wrap(async (req, res) => {
    const row = await db.get('DELETE FROM closures WHERE id=$1 RETURNING id', [Number(req.params.id)]);
    if (!row) throw S.error('not_found', 404);
    res.json({ success: true });
  }));

  // =========================================================== messages
  router.put('/api/admin/messages/:id', wrap(async (req, res) => {
    const status = String((req.body || {}).status || '');
    if (!['new', 'read', 'answered', 'archived'].includes(status)) throw S.error('invalid');
    const row = await db.get('UPDATE messages SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [status, Number(req.params.id)]);
    if (!row) throw S.error('not_found', 404);
    res.json({ message: row });
  }));

  // =========================================================== settings
  router.put('/api/admin/settings', wrap(async (req, res) => {
    const key = String((req.body || {}).key || '');
    const value = String(req.body.value == null ? '' : req.body.value).trim();
    const c = config(req.lang);
    const bool = c.settingsFields.some((x) => x.name === key) || key === 'charge_taxes';
    const numeric = c.numberFields.find((x) => x.name === key);
    const text = c.textKeys[key];
    if (!bool && !numeric && !text && key !== 'labour_rate_cents') throw S.error('invalid');
    if (bool && !['0', '1'].includes(value)) throw S.error('invalid');
    if (numeric && value !== '') {
      const n = Number(value);
      if (!Number.isInteger(n) || n < numeric.min || n > numeric.max) throw S.error('invalid');
      if (key === 'slot_minutes' && ![15, 30, 60].includes(n)) throw S.error('invalid');
    }
    if (text && value.length > text) throw S.error('invalid');
    if (key === 'labour_rate_cents' && value !== '' && !(Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 100000)) throw S.error('invalid');
    if (key === 'privacy_approved' && value === '1') {
      const fr = S.siteText(req.site, 'privacy_notice', 'fr'); const en = S.siteText(req.site, 'privacy_notice', 'en');
      if (!fr.trim() || !en.trim() || S.hasPlaceholders(fr) || S.hasPlaceholders(en)) throw S.error('privacy_incomplete');
    }
    if (key === 'bookings_live' && value === '1' && !S.flag(req.site, 'privacy_approved')) throw S.error('privacy_first');
    if (key === 'notification_email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw S.error('invalid');
    if (key === 'contact_phone' && value && !PHONE_RE.test(value)) throw S.error('invalid');
    await db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()', [key, value]);
    res.json({ success: true });
  }));

  return { adminAppointment };
};
