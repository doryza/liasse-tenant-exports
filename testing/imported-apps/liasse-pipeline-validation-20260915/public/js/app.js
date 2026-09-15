(function(){
const storageKey='liasse-lab:'+new URL(document.baseURI).pathname+':content:v1';
if(document.body.classList.contains('public-body')){
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');let applied=false;if(saved&&typeof saved==='object'&&!Array.isArray(saved))document.querySelectorAll('[data-local-key][data-local-field]').forEach(function(element){const row=Object.prototype.hasOwnProperty.call(saved,element.dataset.localKey)?saved[element.dataset.localKey]:null;const value=row&&row[element.dataset.localField];if(typeof value==='string'){element.textContent=value;if(/^H[1-6]$/.test(element.tagName))element.hidden=!value.trim();applied=true;}});const notice=document.getElementById('local-notice');if(notice)notice.hidden=!applied;}catch(e){}
}
window.addEventListener('load',async function(){
if(!window.TenantSDK||document.body.classList.contains('admin-body'))return;
try{await TenantSDK.ready;TenantSDK.ui.showInstallBanner();const enabled=!!(TenantSDK.config&&TenantSDK.config.notifications&&TenantSDK.config.notifications.enabled);document.querySelectorAll('[data-push-btn]').forEach(button=>button.hidden=!enabled);if(!enabled)return;const data=document.getElementById('public-data'),copy=data?JSON.parse(data.textContent):{};setTimeout(function(){try{if(window.TenantSDK)TenantSDK.ui.showPushPrompt({title:copy.pushTitle,description:copy.pushDescription});}catch(e){}},8000);}catch(e){}
});
})();