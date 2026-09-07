(function(){
  document.querySelectorAll('[data-campaign-sent]').forEach(function(button){
    button.addEventListener('click',async function(){
      const error=button.parentElement.querySelector('[role="alert"]');
      const sent=button.dataset.sent==='true';
      button.disabled=true;error.textContent='';
      try{
        const response=await fetch(new URL('api/admin/sollicitations/'+button.dataset.campaignSent+'/sent',document.baseURI),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sent})});
        const result=await response.json();
        if(!response.ok)throw Error(result.error||'Impossible de modifier la campagne.');
        if(sent&&button.dataset.advance==='true')location.assign(new URL(result.nextCampaignId?'admin/sollicitations/'+result.nextCampaignId:'admin/sollicitations?status=sent',document.baseURI));
        else location.reload();
      }catch(e){error.textContent=e.message;button.disabled=false;}
    });
  });
})();
