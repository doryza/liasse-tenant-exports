(function(){
  function init(){
    try { if (window.TenantSDK && TenantSDK.ui && TenantSDK.ui.showInstallBanner) TenantSDK.ui.showInstallBanner(); } catch(e){}
    setTimeout(function(){
      try { if (window.TenantSDK && TenantSDK.ui && TenantSDK.ui.showPushPrompt) TenantSDK.ui.showPushPrompt(); } catch(e){}
    }, 9000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
