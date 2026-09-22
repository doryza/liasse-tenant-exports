(function () {
  var node = document.getElementById('page-data');
  if (!node) return;
  var data = JSON.parse(node.textContent);

  /**
   * The platform deliberately does NOT load its SDK on /admin pages — it would
   * hijack the admin login form with the consumer OTP modal. So the SDK is used
   * when it is there (public pages, where it carries the visitor's session) and
   * a plain same-origin fetch otherwise, where the admin cookie already
   * authenticates the request. Relative paths resolve against the injected
   * <base href>, so both branches hit the tenant, not the platform.
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
        response = await TenantSDK.fetch(url, Object.assign({}, options, { headers: headers }));
      } else {
        response = await fetch(url, Object.assign({}, options, { headers: headers, credentials: 'same-origin' }));
      }
    } catch (e) { throw new Error(data.t.offline); }
    var result;
    try { result = await response.json(); } catch (e) { throw new Error(data.t.server_error); }
    if (!response.ok) throw new Error(result.error || data.t.server_error);
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
    }, 2600);
  }

  function money(cents) {
    return new Intl.NumberFormat(data.lang === 'en' ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD' }).format(Number(cents) / 100);
  }
  function formatDate(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat(data.lang === 'en' ? 'en-CA' : 'fr-CA', { timeZone: 'America/Toronto', dateStyle: 'long' }).format(new Date(value));
  }

  window.App = { data: data, request: request, toast: toast, money: money, formatDate: formatDate };

  function applyAuthVisibility(loggedIn) {
    document.querySelectorAll('[data-auth-only]').forEach(function (el) { el.hidden = !loggedIn; });
    document.querySelectorAll('[data-auth-hide]').forEach(function (el) { el.hidden = !!loggedIn; });
    document.dispatchEvent(new CustomEvent('sh:auth', { detail: { loggedIn: !!loggedIn } }));
  }

  // Contact form
  var messageForm = document.querySelector('[data-message-form]');
  if (messageForm) {
    messageForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      var status = messageForm.querySelector('[data-message-status]');
      var submit = messageForm.querySelector('button[type=submit]');
      var body = {
        firstName: messageForm.firstName.value, lastName: messageForm.lastName.value,
        email: messageForm.email.value, phone: messageForm.phone.value,
        subject: messageForm.subject.value, body: messageForm.body.value,
        consent: messageForm.consent.checked,
      };
      if (submit) submit.disabled = true;
      try {
        var result = await request('api/messages', { method: 'POST', body: JSON.stringify(body) });
        messageForm.reset();
        if (status) { status.textContent = result.message || data.t.sent; status.hidden = false; status.style.color = 'var(--sky-deep)'; }
        toast(result.message || data.t.sent);
      } catch (e) {
        if (status) { status.textContent = e.message; status.hidden = false; status.style.color = 'var(--coral)'; }
      } finally { if (submit) submit.disabled = false; }
    });
  }

  async function init() {
    applyAuthVisibility(false);
    if (!window.TenantSDK) return;
    try {
      await TenantSDK.ready;
      applyAuthVisibility(TenantSDK.auth.isLoggedIn());

      try { TenantSDK.ui.showInstallBanner(); } catch (e) {}

      document.querySelectorAll('[data-login-btn]').forEach(function (button) {
        button.addEventListener('click', function () {
          try { TenantSDK.ui.showLogin ? TenantSDK.ui.showLogin() : TenantSDK.auth.login(); } catch (e) {}
        });
      });
      document.querySelectorAll('[data-logout]').forEach(function (button) {
        button.addEventListener('click', async function () {
          try { await TenantSDK.auth.logout(); } catch (e) {}
          window.location.assign(data.urls.home);
        });
      });
      document.querySelectorAll('[data-push-btn]').forEach(function (button) {
        button.addEventListener('click', function () { try { TenantSDK.ui.showPushPrompt(); } catch (e) {} });
      });

      // Ask about notifications only after a real interaction, never on load.
      var timer;
      var promptPush = function () {
        if (timer) return;
        timer = setTimeout(function () {
          try {
            if (TenantSDK.config && TenantSDK.config.notifications && TenantSDK.config.notifications.enabled) TenantSDK.ui.showPushPrompt();
          } catch (e) {}
        }, 8000);
      };
      window.addEventListener('scroll', promptPush, { once: true, passive: true });
      document.addEventListener('pointerdown', promptPush, { once: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
