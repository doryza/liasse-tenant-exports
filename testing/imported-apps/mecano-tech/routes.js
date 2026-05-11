module.exports = function(services) {
const router = require('express').Router();
const db = services.db;

function formatPrice(p) { if (p == null) return '—'; return Number(p).toFixed(2) + ' $'; }
function formatDate(d) { if (!d) return ''; try { return new Date(d).toLocaleDateString('fr-CA', { year:'numeric', month:'short', day:'numeric'}); } catch(e) { return ''; } }
function truncate(s, n) { if (!s) return ''; s = String(s); return s.length > n ? s.slice(0, n) + '…' : s; }
function esc(s) { return String(s == null ? '' : s); }

const T_FR = {
  app_name: 'MécanoTech', tagline: 'Assistant intelligent pour mécaniciens',
  nav_home: 'Accueil', nav_diagnostics: 'Diagnostics', nav_procedures: 'Procédures', nav_parts: 'Pièces', nav_assistant: 'Assistant IA', nav_inventory: 'Inventaire', nav_profile: 'Mon compte', nav_login: 'Connexion',
  btn_search: 'Rechercher', btn_submit: 'Envoyer', btn_save: 'Enregistrer', btn_favorite: 'Favori', btn_remove: 'Retirer', btn_voice: 'Parler', btn_photo: 'Photo', btn_analyze: 'Analyser', btn_view: 'Consulter', btn_back: 'Retour',
  empty_diagnostics: 'Aucun diagnostic disponible pour le moment.', empty_procedures: 'Aucune procédure disponible.', empty_parts: 'Aucune pièce répertoriée.', empty_posts: 'Aucun article publié.', empty_inventory: 'Inventaire vide.', empty_favorites: 'Aucun favori enregistré.',
  hero_cta_assistant: 'Lancer l\'assistant', hero_cta_diagnostics: 'Voir les diagnostics',
  feature_diag_title: 'Diagnostic intelligent', feature_diag_desc: 'Décrivez le symptôme à la voix ou par texte et obtenez des causes probables et des solutions économiques.',
  feature_voice_title: 'Commandes vocales', feature_voice_desc: 'Gardez les mains libres pendant que vous travaillez. Posez vos questions à voix haute.',
  feature_photo_title: 'Reconnaissance par photo', feature_photo_desc: 'Prenez une photo d\'une pièce inconnue, obtenez son identification et ses spécifications.',
  feature_guide_title: 'Guidage étape par étape', feature_guide_desc: 'Instructions vocales pour les procédures courantes (vidange, freins, courroie…).',
  feature_inv_title: 'Inventaire intégré', feature_inv_desc: 'Vérifiez la disponibilité des pièces de votre garage en temps réel.',
  feature_eco_title: 'Solutions économiques', feature_eco_desc: 'Réparations astucieuses à faible coût avant de proposer un remplacement complet.',
  section_features: 'Fonctionnalités clés', section_recent_diag: 'Diagnostics récents', section_procedures: 'Procédures populaires', section_tips: 'Conseils techniques',
  difficulty: 'Difficulté', duration: 'Durée', tools_needed: 'Outils requis', symptoms: 'Symptômes', causes: 'Causes probables', solutions: 'Solutions recommandées', severity: 'Gravité', vehicle: 'Type de véhicule',
  part_number: 'Numéro de pièce', category: 'Catégorie', stock: 'Stock', specs: 'Spécifications', price: 'Prix',
  assistant_title: 'Assistant IA Mécanicien', assistant_desc: 'Décrivez le problème, identifiez une pièce par photo, ou demandez une procédure.',
  assistant_tab_diag: 'Diagnostic', assistant_tab_photo: 'Identifier pièce', assistant_tab_guide: 'Guide procédure',
  assistant_diag_placeholder: 'Ex: bruit de claquement au démarrage à froid moteur 2.0L…',
  assistant_guide_placeholder: 'Ex: changement d\'huile sur Honda Civic 2018',
  assistant_listening: 'Écoute…', assistant_thinking: 'Analyse en cours…',
  contact_title: 'Nous contacter', contact_name: 'Nom', contact_email: 'Courriel', contact_phone: 'Téléphone', contact_message: 'Message', contact_sent: 'Message envoyé. Merci !',
  login_required: 'Vous devez vous connecter pour utiliser cette fonctionnalité.', login_link: 'Se connecter',
  added_favorite: 'Ajouté aux favoris', removed_favorite: 'Retiré des favoris',
  min: 'min', minutes: 'minutes',
  footer_rights: 'Tous droits réservés.', footer_built: 'Construit pour les pros de la mécanique.',
  install_title: 'Installer MécanoTech', push_title: 'Activer les notifications'
};

function applyTextOverrides(t, settings, lang) {
  for (var k in settings) {
    if (k.indexOf('text_') === 0 && k.endsWith('_' + lang)) {
      var tKey = k.slice(5, -(lang.length + 1));
      if (tKey) t[tKey] = settings[k];
    }
  }
  return t;
}

async function getSettings() {
  try {
    const rows = await db.all('SELECT key, value FROM admin_settings');
    const o = {};
    rows.forEach(function(r) { o[r.key] = r.value; });
    return o;
  } catch (e) { return {}; }
}

async function baseLocals() {
  const settings = await getSettings();
  const t = applyTextOverrides(Object.assign({}, T_FR), settings, 'fr');
  return { t: t, lang: 'fr', settings: settings, formatPrice: formatPrice, formatDate: formatDate, truncate: truncate };
}

router.use(async function(req, res, next) {
  if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
    try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
  }
  next();
});

