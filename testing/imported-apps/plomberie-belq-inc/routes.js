module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  router.use(express.json({ limit: '2mb' }));
  router.use(express.urlencoded({ extended: true }));

  const T = {
    fr: {
      nav_home: 'Accueil', nav_services: 'Services', nav_callback: 'Demande de rappel par SMS', nav_contact: 'Contact', nav_login: 'Connexion', nav_account: 'Mon compte',
      call_now: 'Appeler maintenant', hero_cta_callback: 'Demander un rappel', hero_cta_services: 'Voir nos services',
      services_title: 'Nos services', services_subtitle: 'Plomberie résidentielle et commerciale',
      callback_title: 'Demande de rappel par SMS', callback_subtitle: 'Remplir le formulaire et nous recevrons votre demande par texto immédiatement. Nous communiquerons avec vous dès la prochaine opportunité.',
      field_name: 'Nom complet', field_phone: 'Numéro de téléphone', field_email: 'Courriel', field_message: 'Votre message',
      field_preferred_time: 'Moment préféré pour le rappel', field_issue: 'Description du problème',
      btn_submit: 'Envoyer', btn_send_callback: 'Demander un rappel', btn_send_message: 'Envoyer le message',
      contact_title: 'Contactez-nous', contact_subtitle: 'Une question? Un projet? Écrivez-nous.',
      contact_info: 'Coordonnées', address_label: 'Adresse', phone_label: 'Téléphone', email_label: 'Courriel', hours_label: 'Heures d\'ouverture',
      footer_rights: 'Tous droits réservés.', footer_quick_links: 'Liens rapides', footer_contact: 'Contact',
      success_callback: 'Demande envoyée! Nous vous rappellerons bientôt.', success_contact: 'Message envoyé!',
      error_generic: 'Une erreur est survenue. Veuillez réessayer.', error_required: 'Veuillez remplir tous les champs requis.',
      empty_services: 'Aucun service disponible pour le moment.', empty_posts: 'Aucune nouvelle pour le moment.',
      about_title: 'Qui nous sommes', why_us_title: 'Pourquoi nous choisir',
      why_1_title: 'Service rapide', why_1_desc: 'Intervention rapide pour vos urgences, 24/7.',
      why_2_title: 'Travail garanti', why_2_desc: 'Garantie sur tous les travaux effectués.',
      why_3_title: 'Prix transparents', why_3_desc: 'Aucune surprise — des prix clairs et un devis avant.',
      why_4_title: 'Plombiers certifiés', why_4_desc: 'Équipe expérimentée, formée et certifiée.',
      cta_title: 'Besoin d\'un plombier?', cta_subtitle: 'Appelez-nous directement ou demandez un rappel par texto.',
      blog_title: 'Conseils et nouvelles', posts_read_more: 'Lire la suite',
      enable_notifications: 'Activer les notifications',
      callback_thanks_title: 'Demande reçue!', callback_thanks_msg: 'Nous avons reçu votre demande par texto et communiquerons avec vous dès la prochaine opportunité.',
      contact_thanks_title: 'Message envoyé!', contact_thanks_msg: 'Nous vous répondrons sous peu.'
    },
    en: {
      nav_home: 'Home', nav_services: 'Services', nav_callback: 'SMS Callback Request', nav_contact: 'Contact', nav_login: 'Sign In', nav_account: 'My Account',
      call_now: 'Call Now', hero_cta_callback: 'Request a Callback', hero_cta_services: 'See Our Services',
      services_title: 'Our Services', services_subtitle: 'Residential and commercial plumbing',
      callback_title: 'SMS Callback Request', callback_subtitle: 'Fill out the form and we will receive your request by text immediately. We will get back to you at the next opportunity.',
      field_name: 'Full Name', field_phone: 'Phone Number', field_email: 'Email', field_message: 'Your Message',
      field_preferred_time: 'Preferred Callback Time', field_issue: 'Describe the Issue',
      btn_submit: 'Submit', btn_send_callback: 'Request Callback', btn_send_message: 'Send Message',
      contact_title: 'Contact Us', contact_subtitle: 'A question? A project? Write to us.',
      contact_info: 'Contact Info', address_label: 'Address', phone_label: 'Phone', email_label: 'Email', hours_label: 'Business Hours',
      footer_rights: 'All rights reserved.', footer_quick_links: 'Quick Links', footer_contact: 'Contact',
      success_callback: 'Request sent! We will call you back soon.', success_contact: 'Message sent!',
      error_generic: 'An error occurred. Please try again.', error_required: 'Please fill in all required fields.',
      empty_services: 'No services available yet.', empty_posts: 'No news yet.',
      about_title: 'Who We Are', why_us_title: 'Why Choose Us',
      why_1_title: 'Fast Service', why_1_desc: 'Quick response to your emergencies, 24/7.',
      why_2_title: 'Guaranteed Work', why_2_desc: 'Warranty on every job we do.',
      why_3_title: 'Transparent Pricing', why_3_desc: 'No surprises — clear quotes upfront.',
      why_4_title: 'Certified Plumbers', why_4_desc: 'Experienced, trained and certified team.',
      cta_title: 'Need a plumber?', cta_subtitle: 'Call us directly or request a callback by text.',
      blog_title: 'Tips & News', posts_read_more: 'Read more',
      enable_notifications: 'Enable notifications',
      callback_thanks_title: 'Request received!', callback_thanks_msg: 'We received your request by text and will get back to you at the next opportunity.',
      contact_thanks_title: 'Message sent!', contact_thanks_msg: 'We will reply shortly.'
    }
  };

  function formatDate(d, lang) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch(e) { return ''; }
  }
  function formatDateTime(d, lang) {
    if (!d) return '';
    try { return new Date(d).toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA'); } catch(e) { return ''; }
  }

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const map = {};
      for (const r of rows) map[r.key] = r.value;
      return map;
    } catch (e) { return {}; }
  }

  function applyTextOverrides(t, settings, lang) {
    const out = Object.assign({}, t);
    for (const k in settings) {
      if (k.indexOf('text_') === 0 && k.lastIndexOf('_' + lang) === k.length - lang.length - 1) {
        const tKey = k.slice(5, -(lang.length + 1));
        if (tKey) out[tKey] = settings[k];
      }
    }
    return out;
  }

  async function getPendingCounts() {
    try {
      const cb = await db.get("SELECT COUNT(*)::int AS c FROM callback_requests WHERE status = 'new'");
      const ct = await db.get("SELECT COUNT(*)::int AS c FROM contact_submissions WHERE status = 'new'");
      return { callbacks: (cb && cb.c) || 0, contacts: (ct && ct.c) || 0 };
    } catch (e) { return { callbacks: 0, contacts: 0 }; }
  }

  router.use(function(req, res, next) {
    let lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query.lang === 'fr' || req.query.lang === 'en') {
      res.cookie('pwa_lang', req.query.lang, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false });
    }
    req.lang = lang;
    next();
  });

  router.use(function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]).catch(function(){});
    }
    next();
  });

  async function renderCtx(req, extra) {
    const settings = await getSettings();
    const t = applyTextOverrides(T[req.lang] || T.fr, settings, req.lang);
    const config = {
      businessName: settings.business_name || services.config.businessName || services.config.displayName || 'Plomberie Belq Inc',
      phone: settings.contact_phone || services.config.contactPhone || '',
      email: settings.contact_email || services.config.contactEmail || '',
      address: settings.business_address || services.config.businessAddress || ''
    };
    return Object.assign({ t: t, lang: req.lang, settings: settings, user: req.user || null, formatDate: formatDate, formatDateTime: formatDateTime, config: config, pendingCounts: { callbacks: 0, contacts: 0 } }, extra || {});
  }

  router.get('/', services.auth.optionalAuth, async function(req, res) {
    try {
      let featured = await db.all('SELECT * FROM services WHERE featured = 1 ORDER BY sort_order ASC, id ASC LIMIT 6');
      if (!featured || featured.length === 0) featured = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC LIMIT 6');
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', await renderCtx(req, { services: featured, posts: posts }));
    } catch (err) { console.error(err); res.status(500).send('Error: ' + err.message); }
  });

  router.get('/services', services.auth.optionalAuth, async function(req, res) {
    try {
      const all = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
      res.render('services', await renderCtx(req, { services: all }));
    } catch (err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/rappel', services.auth.optionalAuth, async function(req, res) {
    res.render('rappel', await renderCtx(req));
  });
  router.get('/callback', function(req, res) { res.redirect('rappel' + (req.url.indexOf('?') >= 0 ? req.url.substring(req.url.indexOf('?')) : '')); });

  router.get('/contact', services.auth.optionalAuth, async function(req, res) {
    res.render('contact', await renderCtx(req));
  });

  router.post('/api/callback', async function(req, res) {
    try {
      const b = req.body || {};
      const name = (b.name || '').toString().trim();
      const phone = (b.phone || '').toString().trim();
      const preferred_time = (b.preferred_time || '').toString().trim();
      const issue = (b.issue || '').toString().trim();
      if (!name || !phone) return res.status(400).json({ error: 'Nom et téléphone requis.' });
      await db.run('INSERT INTO callback_requests (name, phone, preferred_time, issue, status) VALUES ($1,$2,$3,$4,$5)', [name, phone, preferred_time, issue, 'new']);
      const settings = await getSettings();
      try {
        if (services.config.contactEmail) {
          const html = '<h3>Nouvelle demande de rappel</h3>' +
            '<p><b>Nom:</b> ' + name + '</p>' +
            '<p><b>Téléphone:</b> <a href="tel:' + phone + '">' + phone + '</a></p>' +
            '<p><b>Moment préféré:</b> ' + (preferred_time || '(non spécifié)') + '</p>' +
            '<p><b>Problème:</b><br>' + (issue || '(non décrit)').replace(/\n/g, '<br>') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle demande de rappel — ' + name, html: html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (e) { console.error('Email failed:', e.message); }
      try {
        const smsTo = (settings.sms_callback_phone || services.config.contactPhone || '').toString().trim();
        if (smsTo) {
          const parts = ['Nouvelle demande de rappel', 'Nom: ' + name, 'Tel: ' + phone];
          if (preferred_time) parts.push('Moment: ' + preferred_time);
          if (issue) parts.push('Probleme: ' + issue);
          await services.sms.send(smsTo, parts.join('\n'));
        }
      } catch (e) { console.error('SMS failed:', e.message); }
      res.json({ success: true });
    } catch (err) {
      console.error('Callback error:', err);
      res.status(500).json({ error: 'Soumission échouée' });
    }
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const b = req.body || {};
      const name = (b.name || '').toString().trim();
      const email = (b.email || '').toString().trim();
      const phone = (b.phone || '').toString().trim();
      const message = (b.message || '').toString().trim();
      if (!name || !message) return res.status(400).json({ error: 'Nom et message requis.' });
      await db.run('INSERT INTO contact_submissions (name, email, phone, message, status) VALUES ($1,$2,$3,$4,$5)', [name, email, phone, message, 'new']);
      try {
        if (services.config.contactEmail) {
          const html = '<h3>Nouveau message de contact</h3>' +
            '<p><b>Nom:</b> ' + name + '</p>' +
            '<p><b>Courriel:</b> ' + (email || '(non fourni)') + '</p>' +
            '<p><b>Téléphone:</b> ' + (phone || '(non fourni)') + '</p>' +
            '<p><b>Message:</b><br>' + message.replace(/\n/g, '<br>') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message — ' + name, html: html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (e) { console.error('Email failed:', e.message); }
      res.json({ success: true });
    } catch (err) {
      console.error('Contact error:', err);
      res.status(500).json({ error: 'Soumission échouée' });
    }
  });

  function requireAdminApi(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      async function c(sql, params) { const r = await db.get(sql, params || []); return (r && (r.c !== undefined ? r.c : r.count)) || 0; }
      const stats = {
        services: await c('SELECT COUNT(*)::int AS c FROM services'),
        posts: await c('SELECT COUNT(*)::int AS c FROM posts'),
        callbacks_total: await c('SELECT COUNT(*)::int AS c FROM callback_requests'),
        callbacks_new: await c("SELECT COUNT(*)::int AS c FROM callback_requests WHERE status = 'new'"),
        contacts_total: await c('SELECT COUNT(*)::int AS c FROM contact_submissions'),
        contacts_new: await c("SELECT COUNT(*)::int AS c FROM contact_submissions WHERE status = 'new'"),
        users: await services.auth.getUserCount(),
        push: await services.push.getSubscriptionCount(),
        visits_total: await c('SELECT COUNT(*)::int AS c FROM site_visits'),
        visits_7d: await c("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")
      };
      const pendingCounts = { callbacks: stats.callbacks_new, contacts: stats.contacts_new };
      const recentCallbacks = await db.all('SELECT * FROM callback_requests ORDER BY created_at DESC LIMIT 5');
      const recentContacts = await db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 5');
      res.render('admin', await renderCtx(req, { currentNav: 'dashboard', stats: stats, pendingCounts: pendingCounts, recentCallbacks: recentCallbacks, recentContacts: recentContacts, adminUser: { name: services.config.ownerName || 'Admin' } }));
    } catch (err) { console.error('Admin error:', err); res.status(500).send('Admin error: ' + err.message); }
  });

  router.get('/admin/services', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    const items = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
    const pendingCounts = await getPendingCounts();
    res.render('admin-services', await renderCtx(req, { currentNav: 'services', items: items, pendingCounts: pendingCounts, adminUser: { name: services.config.ownerName || 'Admin' } }));
  });

  router.get('/admin/posts', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    const items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
    const pendingCounts = await getPendingCounts();
    res.render('admin-posts', await renderCtx(req, { currentNav: 'posts', items: items, pendingCounts: pendingCounts, adminUser: { name: services.config.ownerName || 'Admin' } }));
  });

  router.get('/admin/callbacks', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    const items = await db.all('SELECT * FROM callback_requests ORDER BY created_at DESC');
    const pendingCounts = await getPendingCounts();
    res.render('admin-callbacks', await renderCtx(req, { currentNav: 'callbacks', items: items, pendingCounts: pendingCounts, adminUser: { name: services.config.ownerName || 'Admin' } }));
  });

  router.get('/admin/contacts', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    const items = await db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    const pendingCounts = await getPendingCounts();
    res.render('admin-contacts', await renderCtx(req, { currentNav: 'contacts', items: items, pendingCounts: pendingCounts, adminUser: { name: services.config.ownerName || 'Admin' } }));
  });

  router.get('/admin/settings', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    const pendingCounts = await getPendingCounts();
    res.render('admin-settings', await renderCtx(req, { currentNav: 'settings', pendingCounts: pendingCounts, adminUser: { name: services.config.ownerName || 'Admin' } }));
  });

  router.get('/api/admin/stats', requireAdminApi, async function(req, res) {
    try {
      async function c(sql) { const r = await db.get(sql); return (r && (r.c !== undefined ? r.c : r.count)) || 0; }
      res.json({
        userCount: await services.auth.getUserCount(),
        pushSubscriberCount: await services.push.getSubscriptionCount(),
        totalVisits: await c('SELECT COUNT(*)::int AS c FROM site_visits'),
        recentVisits: await c("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"),
        callbacks: await c('SELECT COUNT(*)::int AS c FROM callback_requests'),
        contacts: await c('SELECT COUNT(*)::int AS c FROM contact_submissions')
      });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/submissions', requireAdminApi, async function(req, res) {
    const callbacks = await db.all('SELECT * FROM callback_requests ORDER BY created_at DESC LIMIT 50');
    const contacts = await db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 50');
    res.json({ callback_requests: callbacks, contact_submissions: contacts });
  });

  router.get('/api/admin/modules', requireAdminApi, function(req, res) {
    res.json({
      modules: [
        { key: 'services', label: 'Services', icon: 'tool', fields: [
          { name: 'name_fr', type: 'text', required: true, maxLength: 100, description: 'Nom du service en français (affiché sur le site public).', placeholder: 'ex. Plomberie d\'urgence' },
          { name: 'name_en', type: 'text', required: false, maxLength: 100, description: 'Nom du service en anglais (affiché en mode EN).', placeholder: 'e.g. Emergency Plumbing' },
          { name: 'description_fr', type: 'textarea', required: false, description: 'Courte description (FR) affichée sur la carte. 1-2 phrases.', placeholder: 'Décrivez ce service en quelques phrases...' },
          { name: 'description_en', type: 'textarea', required: false, description: 'Courte description (EN).', placeholder: 'Describe this service briefly...' },
          { name: 'icon', type: 'text', required: false, maxLength: 10, description: 'Emoji affiché sur la carte (ex. 🔧, 🚿, 🚽). Optionnel si une image est utilisée.', placeholder: '🔧' },
          { name: 'price_range', type: 'text', required: false, maxLength: 50, description: 'Fourchette de prix optionnelle (ex. À partir de 150$). Laissez vide pour masquer.', placeholder: 'À partir de 150$' },
          { name: 'image_url', type: 'image', required: false, description: 'Photo optionnelle du service. Recommandé: 800×600px paysage.' },
          { name: 'featured', type: 'boolean', default: false, description: 'Les services vedettes apparaissent en premier sur la page d\'accueil.' },
          { name: 'sort_order', type: 'number', required: false, min: 0, step: 1, default: 0, description: 'Nombre plus petit = affiché en premier.', placeholder: '0' }
        ]},
        { key: 'posts', label: 'Articles / Blog', icon: 'edit', fields: [
          { name: 'title_fr', type: 'text', required: true, maxLength: 200, description: 'Titre de l\'article (français).', placeholder: 'Titre de l\'article' },
          { name: 'title_en', type: 'text', required: false, maxLength: 200, description: 'Titre de l\'article (anglais).', placeholder: 'Post title' },
          { name: 'content_fr', type: 'textarea', required: false, description: 'Contenu complet (FR). Paragraphes séparés par une ligne vide.', placeholder: 'Contenu de l\'article...' },
          { name: 'content_en', type: 'textarea', required: false, description: 'Contenu complet (EN).', placeholder: 'Post content...' },
          { name: 'image_url', type: 'image', required: false, description: 'Image en vedette. Recommandé: 1200×630px paysage.' },
          { name: 'category', type: 'text', required: false, maxLength: 50, description: 'Catégorie (ex. Conseils, Nouvelles, Urgence).', placeholder: 'Conseils' },
          { name: 'published', type: 'boolean', default: true, description: 'Décochez pour enregistrer en brouillon (masqué des visiteurs).' }
        ]},
        { key: 'callback_requests', label: 'Demandes de rappel SMS', icon: 'phone', fields: [
          { name: 'name', type: 'readonly', description: 'Nom du client (soumis via le formulaire).' },
          { name: 'phone', type: 'readonly', description: 'Numéro de téléphone à rappeler.' },
          { name: 'preferred_time', type: 'readonly', description: 'Moment préféré pour le rappel.' },
          { name: 'issue', type: 'readonly', description: 'Description du problème de plomberie.' },
          { name: 'status', type: 'select', options: ['new','contacted','completed','cancelled'], default: 'new', description: 'Statut de la demande.' },
          { name: 'notes', type: 'textarea', required: false, description: 'Notes internes (visibles seulement par l\'admin).' }
        ]},
        { key: 'contact_submissions', label: 'Messages de contact', icon: 'mail', fields: [
          { name: 'name', type: 'readonly', description: 'Nom de l\'expéditeur.' },
          { name: 'email', type: 'readonly', description: 'Courriel de l\'expéditeur.' },
          { name: 'phone', type: 'readonly', description: 'Téléphone (optionnel).' },
          { name: 'message', type: 'readonly', description: 'Texte complet du message.' },
          { name: 'status', type: 'select', options: ['new','replied','archived'], default: 'new', description: 'Statut du message.' },
          { name: 'notes', type: 'textarea', required: false, description: 'Notes internes.' }
        ]}
      ],
      settingsFields: [
        { name: 'sms_callback_phone', type: 'tel', label: 'Numéro de rappel par SMS', description: 'Numéro de téléphone qui reçoit un texto à chaque nouvelle demande de rappel soumise par un visiteur. Format conseillé: +15145550123.', placeholder: '+15145550123' },
        { name: 'contact_phone', type: 'tel', label: 'Téléphone affiché (Click-to-call)', description: 'Numéro affiché sur le site et utilisé par le bouton flottant Click-to-call. Si vide, le bouton est masqué.', placeholder: '514-555-0123' },
        { name: 'contact_email', type: 'email', label: 'Courriel de notification', description: 'Courriel qui reçoit une copie des demandes de rappel et des messages de contact.', placeholder: 'admin@exemple.com' },
        { name: 'business_address', type: 'text', label: 'Adresse', description: 'Adresse affichée dans le pied de page et la page Contact.', placeholder: '123 rue Example, Ville, QC' }
      ]
    });
  });

  router.get('/api/admin/services', requireAdminApi, async function(req, res) {
    const items = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
    res.json({ services: items });
  });
  router.post('/api/admin/services', requireAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const r = await db.run('INSERT INTO services (name_fr, name_en, description_fr, description_en, icon, price_range, image_url, featured, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
        [b.name_fr || '', b.name_en || '', b.description_fr || '', b.description_en || '', b.icon || '', b.price_range || '', b.image_url || '', b.featured ? 1 : 0, parseInt(b.sort_order) || 0]);
      const row = await db.get('SELECT * FROM services WHERE id = $1', [r.lastInsertRowid]);
      res.json({ service: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/services/:id', requireAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      await db.run('UPDATE services SET name_fr=$1, name_en=$2, description_fr=$3, description_en=$4, icon=$5, price_range=$6, image_url=$7, featured=$8, sort_order=$9, updated_at=NOW() WHERE id=$10',
        [b.name_fr || '', b.name_en || '', b.description_fr || '', b.description_en || '', b.icon || '', b.price_range || '', b.image_url || '', b.featured ? 1 : 0, parseInt(b.sort_order) || 0, req.params.id]);
      const row = await db.get('SELECT * FROM services WHERE id = $1', [req.params.id]);
      res.json({ service: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/services/:id', requireAdminApi, async function(req, res) {
    await db.run('DELETE FROM services WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  });

  router.get('/api/admin/posts', requireAdminApi, async function(req, res) {
    const items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
    res.json({ posts: items });
  });
  router.post('/api/admin/posts', requireAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const pub = (b.published === false || b.published === 0 || b.published === '0' || b.published === 'false') ? 0 : 1;
      const r = await db.run('INSERT INTO posts (title_fr, title_en, content_fr, content_en, image_url, category, published) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [b.title_fr || '', b.title_en || '', b.content_fr || '', b.content_en || '', b.image_url || '', b.category || '', pub]);
      const row = await db.get('SELECT * FROM posts WHERE id = $1', [r.lastInsertRowid]);
      res.json({ post: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const pub = (b.published === false || b.published === 0 || b.published === '0' || b.published === 'false') ? 0 : 1;
      await db.run('UPDATE posts SET title_fr=$1, title_en=$2, content_fr=$3, content_en=$4, image_url=$5, category=$6, published=$7, updated_at=NOW() WHERE id=$8',
        [b.title_fr || '', b.title_en || '', b.content_fr || '', b.content_en || '', b.image_url || '', b.category || '', pub, req.params.id]);
      const row = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      res.json({ post: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    await db.run('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  });

  router.get('/api/admin/callback_requests', requireAdminApi, async function(req, res) {
    const items = await db.all('SELECT * FROM callback_requests ORDER BY created_at DESC');
    res.json({ callback_requests: items });
  });
  router.put('/api/admin/callback_requests/:id', requireAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      await db.run('UPDATE callback_requests SET status=$1, notes=$2, updated_at=NOW() WHERE id=$3', [b.status || 'new', b.notes || '', req.params.id]);
      const row = await db.get('SELECT * FROM callback_requests WHERE id = $1', [req.params.id]);
      res.json({ callback_request: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/callback_requests/:id', requireAdminApi, async function(req, res) {
    await db.run('DELETE FROM callback_requests WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  });

  router.get('/api/admin/contact_submissions', requireAdminApi, async function(req, res) {
    const items = await db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json({ contact_submissions: items });
  });
  router.put('/api/admin/contact_submissions/:id', requireAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      await db.run('UPDATE contact_submissions SET status=$1, notes=$2, updated_at=NOW() WHERE id=$3', [b.status || 'new', b.notes || '', req.params.id]);
      const row = await db.get('SELECT * FROM contact_submissions WHERE id = $1', [req.params.id]);
      res.json({ contact_submission: row });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/contact_submissions/:id', requireAdminApi, async function(req, res) {
    await db.run('DELETE FROM contact_submissions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  });

  router.get('/api/admin/settings', requireAdminApi, async function(req, res) {
    const rows = await db.all('SELECT key, value FROM admin_settings');
    const out = {};
    for (const r of rows) out[r.key] = r.value;
    res.json({ settings: out });
  });
  router.put('/api/admin/settings', requireAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.key) return res.status(400).json({ error: 'Missing key' });
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()', [b.key, b.value || '']);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.use(function(req, res) {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) return res.redirect('.');
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
