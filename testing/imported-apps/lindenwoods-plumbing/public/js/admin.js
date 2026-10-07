/* eslint-env browser */
/* Back office. No platform SDK on /admin (it is stripped there): plain fetch, same-origin,
   X-Requested-With header for the router's guard. Failures show at the control and in a toast. */
'use strict';
(function () {
 var $ = function (s, r) { return (r || document).querySelector(s); };
 var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
 var EN = document.body.getAttribute('data-lang') === 'en';
 var tr = function (fr, en) { return EN ? en : fr; };
 var MSG = {
  trial_action_disabled: tr('Disponible une fois le site à vous.', 'Available once the site is yours.'),
  privacy_incomplete: tr('Complétez d’abord les passages entre crochets, dans les deux langues.', 'First complete the passages in brackets, in both languages.'),
  invalid_phone: tr('Numéro de téléphone invalide.', 'Invalid phone number.'), invalid_email: tr('Adresse courriel invalide.', 'Invalid email address.'),
  invalid_rbq: tr('Le numéro RBQ a 10 chiffres (0000-0000-00).', 'The RBQ number has 10 digits (0000-0000-00).'), too_long: tr('Texte trop long.', 'Text too long.'),
  required: tr('Ce champ est requis.', 'This field is required.'), module_off: tr('Activez d’abord les estimations et factures.', 'Turn on estimates & invoices first.'),
  no_customer: tr('Choisissez d’abord un client.', 'Choose a customer first.'), issue_first: tr('Émettez d’abord la facture.', 'Issue the invoice first.'),
  closed: tr('Ce document a changé d’état. Rechargez la page.', 'This document changed state. Reload the page.'), numbered: tr('Une facture émise ne se supprime pas : annulez-la.', 'An issued invoice can’t be deleted: cancel it.'),
  accept_first: tr('L’estimation doit être acceptée.', 'The estimate must be accepted.'), empty: tr('Ajoutez au moins une ligne avec un prix.', 'Add at least one line with a price.'),
  invalid_quantity: tr('Quantité invalide.', 'Invalid quantity.'), invalid_price: tr('Prix invalide (ex. 125,50).', 'Invalid price (e.g. 125.50).'),
  invalid_hours: tr('Vérifiez les heures : l’ouverture doit précéder la fermeture.', 'Check the hours: opening must come before closing.'),
  invalid_date: tr('Date invalide.', 'Invalid date.'), forbidden: tr('Session expirée. Reconnectez-vous.', 'Session expired. Sign in again.'), invalid: tr('Vérifiez les champs.', 'Check the fields.'),
 };
 function message(r) { return MSG[r.json && r.json.code] || (r.json && r.json.message) || tr('Impossible d’enregistrer. Réessayez.', 'Could not save. Try again.'); }
 function api(url, method, data) {
  return fetch(url, { method: method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'plumbing-site' }, body: data === undefined ? undefined : JSON.stringify(data) })
   .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, json: j }; }); })
   .catch(function () { return { ok: false, status: 0, json: { message: tr('Connexion impossible.', 'Connection failed.') } }; });
 }
 var toastTimer;
 function toast(text, err) {
  var t = $('.toast'); if (!t) return;
  t.textContent = text; t.className = 'toast' + (err ? ' err' : ''); t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, err ? 6000 : 2600);
 }
 function go(url) { location.href = url; }
 function markField(form, r) {
  var f = r.json && r.json.field;
  if (!f || !form) return;
  var el = form.querySelector('[name="' + f + '"]');
  if (el) { var box = el.closest('.afield'); if (box) box.classList.add('invalid'); el.focus(); }
 }
 function formData(form) {
  var x = {};
  $$('input, select, textarea', form).forEach(function (el) {
   if (!el.name || el.disabled) return;
   if (el.type === 'checkbox') x[el.name] = el.checked; else if (el.type === 'radio') { if (el.checked) x[el.name] = el.value; } else x[el.name] = el.value;
  });
  return x;
 }

 // mobile menu
 var menu = $('.ad-menu'), side = $('#ad-side');
 if (menu && side) {
  menu.addEventListener('click', function (e) { e.stopPropagation(); var open = !side.classList.contains('open'); side.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); });
  document.addEventListener('click', function (e) { if (side.classList.contains('open') && !side.contains(e.target)) { side.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); } });
 }

 // settings switches: save at once
 $$('[data-toggle]').forEach(function (el) {
  el.addEventListener('change', function () {
   var key = el.getAttribute('data-toggle'), body = {}; body[key] = el.checked ? '1' : '0';
   api('api/admin/settings', 'PUT', body).then(function (r) {
    if (!r.ok) { el.checked = !el.checked; toast(message(r), true); return; }
    if (key === 'documents_enabled') { location.reload(); return; }
    if (key === 'messages_enabled' && el.checked && !r.json.formLive) { toast(tr('Enregistré. Le formulaire s’ouvrira quand vos coordonnées seront confirmées et la politique approuvée.', 'Saved. The form opens once your contact details are confirmed and the policy approved.')); return; }
    toast(key === 'messages_enabled' && r.json.formLive ? tr('Le formulaire de demande est ouvert.', 'The request form is open.') : tr('Enregistré.', 'Saved.'));
   });
  });
 });
 // settings text forms
 $$('form[data-settings]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
   e.preventDefault();
   $$('.afield.invalid', form).forEach(function (f) { f.classList.remove('invalid'); });
   var body = {};
   $$('input, textarea, select', form).forEach(function (el) { if (el.name) body[el.name] = el.value; });
   var btn = $('[data-submit]', form); if (btn) btn.disabled = true;
   api('api/admin/settings', 'PUT', body).then(function (r) {
    if (btn) btn.disabled = false;
    if (!r.ok) { markField(form, r); toast(message(r), true); return; }
    toast(tr('Enregistré.', 'Saved.'));
    if (body.privacy_fr !== undefined || body.privacy_en !== undefined) setTimeout(function () { location.reload(); }, 700);
   });
  });
 });
 // turn the documents module on
 $$('[data-module]').forEach(function (b) {
  b.addEventListener('click', function () {
   b.disabled = true;
   api('api/admin/settings', 'PUT', { documents_enabled: '1' }).then(function (r) { if (!r.ok) { b.disabled = false; toast(message(r), true); return; } location.reload(); });
  });
 });
 // new estimate / invoice
 $$('[data-new-doc]').forEach(function (b) {
  b.addEventListener('click', function () {
   b.disabled = true;
   var body = { kind: b.getAttribute('data-new-doc') };
   if (b.getAttribute('data-request')) body.request_id = Number(b.getAttribute('data-request'));
   if (b.getAttribute('data-customer')) body.customer_id = Number(b.getAttribute('data-customer'));
   api('api/admin/documents', 'POST', body).then(function (r) { if (!r.ok) { b.disabled = false; toast(message(r), true); return; } go('admin/documents/' + r.json.id); });
  });
 });

 // dialogs
 $$('[data-open]').forEach(function (b) { b.addEventListener('click', function () { var d = document.getElementById(b.getAttribute('data-open')); if (d && d.showModal) d.showModal(); }); });
 if (/[?&]nouvelle=1/.test(location.search)) { var nd = $('#new-request'); if (nd && nd.showModal) nd.showModal(); }
 $$('form[data-api]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
   if (e.submitter && e.submitter.value === 'cancel') return;
   e.preventDefault();
   $$('.afield.invalid', form).forEach(function (f) { f.classList.remove('invalid'); });
   var btn = $('[data-submit]', form); if (btn) btn.disabled = true;
   api(form.getAttribute('data-api'), form.getAttribute('data-method') || 'POST', formData(form)).then(function (r) {
    if (btn) btn.disabled = false;
    if (!r.ok) { markField(form, r); (r.json.fields || []).forEach(function (f) { markField(form, { json: { field: f } }); }); toast(message(r), true); return; }
    if (form.hasAttribute('data-pick-customer')) {
     var sel = $('.doc-editor select[name="customer_id"]');
     var o = document.createElement('option'); o.value = r.json.id; o.textContent = form.elements.namedItem('name').value; o.setAttribute('data-address', form.elements.namedItem('address').value);
     sel.appendChild(o); sel.value = String(r.json.id); sel.dispatchEvent(new Event('change', { bubbles: true }));
     form.reset(); form.closest('dialog').close(); return;
    }
    if (form.hasAttribute('data-reload')) { toast(tr('Enregistré.', 'Saved.')); return; }
    var then = form.getAttribute('data-then');
    if (then) go(then.replace('{id}', r.json.id)); else location.reload();
   });
  });
 });
 // field patches (request status, notes)
 $$('[data-patch]').forEach(function (el) {
  el.addEventListener(el.getAttribute('data-on') === 'blur' ? 'blur' : 'change', function () {
   var body = {}; body[el.name] = el.value;
   api(el.getAttribute('data-patch'), 'PUT', body).then(function (r) { toast(r.ok ? tr('Enregistré.', 'Saved.') : message(r), !r.ok); });
  });
 });
 $$('[data-post]').forEach(function (b) {
  b.addEventListener('click', function () {
   b.disabled = true;
   api(b.getAttribute('data-post'), 'POST', {}).then(function (r) { if (!r.ok) { b.disabled = false; toast(message(r), true); return; } go(b.getAttribute('data-then').replace('{id}', r.json.id)); });
  });
 });
 $$('tr[data-href]').forEach(function (tr_) { tr_.addEventListener('click', function (e) { if (!e.target.closest('a')) go(tr_.getAttribute('data-href')); }); });

 // services: state + starting price
 $$('[data-service]').forEach(function (li) {
  var id = li.getAttribute('data-service');
  $$('input[type=radio]', li).forEach(function (r) {
   r.addEventListener('change', function () {
    api('api/admin/services/' + id, 'PUT', { state: r.value }).then(function (res) {
     if (!res.ok) { toast(message(res), true); return; }
     li.className = 'svc state-' + r.value; toast(tr('Enregistré.', 'Saved.'));
    });
   });
  });
  var price = $('input[name=price]', li);
  if (price) price.addEventListener('change', function () { api('api/admin/services/' + id, 'PUT', { price: price.value }).then(function (res) { toast(res.ok ? tr('Enregistré.', 'Saved.') : message(res), !res.ok); }); });
 });

 // hours
 var hours = $('form[data-hours]');
 if (hours) {
  var known = hours.known;
  var sync = function () { hours.classList.toggle('no-hours', !known.checked); };
  known.addEventListener('change', sync); sync();
  hours.addEventListener('submit', function (e) {
   e.preventDefault();
   var body = { emergency_247: hours.emergency_247.checked ? '1' : '0', hours_verified: hours.hours_verified.checked ? '1' : '0', areas_en: hours.areas_en.value };
   if (hours.areas_fr) body.areas_fr = hours.areas_fr.value;
   if (known.checked) {
    body.hours = {};
    for (var d = 1; d <= 7; d++) body.hours[d] = hours['open-' + d].checked ? [hours['from-' + d].value, hours['to-' + d].value] : null;
   } else body.hours = null;
   api('api/admin/hours', 'PUT', body).then(function (r) { toast(r.ok ? tr('Enregistré.', 'Saved.') : message(r), !r.ok); });
  });
 }

 // ---------------------------------------------------------------- document editor
 var ed = $('form.doc-editor');
 if (!ed) return;
 var id = ed.getAttribute('data-doc'), locked = ed.classList.contains('is-locked');
 var F = function (n) { return ed.elements.namedItem(n); };
 var fmt = new Intl.NumberFormat(EN ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD' });
 var state = $('[data-save-state]');
 function cents(v) {
  var s = String(v || '').replace(/[\s  $]/g, '');
  if (!s) return 0;
  if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else s = s.replace(',', '.');
  var n = Number(s); return isFinite(n) ? Math.round(n * 100) : NaN;
 }
 function qty(v) { var s = String(v || '').replace(/\s/g, '').replace(',', '.'); if (!s) return 1; var n = Number(s); return isFinite(n) ? n : NaN; }
 function lines() {
  return $$('[data-line]', ed).map(function (row) {
   return { kind: $('[name=kind]', row).value, description: $('[name=description]', row).value, quantity: $('[name=quantity]', row).value, unit: $('[name=unit]', row).value };
  });
 }
 function recalc() {
  var sub = 0;
  $$('[data-line]', ed).forEach(function (row) {
   var kind = $('[name=kind]', row).value, out = $('.line-total', row);
   row.classList.toggle('is-note', kind === 'note');
   if (kind === 'note') { out.textContent = ''; return; }
   var t = Math.round(qty($('[name=quantity]', row).value) * cents($('[name=unit]', row).value));
   out.textContent = isFinite(t) ? fmt.format(t / 100) : '—';
   if (isFinite(t)) sub += t;
  });
  var rates = [0.05, 0.09975];
  try { rates = JSON.parse(ed.getAttribute('data-rates')) || rates; } catch (e) { /* Québec rates */ }
  var taxes = F('charge_taxes').checked, tps = taxes ? Math.round(sub * (rates[0] || 0)) : 0, tvq = taxes ? Math.round(sub * (rates[1] || 0)) : 0;
  ed.classList.toggle('no-tax', !taxes);
  var set = function (k, v) { var el = $('[data-t="' + k + '"]', ed); if (el) el.textContent = fmt.format(v / 100); };
  set('subtotal', sub); set('tps', tps); set('tvq', tvq); set('total', sub + tps + tvq);
 }
 var timer, saving = Promise.resolve(), dirty = false;
 function setState(text, isDirty) { if (state) { state.textContent = text; state.classList.toggle('dirty', !!isDirty); } }
 function body() {
  var x = { notes: F('notes').value };
  if (locked) return x;
  x.customer_id = F('customer_id').value || null; x.language = F('language').value; x.title = F('title').value; x.property_address = F('property_address').value;
  x.charge_taxes = F('charge_taxes').checked; x.terms = F('terms').value; x.lines = lines();
  if (F('valid_until')) x.valid_until = F('valid_until').value; if (F('due_on')) x.due_on = F('due_on').value;
  return x;
 }
 function save() {
  clearTimeout(timer);
  if (!dirty) return saving;
  dirty = false; setState(tr('Enregistrement…', 'Saving…'), true);
  saving = api('api/admin/documents/' + id, 'PUT', body()).then(function (r) {
   if (!r.ok) { dirty = true; setState(message(r), true); toast(message(r), true); return false; }
   setState(tr('Enregistré.', 'Saved.'));
   return true;
  });
  return saving;
 }
 function changed() { dirty = true; setState(tr('Modifications non enregistrées…', 'Unsaved changes…'), true); clearTimeout(timer); timer = setTimeout(save, 900); recalc(); }
 ed.addEventListener('input', function (e) { if (e.target.closest('dialog')) return; changed(); });
 ed.addEventListener('change', function (e) {
  if (e.target.name === 'customer_id' && !F('property_address').value) { var o = e.target.selectedOptions[0]; if (o && o.getAttribute('data-address')) F('property_address').value = o.getAttribute('data-address'); }
  changed();
 });
 ed.addEventListener('submit', function (e) { e.preventDefault(); save(); });
 window.addEventListener('beforeunload', function (e) { if (dirty) { save(); e.preventDefault(); e.returnValue = ''; } });
 $$('[data-add-line]', ed).forEach(function (b) {
  b.addEventListener('click', function () {
   var row = $('#line-template').content.firstElementChild.cloneNode(true);
   $('[name=kind]', row).value = b.getAttribute('data-add-line');
   $('[data-lines]', ed).appendChild(row);
   $('[name=description]', row).focus();
   changed();
  });
 });
 ed.addEventListener('click', function (e) { var rm = e.target.closest('[data-remove-line]'); if (rm) { rm.closest('[data-line]').remove(); changed(); } });
 recalc();

 function copy(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
  var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
  var ok = false; try { ok = document.execCommand('copy'); } catch (_) { /* ignore */ } t.remove(); return Promise.resolve(ok);
 }
 function act(path, data, method) { return save().then(function () { return api('api/admin/documents/' + id + path, method || 'POST', data || {}); }); }
 $$('[data-send]').forEach(function (b) {
  b.addEventListener('click', function () {
   var email = b.getAttribute('data-send') === 'email';
   b.disabled = true;
   act('/send', { email: email }).then(function (r) {
    b.disabled = false;
    if (!r.ok) { toast(message(r), true); return; }
    var e = r.json.email || {}, link = r.json.link;
    return copy(link).then(function (copied) {
     var tail = copied ? tr(' Le lien client a été copié.', ' The customer link was copied.') : '';
     if (!email) toast(copied ? tr('Lien client copié. Collez-le dans un texto ou un courriel.', 'Customer link copied. Paste it in a text or an email.') : link);
     else if (e.sent) toast(tr('Envoyée par courriel.', 'Sent by email.'));
     else if (e.blocked) toast(tr('L’envoi par courriel sera disponible une fois le site à vous.', 'Email sending becomes available once the site is yours.') + tail, true);
     else if (e.skipped === 'live_actions_off') toast(tr('Activez « Envoyer des courriels à mes clients » dans Réglages.', 'Turn on “Send emails to my customers” in Settings.') + tail, true);
     else if (e.skipped === 'no_email') toast(tr('Ce client n’a pas d’adresse courriel.', 'This customer has no email address.') + tail, true);
     else toast(tr('Le courriel n’a pas pu partir.', 'The email could not be sent.') + tail, true);
     setTimeout(function () { location.reload(); }, 2200);
    });
   });
  });
 });
 $$('[data-status]').forEach(function (b) {
  b.addEventListener('click', function () {
   var to = b.getAttribute('data-status'), data = { status: to };
   if (to === 'accepted') {
    var name = window.prompt(tr('Nom de la personne qui a accepté (par téléphone ou en personne) :', 'Name of the person who accepted (by phone or in person):'), ($('select[name=customer_id]', ed).selectedOptions[0] || {}).textContent ? $('select[name=customer_id]', ed).selectedOptions[0].textContent.split(' · ')[0] : '');
    if (name === null) return; data.name = name;
   }
   act('/status', data).then(function (r) { if (!r.ok) { toast(message(r), true); return; } location.reload(); });
  });
 });
 var ACTS = {
  invoice: { path: '/invoice', then: function (r) { go('admin/documents/' + r.json.id); } },
  issue: { path: '/issue', ask: tr('Émettre la facture? Un numéro lui sera attribué et elle ne pourra plus être modifiée.', 'Issue the invoice? It gets a number and can no longer be changed.') },
  pay: { path: '/payment', data: function () { return { method: $('[data-pay-method]').value, paid_on: $('[data-pay-date]').value }; } },
  unpay: { path: '/payment', data: function () { return { undo: true }; } },
  void: { path: '/void', ask: tr('Annuler cette facture? Elle restera dans vos dossiers, marquée « Annulée ».', 'Cancel this invoice? It stays in your records, marked “Cancelled”.') },
  duplicate: { path: '/duplicate', then: function (r) { go('admin/documents/' + r.json.id); } },
  delete: { path: '', method: 'DELETE', ask: tr('Supprimer ce document?', 'Delete this document?'), then: function () { go('admin/documents' + (ed.getAttribute('data-kind') === 'invoice' ? '?type=factures' : '')); } },
 };
 $$('[data-act]').forEach(function (b) {
  b.addEventListener('click', function () {
   var a = ACTS[b.getAttribute('data-act')];
   if (a.ask && !window.confirm(a.ask)) return;
   b.disabled = true;
   act(a.path, a.data ? a.data() : {}, a.method).then(function (r) {
    b.disabled = false;
    if (!r.ok) { toast(message(r), true); return; }
    if (a.then) a.then(r); else location.reload();
   });
  });
 });
})();
