const makeNotify = require('./lib/notify');

/**
 * Appointment reminders, ~24 h ahead. Sends only when the owner has turned
 * on live sending AND the appointment is real (booked while online booking
 * was live). The reminder_sent_at marker is claimed BEFORE sending so two
 * replicas can never remind the same customer twice.
 */
module.exports = function (services) {
  const notify = makeNotify(services);
  services.scheduler.register('garage-mm-reminders', 15 * 60 * 1000, async ({ db }) => {
    try {
      const raw = Object.fromEntries((await db.all('SELECT key,value FROM admin_settings')).map((x) => [x.key, x.value]));
      if (raw.live_actions_enabled !== '1') return;
      const due = await db.all(
        `UPDATE appointments SET reminder_sent_at = NOW()
         WHERE id IN (SELECT id FROM appointments WHERE status = 'confirmed' AND preview = 0 AND reminder_sent_at IS NULL
                      AND start_at > NOW() + INTERVAL '20 hours' AND start_at <= NOW() + INTERVAL '26 hours' LIMIT 20)
         RETURNING *`);
      for (const appt of due) {
        try { await notify.toCustomer(raw, appt, 'reminder', null); } catch (e) { /* best effort */ }
      }
    } catch (e) { /* never let a reminder sweep throw */ }
  });
};
