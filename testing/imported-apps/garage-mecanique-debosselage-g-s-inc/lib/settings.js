const T = require('./i18n');

const TZ = 'America/Toronto';

/** A bilingual setting is stored as JSON {fr,en}; plain strings pass through. */
function localized(value, lang) {
  if (typeof value !== 'string') return value || '';
  try { const x = JSON.parse(value); if (x && typeof x === 'object' && !Array.isArray(x)) return x[lang] || x.fr || ''; } catch (e) {}
  return value;
}
/**
 * A site text as the visitor sees it: the owner's inline-editor override
 * (_p_lk_<key>_<lang>, then _p_lk_<key>) wins over the seeded setting.
 */
function siteText(raw, key, lang) {
  const o = raw['_p_lk_' + key + '_' + lang];
  if (typeof o === 'string' && o.trim()) return o;
  const n = raw['_p_lk_' + key];
  if (typeof n === 'string' && n.trim()) return n;
  return localized(raw[key], lang);
}
/** Draft markers the seeded privacy notice ships with. */
function hasPlaceholders(text) { return /\[(nom|name)[^\]]*\]|BROUILLON|DRAFT FOR/i.test(String(text || '')); }
/** « Lun–ven 8 h – 18 h · sam 9 h – 15 h » from the hours table (consecutive equal days grouped). */
function hoursSummary(rows, lang) {
  const en = lang === 'en';
  const D = en ? ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
  const c = (x) => { const [h, m] = String(x).split(':').map(Number); return en ? (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h < 12 ? ' a.m.' : ' p.m.') : h + ' h' + (m ? ' ' + String(m).padStart(2, '0') : ''); };
  const byDay = {}; (rows || []).forEach((r) => { byDay[r.weekday] = r; });
  const key = (d) => { const r = byDay[d]; return !r || Number(r.closed) ? null : r.opens + '-' + r.closes; };
  const parts = [];
  for (let d = 1; d <= 7; d++) {
    const k = key(d); if (!k) continue;
    let e = d; while (e < 7 && key(e + 1) === k) e++;
    const [o, cl] = k.split('-');
    parts.push((e > d ? D[d] + '–' + D[e] : D[d]) + ' ' + c(o) + ' – ' + c(cl));
    d = e;
  }
  const s = parts.join(' · ');
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : (en ? 'Closed' : 'Fermé');
}
/** « …, Mirabel (Québec) J7J 1M3 » → « Mirabel ». */
function cityOf(address) { const m = String(address || '').match(/,\s*([^,(]+?)\s*\((?:Québec|Quebec|QC)\)/); return m ? m[1].trim() : ''; }
function both(value) { try { const x = JSON.parse(value); return !!(x.fr && x.en && x.fr.trim() && x.en.trim()); } catch (e) { return false; } }
function translate(raw, lang) {
  const t = Object.assign({}, T[lang] || T.fr);
  for (const key in raw) if (key.startsWith('text_') && key.endsWith('_' + lang)) { const k = key.slice(5, -(lang.length + 1)); if (k) t[k] = raw[key]; }
  return t;
}
function flag(raw, key) { return raw[key] === '1'; }
function num(raw, key, fallback) { const n = Number(raw[key]); return raw[key] !== undefined && raw[key] !== '' && Number.isFinite(n) ? n : fallback; }
function safeJSON(x) { return JSON.stringify(x).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); }
function error(code, status = 400, detail = '') { const e = new Error(code); e.code = code; e.status = status; e.detail = detail; return e; }
function money(cents, lang) { return new Intl.NumberFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Number(cents) / 100); }
function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

// --- Time, always in the garage's zone ---------------------------------------
function offsetMinutes(instant) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(instant);
  const g = (k) => Number(p.find((x) => x.type === k).value);
  return (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - instant.getTime()) / 60000;
}
/** 'YYYY-MM-DD' + 'HH:MM' read in the garage's zone → Date. */
function zoned(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let t = guess - offsetMinutes(new Date(guess)) * 60000;
  const again = offsetMinutes(new Date(t));
  t = guess - again * 60000;
  return new Date(t);
}
/** Date → { date:'YYYY-MM-DD', time:'HH:MM', weekday: 1 (Mon) … 7 (Sun) } in the garage's zone. */
function local(instant) {
  const d = instant instanceof Date ? instant : new Date(instant);
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(d);
  const g = (k) => p.find((x) => x.type === k).value;
  const wd = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[g('weekday')];
  return { date: `${g('year')}-${g('month')}-${g('day')}`, time: `${g('hour')}:${g('minute')}`, weekday: wd };
}
function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const x = new Date(Date.UTC(y, m - 1, d + n));
  return x.toISOString().slice(0, 10);
}
function weekdayOf(dateStr) { const [y, m, d] = dateStr.split('-').map(Number); const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); return w === 0 ? 7 : w; }
function toMinutes(hhmm) { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; }
function fromMinutes(n) { return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); }

function date(value, lang) { return value ? new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { timeZone: TZ, dateStyle: 'full' }).format(new Date(value)) : ''; }
function shortDate(value, lang) { return value ? new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(value)) : ''; }
function time(value, lang) { return value ? new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : ''; }
function dateTime(value, lang) { return value ? date(value, lang) + (lang === 'en' ? ' at ' : ' à ') + time(value, lang) : ''; }

/** Open right now? Returns { open, until, nextOpen } from the hours table. */
function openState(hours, closures, now = new Date()) {
  const byDay = {};
  for (const h of hours || []) byDay[h.weekday] = h;
  const closed = new Set((closures || []).map((c) => String(c.date).slice(0, 10)));
  const here = local(now);
  const mins = toMinutes(here.time);
  const today = byDay[here.weekday];
  if (today && !today.closed && !closed.has(here.date) && mins >= toMinutes(today.opens) && mins < toMinutes(today.closes)) {
    return { open: true, until: today.closes };
  }
  for (let i = 0; i < 14; i++) {
    const d = addDays(here.date, i);
    const h = byDay[weekdayOf(d)];
    if (!h || h.closed || closed.has(d)) continue;
    if (i === 0 && mins >= toMinutes(h.opens)) continue;
    return { open: false, nextOpen: { date: d, time: h.opens, weekday: weekdayOf(d), inDays: i } };
  }
  return { open: false, nextOpen: null };
}

/** Route table. FR is canonical; EN mirrors it under /en/. */
function urls(lang) {
  return lang === 'en' ? {
    home: 'en/', services: 'en/services/', service: 'en/services/', booking: 'en/appointment/',
    account: 'en/my-account/', appointment: 'en/my-account/appointments/', planner: 'en/maintenance-planner/',
    about: 'en/about/', contact: 'en/contact/', privacy: 'en/privacy/',
  } : {
    home: '.', services: 'services/', service: 'services/', booking: 'rendez-vous/',
    account: 'mon-compte/', appointment: 'mon-compte/rendez-vous/', planner: 'carnet-d-entretien/',
    about: 'a-propos/', contact: 'contact/', privacy: 'confidentialite/',
  };
}

module.exports = function (services) {
  let initialized;
  async function init() {
    if (!initialized) initialized = (async () => {
      const c = services.config || {};
      const defaults = { business_name: c.businessName || c.displayName || 'Garage Mécanique Débosselage G.S' };
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

Object.assign(module.exports, {
  cityOf,
  hoursSummary,
  siteText, hasPlaceholders,
  TZ, localized, both, translate, flag, num, safeJSON, error, money, slugify,
  offsetMinutes, zoned, local, addDays, weekdayOf, toMinutes, fromMinutes,
  date, shortDate, time, dateTime, openState, urls,
});
