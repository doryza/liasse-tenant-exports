(function () {
  if (!window.App) return;
  var t = App.t; var lang = App.data.lang; var P = App.data.planner || { vehicles: [] };
  var en = lang === 'en';
  // Typical intervals for recent vehicles. General guidance only — the owner's
  // manual is the reference (said on the page).
  var RULES = [
    { key: 'oil', every: 8000, fr: 'Vidange d’huile et filtre', en: 'Oil and filter change', slug: 'vidange-huile', fromOil: true },
    { key: 'rotation', every: 10000, fr: 'Rotation des pneus', en: 'Tire rotation', slug: 'equilibrage-permutation' },
    { key: 'brakes', every: 20000, fr: 'Inspection des freins', en: 'Brake inspection', slug: 'mecanique' },
    { key: 'air', every: 24000, fr: 'Filtre à air du moteur', en: 'Engine air filter', slug: 'mise-au-point' },
    { key: 'cabin', every: 24000, fr: 'Filtre d’habitacle', en: 'Cabin air filter', slug: 'mise-au-point' },
    { key: 'trans', every: 80000, fr: 'Huile de transmission', en: 'Transmission fluid', slug: 'transmission' },
    { key: 'coolant', every: 160000, fr: 'Liquide de refroidissement', en: 'Engine coolant', slug: 'refroidissement' },
    { key: 'plugs', every: 160000, fr: 'Bougies d’allumage', en: 'Spark plugs', slug: 'mise-au-point' },
  ];
  var km = document.querySelector('[data-km]'); var last = document.querySelector('[data-last-oil]');
  var plan = document.querySelector('[data-plan]'); var pick = document.querySelector('[data-planner-vehicle]');
  var nf = new Intl.NumberFormat(en ? 'en-CA' : 'fr-CA');
  var bookUrl = App.data.urls.booking;
  function render() {
    var current = Number(String(km.value).replace(/\D/g, '')) || 0;
    var lastOil = Number(String(last.value).replace(/\D/g, '')) || 0;
    plan.innerHTML = '';
    if (!current) { plan.innerHTML = '<p class="muted">' + t.current_km + '…</p>'; return; }
    RULES.forEach(function (r) {
      var since = r.fromOil && lastOil ? current - lastOil : current % r.every;
      var left = r.every - since;
      var ratio = Math.max(0, Math.min(1, since / r.every));
      var state = left <= 0 ? 'due' : (left <= r.every * 0.15 ? 'soon' : 'ok');
      var row = document.createElement('div'); row.className = 'plan-row';
      var badge = document.createElement('span'); badge.className = 'badge badge-' + state; badge.textContent = t[state];
      var info = document.createElement('div');
      var b = document.createElement('b'); b.textContent = en ? r.en : r.fr;
      var sm = document.createElement('small');
      sm.textContent = (en ? 'Every ' : 'Aux ') + nf.format(r.every) + ' km · ' + (left <= 0 ? (en ? 'overdue by ' : 'dépassé de ') + nf.format(-left) + ' km' : (en ? 'in ' : 'dans ') + nf.format(left) + ' km');
      info.appendChild(b); info.appendChild(sm);
      var meter = document.createElement('div'); meter.className = 'meter'; var i = document.createElement('i'); i.style.width = Math.round(ratio * 100) + '%'; if (state !== 'ok') i.className = state; meter.appendChild(i);
      var a = document.createElement('a'); a.className = 'btn btn-ghost btn-sm'; a.href = bookUrl + '?service=' + r.slug; a.textContent = t.booking;
      row.appendChild(badge); row.appendChild(info); row.appendChild(a); info.appendChild(meter);
      plan.appendChild(row);
    });
  }
  if (pick) pick.addEventListener('change', function () {
    var v = P.vehicles.find(function (x) { return String(x.id) === pick.value; });
    km.value = v && v.km != null ? v.km : ''; last.value = v && v.lastOil != null ? v.lastOil : ''; render();
  });
  km.addEventListener('input', render); last.addEventListener('input', render);
  if (P.vehicles.length && pick) { pick.value = P.vehicles[0].id; pick.dispatchEvent(new Event('change')); } else render();
})();
