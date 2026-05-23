module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function formatDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-CA', { year:'numeric', month:'long', day:'numeric' }); } catch(e) { return ''; }
  }
  function formatDateTime(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleString('fr-CA'); } catch(e) { return ''; }
  }
  function truncate(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n).trim() + '…' : s;
  }
  function nl2br(s) {
    return escapeHtml(s).replace(/\n/g, '<br>');
  }
  function paragraphs(s) {
    return String(s || '').split(/\n\s*\n/).map(p => '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>').join('');
  }

  async function getSettings() {
    const rows = await db.all('SELECT key, value FROM admin_settings');
    const out = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  }

  function renderHelpers(extra) {
    return Object.assign({ escapeHtml, formatDate, formatDateTime, truncate, nl2br, paragraphs }, extra || {});
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  router.get('/', async function(req, res) {
    try {
      const settings = await getSettings();
      const services_ = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC LIMIT 4');
      const testimonials = await db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY id DESC LIMIT 4');
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', renderHelpers({ settings, services: services_, testimonials, posts }));
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur du serveur');
    }
  });

  router.get('/evaluation', async function(req, res) {
    const settings = await getSettings();
    res.render('evaluation', renderHelpers({ settings, success: req.query.success === '1', config: services.config }));
  });

  router.post('/api/evaluation', async function(req, res) {
    try {
      const { name, email, phone, address, property_type, bedrooms, bathrooms, year_built, sale_timeframe, notes } = req.body || {};
      if (!name || (!email && !phone) || !address) {
        return res.status(400).json({ error: 'Veuillez remplir les champs obligatoires (nom, adresse et au moins un moyen de vous joindre).' });
      }
      await db.run(
        'INSERT INTO evaluations (name, email, phone, address, property_type, bedrooms, bathrooms, year_built, sale_timeframe, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [name, email||'', phone||'', address, property_type||'', bedrooms||'', bathrooms||'', year_built||'', sale_timeframe||'', notes||'']
      );
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouvelle demande d\'évaluation gratuite</h2>' +
            '<p><strong>Nom :</strong> ' + escapeHtml(name) + '</p>' +
            '<p><strong>Courriel :</strong> ' + escapeHtml(email||'—') + '</p>' +
            '<p><strong>Téléphone :</strong> ' + escapeHtml(phone||'—') + '</p>' +
            '<p><strong>Adresse :</strong> ' + escapeHtml(address) + '</p>' +
            '<p><strong>Type :</strong> ' + escapeHtml(property_type||'—') + '</p>' +
            '<p><strong>Chambres :</strong> ' + escapeHtml(bedrooms||'—') + ' | <strong>Salles de bain :</strong> ' + escapeHtml(bathrooms||'—') + '</p>' +
            '<p><strong>Année :</strong> ' + escapeHtml(year_built||'—') + ' | <strong>Échéancier :</strong> ' + escapeHtml(sale_timeframe||'—') + '</p>' +
            '<p><strong>Notes :</strong><br>' + nl2br(notes||'—') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle demande d\'évaluation — ' + name, html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch(e) { console.error('Email evaluation:', e.message); }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
    }
  });

  router.get('/contact', async function(req, res) {
    const settings = await getSettings();
    res.render('contact', renderHelpers({ settings, success: req.query.success === '1', config: services.config }));
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const { name, email, phone, subject, message } = req.body || {};
      if (!name || !message || (!email && !phone)) {
        return res.status(400).json({ error: 'Veuillez remplir les champs obligatoires.' });
      }
      await db.run(
        'INSERT INTO contacts (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)',
        [name, email||'', phone||'', subject||'', message]
      );
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouveau message via le site</h2>' +
            '<p><strong>De :</strong> ' + escapeHtml(name) + '</p>' +
            '<p><strong>Courriel :</strong> ' + escapeHtml(email||'—') + '</p>' +
            '<p><strong>Téléphone :</strong> ' + escapeHtml(phone||'—') + '</p>' +
            '<p><strong>Sujet :</strong> ' + escapeHtml(subject||'—') + '</p>' +
            '<p><strong>Message :</strong><br>' + nl2br(message) + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message — ' + (subject||name), html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch(e) { console.error('Email contact:', e.message); }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
    }
  });

  router.get('/services', async function(req, res) {
    const settings = await getSettings();
    const services_ = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
    res.render('services', renderHelpers({ settings, services: services_ }));
  });

  router.get('/apropos', async function(req, res) {
    const settings = await getSettings();
    res.render('apropos', renderHelpers({ settings }));
  });

  router.get('/articles', async function(req, res) {
    const settings = await getSettings();
    const category = req.query.category || null;
    let posts;
    if (category) {
      posts = await db.all('SELECT * FROM posts WHERE published = 1 AND category = $1 ORDER BY created_at DESC', [category]);
    } else {
      posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
    }
    const cats = await db.all('SELECT DISTINCT category FROM posts WHERE published = 1 AND category IS NOT NULL AND category <> \'\' ORDER BY category');
    res.render('articles', renderHelpers({ settings, posts, categories: cats.map(r=>r.category), activeCategory: category }));
  });

  router.get('/articles/:id', async function(req, res) {
    const settings = await getSettings();
    const post = await db.get('SELECT * FROM posts WHERE id = $1 AND published = 1', [req.params.id]);
    if (!post) return res.status(404).render('notfound', renderHelpers({ settings }));
    const related = await db.all('SELECT * FROM posts WHERE published = 1 AND id <> $1 ORDER BY created_at DESC LIMIT 3', [post.id]);
    res.render('article', renderHelpers({ settings, post, related }));
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    next();
  }
  function requireAdminApi(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const settings = await getSettings();
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisits = await db.get('SELECT COUNT(*)::int AS c FROM site_visits');
      const recentVisits = await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const counts = {};
      counts.posts = (await db.get('SELECT COUNT(*)::int AS c FROM posts')).c;
      counts.services = (await db.get('SELECT COUNT(*)::int AS c FROM services')).c;
      counts.testimonials = (await db.get('SELECT COUNT(*)::int AS c FROM testimonials')).c;
      counts.evaluations = (await db.get('SELECT COUNT(*)::int AS c FROM evaluations')).c;
      counts.contacts = (await db.get('SELECT COUNT(*)::int AS c FROM contacts')).c;
      const newEvaluations = (await db.get("SELECT COUNT(*)::int AS c FROM evaluations WHERE status = 'nouveau'")).c;
      const newContacts = (await db.get("SELECT COUNT(*)::int AS c FROM contacts WHERE status = 'nouveau'")).c;
      const inProgressEvals = (await db.get("SELECT COUNT(*)::int AS c FROM evaluations WHERE status IN ('contacté','en cours')")).c;
      const completedEvals = (await db.get("SELECT COUNT(*)::int AS c FROM evaluations WHERE status = 'complété'")).c;
      const recentEvaluations = await db.all('SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 5');
      const recentContacts = await db.all('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5');
      res.render('admin', renderHelpers({
        settings,
        adminUser: { email: services.config.ownerEmail || 'admin' },
        stats: {
          userCount, pushCount,
          totalVisits: totalVisits.c, recentVisits: recentVisits.c,
          newEvaluations, newContacts, inProgressEvals, completedEvals
        },
        counts, recentEvaluations, recentContacts,
        activePage: 'dashboard'
      }));
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur du serveur');
    }
  });

  router.get('/admin/logout', function(req, res) {
    try { res.clearCookie(services.config.adminCookieName || 'admin_token'); } catch(e) {}
    res.redirect('.');
  });

  router.get('/admin/posts', requireAdmin, async function(req, res) {
    const settings = await getSettings();
    res.render('admin-module', renderHelpers({ settings, activePage: 'posts', moduleKey: 'posts', moduleLabel: 'article', moduleTitle: 'Articles & conseils', moduleSubtitle: 'Publiez des conseils et actualités pour vos clients' }));
  });
  router.get('/admin/services', requireAdmin, async function(req, res) {
    const settings = await getSettings();
    res.render('admin-module', renderHelpers({ settings, activePage: 'services', moduleKey: 'services', moduleLabel: 'service', moduleTitle: 'Services offerts', moduleSubtitle: 'Modifiez les cartes de services et leurs boutons d\'action' }));
  });
  router.get('/admin/testimonials', requireAdmin, async function(req, res) {
    const settings = await getSettings();
    res.render('admin-module', renderHelpers({ settings, activePage: 'testimonials', moduleKey: 'testimonials', moduleLabel: 'témoignage', moduleTitle: 'Témoignages clients', moduleSubtitle: 'Ajoutez et publiez les commentaires de vos clients' }));
  });
  router.get('/admin/evaluations', requireAdmin, async function(req, res) {
    const settings = await getSettings();
    res.render('admin-leads', renderHelpers({ settings, activePage: 'evaluations', moduleKey: 'evaluations', moduleLabel: 'demande d\'évaluation', moduleTitle: 'Demandes d\'évaluation', moduleSubtitle: 'Suivez vos prospects et leur statut' }));
  });
  router.get('/admin/contacts', requireAdmin, async function(req, res) {
    const settings = await getSettings();
    res.render('admin-leads', renderHelpers({ settings, activePage: 'contacts', moduleKey: 'contacts', moduleLabel: 'message', moduleTitle: 'Messages reçus', moduleSubtitle: 'Gérez les messages envoyés via votre formulaire de contact' }));
  });

  router.get('/api/admin/stats', requireAdminApi, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushSubscriberCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c;
      res.json({ userCount, pushSubscriberCount, totalVisits, recentVisits });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/api/admin/modules', requireAdminApi, function(req, res) {
    res.json({
      modules: [
        {
          key: 'posts', label: 'Articles', icon: 'edit',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre de l\'article affiché dans la liste et sur la page de détail.', placeholder: 'Ex. 5 conseils pour vendre votre maison' },
            { name: 'excerpt', type: 'textarea', description: 'Résumé court affiché dans la liste des articles (2-3 phrases).', placeholder: 'Un court résumé qui donne envie de lire la suite...' },
            { name: 'content', type: 'textarea', description: 'Contenu complet de l\'article. Séparez les paragraphes par des lignes vides.', placeholder: 'Rédigez votre article ici...' },
            { name: 'image_url', type: 'image', description: 'Image principale de l\'article. Recommandé : 1200×630 pixels, format paysage.' },
            { name: 'category', type: 'text', maxLength: 50, description: 'Catégorie pour filtrer les articles (ex. Conseils vendeurs, Marché, Évaluation).', placeholder: 'Ex. Conseils vendeurs' },
            { name: 'published', type: 'boolean', default: true, description: 'Décocher pour garder l\'article en brouillon (caché des visiteurs).' }
          ]
        },
        {
          key: 'services', label: 'Services', icon: 'list',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 100, description: 'Nom du service affiché en titre de la carte.', placeholder: 'Ex. Vendre votre propriété' },
            { name: 'description', type: 'textarea', description: 'Description détaillée du service.', placeholder: 'Décrivez ce service en quelques phrases...' },
            { name: 'image_url', type: 'image', description: 'Image illustrant le service. Recommandé : 800×600 pixels (format paysage 4:3).' },
            { name: 'icon', type: 'select', options: ['home','key','chart','chat','star','search','dollar'], description: 'Icône stylisée affichée si aucune image n\'est fournie.' },
            { name: 'price_info', type: 'text', maxLength: 80, description: 'Information tarifaire affichée sur la carte (ex. « Gratuit », « Sur commission », « Sans frais pour l\'acheteur »). Laisser vide pour ne rien afficher.', placeholder: 'Ex. Gratuit, sans engagement' },
            { name: 'cta_label', type: 'text', maxLength: 60, description: 'Texte du bouton d\'action sur la carte (ex. « Demander une évaluation »).', placeholder: 'Ex. En savoir plus' },
            { name: 'cta_link', type: 'text', maxLength: 200, description: 'Lien du bouton. Utilisez un chemin relatif comme « evaluation » ou « contact », ou une URL complète. Laisser vide pour utiliser « contact » par défaut.', placeholder: 'evaluation, contact ou https://...' },
            { name: 'featured', type: 'boolean', default: false, description: 'Cocher pour mettre ce service en vedette sur la page d\'accueil.' },
            { name: 'sort_order', type: 'number', min: 0, step: 1, description: 'Ordre d\'affichage (les plus petits chiffres apparaissent en premier).', placeholder: 'Ex. 1' }
          ]
        },
        {
          key: 'testimonials', label: 'Témoignages', icon: 'star',
          fields: [
            { name: 'author', type: 'text', required: true, maxLength: 100, description: 'Nom du client qui témoigne.', placeholder: 'Ex. Mélanie & Patrick T.' },
            { name: 'role', type: 'text', maxLength: 100, description: 'Rôle ou contexte (ex. Vendeurs à Charlesbourg, Première acheteuse).', placeholder: 'Ex. Vendeurs à Charlesbourg' },
            { name: 'content', type: 'textarea', required: true, description: 'Le témoignage en quelques phrases.', placeholder: 'Cindy a vendu notre maison rapidement...' },
            { name: 'rating', type: 'number', min: 1, max: 5, step: 1, default: 5, description: 'Note sur 5 étoiles.', placeholder: '5' },
            { name: 'image_url', type: 'image', description: 'Photo du client (optionnel). Recommandé : carré 200×200 pixels.' },
            { name: 'published', type: 'boolean', default: true, description: 'Décocher pour cacher ce témoignage du site public.' }
          ]
        },
        {
          key: 'evaluations', label: 'Évaluations', icon: 'home',
          fields: [
            { name: 'name', type: 'text', description: 'Nom du prospect.' },
            { name: 'email', type: 'email', description: 'Courriel du prospect.' },
            { name: 'phone', type: 'text', description: 'Téléphone du prospect.' },
            { name: 'address', type: 'text', description: 'Adresse de la propriété à évaluer.' },
            { name: 'property_type', type: 'text', description: 'Type de propriété (maison, condo, plex, etc.).' },
            { name: 'bedrooms', type: 'text', description: 'Nombre de chambres.' },
            { name: 'bathrooms', type: 'text', description: 'Nombre de salles de bain.' },
            { name: 'year_built', type: 'text', description: 'Année de construction.' },
            { name: 'sale_timeframe', type: 'text', description: 'Échéancier souhaité pour la vente.' },
            { name: 'notes', type: 'textarea', description: 'Notes additionnelles du prospect.' },
            { name: 'status', type: 'select', options: ['nouveau','contacté','en cours','complété','perdu'], default: 'nouveau', description: 'Statut du suivi.' }
          ]
        },
        {
          key: 'contacts', label: 'Messages', icon: 'chat',
          fields: [
            { name: 'name', type: 'text', description: 'Nom de l\'expéditeur.' },
            { name: 'email', type: 'email', description: 'Courriel.' },
            { name: 'phone', type: 'text', description: 'Téléphone.' },
            { name: 'subject', type: 'text', description: 'Sujet du message.' },
            { name: 'message', type: 'textarea', description: 'Contenu du message.' },
            { name: 'status', type: 'select', options: ['nouveau','répondu','archivé'], default: 'nouveau', description: 'Statut du suivi.' }
          ]
        }
      ]
    });
  });

  // /api/admin/posts — CRUD
  router.get('/api/admin/posts', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
      res.json({ posts: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/posts', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['title','excerpt','content','image_url','category','published'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          cols.push(f);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i++);
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      const row = await db.get('INSERT INTO posts (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ post: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['title','excerpt','content','image_url','category','published'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          sets.push(f + ' = $' + i++);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      sets.push('updated_at = NOW()');
      vals.push(req.params.id);
      const row = await db.get('UPDATE posts SET ' + sets.join(', ') + ' WHERE id = $' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Introuvable' });
      res.json({ post: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    try {
      const r = await db.run('DELETE FROM posts WHERE id = $1', [req.params.id]);
      res.json({ success: true, changes: r.changes });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // /api/admin/services — CRUD
  router.get('/api/admin/services', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM services ORDER BY created_at DESC');
      res.json({ services: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/services', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['name','description','image_url','icon','price_info','cta_label','cta_link','featured','sort_order'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          cols.push(f);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i++);
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      const row = await db.get('INSERT INTO services (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ service: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/services/:id', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['name','description','image_url','icon','price_info','cta_label','cta_link','featured','sort_order'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          sets.push(f + ' = $' + i++);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      sets.push('updated_at = NOW()');
      vals.push(req.params.id);
      const row = await db.get('UPDATE services SET ' + sets.join(', ') + ' WHERE id = $' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Introuvable' });
      res.json({ service: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/services/:id', requireAdminApi, async function(req, res) {
    try {
      const r = await db.run('DELETE FROM services WHERE id = $1', [req.params.id]);
      res.json({ success: true, changes: r.changes });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // /api/admin/testimonials — CRUD
  router.get('/api/admin/testimonials', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
      res.json({ testimonials: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/testimonials', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['author','role','content','rating','image_url','published'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          cols.push(f);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i++);
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      const row = await db.get('INSERT INTO testimonials (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ testimonial: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/testimonials/:id', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['author','role','content','rating','image_url','published'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          sets.push(f + ' = $' + i++);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      sets.push('updated_at = NOW()');
      vals.push(req.params.id);
      const row = await db.get('UPDATE testimonials SET ' + sets.join(', ') + ' WHERE id = $' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Introuvable' });
      res.json({ testimonial: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/testimonials/:id', requireAdminApi, async function(req, res) {
    try {
      const r = await db.run('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
      res.json({ success: true, changes: r.changes });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // /api/admin/evaluations — CRUD
  router.get('/api/admin/evaluations', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM evaluations ORDER BY created_at DESC');
      res.json({ evaluations: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/evaluations', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['name','email','phone','address','property_type','bedrooms','bathrooms','year_built','sale_timeframe','notes','status'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          cols.push(f);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i++);
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      const row = await db.get('INSERT INTO evaluations (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ evaluation: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/evaluations/:id', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['name','email','phone','address','property_type','bedrooms','bathrooms','year_built','sale_timeframe','notes','status'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          sets.push(f + ' = $' + i++);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      sets.push('updated_at = NOW()');
      vals.push(req.params.id);
      const row = await db.get('UPDATE evaluations SET ' + sets.join(', ') + ' WHERE id = $' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Introuvable' });
      res.json({ evaluation: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/evaluations/:id', requireAdminApi, async function(req, res) {
    try {
      const r = await db.run('DELETE FROM evaluations WHERE id = $1', [req.params.id]);
      res.json({ success: true, changes: r.changes });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // /api/admin/contacts — CRUD
  router.get('/api/admin/contacts', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM contacts ORDER BY created_at DESC');
      res.json({ contacts: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/contacts', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['name','email','phone','subject','message','status'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          cols.push(f);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i++);
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      const row = await db.get('INSERT INTO contacts (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ contact: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/contacts/:id', requireAdminApi, async function(req, res) {
    try {
      const data = req.body || {};
      const allowed = ['name','email','phone','subject','message','status'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (f in data) {
          sets.push(f + ' = $' + i++);
          let v = data[f];
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
      sets.push('updated_at = NOW()');
      vals.push(req.params.id);
      const row = await db.get('UPDATE contacts SET ' + sets.join(', ') + ' WHERE id = $' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Introuvable' });
      res.json({ contact: row, item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/contacts/:id', requireAdminApi, async function(req, res) {
    try {
      const r = await db.run('DELETE FROM contacts WHERE id = $1', [req.params.id]);
      res.json({ success: true, changes: r.changes });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // Catch-all: redirect unknown GET routes to PWA home (prevents "Cannot GET" errors)
  router.get('*', function(req, res, next) {
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
