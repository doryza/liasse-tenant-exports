(function(){
  function init(){
    if (typeof TenantSDK === 'undefined') return;
    try { TenantSDK.ui.showInstallBanner(); } catch(e){}
    setTimeout(function(){ try { TenantSDK.ui.showPushPrompt({ title: 'Recevez nos actualités', description: 'Soyez avisé de nos promotions et nouveautés FreshBin.' }); } catch(e){} }, 9000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
