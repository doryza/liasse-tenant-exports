'use strict';
/**
 * Estimates and invoices (optional module, switched on by documents_enabled).
 *
 *  - Estimate: numbered when created (E2026-0001). draft → sent → accepted | declined.
 *    An accepted estimate becomes an invoice with one click (status « invoiced »).
 *    The customer opens a private link (document/<token>) to accept or decline it,
 *    with their typed name; it expires after valid_until.
 *  - Invoice: numbered only when issued (F2026-0001) and never deleted after that —
 *    a mistake is cancelled (void) and a corrected copy made. draft → unpaid → paid | void.
 *
 * Money is integer cents. Totals are always recomputed here from the lines; the
 * browser's arithmetic is a preview only. Taxes: the province's (lib/region.js) on the
 * subtotal, each rounded to the cent, unless the document says the business does not charge
 * them. Two slots are stored: tps_cents (GST or HST) and tvq_cents (QST, PST or RST), with
 * the rates used in tax_rates, so a document keeps its taxes if a rate changes later. A
 * document without tax_rates was made in Québec, before regions. The licence number, when
 * known, is printed on every document.
 */
const crypto = require('crypto');
const region = require('./region');

const TPS = 0.05, TVQ = 0.09975;
const QC_RATES = [TPS, TVQ];
const KINDS = ['labour', 'material', 'fee', 'note'];
const ESTIMATE = ['draft', 'sent', 'accepted', 'declined', 'invoiced'];
const INVOICE = ['draft', 'unpaid', 'paid', 'void'];
const METHODS = ['interac', 'cash', 'debit', 'credit', 'cheque', 'other'];

function fail(code, status = 400) { return Object.assign(new Error(code), { code, status }); }

/** "89,95" · "89.95" · "1 234,50 $" · 89.95 → 8995; '' → null; junk → NaN. */
function parseMoney(value) {
 if (value == null || value === '') return null;
 if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value * 100) : NaN;
 let s = String(value).replace(/[\s  $]/g, '');
 if (!s) return null;
 if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
 else s = s.replace(',', '.');
 if (!/^-?\d+(\.\d{0,2})?$/.test(s)) return NaN;
 return Math.round(Number(s) * 100);
}
function parseQty(value) {
 if (value == null || value === '') return 1;
 const s = String(value).replace(/\s/g, '').replace(',', '.');
 if (!/^\d+(\.\d{0,2})?$/.test(s)) return NaN;
 return Math.round(Number(s) * 100) / 100;
}
const round = x => (x ? Math.round(x + (x > 0 ? 1e-9 : -1e-9)) : 0);

function cleanLine(raw, i) {
 const kind = KINDS.includes(raw && raw.kind) ? raw.kind : 'labour';
 const description = String((raw && raw.description) || '').trim().slice(0, 500);
 if (!description) return null;
 if (kind === 'note') return { position: i, kind, description, quantity: 0, unit_cents: 0, total_cents: 0 };
 const quantity = parseQty(raw.quantity), unit = parseMoney(raw.unit);
 if (!Number.isFinite(quantity) || quantity < 0 || quantity > 9999) throw Object.assign(fail('invalid_quantity'), { line: i });
 if (!Number.isFinite(unit) || unit === null || Math.abs(unit) > 10000000) throw Object.assign(fail('invalid_price'), { line: i });
 return { position: i, kind, description, quantity, unit_cents: unit, total_cents: round(quantity * unit) };
}

