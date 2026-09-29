const themes = require('./themes');

/** Owner-editable card fields and their limits. Bilingual text uses _fr/_en keys. */
const TEXT = {
  full_name: 80, title_fr: 100, title_en: 100, organization: 100,
  location_fr: 100, location_en: 100, bio_fr: 600, bio_en: 600,
};
const LINK_KINDS = ['linkedin', 'instagram', 'facebook', 'x', 'tiktok', 'youtube', 'github', 'behance', 'calendar', 'portfolio', 'website', 'other'];
const KIND_LABELS = {
  linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook', x: 'X', tiktok: 'TikTok', youtube: 'YouTube',
  github: 'GitHub', behance: 'Behance',
  calendar: { fr: 'Prendre rendez-vous', en: 'Book a meeting' },
  portfolio: { fr: 'Portfolio', en: 'Portfolio' },
  website: { fr: 'Site web', en: 'Website' },
  other: { fr: 'Lien', en: 'Link' },
};
const MAX_LINKS = 12;

function error(code, status = 400) { const e = new Error(code); e.code = code; e.status = status; return e; }
function isHttpUrl(value, { httpsOnly = false } = {}) {
  try { const u = new URL(value); return httpsOnly ? u.protocol === 'https:' : ['https:', 'http:'].includes(u.protocol); } catch (e) { return false; }
}

/** Validate one setting; returns the value to store or throws. */
function clean(key, raw) {
  const value = String(raw == null ? '' : raw).trim();
  if (Object.prototype.hasOwnProperty.call(TEXT, key)) {
    if (value.length > TEXT[key]) throw error('invalid');
    if (key === 'full_name' && !value) throw error('required');
    return value;
  }
  switch (key) {
    case 'phone': if (value && !/^[+()\d .-]{7,30}$/.test(value)) throw error('invalid'); return value;
    case 'email': if (value && (value.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) throw error('invalid'); return value;
    case 'website': if (value && (value.length > 200 || !isHttpUrl(value))) throw error('invalid'); return value;
    case 'photo_url': if (value && (value.length > 500 || !isHttpUrl(value, { httpsOnly: true }))) throw error('invalid'); return value;
    case 'show_text': if (!['0', '1'].includes(value)) throw error('invalid'); return value;
    case 'theme': if (!themes.THEMES[value] && value !== 'custom') throw error('invalid'); return value;
    case 'theme_bg': case 'theme_ink': case 'theme_accent': if (value && !themes.HEX.test(value)) throw error('invalid'); return value.toUpperCase();
    case 'theme_font': if (value && !themes.FONTS.includes(value)) throw error('invalid'); return value;
    default: throw error('invalid');
  }
}
const KEYS = [...Object.keys(TEXT), 'phone', 'email', 'website', 'photo_url', 'show_text', 'theme', 'theme_bg', 'theme_ink', 'theme_accent', 'theme_font'];

function cleanLink(link) {
  const kind = LINK_KINDS.includes(link.kind) ? link.kind : null;
  const url = String(link.url || '').trim();
  const labelFr = String(link.label_fr || '').trim();
  const labelEn = String(link.label_en || '').trim();
  if (!kind || !url || url.length > 300 || !isHttpUrl(url) || labelFr.length > 60 || labelEn.length > 60) throw error('invalid');
  return { kind, url, label_fr: labelFr, label_en: labelEn };
}

/** Localized label: the owner's, else the network name. */
function linkLabel(link, lang) {
  const own = lang === 'en' ? (link.label_en || link.label_fr) : (link.label_fr || link.label_en);
  if (own) return own;
  const k = KIND_LABELS[link.kind] || KIND_LABELS.other;
  return typeof k === 'string' ? k : k[lang] || k.fr;
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '·';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

module.exports = function (services) {
  const db = services.db;
  /** Settings merged over defaults taken from the account (never invented). */
  async function load() {
    const c = services.config || {};
    const out = {
      full_name: c.businessName || c.displayName || '', email: c.contactEmail || '', phone: c.contactPhone || '',
      theme: 'ivoire', show_text: '0',
    };
    for (const row of await db.all('SELECT key, value FROM admin_settings')) {
      if (KEYS.includes(row.key) && row.value != null) out[row.key] = row.value;
    }
    return out;
  }
  async function save(values) {
    const cleaned = {};
    for (const [key, raw] of Object.entries(values || {})) {
      if (!KEYS.includes(key)) throw error('invalid');
      cleaned[key] = clean(key, raw);
    }
    for (const [key, value] of Object.entries(cleaned)) {
      await db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()', [key, value]);
    }
    return cleaned;
  }
  async function links() { return db.all('SELECT id, kind, label_fr, label_en, url, sort_order FROM links ORDER BY sort_order, id'); }
  async function replaceLinks(list) {
    if (!Array.isArray(list)) throw error('invalid');
    if (list.length > MAX_LINKS) throw error('too_many_links');
    const cleaned = list.map(cleanLink);
    await db.run('DELETE FROM links');
    for (let i = 0; i < cleaned.length; i += 1) {
      const l = cleaned[i];
      await db.run('INSERT INTO links(kind,label_fr,label_en,url,sort_order) VALUES($1,$2,$3,$4,$5)', [l.kind, l.label_fr, l.label_en, l.url, i]);
    }
    return links();
  }
  return { load, save, links, replaceLinks };
};

module.exports.TEXT = TEXT;
module.exports.KEYS = KEYS;
module.exports.LINK_KINDS = LINK_KINDS;
module.exports.KIND_LABELS = KIND_LABELS;
module.exports.linkLabel = linkLabel;
module.exports.initials = initials;
module.exports.error = error;
module.exports.clean = clean;
