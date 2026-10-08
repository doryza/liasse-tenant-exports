'use strict';
/**
 * Emails. Nothing leaves the site unless the owner allowed it:
 *  - to customers (an estimate or invoice, a request acknowledgment): live_actions_enabled;
 *  - to the owner (a new request, an estimate accepted or declined): the request form
 *    being open is enough — these go to the business's own address.
 * Before the site is claimed the platform refuses every send (code trial_action_disabled);
 * callers get { blocked: true } and say so in the back office. A failed email never fails
 * the action that triggered it.
 */
const D = require('./documents');

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function card(b, { title, lead, rows = [], button = null, link = '', foot = '' }) {
 const t = b.design.tokens;
 const html = `<div style="margin:0;background:${t.paper};padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid ${t.line};border-radius:10px;overflow:hidden">
<div style="background:${t.ink};padding:18px 24px;color:#ffffff;font-weight:700;font-size:16px">${esc(b.business_name)}</div>
<div style="height:4px;background:linear-gradient(90deg,${t.hot} 0 50%,${t.cold} 50% 100%)"></div>
<div style="padding:26px 24px"><h1 style="margin:0 0 10px;font-size:22px;line-height:1.25;color:${t.ink}">${esc(title)}</h1>
<p style="margin:0 0 18px;color:${t.body};font-size:15px;line-height:1.55">${esc(lead)}</p>
${rows.length ? `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows.filter(r => r[1]).map(r => `<tr><td style="padding:8px 0;color:${t.muted};width:38%;vertical-align:top;border-top:1px solid ${t.line}">${esc(r[0])}</td><td style="padding:8px 0;color:${t.ink};font-weight:600;border-top:1px solid ${t.line};white-space:pre-line">${esc(r[1])}</td></tr>`).join('')}</table>` : ''}
${button ? `<p style="margin:22px 0 0"><a href="${esc(link)}" style="display:inline-block;background:${t.accent};color:${t['on-accent']};font-weight:700;text-decoration:none;padding:12px 18px;border-radius:6px">${esc(button)}</a></p>` : ''}
<p style="margin:22px 0 0;color:${t.muted};font-size:13px;line-height:1.5">${esc(foot || [b.phone, b.email].filter(Boolean).join(' · '))}${b.rbq ? '<br>' + esc(b.labels ? b.labels.licence[b.region.lang] : 'RBQ') + ' ' + esc(b.rbq) : ''}</p></div></div></div>`;
 const text = `${title}\n\n${lead}\n\n${rows.filter(r => r[1]).map(r => r[0] + ' : ' + r[1]).join('\n')}${link ? '\n\n' + link : ''}\n\n${b.business_name} — ${b.phone}`;
 return { html, text };
}

