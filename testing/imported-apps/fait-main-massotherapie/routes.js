const S = require('./lib/settings');
const T = require('./lib/i18n');
const getModules = require('./lib/modules');
const A = require('./lib/admin');
const O = require('./lib/orders');
const makePayPal = require('./lib/paypal');

/** Treatment pages: which families each one shows, and in what order. */
const FAMILY_PAGES = {
  massotherapie: { families: ['massotherapie'], banner: '_p_banner_massotherapie_url', intro: 'reservation_intro' },
  esthetique: { families: ['esthetique', 'epilation'], banner: '_p_banner_esthetique_url', intro: 'esthetique_intro' },
  ongles: { families: ['ongles'], banner: '_p_banner_ongles_url', intro: 'ongles_intro' },
  corps: { families: ['corps'], banner: '_p_banner_corps_url', intro: 'corps_intro' },
};

/** Old site paths kept alive so nothing that is linked or indexed breaks. */
const REDIRECTS = [
  ['/soins-massotherapie', '/massotherapie/'],
  ['/pricing-plans/list', '/forfaits/'],
  ['/pricing-plans', '/forfaits/'],
  ['/copie-de-ongles', '/ongles/'],
  ['/locationdesalle', '/location-de-salle/'],
  ['/book-online', '/reservation/'],
  ['/a-propos', '/a-propos/'],
  ['/contact', '/contact/'],
  ['/esthetique', '/esthetique/'],
  ['/soins-corps', '/soins-corps/'],
  ['/blog', '/blog/'],
  ['/boutique', '/boutique/'],
  ['/massotherapie', '/massotherapie/'],
  ['/ongles', '/ongles/'],
  ['/forfaits', '/forfaits/'],
  ['/reservation', '/reservation/'],
  ['/panier', '/panier/'],
  ['/location-de-salle', '/location-de-salle/'],
  ['/confidentialite', '/confidentialite/'],
  ['/mes-commandes', '/mes-commandes/'],
];

/**
 * The platform gives every request a `tenantPath()` that is correct on
 * custom domains as well as under /pwa/<slug>. Fall back to the mount path
 * when it is absent (sandbox harnesses, isolated tests) so a missing helper
 * can never take the whole site down.
 */
function tenantPath(req, target) {
  if (typeof req.tenantPath === 'function') return req.tenantPath(target);
  return String(req.baseUrl || '').replace(/\/$/, '') + target;
}

