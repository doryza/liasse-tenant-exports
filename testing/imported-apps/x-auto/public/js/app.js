(function(){
  function ready(){
    try {
      if (window.TenantSDK && window.TenantSDK.ui) {
        try { window.TenantSDK.ui.showInstallBanner(); } catch(e) {}
        setTimeout(function(){ try { window.TenantSDK.ui.showPushPrompt(); } catch(e) {} }, 9000);
      }
    } catch(e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
