/**
 * Vehicle data helpers. VIN decoding and model lists come from NHTSA's free
 * vPIC service (https://vpic.nhtsa.dot.gov/api/) — no key, public data. The
 * results are cached in memory; any failure falls back to manual entry.
 */
const MAKES = ['Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Polestar', 'Porsche', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'];

const cache = new Map();
function remember(key, value) { cache.set(key, { at: Date.now(), value }); if (cache.size > 500) cache.delete(cache.keys().next().value); return value; }
function recall(key, ttl = 86400000) { const x = cache.get(key); return x && Date.now() - x.at < ttl ? x.value : undefined; }

function cleanVin(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function validVin(v) { return /^[A-HJ-NPR-Z0-9]{17}$/.test(v); }

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
      ? { ok: true, vin, year, make, model: r.Model || '', trim: [r.Trim, r.Series].filter(Boolean).join(' ').slice(0, 80), engine: [r.DisplacementL ? Number(r.DisplacementL).toFixed(1) + ' L' : '', r.EngineCylinders ? r.EngineCylinders + ' cyl.' : '', r.FuelTypePrimary || ''].filter(Boolean).join(' · ') }
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

  return { decodeVin, models, MAKES };
};
module.exports.MAKES = MAKES;
module.exports.cleanVin = cleanVin;
module.exports.validVin = validVin;
