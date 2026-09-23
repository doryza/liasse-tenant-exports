(function () {
  if (!window.App || !App.data.booking) return;
  var B = App.data.booking; var t = App.t; var lang = App.data.lang;
  var form = document.getElementById('booking');
  var KEY = 'el-booking-v1';
  var state = { step: 1, services: [], concern: '', vehicleId: null, vehicle: {}, date: null, time: null, weekStart: null, stay: 'drop', courtesyCar: false, towing: false, towingAddress: '', requestKey: null };
  try { var saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (saved && Date.now() - saved.at < 3600000) Object.assign(state, saved.state); } catch (e) {}
  if (!state.requestKey) state.requestKey = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random();
  if (B.preselect && !state.services.length) state.services = [B.preselect];
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), state: state })); } catch (e) {} }
  var $ = function (s, r) { return (r || form).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || form).querySelectorAll(s)); };
  var errorBox = $('[data-error]');
  function error(msg) { errorBox.textContent = msg || ''; errorBox.hidden = !msg; if (msg) errorBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  var account = null;

  // ------------------------------------------------------------ step 1
  var svcBox = $('[data-services]');
  function renderServices() {
    svcBox.innerHTML = '';
    B.services.concat([{ slug: '__diag', name: t.not_sure, duration: 60, price: '' }]).forEach(function (s) {
      var label = document.createElement('label'); label.className = 'choice';
      var input = document.createElement('input'); input.type = 'checkbox'; input.value = s.slug;
      input.checked = s.slug === '__diag' ? (!state.services.length && !!state.concern) : state.services.indexOf(s.slug) > -1;
      var box = document.createElement('span'); box.className = 'box';
      var text = document.createElement('span');
      var b = document.createElement('b'); b.textContent = s.name;
      var small = document.createElement('small'); small.textContent = s.slug === '__diag' ? t.concern : [s.duration ? App.fmt(t.duration_about, { n: human(s.duration) }) : '', s.price].filter(Boolean).join(' · ');
      text.appendChild(b); text.appendChild(small);
      label.appendChild(input); label.appendChild(box); label.appendChild(text);
      input.addEventListener('change', function () {
        if (s.slug === '__diag') { if (input.checked) $('[name=concern]').focus(); return; }
        state.services = $$('[data-services] input:checked').map(function (x) { return x.value; }).filter(function (x) { return x !== '__diag'; });
        state.date = null; state.time = null; save();
      });
      svcBox.appendChild(label);
    });
    $('[name=concern]').value = state.concern || '';
  }
  $('[name=concern]').addEventListener('input', function (e) { state.concern = e.target.value; save(); });
  function human(min) { var h = Math.floor(min / 60), m = min % 60; return h ? h + ' h' + (m ? ' ' + String(m).padStart(2, '0') : '') : m + ' min'; }

  // ------------------------------------------------------------ step 2
  var yearSel = $('[data-year]');
  var thisYear = new Date().getFullYear() + 1;
  yearSel.innerHTML = '<option value=""></option>';
  for (var y = thisYear; y >= 1980; y--) { var o = document.createElement('option'); o.value = y; o.textContent = y; yearSel.appendChild(o); }
  var makesList = document.getElementById('makes');
  B.makes.forEach(function (m) { var o = document.createElement('option'); o.value = m; makesList.appendChild(o); });
  var vehicleFields = ['vin', 'year', 'make', 'model', 'trim', 'odometer_km', 'plate'];
  function fillVehicleInputs() { vehicleFields.forEach(function (f) { var el = $('[name=' + f + ']'); if (el && state.vehicle[f] != null) el.value = state.vehicle[f]; }); }
  vehicleFields.forEach(function (f) {
    var el = $('[name=' + f + ']');
    el.addEventListener('input', function () { state.vehicle[f] = el.value; save(); if (f === 'make' || f === 'year') loadModels(); });
    el.addEventListener('change', function () { state.vehicle[f] = el.value; save(); if (f === 'make' || f === 'year') loadModels(); });
  });
  var modelsTimer;
  function loadModels() {
    clearTimeout(modelsTimer);
    modelsTimer = setTimeout(async function () {
      var make = $('[name=make]').value.trim(); var year = $('[name=year]').value;
      if (!make || !year) return;
      try {
        var r = await App.request('api/models?make=' + encodeURIComponent(make) + '&year=' + year);
        var dl = document.getElementById('models'); dl.innerHTML = '';
        r.models.forEach(function (m) { var o = document.createElement('option'); o.value = m; dl.appendChild(o); });
      } catch (e) {}
    }, 350);
  }
  $('[data-vin-decode]').addEventListener('click', async function () {
    var vin = $('[name=vin]').value.trim().toUpperCase(); var status = $('[data-vin-status]');
    if (vin.length !== 17) { status.textContent = t.vin_not_found; return; }
    status.textContent = '…';
    try {
      applyVin(await App.request('api/vin/' + encodeURIComponent(vin)));
    } catch (e) { status.textContent = e.message; }
  });
  function applyVin(r) {
    var status = $('[data-vin-status]');
    if (!r.ok) {
      if (r.vin) { state.vehicle.vin = r.vin; fillVehicleInputs(); save(); }
      status.textContent = r.reason === 'no_vin' ? t.vin_photo_none : r.reason === 'partial' ? t.vin_partial : r.vin ? App.vinStatus(r) + ' — ' + t.vin_not_found : t.vin_not_found;
      return;
    }
    state.vehicle = Object.assign(state.vehicle, { vin: r.vin, year: r.year, make: r.make, model: r.model, trim: r.trim });
    fillVehicleInputs(); save(); loadModels();
    status.textContent = App.vinStatus(r);
  }
  var vinPhoto = $('[data-vin-photo]');
  if (vinPhoto) vinPhoto.addEventListener('change', async function () {
    var file = vinPhoto.files && vinPhoto.files[0]; vinPhoto.value = '';
    if (!file) return;
    var status = $('[data-vin-status]'); status.textContent = t.vin_photo_reading;
    try { applyVin(await App.readVinPhoto(file)); } catch (e) { status.textContent = e.message; }
  });
  function renderSavedVehicles() {
    var box = $('[data-saved-vehicles]'); var vs = (account && account.vehicles) || [];
    if (!vs.length) { box.hidden = true; $('[data-new-vehicle]').hidden = false; return; }
    box.hidden = false; box.innerHTML = '';
    vs.concat([{ id: 'new' }]).forEach(function (v) {
      var label = document.createElement('label'); label.className = 'choice';
      var input = document.createElement('input'); input.type = 'radio'; input.name = 'vehiclePick'; input.value = v.id;
      input.checked = v.id === 'new' ? !state.vehicleId : String(state.vehicleId) === String(v.id);
      var box2 = document.createElement('span'); box2.className = 'box';
      var text = document.createElement('span'); var b = document.createElement('b');
      b.textContent = v.id === 'new' ? t.new_vehicle : [v.year, v.make, v.model].filter(Boolean).join(' ');
      text.appendChild(b);
      if (v.id !== 'new' && (v.plate || v.odometer_km)) { var sm = document.createElement('small'); sm.textContent = [v.plate, v.odometer_km ? Number(v.odometer_km).toLocaleString() + ' km' : ''].filter(Boolean).join(' · '); text.appendChild(sm); }
      label.appendChild(input); label.appendChild(box2); label.appendChild(text);
      input.addEventListener('change', function () { state.vehicleId = v.id === 'new' ? null : v.id; $('[data-new-vehicle]').hidden = !!state.vehicleId; save(); });
      box.appendChild(label);
    });
    $('[data-new-vehicle]').hidden = !!state.vehicleId;
  }

  // ------------------------------------------------------------ step 3
  var avail = null; var minutes = 60;
  function isoToday() { var d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
  function addDays(iso, n) { var p = iso.split('-').map(Number); var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)); return d.toISOString().slice(0, 10); }
  function dayLabel(iso) { var p = iso.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)); }
  async function loadWeek() {
    if (!state.weekStart) state.weekStart = isoToday();
    var daysBox = $('[data-days]'); daysBox.innerHTML = '<p class="muted">' + t.slots_loading + '</p>';
    var q = 'api/availability?services=' + encodeURIComponent(state.services.join(',')) + '&from=' + state.weekStart + '&days=7';
    try { avail = await App.request(q); } catch (e) { daysBox.innerHTML = ''; error(e.message); return; }
    minutes = avail.minutes;
    $('[data-duration]').textContent = App.fmt(t.estimated_time, { d: human(minutes) });
    var first = dayLabel(avail.days[0] ? avail.days[0].date : state.weekStart);
    var last = dayLabel(avail.days.length ? avail.days[avail.days.length - 1].date : state.weekStart);
    var fmtD = new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    $('[data-week-label]').textContent = fmtD.format(first) + ' – ' + fmtD.format(last);
    $('[data-week="-1"]').disabled = state.weekStart <= isoToday();
    renderDays();
  }
  function renderDays() {
    var daysBox = $('[data-days]'); daysBox.innerHTML = '';
    var wd = new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { weekday: 'short', timeZone: 'UTC' });
    avail.days.slice(0, 7).forEach(function (d) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'day';
      var free = !d.closed && d.slots.length;
      b.disabled = !free;
      b.setAttribute('aria-pressed', state.date === d.date ? 'true' : 'false');
      var dt = dayLabel(d.date);
      b.innerHTML = '<small></small><b></b><em></em>';
      b.children[0].textContent = wd.format(dt).replace('.', '');
      b.children[1].textContent = dt.getUTCDate();
      b.children[2].textContent = d.closed ? t.closed_day : (d.slots.length ? d.slots.length + (lang === 'en' ? ' times' : ' plages') : t.full_day);
      b.addEventListener('click', function () { state.date = d.date; state.time = null; save(); renderDays(); });
      daysBox.appendChild(b);
    });
    renderTimes();
  }
  function renderTimes() {
    var box = $('[data-times]'); box.innerHTML = '';
    var day = avail && avail.days.find(function (d) { return d.date === state.date; });
    $('[data-times-title]').hidden = !day;
    $('[data-extras]').hidden = !(day && state.time);
    if (!day) return;
    if (!day.slots.length) { box.innerHTML = '<p class="muted">' + t.no_slots + '</p>'; return; }
    day.slots.forEach(function (s) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'time'; b.textContent = lang === 'en' ? to12(s.time) : s.time.replace(/^0/, '').replace(':', ' h ').replace(' h 00', ' h');
      b.setAttribute('aria-pressed', state.time === s.time ? 'true' : 'false');
      b.addEventListener('click', function () { state.time = s.time; save(); renderTimes(); });
      box.appendChild(b);
    });
    var courtesy = $('[data-courtesy]'); var cInput = $('[name=courtesyCar]');
    var none = B.courtesyCars < 1 || day.courtesyLeft < 1;
    courtesy.classList.toggle('disabled', none); cInput.disabled = none; if (none) { cInput.checked = false; state.courtesyCar = false; }
    $('[data-courtesy-note]').textContent = B.courtesyCars < 1 ? '' : (none ? t.courtesy_none : '');
  }
  function to12(hhmm) { var p = hhmm.split(':').map(Number); return (p[0] % 12 || 12) + ':' + String(p[1]).padStart(2, '0') + (p[0] < 12 ? ' a.m.' : ' p.m.'); }
  $$('[data-week]').forEach(function (b) { b.addEventListener('click', function () { state.weekStart = addDays(state.weekStart || isoToday(), 7 * Number(b.getAttribute('data-week'))); if (state.weekStart < isoToday()) state.weekStart = isoToday(); save(); loadWeek(); }); });
  $$('[name=stay]').forEach(function (r) { r.checked = r.value === state.stay; r.addEventListener('change', function () { state.stay = r.value; save(); }); });
  $('[name=courtesyCar]').checked = !!state.courtesyCar;
  $('[name=courtesyCar]').addEventListener('change', function (e) { state.courtesyCar = e.target.checked; save(); });
  $('[data-towing]').checked = !!state.towing;
  $('[data-towing-address]').hidden = !state.towing;
  $('[data-towing]').addEventListener('change', function (e) { state.towing = e.target.checked; $('[data-towing-address]').hidden = !state.towing; save(); });
  $('[name=towingAddress]').value = state.towingAddress || '';
  $('[name=towingAddress]').addEventListener('input', function (e) { state.towingAddress = e.target.value; save(); });

  // ------------------------------------------------------------ step 4
  async function loadAccount() {
    if (!B.signedIn && !(window.TenantSDK && TenantSDK.auth.isLoggedIn())) return null;
    try { account = await App.request('api/me'); } catch (e) { account = null; }
    return account;
  }
  function renderDetails() {
    var signedIn = !!account;
    $('[data-signin]').hidden = signedIn; $('[data-details]').hidden = !signedIn;
    $('[data-submit]').hidden = !signedIn; $('[data-next]').hidden = true;
    if (!signedIn) return;
    $('[data-signed-as]').textContent = (lang === 'en' ? 'Signed in as ' : 'Connecté : ') + (account.email || account.phone || '');
    var p = account.profile || {};
    if (!$('[name=first_name]').value) $('[name=first_name]').value = p.first_name || '';
    if (!$('[name=last_name]').value) $('[name=last_name]').value = p.last_name || '';
    if (!$('[name=phone]').value) $('[name=phone]').value = p.phone || account.phone || '';
    var dl = $('[data-summary]'); dl.innerHTML = '';
    var chosen = B.services.filter(function (s) { return state.services.indexOf(s.slug) > -1; }).map(function (s) { return s.name; });
    var v = state.vehicleId ? (account.vehicles || []).find(function (x) { return String(x.id) === String(state.vehicleId); }) : state.vehicle;
    var when = state.date ? new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(dayLabel(state.date)) + ' — ' + (lang === 'en' ? to12(state.time) : state.time.replace(/^0/, '').replace(':', ' h ').replace(' h 00', ' h')) : '';
    [[t.work, chosen.length ? chosen.join(', ') : t.not_sure], [t.notes, state.concern], [t.vehicle, v ? [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ') : ''], [t.when, when],
      [t.drop_or_wait, state.stay === 'wait' ? t.wait_onsite : t.drop_off], [t.courtesy_request, state.courtesyCar ? '✓' : ''], [t.towing_request, state.towing ? state.towingAddress : '']]
      .filter(function (r) { return r[1]; }).forEach(function (r) {
        var dt = document.createElement('dt'); dt.textContent = r[0]; var dd = document.createElement('dd'); dd.textContent = r[1]; dl.appendChild(dt); dl.appendChild(dd);
      });
  }

  // ------------------------------------------------------------ flow
  function validate(step) {
    if (step === 1 && !state.services.length && !String(state.concern || '').trim()) return t.pick_services_help;
    if (step === 2 && !state.vehicleId) {
      var v = state.vehicle;
      if (!v.make || !v.model || !v.year) return t.invalid + ' (' + [t.year, t.make, t.model].join(', ') + ')';
      if (v.vin && String(v.vin).trim().length !== 17) return t.vin_not_found;
    }
    if (step === 3) {
      if (!state.date || !state.time) return t.pick_time;
      if (state.towing && !String(state.towingAddress || '').trim()) return t.towing_address;
    }
    return null;
  }
  async function go(step) {
    error(null);
    state.step = step; save();
    $$('[data-step]').forEach(function (s) { s.hidden = Number(s.getAttribute('data-step')) !== step; });
    $$('[data-step-tab]').forEach(function (li) { var n = Number(li.getAttribute('data-step-tab')); li.className = n < step ? 'done' : (n === step ? 'on' : ''); });
    $('[data-prev]').hidden = step === 1;
    $('[data-next]').hidden = step >= 4; $('[data-submit]').hidden = true;
    if (step === 2) { await loadAccount(); renderSavedVehicles(); fillVehicleInputs(); }
    if (step === 3) loadWeek();
    if (step === 4) { await loadAccount(); renderDetails(); }
    var top = form.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
  }
  $('[data-next]').addEventListener('click', function () { var msg = validate(state.step); if (msg) return error(msg); go(state.step + 1); });
  $('[data-prev]').addEventListener('click', function () { go(Math.max(1, state.step - 1)); });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    for (var s = 1; s <= 3; s++) { var msg = validate(s); if (msg) { go(s).then(function () { error(msg); }); return; } }
    if (!$('[name=consent]').checked) return error(t.consent_booking);
    var first = $('[name=first_name]').value.trim(); var phone = $('[name=phone]').value.trim();
    if (!first || phone.replace(/\D/g, '').length < 7) return error(t.invalid + ' (' + t.first_name + ', ' + t.contact_phone + ')');
    var btn = $('[data-submit]'); btn.disabled = true; btn.textContent = t.booking_sending;
    try {
      var vehicle = state.vehicleId ? { odometer_km: state.vehicle.odometer_km || '' } : state.vehicle;
      var r = await App.request('api/appointments', { method: 'POST', body: JSON.stringify({
        services: state.services, concern: state.concern, vehicleId: state.vehicleId, vehicle: vehicle,
        date: state.date, time: state.time, stay: state.stay, courtesyCar: state.courtesyCar, towing: state.towing, towingAddress: state.towingAddress,
        contact: { first_name: first, last_name: $('[name=last_name]').value.trim(), phone: phone },
        consent: true, requestKey: state.requestKey, language: lang,
      }) });
      try { sessionStorage.removeItem(KEY); } catch (e2) {}
      location.href = r.url;
    } catch (err) {
      btn.disabled = false; btn.textContent = t.confirm_booking;
      if (err.code === 'slot_taken') { state.time = null; save(); await go(3); }
      error(err.message);
    }
  });

  renderServices();
  go(state.step >= 1 && state.step <= 4 ? state.step : 1);
})();