function requireAdmin(req, res, next) {
  if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  next();
}

router.get('/', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  let recentDiag = [], popularProc = [], recentPosts = [];
  try { recentDiag = await db.all('SELECT * FROM diagnostics ORDER BY created_at DESC LIMIT 4'); } catch(e) {}
  try { popularProc = await db.all('SELECT * FROM procedures ORDER BY created_at DESC LIMIT 3'); } catch(e) {}
  try { recentPosts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3'); } catch(e) {}
  res.render('index', Object.assign(locals, { user: req.user || null, recentDiag: recentDiag, popularProc: popularProc, recentPosts: recentPosts, page: 'home' }));
});

router.get('/diagnostics', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  const q = req.query.q ? String(req.query.q).trim() : '';
  let items = [];
  try {
    if (q) items = await db.all("SELECT * FROM diagnostics WHERE title ILIKE $1 OR symptoms ILIKE $1 OR causes ILIKE $1 ORDER BY created_at DESC", ['%' + q + '%']);
    else items = await db.all('SELECT * FROM diagnostics ORDER BY created_at DESC');
  } catch(e) {}
  res.render('diagnostics', Object.assign(locals, { user: req.user || null, items: items, q: q, page: 'diagnostics' }));
});

router.get('/diagnostics/:id', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  let item = null;
  try { item = await db.get('SELECT * FROM diagnostics WHERE id = $1', [req.params.id]); } catch(e) {}
  if (!item) return res.redirect('diagnostics');
  res.render('diagnostic-detail', Object.assign(locals, { user: req.user || null, item: item, page: 'diagnostics' }));
});

router.get('/procedures', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  let items = [];
  try { items = await db.all('SELECT * FROM procedures ORDER BY created_at DESC'); } catch(e) {}
  res.render('procedures', Object.assign(locals, { user: req.user || null, items: items, page: 'procedures' }));
});

router.get('/procedures/:id', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  let item = null;
  try { item = await db.get('SELECT * FROM procedures WHERE id = $1', [req.params.id]); } catch(e) {}
  if (!item) return res.redirect('procedures');
  res.render('procedure-detail', Object.assign(locals, { user: req.user || null, item: item, page: 'procedures' }));
});

router.get('/parts', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  const q = req.query.q ? String(req.query.q).trim() : '';
  let items = [];
  try {
    if (q) items = await db.all("SELECT * FROM parts WHERE name ILIKE $1 OR part_number ILIKE $1 OR description ILIKE $1 ORDER BY name ASC", ['%' + q + '%']);
    else items = await db.all('SELECT * FROM parts ORDER BY name ASC');
  } catch(e) {}
  res.render('parts', Object.assign(locals, { user: req.user || null, items: items, q: q, page: 'parts' }));
});

router.get('/parts/:id', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  let item = null;
  try { item = await db.get('SELECT * FROM parts WHERE id = $1', [req.params.id]); } catch(e) {}
  if (!item) return res.redirect('parts');
  res.render('part-detail', Object.assign(locals, { user: req.user || null, item: item, page: 'parts' }));
});

