(function() {
  var burger = document.getElementById('hamburgerBtn');
  var menu = document.getElementById('navMobile');
  if (burger && menu) {
    burger.addEventListener('click', function() {
      menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    });
  }
})();

(function() {
  function init() {
    if (!window.TenantSDK) { setTimeout(init, 200); return; }
    try {
      TenantSDK.ui.showInstallBanner();
    } catch(e) {}
    setTimeout(function() {
      try { TenantSDK.ui.showPushPrompt(); } catch(e) {}
    }, 9000);
  }
  init();
})();
