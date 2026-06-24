module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;
  const SLUG = 'solo-leveling-training';

  const EPOCH = Date.UTC(2024, 0, 1);
  const DAY_NAMES = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const RANKS = [
    { label:'E', name:'Éveillé', minLevel:1, color:'#94a3b8' },
    { label:'D', name:'Apprenti', minLevel:10, color:'#34d399' },
    { label:'C', name:'Aguerri', minLevel:20, color:'#22d3ee' },
    { label:'B', name:'Élite', minLevel:30, color:'#a78bfa' },
    { label:'A', name:'Maître', minLevel:40, color:'#f87171' },
    { label:'S', name:'Monarque', minLevel:50, color:'#fbbf24' }
  ];

  function getWeekNumber() { return Math.floor((Date.now() - EPOCH) / (7*24*3600*1000)); }
  function todayIdx() { return (new Date().getDay() + 6) % 7; }
  function currentVariation(wk, count) { if (!count || count < 1) return 0; return ((wk % count) + count) % count; }
  function xpToReach(level) { return Math.round(100 * (level-1) * level / 2); }
  function levelFromXp(xp) { let l = 1; while (xp >= xpToReach(l+1)) l++; return l; }
  function rankFromLevel(l) { for (let i = RANKS.length-1; i >= 0; i--) { if (l >= RANKS[i].minLevel) return RANKS[i]; } return RANKS[0]; }
  function formatDate(d) { try { return new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }); } catch(e) { return ''; } }

  async function getSettings() {
    let rows = [];
    try { rows = await db.all('SELECT key, value FROM admin_settings'); } catch(e) {}
    const map = {};
    (rows||[]).forEach(function(r){ map[r.key] = r.value; });
    if (!map.contact_email) map.contact_email = services.config.contactEmail || '';
    if (!map.contact_phone) map.contact_phone = services.config.contactPhone || '';
    if (!map.business_name) map.business_name = services.config.businessName || services.config.displayName || 'ASCENSION';
    if (!map.business_address) map.business_address = services.config.businessAddress || '';
    return map;
  }

  async function getHunterState(userId) {
    let stats = await db.get('SELECT * FROM hunter_stats WHERE user_id = $1', [userId]);
    if (!stats) { await db.run('INSERT INTO hunter_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [userId]); stats = await db.get('SELECT * FROM hunter_stats WHERE user_id = $1', [userId]); }
    const xp = (stats && stats.total_xp) || 0;
    const level = levelFromXp(xp);
    const rank = rankFromLevel(level);
    const curBase = xpToReach(level);
    const nextNeed = xpToReach(level+1);
    const into = xp - curBase;
    const span = Math.max(1, nextNeed - curBase);
    const pct = Math.min(100, Math.round((into/span)*100));
    return { stats: stats || {}, xp, level, rank, into, span, nextNeed, pct };
  }

  async function buildWeek() {
    const days = await db.all('SELECT * FROM routine_days ORDER BY day_index ASC');
    const wk = getWeekNumber();
    const result = [];
    for (const d of (days||[])) {
      const varRows = await db.all('SELECT DISTINCT variation_index FROM exercises WHERE day_index = $1 ORDER BY variation_index', [d.day_index]);
      const count = (varRows||[]).length;
      const curVar = currentVariation(wk, count);
      const exercises = await db.all('SELECT * FROM exercises WHERE day_index = $1 AND variation_index = $2 ORDER BY order_index ASC, id ASC', [d.day_index, curVar]);
      const variationLabel = (exercises[0] && exercises[0].variation_label) || '';
      const xpTotal = (d.base_xp||0) + (exercises||[]).reduce(function(s,e){ return s + (e.xp_reward||0); }, 0);
      result.push(Object.assign({}, d, { exercises: exercises||[], curVar, variationCount: count, variationLabel, xpTotal }));
    }
    return { week: wk, days: result };
  }

  function requireAdmin(req, res, next) { if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' }); next(); }

  router.use(express.json({ limit: '15mb' }));
  router.use(express.urlencoded({ extended: true }));

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  router.get('/', services.auth.optionalAuth, async function(req, res) {
    try {
      const settings = await getSettings();
      const wk = await buildWeek();
      const ti = todayIdx();
      let posts = [];
      try { posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3'); } catch(e) {}
      res.render('index', { settings, days: wk.days, week: wk.week, todayIndex: ti, posts: posts||[], formatDate, DAY_NAMES });
    } catch(e) { console.error('index', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/routine', services.auth.optionalAuth, async function(req, res) {
    try {
      const settings = await getSettings();
      const wk = await buildWeek();
      res.render('routine', { settings, days: wk.days, week: wk.week, todayIndex: todayIdx(), DAY_NAMES });
    } catch(e) { console.error('routine', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/jour/:dayIndex', services.auth.optionalAuth, async function(req, res) {
    try {
      const di = parseInt(req.params.dayIndex, 10);
      if (isNaN(di) || di < 0 || di > 6) return res.redirect('routine');
      const settings = await getSettings();
      const day = await db.get('SELECT * FROM routine_days WHERE day_index = $1', [di]);
      if (!day) return res.redirect('routine');
      const week = getWeekNumber();
      const varRows = await db.all('SELECT DISTINCT variation_index FROM exercises WHERE day_index = $1 ORDER BY variation_index', [di]);
      const count = (varRows||[]).length;
      const curVar = currentVariation(week, count);
      const exercises = await db.all('SELECT * FROM exercises WHERE day_index = $1 AND variation_index = $2 ORDER BY order_index ASC, id ASC', [di, curVar]);
      const allVariations = [];
      for (const vr of (varRows||[])) {
        const exs = await db.all('SELECT * FROM exercises WHERE day_index = $1 AND variation_index = $2 ORDER BY order_index ASC, id ASC', [di, vr.variation_index]);
        allVariations.push({ index: vr.variation_index, label: (exs[0] && exs[0].variation_label) || ('Variation ' + (vr.variation_index+1)), exercises: exs||[] });
      }
      const xpTotal = (day.base_xp||0) + (exercises||[]).reduce(function(s,e){ return s + (e.xp_reward||0); }, 0);
      let completed = false;
      if (req.user) { const c = await db.get('SELECT id FROM quest_completions WHERE user_id = $1 AND day_index = $2 AND week_number = $3', [req.user.id, di, week]); completed = !!c; }
      res.render('jour', { settings, day, week, curVar, count, exercises: exercises||[], allVariations, xpTotal, completed, dayName: DAY_NAMES[di], todayIndex: todayIdx() });
    } catch(e) { console.error('jour', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/progression', services.auth.optionalAuth, async function(req, res) {
    try {
      const settings = await getSettings();
      const wk = await buildWeek();
      res.render('progression', { settings, days: wk.days, ranks: RANKS, week: wk.week, DAY_NAMES, formatDate });
    } catch(e) { console.error('progression', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/journal', async function(req, res) {
    try {
      const settings = await getSettings();
      const cat = req.query.cat || '';
      let posts;
      if (cat) posts = await db.all('SELECT * FROM posts WHERE published = 1 AND category = $1 ORDER BY created_at DESC', [cat]);
      else posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
      const catRows = await db.all("SELECT DISTINCT category FROM posts WHERE published = 1 AND category IS NOT NULL AND category <> ''");
      res.render('journal', { settings, posts: posts||[], cats: (catRows||[]).map(function(c){ return c.category; }), activeCat: cat, formatDate });
    } catch(e) { console.error('journal', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/journal/:id', async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.redirect('journal');
      const settings = await getSettings();
      const post = await db.get('SELECT * FROM posts WHERE id = $1 AND published = 1', [id]);
      if (!post) return res.redirect('journal');
      const related = await db.all('SELECT * FROM posts WHERE published = 1 AND id <> $1 ORDER BY created_at DESC LIMIT 3', [id]);
      res.render('post', { settings, post, related: related||[], formatDate });
    } catch(e) { console.error('post', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/systeme', async function(req, res) {
    try { const settings = await getSettings(); res.render('systeme', { settings, ranks: RANKS, formatDate }); } catch(e) { console.error('systeme', e.message); res.status(500).send('Erreur'); }
  });

  router.post('/api/quests/complete', services.auth.requireAuth, async function(req, res) {
    try {
      const userId = req.user.id;
      const dayIndex = parseInt(req.body.dayIndex, 10);
      if (isNaN(dayIndex)) return res.status(400).json({ error: 'Jour invalide' });
      const week = getWeekNumber();
      const day = await db.get('SELECT * FROM routine_days WHERE day_index = $1', [dayIndex]);
      if (!day) return res.status(404).json({ error: 'Quête introuvable' });
      const existing = await db.get('SELECT id FROM quest_completions WHERE user_id = $1 AND day_index = $2 AND week_number = $3', [userId, dayIndex, week]);
      if (existing) return res.status(409).json({ error: 'Quête déjà complétée cette semaine' });
      const varRows = await db.all('SELECT DISTINCT variation_index FROM exercises WHERE day_index = $1 ORDER BY variation_index', [dayIndex]);
      const count = (varRows||[]).length;
      const curVar = currentVariation(week, count);
      const exs = await db.all('SELECT xp_reward FROM exercises WHERE day_index = $1 AND variation_index = $2', [dayIndex, curVar]);
      const xpGain = (day.base_xp||0) + (exs||[]).reduce(function(s,e){ return s + (e.xp_reward||0); }, 0);
      await db.run('INSERT INTO quest_completions (user_id, day_index, variation_index, week_number, xp_gained) VALUES ($1,$2,$3,$4,$5)', [userId, dayIndex, curVar, week, xpGain]);
      let stats = await db.get('SELECT * FROM hunter_stats WHERE user_id = $1', [userId]);
      if (!stats) { await db.run('INSERT INTO hunter_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [userId]); stats = await db.get('SELECT * FROM hunter_stats WHERE user_id = $1', [userId]); }
      const today = new Date();
      const todayStr = today.toISOString().slice(0,10);
      let streak = stats.current_streak || 0;
      const last = stats.last_completed_date ? new Date(stats.last_completed_date).toISOString().slice(0,10) : null;
      if (last === todayStr) { if (streak < 1) streak = 1; }
      else { const y = new Date(today.getTime() - 24*3600*1000).toISOString().slice(0,10); streak = (last === y) ? (streak + 1) : 1; }
      const longest = Math.max(stats.longest_streak||0, streak);
      const oldLevel = levelFromXp(stats.total_xp||0);
      const newXp = (stats.total_xp||0) + xpGain;
      const newComp = (stats.completions||0) + 1;
      await db.run('UPDATE hunter_stats SET total_xp = $1, completions = $2, current_streak = $3, longest_streak = $4, last_completed_date = $5, updated_at = NOW() WHERE user_id = $6', [newXp, newComp, streak, longest, todayStr, userId]);
      const newLevel = levelFromXp(newXp);
      res.json({ success: true, xpGain, totalXp: newXp, level: newLevel, leveledUp: newLevel > oldLevel, rank: rankFromLevel(newLevel), streak });
    } catch(e) { console.error('complete', e.message); res.status(500).json({ error: 'Erreur lors de la validation de la quête' }); }
  });

  router.get('/api/me/stats', services.auth.requireAuth, async function(req, res) {
    try {
      const week = getWeekNumber();
      const st = await getHunterState(req.user.id);
      const comps = await db.all('SELECT day_index FROM quest_completions WHERE user_id = $1 AND week_number = $2', [req.user.id, week]);
      res.json({ loggedIn: true, level: st.level, xp: st.xp, rank: st.rank, pct: st.pct, into: st.into, span: st.span, nextNeed: st.nextNeed, streak: (st.stats.current_streak||0), longestStreak: (st.stats.longest_streak||0), completions: (st.stats.completions||0), completedDays: (comps||[]).map(function(c){ return c.day_index; }), weekNumber: week });
    } catch(e) { res.status(500).json({ error: 'Erreur' }); }
  });

  router.get('/api/me/history', services.auth.requireAuth, async function(req, res) {
    try {
      const rows = await db.all('SELECT qc.day_index, qc.week_number, qc.xp_gained, qc.completed_at, rd.title FROM quest_completions qc LEFT JOIN routine_days rd ON rd.day_index = qc.day_index WHERE qc.user_id = $1 ORDER BY qc.completed_at DESC LIMIT 40', [req.user.id]);
      res.json({ history: rows||[] });
    } catch(e) { res.status(500).json({ error: 'Erreur' }); }
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const name = (req.body.name||'').trim();
      const email = (req.body.email||'').trim();
      const message = (req.body.message||'').trim();
      if (!name || !message) return res.status(400).json({ error: 'Nom et message requis' });
      await db.run('INSERT INTO form_submissions (name, email, message) VALUES ($1,$2,$3)', [name, email, message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message — ASCENSION', html: '<p><strong>' + name + '</strong> (' + (email||'sans courriel') + ')</p><p>' + message.replace(/</g,'&lt;') + '</p>' });
        }
      } catch(mailErr) { console.error('mail', mailErr.message); }
      res.json({ success: true });
    } catch(e) { console.error('contact', e.message); res.status(500).json({ error: 'Envoi impossible' }); }
  });

  const MODULES = [
    { key:'posts', label:'Journal du Système', icon:'edit', fields:[
      { name:'title', type:'text', required:true, maxLength:200, description:"Titre de l'annonce affiché dans le Journal.", placeholder:'ex. Le Système a évolué' },
      { name:'category', type:'select', options:['Annonce','Conseil','Mise à jour','Récit'], description:'Catégorie pour filtrer les entrées.', placeholder:'ex. Conseil' },
      { name:'content', type:'textarea', description:'Corps de l\'entrée. Sépare les paragraphes par des sauts de ligne.', placeholder:'Rédige ton annonce ici...' },
      { name:'image_url', type:'image', description:'Image de couverture. Recommandé : 1200×630px.' },
      { name:'published', type:'boolean', default:true, description:'Décoche pour mettre en brouillon (masqué aux visiteurs).' }
    ]},
    { key:'routine_days', label:'Jours de la routine', icon:'calendar', fields:[
      { name:'day_index', type:'select', options:['0','1','2','3','4','5','6'], required:true, description:'Jour : 0=Lundi, 1=Mardi, 2=Mercredi, 3=Jeudi, 4=Vendredi, 5=Samedi, 6=Dimanche.', placeholder:'0' },
      { name:'title', type:'text', required:true, maxLength:120, description:'Nom de la quête du jour.', placeholder:'ex. Éveil de la Force' },
      { name:'focus', type:'text', maxLength:60, description:"Domaine d'entraînement (force, cardio, jambes, repos...).", placeholder:'ex. Haut du corps' },
      { name:'description', type:'textarea', description:'Objectif du jour affiché sur la page du jour.', placeholder:'Objectif de la séance...' },
      { name:'rank_label', type:'text', maxLength:40, description:'Étiquette de difficulté affichée sur la carte.', placeholder:'ex. Donjon de rang D' },
      { name:'base_xp', type:'number', min:0, step:5, default:50, description:'XP de base accordée à la complétion (avant XP des exercices).', placeholder:'50' },
      { name:'image_url', type:'image', description:'Image du jour. Recommandé : paysage 1200×800px.' }
    ]},
    { key:'exercises', label:'Exercices (Quêtes)', icon:'list', fields:[
      { name:'day_index', type:'select', options:['0','1','2','3','4','5','6'], required:true, description:'Jour auquel appartient cet exercice : 0=Lundi ... 6=Dimanche.', placeholder:'0' },
      { name:'variation_index', type:'select', options:['0','1','2','3'], default:'0', description:'Variation de la semaine. La routine alterne entre les variations chaque semaine.', placeholder:'0' },
      { name:'variation_label', type:'text', maxLength:60, description:'Nom du protocole (ex. Protocole Alpha).', placeholder:'ex. Protocole Alpha' },
      { name:'name', type:'text', required:true, maxLength:120, description:"Nom de l'exercice.", placeholder:'ex. Pompes diamant' },
      { name:'sets', type:'text', maxLength:30, description:'Nombre de séries.', placeholder:'ex. 4' },
      { name:'reps', type:'text', maxLength:40, description:'Répétitions ou durée par série.', placeholder:'ex. 12-15 ou 45s' },
      { name:'rest_seconds', type:'number', min:0, step:5, description:'Repos entre séries (secondes).', placeholder:'ex. 60' },
      { name:'notes', type:'textarea', description:'Conseils de forme ou instructions.', placeholder:'ex. Garde le dos droit...' },
      { name:'xp_reward', type:'number', min:0, step:5, default:10, description:"XP gagnée pour cet exercice (s'ajoute à l'XP de base du jour).", placeholder:'10' },
      { name:'order_index', type:'number', min:0, step:1, default:0, description:"Ordre d'affichage (plus petit = en premier).", placeholder:'0' },
      { name:'image_url', type:'image', description:"Illustration de l'exercice (optionnel). Recommandé : 800×600px." }
    ]},
    { key:'quest_completions', label:'Complétions de quêtes', icon:'check-circle', fields:[
      { name:'user_id', type:'number', required:true, description:'Identifiant de l\'utilisateur.', placeholder:'1' },
      { name:'day_index', type:'select', options:['0','1','2','3','4','5','6'], required:true, description:'Jour de la quête : 0=Lundi ... 6=Dimanche.', placeholder:'0' },
      { name:'variation_index', type:'number', min:0, description:'Index de la variation effectuée.', placeholder:'0' },
      { name:'week_number', type:'number', required:true, description:'Numéro de la semaine.', placeholder:'0' },
      { name:'xp_gained', type:'number', min:0, default:0, description:'XP obtenue lors de la complétion.', placeholder:'60' }
    ]},
    { key:'hunter_stats', label:'Statistiques des chasseurs', icon:'bar-chart', fields:[
      { name:'user_id', type:'number', required:true, description:'Identifiant de l\'utilisateur.', placeholder:'1' },
      { name:'total_xp', type:'number', min:0, default:0, description:'XP totale accumulée.', placeholder:'0' },
      { name:'completions', type:'number', min:0, default:0, description:'Nombre total de quêtes complétées.', placeholder:'0' },
      { name:'current_streak', type:'number', min:0, default:0, description:'Série de jours consécutifs actuelle.', placeholder:'0' },
      { name:'longest_streak', type:'number', min:0, default:0, description:'Meilleure série de jours consécutifs.', placeholder:'0' },
      { name:'last_completed_date', type:'text', description:'Date de la dernière complétion (YYYY-MM-DD).', placeholder:'2024-01-01' }
    ]},
    { key:'form_submissions', label:'Messages de contact', icon:'mail', fields:[
      { name:'name', type:'text', maxLength:120, description:'Nom de l\'expéditeur.', placeholder:'ex. Sung Jin-Woo' },
      { name:'email', type:'text', maxLength:200, description:'Adresse e-mail de l\'expéditeur.', placeholder:'ex. hunter@systeme.io' },
      { name:'message', type:'textarea', description:'Corps du message.', placeholder:'Contenu du message...' }
    ]}
  ];

  const TABLE_FIELDS = {
    posts: ['title','content','image_url','category','published'],
    routine_days: ['day_index','title','focus','description','rank_label','base_xp','image_url'],
    exercises: ['day_index','variation_index','variation_label','name','sets','reps','rest_seconds','notes','xp_reward','order_index','image_url'],
    quest_completions: ['user_id','day_index','variation_index','week_number','xp_gained'],
    hunter_stats: ['user_id','total_xp','completions','current_streak','longest_streak','last_completed_date'],
    form_submissions: ['name','email','message']
  };

  function normalize(table, field, val) {
    if (field === 'published') return (val === true || val === 'true' || val === 1 || val === '1' || val === 'on') ? 1 : 0;
    const numFields = ['day_index','variation_index','base_xp','rest_seconds','xp_reward','order_index','week_number','xp_gained','user_id','total_xp','completions','current_streak','longest_streak'];
    if (numFields.indexOf(field) >= 0) { const n = parseInt(val, 10); return isNaN(n) ? null : n; }
    return val;
  }

  function adminList(table, key) { return async function(req, res) { if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' }); try { let order = 'created_at DESC'; if (table === 'routine_days') order = 'day_index ASC'; if (table === 'exercises') order = 'day_index ASC, variation_index ASC, order_index ASC'; const rows = await db.all('SELECT * FROM ' + table + ' ORDER BY ' + order); const out = {}; out[key] = rows || []; res.json(out); } catch(e) { res.status(500).json({ error: 'Erreur' }); } }; }

  function adminCreate(table) { return async function(req, res) { if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' }); try { const fields = TABLE_FIELDS[table]; const cols = [], vals = [], ph = []; let i = 1; for (const f of fields) { if (req.body[f] !== undefined) { cols.push(f); vals.push(normalize(table, f, req.body[f])); ph.push('$' + i); i++; } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée' }); const r = await db.run('INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING id', vals); const newId = r && r.lastInsertRowid; const row = newId ? await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [newId]) : null; res.json({ item: row }); } catch(e) { console.error('create', e.message); res.status(500).json({ error: 'Erreur de création' }); } }; }

  function adminUpdate(table) { return async function(req, res) { if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' }); try { const id = parseInt(req.params.id, 10); const fields = TABLE_FIELDS[table]; const sets = [], vals = []; let i = 1; for (const f of fields) { if (req.body[f] !== undefined) { sets.push(f + ' = $' + i); vals.push(normalize(table, f, req.body[f])); i++; } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée' }); sets.push('updated_at = NOW()'); vals.push(id); await db.run('UPDATE ' + table + ' SET ' + sets.join(',') + ' WHERE id = $' + i, vals); const row = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [id]); res.json({ item: row }); } catch(e) { console.error('update', e.message); res.status(500).json({ error: 'Erreur de mise à jour' }); } }; }

  function adminDelete(table) { return async function(req, res) { if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' }); try { await db.run('DELETE FROM ' + table + ' WHERE id = $1', [parseInt(req.params.id, 10)]); res.json({ success: true }); } catch(e) { res.status(500).json({ error: 'Erreur' }); } }; }

  router.get('/api/admin/posts', adminList('posts', 'posts'));
  router.post('/api/admin/posts', adminCreate('posts'));
  router.put('/api/admin/posts/:id', adminUpdate('posts'));
  router.delete('/api/admin/posts/:id', adminDelete('posts'));

  router.get('/api/admin/routine_days', adminList('routine_days', 'routine_days'));
  router.post('/api/admin/routine_days', adminCreate('routine_days'));
  router.put('/api/admin/routine_days/:id', adminUpdate('routine_days'));
  router.delete('/api/admin/routine_days/:id', adminDelete('routine_days'));

  router.get('/api/admin/exercises', adminList('exercises', 'exercises'));
  router.post('/api/admin/exercises', adminCreate('exercises'));
  router.put('/api/admin/exercises/:id', adminUpdate('exercises'));
  router.delete('/api/admin/exercises/:id', adminDelete('exercises'));

  router.get('/api/admin/quest_completions', adminList('quest_completions', 'quest_completions'));
  router.post('/api/admin/quest_completions', adminCreate('quest_completions'));
  router.put('/api/admin/quest_completions/:id', adminUpdate('quest_completions'));
  router.delete('/api/admin/quest_completions/:id', adminDelete('quest_completions'));

  router.get('/api/admin/hunter_stats', adminList('hunter_stats', 'hunter_stats'));
  router.post('/api/admin/hunter_stats', adminCreate('hunter_stats'));
  router.put('/api/admin/hunter_stats/:id', adminUpdate('hunter_stats'));
  router.delete('/api/admin/hunter_stats/:id', adminDelete('hunter_stats'));

  router.get('/api/admin/form_submissions', adminList('form_submissions', 'form_submissions'));
  router.post('/api/admin/form_submissions', adminCreate('form_submissions'));
  router.put('/api/admin/form_submissions/:id', adminUpdate('form_submissions'));
  router.delete('/api/admin/form_submissions/:id', adminDelete('form_submissions'));

  router.get('/api/admin/modules', requireAdmin, function(req, res) { res.json({ modules: MODULES, settingsFields: [] }); });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) { const s = await getSettings(); res.json({ settings: s }); });
  router.put('/api/admin/settings', requireAdmin, async function(req, res) { const key = req.body.key; const value = req.body.value; if (!key) return res.status(400).json({ error: 'Clé requise' }); await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value]); res.json({ success: true }); });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      let userCount = 0, pushCount = 0;
      try { userCount = await services.auth.getUserCount(); } catch(e) {}
      try { pushCount = await services.push.getSubscriptionCount(); } catch(e) {}
      const tv = await db.get('SELECT COUNT(*)::int AS c FROM site_visits');
      const rv = await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const pc = await db.get('SELECT COUNT(*)::int AS c FROM posts');
      const dc = await db.get('SELECT COUNT(*)::int AS c FROM routine_days');
      const ec = await db.get('SELECT COUNT(*)::int AS c FROM exercises');
      const cc = await db.get('SELECT COUNT(*)::int AS c FROM quest_completions');
      const sc = await db.get('SELECT COUNT(*)::int AS c FROM form_submissions');
      res.json({ userCount, pushSubscriberCount: pushCount, totalVisits: tv?tv.c:0, recentVisits: rv?rv.c:0, postsCount: pc?pc.c:0, daysCount: dc?dc.c:0, exercisesCount: ec?ec.c:0, completionsCount: cc?cc.c:0, submissionsCount: sc?sc.c:0 });
    } catch(e) { res.status(500).json({ error: 'Erreur' }); }
  });

  router.get('/api/admin/submissions', requireAdmin, async function(req, res) { try { const rows = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 200'); res.json({ submissions: rows||[] }); } catch(e) { res.status(500).json({ error: 'Erreur' }); } });

  router.post('/api/admin/upload', requireAdmin, async function(req, res) {
    try {
      const dataUri = req.body.dataUri;
      if (!dataUri) return res.status(400).json({ error: 'Aucune image' });
      if (!(services.cloudinary && services.cloudinary.uploader && typeof services.cloudinary.uploader.upload === 'function')) return res.status(503).json({ error: 'Service image indisponible' });
      const r = await services.cloudinary.uploader.upload(dataUri, { folder: SLUG + '/uploads' });
      res.json({ url: r.secure_url });
    } catch(e) { console.error('upload', e.message); res.status(500).json({ error: 'Échec du téléversement' }); }
  });

  router.post('/api/admin/generate-image', requireAdmin, async function(req, res) {
    try {
      const prompt = req.body.prompt;
      if (!prompt) return res.status(400).json({ error: 'Description requise' });
      const imageUrl = await services.ai.generateImage(prompt, { aspectRatio: req.body.aspectRatio || '4:3' });
      res.json({ imageUrl });
    } catch(e) { console.error('genimg', e.message); res.status(500).json({ error: 'Génération impossible. Téléverse manuellement.' }); }
  });

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      const settings = await getSettings();
      let userCount = 0, pushCount = 0;
      try { userCount = await services.auth.getUserCount(); } catch(e) {}
      try { pushCount = await services.push.getSubscriptionCount(); } catch(e) {}
      const tv = await db.get('SELECT COUNT(*)::int AS c FROM site_visits');
      const rv = await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const pc = await db.get('SELECT COUNT(*)::int AS c FROM posts');
      const dc = await db.get('SELECT COUNT(*)::int AS c FROM routine_days');
      const ec = await db.get('SELECT COUNT(*)::int AS c FROM exercises');
      const cc = await db.get('SELECT COUNT(*)::int AS c FROM quest_completions');
      const sc = await db.get('SELECT COUNT(*)::int AS c FROM form_submissions');
      const recent = await db.all('SELECT * FROM quest_completions ORDER BY completed_at DESC LIMIT 8');
      const subs = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 6');
      res.render('admin', { settings, active: 'dashboard', stats: { userCount, pushSubscriberCount: pushCount, totalVisits: tv?tv.c:0, recentVisits: rv?rv.c:0, postsCount: pc?pc.c:0, daysCount: dc?dc.c:0, exercisesCount: ec?ec.c:0, completionsCount: cc?cc.c:0, submissionsCount: sc?sc.c:0 }, recent: recent||[], subs: subs||[], formatDate, DAY_NAMES });
    } catch(e) { console.error('admin', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/admin/posts', function(req, res) { if (!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-posts', { active: 'posts' }); });
  router.get('/admin/routine_days', function(req, res) { if (!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-routine_days', { active: 'routine_days' }); });
  router.get('/admin/exercises', function(req, res) { if (!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-exercises', { active: 'exercises' }); });
  router.get('/admin/settings', function(req, res) { if (!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-settings', { active: 'settings' }); });
  router.get('/admin/submissions', function(req, res) { if (!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-submissions', { active: 'submissions' }); });
  router.get('/admin/logout', function(req, res) { try { res.clearCookie(services.config.adminCookieName); } catch(e) {} res.redirect('.'); });

  router.use(function(req, res) {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) return res.redirect('.');
    res.status(404).send('Introuvable');
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
