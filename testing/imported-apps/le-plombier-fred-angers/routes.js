'use strict';
/**
 * Plumbing website: public pages in the site's first language at the root (lib/region.js:
 * Québec = French, with English under /en/; outside Québec = English only), the estimate
 * request form, the customer's private document link, and the back office (lib/admin.js).
 *
 * Facts come from business.json with the owner's settings on top (lib/store.js).
 * Every URL is base-relative; the platform sets <base href> (custom domains included).
 * Views never call globals (String, JSON, Date…): every helper is a render local.
 */
const express = require('express');
const S = require('./lib/store');
const T = require('./lib/i18n');
const D = require('./lib/documents');
const theme = require('./lib/theme');
const cutaway = require('./lib/cutaway');
const makeMail = require('./lib/mail');
const registerAdmin = require('./lib/admin');

const region = require('./lib/region');

const R = S.R;
const FIRST = R.lang, SECOND = R.other; // SECOND = null on an English-only site
const LANGS = R.languages;
const PAGES = region.pages(FIRST);
const { serviceSlug } = region;
/** Express paths of a page in the site's languages: ['/estimation', '/en/estimate'] or ['/estimate']. */
const both = key => LANGS.map(l => '/' + PAGES[l][key]);
const pick = v => (LANGS.includes(v) ? v : FIRST);
const URGENCY = ['urgent', 'soon', 'planned'];
const PROPERTY = ['house', 'condo', 'plex', 'commercial'];

function tenantPath(req, target) {
 if (typeof req.tenantPath === 'function') return req.tenantPath(target);
 return String(req.baseUrl || '').replace(/\/$/, '') + target;
}
function absolute(req, target) {
 const host = req.get('host');
 return host ? `${req.protocol}://${host}${tenantPath(req, target)}` : tenantPath(req, target);
}
const fmt = (str, vars) => String(str == null ? '' : str).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

