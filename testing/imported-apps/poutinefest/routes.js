module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  const T = {
    fr: {
      brand: 'PoutineFest',
      nav_home: 'Accueil', nav_menu: 'Menu', nav_delivery: 'Livraison', nav_about: 'À propos', nav_reserve: 'Réserver le camion',
      login: 'Connexion', enable_notif: 'Activer les notifications',
      hero_title: 'La poutine la plus authentique en ville',
      hero_subtitle: 'Restaurant brique et mortier + camion-restaurant. Fromage couinant garanti.',
      cta_menu: 'Voir le menu', cta_reserve: 'Réserver le camion',
      menu_title: 'Notre menu', menu_subtitle: 'Des poutines préparées à la commande, fromage frais du jour.',
      delivery_title: 'Faites-vous livrer', delivery_subtitle: 'Commandez via vos plateformes préférées.',
      delivery_intro: 'Choisissez votre plateforme de livraison préférée.',
      about_title: 'Notre histoire',
      reserve_title: 'Réserver le camion-restaurant',
      reserve_subtitle: 'Mariage, fête d\'entreprise, festival? Notre camion vient à vous.',
      form_name: 'Votre nom', form_email: 'Courriel', form_phone: 'Téléphone',
      form_event_date: 'Date de l\'événement', form_event_type: 'Type d\'événement',
      form_location: 'Adresse / Lieu', form_guests: 'Nombre d\'invités',
      form_message: 'Message ou détails', form_submit: 'Envoyer la demande',
      reserve_success: 'Demande reçue! Nous vous contacterons sous 24h.',
      reserve_error: 'Une erreur s\'est produite. Veuillez réessayer.',
      no_menu: 'Le menu sera bientôt disponible.',
      no_platforms: 'Aucune plateforme de livraison configurée pour le moment.',
      footer_rights: 'Tous droits réservés',
      contact_us: 'Nous joindre',
      view_full_menu: 'Voir tout le menu',
      order_now: 'Commander',
      back_home: 'Retour à l\'accueil',
      values_title: 'Nos valeurs',
      val1_t: 'Frais quotidien', val1_d: 'Pommes de terre du Québec, fromage en grains du jour.',
      val2_t: 'Camion mobile', val2_d: 'Notre camion se déplace partout au Québec pour vos événements.',
      val3_t: 'Authentique', val3_d: 'Recette traditionnelle, sauce brune maison mijotée 6 heures.',
      open_hours: 'Heures d\'ouverture', address: 'Adresse', phone: 'Téléphone', email: 'Courriel',
      latest_news: 'Dernières nouvelles', read_more: 'Lire plus',
      category_all: 'Tous', category_classique: 'Classiques', category_signature: 'Signatures', category_vegan: 'Végé', category_dessert: 'Desserts',
      all_truck_cta: 'Recevoir le camion à votre événement'
    },
    en: {
      brand: 'PoutineFest',
      nav_home: 'Home', nav_menu: 'Menu', nav_delivery: 'Delivery', nav_about: 'About', nav_reserve: 'Book the truck',
      login: 'Sign In', enable_notif: 'Enable notifications',
      hero_title: 'The most authentic poutine in town',
      hero_subtitle: 'Brick & mortar restaurant + food truck. Squeaky cheese guaranteed.',
      cta_menu: 'See the menu', cta_reserve: 'Book the truck',
      menu_title: 'Our menu', menu_subtitle: 'Poutines made to order with daily-fresh cheese curds.',
      delivery_title: 'Get it delivered', delivery_subtitle: 'Order via your favorite platforms.',
      delivery_intro: 'Pick your favorite delivery platform.',
      about_title: 'Our story',
      reserve_title: 'Book the food truck',
      reserve_subtitle: 'Wedding, corporate event, festival? Our truck comes to you.',
      form_name: 'Your name', form_email: 'Email', form_phone: 'Phone',
      form_event_date: 'Event date', form_event_type: 'Event type',
      form_location: 'Address / Location', form_guests: 'Number of guests',
      form_message: 'Message or details', form_submit: 'Send request',
      reserve_success: 'Request received! We will contact you within 24h.',
      reserve_error: 'Something went wrong. Please try again.',
      no_menu: 'Menu coming soon.',
      no_platforms: 'No delivery platforms configured yet.',
      footer_rights: 'All rights reserved',
      contact_us: 'Contact us',
      view_full_menu: 'View full menu',
      order_now: 'Order',
      back_home: 'Back to home',
      values_title: 'Our values',
      val1_t: 'Fresh daily', val1_d: 'Quebec potatoes, fresh cheese curds delivered every morning.',
      val2_t: 'Mobile truck', val2_d: 'Our truck travels across Quebec for your events.',
      val3_t: 'Authentic', val3_d: 'Traditional recipe, house-made gravy simmered 6 hours.',
      open_hours: 'Hours', address: 'Address', phone: 'Phone', email: 'Email',
      latest_news: 'Latest news', read_more: 'Read more',
      category_all: 'All', category_classique: 'Classics', category_signature: 'Signatures', category_vegan: 'Veggie', category_dessert: 'Desserts',
      all_truck_cta: 'Bring the truck to your event'
    }
  };

  function formatPrice(p) { if (p == null || p === '') return ''; return Number(p).toFixed(2) + ' $'; }
  function formatDate(d, lang) { if (!d) return ''; try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year:'numeric', month:'long', day:'numeric'}); } catch(e) { return String(d); } }
  function pickLang(item, field, lang) { if (!item) return ''; return item[field + '_' + lang] || item[field + '_fr'] || item[field] || ''; }

  async function getSettings() {
    try { const rows = await db.all('SELECT key, value FROM admin_settings'); const o = {}; rows.forEach(function(r){ o[r.key] = r.value; }); return o; } catch(e) { return {}; }
  }

  function applyTextOverrides(t, settings, lang) {
    const suffix = '_' + lang;
    for (const k in settings) {
      if (k.indexOf('text_') === 0 && k.lastIndexOf(suffix) === k.length - suffix.length) {
        const tKey = k.slice(5, k.length - suffix.length);
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  router.use(function(req, res, next) {
    let lang = (req.query && req.query.lang) || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query && (req.query.lang === 'fr' || req.query.lang === 'en')) {
      try { res.cookie('pwa_lang', req.query.lang, { maxAge: 365*24*60*60*1000, httpOnly: false }); } catch(e) {}
    }
    req.lang = lang;
    next();
  });

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  async function renderCtx(req) {
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[req.lang] || T.fr), settings, req.lang);
    return { t: t, lang: req.lang, settings: settings, formatPrice: formatPrice, formatDate: formatDate, pickLang: pickLang };
  }

  router.get('/', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const menu = await db.all("SELECT * FROM menu_items WHERE available = 1 ORDER BY featured DESC, position ASC LIMIT 6").catch(function(){ return []; });
      const platforms = await db.all('SELECT * FROM delivery_platforms WHERE active = 1 ORDER BY position ASC').catch(function(){ return []; });
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3').catch(function(){ return []; });
      res.render('index', Object.assign(ctx, { menu: menu, platforms: platforms, posts: posts }));
    } catch(e) { res.status(500).send('Erreur'); }
  });

  router.get('/menu', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const menu = await db.all('SELECT * FROM menu_items ORDER BY position ASC, id ASC').catch(function(){ return []; });
      res.render('menu', Object.assign(ctx, { menu: menu }));
    } catch(e) { res.status(500).send('Erreur'); }
  });

  router.get('/livraison', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const platforms = await db.all('SELECT * FROM delivery_platforms WHERE active = 1 ORDER BY position ASC').catch(function(){ return []; });
      res.render('livraison', Object.assign(ctx, { platforms: platforms }));
    } catch(e) { res.status(500).send('Erreur'); }
  });

  router.get('/apropos', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      res.render('apropos', ctx);
    } catch(e) { res.status(500).send('Erreur'); }
  });

  router.get('/reserver', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      res.render('reserver', Object.assign(ctx, { submitted: false, errorMsg: null }));
    } catch(e) { res.status(500).send('Erreur'); }
  });

  router.post('/api/reserve', async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.contact_name || !b.contact_email || !b.event_date) return res.status(400).json({ error: 'Missing required fields' });
      await db.run('INSERT INTO reservations (event_date, event_type, contact_name, contact_email, contact_phone, location, guests, message, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [b.event_date, b.event_type || '', b.contact_name, b.contact_email, b.contact_phone || '', b.location || '', parseInt(b.guests) || 0, b.message || '', 'pending']);
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouvelle demande de camion - PoutineFest</h2>' +
            '<p><strong>Nom:</strong> ' + b.contact_name + '</p>' +
            '<p><strong>Courriel:</strong> ' + b.contact_email + '</p>' +
            '<p><strong>Téléphone:</strong> ' + (b.contact_phone || '-') + '</p>' +
            '<p><strong>Date de l\'événement:</strong> ' + b.event_date + '</p>' +
            '<p><strong>Type d\'événement:</strong> ' + (b.event_type || '-') + '</p>' +
            '<p><strong>Lieu:</strong> ' + (b.location || '-') + '</p>' +
            '<p><strong>Invités:</strong> ' + (b.guests || '-') + '</p>' +
            '<p><strong>Message:</strong></p><p>' + (b.message || '-').replace(/\n/g, '<br>') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle demande de camion - ' + b.contact_name, html: html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch(emailErr) { console.error('Email failed:', emailErr.message); }
      res.json({ success: true });
    } catch(e) {
      console.error('Reserve error:', e.message);
      res.status(500).json({ error: 'Submission failed' });
    }
  });

  function isAdminPage(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    next();
  }
  function isAdminApi(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      const safeCount = async function(sql) { try { const r = await db.get(sql); return (r && (r.c || r.count)) || 0; } catch(e) { return 0; } };
      const stats = {
        menu: await safeCount('SELECT COUNT(*) AS c FROM menu_items'),
        platforms: await safeCount('SELECT COUNT(*) AS c FROM delivery_platforms'),
        reservations: await safeCount('SELECT COUNT(*) AS c FROM reservations'),
        posts: await safeCount('SELECT COUNT(*) AS c FROM posts'),
        users: await services.auth.getUserCount().catch(function(){ return 0; }),
        pushSubs: await services.push.getSubscriptionCount().catch(function(){ return 0; }),
        visits: await safeCount('SELECT COUNT(*) AS c FROM site_visits'),
        visits7: await safeCount("SELECT COUNT(*) AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'"),
        pendingReservations: await safeCount("SELECT COUNT(*) AS c FROM reservations WHERE status = 'pending'"),
        confirmedReservations: await safeCount("SELECT COUNT(*) AS c FROM reservations WHERE status = 'confirmed'"),
        availableMenu: await safeCount("SELECT COUNT(*) AS c FROM menu_items WHERE available = 1"),
        activePlatforms: await safeCount("SELECT COUNT(*) AS c FROM delivery_platforms WHERE active = 1")
      };
      const recentReservations = await db.all('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 5').catch(function(){ return []; });
      res.render('admin', { stats: stats, recentReservations: recentReservations, page: 'dashboard' });
    } catch(e) { res.status(500).send('Erreur: ' + e.message); }
  });

  router.get('/admin/menu', isAdminPage, function(req, res) { res.render('admin-menu', { page: 'menu' }); });
  router.get('/admin/delivery', isAdminPage, function(req, res) { res.render('admin-delivery', { page: 'delivery' }); });
  router.get('/admin/reservations', isAdminPage, function(req, res) { res.render('admin-reservations', { page: 'reservations' }); });
  router.get('/admin/posts', isAdminPage, function(req, res) { res.render('admin-posts', { page: 'posts' }); });

  router.get('/api/admin/stats', isAdminApi, async function(req, res) {
    const safeCount = async function(sql) { try { const r = await db.get(sql); return (r && (r.c || r.count)) || 0; } catch(e) { return 0; } };
    res.json({
      userCount: await services.auth.getUserCount().catch(function(){ return 0; }),
      pushSubscriberCount: await services.push.getSubscriptionCount().catch(function(){ return 0; }),
      totalVisits: await safeCount('SELECT COUNT(*) AS c FROM site_visits'),
      recentVisits: await safeCount("SELECT COUNT(*) AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'")
    });
  });

  router.get('/api/admin/modules', isAdminApi, function(req, res) {
    res.json({
      modules: [
        {
          key: 'menu_items', label: 'Menu', icon: 'utensils',
          fields: [
            { name: 'name_fr', label: 'Nom (FR)', type: 'text', required: true, maxLength: 100, description: 'Nom du plat en français.', placeholder: 'ex. Poutine classique' },
            { name: 'name_en', label: 'Nom (EN)', type: 'text', required: false, maxLength: 100, description: 'Name in English (optional).', placeholder: 'e.g. Classic Poutine' },
            { name: 'description_fr', label: 'Description (FR)', type: 'textarea', description: 'Description courte en français (1-2 phrases).', placeholder: 'ex. Frites maison, fromage en grains du jour, sauce brune maison.' },
            { name: 'description_en', label: 'Description (EN)', type: 'textarea', description: 'English description (optional).', placeholder: 'e.g. House-cut fries, daily cheese curds, house gravy.' },
            { name: 'price', label: 'Prix ($ CAD)', type: 'number', required: true, min: 0, step: 0.01, description: 'Prix en dollars canadiens.', placeholder: '12.99' },
            { name: 'category', label: 'Catégorie', type: 'select', options: ['classique','signature','vegan','dessert'], description: 'Catégorie du menu (filtre sur la page Menu).' },
            { name: 'image_url', label: 'Photo du plat', type: 'image', description: 'Photo du plat. Recommandé: 800x600px (4:3).' },
            { name: 'position', label: "Ordre d'affichage", type: 'number', default: 0, description: 'Plus petit = en premier.', placeholder: '0' },
            { name: 'featured', label: 'À la une (accueil)', type: 'boolean', default: false, description: "Afficher sur la page d'accueil (max 6 plats à la une)." },
            { name: 'available', label: 'Disponible', type: 'boolean', default: true, description: 'Disponible à la commande. Décochez pour masquer.' }
          ]
        },
        {
          key: 'delivery_platforms', label: 'Plateformes de livraison', icon: 'truck',
          fields: [
            { name: 'name', label: 'Nom de la plateforme', type: 'text', required: true, description: 'Nom affiché de la plateforme.', placeholder: 'ex. Uber Eats' },
            { name: 'logo_url', label: 'Logo', type: 'image', description: 'Logo de la plateforme. Recommandé: carré 400x400px sur fond transparent ou blanc.' },
            { name: 'link_url', label: 'Lien vers la commande', type: 'url', required: true, description: 'Lien direct vers votre restaurant sur cette plateforme.', placeholder: 'https://www.ubereats.com/...' },
            { name: 'position', label: "Ordre d'affichage", type: 'number', default: 0, description: 'Plus petit = en premier.', placeholder: '0' },
            { name: 'active', label: 'Active', type: 'boolean', default: true, description: 'Afficher cette plateforme publiquement.' }
          ]
        },
        {
          key: 'reservations', label: 'Demandes de camion', icon: 'calendar',
          fields: [
            { name: 'contact_name', label: 'Nom du contact', type: 'text', required: true, description: 'Nom du contact.' },
            { name: 'contact_email', label: 'Courriel', type: 'email', required: true, description: 'Courriel du contact.' },
            { name: 'contact_phone', label: 'Téléphone', type: 'text', description: 'Téléphone du contact.' },
            { name: 'event_date', label: "Date de l'événement", type: 'date', required: true, description: "Date de l'événement." },
            { name: 'event_type', label: "Type d'événement", type: 'text', description: "Type d'événement.", placeholder: 'Mariage, Festival, Corpo...' },
            { name: 'location', label: 'Lieu', type: 'text', description: "Adresse ou lieu de l'événement." },
            { name: 'guests', label: "Nombre d'invités", type: 'number', min: 0, description: "Nombre d'invités estimé." },
            { name: 'message', label: 'Message client', type: 'textarea', description: 'Message ou détails fournis par le client.' },
            { name: 'status', label: 'Statut', type: 'select', options: ['pending','confirmed','declined','completed'], default: 'pending', description: 'Statut de la demande. Changez à "confirmed" une fois la réservation acceptée.' }
          ]
        },
        {
          key: 'posts', label: 'Nouvelles', icon: 'edit',
          fields: [
            { name: 'title', label: 'Titre', type: 'text', required: true, maxLength: 200, description: 'Titre de la nouvelle / publication.', placeholder: 'ex. Nouveau menu d\'automne!' },
            { name: 'content', label: 'Contenu', type: 'textarea', description: "Contenu en texte simple. Sera affiché sur la page d'accueil.", placeholder: 'Détails de votre annonce...' },
            { name: 'image_url', label: 'Image principale', type: 'image', description: 'Image principale. Recommandé: 1200x630px (16:9).' },
            { name: 'category', label: 'Catégorie', type: 'text', maxLength: 50, description: 'Catégorie / étiquette (ex. Événement, Menu, Annonce).', placeholder: 'ex. Événement' },
            { name: 'published', label: 'Publié', type: 'boolean', default: true, description: 'Visible publiquement. Décochez pour brouillon.' }
          ]
        }
      ]
    });
  });

  // Shared INSERT helper used by all admin POST routes
  function adminInsert(table, allowedFields, body) {
    const b = body || {};
    const cols = [], vals = [], phs = [];
    let i = 1;
    allowedFields.forEach(function(f) {
      if (b[f] !== undefined) {
        cols.push(f);
        vals.push(b[f] === '' ? null : b[f]);
        phs.push('$' + i);
        i++;
      }
    });
    if (!cols.length) return null;
    return {
      sql: 'INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + phs.join(',') + ') RETURNING id',
      vals: vals
    };
  }

  // Shared UPDATE helper used by all admin PUT routes
  function adminUpdate(table, allowedFields, body, id) {
    const b = body || {};
    const sets = [], vals = [];
    let i = 1;
    allowedFields.forEach(function(f) {
      if (b[f] !== undefined) {
        sets.push(f + ' = $' + i);
        vals.push(b[f] === '' ? null : b[f]);
        i++;
      }
    });
    if (!sets.length) return null;
    sets.push('updated_at = NOW()');
    vals.push(id);
    return {
      sql: 'UPDATE ' + table + ' SET ' + sets.join(', ') + ' WHERE id = $' + i,
      vals: vals
    };
  }

  // --- CRUD: menu_items ---
  router.get('/api/admin/menu_items', isAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM menu_items ORDER BY position ASC, id ASC');
      res.json({ menu_items: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/menu_items', isAdminApi, async function(req, res) {
    try {
      const q = adminInsert('menu_items', ['name_fr','name_en','description_fr','description_en','price','category','image_url','position','featured','available'], req.body);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM menu_items WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row, id: r.lastInsertRowid });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/menu_items/:id', isAdminApi, async function(req, res) {
    try {
      const q = adminUpdate('menu_items', ['name_fr','name_en','description_fr','description_en','price','category','image_url','position','featured','available'], req.body, req.params.id);
      if (!q) return res.status(400).json({ error: 'No fields' });
      await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM menu_items WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/menu_items/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM menu_items WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- CRUD: delivery_platforms ---
  router.get('/api/admin/delivery_platforms', isAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM delivery_platforms ORDER BY position ASC, id ASC');
      res.json({ delivery_platforms: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/delivery_platforms', isAdminApi, async function(req, res) {
    try {
      const q = adminInsert('delivery_platforms', ['name','logo_url','link_url','position','active'], req.body);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM delivery_platforms WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row, id: r.lastInsertRowid });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/delivery_platforms/:id', isAdminApi, async function(req, res) {
    try {
      const q = adminUpdate('delivery_platforms', ['name','logo_url','link_url','position','active'], req.body, req.params.id);
      if (!q) return res.status(400).json({ error: 'No fields' });
      await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM delivery_platforms WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/delivery_platforms/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM delivery_platforms WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- CRUD: reservations ---
  router.get('/api/admin/reservations', isAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM reservations ORDER BY event_date DESC, id DESC');
      res.json({ reservations: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/reservations', isAdminApi, async function(req, res) {
    try {
      const q = adminInsert('reservations', ['contact_name','contact_email','contact_phone','event_date','event_type','location','guests','message','status'], req.body);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM reservations WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row, id: r.lastInsertRowid });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/reservations/:id', isAdminApi, async function(req, res) {
    try {
      const q = adminUpdate('reservations', ['contact_name','contact_email','contact_phone','event_date','event_type','location','guests','message','status'], req.body, req.params.id);
      if (!q) return res.status(400).json({ error: 'No fields' });
      await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/reservations/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM reservations WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- CRUD: posts ---
  router.get('/api/admin/posts', isAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM posts ORDER BY created_at DESC, id DESC');
      res.json({ posts: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/posts', isAdminApi, async function(req, res) {
    try {
      const q = adminInsert('posts', ['title','content','image_url','category','published'], req.body);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM posts WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row, id: r.lastInsertRowid });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/posts/:id', isAdminApi, async function(req, res) {
    try {
      const q = adminUpdate('posts', ['title','content','image_url','category','published'], req.body, req.params.id);
      if (!q) return res.status(400).json({ error: 'No fields' });
      await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/posts/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/upload', isAdminApi, async function(req, res) {
    try {
      const dataUri = req.body && req.body.dataUri;
      if (!dataUri) return res.status(400).json({ error: 'Missing dataUri' });
      if (!services.cloudinary || !services.cloudinary.uploader) return res.status(503).json({ error: 'Upload service unavailable' });
      const result = await services.cloudinary.uploader.upload(dataUri, { folder: (services.config.slug || 'pwa') + '/admin' });
      res.json({ url: result.secure_url });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/settings', isAdminApi, async function(req, res) {
    try { const rows = await db.all('SELECT key, value FROM admin_settings'); const o = {}; rows.forEach(function(r){ o[r.key] = r.value; }); res.json({ settings: o }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/settings', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.key) return res.status(400).json({ error: 'Missing key' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [b.key, b.value == null ? '' : String(b.value)]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Catch-all: redirect unknown GET routes to PWA home (prevents "Cannot GET" errors)
  // Only matches GET requests — POST/PUT/DELETE API endpoints are unaffected

// ========== ADMIN BACKEND PAGE ROUTES (auto-injected fallback) ==========
function requireAdmin(req, res, next) {
  if (req.query.admin_token) {
    try {
      var jwt = require('jsonwebtoken');
      var payload = jwt.verify(req.query.admin_token, services.jwtSecret);
      if (payload.admin === true && payload.slug === 'poutinefest') {
        // Set self-verifying JWT cookie — works across all replicas without Redis
        try {
          var adminJwt = jwt.sign({ admin: true, slug: 'poutinefest', userId: payload.userId || 0 }, services.jwtSecret, { expiresIn: '24h' });
          res.cookie('pwa_admin_poutinefest', adminJwt, {
            httpOnly: true, secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000, path: '/'
          });
        } catch (cookieErr) { /* non-fatal */ }
        return res.redirect(req.tenantPath(req.path));
      }
    } catch (e) { /* invalid token */ }
  }
  if (services.admin && services.admin.isAdmin(req)) {
    req.adminUser = { role: 'owner' };
    return next();
  }
  return res.redirect(req.tenantPath('/admin/login'));
}

router.get('/admin', requireAdmin, async function(req, res) {
  try {
    var stats = {};
    try {
      var modules = await services.db.all("SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_type = 'BASE TABLE' AND table_name NOT IN ('admin_users','admin_invites','admin_webauthn_credentials','admin_settings','site_visits','users','push_subscriptions','webauthn_credentials','user_positions')");
      for (var m of modules) {
        try { var c = await services.db.get('SELECT COUNT(*) as c FROM ' + m.table_name); stats[m.table_name] = parseInt(c.c); } catch(e) {}
      }
    } catch(e) {}
    res.render('admin', { adminUser: req.adminUser, stats: stats });
  } catch(e) { res.render('admin', { adminUser: req.adminUser, stats: {} }); }
});
router.get('/admin/:module', requireAdmin, async function(req, res) {
  var mod = req.params.module;
  if (mod === 'login' || mod === 'logout' || mod === 'team' || mod === 'invite' || mod === 'activate') return;
  try { res.render('admin-' + mod, { adminUser: req.adminUser }); }
  catch(e) { res.status(404).send('Page not found'); }
});
// ========== END ADMIN BACKEND PAGE ROUTES ==========

  router.get('*', function(req, res, next) {
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
