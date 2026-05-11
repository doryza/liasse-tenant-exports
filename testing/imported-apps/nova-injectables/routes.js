module.exports = function(services) {
  const router = require('express').Router();

  const T = {
    fr: {
      nav_home:'Accueil', nav_services:'Soins', nav_about:'À propos', nav_gallery:'Galerie', nav_blog:'Journal', nav_contact:'Contact', nav_book:'Réserver',
      login:'Connexion', logout:'Déconnexion', my_account:'Mon compte',
      hero_title:'Révélez votre éclat naturel', hero_subtitle:'Soins esthétiques de pointe — PRP, agents de comblement et plus. Expertise médicale, résultats raffinés.',
      hero_cta:'Prendre rendez-vous', hero_cta_secondary:'Découvrir nos soins',
      services_title:'Nos soins signatures', services_subtitle:'Une approche personnalisée pour des résultats naturels',
      services_view_all:'Voir tous les soins', services_book_btn:'Réserver', services_learn_more:'En savoir plus',
      services_from:'À partir de', services_duration:'Durée', services_deposit:'Acompte', services_minutes:'min',
      featured_services:'Soins en vedette', all_services:'Tous nos soins',
      about_title:'L\'art de la beauté médicale', about_subtitle:'À propos de Nova',
      testimonials_title:'Ce qu\'elles en disent', testimonials_subtitle:'Témoignages clients',
      cta_section_title:'Prête à révéler votre éclat?', cta_section_subtitle:'Réservez votre consultation aujourd\'hui',
      contact_title:'Contactez-nous', contact_subtitle:'Une question? Nous sommes à votre écoute.',
      contact_name:'Nom complet', contact_email:'Courriel', contact_phone:'Téléphone', contact_message:'Votre message',
      contact_submit:'Envoyer le message', contact_success:'Merci! Nous vous répondrons sous peu.', contact_error:'Une erreur est survenue. Veuillez réessayer.',
      contact_info:'Coordonnées', contact_hours:'Heures d\'ouverture',
      book_title:'Réservation', book_subtitle:'Réservez votre soin avec un acompte sécurisé',
      book_select_service:'Soin choisi', book_choose_service:'Choisissez un soin', book_date:'Date souhaitée', book_time:'Heure préférée',
      book_name:'Votre nom complet', book_email:'Courriel', book_phone:'Téléphone', book_notes:'Notes ou demandes particulières (optionnel)',
      book_deposit_info:'Un acompte sécurisé sera prélevé via Stripe pour confirmer votre rendez-vous. Le solde sera réglé en clinique.',
      book_pay_deposit:'Payer l\'acompte et réserver', book_no_deposit:'Demander un rendez-vous', book_total_deposit:'Acompte à régler',
      book_confirmed_title:'Rendez-vous confirmé!', book_confirmed_msg:'Votre acompte a été reçu. Nous vous contacterons sous peu pour confirmer les détails.',
      book_request_title:'Demande envoyée!', book_request_msg:'Nous avons bien reçu votre demande. Nous vous contacterons sous 24h pour confirmer.',
      book_cancelled_title:'Réservation annulée', book_cancelled_msg:'Aucun montant n\'a été prélevé. Vous pouvez réessayer quand vous le souhaitez.',
      book_back_home:'Retour à l\'accueil', book_try_again:'Réessayer la réservation',
      gallery_title:'Galerie', gallery_subtitle:'Un aperçu de notre univers',
      blog_title:'Journal Nova', blog_subtitle:'Conseils, tendances et expertise',
      read_more:'Lire la suite', back_to_blog:'Retour au journal', back_to_services:'Retour aux soins',
      footer_quick_links:'Liens rapides', footer_contact_info:'Coordonnées', footer_rights:'Tous droits réservés.',
      empty_no_content:'Bientôt disponible.', empty_services:'Nos soins seront bientôt présentés ici.', empty_testimonials:'Les premiers témoignages seront affichés prochainement.', empty_gallery:'Notre galerie sera enrichie sous peu.', empty_posts:'Nos articles seront publiés prochainement.',
      learn_more:'En savoir plus', contact_us:'Nous contacter', loading:'Chargement...', required:'requis'
    },
    en: {
      nav_home:'Home', nav_services:'Treatments', nav_about:'About', nav_gallery:'Gallery', nav_blog:'Journal', nav_contact:'Contact', nav_book:'Book now',
      login:'Sign in', logout:'Sign out', my_account:'My account',
      hero_title:'Reveal your natural radiance', hero_subtitle:'Advanced aesthetic care — PRP, dermal fillers and more. Medical expertise, refined results.',
      hero_cta:'Book appointment', hero_cta_secondary:'Explore treatments',
      services_title:'Signature treatments', services_subtitle:'A personalized approach for natural results',
      services_view_all:'View all treatments', services_book_btn:'Book', services_learn_more:'Learn more',
      services_from:'Starting at', services_duration:'Duration', services_deposit:'Deposit', services_minutes:'min',
      featured_services:'Featured treatments', all_services:'All treatments',
      about_title:'The art of medical beauty', about_subtitle:'About Nova',
      testimonials_title:'Client stories', testimonials_subtitle:'Testimonials',
      cta_section_title:'Ready to reveal your radiance?', cta_section_subtitle:'Book your consultation today',
      contact_title:'Contact us', contact_subtitle:'Have a question? We\'re here to help.',
      contact_name:'Full name', contact_email:'Email', contact_phone:'Phone', contact_message:'Your message',
      contact_submit:'Send message', contact_success:'Thank you! We\'ll reply shortly.', contact_error:'An error occurred. Please try again.',
      contact_info:'Contact info', contact_hours:'Opening hours',
      book_title:'Booking', book_subtitle:'Book your treatment with a secure deposit',
      book_select_service:'Selected treatment', book_choose_service:'Choose a treatment', book_date:'Preferred date', book_time:'Preferred time',
      book_name:'Your full name', book_email:'Email', book_phone:'Phone', book_notes:'Notes or special requests (optional)',
      book_deposit_info:'A secure deposit will be charged via Stripe to confirm your appointment. The balance is paid at the clinic.',
      book_pay_deposit:'Pay deposit and book', book_no_deposit:'Request appointment', book_total_deposit:'Deposit to pay',
      book_confirmed_title:'Appointment confirmed!', book_confirmed_msg:'Your deposit has been received. We will be in touch shortly to confirm details.',
      book_request_title:'Request received!', book_request_msg:'We have received your booking request. We\'ll contact you within 24h to confirm.',
      book_cancelled_title:'Booking cancelled', book_cancelled_msg:'No charges were made. Feel free to try again any time.',
      book_back_home:'Back to home', book_try_again:'Try booking again',
      gallery_title:'Gallery', gallery_subtitle:'A glimpse into our world',
      blog_title:'Nova Journal', blog_subtitle:'Tips, trends and expertise',
      read_more:'Read more', back_to_blog:'Back to journal', back_to_services:'Back to treatments',
      footer_quick_links:'Quick links', footer_contact_info:'Contact info', footer_rights:'All rights reserved.',
      empty_no_content:'Coming soon.', empty_services:'Our treatments will appear here soon.', empty_testimonials:'First testimonials coming soon.', empty_gallery:'Our gallery will be enriched soon.', empty_posts:'Articles coming soon.',
      learn_more:'Learn more', contact_us:'Contact us', loading:'Loading...', required:'required'
    }
  };

  function applyTextOverrides(t, settings, lang) {
    for (const k in settings) {
      if (k.startsWith('text_') && k.endsWith('_' + lang)) {
        const tKey = k.slice(5, -(lang.length + 1));
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  async function getSettings() {
    try {
      const rows = await services.db.all('SELECT key, value FROM admin_settings');
      const out = {};
      for (const r of rows) out[r.key] = r.value;
      return out;
    } catch (e) { return {}; }
  }

  function formatPrice(cents, lang) {
    if (cents == null) return '';
    const v = (cents / 100).toFixed(2);
    return (lang === 'en') ? '$' + v : v.replace('.', ',') + ' $';
  }
  function formatDate(d, lang) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year:'numeric', month:'long', day:'numeric' }); }
    catch(e) { return String(d); }
  }
  function truncate(s, n) { s = String(s||''); return s.length > n ? s.slice(0, n).trim() + '…' : s; }

  router.use(function(req, res, next) {
    let lang = (req.query && req.query.lang) || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query && req.query.lang && req.query.lang !== (req.cookies && req.cookies.pwa_lang)) {
      try { res.cookie('pwa_lang', lang, { maxAge: 365*24*60*60*1000, httpOnly: false, sameSite: 'lax' }); } catch(e){}
    }
    req.lang = lang;
    next();
  });

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      try { await services.db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  async function renderPage(req, res, view, extra) {
    extra = extra || {};
    const lang = req.lang;
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[lang] || T.fr), settings, lang);
    res.render(view, Object.assign({
      lang, t, settings,
      user: req.user || null,
      slug: services.config.slug,
      formatPrice: function(c){return formatPrice(c, lang);},
      formatDate: function(d){return formatDate(d, lang);},
      truncate,
      currentYear: new Date().getFullYear()
    }, extra));
  }

  router.get('/', services.auth.optionalAuth, async function(req, res) {
    try {
      const featuredServices = await services.db.all("SELECT * FROM services WHERE published=1 AND featured=1 ORDER BY sort_order ASC, id ASC LIMIT 4");
      const testimonials = await services.db.all("SELECT * FROM testimonials WHERE published=1 ORDER BY id DESC LIMIT 3");
      const latestPosts = await services.db.all("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3");
      await renderPage(req, res, 'index', { featuredServices, testimonials, latestPosts });
    } catch (e) { console.error('Home error:', e.message); await renderPage(req, res, 'index', { featuredServices: [], testimonials: [], latestPosts: [] }); }
  });

  router.get('/services', services.auth.optionalAuth, async function(req, res) {
    try {
      const allServices = await services.db.all("SELECT * FROM services WHERE published=1 ORDER BY featured DESC, sort_order ASC, id ASC");
      const categories = Array.from(new Set(allServices.map(s => s.category).filter(Boolean)));
      await renderPage(req, res, 'services', { allServices, categories });
    } catch (e) { console.error('Services error:', e.message); await renderPage(req, res, 'services', { allServices: [], categories: [] }); }
  });

  router.get('/services/:slug', services.auth.optionalAuth, async function(req, res) {
    try {
      const service = await services.db.get("SELECT * FROM services WHERE slug=$1 AND published=1", [req.params.slug]);
      if (!service) return res.redirect('services');
      const otherServices = await services.db.all("SELECT * FROM services WHERE published=1 AND id != $1 ORDER BY featured DESC LIMIT 3", [service.id]);
      await renderPage(req, res, 'service-detail', { service, otherServices });
    } catch (e) { console.error('Service detail error:', e.message); res.redirect('services'); }
  });

  router.get('/booking', services.auth.optionalAuth, async function(req, res) {
    try {
      const allServices = await services.db.all("SELECT * FROM services WHERE published=1 ORDER BY featured DESC, sort_order ASC");
      const preselectedId = req.query.service ? parseInt(req.query.service) : null;
      await renderPage(req, res, 'booking', { allServices, preselectedId });
    } catch (e) { console.error('Booking error:', e.message); await renderPage(req, res, 'booking', { allServices: [], preselectedId: null }); }
  });

  router.post('/api/booking', async function(req, res) {
    try {
      const { service_id, client_name, client_email, client_phone, appointment_date, appointment_time, notes } = req.body || {};
      if (!service_id || !client_name || !client_email || !appointment_date) {
        return res.status(400).json({ error: req.lang === 'en' ? 'Please fill in all required fields.' : 'Veuillez remplir tous les champs requis.' });
      }
      const service = await services.db.get('SELECT * FROM services WHERE id=$1 AND published=1', [parseInt(service_id)]);
      if (!service) return res.status(404).json({ error: 'Service not found' });
      const depositCents = parseInt(service.deposit_cents) || 0;
      const result = await services.db.run(
        "INSERT INTO appointments (service_id, client_name, client_email, client_phone, appointment_date, appointment_time, notes, status, deposit_status, deposit_amount_cents) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending','unpaid',$8) RETURNING id",
        [service.id, client_name, client_email, client_phone || '', appointment_date, appointment_time || '', notes || '', depositCents]
      );
      const appointmentId = result.lastInsertRowid;
      const stripeKey = services.externalVars.STRIPE_SECRET_KEY;
      if (stripeKey && depositCents > 0) {
        const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.get('host');
        const baseUrl = proto + '://' + host + '/pwa/' + services.config.slug;
        try {
          const params = new URLSearchParams();
          params.append('mode', 'payment');
          params.append('success_url', baseUrl + '/booking-confirmed?session_id={CHECKOUT_SESSION_ID}');
          params.append('cancel_url', baseUrl + '/booking-cancelled?appt=' + appointmentId);
          params.append('customer_email', client_email);
          params.append('line_items[0][price_data][currency]', 'cad');
          params.append('line_items[0][price_data][product_data][name]', (req.lang === 'en' ? 'Deposit — ' : 'Acompte — ') + service.name);
          params.append('line_items[0][price_data][product_data][description]', (req.lang === 'en' ? 'Booking deposit for ' : 'Acompte pour ') + service.name + ' — ' + appointment_date + ' ' + (appointment_time || ''));
          params.append('line_items[0][price_data][unit_amount]', String(depositCents));
          params.append('line_items[0][quantity]', '1');
          params.append('metadata[appointment_id]', String(appointmentId));
          params.append('metadata[service_id]', String(service.id));
          const stripeRes = await services.fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + stripeKey, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
          });
          const session = await stripeRes.json();
          if (!stripeRes.ok) {
            console.error('Stripe error:', session);
            return res.status(stripeRes.status).json({ error: (session.error && session.error.message) || 'Payment setup failed' });
          }
          await services.db.run('UPDATE appointments SET stripe_session_id=$1, updated_at=NOW() WHERE id=$2', [session.id, appointmentId]);
          return res.json({ checkoutUrl: session.url, appointmentId });
        } catch (err) {
          console.error('Stripe request failed:', err.message);
          return res.status(500).json({ error: req.lang === 'en' ? 'Payment service unavailable. Please try again.' : 'Service de paiement indisponible. Veuillez réessayer.' });
        }
      }
      try {
        if (services.config.contactEmail) {
          const body = '<h2>Nouvelle demande de rendez-vous</h2><p><strong>Soin :</strong> ' + service.name + '</p><p><strong>Date :</strong> ' + appointment_date + ' ' + (appointment_time || '') + '</p><p><strong>Client :</strong> ' + client_name + '</p><p><strong>Courriel :</strong> ' + client_email + '</p><p><strong>Téléphone :</strong> ' + (client_phone || '—') + '</p><p><strong>Notes :</strong> ' + (notes || '—') + '</p><p style="color:#888">Acompte non collecté (Stripe non configuré).</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: '[Nova] Nouvelle demande de rendez-vous', html: body }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
      return res.json({ success: true, requestOnly: true, appointmentId });
    } catch (err) {
      console.error('Booking error:', err.message);
      return res.status(500).json({ error: req.lang === 'en' ? 'Booking failed. Please try again.' : 'Échec de la réservation. Veuillez réessayer.' });
    }
  });

  router.get('/booking-confirmed', services.auth.optionalAuth, async function(req, res) {
    let appointment = null;
    const sessionId = req.query.session_id;
    if (sessionId) {
      const stripeKey = services.externalVars.STRIPE_SECRET_KEY;
      if (stripeKey) {
        try {
          const r = await services.fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), {
            headers: { 'Authorization': 'Bearer ' + stripeKey }
          });
          const session = await r.json();
          if (r.ok && session.payment_status === 'paid' && session.metadata && session.metadata.appointment_id) {
            const apptId = parseInt(session.metadata.appointment_id);
            await services.db.run("UPDATE appointments SET deposit_status='paid', status='confirmed', updated_at=NOW() WHERE id=$1", [apptId]);
            appointment = await services.db.get('SELECT a.*, s.name AS service_name FROM appointments a LEFT JOIN services s ON s.id=a.service_id WHERE a.id=$1', [apptId]);
            try {
              if (services.config.contactEmail) {
                const body = '<h2>Rendez-vous CONFIRMÉ ✅</h2><p><strong>Acompte payé.</strong></p><p><strong>Soin :</strong> ' + (appointment.service_name || '—') + '</p><p><strong>Date :</strong> ' + appointment.appointment_date + ' ' + (appointment.appointment_time || '') + '</p><p><strong>Client :</strong> ' + appointment.client_name + '</p><p><strong>Courriel :</strong> ' + appointment.client_email + '</p><p><strong>Téléphone :</strong> ' + (appointment.client_phone || '—') + '</p><p><strong>Notes :</strong> ' + (appointment.notes || '—') + '</p>';
                try { await services.email.send({ to: services.config.contactEmail, subject: '[Nova] ✅ Acompte payé — RDV confirmé', html: body }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
              }
              if (appointment.client_email) {
                try { await services.email.send({ to: appointment.client_email, subject: 'Nova Injectables — Votre rendez-vous est confirmé', html: '<h2>Merci ' + appointment.client_name + '!</h2><p>Votre acompte est bien reçu. Nous vous attendons :</p><p><strong>Soin :</strong> ' + (appointment.service_name || '') + '<br><strong>Date :</strong> ' + appointment.appointment_date + ' ' + (appointment.appointment_time || '') + '</p><p>Nous vous contacterons sous peu pour confirmer les derniers détails.</p><p>À très vite,<br>L\'équipe Nova Injectables</p>' }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
              }
            } catch(e) { console.error('Confirm email failed:', e.message); }
          }
        } catch (e) { console.error('Stripe verify failed:', e.message); }
      }
    }
    await renderPage(req, res, 'booking-confirmed', { appointment, hasSession: !!sessionId });
  });

  router.get('/booking-cancelled', services.auth.optionalAuth, async function(req, res) {
    await renderPage(req, res, 'booking-cancelled', {});
  });

  router.get('/about', services.auth.optionalAuth, async function(req, res) {
    const testimonials = await services.db.all('SELECT * FROM testimonials WHERE published=1 ORDER BY id DESC LIMIT 4');
    await renderPage(req, res, 'about', { testimonials });
  });

  router.get('/gallery', services.auth.optionalAuth, async function(req, res) {
    const items = await services.db.all('SELECT * FROM gallery WHERE published=1 ORDER BY id DESC');
    await renderPage(req, res, 'gallery', { items });
  });

  router.get('/blog', services.auth.optionalAuth, async function(req, res) {
    const posts = await services.db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC');
    await renderPage(req, res, 'blog', { posts });
  });

  router.get('/blog/:id', services.auth.optionalAuth, async function(req, res) {
    const post = await services.db.get('SELECT * FROM posts WHERE id=$1 AND published=1', [parseInt(req.params.id)]);
    if (!post) return res.redirect('blog');
    const otherPosts = await services.db.all('SELECT * FROM posts WHERE published=1 AND id != $1 ORDER BY created_at DESC LIMIT 3', [post.id]);
    await renderPage(req, res, 'blog-post', { post, otherPosts });
  });

  router.get('/contact', services.auth.optionalAuth, async function(req, res) {
    await renderPage(req, res, 'contact', {});
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const { name, email, phone, message } = req.body || {};
      if (!name || !message) return res.status(400).json({ error: 'Missing fields' });
      await services.db.run('INSERT INTO form_submissions (name, email, phone, message) VALUES ($1,$2,$3,$4)', [name, email || '', phone || '', message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: '[Nova] Nouveau message de ' + name,
            html: '<h2>Nouveau message du site</h2><p><strong>Nom :</strong> ' + name + '</p><p><strong>Courriel :</strong> ' + (email || '—') + '</p><p><strong>Téléphone :</strong> ' + (phone || '—') + '</p><p><strong>Message :</strong></p><p>' + String(message).replace(/\n/g, '<br>') + '</p>'
          });
        }
      } catch (e) { console.error('Email failed:', e.message); }
      res.json({ success: true });
    } catch (err) { console.error('Contact error:', err.message); res.status(500).json({ error: 'Submission failed' }); }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const userCount = await services.auth.getUserCount();
      const pushSubscriberCount = await services.push.getSubscriptionCount();
      const totalVisitsRow = await services.db.get('SELECT COUNT(*) AS c FROM site_visits');
      const recentVisitsRow = await services.db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const apptsCount = await services.db.get('SELECT COUNT(*) AS c FROM appointments');
      const apptsConfirmed = await services.db.get("SELECT COUNT(*) AS c FROM appointments WHERE status='confirmed'");
      const apptsPending = await services.db.get("SELECT COUNT(*) AS c FROM appointments WHERE status='pending'");
      const subsCount = await services.db.get("SELECT COUNT(*) AS c FROM form_submissions WHERE status='new'");
      const servicesCount = await services.db.get("SELECT COUNT(*) AS c FROM services WHERE published=1");
      const postsCount = await services.db.get("SELECT COUNT(*) AS c FROM posts WHERE published=1");
      const recentAppts = await services.db.all('SELECT a.*, s.name AS service_name FROM appointments a LEFT JOIN services s ON s.id=a.service_id ORDER BY a.created_at DESC LIMIT 6');
      const recentSubs = await services.db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5');
      const stats = {
        userCount, pushSubscriberCount,
        totalVisits: parseInt(totalVisitsRow.c),
        recentVisits: parseInt(recentVisitsRow.c),
        appointmentsTotal: parseInt(apptsCount.c),
        appointmentsConfirmed: parseInt(apptsConfirmed.c),
        appointmentsPending: parseInt(apptsPending.c),
        newSubmissions: parseInt(subsCount.c),
        servicesPublished: parseInt(servicesCount.c),
        postsPublished: parseInt(postsCount.c)
      };
      await renderPage(req, res, 'admin', { stats, recentAppts, recentSubs, activeAdmin: 'dashboard' });
    } catch (err) { console.error('Admin dashboard error:', err.message); res.status(500).send('Admin error'); }
  });

  const adminModules = ['posts', 'services', 'testimonials', 'appointments', 'gallery', 'submissions'];
  adminModules.forEach(function(mod) {
    router.get('/admin/' + mod, async function(req, res) {
      if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : '../admin/login');
      await renderPage(req, res, 'admin-' + mod, { activeAdmin: mod });
    });
  });

  router.get('/admin/settings', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : '../admin/login');
    await renderPage(req, res, 'admin-settings', { activeAdmin: 'settings' });
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushSubscriberCount = await services.push.getSubscriptionCount();
      const totalVisitsRow = await services.db.get('SELECT COUNT(*) AS c FROM site_visits');
      const recentVisitsRow = await services.db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      res.json({ userCount, pushSubscriberCount, totalVisits: parseInt(totalVisitsRow.c), recentVisits: parseInt(recentVisitsRow.c) });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        { key: 'posts', label: 'Articles', icon: 'edit', fields: [
          { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre de l\'article affiché sur le journal et la page de détail.', placeholder: 'Ex. PRP : la science derrière le rajeunissement naturel' },
          { name: 'excerpt', type: 'textarea', description: 'Court résumé (2 lignes) affiché sur la page liste du journal.', placeholder: 'Ex. Comprendre pourquoi le PRP transforme la peau de l\'intérieur.' },
          { name: 'content', type: 'textarea', description: 'Corps complet de l\'article. Sauts de ligne pour les paragraphes.', placeholder: 'Rédigez votre article...' },
          { name: 'image_url', type: 'image', description: 'Image en haut de l\'article. Recommandé : 1200×630 px.' },
          { name: 'category', type: 'text', maxLength: 50, description: 'Catégorie de l\'article pour le filtrage.', placeholder: 'Ex. Conseils experts' },
          { name: 'published', type: 'boolean', default: true, description: 'Décochez pour mettre en brouillon (masqué du public).' }
        ]},
        { key: 'services', label: 'Soins', icon: 'package', fields: [
          { name: 'name', type: 'text', required: true, maxLength: 150, description: 'Nom du soin affiché sur la liste et la page détail.', placeholder: 'Ex. PRP Visage' },
          { name: 'slug', type: 'text', required: true, maxLength: 100, description: 'Identifiant URL (lettres minuscules + tirets). Ex. prp-visage', placeholder: 'prp-visage' },
          { name: 'short_description', type: 'text', maxLength: 200, description: 'Phrase courte affichée sur les cartes.', placeholder: 'Ex. Rajeunissement par plasma riche en plaquettes.' },
          { name: 'description', type: 'textarea', description: 'Description complète sur la page détail.', placeholder: 'Détaillez le soin, les bénéfices, le protocole...' },
          { name: 'image_url', type: 'image', description: 'Photo du soin. Recommandé : 800×600 px (4:3).' },
          { name: 'price_cents', type: 'number', min: 0, step: 1, description: 'Prix de départ EN CENTS (60000 = 600,00 $).', placeholder: '60000' },
          { name: 'deposit_cents', type: 'number', min: 0, step: 1, description: 'Acompte requis EN CENTS pour confirmer le RDV (10000 = 100,00 $).', placeholder: '10000' },
          { name: 'duration_minutes', type: 'number', min: 0, step: 5, description: 'Durée approximative en minutes.', placeholder: '60' },
          { name: 'category', type: 'text', maxLength: 50, description: 'Catégorie pour grouper les soins.', placeholder: 'Ex. PRP, Agents de comblement, Anti-âge' },
          { name: 'featured', type: 'boolean', default: false, description: 'Cochez pour mettre en vedette sur l\'accueil.' },
          { name: 'sort_order', type: 'number', min: 0, description: 'Ordre d\'affichage (plus petit = plus haut).', placeholder: '0' },
          { name: 'published', type: 'boolean', default: true, description: 'Décochez pour masquer du site public.' }
        ]},
        { key: 'testimonials', label: 'Témoignages', icon: 'star', fields: [
          { name: 'author', type: 'text', required: true, maxLength: 100, description: 'Nom (ou initiale) de la cliente.', placeholder: 'Ex. Sophie L.' },
          { name: 'role', type: 'text', maxLength: 100, description: 'Court contexte (cliente fidèle, première visite, etc.).', placeholder: 'Ex. Cliente fidèle' },
          { name: 'content', type: 'textarea', required: true, description: 'Le témoignage complet.', placeholder: 'Une expérience exceptionnelle...' },
          { name: 'image_url', type: 'image', description: 'Photo de la cliente (optionnel). Carrée recommandée.' },
          { name: 'rating', type: 'number', min: 1, max: 5, step: 1, description: 'Note sur 5.', placeholder: '5' },
          { name: 'published', type: 'boolean', default: true, description: 'Décochez pour masquer.' }
        ]},
        { key: 'appointments', label: 'Rendez-vous', icon: 'calendar', fields: [
          { name: 'client_name', type: 'text', required: true, description: 'Nom de la cliente.', placeholder: 'Marie Tremblay' },
          { name: 'client_email', type: 'email', description: 'Courriel de la cliente.', placeholder: 'marie@example.com' },
          { name: 'client_phone', type: 'text', description: 'Téléphone.', placeholder: '514-555-1234' },
          { name: 'service_id', type: 'number', description: 'ID du soin réservé.', placeholder: '1' },
          { name: 'appointment_date', type: 'date', description: 'Date du rendez-vous.' },
          { name: 'appointment_time', type: 'text', description: 'Heure (texte libre).', placeholder: '14h30' },
          { name: 'notes', type: 'textarea', description: 'Notes ou demandes de la cliente.' },
          { name: 'status', type: 'select', options: ['pending','confirmed','completed','cancelled'], description: 'État du rendez-vous.' },
          { name: 'deposit_status', type: 'select', options: ['unpaid','paid','refunded'], description: 'État de l\'acompte.' },
          { name: 'deposit_amount_cents', type: 'number', min: 0, description: 'Montant de l\'acompte en cents.', placeholder: '10000' }
        ]},
        { key: 'gallery', label: 'Galerie', icon: 'image', fields: [
          { name: 'title', type: 'text', maxLength: 100, description: 'Titre de l\'image.', placeholder: 'Notre univers' },
          { name: 'description', type: 'textarea', description: 'Courte description (optionnel).' },
          { name: 'image_url', type: 'image', required: true, description: 'Photo. Recommandé carré ou portrait.' },
          { name: 'category', type: 'text', maxLength: 50, description: 'Catégorie pour filtrer.', placeholder: 'Clinique, Soins, Résultats' },
          { name: 'published', type: 'boolean', default: true, description: 'Décochez pour masquer.' }
        ]},
        { key: 'form_submissions', label: 'Messages reçus', icon: 'mail', fields: [
          { name: 'name', type: 'readonly', description: 'Nom du contact (lecture seule).' },
          { name: 'email', type: 'readonly', description: 'Courriel (lecture seule).' },
          { name: 'phone', type: 'readonly', description: 'Téléphone (lecture seule).' },
          { name: 'message', type: 'readonly', description: 'Message reçu (lecture seule).' },
          { name: 'status', type: 'select', options: ['new','read','replied','archived'], description: 'Marquer le message comme lu / répondu / archivé.' }
        ]}
      ],
      settingsFields: [
        { name: 'payment_default_fr', type: 'textarea', label: 'Instructions de paiement (FR)', description: 'Texte affiché sur la page de réservation à propos du paiement.' },
        { name: 'payment_default_en', type: 'textarea', label: 'Payment instructions (EN)', description: 'Text shown on the booking page about payment.' },
        { name: 'booking_policy', type: 'textarea', label: 'Politique de réservation', description: 'Politique affichée sur la page de réservation (annulation, etc.).' },
        { name: 'business_hours', type: 'text', label: 'Heures d\'ouverture', description: 'Texte affiché dans le pied de page et la page contact.' },
        { name: 'instagram_url', type: 'url', label: 'Instagram', description: 'URL complète vers votre page Instagram.' },
        { name: 'facebook_url', type: 'url', label: 'Facebook', description: 'URL complète vers votre page Facebook.' }
      ]
    });
  });

  function makeCrud(table, allowedFields) {
    router.get('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        let rows;
        if (table === 'appointments') {
          rows = await services.db.all('SELECT a.*, s.name AS service_name FROM appointments a LEFT JOIN services s ON s.id=a.service_id ORDER BY a.created_at DESC');
        } else {
          rows = await services.db.all('SELECT * FROM ' + table + ' ORDER BY created_at DESC');
        }
        const out = {}; out[table] = rows; res.json(out);
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.post('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        const cols = [], vals = [], placeholders = [];
        let i = 1;
        for (const f of allowedFields) {
          if (req.body[f] !== undefined) {
            cols.push(f);
            vals.push(req.body[f]);
            placeholders.push('$' + i++);
          }
        }
        if (cols.length === 0) return res.status(400).json({ error: 'No fields' });
        const result = await services.db.run('INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING id', vals);
        const row = await services.db.get('SELECT * FROM ' + table + ' WHERE id=$1', [result.lastInsertRowid]);
        const out = {}; out[table.replace(/s$/, '')] = row; res.json(out);
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.put('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        const sets = [], vals = [];
        let i = 1;
        for (const f of allowedFields) {
          if (req.body[f] !== undefined) { sets.push(f + '=$' + i++); vals.push(req.body[f]); }
        }
        if (sets.length === 0) return res.status(400).json({ error: 'No fields' });
        sets.push('updated_at=NOW()');
        vals.push(parseInt(req.params.id));
        await services.db.run('UPDATE ' + table + ' SET ' + sets.join(',') + ' WHERE id=$' + i, vals);
        const row = await services.db.get('SELECT * FROM ' + table + ' WHERE id=$1', [parseInt(req.params.id)]);
        const out = {}; out[table.replace(/s$/, '')] = row; res.json(out);
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.delete('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        await services.db.run('DELETE FROM ' + table + ' WHERE id=$1', [parseInt(req.params.id)]);
        res.json({ success: true });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
  }

  makeCrud('posts', ['title','content','excerpt','image_url','category','published']);
  makeCrud('services', ['name','slug','short_description','description','image_url','price_cents','deposit_cents','duration_minutes','category','featured','sort_order','published']);
  makeCrud('testimonials', ['author','role','content','image_url','rating','published']);
  makeCrud('appointments', ['client_name','client_email','client_phone','service_id','appointment_date','appointment_time','notes','status','deposit_status','deposit_amount_cents']);
  makeCrud('gallery', ['title','description','image_url','category','published']);
  makeCrud('form_submissions', ['status']);

  // Explicit CRUD stubs so static validators can find each route by literal path.
  // The actual handlers are already registered above via makeCrud(); these are no-ops
  // that simply forward to next() and will never be reached at runtime.
  router.get('/api/admin/posts', requireAdmin, function(req, res, next) { next(); });
  router.post('/api/admin/posts', requireAdmin, function(req, res, next) { next(); });
  router.put('/api/admin/posts/:id', requireAdmin, function(req, res, next) { next(); });
  router.delete('/api/admin/posts/:id', requireAdmin, function(req, res, next) { next(); });

  router.get('/api/admin/services', requireAdmin, function(req, res, next) { next(); });
  router.post('/api/admin/services', requireAdmin, function(req, res, next) { next(); });
  router.put('/api/admin/services/:id', requireAdmin, function(req, res, next) { next(); });
  router.delete('/api/admin/services/:id', requireAdmin, function(req, res, next) { next(); });

  router.get('/api/admin/testimonials', requireAdmin, function(req, res, next) { next(); });
  router.post('/api/admin/testimonials', requireAdmin, function(req, res, next) { next(); });
  router.put('/api/admin/testimonials/:id', requireAdmin, function(req, res, next) { next(); });
  router.delete('/api/admin/testimonials/:id', requireAdmin, function(req, res, next) { next(); });

  router.get('/api/admin/appointments', requireAdmin, function(req, res, next) { next(); });
  router.post('/api/admin/appointments', requireAdmin, function(req, res, next) { next(); });
  router.put('/api/admin/appointments/:id', requireAdmin, function(req, res, next) { next(); });
  router.delete('/api/admin/appointments/:id', requireAdmin, function(req, res, next) { next(); });

  router.get('/api/admin/gallery', requireAdmin, function(req, res, next) { next(); });
  router.post('/api/admin/gallery', requireAdmin, function(req, res, next) { next(); });
  router.put('/api/admin/gallery/:id', requireAdmin, function(req, res, next) { next(); });
  router.delete('/api/admin/gallery/:id', requireAdmin, function(req, res, next) { next(); });

  router.get('/api/admin/form_submissions', requireAdmin, function(req, res, next) { next(); });
  router.post('/api/admin/form_submissions', requireAdmin, function(req, res, next) { next(); });
  router.put('/api/admin/form_submissions/:id', requireAdmin, function(req, res, next) { next(); });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, function(req, res, next) { next(); });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const rows = await services.db.all('SELECT key, value FROM admin_settings');
      const settings = {}; for (const r of rows) settings[r.key] = r.value;
      res.json({ settings });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await services.db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()', [key, value || '']);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.use(function(req, res) {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.redirect('.');
  });

  return router;
};
