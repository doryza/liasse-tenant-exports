'use strict';
/**
 * The back office: dashboard + launch checklist, requests inbox, customers, services,
 * hours and service area, settings, and the optional estimates & invoices module.
 *
 * Pages redirect visitors to the platform's admin login; every API sits behind
 * services.admin.isAdmin and the router's same-origin guard. Site TEXT (headings,
 * paragraphs) is edited in place with the Liasse inline editor (data-lk), not here.
 *
 * Offer-page trial (docs/PROSPECT_ADMIN_TRIAL.md): the platform runs this same admin with
 * a capability that cannot switch on messages_enabled / live_actions_enabled and that
 * blocks email. Those refusals arrive as 403 trial_action_disabled and are shown as
 * « available once the site is yours ».
 */
const S = require('./store');
const D = require('./documents');
const T = require('./i18n');

const TEXT = {
 business_name: 200, phone: 40, email: 200, notification_email: 200, business_address: 240, rbq: 20, neq: 20, tps_number: 40, tvq_number: 40,
 interac_email: 200, areas_fr: 400, areas_en: 400, payments_fr: 300, payments_en: 300, privacy_fr: 6000, privacy_en: 6000, doc_terms_fr: 2000, doc_terms_en: 2000,
};
const NUMBERS = { estimate_valid_days: [1, 365], invoice_due_days: [0, 120] };
const FLAGS = [...S.GATES, 'documents_enabled', 'address_public', 'free_estimates', 'rating_hidden', 'emergency_247', 'charge_taxes'];
const REQUEST_STATUS = ['new', 'contacted', 'done', 'lost'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isDate = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
const num = (raw, key, fallback) => { const n = Number(raw[key]); return raw[key] != null && raw[key] !== '' && Number.isFinite(n) ? n : fallback; };

function fail(code, status = 400) { return Object.assign(new Error(code), { code, status }); }

module.exports = function registerAdmin(router, ctx) {
 const { db, docs, mail, wrap, tenantPath, absolute, isOwner, store, clip } = ctx;

 router.use('/api/admin', wrap(async (req, res, next) => {
  if (!(await isOwner(req))) return res.status(403).json({ code: 'forbidden' });
  next();
 }));

 const docTerms = (raw, lang) => (raw['doc_terms_' + lang] || '').trim();
 const docDefaults = raw => ({ validDays: num(raw, 'estimate_valid_days', 30), dueDays: num(raw, 'invoice_due_days', 0), taxes: raw.charge_taxes !== '0' });

 function labels(lang) {
  const en = lang === 'en';
  return {
   request: en ? { new: 'New', contacted: 'Contacted', done: 'Work done', lost: 'No follow-up' } : { new: 'Nouvelle', contacted: 'Contact établi', done: 'Travaux faits', lost: 'Sans suite' },
   estimate: en ? { draft: 'Draft', sent: 'Sent', accepted: 'Accepted', declined: 'Declined', invoiced: 'Invoiced', expired: 'Expired' } : { draft: 'Brouillon', sent: 'Envoyée', accepted: 'Acceptée', declined: 'Refusée', invoiced: 'Facturée', expired: 'Expirée' },
   invoice: en ? { draft: 'Draft', unpaid: 'To be paid', paid: 'Paid', void: 'Cancelled' } : { draft: 'Brouillon', unpaid: 'À payer', paid: 'Payée', void: 'Annulée' },
   method: en ? { interac: 'Interac e-Transfer', cash: 'Cash', debit: 'Debit', credit: 'Credit card', cheque: 'Cheque', other: 'Other' } : { interac: 'Virement Interac', cash: 'Comptant', debit: 'Débit', credit: 'Carte de crédit', cheque: 'Chèque', other: 'Autre' },
   kind: en ? { labour: 'Labour', material: 'Materials', fee: 'Fee', note: 'Note' } : { labour: 'Main-d’œuvre', material: 'Matériel', fee: 'Frais', note: 'Note' },
   urgency: T[lang].urgency, property: T[lang].property,
   event: en ? { created: 'Created', sent: 'Sent', emailed: 'Emailed', viewed: 'Opened by the customer', accepted: 'Accepted', declined: 'Declined', invoiced: 'Converted to invoice', issued: 'Invoice issued', paid: 'Payment recorded', unpaid: 'Payment removed', void: 'Cancelled', reopened: 'Reopened' }
    : { created: 'Créée', sent: 'Envoyée', emailed: 'Envoyée par courriel', viewed: 'Ouverte par le client', accepted: 'Acceptée', declined: 'Refusée', invoiced: 'Convertie en facture', issued: 'Facture émise', paid: 'Paiement noté', unpaid: 'Paiement retiré', void: 'Annulée', reopened: 'Rouverte' },
  };
 }

 function checklist(b, raw, lang) {
  const en = lang === 'en';
  return [
   { key: 'contact', done: S.flag(raw, 'contact_verified'), href: 'admin/reglages#entreprise', label: en ? 'Check your phone number and email' : 'Vérifier votre téléphone et votre courriel' },
   { key: 'rbq', done: !!b.rbq, href: 'admin/reglages#entreprise', label: en ? 'Enter your RBQ licence number' : 'Inscrire votre numéro de licence RBQ' },
   { key: 'services', done: !b.services.some(s => s.state === 'proposed'), href: 'admin/services', label: en ? 'Confirm the services you offer' : 'Confirmer les services que vous offrez' },
   { key: 'hours', done: S.flag(raw, 'hours_verified'), href: 'admin/horaire', label: en ? 'Set your hours and service area' : 'Indiquer vos heures et votre secteur' },
   { key: 'privacy', done: S.flag(raw, 'privacy_approved'), href: 'admin/reglages#confidentialite', label: en ? 'Complete and approve your privacy policy' : 'Compléter et approuver votre politique de confidentialité' },
   { key: 'form', done: b.formLive, href: 'admin/reglages#lancement', label: en ? 'Open the online request form' : 'Ouvrir le formulaire de demande en ligne' },
   { key: 'email', done: b.liveEmail, href: 'admin/reglages#lancement', label: en ? 'Turn on emails to customers' : 'Activer les courriels aux clients' },
  ];
 }

 function adminPage(paths, view, section, load) {
  router.get(paths, wrap(async (req, res) => {
   if (!(await isOwner(req))) return res.redirect(tenantPath(req, '/admin/login'));
   const lang = req.lang, b = req.b;
   const extra = load ? await load(req, res) : {};
   if (extra && extra.redirect) return res.redirect(tenantPath(req, extra.redirect));
   const counts = await db.get(`SELECT (SELECT COUNT(*) FROM plumbing_requests WHERE status = 'new')::int AS requests,
    (SELECT COUNT(*) FROM documents WHERE kind = 'estimate' AND status = 'accepted')::int AS accepted,
    (SELECT COUNT(*) FROM documents WHERE kind = 'invoice' AND status = 'unpaid')::int AS unpaid`);
   res.set('Cache-Control', 'no-store');
   if (extra === null) res.status(404);
   res.render(extra === null ? 'admin/missing' : view, Object.assign({
    page: 'admin', section, navCounts: counts, L: labels(lang), stamp: v => S.stamp(v, lang), today: S.today(),
    tr: (fr, en) => (lang === 'en' ? en : fr), defaults: docDefaults(req.raw), json: v => JSON.stringify(v).replace(/</g, '\\u003c'), enc: encodeURIComponent,
    siteUrl: tenantPath(req, lang === 'en' ? '/en/' : '/'),
    // Offer-page trial (platform flag): the inline text editor and every send are unavailable.
    inTrial: !!req._prospectTrial,
   }, extra || {}));
  }));
 }

 // =================================================================== pages
 adminPage(['/admin', '/admin/'], 'admin/dashboard', 'dashboard', async req => ({
  steps: checklist(req.b, req.raw, req.lang),
  recent: await db.all('SELECT * FROM plumbing_requests ORDER BY created_at DESC LIMIT 6'),
  stats: req.b.documents ? await db.get(`SELECT (SELECT COUNT(*) FROM documents WHERE kind='estimate' AND status='sent')::int AS waiting,
   (SELECT COALESCE(SUM(total_cents),0) FROM documents WHERE kind='invoice' AND status='unpaid')::int AS due,
   (SELECT COALESCE(SUM(total_cents),0) FROM documents WHERE kind='invoice' AND status='paid' AND paid_on >= date_trunc('month', CURRENT_DATE))::int AS paid_month`) : null,
 }));

 adminPage('/admin/demandes', 'admin/requests', 'requests', async req => {
  const filter = ['new', 'open', 'closed', 'all'].includes(req.query.filtre) ? req.query.filtre : 'open';
  const where = { new: "status = 'new'", open: "status IN ('new','contacted')", closed: "status IN ('done','lost')", all: 'TRUE' }[filter];
  return { filter, requests: await db.all(`SELECT * FROM plumbing_requests WHERE ${where} ORDER BY created_at DESC LIMIT 300`) };
 });
 adminPage('/admin/demandes/:id', 'admin/request', 'requests', async req => {
  if (!/^\d+$/.test(req.params.id)) return null;
  const r = await db.get('SELECT * FROM plumbing_requests WHERE id = $1', [req.params.id]);
  if (!r) return null;
  const related = await db.all('SELECT id, kind, number, status, total_cents, title FROM documents WHERE request_id = $1 ORDER BY id', [r.id]);
  return { r, related, customer: r.customer_id ? await db.get('SELECT * FROM customers WHERE id = $1', [r.customer_id]) : null };
 });

 adminPage('/admin/documents', 'admin/documents', 'documents', async req => {
  if (!req.b.documents) return { list: [], kind: 'estimate', off: true };
  const kind = req.query.type === 'factures' ? 'invoice' : 'estimate';
  const list = await db.all(`SELECT d.id, d.kind, d.number, d.status, d.title, d.total_cents, to_char(d.valid_until,'YYYY-MM-DD') AS valid_until,
   to_char(d.issued_on,'YYYY-MM-DD') AS issued_on, d.created_at, d.viewed_at, c.name AS customer_name
   FROM documents d LEFT JOIN customers c ON c.id = d.customer_id WHERE d.kind = $1 ORDER BY d.id DESC LIMIT 300`, [kind]);
  return { list, kind, off: false };
 });
 adminPage('/admin/documents/:id', 'admin/document', 'documents', async req => {
  if (!/^\d+$/.test(req.params.id)) return null;
  const doc = await docs.load(req.params.id);
  if (!doc) return null;
  return {
   doc, events: await docs.events(doc.id), link: absolute(req, '/document/' + doc.token),
   customers: await db.all('SELECT id, name, email, phone, address FROM customers ORDER BY name LIMIT 500'),
   source: doc.source_id ? await db.get('SELECT id, kind, number FROM documents WHERE id = $1', [doc.source_id]) : null,
   children: await db.all('SELECT id, kind, number, status FROM documents WHERE source_id = $1 ORDER BY id', [doc.id]),
   state: D.customerState(doc, S.today()),
  };
 });

 adminPage('/admin/clients', 'admin/customers', 'customers', async req => {
  const q = clip(req.query.q, 80);
  const list = q
   ? await db.all("SELECT * FROM customers WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1 OR address ILIKE $1 ORDER BY name LIMIT 300", ['%' + q.replace(/[%_]/g, '') + '%'])
   : await db.all('SELECT * FROM customers ORDER BY created_at DESC LIMIT 300');
  return { list, q };
 });
 adminPage('/admin/clients/:id', 'admin/customer', 'customers', async req => {
  if (!/^\d+$/.test(req.params.id)) return null;
  const customer = await db.get('SELECT * FROM customers WHERE id = $1', [req.params.id]);
  if (!customer) return null;
  return {
   customer,
   requests: await db.all('SELECT * FROM plumbing_requests WHERE customer_id = $1 ORDER BY created_at DESC', [customer.id]),
   documents: await db.all("SELECT id, kind, number, status, title, total_cents FROM documents WHERE customer_id = $1 ORDER BY id DESC", [customer.id]),
  };
 });
 adminPage('/admin/services', 'admin/services', 'services');
 adminPage('/admin/horaire', 'admin/hours', 'hours');
 adminPage('/admin/reglages', 'admin/settings', 'settings');
 for (const [from, to] of Object.entries({ '/admin/settings': '/admin/reglages', '/admin/requests': '/admin/demandes', '/admin/hours': '/admin/horaire' })) {
  router.get(from, (req, res) => res.redirect(301, tenantPath(req, to)));
 }

 // =================================================================== settings
 router.put('/api/admin/settings', wrap(async (req, res) => {
  const x = req.body || {};
  if (!x || typeof x !== 'object' || Array.isArray(x)) throw fail('invalid');
  const entries = [];
  for (const [key, value] of Object.entries(x)) {
   if (typeof value !== 'string') throw fail('invalid');
   if (FLAGS.includes(key)) { if (!['0', '1'].includes(value)) throw fail('invalid'); }
   else if (NUMBERS[key]) { const n = Number(value), [lo, hi] = NUMBERS[key]; if (!/^\d+$/.test(value) || n < lo || n > hi) throw Object.assign(fail('invalid'), { field: key }); }
   else if (TEXT[key]) { if (value.length > TEXT[key]) throw Object.assign(fail('too_long'), { field: key }); }
   else throw Object.assign(fail('unknown_setting'), { field: key });
   const v = value.trim();
   if (key === 'phone' && (!/^\+?[\d ().-]{10,40}$/.test(v) || v.replace(/\D/g, '').length < 10)) throw Object.assign(fail('invalid_phone'), { field: key });
   if (['email', 'notification_email', 'interac_email'].includes(key) && v && !EMAIL.test(v)) throw Object.assign(fail('invalid_email'), { field: key });
   if (key === 'business_name' && !v) throw Object.assign(fail('required'), { field: key });
   if (key === 'rbq' && v && !/^\d{4}-?\d{4}-?\d{2}$/.test(v)) throw Object.assign(fail('invalid_rbq'), { field: key });
   entries.push([key, key === 'rbq' && v ? v.replace(/\D/g, '').replace(/^(\d{4})(\d{4})(\d{2})$/, '$1-$2-$3') : (FLAGS.includes(key) ? value : v)]);
  }
  // Approving the privacy policy needs both languages complete (no [placeholders] left).
  const after = { ...req.raw, ...Object.fromEntries(entries) };
  const b = S.business(after);
  if (after.privacy_approved === '1' && !b.privacyComplete) {
   if (x.privacy_approved === '1') throw fail('privacy_incomplete', 409);
   entries.push(['privacy_approved', '0']);
  }
  await store.put(entries);
  const fresh = S.business({ ...req.raw, ...Object.fromEntries(entries) });
  res.json({ ok: true, formLive: fresh.formLive, privacyComplete: fresh.privacyComplete, privacyApproved: entries.some(([k, v]) => k === 'privacy_approved' && v === '0') ? false : undefined });
 }));

 router.put('/api/admin/services/:id', wrap(async (req, res) => {
  const s = req.b.services.find(x => x.id === req.params.id);
  if (!s) throw fail('not_found', 404);
  const x = req.body || {};
  const entries = [];
  if (x.state != null) { if (!S.STATES.includes(x.state)) throw fail('invalid'); entries.push(['service_' + s.id, x.state]); }
  if (x.price != null) {
   const cents = D.parseMoney(x.price);
   if (cents !== null && (!Number.isFinite(cents) || cents < 0 || cents > 10000000)) throw Object.assign(fail('invalid_price'), { field: 'price' });
   entries.push(['service_' + s.id + '_price', cents === null ? '' : String(cents)]);
  }
  await store.put(entries);
  res.json({ ok: true });
 }));

 router.put('/api/admin/hours', wrap(async (req, res) => {
  const x = req.body || {};
  const entries = [];
  if (x.hours !== undefined) {
   if (x.hours === null) entries.push(['hours_json', '']);
   else {
    if (typeof x.hours !== 'object' || Array.isArray(x.hours)) throw fail('invalid');
    const out = {};
    for (let d = 1; d <= 7; d++) {
     const v = x.hours[d];
     if (v == null) { out[d] = null; continue; }
     if (!Array.isArray(v) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v[0]) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v[1]) || v[0] >= v[1]) throw Object.assign(fail('invalid_hours'), { field: 'day' + d });
     out[d] = [v[0], v[1]];
    }
    entries.push(['hours_json', JSON.stringify(out)]);
   }
  }
  for (const k of ['emergency_247', 'hours_verified']) if (x[k] != null) { if (!['0', '1'].includes(x[k])) throw fail('invalid'); entries.push([k, x[k]]); }
  for (const k of ['areas_fr', 'areas_en']) if (x[k] != null) { if (typeof x[k] !== 'string' || x[k].length > 400) throw fail('invalid'); entries.push([k, x[k].trim()]); }
  await store.put(entries);
  res.json({ ok: true });
 }));

 // =================================================================== requests + customers
 router.post('/api/admin/requests', wrap(async (req, res) => {
  const x = req.body || {};
  const name = clip(x.name, 120), phone = clip(x.phone, 40), message = clip(x.message, 3000);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 7 || !message) throw Object.assign(fail('invalid'), { fields: ['name', 'phone', 'message'] });
  const email = clip(x.email, 200).toLowerCase();
  if (email && !EMAIL.test(email)) throw Object.assign(fail('invalid_email'), { field: 'email' });
  const serviceId = req.b.services.some(s => s.id === x.service_id) ? x.service_id : null;
  const row = await db.get(`INSERT INTO plumbing_requests(name, phone, email, address, service_id, urgency, message, language, source, status)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,'phone','contacted') RETURNING id`,
  [name, phone, email || null, clip(x.address, 300), serviceId, ctx.URGENCY.includes(x.urgency) ? x.urgency : 'soon', message, x.language === 'en' ? 'en' : 'fr']);
  await db.run('UPDATE plumbing_requests SET reference = $1 WHERE id = $2', ['D-' + String(row.id).padStart(4, '0'), row.id]);
  res.status(201).json({ id: row.id });
 }));
 router.put('/api/admin/requests/:id', wrap(async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) throw fail('not_found', 404);
  const x = req.body || {};
  if (x.status != null && !REQUEST_STATUS.includes(x.status)) throw fail('invalid');
  const row = await db.get(`UPDATE plumbing_requests SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW() WHERE id = $3 RETURNING id`,
   [x.status || null, typeof x.notes === 'string' ? x.notes.slice(0, 4000) : null, req.params.id]);
  if (!row) throw fail('not_found', 404);
  res.json({ ok: true });
 }));

 async function customerFromRequest(id) {
  const r = await db.get('SELECT * FROM plumbing_requests WHERE id = $1', [id]);
  if (!r) throw fail('not_found', 404);
  if (r.customer_id) return r.customer_id;
  const same = r.email ? await db.get('SELECT id FROM customers WHERE lower(email) = lower($1) LIMIT 1', [r.email])
   : await db.get("SELECT id FROM customers WHERE regexp_replace(phone, '\\D', '', 'g') = regexp_replace($1, '\\D', '', 'g') LIMIT 1", [r.phone]);
  const cid = same ? same.id : (await db.get('INSERT INTO customers(name, phone, email, address, language) VALUES($1,$2,$3,$4,$5) RETURNING id', [r.name, r.phone, r.email, r.address, r.language])).id;
  await db.run('UPDATE plumbing_requests SET customer_id = $1, updated_at = NOW() WHERE id = $2', [cid, r.id]);
  return cid;
 }
 function cleanCustomer(x) {
  const c = { name: clip(x.name, 160), phone: clip(x.phone, 40), email: clip(x.email, 200).toLowerCase(), address: clip(x.address, 300), language: x.language === 'en' ? 'en' : 'fr', notes: clip(x.notes, 4000) };
  if (c.name.length < 2) throw Object.assign(fail('invalid'), { field: 'name' });
  if (c.email && !EMAIL.test(c.email)) throw Object.assign(fail('invalid_email'), { field: 'email' });
  return c;
 }
 router.post('/api/admin/requests/:id/customer', wrap(async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) throw fail('not_found', 404);
  res.json({ id: await customerFromRequest(req.params.id) });
 }));
 router.post('/api/admin/customers', wrap(async (req, res) => {
  const c = cleanCustomer(req.body || {});
  const row = await db.get('INSERT INTO customers(name, phone, email, address, language, notes) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', [c.name, c.phone || null, c.email || null, c.address || null, c.language, c.notes || null]);
  res.status(201).json({ id: row.id });
 }));
 router.put('/api/admin/customers/:id', wrap(async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) throw fail('not_found', 404);
  const c = cleanCustomer(req.body || {});
  const row = await db.get('UPDATE customers SET name=$1, phone=$2, email=$3, address=$4, language=$5, notes=$6, updated_at=NOW() WHERE id=$7 RETURNING id', [c.name, c.phone || null, c.email || null, c.address || null, c.language, c.notes || null, req.params.id]);
  if (!row) throw fail('not_found', 404);
  res.json({ ok: true });
 }));

 // =================================================================== documents
 function needModule(req) { if (!req.b.documents) throw fail('module_off', 409); }
 async function getDoc(id) {
  if (!/^\d+$/.test(String(id))) throw fail('not_found', 404);
  const doc = await docs.load(id);
  if (!doc) throw fail('not_found', 404);
  return doc;
 }
 const editable = doc => (doc.kind === 'estimate' ? ['draft', 'sent'].includes(doc.status) : doc.status === 'draft');

 router.post('/api/admin/documents', wrap(async (req, res) => {
  needModule(req);
  const x = req.body || {}, raw = req.raw, def = docDefaults(raw);
  const kind = x.kind === 'invoice' ? 'invoice' : 'estimate';
  let customerId = null, requestId = null, title = '', address = '', lang = 'fr', lines = [];
  if (x.request_id) {
   requestId = Number(x.request_id);
   customerId = await customerFromRequest(requestId);
   const r = await db.get('SELECT * FROM plumbing_requests WHERE id = $1', [requestId]);
   const svc = req.b.services.find(s => s.id === r.service_id);
   lang = r.language === 'en' ? 'en' : 'fr';
   title = svc ? svc.name[lang] : '';
   address = r.address || '';
  } else if (x.customer_id) {
   const c = await db.get('SELECT * FROM customers WHERE id = $1', [x.customer_id]);
   if (!c) throw fail('not_found', 404);
   customerId = c.id; address = c.address || ''; lang = c.language === 'en' ? 'en' : 'fr';
  }
  if (!lines.length) lines = [{ position: 0, kind: 'labour', description: lang === 'en' ? 'Labour' : 'Main-d’œuvre', quantity: 1, unit_cents: 0, total_cents: 0 }];
  const year = S.local().year;
  const number = kind === 'estimate' ? await docs.nextNumber('estimate', year) : null;
  const valid = kind === 'estimate' ? S.addDays(S.today(), def.validDays) : null;
  const row = await db.get(`INSERT INTO documents(kind, number, token, customer_id, request_id, status, language, title, property_address, issued_on, valid_until, charge_taxes, terms)
   VALUES($1,$2,$3,$4,$5,'draft',$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
  [kind, number, D.token(), customerId, requestId, lang, title, address, kind === 'estimate' ? S.today() : null, valid, def.taxes ? 1 : 0, docTerms(raw, lang) || null]);
  await docs.writeLines(row.id, lines);
  await docs.log(row.id, 'created');
  res.status(201).json({ id: row.id });
 }));

 router.put('/api/admin/documents/:id', wrap(async (req, res) => {
  const doc = await getDoc(req.params.id);
  const x = req.body || {};
  if (!editable(doc)) {
   // Notes stay editable on every document; nothing else once issued or decided.
   if (typeof x.notes === 'string') await db.run('UPDATE documents SET notes = $1, updated_at = NOW() WHERE id = $2', [x.notes.slice(0, 4000) || null, doc.id]);
   return res.json({ ok: true, locked: true });
  }
  let lines = doc.lines;
  if (Array.isArray(x.lines)) {
   if (x.lines.length > 80) throw fail('too_many_lines');
   lines = x.lines.map((l, i) => D.cleanLine(l, i)).filter(Boolean).map((l, i) => ({ ...l, position: i }));
  }
  const taxes = x.charge_taxes == null ? !!doc.charge_taxes : !!x.charge_taxes;
  const tot = D.totals(lines, taxes);
  let customerId = doc.customer_id;
  if (x.customer_id !== undefined) {
   if (x.customer_id === null || x.customer_id === '') customerId = null;
   else { const c = await db.get('SELECT id FROM customers WHERE id = $1', [x.customer_id]); if (!c) throw fail('not_found', 404); customerId = c.id; }
  }
  for (const k of ['valid_until', 'due_on']) if (x[k] && !isDate(x[k])) throw Object.assign(fail('invalid_date'), { field: k });
  await db.run(`UPDATE documents SET customer_id=$1, language=$2, title=$3, property_address=$4, valid_until=$5, due_on=$6, charge_taxes=$7,
   terms=$8, notes=$9, subtotal_cents=$10, tps_cents=$11, tvq_cents=$12, total_cents=$13, updated_at=NOW() WHERE id=$14`, [
   customerId, x.language === 'en' ? 'en' : x.language === 'fr' ? 'fr' : doc.language, clip(x.title ?? doc.title, 200), clip(x.property_address ?? doc.property_address ?? '', 300),
   doc.kind === 'estimate' ? (x.valid_until || doc.valid_until) : null, doc.kind === 'invoice' ? (x.due_on || doc.due_on || null) : null, taxes ? 1 : 0,
   typeof x.terms === 'string' ? x.terms.slice(0, 2000) || null : doc.terms, typeof x.notes === 'string' ? x.notes.slice(0, 4000) || null : doc.notes,
   tot.subtotal, tot.tps, tot.tvq, tot.total, doc.id]);
  await docs.writeLines(doc.id, lines);
  res.json({ ok: true, totals: tot });
 }));

 router.post('/api/admin/documents/:id/send', wrap(async (req, res) => {
  const doc = await getDoc(req.params.id);
  if (doc.kind === 'invoice' && doc.status === 'draft') throw fail('issue_first', 409);
  if (doc.kind === 'estimate' && !['draft', 'sent'].includes(doc.status)) throw fail('closed', 409);
  if (!doc.customer_id) throw fail('no_customer', 409);
  if (doc.status === 'draft') {
   await db.run("UPDATE documents SET status = 'sent', sent_at = NOW(), updated_at = NOW() WHERE id = $1", [doc.id]);
   await docs.log(doc.id, 'sent');
  }
  const link = absolute(req, '/document/' + doc.token);
  let email = { skipped: 'not_requested' };
  if ((req.body || {}).email && req._prospectTrial) email = { blocked: true };
  else if ((req.body || {}).email) {
   email = await mail.documentToCustomer(req.b, await docs.load(doc.id), link);
   if (email.sent) { await db.run('UPDATE documents SET sent_at = NOW() WHERE id = $1', [doc.id]); await docs.log(doc.id, 'emailed', doc.customer_email); }
  }
  res.json({ ok: true, link, email });
 }));

 router.post('/api/admin/documents/:id/status', wrap(async (req, res) => {
  const doc = await getDoc(req.params.id);
  const to = (req.body || {}).status;
  if (doc.kind !== 'estimate' || !['accepted', 'declined', 'sent'].includes(to)) throw fail('invalid');
  if (to === 'sent' ? !['accepted', 'declined'].includes(doc.status) : !['draft', 'sent'].includes(doc.status)) throw fail('closed', 409);
  await db.run(`UPDATE documents SET status = $1, decided_at = ${to === 'sent' ? 'NULL' : 'NOW()'}, decided_name = $2, sent_at = COALESCE(sent_at, NOW()), updated_at = NOW() WHERE id = $3`,
   [to, to === 'accepted' ? clip((req.body || {}).name, 120) || (req.lang === 'en' ? 'Recorded by the business' : 'Noté par l’entreprise') : null, doc.id]);
  await docs.log(doc.id, to === 'sent' ? 'reopened' : to, req.lang === 'en' ? 'by the business' : 'par l’entreprise');
  res.json({ ok: true });
 }));

 async function cloneDoc(doc, kind, raw, sourceId = null) {
  const def = docDefaults(raw);
  const year = S.local().year;
  const number = kind === 'estimate' ? await docs.nextNumber('estimate', year) : null;
  const row = await db.get(`INSERT INTO documents(kind, number, token, customer_id, request_id, source_id, status, language, title, property_address, issued_on, valid_until,
   charge_taxes, subtotal_cents, tps_cents, tvq_cents, total_cents, terms, notes)
   VALUES($1,$2,$3,$4,$5,$6,'draft',$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING id`,
  [kind, number, D.token(), doc.customer_id, doc.request_id, sourceId, doc.language, doc.title, doc.property_address, kind === 'estimate' ? S.today() : null,
   kind === 'estimate' ? S.addDays(S.today(), def.validDays) : null, doc.charge_taxes, doc.subtotal_cents, doc.tps_cents, doc.tvq_cents, doc.total_cents,
   kind === 'invoice' ? (doc.terms || docTerms(raw, doc.language) || null) : doc.terms, null]);
  await docs.writeLines(row.id, doc.lines);
  await docs.log(row.id, 'created', doc.number || '');
  return row.id;
 }
 router.post('/api/admin/documents/:id/invoice', wrap(async (req, res) => {
  needModule(req);
  const doc = await getDoc(req.params.id);
  if (doc.kind !== 'estimate' || doc.status !== 'accepted') throw fail('accept_first', 409);
  const id = await cloneDoc(doc, 'invoice', req.raw, doc.id);
  await db.run("UPDATE documents SET status = 'invoiced', updated_at = NOW() WHERE id = $1", [doc.id]);
  await docs.log(doc.id, 'invoiced');
  res.status(201).json({ id });
 }));
 router.post('/api/admin/documents/:id/duplicate', wrap(async (req, res) => {
  needModule(req);
  const doc = await getDoc(req.params.id);
  res.status(201).json({ id: await cloneDoc(doc, doc.kind, req.raw) });
 }));
 router.post('/api/admin/documents/:id/issue', wrap(async (req, res) => {
  const doc = await getDoc(req.params.id);
  if (doc.kind !== 'invoice' || doc.status !== 'draft') throw fail('closed', 409);
  if (!doc.customer_id) throw fail('no_customer', 409);
  if (!doc.lines.some(l => l.kind !== 'note')) throw fail('empty', 409);
  const number = await docs.nextNumber('invoice', S.local().year);
  const due = doc.due_on || (docDefaults(req.raw).dueDays ? S.addDays(S.today(), docDefaults(req.raw).dueDays) : null);
  await db.run("UPDATE documents SET status = 'unpaid', number = $1, issued_on = CURRENT_DATE, due_on = $2, sent_at = COALESCE(sent_at, NOW()), updated_at = NOW() WHERE id = $3", [number, due, doc.id]);
  await docs.log(doc.id, 'issued', number);
  res.json({ ok: true, number });
 }));
 router.post('/api/admin/documents/:id/payment', wrap(async (req, res) => {
  const doc = await getDoc(req.params.id);
  const x = req.body || {};
  if (doc.kind !== 'invoice') throw fail('invalid');
  if (x.undo) {
   if (doc.status !== 'paid') throw fail('closed', 409);
   await db.run("UPDATE documents SET status = 'unpaid', paid_on = NULL, payment_method = NULL, updated_at = NOW() WHERE id = $1", [doc.id]);
   await docs.log(doc.id, 'unpaid');
   return res.json({ ok: true });
  }
  if (doc.status !== 'unpaid') throw fail('closed', 409);
  if (!D.METHODS.includes(x.method) || (x.paid_on && !isDate(x.paid_on))) throw fail('invalid');
  await db.run("UPDATE documents SET status = 'paid', paid_on = $1, payment_method = $2, updated_at = NOW() WHERE id = $3", [x.paid_on || S.today(), x.method, doc.id]);
  await docs.log(doc.id, 'paid', labels(req.lang).method[x.method]);
  res.json({ ok: true });
 }));
 router.post('/api/admin/documents/:id/void', wrap(async (req, res) => {
  const doc = await getDoc(req.params.id);
  if (doc.kind !== 'invoice' || doc.status !== 'unpaid') throw fail('closed', 409);
  await db.run("UPDATE documents SET status = 'void', updated_at = NOW() WHERE id = $1", [doc.id]);
  await docs.log(doc.id, 'void');
  res.json({ ok: true });
 }));
 router.delete('/api/admin/documents/:id', wrap(async (req, res) => {
  const doc = await getDoc(req.params.id);
  // A numbered invoice is never deleted (cancel it instead). Estimates and invoice drafts may go.
  if (doc.kind === 'invoice' && doc.number) throw fail('numbered', 409);
  if (doc.kind === 'estimate' && doc.status === 'invoiced') throw fail('invoiced', 409);
  await db.run('UPDATE documents SET source_id = NULL WHERE source_id = $1', [doc.id]);
  await db.run('DELETE FROM documents WHERE id = $1', [doc.id]);
  res.json({ ok: true });
 }));
};
