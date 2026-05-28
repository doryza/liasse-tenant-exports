module.exports = function(services) {
  const express = require('express');
  const router = express.Router();

  const T = {
    fr: {
      site_name: 'X-Auto', tagline: 'Véhicules d\'occasion de qualité',
      nav_home: 'Accueil', nav_inventory: 'Inventaire', nav_financing: 'Financement', nav_appointment: 'Rendez-vous', nav_testimonials: 'Témoignages', nav_contact: 'Contact', nav_articles: 'Actualités', nav_login: 'Connexion',
      hero_title: 'Trouvez votre véhicule idéal', hero_subtitle: 'Sélection rigoureuse de véhicules d\'occasion certifiés. Financement disponible — 2e et 3e chance au crédit.',
      hero_cta_inventory: 'Voir l\'inventaire', hero_cta_appointment: 'Prendre rendez-vous',
      featured_title: 'Véhicules en vedette', featured_subtitle: 'Découvrez nos meilleures offres du moment',
      view_all: 'Voir tout l\'inventaire', view_details: 'Voir les détails', book_appointment: 'Prendre rendez-vous',
      inventory_title: 'Notre inventaire', inventory_subtitle: 'Parcourez notre sélection complète de véhicules',
      filter_make: 'Marque', filter_model: 'Modèle', filter_all: 'Toutes', filter_apply: 'Filtrer', filter_reset: 'Réinitialiser',
      no_results: 'Aucun véhicule ne correspond à vos critères pour le moment.',
      sold: 'Vendu', featured_badge: 'Vedette',
      year: 'Année', mileage: 'Kilométrage', transmission: 'Transmission', fuel_type: 'Carburant', body_type: 'Type de carrosserie', color: 'Couleur', vin: 'NIV', description: 'Description', price: 'Prix',
      financing_title: 'Financement', financing_subtitle: '2e et 3e chance au crédit',
      financing_desc: 'Peu importe votre historique de crédit, nous avons une solution adaptée à votre situation. Notre équipe travaille avec plusieurs prêteurs pour vous offrir les meilleures conditions possibles.',
      financing_feat1_title: '2e chance au crédit', financing_feat1_desc: 'Mauvais crédit? Nous pouvons vous aider à reconstruire votre cote en obtenant un véhicule fiable.',
      financing_feat2_title: '3e chance au crédit', financing_feat2_desc: 'Faillite, proposition de consommateur? Aucun problème — nous trouvons toujours une solution.',
      financing_feat3_title: 'Approbation rapide', financing_feat3_desc: 'Approbation préalable en moins de 24 heures avec un seul appel téléphonique.',
      financing_cta_title: 'Demande de financement', financing_cta: 'Pour toute demande de financement, contactez-nous directement par téléphone — c\'est plus rapide et plus personnalisé.',
      financing_call: 'Appelez-nous',
      appointment_title: 'Prendre rendez-vous', appointment_subtitle: 'Réservez une visite pour voir le véhicule qui vous intéresse',
      form_name: 'Nom complet', form_email: 'Courriel', form_phone: 'Téléphone', form_vehicle: 'Véhicule', form_date: 'Date souhaitée', form_message: 'Message',
      form_submit: 'Envoyer', form_submitting: 'Envoi en cours...',
      form_success_appointment: 'Merci! Nous vous contacterons sous peu pour confirmer votre rendez-vous.',
      form_success_contact: 'Merci! Votre message a été envoyé. Nous vous répondrons dès que possible.',
      form_error: 'Une erreur est survenue. Veuillez réessayer.',
      testimonials_title: 'Témoignages clients', testimonials_subtitle: 'Ce que nos clients disent de nous',
      no_testimonials: 'Aucun témoignage pour le moment.',
      contact_title: 'Contactez-nous', contact_subtitle: 'Une question? Nous sommes là pour vous aider',
      contact_info: 'Coordonnées', contact_hours: 'Heures d\'ouverture', contact_address: 'Adresse', contact_phone: 'Téléphone', contact_email: 'Courriel',
      footer_about: 'À propos', footer_links: 'Liens rapides', footer_contact: 'Nous joindre', footer_rights: 'Tous droits réservés.',
      enable_notifications: 'Activer les notifications',
      select_placeholder: 'Sélectionner',
      latest_news: 'Dernières actualités', latest_news_subtitle: 'Conseils, guides et nouvelles',
      no_posts: 'Aucun article publié pour le moment.', read_more: 'Lire la suite', back: 'Retour',
      no_vehicle_selected: 'Aucun véhicule sélectionné',
      why_us_title: 'Pourquoi choisir X-Auto?',
      why1_title: 'Véhicules inspectés', why1_desc: 'Chaque véhicule passe une inspection complète avant la mise en vente.',
      why2_title: 'Prix compétitifs', why2_desc: 'Nous offrons les meilleurs prix sur le marché québécois.',
      why3_title: 'Financement flexible', why3_desc: 'Solutions adaptées, incluant 2e et 3e chance au crédit.',
      why4_title: 'Service personnalisé', why4_desc: 'Une équipe à votre écoute, sans pression de vente.',
      about_title: 'À propos de X-Auto',
      contact_us_phone: 'Préférez parler à quelqu\'un? Appelez-nous!',
      cta_secondary: 'Vous avez des questions?'
    },
    en: {
      site_name: 'X-Auto', tagline: 'Quality used vehicles',
      nav_home: 'Home', nav_inventory: 'Inventory', nav_financing: 'Financing', nav_appointment: 'Appointment', nav_testimonials: 'Testimonials', nav_contact: 'Contact', nav_articles: 'News', nav_login: 'Sign In',
      hero_title: 'Find your perfect vehicle', hero_subtitle: 'Carefully selected certified used vehicles. Financing available — 2nd and 3rd chance credit.',
      hero_cta_inventory: 'View inventory', hero_cta_appointment: 'Book appointment',
      featured_title: 'Featured Vehicles', featured_subtitle: 'Discover our best deals',
      view_all: 'View full inventory', view_details: 'View details', book_appointment: 'Book appointment',
      inventory_title: 'Our Inventory', inventory_subtitle: 'Browse our full vehicle selection',
      filter_make: 'Make', filter_model: 'Model', filter_all: 'All', filter_apply: 'Filter', filter_reset: 'Reset',
      no_results: 'No vehicles match your criteria right now.',
      sold: 'Sold', featured_badge: 'Featured',
      year: 'Year', mileage: 'Mileage', transmission: 'Transmission', fuel_type: 'Fuel', body_type: 'Body type', color: 'Color', vin: 'VIN', description: 'Description', price: 'Price',
      financing_title: 'Financing', financing_subtitle: '2nd and 3rd chance credit',
      financing_desc: 'Whatever your credit history, we have a solution for you. Our team works with multiple lenders to offer you the best possible terms.',
      financing_feat1_title: '2nd chance credit', financing_feat1_desc: 'Bad credit? We can help you rebuild your score by getting you into a reliable vehicle.',
      financing_feat2_title: '3rd chance credit', financing_feat2_desc: 'Bankruptcy, consumer proposal? No problem — we always find a solution.',
      financing_feat3_title: 'Fast approval', financing_feat3_desc: 'Pre-approval in less than 24 hours with a single phone call.',
      financing_cta_title: 'Financing inquiry', financing_cta: 'For all financing inquiries, please contact us directly by phone — it\'s faster and more personalized.',
      financing_call: 'Call us',
      appointment_title: 'Book an appointment', appointment_subtitle: 'Schedule a visit to see the vehicle you\'re interested in',
      form_name: 'Full name', form_email: 'Email', form_phone: 'Phone', form_vehicle: 'Vehicle', form_date: 'Preferred date', form_message: 'Message',
      form_submit: 'Send', form_submitting: 'Sending...',
      form_success_appointment: 'Thank you! We will contact you shortly to confirm your appointment.',
      form_success_contact: 'Thank you! Your message has been sent. We will reply as soon as possible.',
      form_error: 'An error occurred. Please try again.',
      testimonials_title: 'Customer Testimonials', testimonials_subtitle: 'What our customers say about us',
      no_testimonials: 'No testimonials yet.',
      contact_title: 'Contact Us', contact_subtitle: 'Have a question? We\'re here to help',
      contact_info: 'Contact info', contact_hours: 'Hours', contact_address: 'Address', contact_phone: 'Phone', contact_email: 'Email',
      footer_about: 'About', footer_links: 'Quick links', footer_contact: 'Get in touch', footer_rights: 'All rights reserved.',
      enable_notifications: 'Enable notifications',
      select_placeholder: 'Select',
      latest_news: 'Latest news', latest_news_subtitle: 'Tips, guides and updates',
      no_posts: 'No posts published yet.', read_more: 'Read more', back: 'Back',
      no_vehicle_selected: 'No vehicle selected',
      why_us_title: 'Why choose X-Auto?',
      why1_title: 'Inspected vehicles', why1_desc: 'Every vehicle goes through a full inspection before being listed.',
      why2_title: 'Competitive prices', why2_desc: 'We offer the best prices on the Quebec market.',
      why3_title: 'Flexible financing', why3_desc: 'Tailored solutions, including 2nd and 3rd chance credit.',
      why4_title: 'Personal service', why4_desc: 'A team that listens, with no sales pressure.',
      about_title: 'About X-Auto',
      contact_us_phone: 'Prefer talking to someone? Call us!',
      cta_secondary: 'Have questions?'
    }
  };

  function formatPrice(v, lang) {
    if (v == null) return '';
    try { return new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v); }
    catch(e) { return '$' + v; }
  }
  function formatMileage(km, lang) {
    if (km == null) return '';
    try { return new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA').format(km) + ' km'; }
    catch(e) { return km + ' km'; }
  }
  function formatDate(d, lang) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch(e) { return String(d); }
  }
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  async function getSettings() {
    try {
      const rows = await services.db.all('SELECT key, value FROM admin_settings');
      const s = {};
      rows.forEach(function(r) { s[r.key] = r.value; });
      return s;
    } catch(e) { return {}; }
  }

  function applyTextOverrides(t, settings, lang) {
    const suffix = '_' + lang;
    for (const k in settings) {
      if (k.indexOf('text_') === 0 && k.endsWith(suffix)) {
        const tKey = k.slice(5, k.length - suffix.length);
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  async function baseLocals(req) {
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[req.lang] || T.fr), settings, req.lang);
    return {
      lang: req.lang, t, settings, user: req.user || null,
      formatPrice: function(v) { return formatPrice(v, req.lang); },
      formatMileage: function(km) { return formatMileage(km, req.lang); },
      formatDate: function(d) { return formatDate(d, req.lang); },
      escapeHtml: escapeHtml
    };
  }

  router.use(function(req, res, next) {
    var lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query.lang === 'fr' || req.query.lang === 'en') {
      res.cookie('pwa_lang', req.query.lang, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false });
    }
    req.lang = lang;
    next();
  });

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
      try { await services.db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    next();
  }
  function requireAdminApi(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  // ── Public routes ─────────────────────────────────────────────────────────

  router.get('/', async function(req, res) {
    try {
      const base = await baseLocals(req);
      var featured = await services.db.all('SELECT * FROM vehicles WHERE sold = 0 AND featured = 1 ORDER BY created_at DESC LIMIT 6');
      var vehicles = featured;
      if (vehicles.length < 3) {
        vehicles = await services.db.all('SELECT * FROM vehicles WHERE sold = 0 ORDER BY created_at DESC LIMIT 6');
      }
      var testimonials = await services.db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      var posts = await services.db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', Object.assign({}, base, { vehicles: vehicles, testimonials: testimonials, posts: posts }));
    } catch(e) { console.error('Home error:', e.message); res.status(500).send('Error'); }
  });

  router.get('/inventaire', async function(req, res) {
    try {
      const base = await baseLocals(req);
      var make = req.query.make, model = req.query.model, body = req.query.body;
      var sql = 'SELECT * FROM vehicles WHERE sold = 0';
      var params = [];
      if (make) { params.push(make); sql += ' AND make = $' + params.length; }
      if (model) { params.push(model); sql += ' AND model = $' + params.length; }
      if (body) { params.push(body); sql += ' AND body_type = $' + params.length; }
      sql += ' ORDER BY featured DESC, created_at DESC';
      var vehicles = await services.db.all(sql, params);
      var makesRows = await services.db.all('SELECT DISTINCT make FROM vehicles WHERE sold = 0 ORDER BY make');
      var modelsRows = make ? await services.db.all('SELECT DISTINCT model FROM vehicles WHERE sold = 0 AND make = $1 ORDER BY model', [make]) : [];
      var bodiesRows = await services.db.all("SELECT DISTINCT body_type FROM vehicles WHERE sold = 0 AND body_type IS NOT NULL AND body_type <> '' ORDER BY body_type");
      res.render('inventaire', Object.assign({}, base, {
        vehicles: vehicles,
        allMakes: makesRows.map(function(r) { return r.make; }),
        allModels: modelsRows.map(function(r) { return r.model; }),
        allBodies: bodiesRows.map(function(r) { return r.body_type; }),
        selectedMake: make || '', selectedModel: model || '', selectedBody: body || ''
      }));
    } catch(e) { console.error('Inventory error:', e.message); res.status(500).send('Error'); }
  });

  router.get('/vehicule/:id', async function(req, res) {
    try {
      const base = await baseLocals(req);
      var vehicle = await services.db.get('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);
      if (!vehicle) return res.redirect('inventaire');
      var similar = await services.db.all('SELECT * FROM vehicles WHERE sold = 0 AND id <> $1 AND (make = $2 OR body_type = $3) ORDER BY RANDOM() LIMIT 3', [vehicle.id, vehicle.make, vehicle.body_type || '']);
      res.render('vehicule', Object.assign({}, base, { vehicle: vehicle, similar: similar }));
    } catch(e) { console.error('Vehicle error:', e.message); res.status(500).send('Error'); }
  });

  router.get('/financement', async function(req, res) {
    const base = await baseLocals(req);
    res.render('financement', base);
  });

  router.get('/rendez-vous', async function(req, res) {
    try {
      const base = await baseLocals(req);
      var vehicleId = req.query.vehicle || '';
      var vehicles = await services.db.all('SELECT id, make, model, year FROM vehicles WHERE sold = 0 ORDER BY make, model');
      var selectedVehicle = null;
      if (vehicleId) {
        selectedVehicle = await services.db.get('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
      }
      res.render('rendez-vous', Object.assign({}, base, { vehicles: vehicles, selectedVehicle: selectedVehicle, vehicleId: vehicleId }));
    } catch(e) { console.error('Appointment page error:', e.message); res.status(500).send('Error'); }
  });

  router.post('/api/rendez-vous', async function(req, res) {
    try {
      var name = req.body.name, email = req.body.email, phone = req.body.phone;
      var vehicle_id = req.body.vehicle_id, preferred_date = req.body.preferred_date, message = req.body.message;
      if (!name || !phone) return res.status(400).json({ error: 'Missing required fields' });
      var result = await services.db.run(
        'INSERT INTO appointments (name, email, phone, vehicle_id, preferred_date, message, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [name, email || '', phone, vehicle_id ? parseInt(vehicle_id, 10) : null, preferred_date || '', message || '', 'pending']
      );
      try {
        if (services.config.contactEmail) {
          var vehicleInfo = '';
          if (vehicle_id) {
            var v = await services.db.get('SELECT make, model, year FROM vehicles WHERE id = $1', [vehicle_id]);
            if (v) vehicleInfo = '<p><strong>Véhicule d\'intérêt :</strong> ' + v.year + ' ' + v.make + ' ' + v.model + '</p>';
          }
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouveau rendez-vous - X-Auto',
            html: '<h2>Nouvelle demande de rendez-vous</h2><p><strong>Nom :</strong> ' + name + '</p><p><strong>Téléphone :</strong> ' + phone + '</p><p><strong>Courriel :</strong> ' + (email || '—') + '</p>' + vehicleInfo + '<p><strong>Date souhaitée :</strong> ' + (preferred_date || '—') + '</p><p><strong>Message :</strong><br>' + (message || '—') + '</p>'
          });
        }
      } catch(emailErr) { console.error('Email send failed:', emailErr.message); }
      res.json({ success: true, id: result.lastInsertRowid });
    } catch(e) {
      console.error('Appointment submit error:', e.message);
      res.status(500).json({ error: 'Submission failed' });
    }
  });

  router.get('/temoignages', async function(req, res) {
    try {
      const base = await baseLocals(req);
      var testimonials = await services.db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY created_at DESC');
      res.render('temoignages', Object.assign({}, base, { testimonials: testimonials }));
    } catch(e) { console.error('Testimonials error:', e.message); res.status(500).send('Error'); }
  });

  router.get('/contact', async function(req, res) {
    const base = await baseLocals(req);
    res.render('contact', base);
  });

  router.post('/api/contact', async function(req, res) {
    try {
      var name = req.body.name, email = req.body.email, phone = req.body.phone, message = req.body.message;
      if (!name || !message) return res.status(400).json({ error: 'Missing required fields' });
      await services.db.run(
        'INSERT INTO form_submissions (type, name, email, phone, message) VALUES ($1, $2, $3, $4, $5)',
        ['contact', name, email || '', phone || '', message]
      );
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouveau message de contact - X-Auto',
            html: '<h2>Nouveau message</h2><p><strong>Nom :</strong> ' + name + '</p><p><strong>Courriel :</strong> ' + (email || '—') + '</p><p><strong>Téléphone :</strong> ' + (phone || '—') + '</p><p><strong>Message :</strong><br>' + message + '</p>'
          });
        }
      } catch(emailErr) { console.error('Email failed:', emailErr.message); }
      res.json({ success: true });
    } catch(e) {
      console.error('Contact submit error:', e.message);
      res.status(500).json({ error: 'Submission failed' });
    }
  });

  router.get('/articles', async function(req, res) {
    try {
      const base = await baseLocals(req);
      var posts = await services.db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
      res.render('articles', Object.assign({}, base, { posts: posts }));
    } catch(e) { console.error('Articles error:', e.message); res.status(500).send('Error'); }
  });

  router.get('/article/:id', async function(req, res) {
    try {
      const base = await baseLocals(req);
      var post = await services.db.get('SELECT * FROM posts WHERE id = $1 AND published = 1', [req.params.id]);
      if (!post) return res.redirect('articles');
      res.render('article', Object.assign({}, base, { post: post }));
    } catch(e) { console.error('Article error:', e.message); res.status(500).send('Error'); }
  });

  // ── Admin page routes ─────────────────────────────────────────────────────

  router.get('/admin', requireAdmin, async function(req, res) {
    try {
      var stats = {};
      stats.vehicleCount = (await services.db.get('SELECT COUNT(*)::int AS c FROM vehicles')).c;
      stats.vehiclesForSale = (await services.db.get('SELECT COUNT(*)::int AS c FROM vehicles WHERE sold = 0')).c;
      stats.vehiclesSold = (await services.db.get('SELECT COUNT(*)::int AS c FROM vehicles WHERE sold = 1')).c;
      stats.featuredVehicles = (await services.db.get('SELECT COUNT(*)::int AS c FROM vehicles WHERE featured = 1 AND sold = 0')).c;
      stats.appointmentCount = (await services.db.get('SELECT COUNT(*)::int AS c FROM appointments')).c;
      stats.pendingAppointments = (await services.db.get("SELECT COUNT(*)::int AS c FROM appointments WHERE status = 'pending'")).c;
      stats.testimonialCount = (await services.db.get('SELECT COUNT(*)::int AS c FROM testimonials')).c;
      stats.postCount = (await services.db.get('SELECT COUNT(*)::int AS c FROM posts')).c;
      stats.submissionCount = (await services.db.get('SELECT COUNT(*)::int AS c FROM form_submissions')).c;
      stats.totalVisits = (await services.db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c;
      stats.recentVisits = (await services.db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'")).c;
      try { stats.userCount = await services.auth.getUserCount(); } catch(e) { stats.userCount = 0; }
      try { stats.pushCount = await services.push.getSubscriptionCount(); } catch(e) { stats.pushCount = 0; }
      var recentAppointments = await services.db.all('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5');
      var recentSubmissions = await services.db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5');
      res.render('admin', { stats: stats, recentAppointments: recentAppointments, recentSubmissions: recentSubmissions, adminUser: { name: services.config.ownerName || 'Admin' } });
    } catch(e) { console.error('Admin dashboard error:', e.message); res.status(500).send('Admin error'); }
  });

  router.get('/admin/vehicles', requireAdmin, function(req, res) {
    res.render('admin-vehicles', { moduleKey: 'vehicles', moduleLabel: 'Véhicules', adminUser: { name: services.config.ownerName || 'Admin' } });
  });
  router.get('/admin/appointments', requireAdmin, function(req, res) {
    res.render('admin-appointments', { moduleKey: 'appointments', moduleLabel: 'Rendez-vous', adminUser: { name: services.config.ownerName || 'Admin' } });
  });
  router.get('/admin/testimonials', requireAdmin, function(req, res) {
    res.render('admin-testimonials', { moduleKey: 'testimonials', moduleLabel: 'Témoignages', adminUser: { name: services.config.ownerName || 'Admin' } });
  });
  router.get('/admin/posts', requireAdmin, function(req, res) {
    res.render('admin-posts', { moduleKey: 'posts', moduleLabel: 'Articles', adminUser: { name: services.config.ownerName || 'Admin' } });
  });
  router.get('/admin/form_submissions', requireAdmin, function(req, res) {
    res.render('admin-submissions', { moduleKey: 'form_submissions', moduleLabel: 'Messages', adminUser: { name: services.config.ownerName || 'Admin' } });
  });
  router.get('/admin/submissions', requireAdmin, async function(req, res) {
    var items = await services.db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
    res.render('admin-submissions', { moduleKey: 'form_submissions', moduleLabel: 'Messages', adminUser: { name: services.config.ownerName || 'Admin' }, items: items });
  });

  // ── Admin API: modules manifest ───────────────────────────────────────────

  router.get('/api/admin/modules', requireAdminApi, function(req, res) {
    res.json({ modules: [
      { key: 'vehicles', label: 'Véhicules', icon: 'car', fields: [
        { name: 'make', label: 'Marque', type: 'text', required: true, placeholder: 'ex: Honda', maxLength: 50 },
        { name: 'model', label: 'Modèle', type: 'text', required: true, placeholder: 'ex: Civic', maxLength: 100 },
        { name: 'year', label: 'Année', type: 'number', required: true, placeholder: 'ex: 2020', min: 1980, max: 2030 },
        { name: 'price', label: 'Prix (CAD)', type: 'number', required: true, placeholder: 'ex: 18995', min: 0, step: 1 },
        { name: 'mileage', label: 'Kilométrage', type: 'number', placeholder: 'ex: 85000', min: 0 },
        { name: 'transmission', label: 'Transmission', type: 'select', options: ['Automatique', 'Manuelle', 'CVT'] },
        { name: 'fuel_type', label: 'Carburant', type: 'select', options: ['Essence', 'Diesel', 'Hybride', 'Électrique'] },
        { name: 'body_type', label: 'Type de carrosserie', type: 'select', options: ['Berline', 'VUS', 'Camionnette', 'Coupé', 'Hayon', 'Familiale', 'Cabriolet'] },
        { name: 'color', label: 'Couleur', type: 'text', placeholder: 'ex: Noir', maxLength: 30 },
        { name: 'vin', label: 'NIV', type: 'text', placeholder: 'ex: 1HGCM82633A123456', maxLength: 17 },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Décrivez les options, l\'historique, l\'état général...' },
        { name: 'image_url', label: 'Photo principale', type: 'image' },
        { name: 'featured', label: 'En vedette', type: 'boolean', default: false },
        { name: 'sold', label: 'Vendu', type: 'boolean', default: false }
      ]},
      { key: 'appointments', label: 'Rendez-vous', icon: 'calendar', fields: [
        { name: 'name', label: 'Nom du client', type: 'text', required: true, placeholder: 'ex: Jean Dupont' },
        { name: 'email', label: 'Courriel', type: 'text', placeholder: 'nom@exemple.com' },
        { name: 'phone', label: 'Téléphone', type: 'text', required: true, placeholder: '(514) 555-1234' },
        { name: 'vehicle_id', label: 'ID du véhicule', type: 'number', placeholder: 'ex: 12' },
        { name: 'preferred_date', label: 'Date souhaitée', type: 'text', placeholder: 'ex: 2024-12-15 14:00' },
        { name: 'message', label: 'Message', type: 'textarea' },
        { name: 'status', label: 'Statut', type: 'select', options: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' }
      ]},
      { key: 'testimonials', label: 'Témoignages', icon: 'star', fields: [
        { name: 'author', label: 'Auteur', type: 'text', required: true, placeholder: 'ex: Marie L.' },
        { name: 'rating', label: 'Note (1-5)', type: 'number', placeholder: '5', min: 1, max: 5, default: 5 },
        { name: 'content', label: 'Témoignage', type: 'textarea', required: true, placeholder: 'Service exceptionnel...' },
        { name: 'image_url', label: 'Photo du client', type: 'image' },
        { name: 'vehicle_purchased', label: 'Véhicule acheté', type: 'text', placeholder: 'ex: Honda Civic 2019' },
        { name: 'published', label: 'Publié', type: 'boolean', default: true }
      ]},
      { key: 'posts', label: 'Articles', icon: 'edit', fields: [
        { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'ex: Préparer votre véhicule pour l\'hiver', maxLength: 200 },
        { name: 'content', label: 'Contenu', type: 'textarea', placeholder: 'Rédigez le contenu...' },
        { name: 'image_url', label: 'Image en vedette', type: 'image' },
        { name: 'category', label: 'Catégorie', type: 'text', placeholder: 'ex: Conseils', maxLength: 50 },
        { name: 'published', label: 'Publié', type: 'boolean', default: true }
      ]},
      { key: 'form_submissions', label: 'Messages', icon: 'mail', readOnly: true, fields: [
        { name: 'type', label: 'Type', type: 'text' },
        { name: 'name', label: 'Nom', type: 'text' },
        { name: 'email', label: 'Courriel', type: 'text' },
        { name: 'phone', label: 'Téléphone', type: 'text' },
        { name: 'message', label: 'Message', type: 'textarea' }
      ]}
    ]});
  });

  // ── Admin API: stats ──────────────────────────────────────────────────────

  router.get('/api/admin/stats', requireAdminApi, async function(req, res) {
    try {
      var userCount = await services.auth.getUserCount();
      var pushCount = await services.push.getSubscriptionCount();
      var totalVisits = (await services.db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c;
      var recentVisits = (await services.db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'")).c;
      res.json({ userCount: userCount, pushSubscriberCount: pushCount, totalVisits: totalVisits, recentVisits: recentVisits });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Admin API: CRUD — vehicles ────────────────────────────────────────────

  router.get('/api/admin/vehicles', requireAdminApi, async function(req, res) {
    try {
      var rows = await services.db.all('SELECT * FROM vehicles ORDER BY created_at DESC');
      res.json({ vehicles: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/vehicles', requireAdminApi, async function(req, res) {
    try {
      var allowed = ['make','model','year','price','mileage','transmission','fuel_type','body_type','color','vin','description','image_url','featured','sold'];
      var cols = [], ph = [], params = [];
      allowed.forEach(function(f) {
        if (req.body[f] !== undefined) { cols.push(f); params.push(req.body[f]); ph.push('$' + params.length); }
      });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var result = await services.db.run('INSERT INTO vehicles (' + cols.join(', ') + ') VALUES (' + ph.join(', ') + ') RETURNING id', params);
      var row = await services.db.get('SELECT * FROM vehicles WHERE id = $1', [result.lastInsertRowid]);
      res.json({ vehicle: row, item: row });
    } catch(e) { console.error('CRUD POST error:', e.message); res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/vehicles/:id', requireAdminApi, async function(req, res) {
    try {
      var allowed = ['make','model','year','price','mileage','transmission','fuel_type','body_type','color','vin','description','image_url','featured','sold'];
      var sets = [], params = [];
      allowed.forEach(function(f) {
        if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(f + ' = $' + params.length); }
      });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at = NOW()');
      params.push(req.params.id);
      await services.db.run('UPDATE vehicles SET ' + sets.join(', ') + ' WHERE id = $' + params.length, params);
      var row = await services.db.get('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);
      res.json({ vehicle: row, item: row });
    } catch(e) { console.error('CRUD PUT error:', e.message); res.status(500).json({ error: e.message }); }
  });

  router.delete('/api/admin/vehicles/:id', requireAdminApi, async function(req, res) {
    try {
      await services.db.run('DELETE FROM vehicles WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Admin API: CRUD — appointments ────────────────────────────────────────

  router.get('/api/admin/appointments', requireAdminApi, async function(req, res) {
    try {
      var rows = await services.db.all('SELECT * FROM appointments ORDER BY created_at DESC');
      res.json({ appointments: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/appointments', requireAdminApi, async function(req, res) {
    try {
      var allowed = ['name','email','phone','vehicle_id','preferred_date','message','status','image_url'];
      var cols = [], ph = [], params = [];
      allowed.forEach(function(f) {
        if (req.body[f] !== undefined) { cols.push(f); params.push(req.body[f]); ph.push('$' + params.length); }
      });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var result = await services.db.run('INSERT INTO appointments (' + cols.join(', ') + ') VALUES (' + ph.join(', ') + ') RETURNING id', params);
      var row = await services.db.get('SELECT * FROM appointments WHERE id = $1', [result.lastInsertRowid]);
      res.json({ appointment: row, item: row });
    } catch(e) { console.error('CRUD POST error:', e.message); res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/appointments/:id', requireAdminApi, async function(req, res) {
    try {
      var allowed = ['name','email','phone','vehicle_id','preferred_date','message','status','image_url'];
      var sets = [], params = [];
      allowed.forEach(function(f) {
        if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(f + ' = $' + params.length); }
      });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at = NOW()');
      params.push(req.params.id);
      await services.db.run('UPDATE appointments SET ' + sets.join(', ') + ' WHERE id = $' + params.length, params);
      var row = await services.db.get('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
      res.json({ appointment: row, item: row });
    } catch(e) { console.error('CRUD PUT error:', e.message); res.status(500).json({ error: e.message }); }
  });

  router.delete('/api/admin/appointments/:id', requireAdminApi, async function(req, res) {
    try {
      await services.db.run('DELETE FROM appointments WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Admin API: CRUD — testimonials ────────────────────────────────────────

  router.get('/api/admin/testimonials', requireAdminApi, async function(req, res) {
    try {
      var rows = await services.db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
      res.json({ testimonials: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/testimonials', requireAdminApi, async function(req, res) {
    try {
      var allowed = ['author','rating','content','image_url','vehicle_purchased','published'];
      var cols = [], ph = [], params = [];
      allowed.forEach(function(f) {
        if (req.body[f] !== undefined) { cols.push(f); params.push(req.body[f]); ph.push('$' + params.length); }
      });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var result = await services.db.run('INSERT INTO testimonials (' + cols.join(', ') + ') VALUES (' + ph.join(', ') + ') RETURNING id', params);
      var row = await services.db.get('SELECT * FROM testimonials WHERE id = $1', [result.lastInsertRowid]);
      res.json({ testimonial: row, item: row });
    } catch(e) { console.error('CRUD POST error:', e.message); res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/testimonials/:id', requireAdminApi, async function(req, res) {
    try {
      var allowed = ['author','rating','content','image_url','vehicle_purchased','published'];
      var sets = [], params = [];
      allowed.forEach(function(f) {
        if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(f + ' = $' + params.length); }
      });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at = NOW()');
      params.push(req.params.id);
      await services.db.run('UPDATE testimonials SET ' + sets.join(', ') + ' WHERE id = $' + params.length, params);
      var row = await services.db.get('SELECT * FROM testimonials WHERE id = $1', [req.params.id]);
      res.json({ testimonial: row, item: row });
    } catch(e) { console.error('CRUD PUT error:', e.message); res.status(500).json({ error: e.message }); }
  });

  router.delete('/api/admin/testimonials/:id', requireAdminApi, async function(req, res) {
    try {
      await services.db.run('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Admin API: CRUD — posts ───────────────────────────────────────────────

  router.get('/api/admin/posts', requireAdminApi, async function(req, res) {
    try {
      var rows = await services.db.all('SELECT * FROM posts ORDER BY created_at DESC');
      res.json({ posts: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/posts', requireAdminApi, async function(req, res) {
    try {
      var allowed = ['title','content','image_url','category','published'];
      var cols = [], ph = [], params = [];
      allowed.forEach(function(f) {
        if (req.body[f] !== undefined) { cols.push(f); params.push(req.body[f]); ph.push('$' + params.length); }
      });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var result = await services.db.run('INSERT INTO posts (' + cols.join(', ') + ') VALUES (' + ph.join(', ') + ') RETURNING id', params);
      var row = await services.db.get('SELECT * FROM posts WHERE id = $1', [result.lastInsertRowid]);
      res.json({ post: row, item: row });
    } catch(e) { console.error('CRUD POST error:', e.message); res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    try {
      var allowed = ['title','content','image_url','category','published'];
      var sets = [], params = [];
      allowed.forEach(function(f) {
        if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(f + ' = $' + params.length); }
      });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at = NOW()');
      params.push(req.params.id);
      await services.db.run('UPDATE posts SET ' + sets.join(', ') + ' WHERE id = $' + params.length, params);
      var row = await services.db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      res.json({ post: row, item: row });
    } catch(e) { console.error('CRUD PUT error:', e.message); res.status(500).json({ error: e.message }); }
  });

  router.delete('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    try {
      await services.db.run('DELETE FROM posts WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Admin API: form_submissions (read + delete only) ──────────────────────

  router.get('/api/admin/form_submissions', requireAdminApi, async function(req, res) {
    try {
      var rows = await services.db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
      res.json({ form_submissions: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/api/admin/form_submissions/:id', requireAdminApi, async function(req, res) {
    try {
      await services.db.run('DELETE FROM form_submissions WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Admin API: settings ───────────────────────────────────────────────────

  router.get('/api/admin/settings', requireAdminApi, async function(req, res) {
    try {
      var rows = await services.db.all('SELECT key, value FROM admin_settings');
      var settings = {};
      rows.forEach(function(r) { settings[r.key] = r.value; });
      res.json({ settings: settings });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/settings', requireAdminApi, async function(req, res) {
    try {
      var key = req.body.key, value = req.body.value;
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await services.db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value || '']);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/submissions', requireAdminApi, async function(req, res) {
    try {
      var rows = await services.db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 100');
      res.json({ submissions: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Catch-all ─────────────────────────────────────────────────────────────

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