function totals(lines, chargeTaxes = true, rates = QC_RATES) {
 const subtotal = lines.reduce((s, l) => s + (l.kind === 'note' ? 0 : l.total_cents), 0);
 const tps = chargeTaxes ? round(subtotal * (rates[0] || 0)) : 0, tvq = chargeTaxes ? round(subtotal * (rates[1] || 0)) : 0;
 return { subtotal, tps, tvq, total: subtotal + tps + tvq, rates: rates.slice(0, 2) };
}
/** The rates a document was computed with. */
function ratesOf(doc) {
 try { const r = JSON.parse(doc.tax_rates || 'null'); if (Array.isArray(r) && r.length && r.every(x => typeof x === 'number' && x >= 0 && x < 1)) return r; } catch (_) { /* old row */ }
 return QC_RATES;
}
/** Printable tax lines: [{ label: 'TVH (13 %)', number, cents }]. Labels follow the site's province. */
function taxLines(doc, r, lang, b = {}) {
 const rates = ratesOf(doc);
 const numbers = [b.tps, b.tvq];
 return rates.map((rate, i) => {
  const t = r.taxes[i] || (i === 0 ? { label: { fr: 'TPS', en: 'GST' } } : { label: { fr: 'TVQ', en: 'QST' } });
  return { label: `${t.label[lang]} (${region.percent(rate, lang)})`, number: numbers[i] || '', cents: Number(i === 0 ? doc.tps_cents : doc.tvq_cents) || 0 };
 });
}
function money(cents, lang) {
 return new Intl.NumberFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD' }).format((Number(cents) || 0) / 100);
}
function qty(value, lang) { return new Intl.NumberFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { maximumFractionDigits: 2 }).format(Number(value) || 0); }
const token = () => crypto.randomBytes(18).toString('base64url');

const COLS = `d.*, to_char(d.issued_on,'YYYY-MM-DD') AS issued_on, to_char(d.valid_until,'YYYY-MM-DD') AS valid_until,
 to_char(d.due_on,'YYYY-MM-DD') AS due_on, to_char(d.paid_on,'YYYY-MM-DD') AS paid_on`;

module.exports = function (db, { invoicePrefix = 'F' } = {}) {
 async function nextNumber(kind, year) {
  const row = await db.get(`INSERT INTO document_counters(kind, next_number) VALUES($1, 2)
   ON CONFLICT(kind) DO UPDATE SET next_number = document_counters.next_number + 1 RETURNING next_number - 1 AS n`, [kind + ':' + year]);
  return (kind === 'invoice' ? invoicePrefix : 'E') + year + '-' + String(row.n).padStart(4, '0');
 }
 async function lines(id) {
  return (await db.all('SELECT * FROM document_lines WHERE document_id = $1 ORDER BY position, id', [id])).map(l => ({ ...l, quantity: Number(l.quantity) }));
 }
 async function events(id) { return db.all('SELECT * FROM document_events WHERE document_id = $1 ORDER BY created_at DESC, id DESC LIMIT 50', [id]); }
 async function load(id) {
  const doc = await db.get(`SELECT ${COLS}, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone, c.address AS customer_address
   FROM documents d LEFT JOIN customers c ON c.id = d.customer_id WHERE d.id = $1`, [id]);
  if (!doc) return null;
  doc.lines = await lines(id);
  return doc;
 }
 async function byToken(t) {
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(String(t || ''))) return null;
  const row = await db.get('SELECT id FROM documents WHERE token = $1', [t]);
  return row ? load(row.id) : null;
 }
 async function writeLines(id, list) {
  await db.run('DELETE FROM document_lines WHERE document_id = $1', [id]);
  for (const l of list) {
   await db.run('INSERT INTO document_lines(document_id, position, kind, description, quantity, unit_cents, total_cents) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [id, l.position, l.kind, l.description, l.quantity, l.unit_cents, l.total_cents]);
  }
 }
 async function log(id, kind, detail = '') { await db.run('INSERT INTO document_events(document_id, kind, detail) VALUES($1, $2, $3)', [id, kind, String(detail).slice(0, 300)]); }
 return { nextNumber, load, byToken, lines, events, writeLines, log };
};

/** What the customer may do / sees. `today` = 'YYYY-MM-DD' on the business's clock. */
function customerState(doc, today) {
 if (doc.kind === 'estimate') {
  if (doc.status === 'accepted' || doc.status === 'invoiced') return 'accepted';
  if (doc.status === 'declined') return 'declined';
  if (doc.status === 'draft') return 'draft';
  if (doc.valid_until && doc.valid_until < today) return 'expired';
  return 'open';
 }
 if (doc.status === 'paid') return 'paid';
 if (doc.status === 'void') return 'void';
 if (doc.status === 'draft') return 'draft';
 return 'unpaid';
}

Object.assign(module.exports, { TPS, TVQ, QC_RATES, ratesOf, taxLines, KINDS, ESTIMATE, INVOICE, METHODS, fail, parseMoney, parseQty, cleanLine, totals, money, qty, token, customerState });
