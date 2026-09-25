/* The appointment panel (shared by Today and the board) and the bay board. */
(function () {
  if (!window.App || !window.Admin) return;
  var A = window.Admin; var tr = A.tr; var el = A.el; var en = A.en;
  var cfg = App.data.board || {};

  // ---------------------------------------------------------- the panel
  var panel = A.drawer(tr('Rendez-vous', 'Appointment'));
  var ORDER = ['requested', 'confirmed', 'in_progress', 'ready', 'completed'];

  function openAppointment(a, onChange) {
    var body = panel.body; var foot = panel.foot;
    body.innerHTML = ''; foot.innerHTML = '';
    panel.title(a.contact_name);
    var when = new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { timeZone: 'America/Toronto', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(a.start_at));
    body.appendChild(el('p', {}, [el('span', { class: 'pill pill-' + a.status, text: A.STATUS[a.status] }), Number(a.preview) ? el('span', { class: 'pill pill-preview', text: tr('aperçu — pas un vrai rendez-vous', 'preview — not a real booking') }) : null]));

    var kv = el('dl', { class: 'kv' });
    function row(k, v, href) { if (!v) return; kv.appendChild(el('dt', { text: k })); kv.appendChild(el('dd', {}, [href ? el('a', { href: href, text: v }) : v])); }
    row(tr('Quand', 'When'), when);
    row(tr('Téléphone', 'Phone'), a.contact_phone, A.tel(a.contact_phone));
    row(tr('Courriel', 'Email'), a.contact_email, a.contact_email ? 'mailto:' + a.contact_email : null);
    row(tr('Véhicule', 'Vehicle'), a.vehicle_label);
    row(tr('Travaux', 'Work'), a.service_names);
    row(tr('Demande du client', 'Customer’s note'), a.concern);
    row(tr('Sur place', 'On site'), a.stay === 'wait' ? tr('Attend sur place', 'Waits on site') : tr('Laisse l’auto', 'Drops the car off'));
    row(tr('Baie', 'Bay'), a.bay ? String(a.bay) : '');
    if (Number(a.courtesy_car)) row(tr('Voiture de courtoisie', 'Courtesy car'), tr('Demandée', 'Requested'));
    if (Number(a.towing)) row(tr('Remorquage', 'Towing'), a.towing_address || tr('Demandé', 'Requested'));
    row(tr('Numéro', 'Reference'), a.reference);
    body.appendChild(kv);

    // Status: the next step as a big button, every status reachable.
    var next = A.NEXT[a.status];
    if (next) {
      body.appendChild(el('button', { class: 'btn btn-primary btn-block', type: 'button', text: next[1], onclick: function () { save(a, { status: next[0] }, onChange); } }));
    }
    body.appendChild(el('p', { class: 'field-label', style: 'margin:18px 0 8px', text: tr('Ou choisir l’étape', 'Or pick the step') }));
    var steps = el('div', { class: 'steps' });
    ORDER.concat(['no_show', 'cancelled']).forEach(function (s) {
      steps.appendChild(el('button', { class: 'chip', type: 'button', 'aria-pressed': a.status === s ? 'true' : 'false', text: A.STATUS[s],
        onclick: function () {
          if (s === 'cancelled' && !confirm(tr('Annuler ce rendez-vous ?', 'Cancel this appointment?'))) return;
          save(a, { status: s }, onChange);
        } }));
    });
    body.appendChild(steps);

    // Estimate / invoice for this job.
    var docsRow = el('div', { class: 'chips', style: 'margin-bottom:18px' });
    (a.documents || []).forEach(function (d) {
      docsRow.appendChild(el('a', { class: 'chip', href: 'admin/documents/' + d.id, text: (d.kind === 'invoice' ? tr('Facture', 'Invoice') : tr('Estimation', 'Estimate')) + ' ' + (d.number || '') }));
    });
    ['estimate', 'invoice'].forEach(function (k) {
      if ((a.documents || []).some(function (d) { return d.kind === k; })) return;
      docsRow.appendChild(el('button', { class: 'chip', type: 'button', text: '+ ' + (k === 'invoice' ? tr('Facture', 'Invoice') : tr('Estimation', 'Estimate')),
        onclick: function () { A.newDocument(k, { appointmentId: a.id }); } }));
    });
    body.appendChild(el('p', { class: 'field-label', style: 'margin:0 0 8px', text: tr('Estimation et facture', 'Estimate and invoice') }));
    body.appendChild(docsRow);

    // Set or change the time (a request from the site has no bay yet).
    if (['requested', 'confirmed'].indexOf(a.status) > -1) {
      var box = el('div', { style: 'margin:0 0 18px' });
      var isReq = a.bay == null;
      box.appendChild(el('p', { class: 'field-label', style: 'margin:0 0 8px', text: isReq ? tr('Demande sans heure fixe — fixez l’heure', 'Request without a set time — set the time') : tr('Changer la date ou l’heure', 'Change the date or time') }));
      var dateIn = el('input', { type: 'date', class: 'input', value: a.local ? a.local.date : '' });
      var slotsBox = el('div', { class: 'slots', style: 'margin-top:10px' });
      async function loadSlots() {
        slotsBox.innerHTML = '';
        try {
          var r = await App.request('api/admin/availability?days=1&from=' + dateIn.value + '&minutes=' + (Number(a.duration_min) || 60) + '&exclude=' + a.id);
          var d = r.days.find(function (x) { return x.date === dateIn.value; });
          if (!d || !d.slots.length) { slotsBox.appendChild(el('p', { class: 'muted small', text: tr('Aucune plage libre ce jour-là.', 'No free time that day.') })); return; }
          d.slots.forEach(function (s) {
            slotsBox.appendChild(el('button', { class: 'slot', type: 'button', text: s.time.replace(':', en ? ':' : ' h '), onclick: async function () {
              try { var res = await App.request('api/admin/appointments/' + a.id + '/moment', { method: 'PUT', body: JSON.stringify({ date: dateIn.value, time: s.time }) });
                App.toast(tr('Heure fixée ✓', 'Time set ✓')); panel.close(); if (onChange) onChange(Object.assign({}, res.appointment, { documents: a.documents || [] })); }
              catch (e) { App.toast(e.message); }
            } }));
          });
        } catch (e) { App.toast(e.message); }
      }
      dateIn.addEventListener('change', loadSlots);
      box.appendChild(dateIn); box.appendChild(slotsBox);
      body.appendChild(box);
      if (dateIn.value) loadSlots();
    }

    var note = el('textarea', { maxlength: '1000', rows: '3' }); note.value = a.garage_note || '';
    var inote = el('textarea', { maxlength: '4000', rows: '3' }); inote.value = a.internal_note || '';
    body.appendChild(A.field(tr('Message au client', 'Message to the customer'), note, a.walkIn ? tr('Visible s’il a un compte en ligne.', 'Visible if they have an online account.') : tr('Visible dans son compte en ligne.', 'Shown in their online account.')));
    body.appendChild(A.field(tr('Note pour l’atelier (jamais montrée au client)', 'Shop note (never shown to the customer)'), inote));

    if (a.contact_phone) foot.appendChild(el('a', { class: 'btn', href: A.tel(a.contact_phone), text: tr('Appeler', 'Call') }));
    foot.appendChild(el('button', { class: 'btn btn-primary', type: 'button', text: tr('Enregistrer les notes', 'Save notes'), onclick: function () { save(a, { garage_note: note.value, internal_note: inote.value }, onChange); } }));
    panel.open();
  }

  async function save(a, body, onChange) {
    try {
      var r = await App.request('api/admin/appointments/' + a.id, { method: 'PUT', body: JSON.stringify(body) });
      var next = Object.assign({}, r.appointment, { documents: a.documents || [] });
      App.toast(body.status ? A.STATUS[body.status] + ' ✓' : tr('Enregistré ✓', 'Saved ✓'));
      if (onChange) onChange(next);
      if (body.status) panel.close(); else openAppointment(next, onChange);
    } catch (e) { App.toast(e.message); }
  }
  A.openAppointment = openAppointment;
  A.saveAppointment = save;

  // ------------------------------------------------------------ the board
  var root = document.querySelector('[data-board]');
  if (!root) return;
  var PX = 1.15; // pixels per minute
  var state = { from: cfg.date || null, days: window.innerWidth < 760 ? 1 : (Number(root.getAttribute('data-days')) || 7), data: null };
  function add(isoDate, n) { var p = isoDate.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10); }
  function noon(isoDate) { var p = isoDate.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)); }
  function mins(hhmm) { var p = hhmm.split(':').map(Number); return p[0] * 60 + p[1]; }
  function weekday(isoDate) { var w = noon(isoDate).getUTCDay(); return w === 0 ? 7 : w; }
  function div(cls, text) { return el('div', { class: cls, text: text }); }

  async function load() {
    var q = 'api/admin/board?days=' + state.days + (state.from ? '&from=' + state.from : '');
    try { state.data = await App.request(q); } catch (e) { root.textContent = e.message; return; }
    state.from = state.data.from;
    render();
  }

  function render() {
    var d = state.data; root.innerHTML = '';
    var byDay = {}; d.hours.forEach(function (h) { byDay[h.weekday] = h; });
    var closures = {}; d.closures.forEach(function (c) { closures[String(c.date).slice(0, 10)] = c; });
    var open = 8 * 60, close = 18 * 60;
    d.hours.forEach(function (h) { if (!h.closed && h.opens) { open = Math.min(open, mins(h.opens)); close = Math.max(close, mins(h.closes)); } });
    open = Math.floor(open / 60) * 60; close = Math.ceil(close / 60) * 60;
    var height = (close - open) * PX;
    var grid = div('board'); grid.style.setProperty('--cols', d.days);
    var timeCol = div('board-col board-col--time'); timeCol.appendChild(div('board-head', ''));
    var times = div('board-times'); times.style.height = height + 'px';
    for (var m = open; m <= close; m += 60) { var s = el('span', { text: en ? ((m / 60) % 12 || 12) + (m / 60 < 12 ? ' am' : ' pm') : (m / 60) + ' h' }); s.style.top = ((m - open) * PX) + 'px'; times.appendChild(s); }
    timeCol.appendChild(times); grid.appendChild(timeCol);
    var fmtHead = new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { weekday: 'short', timeZone: 'UTC' });
    for (var i = 0; i < d.days; i++) {
      var day = add(d.from, i); var h = byDay[weekday(day)];
      var col = div('board-col' + ((!h || h.closed || closures[day]) ? ' closed' : '') + (day === d.today ? ' today' : ''));
      var head = div('board-head'); head.appendChild(el('span', { text: fmtHead.format(noon(day)).replace('.', '') })); head.appendChild(el('b', { text: String(noon(day).getUTCDate()) }));
      if (closures[day]) head.title = closures[day].reason || '';
      col.appendChild(head);
      var body = div('board-body'); body.style.height = height + 'px';
      for (var mm = open; mm < close; mm += 60) { var ln = div('board-line'); ln.style.top = ((mm - open) * PX) + 'px'; body.appendChild(ln); }
      d.appointments.filter(function (a) { return a.local.date === day; }).forEach(function (a) {
        var top = (mins(a.local.time) - open) * PX; var len = Math.max(30, Number(a.duration_min) * PX);
        var bay = Math.max(1, Number(a.bay) || 1); var w = 100 / d.bays;
        var b = el('button', { class: 'appt st-' + a.status + (Number(a.preview) ? ' is-preview' : ''), type: 'button' }, [
          el('b', { text: a.local.time + ' · ' + a.contact_name }), el('small', { text: a.vehicle_label || '' }), el('small', { text: a.service_names || '' })]);
        b.style.top = top + 'px'; b.style.height = len + 'px'; b.style.left = 'calc(' + ((bay - 1) * w) + '% + 3px)'; b.style.width = 'calc(' + w + '% - 6px)';
        b.addEventListener('click', function () { openAppointment(a, function (next) { state.data.appointments = state.data.appointments.map(function (x) { return x.id === next.id ? Object.assign(next, { local: x.local }) : x; }); render(); }); });
        body.appendChild(b);
      });
      if (day === d.today) {
        var now = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).format(new Date());
        var nm = mins(now); if (nm >= open && nm <= close) { var nl = div('now-line'); nl.style.top = ((nm - open) * PX) + 'px'; body.appendChild(nl); }
      }
      col.appendChild(body); grid.appendChild(col);
    }
    var scroll = div('board-scroll'); scroll.appendChild(grid); root.appendChild(scroll);
    var range = document.querySelector('[data-range]');
    if (range) {
      var f = new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { day: 'numeric', month: 'long', timeZone: 'UTC' });
      range.textContent = d.days === 1 ? new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(noon(d.from)) : f.format(noon(d.from)) + ' – ' + f.format(noon(add(d.from, d.days - 1)));
    }
    document.querySelectorAll('[data-span]').forEach(function (b) { b.setAttribute('aria-pressed', Number(b.getAttribute('data-span')) === d.days ? 'true' : 'false'); });
  }

  document.querySelectorAll('[data-nav]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = Number(b.getAttribute('data-nav'));
      state.from = n === 0 ? null : add(state.from || state.data.today, n * state.days);
      load();
    });
  });
  document.querySelectorAll('[data-span]').forEach(function (b) {
    b.addEventListener('click', function () { state.days = Number(b.getAttribute('data-span')); load(); });
  });
  load();
})();
