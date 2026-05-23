module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  const T = {
    fr: {
      brand: 'Speedy Gonzales',
      tagline: 'Le service de courrier dont votre entreprise a besoin',
      nav_home: 'Accueil', nav_services: 'Services', nav_about: 'À propos', nav_contact: 'Contact',
      nav_signup: "S'inscrire", nav_login: 'Connexion', nav_dashboard: 'Tableau de bord',
      nav_new_delivery: 'Nouvelle livraison', nav_my_deliveries: 'Mes livraisons',
      nav_billing: 'Facturation', nav_pickup: 'Lieux de ramassage', nav_logout: 'Déconnexion',
      hero_title: 'Livraison rapide à Montréal et Laval',
      hero_subtitle: 'Service de courrier dédié aux entreprises. Express, jour même ou jour suivant.',
      hero_cta_signup: 'Ouvrir un compte gratuit', hero_cta_services: 'Voir nos tarifs',
      home_how_title: 'Comment ça marche', home_how_subtitle: 'Trois étapes simples pour expédier vos colis',
      step1_title: 'Ouvrez un compte', step1_text: 'Inscrivez votre entreprise. L\'approbation prend généralement moins de 24h.',
      step2_title: 'Soumettez vos livraisons', step2_text: 'Choisissez un lieu de ramassage, une destination et un niveau de service.',
      step3_title: 'Facturation mensuelle', step3_text: 'Aucun paiement en ligne — vous recevez une facture détaillée par mois.',
      home_services_title: 'Nos niveaux de service', home_services_subtitle: 'Choisissez la vitesse qui correspond à vos besoins',
      home_coverage_title: 'Zone desservie', home_coverage_subtitle: 'Nous couvrons l\'ensemble du Grand Montréal',
      home_news_title: 'Actualités', home_cta_title: 'Prêt à accélérer vos livraisons ?',
      home_cta_subtitle: 'Ouvrez un compte entreprise gratuitement aujourd\'hui.',
      services_title: 'Nos services et tarifs', services_subtitle: 'Tarifs basés sur la distance (km) et le niveau de service',
      services_base: 'Frais de base', services_per_km: 'Par kilomètre', services_cutoff: 'Heure limite de commande',
      services_note: 'Tous les tarifs sont en CAD avant taxes. Une distance forfaitaire basée sur le trajet routier est utilisée.',
      about_title: 'À propos de Speedy Gonzales', contact_title: 'Contactez-nous',
      contact_subtitle: 'Une question ? Une demande spéciale ? Nous sommes là pour aider.',
      contact_name: 'Nom', contact_email: 'Courriel', contact_phone: 'Téléphone',
      contact_subject: 'Sujet', contact_message: 'Message', contact_send: 'Envoyer le message',
      contact_success: 'Merci ! Votre message a été reçu.',
      signup_title: 'Inscription entreprise', signup_subtitle: 'Créez votre compte en quelques minutes. Approbation sous 24h.',
      signup_need_login: 'Vous devez d\'abord vous connecter pour créer un compte entreprise.',
      signup_business_name: 'Nom de l\'entreprise', signup_contact_name: 'Personne-ressource',
      signup_contact_email: 'Courriel professionnel', signup_contact_phone: 'Téléphone',
      signup_mailing_address: 'Adresse postale (pour la facturation)', signup_notes: 'Notes (optionnel)',
      signup_submit: 'Soumettre l\'inscription', signup_update: 'Mettre à jour mes informations',
      signup_pending: 'Votre demande est en attente d\'approbation. Nous vous contacterons sous peu.',
      signup_approved: 'Votre compte est approuvé ! Vous pouvez maintenant soumettre des livraisons.',
      signup_rejected: 'Votre demande a été refusée. Contactez-nous pour plus d\'informations.',
      signup_success: 'Inscription reçue ! Nous examinerons votre demande sous 24h.',
      dashboard_title: 'Tableau de bord', dashboard_welcome: 'Bonjour',
      stat_total_deliveries: 'Livraisons totales', stat_pending: 'En cours', stat_month_spend: 'Dépenses 30 derniers jours',
      recent_deliveries: 'Livraisons récentes', view_all: 'Tout voir',
      no_deliveries: 'Aucune livraison pour le moment.', start_delivery: 'Créer une livraison',
      pickup_locations_title: 'Lieux de ramassage', pickup_add: 'Ajouter un lieu',
      pickup_label: 'Étiquette (ex: Entrepôt principal)', pickup_address: 'Adresse complète',
      pickup_contact_name: 'Contact sur place', pickup_contact_phone: 'Téléphone',
      pickup_notes: 'Instructions (sonnette, code, etc.)', pickup_save: 'Enregistrer',
      pickup_delete: 'Supprimer', pickup_no_locations: 'Aucun lieu de ramassage enregistré.',
      pickup_confirm_delete: 'Supprimer ce lieu de ramassage ?',
      new_delivery_title: 'Nouvelle demande de livraison',
      new_delivery_pickup_section: 'Ramassage', new_delivery_destination_section: 'Destination',
      new_delivery_details_section: 'Détails', new_delivery_service_section: 'Niveau de service',
      new_delivery_pickup_choose: 'Choisir un lieu enregistré', new_delivery_pickup_new: 'ou entrer une nouvelle adresse',
      new_delivery_destination_address: 'Adresse de destination',
      new_delivery_recipient_name: 'Nom du destinataire', new_delivery_recipient_phone: 'Téléphone du destinataire',
      new_delivery_package: 'Description du colis', new_delivery_special_notes: 'Instructions spéciales',
      new_delivery_scheduled: 'Date et heure souhaitées (optionnel)', new_delivery_quote: 'Obtenir un devis',
      new_delivery_submit: 'Confirmer la livraison', new_delivery_quote_distance: 'Distance estimée',
      new_delivery_quote_price: 'Prix estimé', new_delivery_success: 'Livraison créée avec succès !',
      new_delivery_need_approved: 'Votre compte doit être approuvé pour soumettre des livraisons.',
      deliveries_title: 'Mes livraisons', deliveries_status: 'Statut', deliveries_date: 'Date',
      deliveries_from: 'De', deliveries_to: 'À', deliveries_service: 'Service', deliveries_price: 'Prix',
      status_pending: 'En attente', status_picked_up: 'Ramassé', status_in_transit: 'En transit',
      status_delivered: 'Livré', status_cancelled: 'Annulé',
      billing_title: 'Historique de facturation', billing_subtitle: 'Vos livraisons regroupées par mois',
      billing_total_spent: 'Total dépensé', billing_total_deliveries: 'Livraisons totales',
      billing_month: 'Mois', billing_count: 'Nb livraisons', billing_subtotal: 'Sous-total',
      billing_no_data: 'Aucune facturation pour le moment.',
      footer_about: 'À propos', footer_services: 'Services', footer_contact: 'Contact',
      footer_legal: 'Tous droits réservés.', back_home: 'Retour à l\'accueil',
      coming_soon: 'Bientôt disponible', save: 'Enregistrer', cancel: 'Annuler', edit: 'Modifier', "delete": 'Supprimer',
      address_placeholder: 'Commencez à taper une adresse...',
      view_details: 'Voir les détails', delivery_detail_title: 'Détails de la livraison',
      not_found: 'Non trouvé', back_to_list: 'Retour à la liste',
      need_login_msg: 'Veuillez vous connecter pour accéder à cette section.'
    },
    en: {
      brand: 'Speedy Gonzales',
      tagline: 'The courier service your business needs',
      nav_home: 'Home', nav_services: 'Services', nav_about: 'About', nav_contact: 'Contact',
      nav_signup: 'Sign Up', nav_login: 'Login', nav_dashboard: 'Dashboard',
      nav_new_delivery: 'New delivery', nav_my_deliveries: 'My deliveries',
      nav_billing: 'Billing', nav_pickup: 'Pickup locations', nav_logout: 'Logout',
      hero_title: 'Fast delivery across Montreal and Laval',
      hero_subtitle: 'Business courier service. Express, same day or next day.',
      hero_cta_signup: 'Open a free account', hero_cta_services: 'See our rates',
      home_how_title: 'How it works', home_how_subtitle: 'Three simple steps to ship your packages',
      step1_title: 'Open an account', step1_text: 'Register your business. Approval usually takes under 24 hours.',
      step2_title: 'Submit deliveries', step2_text: 'Pick a pickup location, a destination and a service level.',
      step3_title: 'Monthly billing', step3_text: 'No online payment — receive a detailed invoice every month.',
      home_services_title: 'Our service levels', home_services_subtitle: 'Choose the speed that fits your needs',
      home_coverage_title: 'Service area', home_coverage_subtitle: 'We cover all of Greater Montreal',
      home_news_title: 'News', home_cta_title: 'Ready to speed up your deliveries?',
      home_cta_subtitle: 'Open a free business account today.',
      services_title: 'Our services and rates', services_subtitle: 'Rates based on distance (km) and service level',
      services_base: 'Base fee', services_per_km: 'Per kilometer', services_cutoff: 'Order cut-off time',
      services_note: 'All rates are in CAD before tax. A flat road-route distance estimate is used.',
      about_title: 'About Speedy Gonzales', contact_title: 'Contact us',
      contact_subtitle: 'A question? A special request? We are here to help.',
      contact_name: 'Name', contact_email: 'Email', contact_phone: 'Phone',
      contact_subject: 'Subject', contact_message: 'Message', contact_send: 'Send message',
      contact_success: 'Thank you! Your message was received.',
      signup_title: 'Business sign-up', signup_subtitle: 'Create your account in minutes. Approval within 24 hours.',
      signup_need_login: 'Please log in first to create a business account.',
      signup_business_name: 'Business name', signup_contact_name: 'Contact person',
      signup_contact_email: 'Business email', signup_contact_phone: 'Phone',
      signup_mailing_address: 'Mailing address (for billing)', signup_notes: 'Notes (optional)',
      signup_submit: 'Submit registration', signup_update: 'Update my information',
      signup_pending: 'Your application is pending approval. We will contact you shortly.',
      signup_approved: 'Your account is approved! You can now submit deliveries.',
      signup_rejected: 'Your application was declined. Contact us for more information.',
      signup_success: 'Registration received! We will review within 24 hours.',
      dashboard_title: 'Dashboard', dashboard_welcome: 'Hello',
      stat_total_deliveries: 'Total deliveries', stat_pending: 'In progress', stat_month_spend: 'Last 30 days spending',
      recent_deliveries: 'Recent deliveries', view_all: 'View all',
      no_deliveries: 'No deliveries yet.', start_delivery: 'Create a delivery',
      pickup_locations_title: 'Pickup locations', pickup_add: 'Add a location',
      pickup_label: 'Label (e.g. Main warehouse)', pickup_address: 'Full address',
      pickup_contact_name: 'On-site contact', pickup_contact_phone: 'Phone',
      pickup_notes: 'Instructions (buzzer, code, etc.)', pickup_save: 'Save',
      pickup_delete: 'Delete', pickup_no_locations: 'No pickup locations registered.',
      pickup_confirm_delete: 'Delete this pickup location?',
      new_delivery_title: 'New delivery request',
      new_delivery_pickup_section: 'Pickup', new_delivery_destination_section: 'Destination',
      new_delivery_details_section: 'Details', new_delivery_service_section: 'Service level',
      new_delivery_pickup_choose: 'Choose a saved location', new_delivery_pickup_new: 'or enter a new address',
      new_delivery_destination_address: 'Destination address',
      new_delivery_recipient_name: 'Recipient name', new_delivery_recipient_phone: 'Recipient phone',
      new_delivery_package: 'Package description', new_delivery_special_notes: 'Special instructions',
      new_delivery_scheduled: 'Desired date and time (optional)', new_delivery_quote: 'Get a quote',
      new_delivery_submit: 'Confirm delivery', new_delivery_quote_distance: 'Estimated distance',
      new_delivery_quote_price: 'Estimated price', new_delivery_success: 'Delivery created successfully!',
      new_delivery_need_approved: 'Your account must be approved before submitting deliveries.',
      deliveries_title: 'My deliveries', deliveries_status: 'Status', deliveries_date: 'Date',
      deliveries_from: 'From', deliveries_to: 'To', deliveries_service: 'Service', deliveries_price: 'Price',
      status_pending: 'Pending', status_picked_up: 'Picked up', status_in_transit: 'In transit',
      status_delivered: 'Delivered', status_cancelled: 'Cancelled',
      billing_title: 'Billing history', billing_subtitle: 'Your deliveries grouped by month',
      billing_total_spent: 'Total spent', billing_total_deliveries: 'Total deliveries',
      billing_month: 'Month', billing_count: 'Deliveries', billing_subtotal: 'Subtotal',
      billing_no_data: 'No billing data yet.',
      footer_about: 'About', footer_services: 'Services', footer_contact: 'Contact',
      footer_legal: 'All rights reserved.', back_home: 'Back to home',
      coming_soon: 'Coming soon', save: 'Save', cancel: 'Cancel', edit: 'Edit', "delete": 'Delete',
      address_placeholder: 'Start typing an address...',
      view_details: 'View details', delivery_detail_title: 'Delivery details',
      not_found: 'Not found', back_to_list: 'Back to list',
      need_login_msg: 'Please log in to access this section.'
    }
  };

  function getLang(req) {
    var lang = req.query.lang || (req.cookies && req.cookies.pwa_lang);
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    return lang;
  }

  async function getSettings() {
    try {
      var rows = await db.all('SELECT key, value FROM admin_settings');
      var s = {};
      rows.forEach(function(r) { s[r.key] = r.value; });
      return s;
    } catch(e) { return {}; }
  }

  function applyTextOverrides(t, settings, lang) {
    for (var k in settings) {
      if (k.indexOf('text_') === 0 && k.lastIndexOf('_' + lang) === k.length - lang.length - 1) {
        var tKey = k.slice(5, -(lang.length + 1));
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  function formatPrice(n) {
    if (n == null || n === '') return '—';
    return Number(n).toFixed(2) + ' $';
  }
  function formatDate(d, lang) {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year:'numeric', month:'short', day:'numeric' }); } catch(e) { return String(d); }
  }
  function formatDateTime(d, lang) {
    if (!d) return '—';
    try { return new Date(d).toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA'); } catch(e) { return String(d); }
  }
  function statusLabel(s, t) {
    return t['status_' + (s || 'pending')] || s || '—';
  }
  function serviceLabel(sl, lang, ratesMap) {
    if (ratesMap && ratesMap[sl]) return lang === 'en' ? (ratesMap[sl].display_name_en || sl) : (ratesMap[sl].display_name_fr || sl);
    return sl;
  }

  async function renderCtx(req) {
    var lang = getLang(req);
    var settings = await getSettings();
    var t = applyTextOverrides(Object.assign({}, T[lang] || T.fr), settings, lang);
    var currentPath = req.path === '/' ? '' : req.path.replace(/^\//, '');
    return { lang, settings, t, formatPrice, formatDate, formatDateTime, statusLabel, serviceLabel, currentPath, googleApiKey: services.google.mapsApiKey };
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var toRad = function(d) { return d * Math.PI / 180; };
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)*Math.sin(dLng/2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  async function getBusinessByUserId(userId) {
    if (!userId) return null;
    try { return await db.get('SELECT * FROM businesses WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [userId]); }
    catch(e) { return null; }
  }

  async function getRatesMap() {
    var rows = await db.all('SELECT * FROM rates');
    var m = {};
    rows.forEach(function(r) { m[r.service_level] = r; });
    return m;
  }

  router.use(function(req, res, next) {
    if (req.query.lang === 'fr' || req.query.lang === 'en') {
      res.cookie('pwa_lang', req.query.lang, { maxAge: 365*24*60*60*1000, httpOnly: false });
    }
    next();
  });

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  router.get('/', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      var rates = await db.all('SELECT * FROM rates WHERE active = 1 ORDER BY base_price DESC');
      var posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      var business = req.user ? await getBusinessByUserId(req.user.id) : null;
      res.render('index', Object.assign(ctx, { user: req.user || null, business, rates, posts, title: ctx.t.brand }));
    } catch(err) {
      console.error('Home error:', err);
      res.status(500).send('Error loading page');
    }
  });

  router.get('/services', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      var rates = await db.all('SELECT * FROM rates WHERE active = 1 ORDER BY base_price DESC');
      res.render('services', Object.assign(ctx, { user: req.user || null, rates, title: ctx.t.services_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/a-propos', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      res.render('about', Object.assign(ctx, { user: req.user || null, title: ctx.t.about_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/contact', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      res.render('contact', Object.assign(ctx, { user: req.user || null, success: req.query.sent === '1', title: ctx.t.contact_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  router.post('/api/contact', async function(req, res) {
    try {
      var b = req.body || {};
      if (!b.name || !b.message) return res.status(400).json({ error: 'Missing fields' });
      await db.run('INSERT INTO form_submissions (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)', [b.name, b.email || '', b.phone || '', b.subject || '', b.message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouveau message Speedy Gonzales: ' + (b.subject || 'Contact'),
            html: '<h3>Nouveau message du site</h3><p><b>Nom:</b> ' + (b.name||'') + '</p><p><b>Courriel:</b> ' + (b.email||'') + '</p><p><b>Téléphone:</b> ' + (b.phone||'') + '</p><p><b>Sujet:</b> ' + (b.subject||'') + '</p><p><b>Message:</b><br>' + (b.message||'').replace(/\n/g,'<br>') + '</p>'
          });
        }
      } catch(e) { console.error('Contact email failed:', e.message); }
      res.json({ success: true });
    } catch(err) { console.error(err); res.status(500).json({ error: 'Submission failed' }); }
  });

  router.get('/inscription', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      var business = req.user ? await getBusinessByUserId(req.user.id) : null;
      res.render('inscription', Object.assign(ctx, { user: req.user || null, business, title: ctx.t.signup_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  router.post('/api/inscription', services.auth.requireAuth, async function(req, res) {
    try {
      var b = req.body || {};
      if (!b.business_name || !b.mailing_address) return res.status(400).json({ error: 'Champs requis manquants' });
      var existing = await getBusinessByUserId(req.user.id);
      if (existing) {
        await db.run('UPDATE businesses SET business_name=$1, contact_name=$2, contact_email=$3, contact_phone=$4, mailing_address=$5, notes=$6, updated_at=NOW() WHERE id=$7',
          [b.business_name, b.contact_name||'', b.contact_email||req.user.email||'', b.contact_phone||req.user.phone||'', b.mailing_address, b.notes||'', existing.id]);
        return res.json({ success: true, businessId: existing.id, status: existing.status });
      }
      var result = await db.run('INSERT INTO businesses (user_id, business_name, contact_name, contact_email, contact_phone, mailing_address, notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
        [req.user.id, b.business_name, b.contact_name||'', b.contact_email||req.user.email||'', b.contact_phone||req.user.phone||'', b.mailing_address, b.notes||'', 'pending']);
      try {
        if (services.config.contactEmail) {
          await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle inscription entreprise: ' + b.business_name,
            html: '<p>Nouvelle entreprise en attente d\'approbation:</p><p><b>' + b.business_name + '</b></p><p>Contact: ' + (b.contact_name||'') + '</p><p>Courriel: ' + (b.contact_email||'') + '</p><p>Téléphone: ' + (b.contact_phone||'') + '</p><p>Adresse: ' + (b.mailing_address||'') + '</p>' });
        }
      } catch(e) {}
      res.json({ success: true, businessId: result.lastInsertRowid, status: 'pending' });
    } catch(err) { console.error('Signup error:', err); res.status(500).json({ error: 'Erreur lors de l\'inscription' }); }
  });

  router.get('/tableau-bord', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      var business = req.user ? await getBusinessByUserId(req.user.id) : null;
      var stats = null;
      var recentDeliveries = [];
      var ratesMap = await getRatesMap();
      if (business && business.status === 'approved') {
        var totalDeliveries = await db.get('SELECT COUNT(*) as c FROM deliveries WHERE business_id = $1', [business.id]);
        var pending = await db.get("SELECT COUNT(*) as c FROM deliveries WHERE business_id = $1 AND status IN ('pending','picked_up','in_transit')", [business.id]);
        var monthSpend = await db.get("SELECT COALESCE(SUM(price),0) as t FROM deliveries WHERE business_id = $1 AND created_at > NOW() - INTERVAL '30 days' AND status != 'cancelled'", [business.id]);
        stats = { total: totalDeliveries.c, pending: pending.c, monthSpend: monthSpend.t };
        recentDeliveries = await db.all('SELECT * FROM deliveries WHERE business_id = $1 ORDER BY created_at DESC LIMIT 5', [business.id]);
      }
      res.render('dashboard', Object.assign(ctx, { user: req.user || null, business, stats, recentDeliveries, ratesMap, title: ctx.t.dashboard_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/lieux-ramassage', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      var business = req.user ? await getBusinessByUserId(req.user.id) : null;
      var locations = [];
      if (business && business.status === 'approved') {
        locations = await db.all('SELECT * FROM pickup_locations WHERE business_id = $1 ORDER BY id DESC', [business.id]);
      }
      res.render('pickup-locations', Object.assign(ctx, { user: req.user || null, business, locations, title: ctx.t.pickup_locations_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  router.post('/api/pickup-locations', services.auth.requireAuth, async function(req, res) {
    try {
      var business = await getBusinessByUserId(req.user.id);
      if (!business || business.status !== 'approved') return res.status(403).json({ error: 'Compte non approuvé' });
      var b = req.body || {};
      if (!b.label || !b.address) return res.status(400).json({ error: 'Champs requis' });
      var result = await db.run('INSERT INTO pickup_locations (business_id, label, address, lat, lng, contact_name, contact_phone, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
        [business.id, b.label, b.address, b.lat||null, b.lng||null, b.contact_name||'', b.contact_phone||'', b.notes||'']);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch(err) { console.error(err); res.status(500).json({ error: 'Erreur' }); }
  });

  router.delete('/api/pickup-locations/:id', services.auth.requireAuth, async function(req, res) {
    try {
      var business = await getBusinessByUserId(req.user.id);
      if (!business) return res.status(403).json({ error: 'Forbidden' });
      await db.run('DELETE FROM pickup_locations WHERE id = $1 AND business_id = $2', [req.params.id, business.id]);
      res.json({ success: true });
    } catch(err) { res.status(500).json({ error: 'Erreur' }); }
  });

  router.get('/nouvelle-livraison', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      var business = req.user ? await getBusinessByUserId(req.user.id) : null;
      var locations = [];
      var rates = await db.all('SELECT * FROM rates WHERE active = 1 ORDER BY base_price DESC');
      if (business && business.status === 'approved') {
        locations = await db.all('SELECT * FROM pickup_locations WHERE business_id = $1 ORDER BY label', [business.id]);
      }
      res.render('new-delivery', Object.assign(ctx, { user: req.user || null, business, locations, rates, title: ctx.t.new_delivery_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  router.post('/api/delivery-quote', services.auth.requireAuth, async function(req, res) {
    try {
      var b = req.body || {};
      if (!b.pickup_lat || !b.pickup_lng || !b.dest_lat || !b.dest_lng || !b.service_level) {
        return res.status(400).json({ error: 'Données manquantes' });
      }
      var distKm = haversineKm(parseFloat(b.pickup_lat), parseFloat(b.pickup_lng), parseFloat(b.dest_lat), parseFloat(b.dest_lng)) * 1.3;
      var rate = await db.get('SELECT * FROM rates WHERE service_level = $1 AND active = 1', [b.service_level]);
      if (!rate) return res.status(400).json({ error: 'Niveau de service invalide' });
      var price = parseFloat(rate.base_price) + parseFloat(rate.price_per_km) * distKm;
      res.json({ distance_km: Math.round(distKm * 100)/100, price: Math.round(price * 100)/100, base: rate.base_price, per_km: rate.price_per_km });
    } catch(err) { console.error(err); res.status(500).json({ error: 'Erreur de calcul' }); }
  });

  router.post('/api/deliveries', services.auth.requireAuth, async function(req, res) {
    try {
      var business = await getBusinessByUserId(req.user.id);
      if (!business) return res.status(403).json({ error: 'Compte requis' });
      if (business.status !== 'approved') return res.status(403).json({ error: 'Compte en attente d\'approbation' });
      var b = req.body || {};
      if (!b.pickup_address || !b.destination_address || !b.service_level) return res.status(400).json({ error: 'Champs requis manquants' });
      var distKm = parseFloat(b.distance_km) || 0;
      if (!distKm && b.pickup_lat && b.dest_lat) {
        distKm = haversineKm(parseFloat(b.pickup_lat), parseFloat(b.pickup_lng), parseFloat(b.dest_lat), parseFloat(b.dest_lng)) * 1.3;
      }
      var rate = await db.get('SELECT * FROM rates WHERE service_level = $1', [b.service_level]);
      var price = rate ? (parseFloat(rate.base_price) + parseFloat(rate.price_per_km) * distKm) : 0;
      var result = await db.run(
        'INSERT INTO deliveries (business_id, pickup_location_id, pickup_address, pickup_lat, pickup_lng, destination_address, destination_lat, destination_lng, recipient_name, recipient_phone, package_description, service_level, distance_km, price, status, notes, scheduled_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id',
        [business.id, b.pickup_location_id||null, b.pickup_address, b.pickup_lat||null, b.pickup_lng||null, b.destination_address, b.dest_lat||null, b.dest_lng||null, b.recipient_name||'', b.recipient_phone||'', b.package_description||'', b.service_level, distKm, price, 'pending', b.notes||'', b.scheduled_at||null]
      );
      try {
        if (services.config.contactEmail) {
          await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle livraison #' + result.lastInsertRowid + ' - ' + business.business_name,
            html: '<h3>Nouvelle demande de livraison</h3><p><b>Entreprise:</b> ' + business.business_name + '</p><p><b>De:</b> ' + b.pickup_address + '</p><p><b>À:</b> ' + b.destination_address + '</p><p><b>Service:</b> ' + b.service_level + '</p><p><b>Distance:</b> ' + distKm.toFixed(2) + ' km</p><p><b>Prix:</b> ' + price.toFixed(2) + ' $</p><p><b>Destinataire:</b> ' + (b.recipient_name||'') + ' (' + (b.recipient_phone||'') + ')</p><p><b>Colis:</b> ' + (b.package_description||'') + '</p>' });
        }
      } catch(e) { console.error('Email notification failed:', e.message); }
      res.json({ success: true, id: result.lastInsertRowid, price: Math.round(price*100)/100, distance: Math.round(distKm*100)/100 });
    } catch(err) { console.error('Create delivery error:', err); res.status(500).json({ error: 'Erreur lors de la création' }); }
  });

  router.get('/livraisons', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      var business = req.user ? await getBusinessByUserId(req.user.id) : null;
      var deliveries = [];
      var ratesMap = await getRatesMap();
      if (business) {
        deliveries = await db.all('SELECT * FROM deliveries WHERE business_id = $1 ORDER BY created_at DESC', [business.id]);
      }
      res.render('deliveries', Object.assign(ctx, { user: req.user || null, business, deliveries, ratesMap, title: ctx.t.deliveries_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/livraisons/:id', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      var business = req.user ? await getBusinessByUserId(req.user.id) : null;
      var delivery = null;
      var ratesMap = await getRatesMap();
      if (business) {
        delivery = await db.get('SELECT * FROM deliveries WHERE id = $1 AND business_id = $2', [req.params.id, business.id]);
      }
      res.render('delivery-detail', Object.assign(ctx, { user: req.user || null, business, delivery, ratesMap, title: ctx.t.delivery_detail_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  router.get('/facturation', services.auth.optionalAuth, async function(req, res) {
    try {
      var ctx = await renderCtx(req);
      var business = req.user ? await getBusinessByUserId(req.user.id) : null;
      var data = null;
      var ratesMap = await getRatesMap();
      if (business) {
        var deliveries = await db.all("SELECT * FROM deliveries WHERE business_id = $1 AND status != 'cancelled' ORDER BY created_at DESC", [business.id]);
        var byMonth = {};
        deliveries.forEach(function(d) {
          var dt = new Date(d.created_at);
          var key = dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0');
          if (!byMonth[key]) byMonth[key] = { month: key, count: 0, total: 0, deliveries: [] };
          byMonth[key].count++;
          byMonth[key].total += parseFloat(d.price || 0);
          byMonth[key].deliveries.push(d);
        });
        var months = Object.values(byMonth).sort(function(a,b) { return b.month.localeCompare(a.month); });
        var totalSpent = deliveries.reduce(function(s,d) { return s + parseFloat(d.price||0); }, 0);
        data = { months: months, totalSpent: totalSpent, totalDeliveries: deliveries.length };
      }
      res.render('billing', Object.assign(ctx, { user: req.user || null, business, data, ratesMap, title: ctx.t.billing_title }));
    } catch(err) { console.error(err); res.status(500).send('Error'); }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    next();
  }
  function requireAdminApi(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      var ctx = await renderCtx(req);
      var businessCount = await db.get('SELECT COUNT(*) as c FROM businesses');
      var pendingBusinessCount = await db.get("SELECT COUNT(*) as c FROM businesses WHERE status = 'pending'");
      var deliveryCount = await db.get('SELECT COUNT(*) as c FROM deliveries');
      var pendingDeliveryCount = await db.get("SELECT COUNT(*) as c FROM deliveries WHERE status = 'pending'");
      var revenue = await db.get("SELECT COALESCE(SUM(price),0) as t FROM deliveries WHERE created_at > NOW() - INTERVAL '30 days' AND status != 'cancelled'");
      var userCount = await services.auth.getUserCount();
      var pushCount = await services.push.getSubscriptionCount();
      var totalVisits = await db.get('SELECT COUNT(*) as c FROM site_visits');
      var recentVisits = await db.get("SELECT COUNT(*) as c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'");
      var recentDeliveries = await db.all('SELECT d.*, b.business_name FROM deliveries d LEFT JOIN businesses b ON b.id = d.business_id ORDER BY d.created_at DESC LIMIT 10');
      var pendingBusinesses = await db.all("SELECT * FROM businesses WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5");
      var recentSubmissions = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5');
      res.render('admin', Object.assign(ctx, {
        adminUser: { name: 'Admin' },
        stats: { businesses: businessCount.c, pendingBusinesses: pendingBusinessCount.c, deliveries: deliveryCount.c, pendingDeliveries: pendingDeliveryCount.c, revenue: revenue.t, users: userCount, push: pushCount, visits: totalVisits.c, recentVisits: recentVisits.c },
        recentDeliveries, pendingBusinessesList: pendingBusinesses, recentSubmissions
      }));
    } catch(err) { console.error('Admin dashboard error:', err); res.status(500).send('Admin error'); }
  });

  router.get('/admin/businesses', requireAdmin, async function(req, res) {
    var ctx = await renderCtx(req);
    res.render('admin-businesses', Object.assign(ctx, { adminUser: { name: 'Admin' } }));
  });
  router.get('/admin/deliveries', requireAdmin, async function(req, res) {
    var ctx = await renderCtx(req);
    res.render('admin-deliveries', Object.assign(ctx, { adminUser: { name: 'Admin' } }));
  });
  router.get('/admin/rates', requireAdmin, async function(req, res) {
    var ctx = await renderCtx(req);
    res.render('admin-rates', Object.assign(ctx, { adminUser: { name: 'Admin' } }));
  });
  router.get('/admin/pickup-locations', requireAdmin, async function(req, res) {
    var ctx = await renderCtx(req);
    res.render('admin-pickup-locations', Object.assign(ctx, { adminUser: { name: 'Admin' } }));
  });
  router.get('/admin/posts', requireAdmin, async function(req, res) {
    var ctx = await renderCtx(req);
    res.render('admin-posts', Object.assign(ctx, { adminUser: { name: 'Admin' } }));
  });
  router.get('/admin/submissions', requireAdmin, async function(req, res) {
    var ctx = await renderCtx(req);
    var subs = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
    res.render('admin-submissions', Object.assign(ctx, { adminUser: { name: 'Admin' }, submissions: subs }));
  });

  router.get('/api/admin/stats', requireAdminApi, async function(req, res) {
    try {
      var userCount = await services.auth.getUserCount();
      var pushCount = await services.push.getSubscriptionCount();
      var totalVisits = await db.get('SELECT COUNT(*) as c FROM site_visits');
      var recentVisits = await db.get("SELECT COUNT(*) as c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'");
      res.json({ userCount: userCount, pushSubscriberCount: pushCount, totalVisits: totalVisits.c, recentVisits: recentVisits.c });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/submissions', requireAdminApi, async function(req, res) {
    try {
      var subs = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 100');
      res.json({ submissions: subs });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/modules', requireAdminApi, function(req, res) {
    res.json({ modules: [
      { key: 'businesses', label: 'Entreprises', icon: 'briefcase', fields: [
        { name: 'business_name', type: 'text', required: true, description: 'Nom légal de l\'entreprise cliente.', placeholder: 'ex. Boulangerie Acme inc.' },
        { name: 'contact_name', type: 'text', description: 'Nom de la personne-ressource principale.', placeholder: 'ex. Marie Tremblay' },
        { name: 'contact_email', type: 'email', description: 'Courriel principal pour les notifications.', placeholder: 'contact@acme.com' },
        { name: 'contact_phone', type: 'text', description: 'Téléphone de l\'entreprise.', placeholder: '514-555-1234' },
        { name: 'mailing_address', type: 'textarea', description: 'Adresse postale utilisée pour la facturation mensuelle.', placeholder: '123 rue Principale, Montréal, QC H2X 1A1' },
        { name: 'status', type: 'select', options: ['pending','approved','rejected'], description: 'Statut du compte. Approuvez pour permettre les livraisons.', "default": 'pending' },
        { name: 'credit_limit', type: 'number', description: 'Limite de crédit en $ pour la facturation à terme.', min: 0, step: 100, "default": 1000, placeholder: '1000' },
        { name: 'notes', type: 'textarea', description: 'Notes internes — non visibles par le client.', placeholder: 'Conditions spéciales, contact alternatif...' }
      ]},
      { key: 'deliveries', label: 'Livraisons', icon: 'truck', fields: [
        { name: 'business_id', type: 'number', required: true, description: 'ID numérique de l\'entreprise cliente (visible dans la liste Entreprises).', placeholder: '1' },
        { name: 'pickup_address', type: 'text', required: true, description: 'Adresse complète de ramassage.', placeholder: '123 rue X, Montréal' },
        { name: 'destination_address', type: 'text', required: true, description: 'Adresse complète de destination.', placeholder: '456 rue Y, Laval' },
        { name: 'recipient_name', type: 'text', description: 'Nom du destinataire.', placeholder: 'ex. Jean Dupont' },
        { name: 'recipient_phone', type: 'text', description: 'Téléphone du destinataire pour avis de livraison.', placeholder: '438-555-1212' },
        { name: 'package_description', type: 'textarea', description: 'Description du contenu et instructions de manipulation.' },
        { name: 'service_level', type: 'select', options: ['express','same_day','next_day'], required: true, description: 'Niveau de service choisi.', "default": 'same_day' },
        { name: 'distance_km', type: 'number', step: 0.1, min: 0, description: 'Distance estimée en km.', placeholder: '12.5' },
        { name: 'price', type: 'number', step: 0.01, min: 0, description: 'Prix facturé en $ CAD.', placeholder: '35.00' },
        { name: 'status', type: 'select', options: ['pending','picked_up','in_transit','delivered','cancelled'], description: 'Statut actuel — met à jour ce que le client voit.', "default": 'pending' },
        { name: 'notes', type: 'textarea', description: 'Notes internes sur la livraison.' }
      ]},
      { key: 'rates', label: 'Tarifs', icon: 'dollar-sign', fields: [
        { name: 'service_level', type: 'select', options: ['express','same_day','next_day'], required: true, description: 'Identifiant interne du niveau de service. Doit être unique.' },
        { name: 'display_name_fr', type: 'text', description: 'Nom affiché en français sur la page Services.', placeholder: 'ex. Express' },
        { name: 'display_name_en', type: 'text', description: 'Nom affiché en anglais sur la page Services.', placeholder: 'e.g. Express' },
        { name: 'base_price', type: 'number', step: 0.01, min: 0, description: 'Frais fixe en $ avant kilométrage.', placeholder: '10.00' },
        { name: 'price_per_km', type: 'number', step: 0.01, min: 0, description: 'Prix par kilomètre en $.', placeholder: '2.50' },
        { name: 'cutoff_time', type: 'text', description: 'Heure limite (format 24h) pour les commandes ce jour. Ex: 11:00.', placeholder: '11:00' },
        { name: 'description_fr', type: 'textarea', description: 'Description courte en français pour la page des services.' },
        { name: 'description_en', type: 'textarea', description: 'Description courte en anglais.' },
        { name: 'active', type: 'boolean', "default": true, description: 'Décocher pour masquer ce niveau de service du public.' }
      ]},
      { key: 'pickup_locations', label: 'Lieux de ramassage', icon: 'map-pin', fields: [
        { name: 'business_id', type: 'number', required: true, description: 'ID de l\'entreprise propriétaire de ce lieu.', placeholder: '1' },
        { name: 'label', type: 'text', required: true, description: 'Étiquette interne du lieu (vue par le client lors de la sélection).', placeholder: 'ex. Entrepôt principal' },
        { name: 'address', type: 'text', required: true, description: 'Adresse complète du lieu de ramassage.' },
        { name: 'contact_name', type: 'text', description: 'Personne-ressource sur place.' },
        { name: 'contact_phone', type: 'text', description: 'Téléphone sur place.' },
        { name: 'notes', type: 'textarea', description: 'Instructions spéciales (sonnette, code de porte, etc.).' }
      ]},
      { key: 'posts', label: 'Actualités', icon: 'edit', fields: [
        { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre de l\'article affiché en page d\'accueil.', placeholder: 'ex. Nouveaux secteurs desservis' },
        { name: 'content', type: 'textarea', description: 'Corps de l\'article. Gardez les paragraphes courts.' },
        { name: 'image_url', type: 'image', description: 'Image vedette de l\'article (1200×630 recommandé).' },
        { name: 'category', type: 'text', description: 'Catégorie pour le regroupement (ex. Nouvelles, Annonces).', placeholder: 'Nouvelles' },
        { name: 'published', type: 'boolean', "default": true, description: 'Décocher pour sauvegarder en brouillon.' }
      ]},
      { key: 'form_submissions', label: 'Soumissions', icon: 'mail', fields: [
        { name: 'name', type: 'text', description: 'Nom de la personne ayant soumis le formulaire.' },
        { name: 'email', type: 'email', description: 'Adresse courriel du contact.' },
        { name: 'phone', type: 'text', description: 'Numéro de téléphone.' },
        { name: 'subject', type: 'text', description: 'Sujet du message.' },
        { name: 'message', type: 'textarea', description: 'Contenu du message.' }
      ]}
    ], settingsFields: [] });
  });


  // Admin CRUD routes — businesses
  router.get('/api/admin/businesses', requireAdminApi, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM businesses ORDER BY id DESC'); res.json({ businesses: rows }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/businesses', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; var result = await db.run('INSERT INTO businesses (business_name,contact_name,contact_email,contact_phone,mailing_address,status,credit_limit,notes,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',[b.business_name,b.contact_name||'',b.contact_email||'',b.contact_phone||'',b.mailing_address||'',b.status||'pending',b.credit_limit||1000,b.notes||'',b.image_url||null]); var row = await db.get('SELECT * FROM businesses WHERE id=$1',[result.lastInsertRowid]); res.json({ businesses: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/businesses/:id', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; await db.run('UPDATE businesses SET business_name=$1,contact_name=$2,contact_email=$3,contact_phone=$4,mailing_address=$5,status=$6,credit_limit=$7,notes=$8,image_url=$9,updated_at=NOW() WHERE id=$10',[b.business_name,b.contact_name,b.contact_email,b.contact_phone,b.mailing_address,b.status,b.credit_limit,b.notes,b.image_url,req.params.id]); var row = await db.get('SELECT * FROM businesses WHERE id=$1',[req.params.id]); res.json({ businesses: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/businesses/:id', requireAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM businesses WHERE id=$1',[req.params.id]); res.json({ success: true }); } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // Admin CRUD routes — deliveries
  router.get('/api/admin/deliveries', requireAdminApi, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM deliveries ORDER BY id DESC'); res.json({ deliveries: rows }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/deliveries', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; var result = await db.run('INSERT INTO deliveries (business_id,pickup_address,destination_address,recipient_name,recipient_phone,package_description,service_level,distance_km,price,status,notes,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id',[b.business_id,b.pickup_address||'',b.destination_address||'',b.recipient_name||'',b.recipient_phone||'',b.package_description||'',b.service_level||'same_day',b.distance_km||0,b.price||0,b.status||'pending',b.notes||'',b.image_url||null]); var row = await db.get('SELECT * FROM deliveries WHERE id=$1',[result.lastInsertRowid]); res.json({ deliveries: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/deliveries/:id', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; await db.run('UPDATE deliveries SET business_id=$1,pickup_address=$2,destination_address=$3,recipient_name=$4,recipient_phone=$5,package_description=$6,service_level=$7,distance_km=$8,price=$9,status=$10,notes=$11,image_url=$12,updated_at=NOW() WHERE id=$13',[b.business_id,b.pickup_address,b.destination_address,b.recipient_name,b.recipient_phone,b.package_description,b.service_level,b.distance_km,b.price,b.status,b.notes,b.image_url,req.params.id]); var row = await db.get('SELECT * FROM deliveries WHERE id=$1',[req.params.id]); res.json({ deliveries: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/deliveries/:id', requireAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM deliveries WHERE id=$1',[req.params.id]); res.json({ success: true }); } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // Admin CRUD routes — rates
  router.get('/api/admin/rates', requireAdminApi, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM rates ORDER BY id DESC'); res.json({ rates: rows }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/rates', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; var result = await db.run('INSERT INTO rates (service_level,display_name_fr,display_name_en,base_price,price_per_km,cutoff_time,description_fr,description_en,active,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id',[b.service_level,b.display_name_fr||'',b.display_name_en||'',b.base_price||10,b.price_per_km||2,b.cutoff_time||'',b.description_fr||'',b.description_en||'',b.active!=null?b.active:1,b.image_url||null]); var row = await db.get('SELECT * FROM rates WHERE id=$1',[result.lastInsertRowid]); res.json({ rates: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/rates/:id', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; await db.run('UPDATE rates SET service_level=$1,display_name_fr=$2,display_name_en=$3,base_price=$4,price_per_km=$5,cutoff_time=$6,description_fr=$7,description_en=$8,active=$9,image_url=$10,updated_at=NOW() WHERE id=$11',[b.service_level,b.display_name_fr,b.display_name_en,b.base_price,b.price_per_km,b.cutoff_time,b.description_fr,b.description_en,b.active,b.image_url,req.params.id]); var row = await db.get('SELECT * FROM rates WHERE id=$1',[req.params.id]); res.json({ rates: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/rates/:id', requireAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM rates WHERE id=$1',[req.params.id]); res.json({ success: true }); } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // Admin CRUD routes — pickup_locations
  router.get('/api/admin/pickup_locations', requireAdminApi, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM pickup_locations ORDER BY id DESC'); res.json({ pickup_locations: rows }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/pickup_locations', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; var result = await db.run('INSERT INTO pickup_locations (business_id,label,address,contact_name,contact_phone,notes,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',[b.business_id,b.label||'',b.address||'',b.contact_name||'',b.contact_phone||'',b.notes||'',b.image_url||null]); var row = await db.get('SELECT * FROM pickup_locations WHERE id=$1',[result.lastInsertRowid]); res.json({ pickup_locations: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/pickup_locations/:id', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; await db.run('UPDATE pickup_locations SET business_id=$1,label=$2,address=$3,contact_name=$4,contact_phone=$5,notes=$6,image_url=$7,updated_at=NOW() WHERE id=$8',[b.business_id,b.label,b.address,b.contact_name,b.contact_phone,b.notes,b.image_url,req.params.id]); var row = await db.get('SELECT * FROM pickup_locations WHERE id=$1',[req.params.id]); res.json({ pickup_locations: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/pickup_locations/:id', requireAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM pickup_locations WHERE id=$1',[req.params.id]); res.json({ success: true }); } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // Admin CRUD routes — posts
  router.get('/api/admin/posts', requireAdminApi, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM posts ORDER BY id DESC'); res.json({ posts: rows }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/posts', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; var result = await db.run('INSERT INTO posts (title,content,image_url,category,published) VALUES ($1,$2,$3,$4,$5) RETURNING id',[b.title||'',b.content||'',b.image_url||null,b.category||'',b.published!=null?b.published:1]); var row = await db.get('SELECT * FROM posts WHERE id=$1',[result.lastInsertRowid]); res.json({ posts: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; await db.run('UPDATE posts SET title=$1,content=$2,image_url=$3,category=$4,published=$5,updated_at=NOW() WHERE id=$6',[b.title,b.content,b.image_url,b.category,b.published,req.params.id]); var row = await db.get('SELECT * FROM posts WHERE id=$1',[req.params.id]); res.json({ posts: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]); res.json({ success: true }); } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // Admin CRUD routes — form_submissions
  router.get('/api/admin/form_submissions', requireAdminApi, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM form_submissions ORDER BY id DESC'); res.json({ form_submissions: rows }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/form_submissions', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; var result = await db.run('INSERT INTO form_submissions (name,email,phone,subject,message) VALUES ($1,$2,$3,$4,$5) RETURNING id',[b.name||'',b.email||'',b.phone||'',b.subject||'',b.message||'']); var row = await db.get('SELECT * FROM form_submissions WHERE id=$1',[result.lastInsertRowid]); res.json({ form_submissions: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/form_submissions/:id', requireAdminApi, async function(req, res) {
    try { var b = req.body||{}; await db.run('UPDATE form_submissions SET name=$1,email=$2,phone=$3,subject=$4,message=$5 WHERE id=$6',[b.name,b.email,b.phone,b.subject,b.message,req.params.id]); var row = await db.get('SELECT * FROM form_submissions WHERE id=$1',[req.params.id]); res.json({ form_submissions: row }); } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/form_submissions/:id', requireAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM form_submissions WHERE id=$1',[req.params.id]); res.json({ success: true }); } catch(err) { res.status(500).json({ error: err.message }); }
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