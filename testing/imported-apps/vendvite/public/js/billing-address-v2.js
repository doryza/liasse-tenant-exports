(function(){
 'use strict';var form=document.getElementById('billingAddressForm');if(!form)return;
 var en=document.documentElement.lang==='en',status=document.getElementById('billingAddressStatus'),mode=form.dataset.paymentMode,blocked=false;
 form.addEventListener('submit',async function(event){event.preventDefault();if(blocked)return;var button=form.querySelector('button'),values=Object.fromEntries(new FormData(form));button.disabled=true;
  try{var response=await window.VVWorkspace.request('api/espace/billing-address',{method:'PUT',headers:{'Content-Type':'application/json','X-VV-Payment-Mode':mode},body:JSON.stringify({paymentMode:mode,confirmed:values.confirmed==='on',address:Object.assign({},values,{country:'CA'})})}),body=await response.json();
   if(body.code==='PAYMENT_MODE_CHANGED'){blocked=true;status.textContent=en?'Your payment workspace changed. Reload before saving the address.':'Le mode de paiement a changé. Rechargez avant d’enregistrer l’adresse.';var link=document.createElement('a');link.href=location.href;link.textContent=en?' Reload workspace':' Recharger mon espace';status.appendChild(link);document.dispatchEvent(new Event('vv:payment-mode-changed'));return;}
   if(!response.ok)throw Error();status.textContent=mode==='sandbox'?(en?'Test billing address saved separately.':'Adresse de facturation test enregistrée séparément.'):(en?'Billing address saved.':'Adresse de facturation enregistrée.');document.dispatchEvent(new Event('vv:billing-updated'));if(document.getElementById('subBtn'))location.reload();
  }catch(error){status.textContent=en?'Could not save. Check the address, province and postal code, then retry.':'Enregistrement impossible. Vérifiez l’adresse, la province et le code postal, puis réessayez.';}finally{button.disabled=blocked;}
 });
})();
