/* Opening hours (autosave per day) and closures. */
(function () {
  if (!window.App || !window.Admin) return;
  var A = window.Admin; var tr = A.tr; var el = A.el; var $ = A.$; var $$ = A.$$; var en = A.en;
  $$('[data-hour]').forEach(function (row) {
    var wd = row.getAttribute('data-hour');
    var open = $('[data-open]', row), opens = $('[data-opens]', row), closes = $('[data-closes]', row), lbl = $('[data-closed-label]', row);
    async function save() {
      var closed = !open.checked;
      row.classList.toggle('is-closed', closed); lbl.hidden = !closed;
      if (!closed && closes.value <= opens.value) { App.toast(tr('La fermeture doit être après l’ouverture.', 'Closing must be after opening.')); return; }
      try { await App.request('api/admin/hours/' + wd, { method: 'PUT', body: JSON.stringify({ closed: closed, opens: opens.value, closes: closes.value }) }); A.tick(row.querySelector('.hour-times')); }
      catch (e) { App.toast(e.message); }
    }
    [open, opens, closes].forEach(function (i) { i.addEventListener('change', save); });
  });

  var closures = App.data.closures || [];
  var box = $('[data-closures]');
  var fmt = new Intl.DateTimeFormat(en ? 'en-CA' : 'fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  function render() {
    box.innerHTML = '';
    if (!closures.length) { box.appendChild(el('p', { class: 'muted', text: tr('Aucun congé prévu.', 'No days off planned.') })); return; }
    closures.forEach(function (c) {
      var p = String(c.date).split('-').map(Number);
      box.appendChild(el('div', { class: 'row' }, [
        el('div', {}, [el('div', { class: 'row-title', text: fmt.format(new Date(Date.UTC(p[0], p[1] - 1, p[2], 12))) }), el('div', { class: 'row-sub', text: c.reason || '' })]),
        el('button', { class: 'btn btn-sm btn-danger', type: 'button', text: tr('Retirer', 'Remove'), onclick: async function () {
          try { await App.request('api/admin/closures/' + c.id, { method: 'DELETE' }); closures = closures.filter(function (x) { return x.id !== c.id; }); render(); } catch (e) { App.toast(e.message); }
        } }),
      ]));
    });
  }
  $('[data-closure-add]').addEventListener('click', async function () {
    var date = $('[data-closure-date]').value; var reason = $('[data-closure-reason]').value;
    if (!date) { App.toast(tr('Choisissez une date.', 'Pick a date.')); return; }
    try {
      var r = await App.request('api/admin/closures', { method: 'POST', body: JSON.stringify({ date: date, reason: reason }) });
      closures = closures.filter(function (x) { return x.date !== r.closure.date; }).concat([r.closure]).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      $('[data-closure-date]').value = ''; $('[data-closure-reason]').value = ''; render();
    } catch (e) { App.toast(e.message); }
  });
  render();
})();
