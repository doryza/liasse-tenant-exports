/**
 * The garage's customer file.
 *
 * Every customer has one `user_id` key that their vehicles, appointments and
 * documents hang off:
 *   - customers who booked online keep their platform account id;
 *   - customers the garage enters itself (phone, walk-in) get "c:<client id>".
 * So a walk-in's car and appointments live in the same tables, with the same
 * code, as an online customer's — and if they later make an account, nothing
 * needs merging for the garage to keep working.
 */
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const PHONE_RE = /^[+()\d .-]{7,40}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function error(code, status = 400) { const e = new Error(code); e.code = code; e.status = status; return e; }

function cleanClient(body) {
  const c = {
    name: clip(body.name, 120), phone: clip(body.phone, 40), email: clip(body.email, 200).toLowerCase(),
    address: clip(body.address, 300), notes: clip(body.notes, 4000),
  };
  if (!c.name) throw error('required');
  if (c.phone && !PHONE_RE.test(c.phone)) throw error('invalid');
  if (c.email && !EMAIL_RE.test(c.email)) throw error('invalid');
  return c;
}

module.exports = function (db) {
  /**
   * Customers who booked online but are not in the file yet: add them from
   * their latest appointment (name, phone, email) or their profile.
   */
  async function syncOnline() {
    await db.run(
      `INSERT INTO clients(user_id, name, phone, email)
       SELECT DISTINCT ON (a.user_id) a.user_id, a.contact_name, a.contact_phone, a.contact_email
       FROM appointments a
       WHERE a.status <> 'holding' AND a.user_id NOT LIKE 'c:%'
         AND NOT EXISTS (SELECT 1 FROM clients c WHERE c.user_id = a.user_id)
       ORDER BY a.user_id, a.created_at DESC
       ON CONFLICT(user_id) DO NOTHING`);
    await db.run(
      `INSERT INTO clients(user_id, name, phone)
       SELECT p.user_id, TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,'')), p.phone
       FROM customer_profiles p
       WHERE TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,'')) <> ''
         AND NOT EXISTS (SELECT 1 FROM clients c WHERE c.user_id = p.user_id)
       ON CONFLICT(user_id) DO NOTHING`);
  }

  async function create(body) {
    const c = cleanClient(body);
    const row = await db.get('INSERT INTO clients(name, phone, email, address, notes) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [c.name, c.phone || null, c.email || null, c.address || null, c.notes || null]);
    return db.get('UPDATE clients SET user_id=$1 WHERE id=$2 RETURNING *', ['c:' + row.id, row.id]);
  }

  async function update(id, body) {
    const c = cleanClient(body);
    const row = await db.get('UPDATE clients SET name=$1, phone=$2, email=$3, address=$4, notes=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [c.name, c.phone || null, c.email || null, c.address || null, c.notes || null, id]);
    if (!row) throw error('not_found', 404);
    return row;
  }

  /** Online customer → their row in the file (created on first need). */
  async function forUser(userId, fallback = {}) {
    const found = await db.get('SELECT * FROM clients WHERE user_id=$1', [userId]);
    if (found) return found;
    return db.get(
      `INSERT INTO clients(user_id, name, phone, email) VALUES($1,$2,$3,$4)
       ON CONFLICT(user_id) DO UPDATE SET updated_at=NOW() RETURNING *`,
      [userId, clip(fallback.name, 120) || '—', clip(fallback.phone, 40) || null, clip(fallback.email, 200) || null]);
  }

  async function search(q, limit = 30) {
    const term = clip(q, 80);
    if (!term) {
      return db.all(`SELECT c.*, (SELECT MAX(start_at) FROM appointments a WHERE a.user_id=c.user_id) AS last_visit
                     FROM clients c ORDER BY c.updated_at DESC LIMIT $1`, [limit]);
    }
    const digits = term.replace(/\D/g, '');
    return db.all(
      `SELECT c.*, (SELECT MAX(start_at) FROM appointments a WHERE a.user_id=c.user_id) AS last_visit
       FROM clients c
       WHERE LOWER(c.name) LIKE $1 OR LOWER(COALESCE(c.email,'')) LIKE $1
          OR ($2 <> '' AND regexp_replace(COALESCE(c.phone,''), '\\D', '', 'g') LIKE $3)
          OR EXISTS (SELECT 1 FROM vehicles v WHERE v.user_id=c.user_id AND v.archived=0
                     AND (LOWER(COALESCE(v.plate,'')) LIKE $1 OR LOWER(COALESCE(v.make,'') || ' ' || COALESCE(v.model,'')) LIKE $1))
       ORDER BY c.name LIMIT $4`,
      ['%' + term.toLowerCase() + '%', digits, '%' + digits + '%', limit]);
  }

  async function vehiclesOf(client) {
    return db.all('SELECT * FROM vehicles WHERE user_id=$1 AND archived=0 ORDER BY id', [client.user_id]);
  }

  return { syncOnline, create, update, forUser, search, vehiclesOf };
};
module.exports.cleanClient = cleanClient;