router.get('/inventaire', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  const q = req.query.q ? String(req.query.q).trim() : '';
  let items = [];
  try {
    if (q) items = await db.all("SELECT * FROM inventaire WHERE item_name ILIKE $1 OR sku ILIKE $1 ORDER BY item_name ASC", ['%' + q + '%']);
    else items = await db.all('SELECT * FROM inventaire ORDER BY item_name ASC');
  } catch(e) {}
  res.render('inventaire', Object.assign(locals, { user: req.user || null, items: items, q: q, page: 'inventory' }));
});

router.get('/assistant', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  res.render('assistant', Object.assign(locals, { user: req.user || null, page: 'assistant' }));
});

router.get('/profile', services.auth.optionalAuth, async function(req, res) {
  const locals = await baseLocals();
  let favs = { diagnostics: [], procedures: [], parts: [] };
  if (req.user) {
    try {
      const rows = await db.all('SELECT * FROM favoris WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
      const dIds = rows.filter(function(r){return r.item_type === 'diagnostic';}).map(function(r){return r.item_id;});
      const pIds = rows.filter(function(r){return r.item_type === 'procedure';}).map(function(r){return r.item_id;});
      const ptIds = rows.filter(function(r){return r.item_type === 'part';}).map(function(r){return r.item_id;});
      if (dIds.length) favs.diagnostics = await db.all('SELECT * FROM diagnostics WHERE id = ANY($1)', [dIds]);
      if (pIds.length) favs.procedures = await db.all('SELECT * FROM procedures WHERE id = ANY($1)', [pIds]);
      if (ptIds.length) favs.parts = await db.all('SELECT * FROM parts WHERE id = ANY($1)', [ptIds]);
    } catch(e) {}
  }
  res.render('profile', Object.assign(locals, { user: req.user || null, favs: favs, page: 'profile' }));
});

router.post('/api/favoris', services.auth.requireAuth, async function(req, res) {
  const { item_type, item_id } = req.body;
  if (!item_type || !item_id) return res.status(400).json({ error: 'Champs manquants' });
  try {
    const existing = await db.get('SELECT id FROM favoris WHERE user_id = $1 AND item_type = $2 AND item_id = $3', [req.user.id, item_type, item_id]);
    if (existing) {
      await db.run('DELETE FROM favoris WHERE id = $1', [existing.id]);
      return res.json({ favorited: false });
    }
    await db.run('INSERT INTO favoris (user_id, item_type, item_id) VALUES ($1, $2, $3)', [req.user.id, item_type, item_id]);
    res.json({ favorited: true });
  } catch(e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/api/favoris/check', services.auth.requireAuth, async function(req, res) {
  const { item_type, item_id } = req.query;
  try {
    const row = await db.get('SELECT id FROM favoris WHERE user_id = $1 AND item_type = $2 AND item_id = $3', [req.user.id, item_type, item_id]);
    res.json({ favorited: !!row });
  } catch(e) { res.json({ favorited: false }); }
});

router.post('/api/contact', async function(req, res) {
  const { name, email, phone, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'Nom et message requis' });
  try {
    await db.run('INSERT INTO form_submissions (name, email, phone, message) VALUES ($1, $2, $3, $4)', [name, email || '', phone || '', message]);
    try {
      if (services.config.contactEmail) {
        await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message MécanoTech — ' + name, html: '<h3>Nouveau message</h3><p><b>Nom:</b> ' + esc(name) + '</p><p><b>Courriel:</b> ' + esc(email) + '</p><p><b>Téléphone:</b> ' + esc(phone) + '</p><p><b>Message:</b><br>' + esc(message).replace(/\n/g, '<br>') + '</p>' });
      }
    } catch(e) { console.error('Email failed:', e.message); }
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'Échec de l\'envoi' }); }
});

async function callGemini(parts, apiKey) {
  const r = await services.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: parts }] })
  });
  const d = await r.json();
  if (!r.ok) throw new Error((d.error && d.error.message) || 'Erreur Gemini');
  return (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0] && d.candidates[0].content.parts[0].text) || '';
}

