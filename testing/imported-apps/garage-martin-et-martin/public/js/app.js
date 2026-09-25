(function () {
  var node = document.getElementById('page-data');
  if (!node) return;
  var data = JSON.parse(node.textContent);
  var t = data.t;

  /**
   * The platform does NOT load its SDK on /admin pages (it would hijack the
   * admin login with the consumer OTP modal). Use the SDK when it is there —
   * public pages, where it carries the visitor's session — and a plain
   * same-origin fetch otherwise. Relative paths resolve against <base href>.
   */
  async function request(path, options) {
    options = options || {};
    var headers = Object.assign({ 'X-Requested-With': 'liasse' }, options.headers || {});
    if (options.body) headers['Content-Type'] = 'application/json';
    var url = path + (path.indexOf('?') > -1 ? '&' : '?') + 'lang=' + data.lang;
    var response;
    try {
      if (window.TenantSDK) {
        await TenantSDK.ready;
        response = await TenantSDK.fetch(url, Object.assign({}, options, { headers: headers, credentials: 'same-origin' }));
      } else {
        response = await fetch(url, Object.assign({}, options, { headers: headers, credentials: 'same-origin' }));
      }
    } catch (e) { throw new Error(t.offline); }
    if (options.raw) return response;
    var result;
    try { result = await response.json(); } catch (e) { throw new Error(t.server_error); }
    if (!response.ok) { var err = new Error(result.error || t.server_error); err.code = result.code; err.status = response.status; throw err; }
    return result;
  }

  var toastNode = document.querySelector('[data-toast]');
  var toastTimer;
  function toast(message) {
    if (!toastNode) return;
    toastNode.textContent = message;
    toastNode.hidden = false;
    requestAnimationFrame(function () { toastNode.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastNode.classList.remove('show');
      setTimeout(function () { toastNode.hidden = true; }, 350);
    }, 2800);
  }
  function fmt(str, vars) { return String(str || '').replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; }); }

  function money(cents) { return new Intl.NumberFormat(data.lang === 'en' ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD' }).format(Number(cents) / 100); }
  function formatDate(value) { if (!value) return ''; var v = String(value); if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v += 'T12:00:00Z'; return new Intl.DateTimeFormat(data.lang === 'en' ? 'en-CA' : 'fr-CA', { timeZone: 'America/Toronto', dateStyle: 'medium' }).format(new Date(v)); }
  window.App = { data: data, t: t, request: request, toast: toast, fmt: fmt, money: money, formatDate: formatDate };

  // Mobile menu — the drawer lives OUTSIDE the sticky masthead (a sticky
  // header with a z-index is a stacking context that would trap it) and is
  // parked off-canvas to the LEFT (a right-parked fixed drawer widens the
  // document in Chrome and scrolls every page sideways).
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') || e.target.closest('[data-menu-close]')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // « Votre gabarit » — filter tire / rust-proofing rows by vehicle size.
  // Without JS every row stays visible, which is still correct.
  document.querySelectorAll('[data-gabarit]').forEach(function (tool) {
    var buttons = Array.prototype.slice.call(tool.querySelectorAll('[data-class]'));
    var rows = Array.prototype.slice.call(tool.querySelectorAll('[data-classes]'));
    var none = tool.querySelector('[data-none]');
    function pick(cls, focus) {
      var shown = 0;
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-class') === cls;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      rows.forEach(function (r) {
        var ok = (' ' + r.getAttribute('data-classes') + ' ').indexOf(' ' + cls + ' ') > -1;
        r.hidden = !ok; if (ok) shown++;
      });
      if (none) none.hidden = shown > 0;
      try { localStorage.setItem('mm_gabarit', cls); } catch (e) { /* private mode */ }
    }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { pick(b.getAttribute('data-class')); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        pick(buttons[(i + d + buttons.length) % buttons.length].getAttribute('data-class'), true);
      });
    });
    var saved = null;
    try { saved = localStorage.getItem('mm_gabarit'); } catch (e) { /* private mode */ }
    var start = buttons.some(function (b) { return b.getAttribute('data-class') === saved; }) ? saved : (buttons[0] && buttons[0].getAttribute('data-class'));
    if (start) pick(start);
  });

  // Sign out (account page).
  document.querySelectorAll('[data-logout]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (window.TenantSDK) TenantSDK.auth.logout();
      location.href = data.urls.home === '.' ? './' : data.urls.home;
    });
  });

  // Contact form.
  var messageForm = document.querySelector('[data-message-form]');
  if (messageForm) {
    messageForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      var status = messageForm.querySelector('[data-message-status]');
      var submit = messageForm.querySelector('button[type=submit]');
      submit.disabled = true;
      try {
        await request('api/messages', { method: 'POST', body: JSON.stringify({
          firstName: messageForm.firstName.value, lastName: messageForm.lastName.value, email: messageForm.email.value,
          phone: messageForm.phone.value, subject: messageForm.subject.value, body: messageForm.body.value, consent: messageForm.consent.checked,
        }) });
        messageForm.reset();
        status.textContent = t.sent;
        toast(t.sent);
      } catch (e) { status.textContent = e.message; toast(e.message); }
      submit.disabled = false;
    });
  }
})();
