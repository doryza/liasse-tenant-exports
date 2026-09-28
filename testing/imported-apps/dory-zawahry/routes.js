const T = require('./lib/i18n');
const Settings = require('./lib/settings');
const themes = require('./lib/themes');
const vcard = require('./lib/vcard');

/**
 * The platform gives every request a tenantPath() that is right on custom
 * domains and under /pwa/<slug>. Fall back to the mount path when it is absent
 * (sandbox harnesses) so a missing helper can never take the card down.
 */
function tenantPath(req, target) {
  if (typeof req.tenantPath === 'function') return req.tenantPath(target);
  return String(req.baseUrl || '').replace(/\/$/, '') + target;
}

const BOT = /bot|crawl|spider|preview|facebookexternalhit|slackbot|whatsapp|telegram|discord|linkedin|twitter|skype|headless/i;

module.exports = function (services) {
  const express = require('express');
  // Strict routing: /en/ is canonical and /en 301s to it without looping.
  const router = express.Router({ strict: true });
  const store = Settings(services);
  const photoCache = new Map();

  router.use(express.json({ limit: '8mb' }));

  function fail(req, res, e) {
    const code = e.code && T.fr[e.code] ? e.code : 'server_error';
    const status = e.status || 500;
    if (status >= 500) console.error('[card] ', e.message);
    const t = res.locals.t || T.fr;
    if (req.path.startsWith('/api/')) return res.status(status).json({ error: t[code] || t.server_error, code });
    return res.status(status).render('error', { errorText: t[code] || t.server_error });
  }
  const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { fail(req, res, e); } };

  // --- Request context ----------------------------------------------------
  router.use(wrap(async (req, res, next) => {
    const q = req.query.lang;
    const lang = (q === 'en' || q === 'fr') ? q
      : /^\/en(\/|$)/.test(req.path) ? 'en'
        : (req.cookies && req.cookies.pwa_lang === 'en') ? 'en' : 'fr';
    if (q === 'en' || q === 'fr') res.cookie('pwa_lang', lang, { maxAge: 365 * 86400000, path: tenantPath(req, '/'), sameSite: 'lax', secure: true });
    req.lang = lang;
    const settings = await store.load();
    req.card = settings;
    const theme = themes.resolve(settings);
    Object.assign(res.locals, {
      lang, t: T[lang], tenantRoot: tenantPath(req, '/'), settings, theme, themeVars: themes.cssVars(theme),
      local: (key) => (lang === 'en' ? (settings[key + '_en'] || settings[key + '_fr']) : (settings[key + '_fr'] || settings[key + '_en'])) || '',
      localKey: (key) => key + '_' + lang,
      initials: Settings.initials(settings.full_name),
      lines: (value) => (value == null ? '' : '' + value).split('\n').map((x) => x.trim()).filter(Boolean),
      currentYear: new Date().getFullYear(),
      otherLangHref: lang === 'en' ? '.?lang=fr' : 'en/?lang=en',
    });
    try { res.locals.isOwner = !!services.admin.isAdmin(req); } catch (e) { res.locals.isOwner = false; }
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin')) res.set('Cache-Control', 'private, no-store');
    next();
  }));

  // --- The card -----------------------------------------------------------
  async function renderCard(req, res) {
    const links = (await store.links()).map((l) => ({ ...l, label: Settings.linkLabel(l, req.lang) }));
    const s = req.card;
    const phoneHref = s.phone ? 'tel:' + s.phone.replace(/[^+\d]/g, '') : '';
    const smsHref = s.phone && s.show_text === '1' ? 'sms:' + s.phone.replace(/[^+\d]/g, '') : '';
    const visitor = !res.locals.isOwner && req.query._embed !== '1' && !BOT.test(req.get('user-agent') || '');
    if (visitor) { try { await services.db.run("INSERT INTO card_events(kind) VALUES('view')"); } catch (e) { /* stats only */ } }
    res.render('card', {
      links, phoneHref, smsHref,
      emailHref: s.email ? 'mailto:' + s.email.replace(/[\r\n]/g, '') : '',
      vcardHref: req.lang === 'en' ? 'contact.vcf?lang=en' : 'contact.vcf',
      canonical: req.lang === 'en' ? 'en/' : '.',
    });
  }
  router.get('/', wrap(renderCard));
  router.get('/en/', wrap(renderCard));
  router.get('/en', (req, res) => res.redirect(301, tenantPath(req, '/en/')));

  /** The owner's photo, embedded so the contact shows it on the phone. Never blocks the card. */
  async function photoFor(url) {
    if (!url) return null;
    if (photoCache.has(url)) return photoCache.get(url);
    let src = url;
    if (/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)) src = url.replace('/image/upload/', '/image/upload/c_fill,g_face,w_400,h_400,q_80,f_jpg/');
    let photo = null;
    try {
      const response = await fetch(src, { signal: AbortSignal.timeout(4000) });
      const type = String(response.headers.get('content-type') || '');
      if (response.ok && /image\/(jpeg|png)/.test(type)) {
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length <= 200000) photo = { type: type.includes('png') ? 'PNG' : 'JPEG', base64: buffer.toString('base64') };
      }
    } catch (e) { photo = null; }
    if (photoCache.size > 20) photoCache.clear();
    photoCache.set(url, photo);
    return photo;
  }

  router.get('/contact.vcf', wrap(async (req, res) => {
    const s = req.card;
    const body = vcard.build({
      settings: s, links: await store.links(), lang: req.lang,
      pageUrl: `${req.protocol}://${req.get('host')}${tenantPath(req, req.lang === 'en' ? '/en/' : '/')}`,
      photo: await photoFor(s.photo_url),
    });
    if (!res.locals.isOwner) { try { await services.db.run("INSERT INTO card_events(kind) VALUES('download')"); } catch (e) { /* stats only */ } }
    res.set('Content-Type', 'text/vcard; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${vcard.filename(s)}"`);
    res.set('Cache-Control', 'no-cache');
    res.send(body);
  }));

  // --- Owner console ------------------------------------------------------
  router.get('/admin', wrap(async (req, res) => {
    if (!res.locals.isOwner) return res.redirect(tenantPath(req, '/admin/login'));
    res.render('admin', {
      links: await store.links(), stats: await stats(),
      previewHref: (req.lang === 'en' ? 'en/' : '.') + '?_embed=1',
      themeList: Object.entries(themes.THEMES).map(([key, x]) => ({ key, name: x.name[req.lang], bg: x.bg, ink: x.ink, accent: x.accent, surface: x.surface })),
      linkKinds: Settings.LINK_KINDS.map((k) => ({ key: k, label: Settings.linkLabel({ kind: k }, req.lang) })),
    });
  }));
  router.get('/admin/', (req, res) => res.redirect(301, tenantPath(req, '/admin')));

  router.use('/api/admin', (req, res, next) => {
    if (!res.locals.isOwner) return res.status(403).json({ error: res.locals.t.forbidden, code: 'forbidden' });
    next();
  });

  async function stats() {
    const row = await services.db.get(`SELECT
      COUNT(*) FILTER (WHERE kind='view' AND created_at > NOW() - INTERVAL '7 days') AS views7,
      COUNT(*) FILTER (WHERE kind='view' AND created_at > NOW() - INTERVAL '30 days') AS views30,
      COUNT(*) FILTER (WHERE kind='download' AND created_at > NOW() - INTERVAL '7 days') AS downloads7,
      COUNT(*) FILTER (WHERE kind='download' AND created_at > NOW() - INTERVAL '30 days') AS downloads30
      FROM card_events`);
    return Object.fromEntries(Object.entries(row || {}).map(([k, v]) => [k, Number(v) || 0]));
  }

  router.get('/api/admin/card', wrap(async (req, res) => {
    res.json({ settings: await store.load(), links: await store.links(), stats: await stats() });
  }));

  router.put('/api/admin/settings', wrap(async (req, res) => {
    const saved = await store.save(req.body && req.body.values);
    res.json({ success: true, saved });
  }));

  router.put('/api/admin/links', wrap(async (req, res) => {
    res.json({ success: true, links: await store.replaceLinks(req.body && req.body.links) });
  }));

  router.post('/api/admin/photo', wrap(async (req, res) => {
    const image = String((req.body && req.body.image) || '');
    if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > 7000000) throw Settings.error('invalid');
    const uploader = services.cloudinary && services.cloudinary.uploader;
    if (!uploader || typeof uploader.upload !== 'function') throw Settings.error('image_error', 503);
    let url;
    try {
      const result = await uploader.upload(image, { folder: (services.config.slug || 'card') + '/profile', resource_type: 'image' });
      url = result.secure_url;
    } catch (e) { throw Settings.error('image_error', 502); }
    await store.save({ photo_url: url });
    res.json({ success: true, photo_url: url });
  }));

  router.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: res.locals.t.not_found, code: 'not_found' });
    res.status(404).render('error', { errorText: res.locals.t.not_found });
  });

  return router;
};