router.post('/api/ai/diagnose', services.auth.optionalAuth, async function(req, res) {
  const apiKey = services.externalVars.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Clé API Gemini non configurée. Ajoutez-la dans l\'onglet Admin.' });
  const symptom = (req.body.symptom || '').trim();
  if (!symptom) return res.status(400).json({ error: 'Veuillez décrire le symptôme.' });
  const prompt = 'Tu es un mécanicien automobile expert. Un mécanicien te décrit un problème: "' + symptom + '". Réponds en français de manière structurée et concise:\n1) Causes probables (liste numérotée, 3-5 items)\n2) Étapes de diagnostic à effectuer\n3) Solutions économiques en premier (réparations à faible coût avant remplacement complet)\n4) Pièces ou outils nécessaires\n5) Niveau de difficulté (facile / moyen / difficile)\nFormat clair avec des titres. Utilise des termes professionnels mais accessibles.';
  try {
    const text = await callGemini([{ text: prompt }], apiKey);
    try { await db.run('INSERT INTO ai_queries (user_id, query, response, query_type) VALUES ($1, $2, $3, $4)', [req.user ? req.user.id : null, symptom, text, 'diagnostic']); } catch(e) {}
    res.json({ result: text });
  } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Service indisponible' }); }
});

router.post('/api/ai/identify-part', services.auth.optionalAuth, async function(req, res) {
  const apiKey = services.externalVars.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Clé API Gemini non configurée.' });
  const imageData = req.body.image;
  if (!imageData || !imageData.startsWith('data:image/')) return res.status(400).json({ error: 'Image invalide' });
  const m = imageData.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!m) return res.status(400).json({ error: 'Format image non supporté' });
  const mime = m[1], b64 = m[2];
  const prompt = 'Tu es un mécanicien automobile expert. Identifie cette pièce automobile à partir de la photo. Réponds en français:\n1) Nom de la pièce\n2) Fonction / rôle dans le véhicule\n3) Système (moteur, transmission, freinage, suspension, etc.)\n4) Signes d\'usure ou de défaillance à surveiller\n5) Conseils de remplacement ou réparation\nSi la photo ne montre pas clairement une pièce automobile, indique-le.';
  try {
    const text = await callGemini([{ text: prompt }, { inline_data: { mime_type: mime, data: b64 } }], apiKey);
    try { await db.run('INSERT INTO ai_queries (user_id, query, response, query_type) VALUES ($1, $2, $3, $4)', [req.user ? req.user.id : null, '[photo]', text, 'photo']); } catch(e) {}
    res.json({ result: text });
  } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Analyse échouée' }); }
});

router.post('/api/ai/procedure-guide', services.auth.optionalAuth, async function(req, res) {
  const apiKey = services.externalVars.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Clé API Gemini non configurée.' });
  const task = (req.body.task || '').trim();
  if (!task) return res.status(400).json({ error: 'Veuillez décrire la procédure.' });
  const prompt = 'Tu es un instructeur en mécanique automobile. Fournis un guide étape par étape pour: "' + task + '". En français, format adapté à une lecture vocale (phrases courtes, claires, numérotées). Inclus:\n- Outils requis\n- Équipement de sécurité\n- Étapes numérotées (10-15 étapes maximum)\n- Points de vigilance / avertissements\n- Durée estimée et niveau de difficulté\nUtilise un langage simple et professionnel.';
  try {
    const text = await callGemini([{ text: prompt }], apiKey);
    try { await db.run('INSERT INTO ai_queries (user_id, query, response, query_type) VALUES ($1, $2, $3, $4)', [req.user ? req.user.id : null, task, text, 'procedure']); } catch(e) {}
    res.json({ result: text });
  } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Service indisponible' }); }
});

