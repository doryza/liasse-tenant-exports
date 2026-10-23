// The menu shown on this site is the restaurant's command.restaurant menu,
// read from the public feed its ordering page uses. Dishes, prices, photos
// and categories are edited there (Command.Restaurant → Menu) and reach this
// site without a code change.
//
// The copy is kept 10 min and refreshed in the background; a failed read
// keeps the last good copy and retries after a minute. Before the first good
// read (or if command.restaurant is down at boot) the snapshot in
// lib/menu-fallback.js is shown.
//
// Names, categories and descriptions are written « Français / English » on
// command.restaurant; split() picks the visitor's language. The volatile
// `available` flag is ignored on purpose: ordering enforces it.

const FALLBACK = require('./menu-fallback');

const FEED_URL = 'https://order.command.restaurant/b/o-tawouk-brossard/order/menu.json';
const ORDER_URL = 'https://order.command.restaurant/b/o-tawouk-brossard/order';
const TTL_MS = 10 * 60 * 1000;
const RETRY_MS = 60 * 1000;

// Module scope: the platform keeps this module loaded across requests.
const cache = { menu: null, nextAt: 0, pending: null };

// « Taboulé / Tabbouleh » → { fr: 'Taboulé', en: 'Tabbouleh' }. Only a single
// « / » separator is treated as a FR/EN pair; anything else is kept whole.
function split(text) {
  const s = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
  if (s.startsWith('Inclus / Included :')) {
    const pairs = s.replace('Inclus / Included :', '').split(';').map(split);
    return { fr: 'Inclus : ' + pairs.map(p => p.fr).join('; '), en: 'Includes: ' + pairs.map(p => p.en).join('; ') };
  }
  const parts = s.includes('|') ? s.split(/\s*\|\s*/) : s.split(' / ');
  if (parts.length === 2 && parts[0].trim() && parts[1].trim()) return { fr: parts[0].trim(), en: parts[1].trim() };
  return {fr:s,en:s};
}
const CATEGORY_NAMES = {};

function optionGroup(o) {
  const choices = (o.choices || []).map(c => ({name:split(c.name),price:Number(c.priceModifier)||0,selected:!!c.default}));
  const min = o.type === 'radio' ? (o.required ? 1 : 0) : Number(o.min)||0;
  const max = o.type === 'radio' ? 1 : Number(o.max)||choices.length;
  return {name:split(o.name),min,max,required:!!o.required||min>0,
    fixed:min===choices.length && max===min && !o.allowQuantity,
    allowQuantity:!!o.allowQuantity,choiceMaxQuantity:o.choiceMaxQuantity||max,choices};
}

function slugify(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
}

// Display sizes pre-made on media.liasse.tech for every menu photo
// (command.restaurant menuArtRehost MENU_ITEM_VARIANTS) — using them costs
// no image transformations.
function photo(url, size) {
  const s = String(url || '');
  if (!s) return '';
  if (s.indexOf('media.liasse.tech/upload/') === -1) return s;
  const variant = size === 'thumb' ? 'c_fill,w_300,h_300,g_auto,q_auto,f_auto' : 'c_limit,w_400,q_auto,f_auto';
  return s.replace(/\/upload\/(?![a-z]_)/, '/upload/' + variant + '/');
}

// What the customer must choose, as short labels: « Choix de 2 salades » →
// « 2 salades ». Optional add-ons are left out (they are extras, not the dish).
function choiceLabel(name) {
  const p = split(name);
  return {
    fr: p.fr.replace(/^choix d['’]\s*/i, '').replace(/^choix de\s+/i, '').replace(/^\w/, (c) => c.toUpperCase()),
    en: p.en.replace(/^choice of\s+/i, '').replace(/^\w/, (c) => c.toUpperCase()),
  };
}

function normalize(feed) {
  const menu = feed && feed.menu;
  if (!menu || !Array.isArray(menu.items)) return null;
  const order = Array.isArray(menu.categoryOrder) ? menu.categoryOrder.slice() : [];
  const items = menu.items.filter((it) => it && it.name).map((it) => {
    const category = it.category || '';
    if (category && order.indexOf(category) === -1) order.push(category);
    const required = (Array.isArray(it.options) ? it.options : []).filter((o) => o && (o.required || (o.min != null && o.min >= 1)));
    // A required choice that costs more means the listed price is a starting price.
    const from = required.some((o) => (o.choices || []).some((c) => Number(c && c.priceModifier) > 0));
    const name = split(it.name);
    const desc = split(it.description);
    return {
      id: it.id,
      sourceName: it.name,
      name: name.fr === 'Salade Grecque' ? {fr:name.fr,en:'Greek Salad'} : name,
      description: desc.fr === name.fr && desc.en === name.en ? { fr: '', en: '' } : desc,
      price: Number(it.price) || 0,
      from,
      category,
      image: photo(it.imageUrl, 'card'),
      thumb: photo(it.imageUrl, 'thumb'),
      choices: required.map((o) => choiceLabel(o.name)),
      groups: (it.options || []).map(optionGroup),
    };
  });
  if (!items.length) return null;
  const categories = order.filter((c) => items.some((it) => it.category === c)).map((c) => {
    const label = CATEGORY_NAMES[c] || split(c);
    return { key: c, label, slug: slugify(label.fr), items: items.filter((it) => it.category === c) };
  });
  return { categories, count: items.length };
}

const FALLBACK_MENU = normalize(FALLBACK);

async function load(fetchImpl) {
  try {
    if (!fetchImpl) throw new Error('fetch unavailable');
    const r = await fetchImpl(FEED_URL, { signal: AbortSignal.timeout(4000), headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const next = normalize(await r.json());
    if (!next) throw new Error('feed has no dishes');
    cache.menu = next;
    cache.nextAt = Date.now() + TTL_MS;
  } catch (e) {
    console.error('[menu] command.restaurant feed:', e.message);
    cache.nextAt = Date.now() + RETRY_MS;
  }
}

async function getMenu(fetchImpl) {
  if (!cache.pending && Date.now() >= cache.nextAt) {
    cache.pending = load(fetchImpl).then(() => { cache.pending = null; });
  }
  // Only the first read after a deploy is waited on (nextAt is still 0);
  // after that pages answer at once and the copy refreshes behind the scenes.
  if (cache.pending && cache.nextAt === 0) await cache.pending;
  return cache.menu || FALLBACK_MENU;
}

module.exports = { getMenu, split, normalize, ORDER_URL, FEED_URL };
