(function(){
  try{ if(window.TenantSDK && TenantSDK.ui && TenantSDK.ui.showInstallBanner){ TenantSDK.ui.showInstallBanner(); } }catch(e){}
  setTimeout(function(){ try{ if(window.TenantSDK && TenantSDK.ui && TenantSDK.ui.showPushPrompt){ TenantSDK.ui.showPushPrompt(); } }catch(e){} }, 9000);

  var chips=document.querySelectorAll('.js-cat-chip');
  if(chips.length){
    chips.forEach(function(ch){ ch.addEventListener('click',function(){
      chips.forEach(function(c){ c.classList.remove('active'); c.style.backgroundColor=''; c.style.color=''; c.style.boxShadow=''; });
      ch.classList.add('active'); ch.style.backgroundColor='#FF3E4D'; ch.style.color='#fff'; ch.style.boxShadow='0 0 16px rgba(255,62,77,.55)';
      var cat=ch.getAttribute('data-cat');
      document.querySelectorAll('.menu-item').forEach(function(it){ it.style.display=(cat==='all'||it.getAttribute('data-category')===cat)?'':'none'; });
    }); });
  }

  function bind(sel,url,okmsg){
    document.querySelectorAll(sel).forEach(function(f){
      f.addEventListener('submit',async function(e){
        e.preventDefault();
        var btn=f.querySelector('button[type="submit"]'), msg=f.querySelector('.form-msg');
        var data={}; new FormData(f).forEach(function(v,k){ data[k]=v; });
        if(!data.name){ if(msg){ msg.textContent='Le nom est requis.'; msg.hidden=false; msg.className='form-msg err'; } return; }
        if(btn) btn.disabled=true;
        try{
          var r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
          var j=await r.json();
          if(r.ok && j.success){ f.reset(); if(msg){ msg.textContent=okmsg; msg.hidden=false; msg.className='form-msg ok'; } }
          else if(msg){ msg.textContent=(j.error||'Une erreur est survenue.'); msg.hidden=false; msg.className='form-msg err'; }
        }catch(err){ if(msg){ msg.textContent='Erreur de connexion. Réessayez.'; msg.hidden=false; msg.className='form-msg err'; } }
        if(btn) btn.disabled=false;
      });
    });
  }
  var M=window.__MSG||{};
  bind('.js-reserve-form','api/reservation',M.reserve||'Merci !');
  bind('.js-contact-form','api/contact',M.contact||'Merci !');
})();
