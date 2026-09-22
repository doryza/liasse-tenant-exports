const S = require('./settings');

function imageOK(value) { if (!value) return true; try { return new URL(value).protocol === 'https:'; } catch (e) { return false; } }

/** Coerce + validate one admin form body against its module field spec. */
function clean(module, body, old = {}) {
  const out = {};
  for (const f of module.fields) {
    if (f.type === 'readonly') continue;
    let v = Object.prototype.hasOwnProperty.call(body, f.name) ? body[f.name] : old[f.name];
    if (f.type === 'boolean') {
      v = (v === true || v === 1 || v === '1') ? 1 : 0;
    } else if (f.type === 'number') {
      v = (v === '' || v == null) ? null : Number(v);
      if (v != null && (!Number.isInteger(v) || v < f.min || v > f.max)) throw S.error('invalid');
    } else if (f.type === 'list') {
      if (Array.isArray(v)) v = JSON.stringify(v.map((x) => String(x).trim()).filter(Boolean));
      else { const s = String(v == null ? '' : v).trim(); v = s ? (s.startsWith('[') ? s : JSON.stringify(s.split('\n').map((x) => x.trim()).filter(Boolean))) : ''; }
      try { if (v) JSON.parse(v); } catch (e) { throw S.error('invalid'); }
    } else {
      v = v == null ? '' : String(v).trim();
      if (f.maxLength && v.length > f.maxLength) throw S.error('invalid');
      if (f.type === 'select' && v && !f.options.includes(v)) throw S.error('invalid');
      if (f.type === 'image' && !imageOK(v)) throw S.error('invalid');
      if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw S.error('invalid');
      if (f.type === 'date' && v) v = v.slice(0, 10);
      if (f.type === 'date' && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw S.error('invalid');
      if (f.name === 'slug' && v) v = S.slugify(v);
    }
    if (f.required && (v === '' || v == null)) throw S.error('required');
    out[f.name] = v;
  }
  if (module.key === 'hours' && !out.closed) {
    const ok = (x) => /^([01]\d|2[0-3]):[0-5]\d$/.test(x);
    if (!ok(out.opens) || !ok(out.closes) || out.closes <= out.opens) throw S.error('invalid');
  }
  if (module.key === 'services' && out.price_verified && !(out.price_from_cents > 0)) throw S.error('invalid');
  return out;
}

async function save(db, module, body, id) {
  const old = id ? await db.get('SELECT * FROM ' + module.key + ' WHERE id=$1', [id]) : {};
  if (id && !old) throw S.error('not_found', 404);
  const data = clean(module, body, old);
  if (Object.prototype.hasOwnProperty.call(data, 'slug') && !data.slug) data.slug = S.slugify(data.name) || null;
  const keys = Object.keys(data); const values = Object.values(data);
  if (id) {
    values.push(id);
    return await db.get('UPDATE ' + module.key + ' SET ' + keys.map((k, i) => k + '=$' + (i + 1)).join(',') + ',updated_at=NOW() WHERE id=$' + values.length + ' RETURNING *', values);
  }
  return await db.get('INSERT INTO ' + module.key + '(' + keys.join(',') + ') VALUES(' + values.map((_, i) => '$' + (i + 1)).join(',') + ') RETURNING *', values);
}

module.exports = { clean, save, imageOK };