router.get('/admin', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
  const stats = { users: 0, push: 0, totalVisits: 0, recentVisits: 0, diagnostics: 0, procedures: 0, parts: 0, posts: 0, inventaire: 0, submissions: 0, aiQueries: 0 };
  try { stats.users = await services.auth.getUserCount(); } catch(e) {}
  try { stats.push = await services.push.getSubscriptionCount(); } catch(e) {}
  try { const r = await db.get('SELECT COUNT(*)::int AS c FROM site_visits'); stats.totalVisits = r.c; } catch(e) {}
  try { const r = await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"); stats.recentVisits = r.c; } catch(e) {}
  try { const r = await db.get('SELECT COUNT(*)::int AS c FROM diagnostics'); stats.diagnostics = r.c; } catch(e) {}
  try { const r = await db.get('SELECT COUNT(*)::int AS c FROM procedures'); stats.procedures = r.c; } catch(e) {}
  try { const r = await db.get('SELECT COUNT(*)::int AS c FROM parts'); stats.parts = r.c; } catch(e) {}
  try { const r = await db.get('SELECT COUNT(*)::int AS c FROM posts'); stats.posts = r.c; } catch(e) {}
  try { const r = await db.get('SELECT COUNT(*)::int AS c FROM inventaire'); stats.inventaire = r.c; } catch(e) {}
  try { const r = await db.get('SELECT COUNT(*)::int AS c FROM form_submissions'); stats.submissions = r.c; } catch(e) {}
  try { const r = await db.get('SELECT COUNT(*)::int AS c FROM ai_queries'); stats.aiQueries = r.c; } catch(e) {}
  let submissions = [], aiQueries = [];
  try { submissions = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 10'); } catch(e) {}
  try { aiQueries = await db.all('SELECT * FROM ai_queries ORDER BY created_at DESC LIMIT 10'); } catch(e) {}
  res.render('admin', { stats: stats, submissions: submissions, aiQueries: aiQueries, formatDate: formatDate, truncate: truncate, activePage: 'overview' });
});

function adminPage(module, label) {
  return async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    res.render('admin-' + module, { moduleKey: module, moduleLabel: label, title: label, activePage: module });
  };
}
router.get('/admin/diagnostics', adminPage('diagnostics', 'Diagnostics'));
router.get('/admin/procedures', adminPage('procedures', 'Procédures'));
router.get('/admin/parts', adminPage('parts', 'Pièces'));
router.get('/admin/posts', adminPage('posts', 'Articles'));
router.get('/admin/inventaire', adminPage('inventaire', 'Inventaire'));