module.exports = function (services) {
  const express = require('express');
  // Strict routing on purpose: every page lives at its trailing-slash URL and
  // the bare form 301s to it. Without `strict`, Express matches both forms on
  // the redirect route and the canonical URL redirects to itself forever.
  const router = express.Router({ strict: true });
  const store = S(services);
  const paypal = makePayPal(services);

  router.use(express.json({ limit: '7mb' }));
  router.use(express.urlencoded({ extended: false, limit: '30kb' }));

  function fail(req, res, e) {
    const code = e.code === '23P01' ? 'overlap' : e.code === '23505' ? 'conflict' : e.status ? e.code : 'server_error';
    const status = (e.code === '23P01' || e.code === '23505') ? 409 : (e.status || 500);
    const t = res.locals.t || T.fr;
    if (req.path.startsWith('/api/')) return res.status(status).json({ error: (t[code] || t.server_error) + (e.detail ? ' (' + e.detail + ')' : ''), code });
    return res.status(status).render('error', { page: 'error', errorText: t[code] || t.server_error });
  }
  const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { fail(req, res, e); } };

  // --- Request context ----------------------------------------------------
  router.use(wrap(async (req, res, next) => {
    const q = req.query.lang;
    const lang = (q === 'en' || q === 'fr') ? q
      : req.path.startsWith('/en') ? 'en'
        : (req.cookies && req.cookies.pwa_lang === 'en') ? 'en' : 'fr';
    if (q === 'en' || q === 'fr') {
      res.cookie('pwa_lang', lang, { maxAge: 365 * 86400000, path: tenantPath(req, '/'), sameSite: 'lax', secure: true });
    }
    req.lang = lang;
    res.locals.lang = lang;
    res.locals.page = 'home';
    res.locals.user = null;
    res.locals.tenantRoot = tenantPath(req, '/');
    res.locals.urls = S.urls(lang);
    res.locals.langLinks = { fr: '.?lang=fr', en: 'en/?lang=en' };
    res.locals.safeJSON = S.safeJSON;
    res.locals.money = (v) => S.money(v, lang);
    res.locals.formatDate = (v) => S.date(v, lang);
    res.locals.formatDateTime = (v) => S.dateTime(v, lang);
    res.locals.field = (row, key) => (lang === 'en' && row && row[key + '_en'] ? row[key + '_en'] : (row && row[key]) || '');
    res.locals.listField = (row, key) => {
      const raw = lang === 'en' && row && row[key + '_en'] ? row[key + '_en'] : (row && row[key]) || '';
      try { const x = JSON.parse(raw); return Array.isArray(x) ? x : []; } catch (e) { return String(raw || '').split('\n').filter(Boolean); }
    };
    // Views run inside EJS's `with (locals)`, where a global such as String or
    // JSON can be shadowed by a same-named local. Every helper a template needs
    // is therefore handed to it explicitly instead of being reached globally.
    res.locals.lines = (value) => String(value == null ? '' : value).split('\n').map((x) => x.trim()).filter(Boolean);
    res.locals.currentYear = new Date().getFullYear();
    res.locals.jsonField = (value, key) => {
      if (value == null) return '';
      try { const parsed = JSON.parse(value); return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? (parsed[key] || '') : ''; } catch (e) { return key === 'fr' ? String(value) : ''; }
    };
    req.isPreview = !!(services.config.isPreview || services.config.preview || req.query.preview === '1');
    try { res.locals.isOwner = !!services.admin.isAdmin(req); } catch (e) { res.locals.isOwner = false; }

    const raw = await store.load();
    req.site = raw;
    res.locals.settings = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, S.localized(v, lang)]));
    res.locals.t = S.translate(raw, lang);
    res.locals.flags = {
      contact: S.flag(raw, 'contact_verified'),
      address: S.flag(raw, 'address_verified'),
      hours: S.flag(raw, 'hours_verified'),
      booking: S.flag(raw, 'booking_url_verified'),
      privacy: S.flag(raw, 'privacy_approved'),
      messages: S.flag(raw, 'messages_enabled') && S.flag(raw, 'privacy_approved') && S.both(raw.privacy_notice),
      payments: paypal.enabled(raw, req.isPreview),
      shipping: O.shippingOffered(raw),
      operations: S.flag(raw, 'live_actions_enabled'),
    };
    res.locals.bookingUrl = String(raw.booking_url || '').trim();
    res.locals.phoneHref = 'tel:' + String(raw.contact_phone || '').replace(/[^+\d]/g, '');
    res.locals.emailHref = 'mailto:' + String(raw.contact_email || '').replace(/[\r\n]/g, '');
    res.locals.directionsHref = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(raw.business_address || '');
    res.locals.freeShippingThreshold = S.num(raw, 'free_shipping_threshold_cents', 0);
    res.locals.hours = await services.db.all('SELECT * FROM hours ORDER BY weekday');
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin') || req.path.includes('commande') || req.path.includes('order') || req.path.includes('panier') || req.path.includes('cart')) {
      res.set('Cache-Control', 'private, no-store');
    }
    next();
  }));

  router.use(wrap(async (req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await services.db.run('INSERT INTO site_visits(path) VALUES($1)', [req.path]); } catch (e) {}
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
  router.get('/product-page/:slug', (req, res) => res.redirect(301, tenantPath(req, '/boutique/produit/' + encodeURIComponent(req.params.slug))));

  function languageLinks(req, res, key, param) {
    const query = new URLSearchParams();
    for (const k of ['q', 'collection', 'page']) if (req.query[k]) query.set(k, String(req.query[k]));
    const links = {};
    for (const lang of ['fr', 'en']) {
      query.set('lang', lang);
      const u = S.urls(lang);
      const base = param ? (u[key] || '') + param : (u[key] || u.home);
      links[lang] = base + '?' + query.toString();
    }
    res.locals.langLinks = links;
  }

  /** Register one page in both languages. */
  function page(paths, key, view, load) {
    router.get(paths, services.auth.optionalAuth, wrap(async (req, res) => {
      res.locals.user = req.user || null;
      res.locals.page = key;
      languageLinks(req, res, key, req.params.slug || req.params.id);
      const extra = load ? await load(req, res) : {};
      res.render(view, Object.assign({ page: key }, extra));
    }));
  }

  const published = 'published=1';

  // --- Home ---------------------------------------------------------------
  page(['/', '/en/'], 'home', 'index', async () => ({
    featured: await services.db.all(`SELECT * FROM services WHERE ${published} AND featured=1 ORDER BY sort_order,id LIMIT 4`),
    products: await services.db.all(`SELECT * FROM products WHERE ${published} AND featured=1 ORDER BY sort_order,id LIMIT 4`),
    packages: await services.db.all(`SELECT * FROM packages WHERE ${published} ORDER BY popular DESC,sort_order,id LIMIT 3`),
    posts: await services.db.all(`SELECT * FROM posts WHERE ${published} ORDER BY published_on DESC NULLS LAST,id DESC LIMIT 3`),
  }));

  // --- Treatment family pages --------------------------------------------
  function famillePage(routes, key) {
    const spec = FAMILY_PAGES[key];
    page(routes, key, 'famille', async (req) => {
      const groups = [];
      for (const family of spec.families) {
        const items = await services.db.all(`SELECT * FROM services WHERE ${published} AND family=$1 ORDER BY sort_order,id`, [family]);
        if (items.length) groups.push({ family, items });
      }
      return { groups, bannerKey: spec.banner, introKey: spec.intro };
    });
  }
  famillePage(['/massotherapie/', '/en/massage-therapy/'], 'massotherapie');
  famillePage(['/esthetique/', '/en/skin-care/'], 'esthetique');
  famillePage(['/ongles/', '/en/nail-care/'], 'ongles');
  famillePage(['/soins-corps/', '/en/body-treatments/'], 'corps');

  page(['/forfaits/', '/en/packages/'], 'forfaits', 'forfaits', async () => ({
    packages: await services.db.all(`SELECT * FROM packages WHERE ${published} ORDER BY popular DESC,sort_order,id`),
    combos: await services.db.all(`SELECT * FROM services WHERE ${published} AND family='forfait' ORDER BY sort_order,id`),
  }));

  // --- Shop ---------------------------------------------------------------
  page(['/boutique/', '/en/shop/'], 'boutique', 'boutique', async (req) => {
    const collections = getModules(req.lang).COLLECTIONS;
    const collection = collections.includes(req.query.collection) ? req.query.collection : '';
    const q = String(req.query.q || '').slice(0, 100);
    const params = ['%' + q + '%', collection];
    const where = `${published} AND (name ILIKE $1 OR name_en ILIKE $1 OR description ILIKE $1 OR description_en ILIKE $1) AND ($2='' OR collection=$2)`;
    return {
      items: await services.db.all(`SELECT * FROM products WHERE ${where} ORDER BY featured DESC,sort_order,id`, params),
      featured: collection || q ? [] : await services.db.all(`SELECT * FROM products WHERE ${published} AND featured=1 ORDER BY sort_order,id LIMIT 4`),
      collections, collection, q,
    };
  });

  page(['/boutique/produit/:slug', '/en/shop/product/:slug'], 'product', 'produit', async (req) => {
    const item = await services.db.get(`SELECT * FROM products WHERE slug=$1 AND ${published}`, [String(req.params.slug || '').slice(0, 80)]);
    if (!item) throw S.error('not_found', 404);
    let options = [];
    try { options = item.variants ? JSON.parse(item.variants) : []; } catch (e) { options = []; }
    return {
      item,
      options: Array.isArray(options) ? options : [],
      related: await services.db.all(`SELECT * FROM products WHERE ${published} AND collection=$1 AND id<>$2 ORDER BY featured DESC,sort_order,id LIMIT 4`, [item.collection || '', item.id]),
    };
  });

  page(['/panier/', '/en/cart/'], 'cart', 'panier');

  page(['/mes-commandes/', '/en/my-orders/'], 'orders', 'mes-commandes');

  page(['/commande/:id', '/en/order/:id'], 'order', 'commande', async (req) => {
    if (!/^\d+$/.test(req.params.id)) throw S.error('not_found', 404);
    return { orderId: Number(req.params.id) };
  });

  // --- Editorial & info pages --------------------------------------------
  page(['/location-de-salle/', '/en/room-rental/'], 'location', 'location');
  page(['/a-propos/', '/en/about/'], 'about', 'about');
  page(['/contact/', '/en/contact/'], 'contact', 'contact');
  page(['/confidentialite/', '/en/privacy/'], 'privacy', 'privacy');
  page(['/reservation/', '/en/booking/'], 'reservation', 'reservation', async () => ({
    groups: await (async () => {
      const out = [];
      for (const family of S.FAMILIES) {
        const items = await services.db.all(`SELECT * FROM services WHERE ${published} AND family=$1 ORDER BY sort_order,id`, [family]);
        if (items.length) out.push({ family, items });
      }
      return out;
    })(),
  }));

  page(['/blog/', '/en/journal/'], 'blog', 'blog', async () => ({
    posts: await services.db.all(`SELECT * FROM posts WHERE ${published} ORDER BY published_on DESC NULLS LAST,id DESC`),
  }));
  page(['/blog/:slug', '/en/journal/:slug'], 'article', 'article', async (req) => {
    const post = await services.db.get(`SELECT * FROM posts WHERE slug=$1 AND ${published}`, [String(req.params.slug || '').slice(0, 80)]);
    if (!post) throw S.error('not_found', 404);
    return {
      post,
      more: await services.db.all(`SELECT * FROM posts WHERE ${published} AND id<>$1 ORDER BY published_on DESC NULLS LAST,id DESC LIMIT 2`, [post.id]),
    };
  });

  // --- Public APIs --------------------------------------------------------
  router.post('/api/messages', wrap(async (req, res) => {
    const raw = req.site;
    if (!res.locals.flags.messages) throw S.error('operation_disabled', 409);
    if (req.body.consent !== true) throw S.error('required');
    const firstName = String(req.body.firstName || '').trim().slice(0, 80);
    const lastName = String(req.body.lastName || '').trim().slice(0, 80);
    const email = String(req.body.email || '').trim().slice(0, 190);
    const phone = String(req.body.phone || '').trim().slice(0, 40);
    const subject = String(req.body.subject || '').trim().slice(0, 160);
    const body = String(req.body.body || '').trim().slice(0, 4000);
    if (!firstName || !body) throw S.error('required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw S.error('invalid');
    if (phone && !/^[+()\d .-]{7,40}$/.test(phone)) throw S.error('invalid');
    const row = await services.db.get(
      'INSERT INTO messages(first_name,last_name,email,phone,subject,body,consent,privacy_snapshot) VALUES($1,$2,$3,$4,$5,$6,1,$7) RETURNING id',
      [firstName, lastName, email, phone, subject, body, raw.privacy_notice || ''],
    );
    try {
      if (S.flag(raw, 'live_actions_enabled') && services.config.contactEmail) {
        await services.email.send({
          to: services.config.contactEmail,
          replyTo: email,
          subject: `Message du site — ${firstName} ${lastName}`.trim(),
          text: `${firstName} ${lastName}\n${email}\n${phone || ''}\n\nSujet : ${subject || '—'}\n\n${body}`,
        });
        await services.db.run("UPDATE messages SET email_state='sent' WHERE id=$1", [row.id]);
      }
    } catch (e) {
      try { await services.db.run("UPDATE messages SET email_state='failed' WHERE id=$1", [row.id]); } catch (ignored) {}
    }
    res.status(201).json({ message: res.locals.t.sent });
  }));

  // Price a basket without creating anything — the cart page uses this so the
  // totals a visitor sees are always the server's, never the browser's.
  router.post('/api/cart/quote', wrap(async (req, res) => {
    const fulfilment = req.body.fulfilment === 'shipping' ? 'shipping' : 'pickup';
    const quote = await O.price(services, req.site, req.body.cart, fulfilment);
    res.json({ quote, shippingOffered: O.shippingOffered(req.site) });
  }));

  router.get('/api/orders', services.auth.requireAuth, wrap(async (req, res) => {
    const current = Math.max(1, parseInt(req.query.page, 10) || 1);
    const total = Number((await services.db.get('SELECT COUNT(*) AS n FROM orders WHERE user_id=$1', [String(req.user.id)])).n);
    const rows = await services.db.all('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10 OFFSET $2', [String(req.user.id), (current - 1) * 10]);
    const out = [];
    for (const row of rows) out.push(O.publicRow(row, req.lang, await O.items(services.db, row.id)));
    res.json({ orders: out, total, page: current, pages: Math.max(1, Math.ceil(total / 10)) });
  }));

  router.post('/api/orders', services.auth.requireAuth, wrap(async (req, res) => {
    const row = await O.create(services, req, req.site);
    res.status(201).json({ order: O.publicRow(row, req.lang, await O.items(services.db, row.id)), message: res.locals.t.order_placed });
  }));

  async function own(req) {
    if (!/^\d+$/.test(req.params.id)) throw S.error('not_found', 404);
    const row = await services.db.get('SELECT * FROM orders WHERE id=$1 AND user_id=$2', [Number(req.params.id), String(req.user.id)]);
    if (!row) throw S.error('not_found', 404);
    return row;
  }

  router.get('/api/orders/:id', services.auth.requireAuth, wrap(async (req, res) => {
    const row = await own(req);
    res.json({
      order: O.publicRow(row, req.lang, await O.items(services.db, row.id)),
      paypal: paypal.publicConfig(row, req.site, req.isPreview),
      terms: S.localized(req.site.payment_terms, req.lang),
    });
  }));

  router.post('/api/orders/:id/paypal/order', services.auth.requireAuth, wrap(async (req, res) => res.json(await paypal.create(await own(req), req.site, req.isPreview, req.body))));
  router.post('/api/orders/:id/paypal/capture', services.auth.requireAuth, wrap(async (req, res) => {
    const row = await paypal.capture(await own(req), req.site, req.isPreview, req.body);
    res.json({ order: O.publicRow(row, req.lang, await O.items(services.db, row.id)) });
  }));
  router.post('/api/orders/:id/paypal/sync', services.auth.requireAuth, wrap(async (req, res) => {
    if (!paypal.enabled(req.site, req.isPreview)) throw S.error('pay_unavailable', 503);
    const row = await own(req);
    if (row.checked_at && Date.now() - new Date(row.checked_at).getTime() < 8000) throw S.error('rate_limit', 429);
    const synced = await paypal.sync(row);
    res.json({ order: O.publicRow(synced, req.lang, await O.items(services.db, synced.id)) });
  }));

  // --- Admin --------------------------------------------------------------
  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: res.locals.t.forbidden });
    next();
  }
  router.use('/api/admin', requireAdmin);

  router.get('/api/admin/modules', (req, res) => res.json(getModules(req.lang)));
  router.get('/api/admin/stats', wrap(async (req, res) => res.json(await A.stats(services, getModules(req.lang).modules))));
  router.get('/api/admin/settings', wrap(async (req, res) => res.json({ settings: await store.load() })));

  router.put('/api/admin/settings', wrap(async (req, res) => {
    const key = String(req.body.key || '');
    const value = String(req.body.value == null ? '' : req.body.value);
    if (!/^[a-zA-Z0-9_:-]{1,100}$/.test(key) || key.startsWith('_seed') || value.length > 20000) throw S.error('invalid');
    if (key.endsWith('_url') && !A.imageOK(value)) throw S.error('invalid');
    const booleans = getModules(req.lang).settingsFields.map((x) => x.name);
    if (booleans.includes(key) && !['0', '1'].includes(value)) throw S.error('invalid');
    if (key === 'privacy_approved' && value === '1' && !S.both(req.site.privacy_notice)) throw S.error('required');
    if (key === 'payment_terms_approved' && value === '1' && !S.both(req.site.payment_terms)) throw S.error('required');
    if (key === 'payments_enabled' && value === '1' && !paypal.ready()) throw S.error('paypal_setup', 503);
    if (key === 'shipping_enabled' && value === '1' && !(Number(req.site.shipping_flat_cents) >= 0)) throw S.error('required');
    if (key === 'contact_email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw S.error('invalid');
    if (key === 'contact_phone' && value && !/^[+()\d .-]{7,40}$/.test(value)) throw S.error('invalid');
    if (key === 'booking_url' && value && !/^https:\/\//.test(value)) throw S.error('invalid');
    if (['gst_rate_bp', 'qst_rate_bp', 'shipping_flat_cents', 'free_shipping_threshold_cents'].includes(key) && value !== '') {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 0 || n > 1000000) throw S.error('invalid');
    }
    await services.db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()', [key, value]);
    res.json({ success: true });
  }));

  router.post('/api/admin/upload', wrap(async (req, res) => {
    if (req.isPreview || !S.flag(req.site, 'live_actions_enabled')) throw S.error('operation_disabled', 409);
    const image = String(req.body.image || '');
    if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > 6000000) throw S.error('invalid');
    if (!services.cloudinary || !services.cloudinary.uploader || typeof services.cloudinary.uploader.upload !== 'function') throw S.error('image_error', 503);
    try {
      const result = await services.cloudinary.uploader.upload(image, { folder: services.config.slug + '/content', resource_type: 'image' });
      res.json({ imageUrl: result.secure_url });
    } catch (e) { throw S.error('image_error', 502); }
  }));

  router.post('/api/admin/generate-image', wrap(async (req, res) => {
    if (req.isPreview || !S.flag(req.site, 'live_actions_enabled')) throw S.error('operation_disabled', 409);
    const prompt = String(req.body.prompt || '').trim();
    if (prompt.length < 12 || prompt.length > 1800) throw S.error('invalid');
    try {
      const imageUrl = await services.ai.generateImage(
        prompt + ' No text overlays. Clearly illustrative, not a documentary photograph of this business or of a real product for sale.',
        { aspectRatio: ['1:1', '4:3', '16:9', '4:5'].includes(req.body.aspectRatio) ? req.body.aspectRatio : '1:1' },
      );
      res.json({ imageUrl });
    } catch (e) { throw S.error('image_error', 502); }
  }));

  router.post('/api/admin/orders/:id/reconcile', wrap(async (req, res) => {
    if (!paypal.enabled(req.site, req.isPreview)) throw S.error('pay_unavailable', 503);
    const row = await services.db.get('SELECT * FROM orders WHERE id=$1', [Number(req.params.id)]);
    if (!row) throw S.error('not_found', 404);
    res.json({ order: await paypal.sync(row) });
  }));

  router.get('/api/admin/orders/:id/items', wrap(async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) throw S.error('invalid');
    res.json({ items: await O.items(services.db, Number(req.params.id)) });
  }));

  for (const base of getModules('fr').modules) {
    const key = base.key;
    router.get('/api/admin/' + key, wrap(async (req, res) => res.json({ [key]: await services.db.all('SELECT * FROM ' + key + ' ORDER BY id DESC') })));
    router.post('/api/admin/' + key, wrap(async (req, res) => {
      if (key === 'orders') throw S.error('forbidden', 403);
      const m = getModules(req.lang).modules.find((x) => x.key === key);
      res.status(201).json({ [m.singular]: await A.save(services.db, m, req.body, null) });
    }));
    router.put('/api/admin/' + key + '/:id', wrap(async (req, res) => {
      if (!/^\d+$/.test(req.params.id)) throw S.error('invalid');
      const m = getModules(req.lang).modules.find((x) => x.key === key);
      res.json({ [m.singular]: await A.save(services.db, m, req.body, Number(req.params.id)) });
    }));
    router.delete('/api/admin/' + key + '/:id', wrap(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) throw S.error('invalid');
      let row;
      if (key === 'orders') {
        const existing = await services.db.get('SELECT * FROM orders WHERE id=$1', [id]);
        if (existing && existing.order_key) throw S.error('billing_locked', 409);
        row = await services.db.get('DELETE FROM orders WHERE id=$1 AND order_key IS NULL RETURNING id', [id]);
      } else {
        row = await services.db.get('DELETE FROM ' + key + ' WHERE id=$1 RETURNING id', [id]);
      }
      if (!row) throw S.error('not_found', 404);
      res.json({ success: true });
    }));
  }

  const adminUser = () => ({ name: services.config.ownerName || 'Annie' });

  router.get('/admin', wrap(async (req, res) => {
    if (!services.admin.isAdmin(req)) return res.redirect(tenantPath(req, '/admin/login'));
    const modules = getModules(req.lang).modules;
    res.locals.page = 'admin';
    res.render('admin', {
      page: 'admin', modules,
      stats: await A.stats(services, modules),
      recentOrders: await services.db.all('SELECT * FROM orders ORDER BY created_at DESC LIMIT 6'),
      recentMessages: await services.db.all('SELECT * FROM messages ORDER BY created_at DESC LIMIT 5'),
      emailConfigured: !!services.config.contactEmail,
      paypalConfigured: paypal.ready(),
      adminUser: adminUser(),
    });
  }));

  router.get('/admin/settings', wrap(async (req, res) => {
    if (!services.admin.isAdmin(req)) return res.redirect(tenantPath(req, '/admin/login'));
    res.locals.page = 'admin';
    res.render('admin-settings', {
      page: 'admin',
      modules: getModules(req.lang).modules,
      settingsFields: getModules(req.lang).settingsFields,
      rawSettings: req.site,
      paypalConfigured: paypal.ready(),
      adminUser: adminUser(),
    });
  }));

  for (const m of getModules('fr').modules) {
    router.get('/admin/' + m.key, wrap(async (req, res) => {
      if (!services.admin.isAdmin(req)) return res.redirect(tenantPath(req, '/admin/login'));
      res.locals.page = 'admin';
      const current = getModules(req.lang).modules.find((x) => x.key === m.key);
      res.render('admin-module', {
        page: 'admin',
        items: await services.db.all('SELECT * FROM ' + m.key + ' ORDER BY id DESC'),
        modules: getModules(req.lang).modules,
        module: current,
        fieldsJson: encodeURIComponent(JSON.stringify(current.fields)),
        adminUser: adminUser(),
      });
    }));
  }

  router.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: res.locals.t.not_found });
    res.status(404).render('error', { page: 'error', errorText: res.locals.t.not_found });
  });
  router.use((err, req, res, next) => fail(req, res, err));

  return router;
};
