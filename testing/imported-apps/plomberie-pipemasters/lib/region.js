'use strict';
/**
 * Where the business works: its province decides the site's first language, the clock, the
 * sales taxes on estimates and invoices, the licence the site may show and the privacy law
 * the policy answers to. business.json carries `region` ({ province, lang, tz, climate });
 * a site built before regions existed (no `region`) is a Québec site.
 *
 * Taxes are what a plumbing contractor charges the customer for work on a home (checked
 * 2026-10-06): HST in ON (13 %), NS (14 % since 2025-04-01), NB/NL/PE (15 %); GST + QST in
 * Québec; GST + PST 6 % in Saskatchewan (services to real property, since 2017-04-01);
 * GST + RST 7 % in Manitoba (plumbing systems stay tangible personal property: RST on the
 * total, labour included — Bulletin 008); GST only in BC (real property contracts: the
 * contractor pays PST on materials, the customer is not charged), Alberta and the territories.
 * The owner can still turn taxes off per document (small supplier).
 */

const GST = { key: 'gst', label: { fr: 'TPS', en: 'GST' } };
const HST = { key: 'hst', label: { fr: 'TVH', en: 'HST' } };
const PROVINCES = {
 QC: { name: { fr: 'Québec', en: 'Quebec' }, lang: 'fr', tz: 'America/Toronto', taxes: [{ ...GST, rate: 0.05 }, { key: 'qst', label: { fr: 'TVQ', en: 'QST' }, rate: 0.09975 }], licence: 'rbq', privacy: 'qc' },
 ON: { name: { fr: 'Ontario', en: 'Ontario' }, lang: 'en', tz: 'America/Toronto', taxes: [{ ...HST, rate: 0.13 }], privacy: 'federal' },
 NS: { name: { fr: 'Nouvelle-Écosse', en: 'Nova Scotia' }, lang: 'en', tz: 'America/Halifax', taxes: [{ ...HST, rate: 0.14 }], privacy: 'federal' },
 NB: { name: { fr: 'Nouveau-Brunswick', en: 'New Brunswick' }, lang: 'en', tz: 'America/Moncton', taxes: [{ ...HST, rate: 0.15 }], privacy: 'federal' },
 PE: { name: { fr: 'Île-du-Prince-Édouard', en: 'Prince Edward Island' }, lang: 'en', tz: 'America/Halifax', taxes: [{ ...HST, rate: 0.15 }], privacy: 'federal' },
 NL: { name: { fr: 'Terre-Neuve-et-Labrador', en: 'Newfoundland and Labrador' }, lang: 'en', tz: 'America/St_Johns', taxes: [{ ...HST, rate: 0.15 }], privacy: 'federal' },
 MB: { name: { fr: 'Manitoba', en: 'Manitoba' }, lang: 'en', tz: 'America/Winnipeg', taxes: [{ ...GST, rate: 0.05 }, { key: 'rst', label: { fr: 'TVD', en: 'RST' }, rate: 0.07 }], privacy: 'federal' },
 SK: { name: { fr: 'Saskatchewan', en: 'Saskatchewan' }, lang: 'en', tz: 'America/Regina', taxes: [{ ...GST, rate: 0.05 }, { key: 'pst', label: { fr: 'TVP', en: 'PST' }, rate: 0.06 }], privacy: 'federal' },
 AB: { name: { fr: 'Alberta', en: 'Alberta' }, lang: 'en', tz: 'America/Edmonton', taxes: [{ ...GST, rate: 0.05 }], privacy: 'ab' },
 BC: { name: { fr: 'Colombie-Britannique', en: 'British Columbia' }, lang: 'en', tz: 'America/Vancouver', taxes: [{ ...GST, rate: 0.05 }], privacy: 'bc' },
 YT: { name: { fr: 'Yukon', en: 'Yukon' }, lang: 'en', tz: 'America/Whitehorse', taxes: [{ ...GST, rate: 0.05 }], privacy: 'federal' },
 NT: { name: { fr: 'Territoires du Nord-Ouest', en: 'Northwest Territories' }, lang: 'en', tz: 'America/Yellowknife', taxes: [{ ...GST, rate: 0.05 }], privacy: 'federal' },
 NU: { name: { fr: 'Nunavut', en: 'Nunavut' }, lang: 'en', tz: 'America/Iqaluit', taxes: [{ ...GST, rate: 0.05 }], privacy: 'federal' },
};

