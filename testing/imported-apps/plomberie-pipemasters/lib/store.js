'use strict';
/**
 * Site facts = business.json (what the public listing said, at build time) with the
 * owner's settings on top (admin_settings). Everything has a default derived here, so
 * a site works the same whether or not seed.js ever ran, and nothing needs a data
 * migration when the template gains a setting.
 */
const base = require('../business.json');

const TZ = 'America/Toronto';
const GATES = ['contact_verified', 'address_verified', 'hours_verified', 'privacy_approved', 'messages_enabled', 'live_actions_enabled'];
const STATES = ['confirmed', 'proposed', 'hidden'];
const PLACEHOLDER = /\[[^\]\n]{2,80}\]/;

const flag = (raw, key) => raw[key] === '1';
const has = (raw, key) => Object.prototype.hasOwnProperty.call(raw, key);
const pick = (raw, key, fallback) => (has(raw, key) ? raw[key] : fallback);
const pair = (raw, key, fallback) => {
 const fr = raw[key + '_fr'], en = raw[key + '_en'];
 if ((fr && fr.trim()) || (en && en.trim())) return { fr: (fr || en).trim(), en: (en || fr).trim() };
 return fallback || null;
};

/** « Plomberie Pipemasters inc. » → « Plomberie Pipemasters ». */
function brandOf(name) {
 return String(name || '').replace(/[\s,]+(inc|enr|ltée|ltee|ltd|senc|s\.e\.n\.c)\.?$/i, '').trim();
}
function telHref(phone) {
 const d = String(phone || '').replace(/[^+\d]/g, '');
 return 'tel:' + (d.length === 10 ? '+1' + d : d);
}

