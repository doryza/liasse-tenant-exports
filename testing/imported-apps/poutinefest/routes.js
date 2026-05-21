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
      all_truck_cta: 'Recevoir le camion à votre événement',
      nav_offers: 'Offres',
      offers_title: 'Offres spéciales', offers_subtitle: 'Réservez votre offre, présentez votre code en restaurant.',
      offers_empty: 'Aucune offre active pour l\'instant. Revenez bientôt!',
      offer_starts: 'Commence le', offer_ends: 'Expire le',
      offer_remaining: 'restantes',
      offer_claim_btn: 'Réserver l\'offre',
      offer_login_to_claim: 'Connectez-vous pour réserver',
      offer_already_claimed: 'Déjà réservée',
      offer_sold_out: 'Épuisée',
      offer_upcoming: 'Bientôt disponible',
      offer_expired: 'Expirée',
      offer_max_per_user: 'Limite atteinte',
      offer_code_label: 'Votre code à présenter',
      offer_code_hint: 'Montrez ce code au comptoir avant l\'expiration.',
      offer_status_claimed: 'Réservée',
      offer_status_redeemed: 'Utilisée',
      offer_claim_success: 'Offre réservée! Présentez ce code en restaurant.',
      offer_claim_error: 'Impossible de réserver. Veuillez réessayer.',
      my_offers_title: 'Mes offres',
      no_my_offers: 'Vous n\'avez réservé aucune offre.'
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
      all_truck_cta: 'Bring the truck to your event',
      nav_offers: 'Offers',
      offers_title: 'Special offers', offers_subtitle: 'Reserve an offer, show your code in-store.',
      offers_empty: 'No active offers right now. Check back soon!',
      offer_starts: 'Starts', offer_ends: 'Expires',
      offer_remaining: 'left',
      offer_claim_btn: 'Reserve offer',
      offer_login_to_claim: 'Sign in to reserve',
      offer_already_claimed: 'Already reserved',
      offer_sold_out: 'Sold out',
      offer_upcoming: 'Coming soon',
      offer_expired: 'Expired',
      offer_max_per_user: 'Limit reached',
      offer_code_label: 'Your code to show',
      offer_code_hint: 'Show this code at the counter before it expires.',
      offer_status_claimed: 'Reserved',
      offer_status_redeemed: 'Used',
      offer_claim_success: 'Offer reserved! Show this code in-store.',
      offer_claim_error: 'Could not reserve. Please try again.',
      my_offers_title: 'My offers',
      no_my_offers: 'You haven\'t reserved any offers yet.'
    }
  };

  function formatPrice(p) { if (p == null || p === '') return ''; return Number(p).toFixed(2) + ' $'; }
  function formatDate(d, lang) { if (!d) return ''; try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year:'numeric', month:'long', day:'numeric'}); } catch(e) { return String(d); } }
  function formatDateTime(d, lang) { if (!d) return ''; try { return new Date(d).toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}); } catch(e) { return String(d); } }
  function pickLang(item, field, lang) { if (!item) return ''; return item[field + '_' + lang] || item[field + '_fr'] || item[field] || ''; }

  // Short-code generation: 8 chars, no ambiguous (0/O, 1/I/L, U/V)
  const SHORT_CODE_ALPHABET = 'BCDFGHJKMNPQRSTWXYZ23456789';
  function generateShortCode() {
    let s = '';
    for (let i = 0; i < 8; i++) s += SHORT_CODE_ALPHABET.charAt(Math.floor(Math.random() * SHORT_CODE_ALPHABET.length));
    return s;
  }
  function offerStatus(o, now) {
    now = now || new Date();
    if (!o || o.active == 0) return 'inactive';
    if (o.expires_at && new Date(o.expires_at) <= now) return 'expired';
    if (o.starts_at && new Date(o.starts_at) > now) return 'upcoming';
    return 'active';
  }

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

  router.get('/offres', services.auth.optionalAuth, async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const now = new Date();
      const offers = await db.all(
        "SELECT * FROM offers WHERE active = 1 AND expires_at > NOW() ORDER BY position ASC, expires_at ASC"
      ).catch(function(){ return []; });
      let claimsByOffer = {};
      let myClaims = [];
      if (req.user) {
        myClaims = await db.all(
          "SELECT c.*, o.title_fr, o.title_en, o.image_url, o.discount_label, o.expires_at " +
          "FROM offer_claims c JOIN offers o ON o.id = c.offer_id " +
          "WHERE c.user_id = $1 ORDER BY c.claimed_at DESC",
          [req.user.id]
        ).catch(function(){ return []; });
        myClaims.forEach(function(c){ if (!claimsByOffer[c.offer_id]) claimsByOffer[c.offer_id] = []; claimsByOffer[c.offer_id].push(c); });
      }
      // Annotate offers with display status
      offers.forEach(function(o){
        o._status = offerStatus(o, now);
        if (req.user) {
          const mine = claimsByOffer[o.id] || [];
          o._my_claim_count = mine.length;
          o._my_active_claim = mine.find(function(c){ return c.status === 'claimed'; }) || null;
        } else {
          o._my_claim_count = 0;
          o._my_active_claim = null;
        }
      });
      res.render('offres', Object.assign(ctx, { offers: offers, myClaims: myClaims, user: req.user || null, formatDateTime: formatDateTime }));
    } catch(e) { console.error('Offers page error:', e.message); res.status(500).send('Erreur'); }
  });

  router.post('/api/offers/:id/claim', services.auth.requireAuth, async function(req, res) {
    try {
      const offerId = parseInt(req.params.id);
      if (!offerId) return res.status(400).json({ error: 'invalid_offer' });
      const o = await db.get('SELECT * FROM offers WHERE id = $1', [offerId]);
      if (!o) return res.status(404).json({ error: 'not_found' });
      const status = offerStatus(o, new Date());
      if (status === 'inactive') return res.status(400).json({ error: 'inactive' });
      if (status === 'expired') return res.status(400).json({ error: 'expired' });
      if (status === 'upcoming') return res.status(400).json({ error: 'not_started' });

      const maxPerUser = o.max_per_user == null ? 1 : Number(o.max_per_user);
      if (maxPerUser > 0) {
        const userCount = await db.get('SELECT COUNT(*) AS c FROM offer_claims WHERE offer_id = $1 AND user_id = $2', [offerId, req.user.id]);
        if ((userCount && Number(userCount.c)) >= maxPerUser) return res.status(400).json({ error: 'max_per_user' });
      }
      if (o.max_claims != null && Number(o.max_claims) > 0) {
        const total = await db.get('SELECT COUNT(*) AS c FROM offer_claims WHERE offer_id = $1', [offerId]);
        if ((total && Number(total.c)) >= Number(o.max_claims)) return res.status(400).json({ error: 'sold_out' });
      }

      // Generate unique short code with retry on collision
      let code = null;
      for (let attempt = 0; attempt < 6; attempt++) {
        const candidate = generateShortCode();
        const exists = await db.get('SELECT 1 AS x FROM offer_claims WHERE short_code = $1', [candidate]);
        if (!exists) { code = candidate; break; }
      }
      if (!code) return res.status(500).json({ error: 'code_gen_failed' });

      const r = await db.run(
        'INSERT INTO offer_claims (offer_id, user_id, short_code, status) VALUES ($1,$2,$3,$4) RETURNING id',
        [offerId, req.user.id, code, 'claimed']
      );
      const claim = await db.get('SELECT * FROM offer_claims WHERE id = $1', [r.lastInsertRowid]);
      res.json({ success: true, claim: claim });
    } catch(e) {
      console.error('Claim error:', e.message);
      res.status(500).json({ error: 'server' });
    }
  });

  router.get('/api/offers/my-claims', services.auth.requireAuth, async function(req, res) {
    try {
      const rows = await db.all(
        "SELECT c.*, o.title_fr, o.title_en, o.image_url, o.discount_label, o.expires_at " +
        "FROM offer_claims c JOIN offers o ON o.id = c.offer_id " +
        "WHERE c.user_id = $1 ORDER BY c.claimed_at DESC",
        [req.user.id]
      );
      res.json({ claims: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
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
          key: 'offers', label: 'Offres', icon: 'tag',
          fields: [
            { name: 'title_fr', label: 'Titre (FR)', type: 'text', required: true, maxLength: 120, description: "Titre de l'offre en français.", placeholder: 'ex. 2 poutines pour 20$' },
            { name: 'title_en', label: 'Titre (EN)', type: 'text', maxLength: 120, description: 'Title in English (optional).', placeholder: 'e.g. 2 poutines for $20' },
            { name: 'description_fr', label: 'Description (FR)', type: 'textarea', description: 'Détails de l\'offre en français.', placeholder: 'ex. Valide sur toutes les poutines classiques.' },
            { name: 'description_en', label: 'Description (EN)', type: 'textarea', description: 'Details in English (optional).' },
            { name: 'discount_label', label: 'Étiquette de rabais', type: 'text', maxLength: 40, description: 'Affichée en grand sur la carte (ex. "-20%", "1 gratuit").', placeholder: 'ex. -20%' },
            { name: 'image_url', label: 'Image', type: 'image', description: 'Image de l\'offre. Recommandé: 1200x630px (16:9).' },
            { name: 'starts_at', label: 'Date de début', type: 'datetime', description: "Quand l'offre devient visible. Laissez vide pour activer immédiatement." },
            { name: 'expires_at', label: 'Date d\'expiration', type: 'datetime', required: true, description: "Après cette date, l'offre disparaît et les codes existants ne peuvent plus être utilisés." },
            { name: 'max_per_user', label: 'Limite par client', type: 'number', min: 0, default: 1, description: '0 = illimité. Par défaut: 1 réservation par client.' },
            { name: 'max_claims', label: 'Total maximum (optionnel)', type: 'number', min: 0, description: 'Plafond total de réservations toutes personnes confondues. Laissez vide pour illimité.' },
            { name: 'position', label: "Ordre d'affichage", type: 'number', default: 0, description: 'Plus petit = en premier.' },
            { name: 'active', label: 'Active', type: 'boolean', default: true, description: 'Décochez pour masquer sans supprimer.' }
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

  // --- CRUD: offers ---
  const OFFER_FIELDS = ['title_fr','title_en','description_fr','description_en','image_url','discount_label','starts_at','expires_at','max_claims','max_per_user','position','active'];
  router.get('/api/admin/offers', isAdminApi, async function(req, res) {
    try {
      const rows = await db.all(
        "SELECT o.*, " +
        "(SELECT COUNT(*) FROM offer_claims c WHERE c.offer_id = o.id) AS claim_count, " +
        "(SELECT COUNT(*) FROM offer_claims c WHERE c.offer_id = o.id AND c.status = 'redeemed') AS redeem_count " +
        "FROM offers o ORDER BY position ASC, id DESC"
      );
      res.json({ offers: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/offers', isAdminApi, async function(req, res) {
    try {
      const q = adminInsert('offers', OFFER_FIELDS, req.body);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM offers WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row, id: r.lastInsertRowid });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/offers/:id', isAdminApi, async function(req, res) {
    try {
      const q = adminUpdate('offers', OFFER_FIELDS, req.body, req.params.id);
      if (!q) return res.status(400).json({ error: 'No fields' });
      await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM offers WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/offers/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM offers WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin: offer_claims listing + redemption ---
  router.get('/api/admin/offer_claims', isAdminApi, async function(req, res) {
    try {
      const params = [];
      let where = '1=1';
      if (req.query.status) { params.push(req.query.status); where += ' AND c.status = $' + params.length; }
      if (req.query.code) { params.push(String(req.query.code).toUpperCase().trim()); where += ' AND c.short_code = $' + params.length; }
      if (req.query.offer_id) { params.push(parseInt(req.query.offer_id)); where += ' AND c.offer_id = $' + params.length; }
      const rows = await db.all(
        "SELECT c.*, o.title_fr, o.title_en, o.discount_label, o.expires_at AS offer_expires_at, o.active AS offer_active " +
        "FROM offer_claims c JOIN offers o ON o.id = c.offer_id " +
        "WHERE " + where + " ORDER BY c.claimed_at DESC LIMIT 200",
        params
      );
      // Enrich with user info (best effort)
      for (const row of rows) {
        try {
          const u = await services.auth.getUser(row.user_id);
          if (u) row._user = { display_name: u.display_name || null, email: u.email || null, phone: u.phone || null };
        } catch(e) { /* ignore */ }
      }
      res.json({ claims: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/offer_claims/lookup', isAdminApi, async function(req, res) {
    try {
      const code = (req.body && req.body.short_code ? String(req.body.short_code) : '').toUpperCase().trim();
      if (!code) return res.status(400).json({ error: 'missing_code' });
      const row = await db.get(
        "SELECT c.*, o.title_fr, o.title_en, o.discount_label, o.expires_at AS offer_expires_at, o.active AS offer_active " +
        "FROM offer_claims c JOIN offers o ON o.id = c.offer_id WHERE c.short_code = $1",
        [code]
      );
      if (!row) return res.status(404).json({ error: 'not_found' });
      try {
        const u = await services.auth.getUser(row.user_id);
        if (u) row._user = { display_name: u.display_name || null, email: u.email || null, phone: u.phone || null };
      } catch(e) { /* ignore */ }
      res.json({ claim: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/offer_claims/redeem', isAdminApi, async function(req, res) {
    try {
      const code = (req.body && req.body.short_code ? String(req.body.short_code) : '').toUpperCase().trim();
      if (!code) return res.status(400).json({ error: 'missing_code' });
      const claim = await db.get(
        "SELECT c.*, o.expires_at AS offer_expires_at, o.active AS offer_active, o.title_fr, o.title_en, o.discount_label " +
        "FROM offer_claims c JOIN offers o ON o.id = c.offer_id WHERE c.short_code = $1",
        [code]
      );
      if (!claim) return res.status(404).json({ error: 'not_found' });
      if (claim.status === 'redeemed') return res.status(409).json({ error: 'already_redeemed', claim: claim });
      if (claim.offer_active == 0) return res.status(400).json({ error: 'offer_inactive', claim: claim });
      if (claim.offer_expires_at && new Date(claim.offer_expires_at) <= new Date()) return res.status(400).json({ error: 'expired', claim: claim });

      const adminUserId = (req.adminUser && req.adminUser.id) || (services.admin.getAdminUserId ? services.admin.getAdminUserId(req) : null);
      await db.run(
        "UPDATE offer_claims SET status = 'redeemed', redeemed_at = NOW(), redeemed_by_user_id = $1 WHERE id = $2 AND status = 'claimed'",
        [adminUserId, claim.id]
      );
      const updated = await db.get('SELECT * FROM offer_claims WHERE id = $1', [claim.id]);
      res.json({ success: true, claim: Object.assign({}, claim, updated) });
    } catch(e) {
      console.error('Redeem error:', e.message);
      res.status(500).json({ error: e.message });
    }
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
