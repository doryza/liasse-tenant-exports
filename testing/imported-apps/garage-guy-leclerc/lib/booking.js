/**
 * Booking engine — availability, bay reservation, references.
 *
 * The shop is modelled as N service bays (setting `bays`) on a grid of
 * `slot_minutes` cells. An appointment occupies one bay for its duration:
 * one row per cell in `bay_slots`, whose PRIMARY KEY (bay, slot_at) is the
 * concurrency guard — two customers racing for the last bay cannot both win,
 * because the second multi-row INSERT violates the key as a whole and the
 * engine moves on to the next bay (or reports the slot as taken).
 *
 * Every time is computed in America/Toronto (lib/settings zoned/local), so a
 * DST change never shifts a published slot.
 */
const S = require('./settings');

const ACTIVE = ['requested', 'confirmed', 'in_progress', 'ready'];

function config(raw) {
  return {
    bays: Math.max(1, Math.min(12, S.num(raw, 'bays', 2))),
    slotMinutes: [15, 30, 60].includes(S.num(raw, 'slot_minutes', 30)) ? S.num(raw, 'slot_minutes', 30) : 30,
    leadHours: Math.max(0, Math.min(168, S.num(raw, 'lead_hours', 16))),
    horizonDays: Math.max(7, Math.min(120, S.num(raw, 'horizon_days', 45))),
    maxMinutes: Math.max(30, Math.min(600, S.num(raw, 'max_booking_minutes', 240))),
    courtesyCars: Math.max(0, Math.min(20, S.num(raw, 'courtesy_cars', 1))),
    cancelCutoffHours: Math.max(0, Math.min(168, S.num(raw, 'cancel_cutoff_hours', 12))),
    autoConfirm: S.flag(raw, 'auto_confirm'),
  };
}

/** Minutes the bay is held for a set of services (rounded up to the grid). */
function durationFor(serviceRows, cfg) {
  const sum = serviceRows.reduce((n, s) => n + Math.max(0, Number(s.duration_min) || 0), 0) || 60;
  const capped = Math.min(sum, cfg.maxMinutes);
  return Math.ceil(capped / cfg.slotMinutes) * cfg.slotMinutes;
}

function cellsFor(start, minutes, cfg) {
  const out = [];
  for (let m = 0; m < minutes; m += cfg.slotMinutes) out.push(new Date(start.getTime() + m * 60000));
  return out;
}

/**
 * Open days and free start times between `from` (YYYY-MM-DD) and `days` later.
 * `excludeId` ignores one appointment's own cells (rescheduling).
 */
async function availability(db, raw, { from, days, minutes, excludeId = null, now = new Date() }) {
  const cfg = config(raw);
  const dur = Math.ceil(Math.min(minutes || 60, cfg.maxMinutes) / cfg.slotMinutes) * cfg.slotMinutes;
  const hours = await db.all('SELECT * FROM hours ORDER BY weekday');
  const byDay = Object.fromEntries(hours.map((h) => [h.weekday, h]));
  const today = S.local(now).date;
  const first = from && from > today ? from : today;
  const last = S.addDays(today, cfg.horizonDays);
  const span = Math.max(1, Math.min(days || 14, 62));
  const end = S.addDays(first, span) < last ? S.addDays(first, span) : last;
  const closures = await db.all("SELECT to_char(date,'YYYY-MM-DD') AS date, reason, reason_en FROM closures WHERE date >= $1 AND date <= $2", [first, end]);
  const closed = Object.fromEntries(closures.map((c) => [String(c.date).slice(0, 10), c]));

  const rangeStart = S.zoned(first, '00:00');
  const rangeEnd = S.zoned(S.addDays(end, 1), '00:00');
  const taken = await db.all(
    `SELECT bs.bay, bs.slot_at FROM bay_slots bs JOIN appointments a ON a.id = bs.appointment_id
     WHERE bs.slot_at >= $1 AND bs.slot_at < $2 AND a.status = ANY($3) AND ($4::int IS NULL OR a.id <> $4)`,
    [rangeStart, rangeEnd, ACTIVE, excludeId]);
  const busy = new Set(taken.map((r) => r.bay + '|' + new Date(r.slot_at).getTime()));
  const courtesy = await db.all(
    `SELECT to_char(start_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS d, COUNT(*)::int AS n FROM appointments
     WHERE courtesy_car = 1 AND status = ANY($1) AND start_at >= $2 AND start_at < $3 AND ($4::int IS NULL OR id <> $4) GROUP BY 1`,
    [ACTIVE, rangeStart, rangeEnd, excludeId]);
  const loans = Object.fromEntries(courtesy.map((r) => [r.d, r.n]));
  const earliest = now.getTime() + cfg.leadHours * 3600000;

  const out = [];
  for (let d = first; d <= end; d = S.addDays(d, 1)) {
    const wd = S.weekdayOf(d);
    const h = byDay[wd];
    const day = { date: d, weekday: wd, slots: [], closed: false, reason: null, courtesyLeft: Math.max(0, cfg.courtesyCars - (loans[d] || 0)) };
    if (!h || h.closed) { day.closed = true; out.push(day); continue; }
    if (closed[d]) { day.closed = true; day.reason = closed[d]; out.push(day); continue; }
    const open = S.toMinutes(h.opens); const close = S.toMinutes(h.closes);
    for (let m = open; m < close; m += cfg.slotMinutes) {
      const start = S.zoned(d, S.fromMinutes(m));
      if (start.getTime() < earliest) continue;
      // A job longer than what is left of the day is held until closing time
      // and continues the next morning — but only if at least an hour of the
      // day is left, otherwise the car would just sit there.
      const held = Math.min(dur, close - m);
      if (held < dur && held < 60) continue;
      const cells = cellsFor(start, held, cfg);
      let free = 0;
      for (let bay = 1; bay <= cfg.bays; bay++) if (cells.every((c) => !busy.has(bay + '|' + c.getTime()))) free++;
      if (free > 0) day.slots.push({ time: S.fromMinutes(m), free });
    }
    out.push(day);
  }
  return { days: out, minutes: dur, config: { slotMinutes: cfg.slotMinutes, horizonDays: cfg.horizonDays, courtesyCars: cfg.courtesyCars } };
}

