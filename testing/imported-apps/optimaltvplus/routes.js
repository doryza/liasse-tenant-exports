module.exports = function(services) {
  const express = require('express');
  const router = express.Router();

  const T = {
    fr: {
      site_title: 'Optimal TV Plus',
      nav_home: 'Accueil', nav_plans: 'Forfaits', nav_features: 'Fonctionnalités', nav_contact: 'Contact', nav_account: 'Mon compte', nav_login: 'Connexion', nav_logout: 'Déconnexion', nav_admin: 'Admin',
      hero_title: 'Streaming illimité en qualité Ultra HD',
      hero_subtitle: 'Plus de 10 000 chaînes en direct, films et séries à la demande. Disponible sur tous vos appareils.',
      hero_cta_primary: 'Voir les forfaits', hero_cta_secondary: 'Comment ça marche',
      badge_live: 'EN DIRECT', badge_4k: '4K ULTRA HD', badge_secure: 'PAIEMENT SÉCURISÉ',
      plans_heading: 'Choisissez votre forfait', plans_subheading: 'Des prix imbattables, des fonctionnalités inégalées',
      features_heading: 'Pourquoi Optimal TV Plus?', features_subheading: 'Une expérience premium qui change la donne',
      feat1_title: '10 000+ chaînes', feat1_desc: 'Sport, cinéma, divertissement, actualités et chaînes du monde entier.',
      feat2_title: 'Qualité 4K Ultra HD', feat2_desc: "Image cristalline avec support HDR sur les appareils compatibles.",
      feat3_title: 'Multi-appareils', feat3_desc: 'Smart TV, Android, iOS, Fire Stick, MAG, ordinateur — tout fonctionne.',
      feat4_title: 'Support 24/7', feat4_desc: "Notre équipe est disponible jour et nuit pour vous aider rapidement.",
      feat5_title: 'VOD illimité', feat5_desc: 'Des dizaines de milliers de films et séries à la demande.',
      feat6_title: 'Activation rapide', feat6_desc: "Vos identifiants sont prêts en moins de 30 minutes après paiement.",
      testimonials_heading: 'Ils nous font confiance', channels_heading: 'Une sélection de chaînes',
      channels_more: 'Et bien plus encore...',
      cta_subscribe: "S'abonner", cta_subscribe_now: "S'abonner maintenant", cta_choose_plan: 'Choisir ce forfait',
      cta_get_started: 'Commencer maintenant', cta_view_all: 'Voir tout',
      contact_heading: 'Contactez-nous', contact_subheading: 'Une question? Notre équipe vous répond rapidement.',
      form_name: 'Nom complet', form_email: 'Courriel', form_phone: 'Téléphone (optionnel)', form_subject: 'Sujet', form_message: 'Message',
      form_send: 'Envoyer le message', form_sending: 'Envoi en cours...', form_thanks: 'Merci! Votre message a été reçu. Nous vous répondrons sous 24h.',
      form_error: "Une erreur s'est produite. Réessayez ou écrivez-nous directement.",
      account_heading: 'Mon compte', account_welcome: 'Bienvenue',
      account_login_required: 'Connectez-vous pour accéder à votre espace membre, voir votre abonnement et vos identifiants IPTV.',
      account_my_sub: 'Mon abonnement actif', account_my_orders: 'Mes commandes', account_credentials: 'Mes identifiants IPTV',
      account_no_sub: 'Vous n\'avez aucun abonnement actif. Découvrez nos forfaits ci-dessous.',
      account_browse_plans: 'Voir les forfaits',
      cred_url: 'URL serveur (M3U/Xtream)', cred_user: "Nom d'utilisateur", cred_pass: 'Mot de passe', cred_copy: 'Copier', cred_copied: 'Copié!',
      cred_help: 'Utilisez ces identifiants dans votre application IPTV (IPTV Smarters, TiviMate, Perfect Player, etc.)',
      cred_server_main: 'Serveur Principal',
      cred_server_firstaru: 'Serveur Firstaru',
      cred_no_server: 'Aucun identifiant disponible pour ce serveur.',
      status_pending: 'En attente de paiement', status_paid: 'Payé', status_active: 'Actif', status_expired: 'Expiré', status_cancelled: 'Annulé', status_refunded: 'Remboursé', status_new: 'Nouveau', status_read: 'Lu', status_responded: 'Répondu', status_archived: 'Archivé',
      checkout_heading: 'Finalisation de votre abonnement', checkout_order_summary: 'Récapitulatif de la commande', checkout_plan: 'Forfait', checkout_duration: 'Durée', checkout_total: 'Total à payer', checkout_payment_method: 'Mode de paiement', checkout_etransfer: 'Virement Interac', checkout_confirm: 'Confirmer la commande', checkout_processing: 'Traitement...',
      checkout_intro: 'Vérifiez les détails de votre commande, puis confirmez pour recevoir les instructions de paiement.',
      thank_you_heading: 'Merci pour votre commande!', thank_you_subheading: 'Votre commande a été enregistrée avec succès.',
      thank_you_order_num: 'Numéro de commande', thank_you_amount: 'Montant',
      thank_you_payment_title: 'Instructions de paiement', thank_you_payment_email: 'Envoyer le paiement à', thank_you_payment_note: 'IMPORTANT: Inscrivez votre numéro de commande dans le message du virement.',
      thank_you_next_steps: "Une fois le paiement reçu, votre abonnement sera activé automatiquement et vos identifiants seront disponibles dans votre compte.",
      thank_you_view_account: 'Aller à mon compte',
      empty_no_plans: 'Aucun forfait disponible pour le moment.', empty_no_testimonials: 'Aucun témoignage pour le moment.', empty_no_orders: "Vous n'avez aucune commande pour le moment.", empty_no_posts: 'Aucun article pour le moment.', empty_no_channels: 'Aucune chaîne à afficher.',
      enable_notifs: 'Activer les notifications', enable_notifs_desc: 'Recevez les nouveautés, promotions et confirmations de paiement.',
      expires_on: 'Expire le', days: 'jours', per_period: 'pour {n} jours', valid_for: 'Valide pour {n} jours',
      features_label: 'Fonctionnalités incluses', view_details: 'Détails',
      footer_about: 'Optimal TV Plus est votre service IPTV premium offrant plus de 10 000 chaînes en qualité 4K Ultra HD sur tous vos appareils.',
      footer_quick_links: 'Liens rapides', footer_contact_us: 'Nous joindre', footer_rights: 'Tous droits réservés.', footer_legal: 'Les marques affichées appartiennent à leurs propriétaires respectifs.',
      categories: 'Catégories', back_home: "Retour à l'accueil", read_more: 'Lire la suite', published_on: 'Publié le',
      login_required_action: 'Veuillez vous connecter pour continuer.', login_btn: 'Se connecter',
      blog_heading: 'Actualités et guides', blog_subheading: 'Restez informé des dernières nouveautés'
    },
    en: {
      site_title: 'Optimal TV Plus',
      nav_home: 'Home', nav_plans: 'Plans', nav_features: 'Features', nav_contact: 'Contact', nav_account: 'My Account', nav_login: 'Sign In', nav_logout: 'Sign Out', nav_admin: 'Admin',
      hero_title: 'Unlimited streaming in Ultra HD quality',
      hero_subtitle: 'Over 10,000 live channels, movies and series on demand. Available on all your devices.',
      hero_cta_primary: 'View Plans', hero_cta_secondary: 'How it works',
      badge_live: 'LIVE', badge_4k: '4K ULTRA HD', badge_secure: 'SECURE PAYMENT',
      plans_heading: 'Choose your plan', plans_subheading: 'Unbeatable prices, unmatched features',
      features_heading: 'Why Optimal TV Plus?', features_subheading: 'A premium experience that changes the game',
      feat1_title: '10,000+ channels', feat1_desc: 'Sports, cinema, entertainment, news and channels from around the world.',
      feat2_title: '4K Ultra HD quality', feat2_desc: 'Crystal clear picture with HDR support on compatible devices.',
      feat3_title: 'Multi-device', feat3_desc: 'Smart TV, Android, iOS, Fire Stick, MAG, computer — everything works.',
      feat4_title: '24/7 Support', feat4_desc: 'Our team is available day and night to help you quickly.',
      feat5_title: 'Unlimited VOD', feat5_desc: 'Tens of thousands of movies and series on demand.',
      feat6_title: 'Fast activation', feat6_desc: 'Your credentials are ready in less than 30 minutes after payment.',
      testimonials_heading: 'They trust us', channels_heading: 'A selection of channels',
      channels_more: 'And much more...',
      cta_subscribe: 'Subscribe', cta_subscribe_now: 'Subscribe now', cta_choose_plan: 'Choose this plan',
      cta_get_started: 'Get started', cta_view_all: 'View all',
      contact_heading: 'Contact us', contact_subheading: 'A question? Our team responds quickly.',
      form_name: 'Full name', form_email: 'Email', form_phone: 'Phone (optional)', form_subject: 'Subject', form_message: 'Message',
      form_send: 'Send message', form_sending: 'Sending...', form_thanks: 'Thank you! Your message has been received. We will reply within 24h.',
      form_error: 'An error occurred. Try again or write to us directly.',
      account_heading: 'My Account', account_welcome: 'Welcome',
      account_login_required: 'Sign in to access your member area, view your subscription and IPTV credentials.',
      account_my_sub: 'My active subscription', account_my_orders: 'My orders', account_credentials: 'My IPTV credentials',
      account_no_sub: 'You have no active subscription. Discover our plans below.',
      account_browse_plans: 'View plans',
      cred_url: 'Server URL (M3U/Xtream)', cred_user: 'Username', cred_pass: 'Password', cred_copy: 'Copy', cred_copied: 'Copied!',
      cred_help: 'Use these credentials in your IPTV app (IPTV Smarters, TiviMate, Perfect Player, etc.)',
      cred_server_main: 'Main Server',
      cred_server_firstaru: 'Firstaru Server',
      cred_no_server: 'No credentials available for this server.',
      status_pending: 'Pending payment', status_paid: 'Paid', status_active: 'Active', status_expired: 'Expired', status_cancelled: 'Cancelled', status_refunded: 'Refunded', status_new: 'New', status_read: 'Read', status_responded: 'Responded', status_archived: 'Archived',
      checkout_heading: 'Complete your subscription', checkout_order_summary: 'Order summary', checkout_plan: 'Plan', checkout_duration: 'Duration', checkout_total: 'Total to pay', checkout_payment_method: 'Payment method', checkout_etransfer: 'Interac e-Transfer', checkout_confirm: 'Confirm order', checkout_processing: 'Processing...',
      checkout_intro: 'Review your order details, then confirm to receive payment instructions.',
      thank_you_heading: 'Thank you for your order!', thank_you_subheading: 'Your order has been successfully recorded.',
      thank_you_order_num: 'Order number', thank_you_amount: 'Amount',
      thank_you_payment_title: 'Payment instructions', thank_you_payment_email: 'Send payment to', thank_you_payment_note: 'IMPORTANT: Include your order number in the transfer message.',
      thank_you_next_steps: 'Once payment is received, your subscription will be activated automatically and your credentials will be available in your account.',
      thank_you_view_account: 'Go to my account',
      empty_no_plans: 'No plans available at the moment.', empty_no_testimonials: 'No testimonials yet.', empty_no_orders: 'You have no orders yet.', empty_no_posts: 'No posts yet.', empty_no_channels: 'No channels to display.',
      enable_notifs: 'Enable notifications', enable_notifs_desc: 'Receive news, promotions and payment confirmations.',
      expires_on: 'Expires on', days: 'days', per_period: 'for {n} days', valid_for: 'Valid for {n} days',
      features_label: 'Included features', view_details: 'Details',
      footer_about: 'Optimal TV Plus is your premium IPTV service offering over 10,000 channels in 4K Ultra HD quality on all your devices.',
      footer_quick_links: 'Quick links', footer_contact_us: 'Contact', footer_rights: 'All rights reserved.', footer_legal: 'Trademarks displayed belong to their respective owners.',
      categories: 'Categories', back_home: 'Back to home', read_more: 'Read more', published_on: 'Published on',
      login_required_action: 'Please sign in to continue.', login_btn: 'Sign in',
      blog_heading: 'News and guides', blog_subheading: 'Stay informed about the latest news'
    }
  };

  const MODULES = {
    plans: {
      label: 'Forfaits', icon: 'package',
      fields: [
        { name: 'name', type: 'text', required: true, maxLength: 100, description: 'Nom du forfait en français.', placeholder: 'Ex: Premium' },
        { name: 'name_en', type: 'text', maxLength: 100, description: 'Nom du forfait en anglais.', placeholder: 'Ex: Premium' },
        { name: 'description', type: 'textarea', description: 'Description courte (français).', placeholder: "L'expérience ultime." },
        { name: 'description_en', type: 'textarea', description: 'Description courte (anglais).', placeholder: 'The ultimate experience.' },
        { name: 'price_cents', type: 'number', min: 0, step: 1, required: true, description: 'Prix en cents canadiens. Ex: 1999 = 19,99 $. Ne pas inclure de virgule ni de symbole.', placeholder: '1999' },
        { name: 'duration_days', type: 'number', min: 1, default: 30, description: 'Durée de l\'abonnement en jours.', placeholder: '30' },
        { name: 'features', type: 'textarea', description: "Liste des fonctionnalités, une par ligne (français). Chaque ligne apparaîtra avec une coche verte.", placeholder: '10 000+ chaînes\n4K Ultra HD\n3 appareils' },
        { name: 'features_en', type: 'textarea', description: 'Liste des fonctionnalités, une par ligne (anglais).', placeholder: '10,000+ channels\n4K Ultra HD\n3 devices' },
        { name: 'image_url', type: 'image', description: 'Image illustrative du forfait. Recommandé: 800×600 carré ou paysage.' },
        { name: 'badge', type: 'text', maxLength: 30, description: "Badge affiché sur la carte (ex: POPULAIRE, VIP). Laisser vide si aucun badge.", placeholder: 'POPULAIRE' },
        { name: 'featured', type: 'boolean', description: 'Mettre en vedette - la carte sera mise en évidence.' },
        { name: 'sort_order', type: 'number', default: 0, description: "Ordre d'affichage. Plus petit = affiché en premier.", placeholder: '0' },
        { name: 'active', type: 'boolean', default: true, description: 'Décocher pour cacher le forfait du site public.' }
      ]
    },
    orders: {
      label: 'Commandes', icon: 'list',
      fields: [
        { name: 'customer_name', type: 'text', description: 'Nom du client.', placeholder: 'Jean Tremblay' },
        { name: 'customer_email', type: 'email', description: 'Adresse courriel du client.', placeholder: 'client@email.com' },
        { name: 'customer_phone', type: 'text', description: 'Numéro de téléphone (optionnel).', placeholder: '+1 514 555 1234' },
        { name: 'plan_id', type: 'number', description: "ID du forfait commandé. Voir l'onglet Forfaits pour les IDs.", placeholder: '1' },
        { name: 'amount_cents', type: 'number', min: 0, description: 'Montant total en cents.', placeholder: '1999' },
        { name: 'currency', type: 'text', maxLength: 3, description: 'Code devise ISO (CAD, USD, EUR).', placeholder: 'CAD' },
        { name: 'status', type: 'select', options: ['pending', 'paid', 'cancelled', 'refunded'], description: 'Statut de la commande. Passer à "paid" active automatiquement l\'abonnement du client.' },
        { name: 'payment_method', type: 'text', description: 'Méthode de paiement utilisée.', placeholder: 'Interac' },
        { name: 'payment_ref', type: 'text', description: 'Référence ou numéro de confirmation du paiement.', placeholder: 'ETXF-2024-001' },
        { name: 'notes', type: 'textarea', description: 'Notes internes (non visibles par le client).' }
      ]
    },
    subscriptions: {
      label: 'Abonnements', icon: 'users',
      fields: [
        { name: 'user_id', type: 'number', required: true, description: "ID de l'utilisateur propriétaire.", placeholder: '1' },
        { name: 'plan_id', type: 'number', description: "ID du forfait associé.", placeholder: '1' },
        { name: 'order_id', type: 'number', description: "ID de la commande d'origine (si applicable).", placeholder: '1' },
        { name: 'status', type: 'select', options: ['active', 'expired', 'cancelled'], description: 'Statut de l\'abonnement.' },
        { name: 'starts_at', type: 'datetime', description: "Date et heure de début de l'abonnement." },
        { name: 'expires_at', type: 'datetime', description: "Date et heure d'expiration. L'abonnement passera automatiquement en \"expired\" après cette date." },
        { name: 'm3u_url', type: 'text', description: "URL du serveur principal (M3U/Xtream) à fournir au client.", placeholder: 'http://serveur.com:8080/get.php?username=...&password=...&type=m3u_plus' },
        { name: 'credentials_username', type: 'text', description: "Nom d'utilisateur IPTV du client (serveur principal).", placeholder: 'user12345' },
        { name: 'credentials_password', type: 'text', description: 'Mot de passe IPTV du client (serveur principal).', placeholder: 'pass12345' },
        { name: 'firstaru_m3u_url', type: 'text', description: "URL du serveur Firstaru (M3U/Xtream) à fournir au client.", placeholder: 'http://firstaru.net:8080/get.php?username=...&password=...&type=m3u_plus' },
        { name: 'firstaru_credentials_username', type: 'text', description: "Nom d'utilisateur IPTV du client (serveur Firstaru).", placeholder: 'user12345' },
        { name: 'firstaru_credentials_password', type: 'text', description: 'Mot de passe IPTV du client (serveur Firstaru).', placeholder: 'pass12345' }
      ]
    },
    posts: {
      label: 'Articles', icon: 'edit',
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 200, description: "Titre de l'article affiché sur la page de blog.", placeholder: 'Nouveautés du mois' },
        { name: 'content', type: 'textarea', description: 'Contenu complet. Conservez des paragraphes courts pour la lisibilité mobile.', placeholder: "Rédigez l'article ici..." },
        { name: 'image_url', type: 'image', description: "Image vedette. Recommandé: 1200×630 paysage." },
        { name: 'category', type: 'text', maxLength: 50, description: 'Catégorie pour filtrer les articles (Nouveautés, Guides, Promotions).', placeholder: 'Nouveautés' },
        { name: 'published', type: 'boolean', default: true, description: 'Décocher pour sauvegarder comme brouillon - caché des visiteurs.' }
      ]
    },
    testimonials: {
      label: 'Témoignages', icon: 'star',
      fields: [
        { name: 'author', type: 'text', required: true, maxLength: 100, description: 'Nom du client (peut être abrégé).', placeholder: 'Marie L.' },
        { name: 'role', type: 'text', maxLength: 100, description: 'Ville/province ou rôle du client.', placeholder: 'Montréal, QC' },
        { name: 'content', type: 'textarea', required: true, description: 'Le témoignage en français.', placeholder: 'Excellent service, je recommande!' },
        { name: 'content_en', type: 'textarea', description: 'Le témoignage en anglais.', placeholder: 'Excellent service, I recommend!' },
        { name: 'rating', type: 'number', min: 1, max: 5, default: 5, description: 'Note sur 5 étoiles.', placeholder: '5' },
        { name: 'avatar_url', type: 'image', description: "Photo de profil du client. Format carré recommandé: 200×200." },
        { name: 'published', type: 'boolean', default: true, description: "Décocher pour cacher le témoignage du site public." }
      ]
    },
    channels: {
      label: 'Chaînes', icon: 'tv',
      fields: [
        { name: 'name', type: 'text', required: true, maxLength: 100, description: 'Nom de la chaîne TV.', placeholder: 'TVA Sports' },
        { name: 'category', type: 'text', maxLength: 50, description: 'Catégorie de la chaîne (Sport, Cinéma, Actualités, etc.).', placeholder: 'Sport' },
        { name: 'country', type: 'text', maxLength: 50, description: 'Pays d\'origine de la chaîne.', placeholder: 'Canada' },
        { name: 'logo_url', type: 'image', description: 'Logo officiel de la chaîne. Format carré recommandé.' },
        { name: 'featured', type: 'boolean', description: "Afficher cette chaîne dans la section vedette de la page d'accueil." }
      ]
    },
    submissions: {
      label: 'Messages', icon: 'mail',
      fields: [
        { name: 'name', type: 'text', readonly: true, description: 'Nom du visiteur (lecture seule).' },
        { name: 'email', type: 'text', readonly: true, description: 'Courriel du visiteur (lecture seule).' },
        { name: 'phone', type: 'text', readonly: true, description: 'Téléphone du visiteur.' },
        { name: 'subject', type: 'text', readonly: true, description: 'Sujet du message.' },
        { name: 'message', type: 'textarea', readonly: true, description: 'Message reçu.' },
        { name: 'status', type: 'select', options: ['new', 'read', 'responded', 'archived'], description: 'Statut du suivi.' }
      ]
    }
  };

  const SETTINGS_FIELDS = [
    { name: 'payment_etransfer_email', type: 'email', label: 'Courriel Interac', description: "Adresse courriel qui reçoit les virements Interac des clients. Sera affichée sur la page de confirmation après une commande." },
    { name: 'payment_instructions_fr', type: 'textarea', label: 'Instructions de paiement (FR)', description: 'Instructions affichées au client après confirmation de commande (en français).' },
    { name: 'payment_instructions_en', type: 'textarea', label: 'Payment instructions (EN)', description: 'Instructions shown to the customer after order confirmation (English).' }
  ];

  function formatPrice(cents, currency, lang) {
    cents = cents || 0;
    currency = currency || 'CAD';
    const v = (cents / 100).toFixed(2);
    if (lang === 'en') return '$' + v + ' ' + currency;
    return v.replace('.', ',') + ' $ ' + currency;
  }

  function formatDate(d, lang) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return ''; }
  }

  function formatDateTime(d, lang) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function statusLabel(status, t) {
    return t['status_' + status] || status;
  }

  async function getSettings() {
    const rows = await services.db.all('SELECT key, value FROM admin_settings');
    const s = {};
    for (const r of rows) s[r.key] = r.value;
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

  async function buildContext(req, extras) {
    const lang = req.lang || 'fr';
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[lang] || T.fr), settings, lang);
    return Object.assign({
      lang, t, settings,
      user: req.user || null,
      isAdmin: services.admin.isAdmin(req),
      slug: services.config.slug,
      displayName: services.config.displayName || 'Optimal TV Plus',
      contactEmail: services.config.contactEmail || null,
      contactPhone: services.config.contactPhone || null,
      businessName: services.config.businessName || services.config.displayName || 'Optimal TV Plus',
      formatPrice, formatDate, formatDateTime, statusLabel
    }, extras || {});
  }

  router.use(express.json({ limit: '10mb' }));

  router.use((req, res, next) => {
    const queryLang = req.query.lang;
    if (queryLang === 'fr' || queryLang === 'en') {
      req.lang = queryLang;
      try { res.cookie('pwa_lang', queryLang, { maxAge: 365 * 24 * 60 * 60 * 1000, path: '/' }); } catch (e) {}
    } else {
      const cookieLang = req.cookies && req.cookies.pwa_lang;
      req.lang = (cookieLang === 'en') ? 'en' : 'fr';
    }
    next();
  });

  router.use(async (req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      try { await services.db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch (e) {}
    }
    next();
  });

  function requireAdminPage(req, res, next) {
    if (!services.admin.isAdmin(req)) {
      const target = req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login';
      return res.redirect(target);
    }
    next();
  }

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  router.get('/', services.auth.optionalAuth, async (req, res) => {
    try {
      const ctx = await buildContext(req);
      const plans = await services.db.all("SELECT * FROM plans WHERE active = 1 ORDER BY sort_order, id LIMIT 4");
      const testimonials = await services.db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY id DESC LIMIT 6');
      const channels = await services.db.all('SELECT * FROM channels WHERE featured = 1 ORDER BY id LIMIT 12');
      const posts = await services.db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', Object.assign(ctx, { plans, testimonials, channels, posts }));
    } catch (e) {
      console.error('Home error:', e.message);
      res.status(500).send('Server error');
    }
  });

  router.get('/plans', services.auth.optionalAuth, async (req, res) => {
    try {
      const ctx = await buildContext(req);
      const plans = await services.db.all("SELECT * FROM plans WHERE active = 1 ORDER BY sort_order, id");
      res.render('plans', Object.assign(ctx, { plans }));
    } catch (e) {
      console.error('Plans error:', e.message);
      res.status(500).send('Server error');
    }
  });

  router.get('/features', services.auth.optionalAuth, async (req, res) => {
    try {
      const ctx = await buildContext(req);
      res.render('features', ctx);
    } catch (e) { res.status(500).send('Server error'); }
  });

  router.get('/contact', services.auth.optionalAuth, async (req, res) => {
    try {
      const ctx = await buildContext(req);
      res.render('contact', ctx);
    } catch (e) { res.status(500).send('Server error'); }
  });

  router.get('/post/:id', services.auth.optionalAuth, async (req, res) => {
    try {
      const ctx = await buildContext(req);
      const post = await services.db.get('SELECT * FROM posts WHERE id = $1 AND published = 1', [parseInt(req.params.id) || 0]);
      if (!post) return res.redirect('.');
      const related = await services.db.all('SELECT * FROM posts WHERE published = 1 AND id != $1 ORDER BY created_at DESC LIMIT 3', [post.id]);
      res.render('post', Object.assign(ctx, { post, related }));
    } catch (e) { res.status(500).send('Server error'); }
  });

  router.get('/account', services.auth.optionalAuth, async (req, res) => {
    try {
      const ctx = await buildContext(req);
      let subscription = null, orders = [];
      if (req.user) {
        subscription = await services.db.get("SELECT s.*, p.name AS plan_name, p.name_en AS plan_name_en FROM subscriptions s LEFT JOIN plans p ON s.plan_id = p.id WHERE s.user_id = $1 AND s.status = 'active' ORDER BY s.expires_at DESC LIMIT 1", [req.user.id]);
        orders = await services.db.all('SELECT o.*, p.name AS plan_name, p.name_en AS plan_name_en FROM orders o LEFT JOIN plans p ON o.plan_id = p.id WHERE o.user_id = $1 ORDER BY o.created_at DESC LIMIT 20', [req.user.id]);
      }
      res.render('account', Object.assign(ctx, { subscription, orders }));
    } catch (e) {
      console.error('Account error:', e.message);
      res.status(500).send('Server error');
    }
  });

  router.get('/checkout/:planId', services.auth.optionalAuth, async (req, res) => {
    try {
      const ctx = await buildContext(req);
      const plan = await services.db.get('SELECT * FROM plans WHERE id = $1 AND active = 1', [parseInt(req.params.planId) || 0]);
      if (!plan) return res.redirect('plans');
      res.render('checkout', Object.assign(ctx, { plan }));
    } catch (e) {
      console.error('Checkout error:', e.message);
      res.status(500).send('Server error');
    }
  });

  router.post('/api/checkout', services.auth.requireAuth, async (req, res) => {
    try {
      const { planId, customerName, customerPhone } = req.body || {};
      const pid = parseInt(planId) || 0;
      if (!pid) return res.status(400).json({ error: 'Missing plan' });
      const plan = await services.db.get('SELECT * FROM plans WHERE id = $1 AND active = 1', [pid]);
      if (!plan) return res.status(404).json({ error: 'Plan not found' });
      const user = req.user;
      const result = await services.db.run(
        "INSERT INTO orders (user_id, plan_id, customer_name, customer_email, customer_phone, amount_cents, currency, status, payment_method, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, 'CAD', 'pending', 'Interac', NOW(), NOW()) RETURNING id",
        [user.id, plan.id, (customerName || user.display_name || '').slice(0, 100), user.email || '', (customerPhone || user.phone || '').slice(0, 30), plan.price_cents]
      );
      const orderId = result.lastInsertRowid;
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouvelle commande #' + orderId + ' - ' + plan.name,
            html: '<h2>Nouvelle commande IPTV</h2><p><strong>Commande:</strong> #' + orderId + '</p><p><strong>Client:</strong> ' + (customerName || user.display_name || '') + ' (' + (user.email || '') + ')</p><p><strong>Téléphone:</strong> ' + (customerPhone || user.phone || '') + '</p><p><strong>Forfait:</strong> ' + plan.name + '</p><p><strong>Montant:</strong> ' + (plan.price_cents / 100).toFixed(2) + ' $ CAD</p><p>Connectez-vous au tableau de bord pour confirmer le paiement.</p>'
          });
        }
      } catch (e) { console.error('Email notify failed:', e.message); }
      res.json({ success: true, orderId });
    } catch (e) {
      console.error('Create order error:', e.message);
      res.status(500).json({ error: 'Order creation failed' });
    }
  });

  router.get('/thank-you/:orderId', services.auth.optionalAuth, async (req, res) => {
    try {
      const ctx = await buildContext(req);
      const order = await services.db.get('SELECT o.*, p.name AS plan_name, p.name_en AS plan_name_en FROM orders o LEFT JOIN plans p ON o.plan_id = p.id WHERE o.id = $1', [parseInt(req.params.orderId) || 0]);
      if (!order) return res.redirect('.');
      res.render('thank-you', Object.assign(ctx, { order }));
    } catch (e) { res.status(500).send('Server error'); }
  });

  router.post('/api/contact', async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body || {};
      if (!name || !message) return res.status(400).json({ error: 'Missing required fields' });
      await services.db.run(
        'INSERT INTO submissions (name, email, phone, subject, message, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [(name || '').slice(0, 100), (email || '').slice(0, 200), (phone || '').slice(0, 50), (subject || '').slice(0, 200), (message || '').slice(0, 5000), 'new']
      );
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouveau message: ' + (subject || 'Sans sujet'),
            html: '<h2>Nouveau message du site</h2><p><strong>De:</strong> ' + name + ' (' + (email || 'pas de courriel') + ')</p><p><strong>Téléphone:</strong> ' + (phone || 'N/A') + '</p><p><strong>Sujet:</strong> ' + (subject || 'Sans sujet') + '</p><p><strong>Message:</strong></p><p>' + (message || '').replace(/\n/g, '<br>') + '</p>'
          });
        }
      } catch (e) { console.error('Email failed:', e.message); }
      res.json({ success: true });
    } catch (e) {
      console.error('Contact error:', e.message);
      res.status(500).json({ error: 'Submission failed' });
    }
  });

  router.get('/admin', async (req, res) => {
    if (!services.admin.isAdmin(req)) {
      const target = req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login';
      return res.redirect(target);
    }
    try {
      const ctx = await buildContext(req);
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const visitsTotal = await services.db.get('SELECT COUNT(*)::int AS c FROM site_visits');
      const visits7 = await services.db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const orderStats = await services.db.get("SELECT COUNT(*) FILTER (WHERE status='pending')::int AS pending, COUNT(*) FILTER (WHERE status='paid')::int AS paid, COALESCE(SUM(amount_cents) FILTER (WHERE status='paid'), 0)::int AS revenue FROM orders");
      const activeSubs = await services.db.get("SELECT COUNT(*)::int AS c FROM subscriptions WHERE status = 'active'");
      const recentOrders = await services.db.all('SELECT o.*, p.name AS plan_name FROM orders o LEFT JOIN plans p ON o.plan_id = p.id ORDER BY o.created_at DESC LIMIT 10');
      const recentSubmissions = await services.db.all("SELECT * FROM submissions WHERE status = 'new' ORDER BY created_at DESC LIMIT 5");
      const stats = {
        userCount, pushCount,
        totalVisits: visitsTotal ? visitsTotal.c : 0,
        recentVisits: visits7 ? visits7.c : 0,
        pendingOrders: orderStats ? orderStats.pending : 0,
        paidOrders: orderStats ? orderStats.paid : 0,
        revenue: orderStats ? orderStats.revenue : 0,
        activeSubs: activeSubs ? activeSubs.c : 0
      };
      res.render('admin', Object.assign(ctx, { stats, recentOrders, recentSubmissions, currentPage: 'dashboard' }));
    } catch (e) {
      console.error('Admin dashboard error:', e.message);
      res.status(500).send('Server error');
    }
  });

  Object.keys(MODULES).forEach((moduleKey) => {
    router.get('/admin/' + moduleKey, requireAdminPage, async (req, res) => {
      try {
        const ctx = await buildContext(req);
        let items;
        try { items = await services.db.all('SELECT * FROM ' + moduleKey + ' ORDER BY id DESC'); } catch (e) { items = []; }
        const mod = MODULES[moduleKey];
        res.render('admin-' + moduleKey, Object.assign(ctx, {
          title: mod.label, moduleKey, moduleLabel: mod.label, fields: mod.fields, items, currentPage: moduleKey
        }));
      } catch (e) {
        console.error('Admin module error:', e.message);
        res.status(500).send('Server error');
      }
    });
  });

  router.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const visitsTotal = await services.db.get('SELECT COUNT(*)::int AS c FROM site_visits');
      const visits7 = await services.db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      res.json({
        userCount, pushSubscriberCount: pushCount,
        totalVisits: visitsTotal ? visitsTotal.c : 0,
        recentVisits: visits7 ? visits7.c : 0
      });
    } catch (e) { res.status(500).json({ error: 'Stats failed' }); }
  });

  router.get('/api/admin/modules', requireAdmin, (req, res) => {
    const modules = Object.entries(MODULES).map(([key, m]) => ({ key, label: m.label, icon: m.icon, fields: m.fields }));
    res.json({ modules, settingsFields: SETTINGS_FIELDS });
  });

  router.get('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const rows = await services.db.all('SELECT key, value FROM admin_settings');
      const settings = {};
      for (const r of rows) settings[r.key] = r.value;
      res.json({ settings });
    } catch (e) { res.status(500).json({ error: 'Failed' }); }
  });

  router.put('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await services.db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value || '']);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Save failed' }); }
  });

  router.post('/api/admin/upload', requireAdmin, async (req, res) => {
    try {
      const { dataUri, folder } = req.body || {};
      if (!dataUri) return res.status(400).json({ error: 'No image data' });
      if (!(services.cloudinary && services.cloudinary.uploader && typeof services.cloudinary.uploader.upload === 'function')) {
        return res.status(503).json({ error: 'Image upload service not configured' });
      }
      const result = await services.cloudinary.uploader.upload(dataUri, { folder: (services.config.slug || 'app') + '/' + (folder || 'general') });
      res.json({ url: result.secure_url, secure_url: result.secure_url });
    } catch (e) {
      console.error('Upload error:', e.message);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  Object.keys(MODULES).forEach((moduleKey) => {
    const fields = MODULES[moduleKey].fields;
    const allowedFields = fields.map(f => f.name);
    const booleanFields = fields.filter(f => f.type === 'boolean').map(f => f.name);
    const numberFields = fields.filter(f => f.type === 'number').map(f => f.name);

    router.get('/api/admin/' + moduleKey, requireAdmin, async (req, res) => {
      try {
        const rows = await services.db.all('SELECT * FROM ' + moduleKey + ' ORDER BY id DESC');
        res.json({ [moduleKey]: rows });
      } catch (e) { res.status(500).json({ error: 'Failed to fetch', detail: e.message }); }
    });

    router.post('/api/admin/' + moduleKey, requireAdmin, async (req, res) => {
      try {
        const body = req.body || {};
        const cols = [], vals = [], placeholders = [];
        let i = 1;
        for (const f of allowedFields) {
          if (body[f] === undefined) continue;
          let v = body[f];
          if (booleanFields.indexOf(f) >= 0) v = (v === true || v === 1 || v === '1' || v === 'true') ? 1 : 0;
          else if (numberFields.indexOf(f) >= 0) v = (v === '' || v === null) ? null : Number(v);
          cols.push(f); vals.push(v); placeholders.push('$' + i); i++;
        }
        if (cols.length === 0) return res.status(400).json({ error: 'No data' });
        const sql = 'INSERT INTO ' + moduleKey + ' (' + cols.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING *';
        const row = await services.db.get(sql, vals);
        res.json({ [moduleKey.replace(/s$/, '')]: row, item: row });
      } catch (e) {
        console.error('Create error:', e.message);
        res.status(500).json({ error: 'Create failed', detail: e.message });
      }
    });

    router.put('/api/admin/' + moduleKey + '/:id', requireAdmin, async (req, res) => {
      try {
        const id = parseInt(req.params.id) || 0;
        const body = req.body || {};
        const sets = [], vals = [];
        let i = 1;
        for (const f of allowedFields) {
          if (body[f] === undefined) continue;
          let v = body[f];
          if (booleanFields.indexOf(f) >= 0) v = (v === true || v === 1 || v === '1' || v === 'true') ? 1 : 0;
          else if (numberFields.indexOf(f) >= 0) v = (v === '' || v === null) ? null : Number(v);
          sets.push(f + ' = $' + i); vals.push(v); i++;
        }
        if (sets.length === 0) return res.status(400).json({ error: 'No data' });
        let updatedAtClause = '';
        try {
          const colCheck = await services.db.get("SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = 'updated_at'", [moduleKey]);
          if (colCheck) updatedAtClause = ', updated_at = NOW()';
        } catch (e) {}
        vals.push(id);
        const sql = 'UPDATE ' + moduleKey + ' SET ' + sets.join(', ') + updatedAtClause + ' WHERE id = $' + i + ' RETURNING *';
        const row = await services.db.get(sql, vals);
        if (!row) return res.status(404).json({ error: 'Not found' });
        if (moduleKey === 'orders' && row.status === 'paid' && row.user_id && row.plan_id) {
          try {
            const existing = await services.db.get('SELECT id FROM subscriptions WHERE order_id = $1', [row.id]);
            if (!existing) {
              const plan = await services.db.get('SELECT * FROM plans WHERE id = $1', [row.plan_id]);
              if (plan) {
                const days = plan.duration_days || 30;
                await services.db.run(
                  "INSERT INTO subscriptions (user_id, plan_id, order_id, status, starts_at, expires_at, created_at, updated_at) VALUES ($1, $2, $3, 'active', NOW(), NOW() + ($4 || ' days')::interval, NOW(), NOW())",
                  [row.user_id, row.plan_id, row.id, String(days)]
                );
                try {
                  await services.push.sendToUser(row.user_id, {
                    title: 'Abonnement activé !',
                    body: 'Votre abonnement ' + (plan.name || '') + ' est maintenant actif. Consultez votre compte pour vos identifiants.',
                    url: 'account'
                  });
                } catch (e) {}
              }
            }
          } catch (e) { console.error('Auto-subscription error:', e.message); }
        }
        res.json({ [moduleKey.replace(/s$/, '')]: row, item: row });
      } catch (e) {
        console.error('Update error:', e.message);
        res.status(500).json({ error: 'Update failed', detail: e.message });
      }
    });

    router.delete('/api/admin/' + moduleKey + '/:id', requireAdmin, async (req, res) => {
      try {
        const id = parseInt(req.params.id) || 0;
        await services.db.run('DELETE FROM ' + moduleKey + ' WHERE id = $1', [id]);
        res.json({ success: true });
      } catch (e) { res.status(500).json({ error: 'Delete failed' }); }
    });
  });

  // === voice-module-v1 START ===
  router.get('/voice-assistant', services.auth.optionalAuth, async function(req, res, next) {
    var tenantLocals = {};
    if (typeof prepareRender === 'function') {
      try { tenantLocals = await prepareRender(req, res, { pageTitle: 'Voice Assistant' }); } catch (_) {}
    } else if (typeof ctx === 'function') {
      try { tenantLocals = await ctx(req); } catch (_) {}
    } else if (typeof baseCtx === 'function') {
      try { tenantLocals = await baseCtx(req); } catch (_) {}
    } else if (typeof buildLocals === 'function') {
      try { tenantLocals = await buildLocals(req); } catch (_) {}
    } else if (typeof getSettings === 'function' && typeof T !== 'undefined') {
      try {
        var __vSettings = await getSettings();
        var __vLang = (req.lang === 'en' || req.lang === 'fr') ? req.lang : 'fr';
        var __vT = Object.assign({}, T[__vLang] || T.fr || {});
        if (typeof applyTextOverrides === 'function') {
          try { __vT = applyTextOverrides(__vT, __vSettings, __vLang); } catch (_) {}
        }
        tenantLocals = {
          lang: __vLang,
          t: __vT,
          settings: __vSettings,
          user: req.user || null,
          formatDate: function(d) { try { return new Date(d).toLocaleDateString(__vLang === 'en' ? 'en-CA' : 'fr-CA', { year:'numeric', month:'long', day:'numeric' }); } catch(e) { return ''; } },
        };
      } catch (_) {}
    }
    var voiceLocals = Object.assign({
      t: {},
      lang: 'fr',
      settings: {},
      currentPage: null,
      user: req.tenantUser || null,
      formatDate: function(d) { return d == null ? '' : String(d); },
    }, tenantLocals, {
      business: (services.config && services.config.business) || services.business || {},
      tenantUser: req.tenantUser || null,
      page: 'voice-assistant',
      pageTitle: 'Voice Assistant',
      active: 'voice-assistant',
    });
    res.render('voice-assistant', voiceLocals, function(err, html) {
      if (!err) return res.send(html);
      console.error('[voice-assistant render]', err && err.stack || err);
      var brand = (voiceLocals.business && voiceLocals.business.primaryColor)
        || (voiceLocals.settings && voiceLocals.settings.primary_color)
        || '#8b5cf6';
      var lng = (typeof voiceLocals.lang === 'string' && voiceLocals.lang === 'en') ? 'en' : 'fr';
      var Tfb = lng === 'en'
        ? { title: 'Voice Assistant', heading: 'Voice assistant is being set up', sub: 'Our voice assistant is currently being prepared. Please check back shortly.' }
        : { title: 'Assistant vocal', heading: "L'assistant vocal est en cours de configuration", sub: "Notre assistant vocal est en cours de préparation. Veuillez revenir sous peu." };
      var fallback = '<!DOCTYPE html><html lang="' + lng + '"><head><meta charset="utf-8">'
        + '<meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<title>' + Tfb.title + '</title>'
        + '<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f9fafb;color:#111827;'
        + 'min-height:100vh;display:flex;align-items:center;justify-content:center}'
        + '.va-wrap{max-width:32rem;padding:2.5rem 1.5rem;text-align:center}'
        + '.va-icon{width:4rem;height:4rem;margin:0 auto 1.5rem;border-radius:9999px;display:inline-flex;'
        + 'align-items:center;justify-content:center;color:#fff;background:' + brand + '}'
        + 'h1{font-size:1.5rem;letter-spacing:-.02em;margin:0 0 .75rem;color:#111827}'
        + 'p{color:#6b7280;margin:0;line-height:1.5}</style></head><body>'
        + '<main class="va-wrap"><div class="va-icon">'
        + '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>'
        + '</div><h1>' + Tfb.heading + '</h1><p>' + Tfb.sub + '</p></main></body></html>';
      res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(fallback);
      try { next(err); } catch (_) {}
    });
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
      await services.db.run(
        'INSERT INTO voice_submissions (user_id, fields, language, status, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [(req.tenantUser && req.tenantUser.id) || null, JSON.stringify(fields), 'both', 'new']
      );

      function vsEscapeHtml(s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      }
      function vsPrettyLabel(k) {
        return String(k).replace(/[_-]+/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
      }

      var rowsHtml = '';
      for (var fk in fields) {
        if (Object.prototype.hasOwnProperty.call(fields, fk)) {
          var fv = fields[fk];
          if (typeof fv !== 'string' || !fv.trim()) continue;
          rowsHtml += '<tr>'
            + '<td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;font-size:14px;width:35%;vertical-align:top">' + vsEscapeHtml(vsPrettyLabel(fk)) + '</td>'
            + '<td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;white-space:pre-wrap">' + vsEscapeHtml(fv.trim()) + '</td>'
            + '</tr>';
        }
      }
      if (!rowsHtml) {
        rowsHtml = '<tr><td colspan="2" style="padding:10px 14px;color:#9ca3af;font-size:14px;font-style:italic">(no fields submitted)</td></tr>';
      }

      var tenantName = (services.config && (services.config.businessName || services.config.displayName)) || 'this app';
      var brandColor = (services.config && services.config.business && services.config.business.primaryColor) || '#8b5cf6';
      var brandLogo = (services.config && services.config.business && services.config.business.logoUrl) || null;

      var visitorEmail = null;
      for (var vk in fields) {
        if (typeof fields[vk] === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[vk].trim())) {
          visitorEmail = fields[vk].trim();
          break;
        }
      }

      var leadEmail = '';
      if (leadEmail && services.email && services.email.send) {
        var leadReplyLine = visitorEmail
          ? '<p style="margin:0 0 18px 0;color:#374151;font-size:15px;line-height:1.55">A visitor just submitted your AI voice assistant form. Their details are below — reply directly to <a href="mailto:' + vsEscapeHtml(visitorEmail) + '" style="color:#7c3aed;text-decoration:none;font-weight:600">' + vsEscapeHtml(visitorEmail) + '</a> to follow up.</p>'
          : '<p style="margin:0 0 18px 0;color:#374151;font-size:15px;line-height:1.55">A visitor just submitted your AI voice assistant form. Their details are below.</p>';
        var leadHtml = ''
          + '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f3f4f6;padding:24px 12px">'
          + '<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 6px -1px rgba(0,0,0,0.06)">'
          + '<div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:22px 26px;color:#ffffff">'
          + '<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.85">Liasse · Voice Assistant</div>'
          + '<div style="font-size:20px;font-weight:700;margin-top:6px;letter-spacing:-0.01em">' + vsEscapeHtml(tenantName) + ' — new lead</div>'
          + '</div>'
          + '<div style="padding:24px 26px">'
          + leadReplyLine
          + '<table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">' + rowsHtml + '</table>'
          + '</div>'
          + '<div style="padding:14px 26px;border-top:1px solid #e5e7eb;background:#f9fafb;color:#6b7280;font-size:12px;line-height:1.4">Sent by your Liasse Voice Assistant module · <a href="https://liasse.tech" style="color:#7c3aed;text-decoration:none">liasse.tech</a></div>'
          + '</div>'
          + '</div>';
        try {
          await services.email.send({
            to: leadEmail,
            subject: '[' + tenantName + '] New voice submission' + (visitorEmail ? ' from ' + visitorEmail : ''),
            html: leadHtml,
          });
        } catch (_) { /* non-fatal */ }
      }

      if (visitorEmail && services.email && services.email.send) {
        var visitorNameVal = null;
        for (var nk in fields) {
          if (typeof fields[nk] === 'string' && /^(name|nom|fullname|full[_-]?name|firstname|first[_-]?name|prenom)$/i.test(nk)) {
            visitorNameVal = fields[nk].trim();
            break;
          }
        }
        var visitorHeaderInner = brandLogo
          ? '<img src="' + vsEscapeHtml(brandLogo) + '" alt="' + vsEscapeHtml(tenantName) + '" style="max-height:42px;max-width:180px;display:block;margin-bottom:8px"/>'
          : '<div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:4px;letter-spacing:-0.01em">' + vsEscapeHtml(tenantName) + '</div>';
        var greeting = visitorNameVal
          ? 'Hi ' + vsEscapeHtml(visitorNameVal) + ','
          : 'Hi there,';
        var visitorHtml = ''
          + '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f3f4f6;padding:24px 12px">'
          + '<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 6px -1px rgba(0,0,0,0.06)">'
          + '<div style="background:' + vsEscapeHtml(brandColor) + ';padding:22px 26px;color:#ffffff">'
          + visitorHeaderInner
          + '<div style="font-size:13px;opacity:0.92">Thanks — we got your request</div>'
          + '</div>'
          + '<div style="padding:24px 26px">'
          + '<p style="margin:0 0 14px 0;color:#111827;font-size:15px;line-height:1.55">' + greeting + '</p>'
          + '<p style="margin:0 0 18px 0;color:#374151;font-size:15px;line-height:1.55">Thanks for reaching out to <strong>' + vsEscapeHtml(tenantName) + '</strong>. We have received your request and will reply shortly. Here is a copy of what you sent us, for your records:</p>'
          + '<table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:18px">' + rowsHtml + '</table>'
          + '<p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5">— The ' + vsEscapeHtml(tenantName) + ' team</p>'
          + '</div>'
          + '<div style="padding:14px 26px;border-top:1px solid #e5e7eb;background:#f9fafb;color:#9ca3af;font-size:11px;line-height:1.4">This message was sent by ' + vsEscapeHtml(tenantName) + ' via <a href="https://liasse.tech" style="color:#9ca3af;text-decoration:none">Liasse Voice Assistant</a>.</div>'
          + '</div>'
          + '</div>';
        try {
          await services.email.send({
            to: visitorEmail,
            subject: 'Thanks — we received your request' + (tenantName !== 'this app' ? ' (' + tenantName + ')' : ''),
            html: visitorHtml,
          });
        } catch (_) { /* non-fatal */ }
      }

      res.json({ ok: true, visitorEmail: visitorEmail });
    } catch (err) {
      console.error('[voice-assistant submit]', err);
      res.status(500).json({ ok: false, error: 'submit_failed' });
    }
  });
  // === voice-module-v1 END ===

  router.use((req, res, next) => {
    if (req.path.startsWith('/admin/')) return next();
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.redirect('.');
  });

  return router;
};