module.exports = function (services) {
 async function send(message) {
  try { return { sent: true, result: await services.email.send(message) }; } catch (e) {
   if (e && (e.code === 'trial_action_disabled' || e.status === 403)) return { blocked: true };
   return { error: (e && e.message) || 'email_failed' };
  }
 }

 /** Estimate or invoice to the customer, with the private link. */
 async function documentToCustomer(b, doc, link) {
  if (!b.liveEmail) return { skipped: 'live_actions_off' };
  if (!doc.customer_email) return { skipped: 'no_email' };
  const en = doc.language === 'en';
  const est = doc.kind === 'estimate';
  const title = est ? (en ? `Your estimate ${doc.number}` : `Votre estimation ${doc.number}`) : (en ? `Your invoice ${doc.number}` : `Votre facture ${doc.number}`);
  const lead = est
   ? (en ? 'Here is the estimate for the work we discussed. You can review it and accept it online.' : 'Voici l’estimation des travaux dont nous avons parlé. Vous pouvez la consulter et l’accepter en ligne.')
   : (en ? 'Here is the invoice for the work done. Thank you for your trust.' : 'Voici la facture des travaux réalisés. Merci de votre confiance.');
  const rows = [[en ? 'Work' : 'Travaux', doc.title], [en ? 'Address' : 'Adresse', doc.property_address], ['Total', D.money(doc.total_cents, doc.language)]];
  if (est && doc.valid_until) rows.push([en ? 'Valid until' : 'Valide jusqu’au', doc.valid_until]);
  const m = card(b, { title, lead, rows, button: est ? (en ? 'View the estimate' : 'Consulter l’estimation') : (en ? 'View the invoice' : 'Consulter la facture'), link });
  return send({ to: doc.customer_email, subject: `${title} — ${b.business_name}`, html: m.html, text: m.text, replyTo: b.notify || undefined });
 }

 /** A new request reaches the business's own inbox. */
 async function requestToOwner(b, r, link) {
  if (!b.notify) return { skipped: 'no_address' };
  // The owner reads the site's first language.
  const en = b.region && b.region.lang === 'en';
  const m = card(b, en ? {
   title: `New request ${r.reference}`, lead: 'A request just came in through the website.',
   rows: [['Name', r.name], ['Phone', r.phone], ['Email', r.email], ['Address', r.address], ['Work', r.service_label], ['When', r.urgency_label], ['Message', r.message]],
   button: 'Open the request', link,
  } : {
   title: `Nouvelle demande ${r.reference}`, lead: 'Une demande vient d’arriver par le site.',
   rows: [['Nom', r.name], ['Téléphone', r.phone], ['Courriel', r.email], ['Adresse', r.address], ['Travaux', r.service_label], ['Quand', r.urgency_label], ['Message', r.message]],
   button: 'Ouvrir la demande', link,
  });
  return send({ to: b.notify, subject: `${en ? 'New request' : 'Nouvelle demande'} ${r.reference} — ${r.name}`, html: m.html, text: m.text, replyTo: r.email || undefined });
 }

 /** The visitor's copy, only when customer emails are on and they gave an address. */
 async function requestAck(b, r) {
  if (!b.liveEmail || !r.email) return { skipped: 'off' };
  const en = r.language === 'en';
  const m = card(b, {
   title: en ? 'We received your request' : 'Nous avons reçu votre demande',
   lead: en ? `Thank you. ${b.business_name} will contact you at the number you gave.` : `Merci. ${b.business_name} vous contactera au numéro indiqué.`,
   rows: [[en ? 'Reference' : 'Numéro', r.reference], [en ? 'Address' : 'Adresse', r.address], [en ? 'Message' : 'Message', r.message]],
  });
  return send({ to: r.email, subject: (en ? 'Request received — ' : 'Demande reçue — ') + b.business_name, html: m.html, text: m.text, replyTo: b.notify || undefined });
 }

 /** The customer accepted or declined an estimate. */
 async function decisionToOwner(b, doc, link) {
  if (!b.notify) return { skipped: 'no_address' };
  const ok = doc.status === 'accepted';
  const en = b.region && b.region.lang === 'en';
  const title = en ? `Estimate ${doc.number} ${ok ? 'accepted' : 'declined'}` : `Estimation ${doc.number} ${ok ? 'acceptée' : 'refusée'}`;
  const m = card(b, en ? {
   title, lead: ok ? `${doc.decided_name} accepted the estimate online.` : 'The customer declined the estimate online.',
   rows: [['Customer', doc.customer_name], ['Work', doc.title], ['Total', D.money(doc.total_cents, 'en')], ['Reason', doc.decline_reason]],
   button: 'Open the estimate', link,
  } : {
   title, lead: ok ? `${doc.decided_name} a accepté l’estimation en ligne.` : `Le client a refusé l’estimation en ligne.`,
   rows: [['Client', doc.customer_name], ['Travaux', doc.title], ['Total', D.money(doc.total_cents, 'fr')], ['Raison', doc.decline_reason]],
   button: 'Ouvrir l’estimation', link,
  });
  return send({ to: b.notify, subject: `${title} — ${doc.customer_name || ''}`, html: m.html, text: m.text });
 }

 return { documentToCustomer, requestToOwner, requestAck, decisionToOwner };
};
module.exports.card = card;
