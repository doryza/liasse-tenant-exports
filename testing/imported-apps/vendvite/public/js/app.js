(function(){
  var T = window.VV_T || {};
  function q(id){ return document.getElementById(id); }

  function initBanners(){
    try{ if(window.TenantSDK && TenantSDK.ui && TenantSDK.ui.showInstallBanner){ TenantSDK.ui.showInstallBanner(); } }catch(e){}
    setTimeout(function(){ try{ if(window.TenantSDK && TenantSDK.ui && TenantSDK.ui.showPushPrompt){ TenantSDK.ui.showPushPrompt(); } }catch(e){} }, 9000);
  }

  function initScroll(){
    var els = document.querySelectorAll('[data-scroll-eval]');
    for(var i=0;i<els.length;i++){
      els[i].addEventListener('click', function(e){
        var el=q('evaluation'); if(!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior:'smooth', block:'start' });
        var inp=q('addressInput'); if(inp){ setTimeout(function(){ inp.focus(); }, 480); }
      });
    }
  }

  function animateNum(el, target){
    var dur=1200, start=null;
    function step(ts){ if(!start) start=ts; var p=Math.min((ts-start)/dur,1); var e=1-Math.pow(1-p,3); el.textContent=Math.round(target*e).toString(); if(p<1){ requestAnimationFrame(step); } else { el.textContent=target.toString(); } }
    requestAnimationFrame(step);
  }
  function initStats(){
    var nums=document.querySelectorAll('.stat-num[data-count]');
    if(!nums.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce || !('IntersectionObserver' in window)){ for(var i=0;i<nums.length;i++){ nums[i].textContent=(nums[i].getAttribute('data-count')||'0'); } return; }
    var io=new IntersectionObserver(function(entries){ entries.forEach(function(en){ if(en.isIntersecting){ var t=parseFloat(en.target.getAttribute('data-count'))||0; animateNum(en.target, t); io.unobserve(en.target); } }); }, { threshold:0.4 });
    for(var j=0;j<nums.length;j++){ nums[j].textContent='0'; io.observe(nums[j]); }
  }

  function setRef(){ var el=q('ficheRef'); if(el && el.textContent.indexOf('—')>=0){ el.textContent='VV-'+new Date().getFullYear()+'-'+String(Math.floor(1000+Math.random()*9000)); } }

  function revealFiche(addr){
    var a=q('ficheAddress'); if(a){ a.textContent=addr; a.classList.add('filled'); }
    var f=q('leadForm'); if(f){ f.hidden=false; }
    setRef();
  }

  function stampFiche(){
    var form=q('leadForm'); if(form) form.hidden=true;
    var stamp=q('ficheStamp'); if(stamp){ stamp.hidden=false; stamp.classList.add('stamped'); }
    var succ=q('ficheSuccess'); if(succ){ succ.hidden=false; var h=q('ficheSuccessTitle'); var p=q('ficheSuccessText'); if(h && T.successTitle) h.textContent=T.successTitle; if(p && T.successText) p.textContent=T.successText; }
    var fiche=q('fiche'); if(fiche) fiche.classList.add('sealed');
  }

  var ficheRevealTimer = null;
  function initForm(){
    var input=q('addressInput'); var form=q('leadForm');
    if(input){
      input.addEventListener('input', function(){
        var v=input.value.trim();
        if(ficheRevealTimer){ clearTimeout(ficheRevealTimer); ficheRevealTimer=null; }
        if(v.length>=4){
          ficheRevealTimer = setTimeout(function(){ revealFiche(v); }, 500);
        }
      });
    }
    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var errEl=q('formError'); if(errEl) errEl.textContent='';
        var name=((q('leadName') && q('leadName').value) || '').trim();
        var address=((input && input.value) || '').trim();
        if(!name || !address){ if(errEl) errEl.textContent=T.errRequired || 'Champs requis.'; return; }
        var btn=q('sealBtn'); var orig=btn ? btn.textContent : '';
        if(btn){ btn.disabled=true; btn.textContent=T.submitting || '…'; }
        var payload={ name:name, email:((q('leadEmail') && q('leadEmail').value) || '').trim(), phone:((q('leadPhone') && q('leadPhone').value) || '').trim(), timeframe:((q('leadTime') && q('leadTime').value) || '').trim(), address:address, lat:((q('leadLat') && q('leadLat').value) || ''), lng:((q('leadLng') && q('leadLng').value) || '') };
        // On a broker's page the lead belongs to that broker, not to the
        // house funnel — VV_BROKER is emitted only by broker-page.ejs.
        var leadUrl = window.VV_BROKER ? ('api/courtier/' + window.VV_BROKER + '/piste') : 'api/lead';
        fetch(leadUrl, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload) })
          .then(function(r){ if(!r.ok) throw new Error('bad'); return r.json(); })
          .then(function(){ stampFiche(); })
          .catch(function(){ if(errEl) errEl.textContent=T.errGeneric || 'Erreur.'; if(btn){ btn.disabled=false; btn.textContent=orig; } });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){ initBanners(); initScroll(); initStats(); initForm(); });

  window.initVendvite = async function(){
    try{
      var places = await google.maps.importLibrary('places');
      await google.maps.importLibrary('geometry');
      await google.maps.importLibrary('streetView');
      await google.maps.importLibrary('maps');
      var AutocompleteSuggestion = places.AutocompleteSuggestion;
      var AutocompleteSessionToken = places.AutocompleteSessionToken;
      var token = new AutocompleteSessionToken();
      var input=q('addressInput'); var box=q('addressSuggest');
      if(!input || !box) return;
      var timer=null;
      input.addEventListener('input', function(){
        var v=input.value.trim();
        if(timer) clearTimeout(timer);
        if(v.length<3){ box.style.display='none'; box.innerHTML=''; return; }
        timer=setTimeout(function(){ fetchSug(v); }, 260);
      });
      input.addEventListener('keydown', function(e){
        if(e.key==='Enter'){
          if(box.style.display==='block' && box.children.length>0){
            e.preventDefault();
            var first=box.querySelector('li');
            if(first) first.click();
          }
        } else if(e.key==='Escape'){
          box.style.display='none';
        }
      });
      document.addEventListener('click', function(e){ if(!box.contains(e.target) && e.target!==input){ box.style.display='none'; } });

      async function fetchSug(v){
        try{
          var resp=await AutocompleteSuggestion.fetchAutocompleteSuggestions({ input:v, sessionToken:token, includedRegionCodes:['ca'] });
          var sugs=(resp && resp.suggestions) || [];
          if(!sugs.length){ box.style.display='none'; box.innerHTML=''; return; }
          box.innerHTML='';
          sugs.slice(0,5).forEach(function(s){
            var pp=s.placePrediction; if(!pp) return;
            var li=document.createElement('li');
            li.textContent=(pp.text && pp.text.text) || '';
            li.addEventListener('click', function(){ choose(pp); });
            box.appendChild(li);
          });
          box.style.display='block';
        }catch(err){ box.style.display='none'; }
      }
      async function choose(pp){
        box.style.display='none'; box.innerHTML='';
        try{
          var place=pp.toPlace();
          await place.fetchFields({ fields:['location','formattedAddress','displayName'] });
          var addr=place.formattedAddress || (pp.text && pp.text.text) || input.value;
          input.value=addr;
          revealFiche(addr);
          if(window.matchMedia && window.matchMedia('(max-width:960px)').matches){
            var ficheEl=q('fiche');
            if(ficheEl){
              var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              ficheEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
            }
          }
          var loc=place.location;
          if(loc){ setCoords(loc); loadStreetView(loc); }
        }catch(err){ console.error(err); }
      }
      function setCoords(loc){
        var lat=(typeof loc.lat==='function') ? loc.lat() : loc.lat;
        var lng=(typeof loc.lng==='function') ? loc.lng() : loc.lng;
        if(q('leadLat')) q('leadLat').value=lat;
        if(q('leadLng')) q('leadLng').value=lng;
        var ns=lat>=0 ? (T.dirN||'N') : (T.dirS||'S');
        var ew=lng>=0 ? (T.dirE||'E') : (T.dirW||'O');
        var c=q('ficheCoords'); if(c) c.textContent=Math.abs(lat).toFixed(4)+'° '+ns+', '+Math.abs(lng).toFixed(4)+'° '+ew;
      }
      function loadStreetView(loc){
        var el=q('streetview'); var photo=q('fichePhoto'); if(!el) return;
        var svc=new google.maps.StreetViewService();
        svc.getPanorama({ location:loc, radius:120 }, function(data, status){
          el.innerHTML='';
          if(status===google.maps.StreetViewStatus.OK && data && data.location){
            var pano=data.location.latLng;
            var heading=0;
            try{ heading=google.maps.geometry.spherical.computeHeading(pano, loc); }catch(e){}
            new google.maps.StreetViewPanorama(el, { pano:data.location.pano, pov:{ heading:heading, pitch:6 }, zoom:0.6, disableDefaultUI:true, motionTracking:false, motionTrackingControl:false, linksControl:false, addressControl:false, fullscreenControl:false, panControl:false, zoomControl:false, clickToGo:false, scrollwheel:false });
            if(photo) photo.classList.add('has-view');
          } else {
            var map=new google.maps.Map(el, { center:loc, zoom:18, disableDefaultUI:true, gestureHandling:'none', keyboardShortcuts:false });
            new google.maps.Marker({ position:loc, map:map });
            if(photo) photo.classList.add('has-view');
          }
        });
      }
    }catch(e){ console.error('Maps init', e); }
  };
})();
