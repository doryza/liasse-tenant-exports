module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const T = {
    fr: {
      brand_tagline: 'Pavage professionnel à Montréal',
      nav_home: 'Accueil', nav_services: 'Services', nav_gallery: 'Galerie', nav_reviews: 'Avis', nav_booking: 'Rendez-vous', nav_contact: 'Soumission', nav_blog: 'Blogue', nav_account: 'Mon compte', nav_login: 'Connexion', nav_logout: 'Déconnexion',
      hero_cta_quote: 'Soumission gratuite', hero_cta_booking: 'Prendre rendez-vous',
      services_title: 'Nos services', services_subtitle: 'Des solutions de pavage complètes pour tous vos projets, résidentiels et commerciaux.',
      services_from: 'À partir de', services_per_sqft: '/pi²', services_duration: 'Durée typique', services_view_all: 'Voir tous les services',
      gallery_title: 'Nos réalisations', gallery_subtitle: 'Découvrez nos projets récents à travers le Grand Montréal.', gallery_view_all: 'Voir la galerie complète', gallery_completed: 'Terminé en',
      reviews_title: 'Ce que disent nos clients', reviews_subtitle: 'Plus de 1500 clients satisfaits depuis 2003.', reviews_view_all: 'Lire tous les avis',
      map_title: 'Notre zone de service', map_subtitle: 'Nous desservons fièrement le Grand Montréal et les régions environnantes.',
      blog_title: 'Conseils et actualités', blog_subtitle: "Tout ce que vous devez savoir sur le pavage et l'entretien.", blog_read_more: 'Lire la suite', blog_back: 'Retour au blogue', blog_by: 'Par', blog_in: 'dans',
      cta_title: 'Prêt à commencer votre projet?', cta_subtitle: 'Obtenez une soumission gratuite et sans engagement en moins de 24 heures.', cta_button_quote: 'Demander une soumission', cta_button_call: 'Appelez-nous',
      contact_title: 'Demande de soumission', contact_subtitle: 'Remplissez le formulaire et nous vous reviendrons rapidement avec une soumission gratuite.', contact_info_title: 'Coordonnées', contact_email_label: 'Courriel', contact_phone_label: 'Téléphone', contact_address_label: 'Adresse', contact_hours_label: "Heures d'ouverture", contact_hours_value: 'Lun-Ven: 7h-18h\nSam: 8h-15h',
      booking_title: 'Prendre rendez-vous', booking_subtitle: 'Réservez une visite sur place pour évaluer votre projet. Un de nos experts se déplacera gratuitement.', booking_my_appointments: 'Mes rendez-vous', booking_no_appointments: "Vous n'avez pas encore de rendez-vous.",
      form_name: 'Nom complet', form_email: 'Courriel', form_phone: 'Téléphone', form_service: 'Type de service', form_service_select: 'Sélectionnez un service', form_date: 'Date préférée', form_time: 'Heure préférée', form_time_morning: 'Avant-midi (8h-12h)', form_time_afternoon: 'Après-midi (12h-17h)', form_address: 'Adresse du projet', form_size: 'Taille approximative du projet', form_size_small: 'Petit (< 50 m²)', form_size_medium: 'Moyen (50-200 m²)', form_size_large: 'Grand (200-500 m²)', form_size_xlarge: 'Très grand (> 500 m²)', form_message: 'Description du projet', form_notes: 'Notes additionnelles', form_submit_quote: 'Envoyer la demande', form_submit_booking: 'Confirmer le rendez-vous', form_success_quote: 'Merci! Votre demande de soumission a été reçue. Nous vous contacterons sous 24h.', form_success_booking: "Votre demande de rendez-vous a été reçue. Nous vous confirmerons l'heure exacte par téléphone.", form_error: 'Une erreur est survenue. Veuillez réessayer.', form_required: 'Champs obligatoires',
      footer_quick_links: 'Liens rapides', footer_contact: 'Contact', footer_follow: 'Suivez-nous', footer_copyright: 'Tous droits réservés',
      common_loading: 'Chargement...', common_save: 'Enregistrer', common_cancel: 'Annuler', common_delete: 'Supprimer', common_edit: 'Modifier', common_add: 'Ajouter', common_close: 'Fermer', common_back: 'Retour', common_status: 'Statut', common_actions: 'Actions',
      empty_no_projects: 'Aucun projet à afficher pour le moment.', empty_no_reviews: 'Aucun avis pour le moment.', empty_no_posts: 'Aucun article publié pour le moment.', empty_no_services: 'Aucun service disponible.',
      install_title: 'Installer MTL Pavage', push_title: 'Restez informé', push_desc: 'Recevez nos conseils et offres saisonnières.',
      enable_notif: 'Activer les notifications'
    },
    en: {
      brand_tagline: 'Professional paving in Montreal',
      nav_home: 'Home', nav_services: 'Services', nav_gallery: 'Gallery', nav_reviews: 'Reviews', nav_booking: 'Booking', nav_contact: 'Quote', nav_blog: 'Blog', nav_account: 'My account', nav_login: 'Sign In', nav_logout: 'Sign Out',
      hero_cta_quote: 'Free quote', hero_cta_booking: 'Book a visit',
      services_title: 'Our services', services_subtitle: 'Complete paving solutions for residential and commercial projects.',
      services_from: 'From', services_per_sqft: '/sqft', services_duration: 'Typical duration', services_view_all: 'View all services',
      gallery_title: 'Our work', gallery_subtitle: 'Explore our recent projects across Greater Montreal.', gallery_view_all: 'View full gallery', gallery_completed: 'Completed',
      reviews_title: 'What our clients say', reviews_subtitle: 'Over 1500 satisfied clients since 2003.', reviews_view_all: 'Read all reviews',
      map_title: 'Our service area', map_subtitle: 'We proudly serve Greater Montreal and surrounding regions.',
      blog_title: 'Tips and news', blog_subtitle: 'Everything you need to know about paving and maintenance.', blog_read_more: 'Read more', blog_back: 'Back to blog', blog_by: 'By', blog_in: 'in',
      cta_title: 'Ready to start your project?', cta_subtitle: 'Get a free, no-obligation quote in less than 24 hours.', cta_button_quote: 'Request a quote', cta_button_call: 'Call us',
      contact_title: 'Request a quote', contact_subtitle: "Fill out the form and we'll get back to you quickly with a free quote.", contact_info_title: 'Contact info', contact_email_label: 'Email', contact_phone_label: 'Phone', contact_address_label: 'Address', contact_hours_label: 'Business hours', contact_hours_value: 'Mon-Fri: 7am-6pm\nSat: 8am-3pm',
      booking_title: 'Book an appointment', booking_subtitle: 'Schedule an on-site visit to evaluate your project. One of our experts will come for free.', booking_my_appointments: 'My appointments', booking_no_appointments: 'You have no appointments yet.',
      form_name: 'Full name', form_email: 'Email', form_phone: 'Phone', form_service: 'Service type', form_service_select: 'Select a service', form_date: 'Preferred date', form_time: 'Preferred time', form_time_morning: 'Morning (8am-12pm)', form_time_afternoon: 'Afternoon (12pm-5pm)', form_address: 'Project address', form_size: 'Approximate project size', form_size_small: 'Small (< 50 m²)', form_size_medium: 'Medium (50-200 m²)', form_size_large: 'Large (200-500 m²)', form_size_xlarge: 'Very large (> 500 m²)', form_message: 'Project description', form_notes: 'Additional notes', form_submit_quote: 'Send request', form_submit_booking: 'Confirm appointment', form_success_quote: "Thank you! Your quote request has been received. We'll contact you within 24h.", form_success_booking: "Your appointment request has been received. We'll confirm the exact time by phone.", form_error: 'An error occurred. Please try again.', form_required: 'Required fields',
      footer_quick_links: 'Quick links', footer_contact: 'Contact', footer_follow: 'Follow us', footer_copyright: 'All rights reserved',
      common_loading: 'Loading...', common_save: 'Save', common_cancel: 'Cancel', common_delete: 'Delete', common_edit: 'Edit', common_add: 'Add', common_close: 'Close', common_back: 'Back', common_status: 'Status', common_actions: 'Actions',
      empty_no_projects: 'No projects to display yet.', empty_no_reviews: 'No reviews yet.', empty_no_posts: 'No articles published yet.', empty_no_services: 'No services available.',
      install_title: 'Install MTL Pavage', push_title: 'Stay informed', push_desc: 'Get our seasonal tips and offers.',
      enable_notif: 'Enable notifications'
    }
  };

  function pickLang(req, res) {
    var lang = req.query.lang;
    if (lang === 'fr' || lang === 'en') {
      res.cookie('pwa_lang', lang, { maxAge: 365*24*60*60*1000 });
    } else {
      lang = req.cookies && req.cookies.pwa_lang;
      if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    }
    return lang;
  }

  async function getSettings() {
    try {
      var rows = await db.all('SELECT key, value FROM admin_settings');
      var s = {};
      rows.forEach(function(r) { s[r.key] = r.value; });
      return s;
    } catch (e) { return {}; }
  }

  function applyTextOverrides(t, settings, lang) {
    for (var k in settings) {
      if (k.indexOf('text_') === 0 && k.endsWith('_' + lang)) {
        var tKey = k.slice(5, -(lang.length + 1));
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  async function ctx(req, res, extras) {
    var lang = pickLang(req, res);
    var settings = await getSettings();
    var t = applyTextOverrides(Object.assign({}, T[lang] || T.fr), settings, lang);
    return Object.assign({
      lang: lang, t: t, settings: settings,
      user: req.user || null,
      googleApiKey: services.google && services.google.mapsApiKey,
      formatDate: formatDate, formatPrice: formatPrice, truncate: truncate,
      currentPath: req.path
    }, extras || {});
  }

  function formatDate(d, lang) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return String(d); }
  }
  function formatPrice(amount) {
    if (amount == null || amount === '') return '';
    return Number(amount).toFixed(2) + ' $';
  }
  function truncate(s, n) {
    if (!s) return '';
    s = String(s);
    return s.length > n ? s.slice(0, n).trim() + '…' : s;
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch (e) {}
    }
    next();
  });

  router.get('/', services.auth.optionalAuth, async function(req, res) {
    try {
      var c = await ctx(req, res);
      var projects = await db.all('SELECT * FROM projects WHERE published=1 ORDER BY featured DESC, completed_date DESC NULLS LAST, created_at DESC LIMIT 6');
      var reviews = await db.all('SELECT * FROM reviews WHERE published=1 ORDER BY created_at DESC LIMIT 6');
      var servicesList = await db.all('SELECT * FROM services WHERE published=1 ORDER BY featured DESC, display_order ASC, id ASC LIMIT 6');
      var posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', Object.assign(c, { projects: projects, reviews: reviews, services: servicesList, posts: posts }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/services', services.auth.optionalAuth, async function(req, res) {
    try {
      var c = await ctx(req, res);
      var items = await db.all('SELECT * FROM services WHERE published=1 ORDER BY display_order ASC, id ASC');
      res.render('services', Object.assign(c, { items: items }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/galerie', services.auth.optionalAuth, async function(req, res) {
    try {
      var c = await ctx(req, res);
      var cat = req.query.cat || null;
      var items;
      if (cat) items = await db.all('SELECT * FROM projects WHERE published=1 AND category=$1 ORDER BY completed_date DESC NULLS LAST, created_at DESC', [cat]);
      else items = await db.all('SELECT * FROM projects WHERE published=1 ORDER BY completed_date DESC NULLS LAST, created_at DESC');
      var cats = await db.all('SELECT DISTINCT category FROM projects WHERE published=1 AND category IS NOT NULL ORDER BY category');
      res.render('galerie', Object.assign(c, { items: items, cats: cats.map(function(r) { return r.category; }), activeCat: cat }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/avis', services.auth.optionalAuth, async function(req, res) {
    try {
      var c = await ctx(req, res);
      var items = await db.all('SELECT * FROM reviews WHERE published=1 ORDER BY created_at DESC');
      var avg = await db.get('SELECT AVG(rating)::float AS avg, COUNT(*)::int AS cnt FROM reviews WHERE published=1');
      res.render('avis', Object.assign(c, { items: items, avgRating: avg && avg.avg ? Number(avg.avg).toFixed(1) : '0', totalReviews: (avg && avg.cnt) || 0 }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/rendez-vous', services.auth.optionalAuth, async function(req, res) {
    try {
      var c = await ctx(req, res);
      var servicesList = await db.all('SELECT id, name FROM services WHERE published=1 ORDER BY display_order ASC');
      var myAppts = [];
      if (req.user) {
        myAppts = await db.all('SELECT * FROM appointments WHERE user_id=$1 OR email=$2 ORDER BY preferred_date DESC NULLS LAST, created_at DESC LIMIT 10', [req.user.id, req.user.email || '']);
      }
      res.render('rendez-vous', Object.assign(c, { servicesList: servicesList, myAppts: myAppts }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.post('/api/booking', services.auth.optionalAuth, async function(req, res) {
    try {
      var body = req.body || {};
      var name = body.name, email = body.email, phone = body.phone, service_type = body.service_type;
      var preferred_date = body.preferred_date, preferred_time = body.preferred_time, address = body.address, notes = body.notes;
      if (!name || (!email && !phone)) return res.status(400).json({ error: 'Missing required fields' });
      var uid = req.user ? req.user.id : null;
      var ins = await db.run('INSERT INTO appointments (name, email, phone, service_type, preferred_date, preferred_time, address, notes, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [name, email||'', phone||'', service_type||'', preferred_date||null, preferred_time||'', address||'', notes||'', uid]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouveau rendez-vous - ' + name,
            html: '<h2>Nouvelle demande de rendez-vous</h2><p><b>Nom:</b> '+name+'</p><p><b>Courriel:</b> '+(email||'-')+'</p><p><b>Téléphone:</b> '+(phone||'-')+'</p><p><b>Service:</b> '+(service_type||'-')+'</p><p><b>Date souhaitée:</b> '+(preferred_date||'-')+' '+(preferred_time||'')+'</p><p><b>Adresse:</b> '+(address||'-')+'</p><p><b>Notes:</b><br>'+(notes||'-')+'</p>'
          });
        }
      } catch (e) { console.error('Email failed:', e.message); }
      res.json({ success: true, id: ins.lastInsertRowid });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
  });

  router.get('/contact', services.auth.optionalAuth, async function(req, res) {
    try {
      var c = await ctx(req, res);
      var servicesList = await db.all('SELECT id, name FROM services WHERE published=1 ORDER BY display_order ASC');
      res.render('contact', Object.assign(c, { servicesList: servicesList }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.post('/api/quote', services.auth.optionalAuth, async function(req, res) {
    try {
      var body = req.body || {};
      var name = body.name, email = body.email, phone = body.phone, service_type = body.service_type;
      var project_size = body.project_size, address = body.address, message = body.message;
      if (!name || (!email && !phone)) return res.status(400).json({ error: 'Missing required fields' });
      var ins = await db.run('INSERT INTO quote_requests (name, email, phone, service_type, project_size, address, message) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [name, email||'', phone||'', service_type||'', project_size||'', address||'', message||'']);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouvelle soumission - ' + name,
            html: '<h2>Nouvelle demande de soumission</h2><p><b>Nom:</b> '+name+'</p><p><b>Courriel:</b> '+(email||'-')+'</p><p><b>Téléphone:</b> '+(phone||'-')+'</p><p><b>Service:</b> '+(service_type||'-')+'</p><p><b>Taille:</b> '+(project_size||'-')+'</p><p><b>Adresse:</b> '+(address||'-')+'</p><p><b>Message:</b><br>'+(message||'-')+'</p>'
          });
        }
      } catch (e) { console.error('Email failed:', e.message); }
      res.json({ success: true, id: ins.lastInsertRowid });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
  });

  router.get('/blog', services.auth.optionalAuth, async function(req, res) {
    try {
      var c = await ctx(req, res);
      var items = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC');
      res.render('blog', Object.assign(c, { items: items }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/blog/:id', services.auth.optionalAuth, async function(req, res) {
    try {
      var c = await ctx(req, res);
      var post = await db.get('SELECT * FROM posts WHERE id=$1 AND published=1', [req.params.id]);
      if (!post) return res.redirect('blog');
      var related = await db.all('SELECT * FROM posts WHERE id!=$1 AND published=1 ORDER BY created_at DESC LIMIT 3', [req.params.id]);
      res.render('blog-post', Object.assign(c, { post: post, related: related }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
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
      var c = await ctx(req, res);
      var stats = {};
      stats.posts = (await db.get('SELECT COUNT(*)::int AS c FROM posts')).c;
      stats.services = (await db.get('SELECT COUNT(*)::int AS c FROM services')).c;
      stats.projects = (await db.get('SELECT COUNT(*)::int AS c FROM projects')).c;
      stats.reviews = (await db.get('SELECT COUNT(*)::int AS c FROM reviews')).c;
      stats.appointments = (await db.get('SELECT COUNT(*)::int AS c FROM appointments')).c;
      stats.pendingAppts = (await db.get("SELECT COUNT(*)::int AS c FROM appointments WHERE status='pending'")).c;
      stats.quotes = (await db.get('SELECT COUNT(*)::int AS c FROM quote_requests')).c;
      stats.newQuotes = (await db.get("SELECT COUNT(*)::int AS c FROM quote_requests WHERE status='new'")).c;
      stats.visits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c;
      stats.visits_7d = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'")).c;
      stats.users = await services.auth.getUserCount();
      stats.pushSubs = await services.push.getSubscriptionCount();
      var recentQuotes = await db.all('SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 5');
      var recentAppts = await db.all('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5');
      res.render('admin', Object.assign(c, { stats: stats, recentQuotes: recentQuotes, recentAppts: recentAppts }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/admin/posts', requireAdmin, async function(req, res) {
    try {
      var c = await ctx(req, res);
      res.render('admin-posts', Object.assign(c, { moduleKey: 'posts', moduleLabel: 'Articles', pageTitle: 'Articles' }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/admin/services', requireAdmin, async function(req, res) {
    try {
      var c = await ctx(req, res);
      res.render('admin-services', Object.assign(c, { moduleKey: 'services', moduleLabel: 'Services', pageTitle: 'Services' }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/admin/projects', requireAdmin, async function(req, res) {
    try {
      var c = await ctx(req, res);
      res.render('admin-projects', Object.assign(c, { moduleKey: 'projects', moduleLabel: 'Projets', pageTitle: 'Projets' }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/admin/reviews', requireAdmin, async function(req, res) {
    try {
      var c = await ctx(req, res);
      res.render('admin-reviews', Object.assign(c, { moduleKey: 'reviews', moduleLabel: 'Avis', pageTitle: 'Avis' }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/admin/appointments', requireAdmin, async function(req, res) {
    try {
      var c = await ctx(req, res);
      res.render('admin-appointments', Object.assign(c, { moduleKey: 'appointments', moduleLabel: 'Rendez-vous', pageTitle: 'Rendez-vous' }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/admin/quote-requests', requireAdmin, async function(req, res) {
    try {
      var c = await ctx(req, res);
      res.render('admin-quote-requests', Object.assign(c, { moduleKey: 'quote_requests', moduleLabel: 'Soumissions', pageTitle: 'Soumissions' }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/admin/settings', requireAdmin, async function(req, res) {
    try {
      var c = await ctx(req, res);
      res.render('admin-settings', Object.assign(c, { pageTitle: 'Zone de service' }));
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      var userCount = await services.auth.getUserCount();
      var pushSubscriberCount = await services.push.getSubscriptionCount();
      var totalVisits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c;
      var recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'")).c;
      res.json({ userCount: userCount, pushSubscriberCount: pushSubscriberCount, totalVisits: totalVisits, recentVisits: recentVisits });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/modules', requireAdmin, async function(req, res) {
    res.json({
      modules: [
        {
          key: 'posts', label: 'Articles', icon: 'edit',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 200, description: "Titre affiché en haut de l'article et dans les listes du blogue.", placeholder: 'ex. Quand sceller son asphalte?' },
            { name: 'excerpt', type: 'textarea', description: 'Résumé court affiché dans la liste du blogue (1-2 phrases).', placeholder: 'Un bref résumé de l\'article...' },
            { name: 'content', type: 'textarea', description: 'Contenu complet de l\'article. Sauts de ligne préservés.', placeholder: 'Rédigez votre article ici...' },
            { name: 'image_url', type: 'image', description: 'Image en vedette de l\'article. Recommandé: 1200×800px.' },
            { name: 'category', type: 'text', maxLength: 50, description: 'Catégorie pour regrouper les articles (ex. Entretien, Conseils).', placeholder: 'ex. Entretien' },
            { name: 'author', type: 'text', maxLength: 100, description: "Nom de l'auteur affiché sur la page de l'article.", placeholder: 'ex. Équipe MTL Pavage' },
            { name: 'published', type: 'boolean', default: true, description: 'Décochez pour sauvegarder en brouillon (non visible publiquement).' }
          ]
        },
        {
          key: 'services', label: 'Services', icon: 'list',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 100, description: 'Nom du service tel qu\'affiché aux clients.', placeholder: 'ex. Pavage d\'allées résidentielles' },
            { name: 'description', type: 'textarea', description: 'Description détaillée du service (2-4 phrases).', placeholder: 'Décrivez le service...' },
            { name: 'icon', type: 'select', options: ['home','briefcase','shield','tool','truck','edit'], description: 'Icône (home, briefcase, shield, tool, truck, edit).' },
            { name: 'image_url', type: 'image', description: 'Image illustrative du service. Recommandé: 800×600px.' },
            { name: 'price_from', type: 'number', min: 0, step: 0.01, description: 'Prix de départ (par pied carré ou unité). Optionnel.', placeholder: 'ex. 8.50' },
            { name: 'duration', type: 'text', maxLength: 50, description: 'Durée typique (ex. 1-2 jours).', placeholder: 'ex. 1-2 jours' },
            { name: 'featured', type: 'boolean', default: false, description: 'Cocher pour mettre en vedette sur l\'accueil.' },
            { name: 'display_order', type: 'number', min: 0, step: 1, default: 0, description: 'Ordre d\'affichage (plus petit = en premier).', placeholder: '0' },
            { name: 'published', type: 'boolean', default: true, description: 'Décochez pour masquer du site public.' }
          ]
        },
        {
          key: 'projects', label: 'Projets', icon: 'image',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 150, description: 'Titre du projet affiché dans la galerie.', placeholder: 'ex. Allée résidentielle - Outremont' },
            { name: 'description', type: 'textarea', description: 'Description du projet (taille, matériaux, défi relevé).', placeholder: 'Décrivez le projet...' },
            { name: 'image_url', type: 'image', description: 'Photo principale du projet. Recommandé: 1200×900px.' },
            { name: 'location', type: 'text', maxLength: 100, description: 'Quartier ou ville où le projet a été réalisé.', placeholder: 'ex. Outremont, Montréal' },
            { name: 'category', type: 'select', options: ['Résidentiel', 'Commercial', 'Scellement', 'Réparation', 'Marquage'], description: 'Catégorie du projet.' },
            { name: 'completed_date', type: 'date', description: "Date d'achèvement du projet." },
            { name: 'featured', type: 'boolean', default: false, description: 'Cocher pour mettre en vedette sur l\'accueil.' },
            { name: 'published', type: 'boolean', default: true, description: 'Décochez pour masquer de la galerie publique.' }
          ]
        },
        {
          key: 'reviews', label: 'Avis', icon: 'star',
          fields: [
            { name: 'author', type: 'text', required: true, maxLength: 100, description: 'Nom du client (avec discrétion si demandé, ex. Marie L.).', placeholder: 'ex. Marie L.' },
            { name: 'location', type: 'text', maxLength: 100, description: 'Ville ou quartier du client.', placeholder: 'ex. Outremont' },
            { name: 'rating', type: 'number', min: 1, max: 5, step: 1, default: 5, description: 'Note de 1 à 5 étoiles.', placeholder: '5' },
            { name: 'content', type: 'textarea', description: "Texte de l'avis client.", placeholder: "Texte de l'avis..." },
            { name: 'service_type', type: 'text', maxLength: 100, description: "Type de service concerné par l'avis.", placeholder: "ex. Pavage d'allée" },
            { name: 'image_url', type: 'image', description: 'Photo du client (optionnel, sera affichée comme avatar).' },
            { name: 'published', type: 'boolean', default: true, description: 'Décochez pour masquer cet avis.' }
          ]
        },
        {
          key: 'appointments', label: 'Rendez-vous', icon: 'calendar',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 100, description: 'Nom du client.', placeholder: 'Nom du client' },
            { name: 'email', type: 'email', maxLength: 150, description: 'Courriel du client.', placeholder: 'courriel@exemple.ca' },
            { name: 'phone', type: 'text', maxLength: 30, description: 'Téléphone du client.', placeholder: '514-555-1234' },
            { name: 'service_type', type: 'text', maxLength: 100, description: 'Type de service demandé.', placeholder: "ex. Pavage d'allée" },
            { name: 'preferred_date', type: 'date', description: 'Date préférée par le client.' },
            { name: 'preferred_time', type: 'select', options: ['', 'morning', 'afternoon'], description: 'Plage horaire préférée.' },
            { name: 'address', type: 'text', maxLength: 300, description: 'Adresse du projet.', placeholder: 'ex. 1234 rue Principale, Montréal' },
            { name: 'notes', type: 'textarea', description: 'Notes additionnelles du client.', placeholder: 'Notes...' },
            { name: 'status', type: 'select', options: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending', description: 'Statut du rendez-vous.' }
          ]
        },
        {
          key: 'quote_requests', label: 'Soumissions', icon: 'edit',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 100, description: 'Nom du client.', placeholder: 'Nom du client' },
            { name: 'email', type: 'email', maxLength: 150, description: 'Courriel du client.', placeholder: 'courriel@exemple.ca' },
            { name: 'phone', type: 'text', maxLength: 30, description: 'Téléphone du client.', placeholder: '514-555-1234' },
            { name: 'service_type', type: 'text', maxLength: 100, description: 'Type de service demandé.', placeholder: "ex. Pavage d'allée" },
            { name: 'project_size', type: 'select', options: ['', 'small', 'medium', 'large', 'xlarge'], description: 'Taille approximative du projet.' },
            { name: 'address', type: 'text', maxLength: 300, description: 'Adresse du projet.', placeholder: 'Adresse complète' },
            { name: 'message', type: 'textarea', description: 'Message du client.', placeholder: 'Message...' },
            { name: 'status', type: 'select', options: ['new', 'contacted', 'quoted', 'won', 'lost'], default: 'new', description: 'Statut du suivi commercial.' }
          ]
        }
      ]
    });
  });

  function nullIfEmpty(val, field) {
    if (val === '' && (field.endsWith('_date') || field === 'price_from' || field === 'rating' || field === 'display_order' || field === 'user_id')) return null;
    return val;
  }

  // GET /api/admin/posts
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      var rows = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
      res.json({ posts: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      var allowed = ['title','excerpt','content','image_url','category','author','published'];
      var cols = [], vals = [], ph = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { cols.push(f); vals.push(nullIfEmpty(req.body[f], f)); ph.push('$' + i++); } }
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var ins = await db.run('INSERT INTO posts (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      var row = await db.get('SELECT * FROM posts WHERE id=$1', [ins.lastInsertRowid]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      var allowed = ['title','excerpt','content','image_url','category','author','published'];
      var sets = [], vals = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { sets.push(f + '=$' + i++); vals.push(nullIfEmpty(req.body[f], f)); } }
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE posts SET ' + sets.join(',') + ' WHERE id=$' + i, vals);
      var row = await db.get('SELECT * FROM posts WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/admin/services
  router.get('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      var rows = await db.all('SELECT * FROM services ORDER BY created_at DESC');
      res.json({ services: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      var allowed = ['name','description','icon','image_url','price_from','duration','featured','display_order','published'];
      var cols = [], vals = [], ph = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { cols.push(f); vals.push(nullIfEmpty(req.body[f], f)); ph.push('$' + i++); } }
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var ins = await db.run('INSERT INTO services (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      var row = await db.get('SELECT * FROM services WHERE id=$1', [ins.lastInsertRowid]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try {
      var allowed = ['name','description','icon','image_url','price_from','duration','featured','display_order','published'];
      var sets = [], vals = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { sets.push(f + '=$' + i++); vals.push(nullIfEmpty(req.body[f], f)); } }
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE services SET ' + sets.join(',') + ' WHERE id=$' + i, vals);
      var row = await db.get('SELECT * FROM services WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM services WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/admin/projects
  router.get('/api/admin/projects', requireAdmin, async function(req, res) {
    try {
      var rows = await db.all('SELECT * FROM projects ORDER BY created_at DESC');
      res.json({ projects: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/projects', requireAdmin, async function(req, res) {
    try {
      var allowed = ['title','description','image_url','location','category','completed_date','featured','published'];
      var cols = [], vals = [], ph = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { cols.push(f); vals.push(nullIfEmpty(req.body[f], f)); ph.push('$' + i++); } }
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var ins = await db.run('INSERT INTO projects (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      var row = await db.get('SELECT * FROM projects WHERE id=$1', [ins.lastInsertRowid]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/projects/:id', requireAdmin, async function(req, res) {
    try {
      var allowed = ['title','description','image_url','location','category','completed_date','featured','published'];
      var sets = [], vals = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { sets.push(f + '=$' + i++); vals.push(nullIfEmpty(req.body[f], f)); } }
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE projects SET ' + sets.join(',') + ' WHERE id=$' + i, vals);
      var row = await db.get('SELECT * FROM projects WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/projects/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM projects WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/admin/reviews
  router.get('/api/admin/reviews', requireAdmin, async function(req, res) {
    try {
      var rows = await db.all('SELECT * FROM reviews ORDER BY created_at DESC');
      res.json({ reviews: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/reviews', requireAdmin, async function(req, res) {
    try {
      var allowed = ['author','location','rating','content','service_type','image_url','published'];
      var cols = [], vals = [], ph = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { cols.push(f); vals.push(nullIfEmpty(req.body[f], f)); ph.push('$' + i++); } }
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var ins = await db.run('INSERT INTO reviews (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      var row = await db.get('SELECT * FROM reviews WHERE id=$1', [ins.lastInsertRowid]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/reviews/:id', requireAdmin, async function(req, res) {
    try {
      var allowed = ['author','location','rating','content','service_type','image_url','published'];
      var sets = [], vals = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { sets.push(f + '=$' + i++); vals.push(nullIfEmpty(req.body[f], f)); } }
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE reviews SET ' + sets.join(',') + ' WHERE id=$' + i, vals);
      var row = await db.get('SELECT * FROM reviews WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/reviews/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM reviews WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/admin/appointments
  router.get('/api/admin/appointments', requireAdmin, async function(req, res) {
    try {
      var rows = await db.all('SELECT * FROM appointments ORDER BY created_at DESC');
      res.json({ appointments: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/appointments', requireAdmin, async function(req, res) {
    try {
      var allowed = ['name','email','phone','service_type','preferred_date','preferred_time','address','notes','status'];
      var cols = [], vals = [], ph = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { cols.push(f); vals.push(nullIfEmpty(req.body[f], f)); ph.push('$' + i++); } }
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var ins = await db.run('INSERT INTO appointments (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      var row = await db.get('SELECT * FROM appointments WHERE id=$1', [ins.lastInsertRowid]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/appointments/:id', requireAdmin, async function(req, res) {
    try {
      var allowed = ['name','email','phone','service_type','preferred_date','preferred_time','address','notes','status'];
      var sets = [], vals = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { sets.push(f + '=$' + i++); vals.push(nullIfEmpty(req.body[f], f)); } }
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE appointments SET ' + sets.join(',') + ' WHERE id=$' + i, vals);
      var row = await db.get('SELECT * FROM appointments WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/appointments/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM appointments WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/admin/quote_requests
  router.get('/api/admin/quote_requests', requireAdmin, async function(req, res) {
    try {
      var rows = await db.all('SELECT * FROM quote_requests ORDER BY created_at DESC');
      res.json({ quote_requests: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/quote_requests', requireAdmin, async function(req, res) {
    try {
      var allowed = ['name','email','phone','service_type','project_size','address','message','status'];
      var cols = [], vals = [], ph = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { cols.push(f); vals.push(nullIfEmpty(req.body[f], f)); ph.push('$' + i++); } }
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var ins = await db.run('INSERT INTO quote_requests (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      var row = await db.get('SELECT * FROM quote_requests WHERE id=$1', [ins.lastInsertRowid]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/quote_requests/:id', requireAdmin, async function(req, res) {
    try {
      var allowed = ['name','email','phone','service_type','project_size','address','message','status'];
      var sets = [], vals = [], i = 1;
      for (var f of allowed) { if (req.body[f] !== undefined) { sets.push(f + '=$' + i++); vals.push(nullIfEmpty(req.body[f], f)); } }
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE quote_requests SET ' + sets.join(',') + ' WHERE id=$' + i, vals);
      var row = await db.get('SELECT * FROM quote_requests WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/quote_requests/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM quote_requests WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/api/admin/upload', requireAdmin, async function(req, res) {
    try {
      var dataUri = (req.body || {}).dataUri;
      if (!dataUri) return res.status(400).json({ error: 'No image' });
      if (!services.cloudinary || !services.cloudinary.uploader) return res.status(503).json({ error: 'Upload service unavailable' });
      var r = await services.cloudinary.uploader.upload(dataUri, { folder: 'mtl-pavage' });
      res.json({ url: r.secure_url });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      var rows = await db.all('SELECT key, value FROM admin_settings');
      var out = {};
      rows.forEach(function(r) { out[r.key] = r.value; });
      res.json({ settings: out });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      var body = req.body || {};
      var key = body.key, value = body.value;
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()', [key, value || '']);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.use(function(req, res) {
    res.redirect('.');
  });

  return router;
};
