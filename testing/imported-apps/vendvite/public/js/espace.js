(function(){
  var VV = window.VV || { profile: {}, published: false, active: false, live: false };
  var profile = VV.profile || {};
  function $(id){ return document.getElementById(id); }
  // Textes traduits, rendus par le serveur selon la langue choisie.
  function T(k){ var d = window.VV_T || {}; return (d[k] != null) ? d[k] : ''; }
  function on(el, ev, fn){ if(el) el.addEventListener(ev, fn); }

  var dirty=false,editVersion=0,leadSaves={};
  function notice(message,reconnect){
    if($('workspaceNotice')){$('workspaceNotice').hidden=!message;$('workspaceNoticeText').textContent=message||'';$('workspaceReconnect').hidden=!reconnect;}
  }
  async function apiFetch(url,options,retried){
    options=options||{};
    var opts=Object.assign({},options,{headers:Object.assign({},options.headers||{}, {'X-VV-CSRF':VV.csrf||''})});
    var response=await fetch(url,opts);
    if(response.status===401)notice(T('ws_session_expired'),true);
    if(response.status===403 && !retried){
      // Signing in in another tab changes the cookie. Refresh only the CSRF
      // token, then replay a request that was rejected BEFORE any mutation.
      var body=await response.clone().json().catch(function(){return {};});
      if(body.code==='CSRF_INVALID'){
        var refresh=await fetch('api/espace/session');
        if(refresh.ok){var session=await refresh.json();VV.csrf=session.csrf;return apiFetch(url,options,true);}
        notice(T('ws_session_expired'),true);
      }
    }
    return response;
  }
  window.addEventListener('offline',function(){notice(T('ws_offline'));});
  window.addEventListener('online',function(){notice(T('ws_online'));});
  function hasUnsaved(){return dirty||Object.keys(leadSaves).some(function(k){var r=leadSaves[k];return r.pending||r.running||r.failed;});}
  window.addEventListener('beforeunload',function(e){if(hasUnsaved()){e.preventDefault();e.returnValue=T('ws_leave');}});
  function profileChanged(){if(!$('saveBtn'))return;dirty=true;editVersion++;$('savedFlag').textContent=T('ws_unsaved');$('savedFlag').classList.remove('is-error');}
  document.querySelectorAll('[data-k]').forEach(function(el){on(el,'input',profileChanged);});
  document.querySelectorAll('[data-signout]').forEach(function(btn){
    // Liasse auto-wires login keywords at document capture. Broker signout
    // belongs to this workspace; handle these marked controls one level earlier.
    window.addEventListener('click',async function(e){
      if(!e.target.closest || e.target.closest('[data-signout]')!==btn)return;
      e.preventDefault();e.stopImmediatePropagation();
      if(hasUnsaved()){notice(T('ws_leave'));return;}
      var all=btn.dataset.signout==='all';
      if(all && btn.dataset.armed!=='1'){btn.dataset.armed='1';btn.textContent=T('ws_logout_confirm');return;}
      btn.disabled=true;
      try{var r=await apiFetch('api/espace/deconnexion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({all:all})});if(r.ok){location.href=(await r.json()).redirect;return;}notice(T('ws_retry'));}catch(e){notice(T('ws_retry'));}
      btn.disabled=false;
    },true);
  });
  on($('copyPageLink'),'click',async function(){try{await navigator.clipboard.writeText($('copyPageLink').dataset.url);$('copyPageLink').textContent=T('ws_copied');}catch(e){notice(T('ws_retry'));}});

  // ── Repeatable rows (links + testimonials)
  function rowInput(ph, val, key){
    var i = document.createElement('input');
    i.placeholder = ph; i.value = val || ''; i.setAttribute('data-f', key);
    return i;
  }
  function buildRow(container, fields, values){
    var row = document.createElement('div');
    row.className = 'esp-link-row';
    row.addEventListener('input',profileChanged);
    fields.forEach(function(f){ row.appendChild(rowInput(f.ph, (values || {})[f.key], f.key)); });
    var del = document.createElement('button');
    del.type = 'button'; del.className = 'esp-x'; del.setAttribute('aria-label', 'Retirer'); del.innerHTML = '&times;';
    on(del, 'click', function(){ row.remove();profileChanged(); });
    row.appendChild(del);
    container.appendChild(row);
  }
  var LINK_F = [{ key: 'label', ph: T('esp_social_link_label_placeholder') }, { key: 'url', ph: 'https://…' }];
  var TM_F = [{ key: 'author', ph: T('esp_tm_author_ph') }, { key: 'neighborhood', ph: T('esp_tm_area_ph') }, { key: 'quote', ph: T('esp_tm_quote_ph') }, { key: 'sale_result', ph: T('esp_tm_result_ph') }];
  var linkList = $('linkList'), tmList = $('tmList');
  if (linkList) (profile.links || []).forEach(function(l){ buildRow(linkList, LINK_F, l); });
  if (tmList) (profile.testimonials || []).forEach(function(x){ buildRow(tmList, TM_F, x); });
  on($('addLink'), 'click', function(){ buildRow(linkList, LINK_F, {});profileChanged(); });
  on($('addTm'), 'click', function(){ buildRow(tmList, TM_F, {});profileChanged(); });

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

  // Save is explicit and versioned. A second tab can never silently win.
  var savePromise=null;
  async function saveProfile(){
    if(savePromise)return savePromise;
    if(!$('saveBtn'))return true;
    savePromise=(async function(){
      var btn=$('saveBtn'),flag=$('savedFlag'),snapshot=editVersion;
      var payload={profileVersion:VV.profileVersion};
      document.querySelectorAll('[data-k]').forEach(function(el){payload[el.dataset.k]=el.value.trim();});
      payload.links=readRows(linkList,LINK_F).filter(function(l){return l.label||l.url;});
      payload.testimonials=readRows(tmList,TM_F).filter(function(x){return x.author||x.quote;});
      btn.disabled=true;flag.textContent=T('ws_saving');flag.classList.remove('is-error');
      try{
        var r=await apiFetch('api/espace/profil',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        var d=await r.json().catch(function(){return {};});
        if(!r.ok){flag.textContent=d.code==='PROFILE_CONFLICT'?T('ws_conflict'):(d.error||T('ws_save_retry'));flag.classList.add('is-error');return false;}
        VV.profileVersion=d.profileVersion;profile=d.profile;dirty=editVersion!==snapshot;
        flag.textContent=dirty?T('ws_unsaved'):T('ws_saved');return !dirty;
      }catch(e){flag.textContent=T('ws_save_retry');flag.classList.add('is-error');return false;}
      finally{btn.disabled=false;}
    })();
    try{return await savePromise;}finally{savePromise=null;}
  }
  on($('saveBtn'),'click',function(){saveProfile();});
  on($('setupDoneBtn'),'click',async function(){
    var btn=$('setupDoneBtn'),err=$('setupDoneError');btn.disabled=true;err.textContent='';
    if(!await saveProfile()){err.textContent=T('ws_save_retry');btn.disabled=false;return;}
    try{
      var r=await apiFetch('api/espace/page-prete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profileVersion:VV.profileVersion})});
      var d=await r.json().catch(function(){return {};});
      if(r.ok){VV.profileVersion=d.profileVersion;if(dirty){err.textContent=T('ws_unsaved');btn.disabled=false;return;}location.href='espace';return;}
      err.textContent=d.code==='PROFILE_CONFLICT'?T('ws_conflict'):(d.error||T('ws_retry'));
    }catch(e){err.textContent=T('ws_retry');}
    btn.disabled=false;
  });

  // ── Photo upload
  on($('photoInput'), 'change', function(e){
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if(['image/png','image/jpeg','image/webp'].indexOf(file.type)===-1){$('photoHint').textContent=T('esp_upload_refused_error');return;}
    var hint = $('photoHint');
    if (file.size > 8 * 1024 * 1024) { hint.textContent = T('esp_photo_too_large_error'); return; }
    hint.textContent = T('esp_uploading_status');
    var reader = new FileReader();
    reader.onload = async function(){
      try{
        var r = await apiFetch('api/espace/photo', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result,profileVersion:VV.profileVersion })
        });
        var d = await r.json().catch(function(){ return {}; });
        if (r.ok && d.url) {
          VV.profileVersion=d.profileVersion;
          var img = $('portraitImg'), empty = $('portraitEmpty');
          img.onload = function(){ img.hidden = false; if (empty) empty.hidden = true; };
          img.onerror = function(){ img.hidden = true; if (empty) empty.hidden = false; };
          img.src = d.url;
          hint.textContent = T('esp_photo_updated_toast');
        } else { hint.textContent = d.code==='PROFILE_CONFLICT'?T('ws_conflict'):T('esp_upload_refused_error'); }
      }catch(_){ hint.textContent = T('esp_upload_refused_error'); }
    };
    reader.readAsDataURL(file);
  });

  // ── Publish toggle
  on($('pubBtn'), 'click', async function(){
    var btn = $('pubBtn');
    if(dirty && !await saveProfile())return;
    var next = btn.getAttribute('data-published') !== '1';
    btn.disabled = true;
    try{
      var r = await apiFetch('api/espace/publier', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next })
      });
      if (r.ok) { location.reload(); return; }
      var d = await r.json().catch(function(){ return {}; });
      if (d.code === 'PAYMENT_REQUIRED') window.location.href = 'espace/abonnement';
      else notice(T('ws_retry'));
    }catch(_){notice(T('ws_retry'));}
    btn.disabled = false;
  });

  // ── Subscribe / cancel
  on($('subBtn'), 'click', async function(){
    var btn = $('subBtn'), err = $('billError');
    btn.disabled = true; err.textContent = '';
    try{
      var r = await apiFetch('api/espace/abonnement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      var d = await r.json().catch(function(){ return {}; });
      if (r.ok && d.approveUrl) { window.location.href = d.approveUrl; return; }
      err.textContent = d.code === 'SETUP_REQUIRED'
        ? T('esp_setup_required_error')
        : d.code === 'NOT_CONFIGURED'
          ? T('esp_payment_not_open_contact_us')
          : T('esp_payment_open_failed_retry');
    }catch(_){ err.textContent = T('esp_payment_open_failed'); }
    btn.disabled = false;
  });

  var cancelArmed = false;
  on($('cancelBtn'), 'click', async function(){
    var btn = $('cancelBtn');
    if (!cancelArmed) { cancelArmed = true; btn.textContent = T('esp_confirm_cancellation_button'); return; }
    btn.disabled = true;
    try{
      var r = await apiFetch('api/espace/abonnement/annuler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (r.ok) { location.reload(); return; }
      notice(T('ws_retry'));
    }catch(_){notice(T('ws_retry'));}
    btn.disabled = false;
  });

  // Serialize saves per lead so a slow response cannot overwrite newer notes.
  function leadRecord(id){return leadSaves[id]||(leadSaves[id]={pending:false,running:false,failed:false,timer:null});}
  async function flushLead(id){
    var record=leadRecord(id);if(record.running)return;
    var article=document.querySelector('.esp-lead[data-id="'+id+'"]'),flag=article.querySelector('[data-lead-save]'),retry=article.querySelector('[data-lead-retry]');
    record.running=true;record.failed=false;retry.hidden=true;
    while(record.pending){
      record.pending=false;flag.textContent=T('ws_saving');flag.className='';
      var payload={status:article.querySelector('.esp-lead-status').value,notes:article.querySelector('.esp-lead-notes').value};
      try{
        var r=await apiFetch('api/espace/leads/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        if(!r.ok)throw Error('save');
        flag.textContent=T('ws_saved');
      }catch(e){record.failed=true;record.pending=true;flag.textContent=T('ws_save_retry');flag.className='is-error';retry.hidden=false;break;}
    }
    record.running=false;
  }
  function queueLead(id,delay){var r=leadRecord(id);r.pending=true;clearTimeout(r.timer);r.timer=setTimeout(function(){flushLead(id);},delay);}
  document.querySelectorAll('.esp-lead-status').forEach(function(el){on(el,'change',function(){queueLead(el.dataset.id,0);filterLeads();});});
  document.querySelectorAll('.esp-lead-notes').forEach(function(el){on(el,'input',function(){queueLead(el.dataset.id,700);document.querySelector('[data-lead-save="'+el.dataset.id+'"]').textContent=T('ws_unsaved');});});
  document.querySelectorAll('[data-lead-retry]').forEach(function(btn){on(btn,'click',function(){queueLead(btn.dataset.leadRetry,0);});});
  function filterLeads(){
    if(!$('leadSearch'))return;
    var search=$('leadSearch').value.trim().toLocaleLowerCase(),status=$('leadFilter').value,visible=0;
    document.querySelectorAll('.esp-lead').forEach(function(article){var match=(!search||article.textContent.toLocaleLowerCase().includes(search))&&(!status||article.querySelector('.esp-lead-status').value===status);article.hidden=!match;if(match)visible++;});
    $('leadNoMatches').hidden=visible>0;
  }
  on($('leadSearch'),'input',filterLeads);on($('leadFilter'),'change',filterLeads);

  // These are now distinct pages. Keep the costly map and territory workflow
  // off the profile, leads and subscription pages.
  if (!$('campQte')) return;

  // ── Campagne « 150 portes » ────────────────────────────────────────────────
  //    Tout le travail cartographique se fait ICI, dans le navigateur du
  //    courtier : Nominatim et Overpass acceptent tous deux le CORS. Passer par
  //    le serveur ferait porter a une seule IP partagee par toute la flotte les
  //    deux creneaux qu'Overpass accorde, et depasserait le plafond d'origine.
  var CAMP = window.VV_CAMP || { cible: 150, restantes: 0 };
  var OVERPASS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.private.coffee/api/interpreter'
  ];
  var LADDER = [400, 800, 1500, 3000, 5000];
  var CLES_COMMERCE = ['shop', 'office', 'amenity', 'tourism', 'craft', 'healthcare', 'leisure', 'club'];
  var BATIS_NON_RESIDENTIELS = ['commercial', 'retail', 'industrial', 'office', 'church', 'chapel', 'school',
    'university', 'hospital', 'warehouse', 'public', 'civic', 'hotel', 'kindergarten', 'government',
    'sports_centre', 'stadium', 'train_station', 'fire_station'];

  var campCentre = null, campAdresses = [], campRayon = 0, campVille = '', campRepriseId = 0;
  var campCarte = null, campCouche = null, campTuiles = null;
  var campCarteJeton = 0, campCarteObserver = null, campCarteReveil = null;

  // ── Persistance locale ─────────────────────────────────────────────────────
  //    Un aller-retour vers PayPal, un rafraichissement ou un onglet ferme ne
  //    doivent jamais coûter un nouveau balayage : Overpass est lent et faillible.
  //    Tout vit dans le navigateur du courtier, rien de sensible.
  var CLE = 'vv_camp_' + (CAMP.id || 'x');
  var CLE_RUNGS = CLE + '_rungs';
  var TTL_MS = 24 * 3600 * 1000;

  function lire(cle){
    try{
      var brut = window.localStorage.getItem(cle);
      if (!brut) return null;
      var o = JSON.parse(brut);
      if (!o || !o.ts || (Date.now() - o.ts) > TTL_MS) { window.localStorage.removeItem(cle); return null; }
      return o;
    }catch(_){ return null; }
  }
  function ecrire(cle, o){
    try{
      o.ts = Date.now();
      window.localStorage.setItem(cle, JSON.stringify(o));
    }catch(_){ /* quota plein ou stockage refuse : on continue sans filet */ }
  }
  function oublier(){
    try{ window.localStorage.removeItem(CLE); window.localStorage.removeItem(CLE_RUNGS); }catch(_){ }
  }

  function sauverTerritoire(){
    if (!campCentre || !campAdresses.length) return;
    ecrire(CLE, {
      centre: campCentre, quantite: campQuantite, rayon: campRayon, ville: campVille, reprise: campRepriseId,
      total: Number(($('campTrouve') || {}).textContent || '0'.replace(/\s/g, '')) || campAdresses.length,
      adresses: campAdresses,
      notes: $('campNotes') ? $('campNotes').value : ''
    });
  }

  // Cache par palier de rayon : un balayage interrompu reprend aux rangs deja
  // obtenus au lieu de tout redemander a Overpass.
  function cleRung(lat, lng, r){ return lat.toFixed(5) + '|' + lng.toFixed(5) + '|' + r; }
  function lireRung(lat, lng, r){
    var tout = lire(CLE_RUNGS);
    if (!tout || !tout.rungs) return null;
    return tout.rungs[cleRung(lat, lng, r)] || null;
  }
  function ecrireRung(lat, lng, r, liste){
    var tout = lire(CLE_RUNGS) || { rungs: {} };
    tout.rungs = tout.rungs || {};
    // On ne garde que l'essentiel : une liste de 1 200 adresses tient largement,
    // mais inutile d'empiler tous les rangs de toutes les recherches.
    var cles = Object.keys(tout.rungs);
    if (cles.length > 6) delete tout.rungs[cles[0]];
    tout.rungs[cleRung(lat, lng, r)] = liste;
    ecrire(CLE_RUNGS, tout);
  }

  function metres(lat1, lng1, lat2, lng2){
    var R = 6371000, t = Math.PI / 180;
    var dLat = (lat2 - lat1) * t, dLng = (lng2 - lng1) * t;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(lat1 * t) * Math.cos(lat2 * t) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function nb(n){ return Number(n).toLocaleString('fr-CA'); }
  function etat(msg){ var el = $('campEtat'); if (el) el.textContent = msg || ''; }

  function estResidentiel(t){
    for (var i = 0; i < CLES_COMMERCE.length; i++) if (t[CLES_COMMERCE[i]]) return false;
    return BATIS_NON_RESIDENTIELS.indexOf(t.building) === -1;
  }

  // Overpass tombe souvent (30 a 60 % des tentatives) : on alterne les miroirs.
  async function overpass(requete, etiquette){
    for (var tour = 0; tour < 4; tour++) {
      var url = OVERPASS[tour % OVERPASS.length];
      try{
        var r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'data=' + encodeURIComponent(requete)
        });
        var txt = await r.text();
        if (txt.charAt(0) === '{') return JSON.parse(txt);
      }catch(_){ /* miroir injoignable — on essaie le suivant */ }
      if (tour < 3) etat(T('esp_map_service_busy_retry_prefix') + (tour + 2) + '/4)…');
      await new Promise(function(ok){ setTimeout(ok, 1500); });
    }
    throw new Error('overpass');
  }

  // OpenStreetMap stocke une grande partie des banlieues quebecoises sous forme
  // de PLAGES (« 1050 a 1120, pairs ») et non de points. Sans cette expansion,
  // un quartier parait vingt fois plus vide qu'il ne l'est.
  function etendrePlages(elements){
    var noeuds = {}, out = [];
    elements.forEach(function(e){ if (e.type === 'node') noeuds[e.id] = e; });
    elements.forEach(function(w){
      if (w.type !== 'way' || !w.tags || !w.tags['addr:interpolation'] || !w.nodes) return;
      var mode = w.tags['addr:interpolation'];
      var pas = mode === 'all' ? 1 : (parseInt(mode, 10) || 2);
      var bornes = w.nodes.map(function(id){ return noeuds[id]; })
        .filter(function(n){ return n && n.tags && n.tags['addr:housenumber']; });
      for (var k = 0; k + 1 < bornes.length; k++) {
        var a = bornes[k], b = bornes[k + 1];
        var na = parseInt(a.tags['addr:housenumber'], 10), nbb = parseInt(b.tags['addr:housenumber'], 10);
        if (isNaN(na) || isNaN(nbb)) continue;
        var bas = Math.min(na, nbb), haut = Math.max(na, nbb), etendue = haut - bas;
        if (etendue / pas > 400) continue;
        var de = na <= nbb ? a : b, vers = na <= nbb ? b : a;
        var rue = a.tags['addr:street'] || b.tags['addr:street'] || w.tags['addr:street'] || '';
        var ville = a.tags['addr:city'] || b.tags['addr:city'] || '';
        for (var n = bas; n <= haut; n += pas) {
          var f = etendue ? (n - bas) / etendue : 0;
          out.push({
            numero: String(n), rue: rue, ville: ville, source: 'interpole',
            lat: de.lat + (vers.lat - de.lat) * f,
            lng: de.lon + (vers.lon - de.lon) * f
          });
        }
      }
    });
    return out;
  }

  function pointsAdresses(elements){
    var out = [];
    elements.forEach(function(e){
      var t = e.tags || {};
      if (!t['addr:housenumber']) return;
      var lat = e.lat != null ? e.lat : (e.center && e.center.lat);
      var lng = e.lon != null ? e.lon : (e.center && e.center.lon);
      if (lat == null || !estResidentiel(t)) return;
      out.push({
        numero: t['addr:housenumber'], rue: t['addr:street'] || '', ville: t['addr:city'] || '',
        source: 'point', lat: lat, lng: lng
      });
    });
    return out;
  }

  async function balayer(lat, lng, cible){
    for (var i = 0; i < LADDER.length; i++) {
      var r = LADDER[i];
      var deja = lireRung(lat, lng, r);
      if (deja && deja.length) {
        etat(T('esp_sweep_resume_prefix') + (r >= 1000 ? (r / 1000) + ' km' : r + ' m') + '…');
        if (deja.length >= cible || i === LADDER.length - 1) return { liste: deja, rayon: r, total: deja.length };
        continue;
      }
      etat(T('esp_sweep_area_start_prefix') + (r >= 1000 ? (r / 1000) + ' km' : r + ' m') + '…');
      var j = await overpass('[out:json][timeout:60];('
        + 'node(around:' + r + ',' + lat + ',' + lng + ')["addr:housenumber"];'
        + 'way(around:' + r + ',' + lat + ',' + lng + ')["addr:housenumber"];'
        + 'way(around:' + r + ',' + lat + ',' + lng + ')["addr:interpolation"];'
        + ');(._;>;);out body center;', 'r' + r);

      var brut = pointsAdresses(j.elements || []).concat(etendrePlages(j.elements || []));
      var vues = Object.create(null), liste = [];
      brut.forEach(function(a){
        if (!a.numero || !a.rue) return;
        var cle = (a.numero + '|' + a.rue).toLowerCase();
        var deja = vues[cle];
        if (deja && !(deja.source === 'interpole' && a.source === 'point')) return;
        a.metres = Math.round(metres(lat, lng, a.lat, a.lng));
        if (deja) { liste[deja.i] = a; a.i = deja.i; vues[cle] = a; return; }
        a.i = liste.length; vues[cle] = a; liste.push(a);
      });
      liste.sort(function(x, y){ return x.metres - y.metres; });
      ecrireRung(lat, lng, r, liste);
      if (liste.length >= cible || i === LADDER.length - 1) return { liste: liste, rayon: r, total: liste.length };
    }
    return { liste: [], rayon: 0, total: 0 };
  }

  function coordValide(p){
    if (!p || !isFinite(Number(p.lat)) || !isFinite(Number(p.lng))) return false;
    return Math.abs(Number(p.lat)) <= 90 && Math.abs(Number(p.lng)) <= 180;
  }

  // A map must never become a blank rectangle just because Leaflet, its CSS,
  // or the remote tile server is unavailable. This dependency-free SVG keeps
  // the selected territory legible in every browser and network state.
  function dessinerCarteSecours(boite){
    if (!boite || !coordValide(campCentre)) return;
    if (campCarte) {
      try { campCarte.remove(); } catch(_){ }
      campCarte = null; campCouche = null; campTuiles = null;
    }
    boite.innerHTML = '';
    boite.classList.add('is-fallback');
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 1000 600');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    var defs = document.createElementNS(ns, 'defs');
    var pattern = document.createElementNS(ns, 'pattern');
    pattern.setAttribute('id', 'campGrid'); pattern.setAttribute('width', '62'); pattern.setAttribute('height', '62'); pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    var gridPath = document.createElementNS(ns, 'path');
    gridPath.setAttribute('d', 'M 62 0 L 0 0 0 62'); gridPath.setAttribute('fill', 'none'); gridPath.setAttribute('stroke', 'rgba(199,154,91,.12)'); gridPath.setAttribute('stroke-width', '1');
    pattern.appendChild(gridPath); defs.appendChild(pattern); svg.appendChild(defs);
    var fond = document.createElementNS(ns, 'rect');
    fond.setAttribute('width', '1000'); fond.setAttribute('height', '600'); fond.setAttribute('fill', 'url(#campGrid)'); svg.appendChild(fond);

    var valides = campAdresses.filter(coordValide).concat([campCentre]);
    var lats = valides.map(function(p){ return Number(p.lat); });
    var lngs = valides.map(function(p){ return Number(p.lng); });
    var minLat = Math.min.apply(Math, lats), maxLat = Math.max.apply(Math, lats);
    var minLng = Math.min.apply(Math, lngs), maxLng = Math.max.apply(Math, lngs);
    if (maxLat === minLat) { maxLat += .001; minLat -= .001; }
    if (maxLng === minLng) { maxLng += .001; minLng -= .001; }
    function xy(p){
      return {
        x: 55 + ((Number(p.lng) - minLng) / (maxLng - minLng)) * 890,
        y: 545 - ((Number(p.lat) - minLat) / (maxLat - minLat)) * 490
      };
    }
    campAdresses.filter(coordValide).forEach(function(a){
      var p = xy(a), point = document.createElementNS(ns, 'circle');
      point.setAttribute('cx', p.x.toFixed(1)); point.setAttribute('cy', p.y.toFixed(1)); point.setAttribute('r', '5');
      point.setAttribute('fill', '#e30b2d'); point.setAttribute('fill-opacity', '.72'); svg.appendChild(point);
    });
    var c = xy(campCentre), halo = document.createElementNS(ns, 'circle');
    halo.setAttribute('cx', c.x.toFixed(1)); halo.setAttribute('cy', c.y.toFixed(1)); halo.setAttribute('r', '19');
    halo.setAttribute('fill', '#c79a5b'); halo.setAttribute('fill-opacity', '.22'); halo.setAttribute('stroke', '#c79a5b'); halo.setAttribute('stroke-width', '3'); svg.appendChild(halo);
    var centre = document.createElementNS(ns, 'circle');
    centre.setAttribute('cx', c.x.toFixed(1)); centre.setAttribute('cy', c.y.toFixed(1)); centre.setAttribute('r', '7'); centre.setAttribute('fill', '#f5efe6'); svg.appendChild(centre);
    boite.appendChild(svg);
    var legende = document.createElement('div'); legende.className = 'camp-map-fallback-label';
    var titre = document.createElement('strong'); titre.textContent = T('esp_map_fallback_title');
    var note = document.createElement('span'); note.textContent = T('esp_map_fallback_note');
    legende.appendChild(titre); legende.appendChild(note); boite.appendChild(legende);
  }

  function reveillerCarte(){
    clearTimeout(campCarteReveil);
    campCarteReveil = setTimeout(function(){
      if (!campCentre) return;
      if (!campCarte) { dessinerCarte(); return; }
      try { campCarte.invalidateSize({ pan: false }); } catch(_){ }
    }, 80);
  }

  function dessinerCarteLeaflet(boite, jeton){
    if (jeton !== campCarteJeton || !window.L || !coordValide(campCentre)) return;
    try{
      boite.classList.remove('is-fallback');
      if (!campCarte) {
        boite.innerHTML = '';
        campCarte = window.L.map(boite, { scrollWheelZoom: false, attributionControl: true, zoomControl: true });
        var erreursTuiles = 0;
        campTuiles = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap', maxZoom: 19, crossOrigin: true
        });
        campTuiles.on('tileerror', function(){
          erreursTuiles++;
          if (erreursTuiles >= 3 && jeton === campCarteJeton && !boite.classList.contains('is-fallback')) dessinerCarteSecours(boite);
        });
        campTuiles.addTo(campCarte);
        if (window.ResizeObserver && !campCarteObserver) {
          campCarteObserver = new ResizeObserver(reveillerCarte);
          campCarteObserver.observe(boite);
        }
      }
      if (campCouche) campCarte.removeLayer(campCouche);
      campCouche = window.L.layerGroup().addTo(campCarte);
      campAdresses.filter(coordValide).forEach(function(a){
        window.L.marker([Number(a.lat), Number(a.lng)], {
          icon: window.L.divIcon({ className: 'camp-pin', html: '<i></i>', iconSize: [12, 12], iconAnchor: [6, 6] })
        }).bindTooltip(a.numero + ' ' + a.rue, { direction: 'top' }).addTo(campCouche);
      });
      window.L.marker([Number(campCentre.lat), Number(campCentre.lng)], {
        icon: window.L.divIcon({ className: 'camp-centre-pin', html: '<i></i>', iconSize: [22, 22], iconAnchor: [11, 11] }), zIndexOffset: 500
      }).addTo(campCouche);
      window.L.circle([Number(campCentre.lat), Number(campCentre.lng)], {
        radius: campAdresses.length ? Number(campAdresses[campAdresses.length - 1].metres) || 100 : 100,
        color: '#c8a44d', weight: 1, fillColor: '#c8a44d', fillOpacity: .07
      }).addTo(campCouche);
      var pts = campAdresses.filter(coordValide).map(function(a){ return [Number(a.lat), Number(a.lng)]; });
      pts.push([Number(campCentre.lat), Number(campCentre.lng)]);
      // The result panel has only just become visible. Size first, fit on the
      // next paint, then size once more after fonts/layout have settled.
      campCarte.invalidateSize({ pan: false });
      requestAnimationFrame(function(){
        if (!campCarte || jeton !== campCarteJeton) return;
        try { campCarte.fitBounds(window.L.latLngBounds(pts).pad(.12), { maxZoom: 17, animate: false }); } catch(_){ }
        setTimeout(function(){ if (campCarte) campCarte.invalidateSize({ pan: false }); }, 180);
      });
    }catch(_){ dessinerCarteSecours(boite); }
  }

  function dessinerCarte(){
    var boite = $('campCarte');
    if (!boite || !coordValide(campCentre)) return;
    var jeton = ++campCarteJeton;
    // A complete map immediately when the CDN is unavailable; if Leaflet is
    // present, upgrade it on the next paint after the hidden panel is revealed.
    if (!window.L) {
      dessinerCarteSecours(boite);
      // The CDN script is deferred and may finish after restored campaign data.
      // Keep the useful fallback visible, then upgrade in place if it arrives.
      [250, 1000, 2500, 8000].forEach(function(delai){
        setTimeout(function(){
          if (jeton === campCarteJeton && window.L) dessinerCarteLeaflet(boite, jeton);
        }, delai);
      });
      return;
    }
    requestAnimationFrame(function(){ dessinerCarteLeaflet(boite, jeton); });
  }

  function rendreListe(){
    var ul = $('campListe');
    if (!ul) return;
    ul.innerHTML = '';
    campAdresses.forEach(function(a){
      var li = document.createElement('li');
      li.innerHTML = '<span class="camp-d">' + a.metres + '&nbsp;m</span>'
        + '<span class="camp-a">' + a.numero + ' ' + a.rue + '</span>';
      ul.appendChild(li);
    });
    var rues = {};
    campAdresses.forEach(function(a){ rues[a.rue] = (rues[a.rue] || 0) + 1; });
    var tri = Object.keys(rues).sort(function(x, y){ return rues[y] - rues[x]; });
    var elRues = $('campRues');
    if (elRues) {
      elRues.innerHTML = tri.slice(0, 8).map(function(r){
        return '<span>' + r + ' <b>' + rues[r] + '</b></span>';
      }).join('');
    }
  }

  function compteur(el, vers){
    if (!el) return;
    // La vraie valeur d'abord : requestAnimationFrame ne se declenche pas dans
    // un onglet en arriere-plan, et un « 0 » fige serait pire qu'une absence
    // d'animation. L'animation ne fait que repasser par-dessus.
    el.textContent = nb(vers);
    var debut = 0, t0 = null, duree = 900;
    function pas(ts){
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / duree);
      el.textContent = nb(Math.round(debut + (vers - debut) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }

  function afficherTerritoire(total){
    if (!coordValide(campCentre) || !campAdresses.length) return;
    var res = $('campResultat');
    if (res) res.hidden = false;
    compteur($('campNombre'), campAdresses.length);
    var loin = Number(campAdresses[campAdresses.length - 1].metres) || 0;
    var elPortee = $('campPortee');
    if (elPortee) elPortee.textContent = loin < 1000 ? loin + ' m' : (loin / 1000).toFixed(1).replace('.', ',') + ' km';
    var elTrouve = $('campTrouve');
    if (elTrouve) elTrouve.textContent = nb(total || campAdresses.length);
    var elCentre = $('campCentreTxt');
    if (elCentre) elCentre.textContent = campCentre.libelle;
    rendreListe();
    dessinerCarte();
    var conf = $('campConfirmer');
    if (conf && (estIncluse() || CAMP.peutPayer)) { conf.disabled = false; conf.textContent = libelleBouton(); }
  }

  // Restaure le dernier territoire calcule : retour de PayPal, rafraichissement,
  // onglet rouvert. Aucun appel reseau, la carte se redessine telle quelle.
  function restaurerTerritoire(){
    var o = lire(CLE);
    if (!o || !coordValide(o.centre) || !Array.isArray(o.adresses)) return false;
    var adressesValides = o.adresses.filter(coordValide);
    if (!adressesValides.length) return false;
    campCentre = o.centre;
    campAdresses = adressesValides;
    campRayon = o.rayon || 0;
    campVille = o.ville || '';
    campQuantite = o.quantite || CAMP.cible;
    campRepriseId = Number(o.reprise) || 0;
    majQuantite();
    if (o.notes && $('campNotes')) $('campNotes').value = o.notes;
    if ($('campAdresse')) $('campAdresse').value = campCentre.libelle || '';
    afficherTerritoire(o.total);
    var el = $('campEtat');
    if (el) el.textContent = T('esp_territory_restored_prefix') + nb(campAdresses.length) + T('esp_territory_restored_suffix');
    return true;
  }

  async function chercherTerritoire(){
    var champ = $('campAdresse');
    var btn = $('campChercher');
    var err = $('campErreur');
    var res = $('campResultat');
    if (!champ || !champ.value.trim()) { if (err) err.textContent = T('esp_area_centre_address_hint'); return; }
    fermerApercuAbonnement();
    if (err) err.textContent = '';
    btn.disabled = true;
    var libelleBtn = btn.textContent;
    btn.textContent = T('esp_locating_short_status');
    if (res) res.hidden = true;
    etat(T('esp_locating_address_status'));
    try{
      var q = champ.value.trim();
      if (campChoisi && campChoisi.libelle === q) {
        // Suggestion retenue : Photon a deja rendu les coordonnees exactes.
        campCentre = { lat: campChoisi.lat, lng: campChoisi.lng, libelle: campChoisi.libelle };
      } else {
        var g = await fetch('https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ca&limit=1&q=' + encodeURIComponent(q));
        var hits = await g.json();
        if (!hits.length) throw new Error('geocode');
        var h = hits[0];
        campCentre = { lat: parseFloat(h.lat), lng: parseFloat(h.lon), libelle: h.display_name };
        campVille = (h.address && (h.address.city || h.address.town || h.address.village || h.address.municipality)) || '';
      }

      campRepriseId = 0;
      var out = await balayer(campCentre.lat, campCentre.lng, campQuantite);
      if (!out.total) {
        etat('');
        if (err) err.textContent = T('esp_osm_area_uncovered_error');
        btn.disabled = false; btn.textContent = libelleBtn;
        return;
      }
      campAdresses = out.liste.slice(0, campQuantite);
      campRayon = out.rayon;

      etat('');
      afficherTerritoire(out.total);
      sauverTerritoire();
    }catch(_){
      etat('');
      if (err) err.textContent = T('esp_map_service_no_response_error');
    }
    btn.disabled = false; btn.textContent = libelleBtn;
  }

  // ── Paliers de 150 : la premiere campagne est comprise dans la licence,
  //    les suivantes s'achetent au palier.
  var campQuantite = CAMP.cible, campSubOuvert = false;
  function palierPrix(q){
    var liste = CAMP.paliers || [];
    for (var i = 0; i < liste.length; i++) if (liste[i].quantite === q) return liste[i];
    return null;
  }
  // Incluse = rien a payer une fois le credit applique. Ce n'est plus lie a la
  // taille : 150 portes avec credit coutent 0, 450 portes avec credit coutent 300.
  function estIncluse(){
    var p = palierPrix(campQuantite);
    return p ? p.facturable <= 0 : (campQuantite === CAMP.cible && Number(CAMP.restantes) > 0);
  }
  function argent(cents){
    return (cents / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';
  }
  function majQuantite(){
    var el = $('campQte');
    if (el) el.textContent = nb(campQuantite);
    var prix = palierPrix(campQuantite);
    var box = $('campPrix');
    if (box) {
      if (estIncluse()) {
        box.innerHTML = T('esp_campaign_price_included_html');
      } else if (prix) {
        var detail = prix.offert > 0
          ? nb(prix.offert) + T('esp_qty_included_plus_prefix') + nb(prix.facturable) + T('esp_qty_at_price') + argent(prix.sousTotal) + T('esp_plus_taxes')
          : nb(campQuantite) + T('esp_qty_letters_separator') + argent(prix.sousTotal) + T('esp_plus_taxes');
        box.innerHTML = '<span class="camp-prix-n">' + argent(prix.total) + '</span>'
          + '<span class="camp-prix-l">' + detail + '</span>';
      }
    }
    var btn = $('campConfirmer');
    if (btn && !btn.disabled) btn.textContent = libelleBouton();
    var moins = $('campMoins'), plus = $('campPlus');
    if (moins) moins.disabled = campQuantite <= CAMP.palier;
    if (plus) plus.disabled = campQuantite >= CAMP.max;
  }
  function libelleBouton(){
    if (!CAMP.active) {
      return campSubOuvert
        ? T('esp_campaign_continue_paypal') + argent(Number(CAMP.subscriptionTotal) || 0) + T('esp_campaign_continue_annual_suffix')
        : T('esp_campaign_subscribe_launch_btn');
    }
    if (!CAMP.published && estIncluse()) return T('esp_campaign_publish_launch_btn');
    if (estIncluse()) return T('esp_confirm_launch_mailing_btn_js');
    var prix = palierPrix(campQuantite);
    return T(CAMP.published ? 'esp_campaign_pay_launch_prefix' : 'esp_campaign_publish_pay_launch_prefix')
      + (prix ? argent(prix.total) : '') + T('esp_campaign_pay_launch_suffix');
  }
  function fermerApercuAbonnement(){
    campSubOuvert = false;
    var apercu = $('campSubReveal'), btn = $('campConfirmer');
    if (apercu) apercu.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  function changerQuantite(delta){
    var vise = campQuantite + delta * CAMP.palier;
    if (vise < CAMP.palier || vise > CAMP.max) return;
    campQuantite = vise;
    fermerApercuAbonnement();
    // Le territoire deja affiche ne correspond plus au nombre demande.
    campAdresses = [];
    var res = $('campResultat');
    if (res) res.hidden = true;
    var btn = $('campConfirmer');
    if (btn) { btn.disabled = true; btn.textContent = libelleBouton(); }
    majQuantite();
  }
  on($('campMoins'), 'click', function(){ changerQuantite(-1); });
  on($('campPlus'), 'click', function(){ changerQuantite(1); });
  majQuantite();

  // ── Autocompletion d'adresse ───────────────────────────────────────────────
  //    Photon (OSM) plutot que Google Places : la plateforme facture un
  //    chargement de carte des que l'URL du SDK Google Maps apparait dans une
  //    reponse HTML, meme si personne n'ouvre l'onglet. Photon est libre, tolere
  //    les accents manquants et rend directement les coordonnees — choisir une
  //    suggestion evite donc l'appel de geocodage.
  var campChoisi = null;
  var acTimer = null, acIndex = -1, acItems = [];

  function acFermer(){
    var ul = $('campSuggest');
    if (ul) { ul.hidden = true; ul.innerHTML = ''; }
    var inp = $('campAdresse');
    if (inp) inp.setAttribute('aria-expanded', 'false');
    acIndex = -1; acItems = [];
  }
  function acLibelle(p){
    var rue = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');
    return [rue, p.city || p.county, p.postcode].filter(Boolean).join(', ');
  }
  function acChoisir(i){
    var it = acItems[i];
    if (!it) return;
    campChoisi = { lat: it.lat, lng: it.lng, libelle: it.libelle };
    var inp = $('campAdresse');
    if (inp) inp.value = it.libelle;
    campVille = it.ville || '';
    acFermer();
    chercherTerritoire();
  }
  function acRendre(list){
    var ul = $('campSuggest');
    if (!ul) return;
    acItems = list;
    if (!list.length) return acFermer();
    ul.innerHTML = '';
    list.forEach(function(it, i){
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.textContent = it.libelle;
      on(li, 'mousedown', function(e){ e.preventDefault(); acChoisir(i); });
      ul.appendChild(li);
    });
    ul.hidden = false;
    var inp = $('campAdresse');
    if (inp) inp.setAttribute('aria-expanded', 'true');
    acIndex = -1;
  }
  async function acChercher(q){
    // Biais vers le dernier territoire, sinon le sud du Quebec.
    var lat = (campCentre && campCentre.lat) || 45.7, lng = (campCentre && campCentre.lng) || -73.8;
    try{
      var r = await fetch('https://photon.komoot.io/api/?limit=5&lang=fr&lat=' + lat + '&lon=' + lng + '&q=' + encodeURIComponent(q));
      var j = await r.json();
      var vus = Object.create(null);
      var out = [];
      (j.features || []).forEach(function(f){
        var p = f.properties || {};
        if (p.countrycode && p.countrycode !== 'CA') return;
        var lib = acLibelle(p);
        if (!lib || vus[lib]) return;
        vus[lib] = 1;
        out.push({ libelle: lib, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], ville: p.city || p.county || '' });
      });
      acRendre(out);
    }catch(_){ acFermer(); }
  }

  on($('campAdresse'), 'input', function(){
    campChoisi = null;
    var q = $('campAdresse').value.trim();
    clearTimeout(acTimer);
    if (q.length < 4) return acFermer();
    acTimer = setTimeout(function(){ acChercher(q); }, 350);
  });
  on($('campAdresse'), 'blur', function(){ setTimeout(acFermer, 120); });
  on($('campAdresse'), 'keydown', function(e){
    var ul = $('campSuggest');
    var ouvert = ul && !ul.hidden && acItems.length;
    if (e.key === 'ArrowDown' && ouvert) {
      e.preventDefault(); acIndex = Math.min(acItems.length - 1, acIndex + 1);
    } else if (e.key === 'ArrowUp' && ouvert) {
      e.preventDefault(); acIndex = Math.max(0, acIndex - 1);
    } else if (e.key === 'Escape') {
      acFermer(); return;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (ouvert && acIndex >= 0) return acChoisir(acIndex);
      acFermer(); chercherTerritoire(); return;
    } else { return; }
    [].forEach.call(ul.children, function(li, i){ li.classList.toggle('is-on', i === acIndex); });
  });

  on($('campChercher'), 'click', function(){ acFermer(); chercherTerritoire(); });

  on($('campConfirmer'), 'click', async function(){
    var btn = $('campConfirmer'), err = $('campErreur'), ok = $('campSucces');
    if (!campCentre || !campAdresses.length) return;
    err.textContent = ''; ok.textContent = '';
    // Preserve the finished territory, reveal the exact annual commitment in
    // place, then open checkout only after a second, explicitly priced click.
    if (!CAMP.active) {
      sauverTerritoire();
      if (!campSubOuvert) {
        campSubOuvert = true;
        var apercu = $('campSubReveal');
        if (apercu) apercu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = libelleBouton();
        requestAnimationFrame(function(){ if (apercu) apercu.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
        return;
      }
      btn.disabled = true; btn.textContent = T('esp_campaign_subscribing');
      try{
        var rs = await apiFetch('api/espace/abonnement', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'campaign' })
        });
        var ds = await rs.json().catch(function(){ return {}; });
        if (rs.ok && ds.approveUrl) { window.location.href = ds.approveUrl; return; }
        err.textContent = ds.code === 'SETUP_REQUIRED'
          ? T('esp_setup_required_error')
          : ds.code === 'NOT_CONFIGURED'
            ? T('esp_payment_not_open_contact_us')
            : T('esp_payment_open_failed_retry');
      }catch(_){ err.textContent = T('esp_payment_open_failed'); }
      btn.disabled = false; btn.textContent = libelleBouton();
      return;
    }

    // The letter's QR must resolve on mailing day. Once subscribed, the same
    // explicit click publishes the personalized page before transmission.
    if (!CAMP.published) {
      btn.disabled = true; btn.textContent = T('esp_campaign_publishing_launch');
      try{
        var rp = await apiFetch('api/espace/publier', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: true })
        });
        if (!rp.ok) {
          var dpub = await rp.json().catch(function(){ return {}; });
          err.textContent = dpub.code === 'PAYMENT_REQUIRED' ? T('esp_activate_subscription_first') : T('esp_confirmation_failed_retry');
          btn.disabled = false; btn.textContent = libelleBouton();
          return;
        }
        CAMP.published = true;
      }catch(_){
        err.textContent = T('esp_confirmation_failed_retry');
        btn.disabled = false; btn.textContent = libelleBouton();
        return;
      }
    }
    var paye = !estIncluse();
    if (paye && !CAMP.peutPayer) {
      err.textContent = T('esp_payment_not_configured_manual');
      return;
    }
    btn.disabled = true; btn.textContent = paye ? T('esp_opening_paypal') : 'Transmission…';
    var charge = {
      centre: { libelle: campCentre.libelle, lat: campCentre.lat, lng: campCentre.lng },
      adresses: campAdresses.map(function(a){
        return { numero: a.numero, rue: a.rue, ville: a.ville, source: a.source, lat: a.lat, lng: a.lng, metres: a.metres };
      }),
      ville: campVille, rayon: campRayon,
      notes: $('campNotes') ? $('campNotes').value.trim() : ''
    };
    if (paye) {
      charge.quantite = campQuantite;
      // Sans cela, relancer un territoire recharge creerait une seconde ligne
      // identique dans l'historique a chaque aller-retour chez PayPal.
      if (campRepriseId) charge.reprend = campRepriseId;
    }
    try{
      var r = await apiFetch(paye ? 'api/espace/campagne/commander' : 'api/espace/campagne', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charge)
      });
      if (paye) {
        var dp = await r.json().catch(function(){ return {}; });
        if (r.ok && dp.approve) { window.location.href = dp.approve; return; }
        err.textContent =
          dp.code === 'COUNT_MISMATCH' ? T('esp_only_found_count_prefix') + nb(dp.trouvees || 0) + T('esp_addresses_of_requested_mid') + nb(campQuantite) + T('esp_reduce_qty_or_denser_area') :
          dp.code === 'BAD_QUANTITY' ? T('esp_invalid_qty_choose_tier') + nb(CAMP.palier) + '.' :
          dp.code === 'USE_INCLUDED' ? T('esp_order_covered_by_included') :
          dp.code === 'QUOTA_SPENT' ? T('esp_included_campaign_used_elsewhere') :
          dp.code === 'NOT_CONFIGURED' ? T('esp_payment_not_configured_manual') :
          dp.code === 'PAGE_NOT_LIVE' ? T('esp_publish_page_before_qr') :
          dp.code === 'MEMBERSHIP_REQUIRED' ? T('esp_activate_subscription_first') :
          r.status === 401 ? T('esp_session_expired_reopen_link') :
          T('esp_payment_open_failed_retry');
        btn.disabled = false; btn.textContent = libelleBouton();
        return;
      }
      var d = await r.json().catch(function(){ return {}; });
      if (r.ok) {
        var q = new Date(d.deadline);
        ok.textContent = T('esp_launch_success_prefix') + nb(d.count) + T('esp_letters_at_canada_post_by')
          + q.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' }) + '.';
        oublier();
        btn.textContent = T('esp_campaign_confirmed');
        CAMP.restantes = d.restantes;
        return;
      }
      err.textContent =
        d.code === 'QUOTA_SPENT' ? T('esp_yearly_included_already_used') :
        d.code === 'PAGE_NOT_LIVE' ? T('esp_publish_page_before_qr') :
        d.code === 'MEMBERSHIP_REQUIRED' ? T('esp_activate_subscription_first') :
        d.code === 'TOO_FAST' ? T('esp_previous_request_still_processing') :
        r.status === 401 ? T('esp_session_expired_reopen_link') :
        T('esp_confirmation_failed_retry');
    }catch(_){ err.textContent = T('esp_confirmation_failed_retry'); }
    btn.disabled = false; btn.textContent = libelleBouton();
  });

  // Recharger une campagne non payee : le serveur garde la liste, donc le
  // territoire revient meme apres un vidage du navigateur ou sur un autre poste.
  document.querySelectorAll('[data-reprendre]').forEach(function(b){
    on(b, 'click', async function(){
      var id = b.getAttribute('data-reprendre');
      var libelle = b.textContent;
      b.disabled = true; b.textContent = 'Chargement…';
      try{
        var r = await apiFetch('api/espace/campagne/' + id + '/territoire');
        var d = await r.json();
        if (r.ok && d.adresses && d.adresses.length) {
          campCentre = d.centre;
          campAdresses = d.adresses;
          campRayon = d.rayon || 0;
          campVille = d.ville || '';
          campQuantite = d.quantite || CAMP.cible;
          campRepriseId = Number(id) || 0;
          majQuantite();
          if ($('campAdresse')) $('campAdresse').value = (d.centre && d.centre.libelle) || '';
          if ($('campNotes')) $('campNotes').value = d.notes || '';
          afficherTerritoire(d.adresses.length);
          sauverTerritoire();
          etat(T('esp_territory_reloaded_prefix') + nb(campAdresses.length) + T('esp_addresses_adjust_or_relaunch'));
          var res = $('campResultat');
          if (res) res.scrollIntoView({ block: 'start', behavior: 'smooth' });
        } else {
          var err = $('campErreur');
          if (err) err.textContent = T('esp_campaign_no_longer_editable');
        }
      }catch(_){ }
      b.disabled = false; b.textContent = libelle;
    });
  });

  // Une commande restee en attente retient la campagne incluse : ce bouton la
  // relache tout de suite, sans passer par nous.
  document.querySelectorAll('[data-annuler]').forEach(function(b){
    on(b, 'click', async function(){
      var id = b.getAttribute('data-annuler');
      b.disabled = true; b.textContent = 'Annulation…';
      try{
        var r = await apiFetch('api/espace/campagne/' + id + '/annuler', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        });
        if (r.ok) { window.location.href = 'espace/courrier-cible?campagne=liberee'; return; }
      }catch(_){ }
      b.disabled = false; b.textContent = T('esp_cancel_reclaim_included_btn_js');
    });
  });

  // La lettre est une feuille FIXE de 8,5 x 11 po : a 100 % de largeur elle est
  // rognee, pas reflowee. On la met a l'echelle plutot que de la redimensionner.
  var LETTRE_L = 816, LETTRE_H = 1056;
  function ajusterLettre(){
    var vue = $('campSheet');
    if (!vue || !vue.parentNode) return;
    var dispo = vue.parentNode.clientWidth;
    if (!dispo) return;
    var k = Math.min(1, dispo / LETTRE_L);
    vue.style.transform = 'scale(' + k + ')';
    vue.parentNode.style.height = Math.round(LETTRE_H * k) + 'px';
  }
  if (window.ResizeObserver) {
    var vueL = $('campSheet');
    if (vueL && vueL.parentNode) { try{ new ResizeObserver(ajusterLettre).observe(vueL.parentNode); }catch(_){ } }
  }
  on(window, 'resize', function(){ ajusterLettre(); reveillerCarte(); });
  on(window, 'orientationchange', reveillerCarte);
  on(window, 'pageshow', reveillerCarte);
  on(document, 'visibilitychange', function(){ if (!document.hidden) reveillerCarte(); });

  // Recalculate the fixed-format letter after the page has settled.
  function reveiller(){
    setTimeout(ajusterLettre, 40);
    reveillerCarte();
  }

  // Retour de PayPal : la route revient directement sur cette page.
  (function(){
    var m = /[?&]campagne=([a-z]+)/.exec(window.location.search || '');
    if (!m) return;
    var ok = $('campSucces'), err = $('campErreur');
    setTimeout(reveiller, 60);
    // Un paiement abandonne ne doit pas coûter le territoire : on le remet tel quel.
    if (m[1] === 'paye' || m[1] === 'test') oublier();
    else setTimeout(restaurerTerritoire, 80);
    if (m[1] === 'paye' || m[1] === 'test') {
      if (ok) ok.textContent = m[1] === 'test'
        ? T('esp_test_payment_accepted')
        : T('esp_payment_received_72_business_h');
    } else if (m[1] === 'annule') {
      if (err) err.textContent = T('esp_payment_cancelled_included_back');
    } else if (m[1] === 'liberee') {
      if (ok) ok.textContent = T('esp_order_cancelled_included_free');
    } else if (err) {
      err.textContent = T('esp_paypal_confirmation_pending');
    }
  })();
  // Rafraichissement simple : si un territoire est en memoire, il revient seul.
  if (!/[?&]campagne=/.test(window.location.search || '')) {
    setTimeout(function(){ restaurerTerritoire(); }, 40);
  }
  if (/[?&]abonnement=(confirme|test)/.test(window.location.search || '')) {
    setTimeout(function(){
      var ok = $('campSucces');
      if (ok) ok.textContent = T('esp_campaign_subscription_ready');
    }, 100);
  } else if (/[?&]abonnement=annule/.test(window.location.search || '')) {
    setTimeout(function(){
      var err = $('campErreur');
      if (err) err.textContent = T('esp_campaign_subscription_cancelled');
    }, 100);
  }

})();
