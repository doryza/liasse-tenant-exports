module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const T = {
    fr: { nav_home:'Accueil', nav_services:'Services', nav_about:'À propos', nav_blog:'Articles', nav_contact:'Contact', nav_booking:'Rendez-vous', login:'Connexion' }
  };

  async function getSettings() {
    const rows = await db.all('SELECT key, value FROM admin_settings');
    const s = {};
    rows.forEach(r => { s[r.key] = r.value; });
    return s;
  }

  function applyTextOverrides(t, settings, lang) {
    for (const k in settings) {
      if (k.startsWith('text_') && k.endsWith('_' + lang)) {
        const tKey = k.slice(5, -(lang.length + 1));
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  async function renderCtx(extra) {
    const settings = await getSettings();
    const lang = 'fr';
    const t = applyTextOverrides(Object.assign({}, T.fr), settings, lang);
    return Object.assign({ settings, lang, t, user: null }, extra || {});
  }

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  // ── Public routes ──────────────────────────────────────────────────────────

  router.get('/', async function(req, res) {
    try {
      const ctx = await renderCtx();
      ctx.featuredServices = await db.all('SELECT * FROM services WHERE featured = 1 ORDER BY display_order ASC LIMIT 4');
      ctx.testimonials = await db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY created_at DESC LIMIT 4');
      ctx.recentPosts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/services', async function(req, res) {
    try {
      const ctx = await renderCtx();
      ctx.services = await db.all('SELECT * FROM services ORDER BY display_order ASC, created_at ASC');
      res.render('services', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/services/:id', async function(req, res) {
    try {
      const ctx = await renderCtx();
      ctx.service = await db.get('SELECT * FROM services WHERE id = $1', [req.params.id]);
      if (!ctx.service) return res.redirect('services');
      ctx.otherServices = await db.all('SELECT * FROM services WHERE id != $1 ORDER BY display_order ASC LIMIT 3', [req.params.id]);
      res.render('service-detail', ctx);
    } catch (err) { console.error(err); res.redirect('services'); }
  });

  router.get('/a-propos', async function(req, res) {
    try {
      const ctx = await renderCtx();
      ctx.testimonials = await db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY created_at DESC');
      res.render('about', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/articles', async function(req, res) {
    try {
      const ctx = await renderCtx();
      const cat = req.query.cat || null;
      if (cat) {
        ctx.posts = await db.all('SELECT * FROM posts WHERE published = 1 AND category = $1 ORDER BY created_at DESC', [cat]);
      } else {
        ctx.posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
      }
      const cats = await db.all('SELECT DISTINCT category FROM posts WHERE published = 1 AND category IS NOT NULL');
      ctx.categories = cats.map(function(c) { return c.category; });
      ctx.activeCat = cat;
      res.render('blog', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/articles/:id', async function(req, res) {
    try {
      const ctx = await renderCtx();
      ctx.post = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      if (!ctx.post) return res.redirect('articles');
      ctx.relatedPosts = await db.all('SELECT * FROM posts WHERE id != $1 AND published = 1 ORDER BY created_at DESC LIMIT 3', [req.params.id]);
      res.render('post-detail', ctx);
    } catch (err) { console.error(err); res.redirect('articles'); }
  });

  router.get('/contact', async function(req, res) {
    try {
      const ctx = await renderCtx();
      res.render('contact', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const phone = req.body.phone;
      const subject = req.body.subject;
      const message = req.body.message;
      if (!name || !message) return res.status(400).json({ error: 'Nom et message requis' });
      await db.run('INSERT INTO form_submissions (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)', [name, email||'', phone||'', subject||'', message]);
      if (services.config.contactEmail) {
        const html = '<h2>Nouveau message du site</h2><p><strong>Nom:</strong> ' + name + '</p><p><strong>Courriel:</strong> ' + (email||'-') + '</p><p><strong>Téléphone:</strong> ' + (phone||'-') + '</p><p><strong>Sujet:</strong> ' + (subject||'-') + '</p><p><strong>Message:</strong></p><p>' + message.replace(/\n/g,'<br>') + '</p>';
        try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message - ' + name, html: html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
      }
      res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur lors de l\'envoi' }); }
  });

  router.get('/rendez-vous', async function(req, res) {
    try {
      const ctx = await renderCtx();
      ctx.services = await db.all('SELECT * FROM services ORDER BY display_order ASC');
      ctx.preselectedService = req.query.service || '';
      res.render('booking', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.post('/api/appointments', async function(req, res) {
    try {
      const parent_name = req.body.parent_name;
      const parent_email = req.body.parent_email;
      const parent_phone = req.body.parent_phone;
      const child_name = req.body.child_name;
      const child_age = req.body.child_age;
      const child_grade = req.body.child_grade;
      const service_id = req.body.service_id;
      const preferred_date = req.body.preferred_date;
      const preferred_time = req.body.preferred_time;
      const message = req.body.message;
      if (!parent_name || !parent_email) return res.status(400).json({ error: 'Nom et courriel du parent requis' });
      let service_name = '';
      if (service_id) {
        const svc = await db.get('SELECT name FROM services WHERE id = $1', [service_id]);
        if (svc) service_name = svc.name;
      }
      await db.run('INSERT INTO appointments (parent_name, parent_email, parent_phone, child_name, child_age, child_grade, service_id, service_name, preferred_date, preferred_time, message) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', [parent_name, parent_email, parent_phone||'', child_name||'', child_age||'', child_grade||'', service_id||null, service_name, preferred_date||'', preferred_time||'', message||'']);
      if (services.config.contactEmail) {
        const html = '<h2>Nouvelle demande de rendez-vous</h2><p><strong>Parent:</strong> ' + parent_name + '</p><p><strong>Courriel:</strong> ' + parent_email + '</p><p><strong>Téléphone:</strong> ' + (parent_phone||'-') + '</p><p><strong>Enfant:</strong> ' + (child_name||'-') + ' (' + (child_age||'-') + ' ans, ' + (child_grade||'-') + ')</p><p><strong>Service:</strong> ' + (service_name||'-') + '</p><p><strong>Date souhaitée:</strong> ' + (preferred_date||'-') + ' ' + (preferred_time||'') + '</p><p><strong>Message:</strong></p><p>' + (message||'-').replace(/\n/g,'<br>') + '</p>';
        try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle demande de RDV - ' + parent_name, html: html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
      }
      res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur lors de l\'envoi' }); }
  });

  // ── Admin UI routes ────────────────────────────────────────────────────────

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
    try {
      const ctx = await renderCtx();
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisits = await db.get('SELECT COUNT(*) as c FROM site_visits');
      const recentVisits = await db.get("SELECT COUNT(*) as c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const postsCount = await db.get('SELECT COUNT(*) as c FROM posts');
      const servicesCount = await db.get('SELECT COUNT(*) as c FROM services');
      const testimonialsCount = await db.get('SELECT COUNT(*) as c FROM testimonials');
      const appointmentsCount = await db.get('SELECT COUNT(*) as c FROM appointments');
      const pendingAppts = await db.get("SELECT COUNT(*) as c FROM appointments WHERE status = 'pending'");
      const newMessages = await db.get("SELECT COUNT(*) as c FROM form_submissions WHERE status = 'new'");
      const recentAppointments = await db.all('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5');
      const recentSubmissions = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5');
      ctx.stats = {
        userCount: userCount, pushCount: pushCount,
        totalVisits: totalVisits.c || 0,
        recentVisits: recentVisits.c || 0,
        posts: postsCount.c || 0,
        services: servicesCount.c || 0,
        testimonials: testimonialsCount.c || 0,
        appointments: appointmentsCount.c || 0,
        pendingAppts: pendingAppts.c || 0,
        newMessages: newMessages.c || 0
      };
      ctx.recentAppointments = recentAppointments;
      ctx.recentSubmissions = recentSubmissions;
      ctx.activeNav = 'dashboard';
      res.render('admin', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur admin'); }
  });

  router.get('/admin/appointments', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
    try {
      const ctx = await renderCtx();
      ctx.activeNav = 'appointments';
      ctx.items = await db.all('SELECT * FROM appointments ORDER BY created_at DESC');
      res.render('admin-appointments', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur admin'); }
  });

  router.get('/admin/services', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
    try {
      const ctx = await renderCtx();
      ctx.activeNav = 'services';
      ctx.items = await db.all('SELECT * FROM services ORDER BY created_at DESC');
      ctx.servicesList = await db.all('SELECT * FROM services ORDER BY display_order ASC');
      res.render('admin-services', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur admin'); }
  });

  router.get('/admin/posts', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
    try {
      const ctx = await renderCtx();
      ctx.activeNav = 'posts';
      ctx.items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
      res.render('admin-posts', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur admin'); }
  });

  router.get('/admin/testimonials', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
    try {
      const ctx = await renderCtx();
      ctx.activeNav = 'testimonials';
      ctx.items = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
      res.render('admin-testimonials', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur admin'); }
  });

  router.get('/admin/faqs', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
    try {
      const ctx = await renderCtx();
      ctx.activeNav = 'faqs';
      ctx.items = await db.all('SELECT * FROM faqs ORDER BY created_at DESC');
      res.render('admin-faqs', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur admin'); }
  });

  router.get('/admin/submissions', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
    try {
      const ctx = await renderCtx();
      ctx.activeNav = 'submissions';
      ctx.items = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
      res.render('admin-submissions', ctx);
    } catch (err) { console.error(err); res.status(500).send('Erreur admin'); }
  });

  // ── Admin API: stats & modules ─────────────────────────────────────────────

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisits = await db.get('SELECT COUNT(*) as c FROM site_visits');
      const recentVisits = await db.get("SELECT COUNT(*) as c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      res.json({ userCount: userCount, pushSubscriberCount: pushCount, totalVisits: totalVisits.c || 0, recentVisits: recentVisits.c || 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        { key: 'appointments', label: 'Rendez-vous', icon: 'calendar', fields: [
          { name: 'parent_name', type: 'text', required: true, description: 'Nom du parent ou tuteur', placeholder: 'ex: Marie Tremblay' },
          { name: 'parent_email', type: 'email', description: 'Courriel du parent', placeholder: 'ex: marie@exemple.com' },
          { name: 'parent_phone', type: 'text', description: 'Numéro de téléphone du parent', placeholder: 'ex: 514-555-1234' },
          { name: 'child_name', type: 'text', description: "Prénom de l'enfant concerné", placeholder: 'ex: Léo' },
          { name: 'child_age', type: 'text', description: "Âge de l'enfant", placeholder: 'ex: 9 ans' },
          { name: 'child_grade', type: 'text', description: "Niveau scolaire de l'enfant", placeholder: 'ex: 4e année' },
          { name: 'service_name', type: 'text', description: 'Service demandé', placeholder: 'ex: Évaluation orthopédagogique' },
          { name: 'preferred_date', type: 'text', description: 'Date souhaitée par le parent', placeholder: 'ex: 15 septembre 2024' },
          { name: 'preferred_time', type: 'text', description: 'Plage horaire préférée', placeholder: 'ex: après-midi' },
          { name: 'message', type: 'textarea', description: 'Détails et informations supplémentaires fournis par le parent' },
          { name: 'status', type: 'select', options: ['pending','confirmed','completed','cancelled'], default: 'pending', description: 'Statut de la demande de rendez-vous' }
        ]},
        { key: 'services', label: 'Services', icon: 'list', fields: [
          { name: 'name', type: 'text', required: true, maxLength: 100, description: "Nom du service tel qu'affiché sur le site", placeholder: 'ex: Évaluation orthopédagogique' },
          { name: 'description', type: 'textarea', description: 'Courte description affichée sur les cartes (1-2 phrases)', placeholder: 'Brève description du service...' },
          { name: 'details', type: 'textarea', description: 'Description détaillée affichée sur la page du service', placeholder: 'Description complète, méthodes utilisées, bénéfices...' },
          { name: 'icon', type: 'text', maxLength: 4, description: 'Emoji représentant le service (ex: 🔍, 📚, 🔢)', placeholder: 'ex: 📚' },
          { name: 'image_url', type: 'image', description: 'Image illustrant le service. Recommandé: format paysage 800x600px' },
          { name: 'price', type: 'text', description: 'Prix affiché (texte libre)', placeholder: 'ex: 80$ ou Sur consultation' },
          { name: 'duration', type: 'text', description: "Durée d'une séance", placeholder: 'ex: 60 minutes' },
          { name: 'featured', type: 'boolean', default: false, description: "Cocher pour mettre en vedette sur la page d'accueil" },
          { name: 'display_order', type: 'number', default: 0, min: 0, description: "Ordre d'affichage (plus petit = affiché en premier)" }
        ]},
        { key: 'posts', label: 'Articles', icon: 'edit', fields: [
          { name: 'title', type: 'text', required: true, maxLength: 200, description: "Titre de l'article", placeholder: 'ex: 5 astuces pour aider votre enfant' },
          { name: 'excerpt', type: 'textarea', description: 'Court résumé affiché sur la liste des articles', placeholder: 'Résumé en 1-2 phrases...' },
          { name: 'content', type: 'textarea', description: "Contenu complet de l'article", placeholder: "Texte complet de l'article..." },
          { name: 'image_url', type: 'image', description: "Image principale de l'article. Recommandé: 1200x630px" },
          { name: 'category', type: 'text', maxLength: 50, description: "Catégorie de l'article (Conseils, Stratégies, Pédagogie, etc.)", placeholder: 'ex: Conseils' },
          { name: 'published', type: 'boolean', default: true, description: "Décocher pour cacher l'article du site (brouillon)" }
        ]},
        { key: 'testimonials', label: 'Témoignages', icon: 'star', fields: [
          { name: 'author', type: 'text', required: true, description: "Prénom et initiale du parent (anonymisation)", placeholder: 'ex: Marie L.' },
          { name: 'role', type: 'text', description: "Rôle ou relation à l'enfant", placeholder: 'ex: Maman de Léa, 9 ans' },
          { name: 'content', type: 'textarea', required: true, description: 'Texte du témoignage', placeholder: 'Le témoignage complet du parent...' },
          { name: 'rating', type: 'number', min: 1, max: 5, default: 5, description: 'Évaluation sur 5 étoiles' },
          { name: 'image_url', type: 'image', description: 'Photo optionnelle (avec autorisation). Carré 200x200px recommandé' },
          { name: 'published', type: 'boolean', default: true, description: 'Décocher pour cacher ce témoignage' }
        ]},
        { key: 'faqs', label: 'Questions fréquentes', icon: 'list', fields: [
          { name: 'question', type: 'text', required: true, maxLength: 200, description: 'Question posée par les parents', placeholder: 'ex: À quel âge consulter?' },
          { name: 'answer', type: 'textarea', required: true, description: 'Réponse à la question', placeholder: 'Réponse détaillée...' },
          { name: 'display_order', type: 'number', default: 0, min: 0, description: "Ordre d'affichage (plus petit = affiché en premier)" }
        ]},
        { key: 'form_submissions', label: 'Messages reçus', icon: 'mail', readonly: false, fields: [
          { name: 'name', type: 'text', description: 'Nom de la personne' },
          { name: 'email', type: 'email', description: 'Courriel' },
          { name: 'phone', type: 'text', description: 'Téléphone' },
          { name: 'subject', type: 'text', description: 'Sujet' },
          { name: 'message', type: 'textarea', description: 'Message reçu' },
          { name: 'status', type: 'select', options: ['new','read','replied','archived'], default: 'new', description: 'Statut du message' }
        ]}
      ]
    });
  });

  // ── Admin API: CRUD routes ─────────────────────────────────────────────────

  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
      res.json({ posts: items });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const allowed = ['title','content','excerpt','image_url','category','published'];
      const fields = [], values = [], placeholders = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { fields.push(f); values.push(req.body[f]); placeholders.push('$' + idx++); } });
      if (!fields.length) return res.status(400).json({ error: 'Aucun champ' });
      const result = await db.run('INSERT INTO posts (' + fields.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING *', values);
      const created = await db.get('SELECT * FROM posts WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: created });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['title','content','excerpt','image_url','category','published'];
      const sets = [], values = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + ' = $' + idx++); values.push(req.body[f]); } });
      if (!sets.length) return res.status(400).json({ error: 'Aucun champ' });
      sets.push('updated_at = NOW()');
      values.push(req.params.id);
      await db.run('UPDATE posts SET ' + sets.join(',') + ' WHERE id = $' + idx, values);
      const updated = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      res.json({ item: updated });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM posts WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      const items = await db.all('SELECT * FROM services ORDER BY created_at DESC');
      res.json({ services: items });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','description','details','image_url','icon','price','duration','featured','display_order'];
      const fields = [], values = [], placeholders = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { fields.push(f); values.push(req.body[f]); placeholders.push('$' + idx++); } });
      if (!fields.length) return res.status(400).json({ error: 'Aucun champ' });
      const result = await db.run('INSERT INTO services (' + fields.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING *', values);
      const created = await db.get('SELECT * FROM services WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: created });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.put('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','description','details','image_url','icon','price','duration','featured','display_order'];
      const sets = [], values = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + ' = $' + idx++); values.push(req.body[f]); } });
      if (!sets.length) return res.status(400).json({ error: 'Aucun champ' });
      sets.push('updated_at = NOW()');
      values.push(req.params.id);
      await db.run('UPDATE services SET ' + sets.join(',') + ' WHERE id = $' + idx, values);
      const updated = await db.get('SELECT * FROM services WHERE id = $1', [req.params.id]);
      res.json({ item: updated });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.delete('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM services WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try {
      const items = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
      res.json({ testimonials: items });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try {
      const allowed = ['author','role','content','rating','image_url','published'];
      const fields = [], values = [], placeholders = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { fields.push(f); values.push(req.body[f]); placeholders.push('$' + idx++); } });
      if (!fields.length) return res.status(400).json({ error: 'Aucun champ' });
      const result = await db.run('INSERT INTO testimonials (' + fields.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING *', values);
      const created = await db.get('SELECT * FROM testimonials WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: created });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.put('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['author','role','content','rating','image_url','published'];
      const sets = [], values = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + ' = $' + idx++); values.push(req.body[f]); } });
      if (!sets.length) return res.status(400).json({ error: 'Aucun champ' });
      sets.push('updated_at = NOW()');
      values.push(req.params.id);
      await db.run('UPDATE testimonials SET ' + sets.join(',') + ' WHERE id = $' + idx, values);
      const updated = await db.get('SELECT * FROM testimonials WHERE id = $1', [req.params.id]);
      res.json({ item: updated });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.delete('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/appointments', requireAdmin, async function(req, res) {
    try {
      const items = await db.all('SELECT * FROM appointments ORDER BY created_at DESC');
      res.json({ appointments: items });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/api/admin/appointments', requireAdmin, async function(req, res) {
    try {
      const allowed = ['parent_name','parent_email','parent_phone','child_name','child_age','child_grade','service_id','service_name','preferred_date','preferred_time','message','status'];
      const fields = [], values = [], placeholders = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { fields.push(f); values.push(req.body[f]); placeholders.push('$' + idx++); } });
      if (!fields.length) return res.status(400).json({ error: 'Aucun champ' });
      const result = await db.run('INSERT INTO appointments (' + fields.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING *', values);
      const created = await db.get('SELECT * FROM appointments WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: created });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.put('/api/admin/appointments/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['parent_name','parent_email','parent_phone','child_name','child_age','child_grade','service_id','service_name','preferred_date','preferred_time','message','status'];
      const sets = [], values = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + ' = $' + idx++); values.push(req.body[f]); } });
      if (!sets.length) return res.status(400).json({ error: 'Aucun champ' });
      sets.push('updated_at = NOW()');
      values.push(req.params.id);
      await db.run('UPDATE appointments SET ' + sets.join(',') + ' WHERE id = $' + idx, values);
      const updated = await db.get('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
      res.json({ item: updated });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.delete('/api/admin/appointments/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM appointments WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/faqs', requireAdmin, async function(req, res) {
    try {
      const items = await db.all('SELECT * FROM faqs ORDER BY created_at DESC');
      res.json({ faqs: items });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/api/admin/faqs', requireAdmin, async function(req, res) {
    try {
      const allowed = ['question','answer','display_order'];
      const fields = [], values = [], placeholders = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { fields.push(f); values.push(req.body[f]); placeholders.push('$' + idx++); } });
      if (!fields.length) return res.status(400).json({ error: 'Aucun champ' });
      const result = await db.run('INSERT INTO faqs (' + fields.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING *', values);
      const created = await db.get('SELECT * FROM faqs WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: created });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.put('/api/admin/faqs/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['question','answer','display_order'];
      const sets = [], values = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + ' = $' + idx++); values.push(req.body[f]); } });
      if (!sets.length) return res.status(400).json({ error: 'Aucun champ' });
      sets.push('updated_at = NOW()');
      values.push(req.params.id);
      await db.run('UPDATE faqs SET ' + sets.join(',') + ' WHERE id = $' + idx, values);
      const updated = await db.get('SELECT * FROM faqs WHERE id = $1', [req.params.id]);
      res.json({ item: updated });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.delete('/api/admin/faqs/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM faqs WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      const items = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
      res.json({ form_submissions: items });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','email','phone','subject','message','status'];
      const fields = [], values = [], placeholders = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { fields.push(f); values.push(req.body[f]); placeholders.push('$' + idx++); } });
      if (!fields.length) return res.status(400).json({ error: 'Aucun champ' });
      const result = await db.run('INSERT INTO form_submissions (' + fields.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING *', values);
      const created = await db.get('SELECT * FROM form_submissions WHERE id = $1', [result.lastInsertRowid]);
      res.json({ item: created });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','email','phone','subject','message','status'];
      const sets = [], values = [];
      let idx = 1;
      allowed.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + ' = $' + idx++); values.push(req.body[f]); } });
      if (!sets.length) return res.status(400).json({ error: 'Aucun champ' });
      sets.push('updated_at = NOW()');
      values.push(req.params.id);
      await db.run('UPDATE form_submissions SET ' + sets.join(',') + ' WHERE id = $' + idx, values);
      const updated = await db.get('SELECT * FROM form_submissions WHERE id = $1', [req.params.id]);
      res.json({ item: updated });
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
  });

  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM form_submissions WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ── Admin API: settings ────────────────────────────────────────────────────

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const settings = {};
      rows.forEach(function(r) { settings[r.key] = r.value; });
      res.json({ settings: settings });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const key = req.body.key;
      const value = req.body.value;
      if (!key) return res.status(400).json({ error: 'Clé requise' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value || '']);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ── Catch-all ──────────────────────────────────────────────────────────────

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