/** Is `date`+`time` a bookable start for `minutes` right now? */
async function isBookable(db, raw, { date, time, minutes, excludeId = null }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '')) return false;
  const a = await availability(db, raw, { from: date, days: 1, minutes, excludeId });
  const day = a.days.find((x) => x.date === date);
  return !!(day && day.slots.some((s) => s.time === time));
}

/**
 * Hold a bay for an existing appointment row. Tries bays in order; the first
 * whose cells are all free wins atomically. Returns the bay number or null.
 */
async function holdBay(db, raw, appointmentId, start, minutes, dayCloseMinutes) {
  const cfg = config(raw);
  const startLocal = S.toMinutes(S.local(start).time);
  const held = Math.max(cfg.slotMinutes, Math.min(minutes, dayCloseMinutes - startLocal));
  const cells = cellsFor(start, held, cfg);
  for (let bay = 1; bay <= cfg.bays; bay++) {
    try {
      await db.run(
        'INSERT INTO bay_slots (bay, slot_at, appointment_id) SELECT $1, x, $2 FROM unnest($3::timestamptz[]) AS x',
        [bay, appointmentId, cells]);
      return { bay, heldMinutes: held };
    } catch (e) {
      if (e.code !== '23505' && !/duplicate key|unique/i.test(e.message || '')) throw e;
      // Cells may belong to a cancelled appointment: free them and retry once.
      const stale = await db.run(
        `DELETE FROM bay_slots WHERE bay = $1 AND slot_at = ANY($2::timestamptz[])
           AND appointment_id IN (SELECT id FROM appointments WHERE status <> ALL($3))`,
        [bay, cells, ACTIVE]);
      if (stale && stale.changes) {
        try {
          await db.run('INSERT INTO bay_slots (bay, slot_at, appointment_id) SELECT $1, x, $2 FROM unnest($3::timestamptz[]) AS x', [bay, appointmentId, cells]);
          return { bay, heldMinutes: held };
        } catch (e2) { /* someone else holds it — next bay */ }
      }
    }
  }
  return null;
}

async function releaseBay(db, appointmentId) {
  await db.run('DELETE FROM bay_slots WHERE appointment_id = $1', [appointmentId]);
}

const REF_ALPHABET = 'ACDEFGHJKLMNPQRTUVWXY34679';
function reference(randomInt) {
  let s = '';
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[randomInt(0, REF_ALPHABET.length)];
  return 'GL-' + s;
}

/** Can the customer still cancel / move it themselves? */
function selfServiceOpen(appt, raw, now = new Date()) {
  const cfg = config(raw);
  return ['requested', 'confirmed'].includes(appt.status)
    && new Date(appt.start_at).getTime() - now.getTime() > cfg.cancelCutoffHours * 3600000;
}

/** RFC 5545 calendar file for one appointment. */
function ics(appt, business, address, lang) {
  const stamp = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (s) => String(s || '').replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
  const title = (lang === 'en' ? 'Garage appointment — ' : 'Rendez-vous au garage — ') + business;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Liasse//Garage//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + appt.reference + '@liasse.tech',
    'DTSTAMP:' + stamp(new Date()),
    'DTSTART:' + stamp(appt.start_at),
    'DTEND:' + stamp(appt.end_at),
    'SUMMARY:' + esc(title),
    'LOCATION:' + esc(address),
    'DESCRIPTION:' + esc((appt.reference || '') + '\n' + (appt.service_names || '')),
    'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(title), 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

module.exports = { ACTIVE, config, durationFor, availability, isBookable, holdBay, releaseBay, reference, selfServiceOpen, ics };
