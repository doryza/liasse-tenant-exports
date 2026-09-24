/* Customer list (new customer) and customer file (details, vehicles). */
(function () {
  if (!window.App || !window.Admin) return;
  var A = window.Admin; var tr = A.tr; var el = A.el; var $ = A.$; var en = A.en;
  var P = App.data;

  function input(name, value, attrs) { return el('input', Object.assign({ name: name, value: value == null ? '' : value }, attrs || {})); }

  // ----------------------------------------------------------- new customer
  var addBtn = $('[data-client-add]');
  if (addBtn) {
    var d = A.drawer(tr('Nouveau client', 'New customer'));
    var f = { name: input('name', '', { maxlength: '120' }), phone: input('phone', '', { type: 'tel', maxlength: '40' }), email: input('email', '', { type: 'email', maxlength: '200' }), address: input('address', '', { maxlength: '300' }) };
    d.body.appendChild(A.field(tr('Nom', 'Name') + ' *', f.name));
    d.body.appendChild(A.field(tr('Téléphone', 'Phone'), f.phone));
    d.body.appendChild(A.field(tr('Courriel', 'Email'), f.email));
    d.body.appendChild(A.field(tr('Adresse', 'Address'), f.address, tr('Utile pour les estimations et factures.', 'Needed on estimates and invoices.')));
    d.foot.appendChild(el('button', { class: 'btn btn-primary', type: 'button', text: tr('Créer le client', 'Create customer'), onclick: async function () {
      try {
        var r = await App.request('api/admin/clients', { method: 'POST', body: JSON.stringify({ name: f.name.value, phone: f.phone.value, email: f.email.value, address: f.address.value }) });
        location.href = 'admin/clients/' + r.client.id;
      } catch (e) { App.toast(e.code === 'required' ? tr('Le nom est obligatoire.', 'The name is required.') : e.message); }
    } }));
    addBtn.addEventListener('click', function () { d.open(); });
  }

  // ------------------------------------------------------------ customer file
  if (!P.client) return;
  var form = $('[data-client-form]');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var body = {}; ['name', 'phone', 'email', 'address', 'notes'].forEach(function (k) { body[k] = form[k].value; });
    try { await App.request('api/admin/clients/' + P.client.id, { method: 'PUT', body: JSON.stringify(body) }); var t = $('[data-client-tick]'); t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 1800); }
    catch (err) { App.toast(err.message); }
  });

  var vehicles = P.vehicles || [];
  var rows = $('[data-vehicle-rows]');
  function label(v) { return [v.year, v.make, v.model, v.trim].filter(Boolean).join(' '); }
  function renderVehicles() {
    rows.innerHTML = '';
    if (!vehicles.length) rows.appendChild(el('p', { class: 'muted', text: tr('Aucun véhicule.', 'No vehicles.') }));
    vehicles.forEach(function (v) {
      rows.appendChild(el('div', { class: 'row' }, [
        el('div', {}, [el('div', { class: 'row-title', text: label(v) }), el('div', { class: 'row-sub', text: [v.plate, v.vin ? 'NIV ' + v.vin : '', v.odometer_km != null ? Number(v.odometer_km).toLocaleString(en ? 'en-CA' : 'fr-CA') + ' km' : ''].filter(Boolean).join(' · ') || '—' })]),
        el('div', { class: 'page-actions' }, [
          el('button', { class: 'btn btn-sm', type: 'button', text: tr('Modifier', 'Edit'), onclick: function () { editVehicle(v); } }),
        ]),
      ]));
    });
  }
  var vd = A.drawer(tr('Véhicule', 'Vehicle'));
  function editVehicle(v) {
    var isNew = !v; v = v || {};
    vd.title(isNew ? tr('Ajouter un véhicule', 'Add a vehicle') : label(v));
    vd.body.innerHTML = ''; vd.foot.innerHTML = '';
    var year = el('select', { name: 'year' }); year.appendChild(el('option', { value: '', text: '—' }));
    for (var y = new Date().getFullYear() + 1; y >= 1980; y--) { var o = el('option', { value: String(y), text: String(y) }); if (Number(v.year) === y) o.selected = true; year.appendChild(o); }
    var f = { year: year, make: input('make', v.make, { maxlength: '60', list: 'client-makes' }), model: input('model', v.model, { maxlength: '80' }), trim: input('trim', v.trim, { maxlength: '80' }),
      plate: input('plate', v.plate, { maxlength: '12', style: 'text-transform:uppercase' }), vin: input('vin', v.vin, { maxlength: '17', style: 'text-transform:uppercase' }),
      odometer_km: input('odometer_km', v.odometer_km, { inputmode: 'numeric', maxlength: '7' }), notes: el('textarea', { name: 'notes', rows: '3', maxlength: '2000' }) };
    f.notes.value = v.notes || '';
    var dl = el('datalist', { id: 'client-makes' }); (P.makes || []).forEach(function (m) { dl.appendChild(el('option', { value: m })); });
    vd.body.appendChild(dl);
    [[tr('NIV', 'VIN'), f.vin], [tr('Année', 'Year'), f.year], [tr('Marque', 'Make') + ' *', f.make], [tr('Modèle', 'Model') + ' *', f.model], [tr('Version', 'Trim'), f.trim], [tr('Plaque', 'Plate'), f.plate], [tr('Kilométrage', 'Mileage'), f.odometer_km], [tr('Notes', 'Notes'), f.notes]]
      .forEach(function (x) { vd.body.appendChild(A.field(x[0], x[1])); });
    var vinOut = el('span', { class: 'small muted' });
    vd.body.insertBefore(el('p', {}, [el('button', { class: 'btn btn-sm', type: 'button', text: tr('Remplir avec le NIV', 'Fill in from the VIN'), onclick: async function () {
      var vin = f.vin.value.trim().toUpperCase(); if (vin.length !== 17) { vinOut.textContent = tr(' Le NIV a 17 caractères.', ' A VIN has 17 characters.'); return; }
      try { var r = await App.request('api/vin/' + encodeURIComponent(vin)); if (!r.ok) { vinOut.textContent = tr(' NIV introuvable.', ' VIN not found.'); return; } if (r.year) year.value = String(r.year); f.make.value = r.make || ''; f.model.value = r.model || ''; f.trim.value = r.trim || ''; vinOut.textContent = ' ✓'; }
      catch (e) { vinOut.textContent = ' ' + e.message; }
    } }), vinOut]), vd.body.children[2]);
    vd.foot.appendChild(el('button', { class: 'btn btn-primary', type: 'button', text: tr('Enregistrer', 'Save'), onclick: async function () {
      var body = {}; Object.keys(f).forEach(function (k) { body[k] = f[k].value; });
      body.odometer_km = String(body.odometer_km || '').replace(/\D/g, '');
      try {
        var r = isNew ? await App.request('api/admin/clients/' + P.client.id + '/vehicles', { method: 'POST', body: JSON.stringify(body) })
          : await App.request('api/admin/vehicles/' + v.id, { method: 'PUT', body: JSON.stringify(body) });
        vehicles = isNew ? vehicles.concat([r.vehicle]) : vehicles.map(function (x) { return x.id === v.id ? r.vehicle : x; });
        renderVehicles(); vd.close(); App.toast(tr('Enregistré ✓', 'Saved ✓'));
      } catch (e) { App.toast(e.code === 'required' ? tr('La marque et le modèle sont obligatoires.', 'Make and model are required.') : e.message); }
    } }));
    if (!isNew) vd.foot.appendChild(el('button', { class: 'btn btn-danger', type: 'button', text: tr('Retirer ce véhicule', 'Remove this vehicle'), onclick: async function () {
      if (!confirm(tr('Retirer ce véhicule de la fiche ? Son historique est conservé.', 'Remove this vehicle from the file? Its history is kept.'))) return;
      try { await App.request('api/admin/vehicles/' + v.id, { method: 'DELETE' }); vehicles = vehicles.filter(function (x) { return x.id !== v.id; }); renderVehicles(); vd.close(); } catch (e) { App.toast(e.message); }
    } }));
    vd.open();
  }
  $('[data-vehicle-add]').addEventListener('click', function () { editVehicle(null); });
  renderVehicles();
})();