router.get('/api/admin/stats', requireAdmin, async function(req, res) {
  const out = { userCount: 0, pushSubscriberCount: 0, totalVisits: 0, recentVisits: 0 };
  try { out.userCount = await services.auth.getUserCount(); } catch(e) {}
  try { out.pushSubscriberCount = await services.push.getSubscriptionCount(); } catch(e) {}
  try { const r = await db.get('SELECT COUNT(*)::int AS c FROM site_visits'); out.totalVisits = r.c; } catch(e) {}
  try { const r = await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"); out.recentVisits = r.c; } catch(e) {}
  res.json(out);
});

router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
  try { const rows = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC'); res.json({ submissions: rows }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/admin/ai-queries', requireAdmin, async function(req, res) {
  try { const rows = await db.all('SELECT * FROM ai_queries ORDER BY created_at DESC LIMIT 200'); res.json({ ai_queries: rows }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/admin/modules', requireAdmin, function(req, res) {
  res.json({ modules: [
    { key: 'diagnostics', label: 'Diagnostic', icon: 'alert-triangle', fields: [
      { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre du diagnostic (ex: Voyant moteur allumé code P0420).', placeholder: 'Ex: Voyant moteur allumé code P0420' },
      { name: 'vehicle_type', type: 'text', required: false, maxLength: 100, description: 'Type de véhicule concerné. Laissez vide si applicable à tous.', placeholder: 'Ex: Berline 4 cylindres' },
      { name: 'severity', type: 'select', required: false, options: ['Faible','Modérée','Élevée','Critique'], description: 'Niveau de gravité du problème.' },
      { name: 'symptoms', type: 'textarea', required: false, description: 'Symptômes observables par le mécanicien ou le client.', placeholder: 'Ex: Bruit de claquement à froid, perte de puissance...' },
      { name: 'causes', type: 'textarea', required: false, description: 'Causes probables. Une cause par ligne pour un affichage propre.', placeholder: 'Cause 1\nCause 2\nCause 3' },
      { name: 'solutions', type: 'textarea', required: false, description: 'Solutions recommandées, en commençant par les plus économiques.', placeholder: 'Solution économique d\'abord, puis remplacement si nécessaire' },
      { name: 'image_url', type: 'image', required: false, description: 'Photo illustrative. Recommandé: 800×600 px.' }
    ]},
    { key: 'procedures', label: 'Procédure', icon: 'list', fields: [
      { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Nom de la procédure.', placeholder: 'Ex: Vidange d\'huile moteur' },
      { name: 'description', type: 'textarea', required: false, description: 'Description courte de la procédure.', placeholder: 'À quoi sert cette procédure et quand l\'effectuer' },
      { name: 'difficulty', type: 'select', required: false, options: ['Facile','Moyen','Difficile','Expert'], description: 'Niveau de difficulté pour le mécanicien.' },
      { name: 'duration_min', type: 'number', required: false, min: 1, max: 999, step: 1, description: 'Durée estimée en minutes.', placeholder: 'Ex: 45' },
      { name: 'tools_needed', type: 'textarea', required: false, description: 'Liste des outils nécessaires, séparés par des virgules.', placeholder: 'Clé à filtre, bac de vidange, cric, chandelles' },
      { name: 'steps', type: 'textarea', required: false, description: 'Étapes numérotées de la procédure. Une étape par ligne.', placeholder: '1. Lever le véhicule\n2. Vidanger l\'huile\n3. ...' },
      { name: 'image_url', type: 'image', required: false, description: 'Schéma ou photo. Recommandé: 1200×800 px.' },
      { name: 'video_url', type: 'url', required: false, description: 'Lien vers une vidéo de démonstration (YouTube, etc.).', placeholder: 'https://youtube.com/...' }
    ]},
    { key: 'parts', label: 'Pièce', icon: 'package', fields: [
      { name: 'name', type: 'text', required: true, maxLength: 200, description: 'Nom de la pièce.', placeholder: 'Ex: Plaquettes de frein avant' },
      { name: 'part_number', type: 'text', required: false, maxLength: 100, description: 'Numéro de pièce du fabricant.', placeholder: 'Ex: BP-2245-A' },
      { name: 'category', type: 'text', required: false, maxLength: 80, description: 'Catégorie (Freinage, Moteur, Transmission, etc.).', placeholder: 'Ex: Freinage' },
      { name: 'description', type: 'textarea', required: false, description: 'Description de la pièce et de son rôle.', placeholder: 'Ex: Plaquettes céramique haute performance...' },
      { name: 'specs', type: 'textarea', required: false, description: 'Spécifications techniques (matériau, dimensions, tolérances).', placeholder: 'Matériau: céramique\nÉpaisseur: 12 mm' },
      { name: 'price', type: 'number', required: false, min: 0, step: 0.01, description: 'Prix unitaire en dollars.', placeholder: 'Ex: 89.99' },
      { name: 'stock', type: 'number', required: false, min: 0, step: 1, description: 'Quantité disponible.', placeholder: 'Ex: 12' },
      { name: 'image_url', type: 'image', required: false, description: 'Photo de la pièce. Recommandé: carré 800×800 px.' }
    ]},
    { key: 'posts', label: 'Article', icon: 'edit', fields: [
      { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre de l\'article ou astuce.', placeholder: 'Ex: 5 astuces pour économiser sur les freins' },
      { name: 'category', type: 'text', required: false, maxLength: 60, description: 'Catégorie de l\'article.', placeholder: 'Ex: Astuces, Nouveautés, Techniques' },
      { name: 'content', type: 'textarea', required: false, description: 'Contenu complet de l\'article.', placeholder: 'Écrivez le contenu ici...' },
      { name: 'image_url', type: 'image', required: false, description: 'Image principale. Recommandé: 1200×630 px.' },
      { name: 'published', type: 'boolean', default: true, description: 'Décocher pour mettre en brouillon.' }
    ]},
    { key: 'inventaire', label: 'Inventaire', icon: 'box', fields: [
      { name: 'item_name', type: 'text', required: true, maxLength: 200, description: 'Nom de l\'article en inventaire.', placeholder: 'Ex: Filtre à huile FRAM PH3614' },
      { name: 'sku', type: 'text', required: false, maxLength: 60, description: 'Code SKU interne.', placeholder: 'Ex: INV-00432' },
      { name: 'quantity', type: 'number', required: false, min: 0, step: 1, description: 'Quantité en stock.', placeholder: 'Ex: 24' },
      { name: 'location', type: 'text', required: false, maxLength: 80, description: 'Emplacement physique (allée, étagère).', placeholder: 'Ex: Allée B, étagère 3' },
      { name: 'supplier', type: 'text', required: false, maxLength: 120, description: 'Fournisseur principal.', placeholder: 'Ex: NAPA' },
      { name: 'unit_price', type: 'number', required: false, min: 0, step: 0.01, description: 'Prix unitaire d\'achat.', placeholder: 'Ex: 7.50' },
      { name: 'image_url', type: 'image', required: false, description: 'Photo optionnelle de l\'article.' }
    ]}
  ], settingsFields: [] });
});

router.get('/api/admin/settings', requireAdmin, async function(req, res) {
  try { const rows = await db.all('SELECT key, value FROM admin_settings'); const o = {}; rows.forEach(function(r){ o[r.key] = r.value; }); res.json({ settings: o }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.put('/api/admin/settings', requireAdmin, async function(req, res) {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'Clé requise' });
  try { await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value == null ? '' : String(value)]); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

const MODULE_FIELDS = {
  diagnostics: ['title','vehicle_type','severity','symptoms','causes','solutions','image_url'],
  procedures: ['title','description','difficulty','duration_min','tools_needed','steps','image_url','video_url'],
  parts: ['name','part_number','category','description','specs','price','stock','image_url'],
  posts: ['title','category','content','image_url','published'],
  inventaire: ['item_name','sku','quantity','location','supplier','unit_price','image_url']
};

function sanitize(module, body) {
  const allowed = MODULE_FIELDS[module];
  const out = {};
  allowed.forEach(function(f) {
    if (body[f] !== undefined) {
      if (f === 'price' || f === 'unit_price') out[f] = body[f] === '' || body[f] == null ? null : Number(body[f]);
      else if (f === 'stock' || f === 'quantity' || f === 'duration_min' || f === 'published') out[f] = body[f] === '' || body[f] == null ? null : (f === 'published' ? (body[f] ? 1 : 0) : parseInt(body[f], 10));
      else out[f] = body[f] == null ? null : String(body[f]);
    }
  });
  return out;
}

function crudRoutes(module) {
  router.get('/api/admin/' + module, requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM ' + module + ' ORDER BY created_at DESC'); const out = {}; out[module] = rows; res.json(out); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/' + module, requireAdmin, async function(req, res) {
    const data = sanitize(module, req.body);
    const keys = Object.keys(data); if (!keys.length) return res.status(400).json({ error: 'Aucune donnée' });
    const cols = keys.join(', '); const ph = keys.map(function(_, i){ return '$' + (i+1); }).join(', '); const vals = keys.map(function(k){ return data[k]; });
    try { const r = await db.run('INSERT INTO ' + module + ' (' + cols + ', updated_at) VALUES (' + ph + ', NOW()) RETURNING id', vals); const row = await db.get('SELECT * FROM ' + module + ' WHERE id = $1', [r.lastInsertRowid]); const out = {}; out[module.replace(/s$/, '')] = row; res.json(out); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/' + module + '/:id', requireAdmin, async function(req, res) {
    const data = sanitize(module, req.body);
    const keys = Object.keys(data); if (!keys.length) return res.status(400).json({ error: 'Aucune donnée' });
    const sets = keys.map(function(k, i){ return k + ' = $' + (i+1); }).join(', '); const vals = keys.map(function(k){ return data[k]; }); vals.push(req.params.id);
    try { await db.run('UPDATE ' + module + ' SET ' + sets + ', updated_at = NOW() WHERE id = $' + (keys.length + 1), vals); const row = await db.get('SELECT * FROM ' + module + ' WHERE id = $1', [req.params.id]); const out = {}; out[module.replace(/s$/, '')] = row; res.json(out); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/' + module + '/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM ' + module + ' WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
}
['diagnostics','procedures','parts','posts','inventaire'].forEach(crudRoutes);

router.post('/api/admin/generate-image', requireAdmin, async function(req, res) {
  const { prompt, aspectRatio } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });
  try { const url = await services.ai.generateImage(prompt, { aspectRatio: aspectRatio || '16:9' }); res.json({ imageUrl: url }); }
  catch(e) { res.status(500).json({ error: 'Génération échouée. Essayez un téléversement manuel.' }); }
});

router.use(function(req, res) {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.redirect('.');
});
  // Catch-all: redirect unknown GET routes to PWA home (prevents "Cannot GET" errors)
  // Only matches GET requests — POST/PUT/DELETE API endpoints are unaffected
  router.get('*', (req, res, next) => {
    // Don't redirect API calls — return 404 JSON instead
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Let admin paths fall through to the platform's admin fallback handler
    if (req.path === '/admin' || req.path.startsWith('/admin/')) {
      return next();
    }
    res.redirect('./');
  });


return router;
};
