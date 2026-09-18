exports.settings = async function(db) {
  const rows = await db.all('SELECT key,value FROM admin_settings');
  return Object.fromEntries(rows.map(row => [row.key,row.value]));
};
exports.validateSetting = function(body,t) {
  if (!body || typeof body.key !== 'string' || !['string','boolean','number'].includes(typeof body.value)) return t.invalidRequest;
  const allowed = ['business_name','contact_email','contact_phone','business_address','installation_name','installation_email','installation_phone','service_name','mail_delivery_enabled'];
  if (!allowed.includes(body.key) && !/^text_[a-zA-Z0-9_:-]{1,80}_(fr|en)$/.test(body.key) && !/^_p_[a-z0-9_]+_url$/.test(body.key)) return t.invalidRequest;
  const value = String(body.value);
  if (value.length > 12000) return t.tooLong;
  if (body.key.endsWith('_email') && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.emailInvalid;
  if (body.key.endsWith('_phone') && value && !/^[+()\d\s.\-]{6,32}$/.test(value)) return t.phoneInvalid;
  if (body.key.endsWith('_url') && value && !/^https:\/\//.test(value)) return t.imageInvalid;
  if (body.key === 'mail_delivery_enabled' && !['true','false'].includes(value)) return t.invalidRequest;
  return null;
};
exports.validate = function(module,body,t) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {error:t.invalidRequest};
  const data = {};
  for (const field of module.fields) {
    if (field.type === 'readonly') continue;
    let value = body[field.name];
    if (field.type === 'date' && value instanceof Date) {
      if (Number.isNaN(value.getTime())) return {error:field.label + ': ' + t.invalidValue};
      value = value.toISOString().slice(0,10);
    }
    if (field.type === 'boolean') value = value === true || value === 1 || value === '1' ? 1 : 0;
    else if (field.type === 'number') {
      value = value === '' || value === undefined || value === null ? (field.default === undefined ? 0 : field.default) : Number(value);
      if (!Number.isFinite(value) || (field.min !== undefined && value < field.min) || (field.max !== undefined && value > field.max) || (field.step === 1 && !Number.isInteger(value))) return {error:field.label + ': ' + t.invalidValue};
    } else {
      if (value === undefined || value === null) value = field.default || '';
      if (typeof value !== 'string') return {error:field.label + ': ' + t.invalidValue};
      value = value.trim();
      if (field.required && !value) return {error:field.label + ': ' + t.required};
      if (value.length > (field.maxLength || 12000)) return {error:field.label + ': ' + t.tooLong};
      if (field.type === 'select' && !field.options.includes(value)) return {error:field.label + ': ' + t.invalidValue};
      if (field.type === 'image' && value && !/^https:\/\//.test(value)) return {error:field.label + ': ' + t.imageInvalid};
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return {error:t.emailInvalid};
      if (module.key === 'requests' && field.name === 'phone' && !/^[+()\d\s.\-]{6,32}$/.test(value)) return {error:t.phoneInvalid};
      if (field.type === 'date') {
        if (value) {
          const date = new Date(value + 'T12:00:00Z');
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime()) || date.toISOString().slice(0,10) !== value) return {error:field.label + ': ' + t.invalidValue};
        } else value = null;
      }
    }
    data[field.name] = value;
  }
  return {data};
};