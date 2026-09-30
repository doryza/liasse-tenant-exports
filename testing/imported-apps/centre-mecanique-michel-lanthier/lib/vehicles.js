/**
 * Vehicle data helpers. VIN decoding and model lists come from NHTSA's free
 * vPIC service (https://vpic.nhtsa.dot.gov/api/) — no key, public data. The
 * results are cached in memory; any failure falls back to manual entry.
 *
 * A VIN can also be read off a photo (registration certificate, windshield
 * plate, door sticker) through the platform's metered services.ai.readImage.
 * The photo is sent once and never stored. The ninth character is the North
 * American check digit, which catches almost every misread character.
 */
const MAKES = ['Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Polestar', 'Porsche', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'];

const cache = new Map();
function remember(key, value) { cache.set(key, { at: Date.now(), value }); if (cache.size > 500) cache.delete(cache.keys().next().value); return value; }
function recall(key, ttl = 86400000) { const x = cache.get(key); return x && Date.now() - x.at < ttl ? x.value : undefined; }

function cleanVin(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function validVin(v) { return /^[A-HJ-NPR-Z0-9]{17}$/.test(v); }

// ISO 3779 / 49 CFR 565 check digit (position 9). Mandatory on North American
// vehicles since 1981; a VIN that fails it was mistyped or misread.
const VIN_VALUES = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
function vinChecks(v) {
  if (!validVin(v)) return false;
  let sum = 0;
  for (let i = 0; i < 17; i++) { const c = v[i]; sum += (/\d/.test(c) ? Number(c) : VIN_VALUES[c]) * VIN_WEIGHTS[i]; }
  const r = sum % 11;
  return v[8] === (r === 10 ? 'X' : String(r));
}
// VINs never contain I, O or Q, so a reader that saw one saw 1 or 0.
function ocrVin(v) { return cleanVin(v).replace(/[IO]/g, (c) => (c === 'I' ? '1' : '0')).replace(/Q/g, '0'); }

const PHOTO_PROMPT = 'Find the vehicle identification number (VIN, in French NIV) in this photo. '
  + 'It is 17 letters and digits and never contains the letters I, O or Q. It may be on a Québec registration certificate '
  + '(« certificat d’immatriculation », labelled NIV), an insurance card, the plate on the dashboard seen through the windshield, '
  + 'or the sticker on the driver door jamb. Put the VIN exactly as printed in candidates[0]; count its characters, there must be exactly 17 '
  + '(a repeated character like 99 or 000 is easy to under-count). If some characters are hard to read, '
  + 'add up to two alternative full readings after it. If no VIN is legible, set found to false and leave candidates empty. '
  + 'Ignore every other text in the photo (names, addresses, plate numbers).';
const PHOTO_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    found: { type: 'boolean' },
    candidates: { type: 'array', items: { type: 'string' } },
    where: { type: 'string', enum: ['registration', 'windshield', 'door_jamb', 'insurance', 'other', 'none'] },
  },
  required: ['found', 'candidates', 'where'],
};

module.exports = function (services) {
  const fetcher = services.fetch || (typeof fetch === 'function' ? fetch : null);

  async function getJson(url) {
    if (!fetcher) throw new Error('no_fetch');
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 6000) : null;
    try {
      const r = await fetcher(url, ctrl ? { signal: ctrl.signal } : {});
      if (!r.ok) throw new Error('http_' + r.status);
      return await r.json();
    } finally { if (timer) clearTimeout(timer); }
  }

  async function decodeVin(raw) {
    const vin = cleanVin(raw);
    if (!validVin(vin)) return { ok: false, reason: 'invalid' };
    const hit = recall('vin:' + vin);
    if (hit) return hit;
    const data = await getJson(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
    const r = (data && data.Results && data.Results[0]) || {};
    const year = Number(r.ModelYear) || null;
    const make = r.Make ? r.Make.replace(/\b([A-Z])([A-Z]+)\b/g, (m, a, b) => a + b.toLowerCase()) : '';
    const out = (year && make)
      ? { ok: true, vin, checked: vinChecks(vin), year, make, model: r.Model || '', trim: [r.Trim, r.Series].filter(Boolean).join(' ').slice(0, 80), engine: [r.DisplacementL ? Number(r.DisplacementL).toFixed(1) + ' L' : '', r.EngineCylinders ? r.EngineCylinders + ' cyl.' : '', r.FuelTypePrimary || ''].filter(Boolean).join(' · ') }
      : { ok: false, vin, reason: 'not_found' };
    return remember('vin:' + vin, out);
  }

  async function models(make, year) {
    const m = String(make || '').trim().slice(0, 40);
    const y = Number(year);
    if (!m || !(y >= 1981 && y <= 2100)) return [];
    const key = `models:${m.toLowerCase()}:${y}`;
    const hit = recall(key, 7 * 86400000);
    if (hit) return hit;
    // Cars, trucks and SUVs/vans only — a make like Honda also builds motorcycles.
    const types = ['car', 'truck', 'multipurpose passenger vehicle (mpv)'];
    const pages = await Promise.all(types.map((type) => getJson(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(m)}/modelyear/${y}/vehicletype/${encodeURIComponent(type)}?format=json`,
    ).catch(() => null)));
    const list = [...new Set(pages.flatMap((d) => (d && d.Results) || []).map((x) => x.Model_Name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return remember(key, list.slice(0, 200));
  }

  const canReadPhotos = !!(services.ai && typeof services.ai.readImage === 'function');

  /** Photo (data URL) → decoded vehicle, same shape as decodeVin plus `where`. */
  async function readVinPhoto(image) {
    if (!canReadPhotos) return { ok: false, reason: 'unavailable' };
    const answer = await services.ai.readImage({ image, prompt: PHOTO_PROMPT, schema: PHOTO_SCHEMA, name: 'vin_photo', detail: 'high', maxOutputTokens: 1500, effort: 'low' });
    const raw = ((answer && answer.found && answer.candidates) || []).slice(0, 3).map(ocrVin);
    const readings = [...new Set(raw.filter(validVin))];
    if (!readings.length) {
      // A near miss (a character dropped or doubled) still beats retyping:
      // hand it back for the visitor to correct in the field.
      const near = raw.find((v) => v.length >= 15 && v.length <= 19);
      return near ? { ok: false, reason: 'partial', vin: near.slice(0, 17) } : { ok: false, reason: 'no_vin' };
    }
    // Prefer a reading whose check digit holds; otherwise hand back the first
    // one flagged unchecked so the visitor looks at it before saving.
    const vin = readings.find(vinChecks) || readings[0];
    const decoded = await decodeVin(vin).catch(() => ({ ok: false, vin, reason: 'not_found' }));
    return { ...decoded, vin, checked: vinChecks(vin), where: answer.where };
  }

  return { decodeVin, readVinPhoto, canReadPhotos, models, MAKES };
};
module.exports.MAKES = MAKES;
module.exports.cleanVin = cleanVin;
module.exports.validVin = validVin;
module.exports.vinChecks = vinChecks;
module.exports.ocrVin = ocrVin;
