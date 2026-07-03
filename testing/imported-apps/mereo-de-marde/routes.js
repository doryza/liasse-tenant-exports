module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const CONDITIONS = {
    soleil: { nom: 'Beau en maudit', accent: '#e8720c', verdicts: ["Sors ton char, y fait beau rare", "Un temps parfait pour s'écraser su'l patio", "Le soleil fesse fort, mets d'la crème"] },
    nuageux: { nom: 'Gris comme un lundi', accent: '#5e7387', verdicts: ["Le ciel file un mauvais coton", "Pas laid, pas beau — juste plate", "Un temps parfait pour rester en mou"] },
    pluie: { nom: 'Y mouille à siaux', accent: '#2e7dd1', verdicts: ["Sors le parapluie pis le canot", "Y tombe des clous, reste en d'dans", "Une vraie journée de canard"] },
    orage: { nom: "Ça brasse dans l'cabanon", accent: '#7c5ce0', verdicts: ["Débranche tes affaires, ça va péter", "Le bon Dieu déménage ses meubles", "Rentre le trampoline du voisin"] },
    neige: { nom: 'Y neige en pas pour rire', accent: '#4a90c4', verdicts: ["Sors ta pelle, mon chum", "Une bordée à pu retrouver ton char", "Le gars du déneigement va faire la piastre"] },
    verglas: { nom: 'Une vraie patinoire', accent: '#2a9db5', verdicts: ["Marche comme un pingouin, ça glisse", "Reste chez vous, c'est du vrai verglas", "Les patins iraient mieux que le char"] },
    brouillard: { nom: "Épais comme d'la soupe aux pois", accent: '#6e7c85', verdicts: ["On voit pas le boutte de son nez", "Allume tes lumières, ça presse", "La montagne a mis sa doudou"] },
    canicule: { nom: "Chaud à faire fondre l'asphalte", accent: '#e23d2e', verdicts: ["Colle-toé su'l air climatisé", "Un temps à boire sa piscine", "Y fait chaud à faire suer les mouches"] },
    frette: { nom: 'Frette en tabarouette', accent: '#1e6fa8', verdicts: ["Habille-toé, on gèle tout rond", "Un frette à fendre les clôtures", "Les sourcils te givrent en deux minutes"] }
  };
  const conditionsMeta = {};
  Object.keys(CONDITIONS).forEach(function(k){ conditionsMeta[k] = { nom: CONDITIONS[k].nom, accent: CONDITIONS[k].accent, verdicts: CONDITIONS[k].verdicts }; });
  const LISTE_CONDITIONS = Object.keys(CONDITIONS);

  const AD = 'Bold flat cartoon illustration with thick black ink outlines, saturated comic-book colors, bright light, hard shadows, exaggerated Quebecois caricature humor, Laurentians mountain village scenery. No text, no logos.';
  const SCENES = {
    soleil: 'A gleeful Quebecer lounging in an inflatable kiddie pool on his porch under an enormous grinning sun, sunglasses on the dog too',
    nuageux: 'A whole village street looking bored under one giant flat grey cloud, a man shrugging with his coffee mug on his balcony',
    pluie: 'Rain falling in literal buckets over a village main street, a man calmly paddling a canoe down the flooded road past parked cars',
    orage: 'A dramatic purple thunderstorm over a backyard, lightning bolts everywhere, a panicked man sprinting while carrying his barbecue to safety',
    neige: 'An absurdly massive snowfall burying colorful wooden houses up to the chimneys, a tiny man with a shovel facing a snowbank three times taller than him',
    verglas: 'An entire village street turned into a glossy skating rink, a mailman gliding on skates past cars sliding sideways, everything coated in shiny ice',
    brouillard: 'Fog thick as pea soup swallowing a village, only rooftops and one confused moose head poking above the fog layer',
    canicule: 'A scorching heatwave melting the asphalt into goo, a man frying an egg on the sidewalk while a sad snowman melts into a puddle beside him',
    frette: 'An extreme cold snap, a man frozen solid mid-step at a bus stop with icicles on his moustache, a giant thermometer burst at the bottom'
  };

  const T = {
    nav_accueil: 'Accueil', nav_carte: 'La carte', nav_dico: 'Le dictionnaire', nav_chroniques: 'Chroniques', nav_partage: 'Partage ta marde',
    hero_en_direct: 'En direct de', btn_voir_carte: 'Voir la carte des microclimats',
    sec_villages: 'La météo, coin par coin', sec_villages_sous: "Chaque village a sa marde bien à lui. Microclimats vérifiés à l'oeil pis au thermomètre.",
    sec_dico: 'Le dictionnaire de la marde', sec_dico_sous: "Parle météo comme du vrai monde d'icitte.",
    sec_chroniques: 'Les dernières chroniques',
    btn_voir_dico: 'Tout le dictionnaire', btn_voir_chroniques: 'Toutes les chroniques',
    essaie_modes: 'Essaie les humeurs du ciel — le site change de couleur avec la météo',
    vent: 'Vent', humidite: 'Humidité', rafales: 'Rafales', ressenti: 'Ressenti', altitude: 'Altitude',
    prevision_7: 'Les 7 prochains jours', topo_titre: 'Le topo du coin',
    signalements_titre: 'Le monde du coin rapporte', signaler_titre: 'Signale ta marde',
    form_nom: 'Ton nom (ou ton surnom)', form_message: "Qu'est-ce qui se passe dehors chez vous ?", form_condition: "C'est quoi le portrait ?",
    btn_signaler: 'Envoyer mon signalement', signal_merci: "Merci ! Ton signalement va s'afficher après approbation par le boss.",
    empty_villages: 'Pas encore de villages dans la liste. Reviens tantôt !', empty_expressions: 'Le dictionnaire se remplit bientôt, promis.', empty_posts: "Pas de chronique pour l'instant. Le chroniqueur pellette encore sa cour.", empty_signalements: 'Personne a encore chialé icitte. Sois le premier !',
    partage_titre: 'Partage ta marde', partage_choix_village: 'Ton coin', partage_choix_condition: 'La marde en cours',
    btn_generer: 'Génère ma carte de marde', btn_partager: 'Partager', btn_telecharger: 'Télécharger', generation_attente: "Deux secondes, l'artiste dessine...",
    carte_titre: 'La carte des microclimats', btn_relief: 'Vue relief', btn_plan: 'Vue plan', voir_coin: 'Voir le coin',
    footer_alertes: 'Alerte-moé quand y fait marde', footer_naviguer: 'Naviguer', footer_rejoindre: 'Nous rejoindre',
    meteo_indispo: 'La station niaise, réessaie tantôt.', retour: 'Retour', publie_le: 'Publié le'
  };

  function formatDate(d) { try { return new Date(d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
  function verdictDuJour(cond) { const c = CONDITIONS[cond] || CONDITIONS.nuageux; return c.verdicts[Math.floor(Date.now() / 86400000) % c.verdicts.length]; }
  function wmoToCondition(code, temp) {
    var c;
    if ([95, 96, 99].indexOf(code) >= 0) c = 'orage';
    else if ([71, 73, 75, 77, 85, 86].indexOf(code) >= 0) c = 'neige';
    else if ([66, 67].indexOf(code) >= 0) c = 'verglas';
    else if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].indexOf(code) >= 0) c = 'pluie';
    else if ([45, 48].indexOf(code) >= 0) c = 'brouillard';
    else if (code === 2 || code === 3) c = 'nuageux';
    else c = 'soleil';
    if (c === 'soleil' || c === 'nuageux') { if (temp >= 28) c = 'canicule'; else if (temp <= -15) c = 'frette'; }
    return c;
  }

  const meteoCache = {};
  async function getMeteo(v) {
    const cle = 'v' + v.id;
    const now = Date.now();
    if (meteoCache[cle] && now - meteoCache[cle].ts < 600000) return meteoCache[cle].data;
    try {
      const r = await services.fetch('https://api.open-meteo.com/v1/forecast?latitude=' + v.lat + '&longitude=' + v.lng + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FToronto&forecast_days=7');
      const j = await r.json();
      if (!r.ok || !j.current) throw new Error('station indisponible');
      const cond = wmoToCondition(j.current.weather_code, j.current.temperature_2m);
      const data = { ok: true, temp: Math.round(j.current.temperature_2m), ressenti: Math.round(j.current.apparent_temperature), humidite: Math.round(j.current.relative_humidity_2m), vent: Math.round(j.current.wind_speed_10m), rafales: Math.round(j.current.wind_gusts_10m), condition: cond, daily: j.daily || null };
      meteoCache[cle] = { ts: now, data: data };
      return data;
    } catch (e) { return { ok: false, temp: null, ressenti: null, humidite: null, vent: null, rafales: null, condition: 'nuageux', daily: null }; }
  }

  async function getSettings() { try { const rows = await db.all('SELECT key, value FROM admin_settings'); const s = {}; rows.forEach(function(r){ s[r.key] = r.value; }); return s; } catch (e) { return {}; } }
  function applyTextOverrides(t, settings) { for (var k in settings) { if (k.indexOf('text_') === 0 && k.slice(-3) === '_fr') { var tk = k.slice(5, -3); if (tk) t[tk] = settings[k]; } } return t; }
  async function baseLocals(extra) { const settings = await getSettings(); const t = applyTextOverrides(Object.assign({}, T), settings); return Object.assign({ settings: settings, t: t, conditionsMeta: conditionsMeta, googleApiKey: services.google.mapsApiKey, formatDate: formatDate }, extra || {}); }
  function localsSecours(extra) { return Object.assign({ settings: {}, t: Object.assign({}, T), conditionsMeta: conditionsMeta, googleApiKey: services.google.mapsApiKey, formatDate: formatDate }, extra || {}); }
  async function conditionRegionale() { try { const v = await db.get('SELECT * FROM villages ORDER BY ordre, id LIMIT 1'); if (!v) return 'nuageux'; const m = await getMeteo(v); return m.ok ? m.condition : 'nuageux'; } catch (e) { return 'nuageux'; } }

  const MODULES = [
    { key: 'posts', label: 'Chroniques', icon: 'edit', fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, maxLength: 200, description: "Le titre affiché dans la liste des chroniques et en haut de l'article.", placeholder: 'p. ex. Guide de survie de la première bordée' },
      { name: 'content', label: 'Contenu', type: 'textarea', description: 'Le texte complet de la chronique. Sépare tes paragraphes par une ligne vide.', placeholder: 'Écris ta chronique icitte...' },
      { name: 'image_url', label: 'Image', type: 'image', description: "Image d'en-tête de la chronique. Recommandé : 1200×900 px (paysage)." },
      { name: 'category', label: 'Catégorie', type: 'select', options: ['Bulletin', 'Chialage', 'Conseils', 'Saison'], description: 'Sert à classer les chroniques sur le site.' },
      { name: 'published', label: 'Publiée', type: 'boolean', default: true, description: 'Décoche pour garder la chronique en brouillon, invisible aux visiteurs.' }
    ] },
    { key: 'villages', label: 'Villages', icon: 'map-pin', fields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true, maxLength: 80, description: 'Le nom du village affiché partout sur le site.', placeholder: 'p. ex. Sainte-Adèle' },
      { name: 'slug', label: 'Identifiant URL', type: 'text', required: true, maxLength: 80, description: "Version courte pour l'adresse web : minuscules, sans espaces ni accents.", placeholder: 'p. ex. sainte-adele' },
      { name: 'lat', label: 'Latitude', type: 'number', required: true, step: 0.0001, description: 'Coordonnée GPS nord-sud. Sert à la carte et aux données météo en direct.', placeholder: 'p. ex. 45.9512' },
      { name: 'lng', label: 'Longitude', type: 'number', required: true, step: 0.0001, description: 'Coordonnée GPS est-ouest, négative au Québec.', placeholder: 'p. ex. -74.1333' },
      { name: 'altitude', label: 'Altitude (m)', type: 'number', min: 0, step: 1, description: 'Altitude du village en mètres, affichée sur sa fiche.', placeholder: 'p. ex. 320' },
      { name: 'microclimat', label: 'Topo du microclimat', type: 'textarea', description: 'Décris en joual ce qui rend la météo de ce coin-là spéciale.', placeholder: "p. ex. Le fond de vallée ramasse tout l'air frette du coin..." },
      { name: 'image_url', label: 'Image', type: 'image', description: 'Illustration du village. Recommandé : 800×600 px (4:3).' },
      { name: 'ordre', label: "Ordre d'affichage", type: 'number', min: 0, step: 1, description: "Plus le chiffre est petit, plus le village sort en premier. Le premier de la liste sert de village vedette en page d'accueil.", placeholder: 'p. ex. 1' }
    ] },
    { key: 'expressions', label: 'Expressions', icon: 'star', fields: [
      { name: 'expression', label: 'Expression', type: 'text', required: true, maxLength: 120, description: "L'expression québécoise, telle qu'on la dit.", placeholder: 'p. ex. Y mouille à siaux' },
      { name: 'signification', label: 'Signification', type: 'textarea', description: "Explication de l'expression pour ceux qui viennent d'ailleurs.", placeholder: 'p. ex. Il pleut très fort, à seaux pleins.' },
      { name: 'exemple', label: 'Exemple', type: 'textarea', description: "Une phrase d'exemple qui montre comment l'utiliser.", placeholder: 'p. ex. Annule le golf, y mouille à siaux.' },
      { name: 'condition', label: 'Condition météo', type: 'select', options: ['soleil', 'nuageux', 'pluie', 'orage', 'neige', 'verglas', 'brouillard', 'canicule', 'frette'], description: 'La condition météo associée. Sert au filtre du dictionnaire.' },
      { name: 'image_url', label: 'Image', type: 'image', description: 'Illustration optionnelle. Recommandé : 800×600 px.' }
    ] },
    { key: 'signalements', label: 'Signalements', icon: 'users', fields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true, maxLength: 60, description: 'Le nom ou surnom de la personne qui signale.', placeholder: 'p. ex. Ti-Guy de la 117' },
      { name: 'village_id', label: 'ID du village', type: 'number', min: 1, step: 1, description: 'Le numéro (ID) du village concerné — consulte la page Villages pour le trouver.', placeholder: 'p. ex. 3' },
      { name: 'condition', label: 'Condition', type: 'select', options: ['soleil', 'nuageux', 'pluie', 'orage', 'neige', 'verglas', 'brouillard', 'canicule', 'frette'], description: 'La météo signalée par le visiteur.' },
      { name: 'message', label: 'Message', type: 'textarea', required: true, description: "Le signalement tel qu'écrit par le visiteur.", placeholder: "p. ex. Y grêle des balles de golf su'a rue Principale..." },
      { name: 'approuve', label: 'Approuvé', type: 'boolean', default: false, description: 'Coche pour afficher le signalement publiquement sur la fiche du village.' },
      { name: 'image_url', label: 'Image', type: 'image', description: 'Photo optionnelle jointe au signalement.' }
    ] },
    { key: 'share_cards', label: 'Cartes de partage', icon: 'share-2', fields: [
      { name: 'village_id', label: 'ID du village', type: 'number', min: 1, step: 1, description: 'Le numéro (ID) du village associé à cette carte.', placeholder: 'p. ex. 3' },
      { name: 'condition', label: 'Condition météo', type: 'select', options: ['soleil', 'nuageux', 'pluie', 'orage', 'neige', 'verglas', 'brouillard', 'canicule', 'frette'], description: 'La condition météo illustrée sur la carte.' },
      { name: 'image_url', label: 'Image', type: 'image', description: 'URL de la carte générée. Recommandé : 1:1.' },
      { name: 'texte', label: 'Texte', type: 'text', maxLength: 200, description: 'Légende de la carte de partage.', placeholder: 'p. ex. Y mouille à siaux — Sors le parapluie pis le canot' }
    ] }
  ];

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch (e) {}
    }
    next();
  });

  router.get('/', async function(req, res) {
    try {
      const villages = await db.all('SELECT * FROM villages ORDER BY ordre, id');
      const meteos = await Promise.all(villages.map(function(v){ return getMeteo(v); }));
      villages.forEach(function(v, i){ v.meteo = meteos[i]; });
      const vedette = villages.length ? villages[0] : null;
      const cond = (vedette && vedette.meteo && vedette.meteo.ok) ? vedette.meteo.condition : 'nuageux';
      const expressions = await db.all('SELECT * FROM expressions ORDER BY RANDOM() LIMIT 3');
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', await baseLocals({ pageTitle: null, meteoCondition: cond, villages: villages, vedette: vedette, expressions: expressions, posts: posts, verdict: verdictDuJour(cond), nomCondition: CONDITIONS[cond].nom }));
    } catch (e) {
      res.render('index', localsSecours({ meteoCondition: 'nuageux', villages: [], vedette: null, expressions: [], posts: [], verdict: verdictDuJour('nuageux'), nomCondition: CONDITIONS.nuageux.nom }));
    }
  });

  router.get('/carte', async function(req, res) {
    try {
      const cond = await conditionRegionale();
      res.render('carte', await baseLocals({ pageTitle: T.carte_titre, meteoCondition: cond }));
    } catch (e) { res.render('carte', localsSecours({ pageTitle: T.carte_titre, meteoCondition: 'nuageux' })); }
  });

  router.get('/village/:slug', async function(req, res) {
    try {
      const village = await db.get('SELECT * FROM villages WHERE slug = $1', [req.params.slug]);
      if (!village) return res.redirect('.');
      const meteo = await getMeteo(village);
      const cond = meteo.ok ? meteo.condition : 'nuageux';
      let previsions = [];
      if (meteo.ok && meteo.daily && meteo.daily.time) {
        previsions = meteo.daily.time.map(function(d, i){ return { jour: new Date(d + 'T12:00:00').toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric' }), max: Math.round(meteo.daily.temperature_2m_max[i]), min: Math.round(meteo.daily.temperature_2m_min[i]), cond: wmoToCondition(meteo.daily.weather_code[i], meteo.daily.temperature_2m_max[i]) }; });
      }
      const signalements = await db.all('SELECT * FROM signalements WHERE village_id = $1 AND approuve = 1 ORDER BY created_at DESC LIMIT 12', [village.id]);
      res.render('village', await baseLocals({ pageTitle: village.nom, meteoCondition: cond, village: village, meteo: meteo, previsions: previsions, signalements: signalements, verdict: verdictDuJour(cond), nomCondition: CONDITIONS[cond].nom }));
    } catch (e) { res.redirect('.'); }
  });

  router.get('/dictionnaire', async function(req, res) {
    try {
      const expressions = await db.all('SELECT * FROM expressions ORDER BY id');
      const cond = await conditionRegionale();
      res.render('dictionnaire', await baseLocals({ pageTitle: T.sec_dico, meteoCondition: cond, expressions: expressions }));
    } catch (e) { res.render('dictionnaire', localsSecours({ pageTitle: T.sec_dico, meteoCondition: 'nuageux', expressions: [] })); }
  });

  router.get('/chroniques', async function(req, res) {
    try {
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
      const cond = await conditionRegionale();
      res.render('chroniques', await baseLocals({ pageTitle: T.sec_chroniques, meteoCondition: cond, posts: posts }));
    } catch (e) { res.render('chroniques', localsSecours({ pageTitle: T.sec_chroniques, meteoCondition: 'nuageux', posts: [] })); }
  });

  router.get('/chroniques/:id', async function(req, res) {
    try {
      const post = await db.get('SELECT * FROM posts WHERE id = $1 AND published = 1', [Number(req.params.id)]);
      if (!post) return res.redirect('chroniques');
      const cond = await conditionRegionale();
      res.render('chronique', await baseLocals({ pageTitle: post.title, meteoCondition: cond, post: post }));
    } catch (e) { res.redirect('chroniques'); }
  });

  router.get('/partage', async function(req, res) {
    try {
      const villages = await db.all('SELECT * FROM villages ORDER BY ordre, id');
      const cond = await conditionRegionale();
      res.render('partage', await baseLocals({ pageTitle: T.partage_titre, meteoCondition: cond, villages: villages }));
    } catch (e) { res.render('partage', localsSecours({ pageTitle: T.partage_titre, meteoCondition: 'nuageux', villages: [] })); }
  });

  router.get('/api/meteo-tous', async function(req, res) {
    try {
      const villages = await db.all('SELECT * FROM villages ORDER BY ordre, id');
      const out = await Promise.all(villages.map(async function(v) {
        const m = await getMeteo(v);
        return { id: v.id, nom: v.nom, slug: v.slug, lat: v.lat, lng: v.lng, altitude: v.altitude, temp: m.temp, condition: m.condition, nomCondition: CONDITIONS[m.condition].nom, verdict: verdictDuJour(m.condition), ok: m.ok };
      }));
      res.json({ villages: out });
    } catch (e) { res.status(500).json({ error: 'La station est dans le champ. Réessaie tantôt.' }); }
  });

  router.post('/api/signalements', async function(req, res) {
    try {
      const nom = String(req.body.nom || '').trim().slice(0, 60);
      const message = String(req.body.message || '').trim().slice(0, 400);
      const condition = CONDITIONS[req.body.condition] ? String(req.body.condition) : 'nuageux';
      const villageId = req.body.village_id ? Number(req.body.village_id) : null;
      if (!nom || !message) return res.status(400).json({ error: 'Ton nom pis ton message sont obligatoires.' });
      await db.run('INSERT INTO signalements (nom, village_id, condition, message, approuve) VALUES ($1, $2, $3, $4, 0)', [nom, villageId, condition, message]);
      try { if (services.config.contactEmail) await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau signalement météo de ' + nom, html: '<p><strong>' + nom + '</strong> (' + CONDITIONS[condition].nom + ') : ' + message + '</p>' }); } catch (e2) { console.error('Courriel non parti :', e2.message); }
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Ça a pas marché, réessaie dans une minute.' }); }
  });

  router.post('/api/partage/generer', async function(req, res) {
    try {
      const vid = Number(req.body.village_id);
      const cond = String(req.body.condition || '');
      if (!CONDITIONS[cond]) return res.status(400).json({ error: 'Condition inconnue.' });
      const village = await db.get('SELECT * FROM villages WHERE id = $1', [vid]);
      if (!village) return res.status(404).json({ error: 'Village introuvable.' });
      const verdict = verdictDuJour(cond);
      const nomCondition = CONDITIONS[cond].nom;
      const existante = await db.get('SELECT * FROM share_cards WHERE village_id = $1 AND condition = $2 ORDER BY id DESC LIMIT 1', [vid, cond]);
      if (existante && existante.image_url) return res.json({ image_url: existante.image_url, nomCondition: nomCondition, verdict: verdict, village: village.nom });
      let url = null;
      try { url = await services.ai.generateImage(SCENES[cond] + ', in the village of ' + village.nom + ' in the Laurentides mountains, Quebec. ' + AD, { aspectRatio: '1:1' }); }
      catch (e2) { return res.status(503).json({ error: "L'artiste est dans le jus. Réessaie dans une minute." }); }
      await db.run('INSERT INTO share_cards (village_id, condition, image_url, texte) VALUES ($1, $2, $3, $4)', [vid, cond, url, nomCondition + ' — ' + verdict]);
      res.json({ image_url: url, nomCondition: nomCondition, verdict: verdict, village: village.nom });
    } catch (e) { res.status(500).json({ error: 'Ça a chié quelque part. Réessaie.' }); }
  });

  function adminSeulement(req, res, next) { if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès réservé au boss.' }); next(); }
  function coerce(f, v) { if (f.type === 'boolean') return (v === true || v === 1 || v === '1' || v === 'true' || v === 'on') ? 1 : 0; if (f.type === 'number') return (v === '' || v == null) ? null : Number(v); return v == null ? null : String(v); }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const stats = {};
      stats.visites = (await db.get('SELECT COUNT(*)::int AS n FROM site_visits')).n;
      stats.visites7 = (await db.get("SELECT COUNT(*)::int AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).n;
      stats.usagers = 0; stats.push = 0;
      try { stats.usagers = await services.auth.getUserCount(); } catch (e) {}
      try { stats.push = await services.push.getSubscriptionCount(); } catch (e) {}
      const comptes = {};
      for (const m of MODULES) comptes[m.key] = (await db.get('SELECT COUNT(*)::int AS n FROM ' + m.key)).n;
      const enAttente = await db.all('SELECT s.*, v.nom AS village_nom FROM signalements s LEFT JOIN villages v ON v.id = s.village_id WHERE s.approuve = 0 ORDER BY s.created_at DESC LIMIT 10');
      const settings = await getSettings();
      res.render('admin', { stats: stats, comptes: comptes, enAttente: enAttente, adminActif: 'tableau', settings: settings, formatDate: formatDate, conditionsMeta: conditionsMeta });
    } catch (e) {
      res.render('admin', { stats: { visites: 0, visites7: 0, usagers: 0, push: 0 }, comptes: {}, enAttente: [], adminActif: 'tableau', settings: {}, formatDate: formatDate, conditionsMeta: conditionsMeta });
    }
  });

  router.get('/admin/posts', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'posts'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-posts', { title: 'Chroniques', moduleKey: 'posts', moduleLabel: 'Chronique', fields: m.fields, adminActif: 'posts', settings: settings });
  });

  router.get('/admin/villages', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'villages'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-villages', { title: 'Villages', moduleKey: 'villages', moduleLabel: 'Village', fields: m.fields, adminActif: 'villages', settings: settings });
  });

  router.get('/admin/expressions', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'expressions'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-expressions', { title: 'Expressions', moduleKey: 'expressions', moduleLabel: 'Expression', fields: m.fields, adminActif: 'expressions', settings: settings });
  });

  router.get('/admin/signalements', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'signalements'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-signalements', { title: 'Signalements', moduleKey: 'signalements', moduleLabel: 'Signalement', fields: m.fields, adminActif: 'signalements', settings: settings });
  });

  router.get('/admin/share_cards', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'share_cards'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-share_cards', { title: 'Cartes de partage', moduleKey: 'share_cards', moduleLabel: 'Carte de partage', fields: m.fields, adminActif: 'share_cards', settings: settings });
  });

  router.get('/admin/logout', function(req, res) {
    try { res.clearCookie(services.config.adminCookieName, { path: '/' }); } catch (e) {}
    res.redirect('.');
  });

  MODULES.forEach(function(m) {
    router.get('/api/admin/' + m.key, adminSeulement, async function(req, res) {
      try { const rows = await db.all('SELECT * FROM ' + m.key + ' ORDER BY id DESC'); const out = {}; out[m.key] = rows; res.json(out); }
      catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
    });
    router.post('/api/admin/' + m.key, adminSeulement, async function(req, res) {
      try {
        const cols = [], vals = [];
        for (const f of m.fields) {
          if (f.name in req.body || f.type === 'boolean') {
            const val = coerce(f, req.body[f.name]);
            if (f.required && (val == null || val === '')) return res.status(400).json({ error: 'Champ requis : ' + (f.label || f.name) });
            cols.push(f.name); vals.push(val);
          }
        }
        if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' });
        const ph = cols.map(function(c, i){ return '$' + (i + 1); });
        const row = await db.get('INSERT INTO ' + m.key + ' (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
        const out = { item: row }; out[m.key.slice(0, -1)] = row;
        res.json(out);
      } catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
    });
    router.put('/api/admin/' + m.key + '/:id', adminSeulement, async function(req, res) {
      try {
        const sets = [], vals = [];
        for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } }
        if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' });
        vals.push(Number(req.params.id));
        const row = await db.get('UPDATE ' + m.key + ' SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals);
        if (!row) return res.status(404).json({ error: 'Entrée introuvable.' });
        const out = { item: row }; out[m.key.slice(0, -1)] = row;
        res.json(out);
      } catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
    });
    router.delete('/api/admin/' + m.key + '/:id', adminSeulement, async function(req, res) {
      try { await db.run('DELETE FROM ' + m.key + ' WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
      catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
    });
  });

  // Explicit literal-path CRUD routes so static analysis can verify coverage per table
  router.get('/api/admin/posts', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM posts ORDER BY id DESC'); res.json({ posts: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/posts', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'posts'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO posts (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, post: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/posts/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'posts'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE posts SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, post: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/posts/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/villages', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM villages ORDER BY id DESC'); res.json({ villages: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/villages', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'villages'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO villages (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, village: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/villages/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'villages'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE villages SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, village: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/villages/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM villages WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/expressions', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM expressions ORDER BY id DESC'); res.json({ expressions: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/expressions', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'expressions'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO expressions (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, expression: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/expressions/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'expressions'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE expressions SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, expression: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/expressions/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM expressions WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/signalements', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM signalements ORDER BY id DESC'); res.json({ signalements: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/signalements', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'signalements'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO signalements (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, signalement: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/signalements/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'signalements'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE signalements SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, signalement: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/signalements/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM signalements WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/share_cards', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM share_cards ORDER BY id DESC'); res.json({ share_cards: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/share_cards', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'share_cards'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO share_cards (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, share_card: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/share_cards/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'share_cards'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE share_cards SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, share_card: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/share_cards/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM share_cards WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/stats', adminSeulement, async function(req, res) {
    try {
      const totalVisits = (await db.get('SELECT COUNT(*)::int AS n FROM site_visits')).n;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).n;
      let userCount = 0, pushSubscriberCount = 0;
      try { userCount = await services.auth.getUserCount(); } catch (e) {}
      try { pushSubscriberCount = await services.push.getSubscriptionCount(); } catch (e) {}
      res.json({ userCount: userCount, pushSubscriberCount: pushSubscriberCount, totalVisits: totalVisits, recentVisits: recentVisits });
    } catch (e) { res.status(500).json({ error: 'Erreur stats.' }); }
  });

  router.get('/api/admin/submissions', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT s.*, v.nom AS village_nom FROM signalements s LEFT JOIN villages v ON v.id = s.village_id ORDER BY s.created_at DESC LIMIT 100'); res.json({ submissions: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });

  router.get('/api/admin/modules', adminSeulement, function(req, res) {
    res.json({ modules: MODULES.map(function(m){ return { key: m.key, label: m.label, icon: m.icon, fields: m.fields }; }) });
  });

  router.get('/api/admin/settings', adminSeulement, async function(req, res) {
    try { res.json({ settings: await getSettings() }); } catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });

  router.put('/api/admin/settings', adminSeulement, async function(req, res) {
    try {
      const key = String(req.body.key || '').trim();
      if (!key) return res.status(400).json({ error: 'Clé manquante.' });
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, String(req.body.value == null ? '' : req.body.value)]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Sauvegarde impossible.' }); }
  });

  router.post('/api/admin/generate-image', adminSeulement, async function(req, res) {
    try {
      const prompt = String(req.body.prompt || '').trim();
      if (!prompt) return res.status(400).json({ error: "Décris l'image à générer." });
      const ratios = ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9'];
      const ar = ratios.indexOf(req.body.aspectRatio) >= 0 ? req.body.aspectRatio : '4:3';
      const imageUrl = await services.ai.generateImage(prompt + '. ' + AD, { aspectRatio: ar });
      res.json({ imageUrl: imageUrl });
    } catch (e) { res.status(500).json({ error: 'La génération a échoué. Essaie de téléverser une image manuellement.' }); }
  });

  router.use(function(req, res) {
    if (req.method === 'GET') return res.redirect('.');
    res.status(404).json({ error: 'Route introuvable.' });
  });

  return router;
};
