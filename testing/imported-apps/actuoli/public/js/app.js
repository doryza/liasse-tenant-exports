(function(){
if (!window.TenantSDK) return;
TenantSDK.ready && TenantSDK.ready.then(function(){
try{
if (typeof TenantSDK.admin !== 'undefined' && TenantSDK.admin.isAdmin && TenantSDK.admin.isAdmin()){
document.body.classList.add('is-admin');
}
}catch(e){}
});
})();
