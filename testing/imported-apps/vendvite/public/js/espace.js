(function(){
  var VV = window.VV || { profile: {}, published: false, active: false, live: false };
  var profile = VV.profile || {};
  function $(id){ return document.getElementById(id); }
  // Textes traduits, rendus par le serveur selon la langue choisie.
  function T(k){ var d = window.VV_T || {}; return (d[k] != null) ? d[k] : ''; }
  function on(el, ev, fn){ if(el) el.addEventListener(ev, fn); }

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
  var LINK_F = [{ key: 'label', ph: T('esp_social_link_label_placeholder') }, { key: 'url', ph: 'https://…' }];
  var TM_F = [{ key: 'author', ph: T('esp_tm_author_ph') }, { key: 'neighborhood', ph: T('esp_tm_area_ph') }, { key: 'quote', ph: T('esp_tm_quote_ph') }, { key: 'sale_result', ph: T('esp_tm_result_ph') }];
  var linkList = $('linkList'), tmList = $('tmList');
  if (linkList) (profile.links || []).forEach(function(l){ buildRow(linkList, LINK_F, l); });
  if (tmList) (profile.testimonials || []).forEach(function(x){ buildRow(tmList, TM_F, x); });
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
      flag.textContent = r.ok ? T('esp_save_success_toast') : T('esp_save_failed_toast');
      if (r.ok) { var d = await r.json(); if (d.profile) profile = d.profile; }
    }catch(_){ flag.textContent = T('esp_save_failed_toast'); }
    btn.disabled = false;
    setTimeout(function(){ flag.textContent = ''; }, 3200);
  });

  // ── Photo upload
  on($('photoInput'), 'change', function(e){
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var hint = $('photoHint');
    if (file.size > 8 * 1024 * 1024) { hint.textContent = T('esp_photo_too_large_error'); return; }
    hint.textContent = T('esp_uploading_status');
    var reader = new FileReader();
    reader.onload = async function(){
      try{
        var r = await fetch('api/espace/photo', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result })
        });
        var d = await r.json().catch(function(){ return {}; });
        if (r.ok && d.url) {
          var img = $('portraitImg'), empty = $('portraitEmpty');
          img.onload = function(){ img.hidden = false; if (empty) empty.hidden = true; };
          img.onerror = function(){ img.hidden = true; if (empty) empty.hidden = false; };
          img.src = d.url;
          hint.textContent = T('esp_photo_updated_toast');
        } else { hint.textContent = T('esp_upload_refused_error'); }
      }catch(_){ hint.textContent = T('esp_upload_refused_error'); }
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
      if (d.code === 'PAYMENT_REQUIRED') window.location.href = 'espace/abonnement';
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
      var r = await fetch('api/espace/abonnement/annuler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (r.ok) { location.reload(); return; }
    }catch(_){}
    btn.disabled = false;
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
  var campCarte = null, campCouche = null, campPret = false;

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

  function dessinerCarte(){
    if (!window.L || !campCentre) return;
    var boite = $('campCarte');
    if (!boite) return;
    if (!campCarte) {
      campCarte = L.map(boite, { scrollWheelZoom: false, attributionControl: true });
      // Tuiles OpenStreetMap : CARTO exige desormais une cle et filigrane
      // « API KEY REQUIRED » sur chaque tuile sans elle.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap', maxZoom: 19
      }).addTo(campCarte);
    }
    if (campCouche) campCarte.removeLayer(campCouche);
    campCouche = L.layerGroup().addTo(campCarte);

    campAdresses.forEach(function(a){
      L.marker([a.lat, a.lng], {
        icon: L.divIcon({ className: 'camp-pin', html: '<i></i>', iconSize: [12, 12], iconAnchor: [6, 6] })
      }).bindTooltip(a.numero + ' ' + a.rue, { direction: 'top' }).addTo(campCouche);
    });
    L.marker([campCentre.lat, campCentre.lng], {
      icon: L.divIcon({ className: 'camp-centre-pin', html: '<i></i>', iconSize: [22, 22], iconAnchor: [11, 11] }),
      zIndexOffset: 500
    }).addTo(campCouche);
    L.circle([campCentre.lat, campCentre.lng], {
      radius: campAdresses.length ? campAdresses[campAdresses.length - 1].metres : 100,
      color: '#c8a44d', weight: 1, fillColor: '#c8a44d', fillOpacity: .07
    }).addTo(campCouche);

    var pts = campAdresses.map(function(a){ return [a.lat, a.lng]; });
    pts.push([campCentre.lat, campCentre.lng]);
    campCarte.fitBounds(L.latLngBounds(pts).pad(0.12));
    setTimeout(function(){ campCarte.invalidateSize(); }, 60);
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
    var res = $('campResultat');
    if (res) res.hidden = false;
    compteur($('campNombre'), campAdresses.length);
    var loin = campAdresses[campAdresses.length - 1].metres;
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
    if (!o || !o.centre || !o.adresses || !o.adresses.length) return false;
    campCentre = o.centre;
    campAdresses = o.adresses;
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
  var campQuantite = CAMP.cible;
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
    if (estIncluse()) return T('esp_confirm_launch_mailing_btn_js');
    var prix = palierPrix(campQuantite);
    return 'Payer ' + (prix ? argent(prix.total) : '') + ' et lancer l’envoi';
  }
  function changerQuantite(delta){
    var vise = campQuantite + delta * CAMP.palier;
    if (vise < CAMP.palier || vise > CAMP.max) return;
    campQuantite = vise;
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
      var r = await fetch(paye ? 'api/espace/campagne/commander' : 'api/espace/campagne', {
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
        var r = await fetch('api/espace/campagne/' + id + '/territoire');
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
        var r = await fetch('api/espace/campagne/' + id + '/annuler', {
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
  on(window, 'resize', ajusterLettre);

  // Recalculate the fixed-format letter after the page has settled.
  function reveiller(){
    setTimeout(ajusterLettre, 40);
    if (!campPret) { campPret = true; return; }
    if (campCarte) setTimeout(function(){ campCarte.invalidateSize(); }, 60);
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

})();
