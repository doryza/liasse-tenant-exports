(function () {
  if (!window.App) return;
  var t = App.t; var lang = App.data.lang; var cfg = App.data.board || {};
  var en = lang === 'en';
  var root = document.querySelector('[data-board]');
  var PX = 1.1; // pixels per minute
  var state = { from: cfg.date || null, days: Number(root && root.getAttribute('data-days')) || 7, data: null };
  var STATUSES = ['requested', 'confirmed', 'in_progress', 'ready', 'completed', 'no_show', 'cancelled'];
  function iso(d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
  function add(isoDate, n) { var p = isoDate.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10); }
  function noon(isoDate) { var p = isoDate.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)); }
  function mins(hhmm) { var p = hhmm.split(':').map(Number); return p[0] * 60 + p[1]; }
  function weekday(isoDate) { var w = noon(isoDate).getUTCDay(); return w === 0 ? 7 : w; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // ------------------------------------------------------------ drawer
  var drawer = el('aside', 'drawer'); drawer.setAttribute('aria-label', 'Rendez-vous');
  document.body.appendChild(drawer);
  function closeDrawer() { drawer.classList.remove('open'); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  function openDrawer(a) {
    drawer.innerHTML = '';
    var close = el('button', 'button ghost small', '×'); close.style.float = 'right'; close.addEventListener('click', closeDrawer);
    drawer.appendChild(close);
    drawer.appendChild(el('span', 'small muted', a.reference + (Number(a.preview) ? (en ? ' · preview (not real)' : ' · aperçu (non réel)') : '')));
    drawer.appendChild(el('h2', null, a.contact_name));
    var when = new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { timeZone: 'America/Toronto', dateStyle: 'full', timeStyle: 'short' }).format(new Date(a.start_at));
    var kv = el('dl', 'kv');
    [[t.when, when], [t.phone, a.contact_phone], [t.email, a.contact_email], [t.vehicle, a.vehicle_label], [t.work, a.service_names], [t.notes, a.concern],
      [t.drop_or_wait, a.stay === 'wait' ? t.wait_onsite : t.drop_off], [en ? 'Bay' : 'Baie', a.bay],
      [t.courtesy_request, Number(a.courtesy_car) ? '✓' : ''], [t.towing_request, Number(a.towing) ? (a.towing_address || '✓') : '']]
      .forEach(function (r) { if (!r[1]) return; kv.appendChild(el('dt', null, r[0])); var dd = el('dd'); if (r[0] === t.phone) { var l = el('a', null, r[1]); l.href = 'tel:' + String(r[1]).replace(/[^+\d]/g, ''); dd.appendChild(l); } else dd.textContent = r[1]; kv.appendChild(dd); });
    drawer.appendChild(kv);
    drawer.appendChild(el('strong', null, t.status));
    var row = el('div', 'status-row');
    STATUSES.forEach(function (s) {
      var b = el('button', 'button ghost small', t['status_' + s]); b.type = 'button'; b.setAttribute('aria-pressed', a.status === s ? 'true' : 'false');
      b.addEventListener('click', function () { save(a, { status: s }); });
      row.appendChild(b);
    });
    drawer.appendChild(row);
    var note = el('label', 'field'); note.appendChild(el('span', null, en ? 'Message to the customer (shown in their account)' : 'Message au client (visible dans son compte)'));
    var ta = el('textarea'); ta.value = a.garage_note || ''; ta.maxLength = 1000; note.appendChild(ta); drawer.appendChild(note);
    var inote = el('label', 'field'); inote.appendChild(el('span', null, en ? 'Internal note' : 'Note interne'));
    var ta2 = el('textarea'); ta2.value = a.internal_note || ''; ta2.maxLength = 4000; inote.appendChild(ta2); drawer.appendChild(inote);
    var sv = el('button', 'button primary', t.save); sv.type = 'button';
    sv.addEventListener('click', function () { save(a, { garage_note: ta.value, internal_note: ta2.value }); });
    drawer.appendChild(sv);
    if (!Number(a.preview)) drawer.appendChild(el('p', 'small muted', en ? 'Status changes to Confirmed, In the shop, Ready and Completed notify the customer when live sending is on.' : 'Les passages à Confirmé, En atelier, Prêt et Terminé avertissent le client quand les envois réels sont activés.'));
    drawer.classList.add('open');
  }

  async function save(a, body) {
    try {
      var r = await App.request('api/admin/appointments/' + a.id, { method: 'PUT', body: JSON.stringify(body) });
      App.toast(t.saved);
      if (state.data) { state.data.appointments = state.data.appointments.map(function (x) { return x.id === a.id ? r.appointment : x; }); render(); }
      openDrawer(r.appointment);
    } catch (e) { App.toast(e.message); }
  }

  // quick confirm on the dashboard list
  document.querySelectorAll('[data-quick-status]').forEach(function (b) {
    b.addEventListener('click', async function () {
      b.disabled = true;
      try { await App.request('api/admin/appointments/' + b.getAttribute('data-id'), { method: 'PUT', body: JSON.stringify({ status: b.getAttribute('data-quick-status') }) }); var li = b.closest('li'); if (li) li.remove(); App.toast(t.status_confirmed); load(); }
      catch (e) { b.disabled = false; App.toast(e.message); }
    });
  });

  // ------------------------------------------------------------ board
  async function load() {
    if (!root) return;
    var q = 'api/admin/board?days=' + state.days + (state.from ? '&from=' + state.from : '');
    try { state.data = await App.request(q); } catch (e) { root.textContent = e.message; return; }
    state.from = state.data.from;
    render();
  }

  function render() {
    var d = state.data; root.innerHTML = '';
    var byDay = {}; d.hours.forEach(function (h) { byDay[h.weekday] = h; });
    var closures = {}; d.closures.forEach(function (c) { closures[String(c.date).slice(0, 10)] = c; });
    var open = 8 * 60, close = 19 * 60;
    d.hours.forEach(function (h) { if (!h.closed && h.opens) { open = Math.min(open, mins(h.opens)); close = Math.max(close, mins(h.closes)); } });
    open = Math.floor(open / 60) * 60; close = Math.ceil(close / 60) * 60;
    var height = (close - open) * PX;
    var grid = el('div', 'board'); grid.style.setProperty('--cols', d.days);
    var timeCol = el('div', 'board-col board-col--time'); timeCol.appendChild(el('div', 'board-head', ''));
    var times = el('div', 'board-times'); times.style.height = height + 'px';
    for (var m = open; m <= close; m += 60) { var s = el('span', null, (en ? ((m / 60) % 12 || 12) + (m / 60 < 12 ? ' am' : ' pm') : (m / 60) + ' h')); s.style.top = ((m - open) * PX) + 'px'; times.appendChild(s); }
    timeCol.appendChild(times); grid.appendChild(timeCol);
    var fmtHead = new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { weekday: 'short', timeZone: 'UTC' });
    for (var i = 0; i < d.days; i++) {
      var day = add(d.from, i); var h = byDay[weekday(day)];
      var col = el('div', 'board-col' + ((!h || h.closed || closures[day]) ? ' closed' : '') + (day === d.today ? ' today' : ''));
      var head = el('div', 'board-head'); head.appendChild(el('span', null, fmtHead.format(noon(day)).replace('.', ''))); head.appendChild(el('b', null, noon(day).getUTCDate()));
      col.appendChild(head);
      var body = el('div', 'board-body'); body.style.height = height + 'px';
      for (var mm = open; mm < close; mm += 60) { var ln = el('div', 'board-line'); ln.style.top = ((mm - open) * PX) + 'px'; body.appendChild(ln); }
      d.appointments.filter(function (a) { return a.local.date === day; }).forEach(function (a) {
        var top = (mins(a.local.time) - open) * PX; var len = Math.max(26, Number(a.duration_min) * PX);
        var bay = Math.max(1, Number(a.bay) || 1); var w = 100 / d.bays;
        var b = el('button', 'appt st-' + a.status + (Number(a.preview) ? ' is-preview' : '')); b.type = 'button';
        b.style.top = top + 'px'; b.style.height = len + 'px'; b.style.left = 'calc(' + ((bay - 1) * w) + '% + 3px)'; b.style.width = 'calc(' + w + '% - 6px)';
        b.appendChild(el('b', null, a.local.time + ' · ' + a.contact_name));
        b.appendChild(el('small', null, a.vehicle_label));
        b.appendChild(el('small', null, a.service_names));
        b.addEventListener('click', function () { openDrawer(a); });
        body.appendChild(b);
      });
      if (day === d.today) {
        var now = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).format(new Date());
        var nm = mins(now); if (nm >= open && nm <= close) { var nl = el('div', 'now-line'); nl.style.top = ((nm - open) * PX) + 'px'; body.appendChild(nl); }
      }
      col.appendChild(body); grid.appendChild(col);
    }
    root.appendChild(grid);
    var range = document.querySelector('[data-range]');
    if (range) { var f = new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { day: 'numeric', month: 'long', timeZone: 'UTC' }); range.textContent = d.days === 1 ? f.format(noon(d.from)) : f.format(noon(d.from)) + ' – ' + f.format(noon(add(d.from, d.days - 1))); }
  }

  document.querySelectorAll('[data-nav]').forEach(function (b) {
    b.addEventListener('click', function () { var n = Number(b.getAttribute('data-nav')); state.from = n === 0 ? null : add(state.from || iso(new Date()), n * state.days); load(); });
  });
  document.querySelectorAll('[data-span]').forEach(function (b) {
    b.addEventListener('click', function () { state.days = Number(b.getAttribute('data-span')); load(); });
  });
  if (root) load();
})();
