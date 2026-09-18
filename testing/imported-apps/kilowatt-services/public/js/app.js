(async function() {
  if (!window.TenantSDK) return;
  try {
    await TenantSDK.ready;
    if (document.body.classList.contains('admin-site')) return;
    TenantSDK.ui.showInstallBanner();
    let interaction = false;
    let elapsed = false;
    let shown = false;
    function maybePrompt() {
      if (!interaction || !elapsed || shown) return;
      if (TenantSDK.config && TenantSDK.config.notifications && TenantSDK.config.notifications.enabled) {
        shown = true;
        TenantSDK.ui.showPushPrompt({title:window.KW.t.pushTitle,description:window.KW.t.pushBody});
      }
    }
    window.addEventListener('scroll',function() { interaction = true; maybePrompt(); },{once:true,passive:true});
    document.addEventListener('click',function(event) {
      if (event.target.closest('button,input,textarea,select,[data-login-btn]')) return;
      interaction = true;
      maybePrompt();
    });
    setTimeout(function() { elapsed = true; maybePrompt(); },8000);
  } catch(e) {}
})();