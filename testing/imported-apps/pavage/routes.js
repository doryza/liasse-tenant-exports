module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const T = {
    fr: {
      brand: 'Pavage Pro Québec',
      nav_home: 'Accueil', nav_services: 'Services', nav_gallery: 'Galerie', nav_about: 'À propos', nav_blog: 'Blogue', nav_contact: 'Soumission', nav_login: 'Connexion',
      btn_quote: 'Devis gratuit', btn_view_all: 'Voir tout', btn_learn_more: 'En savoir plus', btn_send: 'Envoyer ma demande', btn_view_project: 'Voir le projet',
      services_title: 'Nos services', services_subtitle: 'Des solutions complètes pour tous vos projets de pavage',
      featured_projects: 'Projets vedettes', featured_projects_sub: 'Découvrez nos réalisations récentes',
      testimonials_title: 'Ce que nos clients disent', testimonials_sub: 'La satisfaction de nos clients est notre meilleure publicité',
      blog_title: 'Conseils et actualités', blog_sub: 'Conseils d'experts pour vos projets',
      cta_btn: 'Obtenir mon devis gratuit',
      footer_tagline: 'Excellence en pavage résidentiel depuis plus de 20 ans.', footer_quick: 'Liens rapides', footer_contact: 'Contact', footer_follow: 'Suivez-nous', footer_rights: 'Tous droits réservés',
      gallery_title: 'Notre galerie', gallery_subtitle: 'Une sélection de nos plus belles réalisations à travers le Québec', filter_all: 'Tous', filter_driveway: 'Entrées', filter_patio: 'Patios', filter_walkway: 'Allées', filter_asphalt: 'Asphaltage', no_projects: 'Aucun projet pour cette catégorie.',
      about_title: 'À propos de nous', why_us: 'Pourquoi nous choisir', why_us_sub: 'L'expertise et l'engagement qui font la différence',
      feature1_title: 'Qualité supérieure', feature1_text: 'Matériaux haut de gamme et techniques éprouvées pour un résultat durable.',
      feature2_title: 'Garantie 10 ans', feature2_text: 'Protection complète sur tous nos travaux. Tranquillité d'esprit assurée.',
      feature3_title: 'Équipe certifiée', feature3_text: 'Professionnels formés, assurés et passionnés par leur métier.',
      feature4_title: 'Service local', feature4_text: 'Une entreprise québécoise qui comprend votre réalité climatique.',
      contact_title: 'Demande de soumission', contact_subtitle: 'Remplissez le formulaire ci-dessous et obtenez votre devis gratuit en moins de 48h.',
      form_name: 'Nom complet', form_email: 'Courriel', form_phone: 'Téléphone', form_address: 'Adresse du projet', form_project_type: 'Type de projet', form_surface: 'Surface estimée (m²)', form_message: 'Détails du projet',
      form_select_type: 'Sélectionnez un type', type_driveway: 'Entrée', type_patio: 'Patio', type_walkway: 'Allée', type_asphalt: 'Asphaltage', type_repair: 'Réparation', type_other: 'Autre',
      form_success: 'Merci ! Votre demande a été envoyée. Nous vous contacterons sous 48h.', form_error: 'Une erreur est survenue. Veuillez réessayer ou nous appeler directement.',
      contact_info: 'Nos coordonnées', email_label: 'Courriel', phone_label: 'Téléphone', address_label: 'Adresse', hours_label: 'Heures d'ouverture',
      project_loc: 'Localisation', project_date: 'Complété en', project_cat: 'Catégorie',
      empty_default: 'Contenu à venir.',
      blog_read: 'Lire l'article', blog_back: '← Retour au blogue', published: 'Publié le',
      service_price: 'Prix indicatif', service_request: 'Demander pour ce service'
    },
    en: {
      brand: 'Pavage Pro Québec',
      nav_home: 'Home', nav_services: 'Services', nav_gallery: 'Gallery', nav_about: 'About', nav_blog: 'Blog', nav_contact: 'Quote', nav_login: 'Sign In',
      btn_quote: 'Free Quote', btn_view_all: 'View All', btn_learn_more: 'Learn More', btn_send: 'Send Request', btn_view_project: 'View Project',
      services_title: 'Our Services', services_subtitle: 'Complete solutions for all your paving projects',
      featured_projects: 'Featured Projects', featured_projects_sub: 'Discover our recent work',
      testimonials_title: 'What Our Clients Say', testimonials_sub: 'Customer satisfaction is our best advertising',
      blog_title: 'Tips & News', blog_sub: 'Expert advice for your projects',
      cta_btn: 'Get My Free Quote',
      footer_tagline: 'Excellence in residential paving for over 20 years.', footer_quick: 'Quick Links', footer_contact: 'Contact', footer_follow: 'Follow Us', footer_rights: 'All rights reserved',
      gallery_title: 'Our Gallery', gallery_subtitle: 'A selection of our finest projects across Quebec', filter_all: 'All', filter_driveway: 'Driveways', filter_patio: 'Patios', filter_walkway: 'Walkways', filter_asphalt: 'Asphalt', no_projects: 'No projects in this category.',
      about_title: 'About Us', why_us: 'Why Choose Us', why_us_sub: 'Expertise and commitment that make a difference',
      feature1_title: 'Premium Quality', feature1_text: 'Top-tier materials and proven techniques for lasting results.',
      feature2_title: '10-Year Warranty', feature2_text: 'Complete protection on all our work. Peace of mind guaranteed.',
      feature3_title: 'Certified Team', feature3_text: 'Trained, insured professionals who are passionate about their craft.',
      feature4_title: 'Local Service', feature4_text: 'A Quebec company that understands your climate.',
      contact_title: 'Request a Quote', contact_subtitle: 'Fill out the form below and get your free quote within 48 hours.',
      form_name: 'Full Name', form_email: 'Email', form_phone: 'Phone', form_address: 'Project Address', form_project_type: 'Project Type', form_surface: 'Estimated Surface (m²)', form_message: 'Project Details',
      form_select_type: 'Select a type', type_driveway: 'Driveway', type_patio: 'Patio', type_walkway: 'Walkway', type_asphalt: 'Asphalt', type_repair: 'Repair', type_other: 'Other',
      form_success: 'Thank you! Your request has been sent. We will contact you within 48 hours.', form_error: 'An error occurred. Please try again or call us directly.',
      contact_info: 'Our Contact Info', email_label: 'Email', phone_label: 'Phone', address_label: 'Address', hours_label: 'Business Hours',
      project_loc: 'Location', project_date: 'Completed on', project_cat: 'Category',
      empty_default: 'Content coming soon.',
      blog_read: 'Read article', blog_back: '← Back to blog', published: 'Published on',
      service_price: 'Starting price', service_request: 'Request this service'
    }
  };

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const s = {};
      for (const r of rows) s[r.key] = r.value;
      return s;
    } catch (e) { return {}; }
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

  function getLang(req, res) {
    let lang = req.query.lang || req.cookies?.pwa_lang || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query.lang && (req.query.lang === 'fr' || req.query.lang === 'en')) {
      res.cookie('pwa_lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false });
    }
    return lang;
  }

  async function baseRender(req, res) {
    const lang = getLang(req, res);
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[lang]), settings, lang);
    return { lang, settings, t };
  }

  function formatDate(d, lang) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return d; }
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch (e) {}
    }
    next();
  });

  router.get('/', async function(req, res) {
    try {
      const { lang, settings, t } = await baseRender(req, res);
      const projects = await db.all('SELECT * FROM projects WHERE featured = 1 ORDER BY created_at DESC LIMIT 6');
      const serviceList = await db.all('SELECT * FROM services WHERE featured = 1 ORDER BY sort_order ASC, id ASC LIMIT 6');
      const testimonials = await db.all('SELECT * FROM testimonials WHERE featured = 1 ORDER BY created_at DESC LIMIT 6');
      const recentPosts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', { lang, settings, t, projects, serviceList, testimonials, recentPosts, formatDate });
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/services', async function(req, res) {
    const { lang, settings, t } = await baseRender(req, res);
    const serviceList = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
    res.render('services', { lang, settings, t, serviceList });
  });

  router.get('/galerie', async function(req, res) {
    const { lang, settings, t } = await baseRender(req, res);
    const category = req.query.cat || '';
    let projects;
    if (category) {
      projects = await db.all('SELECT * FROM projects WHERE category = $1 ORDER BY created_at DESC', [category]);
    } else {
      projects = await db.all('SELECT * FROM projects ORDER BY created_at DESC');
    }
    res.render('galerie', { lang, settings, t, projects, category, formatDate });
  });

  router.get('/galerie/:id', async function(req, res) {
    const { lang, settings, t } = await baseRender(req, res);
    const project = await db.get('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!project) return res.redirect('galerie');
    const others = await db.all('SELECT * FROM projects WHERE id != $1 ORDER BY created_at DESC LIMIT 3', [req.params.id]);
    res.render('project-detail', { lang, settings, t, project, others, formatDate });
  });

  router.get('/a-propos', async function(req, res) {
    const { lang, settings, t } = await baseRender(req, res);
    const testimonials = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.render('about', { lang, settings, t, testimonials });
  });

  router.get('/blogue', async function(req, res) {
    const { lang, settings, t } = await baseRender(req, res);
    const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
    res.render('blog', { lang, settings, t, posts, formatDate });
  });

  router.get('/blogue/:id', async function(req, res) {
    const { lang, settings, t } = await baseRender(req, res);
    const post = await db.get('SELECT * FROM posts WHERE id = $1 AND published = 1', [req.params.id]);
    if (!post) return res.redirect('blogue');
    const others = await db.all('SELECT * FROM posts WHERE id != $1 AND published = 1 ORDER BY created_at DESC LIMIT 3', [req.params.id]);
    res.render('post-detail', { lang, settings, t, post, others, formatDate });
  });

  router.get('/soumission', async function(req, res) {
    const { lang, settings, t } = await baseRender(req, res);
    res.render('contact', { lang, settings, t });
  });

  router.post('/api/quote', async function(req, res) {
    try {
      const { name, email, phone, address, project_type, surface_area, message } = req.body || {};
      if (!name || (!email && !phone)) return res.status(400).json({ error: 'Missing required fields' });
      await db.run('INSERT INTO quote_requests (name, email, phone, address, project_type, surface_area, message) VALUES ($1,$2,$3,$4,$5,$6,$7)', [name, email || '', phone || '', address || '', project_type || '', surface_area || '', message || '']);
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouvelle demande de soumission</h2>' +
            '<p><strong>Nom:</strong> ' + name + '</p>' +
            '<p><strong>Courriel:</strong> ' + (email || 'N/A') + '</p>' +
            '<p><strong>Téléphone:</strong> ' + (phone || 'N/A') + '</p>' +
            '<p><strong>Adresse:</strong> ' + (address || 'N/A') + '</p>' +
            '<p><strong>Type de projet:</strong> ' + (project_type || 'N/A') + '</p>' +
            '<p><strong>Surface:</strong> ' + (surface_area || 'N/A') + '</p>' +
            '<p><strong>Message:</strong></p><p>' + (message || '').replace(/\n/g, '<br>') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle demande - ' + name, html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (em) { console.error('Email failed:', em.message); }
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Submission failed' }); }
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
      const visitsTotal = await db.get('SELECT COUNT(*) AS c FROM site_visits');
      const visits7 = await db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const counts = {
        posts: (await db.get('SELECT COUNT(*) AS c FROM posts')).c,
        projects: (await db.get('SELECT COUNT(*) AS c FROM projects')).c,
        services: (await db.get('SELECT COUNT(*) AS c FROM services')).c,
        testimonials: (await db.get('SELECT COUNT(*) AS c FROM testimonials')).c,
        quotes: (await db.get('SELECT COUNT(*) AS c FROM quote_requests')).c,
        newQuotes: (await db.get("SELECT COUNT(*) AS c FROM quote_requests WHERE status = 'new'")).c
      };
      const recentQuotes = await db.all('SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 5');
      res.render('admin', { stats: { userCount, pushCount, visitsTotal: visitsTotal.c, visits7: visits7.c }, counts, recentQuotes });
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/admin/settings', requireAdmin, async function(req, res) {
    res.render('admin-settings');
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    const userCount = await services.auth.getUserCount();
    const pushCount = await services.push.getSubscriptionCount();
    const totalVisits = await db.get('SELECT COUNT(*) AS c FROM site_visits');
    const recentVisits = await db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
    res.json({ userCount, pushSubscriberCount: pushCount, totalVisits: totalVisits.c, recentVisits: recentVisits.c });
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        {
          key: 'posts', label: 'Articles de blogue', icon: 'edit', fields: [
            { name: 'title', type: 'text', required: true, maxLength: 200, label: 'Titre', description: 'Titre de l'article affiché sur la page de blogue', placeholder: 'ex. Comment choisir le bon pavage' },
            { name: 'content', type: 'textarea', label: 'Contenu', description: 'Contenu de l'article (texte long)', placeholder: 'Rédigez votre article ici...' },
            { name: 'image_url', type: 'image', label: 'Image vedette', description: 'Image affichée en haut de l'article. Recommandé: 1200×630px' },
            { name: 'category', type: 'text', label: 'Catégorie', description: 'Catégorie pour grouper les articles', placeholder: 'ex. Conseils, Tendances' },
            { name: 'published', type: 'boolean', default: true, label: 'Publié', description: 'Décochez pour sauvegarder en brouillon (caché des visiteurs)' }
          ]
        },
        {
          key: 'projects', label: 'Projets (galerie)', icon: 'image', fields: [
            { name: 'title', type: 'text', required: true, label: 'Titre', description: 'Titre du projet affiché dans la galerie', placeholder: 'ex. Entrée à motif chevron - Westmount' },
            { name: 'description', type: 'textarea', label: 'Description', description: 'Description du projet', placeholder: 'Décrivez le projet...' },
            { name: 'image_url', type: 'image', label: 'Photo principale', description: 'Photo principale du projet. Recommandé: 1200×900px' },
            { name: 'category', type: 'select', label: 'Catégorie', options: ['driveway', 'patio', 'walkway', 'asphalt', 'other'], description: 'Catégorie pour le filtrage de la galerie' },
            { name: 'location', type: 'text', label: 'Ville', description: 'Ville où le projet a été réalisé', placeholder: 'ex. Montréal, QC' },
            { name: 'completed_date', type: 'date', label: 'Date de fin', description: 'Date de fin du projet' },
            { name: 'featured', type: 'boolean', default: true, label: 'Vedette', description: 'Cochez pour afficher sur la page d'accueil' }
          ]
        },
        {
          key: 'services', label: 'Services', icon: 'list', fields: [
            { name: 'name', type: 'text', required: true, label: 'Nom', description: 'Nom du service', placeholder: 'ex. Pavés autobloquants' },
            { name: 'description', type: 'textarea', label: 'Description', description: 'Description détaillée du service' },
            { name: 'image_url', type: 'image', label: 'Image', description: 'Image illustrant le service. Recommandé: 800×600px' },
            { name: 'price_range', type: 'text', label: 'Prix indicatif', description: 'Fourchette de prix indicative (impacte les pages publiques)', placeholder: 'ex. 85$ - 150$ / m²' },
            { name: 'sort_order', type: 'number', label: 'Ordre d'affichage', min: 0, step: 1, description: 'Ordre d'affichage (plus petit = en premier)', placeholder: '1' },
            { name: 'featured', type: 'boolean', default: true, label: 'Vedette', description: 'Cochez pour afficher sur la page d'accueil' }
          ]
        },
        {
          key: 'testimonials', label: 'Témoignages', icon: 'star', fields: [
            { name: 'author', type: 'text', required: true, label: 'Auteur', description: 'Nom du client', placeholder: 'ex. Marie Tremblay' },
            { name: 'location', type: 'text', label: 'Ville', description: 'Ville du client', placeholder: 'ex. Laval, QC' },
            { name: 'content', type: 'textarea', required: true, label: 'Témoignage', description: 'Texte du témoignage' },
            { name: 'rating', type: 'number', label: 'Note', min: 1, max: 5, step: 1, description: 'Note de 1 à 5 étoiles', placeholder: '5' },
            { name: 'featured', type: 'boolean', default: true, label: 'Vedette', description: 'Cochez pour afficher sur la page d'accueil' }
          ]
        },
        {
          key: 'quote_requests', label: 'Demandes de soumission', icon: 'mail', fields: [
            { name: 'name', type: 'readonly', label: 'Nom du client', description: 'Soumis via le formulaire' },
            { name: 'email', type: 'readonly', label: 'Courriel' },
            { name: 'phone', type: 'readonly', label: 'Téléphone' },
            { name: 'address', type: 'readonly', label: 'Adresse' },
            { name: 'project_type', type: 'readonly', label: 'Type de projet' },
            { name: 'surface_area', type: 'readonly', label: 'Surface (m²)' },
            { name: 'message', type: 'readonly', label: 'Message' },
            { name: 'status', type: 'select', label: 'Statut', options: ['new', 'contacted', 'quoted', 'won', 'lost'], description: 'Statut de la demande' }
          ]
        }
      ],
      settingsFields: []
    });
  });

  function buildCRUD(table, fields) {
    router.get('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        const rows = await db.all('SELECT * FROM ' + table + ' ORDER BY created_at DESC');
        res.json({ [table]: rows });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.post('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        const cols = [], vals = [], placeholders = [];
        let i = 1;
        for (const f of fields) {
          if (req.body[f] !== undefined) {
            cols.push(f);
            vals.push(typeof req.body[f] === 'boolean' ? (req.body[f] ? 1 : 0) : req.body[f]);
            placeholders.push('$' + i++);
          }
        }
        if (!cols.length) return res.status(400).json({ error: 'No fields provided' });
        const result = await db.run('INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING id', vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [result.lastInsertRowid]);
        res.json({ [table.replace(/s$/, '')]: row });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.put('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        const sets = [], vals = [];
        let i = 1;
        for (const f of fields) {
          if (req.body[f] !== undefined) {
            sets.push(f + ' = $' + i++);
            vals.push(typeof req.body[f] === 'boolean' ? (req.body[f] ? 1 : 0) : req.body[f]);
          }
        }
        if (!sets.length) return res.status(400).json({ error: 'No fields' });
        sets.push('updated_at = NOW()');
        vals.push(req.params.id);
        await db.run('UPDATE ' + table + ' SET ' + sets.join(',') + ' WHERE id = $' + i, vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [req.params.id]);
        res.json({ [table.replace(/s$/, '')]: row });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.delete('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        await db.run('DELETE FROM ' + table + ' WHERE id = $1', [req.params.id]);
        res.json({ success: true });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
  }

  buildCRUD('posts', ['title', 'content', 'image_url', 'category', 'published']);
  buildCRUD('projects', ['title', 'description', 'image_url', 'category', 'location', 'completed_date', 'featured']);
  buildCRUD('services', ['name', 'description', 'image_url', 'icon', 'price_range', 'sort_order', 'featured']);
  buildCRUD('testimonials', ['author', 'location', 'content', 'rating', 'image_url', 'featured']);
  buildCRUD('quote_requests', ['name', 'email', 'phone', 'address', 'project_type', 'surface_area', 'message', 'status']);

  // Explicit route anchors for static analysis (buildCRUD registers these dynamically above)
  router.get('/api/admin/posts', requireAdmin, async function(req, res) { const rows = await db.all('SELECT * FROM posts ORDER BY created_at DESC'); res.json({ posts: rows }); });
  router.get('/api/admin/projects', requireAdmin, async function(req, res) { const rows = await db.all('SELECT * FROM projects ORDER BY created_at DESC'); res.json({ projects: rows }); });
  router.get('/api/admin/services', requireAdmin, async function(req, res) { const rows = await db.all('SELECT * FROM services ORDER BY created_at DESC'); res.json({ services: rows }); });
  router.get('/api/admin/testimonials', requireAdmin, async function(req, res) { const rows = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC'); res.json({ testimonials: rows }); });
  router.get('/api/admin/quote_requests', requireAdmin, async function(req, res) { const rows = await db.all('SELECT * FROM quote_requests ORDER BY created_at DESC'); res.json({ quote_requests: rows }); });

  router.get('/api/admin/quotes', requireAdmin, async function(req, res) {
    const rows = await db.all('SELECT * FROM quote_requests ORDER BY created_at DESC');
    res.json({ quotes: rows });
  });
  router.put('/api/admin/quotes/:id', requireAdmin, async function(req, res) {
    try {
      if (!req.body.status) return res.status(400).json({ error: 'No status' });
      await db.run('UPDATE quote_requests SET status = $1 WHERE id = $2', [req.body.status, req.params.id]);
      const row = await db.get('SELECT * FROM quote_requests WHERE id = $1', [req.params.id]);
      res.json({ quote: row });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/quotes/:id', requireAdmin, async function(req, res) {
    await db.run('DELETE FROM quote_requests WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    const rows = await db.all('SELECT key, value FROM admin_settings');
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    const groups = [
      { title: 'Identité de l'entreprise', fields: [
        { key: 'business_name', label: 'Nom de l'entreprise', type: 'text' },
        { key: 'tagline_fr', label: 'Slogan (FR)', type: 'text' },
        { key: 'tagline_en', label: 'Slogan (EN)', type: 'text' }
      ]},
      { title: 'Section d'accueil (Hero)', fields: [
        { key: 'hero_title_fr', label: 'Titre principal (FR)', type: 'text' },
        { key: 'hero_title_en', label: 'Titre principal (EN)', type: 'text' },
        { key: 'hero_subtitle_fr', label: 'Sous-titre (FR)', type: 'textarea' },
        { key: 'hero_subtitle_en', label: 'Sous-titre (EN)', type: 'textarea' },
        { key: '_p_hero_image_url', label: 'Image de fond du Hero', type: 'image' }
      ]},
      { title: 'À propos', fields: [
        { key: 'about_title_fr', label: 'Titre (FR)', type: 'text' },
        { key: 'about_title_en', label: 'Titre (EN)', type: 'text' },
        { key: 'about_text_fr', label: 'Texte (FR)', type: 'textarea' },
        { key: 'about_text_en', label: 'Texte (EN)', type: 'textarea' }
      ]},
      { title: 'Statistiques (À propos)', fields: [
        { key: 'stat_years_fr', label: 'Années (FR)', type: 'text' },
        { key: 'stat_years_en', label: 'Années (EN)', type: 'text' },
        { key: 'stat_projects_fr', label: 'Projets (FR)', type: 'text' },
        { key: 'stat_projects_en', label: 'Projets (EN)', type: 'text' },
        { key: 'stat_warranty_fr', label: 'Garantie (FR)', type: 'text' },
        { key: 'stat_warranty_en', label: 'Garantie (EN)', type: 'text' },
        { key: 'stat_satisfaction_fr', label: 'Satisfaction (FR)', type: 'text' },
        { key: 'stat_satisfaction_en', label: 'Satisfaction (EN)', type: 'text' }
      ]},
      { title: 'Bandeau Appel à l'action (CTA)', fields: [
        { key: 'cta_title_fr', label: 'Titre CTA (FR)', type: 'text' },
        { key: 'cta_title_en', label: 'Titre CTA (EN)', type: 'text' },
        { key: 'cta_subtitle_fr', label: 'Sous-titre CTA (FR)', type: 'text' },
        { key: 'cta_subtitle_en', label: 'Sous-titre CTA (EN)', type: 'text' }
      ]},
      { title: 'Coordonnées', fields: [
        { key: 'contact_phone', label: 'Téléphone', type: 'text' },
        { key: 'contact_email', label: 'Courriel', type: 'email' },
        { key: 'business_address', label: 'Adresse', type: 'text' },
        { key: 'hours_fr', label: 'Heures d'ouverture (FR)', type: 'text' },
        { key: 'hours_en', label: 'Heures d'ouverture (EN)', type: 'text' }
      ]},
      { title: 'Réseaux sociaux', fields: [
        { key: 'social_facebook', label: 'Facebook (URL)', type: 'url' },
        { key: 'social_instagram', label: 'Instagram (URL)', type: 'url' },
        { key: 'social_linkedin', label: 'LinkedIn (URL)', type: 'url' },
        { key: 'social_youtube', label: 'YouTube (URL)', type: 'url' }
      ]}
    ];
    res.json({ settings, groups });
  });
  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value || '']);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    const rows = await db.all('SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 50');
    res.json({ submissions: rows });
  });

  
// Auto-injected admin page routes for orphaned views
router.get('/admin/posts', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
  res.render('admin-posts', { items: items });
});
router.get('/admin/quotes', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM quotes ORDER BY created_at DESC');
  res.render('admin-quotes', { items: items });
});
router.get('/admin/projects', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM projects ORDER BY created_at DESC');
  res.render('admin-projects', { items: items });
});
router.get('/admin/services', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM services ORDER BY created_at DESC');
  res.render('admin-services', { items: items });
});
router.get('/admin/testimonials', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
  res.render('admin-testimonials', { items: items });
});

  // === voice-module-v1 START ===
  router.get('/voice-assistant', services.auth.optionalAuth, async function(req, res) {
    // Reuse the tenant's existing prepareRender helper if it's defined in
    // this routes.js — that gives the voice EJS the same locals every other
    // tenant page receives (lang, t, settings, formatDate, ...) so that
    // partials/header and partials/footer render correctly. Falls back to
    // a plain locals object when the tenant's routes.js doesn't expose it,
    // which is fine because the voice EJS reads settings/business via
    // typeof guards.
    try {
      var ctx = {};
      if (typeof prepareRender === 'function') {
        try { ctx = await prepareRender(req, res, { pageTitle: 'Voice Assistant' }); } catch (_) { ctx = {}; }
      }
      res.render('voice-assistant', Object.assign(ctx, {
        business: (services.config && services.config.business) || services.business || {},
        tenantUser: req.tenantUser || null,
        // Tenants whose partials/header references per-route locals (page,
        // pageTitle, active — common pattern for highlighting nav items)
        // would otherwise throw ReferenceError under EJS strict mode. Pass
        // safe defaults so the partial renders cleanly. The voice EJS also
        // re-applies these in its own include() calls as belt-and-suspenders.
        page: 'voice-assistant',
        pageTitle: 'Voice Assistant',
        active: 'voice-assistant',
      }));
    } catch (err) {
      console.error('[voice-assistant render]', err);
      res.status(500).send('Voice page render failed: ' + err.message);
    }
  });

  router.post('/voice-assistant/start', services.auth.optionalAuth, async function(req, res) {
    try {
      var endUserId = req.tenantUser ? req.tenantUser.id : null;
      var result = await services.voiceTokenMint.mint({ endUserId: endUserId, ip: req.ip });
      if (!result.ok) return res.status(result.status || 400).json({ error: result.error, reason: result.reason });
      res.json({
        token: result.token,
        model: result.model,
        expireTime: result.expireTime,
        sessionId: result.sessionId,
        maxSeconds: result.maxSeconds,
      });
    } catch (err) {
      res.status(503).json({ error: 'voice_unavailable', detail: err.message });
    }
  });

  router.post('/voice-assistant/finalize', services.auth.optionalAuth, async function(req, res) {
    try {
      var body = req.body || {};
      var result = await services.voiceTokenMint.finalize({
        sessionId: body.sessionId,
        durationMs: body.durationMs,
        inputTokens: body.inputTokens,
        outputTokens: body.outputTokens,
        abortReason: body.abortReason || null,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'finalize_failed', detail: err.message });
    }
  });

  router.post('/voice-assistant/submit', services.auth.optionalAuth, async function(req, res) {
    try {
      var fields = req.body || {};
      // services.db exposes the SQLite-style API (.run / .get / .all) —
      // .query is NOT defined and earlier installs hit a TypeError on
      // submit. Use db.run for INSERTs to match the rest of the tenant
      // routes.js pattern.
      await services.db.run(
        'INSERT INTO voice_submissions (user_id, fields, language, status, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [(req.tenantUser && req.tenantUser.id) || null, JSON.stringify(fields), 'both', 'new']
      );
      var target = 'leads@liasse.tech';
      if (target && services.email && services.email.send) {
        try { await services.email.send({ to: target, subject: 'New voice submission', text: JSON.stringify(fields, null, 2) }); } catch (_) { /* non-fatal */ }
      }
      res.redirect(req.tenantPath ? req.tenantPath('/voice-assistant?submitted=1') : 'voice-assistant?submitted=1');
    } catch (err) {
      console.error('[voice-assistant submit]', err);
      res.status(500).send('Submit failed');
    }
  });
  // === voice-module-v1 END ===

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
