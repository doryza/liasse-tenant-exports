module.exports = function(services) {
  const router = require('express').Router();

  const T = {
    fr: {
      meta_desc: 'Pavage Diamand — pavage d’asphalte, nettoyage à pression et scellant dans les Laurentides. Soumission gratuite.',
      nav_home: 'Accueil', nav_gallery: 'Galerie', nav_pricing: 'Tarifs', nav_contact: 'Contact', nav_book: 'Rendez-vous',
      hero_eyebrow: 'Pavage · Nettoyage à pression · Scellant — Laurentides',
      hero_title: 'Un asphalte impeccable, fait pour durer',
      hero_sub: 'Pavage, nettoyage à pression et scellant d’asphalte pour les propriétaires des Laurentides. Travail robuste, résultats garantis.',
      cta_call: 'Appeler', cta_book: 'Prendre rendez-vous',
      stat1_n: '15+', stat1_l: 'Années sur le terrain', stat2_n: '500+', stat2_l: 'Entrées réalisées', stat3_n: '100 %', stat3_l: 'Soumissions gratuites',
      sec_services_title: 'Nos services', sec_services_sub: 'Trois spécialités, un seul standard : du travail solide.',
      svc_cta: 'Demander une soumission',
      sec_process_title: 'Notre méthode', sec_process_sub: 'Quatre étapes, zéro surprise.',
      p1_t: 'Évaluation sur place', p1_d: 'On se déplace gratuitement, on mesure la surface et on vous remet une soumission claire, sans frais cachés.',
      p2_t: 'Préparation de la surface', p2_d: 'Nettoyage haute pression, colmatage des fissures et correction des zones faibles avant tout travail.',
      p3_t: 'Application', p3_d: 'Pavage compacté à la machine ou scellant de calibre commercial appliqué uniformément, selon le projet.',
      p4_t: 'Inspection finale', p4_d: 'On vérifie chaque détail avec vous et on vous explique comment entretenir votre surface.',
      sec_team_title: 'L’équipe', sec_team_sub: 'Des gars de terrain, fiers de leur ouvrage.',
      team_caption: 'L’équipe Diamand sur un chantier dans les Laurentides',
      empty_team: 'L’équipe sera présentée bientôt.',
      sec_gallery_title: 'Réalisations récentes', sec_gallery_sub: 'Des résultats qui parlent d’eux-mêmes.',
      view_gallery: 'Voir toute la galerie',
      gallery_title: 'Galerie de réalisations', gallery_sub: 'Pavage, nettoyage et scellant — avant, pendant, après.', gallery_all: 'Tous', gallery_empty: 'Les photos de nos chantiers arrivent bientôt.',
      empty_services: 'Nos services seront affichés ici sous peu.',
      pricing_title: 'Tarifs et forfaits', pricing_sub: 'Des prix clairs, des forfaits simples. Chaque projet reçoit une soumission détaillée.',
      pricing_popular: 'Populaire',
      pricing_note: 'Les prix affichés sont indicatifs et varient selon la superficie et l’état de la surface. La soumission sur place est toujours gratuite.',
      pricing_cta: 'Réserver mon évaluation gratuite',
      pricing_empty: 'Nos forfaits seront publiés sous peu. Appelez-nous pour une soumission.',
      book_title: 'Prendre rendez-vous', book_sub: 'Remplissez le formulaire — on vous rappelle dans les 24 h ouvrables.',
      f_name: 'Nom complet', f_name_ph: 'ex. Jean Tremblay', f_phone: 'Téléphone', f_phone_ph: 'ex. 450 555-1234', f_email: 'Courriel (optionnel)', f_email_ph: 'vous@exemple.com',
      f_service: 'Service souhaité', f_service_ph: 'Choisir un service', f_other: 'Autre / je ne sais pas', f_date: 'Date souhaitée',
      f_message: 'Détails du projet', f_message_ph: 'ex. Entrée double d’environ 1 200 pi², fissures visibles…',
      f_send: 'Envoyer ma demande',
      book_success: 'Demande reçue ! On vous rappelle rapidement pour confirmer votre rendez-vous.',
      book_error: 'Une erreur est survenue. Vérifiez votre nom et votre téléphone, puis réessayez.',
      book_note: 'Vos informations restent confidentielles et servent uniquement à vous rappeler.',
      contact_title: 'Coordonnées', contact_sub: 'Une question ? Appelez-nous ou écrivez-nous.',
      c_phone: 'Téléphone', c_email: 'Courriel', c_address: 'Adresse', c_hours: 'Heures', c_area: 'Zone desservie',
      contact_form_title: 'Écrivez-nous',
      contact_success: 'Message envoyé ! On vous répond rapidement.', contact_error: 'Une erreur est survenue. Réessayez.',
      footer_tagline: 'Pavage, nettoyage à pression et scellant d’asphalte.', footer_region: 'Fièrement au service des Laurentides',
      footer_nav: 'Navigation', footer_contact: 'Coordonnées', footer_push: 'Restez informé',
      footer_push_text: 'Recevez nos rappels saisonniers : scellant au printemps, préparation pour l’hiver.', footer_push_btn: 'Activer les notifications',
      footer_rights: 'Tous droits réservés.',
      cta_band_title: 'Prêt à redonner du chien à votre entrée ?', cta_band_sub: 'Soumission gratuite, sans engagement, partout dans les Laurentides.'
    },
    en: {
      meta_desc: 'Pavage Diamand — asphalt paving, pressure washing and sealing in the Laurentides. Free quotes.',
      nav_home: 'Home', nav_gallery: 'Gallery', nav_pricing: 'Pricing', nav_contact: 'Contact', nav_book: 'Book now',
      hero_eyebrow: 'Paving · Pressure washing · Sealing — Laurentides',
      hero_title: 'Flawless asphalt, built to last',
      hero_sub: 'Asphalt paving, pressure washing and sealing for homeowners across the Laurentides. Rugged work, guaranteed results.',
      cta_call: 'Call us', cta_book: 'Book an appointment',
      stat1_n: '15+', stat1_l: 'Years in the field', stat2_n: '500+', stat2_l: 'Driveways completed', stat3_n: '100%', stat3_l: 'Free on-site quotes',
      sec_services_title: 'Our services', sec_services_sub: 'Three specialties, one standard: solid work.',
      svc_cta: 'Request a quote',
      sec_process_title: 'Our process', sec_process_sub: 'Four steps, zero surprises.',
      p1_t: 'On-site assessment', p1_d: 'We come to you free of charge, measure the surface and hand you a clear quote with no hidden fees.',
      p2_t: 'Surface preparation', p2_d: 'High-pressure cleaning, crack filling and repair of weak areas before any work begins.',
      p3_t: 'Application', p3_d: 'Machine-compacted paving or commercial-grade sealant applied evenly, depending on the project.',
      p4_t: 'Final inspection', p4_d: 'We walk through every detail with you and explain how to maintain your new surface.',
      sec_team_title: 'The team', sec_team_sub: 'Field crew, proud of their work.',
      team_caption: 'The Diamand crew on a job site in the Laurentides',
      empty_team: 'Team profiles coming soon.',
      sec_gallery_title: 'Recent work', sec_gallery_sub: 'Results that speak for themselves.',
      view_gallery: 'View the full gallery',
      gallery_title: 'Project gallery', gallery_sub: 'Paving, washing and sealing — before, during, after.', gallery_all: 'All', gallery_empty: 'Job-site photos are coming soon.',
      empty_services: 'Our services will be listed here shortly.',
      pricing_title: 'Pricing & packages', pricing_sub: 'Clear prices, simple packages. Every project gets a detailed quote.',
      pricing_popular: 'Popular',
      pricing_note: 'Listed prices are indicative and vary with surface area and condition. The on-site quote is always free.',
      pricing_cta: 'Book my free assessment',
      pricing_empty: 'Our packages will be published shortly. Call us for a quote.',
      book_title: 'Book an appointment', book_sub: 'Fill out the form — we call you back within one business day.',
      f_name: 'Full name', f_name_ph: 'e.g. John Smith', f_phone: 'Phone', f_phone_ph: 'e.g. 450 555-1234', f_email: 'Email (optional)', f_email_ph: 'you@example.com',
      f_service: 'Requested service', f_service_ph: 'Choose a service', f_other: 'Other / not sure', f_date: 'Preferred date',
      f_message: 'Project details', f_message_ph: 'e.g. Double driveway around 1,200 sq ft, visible cracks…',
      f_send: 'Send my request',
      book_success: 'Request received! We will call you back shortly to confirm your appointment.',
      book_error: 'Something went wrong. Check your name and phone number, then try again.',
      book_note: 'Your information stays confidential and is only used to call you back.',
      contact_title: 'Contact', contact_sub: 'A question? Call us or write to us.',
      c_phone: 'Phone', c_email: 'Email', c_address: 'Address', c_hours: 'Hours', c_area: 'Service area',
      contact_form_title: 'Write to us',
      contact_success: 'Message sent! We will get back to you quickly.', contact_error: 'Something went wrong. Please try again.',
      footer_tagline: 'Asphalt paving, pressure washing and sealing.', footer_region: 'Proudly serving the Laurentides',
      footer_nav: 'Navigation', footer_contact: 'Contact', footer_push: 'Stay in the loop',
      footer_push_text: 'Get our seasonal reminders: spring sealing, winter prep.', footer_push_btn: 'Enable notifications',
      footer_rights: 'All rights reserved.',
      cta_band_title: 'Ready to bring your driveway back to life?', cta_band_sub: 'Free, no-obligation quote anywhere in the Laurentides.'
    }
  };

  const MODULES = {
    bookings: { label: 'Rendez-vous', icon: 'calendar', fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true, maxLength: 120, description: 'Nom du client tel que soumis dans le formulaire', placeholder: 'ex. Jean Tremblay' },
      { name: 'phone', label: 'Téléphone', type: 'text', required: true, maxLength: 30, description: 'Numéro pour rappeler le client', placeholder: 'ex. 450 555-1234' },
      { name: 'email', label: 'Courriel', type: 'email', required: false, description: 'Courriel du client (optionnel)', placeholder: 'client@exemple.com' },
      { name: 'service', label: 'Service', type: 'text', required: false, description: 'Service demandé par le client', placeholder: 'ex. Scellant d’asphalte' },
      { name: 'preferred_date', label: 'Date souhaitée', type: 'date', required: false, description: 'Date proposée par le client pour les travaux' },
      { name: 'message', label: 'Détails', type: 'textarea', required: false, description: 'Détails du projet fournis par le client', placeholder: 'Superficie, état de la surface…' },
      { name: 'status', label: 'Statut', type: 'select', options: ['nouveau', 'confirmé', 'complété', 'annulé'], description: 'Suivi interne : passez à « confirmé » après avoir rappelé le client' }
    ] },
    contact_messages: { label: 'Messages', icon: 'edit', fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true, maxLength: 120, description: 'Nom de la personne qui a écrit', placeholder: 'ex. Marie Côté' },
      { name: 'email', label: 'Courriel', type: 'email', required: false, description: 'Courriel pour répondre', placeholder: 'personne@exemple.com' },
      { name: 'phone', label: 'Téléphone', type: 'text', required: false, description: 'Téléphone (optionnel)', placeholder: 'ex. 450 555-1234' },
      { name: 'message', label: 'Message', type: 'textarea', required: true, description: 'Contenu du message reçu', placeholder: 'Texte du message…' },
      { name: 'status', label: 'Statut', type: 'select', options: ['nouveau', 'traité'], description: 'Passez à « traité » une fois la réponse envoyée' }
    ] },
    services: { label: 'Services', icon: 'list', fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true, maxLength: 120, description: 'Nom affiché sur la carte du service, sur l’accueil', placeholder: 'ex. Pavage d’asphalte' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'Description courte (2-3 phrases) affichée sous le nom', placeholder: 'Décrivez ce que comprend le service…' },
      { name: 'price_from', label: 'Prix indicatif', type: 'text', required: false, maxLength: 80, description: 'Texte libre affiché au bas de la carte', placeholder: 'ex. À partir de 149 $' },
      { name: 'image_url', label: 'Photo', type: 'image', required: false, description: 'Photo du service. Recommandé : 1200×900 px (paysage 4:3)' },
      { name: 'featured', label: 'En vedette', type: 'boolean', default: false, description: 'Cochez pour mettre la carte en évidence avec une bordure accentuée' },
      { name: 'sort_order', label: 'Ordre', type: 'number', min: 0, step: 1, description: 'Ordre d’affichage (plus petit = affiché en premier)', placeholder: 'ex. 1' }
    ] },
    pricing_packages: { label: 'Tarifs & forfaits', icon: 'package', fields: [
      { name: 'name', label: 'Nom du forfait', type: 'text', required: true, maxLength: 120, description: 'Titre affiché sur la carte du forfait', placeholder: 'ex. Scellant — Entrée simple' },
      { name: 'price', label: 'Prix affiché', type: 'text', required: true, maxLength: 60, description: 'Prix affiché en gros sur la carte (texte libre)', placeholder: 'ex. À partir de 249 $' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'Phrase courte sous le prix', placeholder: 'ex. Idéal pour une entrée jusqu’à 600 pi²' },
      { name: 'features', label: 'Inclusions', type: 'textarea', required: false, description: 'Une inclusion par ligne — chaque ligne devient une puce sur la carte', placeholder: 'Nettoyage haute pression\nColmatage des fissures\nScellant 2 couches' },
      { name: 'category', label: 'Catégorie', type: 'select', options: ['Scellant', 'Nettoyage à pression', 'Pavage', 'Forfait'], description: 'Petite étiquette affichée au-dessus du nom' },
      { name: 'popular', label: 'Populaire', type: 'boolean', default: false, description: 'Cochez pour mettre ce forfait en vedette avec le ruban « Populaire »' },
      { name: 'sort_order', label: 'Ordre', type: 'number', min: 0, step: 1, description: 'Ordre d’affichage (plus petit = premier)', placeholder: 'ex. 1' },
      { name: 'image_url', label: 'Photo (optionnelle)', type: 'image', required: false, description: 'Photo optionnelle. Recommandé : 1200×900 px' }
    ] },
    gallery: { label: 'Galerie', icon: 'image', fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, maxLength: 140, description: 'Titre affiché sous la photo, ex. type de travaux et ville', placeholder: 'ex. Entrée résidentielle — Saint-Sauveur' },
      { name: 'image_url', label: 'Photo', type: 'image', required: true, description: 'Photo du chantier. Recommandé : 1200×900 px (paysage 4:3)' },
      { name: 'category', label: 'Catégorie', type: 'select', options: ['Pavage', 'Nettoyage à pression', 'Scellant'], description: 'Permet le filtrage par catégorie dans la galerie' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'Note interne ou détail du projet (optionnel)', placeholder: 'ex. Resurfaçage complet, 1 100 pi²' }
    ] },
    team_members: { label: 'Équipe', icon: 'users', fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true, maxLength: 120, description: 'Nom complet du membre de l’équipe', placeholder: 'ex. Marc Diamand' },
      { name: 'role', label: 'Rôle', type: 'text', required: false, maxLength: 120, description: 'Poste affiché sous le nom', placeholder: 'ex. Chef d’équipe' },
      { name: 'bio', label: 'Bio', type: 'textarea', required: false, description: 'Une ou deux phrases sur son expérience', placeholder: 'ex. 12 ans d’expérience en pavage résidentiel…' },
      { name: 'image_url', label: 'Photo', type: 'image', required: false, description: 'Photo portrait. Recommandé : carré 600×600 px. Sans photo, les initiales sont affichées' },
      { name: 'sort_order', label: 'Ordre', type: 'number', min: 0, step: 1, description: 'Ordre d’affichage (plus petit = premier)', placeholder: 'ex. 1' }
    ] },
    posts: { label: 'Articles', icon: 'edit', fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, maxLength: 200, description: 'Titre de l’article ou du conseil', placeholder: 'ex. Quand appliquer un scellant d’asphalte ?' },
      { name: 'content', label: 'Contenu', type: 'textarea', required: false, description: 'Texte de l’article. Gardez des paragraphes courts', placeholder: 'Rédigez votre article ici…' },
      { name: 'image_url', label: 'Image', type: 'image', required: false, description: 'Image d’en-tête. Recommandé : 1200×630 px' },
      { name: 'category', label: 'Catégorie', type: 'text', required: false, maxLength: 50, description: 'Regroupe les articles, ex. Conseils, Nouvelles', placeholder: 'ex. Conseils' },
      { name: 'published', label: 'Publié', type: 'boolean', default: true, description: 'Décochez pour conserver en brouillon' }
    ] }
  };

  function formatPhone(p) { if (!p) return ''; var d = String(p).replace(/\D/g, ''); if (d.length === 11 && d[0] === '1') d = d.slice(1); if (d.length === 10) return d.slice(0, 3) + ' ' + d.slice(3, 6) + '-' + d.slice(6); return String(p); }

  async function getSettings() {
    var out = {};
    try { var rows = await services.db.all('SELECT key, value FROM admin_settings'); rows.forEach(function(r) { out[r.key] = r.value; }); } catch (e) {}
    return out;
  }

  function applyTextOverrides(t, settings, lang) {
    for (var k in settings) {
      if (k.indexOf('text_') === 0 && k.slice(-(lang.length + 1)) === '_' + lang) {
        var key = k.slice(5, -(lang.length + 1));
        if (key) t[key] = settings[k];
      }
    }
    return t;
  }

  async function ctx(req, page) {
    var settings = await getSettings();
    var lang = req.lang || 'fr';
    var t = applyTextOverrides(Object.assign({}, T[lang] || T.fr), settings, lang);
    return { settings: settings, lang: lang, t: t, page: page, formatPhone: formatPhone };
  }

  async function count(table, where) {
    try { var r = await services.db.get('SELECT COUNT(*)::int AS n FROM ' + table + (where ? ' WHERE ' + where : '')); return r ? Number(r.n) : 0; } catch (e) { return 0; }
  }

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    next();
  }

  function coerce(mod, body) {
    var data = {};
    mod.fields.forEach(function(f) {
      if (!(f.name in body)) return;
      var v = body[f.name];
      if (f.type === 'boolean') data[f.name] = (v === true || v === 'true' || v === 1 || v === '1' || v === 'on') ? 1 : 0;
      else if (f.type === 'number') data[f.name] = (v === '' || v === null || v === undefined || isNaN(Number(v))) ? 0 : Number(v);
      else data[f.name] = (v === undefined || v === null) ? '' : String(v);
    });
    return data;
  }

  router.use(function(req, res, next) {
    var lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if (lang !== 'en') lang = 'fr';
    if (req.query.lang) { try { res.cookie('pwa_lang', lang, { maxAge: 31536000000 }); } catch (e) {} }
    req.lang = lang;
    next();
  });

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && req.path.indexOf('/api') !== 0 && req.path.indexOf('/admin') !== 0 && req.path.indexOf('.') === -1) {
      try { await services.db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch (e) {}
    }
    next();
  });

  router.get('/', async function(req, res) {
    try {
      var c = await ctx(req, 'home');
      var svcList = [], team = [], galleryItems = [];
      try { svcList = await services.db.all('SELECT * FROM services ORDER BY sort_order, id'); } catch (e) {}
      try { team = await services.db.all('SELECT * FROM team_members ORDER BY sort_order, id'); } catch (e) {}
      try { galleryItems = await services.db.all('SELECT * FROM gallery ORDER BY id DESC LIMIT 4'); } catch (e) {}
      res.render('index', Object.assign(c, { svcList: svcList, team: team, galleryItems: galleryItems, pageTitle: '' }));
    } catch (e) { res.status(500).send('Erreur serveur'); }
  });

  router.get('/galerie', async function(req, res) {
    try {
      var c = await ctx(req, 'galerie');
      var items = [];
      try { items = await services.db.all('SELECT * FROM gallery ORDER BY id DESC'); } catch (e) {}
      var cats = [];
      items.forEach(function(i) { if (i.category && cats.indexOf(i.category) === -1) cats.push(i.category); });
      var cat = req.query.cat || '';
      var filtered = cat ? items.filter(function(i) { return i.category === cat; }) : items;
      res.render('galerie', Object.assign(c, { items: filtered, cats: cats, activeCat: cat, pageTitle: c.t.gallery_title }));
    } catch (e) { res.status(500).send('Erreur serveur'); }
  });

  router.get('/tarifs', async function(req, res) {
    try {
      var c = await ctx(req, 'tarifs');
      var packages = [];
      try { packages = await services.db.all('SELECT * FROM pricing_packages ORDER BY sort_order, id'); } catch (e) {}
      res.render('tarifs', Object.assign(c, { packages: packages, pageTitle: c.t.pricing_title }));
    } catch (e) { res.status(500).send('Erreur serveur'); }
  });

  router.get('/rendez-vous', async function(req, res) {
    try {
      var c = await ctx(req, 'rendez-vous');
      var svcList = [];
      try { svcList = await services.db.all('SELECT * FROM services ORDER BY sort_order, id'); } catch (e) {}
      res.render('rendez-vous', Object.assign(c, { svcList: svcList, sent: req.query.sent === '1', err: req.query.err === '1', pageTitle: c.t.book_title }));
    } catch (e) { res.status(500).send('Erreur serveur'); }
  });

  router.post('/rendez-vous', async function(req, res) {
    try {
      var b = req.body || {};
      if (!b.name || !b.phone) return res.redirect('rendez-vous?err=1');
      await services.db.run('INSERT INTO bookings (name, phone, email, service, preferred_date, message) VALUES ($1,$2,$3,$4,$5,$6)', [b.name, b.phone, b.email || '', b.service || '', b.preferred_date || '', b.message || '']);
      try {
        if (services.config.contactEmail) {
          await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle demande de rendez-vous — ' + b.name, html: '<p><strong>Nom :</strong> ' + b.name + '</p><p><strong>Téléphone :</strong> ' + b.phone + '</p><p><strong>Courriel :</strong> ' + (b.email || '—') + '</p><p><strong>Service :</strong> ' + (b.service || '—') + '</p><p><strong>Date souhaitée :</strong> ' + (b.preferred_date || '—') + '</p><p>' + (b.message || '') + '</p>' });
        }
      } catch (e) {}
      res.redirect('rendez-vous?sent=1');
    } catch (e) { res.redirect('rendez-vous?err=1'); }
  });

  router.get('/contact', async function(req, res) {
    try {
      var c = await ctx(req, 'contact');
      res.render('contact', Object.assign(c, { sent: req.query.sent === '1', err: req.query.err === '1', pageTitle: c.t.contact_title }));
    } catch (e) { res.status(500).send('Erreur serveur'); }
  });

  router.post('/contact', async function(req, res) {
    try {
      var b = req.body || {};
      if (!b.name || !b.message) return res.redirect('contact?err=1');
      await services.db.run('INSERT INTO contact_messages (name, email, phone, message) VALUES ($1,$2,$3,$4)', [b.name, b.email || '', b.phone || '', b.message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message — ' + b.name, html: '<p><strong>Nom :</strong> ' + b.name + '</p><p><strong>Courriel :</strong> ' + (b.email || '—') + '</p><p><strong>Téléphone :</strong> ' + (b.phone || '—') + '</p><p>' + (b.message || '') + '</p>' });
        }
      } catch (e) {}
      res.redirect('contact?sent=1');
    } catch (e) { res.redirect('contact?err=1'); }
  });

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
    var stats = {
      totalVisits: await count('site_visits'),
      recentVisits: await count('site_visits', "created_at > NOW() - INTERVAL '7 days'"),
      bookings: await count('bookings'),
      newBookings: await count('bookings', "status = 'nouveau'"),
      messages: await count('contact_messages'),
      newMessages: await count('contact_messages', "status = 'nouveau'"),
      services: await count('services'),
      gallery: await count('gallery'),
      packages: await count('pricing_packages'),
      team: await count('team_members'),
      posts: await count('posts'),
      pushSubs: 0,
      users: 0
    };
    try { stats.pushSubs = await services.push.getSubscriptionCount(); } catch (e) {}
    try { stats.users = await services.auth.getUserCount(); } catch (e) {}
    var recentBookings = [], recentMessages = [];
    try { recentBookings = await services.db.all('SELECT * FROM bookings ORDER BY id DESC LIMIT 5'); } catch (e) {}
    try { recentMessages = await services.db.all('SELECT * FROM contact_messages ORDER BY id DESC LIMIT 5'); } catch (e) {}
    var settings = await getSettings();
    res.render('admin', { stats: stats, recentBookings: recentBookings, recentMessages: recentMessages, settings: settings, moduleKey: 'dashboard' });
  });

  router.get('/admin/logout', function(req, res) {
    try { res.clearCookie(services.config.adminCookieName); } catch (e) {}
    res.redirect('.');
  });

  Object.keys(MODULES).forEach(function(key) {
    router.get('/admin/' + key, async function(req, res) {
      if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
      var items = [];
      try { items = await services.db.all('SELECT * FROM ' + key + ' ORDER BY id DESC'); } catch (e) {}
      res.render('admin-' + key, { items: items, moduleKey: key, moduleLabel: MODULES[key].label, fields: MODULES[key].fields });
    });

    router.get('/api/admin/' + key, requireAdmin, async function(req, res) {
      try { var rows = await services.db.all('SELECT * FROM ' + key + ' ORDER BY id DESC'); var out = {}; out[key] = rows; res.json(out); } catch (e) { res.status(500).json({ error: e.message }); }
    });

    router.post('/api/admin/' + key, requireAdmin, async function(req, res) {
      try {
        var data = coerce(MODULES[key], req.body || {});
        var cols = Object.keys(data);
        if (!cols.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
        var ph = cols.map(function(c2, i) { return '$' + (i + 1); }).join(',');
        var r = await services.db.run('INSERT INTO ' + key + ' (' + cols.join(',') + ') VALUES (' + ph + ') RETURNING id', cols.map(function(c2) { return data[c2]; }));
        var row = await services.db.get('SELECT * FROM ' + key + ' WHERE id = $1', [r.lastInsertRowid]);
        res.json({ item: row });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });

    router.put('/api/admin/' + key + '/:id', requireAdmin, async function(req, res) {
      try {
        var data = coerce(MODULES[key], req.body || {});
        var cols = Object.keys(data);
        if (!cols.length) return res.status(400).json({ error: 'Aucune donnée fournie' });
        var sets = cols.map(function(c2, i) { return c2 + ' = $' + (i + 1); });
        sets.push('updated_at = NOW()');
        await services.db.run('UPDATE ' + key + ' SET ' + sets.join(', ') + ' WHERE id = $' + (cols.length + 1), cols.map(function(c2) { return data[c2]; }).concat([req.params.id]));
        var row = await services.db.get('SELECT * FROM ' + key + ' WHERE id = $1', [req.params.id]);
        if (!row) return res.status(404).json({ error: 'Introuvable' });
        res.json({ item: row });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });

    router.delete('/api/admin/' + key + '/:id', requireAdmin, async function(req, res) {
      try { await services.db.run('DELETE FROM ' + key + ' WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
    });
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    var modules = Object.keys(MODULES).map(function(k) { return { key: k, label: MODULES[k].label, icon: MODULES[k].icon, fields: MODULES[k].fields }; });
    res.json({ modules: modules, settingsFields: [
      { name: 'contact_phone', type: 'text', label: 'Téléphone', description: 'Numéro affiché sur le site et utilisé pour les liens d’appel', placeholder: 'ex. 4384356829' },
      { name: 'contact_email', type: 'email', label: 'Courriel affiché', description: 'Adresse courriel affichée sur la page contact', placeholder: 'info@exemple.com' },
      { name: 'business_address', type: 'text', label: 'Adresse', description: 'Adresse affichée sur la page contact', placeholder: 'ex. 123 rue Principale, Saint-Jérôme, QC' },
      { name: 'service_area', type: 'text', label: 'Zone desservie', description: 'Région affichée si aucune adresse n’est fournie', placeholder: 'ex. Laurentides, QC' },
      { name: 'hours', type: 'text', label: 'Heures d’ouverture', description: 'Affichées sur la page contact et au pied de page', placeholder: 'ex. Lun – Sam : 7 h à 18 h' }
    ] });
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    var out = { userCount: 0, pushSubscriberCount: 0, totalVisits: await count('site_visits'), recentVisits: await count('site_visits', "created_at > NOW() - INTERVAL '7 days'") };
    try { out.userCount = await services.auth.getUserCount(); } catch (e) {}
    try { out.pushSubscriberCount = await services.push.getSubscriptionCount(); } catch (e) {}
    res.json(out);
  });

  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    try {
      var bookings = await services.db.all('SELECT * FROM bookings ORDER BY id DESC LIMIT 50');
      var messages = await services.db.all('SELECT * FROM contact_messages ORDER BY id DESC LIMIT 50');
      res.json({ submissions: { bookings: bookings, messages: messages } });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    res.json({ settings: await getSettings() });
  });

  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      var key = req.body && req.body.key;
      if (!key) return res.status(400).json({ error: 'Clé manquante' });
      var value = (req.body.value === undefined || req.body.value === null) ? '' : String(req.body.value);
      await services.db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.use(function(req, res) {
    if (req.method === 'GET') return res.redirect('.');
    res.status(404).json({ error: 'Introuvable' });
  });

  
// Auto-injected admin page routes for orphaned views
router.get('/admin/posts', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
  res.render('admin-posts', { items: items });
});
router.get('/admin/gallery', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM gallery ORDER BY created_at DESC');
  res.render('admin-gallery', { items: items });
});
router.get('/admin/bookings', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM bookings ORDER BY created_at DESC');
  res.render('admin-bookings', { items: items });
});
router.get('/admin/services', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM services ORDER BY created_at DESC');
  res.render('admin-services', { items: items });
});
router.get('/admin/team_members', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM team_members ORDER BY created_at DESC');
  res.render('admin-team_members', { items: items });
});
router.get('/admin/contact_messages', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM contact_messages ORDER BY created_at DESC');
  res.render('admin-contact_messages', { items: items });
});
router.get('/admin/pricing_packages', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM pricing_packages ORDER BY created_at DESC');
  res.render('admin-pricing_packages', { items: items });
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
