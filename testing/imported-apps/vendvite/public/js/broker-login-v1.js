(function(){
 var form=document.getElementById('brokerLoginForm');if(!form)return;
 var button=form.querySelector('button'),result=document.getElementById('loginResult'),busy=false,cooldown=false;
 form.addEventListener('submit',async function(e){
  e.preventDefault();if(busy||cooldown||!form.reportValidity())return;
  busy=true;button.disabled=true;var label=button.textContent;button.textContent=form.dataset.sending;result.textContent='';
  try{
   var response=await fetch('api/courtier/connexion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
   var data=await response.json();result.textContent=response.ok?data.message:(data.error||form.dataset.error);
   result.className=response.ok?'ws-success':'esp-error';
   if(response.ok){cooldown=true;setTimeout(function(){cooldown=false;button.disabled=false;},60000);}
  }catch(e){result.textContent=form.dataset.error;result.className='esp-error';}
  busy=false;button.disabled=cooldown;button.textContent=label;
 });
})();
