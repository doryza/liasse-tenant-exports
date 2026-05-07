module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const T = {
    fr: {
      site_name: 'Pavage Depot',
      nav_home: 'Accueil',
      nav_services: 'Services',
      nav_gallery: 'Réalisations',
      nav_about: 'À propos',
      nav_quote: 'Soumission',
      nav_booking: 'Consultation',
      nav_contact: 'Contact',
      nav_login: 'Connexion',
      nav_logout: 'Déconnexion',
      nav_admin: 'Admin',
      btn_quote: 'Demander une soumission',
      btn_book: 'Réserver une consultation',
      btn_view_all: 'Voir tout',
      btn_learn_more: 'En savoir plus',
      btn_submit: 'Envoyer',
      btn_send: 'Envoyer le message',
      btn_book_now: 'Réserver maintenant',
      btn_send_quote: 'Envoyer la demande',
      btn_call: 'Appelez-nous',
      btn_email: 'Courriel',
      home_services_title: 'Nos services',
      home_services_subtitle: 'Solutions complètes de pavage résidentiel',
      home_gallery_title: 'Nos réalisations',
      home_gallery_subtitle: 'Découvrez nos projets récents partout au Québec',
      home_testimonials_title: 'Ce que disent nos clients',
      home_cta_title: 'Prêt à transformer votre entrée?',
      home_cta_subtitle: 'Soumission gratuite et sans engagement',
      services_title: 'Nos services de pavage',
      services_subtitle: 'Du pavage neuf au scellement, nous prenons soin de votre entrée du début à la fin.',
      gallery_title: 'Galerie de réalisations',
      gallery_subtitle: 'Plus de 2000 entrées pavées partout au Québec',
      gallery_empty: 'Galerie en cours d\'enrichissement. Revenez bientôt!',
      services_empty: 'Services à venir.',
      posts_empty: 'Articles à venir.',
      testimonials_empty: '',
      quote_title: 'Demande de soumission',
      quote_subtitle: 'Remplissez le formulaire et nous vous contacterons sous 24 heures avec une soumission détaillée.',
      quote_name: 'Nom complet',
      quote_email: 'Courriel',
      quote_phone: 'Téléphone',
      quote_address: 'Adresse du projet',
      quote_project_type: 'Type de projet',
      quote_surface: 'Surface approximative (pi²)',
      quote_timeline: 'Échéancier souhaité',
      quote_message: 'Détails additionnels',
      quote_select: 'Sélectionnez',
      quote_type_new: 'Pavage neuf',
      quote_type_repair: 'Réparation / Resurfaçage',
      quote_type_seal: 'Scellement',
      quote_type_other: 'Autre',
      quote_time_asap: 'Dès que possible',
      quote_time_1m: 'Dans le mois',
      quote_time_3m: 'Dans les 3 mois',
      quote_time_flexible: 'Flexible',
      quote_success: 'Demande reçue! Nous vous contacterons sous 24 heures.',
      quote_error: 'Une erreur est survenue. Veuillez réessayer.',
      booking_title: 'Réserver une consultation',
      booking_subtitle: 'Un expert se déplace gratuitement chez vous pour évaluer votre projet.',
      booking_date: 'Date préférée',
      booking_time: 'Plage horaire',
      booking_time_morning: 'Matin (8h-12h)',
      booking_time_afternoon: 'Après-midi (12h-17h)',
      booking_time_evening: 'Fin de journée (17h-19h)',
      booking_notes: 'Notes (optionnel)',
      booking_success: 'Consultation réservée! Nous confirmerons par téléphone ou courriel.',
      booking_error: 'Une erreur est survenue. Veuillez réessayer.',
      about_title: 'À propos de Pavage Depot',
      about_features_title: 'Pourquoi nous choisir',
      feat_1_t: 'Plus de 20 ans d\'expérience',
      feat_1_d: 'Une expertise reconnue dans le pavage résidentiel québécois.',
      feat_2_t: 'Garantie 5 ans',
      feat_2_d: 'Tous nos travaux de pavage neuf sont garantis 5 ans.',
      feat_3_t: 'Soumission gratuite',
      feat_3_d: 'Évaluation sur place sans frais ni engagement.',
      feat_4_t: 'Asphalte de qualité',
      feat_4_d: 'Conçu pour résister aux hivers rigoureux du Québec.',
      contact_title: 'Contactez-nous',
      contact_subtitle: 'Une question? Un projet? Nous sommes là pour vous aider.',
      contact_name: 'Nom',
      contact_email: 'Courriel',
      contact_phone: 'Téléphone',
      contact_message: 'Message',
      contact_success: 'Message envoyé! Nous vous répondrons sous peu.',
      contact_error: 'Une erreur est survenue. Veuillez réessayer.',
      contact_info: 'Coordonnées',
      contact_hours: 'Heures d\'ouverture',
      contact_hours_mf: 'Lun-Ven: 7h - 18h',
      contact_hours_sat: 'Sam: 8h - 16h',
      contact_hours_sun: 'Dim: Fermé',
      service_area: 'Zone desservie',
      footer_quick: 'Liens rapides',
      footer_contact: 'Contact',
      meta_desc: 'Pavage résidentiel de qualité au Québec. Soumission gratuite, garantie 5 ans.',
      required: 'Requis',
      starting_at: 'À partir de',
      our_work: 'Nos réalisations',
      published_on: 'Publié le',
      read_more: 'Lire la suite',
      back: 'Retour',
      not_found_title: 'Page introuvable',
      not_found_msg: 'Cette page n\'existe pas ou a été déplacée.',
      back_home: 'Retour à l\'accueil',
      blog_title: 'Conseils et actualités',
      blog_subtitle: 'Tout sur le pavage et l\'entretien de votre entrée'
    },
    en: {
      site_name: 'Pavage Depot',
      nav_home: 'Home',
      nav_services: 'Services',
      nav_gallery: 'Our Work',
      nav_about: 'About',
      nav_quote: 'Quote',
      nav_booking: 'Consultation',
      nav_contact: 'Contact',
      nav_login: 'Sign In',
      nav_logout: 'Sign Out',
      nav_admin: 'Admin',
      btn_quote: 'Request a quote',
      btn_book: 'Book a consultation',
      btn_view_all: 'View all',
      btn_learn_more: 'Learn more',
      btn_submit: 'Submit',
      btn_send: 'Send message',
      btn_book_now: 'Book now',
      btn_send_quote: 'Send request',
      btn_call: 'Call us',
      btn_email: 'Email',
      home_services_title: 'Our services',
      home_services_subtitle: 'Complete residential paving solutions',
      home_gallery_title: 'Our work',
      home_gallery_subtitle: 'Discover our recent projects across Quebec',
      home_testimonials_title: 'What our clients say',
      home_cta_title: 'Ready to transform your driveway?',
      home_cta_subtitle: 'Free, no-obligation quote',
      services_title: 'Our paving services',
      services_subtitle: 'From new paving to sealcoating, we take care of your driveway from start to finish.',
      gallery_title: 'Project gallery',
      gallery_subtitle: 'Over 2000 driveways paved across Quebec',
      gallery_empty: 'Gallery being expanded. Check back soon!',
      services_empty: 'Services coming soon.',
      posts_empty: 'Articles coming soon.',
      testimonials_empty: '',
      quote_title: 'Quote request',
      quote_subtitle: 'Fill out the form and we\'ll contact you within 24 hours with a detailed quote.',
      quote_name: 'Full name',
      quote_email: 'Email',
      quote_phone: 'Phone',
      quote_address: 'Project address',
      quote_project_type: 'Project type',
      quote_surface: 'Approximate surface (sq ft)',
      quote_timeline: 'Desired timeline',
      quote_message: 'Additional details',
      quote_select: 'Select',
      quote_type_new: 'New paving',
      quote_type_repair: 'Repair / Resurfacing',
      quote_type_seal: 'Sealcoating',
      quote_type_other: 'Other',
      quote_time_asap: 'As soon as possible',
      quote_time_1m: 'Within a month',
      quote_time_3m: 'Within 3 months',
      quote_time_flexible: 'Flexible',
      quote_success: 'Request received! We\'ll contact you within 24 hours.',
      quote_error: 'An error occurred. Please try again.',
      booking_title: 'Book a consultation',
      booking_subtitle: 'An expert visits your home for free to assess your project.',
      booking_date: 'Preferred date',
      booking_time: 'Time slot',
      booking_time_morning: 'Morning (8am-12pm)',
      booking_time_afternoon: 'Afternoon (12pm-5pm)',
      booking_time_evening: 'Evening (5pm-7pm)',
      booking_notes: 'Notes (optional)',
      booking_success: 'Consultation booked! We\'ll confirm by phone or email.',
      booking_error: 'An error occurred. Please try again.',
      about_title: 'About Pavage Depot',
      about_features_title: 'Why choose us',
      feat_1_t: 'Over 20 years of experience',
      feat_1_d: 'Recognized expertise in Quebec residential paving.',
      feat_2_t: '5-year warranty',
      feat_2_d: 'All our new paving work comes with a 5-year warranty.',
      feat_3_t: 'Free quote',
      feat_3_d: 'On-site assessment at no cost or obligation.',
      feat_4_t: 'Quality asphalt',
      feat_4_d: 'Designed to withstand harsh Quebec winters.',
      contact_title: 'Contact us',
      contact_subtitle: 'A question? A project? We\'re here to help.',
      contact_name: 'Name',
      contact_email: 'Email',
      contact_phone: 'Phone',
      contact_message: 'Message',
      contact_success: 'Message sent! We\'ll get back to you shortly.',
      contact_error: 'An error occurred. Please try again.',
      contact_info: 'Contact info',
      contact_hours: 'Business hours',
      contact_hours_mf: 'Mon-Fri: 7am - 6pm',
      contact_hours_sat: 'Sat: 8am - 4pm',
      contact_hours_sun: 'Sun: Closed',
      service_area: 'Service area',
      footer_quick: 'Quick links',
      footer_contact: 'Contact',
      meta_desc: 'Quality residential paving in Quebec. Free quote, 5-year warranty.',
      required: 'Required',
      starting_at: 'Starting at',
      our_work: 'Our work',
      published_on: 'Published on',
      read_more: 'Read more',
      back: 'Back',
      not_found_title: 'Page not found',
      not_found_msg: 'This page doesn\'t exist or has been moved.',
      back_home: 'Back to home',
      blog_title: 'Tips and news',
      blog_subtitle: 'Everything about paving and driveway maintenance'
    }
  };

  function formatDate(d, lang) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch(e) { return ''; }
  }
  function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  async function getSettings() {
    const rows = await db.all('SELECT key, value FROM admin_settings');
    const out = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
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

  router.use(function(req, res, next) {
    let lang = req.query.lang || req.cookies && req.cookies.pwa_lang || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query.lang && (req.query.lang === 'fr' || req.query.lang === 'en')) {
      res.cookie('pwa_lang', req.query.lang, { maxAge: 365*24*60*60*1000, httpOnly: false, sameSite: 'lax' });
    }
    req.lang = lang;
    next();
  });

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  async function buildLocals(req) {
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[req.lang] || T.fr), settings, req.lang);
    return { t, lang: req.lang, settings, formatDate, escapeHtml };
  }

  router.get('/', async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const services = await db.all('SELECT * FROM services WHERE featured = 1 ORDER BY sort_order LIMIT 6');
      const gallery = await db.all('SELECT * FROM gallery ORDER BY sort_order LIMIT 6');
      const testimonials = await db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY id DESC LIMIT 3');
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', Object.assign(locals, { services, gallery, testimonials, posts, page: 'home' }));
    } catch (err) { console.error('Home error:', err); res.status(500).send('Error loading page'); }
  });

  router.get('/services', async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const services = await db.all('SELECT * FROM services ORDER BY sort_order, id');
      res.render('services', Object.assign(locals, { services, page: 'services' }));
    } catch (err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/gallery', async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const gallery = await db.all('SELECT * FROM gallery ORDER BY sort_order, id DESC');
      res.render('gallery', Object.assign(locals, { gallery, page: 'gallery' }));
    } catch (err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/about', async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const testimonials = await db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY id DESC');
      res.render('about', Object.assign(locals, { testimonials, page: 'about' }));
    } catch (err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/quote', async function(req, res) {
    try { const locals = await buildLocals(req); res.render('quote', Object.assign(locals, { page: 'quote' })); }
    catch (err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/booking', async function(req, res) {
    try { const locals = await buildLocals(req); res.render('booking', Object.assign(locals, { page: 'booking' })); }
    catch (err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/contact', async function(req, res) {
    try { const locals = await buildLocals(req); res.render('contact', Object.assign(locals, { page: 'contact' })); }
    catch (err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/blog', async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
      res.render('blog', Object.assign(locals, { posts, page: 'blog' }));
    } catch (err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/blog/:id', async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const post = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      if (!post) return res.redirect('blog');
      res.render('post', Object.assign(locals, { post, page: 'blog' }));
    } catch (err) { console.error(err); res.status(500).send('Error'); }
  });

  router.post('/api/quote', async function(req, res) {
    try {
      const { name, email, phone, address, project_type, surface_size, timeline, message } = req.body;
      if (!name || (!email && !phone)) return res.status(400).json({ error: 'Missing required fields' });
      await db.run(
        'INSERT INTO quote_requests (name, email, phone, address, project_type, surface_size, timeline, message) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [name, email||'', phone||'', address||'', project_type||'', surface_size||'', timeline||'', message||'']
      );
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouvelle demande de soumission</h2>' +
            '<p><strong>Nom:</strong> ' + escapeHtml(name) + '</p>' +
            '<p><strong>Courriel:</strong> ' + escapeHtml(email||'') + '</p>' +
            '<p><strong>Téléphone:</strong> ' + escapeHtml(phone||'') + '</p>' +
            '<p><strong>Adresse:</strong> ' + escapeHtml(address||'') + '</p>' +
            '<p><strong>Type:</strong> ' + escapeHtml(project_type||'') + '</p>' +
            '<p><strong>Surface:</strong> ' + escapeHtml(surface_size||'') + ' pi²</p>' +
            '<p><strong>Échéancier:</strong> ' + escapeHtml(timeline||'') + '</p>' +
            '<p><strong>Message:</strong></p><p>' + escapeHtml(message||'') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle soumission - ' + name, html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (e) { console.error('Email failed:', e.message); }
      res.json({ success: true });
    } catch (err) { console.error('Quote error:', err); res.status(500).json({ error: 'Submission failed' }); }
  });

  router.post('/api/booking', async function(req, res) {
    try {
      const { name, email, phone, address, preferred_date, preferred_time, project_type, notes } = req.body;
      if (!name || (!email && !phone) || !preferred_date) return res.status(400).json({ error: 'Missing required fields' });
      await db.run(
        'INSERT INTO bookings (name, email, phone, address, preferred_date, preferred_time, project_type, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [name, email||'', phone||'', address||'', preferred_date, preferred_time||'', project_type||'', notes||'']
      );
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouvelle réservation de consultation</h2>' +
            '<p><strong>Nom:</strong> ' + escapeHtml(name) + '</p>' +
            '<p><strong>Courriel:</strong> ' + escapeHtml(email||'') + '</p>' +
            '<p><strong>Téléphone:</strong> ' + escapeHtml(phone||'') + '</p>' +
            '<p><strong>Adresse:</strong> ' + escapeHtml(address||'') + '</p>' +
            '<p><strong>Date:</strong> ' + escapeHtml(preferred_date) + '</p>' +
            '<p><strong>Plage:</strong> ' + escapeHtml(preferred_time||'') + '</p>' +
            '<p><strong>Type:</strong> ' + escapeHtml(project_type||'') + '</p>' +
            '<p><strong>Notes:</strong> ' + escapeHtml(notes||'') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle consultation - ' + name, html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (e) { console.error('Email failed:', e.message); }
      res.json({ success: true });
    } catch (err) { console.error('Booking error:', err); res.status(500).json({ error: 'Submission failed' }); }
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const { name, email, phone, message } = req.body;
      if (!name || !message) return res.status(400).json({ error: 'Missing required fields' });
      await db.run('INSERT INTO contact_messages (name, email, phone, message) VALUES ($1,$2,$3,$4)', [name, email||'', phone||'', message]);
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouveau message de contact</h2>' +
            '<p><strong>Nom:</strong> ' + escapeHtml(name) + '</p>' +
            '<p><strong>Courriel:</strong> ' + escapeHtml(email||'') + '</p>' +
            '<p><strong>Téléphone:</strong> ' + escapeHtml(phone||'') + '</p>' +
            '<p><strong>Message:</strong></p><p>' + escapeHtml(message) + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau contact - ' + name, html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (e) { console.error('Email failed:', e.message); }
      res.json({ success: true });
    } catch (err) { console.error('Contact error:', err); res.status(500).json({ error: 'Submission failed' }); }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) {
      if (req.path.startsWith('/api/')) return res.status(403).json({ error: 'Forbidden' });
      return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    }
    next();
  }

  router.get('/admin', requireAdmin, async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*) AS c FROM site_visits')).c;
      const recentVisits = (await db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c;
      const quoteCount = (await db.get('SELECT COUNT(*) AS c FROM quote_requests')).c;
      const bookingCount = (await db.get('SELECT COUNT(*) AS c FROM bookings')).c;
      const newQuotes = (await db.get("SELECT COUNT(*) AS c FROM quote_requests WHERE status = 'new'")).c;
      const pendingBookings = (await db.get("SELECT COUNT(*) AS c FROM bookings WHERE status = 'pending'")).c;
      const newMessages = (await db.get("SELECT COUNT(*) AS c FROM contact_messages WHERE status = 'new'")).c;
      const galleryCount = (await db.get('SELECT COUNT(*) AS c FROM gallery')).c;
      const servicesCount = (await db.get('SELECT COUNT(*) AS c FROM services')).c;
      const recentQuotes = await db.all('SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 5');
      const recentBookings = await db.all('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5');
      const stats = { userCount, pushCount, totalVisits, recentVisits, quoteCount, bookingCount, newQuotes, pendingBookings, newMessages, galleryCount, servicesCount };
      res.render('admin', Object.assign(locals, { stats, recentQuotes, recentBookings, adminPage: 'dashboard' }));
    } catch (err) { console.error('Admin error:', err); res.status(500).send('Admin error'); }
  });

  router.get('/admin/services', requireAdmin, async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const items = await db.all('SELECT * FROM services ORDER BY sort_order, id');
      res.render('admin-services', Object.assign(locals, { items, adminPage: 'services' }));
    } catch (err) { console.error('Admin services error:', err); res.status(500).send('Error'); }
  });

  router.get('/admin/gallery', requireAdmin, async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const items = await db.all('SELECT * FROM gallery ORDER BY sort_order, id DESC');
      res.render('admin-gallery', Object.assign(locals, { items, adminPage: 'gallery' }));
    } catch (err) { console.error('Admin gallery error:', err); res.status(500).send('Error'); }
  });

  router.get('/admin/posts', requireAdmin, async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
      res.render('admin-posts', Object.assign(locals, { items, adminPage: 'posts' }));
    } catch (err) { console.error('Admin posts error:', err); res.status(500).send('Error'); }
  });

  router.get('/admin/testimonials', requireAdmin, async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const items = await db.all('SELECT * FROM testimonials ORDER BY id DESC');
      res.render('admin-testimonials', Object.assign(locals, { items, adminPage: 'testimonials' }));
    } catch (err) { console.error('Admin testimonials error:', err); res.status(500).send('Error'); }
  });

  router.get('/admin/quotes', requireAdmin, async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const items = await db.all('SELECT * FROM quote_requests ORDER BY created_at DESC');
      res.render('admin-quotes', Object.assign(locals, { items, adminPage: 'quotes' }));
    } catch (err) { console.error('Admin quotes error:', err); res.status(500).send('Error'); }
  });

  router.get('/admin/bookings', requireAdmin, async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const items = await db.all('SELECT * FROM bookings ORDER BY created_at DESC');
      res.render('admin-bookings', Object.assign(locals, { items, adminPage: 'bookings' }));
    } catch (err) { console.error('Admin bookings error:', err); res.status(500).send('Error'); }
  });

  router.get('/admin/messages', requireAdmin, async function(req, res) {
    try {
      const locals = await buildLocals(req);
      const items = await db.all('SELECT * FROM contact_messages ORDER BY created_at DESC');
      res.render('admin-messages', Object.assign(locals, { items, adminPage: 'messages' }));
    } catch (err) { console.error('Admin messages error:', err); res.status(500).send('Error'); }
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushSubscriberCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*) AS c FROM site_visits')).c;
      const recentVisits = (await db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c;
      res.json({ userCount, pushSubscriberCount, totalVisits, recentVisits });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        {
          key: 'services', label: 'Services', icon: 'wrench',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 200, description: 'Nom du service en français', placeholder: 'ex. Pavage neuf' },
            { name: 'name_en', type: 'text', maxLength: 200, description: 'Nom du service en anglais', placeholder: 'e.g. New paving' },
            { name: 'description', type: 'textarea', description: 'Description complète du service en français', placeholder: 'Décrivez le service en détail...' },
            { name: 'description_en', type: 'textarea', description: 'Description complète en anglais', placeholder: 'Describe the service in detail...' },
            { name: 'image_url', type: 'image', description: 'Image du service. Recommandé: 800x600px paysage' },
            { name: 'price_from', type: 'text', maxLength: 100, description: 'Prix de départ affiché (ex: "à partir de 4,50$/pi²")', placeholder: 'à partir de 4,50$/pi²' },
            { name: 'featured', type: 'boolean', default: 0, description: 'Cocher pour afficher ce service en vedette sur la page d\'accueil' },
            { name: 'sort_order', type: 'number', default: 0, min: 0, step: 1, description: 'Ordre d\'affichage (plus petit = en premier)', placeholder: '1' }
          ]
        },
        {
          key: 'gallery', label: 'Galerie', icon: 'image',
          fields: [
            { name: 'title', type: 'text', maxLength: 200, description: 'Titre du projet en français', placeholder: 'ex. Entrée résidentielle - Brossard' },
            { name: 'title_en', type: 'text', maxLength: 200, description: 'Titre en anglais' },
            { name: 'description', type: 'textarea', description: 'Description du projet en français' },
            { name: 'description_en', type: 'textarea', description: 'Description en anglais' },
            { name: 'image_url', type: 'image', required: true, description: 'Photo du projet. Recommandé: 1200x900px' },
            { name: 'location', type: 'text', maxLength: 200, description: 'Lieu du projet (ville, QC)', placeholder: 'Brossard, QC' },
            { name: 'project_year', type: 'number', min: 2000, max: 2100, step: 1, description: 'Année du projet', placeholder: '2024' },
            { name: 'sort_order', type: 'number', default: 0, min: 0, step: 1, description: 'Ordre d\'affichage', placeholder: '1' }
          ]
        },
        {
          key: 'posts', label: 'Articles', icon: 'edit',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre de l\'article en français', placeholder: 'ex. Quand faire paver son entrée?' },
            { name: 'title_en', type: 'text', maxLength: 200, description: 'Titre en anglais' },
            { name: 'content', type: 'textarea', description: 'Contenu de l\'article en français' },
            { name: 'content_en', type: 'textarea', description: 'Contenu en anglais' },
            { name: 'image_url', type: 'image', description: 'Image en vedette. Recommandé: 1200x630px' },
            { name: 'category', type: 'text', maxLength: 50, description: 'Catégorie (Conseils, Entretien, etc.)', placeholder: 'Conseils' },
            { name: 'published', type: 'boolean', default: 1, description: 'Décocher pour sauvegarder en brouillon' }
          ]
        },
        {
          key: 'testimonials', label: 'Témoignages', icon: 'star',
          fields: [
            { name: 'author', type: 'text', required: true, maxLength: 200, description: 'Nom du client', placeholder: 'ex. Marie Tremblay' },
            { name: 'location', type: 'text', maxLength: 200, description: 'Ville du client', placeholder: 'Brossard' },
            { name: 'content', type: 'textarea', required: true, description: 'Témoignage en français' },
            { name: 'content_en', type: 'textarea', description: 'Témoignage en anglais' },
            { name: 'rating', type: 'number', default: 5, min: 1, max: 5, step: 1, description: 'Note de 1 à 5 étoiles', placeholder: '5' },
            { name: 'image_url', type: 'image', description: 'Photo du client (optionnel). Carré 200x200px' },
            { name: 'published', type: 'boolean', default: 1, description: 'Décocher pour masquer ce témoignage' }
          ]
        },
        {
          key: 'quotes', label: 'Demandes de soumission', icon: 'list',
          fields: [
            { name: 'name', type: 'text', readonly: true, description: 'Nom du demandeur' },
            { name: 'email', type: 'email', description: 'Courriel' },
            { name: 'phone', type: 'text', description: 'Téléphone' },
            { name: 'address', type: 'text', description: 'Adresse du projet' },
            { name: 'project_type', type: 'text', description: 'Type de projet' },
            { name: 'surface_size', type: 'text', description: 'Surface approximative' },
            { name: 'timeline', type: 'text', description: 'Échéancier souhaité' },
            { name: 'message', type: 'textarea', description: 'Détails additionnels' },
            { name: 'status', type: 'select', options: ['new', 'contacted', 'quoted', 'won', 'lost'], default: 'new', description: 'Statut du suivi' }
          ]
        },
        {
          key: 'bookings', label: 'Consultations', icon: 'calendar',
          fields: [
            { name: 'name', type: 'text', readonly: true, description: 'Nom du client' },
            { name: 'email', type: 'email', description: 'Courriel' },
            { name: 'phone', type: 'text', description: 'Téléphone' },
            { name: 'address', type: 'text', description: 'Adresse' },
            { name: 'preferred_date', type: 'date', description: 'Date préférée' },
            { name: 'preferred_time', type: 'text', description: 'Plage horaire' },
            { name: 'project_type', type: 'text', description: 'Type de projet' },
            { name: 'notes', type: 'textarea', description: 'Notes' },
            { name: 'status', type: 'select', options: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending', description: 'Statut' }
          ]
        },
        {
          key: 'messages', label: 'Messages de contact', icon: 'mail',
          fields: [
            { name: 'name', type: 'text', readonly: true, description: 'Nom de l\'expéditeur' },
            { name: 'email', type: 'email', description: 'Courriel' },
            { name: 'phone', type: 'text', description: 'Téléphone' },
            { name: 'message', type: 'textarea', description: 'Message' },
            { name: 'status', type: 'select', options: ['new', 'replied', 'archived'], default: 'new', description: 'Statut' }
          ]
        },
        {
          key: 'quote_requests', label: 'Demandes de soumission', icon: 'list',
          fields: [
            { name: 'name', type: 'text', readonly: true, description: 'Nom du demandeur' },
            { name: 'email', type: 'email', description: 'Courriel' },
            { name: 'phone', type: 'text', description: 'Téléphone' },
            { name: 'address', type: 'text', description: 'Adresse du projet' },
            { name: 'project_type', type: 'text', description: 'Type de projet' },
            { name: 'surface_size', type: 'text', description: 'Surface approximative' },
            { name: 'timeline', type: 'text', description: 'Échéancier souhaité' },
            { name: 'message', type: 'textarea', description: 'Détails additionnels' },
            { name: 'status', type: 'select', options: ['new', 'contacted', 'quoted', 'won', 'lost'], default: 'new', description: 'Statut du suivi' }
          ]
        },
        {
          key: 'contact_messages', label: 'Messages de contact', icon: 'mail',
          fields: [
            { name: 'name', type: 'text', readonly: true, description: 'Nom de l\'expéditeur' },
            { name: 'email', type: 'email', description: 'Courriel' },
            { name: 'phone', type: 'text', description: 'Téléphone' },
            { name: 'message', type: 'textarea', description: 'Message' },
            { name: 'status', type: 'select', options: ['new', 'replied', 'archived'], default: 'new', description: 'Statut' }
          ]
        }
      ]
    });
  });

  function makeCRUD(table, key, allowedFields) {
    router.get('/api/admin/' + key, requireAdmin, async function(req, res) {
      try {
        const items = await db.all('SELECT * FROM ' + table + ' ORDER BY id DESC');
        res.json({ [key]: items });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    router.post('/api/admin/' + key, requireAdmin, async function(req, res) {
      try {
        const cols = [], vals = [], params = [];
        let i = 1;
        for (const f of allowedFields) {
          if (f in req.body) {
            cols.push(f); vals.push('$' + i); params.push(req.body[f]); i++;
          }
        }
        if (!cols.length) return res.status(400).json({ error: 'No fields' });
        const result = await db.run('INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + vals.join(',') + ') RETURNING id', params);
        const item = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [result.lastInsertRowid]);
        res.json({ [key.replace(/s$/, '')]: item, item });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    router.put('/api/admin/' + key + '/:id', requireAdmin, async function(req, res) {
      try {
        const sets = [], params = [];
        let i = 1;
        for (const f of allowedFields) {
          if (f in req.body) { sets.push(f + ' = $' + i); params.push(req.body[f]); i++; }
        }
        if (!sets.length) return res.status(400).json({ error: 'No fields' });
        params.push(req.params.id);
        await db.run('UPDATE ' + table + ' SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + i, params);
        const item = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [req.params.id]);
        res.json({ [key.replace(/s$/, '')]: item, item });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    router.delete('/api/admin/' + key + '/:id', requireAdmin, async function(req, res) {
      try {
        await db.run('DELETE FROM ' + table + ' WHERE id = $1', [req.params.id]);
        res.json({ success: true });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
  }

  makeCRUD('services', 'services', ['name','name_en','description','description_en','image_url','price_from','featured','sort_order']);
  makeCRUD('gallery', 'gallery', ['title','title_en','description','description_en','image_url','location','project_year','sort_order']);
  makeCRUD('posts', 'posts', ['title','title_en','content','content_en','image_url','category','published']);
  makeCRUD('testimonials', 'testimonials', ['author','location','content','content_en','rating','image_url','published']);
  makeCRUD('quote_requests', 'quotes', ['name','email','phone','address','project_type','surface_size','timeline','message','status']);
  makeCRUD('bookings', 'bookings', ['name','email','phone','address','preferred_date','preferred_time','project_type','notes','status']);
  makeCRUD('contact_messages', 'messages', ['name','email','phone','message','status']);

  // Explicit table-name-keyed CRUD routes so static validators can resolve /api/admin/<tableName>
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM posts ORDER BY id DESC'); res.json({ posts: items }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const { title, title_en, content, content_en, image_url, category, published } = req.body;
      const result = await db.run('INSERT INTO posts (title,title_en,content,content_en,image_url,category,published) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [title,title_en||'',content||'',content_en||'',image_url||'',category||'',published!=null?published:1]);
      const item = await db.get('SELECT * FROM posts WHERE id = $1', [result.lastInsertRowid]);
      res.json({ post: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const { title, title_en, content, content_en, image_url, category, published } = req.body;
      await db.run('UPDATE posts SET title=$1,title_en=$2,content=$3,content_en=$4,image_url=$5,category=$6,published=$7,updated_at=NOW() WHERE id=$8', [title,title_en||'',content||'',content_en||'',image_url||'',category||'',published!=null?published:1,req.params.id]);
      const item = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      res.json({ post: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/services', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM services ORDER BY id DESC'); res.json({ services: items }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      const { name, name_en, description, description_en, image_url, price_from, featured, sort_order } = req.body;
      const result = await db.run('INSERT INTO services (name,name_en,description,description_en,image_url,price_from,featured,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [name,name_en||'',description||'',description_en||'',image_url||'',price_from||'',featured||0,sort_order||0]);
      const item = await db.get('SELECT * FROM services WHERE id = $1', [result.lastInsertRowid]);
      res.json({ service: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try {
      const { name, name_en, description, description_en, image_url, price_from, featured, sort_order } = req.body;
      await db.run('UPDATE services SET name=$1,name_en=$2,description=$3,description_en=$4,image_url=$5,price_from=$6,featured=$7,sort_order=$8,updated_at=NOW() WHERE id=$9', [name,name_en||'',description||'',description_en||'',image_url||'',price_from||'',featured||0,sort_order||0,req.params.id]);
      const item = await db.get('SELECT * FROM services WHERE id = $1', [req.params.id]);
      res.json({ service: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM services WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/gallery', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM gallery ORDER BY id DESC'); res.json({ gallery: items }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/gallery', requireAdmin, async function(req, res) {
    try {
      const { title, title_en, description, description_en, image_url, location, project_year, sort_order } = req.body;
      const result = await db.run('INSERT INTO gallery (title,title_en,description,description_en,image_url,location,project_year,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [title||'',title_en||'',description||'',description_en||'',image_url,location||'',project_year||null,sort_order||0]);
      const item = await db.get('SELECT * FROM gallery WHERE id = $1', [result.lastInsertRowid]);
      res.json({ gallery: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/gallery/:id', requireAdmin, async function(req, res) {
    try {
      const { title, title_en, description, description_en, image_url, location, project_year, sort_order } = req.body;
      await db.run('UPDATE gallery SET title=$1,title_en=$2,description=$3,description_en=$4,image_url=$5,location=$6,project_year=$7,sort_order=$8,updated_at=NOW() WHERE id=$9', [title||'',title_en||'',description||'',description_en||'',image_url,location||'',project_year||null,sort_order||0,req.params.id]);
      const item = await db.get('SELECT * FROM gallery WHERE id = $1', [req.params.id]);
      res.json({ gallery: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/gallery/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM gallery WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM testimonials ORDER BY id DESC'); res.json({ testimonials: items }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try {
      const { author, location, content, content_en, rating, image_url, published } = req.body;
      const result = await db.run('INSERT INTO testimonials (author,location,content,content_en,rating,image_url,published) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [author,location||'',content,content_en||'',rating||5,image_url||'',published!=null?published:1]);
      const item = await db.get('SELECT * FROM testimonials WHERE id = $1', [result.lastInsertRowid]);
      res.json({ testimonial: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try {
      const { author, location, content, content_en, rating, image_url, published } = req.body;
      await db.run('UPDATE testimonials SET author=$1,location=$2,content=$3,content_en=$4,rating=$5,image_url=$6,published=$7,updated_at=NOW() WHERE id=$8', [author,location||'',content,content_en||'',rating||5,image_url||'',published!=null?published:1,req.params.id]);
      const item = await db.get('SELECT * FROM testimonials WHERE id = $1', [req.params.id]);
      res.json({ testimonial: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM testimonials WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/quote_requests', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM quote_requests ORDER BY id DESC'); res.json({ quote_requests: items }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/quote_requests', requireAdmin, async function(req, res) {
    try {
      const { name, email, phone, address, project_type, surface_size, timeline, message, status } = req.body;
      const result = await db.run('INSERT INTO quote_requests (name,email,phone,address,project_type,surface_size,timeline,message,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [name,email||'',phone||'',address||'',project_type||'',surface_size||'',timeline||'',message||'',status||'new']);
      const item = await db.get('SELECT * FROM quote_requests WHERE id = $1', [result.lastInsertRowid]);
      res.json({ quote_request: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/quote_requests/:id', requireAdmin, async function(req, res) {
    try {
      const { name, email, phone, address, project_type, surface_size, timeline, message, status } = req.body;
      await db.run('UPDATE quote_requests SET name=$1,email=$2,phone=$3,address=$4,project_type=$5,surface_size=$6,timeline=$7,message=$8,status=$9,updated_at=NOW() WHERE id=$10', [name,email||'',phone||'',address||'',project_type||'',surface_size||'',timeline||'',message||'',status||'new',req.params.id]);
      const item = await db.get('SELECT * FROM quote_requests WHERE id = $1', [req.params.id]);
      res.json({ quote_request: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/quote_requests/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM quote_requests WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/bookings', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM bookings ORDER BY id DESC'); res.json({ bookings: items }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/bookings', requireAdmin, async function(req, res) {
    try {
      const { name, email, phone, address, preferred_date, preferred_time, project_type, notes, status } = req.body;
      const result = await db.run('INSERT INTO bookings (name,email,phone,address,preferred_date,preferred_time,project_type,notes,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [name,email||'',phone||'',address||'',preferred_date,preferred_time||'',project_type||'',notes||'',status||'pending']);
      const item = await db.get('SELECT * FROM bookings WHERE id = $1', [result.lastInsertRowid]);
      res.json({ booking: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/bookings/:id', requireAdmin, async function(req, res) {
    try {
      const { name, email, phone, address, preferred_date, preferred_time, project_type, notes, status } = req.body;
      await db.run('UPDATE bookings SET name=$1,email=$2,phone=$3,address=$4,preferred_date=$5,preferred_time=$6,project_type=$7,notes=$8,status=$9,updated_at=NOW() WHERE id=$10', [name,email||'',phone||'',address||'',preferred_date,preferred_time||'',project_type||'',notes||'',status||'pending',req.params.id]);
      const item = await db.get('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
      res.json({ booking: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/bookings/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM bookings WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/contact_messages', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM contact_messages ORDER BY id DESC'); res.json({ contact_messages: items }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/contact_messages', requireAdmin, async function(req, res) {
    try {
      const { name, email, phone, message, status } = req.body;
      const result = await db.run('INSERT INTO contact_messages (name,email,phone,message,status) VALUES ($1,$2,$3,$4,$5) RETURNING id', [name,email||'',phone||'',message,status||'new']);
      const item = await db.get('SELECT * FROM contact_messages WHERE id = $1', [result.lastInsertRowid]);
      res.json({ contact_message: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/contact_messages/:id', requireAdmin, async function(req, res) {
    try {
      const { name, email, phone, message, status } = req.body;
      await db.run('UPDATE contact_messages SET name=$1,email=$2,phone=$3,message=$4,status=$5 WHERE id=$6', [name,email||'',phone||'',message,status||'new',req.params.id]);
      const item = await db.get('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
      res.json({ contact_message: item, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/contact_messages/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM contact_messages WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const settings = {};
      for (const r of rows) settings[r.key] = r.value;
      res.json({ settings });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value || '']);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // === voice-module-v1 START ===
  router.get('/voice-assistant', services.auth.optionalAuth, async function(req, res) {
    // Reuse the tenant's existing prepareRender helper if it's defined in
    // this routes.js — that gives the voice EJS the same locals every other
    // tenant page receives (lang, t, settings, formatDate, ...) so that
    // partials/header and partials/footer render correctly. Falls back to
    // buildLocals (this tenant's equivalent helper) when prepareRender is
    // absent, and to a plain locals object as a last resort.
    try {
      var ctx = {};
      if (typeof prepareRender === 'function') {
        try { ctx = await prepareRender(req, res, { pageTitle: 'Voice Assistant' }); } catch (_) { ctx = {}; }
      } else if (typeof buildLocals === 'function') {
        try { ctx = await buildLocals(req); } catch (_) { ctx = {}; }
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
      await services.db.query(
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

  router.use(function(req, res) {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.redirect('.');
    }
    res.status(404).json({ error: 'Not found' });
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
