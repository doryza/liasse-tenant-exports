// Admin pages get no platform SDK (the router strips it on /admin), so this
// writes with plain same-origin fetch; the owner's admin cookie authenticates
// and the X-Requested-With header satisfies the router's same-origin guard.
(function () {
  var form = document.getElementById('settingsForm');
  var status = document.getElementById('saveStatus');
  if (!form) return;

  function show(text, ok) {
    status.textContent = text;
    status.className = 'a-status ' + (ok ? 'ok' : 'err');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var settings = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      settings[el.name] = el.type === 'checkbox' ? (el.checked ? '1' : '0') : el.value.trim();
    });
    var button = form.querySelector('button[type=submit]');
    button.disabled = true;
    show('Enregistrement…', true);
    fetch('api/admin/settings', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'liasse' },
      body: JSON.stringify({ settings: settings })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) { return { ok: r.ok, body: body }; });
    }).then(function (res) {
      if (res.ok) return show('Enregistré. Le site est à jour.', true);
      if (res.body && res.body.error === 'bad_url') return show('Ce lien doit commencer par https://', false);
      if (res.body && res.body.error === 'forbidden') return show('Session expirée : reconnectez-vous.', false);
      show('Échec de l’enregistrement. Réessayez.', false);
    }).catch(function () {
      show('Pas de connexion. Réessayez.', false);
    }).then(function () {
      button.disabled = false;
    });
  });
})();
