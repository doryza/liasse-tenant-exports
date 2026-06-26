(function(){
  window.apiFetch=function(u,o){ return (window.TenantSDK&&TenantSDK.fetch)?TenantSDK.fetch(u,o):fetch(u,o); };
  try{ if(window.TenantSDK&&TenantSDK.ui&&TenantSDK.ui.showInstallBanner){ TenantSDK.ui.showInstallBanner(); } }catch(e){}
  var pushed=false;
  function tryPush(){ if(pushed) return; pushed=true; try{ if(window.TenantSDK&&TenantSDK.ui&&TenantSDK.ui.showPushPrompt){ TenantSDK.ui.showPushPrompt(); } }catch(e){} }
  setTimeout(tryPush,9000);
  window.addEventListener('scroll',function(){ if(window.scrollY>700) tryPush(); },{passive:true});
})();
