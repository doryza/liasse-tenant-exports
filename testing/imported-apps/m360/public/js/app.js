(function(){
  try{ if(window.TenantSDK && TenantSDK.ui && TenantSDK.ui.showInstallBanner) TenantSDK.ui.showInstallBanner(); }catch(e){}
})();
setTimeout(function(){ try{ if(window.TenantSDK && TenantSDK.ui && TenantSDK.ui.showPushPrompt) TenantSDK.ui.showPushPrompt(); }catch(e){} }, 9000);
(function(){
  var f=document.getElementById('contactForm');
  if(!f) return;
  function val(id){ var e=document.getElementById(id); return e? e.value.trim() : ''; }
  f.addEventListener('submit', function(ev){
    ev.preventDefault();
    var btn=f.querySelector('button[type=submit]');
    var msg=document.getElementById('contactMsg');
    var data={ name:val('cName'), email:val('cEmail'), phone:val('cPhone'), message:val('cMessage') };
    if(!data.name || !data.message){ if(msg){ msg.textContent=f.getAttribute('data-required')||''; msg.className='form-msg err'; } return; }
    var orig=btn.textContent; btn.disabled=true; btn.textContent=f.getAttribute('data-sending')||'...';
    fetch('api/contact',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }).then(function(r){ return r.json().then(function(d){ return { ok:r.ok, d:d }; }); }).then(function(res){
      if(res.ok && res.d.success){ if(msg){ msg.textContent=f.getAttribute('data-success')||''; msg.className='form-msg ok'; } f.reset(); }
      else { if(msg){ msg.textContent=f.getAttribute('data-error')||''; msg.className='form-msg err'; } }
      btn.disabled=false; btn.textContent=orig;
    }).catch(function(){ if(msg){ msg.textContent=f.getAttribute('data-error')||''; msg.className='form-msg err'; } btn.disabled=false; btn.textContent=orig; });
  });
})();
