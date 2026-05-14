(function(){
  function init(){
    if (!window.TenantSDK) return;
    try {
      if (TenantSDK.ready && typeof TenantSDK.ready.then === 'function') {
        TenantSDK.ready.then(function(){
          try { TenantSDK.ui.showInstallBanner(); } catch(e) {}
          setTimeout(function(){ try { TenantSDK.ui.showPushPrompt(); } catch(e) {} }, 9000);
        }).catch(function(){});
      } else {
        try { TenantSDK.ui.showInstallBanner(); } catch(e) {}
        setTimeout(function(){ try { TenantSDK.ui.showPushPrompt(); } catch(e) {} }, 9000);
      }
    } catch(e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
