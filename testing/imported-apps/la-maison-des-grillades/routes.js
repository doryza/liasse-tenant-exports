// La Maison Des Grillades — Brossard. Two public pages (/ and /menu) plus a small
// owner admin (/admin). The menu is the restaurant's live command.restaurant
// menu (lib/menu.js); every « Commander » button opens its ordering page.

const T = require('./lib/i18n');
const menuFeed = require('./lib/menu');

module.exports = function (services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;
  const httpFetch = services.fetch || (typeof fetch === 'function' ? fetch : null);

  // Owner-editable settings (admin → Informations). Anything else is refused.
  const SETTING_KEYS = [
    'contact_phone', 'business_address', 'maps_url', 'order_url',
    'hours_fr', 'hours_en', 'rating_enabled', 'rating_value', 'rating_count',
  ];

  function tenantPath(req, target) {
    if (typeof req.tenantPath === 'function') return req.tenantPath(target);
    return String(req.baseUrl || '').replace(/\/$/, '') + target;
  }

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings', []);
      const o = {};
      (rows || []).forEach((r) => { o[r.key] = r.value; });
      return o;
    } catch (e) { return {}; }
  }

  function formatPrice(p, lang) {
    const n = Number(p) || 0;
    return lang === 'en' ? '$' + n.toFixed(2) : n.toFixed(2).replace('.', ',') + ' $';
  }

  // The rating as the owner typed it (« 4.8 », « 1356 ») in the visitor's
  // language: 4,8 / 1 356 in French, 4.8 / 1,356 in English. Anything that
  // is not a plain number is shown as typed.
  function localNumber(raw, lang, integer) {
    const s = String(raw == null ? '' : raw).trim();
    const n = integer ? Number(s.replace(/[^0-9]/g, '')) : Number(s.replace(',', '.'));
    if (!s || !Number.isFinite(n) || (integer && !/^[\d\s\u00a0\u202f,.]+$/.test(s))) return s;
    return n.toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA', { maximumFractionDigits: 1 });
  }

  function lines(text) {
    return String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  }

  async function pageVars(req, page) {
    const settings = await getSettings();
    const lang = req.lang;
    const rel = req.path.replace(/^\//, '');
    const phone = settings.contact_phone || '';
    return {
      t: T[lang],
      lang,
      page,
      settings,
      langFr: (rel || '.') + '?lang=fr',
      langEn: (rel || '.') + '?lang=en',
      homeHref: '.?lang=' + lang,
      menuHref: 'menu?lang=' + lang,
      orderUrl: settings.order_url || menuFeed.ORDER_URL,
      phone,
      telHref: phone ? 'tel:+1' + phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '') : '',
      addressLines: lines(settings.business_address),
      mapsUrl: settings.maps_url || '',
      hoursLines: lines(lang === 'en' ? (settings.hours_en || settings.hours_fr) : settings.hours_fr),
      rating: settings.rating_enabled === '1' && settings.rating_value
        ? { value: localNumber(settings.rating_value, lang), count: localNumber(settings.rating_count, lang, true) } : null,
      logoUrl: settings._p_nav_logo_url || "https://media.liasse.tech/upload/v1792445252/business_logos/yxkzrrhc4dxd7tcme2rq.png",
      heroUrl: settings._p_hero_image_url || '',
      bowlUrl: settings._p_bowl_image_url || '',
      year: new Date().getFullYear(),
      price: (p) => formatPrice(p, lang),
      pick: (pair) => (pair ? (lang === 'en' ? pair.en : pair.fr) : ''),
      other: (pair) => (pair ? (lang === 'en' ? pair.fr : pair.en) : ''),
    };
  }

  function isAdmin(req) {
    try { return !!(services.admin && services.admin.isAdmin(req)); } catch (e) { return false; }
  }

  // Language: ?lang= switches and is remembered; French by default.
  router.use((req, res, next) => {
    let lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query.lang) {
      try { res.cookie('pwa_lang', lang, { maxAge: 365 * 24 * 3600 * 1000, sameSite: 'lax' }); } catch (e) { /* header already sent */ }
    }
    req.lang = lang;
    next();
  });

  // The linked CR account owns this gift; no settings or saved offer copy here.
  router.get('/api/welcome-gift', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
      const response = await httpFetch(menuFeed.ORDER_URL + '/welcome-gift.json', { signal: AbortSignal.timeout(9500), headers: { accept: 'application/json' } });
      if (!response.ok) return res.json({ gift: null });
      const data = await response.json();
      return res.json({ gift: data.gift || null });
    } catch (_) { return res.json({ gift: null }); }
  });

  router.get('/', async (req, res) => {
    try {
      const v = await pageVars(req, 'home');
      const menu = await menuFeed.getMenu(httpFetch);
      const allItems = menu.categories.flatMap(c => c.items);
      const favourites = [allItems.find(i => /COMBO GRILL 2/.test(i.sourceName)),
        allItems.find(i => /Poulet Grillé Entier/.test(i.sourceName)),
        allItems.find(i => /Fruits de Mer Bols/.test(i.sourceName)),
        allItems.find(i => /Calamars Frites/.test(i.sourceName))].filter(Boolean);
      res.render('index', Object.assign(v, { menu, favourites }));
    } catch (e) {
      console.error('[home]', e);
      res.status(500).send('Erreur serveur');
    }
  });

  router.get('/menu', async (req, res) => {
    try {
      const v = await pageVars(req, 'menu');
      const menu = await menuFeed.getMenu(httpFetch);
      res.render('menu', Object.assign(v, { menu }));
    } catch (e) {
      console.error('[menu]', e);
      res.status(500).send('Erreur serveur');
    }
  });

  // ── Owner admin ──────────────────────────────────────────────────────────
  // The platform serves /admin/login; this page and its API need the owner
  // session. No platform SDK here (it is stripped on /admin), so admin.js
  // writes with plain same-origin fetch.

  router.get('/admin', async (req, res) => {
    if (!isAdmin(req)) return res.redirect(tenantPath(req, '/admin/login'));
    try {
      const settings = await getSettings();
      const menu = await menuFeed.getMenu(httpFetch);
      res.render('admin', {
        settings,
        menuCount: menu.count,
        categoryCount: menu.categories.length,
        orderUrl: settings.order_url || menuFeed.ORDER_URL,
        siteHref: tenantPath(req, '/'),
      });
    } catch (e) {
      console.error('[admin]', e);
      res.status(500).send('Erreur serveur');
    }
  });

  router.get('/api/admin/settings', async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'forbidden' });
    const s = await getSettings();
    const out = {};
    SETTING_KEYS.forEach((k) => { out[k] = s[k] == null ? '' : s[k]; });
    res.json({ settings: out });
  });

  router.put('/api/admin/settings', async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'forbidden' });
    try {
      const body = (req.body && req.body.settings) || {};
      const keys = Object.keys(body).filter((k) => SETTING_KEYS.indexOf(k) !== -1);
      if (!keys.length) return res.status(400).json({ error: 'nothing_to_save' });
      for (const k of keys) {
        let value = body[k] == null ? '' : String(body[k]).slice(0, 2000);
        if (k === 'rating_enabled') value = value === '1' || value === 'true' ? '1' : '0';
        if ((k === 'order_url' || k === 'maps_url') && value && !/^https:\/\//i.test(value)) {
          return res.status(400).json({ error: 'bad_url', key: k });
        }
        await db.run(
          'INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
          [k, value]
        );
      }
      res.json({ success: true, saved: keys });
    } catch (e) {
      console.error('[admin settings]', e);
      res.status(500).json({ error: 'save_failed' });
    }
  });

  // Unknown pages go home; unknown API calls get JSON; other /admin paths
  // fall through to the platform (login, team, …).
  router.use((req, res, next) => {
    if (req.path.indexOf('/api/') === 0) return res.status(404).json({ error: 'not_found' });
    if (req.path === '/admin' || req.path.indexOf('/admin/') === 0) return next();
    if (req.method === 'GET') return res.redirect(tenantPath(req, '/'));
    return res.status(404).json({ error: 'not_found' });
  });

  return router;
};
