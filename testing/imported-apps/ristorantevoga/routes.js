module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  // ===========================================================================
  // i18n — UI chrome (FR default + full EN). Page copy lives in admin_settings
  // (<key>_fr / <key>_en), read via the sx() helper, so it is fully editable.
  // ===========================================================================
  const T = {
    fr: {
      brand: 'Ristorante Voga',
      nav_home: 'Accueil', nav_story: 'Histoire', nav_menu: 'Menu', nav_wine: 'Vins',
      nav_tasting: 'Dégustation', nav_gallery: 'Galerie', nav_contact: 'Contact',
      reserve: 'Réservez', reserve_aria: 'Réserver une table',
      order_takeout: 'Commande pour emporter', order_takeout_short: 'Emporter',
      view_full_menu: 'Voir le menu complet', view_wine: 'Voir la carte des vins',
      back_home: "Retour à l'accueil",
      per_person: 'par personne', from: 'dès',
      glass: 'Verre', bottle: 'Bouteille',
      menu_categories: 'Nos sections', items_count: 'plats', item_count: 'plat',
      signature_more: 'Découvrir tout le menu',
      wine_empty: "La carte des vins complète est présentée en salle. Demandez-la à votre serveur — et n'hésitez pas à nous écrire pour une suggestion.",
      tasting_empty_note: 'Le détail des services est dévoilé en salle.',
      reviews_empty: "Les avis de nos invités apparaîtront ici. Vous avez aimé votre soirée ? Partagez votre expérience.",
      leave_review: 'Laisser un avis Google',
      gallery_empty: 'La galerie sera bientôt en ligne.',
      hours_title: "Heures d'ouverture", hours_tbd: 'Horaire communiqué en salle et par téléphone.',
      address: 'Adresse', phone: 'Téléphone', email: 'Courriel',
      get_directions: "Obtenir l'itinéraire",
      day_mon: 'Lundi', day_tue: 'Mardi', day_wed: 'Mercredi', day_thu: 'Jeudi',
      day_fri: 'Vendredi', day_sat: 'Samedi', day_sun: 'Dimanche', closed: 'Fermé',
      reservation_soon_title: 'Réservation en ligne bientôt disponible',
      reservation_soon_body: "En attendant, écrivez-nous ou appelez-nous pour réserver votre table.",
      reservation_call: 'Nous appeler', reservation_write: 'Nous écrire',
      contact_name: 'Nom', contact_email: 'Courriel', contact_phone: 'Téléphone (optionnel)',
      contact_subject: 'Sujet', contact_message: 'Message', contact_send: 'Envoyer le message',
      contact_sending: 'Envoi…', contact_success: 'Merci ! Votre message a bien été envoyé.',
      contact_success_note: 'Rappel : pour réserver une table, utilisez le bouton « Réservez ».',
      contact_error: "Une erreur est survenue. Réessayez ou écrivez-nous directement par courriel.",
      contact_required: 'Veuillez remplir les champs requis.',
      follow_us: 'Suivez-nous', footer_rights: 'Tous droits réservés',
      not_for_reservations: 'Ce formulaire ne sert pas aux réservations.',
      skip_to_content: 'Aller au contenu'
    },
    en: {
      brand: 'Ristorante Voga',
      nav_home: 'Home', nav_story: 'Story', nav_menu: 'Menu', nav_wine: 'Wine',
      nav_tasting: 'Tasting', nav_gallery: 'Gallery', nav_contact: 'Contact',
      reserve: 'Reserve', reserve_aria: 'Reserve a table',
      order_takeout: 'Order Takeout', order_takeout_short: 'Takeout',
      view_full_menu: 'See the full menu', view_wine: 'See the wine list',
      back_home: 'Back to home',
      per_person: 'per person', from: 'from',
      glass: 'Glass', bottle: 'Bottle',
      menu_categories: 'Our sections', items_count: 'dishes', item_count: 'dish',
      signature_more: 'Explore the full menu',
      wine_empty: 'Our full wine list is presented at your table. Ask your server — and feel free to write to us for a suggestion.',
      tasting_empty_note: 'The courses are revealed in the dining room.',
      reviews_empty: 'Guest reviews will appear here. Enjoyed your evening? Share your experience.',
      leave_review: 'Leave a Google review',
      gallery_empty: 'The gallery will be online soon.',
      hours_title: 'Opening hours', hours_tbd: 'Hours shared in the dining room and by phone.',
      address: 'Address', phone: 'Phone', email: 'Email',
      get_directions: 'Get directions',
      day_mon: 'Monday', day_tue: 'Tuesday', day_wed: 'Wednesday', day_thu: 'Thursday',
      day_fri: 'Friday', day_sat: 'Saturday', day_sun: 'Sunday', closed: 'Closed',
      reservation_soon_title: 'Online booking coming soon',
      reservation_soon_body: 'In the meantime, write or call us to reserve your table.',
      reservation_call: 'Call us', reservation_write: 'Write to us',
      contact_name: 'Name', contact_email: 'Email', contact_phone: 'Phone (optional)',
      contact_subject: 'Subject', contact_message: 'Message', contact_send: 'Send message',
      contact_sending: 'Sending…', contact_success: 'Thank you! Your message has been sent.',
      contact_success_note: 'Reminder: to reserve a table, please use the “Reserve” button.',
      contact_error: 'Something went wrong. Try again or email us directly.',
      contact_required: 'Please fill in the required fields.',
      follow_us: 'Follow us', footer_rights: 'All rights reserved',
      not_for_reservations: 'This form cannot be used for reservations.',
      skip_to_content: 'Skip to content'
    }
  };

  // ===========================================================================
  // Helpers
  // ===========================================================================
  function formatPrice(p) {
    if (p == null || p === '') return '';
    return Number(p).toFixed(Number(p) % 1 === 0 ? 0 : 2) + ' $';
  }
  function pickLang(item, field, lang) {
    if (!item) return '';
    return item[field + '_' + lang] || item[field + '_fr'] || item[field] || '';
  }
  function parseSizes(raw) {
    if (!raw) return null;
    try {
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(arr) || !arr.length) return null;
      return arr
        .map(function(r){ return r && (r.label_fr || r.label_en || r.price != null) ? { label_fr: String(r.label_fr || r.label_en || ''), label_en: String(r.label_en || r.label_fr || ''), price: r.price == null || r.price === '' ? null : Number(r.price) } : null; })
        .filter(Boolean);
    } catch(e) { return null; }
  }
  // Displayed price for a menu item: a "13 / 18 $" range when sizes exist.
  function itemPriceLabel(item) {
    const sizes = parseSizes(item.sizes_json);
    if (sizes && sizes.length) {
      const prices = sizes.map(function(s){ return s.price; }).filter(function(p){ return p != null; });
      if (prices.length) return prices.map(function(p){ return Number(p) % 1 === 0 ? String(p) : Number(p).toFixed(2); }).join(' / ') + ' $';
    }
    return formatPrice(item.price);
  }
  const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];
  function parseHours(raw) {
    if (!raw) return null;
    try {
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(arr)) return null;
      const byDay = {};
      for (const row of arr) { if (row && row.day) byDay[String(row.day).toLowerCase()] = row; }
      return DAY_KEYS.map(function(d){ const r = byDay[d] || {}; return { day: d, open: r.open || '', close: r.close || '', closed: !!r.closed }; });
    } catch(e) { return null; }
  }
  function hoursHaveData(hours) {
    if (!hours) return false;
    return hours.some(function(r){ return r.closed || (r.open && r.close); });
  }
  // Today's open/closed status in the restaurant's timezone (America/Toronto).
  function todayStatus(hours) {
    if (!hours || !hours.length) return null;
    try {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      let wd = '', hh = '00', mm = '00';
      parts.forEach(function(p){ if (p.type === 'weekday') wd = p.value; if (p.type === 'hour') hh = p.value; if (p.type === 'minute') mm = p.value; });
      if (hh === '24') hh = '00';
      const map = { Mon:'mon', Tue:'tue', Wed:'wed', Thu:'thu', Fri:'fri', Sat:'sat', Sun:'sun' };
      const key = map[wd] || 'mon';
      const nowMin = parseInt(hh, 10) * 60 + parseInt(mm, 10);
      const row = hours.find(function(r){ return r.day === key; }) || null;
      if (!row || row.closed || !row.open || !row.close) return { key: key, closed: true, isOpen: false };
      function toMin(s){ const a = String(s).split(':'); return parseInt(a[0], 10) * 60 + parseInt(a[1] || '0', 10); }
      const o = toMin(row.open), c = toMin(row.close);
      const isOpen = c > o ? (nowMin >= o && nowMin < c) : (nowMin >= o || nowMin < c);
      return { key: key, closed: false, open: row.open, close: row.close, isOpen: isOpen };
    } catch(e) { return null; }
  }
  // Inject a Cloudinary transform after /upload/ (BARE urls stored in DB).
  function cimg(url, transform) {
    if (!url || typeof url !== 'string') return url || '';
    if (!transform || url.indexOf('/image/upload/') === -1) return url;
    if (url.indexOf('/image/upload/' + transform) !== -1) return url;
    return url.replace('/image/upload/', '/image/upload/' + transform + '/');
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]; });
  }

  async function getSettings() {
    try { const rows = await db.all('SELECT key, value FROM admin_settings'); const o = {}; rows.forEach(function(r){ o[r.key] = r.value; }); return o; }
    catch(e) { return {}; }
  }
  function resolveAdminEmail(settings) {
    return (settings && (settings.admin_email || settings.contact_email)) || (services.config && services.config.contactEmail) || '';
  }

  // ===========================================================================
  // Middleware — language + visit logging
  // ===========================================================================
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
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  async function renderCtx(req) {
    const settings = await getSettings();
    const lang = req.lang;
    const t = T[lang] || T.fr;
    // Bilingual settings getter: <key>_<lang> -> <key>_fr -> <key>
    const sx = function(key) {
      if (settings[key + '_' + lang] != null && settings[key + '_' + lang] !== '') return settings[key + '_' + lang];
      if (settings[key + '_fr'] != null && settings[key + '_fr'] !== '') return settings[key + '_fr'];
      return settings[key] != null ? settings[key] : '';
    };
    const address = settings.business_address || '';
    const placeId = settings.google_place_id || '';
    const lat = settings.map_lat || '', lng = settings.map_lng || '';
    // Accurate, keyless map: centre on the exact coordinates with a name label.
    // The operator can paste a Maps Embed API URL into map_embed_url for the
    // richer place card (it overrides this default).
    let mapEmbed = settings.map_embed_url || '';
    if (!mapEmbed) {
      if (lat && lng) mapEmbed = 'https://maps.google.com/maps?q=' + encodeURIComponent(lat + ',' + lng + ' (' + (settings.business_name || t.brand) + ')') + '&z=16&output=embed';
      else if (address) mapEmbed = 'https://maps.google.com/maps?q=' + encodeURIComponent(address) + '&z=16&output=embed';
    }
    const mapLink = settings.google_maps_uri || (address ? ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address) + (placeId ? '&query_place_id=' + encodeURIComponent(placeId) : '')) : '');
    const directionsLink = address ? ('https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(address) + (placeId ? '&destination_place_id=' + encodeURIComponent(placeId) : '')) : '';
    const rating = settings.google_rating ? { value: settings.google_rating, count: settings.google_rating_count || '' } : null;
    const hours = parseHours(settings.hours_json);
    return {
      t: t, lang: lang, settings: settings, sx: sx,
      formatPrice: formatPrice, itemPriceLabel: itemPriceLabel, pickLang: pickLang,
      parseSizes: parseSizes, cimg: cimg, hours: hours, hoursHaveData: hoursHaveData,
      mapEmbed: mapEmbed, mapLink: mapLink, directionsLink: directionsLink, rating: rating,
      placeId: placeId, today: todayStatus(hours), year: new Date().getFullYear()
    };
  }

  // ===========================================================================
  // Public pages
  // ===========================================================================
  async function loadHomeData(req) {
    const signatures = await db.all('SELECT * FROM menu_items WHERE is_signature = 1 AND available = 1 ORDER BY position ASC, id ASC').catch(function(){ return []; });
    const categories = await db.all(
      'SELECT c.*, (SELECT COUNT(*) FROM menu_items m WHERE m.category = c.slug AND m.available = 1) AS item_count ' +
      'FROM menu_categories c WHERE c.active = 1 ORDER BY c.position ASC, c.id ASC'
    ).catch(function(){ return []; });
    const wines = await db.all('SELECT * FROM wine_items WHERE available = 1 ORDER BY position ASC, id ASC LIMIT 6').catch(function(){ return []; });
    const wineCount = await db.get('SELECT COUNT(*) AS c FROM wine_items WHERE available = 1').catch(function(){ return { c: 0 }; });
    const tasting = await db.all('SELECT * FROM tasting_courses WHERE active = 1 ORDER BY position ASC, id ASC').catch(function(){ return []; });
    const promo = await db.get(
      'SELECT * FROM promotions WHERE active = 1 AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW()) ORDER BY position ASC, id ASC LIMIT 1'
    ).catch(function(){ return null; });
    const gallery = await db.all('SELECT * FROM gallery_images WHERE active = 1 ORDER BY position ASC, id ASC').catch(function(){ return []; });
    const reviews = await db.all('SELECT * FROM reviews WHERE active = 1 ORDER BY position ASC, id ASC').catch(function(){ return []; });
    return { signatures: signatures, categories: categories, wines: wines, wineCount: Number(wineCount && wineCount.c || 0), tasting: tasting, promo: promo, gallery: gallery, reviews: reviews };
  }

  router.get('/', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const data = await loadHomeData(req);
      res.render('index', Object.assign(ctx, data));
    } catch(e) { console.error('Home error:', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/menu', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const categories = await db.all('SELECT * FROM menu_categories WHERE active = 1 ORDER BY position ASC, id ASC').catch(function(){ return []; });
      const menu = await db.all(
        'SELECT m.* FROM menu_items m LEFT JOIN menu_categories c ON c.slug = m.category ORDER BY COALESCE(c.position, 999999) ASC, m.position ASC, m.id ASC'
      ).catch(function(){ return []; });
      res.render('menu', Object.assign(ctx, { categories: categories, menu: menu }));
    } catch(e) { console.error('Menu error:', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/vins', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const wines = await db.all('SELECT * FROM wine_items WHERE available = 1 ORDER BY category ASC, position ASC, id ASC').catch(function(){ return []; });
      res.render('vins', Object.assign(ctx, { wines: wines }));
    } catch(e) { console.error('Wine error:', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/contact', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      res.render('contact', ctx);
    } catch(e) { console.error('Contact error:', e.message); res.status(500).send('Erreur'); }
  });

  // Native takeout ordering — talks to the linked Liasse Restaurants business
  // (#649) at its own host. Liasse owns pricing/tax/OTP/geofence/hours; this
  // page only renders the menu, collects input and calls those endpoints.
  // See READFIRST-liasse-ordering.md.
  router.get('/commander', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const orderBaseUrl = (ctx.settings.order_base_url || 'https://restaurant-vog-saint860.liasse.tech').replace(/\/+$/, '');
      res.render('commander', Object.assign(ctx, { orderBaseUrl: orderBaseUrl }));
    } catch(e) { console.error('Commander error:', e.message); res.status(500).send('Erreur'); }
  });

  // ===========================================================================
  // Ordering accounts & history (Option A — per-app mirror). See
  // READFIRST-liasse-ordering.md ("Ordering accounts & order history").
  // Liasse stays the source of truth; we bridge its OTP-verified phone into a
  // tenant user (platform-provisioned per-app `users` table) and mirror the
  // placed order into a tenant `orders` table so the current order + 90-day
  // history persist for the customer regardless of navigation.
  // ===========================================================================
  let jwtLib = null; try { jwtLib = require('jsonwebtoken'); } catch(e) { jwtLib = null; }
  const _fetch = (typeof fetch === 'function') ? fetch : null;
  const authMod = services.auth || {};
  const optionalAuth = (typeof authMod.optionalAuth === 'function') ? authMod.optionalAuth : function(req, res, next){ next(); };
  function orderBaseFrom(settings){ return (settings.order_base_url || 'https://restaurant-vog-saint860.liasse.tech').replace(/\/+$/, ''); }
  async function fetchLiasseOrder(base, id){
    if (!_fetch || !base || !id) return null;
    try { const r = await _fetch(base + '/order/orders/' + encodeURIComponent(id)); if (!r.ok) return null; return await r.json(); }
    catch(e) { return null; }
  }

  // Bridge a Liasse OTP token ({ phone, verified:true }, signed with the shared
  // JWT_SECRET) into a 30-day tenant session — same shape the platform's
  // optionalAuth/requireAuth expect: { userId, tenantSlug }.
  router.post('/api/order/session', async function(req, res) {
    try {
      if (!jwtLib || !services.jwtSecret) return res.status(503).json({ error: 'auth_unavailable' });
      const token = req.body && req.body.token;
      if (!token) return res.status(400).json({ error: 'missing_token' });
      let payload;
      try { payload = jwtLib.verify(token, services.jwtSecret); } catch(e) { return res.status(401).json({ error: 'invalid_token' }); }
      if (!payload || payload.verified !== true || !payload.phone) return res.status(401).json({ error: 'not_verified' });
      const phone = String(payload.phone);
      let user = null;
      try { user = (typeof authMod.getUserByPhone === 'function') ? await authMod.getUserByPhone(phone) : await db.get('SELECT * FROM users WHERE phone = $1', [phone]); } catch(e) { user = null; }
      if (!user) {
        const r = await db.run('INSERT INTO users (phone, phone_verified, created_at, updated_at) VALUES ($1, 1, NOW(), NOW()) ON CONFLICT (phone) DO UPDATE SET phone_verified = 1, updated_at = NOW() RETURNING id', [phone]);
        user = { id: r.lastInsertRowid, phone: phone };
      } else {
        await db.run('UPDATE users SET phone_verified = 1, updated_at = NOW() WHERE id = $1', [user.id]).catch(function(){});
      }
      const slug = (services.config && services.config.slug) || 'ristorantevoga';
      const sessionToken = jwtLib.sign({ userId: user.id, tenantSlug: slug }, services.jwtSecret, { expiresIn: '30d' });
      try { res.cookie('tenant_token', sessionToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax', secure: true, path: '/' }); } catch(e) {}
      res.json({ success: true, token: sessionToken, user: { id: user.id } });
    } catch(e) { console.error('order/session error:', e.message); res.status(500).json({ error: e.message }); }
  });

  // Mirror a placed order under the signed-in user. The server fetches the
  // authoritative record from Liasse — it never trusts client-sent totals.
  router.post('/api/order/record', optionalAuth, async function(req, res) {
    try {
      if (!req.user) return res.status(401).json({ error: 'no_session' });
      const id = req.body && (req.body.liasseOrderId || req.body.orderId);
      if (!id) return res.status(400).json({ error: 'missing_order' });
      const settings = await getSettings();
      const o = await fetchLiasseOrder(orderBaseFrom(settings), id);
      if (!o) return res.status(502).json({ error: 'fetch_failed' });
      await db.run(
        'INSERT INTO orders (user_id, liasse_order_id, order_number, order_type, status, items, subtotal_cents, total_cents, tax_breakdown, customer_name, pickup_time, created_at, updated_at) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW()) ' +
        'ON CONFLICT (liasse_order_id) DO UPDATE SET status = EXCLUDED.status, total_cents = EXCLUDED.total_cents, tax_breakdown = EXCLUDED.tax_breakdown, pickup_time = EXCLUDED.pickup_time, updated_at = NOW()',
        [req.user.id, String(id), o.order_number || null, o.order_type || 'takeout', o.status || 'pending', JSON.stringify(o.items || []), o.subtotal_cents != null ? o.subtotal_cents : null, o.total_cents != null ? o.total_cents : null, o.tax_breakdown ? JSON.stringify(o.tax_breakdown) : null, o.customer_name || null, o.pickup_time || null]
      );
      res.json({ success: true });
    } catch(e) { console.error('order/record error:', e.message); res.status(500).json({ error: e.message }); }
  });

  // The signed-in user's last-90-days orders; refresh non-terminal statuses
  // from Liasse (read-time write-through, no webhook needed).
  router.get('/api/order/history', optionalAuth, async function(req, res) {
    try {
      if (!req.user) return res.json({ authenticated: false, orders: [] });
      const rows = await db.all("SELECT id, liasse_order_id, order_number, order_type, status, items, subtotal_cents, total_cents, tax_breakdown, pickup_time, created_at FROM orders WHERE user_id = $1 AND created_at > NOW() - INTERVAL '90 days' ORDER BY created_at DESC", [req.user.id]).catch(function(){ return []; });
      const settings = await getSettings();
      const base = orderBaseFrom(settings);
      for (const row of rows) {
        if (row.status !== 'completed' && row.status !== 'cancelled') {
          const o = await fetchLiasseOrder(base, row.liasse_order_id);
          if (o && o.status && o.status !== row.status) {
            await db.run('UPDATE orders SET status = $1, pickup_time = COALESCE($2, pickup_time), updated_at = NOW() WHERE id = $3', [o.status, o.pickup_time || null, row.id]).catch(function(){});
            row.status = o.status;
          }
        }
      }
      res.json({ authenticated: true, orders: rows });
    } catch(e) { console.error('order/history error:', e.message); res.status(500).json({ error: e.message }); }
  });

  // Public contact-form submission. Stores the message and best-effort emails
  // the admin. NOT a reservation channel.
  router.post('/api/contact', async function(req, res) {
    try {
      const b = req.body || {};
      const name = (b.name || '').toString().trim().slice(0, 200);
      const email = (b.email || '').toString().trim().slice(0, 200);
      const phone = (b.phone || '').toString().trim().slice(0, 60);
      const subject = (b.subject || '').toString().trim().slice(0, 200);
      const message = (b.message || '').toString().trim().slice(0, 4000);
      const locale = (b.locale === 'en' ? 'en' : 'fr');
      if (!name || !email || !message) return res.status(400).json({ error: 'missing_fields' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'invalid_email' });

      let stored = false;
      try { await db.run('INSERT INTO contact_messages (name,email,phone,subject,message,locale) VALUES ($1,$2,$3,$4,$5,$6)', [name, email, phone, subject, message, locale]); stored = true; }
      catch(e) { console.error('contact store error:', e.message); }

      try {
        const settings = await getSettings();
        const to = resolveAdminEmail(settings);
        if (to && services.email && typeof services.email.send === 'function') {
          const appName = (services.config && services.config.displayName) || 'Ristorante Voga';
          const safe = function(s){ return escapeHtml(s).replace(/\n/g, '<br>'); };
          const html =
            '<div style="font-family:Georgia,\'Times New Roman\',serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;color:#26221f">' +
            '<h2 style="color:#6e1b2a;margin:0 0 16px;font-weight:600">Nouveau message — ' + escapeHtml(appName) + '</h2>' +
            '<p style="margin:.3rem 0"><strong>Nom :</strong> ' + safe(name) + '</p>' +
            '<p style="margin:.3rem 0"><strong>Courriel :</strong> ' + safe(email) + '</p>' +
            (phone ? '<p style="margin:.3rem 0"><strong>Téléphone :</strong> ' + safe(phone) + '</p>' : '') +
            (subject ? '<p style="margin:.3rem 0"><strong>Sujet :</strong> ' + safe(subject) + '</p>' : '') +
            '<hr style="border:none;border-top:1px solid #eee;margin:16px 0">' +
            '<div style="font-size:15px;line-height:1.6">' + safe(message) + '</div>' +
            '<hr style="border:none;border-top:1px solid #eee;margin:16px 0">' +
            '<p style="font-size:12px;color:#888;margin:0">Formulaire de contact (non lié aux réservations).</p>' +
            '</div>';
          var subjName = name.replace(/[\r\n]+/g, ' ').slice(0, 120);
          await services.email.send({ to: to, subject: appName + ' — Message de ' + subjName, html: html, replyTo: email }).catch(function(err){ console.error('contact email error:', err && err.message); });
        }
      } catch(e) { console.error('contact email block error:', e.message); }

      if (!stored) return res.status(500).json({ error: 'store_failed' });
      res.json({ success: true });
    } catch(e) { console.error('contact error:', e.message); res.status(500).json({ error: e.message }); }
  });

  // ===========================================================================
  // Admin
  // ===========================================================================
  function isAdminPage(req, res, next) { if (!services.admin.isAdmin(req)) return res.redirect('admin/login'); next(); }
  function isAdminApi(req, res, next) { if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' }); next(); }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    const num = async function(sql){ try { const r = await db.get(sql); return r && r.c != null ? Number(r.c) : 0; } catch(e){ return 0; } };
    const stats = {
      visits: await num('SELECT COUNT(*) AS c FROM site_visits'),
      visits7: await num("SELECT COUNT(*) AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'"),
      menu: await num('SELECT COUNT(*) AS c FROM menu_items'),
      wines: await num('SELECT COUNT(*) AS c FROM wine_items'),
      gallery: await num('SELECT COUNT(*) AS c FROM gallery_images'),
      reviews: await num('SELECT COUNT(*) AS c FROM reviews'),
      messages: await num('SELECT COUNT(*) AS c FROM contact_messages'),
      newMessages: await num('SELECT COUNT(*) AS c FROM contact_messages WHERE handled = 0')
    };
    res.render('admin', { stats: stats, page: 'dashboard' });
  });

  router.get('/admin/menu', isAdminPage, function(req, res) { res.render('admin-menu', { page: 'menu' }); });
  router.get('/admin/wine', isAdminPage, function(req, res) { res.render('admin-wine', { page: 'wine' }); });
  router.get('/admin/tasting', isAdminPage, function(req, res) { res.render('admin-tasting', { page: 'tasting' }); });
  router.get('/admin/gallery', isAdminPage, function(req, res) { res.render('admin-gallery', { page: 'gallery' }); });
  router.get('/admin/reviews', isAdminPage, function(req, res) { res.render('admin-reviews', { page: 'reviews' }); });
  router.get('/admin/promotions', isAdminPage, function(req, res) { res.render('admin-promotions', { page: 'promotions' }); });
  router.get('/admin/reservation', isAdminPage, async function(req, res) {
    const settings = await getSettings();
    res.render('admin-reservation', { page: 'reservation', settings: settings, lang: req.lang });
  });
  router.get('/admin/settings', isAdminPage, function(req, res) { res.render('admin-settings', { page: 'settings', lang: req.lang }); });
  router.get('/admin/messages', isAdminPage, function(req, res) { res.render('admin-messages', { page: 'messages' }); });

  // ----- Module field definitions (drives the generic admin CRUD shell) -----
  const WINE_CATEGORIES = ['Vino Bianco', 'Vino Rosé', 'Vino Rosso', 'Champagnes', 'Prosecco', 'Bulles', 'Doux & fortifié', 'Apéritif & digestif'];
  const GALLERY_CATEGORIES = ['interior', 'exterior', 'dishes', 'dessert', 'wine', 'drinks', 'atmosphere', 'decor', 'dining', 'staff', 'other'];
  router.get('/api/admin/modules', isAdminApi, function(req, res) {
    res.json({ modules: [
      { key: 'menu_items', label: 'Menu', fields: [
        { name: 'name_fr', label: 'Nom (FR)', type: 'text', required: true, maxLength: 120, description: 'Nom du plat (souvent en italien). Identique en FR et EN.', placeholder: 'ex. Risotto Vogà' },
        { name: 'name_en', label: 'Nom (EN)', type: 'text', maxLength: 120, description: 'Laissez vide pour reprendre le nom français.' },
        { name: 'description_fr', label: 'Description (FR)', type: 'textarea', description: 'Description en français.', placeholder: 'ex. Cinq fromages, huile de truffe & champignons sauvages.' },
        { name: 'description_en', label: 'Description (EN)', type: 'textarea', description: 'Description en anglais.' },
        { name: 'price', label: 'Prix ($)', type: 'number', min: 0, step: 0.01, description: 'Prix unique. Laissez vide si vous utilisez deux formats ci-dessous.', placeholder: '26' },
        { name: 'sizes_json', label: 'Deux formats (petite / grande)', type: 'size_list', description: 'Pour les plats à deux prix (ex. 13 $ / 18 $). Si rempli, remplace le prix unique.' },
        { name: 'category', label: 'Section', type: 'select_dynamic', source: 'menu_categories', valueField: 'slug', labelField: 'name_fr', editable: true, description: 'Choisissez une section, renommez-la ou créez-en une.' },
        { name: 'image_url', label: 'Photo', type: 'image', description: 'Photo du plat (optionnelle). Recommandé : 1200×900 px (4:3).' },
        { name: 'is_signature', label: 'Spécialité (page d\'accueil)', type: 'boolean', default: false, description: 'Mettre en vedette dans « Nos spécialités » sur la page d\'accueil.' },
        { name: 'available', label: 'Disponible', type: 'boolean', default: true, description: 'Décochez pour masquer sans supprimer.' }
      ] },
      { key: 'wine_items', label: 'Vins', fields: [
        { name: 'name_fr', label: 'Nom du vin', type: 'text', required: true, maxLength: 160, description: 'Nom / cuvée du vin.', placeholder: 'ex. Chianti Classico Riserva' },
        { name: 'name_en', label: 'Nom (EN)', type: 'text', maxLength: 160, description: 'Optionnel.' },
        { name: 'producer', label: 'Producteur', type: 'text', maxLength: 160, description: 'Maison / domaine.' },
        { name: 'varietal', label: 'Cépage', type: 'text', maxLength: 120, description: 'ex. Sangiovese' },
        { name: 'region_fr', label: 'Région (FR)', type: 'text', maxLength: 120, description: 'ex. Toscane, Italie' },
        { name: 'region_en', label: 'Région (EN)', type: 'text', maxLength: 120 },
        { name: 'vintage', label: 'Millésime', type: 'text', maxLength: 20, description: 'ex. 2019' },
        { name: 'description_fr', label: 'Note (FR)', type: 'textarea', description: 'Brève note de dégustation (optionnelle).' },
        { name: 'description_en', label: 'Note (EN)', type: 'textarea' },
        { name: 'price_glass', label: 'Prix au verre ($)', type: 'number', min: 0, step: 0.01, description: 'Laissez vide si non offert au verre.' },
        { name: 'price_bottle', label: 'Prix à la bouteille ($)', type: 'number', min: 0, step: 0.01 },
        { name: 'category', label: 'Catégorie', type: 'select', options: WINE_CATEGORIES, description: 'Type de vin.' },
        { name: 'position', label: 'Ordre', type: 'number', default: 0, description: 'Plus petit = en premier.' },
        { name: 'available', label: 'Disponible', type: 'boolean', default: true }
      ] },
      { key: 'tasting_courses', label: 'Menu dégustation', fields: [
        { name: 'title_fr', label: 'Service (FR)', type: 'text', required: true, maxLength: 160, description: 'Titre du service.', placeholder: 'ex. Antipasto — Burrata & prosciutto' },
        { name: 'title_en', label: 'Service (EN)', type: 'text', maxLength: 160 },
        { name: 'description_fr', label: 'Description (FR)', type: 'textarea' },
        { name: 'description_en', label: 'Description (EN)', type: 'textarea' },
        { name: 'position', label: 'Ordre', type: 'number', default: 0, description: 'Ordre des services (1, 2, 3…).' },
        { name: 'active', label: 'Actif', type: 'boolean', default: true }
      ] },
      { key: 'gallery_images', label: 'Galerie', fields: [
        { name: 'image_url', label: 'Photo', type: 'image', required: true, description: 'Photo de la galerie.' },
        { name: 'alt_fr', label: 'Texte alternatif (FR)', type: 'text', maxLength: 200, description: 'Description pour l\'accessibilité et le référencement (unique par image).' },
        { name: 'alt_en', label: 'Texte alternatif (EN)', type: 'text', maxLength: 200 },
        { name: 'caption_fr', label: 'Légende (FR)', type: 'text', maxLength: 200, description: 'Légende affichée (optionnelle).' },
        { name: 'caption_en', label: 'Légende (EN)', type: 'text', maxLength: 200 },
        { name: 'category', label: 'Catégorie', type: 'select', options: GALLERY_CATEGORIES, description: 'Pour le filtrage de la galerie.' },
        { name: 'position', label: 'Ordre', type: 'number', default: 0 },
        { name: 'active', label: 'Visible', type: 'boolean', default: true }
      ] },
      { key: 'reviews', label: 'Avis', fields: [
        { name: 'author', label: 'Auteur', type: 'text', required: true, maxLength: 120, description: 'Nom de l\'invité (n\'ajoutez que de vrais avis).' },
        { name: 'rating', label: 'Note (1-5)', type: 'number', min: 1, max: 5, default: 5 },
        { name: 'quote_fr', label: 'Avis (FR)', type: 'textarea', description: 'Texte de l\'avis.' },
        { name: 'quote_en', label: 'Avis (EN)', type: 'textarea', description: 'Traduction (optionnelle).' },
        { name: 'source', label: 'Source', type: 'text', maxLength: 80, description: 'ex. Google, OpenTable' },
        { name: 'review_date', label: 'Date', type: 'text', maxLength: 40, description: 'ex. Octobre 2025 (texte libre).' },
        { name: 'position', label: 'Ordre', type: 'number', default: 0 },
        { name: 'active', label: 'Visible', type: 'boolean', default: true }
      ] },
      { key: 'promotions', label: 'Promotions', fields: [
        { name: 'title_fr', label: 'Titre (FR)', type: 'text', required: true, maxLength: 160 },
        { name: 'title_en', label: 'Titre (EN)', type: 'text', maxLength: 160 },
        { name: 'description_fr', label: 'Description (FR)', type: 'textarea' },
        { name: 'description_en', label: 'Description (EN)', type: 'textarea' },
        { name: 'badge_fr', label: 'Étiquette (FR)', type: 'text', maxLength: 40, description: 'ex. À l\'affiche' },
        { name: 'badge_en', label: 'Étiquette (EN)', type: 'text', maxLength: 40 },
        { name: 'image_url', label: 'Image', type: 'image', description: 'Recommandé : 1200×900 px (4:3).' },
        { name: 'cta_label_fr', label: 'Bouton (FR)', type: 'text', maxLength: 40, description: 'ex. Réservez' },
        { name: 'cta_label_en', label: 'Bouton (EN)', type: 'text', maxLength: 40 },
        { name: 'cta_url', label: 'Lien du bouton', type: 'text', maxLength: 300, description: 'ex. #reservation ou une URL complète.' },
        { name: 'starts_at', label: 'Début', type: 'datetime', description: 'Laissez vide pour activer immédiatement.' },
        { name: 'ends_at', label: 'Fin', type: 'datetime', description: 'Laissez vide pour ne pas expirer.' },
        { name: 'position', label: 'Ordre', type: 'number', default: 0 },
        { name: 'active', label: 'Active', type: 'boolean', default: true }
      ] }
    ] });
  });

  // ----- Generic CRUD helpers -----
  function adminInsert(table, allowedFields, body) {
    const b = body || {}; const cols = [], vals = [], phs = []; let i = 1;
    allowedFields.forEach(function(f){ if (b[f] !== undefined) { cols.push(f); vals.push(b[f] === '' ? null : b[f]); phs.push('$' + i); i++; } });
    if (!cols.length) return null;
    return { sql: 'INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + phs.join(',') + ') RETURNING id', vals: vals };
  }
  function adminUpdate(table, allowedFields, body, id) {
    const b = body || {}; const sets = [], vals = []; let i = 1;
    allowedFields.forEach(function(f){ if (b[f] !== undefined) { sets.push(f + ' = $' + i); vals.push(b[f] === '' ? null : b[f]); i++; } });
    if (!sets.length) return null;
    sets.push('updated_at = NOW()'); vals.push(id);
    return { sql: 'UPDATE ' + table + ' SET ' + sets.join(', ') + ' WHERE id = $' + i, vals: vals };
  }
  function crud(moduleKey, table, fields, opts) {
    opts = opts || {};
    router.get('/api/admin/' + moduleKey, isAdminApi, async function(req, res) {
      try { const rows = await db.all('SELECT * FROM ' + table + ' ORDER BY ' + (opts.orderBy || 'position ASC, id ASC')); const out = {}; out[moduleKey] = rows; res.json(out); }
      catch(e) { res.status(500).json({ error: e.message }); }
    });
    router.post('/api/admin/' + moduleKey, isAdminApi, async function(req, res) {
      try {
        const b = Object.assign({}, req.body || {});
        if ((b.position == null || b.position === '') && fields.indexOf('position') !== -1) {
          try { const r = await db.get('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM ' + table); b.position = (r && r.next != null) ? Number(r.next) : 0; } catch(_) { b.position = 0; }
        }
        const q = adminInsert(table, fields, b);
        if (!q) return res.status(400).json({ error: 'No fields' });
        const r = await db.run(q.sql, q.vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [r.lastInsertRowid]);
        res.json({ item: row, id: r.lastInsertRowid });
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
    router.put('/api/admin/' + moduleKey + '/:id', isAdminApi, async function(req, res) {
      try { const q = adminUpdate(table, fields, req.body, req.params.id); if (!q) return res.status(400).json({ error: 'No fields' }); await db.run(q.sql, q.vals); const row = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [req.params.id]); res.json({ item: row }); }
      catch(e) { res.status(500).json({ error: e.message }); }
    });
    router.delete('/api/admin/' + moduleKey + '/:id', isAdminApi, async function(req, res) {
      try { await db.run('DELETE FROM ' + table + ' WHERE id = $1', [req.params.id]); res.json({ success: true }); }
      catch(e) { res.status(500).json({ error: e.message }); }
    });
  }

  // menu_items has bespoke list ordering + reorder, so register it directly.
  const MENU_FIELDS = ['name_fr','name_en','description_fr','description_en','price','sizes_json','category','image_url','is_signature','available','position'];
  router.get('/api/admin/menu_items', isAdminApi, async function(req, res) {
    try { const rows = await db.all('SELECT m.* FROM menu_items m LEFT JOIN menu_categories c ON c.slug = m.category ORDER BY COALESCE(c.position, 999999) ASC, m.position ASC, m.id ASC'); res.json({ menu_items: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/menu_items', isAdminApi, async function(req, res) {
    try {
      const b = Object.assign({}, req.body || {});
      if (b.position == null || b.position === '') {
        try { const r = await db.get('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM menu_items WHERE category IS NOT DISTINCT FROM $1', [b.category || null]); b.position = (r && r.next != null) ? Number(r.next) : 0; } catch(_) { b.position = 0; }
      }
      const q = adminInsert('menu_items', MENU_FIELDS, b);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM menu_items WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row, id: r.lastInsertRowid });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/menu_items/reorder', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {}; const ids = Array.isArray(b.ordered_ids) ? b.ordered_ids : []; const category = b.category == null ? null : String(b.category);
      if (!ids.length) return res.status(400).json({ error: 'no_ids' });
      let i = 0;
      for (const rawId of ids) {
        const id = parseInt(rawId, 10); if (!id) continue;
        if (category === null) await db.run('UPDATE menu_items SET position = $1, updated_at = NOW() WHERE id = $2 AND category IS NULL', [i, id]);
        else await db.run('UPDATE menu_items SET position = $1, updated_at = NOW() WHERE id = $2 AND category = $3', [i, id, category]);
        i++;
      }
      res.json({ success: true, updated: i });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/menu_items/:id', isAdminApi, async function(req, res) {
    try { const q = adminUpdate('menu_items', MENU_FIELDS, req.body, req.params.id); if (!q) return res.status(400).json({ error: 'No fields' }); await db.run(q.sql, q.vals); const row = await db.get('SELECT * FROM menu_items WHERE id = $1', [req.params.id]); res.json({ item: row }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/menu_items/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM menu_items WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // menu_categories (source for the select_dynamic + inline create/rename)
  function slugify(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60); }
  router.get('/api/admin/menu_categories', isAdminApi, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM menu_categories ORDER BY position ASC, id ASC'); res.json({ menu_categories: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/menu_categories', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {}; const nameFr = (b.name_fr || '').toString().trim(); if (!nameFr) return res.status(400).json({ error: 'name_required' });
      let base = slugify(b.slug || nameFr) || ('cat-' + Date.now()); let slug = base; let n = 2;
      while (await db.get('SELECT 1 FROM menu_categories WHERE slug = $1', [slug])) { slug = base + '-' + n; n++; }
      const posRow = await db.get('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM menu_categories').catch(function(){ return { next: 0 }; });
      const r = await db.run('INSERT INTO menu_categories (slug, name_fr, name_en, position) VALUES ($1,$2,$3,$4) RETURNING id', [slug, nameFr, (b.name_en || '').toString().trim() || null, posRow && posRow.next != null ? Number(posRow.next) : 0]);
      const row = await db.get('SELECT * FROM menu_categories WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/menu_categories/:id', isAdminApi, async function(req, res) {
    try { const q = adminUpdate('menu_categories', ['name_fr','name_en','subtitle_fr','subtitle_en','position','active'], req.body, req.params.id); if (!q) return res.status(400).json({ error: 'No fields' }); await db.run(q.sql, q.vals); const row = await db.get('SELECT * FROM menu_categories WHERE id = $1', [req.params.id]); res.json({ item: row }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/menu_categories/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM menu_categories WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Remaining modules via the generic helper.
  crud('wine_items', 'wine_items', ['name_fr','name_en','producer','varietal','region_fr','region_en','vintage','description_fr','description_en','price_glass','price_bottle','category','position','available'], { orderBy: 'category ASC, position ASC, id ASC' });
  crud('tasting_courses', 'tasting_courses', ['title_fr','title_en','description_fr','description_en','position','active']);
  crud('gallery_images', 'gallery_images', ['image_url','alt_fr','alt_en','caption_fr','caption_en','category','position','active']);
  crud('reviews', 'reviews', ['author','rating','quote_fr','quote_en','source','review_date','position','active']);
  crud('promotions', 'promotions', ['title_fr','title_en','description_fr','description_en','badge_fr','badge_en','image_url','cta_label_fr','cta_label_en','cta_url','starts_at','ends_at','position','active']);

  // ----- Settings + uploads -----
  router.get('/api/admin/settings', isAdminApi, async function(req, res) {
    try { const rows = await db.all('SELECT key, value FROM admin_settings'); const o = {}; rows.forEach(function(r){ o[r.key] = r.value; }); res.json({ settings: o }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  const SITE_SETTINGS_ALLOWED = new Set([
    'business_name','established_year','tagline_fr','tagline_en','seo_description_fr','seo_description_en',
    'admin_email','contact_email','contact_phone','business_address','map_embed_url','hours_json',
    'google_place_id','google_maps_uri','map_lat','map_lng','google_rating','google_rating_count','order_base_url',
    'hero_kicker_fr','hero_kicker_en','hero_title_fr','hero_title_en','hero_subtitle_fr','hero_subtitle_en',
    'story_title_fr','story_title_en','story_kicker_fr','story_kicker_en','story_body_fr','story_body_en',
    'signature_title_fr','signature_title_en','signature_intro_fr','signature_intro_en',
    'menu_title_fr','menu_title_en','menu_intro_fr','menu_intro_en',
    'wine_title_fr','wine_title_en','wine_intro_fr','wine_intro_en','wine_fineprint_fr','wine_fineprint_en',
    'tasting_title_fr','tasting_title_en','tasting_kicker_fr','tasting_kicker_en','tasting_price','tasting_intro_fr','tasting_intro_en',
    'reservation_mode','reservation_embed_code','reservation_url','reservation_title_fr','reservation_title_en','reservation_intro_fr','reservation_intro_en','reservation_note_fr','reservation_note_en',
    'contact_title_fr','contact_title_en','contact_intro_fr','contact_intro_en','contact_disclaimer_fr','contact_disclaimer_en',
    'location_title_fr','location_title_en','location_intro_fr','location_intro_en',
    'reviews_title_fr','reviews_title_en','reviews_intro_fr','reviews_intro_en',
    'gallery_title_fr','gallery_title_en','gallery_intro_fr','gallery_intro_en',
    'footer_intro_fr','footer_intro_en',
    'social_facebook','social_instagram','social_twitter','social_tiktok','social_youtube','social_linkedin',
    '_p_nav_logo_url','_p_hero_image_url','_p_hero_image_2_url','_p_hero_image_3_url','_p_story_image_url','_p_atmosphere_image_url','_p_wine_image_url','_p_tasting_image_url','_p_promo_image_url','_p_location_image_url','_p_reservation_image_url'
  ]);
  router.put('/api/admin/site_settings', isAdminApi, async function(req, res) {
    try {
      const incoming = (req.body && req.body.settings) || {};
      const keys = Object.keys(incoming).filter(function(k){ return SITE_SETTINGS_ALLOWED.has(k); });
      for (const k of keys) {
        const v = incoming[k];
        await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v == null ? '' : String(v)]);
      }
      res.json({ success: true, saved: keys.length });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/upload', isAdminApi, async function(req, res) {
    try {
      const dataUri = req.body && req.body.dataUri;
      if (!dataUri) return res.status(400).json({ error: 'Missing dataUri' });
      if (!services.cloudinary || !services.cloudinary.uploader) return res.status(503).json({ error: 'Upload service unavailable' });
      const result = await services.cloudinary.uploader.upload(dataUri, { folder: (services.config.slug || 'ristorantevoga') + '/admin' });
      res.json({ url: result.secure_url });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ----- Contact messages (admin) -----
  router.get('/api/admin/contact_messages', isAdminApi, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 500'); res.json({ contact_messages: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/contact_messages/:id', isAdminApi, async function(req, res) {
    try { const handled = (req.body && req.body.handled) ? 1 : 0; await db.run('UPDATE contact_messages SET handled = $1 WHERE id = $2', [handled, req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/contact_messages/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM contact_messages WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  return router;
};
