(function () {
  if (!window.App) return;
  var t = App.t; var lang = App.data.lang;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  // ---------------------------------------------------------------- vehicles
  var acct = App.data.account;
  var list = $('[data-vehicles]');
  function renderVehicles() {
    if (!list || !acct) return;
    list.innerHTML = '';
    if (!acct.vehicles.length) { list.innerHTML = '<p class="muted small" style="margin:0">—</p>'; return; }
    acct.vehicles.forEach(function (v) {
      var row = document.createElement('div'); row.className = 'veh';
      var info = document.createElement('div');
      var b = document.createElement('b'); b.textContent = [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ');
      var sm = document.createElement('small');
      var bits = [];
      if (v.plate) bits.push(v.plate);
      if (v.odometer_km != null) bits.push(Number(v.odometer_km).toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA') + ' km');
      if (v.last_oil_km != null) bits.push(t.next_oil + ' : ' + Number(v.last_oil_km + 8000).toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA') + ' km');
      sm.textContent = bits.join(' · ');
      info.appendChild(b); info.appendChild(sm);
      var rm = document.createElement('button'); rm.type = 'button'; rm.className = 'text-link'; rm.textContent = t.remove_vehicle; rm.style.color = 'var(--bad)';
      rm.addEventListener('click', async function () {
        if (!confirm(t.remove_vehicle + ' — ' + b.textContent + ' ?')) return;
        try { await App.request('api/me/vehicles/' + v.id, { method: 'DELETE' }); acct.vehicles = acct.vehicles.filter(function (x) { return x.id !== v.id; }); renderVehicles(); } catch (e) { App.toast(e.message); }
      });
      row.appendChild(info); row.appendChild(rm); list.appendChild(row);
    });
  }
  renderVehicles();
  var vForm = $('[data-vehicle-form]');
  if (vForm) {
    var vStatus = $('[data-vin-status]', vForm);
    var applyVin = function (r) {
      if (r.vin) vForm.vin.value = r.vin;
      if (!r.ok) { vStatus.textContent = r.reason === 'no_vin' ? t.vin_photo_none : r.reason === 'partial' ? t.vin_partial : t.vin_not_found; return; }
      if (r.year) vForm.year.value = r.year;
      if (r.make) vForm.make.value = r.make;
      if (r.model) vForm.model.value = r.model;
      vForm.trim.value = r.trim || '';
      vStatus.textContent = App.vinStatus(r);
    };
    $('[data-vin-decode]', vForm).addEventListener('click', async function () {
      var vin = vForm.vin.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (vin.length !== 17) { vStatus.textContent = t.vin_not_found; return; }
      vStatus.textContent = '…';
      try { applyVin(await App.request('api/vin/' + encodeURIComponent(vin))); } catch (e) { vStatus.textContent = e.message; }
    });
    var vPhoto = $('[data-vin-photo]', vForm);
    if (vPhoto) vPhoto.addEventListener('change', async function () {
      var file = vPhoto.files && vPhoto.files[0]; vPhoto.value = '';
      if (!file) return;
      vStatus.textContent = t.vin_photo_reading;
      try { applyVin(await App.readVinPhoto(file)); } catch (e) { vStatus.textContent = e.message; }
    });
  }
  if (vForm) vForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var body = { year: vForm.year.value.trim(), make: vForm.make.value.trim(), model: vForm.model.value.trim(), odometer_km: vForm.odometer_km.value.replace(/\D/g, ''), vin: vForm.vin.value.trim(), trim: vForm.trim.value };
    try {
      var r = await App.request('api/me/vehicles', { method: 'POST', body: JSON.stringify(body) });
      acct.vehicles.push(r.vehicle); renderVehicles(); vForm.reset(); vStatus.textContent = ''; $('[data-add-vehicle]').open = false; App.toast(t.saved);
    } catch (err) { App.toast(err.message); }
  });

  var pForm = $('[data-profile-form]');
  if (pForm) pForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    try {
      await App.request('api/me/profile', { method: 'PUT', body: JSON.stringify({ first_name: pForm.first_name.value, last_name: pForm.last_name.value, phone: pForm.phone.value, language: lang }) });
      App.toast(t.saved);
    } catch (err) { App.toast(err.message); }
  });

  // ---------------------------------------------------------------- one appointment
  var appt = App.data.appointment;
  if (!appt) return;

  var ics = $('[data-ics]');
  if (ics) ics.addEventListener('click', async function () {
    try {
      var res = await App.request('api/appointments/' + appt.reference + '/calendar.ics', { raw: true });
      if (!res.ok) throw new Error(t.server_error);
      var blob = await res.blob();
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = appt.reference + '.ics'; document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { App.toast(e.message); }
  });

  var cancel = $('[data-cancel]');
  if (cancel) cancel.addEventListener('click', async function () {
    if (!confirm(t.cancel_confirm)) return;
    try { await App.request('api/appointments/' + appt.reference + '/cancel', { method: 'POST', body: '{}' }); App.toast(t.cancelled_ok); setTimeout(function () { location.reload(); }, 700); } catch (e) { App.toast(e.message); }
  });

  var box = $('[data-reschedule]');
  var open = $('[data-reschedule-open]');
  if (!box || !open) return;
  var weekStart = null; var picked = null; var avail = null;
  function isoToday() { var d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
  function addDays(iso, n) { var p = iso.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10); }
  function noon(iso) { var p = iso.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)); }
  function err(m) { var e = box.querySelector('[data-error]'); e.textContent = m || ''; e.hidden = !m; }
  async function load() {
    weekStart = weekStart || isoToday();
    try { avail = await App.request('api/availability?services=' + encodeURIComponent(appt.services.join(',')) + '&from=' + weekStart + '&days=7&exclude=' + appt.reference); } catch (e) { return err(e.message); }
    var f = new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    box.querySelector('[data-week-label]').textContent = f.format(noon(avail.days[0].date)) + ' – ' + f.format(noon(avail.days[avail.days.length - 1].date));
    render();
  }
  function render() {
    var days = box.querySelector('[data-days]'); days.innerHTML = '';
    var wd = new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { weekday: 'short', timeZone: 'UTC' });
    avail.days.slice(0, 7).forEach(function (d) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'day'; b.disabled = d.closed || !d.slots.length;
      b.setAttribute('aria-pressed', picked === d.date ? 'true' : 'false');
      b.innerHTML = '<small></small><b></b><em></em>';
      b.children[0].textContent = wd.format(noon(d.date)).replace('.', ''); b.children[1].textContent = noon(d.date).getUTCDate();
      b.children[2].textContent = d.closed ? t.closed_day : (d.slots.length ? d.slots.length + '' : t.full_day);
      b.addEventListener('click', function () { picked = d.date; render(); });
      days.appendChild(b);
    });
    var times = box.querySelector('[data-times]'); times.innerHTML = '';
    var day = avail.days.find(function (d) { return d.date === picked; });
    if (!day) return;
    day.slots.forEach(function (s) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'time'; b.textContent = lang === 'en' ? s.time : s.time.replace(/^0/, '').replace(':', ' h ').replace(' h 00', ' h');
      b.addEventListener('click', async function () {
        err(null);
        try { await App.request('api/appointments/' + appt.reference + '/reschedule', { method: 'POST', body: JSON.stringify({ date: day.date, time: s.time }) }); App.toast(t.rescheduled_ok); setTimeout(function () { location.reload(); }, 700); }
        catch (e) { err(e.message); load(); }
      });
      times.appendChild(b);
    });
  }
  open.addEventListener('click', function () { box.hidden = !box.hidden; if (!box.hidden) load(); });
  box.querySelectorAll('[data-week]').forEach(function (b) { b.addEventListener('click', function () { weekStart = addDays(weekStart || isoToday(), 7 * Number(b.getAttribute('data-week'))); if (weekStart < isoToday()) weekStart = isoToday(); load(); }); });
})();
