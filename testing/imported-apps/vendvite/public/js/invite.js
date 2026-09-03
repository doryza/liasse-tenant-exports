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

  function field(id){ return document.getElementById(id); }
  function clearBad(){ ['invName','invAgency','invRegion','invPhone','invEmail'].forEach(function(id){ field(id).classList.remove('bad'); }); }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(busy) return;
    clearBad();
    err.textContent = '';

    var payload = {
      name: field('invName').value.trim(),
      agency: field('invAgency').value.trim(),
      target_region: field('invRegion').value.trim(),
      phone: field('invPhone').value.trim(),
      email: field('invEmail').value.trim()
    };
    var missing = Object.keys(payload).filter(function(k){ return !payload[k]; });
    if(missing.length){
      missing.forEach(function(k){
        var map = { name:'invName', agency:'invAgency', target_region:'invRegion', phone:'invPhone', email:'invEmail' };
        field(map[k]).classList.add('bad');
      });
      err.textContent = form.getAttribute('data-err-required') || 'Tous les champs sont requis.';
      return;
    }
    if(payload.email.indexOf('@') < 1){
      field('invEmail').classList.add('bad');
      err.textContent = form.getAttribute('data-err-email') || 'Courriel invalide.';
      return;
    }

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
      if(!res.ok){
        err.textContent = data.error || (form.getAttribute('data-err-generic') || 'Un problème est survenu.');
        btn.disabled = false;
        btn.classList.remove('is-sending');
        btn.removeAttribute('aria-busy');
        btnCopy.textContent = label;
        busy = false;
        return;
      }
      if(data.message && doneText) doneText.textContent = data.message;
      btn.classList.remove('is-sending');
      btn.classList.add('is-sealed');
      btn.removeAttribute('aria-busy');
      btnCopy.textContent = btn.getAttribute('data-sent') || 'Demande transmise';
      panel.classList.add('is-sealing');

      var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(function(){
        form.hidden = true;
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