/** Towns on another clock than their province's default. */
const TZ_TOWNS = {
 'BC:cranbrook': 'America/Edmonton', 'BC:kimberley': 'America/Edmonton', 'BC:fernie': 'America/Edmonton', 'BC:sparwood': 'America/Edmonton',
 'BC:golden': 'America/Edmonton', 'BC:invermere': 'America/Edmonton', 'BC:radium hot springs': 'America/Edmonton', 'BC:elkford': 'America/Edmonton',
 'BC:creston': 'America/Creston', 'BC:dawson creek': 'America/Dawson_Creek', 'BC:fort st. john': 'America/Dawson_Creek', 'BC:fort st john': 'America/Dawson_Creek',
 'BC:chetwynd': 'America/Dawson_Creek', 'BC:tumbler ridge': 'America/Dawson_Creek', 'BC:fort nelson': 'America/Fort_Nelson',
 'ON:kenora': 'America/Winnipeg', 'ON:dryden': 'America/Winnipeg', 'ON:sioux lookout': 'America/Winnipeg', 'ON:fort frances': 'America/Winnipeg',
 'ON:red lake': 'America/Winnipeg', 'ON:rainy river': 'America/Winnipeg', 'ON:atikokan': 'America/Atikokan',
 'SK:lloydminster': 'America/Edmonton', 'QC:iles-de-la-madeleine': 'America/Halifax', 'QC:blanc-sablon': 'America/Blanc-Sablon',
 'NL:labrador city': 'America/Goose_Bay', 'NL:wabush': 'America/Goose_Bay', 'NL:happy valley-goose bay': 'America/Goose_Bay', 'NL:churchill falls': 'America/Goose_Bay',
};
/** Coast and islands of BC: rain, rarely deep frost — the seasonal tips are named for it. */
const MILD = new Set(['vancouver', 'north vancouver', 'west vancouver', 'burnaby', 'richmond', 'surrey', 'delta', 'langley', 'langley twp', 'new westminster', 'coquitlam',
 'port coquitlam', 'port moody', 'maple ridge', 'pitt meadows', 'white rock', 'abbotsford', 'mission', 'chilliwack', 'squamish', 'victoria', 'saanich', 'langford',
 'colwood', 'sooke', 'sidney', 'nanaimo', 'parksville', 'qualicum beach', 'errington', 'courtenay', 'comox', 'campbell river', 'duncan', 'cowichan bay',
 'port alberni', 'powell river', 'sechelt', 'gibsons', 'garden bay', 'prince rupert', 'ladysmith', 'chemainus', 'tofino', 'ucluelet']);
/** New Brunswick towns where French comes first. */
const NB_FRENCH = new Set(['caraquet', 'bas-caraquet', 'shippagan', 'lameque', 'tracadie', 'tracadie-sheila', 'edmundston', 'grand-sault', 'grand falls', 'dieppe',
 'bouctouche', 'shediac', 'saint-quentin', 'kedgwick', 'neguac', 'richibucto', 'memramcook', 'saint-louis-de-kent', 'clair', 'saint-leonard', 'beresford', 'petit-rocher', 'nigadoo']);
// Canada Post: first letter of the postal code → province (X = NT or NU: ask).
const POSTAL = { A: 'NL', B: 'NS', C: 'PE', E: 'NB', G: 'QC', H: 'QC', J: 'QC', K: 'ON', L: 'ON', M: 'ON', N: 'ON', P: 'ON', R: 'MB', S: 'SK', T: 'AB', V: 'BC', Y: 'YT' };

const fold = s => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s*\(.*$/, '').trim();

/** The profile of a province code (unknown → Québec, the first market). */
function profile(code) { return PROVINCES[code] || PROVINCES.QC; }

