/* Estimate / invoice editor. Saves itself; the server recomputes every total. */
(function () {
  if (!window.App || !window.Admin) return;
  var A = window.Admin; var tr = A.tr; var el = A.el; var $ = A.$; var $$ = A.$$; var en = A.en;
  var P = App.data; var doc = P.doc; var isInv = doc.kind === 'invoice';
  var TPS = 0.05, TVQ = 0.09975;
  var KINDS = { part: tr('Pièce', 'Part'), labour: tr('Main-d’œuvre', 'Labour'), fee: tr('Frais / forfait', 'Fee / flat rate'), note: tr('Note', 'Note') };
  var CONDS = { new: tr('Neuve', 'New'), used: tr('Usagée', 'Used'), reman: tr('Réusinée', 'Remanufactured'), recond: tr('Remise à neuf', 'Reconditioned') };
  var METHODS = { cash: tr('Comptant', 'Cash'), debit: tr('Débit', 'Debit'), credit: tr('Crédit', 'Credit'), transfer: tr('Virement', 'Transfer'), cheque: tr('Chèque', 'Cheque') };

  var st = {
    clientId: doc.client_id, vehicleId: doc.vehicle_id, vehicles: [],
    lines: doc.lines.map(function (l) { return { kind: l.kind, description: l.description, part_condition: l.part_condition || 'new', part_number: l.part_number || '', quantity: A.qty(l.quantity), unit: A.dollars(l.unit_cents) }; }),
  };
  function editable() { return isInv ? doc.status === 'draft' : ['draft', 'sent'].indexOf(doc.status) > -1; }
  function rateCents() { var c = A.parseMoney($('[data-f=labour_rate]').value); return Number.isFinite(c) && c != null ? c : 0; }

  // -------------------------------------------------------- header fields
  var F = {};
  $$('[data-f]').forEach(function (i) { F[i.getAttribute('data-f')] = i; });
  function fill() {
    ['client_name', 'client_phone', 'client_email', 'client_address', 'vehicle_label', 'vehicle_plate', 'vehicle_vin', 'customer_note', 'internal_note', 'warranty_text', 'issued_on', 'valid_until', 'delivered_on'].forEach(function (k) {
      if (F[k]) F[k].value = doc[k] == null ? '' : doc[k];
    });
    F.odometer_km.value = doc.odometer_km == null ? '' : doc.odometer_km;
    F.charge_taxes.checked = !!Number(doc.charge_taxes);
    F.return_parts.checked = !!Number(doc.return_parts);
    F.labour_rate.value = A.dollars(doc.labour_rate_cents);
    $('[data-rate-hint]').textContent = P.rate ? '' : tr('Astuce : entrez votre taux une fois dans Réglages, il sera mis d’office.', 'Tip: set your rate once in Settings and it is filled in for you.');
  }

  // ---------------------------------------------------------------- lines
  var linesBox = $('[data-lines]');
  function lineTotal(l) {
    if (l.kind === 'note') return 0;
    var q = A.parseQty(l.quantity); var u = A.parseMoney(l.unit);
    if (!Number.isFinite(q) || !Number.isFinite(u) || u == null) return NaN;
    return Math.round(q * u);
  }
  function renderLines() {
    linesBox.innerHTML = '';
    var lock = !editable();
    st.lines.forEach(function (l, i) {
      var row = el('div', { class: 'line' + (l.kind === 'note' ? ' is-note' : '') });
      var kind = el('select', { 'aria-label': tr('Type', 'Type'), disabled: lock || null });
      Object.keys(KINDS).forEach(function (k) { var o = el('option', { value: k, text: KINDS[k] }); if (k === l.kind) o.selected = true; kind.appendChild(o); });
      kind.addEventListener('change', function () {
        l.kind = kind.value;
        if (l.kind === 'labour' && !l.unit) l.unit = A.dollars(rateCents());
        renderLines(); changed();
      });
      var desc = el('input', { class: 'desc', value: l.description, maxlength: '500', 'aria-label': tr('Description', 'Description'), placeholder: l.kind === 'labour' ? tr('ex. Remplacer les plaquettes avant', 'e.g. Replace front brake pads') : l.kind === 'part' ? tr('ex. Plaquettes de frein avant', 'e.g. Front brake pads') : '', disabled: lock || null });
      desc.addEventListener('input', function () { l.description = desc.value; changed(); });
      row.appendChild(desc); row.appendChild(labelled(tr('Type', 'Type'), kind, 'kind'));
      if (l.kind !== 'note') {
        var cond = el('select', { 'aria-label': tr('État de la pièce', 'Part condition'), disabled: lock || null });
        if (l.kind === 'part') Object.keys(CONDS).forEach(function (k) { var o = el('option', { value: k, text: CONDS[k] }); if (k === l.part_condition) o.selected = true; cond.appendChild(o); });
        else { cond.appendChild(el('option', { text: '—' })); cond.disabled = true; }
        cond.addEventListener('change', function () { l.part_condition = cond.value; changed(); });
        var q = el('input', { class: 'q', value: l.quantity, inputmode: 'decimal', 'aria-label': l.kind === 'labour' ? tr('Heures', 'Hours') : tr('Quantité', 'Quantity'), disabled: lock || null });
        q.addEventListener('input', function () { l.quantity = q.value; tot.textContent = fmtLine(l); changed(); });
        var uwrap = el('span', { class: 'input-money' });
        var u = el('input', { class: 'u', value: l.unit, inputmode: 'decimal', 'aria-label': l.kind === 'labour' ? tr('Taux horaire', 'Hourly rate') : tr('Prix unitaire', 'Unit price'), disabled: lock || null });
        u.addEventListener('input', function () { l.unit = u.value; tot.textContent = fmtLine(l); changed(); });
        uwrap.appendChild(u);
        var tot = el('span', { class: 'line-total', text: fmtLine(l) });
        var cw = labelled(tr('État de la pièce', 'Part condition'), cond, 'cond');
        if (l.kind !== 'part') cw.style.visibility = 'hidden';
        row.appendChild(cw);
        row.appendChild(labelled(l.kind === 'labour' ? tr('Heures', 'Hours') : tr('Quantité', 'Quantity'), q, 'qw'));
        row.appendChild(labelled(l.kind === 'labour' ? tr('Taux horaire', 'Hourly rate') : tr('Prix unitaire', 'Unit price'), uwrap, 'uw'));
        row.appendChild(tot);
      }
      var del = el('button', { class: 'icon-btn del', type: 'button', 'aria-label': tr('Retirer la ligne', 'Remove line'), html: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>', disabled: lock || null,
        onclick: function () { st.lines.splice(i, 1); renderLines(); changed(); } });
      row.appendChild(del);
      linesBox.appendChild(row);
    });
    if (!st.lines.length) linesBox.appendChild(el('p', { class: 'muted', style: 'padding:14px 0', text: tr('Aucune ligne. Ajoutez une pièce, de la main-d’œuvre ou un service de votre liste.', 'No lines yet. Add a part, labour or a service from your list.') }));
    renderTotals();
  }
  function labelled(label, input, cls) { var w = el('span', { class: cls || '' }); w.appendChild(el('span', { class: 'line-lbl', text: label })); w.appendChild(input); return w; }
  function fmtLine(l) { var t = lineTotal(l); return Number.isFinite(t) ? A.money(t) : '—'; }
  function addLine(kind, extra) {
    st.lines.push(Object.assign({ kind: kind, description: '', part_condition: 'new', part_number: '', quantity: '1', unit: kind === 'labour' ? A.dollars(rateCents()) : '' }, extra || {}));
    renderLines(); changed();
    var descs = $$('.line .desc', linesBox); if (descs.length && !(extra && extra.description)) descs[descs.length - 1].focus();
  }
  $$('[data-add]').forEach(function (b) { b.addEventListener('click', function () { addLine(b.getAttribute('data-add')); }); });
  var svcSel = $('[data-add-service]');
  (P.priced || []).forEach(function (s) { svcSel.appendChild(el('option', { value: String(s.id), text: s.name + (s.price_cents ? ' — ' + A.money(s.price_cents) : '') })); });
  svcSel.addEventListener('change', function () {
    var s = (P.priced || []).find(function (x) { return String(x.id) === svcSel.value; });
    svcSel.value = '';
    if (!s) return;
    if (s.price_cents) addLine('fee', { description: s.name, quantity: '1', unit: A.dollars(s.price_cents) });
    else addLine('labour', { description: s.name, quantity: A.qty(Math.max(0.25, Math.round((Number(s.duration_min) || 60) / 15) / 4)), unit: A.dollars(rateCents()) });
  });

  // --------------------------------------------------------------- totals
  function renderTotals() {
    var sub = 0, bad = false;
    st.lines.forEach(function (l) { var t = lineTotal(l); if (!Number.isFinite(t)) bad = true; else sub += t; });
    var taxes = F.charge_taxes.checked;
    var tps = taxes ? Math.round(sub * TPS) : 0, tvq = taxes ? Math.round(sub * TVQ) : 0, total = sub + tps + tvq;
    var box = $('[data-totals]'); box.innerHTML = '';
    function line(k, v, cls) { box.appendChild(el('div', { class: cls || '' }, [el('span', { text: k }), el('span', { class: 'num', text: v })])); }
    line(tr('Sous-total', 'Subtotal'), A.money(sub));
    if (taxes) { line(tr('TPS (5 %)', 'GST (5%)'), A.money(tps)); line(tr('TVQ (9,975 %)', 'QST (9.975%)'), A.money(tvq)); }
    line(tr('Total', 'Total'), A.money(total), 'grand');
    if (isInv && doc.paid_cents > 0) { line(tr('Payé', 'Paid'), A.money(doc.paid_cents)); line(tr('Solde', 'Balance'), A.money(Math.max(0, doc.total_cents - doc.paid_cents)), 'balance'); }
    if (bad) box.appendChild(el('p', { class: 'error-text', text: tr('Un montant n’est pas lisible — ex. 45,99', 'An amount can’t be read — e.g. 45.99') }));
    renderMissing();
  }
  F.charge_taxes.addEventListener('change', function () { renderTotals(); changed(); });
  F.labour_rate.addEventListener('change', function () {
    var old = A.dollars(doc.labour_rate_cents); var nw = A.dollars(rateCents());
    st.lines.forEach(function (l) { if (l.kind === 'labour' && (!l.unit || l.unit === old)) l.unit = nw; });
    doc.labour_rate_cents = rateCents(); renderLines(); changed();
  });

  // What the law expects on the paper, still missing.
  function renderMissing() {
    var m = [];
    if (!F.client_name.value.trim()) m.push(tr('le nom du client', 'the customer’s name'));
    if (!F.client_address.value.trim()) m.push(tr('l’adresse du client', 'the customer’s address'));
    if (!F.vehicle_label.value.trim()) m.push(tr('le véhicule (marque, modèle)', 'the vehicle (make, model)'));
    if (!F.vehicle_plate.value.trim()) m.push(tr('la plaque', 'the plate'));
    if (!st.lines.some(function (l) { return l.kind !== 'note' && l.description.trim(); })) m.push(tr('au moins une ligne de travaux', 'at least one line of work'));
    if (isInv && !F.odometer_km.value.trim()) m.push(tr('le kilométrage à la remise', 'the mileage at pickup'));
    if (st.lines.some(function (l) { return l.kind === 'labour'; }) && !rateCents()) m.push(tr('le taux horaire', 'the hourly rate'));
    var box = $('[data-missing]');
    box.hidden = !m.length || !editable();
    box.innerHTML = '';
    if (m.length) { box.appendChild(el('strong', { text: tr('À compléter pour un document conforme :', 'To complete for a compliant document:') })); var ul = el('ul'); m.forEach(function (x) { ul.appendChild(el('li', { text: x })); }); box.appendChild(ul); }
  }

  // ---------------------------------------------------------------- saving
  var saveState = $('[data-save-state]'); var timer = null; var saving = null; var dirty = false;
  function changed() { dirty = true; saveState.textContent = tr('Modifications…', 'Editing…'); clearTimeout(timer); timer = setTimeout(save, 900); renderMissing(); }
  $$('[data-f]').forEach(function (i) { if (i.type !== 'checkbox' && i.getAttribute('data-f') !== 'labour_rate') i.addEventListener('input', changed); });
  F.return_parts.addEventListener('change', changed);
  function payload() {
    return {
      clientId: st.clientId || undefined, vehicleId: st.vehicleId || undefined,
      client_name: F.client_name.value, client_phone: F.client_phone.value, client_email: F.client_email.value, client_address: F.client_address.value,
      vehicle_label: F.vehicle_label.value, vehicle_plate: F.vehicle_plate.value, vehicle_vin: F.vehicle_vin.value, odometer_km: F.odometer_km.value,
      issued_on: F.issued_on.value, valid_until: F.valid_until ? F.valid_until.value : undefined, delivered_on: F.delivered_on ? F.delivered_on.value : undefined,
      labour_rate: F.labour_rate.value, charge_taxes: F.charge_taxes.checked, return_parts: F.return_parts.checked,
      warranty_text: F.warranty_text ? F.warranty_text.value : undefined,
      customer_note: F.customer_note.value, internal_note: F.internal_note.value,
      lines: st.lines.map(function (l) { return { kind: l.kind, description: l.description, part_condition: l.part_condition, part_number: l.part_number, quantity: l.quantity, unit: l.unit }; }),
    };
  }
  async function save() {
    clearTimeout(timer);
    if (!dirty) return saving;
    dirty = false;
    saveState.textContent = tr('Enregistrement…', 'Saving…');
    saving = App.request('api/admin/documents/' + doc.id, { method: 'PUT', body: JSON.stringify(payload()) }).then(function (r) {
      doc = Object.assign(doc, r.document);
      saveState.textContent = dirty ? tr('Modifications…', 'Editing…') : tr('Enregistré ✓', 'Saved ✓');
      renderTotalsFromServer();
    }).catch(function (e) {
      dirty = true;
      saveState.textContent = '';
      App.toast(e.message === 'invalid' || e.code === 'invalid' ? tr('Un champ n’est pas valide (montant, heures ou kilométrage).', 'A field is not valid (amount, hours or mileage).') : e.message);
    });
    return saving;
  }
  function renderTotalsFromServer() { if (!dirty) renderTotals(); }
  window.addEventListener('beforeunload', function (e) { if (dirty) { save(); e.preventDefault(); e.returnValue = ''; } });

  $('[data-print]').addEventListener('click', async function (e) {
    e.preventDefault(); var href = this.href; var w = window.open('about:blank', '_blank');
    await save(); if (w) w.location.href = href; else location.href = href;
  });

  // ---------------------------------------------------- customer + vehicle
  var qInput = $('[data-client-q]'); var results = $('[data-client-results]'); var qTimer;
  qInput.addEventListener('input', function () {
    clearTimeout(qTimer);
    qTimer = setTimeout(async function () {
      var q = qInput.value.trim(); if (q.length < 2) { results.hidden = true; return; }
      try {
        var r = await App.request('api/admin/clients?q=' + encodeURIComponent(q));
        results.innerHTML = '';
        r.clients.forEach(function (c) { results.appendChild(el('button', { type: 'button', onclick: function () { pickClient(c); } }, [c.name, el('small', { text: [c.phone, c.email].filter(Boolean).join(' · ') })])); });
        if (!r.clients.length) results.appendChild(el('button', { type: 'button', disabled: true, text: tr('Aucun client — tapez ses coordonnées ci-dessous.', 'No customer — type their details below.') }));
        results.hidden = false;
      } catch (e) { App.toast(e.message); }
    }, 220);
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.client-pick')) results.hidden = true; });
  async function pickClient(c) {
    results.hidden = true; qInput.value = '';
    st.clientId = c.id; st.vehicleId = null;
    F.client_name.value = c.name || ''; F.client_phone.value = c.phone || ''; F.client_email.value = c.email || ''; F.client_address.value = c.address || '';
    await loadVehicles(); if (st.vehicles.length === 1) pickVehicle(st.vehicles[0]);
    changed();
  }
  async function loadVehicles() {
    var link = $('[data-client-link]');
    if (!st.clientId) { st.vehicles = []; link.hidden = true; renderVehicleChips(); return; }
    link.hidden = false; link.href = 'admin/clients/' + st.clientId;
    try { var r = await App.request('api/admin/clients/' + st.clientId); st.vehicles = r.vehicles; } catch (e) { st.vehicles = []; }
    renderVehicleChips();
  }
  function vlabel(v) { return [v.year, v.make, v.model, v.trim].filter(Boolean).join(' '); }
  function renderVehicleChips() {
    var box = $('[data-vehicle-chips]'); box.innerHTML = '';
    st.vehicles.forEach(function (v) {
      box.appendChild(el('button', { class: 'chip', type: 'button', 'aria-pressed': st.vehicleId === v.id ? 'true' : 'false', disabled: editable() ? null : true, text: vlabel(v) + (v.plate ? ' · ' + v.plate : ''),
        onclick: function () { pickVehicle(v); changed(); } }));
    });
    box.hidden = !st.vehicles.length;
  }
  function pickVehicle(v) {
    st.vehicleId = v.id;
    F.vehicle_label.value = vlabel(v); F.vehicle_plate.value = v.plate || ''; F.vehicle_vin.value = v.vin || '';
    if (v.odometer_km != null && !F.odometer_km.value) F.odometer_km.value = v.odometer_km;
    renderVehicleChips();
  }

  // --------------------------------------------------------------- actions
  var actions = $('[data-actions]');
  async function setStatus(to, extra) {
    await save();
    try {
      var r = await App.request('api/admin/documents/' + doc.id + '/status', { method: 'POST', body: JSON.stringify(Object.assign({ status: to }, extra || {})) });
      doc = Object.assign(doc, r.document);
      App.toast(A.DOC_STATUS[to] + ' ✓');
      if (to === 'unpaid' && doc.number) setTimeout(function () { location.reload(); }, 400); else render();
    } catch (e) { App.toast(e.code === 'required' ? tr('Il manque le nom du client ou une ligne de travaux.', 'The customer’s name or a line of work is missing.') : e.message); }
  }
  async function post(path, msg) {
    await save();
    try { var r = await App.request('api/admin/documents/' + doc.id + path, { method: 'POST', body: '{}' }); App.toast(msg); location.href = r.url; }
    catch (e) { App.toast(e.message); }
  }
  function btn(text, cls, fn) { return el('button', { class: 'btn btn-block ' + (cls || ''), type: 'button', text: text, onclick: fn }); }
  function renderActions() {
    actions.innerHTML = '';
    var s = doc.status; var box = el('div', { class: 'stack' });
    if (!isInv) {
      if (s === 'draft') {
        box.appendChild(btn(tr('Remise au client', 'Given to the customer'), 'btn-primary', function () { setStatus('sent'); }));
        box.appendChild(btn(tr('Le client accepte', 'Customer accepts'), '', function () { setStatus('accepted'); }));
      }
      if (s === 'sent') {
        box.appendChild(btn(tr('Le client accepte', 'Customer accepts'), 'btn-primary', function () { setStatus('accepted'); }));
        box.appendChild(btn(tr('Le client refuse', 'Customer declines'), '', function () { setStatus('declined'); }));
        box.appendChild(btn(tr('Revenir en brouillon', 'Back to draft'), 'btn-quiet', function () { setStatus('draft'); }));
      }
      if (s === 'accepted') box.appendChild(btn(tr('Créer la facture', 'Create the invoice'), 'btn-primary', function () { post('/invoice', tr('Facture créée', 'Invoice created')); }));
      if (s === 'declined') box.appendChild(btn(tr('Remettre au client', 'Give to the customer again'), '', function () { setStatus('sent'); }));
      if (s === 'invoiced') box.appendChild(btn(tr('Voir la facture', 'See the invoice'), 'btn-primary', function () { post('/invoice', ''); }));
      if (s !== 'draft') box.appendChild(btn(tr('Nouvelle version (copie)', 'New version (copy)'), 'btn-quiet', function () { post('/copy', tr('Copie créée', 'Copy created')); }));
    } else {
      if (s === 'draft') {
        box.appendChild(btn(tr('Émettre la facture', 'Issue the invoice'), 'btn-primary', function () {
          if (confirm(tr('Émettre la facture ? Elle reçoit son numéro et ne se modifie plus (vous pourrez l’annuler et en refaire une).', 'Issue the invoice? It gets its number and can no longer be edited (you can cancel it and make a new one).'))) setStatus('unpaid');
        }));
      }
      if (s === 'unpaid') renderPayment(box);
      if (s === 'paid') {
        box.appendChild(el('p', { class: 'small', text: tr('Payée', 'Paid') + (doc.paid_on ? ' ' + tr('le', 'on') + ' ' + doc.paid_on : '') + (doc.payment_method ? ' · ' + METHODS[doc.payment_method] : '') }));
        box.appendChild(btn(tr('Annuler le paiement', 'Undo the payment'), 'btn-quiet', function () { if (confirm(tr('Remettre la facture « à payer » ?', 'Mark the invoice unpaid again?'))) setStatus('unpaid'); }));
      }
      if (s === 'void') box.appendChild(btn(tr('Faire une copie corrigée', 'Make a corrected copy'), 'btn-primary', function () { post('/copy', tr('Copie créée', 'Copy created')); }));
      if (s === 'unpaid') box.appendChild(btn(tr('Annuler la facture', 'Cancel the invoice'), 'btn-danger', function () { if (confirm(tr('Annuler cette facture ? Elle reste dans vos dossiers, marquée « Annulée ».', 'Cancel this invoice? It stays in your records, marked "Cancelled".'))) setStatus('void'); }));
    }
    if (s === 'draft' && !(isInv && doc.number)) {
      box.appendChild(btn(tr('Supprimer le brouillon', 'Delete the draft'), 'btn-danger', async function () {
        if (!confirm(tr('Supprimer ce brouillon ?', 'Delete this draft?'))) return;
        try { dirty = false; await App.request('api/admin/documents/' + doc.id, { method: 'DELETE' }); location.href = 'admin/documents'; } catch (e) { App.toast(e.message); }
      }));
    }
    actions.appendChild(box);
  }
  function renderPayment(box) {
    var balance = Math.max(0, doc.total_cents - doc.paid_cents);
    box.appendChild(el('h2', { style: 'font-size:18px;margin:0', text: tr('Encaisser', 'Take payment') }));
    var amount = el('input', { inputmode: 'decimal', value: A.dollars(balance) });
    var aw = el('span', { class: 'input-money' }); aw.appendChild(amount);
    box.appendChild(A.field(tr('Montant reçu', 'Amount received'), aw));
    var method = 'debit';
    var chips = el('div', { class: 'chips' });
    Object.keys(METHODS).forEach(function (k) {
      chips.appendChild(el('button', { class: 'chip', type: 'button', 'aria-pressed': k === method ? 'true' : 'false', text: METHODS[k],
        onclick: function () { method = k; $$('.chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', c.textContent === METHODS[k] ? 'true' : 'false'); }); } }));
    });
    box.appendChild(chips);
    var date = el('input', { type: 'date', value: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) });
    box.appendChild(A.field(tr('Date', 'Date'), date));
    box.appendChild(btn(tr('Enregistrer le paiement', 'Record the payment'), 'btn-ok', async function () {
      try {
        var r = await App.request('api/admin/documents/' + doc.id + '/payment', { method: 'POST', body: JSON.stringify({ amount: amount.value, method: method, date: date.value }) });
        doc = Object.assign(doc, r.document); App.toast(doc.status === 'paid' ? tr('Payée ✓', 'Paid ✓') : tr('Paiement partiel enregistré ✓', 'Partial payment recorded ✓')); render();
      } catch (e) { App.toast(tr('Montant invalide', 'Invalid amount')); }
    }));
  }

  // ---------------------------------------------------------------- render
  function render() {
    var pill = $('[data-status-pill]'); pill.className = 'pill pill-' + doc.status; pill.textContent = A.DOC_STATUS[doc.status];
    var lock = $('[data-lock]'); var ed = editable();
    lock.hidden = ed;
    lock.textContent = isInv
      ? (doc.status === 'void' ? tr('Facture annulée. Elle reste dans vos dossiers.', 'Cancelled invoice. It stays in your records.') : tr('Facture émise : elle ne se modifie plus. Pour corriger, annulez-la et faites une copie corrigée. Les notes restent modifiables.', 'Issued invoice: it can no longer be edited. To correct it, cancel it and make a corrected copy. Notes can still be edited.'))
      : tr('Estimation acceptée ou fermée : elle lie le garage et le client. Pour changer quelque chose, faites une nouvelle version.', 'Accepted or closed estimate: it binds the garage and the customer. To change something, make a new version.');
    $$('[data-f]').forEach(function (i) { var k = i.getAttribute('data-f'); if (k !== 'customer_note' && k !== 'internal_note') i.disabled = !ed; });
    $('[data-client-search]').hidden = !ed; $('[data-add-lines]').hidden = !ed;
    renderLines(); renderVehicleChips(); renderActions();
  }

  fill(); loadVehicles(); render();
})();
