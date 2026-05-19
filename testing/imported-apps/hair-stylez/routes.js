module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const T = {
    fr: {
      nav_home: 'Accueil', nav_services: 'Services', nav_team: 'Équipe', nav_book: 'Réserver', nav_blog: 'Magazine', nav_contact: 'Contact',
      btn_login: 'Connexion', btn_book: 'Réserver', btn_submit: 'Envoyer', btn_send: 'Envoyer le message', btn_view_all: 'Tout voir', btn_back: 'Retour',
      btn_book_with: 'Réserver avec', btn_continue: 'Continuer', btn_confirm: 'Confirmer la réservation',
      label_name: 'Nom complet', label_email: 'Courriel', label_phone: 'Téléphone', label_message: 'Message', label_notes: 'Notes (optionnel)',
      label_service: 'Service', label_stylist: 'Coiffeur', label_date: 'Date', label_time: 'Heure', label_duration: 'Durée', label_price: 'Prix',
      step_service: 'Choisissez un service', step_stylist: 'Choisissez votre coiffeur', step_datetime: 'Choisissez date et heure', step_info: 'Vos informations',
      success_booking: 'Votre demande de réservation a été envoyée. Nous vous contacterons sous peu pour confirmer.',
      success_message: 'Message envoyé avec succès. Nous vous répondrons rapidement.',
      error_generic: 'Une erreur s\'est produite. Veuillez réessayer.',
      empty_services: 'Les services seront affichés ici prochainement.',
      empty_stylists: 'L\'équipe sera présentée ici prochainement.',
      empty_posts: 'Le magazine sera publié bientôt.',
      empty_slots: 'Aucun créneau disponible à cette date. Essayez une autre journée.',
      minutes: 'min', from: 'à partir de', any_stylist: 'Sans préférence', select_date_first: 'Sélectionnez une date pour voir les disponibilités',
      footer_hours: 'Heures d\'ouverture', footer_follow: 'Suivez-nous', footer_contact: 'Contact',
      hero_badge: 'Salon de coiffure professionnel',
      read_more: 'Lire la suite', published_on: 'Publié le',
      contact_intro: 'Une question? Un commentaire? Écrivez-nous.',
      your_appointment: 'Votre rendez-vous', confirm_intro: 'Vérifiez les détails de votre rendez-vous avant de confirmer.',
      no_account_needed: 'Aucun compte requis pour réserver. La connexion permet de retrouver vos rendez-vous.',
      get_directions: 'Itinéraire', directions_google: 'Ouvrir dans Google Maps',
      reviews_title: 'Avis Google', reviews_based_on: 'basé sur', reviews_total: 'avis',
      boutique_info: 'Informations', boutique_address: 'Adresse', boutique_hours: 'Heures d\'ouverture', boutique_contact: 'Contact'
    },
    en: {
      nav_home: 'Home', nav_services: 'Services', nav_team: 'Team', nav_book: 'Book', nav_blog: 'Magazine', nav_contact: 'Contact',
      btn_login: 'Sign In', btn_book: 'Book Now', btn_submit: 'Submit', btn_send: 'Send Message', btn_view_all: 'View all', btn_back: 'Back',
      btn_book_with: 'Book with', btn_continue: 'Continue', btn_confirm: 'Confirm booking',
      label_name: 'Full name', label_email: 'Email', label_phone: 'Phone', label_message: 'Message', label_notes: 'Notes (optional)',
      label_service: 'Service', label_stylist: 'Stylist', label_date: 'Date', label_time: 'Time', label_duration: 'Duration', label_price: 'Price',
      step_service: 'Choose a service', step_stylist: 'Choose your stylist', step_datetime: 'Choose date & time', step_info: 'Your information',
      success_booking: 'Your booking request has been sent. We will contact you shortly to confirm.',
      success_message: 'Message sent successfully. We will reply soon.',
      error_generic: 'An error occurred. Please try again.',
      empty_services: 'Services will be listed here soon.',
      empty_stylists: 'Our team will be introduced here soon.',
      empty_posts: 'The magazine will be published soon.',
      empty_slots: 'No slots available on this date. Try another day.',
      minutes: 'min', from: 'from', any_stylist: 'No preference', select_date_first: 'Select a date to see availability',
      footer_hours: 'Opening hours', footer_follow: 'Follow us', footer_contact: 'Contact',
      hero_badge: 'Professional hair salon',
      read_more: 'Read more', published_on: 'Published on',
      contact_intro: 'A question? A comment? Write to us.',
      your_appointment: 'Your appointment', confirm_intro: 'Review your appointment details before confirming.',
      no_account_needed: 'No account required to book. Signing in lets you retrieve your appointments.',
      get_directions: 'Get Directions', directions_google: 'Open in Google Maps',
      reviews_title: 'Google Reviews', reviews_based_on: 'based on', reviews_total: 'reviews',
      boutique_info: 'Visit Us', boutique_address: 'Address', boutique_hours: 'Opening Hours', boutique_contact: 'Contact'
    }
  };

  function applyTextOverrides(t, settings, lang) {
    for (const k in settings) {
      if (k.indexOf('text_') === 0 && k.lastIndexOf('_' + lang) === k.length - lang.length - 1) {
        const tKey = k.slice(5, k.length - lang.length - 1);
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  async function getSettings() {
    const rows = await db.all('SELECT key, value FROM admin_settings');
    const s = {};
    for (const r of rows) s[r.key] = r.value;
    return s;
  }

  function pickLang(req, res) {
    let lang = req.query.lang || req.cookies?.pwa_lang || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query.lang) {
      res.cookie('pwa_lang', lang, { maxAge: 365*24*60*60*1000, httpOnly: false });
    }
    return lang;
  }

  function localized(obj, field, lang) {
    if (lang === 'en' && obj[field + '_en']) return obj[field + '_en'];
    return obj[field] || '';
  }

  function formatPrice(p) {
    if (p === null || p === undefined) return '';
    return Number(p).toFixed(0) + ' $';
  }

  function formatDate(d, lang) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch(e) { return d; }
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  async function baseLocals(req, res) {
    const lang = pickLang(req, res);
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[lang]), settings, lang);
    return { lang, settings, t, localized, formatPrice, formatDate };
  }

  router.get('/', async function(req, res) {
    try {
      const locals = await baseLocals(req, res);
      const services = await db.all('SELECT * FROM services WHERE active=1 ORDER BY featured DESC, sort_order ASC LIMIT 6');
      const stylists = await db.all('SELECT * FROM stylists WHERE active=1 ORDER BY sort_order ASC LIMIT 3');
      const posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', Object.assign({}, locals, { services, stylists, posts, page: 'home' }));
    } catch(e) { console.error('home error:', e.message); res.status(500).send('Error'); }
  });

  router.get('/services', async function(req, res) {
    const locals = await baseLocals(req, res);
    const services = await db.all('SELECT * FROM services WHERE active=1 ORDER BY sort_order ASC');
    res.render('services', Object.assign({}, locals, { services, page: 'services' }));
  });

  router.get('/equipe', async function(req, res) {
    const locals = await baseLocals(req, res);
    const stylists = await db.all('SELECT * FROM stylists WHERE active=1 ORDER BY sort_order ASC');
    res.render('team', Object.assign({}, locals, { stylists, page: 'team' }));
  });

  router.get('/equipe/:id', async function(req, res) {
    const locals = await baseLocals(req, res);
    const stylist = await db.get('SELECT * FROM stylists WHERE id=$1 AND active=1', [req.params.id]);
    if (!stylist) return res.redirect('equipe');
    const availability = await db.all('SELECT * FROM stylist_availability WHERE stylist_id=$1 ORDER BY day_of_week', [stylist.id]);
    res.render('stylist', Object.assign({}, locals, { stylist, availability, page: 'team' }));
  });

  router.get('/magazine', async function(req, res) {
    const locals = await baseLocals(req, res);
    const posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC');
    res.render('blog', Object.assign({}, locals, { posts, page: 'blog' }));
  });

  router.get('/magazine/:id', async function(req, res) {
    const locals = await baseLocals(req, res);
    const post = await db.get('SELECT * FROM posts WHERE id=$1 AND published=1', [req.params.id]);
    if (!post) return res.redirect('magazine');
    res.render('post', Object.assign({}, locals, { post, page: 'blog' }));
  });

  router.get('/reservation', services.auth.optionalAuth, async function(req, res) {
    const locals = await baseLocals(req, res);
    const svcs = await db.all('SELECT * FROM services WHERE active=1 ORDER BY sort_order ASC');
    const stylists = await db.all('SELECT * FROM stylists WHERE active=1 ORDER BY sort_order ASC');
    res.render('booking', Object.assign({}, locals, { services: svcs, stylists, user: req.user || null, preselectedService: req.query.service || null, preselectedStylist: req.query.stylist || null, page: 'book' }));
  });

  // Enhanced contact route with map + reviews
  router.get('/contact', async function(req, res) {
    const locals = await baseLocals(req, res);
    const mapsApiKey = services.google ? services.google.mapsApiKey : '';
    const googlePlaceId = locals.settings.google_place_id || '';

    // Fetch Google Reviews if Place ID is configured
    let reviewsData = { reviews: [], rating: null, totalRatings: 0 };
    if (googlePlaceId && mapsApiKey) {
      try {
        const reviewsUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(googlePlaceId)}?key=${mapsApiKey}`;
        const resp = await services.fetch(reviewsUrl, {
          headers: { 'X-Goog-FieldMask': 'reviews,rating,userRatingCount' }
        });
        if (resp && resp.ok) {
          const data = await resp.json();
          reviewsData.reviews = (data.reviews || []).slice(0, 5);
          reviewsData.rating = data.rating || null;
          reviewsData.totalRatings = data.userRatingCount || 0;
        }
      } catch(e) { console.error('Google Reviews fetch failed:', e.message); }
    }

    res.render('contact', Object.assign({}, locals, { page: 'contact', mapsApiKey, googlePlaceId, reviewsData }));
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const { name, email, phone, message } = req.body;
      if (!name || !message) return res.status(400).json({ error: 'Missing fields' });
      await db.run('INSERT INTO form_submissions (form_type, name, email, phone, message) VALUES ($1,$2,$3,$4,$5)', ['contact', name, email||'', phone||'', message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message de contact - Hair Stylez', html: '<h2>Nouveau message</h2><p><b>Nom:</b> ' + name + '</p><p><b>Courriel:</b> ' + (email||'') + '</p><p><b>Téléphone:</b> ' + (phone||'') + '</p><p><b>Message:</b><br>' + String(message).replace(/\n/g,'<br>') + '</p>' });
        }
      } catch(e) { console.error('email failed:', e.message); }
      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.get('/api/availability', async function(req, res) {
    try {
      const stylistId = req.query.stylist;
      const date = req.query.date;
      const serviceId = req.query.service;
      if (!date) return res.json({ slots: [] });
      const service = serviceId ? await db.get('SELECT * FROM services WHERE id=$1', [serviceId]) : null;
      const duration = service ? (service.duration_minutes || 60) : 60;
      const dateObj = new Date(date + 'T00:00:00');
      const dow = dateObj.getDay();

      let stylistIds = [];
      if (stylistId && stylistId !== 'any') {
        stylistIds = [parseInt(stylistId)];
      } else {
        const all = await db.all('SELECT id FROM stylists WHERE active=1');
        stylistIds = all.map(s => s.id);
      }

      const slotsByTime = {};
      for (const sid of stylistIds) {
        const avail = await db.all('SELECT * FROM stylist_availability WHERE stylist_id=$1 AND day_of_week=$2', [sid, dow]);
        const timeOff = await db.get('SELECT id FROM stylist_time_off WHERE stylist_id=$1 AND off_date=$2', [sid, date]);
        if (timeOff) continue;
        const booked = await db.all("SELECT appointment_time, duration_minutes FROM appointments WHERE stylist_id=$1 AND appointment_date=$2 AND status != 'cancelled'", [sid, date]);
        const bookedRanges = booked.map(b => {
          const [h,m] = b.appointment_time.split(':').map(Number);
          const start = h*60+m;
          return [start, start + (b.duration_minutes||60)];
        });

        for (const a of avail) {
          const [sh,sm] = a.start_time.split(':').map(Number);
          const [eh,em] = a.end_time.split(':').map(Number);
          const startMin = sh*60+sm;
          const endMin = eh*60+em;
          for (let t = startMin; t + duration <= endMin; t += 30) {
            const conflict = bookedRanges.some(([bs,be]) => t < be && (t + duration) > bs);
            if (conflict) continue;
            const hh = String(Math.floor(t/60)).padStart(2,'0');
            const mm = String(t%60).padStart(2,'0');
            const key = hh + ':' + mm;
            if (!slotsByTime[key]) slotsByTime[key] = [];
            if (!slotsByTime[key].includes(sid)) slotsByTime[key].push(sid);
          }
        }
      }
      const slots = Object.keys(slotsByTime).sort().map(time => ({ time, stylistIds: slotsByTime[time] }));
      res.json({ slots });
    } catch(e) { console.error('avail error:', e.message); res.status(500).json({ error: 'Failed', slots: [] }); }
  });

  router.post('/api/book', services.auth.optionalAuth, async function(req, res) {
    try {
      const { service_id, stylist_id, appointment_date, appointment_time, client_name, client_email, client_phone, notes } = req.body;
      if (!service_id || !appointment_date || !appointment_time || !client_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const svc = await db.get('SELECT * FROM services WHERE id=$1', [service_id]);
      if (!svc) return res.status(400).json({ error: 'Invalid service' });
      const duration = svc.duration_minutes || 60;

      let finalStylistId = stylist_id && stylist_id !== 'any' ? parseInt(stylist_id) : null;
      if (!finalStylistId) {
        const dateObj = new Date(appointment_date + 'T00:00:00');
        const dow = dateObj.getDay();
        const [hh,mm] = appointment_time.split(':').map(Number);
        const reqStart = hh*60+mm;
        const reqEnd = reqStart + duration;
        const allStylists = await db.all('SELECT id FROM stylists WHERE active=1');
        for (const s of allStylists) {
          const av = await db.all('SELECT * FROM stylist_availability WHERE stylist_id=$1 AND day_of_week=$2', [s.id, dow]);
          const off = await db.get('SELECT id FROM stylist_time_off WHERE stylist_id=$1 AND off_date=$2', [s.id, appointment_date]);
          if (off) continue;
          const fitsAvail = av.some(a => {
            const [sh,sm] = a.start_time.split(':').map(Number);
            const [eh,em] = a.end_time.split(':').map(Number);
            return (sh*60+sm) <= reqStart && (eh*60+em) >= reqEnd;
          });
          if (!fitsAvail) continue;
          const booked = await db.all("SELECT appointment_time, duration_minutes FROM appointments WHERE stylist_id=$1 AND appointment_date=$2 AND status != 'cancelled'", [s.id, appointment_date]);
          const conflict = booked.some(b => {
            const [bh,bm] = b.appointment_time.split(':').map(Number);
            const bs = bh*60+bm;
            const be = bs + (b.duration_minutes||60);
            return reqStart < be && reqEnd > bs;
          });
          if (!conflict) { finalStylistId = s.id; break; }
        }
      }

      if (!finalStylistId) return res.status(409).json({ error: 'No stylist available for this slot' });

      const userId = req.user ? req.user.id : null;
      const r = await db.run('INSERT INTO appointments (user_id, stylist_id, service_id, client_name, client_email, client_phone, appointment_date, appointment_time, duration_minutes, notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id', [userId, finalStylistId, service_id, client_name, client_email||'', client_phone||'', appointment_date, appointment_time, duration, notes||'', 'pending']);

      const stylist = await db.get('SELECT * FROM stylists WHERE id=$1', [finalStylistId]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle réservation - Hair Stylez', html: '<h2>Nouvelle demande de réservation</h2><p><b>Client:</b> ' + client_name + '</p><p><b>Courriel:</b> ' + (client_email||'') + '</p><p><b>Téléphone:</b> ' + (client_phone||'') + '</p><p><b>Service:</b> ' + svc.name + '</p><p><b>Coiffeur:</b> ' + (stylist?stylist.name:'') + '</p><p><b>Date:</b> ' + appointment_date + ' à ' + appointment_time + '</p><p><b>Notes:</b> ' + (notes||'') + '</p>' });
        }
        if (client_email) {
          try { await services.email.send({ to: client_email, subject: 'Confirmation de demande - Hair Stylez', html: '<h2>Merci pour votre demande de réservation</h2><p>Bonjour ' + client_name + ',</p><p>Nous avons bien reçu votre demande de réservation pour le <b>' + appointment_date + ' à ' + appointment_time + '</b>.</p><p><b>Service:</b> ' + svc.name + '<br><b>Coiffeur:</b> ' + (stylist?stylist.name:'') + '</p><p>Nous vous contacterons sous peu pour confirmer. Le paiement se fait sur place au moment du rendez-vous.</p><p>À bientôt!<br>L\'équipe Hair Stylez</p>' }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch(e) { console.error('email failed:', e.message); }

      res.json({ success: true, appointmentId: r.lastInsertRowid });
    } catch(e) { console.error('book error:', e.message); res.status(500).json({ error: 'Booking failed' }); }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) {
      if (req.path.startsWith('/api/')) return res.status(403).json({ error: 'Forbidden' });
      return res.redirect('admin/login');
    }
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*) as c FROM site_visits')).c || 0;
      const recentVisits = (await db.get("SELECT COUNT(*) as c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c || 0;
      const apptCount = (await db.get('SELECT COUNT(*) as c FROM appointments')).c || 0;
      const pendingAppts = (await db.get("SELECT COUNT(*) as c FROM appointments WHERE status='pending'")).c || 0;
      const upcomingAppts = (await db.get("SELECT COUNT(*) as c FROM appointments WHERE appointment_date >= CURRENT_DATE AND status IN ('pending','confirmed')")).c || 0;
      const servicesCount = (await db.get('SELECT COUNT(*) as c FROM services')).c || 0;
      const stylistsCount = (await db.get('SELECT COUNT(*) as c FROM stylists')).c || 0;
      const postsCount = (await db.get('SELECT COUNT(*) as c FROM posts')).c || 0;
      const newMessages = (await db.get("SELECT COUNT(*) as c FROM form_submissions WHERE status='new'")).c || 0;
      const recentAppts = await db.all("SELECT a.*, s.name as service_name, st.name as stylist_name FROM appointments a LEFT JOIN services s ON a.service_id=s.id LEFT JOIN stylists st ON a.stylist_id=st.id ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT 8");
      res.render('admin', { stats: { userCount, pushCount, totalVisits, recentVisits, apptCount, pendingAppts, upcomingAppts, servicesCount, stylistsCount, postsCount, newMessages }, recentAppts, formatDate: (d)=>new Date(d).toLocaleDateString('fr-CA') });
    } catch(e) { console.error('admin error:', e.message); res.status(500).send('Admin error: ' + e.message); }
  });

  router.get('/admin/posts', requireAdmin, function(req, res) { res.render('admin-posts'); });
  router.get('/admin/services', requireAdmin, function(req, res) { res.render('admin-services'); });
  router.get('/admin/stylists', requireAdmin, function(req, res) { res.render('admin-stylists'); });
  router.get('/admin/stylist_availability', requireAdmin, function(req, res) { res.render('admin-stylist-availability'); });
  router.get('/admin/stylist_time_off', requireAdmin, function(req, res) { res.render('admin-stylist-time-off'); });
  router.get('/admin/appointments', requireAdmin, function(req, res) { res.render('admin-appointments'); });
  router.get('/admin/form_submissions', requireAdmin, function(req, res) { res.render('admin-form-submissions'); });

  // Admin settings page
  router.get('/admin/settings', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    const allSettings = await db.all('SELECT key, value FROM admin_settings ORDER BY key ASC');
    const settingsMap = {};
    for (const r of allSettings) settingsMap[r.key] = r.value;
    res.render('admin-settings', { settingsMap });
  });

  router.get('/admin/form-submissions', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
    res.render('admin-form-submissions', { items: items });
  });
  router.get('/admin/stylist-time-off', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM stylist_time_off ORDER BY created_at DESC');
    res.render('admin-stylist-time-off', { items: items });
  });
  router.get('/admin/stylist-availability', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM stylist_availability ORDER BY created_at DESC');
    res.render('admin-stylist-availability', { items: items });
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*) as c FROM site_visits')).c || 0;
      const recentVisits = (await db.get("SELECT COUNT(*) as c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c || 0;
      res.json({ userCount, pushSubscriberCount: pushCount, totalVisits, recentVisits });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Admin settings API — GET all, PUT/POST individual keys
  router.get('/api/admin/admin_settings', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings ORDER BY key ASC');
      const settings = {};
      for (const r of rows) settings[r.key] = r.value;
      res.json({ admin_settings: rows, settings });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/admin_settings/:key', requireAdmin, async function(req, res) {
    try {
      const key = req.params.key;
      const value = req.body.value !== undefined ? req.body.value : '';
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()', [key, value]);
      res.json({ success: true, key, value });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/admin_settings', requireAdmin, async function(req, res) {
    try {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: 'Key required' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()', [key, value||'']);
      res.json({ success: true, key, value: value||'' });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        { key: 'appointments', label: 'Rendez-vous', icon: 'calendar', fields: [
          { name: 'client_name', type: 'text', required: true, description: 'Nom du client', placeholder: 'ex. Marie Dupont' },
          { name: 'client_email', type: 'email', description: 'Courriel du client', placeholder: 'client@exemple.com' },
          { name: 'client_phone', type: 'text', description: 'Téléphone du client', placeholder: '514 555 1234' },
          { name: 'service_id', type: 'number', description: 'ID du service réservé (voir le module Services)', placeholder: '1' },
          { name: 'stylist_id', type: 'number', description: 'ID du coiffeur assigné (voir le module Coiffeurs)', placeholder: '1' },
          { name: 'appointment_date', type: 'date', required: true, description: 'Date du rendez-vous' },
          { name: 'appointment_time', type: 'text', required: true, description: 'Heure du rendez-vous au format HH:MM', placeholder: '14:30' },
          { name: 'duration_minutes', type: 'number', description: 'Durée en minutes', placeholder: '60', min: 15, step: 15 },
          { name: 'status', type: 'select', options: ['pending','confirmed','completed','cancelled','no_show'], description: 'État du rendez-vous' },
          { name: 'notes', type: 'textarea', description: 'Notes internes ou demandes spéciales du client' }
        ]},
        { key: 'services', label: 'Services', icon: 'scissors', fields: [
          { name: 'name', type: 'text', required: true, description: 'Nom du service en français', placeholder: 'ex. Coupe Femme' },
          { name: 'name_en', type: 'text', description: 'Nom du service en anglais', placeholder: 'ex. Women\'s Cut' },
          { name: 'description', type: 'textarea', description: 'Description du service en français' },
          { name: 'description_en', type: 'textarea', description: 'Description du service en anglais' },
          { name: 'duration_minutes', type: 'number', required: true, description: 'Durée standard en minutes', placeholder: '60', min: 15, step: 15 },
          { name: 'price', type: 'number', description: 'Prix en dollars', placeholder: '75', min: 0, step: 1 },
          { name: 'category', type: 'text', description: 'Catégorie (Coupe, Coloration, Soin, etc.)', placeholder: 'Coupe' },
          { name: 'image_url', type: 'image', description: 'Photo du service. Recommandé: 800x600px paysage' },
          { name: 'featured', type: 'boolean', description: 'Cocher pour mettre en vedette sur la page d\'accueil' },
          { name: 'active', type: 'boolean', default: true, description: 'Décocher pour masquer ce service du site' },
          { name: 'sort_order', type: 'number', description: 'Ordre d\'affichage (plus bas = affiché en premier)', placeholder: '0' }
        ]},
        { key: 'stylists', label: 'Coiffeurs', icon: 'users', fields: [
          { name: 'name', type: 'text', required: true, description: 'Nom complet du coiffeur', placeholder: 'ex. Camille Laurent' },
          { name: 'title', type: 'text', description: 'Titre / Spécialité (français)', placeholder: 'Coiffeuse senior - Coloration' },
          { name: 'title_en', type: 'text', description: 'Titre / Spécialité (anglais)', placeholder: 'Senior Stylist - Color' },
          { name: 'bio', type: 'textarea', description: 'Biographie en français' },
          { name: 'bio_en', type: 'textarea', description: 'Biographie en anglais' },
          { name: 'image_url', type: 'image', description: 'Photo de profil. Recommandé: carré 800x800px' },
          { name: 'instagram', type: 'text', description: 'Handle Instagram (avec @)', placeholder: '@camille.hair' },
          { name: 'email', type: 'email', description: 'Courriel (privé, optionnel)' },
          { name: 'phone', type: 'text', description: 'Téléphone (privé, optionnel)' },
          { name: 'active', type: 'boolean', default: true, description: 'Décocher pour masquer ce coiffeur du site' },
          { name: 'sort_order', type: 'number', description: 'Ordre d\'affichage', placeholder: '0' }
        ]},
        { key: 'stylist_availability', label: 'Disponibilités', icon: 'clock', fields: [
          { name: 'stylist_id', type: 'number', required: true, description: 'ID du coiffeur (voir le module Coiffeurs)', placeholder: '1' },
          { name: 'day_of_week', type: 'select', required: true, options: ['0','1','2','3','4','5','6'], description: 'Jour de la semaine: 0=Dimanche, 1=Lundi, 2=Mardi, 3=Mercredi, 4=Jeudi, 5=Vendredi, 6=Samedi' },
          { name: 'start_time', type: 'text', required: true, description: 'Heure de début au format HH:MM (24h)', placeholder: '09:00' },
          { name: 'end_time', type: 'text', required: true, description: 'Heure de fin au format HH:MM (24h)', placeholder: '19:00' }
        ]},
        { key: 'stylist_time_off', label: 'Congés', icon: 'calendar', fields: [
          { name: 'stylist_id', type: 'number', required: true, description: 'ID du coiffeur en congé' },
          { name: 'off_date', type: 'date', required: true, description: 'Date du congé' },
          { name: 'reason', type: 'text', description: 'Raison (optionnel, interne)', placeholder: 'Vacances' }
        ]},
        { key: 'posts', label: 'Magazine', icon: 'edit', fields: [
          { name: 'title', type: 'text', required: true, description: 'Titre en français', placeholder: 'ex. Les tendances de la saison' },
          { name: 'title_en', type: 'text', description: 'Titre en anglais' },
          { name: 'content', type: 'textarea', description: 'Contenu en français' },
          { name: 'content_en', type: 'textarea', description: 'Contenu en anglais' },
          { name: 'image_url', type: 'image', description: 'Image principale. Recommandé: 1200x630px' },
          { name: 'category', type: 'text', description: 'Catégorie', placeholder: 'Tendances' },
          { name: 'published', type: 'boolean', default: true, description: 'Décocher pour sauvegarder comme brouillon' }
        ]},
        { key: 'form_submissions', label: 'Messages reçus', icon: 'mail', fields: [
          { name: 'form_type', type: 'readonly', description: 'Type de formulaire' },
          { name: 'name', type: 'readonly', description: 'Nom du visiteur' },
          { name: 'email', type: 'readonly', description: 'Courriel' },
          { name: 'phone', type: 'readonly', description: 'Téléphone' },
          { name: 'message', type: 'textarea', description: 'Message reçu' },
          { name: 'status', type: 'select', options: ['new','read','replied','archived'], description: 'État' }
        ]}
      ]
    });
  });

  // Lookup endpoints used by admin shell for foreign-key dropdowns
  router.get('/api/admin/lookups/stylists', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT id, name FROM stylists ORDER BY sort_order ASC, name ASC'); res.json({ items: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.get('/api/admin/lookups/services', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT id, name FROM services ORDER BY sort_order ASC, name ASC'); res.json({ items: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- posts CRUD ---
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
      res.json({ posts: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const allowed = ['title','title_en','content','content_en','image_url','category','published'];
      const cols = [], vals = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { cols.push(f); vals.push('$' + i); i++; params.push(req.body[f]); }
      }
      if (!cols.length) return res.status(400).json({ error: 'No data' });
      const r = await db.run('INSERT INTO posts (' + cols.join(',') + ') VALUES (' + vals.join(',') + ') RETURNING id', params);
      const row = await db.get('SELECT * FROM posts WHERE id=$1', [r.lastInsertRowid]);
      res.json({ post: row, item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['title','title_en','content','content_en','image_url','category','published'];
      const sets = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { sets.push(f + '=$' + i); i++; params.push(req.body[f]); }
      }
      if (!sets.length) return res.status(400).json({ error: 'No data' });
      sets.push('updated_at=NOW()');
      params.push(req.params.id);
      await db.run('UPDATE posts SET ' + sets.join(',') + ' WHERE id=$' + i, params);
      const row = await db.get('SELECT * FROM posts WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- services CRUD ---
  router.get('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
      res.json({ services: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','name_en','description','description_en','duration_minutes','price','image_url','category','featured','active','sort_order'];
      const cols = [], vals = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { cols.push(f); vals.push('$' + i); i++; params.push(req.body[f]); }
      }
      if (!cols.length) return res.status(400).json({ error: 'No data' });
      const r = await db.run('INSERT INTO services (' + cols.join(',') + ') VALUES (' + vals.join(',') + ') RETURNING id', params);
      const row = await db.get('SELECT * FROM services WHERE id=$1', [r.lastInsertRowid]);
      res.json({ service: row, item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','name_en','description','description_en','duration_minutes','price','image_url','category','featured','active','sort_order'];
      const sets = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { sets.push(f + '=$' + i); i++; params.push(req.body[f]); }
      }
      if (!sets.length) return res.status(400).json({ error: 'No data' });
      sets.push('updated_at=NOW()');
      params.push(req.params.id);
      await db.run('UPDATE services SET ' + sets.join(',') + ' WHERE id=$' + i, params);
      const row = await db.get('SELECT * FROM services WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM services WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- stylists CRUD ---
  router.get('/api/admin/stylists', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM stylists ORDER BY sort_order ASC, id ASC');
      res.json({ stylists: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/stylists', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','title','title_en','bio','bio_en','image_url','instagram','email','phone','active','sort_order'];
      const cols = [], vals = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { cols.push(f); vals.push('$' + i); i++; params.push(req.body[f]); }
      }
      if (!cols.length) return res.status(400).json({ error: 'No data' });
      const r = await db.run('INSERT INTO stylists (' + cols.join(',') + ') VALUES (' + vals.join(',') + ') RETURNING id', params);
      const row = await db.get('SELECT * FROM stylists WHERE id=$1', [r.lastInsertRowid]);
      res.json({ stylist: row, item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/stylists/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','title','title_en','bio','bio_en','image_url','instagram','email','phone','active','sort_order'];
      const sets = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { sets.push(f + '=$' + i); i++; params.push(req.body[f]); }
      }
      if (!sets.length) return res.status(400).json({ error: 'No data' });
      sets.push('updated_at=NOW()');
      params.push(req.params.id);
      await db.run('UPDATE stylists SET ' + sets.join(',') + ' WHERE id=$' + i, params);
      const row = await db.get('SELECT * FROM stylists WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/stylists/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM stylists WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- stylist_availability CRUD ---
  router.get('/api/admin/stylist_availability', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT t.*, st.name as stylist_name FROM stylist_availability t LEFT JOIN stylists st ON t.stylist_id=st.id ORDER BY t.stylist_id ASC, t.day_of_week ASC');
      res.json({ stylist_availability: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/stylist_availability', requireAdmin, async function(req, res) {
    try {
      const allowed = ['stylist_id','day_of_week','start_time','end_time'];
      const cols = [], vals = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { cols.push(f); vals.push('$' + i); i++; params.push(req.body[f]); }
      }
      if (!cols.length) return res.status(400).json({ error: 'No data' });
      const r = await db.run('INSERT INTO stylist_availability (' + cols.join(',') + ') VALUES (' + vals.join(',') + ') RETURNING id', params);
      const row = await db.get('SELECT * FROM stylist_availability WHERE id=$1', [r.lastInsertRowid]);
      res.json({ stylist_availability: row, item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/stylist_availability/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['stylist_id','day_of_week','start_time','end_time'];
      const sets = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { sets.push(f + '=$' + i); i++; params.push(req.body[f]); }
      }
      if (!sets.length) return res.status(400).json({ error: 'No data' });
      sets.push('updated_at=NOW()');
      params.push(req.params.id);
      await db.run('UPDATE stylist_availability SET ' + sets.join(',') + ' WHERE id=$' + i, params);
      const row = await db.get('SELECT * FROM stylist_availability WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/stylist_availability/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM stylist_availability WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- stylist_time_off CRUD ---
  router.get('/api/admin/stylist_time_off', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT t.*, st.name as stylist_name FROM stylist_time_off t LEFT JOIN stylists st ON t.stylist_id=st.id ORDER BY t.off_date DESC');
      res.json({ stylist_time_off: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/stylist_time_off', requireAdmin, async function(req, res) {
    try {
      const allowed = ['stylist_id','off_date','reason'];
      const cols = [], vals = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { cols.push(f); vals.push('$' + i); i++; params.push(req.body[f]); }
      }
      if (!cols.length) return res.status(400).json({ error: 'No data' });
      const r = await db.run('INSERT INTO stylist_time_off (' + cols.join(',') + ') VALUES (' + vals.join(',') + ') RETURNING id', params);
      const row = await db.get('SELECT * FROM stylist_time_off WHERE id=$1', [r.lastInsertRowid]);
      res.json({ stylist_time_off: row, item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/stylist_time_off/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['stylist_id','off_date','reason'];
      const sets = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { sets.push(f + '=$' + i); i++; params.push(req.body[f]); }
      }
      if (!sets.length) return res.status(400).json({ error: 'No data' });
      sets.push('updated_at=NOW()');
      params.push(req.params.id);
      await db.run('UPDATE stylist_time_off SET ' + sets.join(',') + ' WHERE id=$' + i, params);
      const row = await db.get('SELECT * FROM stylist_time_off WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/stylist_time_off/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM stylist_time_off WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- appointments CRUD ---
  router.get('/api/admin/appointments', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT a.*, s.name as service_name, st.name as stylist_name FROM appointments a LEFT JOIN services s ON a.service_id=s.id LEFT JOIN stylists st ON a.stylist_id=st.id ORDER BY a.appointment_date DESC, a.appointment_time DESC');
      res.json({ appointments: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/appointments', requireAdmin, async function(req, res) {
    try {
      const allowed = ['client_name','client_email','client_phone','service_id','stylist_id','appointment_date','appointment_time','duration_minutes','status','notes'];
      const cols = [], vals = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { cols.push(f); vals.push('$' + i); i++; params.push(req.body[f]); }
      }
      if (!cols.length) return res.status(400).json({ error: 'No data' });
      const r = await db.run('INSERT INTO appointments (' + cols.join(',') + ') VALUES (' + vals.join(',') + ') RETURNING id', params);
      const row = await db.get('SELECT * FROM appointments WHERE id=$1', [r.lastInsertRowid]);
      res.json({ appointment: row, item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/appointments/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['client_name','client_email','client_phone','service_id','stylist_id','appointment_date','appointment_time','duration_minutes','status','notes'];
      const sets = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { sets.push(f + '=$' + i); i++; params.push(req.body[f]); }
      }
      if (!sets.length) return res.status(400).json({ error: 'No data' });
      sets.push('updated_at=NOW()');
      params.push(req.params.id);
      await db.run('UPDATE appointments SET ' + sets.join(',') + ' WHERE id=$' + i, params);
      const row = await db.get('SELECT * FROM appointments WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/appointments/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM appointments WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- form_submissions CRUD ---
  router.get('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
      res.json({ form_submissions: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','email','phone','message','status','form_type'];
      const cols = [], vals = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { cols.push(f); vals.push('$' + i); i++; params.push(req.body[f]); }
      }
      if (!cols.length) return res.status(400).json({ error: 'No data' });
      const r = await db.run('INSERT INTO form_submissions (' + cols.join(',') + ') VALUES (' + vals.join(',') + ') RETURNING id', params);
      const row = await db.get('SELECT * FROM form_submissions WHERE id=$1', [r.lastInsertRowid]);
      res.json({ form_submission: row, item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','email','phone','message','status','form_type'];
      const sets = [], params = []; let i = 1;
      for (const f of allowed) {
        if (req.body[f] !== undefined) { sets.push(f + '=$' + i); i++; params.push(req.body[f]); }
      }
      if (!sets.length) return res.status(400).json({ error: 'No data' });
      params.push(req.params.id);
      await db.run('UPDATE form_submissions SET ' + sets.join(',') + ' WHERE id=$' + i, params);
      const row = await db.get('SELECT * FROM form_submissions WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM form_submissions WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Catch-all: redirect unknown GET routes to PWA home (prevents "Cannot GET" errors)
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
