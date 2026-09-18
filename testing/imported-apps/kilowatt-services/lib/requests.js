exports.reasons = ['quote','maintenance','startup','repair','warranty','parts'];
exports.today = function() {
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get = key => parts.find(part => part.type === key).value;
  return get('year') + '-' + get('month') + '-' + get('day');
};
function escape(value) {
  return String(value || '').replace(/[&<>"']/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
exports.notify = async function(services,row,settings,req) {
  let state = 'disabled';
  if (req.get('x-preview') === '1' || services.config.isPreview === true) state = 'preview';
  else if (settings.mail_delivery_enabled === 'true' && services.config.contactEmail) {
    try {
      const installation = row.kind === 'quote' || row.reason === 'quote';
      const fields = [['Référence',row.reference],['Département',installation ? 'Installation — Jason' : 'Service après-vente'],['Nom',row.name],['Courriel',row.email],['Téléphone',row.phone],['Municipalité',row.municipality],['Clientèle',row.customer_type],['Motif',row.reason],['Date souhaitée, non confirmée',row.requested_date],['Période souhaitée',row.preferred_period],['Modèle',row.model],['Numéro de série',row.serial_number],['Projet',row.message]];
      let timer;
      try {
        await Promise.race([
          services.email.send({to:services.config.contactEmail,subject:(installation ? 'Installation' : 'Service après-vente') + ' — demande ' + row.reference,replyTo:{email:row.email},html:'<h2>Nouvelle demande Kilowatt Services</h2>' + fields.map(([key,value]) => '<p><strong>' + key + ':</strong> ' + escape(value) + '</p>').join('') + '<p>Cette demande ne confirme aucun rendez-vous.</p>'}),
          new Promise((resolve,reject) => { timer = setTimeout(() => reject(new Error('timeout')),12000); })
        ]);
      } finally { if (timer) clearTimeout(timer); }
      state = 'sent';
    } catch(e) { state = 'failed'; }
  }
  await services.db.run('UPDATE requests SET email_status = $1,updated_at = NOW() WHERE id = $2',[state,row.id]);
  return state;
};
exports.create = async function(services,req,res,kind) {
  const t = res.locals.t;
  const body = req.body || {};
  const errors = {};
  const data = {};
  const required = ['name','email','phone','municipality','customer_type'];
  const lengths = {name:120,email:254,phone:32,municipality:120,customer_type:20,message:4000,model:120,serial_number:120,preferred_period:20,requested_date:10,reason:30};
  Object.entries(lengths).forEach(([key,max]) => {
    const value = typeof body[key] === 'string' ? body[key].trim() : '';
    data[key] = value;
    if (required.includes(key) && !value) errors[key] = t.required;
    else if (value.length > max) errors[key] = t.tooLong;
  });
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = t.emailInvalid;
  if (data.phone && !/^[+()\d\s.\-]{6,32}$/.test(data.phone)) errors.phone = t.phoneInvalid;
  if (!['residential','commercial'].includes(data.customer_type)) errors.customer_type = t.required;
  data.reason = kind === 'quote' ? 'quote' : data.reason;
  if (!exports.reasons.includes(data.reason)) errors.reason = t.required;
  if (!['','flexible','morning','afternoon'].includes(data.preferred_period)) errors.preferred_period = t.invalidValue;
  if (data.requested_date) {
    const date = new Date(data.requested_date + 'T12:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.requested_date) || Number.isNaN(date.getTime()) || date.toISOString().slice(0,10) !== data.requested_date || data.requested_date < exports.today()) errors.requested_date = t.dateInvalid;
  }
  if (body.website) return res.status(400).json({error:t.invalidRequest});
  if (typeof body.request_key !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.request_key)) return res.status(400).json({error:t.invalidRequest});
  if (Object.keys(errors).length) return res.status(422).json({error:t.fixFields,fields:errors});
  const userId = req.user ? String(req.user.id) : null;
  const reference = services.crypto.randomUUID().slice(0,8).toUpperCase();
  const row = await services.db.get("INSERT INTO requests (request_key,reference,user_id,kind,name,email,phone,municipality,customer_type,reason,requested_date,preferred_period,model,serial_number,message,language) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT (request_key) DO NOTHING RETURNING *",[body.request_key,reference,userId,kind,data.name,data.email,data.phone,data.municipality,data.customer_type,data.reason,data.requested_date || null,data.preferred_period || 'flexible',data.model,data.serial_number,data.message,req.lang]);
  if (!row) {
    const existing = await services.db.get('SELECT reference,email_status,user_id FROM requests WHERE request_key = $1',[body.request_key]);
    if (!existing || (existing.user_id && existing.user_id !== userId)) return res.status(409).json({error:t.invalidRequest});
    return res.json({reference:existing.reference,email_status:existing.email_status,saved:true});
  }
  let state = 'pending';
  try { state = await exports.notify(services,row,res.locals.settings,req); } catch(e) {}
  res.status(201).json({reference:row.reference,email_status:state,saved:true});
};