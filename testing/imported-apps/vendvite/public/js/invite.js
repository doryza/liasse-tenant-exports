(function(){
  var form = document.getElementById('invForm');
  if(!form) return;
  var btn = document.getElementById('invSubmit');
  var err = document.getElementById('invError');
  var panel = document.getElementById('invPanel');
  var done = document.getElementById('invDone');
  var doneText = document.getElementById('invDoneText');
  var btnCopy = btn.querySelector('.inv-submit-copy');
  var busy = false;
  var home = document.querySelector('main.hp');
  var preview = home && home.dataset.preview === '1';
  var sentEvents = {};
  function track(event) {
    if (!home || home.dataset.track !== '1' || preview || sentEvents[event]) return;
    sentEvents[event] = true;
    fetch('api/homepage/event', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({event:event}), keepalive:true }).catch(function(){ delete sentEvents[event]; });
  }
  function view() { if(document.visibilityState === 'visible') track('view'); }
  view();
  document.addEventListener('visibilitychange',view);
  form.addEventListener('input',function(e){
    track('start');
    if(e.target.classList){e.target.classList.remove('bad');e.target.removeAttribute('aria-invalid');}
    if(!form.querySelector('.bad')) err.textContent='';
  });
  document.querySelectorAll('[data-home-cta]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault(); track('cta');
      panel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      (form.hidden ? done : field('invName')).focus({preventScroll:true});
    });
  });
  // In-page section links (« Voir la différence », builder…) scroll in place so
  // the <base href> the platform injects never bounces the visitor to the root.
  document.querySelectorAll('.hp-text-link[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var target=document.getElementById(a.getAttribute('href').slice(1));
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    });
  });
  var sticky=document.getElementById('hpSticky');
  if(sticky && 'IntersectionObserver' in window){
    var seenHero=false, seenForm=false;
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.target===panel)seenForm=entry.isIntersecting;else seenHero=entry.isIntersecting;});
      sticky.hidden=seenHero || seenForm || form.hidden;
    },{threshold:0});
    observer.observe(panel); observer.observe(document.querySelector('.hp-actions'));
  }


  function field(id){ return document.getElementById(id); }
  function clearBad(){ ['invName','invAgency','invPhone','invEmail'].forEach(function(id){ field(id).classList.remove('bad'); field(id).removeAttribute('aria-invalid'); }); }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(busy) return;
    clearBad();
    err.textContent = '';

    var payload = {
      name: field('invName').value.trim(),
      agency: field('invAgency').value.trim(),
      phone: field('invPhone').value.trim(),
      email: field('invEmail').value.trim()
    };
    var missing = Object.keys(payload).filter(function(k){ return !payload[k]; });
    if(missing.length){
      missing.forEach(function(k){
        var map = { name:'invName', agency:'invAgency', phone:'invPhone', email:'invEmail' };
        field(map[k]).classList.add('bad'); field(map[k]).setAttribute('aria-invalid','true');
      });
      err.textContent = form.getAttribute('data-err-required') || 'Tous les champs sont requis.';
      form.querySelector('.bad').focus();
      return;
    }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)){
      field('invEmail').classList.add('bad'); field('invEmail').setAttribute('aria-invalid','true'); field('invEmail').focus();
      err.textContent = form.getAttribute('data-err-email') || 'Courriel invalide.';
      return;
    }

    if(preview) payload.homepage_preview = true;
    busy = true;
    var label = btnCopy.textContent;
    btn.disabled = true;
    btn.classList.add('is-sending');
    btn.setAttribute('aria-busy', 'true');
    btnCopy.textContent = btn.getAttribute('data-sending') || 'Envoi…';
    try{
      var res = await fetch('api/courtier/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await res.json().catch(function(){ return {}; });
      if(!res.ok || data.success !== true || !data.offer){
        err.textContent = data.error || (form.getAttribute('data-err-generic') || 'Un problème est survenu.');
        btn.disabled = false;
        btn.classList.remove('is-sending');
        btn.removeAttribute('aria-busy');
        btnCopy.textContent = label;
        busy = false;
        return;
      }
      var reveal = document.getElementById('hpReveal');
      if(reveal && data.offer){
        document.getElementById('hpRevealAmount').textContent=data.offer.amount;
        document.getElementById('hpRevealTerm').textContent=data.offer.term;
        document.getElementById('hpRevealIncludes').textContent=data.offer.includes;
        document.getElementById('hpRevealBilling').textContent=data.offer.billing;
        reveal.hidden=false;
        document.getElementById('hpOffer').hidden=true;
      }
      if(sticky) sticky.hidden=true;
      if(data.message && doneText) doneText.textContent = data.message;
      btn.classList.remove('is-sending');
      btn.classList.add('is-sealed');
      btn.removeAttribute('aria-busy');
      btnCopy.textContent = btn.getAttribute('data-sent') || 'Demande transmise';
      panel.classList.add('is-sealing');

      var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(function(){
        form.hidden = true;
        var intro=panel.querySelector('.hp-form-intro'); if(intro) intro.hidden=true;
        panel.querySelector('.inv-panel-title').hidden = true;
        panel.querySelector('.inv-panel-sub').hidden = true;
        panel.classList.remove('is-sealing');
        panel.classList.add('is-sealed');
        done.hidden = false;
        done.focus({ preventScroll: true });
      }, reducedMotion ? 0 : 520);
    }catch(_){
      err.textContent = form.getAttribute('data-err-generic') || 'Un problème est survenu.';
      btn.disabled = false;
      btn.classList.remove('is-sending');
      btn.removeAttribute('aria-busy');
      btnCopy.textContent = label;
      busy = false;
    }
  });
})();
