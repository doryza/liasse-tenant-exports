(function(){
  var VV = window.VV || { profile: {}, published: false, active: false, live: false };
  var profile = VV.profile || {};
  function $(id){ return document.getElementById(id); }
  function on(el, ev, fn){ if(el) el.addEventListener(ev, fn); }

  // ── Tabs
  var tabs = document.querySelectorAll('.esp-tab');
  var panels = document.querySelectorAll('.esp-panel');
  function show(name){
    tabs.forEach(function(t){ t.classList.toggle('is-on', t.getAttribute('data-tab') === name); });
    panels.forEach(function(p){ p.classList.toggle('is-on', p.getAttribute('data-panel') === name); });
  }
  tabs.forEach(function(t){ on(t, 'click', function(){ show(t.getAttribute('data-tab')); }); });
  document.querySelectorAll('[data-goto]').forEach(function(b){
    on(b, 'click', function(){ show(b.getAttribute('data-goto')); });
  });

  // ── Repeatable rows (links + testimonials)
  function rowInput(ph, val, key){
    var i = document.createElement('input');
    i.placeholder = ph; i.value = val || ''; i.setAttribute('data-f', key);
    return i;
  }
  function buildRow(container, fields, values){
    var row = document.createElement('div');
    row.className = 'esp-link-row';
    fields.forEach(function(f){ row.appendChild(rowInput(f.ph, (values || {})[f.key], f.key)); });
    var del = document.createElement('button');
    del.type = 'button'; del.className = 'esp-x'; del.setAttribute('aria-label', 'Retirer'); del.innerHTML = '&times;';
    on(del, 'click', function(){ row.remove(); });
    row.appendChild(del);
    container.appendChild(row);
  }
  var LINK_F = [{ key: 'label', ph: 'Libellé (ex. Instagram)' }, { key: 'url', ph: 'https://…' }];
  var TM_F = [{ key: 'author', ph: 'Nom' }, { key: 'neighborhood', ph: 'Secteur' }, { key: 'quote', ph: 'Témoignage' }, { key: 'sale_result', ph: 'Résultat' }];
  var linkList = $('linkList'), tmList = $('tmList');
  (profile.links || []).forEach(function(l){ buildRow(linkList, LINK_F, l); });
  (profile.testimonials || []).forEach(function(x){ buildRow(tmList, TM_F, x); });
  on($('addLink'), 'click', function(){ buildRow(linkList, LINK_F, {}); });
  on($('addTm'), 'click', function(){ buildRow(tmList, TM_F, {}); });

  function readRows(container, fields){
    return Array.prototype.map.call(container.querySelectorAll('.esp-link-row'), function(row){
      var o = {};
      fields.forEach(function(f){
        var el = row.querySelector('[data-f="' + f.key + '"]');
        o[f.key] = el ? el.value.trim() : '';
      });
      return o;
    });
  }

  // ── Save profile
  on($('saveBtn'), 'click', async function(){
    var btn = $('saveBtn'), flag = $('savedFlag');
    var payload = {};
    document.querySelectorAll('[data-k]').forEach(function(el){ payload[el.getAttribute('data-k')] = el.value.trim(); });
    payload.links = readRows(linkList, LINK_F).filter(function(l){ return l.label && l.url; });
    payload.testimonials = readRows(tmList, TM_F).filter(function(x){ return x.author && x.quote; });
    btn.disabled = true; flag.textContent = 'Enregistrement…';
    try{
      var r = await fetch('api/espace/profil', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      flag.textContent = r.ok ? 'Enregistré ✓' : 'Échec de l’enregistrement';
      if (r.ok) { var d = await r.json(); if (d.profile) profile = d.profile; }
    }catch(_){ flag.textContent = 'Échec de l’enregistrement'; }
    btn.disabled = false;
    setTimeout(function(){ flag.textContent = ''; }, 3200);
  });

  // ── Photo upload
  on($('photoInput'), 'change', function(e){
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var hint = $('photoHint');
    if (file.size > 8 * 1024 * 1024) { hint.textContent = 'Image trop lourde (8 Mo max).'; return; }
    hint.textContent = 'Téléversement…';
    var reader = new FileReader();
    reader.onload = async function(){
      try{
        var r = await fetch('api/espace/photo', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result })
        });
        var d = await r.json().catch(function(){ return {}; });
        if (r.ok && d.url) {
          var img = $('portraitImg'); img.src = d.url; img.hidden = false;
          var empty = $('portraitEmpty'); if (empty) empty.remove();
          hint.textContent = 'Photo mise à jour ✓';
        } else { hint.textContent = 'Téléversement refusé.'; }
      }catch(_){ hint.textContent = 'Téléversement refusé.'; }
    };
    reader.readAsDataURL(file);
  });

  // ── Publish toggle
  on($('pubBtn'), 'click', async function(){
    var btn = $('pubBtn');
    var next = btn.getAttribute('data-published') !== '1';
    btn.disabled = true;
    try{
      var r = await fetch('api/espace/publier', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next })
      });
      if (r.ok) { location.reload(); return; }
      var d = await r.json().catch(function(){ return {}; });
      if (d.code === 'PAYMENT_REQUIRED') show('abonnement');
    }catch(_){}
    btn.disabled = false;
  });

  // ── Subscribe / cancel
  on($('subBtn'), 'click', async function(){
    var btn = $('subBtn'), err = $('billError');
    btn.disabled = true; err.textContent = '';
    try{
      var r = await fetch('api/espace/abonnement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      var d = await r.json().catch(function(){ return {}; });
      if (r.ok && d.approveUrl) { window.location.href = d.approveUrl; return; }
      err.textContent = d.code === 'NOT_CONFIGURED'
        ? 'Le paiement n’est pas encore ouvert. Écrivez-nous et nous activons votre page manuellement.'
        : 'Impossible d’ouvrir le paiement. Réessayez dans un instant.';
    }catch(_){ err.textContent = 'Impossible d’ouvrir le paiement.'; }
    btn.disabled = false;
  });

  var cancelArmed = false;
  on($('cancelBtn'), 'click', async function(){
    var btn = $('cancelBtn');
    if (!cancelArmed) { cancelArmed = true; btn.textContent = 'Confirmer l’annulation'; return; }
    btn.disabled = true;
    try{
      var r = await fetch('api/espace/abonnement/annuler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (r.ok) { location.reload(); return; }
    }catch(_){}
    btn.disabled = false;
  });

  // ── Laser-precision Canada Post campaign calculator + request
  var mailQuantity = $('mailQuantity');
  var mailEstimate = $('mailEstimate');
  function updateMailEstimate(){
    if (!mailQuantity || !mailEstimate) return;
    var quantity = Math.max(0, Math.floor(Number(mailQuantity.value) || 0));
    mailEstimate.textContent = (quantity * 1.59).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';
  }
  on(mailQuantity, 'input', updateMailEstimate);
  updateMailEstimate();

  on($('mailCampaignForm'), 'submit', async function(e){
    e.preventDefault();
    var btn = $('mailCampaignBtn'), err = $('mailCampaignError'), success = $('mailCampaignSuccess');
    var quantity = Math.floor(Number(mailQuantity && mailQuantity.value));
    var sector = $('mailSector') ? $('mailSector').value.trim() : '';
    var notes = $('mailNotes') ? $('mailNotes').value.trim() : '';
    err.textContent = ''; success.textContent = '';
    if (!VV.live) { err.textContent = 'Publiez d’abord votre page afin que le code QR mène à une page active.'; return; }
    if (!Number.isFinite(quantity) || quantity < 300) { err.textContent = 'Le minimum est de 300 adresses.'; return; }
    if (!sector) { err.textContent = 'Indiquez le secteur que vous souhaitez cibler.'; return; }
    btn.disabled = true; btn.textContent = 'Transmission…';
    try{
      var r = await fetch('api/espace/campagne-postale', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: quantity, sector: sector, notes: notes })
      });
      var d = await r.json().catch(function(){ return {}; });
      if (r.ok) {
        success.textContent = 'Demande reçue ✓ Nous vous contacterons pour valider le ciblage et le dépôt postal.';
        btn.textContent = 'Demande transmise';
        return;
      }
      err.textContent = d.code === 'PAGE_NOT_LIVE'
        ? 'Publiez d’abord votre page afin que le code QR mène à une page active.'
        : (d.code === 'MINIMUM_300' ? 'Le minimum est de 300 adresses.' : 'Impossible de transmettre la demande. Réessayez.');
    }catch(_){ err.textContent = 'Impossible de transmettre la demande. Réessayez.'; }
    btn.disabled = false; btn.textContent = 'Demander ma campagne ciblée';
  });

  // ── Lead status + notes (debounced autosave)
  function saveLead(id, body){
    return fetch('api/espace/leads/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
  }
  document.querySelectorAll('.esp-lead-status').forEach(function(sel){
    on(sel, 'change', function(){ saveLead(sel.getAttribute('data-id'), { status: sel.value }); });
  });
  document.querySelectorAll('.esp-lead-notes').forEach(function(ta){
    var timer = null;
    on(ta, 'input', function(){
      clearTimeout(timer);
      timer = setTimeout(function(){ saveLead(ta.getAttribute('data-id'), { notes: ta.value }); }, 700);
    });
  });
})();