// --- time, always in Québec ----------------------------------------------------
function local(now = new Date()) {
 const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(now);
 const g = k => p.find(x => x.type === k).value;
 return { date: `${g('year')}-${g('month')}-${g('day')}`, time: `${g('hour')}:${g('minute')}`, weekday: { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[g('weekday')], month: Number(g('month')), year: Number(g('year')) };
}
const today = () => local().date;
function addDays(date, n) { const [y, m, d] = date.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); }
function clock(hhmm, lang) {
 const [h, m] = String(hhmm).split(':').map(Number);
 if (lang === 'en') return (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h < 12 ? ' a.m.' : ' p.m.');
 return h + ' h' + (m ? ' ' + String(m).padStart(2, '0') : '');
}
function longDate(date, lang) {
 if (!date) return '';
 const [y, m, d] = String(date).slice(0, 10).split('-').map(Number);
 return new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(Date.UTC(y, m - 1, d)));
}
function stamp(value, lang) {
 if (!value) return '';
 return new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { timeZone: TZ, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

// --- hours ---------------------------------------------------------------------
/** hours_json = {"1":["08:00","17:00"], … "7":null}; missing = unknown. */
function hoursOf(raw) {
 try {
  const x = JSON.parse(raw.hours_json || 'null');
  if (!x || typeof x !== 'object') return null;
  const out = {};
  for (let d = 1; d <= 7; d++) {
   const v = x[d];
   out[d] = Array.isArray(v) && /^\d\d:\d\d$/.test(v[0]) && /^\d\d:\d\d$/.test(v[1]) && v[0] < v[1] ? [v[0], v[1]] : null;
  }
  return out;
 } catch (_) { return null; }
}
function hoursSummary(hours, lang) {
 if (!hours) return '';
 const D = lang === 'en' ? ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
 const key = d => (hours[d] ? hours[d].join('-') : null);
 const parts = [];
 for (let d = 1; d <= 7; d++) {
  const k = key(d); if (!k) continue;
  let e = d; while (e < 7 && key(e + 1) === k) e++;
  parts.push((e > d ? D[d] + '–' + D[e] : D[d]) + ' ' + clock(hours[d][0], lang) + ' – ' + clock(hours[d][1], lang));
  d = e;
 }
 const s = parts.join(', ');
 return s.charAt(0).toUpperCase() + s.slice(1);
}
/** { open, until, next: { weekday, time, inDays } } */
function openState(hours, now = new Date()) {
 if (!hours) return null;
 const here = local(now);
 const t = hours[here.weekday];
 if (t && here.time >= t[0] && here.time < t[1]) return { open: true, until: t[1] };
 for (let i = 0; i < 8; i++) {
  const wd = ((here.weekday - 1 + i) % 7) + 1, h = hours[wd];
  if (!h || (i === 0 && here.time >= h[0])) continue;
  return { open: false, next: { weekday: wd, time: h[0], inDays: i } };
 }
 return { open: false, next: null };
}

// --- privacy -------------------------------------------------------------------
function privacyTemplate(b, lang) {
 const contact = [b.email, b.phone].filter(Boolean).join(lang === 'en' ? ' or ' : ' ou ');
 if (lang === 'en') return `${b.business_name} collects the information you provide through the estimate request form or by phone: your name, phone number, email, the address of the work and the description of your needs.

Use: this information is used only to answer your request, prepare an estimate, carry out the work and invoice you. It is never sold. It is shared only with the service providers needed for these purposes (website hosting, email delivery).

Retention: requests that do not lead to work are deleted after [retention period, e.g. 12 months]. Estimates and invoices are kept as long as tax laws require.

Person in charge of the protection of personal information: [name and title], ${contact}. You may ask to access, correct or delete your information by writing to this address.

Cookies: this website uses no advertising cookies.`;
 return `${b.business_name} recueille les renseignements que vous transmettez par le formulaire de demande d’estimation ou au téléphone : votre nom, votre téléphone, votre courriel, l’adresse des travaux et la description de votre besoin.

Utilisation : ces renseignements servent uniquement à répondre à votre demande, à préparer une estimation, à réaliser les travaux et à vous facturer. Ils ne sont jamais vendus. Ils ne sont communiqués qu’aux fournisseurs nécessaires à ces fins (hébergement du site, envoi des courriels).

Conservation : les demandes sans suite sont supprimées après [durée de conservation, par ex. 12 mois]. Les estimations et les factures sont conservées le temps exigé par les lois fiscales.

Responsable de la protection des renseignements personnels : [nom et titre], ${contact}. Vous pouvez demander l’accès à vos renseignements, leur correction ou leur suppression en écrivant à cette adresse.

Témoins : ce site n’utilise aucun témoin publicitaire.`;
}

// --- the merged business ---------------------------------------------------------
function business(raw) {
 const name = (raw.business_name || '').trim() || base.business_name;
 const b = {
  ...base,
  business_name: name,
  brand_name: brandOf(name),
  phone: (raw.phone || '').trim() || base.phone,
  email: pick(raw, 'email', base.email || '').trim(),
  address: (raw.business_address || '').trim(),
  addressPublic: flag(raw, 'address_public') && !!(raw.business_address || '').trim(),
  areas: pair(raw, 'areas', base.areas),
  payments: pair(raw, 'payments', base.payments),
  free_estimates: has(raw, 'free_estimates') ? flag(raw, 'free_estimates') : !!base.free_estimates,
  emergency: has(raw, 'emergency_247') ? flag(raw, 'emergency_247') : !!(base.hours && base.hours.always_open),
  hours: hoursOf(raw) || (base.hours && base.hours.weekly ? hoursOf({ hours_json: JSON.stringify(base.hours.weekly) }) : null),
  hoursText: base.hours && base.hours.text ? base.hours.text : null,
  rating: flag(raw, 'rating_hidden') ? null : base.rating,
  rbq: (raw.rbq || '').trim(), neq: (raw.neq || '').trim(), tps: (raw.tps_number || '').trim(), tvq: (raw.tvq_number || '').trim(),
  interac: (raw.interac_email || '').trim(),
 };
 b.tel = telHref(b.phone);
 b.services = base.services.map(s => {
  const st = raw['service_' + s.id];
  const state = STATES.includes(st) ? st : (s.listed ? (s.confirmed ? 'confirmed' : 'proposed') : 'hidden');
  const price = Number(raw['service_' + s.id + '_price']);
  return { ...s, state, confirmed: state === 'confirmed', price: Number.isFinite(price) && price > 0 ? price : null };
 });
 const order = { confirmed: 0, proposed: 1, hidden: 2 };
 b.visible = b.services.filter(s => s.state !== 'hidden').sort((x, y) => order[x.state] - order[y.state]);
 b.privacy = {
  fr: (raw.privacy_fr || '').trim() || privacyTemplate(b, 'fr'),
  en: (raw.privacy_en || '').trim() || privacyTemplate(b, 'en'),
 };
 b.privacyComplete = !PLACEHOLDER.test(b.privacy.fr) && !PLACEHOLDER.test(b.privacy.en);
 b.formLive = flag(raw, 'contact_verified') && flag(raw, 'privacy_approved') && flag(raw, 'messages_enabled') && b.privacyComplete;
 b.liveEmail = flag(raw, 'live_actions_enabled');
 b.documents = flag(raw, 'documents_enabled');
 b.notify = (raw.notification_email || '').trim() || b.email;
 return b;
}

function season(month) { return month >= 10 && month <= 11 ? 'autumn' : month === 12 || month <= 2 ? 'winter' : month <= 4 ? 'spring' : 'summer'; }

module.exports = function (services) {
 const db = services.db;
 return {
  async raw() { return Object.fromEntries((await db.all('SELECT key, value FROM admin_settings')).map(r => [r.key, r.value])); },
  async put(entries) {
   for (const [key, value] of entries) {
    await db.run('INSERT INTO admin_settings(key, value) VALUES($1, $2) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value]);
   }
  },
 };
};
Object.assign(module.exports, {
 base, GATES, STATES, PLACEHOLDER, TZ, flag, brandOf, telHref, business, hoursOf, hoursSummary, openState, privacyTemplate,
 local, today, addDays, clock, longDate, stamp, season,
});
