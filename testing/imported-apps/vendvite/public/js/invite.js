(function(){
  var form = document.getElementById('invForm');
  if(!form) return;
  var btn = document.getElementById('invSubmit');
  var err = document.getElementById('invError');
  var panel = document.getElementById('invPanel');
  var done = document.getElementById('invDone');
  var doneText = document.getElementById('invDoneText');
  var busy = false;

  function field(id){ return document.getElementById(id); }
  function clearBad(){ ['invName','invAgency','invPhone','invEmail'].forEach(function(id){ field(id).classList.remove('bad'); }); }

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
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = btn.getAttribute('data-sending') || '…';
    try{
      var res = await fetch('api/courtier/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await res.json().catch(function(){ return {}; });
      if(!res.ok){
        err.textContent = data.error || (form.getAttribute('data-err-generic') || 'Un problème est survenu.');
        btn.disabled = false; btn.textContent = label; busy = false;
        return;
      }
      if(data.message && doneText) doneText.textContent = data.message;
      form.hidden = true;
      done.hidden = false;
      panel.querySelector('.inv-panel-title').hidden = true;
      panel.querySelector('.inv-panel-sub').hidden = true;
    }catch(_){
      err.textContent = form.getAttribute('data-err-generic') || 'Un problème est survenu.';
      btn.disabled = false; btn.textContent = label; busy = false;
    }
  });
})();
