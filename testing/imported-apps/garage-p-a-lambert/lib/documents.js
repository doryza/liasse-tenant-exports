/**
 * Estimates (« évaluations écrites ») and invoices for the shop.
 *
 * What Québec's Consumer Protection Act asks of a garage (Office de la
 * protection du consommateur, « Garagistes, mécaniciens et carrossiers »):
 *
 *  - Evaluation (required over $100 unless the customer waives it in their
 *    own handwriting — so we never print a waiver): customer + garage name
 *    and address, vehicle make, model and plate, the nature of the repair,
 *    each part's condition (new, used, remanufactured or reconditioned), the
 *    total price, the date and how long the estimate stays valid. Once
 *    accepted it binds both sides.
 *  - Invoice: the same parties and vehicle, the delivery date and odometer,
 *    the work done, each part with its condition and price, labour hours ×
 *    hourly rate, federal and provincial taxes, the total and the warranty
 *    (legal minimum: 3 months or 5,000 km, parts, labour and reasonable
 *    towing — art. 176).
 *
 * Money is integer cents everywhere. Totals are always recomputed here from
 * the lines; the browser's arithmetic is only a preview.
 */
const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;
const LINE_KINDS = ['part', 'labour', 'fee', 'note'];
const CONDITIONS = ['new', 'used', 'reman', 'recond'];
const ESTIMATE_STATUSES = ['draft', 'sent', 'accepted', 'declined', 'invoiced'];
const INVOICE_STATUSES = ['draft', 'unpaid', 'paid', 'void'];
const PAYMENT_METHODS = ['cash', 'debit', 'credit', 'transfer', 'cheque'];

const LEGAL_WARRANTY = {
  fr: 'Garantie légale : les réparations sont garanties 3 mois ou 5 000 km, selon la première éventualité, à compter de la remise du véhicule. La garantie couvre les pièces, la main-d’œuvre et les frais de remorquage raisonnables (Loi sur la protection du consommateur, art. 176).',
  en: 'Legal warranty: repairs are guaranteed for 3 months or 5,000 km, whichever comes first, from the day the vehicle is handed back. It covers parts, labour and reasonable towing costs (Québec Consumer Protection Act, s. 176).',
};

/** "89,95" · "89.95" · "1 234,50 $" · 89.95 → 8995 cents; '' → null; junk → NaN. */
function parseMoney(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value * 100) : NaN;
  let s = String(value).replace(/[\s $]/g, '');
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else s = s.replace(',', '.');
  if (!/^-?\d+(\.\d{0,2})?$/.test(s)) return NaN;
  return Math.round(Number(s) * 100);
}

/** "1,5" → 1.5 (quantities and hours; two decimals max). */
function parseQty(value) {
  if (value == null || value === '') return 1;
  const s = String(value).replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return NaN;
  return Math.round(Number(s) * 100) / 100;
}

const roundCents = (x) => Math.round(x + (x > 0 ? 1e-9 : -1e-9));

/** Clean one incoming line; throws { code:'invalid' } on bad input. */
function cleanLine(raw, i) {
  const kind = LINE_KINDS.includes(raw && raw.kind) ? raw.kind : 'part';
  const description = String((raw && raw.description) || '').trim().slice(0, 500);
  if (!description) return null; // an empty row is simply dropped
  if (kind === 'note') return { position: i, kind, description, part_condition: null, part_number: null, quantity: 0, unit_cents: 0, total_cents: 0 };
  const quantity = parseQty(raw.quantity);
  const unit = parseMoney(raw.unit);
  if (!Number.isFinite(quantity) || quantity < 0 || quantity > 9999) throw Object.assign(new Error('invalid'), { code: 'invalid', status: 400, field: 'quantity', line: i });
  if (!Number.isFinite(unit) || unit === null || unit < -10000000 || unit > 10000000) throw Object.assign(new Error('invalid'), { code: 'invalid', status: 400, field: 'unit', line: i });
  const condition = kind === 'part' ? (CONDITIONS.includes(raw.part_condition) ? raw.part_condition : 'new') : null;
  return {
    position: i, kind, description,
    part_condition: condition,
    part_number: kind === 'part' ? String(raw.part_number || '').trim().slice(0, 60) || null : null,
    quantity, unit_cents: unit, total_cents: roundCents(quantity * unit),
  };
}

/** Lines → { subtotal, tps, tvq, total } in cents. Taxes on the subtotal, each rounded to the cent. */
function totals(lines, { chargeTaxes = true } = {}) {
  const subtotal = lines.reduce((sum, l) => sum + (l.kind === 'note' ? 0 : l.total_cents), 0);
  const tps = chargeTaxes ? roundCents(subtotal * TPS_RATE) : 0;
  const tvq = chargeTaxes ? roundCents(subtotal * TVQ_RATE) : 0;
  return { subtotal, tps, tvq, total: subtotal + tps + tvq };
}

function money(cents, lang) {
  return new Intl.NumberFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD' }).format((Number(cents) || 0) / 100);
}

/** 1.5 → "1,5" (fr) / "1.5" (en) — never "1,50". */
function qty(value, lang) {
  return new Intl.NumberFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

module.exports = function (db) {
  /** Next number for a kind in the current year: E2026-0001 / F2026-0001. Race-safe via UPSERT. */
  async function nextNumber(kind, year) {
    const key = kind + ':' + year;
    const row = await db.get(
      `INSERT INTO document_counters(kind, next_number) VALUES($1, 2)
       ON CONFLICT(kind) DO UPDATE SET next_number = document_counters.next_number + 1
       RETURNING next_number - 1 AS n`, [key]);
    return (kind === 'invoice' ? 'F' : 'E') + year + '-' + String(row.n).padStart(4, '0');
  }

  async function load(id) {
    const doc = await db.get(
      `SELECT d.*, to_char(d.issued_on,'YYYY-MM-DD') AS issued_on, to_char(d.valid_until,'YYYY-MM-DD') AS valid_until,
              to_char(d.delivered_on,'YYYY-MM-DD') AS delivered_on, to_char(d.paid_on,'YYYY-MM-DD') AS paid_on
       FROM documents d WHERE d.id=$1`, [id]);
    if (!doc) return null;
    doc.lines = (await db.all('SELECT * FROM document_lines WHERE document_id=$1 ORDER BY position, id', [id]))
      .map((l) => Object.assign(l, { quantity: Number(l.quantity) }));
    return doc;
  }

  async function writeLines(docId, lines) {
    await db.run('DELETE FROM document_lines WHERE document_id=$1', [docId]);
    for (const l of lines) {
      await db.run(
        `INSERT INTO document_lines(document_id, position, kind, description, part_condition, part_number, quantity, unit_cents, total_cents)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [docId, l.position, l.kind, l.description, l.part_condition, l.part_number, l.quantity, l.unit_cents, l.total_cents]);
    }
  }

  return { nextNumber, load, writeLines };
};

Object.assign(module.exports, {
  TPS_RATE, TVQ_RATE, LINE_KINDS, CONDITIONS, ESTIMATE_STATUSES, INVOICE_STATUSES, PAYMENT_METHODS, LEGAL_WARRANTY,
  parseMoney, parseQty, cleanLine, totals, money, qty,
});
