/* Services & prices: inline editing that saves itself; details in a side panel. */
(function () {
  if (!window.App || !window.Admin) return;
  var A = window.Admin; var tr = A.tr; var el = A.el; var $ = A.$;
  var rows = App.data.services || [];
  var box = $('[data-svc-rows]');
  var DURATIONS = [0, 15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 480, 600];
  function dur(m) { return m === 0 ? tr('Option (0 min)', 'Option (0 min)') : m < 60 ? m + ' min' : (m / 60).toString().replace('.', A.en ? '.' : ',') + ' h'; }
  function list(raw) { try { var x = JSON.parse(raw || '[]'); return Array.isArray(x) ? x : []; } catch (e) { return []; } }

  async function patch(s, body, rowEl) {
    try {
      var r = await App.request('api/admin/services/' + s.id, { method: 'PUT', body: JSON.stringify(body) });
      Object.assign(s, r.service); A.tick(rowEl.querySelector('.svc-name')); return true;
    } catch (e) { App.toast(e.code === 'invalid' ? tr('Valeur invalide — un prix s’écrit ex. 89,95', 'Invalid value — a price looks like 89.95') : e.message); return false; }
  }
  function mini(label, checked, onchange) {
    var inp = el('input', { type: 'checkbox' }); inp.checked = !!checked;
    inp.addEventListener('change', function () { onchange(inp); });
    var sw = el('span', { class: 'switch' }, [inp, el('span')]);
    return el('label', { class: 'mini-switch', title: label }, [sw, el('span', { class: 'sr-only', text: label })]);
  }
  function render() {
    box.innerHTML = '';
    rows.forEach(function (s, i) {
      var row = el('div', { class: 'svc' + (Number(s.published) ? '' : ' is-hidden') });
      row.appendChild(el('div', { class: 'move' }, [
        el('button', { type: 'button', 'aria-label': tr('Monter', 'Move up'), text: '▲', disabled: i === 0 ? true : null, onclick: function () { move(i, -1); } }),
        el('button', { type: 'button', 'aria-label': tr('Descendre', 'Move down'), text: '▼', disabled: i === rows.length - 1 ? true : null, onclick: function () { move(i, 1); } }),
      ]));
      var nameCell = el('div', { class: 'svc-name' }, [el('b', { text: s.name }), el('small', { text: Number(s.published) ? (s.tagline || '') : tr('Caché du site', 'Hidden from the site') })]);
      if (Number(s.confirmed) === 0) {
        nameCell.appendChild(el('span', { class: 'pill pill-sent', style: 'margin-top:6px', text: tr('À confirmer sur le site', 'To be confirmed on the site') }));
        nameCell.appendChild(el('button', { class: 'link-btn', type: 'button', style: 'margin-left:10px', text: tr('Je l’offre — confirmer', 'I offer it — confirm'), onclick: async function () { if (await patch(s, { confirmed: true }, row)) render(); } }));
      }
      row.appendChild(nameCell);
      var sel = el('select', { class: 'input svc-field', 'aria-label': tr('Temps à l’atelier', 'Shop time') });
      var opts = DURATIONS.indexOf(Number(s.duration_min)) > -1 ? DURATIONS : DURATIONS.concat([Number(s.duration_min)]).sort(function (a, b) { return a - b; });
      opts.forEach(function (m) { var o = el('option', { value: String(m), text: dur(m) }); if (m === Number(s.duration_min)) o.selected = true; sel.appendChild(o); });
      sel.addEventListener('change', function () { patch(s, { duration_min: Number(sel.value) }, row); });
      row.appendChild(sel);
      var price = el('input', { class: 'input', inputmode: 'decimal', placeholder: tr('Sur estimation', 'On estimate'), value: Number(s.price_verified) && s.price_from_cents ? A.dollars(s.price_from_cents) : '', 'aria-label': tr('Prix', 'Price') });
      var last = price.value;
      price.addEventListener('change', async function () {
        if (!(await patch(s, { price: price.value.trim() }, row))) price.value = last;
        else { last = price.value = Number(s.price_verified) && s.price_from_cents ? A.dollars(s.price_from_cents) : ''; }
      });
      row.appendChild(el('span', { class: 'input-money svc-field' }, [price]));
      row.appendChild(mini(tr('Réservable en ligne', 'Bookable online'), Number(s.bookable), function (inp) { patch(s, { bookable: inp.checked }, row); }));
      row.appendChild(mini(tr('Visible sur le site', 'Visible on the site'), Number(s.published), async function (inp) { if (await patch(s, { published: inp.checked }, row)) render(); }));
      row.appendChild(el('button', { class: 'icon-btn', type: 'button', 'aria-label': tr('Modifier la description', 'Edit description'), title: tr('Description, photo, anglais', 'Description, photo, English'),
        html: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>', onclick: function () { edit(s); } }));
      box.appendChild(row);
    });
  }
  async function move(i, dir) {
    var j = i + dir; if (j < 0 || j >= rows.length) return;
    var t = rows[i]; rows[i] = rows[j]; rows[j] = t; render();
    try { await App.request('api/admin/services/order', { method: 'POST', body: JSON.stringify({ ids: rows.map(function (s) { return s.id; }) }) }); } catch (e) { App.toast(e.message); }
  }

  // --------------------------------------------------------------- details
  var d = A.drawer(tr('Service', 'Service'));
  function edit(s) {
    var isNew = !s; s = s || { name: '', tagline: '', body: '', signs: '[]', name_en: '', tagline_en: '', body_en: '', signs_en: '[]', image_url: '' };
    d.title(isNew ? tr('Nouveau service', 'New service') : s.name);
    d.body.innerHTML = ''; d.foot.innerHTML = '';
    var f = {
      name: el('input', { value: s.name || '', maxlength: '200' }), tagline: el('input', { value: s.tagline || '', maxlength: '400' }),
      body: el('textarea', { rows: '6', maxlength: '8000' }), signs: el('textarea', { rows: '4', maxlength: '2000' }),
      name_en: el('input', { value: s.name_en || '', maxlength: '200' }), tagline_en: el('input', { value: s.tagline_en || '', maxlength: '400' }),
      body_en: el('textarea', { rows: '5', maxlength: '8000' }), signs_en: el('textarea', { rows: '3', maxlength: '2000' }),
      image_url: el('input', { value: s.image_url || '', maxlength: '600', type: 'url' }),
    };
    f.body.value = s.body || ''; f.signs.value = list(s.signs).join('\n'); f.body_en.value = s.body_en || ''; f.signs_en.value = list(s.signs_en).join('\n');
    d.body.appendChild(A.field(tr('Nom', 'Name') + ' *', f.name));
    d.body.appendChild(A.field(tr('Phrase d’accroche', 'One-line summary'), f.tagline, tr('Paraît sous le nom, sur le site.', 'Shows under the name on the site.')));
    d.body.appendChild(A.field(tr('Description', 'Description'), f.body, tr('Une ligne vide sépare les paragraphes.', 'An empty line separates paragraphs.')));
    d.body.appendChild(A.field(tr('Quand venir nous voir', 'When to come in'), f.signs, tr('Un signe par ligne (ex. « Grincement au freinage »).', 'One sign per line (e.g. "Squealing when braking").')));
    var classBoxes = [];
    if (App.data.vehicleClasses) {
      var have = String(s.vehicle_classes || '').split(',').map(function (x) { return x.trim(); });
      var grid = el('div', { class: 'check-grid' });
      ['voiture', 'vus', 'pickup', 'gros'].forEach(function (k) {
        var cb = el('input', { type: 'checkbox', value: k }); cb.checked = have.indexOf(k) > -1; classBoxes.push(cb);
        grid.appendChild(el('label', { class: 'check-card' }, [cb, el('span', { text: App.t['class_' + k] || k })]));
      });
      d.body.appendChild(el('div', { class: 'field' }, [el('span', { class: 'field-label', text: tr('Pour quels véhicules ?', 'For which vehicles?') }), grid, el('span', { class: 'hint', text: tr('Aucun coché = tous les véhicules.', 'None checked = every vehicle.') })]));
    }
    var det = el('details', { style: 'margin:6px 0 14px' }, [el('summary', { style: 'cursor:pointer;font-weight:600;padding:8px 0', text: tr('Version anglaise (facultatif)', 'English version (optional)') })]);
    det.appendChild(A.field(tr('Nom (anglais)', 'Name (English)'), f.name_en));
    det.appendChild(A.field(tr('Accroche (anglais)', 'Summary (English)'), f.tagline_en));
    det.appendChild(A.field(tr('Description (anglais)', 'Description (English)'), f.body_en));
    det.appendChild(A.field(tr('Quand venir (anglais)', 'When to come in (English)'), f.signs_en));
    d.body.appendChild(det);
    var conf = el('input', { type: 'checkbox' }); conf.checked = isNew || Number(s.confirmed) !== 0;
    d.body.appendChild(el('label', { class: 'check-card', style: 'margin-bottom:14px' }, [conf, el('span', { text: tr('J’offre ce service (sinon le site affiche « À confirmer »)', 'I offer this service (otherwise the site shows "To be confirmed")') })]));
    d.body.appendChild(A.field(tr('Adresse de l’image', 'Image address'), f.image_url, tr('Les photos du site se changent aussi directement sur le site.', 'Site photos can also be changed right on the site.')));
    d.foot.appendChild(el('button', { class: 'btn btn-primary', type: 'button', text: isNew ? tr('Créer le service', 'Create service') : tr('Enregistrer', 'Save'), onclick: async function () {
      var body = {}; Object.keys(f).forEach(function (k) { body[k] = f[k].value; });
      body.confirmed = conf.checked;
      if (App.data.vehicleClasses) body.vehicle_classes = classBoxes.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
      try {
        if (isNew) { body.published = true; var r = await App.request('api/admin/services', { method: 'POST', body: JSON.stringify(body) }); rows.push(r.service); }
        else { var r2 = await App.request('api/admin/services/' + s.id, { method: 'PUT', body: JSON.stringify(body) }); Object.assign(s, r2.service); }
        render(); d.close(); App.toast(tr('Enregistré ✓', 'Saved ✓'));
      } catch (e) { App.toast(e.code === 'required' ? tr('Le nom est obligatoire.', 'The name is required.') : e.message); }
    } }));
    if (!isNew) d.foot.appendChild(el('a', { class: 'btn', href: 'services/' + s.slug + '/', target: '_blank', rel: 'noopener', text: tr('Voir sur le site', 'View on the site') }));
    d.open();
  }
  $('[data-svc-add]').addEventListener('click', function () { edit(null); });
  render();
})();