/** Province from what a dossier knows: its field, its mailing address, a postal code, a Québec campaign. */
function provinceOf(d = {}) {
 const code = String(d.province || (d.mailing_address && d.mailing_address.province) || '').toUpperCase().trim();
 if (PROVINCES[code]) return code;
 const postal = String((d.mailing_address && d.mailing_address.postal_code) || d.postal_code || '').trim().toUpperCase();
 if (POSTAL[postal.charAt(0)]) return POSTAL[postal.charAt(0)];
 return /^plumbing-qu[eé]bec-|^plumbing-qc-/i.test(String(d.campaign || d.research_key || '')) ? 'QC' : null;
}

/** French first in Québec, in French New Brunswick towns, and for a business named in French elsewhere. */
function languageFor(province, { city = '', business = '' } = {}) {
 if (province === 'QC') return 'fr';
 if (province === 'NB' && NB_FRENCH.has(fold(city))) return 'fr';
 if (/^(plomberie|plombier|plombiers|les plombiers)\b|\bplomberie$/i.test(String(business).trim())) return 'fr';
 return profile(province).lang;
}

/** What business.json carries. */
function regionFor(province, { city = '', business = '', lang = null } = {}) {
 const p = profile(province);
 const town = fold(city);
 return {
  province: PROVINCES[province] ? province : 'QC',
  lang: lang === 'fr' || lang === 'en' ? lang : languageFor(province, { city, business }),
  tz: TZ_TOWNS[province + ':' + town] || p.tz,
  climate: province === 'BC' && MILD.has(town) ? 'mild' : 'cold',
 };
}

/** The live region of a site, with its profile merged in. */
function resolve(region) {
 const r = region && PROVINCES[region.province] ? region : { province: 'QC', lang: 'fr', tz: PROVINCES.QC.tz, climate: 'cold' };
 const p = profile(r.province);
 return { ...p, ...r, other: r.lang === 'fr' ? 'en' : 'fr' };
}

/** Page addresses: the first language at the root, the other under /en/ or /fr/. */
const SLUGS = {
 fr: { services: 'services', contact: 'contact', estimate: 'estimation', privacy: 'confidentialite' },
 en: { services: 'services', contact: 'contact', estimate: 'estimate', privacy: 'privacy' },
};
function pages(first) {
 const one = lang => {
  const pre = lang === first ? '' : lang + '/', w = SLUGS[lang];
  return { home: pre || './', services: pre + w.services, service: pre + w.services + '/', contact: pre + w.contact, estimate: pre + w.estimate, privacy: pre + w.privacy };
 };
 return { fr: one('fr'), en: one('en') };
}
/** A service's address word in a language: English pages use English words (water-heaters). */
const serviceSlug = (s, lang) => (lang === 'en' && s.slug_en) || s.id;

/** The privacy law the site's policy answers to, for the back office. */
const PRIVACY = {
 qc: { fr: 'Exigée par la Loi 25 avant de recevoir des demandes.', en: 'Required by Québec’s Law 25 before you take requests.' },
 bc: { fr: 'Attendue en vertu de la Personal Information Protection Act de la Colombie-Britannique avant de recevoir des demandes.', en: 'Expected under BC’s Personal Information Protection Act before you take requests.' },
 ab: { fr: 'Attendue en vertu de la Personal Information Protection Act de l’Alberta avant de recevoir des demandes.', en: 'Expected under Alberta’s Personal Information Protection Act before you take requests.' },
 federal: { fr: 'Attendue en vertu de la LPRPDE, la loi fédérale sur la protection des renseignements personnels, avant de recevoir des demandes.', en: 'Expected under PIPEDA, the federal privacy law, before you take requests.' },
};
const privacyLaw = r => PRIVACY[r.privacy] || PRIVACY.federal;

/** « 9,975 % » / « 9.975% ». */
function percent(rate, lang) {
 const n = new Intl.NumberFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { maximumFractionDigits: 3 }).format(Math.round(rate * 100000) / 1000);
 return lang === 'en' ? n + '%' : n + ' %';
}

module.exports = { PROVINCES, TZ_TOWNS, MILD, NB_FRENCH, POSTAL, PRIVACY, SLUGS, pages, serviceSlug, profile, provinceOf, languageFor, regionFor, resolve, percent, privacyLaw };
