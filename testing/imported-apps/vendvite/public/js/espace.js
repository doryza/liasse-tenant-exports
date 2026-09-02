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

  var campCentre = null, campAdresses = [], campRayon = 0, campVille = '';
  var campCarte = null, campCouche = null, campPret = false;

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
      if (tour < 3) etat('Le service cartographique est occupé — nouvelle tentative (' + (tour + 2) + '/4)…');
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
      etat('Balayage du secteur sur ' + (r >= 1000 ? (r / 1000) + ' km' : r + ' m') + '…');
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

  async function chercherTerritoire(){
    var champ = $('campAdresse');
    var btn = $('campChercher');
    var err = $('campErreur');
    var res = $('campResultat');
    if (!champ || !champ.value.trim()) { if (err) err.textContent = 'Entrez l’adresse au cœur du secteur que vous voulez travailler.'; return; }
    if (err) err.textContent = '';
    btn.disabled = true;
    var libelleBtn = btn.textContent;
    btn.textContent = 'Repérage…';
    if (res) res.hidden = true;
    etat('Localisation de l’adresse…');
    try{
      var q = champ.value.trim();
      var g = await fetch('https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ca&limit=1&q=' + encodeURIComponent(q));
      var hits = await g.json();
      if (!hits.length) throw new Error('geocode');
      var h = hits[0];
      campCentre = { lat: parseFloat(h.lat), lng: parseFloat(h.lon), libelle: h.display_name };
      campVille = (h.address && (h.address.city || h.address.town || h.address.village || h.address.municipality)) || '';

      var out = await balayer(campCentre.lat, campCentre.lng, campQuantite);
      if (!out.total) {
        etat('');
        if (err) err.textContent = 'OpenStreetMap ne couvre pas encore ce secteur. Écrivez-nous : nous constituons la liste à la main.';
        btn.disabled = false; btn.textContent = libelleBtn;
        return;
      }
      campAdresses = out.liste.slice(0, campQuantite);
      campRayon = out.rayon;

      etat('');
      if (res) res.hidden = false;
      compteur($('campNombre'), campAdresses.length);
      var loin = campAdresses[campAdresses.length - 1].metres;
      var elPortee = $('campPortee');
      if (elPortee) elPortee.textContent = loin < 1000 ? loin + ' m' : (loin / 1000).toFixed(1).replace('.', ',') + ' km';
      var elTrouve = $('campTrouve');
      if (elTrouve) elTrouve.textContent = nb(out.total);
      var elCentre = $('campCentreTxt');
      if (elCentre) elCentre.textContent = campCentre.libelle;
      rendreListe();
      dessinerCarte();
      var conf = $('campConfirmer');
      if (conf && (estIncluse() || CAMP.peutPayer)) { conf.disabled = false; conf.textContent = libelleBouton(); }
    }catch(_){
      etat('');
      if (err) err.textContent = 'Le service cartographique n’a pas répondu. Réessayez dans un instant.';
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
  function estIncluse(){ return campQuantite === CAMP.cible && Number(CAMP.restantes) > 0; }
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
        box.innerHTML = '<span class="camp-prix-n">Incluse</span><span class="camp-prix-l">comprise dans votre licence</span>';
      } else if (prix) {
        box.innerHTML = '<span class="camp-prix-n">' + argent(prix.total) + '</span>'
          + '<span class="camp-prix-l">' + nb(campQuantite) + ' lettres · ' + argent(prix.sousTotal) + ' + taxes</span>';
      }
    }
    var btn = $('campConfirmer');
    if (btn && !btn.disabled) btn.textContent = libelleBouton();
    var moins = $('campMoins'), plus = $('campPlus');
    if (moins) moins.disabled = campQuantite <= CAMP.palier;
    if (plus) plus.disabled = campQuantite >= CAMP.max;
  }
  function libelleBouton(){
    if (estIncluse()) return 'Confirmer et lancer l’envoi';
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

  on($('campChercher'), 'click', chercherTerritoire);
  on($('campAdresse'), 'keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); chercherTerritoire(); } });

  on($('campConfirmer'), 'click', async function(){
    var btn = $('campConfirmer'), err = $('campErreur'), ok = $('campSucces');
    if (!campCentre || !campAdresses.length) return;
    err.textContent = ''; ok.textContent = '';
    var paye = !estIncluse();
    if (paye && !CAMP.peutPayer) {
      err.textContent = 'Le paiement n’est pas encore configuré. Écrivez-nous et nous lançons la campagne manuellement.';
      return;
    }
    btn.disabled = true; btn.textContent = paye ? 'Ouverture de PayPal…' : 'Transmission…';
    var charge = {
      centre: { libelle: campCentre.libelle, lat: campCentre.lat, lng: campCentre.lng },
      adresses: campAdresses.map(function(a){
        return { numero: a.numero, rue: a.rue, ville: a.ville, source: a.source, lat: a.lat, lng: a.lng, metres: a.metres };
      }),
      ville: campVille, rayon: campRayon,
      notes: $('campNotes') ? $('campNotes').value.trim() : ''
    };
    if (paye) charge.quantite = campQuantite;
    try{
      var r = await fetch(paye ? 'api/espace/campagne/commander' : 'api/espace/campagne', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charge)
      });
      if (paye) {
        var dp = await r.json().catch(function(){ return {}; });
        if (r.ok && dp.approve) { window.location.href = dp.approve; return; }
        err.textContent =
          dp.code === 'COUNT_MISMATCH' ? 'Nous n’avons trouvé que ' + nb(dp.trouvees || 0) + ' adresses pour ' + nb(campQuantite) + ' demandées. Réduisez la quantité ou choisissez un secteur plus dense.' :
          dp.code === 'BAD_QUANTITY' ? 'Quantité invalide. Choisissez un palier de ' + nb(CAMP.palier) + '.' :
          dp.code === 'NOT_CONFIGURED' ? 'Le paiement n’est pas encore configuré. Écrivez-nous et nous lançons la campagne manuellement.' :
          dp.code === 'PAGE_NOT_LIVE' ? 'Publiez d’abord votre page : le code QR de la lettre doit mener quelque part.' :
          dp.code === 'MEMBERSHIP_REQUIRED' ? 'Activez votre abonnement pour lancer une campagne.' :
          r.status === 401 ? 'Votre session a expiré. Rouvrez votre lien d’accès personnel.' :
          'Impossible d’ouvrir le paiement. Réessayez dans un instant.';
        btn.disabled = false; btn.textContent = libelleBouton();
        return;
      }
      var d = await r.json().catch(function(){ return {}; });
      if (r.ok) {
        var q = new Date(d.deadline);
        ok.textContent = 'C’est parti ✓ Vos ' + nb(d.count) + ' lettres sont déposées à Postes Canada d’ici le '
          + q.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' }) + '.';
        btn.textContent = 'Campagne confirmée';
        CAMP.restantes = d.restantes;
        return;
      }
      err.textContent =
        d.code === 'QUOTA_SPENT' ? 'Votre campagne incluse de l’année est déjà utilisée. Écrivez-nous pour en ajouter une.' :
        d.code === 'PAGE_NOT_LIVE' ? 'Publiez d’abord votre page : le code QR de la lettre doit mener quelque part.' :
        d.code === 'MEMBERSHIP_REQUIRED' ? 'Activez votre abonnement pour lancer une campagne.' :
        d.code === 'TOO_FAST' ? 'Un instant — votre demande précédente est encore en traitement.' :
        r.status === 401 ? 'Votre session a expiré. Rouvrez votre lien d’accès personnel.' :
        'La confirmation n’a pas abouti. Réessayez dans un instant.';
    }catch(_){ err.textContent = 'La confirmation n’a pas abouti. Réessayez dans un instant.'; }
    btn.disabled = false; btn.textContent = libelleBouton();
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

  // Le panneau est en display:none tant qu'il n'est pas ouvert : une carte
  // construite avant l'ouverture se dessine en 0x0 et rien ne previent Leaflet,
  // et la lettre mesure une largeur nulle.
  function reveiller(){
    setTimeout(ajusterLettre, 40);
    if (!campPret) { campPret = true; return; }
    if (campCarte) setTimeout(function(){ campCarte.invalidateSize(); }, 60);
  }

  // Retour de PayPal : on rouvre l'onglet et on dit ce qui s'est passe.
  (function(){
    var m = /[?&]campagne=([a-z]+)/.exec(window.location.search || '');
    if (!m) return;
    var ok = $('campSucces'), err = $('campErreur');
    show('courrier');
    setTimeout(reveiller, 60);
    if (m[1] === 'paye' || m[1] === 'test') {
      if (ok) ok.textContent = m[1] === 'test'
        ? 'Paiement test accepté ✓ Aucun montant réel n’a été prélevé. La campagne est enregistrée et identifiée comme un essai.'
        : 'Paiement reçu ✓ Vos lettres sont déposées à Postes Canada dans les 72 heures ouvrables.';
    } else if (m[1] === 'annule') {
      if (err) err.textContent = 'Paiement annulé. Votre territoire est toujours là — relancez quand vous voulez.';
    } else if (err) {
      err.textContent = 'Nous n’avons pas encore reçu la confirmation de PayPal. Elle arrive parfois avec un léger délai ; votre campagne apparaîtra dans l’historique.';
    }
  })();
  document.querySelectorAll('.esp-tab[data-tab="courrier"], [data-goto="courrier"]').forEach(function(b){
    on(b, 'click', reveiller);
  });

})();
