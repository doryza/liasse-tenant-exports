/* New appointment for a customer who called or walked in. */
(function () {
  if (!window.App || !window.Admin) return;
  var A = window.Admin; var tr = A.tr; var el = A.el; var $ = A.$; var $$ = A.$$; var en = A.en;
  var cfg = App.data.book || {};
  var st = { client: cfg.client || null, newClient: false, vehicles: cfg.vehicles || [], vehicleId: null, newVehicle: false, date: null, time: null, stay: 'drop' };

  // ------------------------------------------------------------- client
  var qInput = $('[data-client-q]'); var results = $('[data-client-results]');
  var chosen = $('[data-client-chosen]'); var finder = $('[data-client-find]'); var cform = $('[data-client-form]');
  var timer;
  qInput.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(async function () {
      var q = qInput.value.trim();
      if (q.length < 2) { results.hidden = true; return; }
      try {
        var r = await App.request('api/admin/clients?q=' + encodeURIComponent(q));
        results.innerHTML = '';
        if (!r.clients.length) results.appendChild(el('button', { type: 'button', text: tr('Aucun client trouvé — créer « ', 'No customer found — create "') + q + (en ? '"' : ' »'), onclick: function () { startNew(q); } }));
        r.clients.forEach(function (c) {
          results.appendChild(el('button', { type: 'button', onclick: function () { pickClient(c); } }, [c.name, el('small', { text: [c.phone, c.email].filter(Boolean).join(' · ') })]));
        });
        results.hidden = false;
      } catch (e) { App.toast(e.message); }
    }, 220);
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.client-pick')) results.hidden = true; });
  $('[data-client-new]').addEventListener('click', function () { startNew(''); });

  function startNew(name) {
    st.client = null; st.newClient = true; results.hidden = true;
    cform.hidden = false; $('[name=name]', cform).value = name || qInput.value.trim();
    $('[name=name]', cform).focus();
    st.vehicles = []; st.vehicleId = null; showVehicleForm(true); renderVehicles(); update();
  }
  async function pickClient(c) {
    st.client = c; st.newClient = false; results.hidden = true; cform.hidden = true;
    try { var r = await App.request('api/admin/clients/' + c.id); st.vehicles = r.vehicles; } catch (e) { st.vehicles = []; }
    st.vehicleId = st.vehicles.length === 1 ? st.vehicles[0].id : null;
    showVehicleForm(!st.vehicles.length);
    renderClient(); renderVehicles(); update();
  }
  function renderClient() {
    chosen.innerHTML = '';
    if (!st.client) { chosen.hidden = true; finder.hidden = false; return; }
    chosen.hidden = false; finder.hidden = true;
    chosen.appendChild(el('div', { class: 'pick', 'aria-pressed': 'true' }, [
      el('span', {}, [el('b', { text: st.client.name }), el('span', { text: [st.client.phone, st.client.email].filter(Boolean).join(' · ') })]),
    ]));
    chosen.appendChild(el('button', { class: 'link-btn', type: 'button', style: 'margin-top:8px', text: tr('Changer de client', 'Change customer'),
      onclick: function () { st.client = null; st.vehicles = []; st.vehicleId = null; renderClient(); renderVehicles(); qInput.value = ''; qInput.focus(); update(); } }));
  }
  $$('input', cform).forEach(function (i) { i.addEventListener('input', update); });

  // ------------------------------------------------------------ vehicle
  var vlist = $('[data-vehicle-list]'); var vform = $('[data-vehicle-form]');
  var year = $('[data-year]'); var now = new Date().getFullYear() + 1;
  year.appendChild(el('option', { value: '', text: '—' }));
  for (var y = now; y >= 1980; y--) year.appendChild(el('option', { value: String(y), text: String(y) }));
  function label(v) { return [v.year, v.make, v.model, v.trim].filter(Boolean).join(' '); }
  function renderVehicles() {
    vlist.innerHTML = '';
    st.vehicles.forEach(function (v) {
      vlist.appendChild(el('button', { class: 'pick', type: 'button', 'aria-pressed': st.vehicleId === v.id && !st.newVehicle ? 'true' : 'false',
        onclick: function () { st.vehicleId = v.id; showVehicleForm(false); renderVehicles(); update(); } },
      [el('span', {}, [el('b', { text: label(v) }), el('span', { text: [v.plate, v.odometer_km != null ? Number(v.odometer_km).toLocaleString(en ? 'en-CA' : 'fr-CA') + ' km' : ''].filter(Boolean).join(' · ') })])]));
    });
    if (!st.vehicles.length && !st.client && !st.newClient) vlist.appendChild(el('p', { class: 'muted', text: tr('Choisissez d’abord le client.', 'Pick the customer first.') }));
  }
  function showVehicleForm(on) { st.newVehicle = on; vform.hidden = !on; if (on) st.vehicleId = null; }
  $('[data-vehicle-new]').addEventListener('click', function () { showVehicleForm(true); renderVehicles(); $('[name=make]', vform).focus(); update(); });
  $$('input,select', vform).forEach(function (i) { i.addEventListener('input', update); });
  $('[data-vin-fill]').addEventListener('click', async function () {
    var vin = $('[name=vin]', vform).value.trim().toUpperCase(); var out = $('[data-vin-status]');
    if (vin.length !== 17) { out.textContent = tr('Le NIV a 17 caractères.', 'A VIN has 17 characters.'); return; }
    out.textContent = '…';
    try {
      var r = await App.request('api/vin/' + encodeURIComponent(vin));
      if (!r.ok) { out.textContent = tr('NIV introuvable — remplissez à la main.', 'VIN not found — fill in by hand.'); return; }
      if (r.year) year.value = String(r.year);
      $('[name=make]', vform).value = r.make || ''; $('[name=model]', vform).value = r.model || '';
      out.textContent = [r.year, r.make, r.model, r.trim].filter(Boolean).join(' ') + ' ✓'; update();
    } catch (e) { out.textContent = e.message; }
  });

  // -------------------------------------------------------------- work
  var concern = $('[name=concern]'); var minutesSel = $('[name=minutes]');
  function chosenServices() { return $$('[data-service-list] input:checked').map(function (i) { return i.value; }); }
  $$('[data-service-list] input').forEach(function (i) { i.addEventListener('change', function () { st.time = null; loadDays(); update(); }); });
  concern.addEventListener('input', update);
  minutesSel.addEventListener('change', function () { st.time = null; loadDays(); });

  // -------------------------------------------------------------- when
  var daysBox = $('[data-days]'); var slotsBox = $('[data-slots]'); var avail = null;
  var fmtDay = new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { weekday: 'short', timeZone: 'UTC' });
  var fmtMon = new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { month: 'short', timeZone: 'UTC' });
  function noon(d) { var p = d.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)); }
  async function loadDays() {
    var q = 'api/admin/availability?days=14&services=' + encodeURIComponent(chosenServices().join(',')) + (minutesSel.value ? '&minutes=' + minutesSel.value : '');
    try { avail = await App.request(q); } catch (e) { App.toast(e.message); return; }
    daysBox.innerHTML = '';
    avail.days.forEach(function (d) {
      var n = noon(d.date);
      var b = el('button', { class: 'day', type: 'button', 'aria-pressed': st.date === d.date ? 'true' : 'false', disabled: d.closed || !d.slots.length ? true : null,
        title: d.closed ? tr('Fermé', 'Closed') : (!d.slots.length ? tr('Complet', 'Full') : ''),
        onclick: function () { st.date = d.date; st.time = null; loadDays(); update(); } },
      [el('span', { text: fmtDay.format(n).replace('.', '') }), el('b', { text: String(n.getUTCDate()) }), el('span', { text: d.closed ? tr('fermé', 'closed') : (!d.slots.length ? tr('complet', 'full') : fmtMon.format(n).replace('.', '')) })]);
      daysBox.appendChild(b);
    });
    if (!st.date) { var first = avail.days.find(function (d) { return !d.closed && d.slots.length; }); if (first) st.date = first.date; }
    renderSlots();
  }
  function renderSlots() {
    slotsBox.innerHTML = '';
    var d = avail && avail.days.find(function (x) { return x.date === st.date; });
    $$('.day', daysBox).forEach(function (b, i) { b.setAttribute('aria-pressed', avail.days[i].date === st.date ? 'true' : 'false'); });
    if (!d) { slotsBox.appendChild(el('p', { class: 'muted', text: tr('Aucune plage libre dans les 14 prochains jours.', 'No free time in the next 14 days.') })); return; }
    var grid = el('div', { class: 'slots' });
    d.slots.forEach(function (s) {
      grid.appendChild(el('button', { class: 'slot', type: 'button', 'aria-pressed': st.time === s.time ? 'true' : 'false', title: s.free + ' ' + tr('baie(s) libre(s)', 'free bay(s)'), text: s.time.replace(':', en ? ':' : ' h '),
        onclick: function () { st.time = s.time; renderSlots(); update(); } }));
    });
    slotsBox.appendChild(grid);
    slotsBox.appendChild(el('p', { class: 'tiny muted', style: 'margin:8px 0 0', text: tr('Temps bloqué : ', 'Time blocked: ') + (avail.minutes >= 60 ? Math.round(avail.minutes / 6) / 10 + ' h' : avail.minutes + ' min') }));
  }

  // ----------------------------------------------------------- options
  $$('[data-stay] .chip').forEach(function (b) {
    b.addEventListener('click', function () { st.stay = b.getAttribute('data-value'); $$('[data-stay] .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); });
  });
  var towing = $('[name=towing]');
  towing.addEventListener('change', function () { $('[data-towing-address]').hidden = !towing.checked; });

  // ----------------------------------------------------------- summary
  var submit = $('[data-book-submit]'); var summary = $('[data-summary]'); var err = $('[data-book-error]');
  function newClientBody() { return { name: $('[name=name]', cform).value.trim(), phone: $('[name=phone]', cform).value.trim(), email: $('[name=email]', cform).value.trim() }; }
  function newVehicleBody() {
    return { year: year.value, make: $('[name=make]', vform).value.trim(), model: $('[name=model]', vform).value.trim(),
      plate: $('[name=plate]', vform).value.trim(), vin: $('[name=vin]', vform).value.trim(), odometer_km: $('[name=odometer_km]', vform).value.replace(/\D/g, '') };
  }
  function update() {
    var who = st.client ? st.client.name : (st.newClient ? newClientBody().name : '');
    var car = ''; if (st.vehicleId) { var v = st.vehicles.find(function (x) { return x.id === st.vehicleId; }); car = v ? label(v) : ''; }
    if (st.newVehicle) { var nv = newVehicleBody(); car = [nv.year, nv.make, nv.model].filter(Boolean).join(' '); }
    var work = chosenServices().length || concern.value.trim();
    var ready = who && car && (st.vehicleId || (st.newVehicle && newVehicleBody().make && newVehicleBody().model)) && work && st.date && st.time;
    var parts = [];
    if (st.date && st.time) parts.push(new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(noon(st.date)) + (en ? ' at ' : ' à ') + st.time.replace(':', en ? ':' : ' h '));
    if (who) parts.push(who); if (car) parts.push(car);
    summary.textContent = parts.length ? parts.join(' · ') : tr('Choisissez le client, le véhicule, les travaux et l’heure.', 'Pick the customer, vehicle, work and time.');
    submit.disabled = !ready;
    ['client', 'vehicle', 'work', 'when'].forEach(function (k, i) {
      var done = [!!who, !!car, !!work, !!(st.date && st.time)][i];
      $('[data-step="' + k + '"]').classList.toggle('done', done);
    });
  }
  submit.addEventListener('click', async function () {
    err.textContent = ''; submit.disabled = true;
    var body = {
      services: chosenServices(), concern: concern.value.trim(), date: st.date, time: st.time, stay: st.stay,
      minutes: minutesSel.value ? Number(minutesSel.value) : undefined,
      courtesyCar: !!($('[name=courtesy]') && $('[name=courtesy]').checked), towing: towing.checked, towingAddress: $('[name=towingAddress]').value,
      internalNote: $('[name=internalNote]').value, notify: !!($('[name=notify]') && $('[name=notify]').checked),
    };
    if (st.client) body.clientId = st.client.id; else body.newClient = newClientBody();
    if (st.vehicleId) body.vehicleId = st.vehicleId; else body.vehicle = newVehicleBody();
    try {
      await App.request('api/admin/appointments', { method: 'POST', body: JSON.stringify(body) });
      App.toast(tr('Rendez-vous réservé ✓', 'Appointment booked ✓'));
      setTimeout(function () { location.href = 'admin/rendez-vous?date=' + st.date; }, 500);
    } catch (e) {
      err.textContent = e.status === 409 ? tr('Cette heure vient d’être prise. Choisissez-en une autre.', 'That time was just taken. Pick another.') : e.message;
      if (e.status === 409) { st.time = null; loadDays(); }
      submit.disabled = false;
    }
  });

  if (st.client) { renderClient(); st.vehicleId = st.vehicles.length === 1 ? st.vehicles[0].id : null; if (!st.vehicles.length) showVehicleForm(true); }
  renderVehicles(); loadDays(); update();
})();