module.exports = function (services) {
 const router = express.Router();
 const db = services.db;
 const store = S(services);
 const docs = D(db, { invoicePrefix: FIRST === 'en' ? 'INV' : 'F' });
 const mail = makeMail(services);
 const limits = new Map();

 router.use(express.json({ limit: '64kb' }));

 const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
 /** State-changing calls come from our own pages only. */
 function sameOrigin(req, res, next) {
  let host = '';
  try { host = new URL(req.get('origin') || '').host; } catch (_) { /* no origin */ }
  if (host !== req.get('host') || req.get('x-requested-with') !== 'plumbing-site') return res.status(403).json({ error: 'origin', code: 'origin' });
  next();
 }
 router.use((req, res, next) => (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) ? sameOrigin(req, res, next) : next()));

 async function isOwner(req) { try { return !!(await services.admin.isAdmin(req)); } catch (_) { return false; } }

 // --- context for every page ------------------------------------------------------
 router.use(wrap(async (req, res, next) => {
  const isSecond = !!SECOND && (req.path === '/' + SECOND || req.path.startsWith('/' + SECOND + '/'));
  const q = LANGS.includes(req.query.lang) ? req.query.lang : null;
  const cookie = req.cookies && req.cookies.pwa_lang;
  const adminLang = q || pick(cookie);
  const lang = req.path.startsWith('/admin') ? adminLang : isSecond ? SECOND : FIRST;
  if (q && SECOND) res.cookie('pwa_lang', q, { maxAge: 365 * 86400000, path: tenantPath(req, '/'), sameSite: 'lax', secure: true });
  req.lang = lang;
  const raw = await store.raw();
  const b = S.business(raw);
  req.raw = raw; req.b = b;
  const t = { ...T[lang] };
  if (R.climate === 'mild') t.season = { ...t.season, ...t.seasonMild };
  if (R.province !== 'QC') t.property = { ...t.property, plex: t.propertyPlex };
  for (const key of Object.keys(t)) { const o = raw['text_' + key + '_' + lang]; if (typeof o === 'string' && o.trim()) t[key] = o; }
  const U = PAGES[lang];
  const now = S.local();
  const L = res.locals;
  Object.assign(L, {
   lang, t, b, raw, U, page: '', active: '', title: '', description: '', other: '', service: null,
   tenantRoot: tenantPath(req, '/'),
   fmt, text: v => (v && typeof v === 'object' ? v[lang] || v.fr || '' : v || ''),
   first: FIRST, bilingual: !!SECOND, otherHome: SECOND ? PAGES[lang === 'fr' ? 'en' : 'fr'].home : '', svcHref: s => PAGES[lang].service + serviceSlug(s, lang),
   money: c => D.money(c, lang), qtyf: n => D.qty(n, lang), longDate: d => S.longDate(d, lang), clock: x => S.clock(x, lang),
   fontsHref: b.design.fonts.href, family: b.design.family, heroLayout: b.design.hero,
   mark: (opts) => theme.mark(b.design, b.brand_name, opts),
   detail: zone => cutaway.render({ house: b.design.house, mirror: b.design.mirror, zone }),
   year: now.year, seasonKey: S.season(now.month), thisYear: now.year, weekday: now.weekday, invoicePrefix: FIRST === 'en' ? 'INV' : 'F',
   hoursSummary: S.hoursSummary(b.hours, lang), openState: S.openState(b.hours),
   isOwner: await isOwner(req), joinList: list => list.filter(Boolean).join(', '),
  });
  next();
 }));

 // Services that carry a numbered marker on the house: each takes its own first zone if it
 // is free, then a fallback zone; numbered in the order the services are listed.
 function spots(b, lang) {
  const used = new Map();
  for (const pass of [0, 1]) {
   for (const s of b.visible) {
    if ([...used.values()].includes(s.id)) continue;
    const zones = (s.zones || []).filter(z => cutaway.ZONES.includes(z));
    const zone = pass === 0 ? (zones[0] && !used.has(zones[0]) ? zones[0] : null) : zones.find(z => !used.has(z));
    if (zone) used.set(zone, s.id);
   }
  }
  const out = [];
  for (const s of b.visible) {
   const zone = [...used.entries()].find(([, id]) => id === s.id);
   if (zone) out.push({ zone: zone[0], n: out.length + 1, id: s.id, href: PAGES[lang].service + serviceSlug(s, lang), label: s.name[lang], state: s.state });
  }
  return out;
 }
 function page(name, active, extra = {}) {
  return (req, res) => {
   Object.assign(res.locals, { page: name, active: active || name }, typeof extra === 'function' ? extra(req, res) : extra);
   res.render(name);
  };
 }
 function other(lang, key, arg = '') { return SECOND ? PAGES[lang === 'fr' ? 'en' : 'fr'][key] + arg : ''; }

 // --- public pages -----------------------------------------------------------------
 router.get(SECOND ? ['/', '/' + SECOND, '/' + SECOND + '/'] : ['/'], (req, res) => {
  const { b, t, lang } = res.locals;
  const sp = spots(b, lang);
  const top = b.visible.slice(0, 4).map(s => s.name[lang]);
  const h1 = b.emergency ? t.h1Always : t.h1[(b.headline || 0) % t.h1.length];
  // The title sizes itself so its longest word fits the column (--hero-chars, styles.css); on
  // phones it is sized by the longest hyphen segment and a long town breaks at a hyphen.
  // Plain text only: the inline editor rewrites a heading that holds a single text node.
  const heading = fmt(h1, { city: b.city, brand: b.brand_name });
  const words = heading.split(/\s+/);
  Object.assign(res.locals, {
   page: 'home', active: 'home', other: other(lang, 'home'), spots: sp,
   h1: heading, heroChars: Math.max(8, ...words.map(w => w.length)),
   heroCharsM: Math.max(8, ...words.flatMap(w => w.split(/(?<=-)/)).map(w => w.length)),
   lead: top.length ? fmt(b.formLive ? t.lead : t.leadPhone, { list: top.slice(0, 3).map((n, i) => (i ? n.charAt(0).toLowerCase() + n.slice(1) : n)).join(', ') }) : t.leadOther,
   hero: cutaway.render({ house: b.design.house, mirror: b.design.mirror, spots: sp, title: t.cutawayAlt }),
   title: `${b.brand_name} · ${lang === 'en' ? 'Plumber in' : 'Plombier à'} ${b.city}`,
   description: fmt(lang === 'en' ? 'Plumber in {city}: {list}. Call {phone} or request an estimate online.' : 'Plombier à {city} : {list}. Appelez au {phone} ou demandez une estimation en ligne.', { city: b.city, list: top.join(', ').toLowerCase(), phone: b.phone }),
  });
  res.render('index');
 });
 router.get(both('services'), page('services', 'services', req => ({ other: other(req.lang, 'services'), title: `${T[req.lang].servicesTitle} · ${req.b.brand_name}` })));
 router.get(both('service').map(p => p + ':id'), (req, res, next) => {
  const { b, lang } = res.locals;
  const service = b.visible.find(s => s.id === req.params.id || serviceSlug(s, lang) === req.params.id);
  if (!service) return next();
  // One address per page: an English page reached by its French id moves to its English slug.
  if (req.params.id !== serviceSlug(service, lang)) return res.redirect(301, tenantPath(req, '/' + PAGES[lang].service + serviceSlug(service, lang)));
  const sp = spots(b, lang).find(s => s.id === service.id);
  Object.assign(res.locals, {
   page: 'service', active: 'services', service, spot: sp || null, other: other(lang, 'service', serviceSlug(service, lang === 'fr' ? 'en' : 'fr')),
   zone: (service.zones || [])[0] || 'house',
   related: b.visible.filter(s => s.id !== service.id).slice(0, 3),
   title: `${service.name[lang]} · ${b.brand_name} · ${b.city}`, description: service.intro[lang],
  });
  res.render('service');
 });
 router.get(both('contact'), page('contact', 'contact', req => ({ other: other(req.lang, 'contact'), title: `${T[req.lang].contactTitle} · ${req.b.brand_name}` })));
 router.get(both('estimate'), (req, res) => {
  const { b, lang, t } = res.locals;
  const chosen = b.visible.find(s => s.id === req.query.service && s.state !== 'hidden');
  Object.assign(res.locals, { page: 'request', active: 'request', other: other(lang, 'estimate'), chosen: chosen ? chosen.id : '', URGENCY, PROPERTY, title: `${t.requestTitle} · ${b.brand_name}` });
  res.render('request');
 });
 router.get(both('privacy'), page('privacy', 'privacy', req => ({ other: other(req.lang, 'privacy'), title: `${T[req.lang].privacyTitle} · ${req.b.brand_name}` })));
 // addresses of the first version (French-first sites only existed then)
 const MOVED = FIRST === 'fr' ? { '/demande': 'estimation', '/en/demande': 'en/estimate', '/en/confidentialite': 'en/privacy' } : {};
 for (const [from, to] of Object.entries(MOVED)) router.get(from, (req, res) => res.redirect(301, tenantPath(req, '/' + to)));

 // --- the request form -------------------------------------------------------------
 router.post('/api/requests', wrap(async (req, res) => {
  const b = req.b;
  if (!b.formLive) return res.status(403).json({ code: 'closed' });
  const x = req.body || {};
  if (x.website) return res.status(400).json({ code: 'invalid' });
  const name = clip(x.name, 120), phone = clip(x.phone, 40), email = clip(x.email, 200).toLowerCase(), address = clip(x.address, 300), message = clip(x.message, 3000);
  const serviceId = clip(x.service_id, 80), urgency = URGENCY.includes(x.urgency) ? x.urgency : 'soon', property = PROPERTY.includes(x.property_type) ? x.property_type : null;
  const digits = phone.replace(/\D/g, '').length;
  const bad = [];
  if (name.length < 2) bad.push('name');
  if (digits < 10 || digits > 15) bad.push('phone');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('email');
  if (address.length < 5) bad.push('address');
  if (message.length < 5) bad.push('message');
  if (x.consent !== true) bad.push('consent');
  if (serviceId && !b.visible.some(s => s.id === serviceId)) bad.push('service_id');
  if (bad.length) return res.status(400).json({ code: 'invalid', fields: bad });
  const key = req.ip || 'unknown', now = Date.now();
  for (const [k, v] of limits) if (now - v.start > 600000) limits.delete(k);
  const lim = limits.get(key) || { start: now, count: 0 };
  if (lim.count >= 5) return res.status(429).json({ code: 'rate_limited' });
  lim.count++; limits.set(key, lim);
  const lang = pick(x.language);
  const row = await db.get(`INSERT INTO plumbing_requests(name, phone, email, address, service_id, urgency, property_type, message, language, source)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'web') RETURNING id`, [name, phone, email || null, address, serviceId || null, urgency, property, message, lang]);
  const reference = 'D-' + String(row.id).padStart(4, '0');
  await db.run('UPDATE plumbing_requests SET reference = $1 WHERE id = $2', [reference, row.id]);
  const svc = b.services.find(s => s.id === serviceId);
  // The owner reads it in the site's first language.
  const r = { reference, name, phone, email, address, message, language: lang, service_label: svc ? svc.name[FIRST] : (FIRST === 'en' ? 'Other' : 'Autre'), urgency_label: T[FIRST].urgency[urgency] };
  await mail.requestToOwner(b, r, absolute(req, '/admin/demandes/' + row.id));
  await mail.requestAck(b, r);
  res.status(201).json({ id: row.id, reference });
 }));

 // --- the customer's private document link ------------------------------------------
 async function customerDoc(req, res) {
  const doc = await docs.byToken(req.params.token);
  if (!doc) return null;
  const owner = res.locals.isOwner;
  if (doc.status === 'draft' && !owner) return null;
  return { doc, owner };
 }
 router.get('/document/:token', wrap(async (req, res, next) => {
  const found = await customerDoc(req, res);
  if (!found) return next();
  const { doc, owner } = found;
  const lang = pick(doc.language);
  if (!owner && !doc.viewed_at) {
   await db.run('UPDATE documents SET viewed_at = NOW() WHERE id = $1 AND viewed_at IS NULL', [doc.id]);
   await docs.log(doc.id, 'viewed');
  }
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.set('Cache-Control', 'no-store');
  Object.assign(res.locals, {
   lang, t: T[lang], page: 'document', doc, owner, state: D.customerState(doc, S.today()),
   decidedOn: doc.decided_at ? S.local(new Date(doc.decided_at)).date : '',
   money: c => D.money(c, lang), qtyf: n => D.qty(n, lang), longDate: d => S.longDate(d, lang), taxLines: D.taxLines(doc, R, lang, req.b),
   text: v => (v && typeof v === 'object' ? v[lang] || v.fr || '' : v || ''),
   title: `${doc.kind === 'estimate' ? T[lang].docEstimate : T[lang].docInvoice} ${doc.number || ''} · ${req.b.brand_name}`,
  });
  res.render('document');
 }));
 router.post('/api/document/:token/:decision(accept|decline)', wrap(async (req, res) => {
  const found = await customerDoc(req, res);
  if (!found || found.doc.kind !== 'estimate') return res.status(404).json({ code: 'not_found' });
  const { doc } = found;
  if (D.customerState(doc, S.today()) !== 'open') return res.status(409).json({ code: 'closed' });
  const x = req.body || {};
  if (req.params.decision === 'accept') {
   const name = clip(x.name, 120);
   if (name.length < 2 || x.agree !== true) return res.status(400).json({ code: 'invalid' });
   await db.run("UPDATE documents SET status = 'accepted', decided_at = NOW(), decided_name = $1, updated_at = NOW() WHERE id = $2 AND status = 'sent'", [name, doc.id]);
   await docs.log(doc.id, 'accepted', name);
  } else {
   const reason = clip(x.reason, 500);
   await db.run("UPDATE documents SET status = 'declined', decided_at = NOW(), decline_reason = $1, updated_at = NOW() WHERE id = $2 AND status = 'sent'", [reason || null, doc.id]);
   await docs.log(doc.id, 'declined', reason);
  }
  const fresh = await docs.load(doc.id);
  await mail.decisionToOwner(req.b, fresh, absolute(req, '/admin/documents/' + doc.id));
  res.json({ ok: true, status: fresh.status });
 }));

 registerAdmin(router, { services, db, store, docs, mail, wrap, tenantPath, absolute, isOwner, PAGES, URGENCY, PROPERTY, fmt, clip });

 router.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ code: 'not_found' });
  res.status(404);
  res.locals.page = 'not-found';
  res.locals.title = res.locals.t ? res.locals.t.notFound : 'Page introuvable.';
  res.render('not-found');
 });
 // eslint-disable-next-line no-unused-vars
 router.use((err, req, res, _next) => {
  if (err && err.type === 'entity.too.large') return res.status(413).json({ code: 'too_large' });
  if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ code: 'invalid_json' });
  const status = err && err.status && err.status < 500 ? err.status : 500;
  if (status >= 500) console.error('[plumbing]', req.method, req.path, err && (err.stack || err.message));
  if (req.path.startsWith('/api/') || req.method !== 'GET') return res.status(status).json({ code: (err && err.code) || 'server_error', message: status < 500 && err ? err.message : undefined });
  res.status(status).type('text').send(status === 403 && err && err.message ? err.message : 'Erreur. Réessayez dans un instant.');
 });
 return router;
};
