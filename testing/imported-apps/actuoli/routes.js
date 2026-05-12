module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const T = {
    fr: {
      nav_home: 'Accueil', nav_articles: 'Articles', nav_calendar: 'Calendrier',
      nav_gallery: 'Galerie', nav_podcasts: 'Balados', nav_athletes: 'Athlètes',
      nav_forum: 'Forum', nav_contact: 'Contact', login: 'Connexion'
    }
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
      const s = {};
      rows.forEach(function(r) { s[r.key] = r.value; });
      return s;
    } catch(e) { return {}; }
  }

  function formatDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch(e) { return ''; }
  }

  function formatRelDate(d) {
    if (!d) return '';
    try {
      const date = new Date(d), now = new Date(), diff = (now - date) / 1000;
      if (diff < 60) return "à l'instant";
      if (diff < 3600) return 'il y a ' + Math.floor(diff/60) + ' min';
      if (diff < 86400) return 'il y a ' + Math.floor(diff/3600) + ' h';
      if (diff < 604800) return 'il y a ' + Math.floor(diff/86400) + ' j';
      return formatDate(d);
    } catch(e) { return ''; }
  }

  async function ctx(req, extra) {
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T.fr), settings, 'fr');
    return Object.assign({
      settings: settings, t: t, lang: 'fr',
      user: req.user || null,
      formatDate: formatDate, formatRelDate: formatRelDate
    }, extra || {});
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  router.get('/', services.auth.optionalAuth, async function(req, res) {
    try {
      const featured = await db.all("SELECT * FROM posts WHERE published = 1 AND featured = 1 ORDER BY created_at DESC LIMIT 3");
      const recent = await db.all("SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 6");
      const events = await db.all("SELECT * FROM events WHERE event_date >= CURRENT_DATE ORDER BY event_date ASC LIMIT 4");
      const podcasts = await db.all("SELECT * FROM podcasts ORDER BY created_at DESC LIMIT 3");
      const galleryItems = await db.all("SELECT * FROM gallery ORDER BY created_at DESC LIMIT 6");
      res.render('index', await ctx(req, { featured: featured, recent: recent, events: events, podcasts: podcasts, galleryItems: galleryItems }));
    } catch(e) { console.error('Home:', e); res.status(500).send('Erreur'); }
  });

  router.get('/articles', services.auth.optionalAuth, async function(req, res) {
    try {
      const cat = req.query.cat || '';
      let posts;
      if (cat) posts = await db.all("SELECT * FROM posts WHERE published = 1 AND category = $1 ORDER BY created_at DESC", [cat]);
      else posts = await db.all("SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC");
      const cats = await db.all("SELECT DISTINCT category FROM posts WHERE category IS NOT NULL AND category != '' AND published = 1 ORDER BY category ASC");
      res.render('articles', await ctx(req, { posts: posts, cats: cats, currentCat: cat }));
    } catch(e) { console.error('Articles:', e); res.render('articles', await ctx(req, { posts: [], cats: [], currentCat: '' })); }
  });

  router.get('/article/:id', services.auth.optionalAuth, async function(req, res) {
    try {
      const post = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      if (!post) return res.redirect('articles');
      const related = await db.all('SELECT * FROM posts WHERE id != $1 AND published = 1 ORDER BY created_at DESC LIMIT 3', [req.params.id]);
      res.render('article', await ctx(req, { post: post, related: related }));
    } catch(e) { console.error('Article:', e); res.redirect('articles'); }
  });

  router.get('/calendrier', services.auth.optionalAuth, async function(req, res) {
    try {
      const events = await db.all("SELECT * FROM events WHERE event_date >= CURRENT_DATE - INTERVAL '30 days' ORDER BY event_date ASC");
      res.render('calendrier', await ctx(req, { events: events }));
    } catch(e) { console.error('Calendar:', e); res.render('calendrier', await ctx(req, { events: [] })); }
  });

  router.get('/galerie', services.auth.optionalAuth, async function(req, res) {
    try {
      const items = await db.all('SELECT * FROM gallery ORDER BY created_at DESC');
      res.render('galerie', await ctx(req, { items: items }));
    } catch(e) { console.error('Gallery:', e); res.render('galerie', await ctx(req, { items: [] })); }
  });

  router.get('/balados', services.auth.optionalAuth, async function(req, res) {
    try {
      const podcasts = await db.all('SELECT * FROM podcasts ORDER BY created_at DESC');
      res.render('balados', await ctx(req, { podcasts: podcasts }));
    } catch(e) { console.error('Podcasts:', e); res.render('balados', await ctx(req, { podcasts: [] })); }
  });

  router.get('/athletes', services.auth.optionalAuth, async function(req, res) {
    try {
      const athletes = await db.all('SELECT * FROM athletes ORDER BY name ASC');
      res.render('athletes', await ctx(req, { athletes: athletes }));
    } catch(e) { console.error('Athletes:', e); res.render('athletes', await ctx(req, { athletes: [] })); }
  });

  router.get('/athlete/:id', services.auth.optionalAuth, async function(req, res) {
    try {
      const athlete = await db.get('SELECT * FROM athletes WHERE id = $1', [req.params.id]);
      if (!athlete) return res.redirect('athletes');
      res.render('athlete', await ctx(req, { athlete: athlete }));
    } catch(e) { console.error('Athlete:', e); res.redirect('athletes'); }
  });

  router.get('/forum', services.auth.optionalAuth, async function(req, res) {
    try {
      const topics = await db.all("SELECT t.*, (SELECT COUNT(*) FROM forum_messages WHERE topic_id = t.id) AS message_count FROM forum_topics t ORDER BY t.created_at DESC");
      res.render('forum', await ctx(req, { topics: topics }));
    } catch(e) { console.error('Forum:', e); res.render('forum', await ctx(req, { topics: [] })); }
  });

  router.get('/forum/:id', services.auth.optionalAuth, async function(req, res) {
    try {
      const topic = await db.get('SELECT * FROM forum_topics WHERE id = $1', [req.params.id]);
      if (!topic) return res.redirect('forum');
      const messages = await db.all('SELECT * FROM forum_messages WHERE topic_id = $1 ORDER BY created_at ASC', [req.params.id]);
      res.render('forum-sujet', await ctx(req, { topic: topic, messages: messages }));
    } catch(e) { console.error('Topic:', e); res.redirect('forum'); }
  });

  router.post('/api/forum/topics', services.auth.requireAuth, async function(req, res) {
    try {
      const title = (req.body.title || '').trim();
      const content = (req.body.content || '').trim();
      const category = (req.body.category || 'Général').trim();
      if (!title || !content) return res.status(400).json({ error: 'Titre et message requis' });
      const author = req.user.display_name || req.user.email || req.user.phone || 'Utilisateur';
      const result = await db.run('INSERT INTO forum_topics (title, content, user_id, author_name, category) VALUES ($1, $2, $3, $4, $5) RETURNING id', [title, content, req.user.id, author, category]);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch(e) { console.error('Topic create:', e); res.status(500).json({ error: 'Erreur' }); }
  });

  router.post('/api/forum/messages', services.auth.requireAuth, async function(req, res) {
    try {
      const topicId = parseInt(req.body.topic_id, 10);
      const content = (req.body.content || '').trim();
      if (!topicId || !content) return res.status(400).json({ error: 'Message requis' });
      const author = req.user.display_name || req.user.email || req.user.phone || 'Utilisateur';
      await db.run('INSERT INTO forum_messages (topic_id, user_id, author_name, content) VALUES ($1, $2, $3, $4)', [topicId, req.user.id, author, content]);
      res.json({ success: true });
    } catch(e) { console.error('Msg create:', e); res.status(500).json({ error: 'Erreur' }); }
  });

  router.get('/contact', services.auth.optionalAuth, async function(req, res) {
    res.render('contact', await ctx(req));
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const name = (req.body.name || '').trim();
      const email = (req.body.email || '').trim();
      const subject = (req.body.subject || '').trim();
      const message = (req.body.message || '').trim();
      if (!name || !message) return res.status(400).json({ error: 'Nom et message requis' });
      await db.run('INSERT INTO form_submissions (name, email, subject, message) VALUES ($1, $2, $3, $4)', [name, email, subject, message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Actuoli — ' + (subject || 'Nouveau message de ' + name),
            html: '<h2>Nouveau message via Actuoli</h2><p><strong>Nom :</strong> ' + name + '</p><p><strong>Courriel :</strong> ' + (email || 'non fourni') + '</p><p><strong>Sujet :</strong> ' + (subject || '—') + '</p><hr><p>' + message.replace(/\n/g, '<br>') + '</p>'
          });
        }
      } catch(emailErr) { console.error('Email failed:', emailErr.message); }
      res.json({ success: true });
    } catch(e) { console.error('Contact:', e); res.status(500).json({ error: "Erreur d'enregistrement" }); }
  });

  router.get('/abonnement', services.auth.optionalAuth, async function(req, res) {
    res.render('abonnement', await ctx(req));
  });

  router.post('/api/subscribe', async function(req, res) {
    try {
      const email = (req.body.email || '').trim().toLowerCase();
      const name = (req.body.name || '').trim();
      if (!email || !email.includes('@')) return res.status(400).json({ error: 'Courriel invalide' });
      await db.run('INSERT INTO email_subscribers (email, name) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()', [email, name]);
      res.json({ success: true });
    } catch(e) { console.error('Subscribe:', e); res.status(500).json({ error: 'Erreur' }); }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) {
      if (req.path.startsWith('/api/')) return res.status(403).json({ error: 'Forbidden' });
      return res.redirect('admin/login');
    }
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const visitsTotal = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c || 0;
      const visitsRecent = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c || 0;
      const postCount = (await db.get('SELECT COUNT(*)::int AS c FROM posts')).c || 0;
      const publishedCount = (await db.get('SELECT COUNT(*)::int AS c FROM posts WHERE published = 1')).c || 0;
      const draftCount = postCount - publishedCount;
      const eventCount = (await db.get('SELECT COUNT(*)::int AS c FROM events')).c || 0;
      const upcomingEvents = (await db.get('SELECT COUNT(*)::int AS c FROM events WHERE event_date >= CURRENT_DATE')).c || 0;
      const galleryCount = (await db.get('SELECT COUNT(*)::int AS c FROM gallery')).c || 0;
      const podcastCount = (await db.get('SELECT COUNT(*)::int AS c FROM podcasts')).c || 0;
      const athleteCount = (await db.get('SELECT COUNT(*)::int AS c FROM athletes')).c || 0;
      const forumCount = (await db.get('SELECT COUNT(*)::int AS c FROM forum_topics')).c || 0;
      const subscriberCount = (await db.get('SELECT COUNT(*)::int AS c FROM email_subscribers')).c || 0;
      const submissionCount = (await db.get('SELECT COUNT(*)::int AS c FROM form_submissions')).c || 0;
      const recentSubmissions = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5');
      res.render('admin', {
        currentPath: 'admin',
        stats: {
          userCount: userCount, pushCount: pushCount, visitsTotal: visitsTotal, visitsRecent: visitsRecent,
          postCount: postCount, publishedCount: publishedCount, draftCount: draftCount,
          eventCount: eventCount, upcomingEvents: upcomingEvents,
          galleryCount: galleryCount, podcastCount: podcastCount, athleteCount: athleteCount, forumCount: forumCount,
          subscriberCount: subscriberCount, submissionCount: submissionCount
        },
        recentSubmissions: recentSubmissions,
        formatDate: formatDate
      });
    } catch(e) {
      console.error('Admin dash:', e);
      res.render('admin', { currentPath: 'admin', stats: {}, recentSubmissions: [], formatDate: formatDate });
    }
  });

  // --- Admin page routes (explicit literal paths) ---

  router.get('/admin/posts', requireAdmin, function(req, res) {
    res.render('admin-posts', { moduleKey: 'posts', moduleLabel: 'Articles', readonly: false, currentPath: 'admin/posts' });
  });
  router.get('/admin/events', requireAdmin, function(req, res) {
    res.render('admin-events', { moduleKey: 'events', moduleLabel: 'Événements', readonly: false, currentPath: 'admin/events' });
  });
  router.get('/admin/gallery', requireAdmin, function(req, res) {
    res.render('admin-gallery', { moduleKey: 'gallery', moduleLabel: 'Galerie', readonly: false, currentPath: 'admin/gallery' });
  });
  router.get('/admin/podcasts', requireAdmin, function(req, res) {
    res.render('admin-podcasts', { moduleKey: 'podcasts', moduleLabel: 'Balados', readonly: false, currentPath: 'admin/podcasts' });
  });
  router.get('/admin/athletes', requireAdmin, function(req, res) {
    res.render('admin-athletes', { moduleKey: 'athletes', moduleLabel: 'Athlètes', readonly: false, currentPath: 'admin/athletes' });
  });
  router.get('/admin/forum_topics', requireAdmin, function(req, res) {
    res.render('admin-forum_topics', { moduleKey: 'forum_topics', moduleLabel: 'Forum', readonly: false, currentPath: 'admin/forum_topics' });
  });
  router.get('/admin/forum_messages', requireAdmin, function(req, res) {
    res.render('admin-forum_messages', { moduleKey: 'forum_messages', moduleLabel: 'Messages du forum', readonly: false, currentPath: 'admin/forum_messages' });
  });
  router.get('/admin/subscribers', requireAdmin, function(req, res) {
    res.render('admin-subscribers', { moduleKey: 'subscribers', moduleLabel: 'Abonnés courriel', readonly: false, currentPath: 'admin/subscribers' });
  });
  router.get('/admin/email_subscribers', requireAdmin, function(req, res) {
    res.render('admin-email_subscribers', { moduleKey: 'email_subscribers', moduleLabel: 'Abonnés courriel', readonly: false, currentPath: 'admin/email_subscribers' });
  });
  router.get('/admin/submissions', requireAdmin, function(req, res) {
    res.render('admin-submissions', { moduleKey: 'submissions', moduleLabel: 'Messages reçus', readonly: true, currentPath: 'admin/submissions' });
  });
  router.get('/admin/form_submissions', requireAdmin, function(req, res) {
    res.render('admin-form_submissions', { moduleKey: 'form_submissions', moduleLabel: 'Messages reçus', readonly: true, currentPath: 'admin/form_submissions' });
  });

  // --- Admin modules API ---

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({ modules: [
      {
        key: 'posts', label: 'Articles', icon: 'edit',
        fields: [
          { name: 'title', type: 'text', required: true, maxLength: 200, description: "Titre de l'article.", placeholder: "ex. Les Lions remportent la finale provinciale" },
          { name: 'excerpt', type: 'textarea', maxLength: 300, description: "Court résumé.", placeholder: "Bref aperçu de l'article..." },
          { name: 'content', type: 'textarea', required: true, description: "Corps complet de l'article.", placeholder: "Rédigez votre article ici..." },
          { name: 'category', type: 'select', options: ['Hockey','Soccer','Basketball','Football','Baseball','Athlétisme','Cyclisme','Entrevue','Général'], description: "Catégorie sportive." },
          { name: 'author', type: 'text', description: "Nom du journaliste.", placeholder: "ex. Olivier Maurice" },
          { name: 'image_url', type: 'image', description: "Photo principale. Recommandé : 1200x630 px." },
          { name: 'featured', type: 'boolean', default: false, description: "Mettre en vedette sur la page d'accueil." },
          { name: 'published', type: 'boolean', default: true, description: "Décocher pour brouillon." }
        ]
      },
      {
        key: 'events', label: 'Événements', icon: 'calendar',
        fields: [
          { name: 'title', type: 'text', required: true, description: "Nom de l'événement.", placeholder: "ex. Tournoi régional de hockey midget AAA" },
          { name: 'description', type: 'textarea', description: "Détails de l'événement.", placeholder: "Description complète..." },
          { name: 'sport', type: 'select', options: ['Hockey','Soccer','Basketball','Football','Baseball','Athlétisme','Cyclisme','Autre'], description: "Discipline sportive." },
          { name: 'location', type: 'text', description: "Lieu.", placeholder: "ex. Aréna municipal, Trois-Rivières" },
          { name: 'event_date', type: 'date', required: true, description: "Date de l'événement." },
          { name: 'event_time', type: 'text', description: "Heure.", placeholder: "ex. 19h30" },
          { name: 'image_url', type: 'image', description: "Affiche. Recommandé : 800x600 px." }
        ]
      },
      {
        key: 'gallery', label: 'Galerie', icon: 'image',
        fields: [
          { name: 'title', type: 'text', description: "Titre ou légende.", placeholder: "ex. Finale provinciale 2024" },
          { name: 'description', type: 'textarea', description: "Description.", placeholder: "Décrivez le moment capturé..." },
          { name: 'category', type: 'select', options: ['Hockey','Soccer','Basketball','Football','Baseball','Athlétisme','Cyclisme','Événements','Athlètes','Autre'], description: "Catégorie." },
          { name: 'image_url', type: 'image', required: true, description: "Photo. Recommandé : 1200x900 px." }
        ]
      },
      {
        key: 'podcasts', label: 'Balados', icon: 'mic',
        fields: [
          { name: 'title', type: 'text', required: true, description: "Titre de l'épisode.", placeholder: "ex. Épisode 12 — Entretien avec le coach Laflamme" },
          { name: 'description', type: 'textarea', description: "Résumé.", placeholder: "De quoi parle cet épisode..." },
          { name: 'host', type: 'text', description: "Animateur.", placeholder: "ex. Olivier Maurice" },
          { name: 'duration', type: 'text', description: "Durée.", placeholder: "ex. 42 min" },
          { name: 'audio_url', type: 'url', description: "Lien audio (.mp3)." },
          { name: 'video_url', type: 'url', description: "Lien YouTube (optionnel)." },
          { name: 'image_url', type: 'image', description: "Vignette. Recommandé : 800x800 px." }
        ]
      },
      {
        key: 'athletes', label: 'Athlètes', icon: 'star',
        fields: [
          { name: 'name', type: 'text', required: true, description: "Nom complet.", placeholder: "ex. Marie-Ève Tremblay" },
          { name: 'sport', type: 'select', options: ['Hockey','Soccer','Basketball','Football','Baseball','Athlétisme','Cyclisme','Autre'], description: "Discipline principale." },
          { name: 'bio', type: 'textarea', description: "Biographie.", placeholder: "Parcours, formation, ambitions..." },
          { name: 'achievements', type: 'textarea', description: "Réalisations.", placeholder: "Liste des réalisations majeures..." },
          { name: 'image_url', type: 'image', description: "Portrait. Recommandé : 800x800 px." }
        ]
      },
      {
        key: 'forum_topics', label: 'Forum', icon: 'message-circle',
        fields: [
          { name: 'title', type: 'text', required: true, description: "Titre du sujet.", placeholder: "ex. Pronostics pour la finale" },
          { name: 'content', type: 'textarea', required: true, description: "Message d'ouverture." },
          { name: 'author_name', type: 'text', description: "Nom d'auteur.", placeholder: "ex. Équipe Actuoli" },
          { name: 'category', type: 'text', description: "Catégorie.", placeholder: "ex. Général, Hockey..." },
          { name: 'image_url', type: 'image', description: "Image optionnelle." }
        ]
      },
      {
        key: 'forum_messages', label: 'Messages du forum', icon: 'message-circle',
        fields: [
          { name: 'topic_id', type: 'number', required: true, description: "Identifiant du sujet parent." },
          { name: 'author_name', type: 'text', description: "Nom d'auteur.", placeholder: "ex. Équipe Actuoli" },
          { name: 'content', type: 'textarea', required: true, description: "Contenu du message." }
        ]
      },
      {
        key: 'subscribers', label: 'Abonnés courriel', icon: 'users',
        fields: [
          { name: 'email', type: 'email', required: true, description: "Adresse courriel.", placeholder: "ex. abonne@exemple.com" },
          { name: 'name', type: 'text', description: "Nom (optionnel).", placeholder: "ex. Marie Lavoie" }
        ]
      },
      {
        key: 'email_subscribers', label: 'Abonnés courriel', icon: 'users',
        fields: [
          { name: 'email', type: 'email', required: true, description: "Adresse courriel.", placeholder: "ex. abonne@exemple.com" },
          { name: 'name', type: 'text', description: "Nom (optionnel).", placeholder: "ex. Marie Lavoie" }
        ]
      },
      {
        key: 'submissions', label: 'Messages reçus', icon: 'mail',
        fields: [
          { name: 'name', type: 'readonly', description: "Nom de l'expéditeur." },
          { name: 'email', type: 'readonly', description: "Courriel." },
          { name: 'subject', type: 'readonly', description: "Sujet." },
          { name: 'message', type: 'readonly', description: "Contenu." }
        ]
      },
      {
        key: 'form_submissions', label: 'Messages reçus', icon: 'mail',
        fields: [
          { name: 'name', type: 'readonly', description: "Nom de l'expéditeur." },
          { name: 'email', type: 'readonly', description: "Courriel." },
          { name: 'subject', type: 'readonly', description: "Sujet." },
          { name: 'message', type: 'readonly', description: "Contenu." }
        ]
      }
    ]});
  });

  // --- Admin stats API ---

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushSubscriberCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c || 0;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c || 0;
      res.json({ userCount: userCount, pushSubscriberCount: pushSubscriberCount, totalVisits: totalVisits, recentVisits: recentVisits });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: posts ---

  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM posts ORDER BY id DESC');
      res.json({ posts: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      const result = await db.run(
        'INSERT INTO posts (title,excerpt,content,category,author,image_url,featured,published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
        [b.title||null, b.excerpt||null, b.content||null, b.category||null, b.author||null, b.image_url||null, b.featured?1:0, b.published?1:0]
      );
      const row = await db.get('SELECT * FROM posts WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      await db.run(
        'UPDATE posts SET title=$1,excerpt=$2,content=$3,category=$4,author=$5,image_url=$6,featured=$7,published=$8,updated_at=NOW() WHERE id=$9',
        [b.title||null, b.excerpt||null, b.content||null, b.category||null, b.author||null, b.image_url||null, b.featured?1:0, b.published?1:0, req.params.id]
      );
      const row = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: events ---

  router.get('/api/admin/events', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM events ORDER BY id DESC');
      res.json({ events: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/events', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      const result = await db.run(
        'INSERT INTO events (title,description,sport,location,event_date,event_time,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [b.title||null, b.description||null, b.sport||null, b.location||null, b.event_date||null, b.event_time||null, b.image_url||null]
      );
      const row = await db.get('SELECT * FROM events WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/events/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      await db.run(
        'UPDATE events SET title=$1,description=$2,sport=$3,location=$4,event_date=$5,event_time=$6,image_url=$7,updated_at=NOW() WHERE id=$8',
        [b.title||null, b.description||null, b.sport||null, b.location||null, b.event_date||null, b.event_time||null, b.image_url||null, req.params.id]
      );
      const row = await db.get('SELECT * FROM events WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/events/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM events WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: gallery ---

  router.get('/api/admin/gallery', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM gallery ORDER BY id DESC');
      res.json({ gallery: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/gallery', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      const result = await db.run(
        'INSERT INTO gallery (title,description,category,image_url) VALUES ($1,$2,$3,$4) RETURNING id',
        [b.title||null, b.description||null, b.category||null, b.image_url||null]
      );
      const row = await db.get('SELECT * FROM gallery WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/gallery/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      await db.run(
        'UPDATE gallery SET title=$1,description=$2,category=$3,image_url=$4,updated_at=NOW() WHERE id=$5',
        [b.title||null, b.description||null, b.category||null, b.image_url||null, req.params.id]
      );
      const row = await db.get('SELECT * FROM gallery WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/gallery/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM gallery WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: podcasts ---

  router.get('/api/admin/podcasts', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM podcasts ORDER BY id DESC');
      res.json({ podcasts: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/podcasts', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      const result = await db.run(
        'INSERT INTO podcasts (title,description,host,duration,audio_url,video_url,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [b.title||null, b.description||null, b.host||null, b.duration||null, b.audio_url||null, b.video_url||null, b.image_url||null]
      );
      const row = await db.get('SELECT * FROM podcasts WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/podcasts/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      await db.run(
        'UPDATE podcasts SET title=$1,description=$2,host=$3,duration=$4,audio_url=$5,video_url=$6,image_url=$7,updated_at=NOW() WHERE id=$8',
        [b.title||null, b.description||null, b.host||null, b.duration||null, b.audio_url||null, b.video_url||null, b.image_url||null, req.params.id]
      );
      const row = await db.get('SELECT * FROM podcasts WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/podcasts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM podcasts WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: athletes ---

  router.get('/api/admin/athletes', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM athletes ORDER BY id DESC');
      res.json({ athletes: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/athletes', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      const result = await db.run(
        'INSERT INTO athletes (name,sport,bio,achievements,image_url) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [b.name||null, b.sport||null, b.bio||null, b.achievements||null, b.image_url||null]
      );
      const row = await db.get('SELECT * FROM athletes WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/athletes/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      await db.run(
        'UPDATE athletes SET name=$1,sport=$2,bio=$3,achievements=$4,image_url=$5,updated_at=NOW() WHERE id=$6',
        [b.name||null, b.sport||null, b.bio||null, b.achievements||null, b.image_url||null, req.params.id]
      );
      const row = await db.get('SELECT * FROM athletes WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/athletes/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM athletes WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: forum_topics ---

  router.get('/api/admin/forum_topics', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM forum_topics ORDER BY id DESC');
      res.json({ forum_topics: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/forum_topics', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      const result = await db.run(
        'INSERT INTO forum_topics (title,content,author_name,category,image_url) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [b.title||null, b.content||null, b.author_name||null, b.category||null, b.image_url||null]
      );
      const row = await db.get('SELECT * FROM forum_topics WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/forum_topics/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      await db.run(
        'UPDATE forum_topics SET title=$1,content=$2,author_name=$3,category=$4,image_url=$5,updated_at=NOW() WHERE id=$6',
        [b.title||null, b.content||null, b.author_name||null, b.category||null, b.image_url||null, req.params.id]
      );
      const row = await db.get('SELECT * FROM forum_topics WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/forum_topics/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM forum_topics WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: forum_messages ---

  router.get('/api/admin/forum_messages', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM forum_messages ORDER BY id DESC');
      res.json({ forum_messages: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/forum_messages', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      const result = await db.run(
        'INSERT INTO forum_messages (topic_id,author_name,content) VALUES ($1,$2,$3) RETURNING id',
        [b.topic_id||null, b.author_name||null, b.content||null]
      );
      const row = await db.get('SELECT * FROM forum_messages WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/forum_messages/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      await db.run(
        'UPDATE forum_messages SET topic_id=$1,author_name=$2,content=$3 WHERE id=$4',
        [b.topic_id||null, b.author_name||null, b.content||null, req.params.id]
      );
      const row = await db.get('SELECT * FROM forum_messages WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/forum_messages/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM forum_messages WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: email_subscribers ---

  router.get('/api/admin/email_subscribers', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM email_subscribers ORDER BY id DESC');
      res.json({ email_subscribers: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/email_subscribers', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      const result = await db.run(
        'INSERT INTO email_subscribers (email,name) VALUES ($1,$2) RETURNING id',
        [b.email||null, b.name||null]
      );
      const row = await db.get('SELECT * FROM email_subscribers WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/email_subscribers/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      await db.run(
        'UPDATE email_subscribers SET email=$1,name=$2,updated_at=NOW() WHERE id=$3',
        [b.email||null, b.name||null, req.params.id]
      );
      const row = await db.get('SELECT * FROM email_subscribers WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/email_subscribers/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM email_subscribers WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: form_submissions (read + delete only) ---

  router.get('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM form_submissions ORDER BY id DESC');
      res.json({ form_submissions: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM form_submissions WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: subscribers alias (email_subscribers table) ---

  router.get('/api/admin/subscribers', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM email_subscribers ORDER BY id DESC');
      res.json({ subscribers: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/subscribers', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      const result = await db.run(
        'INSERT INTO email_subscribers (email,name) VALUES ($1,$2) RETURNING id',
        [b.email||null, b.name||null]
      );
      const row = await db.get('SELECT * FROM email_subscribers WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/subscribers/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body;
      await db.run(
        'UPDATE email_subscribers SET email=$1,name=$2,updated_at=NOW() WHERE id=$3',
        [b.email||null, b.name||null, req.params.id]
      );
      const row = await db.get('SELECT * FROM email_subscribers WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/subscribers/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM email_subscribers WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin CRUD API: submissions alias (form_submissions table, read + delete only) ---

  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM form_submissions ORDER BY id DESC');
      res.json({ submissions: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM form_submissions WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin utility routes ---

  router.get('/api/admin/submissions-feed', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 50');
      res.json({ submissions: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const settings = {};
      rows.forEach(function(r) { settings[r.key] = r.value; });
      res.json({ settings: settings });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const key = req.body.key;
      const value = req.body.value;
      if (!key) return res.status(400).json({ error: 'Clé manquante' });
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value || '']);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/upload', requireAdmin, async function(req, res) {
    try {
      const dataUri = req.body.dataUri;
      const folder = req.body.folder || 'general';
      if (!dataUri) return res.status(400).json({ error: 'Image manquante' });
      if (!services.cloudinary || !services.cloudinary.uploader) return res.status(503).json({ error: 'Téléversement non disponible' });
      const result = await services.cloudinary.uploader.upload(dataUri, { folder: 'actuoli/' + folder });
      res.json({ url: result.secure_url });
    } catch(e) { console.error('Upload:', e); res.status(500).json({ error: e.message || 'Erreur de téléversement' }); }
  });

  // Catch-all: redirect unknown GET routes to PWA home
  router.use(function(req, res, next) {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (req.path === '/admin' || req.path.startsWith('/admin/')) {
      return next();
    }
    res.redirect('./');
  });

  return router;
};
