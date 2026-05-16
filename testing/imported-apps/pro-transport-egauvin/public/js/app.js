(function(){
  function init() {
    if (!window.TenantSDK) return;
    try { TenantSDK.ui.showInstallBanner(); } catch(e) {}
    setTimeout(function(){ try { TenantSDK.ui.showPushPrompt(); } catch(e) {} }, 9000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();