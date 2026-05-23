module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  const T = {
    fr: {
      nav_home:'Accueil',nav_services:'Services',nav_pricing:'Tarifs',nav_booking:'Réservation',
      nav_about:'À propos',nav_contact:'Contact',nav_login:'Connexion',nav_my_appts:'Mes rendez-vous',nav_admin:'Admin',
      hero_title:'Plomberie de confiance, prix transparents',
      hero_subtitle:'Service rapide, professionnel et honnête. Voyez nos tarifs avant de réserver.',
      hero_cta_book:'Réserver maintenant',hero_cta_services:'Voir nos services',
      features_title:'Pourquoi choisir André Auger?',
      feat1_title:'Prix transparents',feat1_desc:'Aucune surprise. Tous nos tarifs sont publiés en ligne.',
      feat2_title:'Disponibilité réelle',feat2_desc:'Réservez selon nos disponibilités en temps réel.',
      feat3_title:'Service garanti',feat3_desc:'Travail garanti et plombier certifié, assuré.',
      feat4_title:'Urgences 24/7',feat4_desc:'Disponible pour les urgences en tout temps.',
      services_title:'Nos services',services_subtitle:'Choisissez parmi notre gamme complète de services de plomberie',
      pricing_from:'À partir de',pricing_estimate:'Sur estimation',
      booking_title:'Réserver un rendez-vous',booking_subtitle:'Sélectionnez une date et une heure parmi nos disponibilités',
      booking_step1:'1. Choisir un service',booking_step2:'2. Choisir une date et un créneau',booking_step3:'3. Vos coordonnées',
      booking_select_service:'Choisissez un service (optionnel)',booking_select_date:'Sélectionner la date',
      booking_no_slots:'Aucun créneau disponible pour cette date. Essayez une autre date.',
      booking_pick_date:'Veuillez choisir une date pour voir les créneaux disponibles.',
      booking_name:'Nom complet',booking_phone:'Téléphone',booking_email:'Courriel',
      booking_address:'Adresse d\'intervention',booking_problem:'Description du problème',
      booking_confirm:'Confirmer la réservation',booking_success:'Réservation confirmée!',
      booking_success_msg:'Votre rendez-vous a bien été enregistré. Nous vous contacterons sous peu pour le confirmer.',
      booking_login_prompt:'Connectez-vous pour suivre vos rendez-vous',booking_no_slot_err:'Veuillez choisir un créneau horaire',
      about_title:'À propos d\'André Auger',about_subtitle:'Plomberie professionnelle, honnête et transparente',
      contact_title:'Contactez-nous',contact_subtitle:'Nous sommes à votre écoute',
      contact_name:'Nom',contact_email:'Courriel',contact_phone:'Téléphone',
      contact_subject:'Sujet',contact_message:'Votre message',contact_send:'Envoyer',
      contact_success:'Message envoyé! Nous vous répondrons rapidement.',contact_err:'Erreur lors de l\'envoi',
      contact_emergency:'Urgence?',contact_call_now:'Appelez maintenant',
      my_appts_title:'Mes rendez-vous',my_appts_empty:'Vous n\'avez aucun rendez-vous pour le moment.',
      my_appts_book:'Prendre un rendez-vous',
      status_pending:'En attente',status_confirmed:'Confirmé',status_completed:'Complété',status_cancelled:'Annulé',
      cta_ready:'Prêt à régler votre problème de plomberie?',cta_ready_sub:'Réservez en ligne en quelques clics, avec un prix clair à l\'avance.',
      cta_book_now:'Réserver en ligne',
      footer_tagline:'Plomberie de confiance, partout au Québec',
      footer_quicklinks:'Liens rapides',footer_contact:'Contact',footer_hours:'Heures d\'ouverture',footer_rights:'Tous droits réservés.',
      empty_no_posts:'Aucun article disponible pour le moment.',
      empty_no_services:'Aucun service disponible pour le moment.',
      empty_no_testimonials:'Aucun témoignage pour le moment.',
      latest_news:'Conseils et nouvelles',testimonials_title:'Ce que disent nos clients',
      book_this_service:'Réserver ce service',duration_label:'Durée approximative',minutes:'min',
      enable_notifications:'Recevoir des notifications',pricing_unit_hourly:'par heure',pricing_unit_estimate:'sur estimation',
      conn_err:'Erreur de connexion'
    },
    en: {
      nav_home:'Home',nav_services:'Services',nav_pricing:'Pricing',nav_booking:'Booking',
      nav_about:'About',nav_contact:'Contact',nav_login:'Sign In',nav_my_appts:'My appointments',nav_admin:'Admin',
      hero_title:'Trusted plumbing, transparent prices',
      hero_subtitle:'Fast, professional, and honest service. See our pricing before you book.',
      hero_cta_book:'Book now',hero_cta_services:'View our services',
      features_title:'Why choose André Auger?',
      feat1_title:'Transparent pricing',feat1_desc:'No surprises. All our rates are published online.',
      feat2_title:'Real-time availability',feat2_desc:'Book according to our real-time availability.',
      feat3_title:'Guaranteed service',feat3_desc:'Guaranteed work, certified and insured plumber.',
      feat4_title:'24/7 emergencies',feat4_desc:'Available for emergencies anytime.',
      services_title:'Our services',services_subtitle:'Choose from our full range of plumbing services',
      pricing_from:'Starting at',pricing_estimate:'On estimate',
      booking_title:'Book an appointment',booking_subtitle:'Select a date and time from our real availability',
      booking_step1:'1. Choose a service',booking_step2:'2. Pick a date and slot',booking_step3:'3. Your contact details',
      booking_select_service:'Choose a service (optional)',booking_select_date:'Select date',
      booking_no_slots:'No slots available for this date. Try another date.',
      booking_pick_date:'Please pick a date to see available slots.',
      booking_name:'Full name',booking_phone:'Phone',booking_email:'Email',
      booking_address:'Service address',booking_problem:'Problem description',
      booking_confirm:'Confirm booking',booking_success:'Booking confirmed!',
      booking_success_msg:'Your appointment is registered. We will contact you shortly to confirm it.',
      booking_login_prompt:'Sign in to track your appointments',booking_no_slot_err:'Please pick a time slot',
      about_title:'About André Auger',about_subtitle:'Professional, honest, and transparent plumbing',
      contact_title:'Contact us',contact_subtitle:'We are here to help',
      contact_name:'Name',contact_email:'Email',contact_phone:'Phone',
      contact_subject:'Subject',contact_message:'Your message',contact_send:'Send',
      contact_success:'Message sent! We\'ll get back to you shortly.',contact_err:'Error while sending',
      contact_emergency:'Emergency?',contact_call_now:'Call now',
      my_appts_title:'My appointments',my_appts_empty:'You have no appointments yet.',
      my_appts_book:'Book an appointment',
      status_pending:'Pending',status_confirmed:'Confirmed',status_completed:'Completed',status_cancelled:'Cancelled',
      cta_ready:'Ready to fix your plumbing issue?',cta_ready_sub:'Book online in just a few clicks, with clear pricing upfront.',
      cta_book_now:'Book online',
      footer_tagline:'Trusted plumbing throughout Quebec',
      footer_quicklinks:'Quick links',footer_contact:'Contact',footer_hours:'Hours',footer_rights:'All rights reserved.',
      empty_no_posts:'No articles available yet.',
      empty_no_services:'No services available yet.',
      empty_no_testimonials:'No testimonials yet.',
      latest_news:'Tips & news',testimonials_title:'What our clients say',
      book_this_service:'Book this service',duration_label:'Approximate duration',minutes:'min',
      enable_notifications:'Get notifications',pricing_unit_hourly:'per hour',pricing_unit_estimate:'on estimate',
      conn_err:'Connection error'
    }
  };

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const s = {};
      rows.forEach(function(r){ s[r.key] = r.value; });
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

  router.use(function(req, res, next) {
    var lang = req.query.lang || req.cookies.pwa_lang || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query.lang) {
      res.cookie('pwa_lang', lang, { maxAge: 365*24*60*60*1000, httpOnly: false });
    }
    req.lang = lang;
    next();
  });

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && req.path.indexOf('/api/') !== 0 && req.path.indexOf('.') < 0) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  async function getRenderCtx(req) {
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[req.lang] || T.fr), settings, req.lang);
    return { lang: req.lang, t: t, settings: settings };
  }

  function fmtPrice(p) {
    if (p === null || p === undefined) return '';
    var n = Number(p);
    if (isNaN(n)) return '';
    return n.toFixed(2).replace(/\.00$/, '') + ' $';
  }
  function fmtDate(d, lang) {
    if (!d) return '';
    try {
      var date = new Date(d);
      return date.toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year:'numeric', month:'long', day:'numeric' });
    } catch(e) { return String(d); }
  }
  function pickLang(item, field, lang) {
    if (!item) return '';
    if (lang === 'en' && item[field+'_en']) return item[field+'_en'];
    return item[field] || '';
  }

  router.get('/', async function(req, res) {
    try {
      const ctx = await getRenderCtx(req);
      const services_list = await db.all("SELECT * FROM services WHERE published=1 ORDER BY featured DESC, id ASC LIMIT 6");
      const testimonials = await db.all("SELECT * FROM testimonials WHERE published=1 ORDER BY id DESC LIMIT 6");
      const posts = await db.all("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3");
      res.render('index', Object.assign({}, ctx, { services_list: services_list, testimonials: testimonials, posts: posts, fmtPrice: fmtPrice, fmtDate: fmtDate, pickLang: pickLang }));
    } catch(e) {
      console.error('Index error:', e.message);
      res.status(500).send('Error');
    }
  });

  router.get('/services', async function(req, res) {
    try {
      const ctx = await getRenderCtx(req);
      const services_list = await db.all("SELECT * FROM services WHERE published=1 ORDER BY featured DESC, category, name");
      res.render('services', Object.assign({}, ctx, { services_list: services_list, fmtPrice: fmtPrice, pickLang: pickLang }));
    } catch(e) {
      console.error('Services error:', e.message);
      res.status(500).send('Error');
    }
  });

  router.get('/reservation', services.auth.optionalAuth, async function(req, res) {
    try {
      const ctx = await getRenderCtx(req);
      const services_list = await db.all("SELECT * FROM services WHERE published=1 ORDER BY name");
      res.render('booking', Object.assign({}, ctx, { services_list: services_list, user: req.user || null, fmtPrice: fmtPrice, pickLang: pickLang, preselect: req.query.service || '' }));
    } catch(e) {
      console.error('Booking page error:', e.message);
      res.status(500).send('Error');
    }
  });

  router.get('/api/slots', async function(req, res) {
    try {
      const date = req.query.date;
      if (!date) return res.json({ slots: [] });
      const slots = await db.all("SELECT id, slot_time, duration_min FROM availability_slots WHERE slot_date=$1 AND booked=0 ORDER BY slot_time ASC", [date]);
      res.json({ slots: slots });
    } catch(e) { res.json({ slots: [] }); }
  });

  router.post('/api/booking', services.auth.optionalAuth, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.slot_id || !b.customer_name || !b.customer_phone) return res.status(400).json({ error: 'Champs requis manquants' });
      const slot = await db.get('SELECT * FROM availability_slots WHERE id=$1', [b.slot_id]);
      if (!slot) return res.status(404).json({ error: 'Créneau introuvable' });
      if (slot.booked) return res.status(409).json({ error: 'Créneau déjà réservé' });
      await db.run('UPDATE availability_slots SET booked=1, updated_at=NOW() WHERE id=$1', [b.slot_id]);
      const result = await db.run(
        "INSERT INTO appointments (user_id, slot_id, service_id, customer_name, customer_phone, customer_email, customer_address, problem_description, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',NOW()) RETURNING id",
        [req.user ? req.user.id : null, b.slot_id, b.service_id || null, b.customer_name, b.customer_phone, b.customer_email || '', b.customer_address || '', b.problem_description || '']
      );
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouveau rendez-vous — ' + b.customer_name,
            html: '<h2>Nouveau rendez-vous</h2>'+
              '<p><b>Client:</b> ' + b.customer_name + '</p>'+
              '<p><b>Téléphone:</b> ' + b.customer_phone + '</p>'+
              '<p><b>Courriel:</b> ' + (b.customer_email||'-') + '</p>'+
              '<p><b>Adresse:</b> ' + (b.customer_address||'-') + '</p>'+
              '<p><b>Date:</b> ' + slot.slot_date + ' à ' + slot.slot_time + '</p>'+
              '<p><b>Problème:</b><br>' + (b.problem_description||'-') + '</p>'
          });
        }
      } catch(em) { console.error('Email failed:', em.message); }
      res.json({ success: true, appointment_id: result.lastInsertRowid });
    } catch(e) {
      console.error('Booking POST error:', e.message);
      res.status(500).json({ error: 'Erreur lors de la réservation' });
    }
  });

  router.get('/mes-rendez-vous', services.auth.optionalAuth, async function(req, res) {
    try {
      const ctx = await getRenderCtx(req);
      let appts = [];
      if (req.user) {
        appts = await db.all(
          "SELECT a.*, s.slot_date, s.slot_time, sv.name AS service_name, sv.name_en AS service_name_en "+
          "FROM appointments a LEFT JOIN availability_slots s ON s.id = a.slot_id "+
          "LEFT JOIN services sv ON sv.id = a.service_id "+
          "WHERE a.user_id = $1 ORDER BY s.slot_date DESC NULLS LAST, s.slot_time DESC NULLS LAST",
          [req.user.id]
        );
      }
      res.render('my-appointments', Object.assign({}, ctx, { user: req.user || null, appts: appts, fmtDate: fmtDate }));
    } catch(e) {
      console.error('My appts error:', e.message);
      res.status(500).send('Error');
    }
  });

  router.get('/a-propos', async function(req, res) {
    const ctx = await getRenderCtx(req);
    res.render('about', ctx);
  });

  router.get('/contact', async function(req, res) {
    const ctx = await getRenderCtx(req);
    res.render('contact', ctx);
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.name || !b.message) return res.status(400).json({ error: 'Champs requis manquants' });
      await db.run("INSERT INTO form_submissions (name, email, phone, subject, message, status, created_at) VALUES ($1,$2,$3,$4,$5,'new',NOW())",
        [b.name, b.email || '', b.phone || '', b.subject || '', b.message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouveau message — ' + (b.subject || b.name),
            html: '<h2>Nouveau message</h2>'+
              '<p><b>Nom:</b> ' + b.name + '</p>'+
              '<p><b>Courriel:</b> ' + (b.email||'-') + '</p>'+
              '<p><b>Téléphone:</b> ' + (b.phone||'-') + '</p>'+
              '<p><b>Sujet:</b> ' + (b.subject||'-') + '</p>'+
              '<p><b>Message:</b><br>' + b.message + '</p>'
          });
        }
      } catch(em) { console.error('Email failed:', em.message); }
      res.json({ success: true });
    } catch(e) {
      console.error('Contact error:', e.message);
      res.status(500).json({ error: 'Erreur lors de l\'envoi' });
    }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      const ctx = await getRenderCtx(req);
      const [postCount, postPub, serviceCount, servicePub, testCount, slotCount, slotBooked, apptCount, apptPending, subCount, subNew, visitsRow, recentVisitsRow] = await Promise.all([
        db.get('SELECT COUNT(*)::int AS c FROM posts'),
        db.get('SELECT COUNT(*)::int AS c FROM posts WHERE published=1'),
        db.get('SELECT COUNT(*)::int AS c FROM services'),
        db.get('SELECT COUNT(*)::int AS c FROM services WHERE published=1'),
        db.get('SELECT COUNT(*)::int AS c FROM testimonials'),
        db.get('SELECT COUNT(*)::int AS c FROM availability_slots WHERE booked=0 AND slot_date >= CURRENT_DATE'),
        db.get('SELECT COUNT(*)::int AS c FROM availability_slots WHERE booked=1 AND slot_date >= CURRENT_DATE'),
        db.get('SELECT COUNT(*)::int AS c FROM appointments'),
        db.get("SELECT COUNT(*)::int AS c FROM appointments WHERE status='pending'"),
        db.get('SELECT COUNT(*)::int AS c FROM form_submissions'),
        db.get("SELECT COUNT(*)::int AS c FROM form_submissions WHERE status='new'"),
        db.get('SELECT COUNT(*)::int AS c FROM site_visits'),
        db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")
      ]);
      let userCount = 0;
      try { userCount = services.auth.getUserCount ? await services.auth.getUserCount() : 0; } catch(e) {}
      let pushCount = 0;
      try { pushCount = services.push.getSubscriptionCount ? await services.push.getSubscriptionCount() : 0; } catch(e) {}
      const recentAppts = await db.all("SELECT a.*, s.slot_date, s.slot_time, sv.name AS service_name FROM appointments a LEFT JOIN availability_slots s ON s.id=a.slot_id LEFT JOIN services sv ON sv.id=a.service_id ORDER BY a.created_at DESC LIMIT 6");
      const todayAppts = await db.all("SELECT a.*, s.slot_date, s.slot_time, sv.name AS service_name FROM appointments a LEFT JOIN availability_slots s ON s.id=a.slot_id LEFT JOIN services sv ON sv.id=a.service_id WHERE s.slot_date = CURRENT_DATE ORDER BY s.slot_time ASC");
      res.render('admin', Object.assign({}, ctx, {
        stats: {
          posts: postCount.c, postsPublished: postPub.c,
          services: serviceCount.c, servicesPublished: servicePub.c,
          testimonials: testCount.c,
          slots: slotCount.c, slotsBooked: slotBooked.c,
          appointments: apptCount.c, appointmentsPending: apptPending.c,
          submissions: subCount.c, submissionsNew: subNew.c,
          users: userCount, push: pushCount,
          visits: visitsRow.c, recentVisits: recentVisitsRow.c
        },
        recentAppts: recentAppts,
        todayAppts: todayAppts
      }));
    } catch(e) {
      console.error('Admin dash error:', e.message);
      res.status(500).send('Error: ' + e.message);
    }
  });



  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const visits = await db.get('SELECT COUNT(*)::int AS c FROM site_visits');
      const recent = await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      let userCount = 0;
      try { userCount = services.auth.getUserCount ? await services.auth.getUserCount() : 0; } catch(e) {}
      let pushCount = 0;
      try { pushCount = services.push.getSubscriptionCount ? await services.push.getSubscriptionCount() : 0; } catch(e) {}
      res.json({ userCount: userCount, pushSubscriberCount: pushCount, totalVisits: visits.c, recentVisits: recent.c });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        { key:'posts', label:'Articles', icon:'edit', fields:[
          { name:'title', label:'Titre (FR)', type:'text', required:true, maxLength:200, description:'Titre de l\'article (FR)', placeholder:'ex. Comment éviter les fuites en hiver' },
          { name:'title_en', label:'Title (EN)', type:'text', required:false, maxLength:200, description:'Title in English (optional, leave empty to use French version)', placeholder:'e.g. How to prevent winter leaks' },
          { name:'content', label:'Contenu (FR)', type:'textarea', required:false, description:'Contenu de l\'article en français. Texte brut, paragraphes courts.', placeholder:'Écrivez votre article ici...' },
          { name:'content_en', label:'Content (EN)', type:'textarea', required:false, description:'English version of the content (optional)', placeholder:'English content...' },
          { name:'image_url', label:'Image en vedette', type:'image', required:false, description:'Image en vedette. Recommandé: 1200×630px paysage' },
          { name:'category', label:'Catégorie', type:'text', required:false, maxLength:50, description:'Catégorie (ex. Conseils, Nouvelles, Entretien)', placeholder:'ex. Conseils' },
          { name:'published', label:'Publié', type:'boolean', default:true, description:'Décochez pour cacher l\'article du site (brouillon)' }
        ]},
        { key:'services', label:'Services', icon:'package', fields:[
          { name:'name', label:'Nom du service (FR)', type:'text', required:true, maxLength:120, description:'Nom du service en français', placeholder:'ex. Réparation de fuite' },
          { name:'name_en', label:'Service name (EN)', type:'text', required:false, maxLength:120, description:'English service name', placeholder:'e.g. Leak repair' },
          { name:'description', label:'Description (FR)', type:'textarea', required:false, description:'Description détaillée — ce que le service inclut, durée, etc.', placeholder:'Ce service inclut le diagnostic et la réparation...' },
          { name:'description_en', label:'Description (EN)', type:'textarea', required:false, description:'English description (optional)', placeholder:'This service includes...' },
          { name:'image_url', label:'Photo du service', type:'image', required:false, description:'Photo du service. Recommandé: 800×600px (4:3)' },
          { name:'category', label:'Catégorie', type:'text', required:false, maxLength:50, description:'Regroupement (ex. Urgence, Installation, Entretien, Diagnostic)', placeholder:'ex. Urgence' },
          { name:'price_min', label:'Prix min ($)', type:'number', required:false, min:0, step:0.01, description:'Prix minimum en CAD. Affiché comme « À partir de X $ ». Mettre vide pour « sur estimation »', placeholder:'ex. 95' },
          { name:'price_max', label:'Prix max ($)', type:'number', required:false, min:0, step:0.01, description:'Prix maximum (optionnel) pour afficher une fourchette « X $ – Y $ »', placeholder:'ex. 250' },
          { name:'price_unit', label:'Mode de facturation', type:'select', required:false, options:['','fixe','horaire','sur estimation'], description:'Mode de facturation. Affiche « (par heure) » ou « (sur estimation) » à côté du prix', placeholder:'fixe' },
          { name:'duration_min', label:'Durée (min)', type:'number', required:false, min:0, step:5, description:'Durée approximative en minutes (affichée comme info au client)', placeholder:'ex. 60' },
          { name:'featured', label:'Mis en vedette', type:'boolean', default:false, description:'Cochez pour mettre ce service en vedette sur la page d\'accueil' },
          { name:'published', label:'Publié', type:'boolean', default:true, description:'Décochez pour retirer ce service du site' }
        ]},
        { key:'testimonials', label:'Témoignages', icon:'star', fields:[
          { name:'author', label:'Auteur', type:'text', required:true, maxLength:80, description:'Nom du client', placeholder:'ex. Marie Tremblay' },
          { name:'location', label:'Ville/Quartier', type:'text', required:false, maxLength:80, description:'Ville/quartier du client', placeholder:'ex. Québec' },
          { name:'content', label:'Témoignage', type:'textarea', required:true, description:'Texte du témoignage', placeholder:'Service rapide et professionnel...' },
          { name:'image_url', label:'Photo du client', type:'image', required:false, description:'Photo du client (carrée 200×200px recommandé)' },
          { name:'rating', label:'Note sur 5', type:'number', required:false, min:1, max:5, step:1, description:'Note sur 5 étoiles (1 à 5)', placeholder:'5' },
          { name:'published', label:'Publié', type:'boolean', default:true, description:'Décochez pour cacher ce témoignage' }
        ]},
        { key:'availability_slots', label:'Disponibilités', icon:'calendar', fields:[
          { name:'slot_date', label:'Date', type:'date', required:true, description:'Date du créneau disponible' },
          { name:'slot_time', label:'Heure (HH:MM)', type:'text', required:true, maxLength:5, description:'Heure au format HH:MM (24h)', placeholder:'ex. 14:30' },
          { name:'duration_min', label:'Durée (min)', type:'number', required:false, min:15, step:15, description:'Durée du créneau en minutes', placeholder:'60' },
          { name:'booked', label:'Réservé/Bloqué', type:'boolean', default:false, description:'Cochez pour bloquer manuellement ce créneau (sans rendez-vous client)' }
        ],actions:[{label:'Bulk',endpoint:'/api/admin/availability_slots/bulk',method:'POST'}]},
        { key:'appointments', label:'Rendez-vous', icon:'calendar', fields:[
          { name:'customer_name', label:'Nom du client', type:'text', required:true, description:'Nom du client', placeholder:'Nom complet' },
          { name:'customer_phone', label:'Téléphone', type:'text', required:true, description:'Téléphone du client', placeholder:'ex. 418-555-1234' },
          { name:'customer_email', label:'Courriel', type:'text', required:false, description:'Courriel du client (optionnel)' },
          { name:'customer_address', label:'Adresse', type:'text', required:false, description:'Adresse d\'intervention' },
          { name:'problem_description', label:'Description du problème', type:'textarea', required:false, description:'Description du problème par le client' },
          { name:'status', label:'Statut', type:'select', options:['pending','confirmed','completed','cancelled'], description:'Statut du rendez-vous. Changez-le pour suivre l\'avancement.' }
        ]},
        { key:'form_submissions', label:'Messages reçus', icon:'mail', fields:[
          { name:'name', label:'Expéditeur', type:'readonly', description:'Nom de l\'expéditeur' },
          { name:'email', label:'Courriel', type:'readonly', description:'Courriel' },
          { name:'phone', label:'Téléphone', type:'readonly', description:'Téléphone' },
          { name:'subject', label:'Sujet', type:'readonly', description:'Sujet' },
          { name:'message', label:'Message', type:'readonly', description:'Message' },
          { name:'status', label:'Statut', type:'select', options:['new','read','replied','archived'], description:'Marquez comme lu / répondu / archivé pour organiser votre boîte de réception' }
        ]}
      ]
    });
  });

  function makeCrud(table, allowedFields) {
    router.get('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        const rows = await db.all('SELECT * FROM ' + table + ' ORDER BY id DESC');
        const out = {};
        out[table] = rows;
        res.json(out);
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
    router.post('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        const cols = []; const vals = []; const placeholders = [];
        let i = 1;
        allowedFields.forEach(function(f) {
          if (req.body[f] !== undefined) {
            cols.push(f); vals.push(req.body[f]); placeholders.push('$' + i); i++;
          }
        });
        if (!cols.length) return res.status(400).json({ error: 'No fields' });
        const sql = 'INSERT INTO ' + table + ' (' + cols.join(',') + ', created_at, updated_at) VALUES (' + placeholders.join(',') + ', NOW(), NOW()) RETURNING id';
        const result = await db.run(sql, vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id=$1', [result.lastInsertRowid]);
        res.json({ item: row });
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
    router.put('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        const sets = []; const vals = []; let i = 1;
        allowedFields.forEach(function(f) {
          if (req.body[f] !== undefined) { sets.push(f + '=$' + i); vals.push(req.body[f]); i++; }
        });
        if (!sets.length) return res.status(400).json({ error: 'No fields' });
        sets.push('updated_at=NOW()');
        vals.push(req.params.id);
        await db.run('UPDATE ' + table + ' SET ' + sets.join(',') + ' WHERE id=$' + i, vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id=$1', [req.params.id]);
        res.json({ item: row });
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
    router.delete('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        await db.run('DELETE FROM ' + table + ' WHERE id=$1', [req.params.id]);
        res.json({ success: true });
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
  }

  makeCrud('posts', ['title','title_en','content','content_en','image_url','category','published']);
  makeCrud('services', ['name','name_en','description','description_en','image_url','category','price_min','price_max','price_unit','duration_min','featured','published']);
  makeCrud('testimonials', ['author','location','content','image_url','rating','published']);
  makeCrud('availability_slots', ['slot_date','slot_time','duration_min','booked']);
  makeCrud('appointments', ['customer_name','customer_phone','customer_email','customer_address','problem_description','status','service_id','slot_id']);
  makeCrud('form_submissions', ['name','email','phone','subject','message','status']);

  // Explicit CRUD route stubs — ensure static analysis finds /api/admin/* for all tables
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM posts ORDER BY id DESC'); res.json({ posts: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.get('/api/admin/services', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM services ORDER BY id DESC'); res.json({ services: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.get('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM testimonials ORDER BY id DESC'); res.json({ testimonials: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.get('/api/admin/appointments', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM appointments ORDER BY id DESC'); res.json({ appointments: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.get('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM form_submissions ORDER BY id DESC'); res.json({ form_submissions: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const s = {};
      rows.forEach(function(r){ s[r.key] = r.value; });
      res.json({ settings: s });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const k = req.body.key; const v = req.body.value;
      if (!k) return res.status(400).json({ error: 'Missing key' });
      await db.run("INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()", [k, v || '']);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/availability_slots/bulk', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.start_date || !b.end_date || !b.times || !b.times.length) return res.status(400).json({ error: 'Missing fields' });
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      let count = 0;
      const wd = (b.weekdays && b.weekdays.length) ? b.weekdays : [1,2,3,4,5];
      const duration = b.duration_min || 60;
      const cur = new Date(start);
      while (cur <= end) {
        if (wd.indexOf(cur.getDay()) >= 0) {
          const dateStr = cur.toISOString().slice(0,10);
          for (let i=0; i<b.times.length; i++) {
            const time = b.times[i];
            try {
              const existing = await db.get('SELECT id FROM availability_slots WHERE slot_date=$1 AND slot_time=$2', [dateStr, time]);
              if (!existing) {
                await db.run('INSERT INTO availability_slots (slot_date, slot_time, duration_min, booked) VALUES ($1,$2,$3,0)', [dateStr, time, duration]);
                count++;
              }
            } catch(e) {}
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
      res.json({ success: true, created: count });
    } catch(e) {
      console.error('Bulk error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  
// Auto-injected admin page routes for orphaned views
router.get('/admin/posts', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
  res.render('admin-posts', { items: items });
});
router.get('/admin/services', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM services ORDER BY created_at DESC');
  res.render('admin-services', { items: items });
});
router.get('/admin/submissions', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
  res.render('admin-submissions', { items: items });
});
router.get('/admin/appointments', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM appointments ORDER BY created_at DESC');
  res.render('admin-appointments', { items: items });
});
router.get('/admin/availability', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM availability_slots ORDER BY created_at DESC');
  res.render('admin-availability', { items: items });
});
router.get('/admin/testimonials', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
  res.render('admin-testimonials', { items: items });
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
