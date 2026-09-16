(function(){
async function boot(){
if(!window.TenantSDK)return;
try{
await TenantSDK.ready;
if(document.body.dataset.admin==='true')return;
TenantSDK.ui.showInstallBanner();
let scheduled=false;
const el=document.getElementById('public-copy');
const copy=el?JSON.parse(el.textContent):{};
function schedule(){if(scheduled)return;scheduled=true;setTimeout(function(){try{if(window.TenantSDK&&TenantSDK.config&&TenantSDK.config.notifications&&TenantSDK.config.notifications.enabled)TenantSDK.ui.showPushPrompt({title:copy.pushTitle,description:copy.pushDescription});}catch(e){}},8000);}
window.addEventListener('scroll',schedule,{once:true,passive:true});
document.addEventListener('click',schedule,{once:true});
document.querySelectorAll('.product-details').forEach(function(d){d.addEventListener('toggle',function(){if(d.open)schedule();},{once:true});});
}catch(e){}
}
if(document.readyState==='complete')boot();else window.addEventListener('load',boot,{once:true});
})();