(function(){
  if (!window.TenantSDK) return;
  TenantSDK.ready && TenantSDK.ready.then(function(){
    try {
      if (TenantSDK.auth && TenantSDK.auth.isLoggedIn && TenantSDK.auth.isLoggedIn()) {
        document.querySelectorAll('[data-auth-only]').forEach(function(el){ el.style.display = ''; });
        document.querySelectorAll('[data-login-btn]').forEach(function(el){ el.style.display = 'none'; });
      }
    } catch(e){}
  });
})();