const T = require('./i18n');

/** A bilingual setting is stored as JSON {fr,en}; plain strings pass through. */
function localized(value, lang) {
  if (typeof value !== 'string') return value || '';
  try { const x = JSON.parse(value); if (x && typeof x === 'object' && !Array.isArray(x)) return x[lang] || x.fr || ''; } catch (e) {}
  return value;
}
function both(value) { try { const x = JSON.parse(value); return !!(x.fr && x.en && x.fr.trim() && x.en.trim()); } catch (e) { return false; } }
function translate(raw, lang) {
  const t = Object.assign({}, T[lang] || T.fr);
  for (const key in raw) if (key.startsWith('text_') && key.endsWith('_' + lang)) { const k = key.slice(5, -(lang.length + 1)); if (k) t[k] = raw[key]; }
  return t;
}
function flag(raw, key) { return raw[key] === '1'; }
function num(raw, key, fallback) { const n = Number(raw[key]); return Number.isFinite(n) ? n : fallback; }
function safeJSON(x) { return JSON.stringify(x).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); }
function error(code, status = 400, detail = '') { const e = new Error(code); e.code = code; e.status = status; e.detail = detail; return e; }
function money(cents, lang) { return new Intl.NumberFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD' }).format(Number(cents) / 100); }
function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
function date(value, lang) { return value ? new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { timeZone: 'America/Toronto', dateStyle: 'long' }).format(new Date(value)) : ''; }
function dateTime(value, lang) { return value ? new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { timeZone: 'America/Toronto', dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)) : ''; }
function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

/**
 * Quebec sales tax. Rates live in admin_settings (basis points) so the owner
 * can correct them without a deploy. Both are computed on the pre-tax amount,
 * which is how QST has worked since 2013.
 */
function taxes(raw, taxableCents, shippingCents = 0) {
  const basis = Math.max(0, Number(taxableCents) || 0) + Math.max(0, Number(shippingCents) || 0);
  const gstBp = num(raw, 'gst_rate_bp', 500);
  const qstBp = num(raw, 'qst_rate_bp', 998);
  return { gst: Math.round((basis * gstBp) / 10000), qst: Math.round((basis * qstBp) / 10000) };
}

/** Route table. FR is the canonical language; EN mirrors it under /en/. */
function urls(lang) {
  return lang === 'en' ? {
    home: 'en/', boutique: 'en/shop/', product: 'en/shop/product/', category: 'en/shop/?category=',
    listes: 'en/school-lists/', liste: 'en/school-lists/',
    cart: 'en/cart/', order: 'en/order/', orders: 'en/my-orders/',
    about: 'en/about/', contact: 'en/contact/', privacy: 'en/privacy/', livraison: 'en/shipping-and-pickup/',
  } : {
    home: '.', boutique: 'boutique/', product: 'boutique/produit/', category: 'boutique/?category=',
    listes: 'listes-scolaires/', liste: 'listes-scolaires/',
    cart: 'panier/', order: 'commande/', orders: 'mes-commandes/',
    about: 'a-propos/', contact: 'contact/', privacy: 'confidentialite/', livraison: 'livraison-et-cueillette/',
  };
}

/** Parse a bundle's items list — one "product-slug x quantity" per line. */
function bundleItems(raw) {
  let lines = [];
  try { const x = JSON.parse(raw || '[]'); lines = Array.isArray(x) ? x : []; } catch (e) { lines = String(raw || '').split('\n'); }
  const out = [];
  for (const line of lines) {
    const m = /^\s*([a-z0-9-]+)\s*(?:[x×*]\s*(\d{1,2}))?\s*$/i.exec(String(line || ''));
    if (m) out.push({ slug: m[1].toLowerCase(), quantity: Math.max(1, Math.min(20, Number(m[2] || 1))) });
  }
  return out;
}

module.exports = function (services) {
  let initialized;
  async function init() {
    if (!initialized) initialized = (async () => {
      const c = services.config || {};
      const defaults = {
        business_name: c.businessName || c.displayName || 'Souhoud',
        contact_email: c.contactEmail,
        contact_phone: c.contactPhone,
        business_address: c.businessAddress,
      };
      for (const [key, value] of Object.entries(defaults)) {
        if (value) await services.db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO NOTHING', [key, String(value)]);
      }
    })().catch((e) => { initialized = null; throw e; });
    await initialized;
  }
  return {
    async load() {
      await init();
      return Object.fromEntries((await services.db.all('SELECT key,value FROM admin_settings')).map((x) => [x.key, x.value]));
    },
  };
};

Object.assign(module.exports, { localized, both, translate, flag, num, safeJSON, error, money, today, date, dateTime, slugify, taxes, urls, bundleItems });
