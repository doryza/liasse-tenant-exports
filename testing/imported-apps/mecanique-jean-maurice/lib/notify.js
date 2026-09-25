/**
 * Outbound messages about appointments. NOTHING leaves the site unless the
 * owner has switched on live sending (live_actions_enabled) AND the
 * appointment is real (preview = 0, i.e. booked while bookings_live was on).
 * Every send is best-effort: a failed email never fails the booking.
 */
const S = require('./settings');

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function live(raw, appt) { return S.flag(raw, 'live_actions_enabled') && !Number(appt.preview); }

const COPY = {
  fr: {
    requested: ['Demande de rendez-vous reçue', 'Nous avons bien reçu votre demande. Le garage la confirme sous peu.'],
    confirmed: ['Rendez-vous confirmé', 'Votre rendez-vous est confirmé. À bientôt au garage.'],
    rescheduled: ['Rendez-vous déplacé', 'Votre rendez-vous a été déplacé au nouveau moment ci-dessous.'],
    in_progress: ['Votre véhicule est en atelier', 'Les travaux sont commencés.'],
    ready: ['Votre véhicule est prêt', 'Votre véhicule est prêt à être récupéré.'],
    completed: ['Merci de votre visite', 'Les travaux sont terminés. Merci de votre confiance.'],
    cancelled: ['Rendez-vous annulé', 'Votre rendez-vous a été annulé.'],
    reminder: ['Rappel : rendez-vous demain', 'Petit rappel de votre rendez-vous au garage.'],
    when: 'Quand', ref: 'Numéro', work: 'Travaux', vehicle: 'Véhicule', note: 'Message du garage', manage: 'Voir mon rendez-vous',
  },
  en: {
    requested: ['Appointment request received', 'We received your request. The garage will confirm it shortly.'],
    confirmed: ['Appointment confirmed', 'Your appointment is confirmed. See you at the garage.'],
    rescheduled: ['Appointment moved', 'Your appointment was moved to the new time below.'],
    in_progress: ['Your vehicle is in the shop', 'Work has started.'],
    ready: ['Your vehicle is ready', 'Your vehicle is ready for pickup.'],
    completed: ['Thank you for your visit', 'The work is done. Thank you for your trust.'],
    cancelled: ['Appointment cancelled', 'Your appointment was cancelled.'],
    reminder: ['Reminder: appointment tomorrow', 'A quick reminder of your garage appointment.'],
    when: 'When', ref: 'Reference', work: 'Work', vehicle: 'Vehicle', note: 'Message from the garage', manage: 'View my appointment',
  },
};

function card(raw, appt, kind, link) {
  const lang = appt.language === 'en' ? 'en' : 'fr';
  const c = COPY[lang];
  const [title, lead] = c[kind] || c.confirmed;
  const biz = raw.business_name || 'Garage';
  const rows = [
    [c.when, appt.bay == null && appt.status === 'requested' && raw.hours_known === '0'
      ? S.date(appt.start_at, lang) + ' — ' + (S.local(appt.start_at).time < '12:00' ? (lang === 'en' ? 'morning' : 'en matinée') : (lang === 'en' ? 'afternoon' : 'en après-midi')) + (lang === 'en' ? ' (the garage will call to set the time)' : ' (le garage vous rappelle pour fixer l’heure)')
      : S.dateTime(appt.start_at, lang)],
    [c.ref, appt.reference],
    [c.vehicle, appt.vehicle_label],
    [c.work, appt.service_names],
  ];
  if (appt.garage_note) rows.push([c.note, appt.garage_note]);
  const html = `<div style="margin:0;background:#121417;padding:28px 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden">
<div style="background:#121417;border-bottom:3px solid #ff6b2c;padding:18px 26px;color:#ff6b2c;font-weight:800;letter-spacing:.04em;text-transform:uppercase;font-size:14px">${esc(biz)}</div>
<div style="padding:28px 26px"><h1 style="margin:0 0 10px;font-size:24px;color:#16181b">${esc(title)}</h1><p style="margin:0 0 20px;color:#44484e;font-size:15px;line-height:1.55">${esc(lead)}</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">${rows.filter((r) => r[1]).map((r) => `<tr><td style="padding:8px 0;color:#6b7078;width:34%;vertical-align:top;border-top:1px solid #e6e7e3">${esc(r[0])}</td><td style="padding:8px 0;color:#16181b;font-weight:600;border-top:1px solid #e6e7e3">${esc(r[1])}</td></tr>`).join('')}</table>
${link ? `<p style="margin:24px 0 0"><a href="${esc(link)}" style="display:inline-block;background:#ff6b2c;color:#16181b;font-weight:700;text-decoration:none;padding:12px 18px;border-radius:8px">${esc(c.manage)}</a></p>` : ''}
<p style="margin:22px 0 0;color:#6b7078;font-size:13px">${esc(raw.contact_phone || '')} · ${esc(raw.business_address || '')}</p></div></div></div>`;
  const text = `${title}\n\n${lead}\n\n${rows.filter((r) => r[1]).map((r) => r[0] + ': ' + r[1]).join('\n')}${link ? '\n\n' + link : ''}\n\n${biz} — ${raw.contact_phone || ''}`;
  return { subject: `${title} — ${appt.reference}`, html, text, title, lead };
}

module.exports = function (services) {
  async function toCustomer(raw, appt, kind, link) {
    if (!live(raw, appt)) return { skipped: 'not_live' };
    const msg = card(raw, appt, kind, link);
    const out = {};
    if (appt.contact_email) {
      try { out.email = await services.email.send({ to: appt.contact_email, subject: msg.subject, html: msg.html, text: msg.text, replyTo: raw.notification_email || undefined }); } catch (e) { out.email = { error: e.message }; }
    }
    // Push goes to platform accounts only — a walk-in the garage entered ("c:<id>") has none.
    if (['confirmed', 'ready', 'rescheduled', 'cancelled'].includes(kind) && /^\d+$/.test(String(appt.user_id))) {
      try { out.push = await services.push.sendToUser(Number(appt.user_id), { title: msg.title, body: `${appt.reference} · ${S.dateTime(appt.start_at, appt.language)}`, url: link }); } catch (e) { out.push = { error: e.message }; }
    }
    return out;
  }

  async function toGarage(raw, appt, link) {
    if (!live(raw, appt)) return { skipped: 'not_live' };
    const to = raw.notification_email || services.config.contactEmail;
    if (!to) return { skipped: 'no_address' };
    const extra = [
      `${appt.contact_name} · ${appt.contact_phone || ''} · ${appt.contact_email || ''}`,
      appt.concern ? `« ${appt.concern} »` : '',
      Number(appt.courtesy_car) ? 'Voiture de courtoisie demandée' : '',
      Number(appt.towing) ? `Remorquage demandé : ${appt.towing_address || ''}` : '',
    ].filter(Boolean).join('\n');
    const msg = card(raw, Object.assign({}, appt, { language: 'fr' }), 'requested', link);
    try {
      return await services.email.send({
        to, subject: `Nouveau rendez-vous — ${appt.reference} — ${S.dateTime(appt.start_at, 'fr')}`,
        text: `Nouveau rendez-vous en ligne.\n\n${msg.text}\n\n${extra}`,
        html: msg.html.replace('</h1>', `</h1><p style="white-space:pre-line;margin:0 0 16px;color:#16181b">${esc(extra)}</p>`).replace(esc(COPY.fr.requested[0]), 'Nouveau rendez-vous en ligne'),
      });
    } catch (e) { return { error: e.message }; }
  }

  return { toCustomer, toGarage, live };
};
module.exports.card = card;
