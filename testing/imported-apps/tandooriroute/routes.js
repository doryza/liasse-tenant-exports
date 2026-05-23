module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  const T = {
    fr: {
      brand: 'Tandoori Route',
      nav_home: 'Accueil', nav_menu: 'Menu', nav_delivery: 'Livraison', nav_about: 'À propos',
      login: 'Connexion', enable_notif: 'Activer les notifications',
      hero_title: 'Votre route vers la saveur',
      hero_subtitle: 'Cuisine indienne authentique à Blainville. Tandoor au feu, épices fraîches, biryanis & curries préparés à la commande.',
      cta_menu: 'Voir le menu', cta_visit: 'Nous visiter',
      menu_title: 'Notre menu', menu_subtitle: "Des plats préparés à la commande, du tandoor aux biryanis. Épices moulues maison.",
      delivery_title: 'Faites-vous livrer', delivery_subtitle: 'Commandez via vos plateformes préférées.',
      delivery_intro: 'Choisissez votre plateforme de livraison préférée.',
      about_title: 'Notre histoire',
      no_menu: 'Le menu sera bientôt disponible.',
      no_platforms: 'Aucune plateforme de livraison configurée pour le moment.',
      footer_rights: 'Tous droits réservés',
      contact_us: 'Nous joindre',
      view_full_menu: 'Voir tout le menu',
      order_now: 'Commander',
      back_home: 'Retour à l\'accueil',
      values_title: 'Notre route',
      val1_t: 'Tandoor au feu', val1_d: "Four d'argile à 480°C : viandes fumées en surface, tendres et juteuses à cœur.",
      val2_t: 'Premier à Blainville', val2_d: "Enfin un restaurant indien dans les Basses-Laurentides. Recettes familiales, sans compromis.",
      val3_t: 'Épices fraîches', val3_d: "Nos mélanges d'épices sont moulus en cuisine. Aucune poudre commerciale.",
      open_hours: 'Heures d\'ouverture', address: 'Adresse', phone: 'Téléphone', email: 'Courriel',
      latest_news: 'Dernières nouvelles', read_more: 'Lire plus',
      category_all: 'Tous',
      visit_title: 'Venez nous visiter', visit_subtitle: 'Le premier restaurant indien de Blainville vous accueille. Réservez votre place autour du tandoor.',
      visit_cta: "Voir l'adresse & les heures",
      day_mon: 'Lundi', day_tue: 'Mardi', day_wed: 'Mercredi', day_thu: 'Jeudi', day_fri: 'Vendredi', day_sat: 'Samedi', day_sun: 'Dimanche',
      closed: 'Fermé',
      follow_us: 'Nous suivre',
      nav_offers: 'Offres',
      offers_title: 'Offres spéciales', offers_subtitle: 'Réservez votre offre, présentez votre code en restaurant.',
      offers_empty: 'Aucune offre active pour l\'instant. Revenez bientôt!',
      offer_starts: 'Commence le', offer_ends: 'Expire le',
      offer_remaining: 'restantes',
      offer_only_left: 'Plus que',
      offer_only_left_low: 'Vite, plus que',
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
      brand: 'Tandoori Route',
      nav_home: 'Home', nav_menu: 'Menu', nav_delivery: 'Delivery', nav_about: 'About',
      login: 'Sign In', enable_notif: 'Enable notifications',
      hero_title: 'Your route to flavor',
      hero_subtitle: 'Authentic Indian cuisine in Blainville. Wood-fired tandoor, fresh spices, biryanis & curries made to order.',
      cta_menu: 'See the menu', cta_visit: 'Visit us',
      menu_title: 'Our menu', menu_subtitle: 'Made-to-order dishes — from the tandoor to the biryanis. House-ground spices.',
      delivery_title: 'Get it delivered', delivery_subtitle: 'Order via your favorite platforms.',
      delivery_intro: 'Pick your favorite delivery platform.',
      about_title: 'Our story',
      no_menu: 'Menu coming soon.',
      no_platforms: 'No delivery platforms configured yet.',
      footer_rights: 'All rights reserved',
      contact_us: 'Contact us',
      view_full_menu: 'View full menu',
      order_now: 'Order',
      back_home: 'Back to home',
      values_title: 'Our route',
      val1_t: 'Wood-fired tandoor', val1_d: 'Clay oven at 480°C — smoky on the outside, tender and juicy at the heart.',
      val2_t: 'First in Blainville', val2_d: "Finally an Indian restaurant in the Basses-Laurentides. Family recipes, no compromise.",
      val3_t: 'Fresh spices', val3_d: 'Our spice blends are ground in-house. No store-bought powders.',
      open_hours: 'Hours', address: 'Address', phone: 'Phone', email: 'Email',
      latest_news: 'Latest news', read_more: 'Read more',
      category_all: 'All',
      visit_title: 'Come visit us', visit_subtitle: 'The first Indian restaurant in Blainville welcomes you. Take a seat by the tandoor.',
      visit_cta: 'See address & hours',
      day_mon: 'Monday', day_tue: 'Tuesday', day_wed: 'Wednesday', day_thu: 'Thursday', day_fri: 'Friday', day_sat: 'Saturday', day_sun: 'Sunday',
      closed: 'Closed',
      follow_us: 'Follow us',
      nav_offers: 'Offers',
      offers_title: 'Special offers', offers_subtitle: 'Reserve an offer, show your code in-store.',
      offers_empty: 'No active offers right now. Check back soon!',
      offer_starts: 'Starts', offer_ends: 'Expires',
      offer_remaining: 'left',
      offer_only_left: 'Only',
      offer_only_left_low: 'Hurry — only',
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
    // claim_count is only populated by callers that selected it (the public
    // /offres list). When absent we treat the offer as having stock and let
    // the claim endpoint's own sold-out check enforce the cap at claim time.
    if (o.max_claims != null && Number(o.max_claims) > 0 && Number(o.claim_count || 0) >= Number(o.max_claims)) return 'sold_out';
    return 'active';
  }

  const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];
  function parseHours(raw) {
    if (!raw) return null;
    try {
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(arr)) return null;
      const byDay = {};
      for (const row of arr) {
        if (!row || !row.day) continue;
        byDay[String(row.day).toLowerCase()] = row;
      }
      return DAY_KEYS.map(function(d){
        const r = byDay[d] || {};
        return { day: d, open: r.open || '', close: r.close || '', closed: !!r.closed };
      });
    } catch(e) { return null; }
  }

  function resolveContactEmail(settings) {
    return (settings && (settings.admin_email || settings.contact_email)) || (services.config && services.config.contactEmail) || '';
  }

  function parseSizes(raw) {
    if (!raw) return null;
    try {
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(arr) || !arr.length) return null;
      return arr
        .map(function(r){ return r && (r.label_fr || r.label_en) ? { label_fr: String(r.label_fr || r.label_en || ''), label_en: String(r.label_en || r.label_fr || ''), price: r.price == null || r.price === '' ? null : Number(r.price) } : null; })
        .filter(Boolean);
    } catch(e) { return null; }
  }

  async function getMenuCategories() {
    try { return await db.all('SELECT * FROM menu_categories WHERE active = 1 ORDER BY id ASC'); }
    catch(e) { return []; }
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

  // =========================================================================
  // Keychain attribution middlewares — MUST be registered BEFORE the route
  // handlers (Express middleware only applies to subsequent routes). Earlier
  // version had these below /offres etc. → never fired on the landing pages.
  // =========================================================================
  function tpath(req, sub) {
    return typeof req.tenantPath === 'function' ? req.tenantPath(sub) : sub;
  }

  // Step 1: capture ?keychain= into a year-long httpOnly cookie. Sanity-
  // checked shape so the URL can't poison the cookie. Verbose log so the
  // first reproduction attempt produces a clear breadcrumb in server logs.
  router.use(function captureKeychainCookie(req, res, next) {
    if (req.method === 'GET' && req.query && typeof req.query.keychain === 'string') {
      var k = req.query.keychain.trim();
      if (/^[A-Za-z0-9_-]{4,64}$/.test(k)) {
        try {
          res.cookie('keychain_attribution', k, {
            maxAge: 365 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
          });
          console.log('[keychain-mw] captured keychain=' + k + ' path=' + req.path);
        } catch (e) {
          console.warn('[keychain-mw] cookie set failed:', e && e.message);
        }
      } else if (k) {
        console.warn('[keychain-mw] rejected malformed keychain param: ' + k);
      }
    }
    next();
  });

  // Step 2: post-auth attribution + upsell. services.auth.optionalAuth
  // populates req.user when a session exists. Wraps everything in try/catch
  // so a DB or email failure here can never break a page render.
  router.use(services.auth.optionalAuth, async function attributeKeychainOnLogin(req, res, next) {
    try {
      var hasUser = !!(req.user && req.user.id);
      var hasCookie = !!(req.cookies && req.cookies.keychain_attribution);
      // Verbose state log on EVERY non-asset, non-API request — only way to
      // see when the keychain cookie is present but req.user isn't (means
      // services.auth.optionalAuth didn't recognize the session). Filter out
      // assets/api so log volume stays sane. Remove once the flow is proven.
      if (
        req.method === 'GET' &&
        !req.path.startsWith('/api/') &&
        !req.path.includes('.')
      ) {
        var cookieKeys = req.cookies ? Object.keys(req.cookies) : [];
        console.log(
          '[keychain-mw:probe] path=' + req.path +
          ' hasUser=' + hasUser +
          ' hasCookie=' + hasCookie +
          ' cookies=[' + cookieKeys.join(',') + ']'
        );
      }
      if (!hasUser || !hasCookie) return next();

      const keychainId = req.cookies.keychain_attribution;
      const userId = req.user.id;

      // ON CONFLICT must include the partial-index WHERE clause to match
      // the schema's `keychain_visitors_user_keychain_idx ... WHERE user_id
      // IS NOT NULL`. Without it Postgres throws:
      //   "there is no unique or exclusion constraint matching the ON
      //    CONFLICT specification"
      // because a partial unique index requires the conflict target to
      // include the same predicate.
      const inserted = await db.run(
        `INSERT INTO keychain_visitors (user_id, email, full_name, keychain_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (user_id, keychain_id) WHERE user_id IS NOT NULL DO NOTHING
         RETURNING id`,
        [userId, req.user.email || null, req.user.full_name || req.user.name || null, keychainId]
      );
      // PgTenantDb.run returns { changes, lastInsertRowid } (better-sqlite3
      // style), NOT raw pg's { rows, rowCount }. Earlier check read
      // inserted.rows[0]?.id which was always undefined → wasFirstAttribution
      // stayed false → row got inserted but upsell + show-review cookie were
      // never triggered. Use lastInsertRowid (which RETURNING id populates)
      // as the "is this the first attribution?" signal.
      const wasFirstAttribution = !!(inserted && inserted.lastInsertRowid);
      const insertedRowId = inserted && inserted.lastInsertRowid;

      if (wasFirstAttribution) {
        console.log('[keychain-mw] FIRST attribution recorded id=' + insertedRowId + ' user=' + userId + ' keychain=' + keychainId);
        // Pass the visitor's locale (from the tenant lang middleware) so
        // sendTapContactUpsellEmail can localize the body. Falls back to
        // req.user.preferred_language if the platform user record has one
        // (some pwa_users rows carry it), else 'en'.
        const visitorLang = (req.lang === 'fr' || req.lang === 'en')
          ? req.lang
          : (req.user && req.user.preferred_language) || 'en';
        sendTapContactUpsellEmail({
          user_id: userId,
          email: req.user.email,
          full_name: req.user.full_name || req.user.name,
          keychain_id: keychainId,
          insertedId: insertedRowId,
          lang: visitorLang,
        }).catch(function (err) {
          console.error('[keychain-mw] TapContact upsell failed:', err && err.message);
        });
        try {
          res.cookie('keychain_show_review', '1', {
            maxAge: 30 * 60 * 1000,
            httpOnly: false,
            sameSite: 'lax',
          });
        } catch (_) { /* noop */ }
        try { res.clearCookie('keychain_attribution'); } catch (_) {}
      } else {
        console.log('[keychain-mw] already attributed (no-op) user=' + userId + ' keychain=' + keychainId);
        // Still consume the cookie so we don't keep re-attempting.
        try { res.clearCookie('keychain_attribution'); } catch (_) {}
      }
    } catch (err) {
      console.error('[keychain-mw] middleware error:', err && err.message, err && err.stack);
    }
    next();
  });

  // Quick debug endpoint: dumps current attribution state for the logged-in
  // user. Returns JSON. Useful for verifying middleware ran without having
  // to scrape server logs. Safe to leave in — exposes only the user's own
  // attribution rows. Hit /api/keychain-debug from the browser console
  // after logging in.
  router.get('/api/keychain-debug', services.auth.optionalAuth, async function (req, res) {
    try {
      const userId = req.user && req.user.id;
      const cookies = req.cookies || {};
      const rows = userId
        ? await db.all(
            'SELECT id, user_id, email, keychain_id, upsell_sent_at, created_at FROM keychain_visitors WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
            [userId]
          )
        : [];
      res.json({
        loggedIn: !!userId,
        userId: userId || null,
        userEmail: req.user && req.user.email || null,
        cookieKeychainAttribution: cookies.keychain_attribution || null,
        cookieShowReview: cookies.keychain_show_review || null,
        cookieTenantTokenPresent: !!cookies.tenant_token,
        attributions: rows,
      });
    } catch (err) {
      res.status(500).json({ error: err && err.message });
    }
  });

  // Helper: send the TapContact upsell. Localized via visitor.lang (set
  // by the attribution middleware from req.lang). Link points at the
  // TapContact homepage with ?keychain=<id> appended — the homepage
  // (views/home.ejs in tapavis-admin) detects the param and shows the
  // "You seem to already have a keychain! Activate your subscription"
  // prompt that links to /subscribe/<id>. This lets the homepage own
  // the activation CTA copy instead of duplicating it in this email.
  async function sendTapContactUpsellEmail(visitor) {
    if (!visitor || !visitor.email || !visitor.keychain_id) {
      console.warn('[keychain-mw] upsell skipped — missing email or keychain on visitor row:', JSON.stringify(visitor));
      return;
    }
    const appName = (services.config && services.config.displayName) || 'Tandoori Route';
    const homeUrl = 'https://tapcontact.ca/?keychain=' + encodeURIComponent(visitor.keychain_id);
    const isFr = visitor.lang === 'fr';

    const subject = isFr
      ? 'Vous avez un porte-clés TapContact'
      : 'You have a TapContact keychain';
    const greeting = isFr ? 'Bonjour !' : 'Hey!';
    const intro = isFr
      ? 'Nous remarquons que vous avez acquis un porte-clés de <strong>' + appName + '</strong>. Transformez-le en carte de contact personnelle ou de carte d\'affaires en créant votre profil ici :'
      : 'We notice you acquired a keychain from <strong>' + appName + '</strong>. Make it your personal contact card or business card by creating a profile here:';
    const ctaLabel = isFr ? 'Activer mon abonnement' : 'Activate my subscription';
    const benefits = isFr
      ? 'Partage illimité de votre profil TapContact <strong>à vie</strong> — paiement unique de 12,95 $.'
      : 'Unlimited sharing of your TapContact profile <strong>for life</strong> — one-time $12.95.';
    const fallback = isFr
      ? 'Si le bouton ne fonctionne pas, copiez ce lien :'
      : 'If the button does not work, copy this link:';

    const html = '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">' +
      '<h2 style="margin:0 0 16px;font-size:20px">' + greeting + '</h2>' +
      '<p style="line-height:1.6">' + intro + '</p>' +
      '<p style="text-align:center;margin:24px 0"><a href="' + homeUrl + '" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700">' + ctaLabel + '</a></p>' +
      '<p style="line-height:1.6">' + benefits + '</p>' +
      '<p style="color:#888;font-size:12px;margin-top:24px">' + fallback + '<br>' + homeUrl + '</p>' +
      '</div>';
    await services.email.send({
      to: visitor.email,
      from: { email: 'contact@tapcontact.ca', name: 'TapContact' },
      subject: subject,
      html: html,
    });
    const stampId = visitor.insertedId || visitor.id;
    if (stampId) {
      await db.run(
        'UPDATE keychain_visitors SET upsell_sent_at = NOW(), updated_at = NOW() WHERE id = $1',
        [stampId]
      );
    }
    console.log('[keychain-mw] TapContact upsell sent to ' + visitor.email + ' (keychain=' + visitor.keychain_id + ' lang=' + visitor.lang + ')');
  }

  // Reads google_place_id from the PLATFORM table public.subscriber_pwas.
  // The admin sets it in tapavis-admin → AI Builder → Apps → "Set Place ID"
  // (NOT in this tenant's admin_settings). PgTenantDb sets search_path to
  // "tenant_<slug>, public" so unqualified subscriber_pwas resolves to the
  // platform schema. Cached per process for the lifetime of a single
  // request via a closure-free SELECT each time — value rarely changes so
  // the small DB hit is negligible.
  async function fetchAppGooglePlaceId() {
    try {
      const slug = (services.config && services.config.slug) || 'tandooriroute';
      const row = await db.get(
        'SELECT google_place_id FROM public.subscriber_pwas WHERE slug = $1',
        [slug]
      );
      const value = (row && row.google_place_id) || null;
      // First-touch debug: log so we can see in server output what the
      // attribution flow + modal partial will use as the Place ID. Remove
      // once the flow is proven stable.
      if (!fetchAppGooglePlaceId._loggedOnce) {
        console.log('[keychain-place-id] subscriber_pwas slug=' + slug + ' google_place_id=' + (value || '(null)'));
        fetchAppGooglePlaceId._loggedOnce = true;
      }
      return value;
    } catch (err) {
      console.warn('[fetchAppGooglePlaceId] lookup failed:', err && err.message);
      return null;
    }
  }

  async function renderCtx(req) {
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[req.lang] || T.fr), settings, req.lang);
    // googlePlaceId pulled from the platform table so the in-tenant review
    // modal can build the 5-star Google review URL from the same value the
    // admin set in tapavis-admin's AI Builder Apps list.
    const googlePlaceId = await fetchAppGooglePlaceId();
    return {
      t: t,
      lang: req.lang,
      settings: settings,
      googlePlaceId: googlePlaceId,
      formatPrice: formatPrice,
      formatDate: formatDate,
      pickLang: pickLang,
      hours: parseHours(settings.hours_json),
      parseSizes: parseSizes,
    };
  }

  router.get('/', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const menu = await db.all("SELECT m.* FROM menu_items m LEFT JOIN menu_categories c ON c.slug = m.category WHERE m.available = 1 ORDER BY m.featured DESC, COALESCE(c.id, 999999) ASC, m.position ASC, m.id ASC LIMIT 6").catch(function(){ return []; });
      const platforms = await db.all('SELECT * FROM delivery_platforms WHERE active = 1 ORDER BY position ASC').catch(function(){ return []; });
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3').catch(function(){ return []; });
      const categories = await getMenuCategories();
      res.render('index', Object.assign(ctx, { menu: menu, platforms: platforms, posts: posts, categories: categories }));
    } catch(e) { res.status(500).send('Erreur'); }
  });

  router.get('/menu', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const menu = await db.all('SELECT m.* FROM menu_items m LEFT JOIN menu_categories c ON c.slug = m.category ORDER BY COALESCE(c.id, 999999) ASC, m.position ASC, m.id ASC').catch(function(){ return []; });
      const categories = await getMenuCategories();
      res.render('menu', Object.assign(ctx, { menu: menu, categories: categories }));
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
        "SELECT o.*, (SELECT COUNT(*) FROM offer_claims c WHERE c.offer_id = o.id) AS claim_count " +
        "FROM offers o WHERE o.active = 1 AND o.expires_at > NOW() ORDER BY o.position ASC, o.expires_at ASC"
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
        // pg returns COUNT(*) (bigint) as a string — coerce before any math
        o.claim_count = Number(o.claim_count || 0);
        if (o.max_claims != null && Number(o.max_claims) > 0) {
          var maxClaims = Number(o.max_claims);
          o._remaining = Math.max(0, maxClaims - o.claim_count);
          // Urgency threshold: ≤ 5 absolute or ≤ 20% of the original cap,
          // whichever is more permissive (so a 100-cap offer pulses at 20
          // left, while a 6-cap offer pulses at 3 left).
          var lowThreshold = Math.max(5, Math.ceil(maxClaims * 0.2));
          o._low_stock = o._remaining > 0 && o._remaining <= lowThreshold;
        } else {
          o._remaining = null;
          o._low_stock = false;
        }
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

  // Public API namespaced under /api/promos (not /api/offers) so it doesn't
  // collide with the platform's legacy /api/offers/* router, which
  // intercepts that prefix on custom-domain tenants before the
  // customDomainResolver runs.
  router.post('/api/promos/:id/claim', services.auth.requireAuth, async function(req, res) {
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

  router.get('/api/promos/my-claims', services.auth.requireAuth, async function(req, res) {
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

  // Captures 1-3 star feedback from the in-page review modal. Emails the
  // tenant's contact_email. 4 and 5 star paths are handled client-side
  // (thank-you / Google review link) and never POST here.
  router.post('/api/keychain-review', async function(req, res) {
    try {
      const rating = parseInt((req.body && req.body.rating) || '0', 10);
      const message = ((req.body && req.body.message) || '').trim().slice(0, 5000);
      // userEmail from the modal form's email input — the visitor's own
      // address so the admin can reply directly. Falls back to the
      // logged-in pwa_user's email if the form omitted it.
      const formEmailRaw = ((req.body && req.body.userEmail) || '').trim();
      const userId = req.user && req.user.id;
      if (!userId || !rating || rating < 1 || rating > 5 || !message) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
      }
      const userEmail = formEmailRaw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmailRaw)
        ? formEmailRaw
        : (req.user && req.user.email) || null;
      const visitor = await db.get(
        `SELECT v.id, v.email, v.full_name, v.keychain_id
           FROM keychain_visitors v
          WHERE v.user_id = $1
          ORDER BY v.created_at DESC LIMIT 1`,
        [userId]
      );
      if (!visitor) {
        return res.status(404).json({ success: false, error: 'No attribution' });
      }
      // Route to the tenant's "Courriel administrateur" (admin_email)
      // first, falling back to contact_email per resolveContactEmail.
      // Matches the tapavis-admin /api/low-rating-feedback recipient path
      // so the rating modal behavior is parity with business-association.
      const toEmail = resolveContactEmail(await getSettings());
      const appName = (services.config && services.config.displayName) || 'Tandoori Route';
      const subject = appName + ' — ' + rating + '-star feedback from keychain visitor';
      const senderLine = (visitor.full_name ? visitor.full_name + ' (' : '') + (userEmail || '—') + (visitor.full_name ? ')' : '');
      const html = '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">' +
        '<h2 style="margin:0 0 12px">New keychain visitor feedback</h2>' +
        '<p><strong>Rating:</strong> <span style="color:#fbbf24;letter-spacing:2px;font-size:18px">' + '★'.repeat(rating) + '</span><span style="color:#d1d5db;letter-spacing:2px;font-size:18px">' + '☆'.repeat(5 - rating) + '</span> (' + rating + '/5)</p>' +
        '<p><strong>From:</strong> ' + escapeHtml(senderLine) + '</p>' +
        '<p><strong>Keychain ID:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">' + escapeHtml(visitor.keychain_id) + '</code></p>' +
        '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-top:16px;white-space:pre-wrap;line-height:1.5">' + escapeHtml(message) + '</div>' +
        '<p style="color:#6b7280;font-size:13px;margin-top:18px">Reply to this email to respond directly to ' + escapeHtml(userEmail || 'the visitor') + '.</p>' +
        '</div>';
      try {
        await services.email.send({
          to: toEmail,
          subject: subject,
          html: html,
          replyTo: userEmail || undefined,
        });
      } catch (emailErr) {
        console.error('[keychain-review] email failed:', emailErr.message);
        return res.status(500).json({ success: false, error: 'Email send failed' });
      }
      console.log('[keychain-review] feedback emailed to ' + toEmail + ' (rating=' + rating + ' from=' + (userEmail || 'unknown') + ')');
      res.json({ success: true });
    } catch(e) {
      console.error('[keychain-review POST]', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

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
        posts: await safeCount('SELECT COUNT(*) AS c FROM posts'),
        users: await services.auth.getUserCount().catch(function(){ return 0; }),
        pushSubs: await services.push.getSubscriptionCount().catch(function(){ return 0; }),
        visits: await safeCount('SELECT COUNT(*) AS c FROM site_visits'),
        visits7: await safeCount("SELECT COUNT(*) AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'"),
        availableMenu: await safeCount("SELECT COUNT(*) AS c FROM menu_items WHERE available = 1"),
        activePlatforms: await safeCount("SELECT COUNT(*) AS c FROM delivery_platforms WHERE active = 1")
      };
      res.render('admin', { stats: stats, page: 'dashboard' });
    } catch(e) { res.status(500).send('Erreur: ' + e.message); }
  });

  router.get('/admin/menu', isAdminPage, function(req, res) { res.render('admin-menu', { page: 'menu' }); });
  router.get('/admin/delivery', isAdminPage, function(req, res) { res.render('admin-delivery', { page: 'delivery' }); });
  router.get('/admin/posts', isAdminPage, function(req, res) { res.render('admin-posts', { page: 'posts' }); });
  // Explicit /admin/team registered BEFORE the auto-injected /admin/:module
  // handler (which `return`s without responding for mod === 'team'), so this
  // wins via Express's first-match-wins routing.
  router.get('/admin/team', isAdminPage, function(req, res) { res.render('admin-team', { page: 'team' }); });
  router.get('/admin/members', isAdminPage, async function(req, res) {
    var stats = await fetchMemberStats().catch(function(){ return null; });
    res.render('admin-members', { page: 'members', stats: stats });
  });

  // Aggregate-only, anonymized counts about the tenant's audience. No PII
  // ever leaves this endpoint — only totals. Mirrors the email-reach filter
  // used by the broadcast endpoint (email present, not unsubscribed,
  // email_verified NULL-or-1) so the "joignable" number matches what a
  // broadcast would actually deliver to.
  async function fetchMemberStats() {
    function coerceInt(row) { return row && row.c != null ? parseInt(row.c, 10) || 0 : 0; }
    var totalMembers = await db.get('SELECT COUNT(*) AS c FROM users').then(coerceInt).catch(function(){ return 0; });
    var emailReachable = await db.get(
      "SELECT COUNT(*) AS c FROM users WHERE email IS NOT NULL AND email <> '' AND (email_verified IS NULL OR email_verified = 1) AND email_unsubscribed_at IS NULL"
    ).then(coerceInt).catch(function(){ return 0; });
    var pushReachable = await db.get('SELECT COUNT(DISTINCT user_id) AS c FROM push_subscriptions').then(coerceInt).catch(function(){ return 0; });
    var visits7 = await db.get("SELECT COUNT(*) AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'").then(coerceInt).catch(function(){ return 0; });
    var newMembers7 = await db.get("SELECT COUNT(*) AS c FROM users WHERE created_at > NOW() - INTERVAL '7 days'").then(coerceInt).catch(function(){ return 0; });
    return {
      totalMembers: totalMembers,
      emailReachable: emailReachable,
      pushReachable: pushReachable,
      visits7: visits7,
      newMembers7: newMembers7
    };
  }
  router.get('/api/admin/members/stats', isAdminApi, async function(req, res) {
    try { res.json({ stats: await fetchMemberStats() }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  // --- Admin team management (admin_users + admin_invites are platform tables in tenant schema) ---
  router.get('/api/admin/team', isAdminApi, async function(req, res) {
    try {
      const members = await db.all('SELECT id, name, email, role, active, created_at, last_login_at FROM admin_users ORDER BY created_at DESC').catch(function(){ return []; });
      const invites = await db.all('SELECT id, email, role, status, created_at, expires_at FROM admin_invites ORDER BY created_at DESC').catch(function(){ return []; });
      res.json({ members: members || [], invites: invites || [] });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/team/invite', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const email = (b.email || '').trim().toLowerCase();
      const role = (b.role || 'admin').trim().toLowerCase();
      if (!email || email.indexOf('@') === -1) return res.status(400).json({ error: 'invalid_email' });

      const existing = await db.get('SELECT id FROM admin_users WHERE email = $1 AND active = 1', [email]);
      if (existing) return res.status(409).json({ error: 'already_admin' });
      const pending = await db.get("SELECT id FROM admin_invites WHERE email = $1 AND status = 'pending'", [email]);
      if (pending) return res.status(409).json({ error: 'already_invited' });

      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await db.run(
        "INSERT INTO admin_invites (email, token, role, status, expires_at, created_at) VALUES ($1, $2, $3, 'pending', $4, NOW())",
        [email, token, role, expiresAt]
      );

      // Build absolute activation URL — tenantPath handles both custom domain
      // and platform-served (/pwa/<slug>/) cases.
      const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').toString().split(',')[0];
      const host = req.get('host') || '';
      const path = typeof req.tenantPath === 'function' ? req.tenantPath('/admin/activate/' + token) : '/admin/activate/' + token;
      const activationUrl = proto + '://' + host + path;
      const appName = (services.config && services.config.displayName) || 'Tandoori Route';

      try {
        await services.email.send({
          to: email,
          subject: 'Invitation à gérer ' + appName,
          html: '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:540px;margin:0 auto;padding:32px;color:#1a1a1a">' +
            '<h2 style="margin:0 0 16px">Vous êtes invité(e)!</h2>' +
            '<p style="line-height:1.6;color:#444">Vous avez été invité(e) comme <strong>' + role + '</strong> pour gérer <strong>' + appName + '</strong>.</p>' +
            '<p style="line-height:1.6;color:#444">Cliquez sur le bouton ci-dessous pour activer votre compte:</p>' +
            '<p style="margin:24px 0"><a href="' + activationUrl + '" style="display:inline-block;padding:13px 28px;background:#39FF14;color:#000;font-weight:800;border-radius:8px;text-decoration:none">Activer mon accès</a></p>' +
            '<p style="font-size:13px;color:#888;line-height:1.5">Ce lien expire dans 7 jours. Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br><span style="word-break:break-all">' + activationUrl + '</span></p>' +
            '</div>'
        });
      } catch (emailErr) {
        console.error('Team invite email failed:', emailErr.message);
        // Don't delete the invite — admin can copy the activation URL manually
        return res.status(500).json({ error: 'email_send_failed', activation_url: activationUrl });
      }
      res.json({ success: true, invite: { email: email, role: role } });
    } catch(e) {
      console.error('Team invite error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/api/admin/team/revoke/:id', isAdminApi, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'invalid_id' });
      await db.run('UPDATE admin_users SET active = 0 WHERE id = $1', [id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/api/admin/team/invite/:id', isAdminApi, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'invalid_id' });
      await db.run('DELETE FROM admin_invites WHERE id = $1', [id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

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
            { name: 'name_fr', label: 'Nom (FR)', type: 'text', required: true, maxLength: 100, description: 'Nom du plat en français.', placeholder: 'ex. Biryani au poulet' },
            { name: 'name_en', label: 'Nom (EN)', type: 'text', required: false, maxLength: 100, description: 'Name in English (optional).', placeholder: 'e.g. Chicken Biryani' },
            { name: 'description_fr', label: 'Description (FR)', type: 'textarea', description: 'Description courte en français (1-2 phrases).', placeholder: 'ex. Riz basmati safrané, poulet mariné 24h, raïta de concombre.' },
            { name: 'description_en', label: 'Description (EN)', type: 'textarea', description: 'English description (optional).', placeholder: 'e.g. Saffron basmati rice, 24h-marinated chicken, cucumber raita.' },
            { name: 'price', label: 'Prix de base ($ CAD)', type: 'number', required: true, min: 0, step: 0.01, description: 'Prix affiché si aucune taille n\'est définie. Sinon les tailles ci-dessous prennent le dessus.', placeholder: '12.99' },
            { name: 'sizes_json', label: 'Tailles & prix (optionnel)', type: 'size_list', description: 'Ajoutez plusieurs tailles avec leur prix (ex. Petit 10$, Moyen 15$, Grand 20$). Si vide, le prix de base s\'affiche.' },
            { name: 'category', label: 'Catégorie', type: 'select_dynamic', source: 'menu_categories', valueField: 'slug', labelField: 'name_fr', editable: true, description: 'Choisissez une catégorie, renommez-la, ou créez-en une nouvelle ici.' },
            { name: 'image_url', label: 'Photo du plat', type: 'image', description: 'Photo du plat. Recommandé: 800x600px (4:3).' },
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
          key: 'offers', label: 'Offres', icon: 'tag',
          fields: [
            { name: 'title_fr', label: 'Titre (FR)', type: 'text', required: true, maxLength: 120, description: "Titre de l'offre en français.", placeholder: 'ex. Biryani + Naan + Lassi pour 22$' },
            { name: 'title_en', label: 'Titre (EN)', type: 'text', maxLength: 120, description: 'Title in English (optional).', placeholder: 'e.g. Biryani + Naan + Lassi for $22' },
            { name: 'description_fr', label: 'Description (FR)', type: 'textarea', description: 'Détails de l\'offre en français.', placeholder: 'ex. Valide sur les biryanis au poulet et au légume.' },
            { name: 'description_en', label: 'Description (EN)', type: 'textarea', description: 'Details in English (optional).' },
            { name: 'discount_label', label: 'Étiquette de rabais', type: 'text', maxLength: 40, description: 'Affichée en grand sur la carte (ex. "-20%", "1 gratuit").', placeholder: 'ex. -20%' },
            { name: 'image_url', label: 'Image', type: 'image', description: 'Image de l\'offre. Recommandé : 1200×900 px (4:3) — la carte d\'offre utilise un cadre 4:3, toute autre proportion sera recadrée.' },
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
            { name: 'image_url', label: 'Image principale', type: 'image', description: 'Image principale. Recommandé : 1200×675 px (16:9).' },
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
      const rows = await db.all('SELECT m.* FROM menu_items m LEFT JOIN menu_categories c ON c.slug = m.category ORDER BY COALESCE(c.id, 999999) ASC, m.position ASC, m.id ASC');
      res.json({ menu_items: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/menu_items', isAdminApi, async function(req, res) {
    try {
      const b = Object.assign({}, req.body || {});
      // Auto-position new items at the bottom of their category so manual
      // ordering (drag-drop) is preserved and additions land at the end.
      if (b.position == null || b.position === '') {
        try {
          const maxRow = await db.get('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM menu_items WHERE category IS NOT DISTINCT FROM $1', [b.category || null]);
          b.position = (maxRow && maxRow.next != null) ? Number(maxRow.next) : 0;
        } catch(_) { b.position = 0; }
      }
      const q = adminInsert('menu_items', ['name_fr','name_en','description_fr','description_en','price','category','image_url','position','featured','available','sizes_json'], b);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM menu_items WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row, id: r.lastInsertRowid });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/menu_items/reorder', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const ids = Array.isArray(b.ordered_ids) ? b.ordered_ids : [];
      const category = b.category == null ? null : String(b.category);
      if (!ids.length) return res.status(400).json({ error: 'no_ids' });
      // Update positions sequentially. Scoped to a category so items in
      // other categories aren't disturbed.
      let i = 0;
      for (const rawId of ids) {
        const id = parseInt(rawId, 10);
        if (!id) continue;
        if (category === null) {
          await db.run('UPDATE menu_items SET position = $1, updated_at = NOW() WHERE id = $2 AND category IS NULL', [i, id]);
        } else {
          await db.run('UPDATE menu_items SET position = $1, updated_at = NOW() WHERE id = $2 AND category = $3', [i, id, category]);
        }
        i++;
      }
      res.json({ success: true, updated: i });
    } catch(e) { console.error('Reorder error:', e.message); res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/menu_items/:id', isAdminApi, async function(req, res) {
    try {
      const q = adminUpdate('menu_items', ['name_fr','name_en','description_fr','description_en','price','category','image_url','position','featured','available','sizes_json'], req.body, req.params.id);
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

  // --- CRUD: menu_categories ---
  const MENU_CATEGORY_FIELDS = ['slug','name_fr','name_en','position','active'];
  function slugify(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60); }
  router.get('/api/admin/menu_categories', isAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM menu_categories ORDER BY position ASC, id ASC');
      res.json({ menu_categories: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/menu_categories', isAdminApi, async function(req, res) {
    try {
      const b = Object.assign({}, req.body || {});
      if (!b.slug && b.name_fr) b.slug = slugify(b.name_fr);
      b.slug = slugify(b.slug);
      if (!b.slug) return res.status(400).json({ error: 'invalid_slug' });
      const q = adminInsert('menu_categories', MENU_CATEGORY_FIELDS, b);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM menu_categories WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row, id: r.lastInsertRowid });
    } catch(e) {
      if ((e.message || '').toLowerCase().includes('duplicate') || (e.code === '23505')) return res.status(409).json({ error: 'slug_exists' });
      res.status(500).json({ error: e.message });
    }
  });
  router.put('/api/admin/menu_categories/:id', isAdminApi, async function(req, res) {
    try {
      const b = Object.assign({}, req.body || {});
      if (b.slug != null) b.slug = slugify(b.slug);
      // Keep existing menu_items.category in sync if slug changes
      const before = await db.get('SELECT slug FROM menu_categories WHERE id = $1', [req.params.id]);
      const q = adminUpdate('menu_categories', MENU_CATEGORY_FIELDS, b, req.params.id);
      if (!q) return res.status(400).json({ error: 'No fields' });
      await db.run(q.sql, q.vals);
      if (before && b.slug && before.slug !== b.slug) {
        try { await db.run('UPDATE menu_items SET category = $1 WHERE category = $2', [b.slug, before.slug]); } catch(_) {}
      }
      const row = await db.get('SELECT * FROM menu_categories WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) {
      if ((e.message || '').toLowerCase().includes('duplicate') || (e.code === '23505')) return res.status(409).json({ error: 'slug_exists' });
      res.status(500).json({ error: e.message });
    }
  });
  router.delete('/api/admin/menu_categories/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM menu_categories WHERE id = $1', [req.params.id]); res.json({ success: true }); }
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

  // Bulk settings upsert — accepts { settings: { key1: val1, key2: val2 } }
  const SITE_SETTINGS_ALLOWED = new Set([
    'business_name','tagline','admin_email','contact_email','contact_phone','business_address',
    'footer_intro_fr','footer_intro_en','hours_json',
    'social_facebook','social_instagram','social_twitter','social_tiktok','social_youtube','social_linkedin',
    '_p_nav_logo_url'
  ]);
  router.put('/api/admin/site_settings', isAdminApi, async function(req, res) {
    try {
      const incoming = (req.body && req.body.settings) || {};
      const keys = Object.keys(incoming).filter(function(k){ return SITE_SETTINGS_ALLOWED.has(k); });
      for (const k of keys) {
        const v = incoming[k];
        await db.run(
          'INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
          [k, v == null ? '' : String(v)]
        );
      }
      res.json({ success: true, saved: keys.length });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/broadcast', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const title = (b.title || '').toString().trim();
      const body = (b.body || '').toString().trim();
      if (!title || !body) return res.status(400).json({ error: 'missing_fields' });
      const channels = b.channels || {};
      const sendPush = channels.push !== false;
      const sendEmail = !!channels.email;
      if (!sendPush && !sendEmail) return res.status(400).json({ error: 'no_channel' });

      const result = {};

      if (sendPush) {
        try {
          if (services.push && typeof services.push.broadcast === 'function') {
            const pushRes = await services.push.broadcast({ title: title, body: body });
            result.push = { sent: pushRes.sent || 0, failed: pushRes.failed || 0, total: pushRes.total || 0 };
          } else {
            result.push = { error: 'push_unavailable' };
          }
        } catch(e) {
          console.error('Broadcast push error:', e.message);
          result.push = { error: e.message };
        }
      }

      if (sendEmail) {
        try {
          const emailUsers = await db.all(
            "SELECT id, email FROM users WHERE email IS NOT NULL AND email <> '' AND (email_verified IS NULL OR email_verified = 1) AND email_unsubscribed_at IS NULL"
          ).catch(function(){ return []; });
          const appName = (services.config && services.config.displayName) || 'Tandoori Route';
          const safeBody = body.replace(/[<>]/g, function(c){ return c === '<' ? '&lt;' : '&gt;'; }).replace(/\n/g, '<br>');
          const safeTitle = title.replace(/[<>]/g, function(c){ return c === '<' ? '&lt;' : '&gt;'; });
          const html = '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;color:#1a1a1a">' +
            '<h2 style="color:#0a0a0a;margin:0 0 16px">' + safeTitle + '</h2>' +
            '<div style="font-size:15px;line-height:1.55;color:#333">' + safeBody + '</div>' +
            '<hr style="border:none;border-top:1px solid #eee;margin:24px 0">' +
            '<p style="font-size:12px;color:#888;margin:0">' + appName + '</p>' +
            '</div>';
          let sent = 0, failed = 0;
          for (const row of emailUsers) {
            try {
              await services.email.send({ to: row.email, subject: appName + ' — ' + title, html: html });
              sent++;
            } catch(e) { failed++; console.error('Broadcast email failed for', row.email, e.message); }
          }
          result.email = { sent: sent, failed: failed, total: emailUsers.length };
        } catch(e) {
          console.error('Broadcast email error:', e.message);
          result.email = { error: e.message };
        }
      }

      res.json({ success: true, result: result });
    } catch(e) {
      console.error('Broadcast error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // Catch-all: redirect unknown GET routes to PWA home (prevents "Cannot GET" errors)
  // Only matches GET requests — POST/PUT/DELETE API endpoints are unaffected

// ========== ADMIN BACKEND PAGE ROUTES (auto-injected fallback) ==========
function requireAdmin(req, res, next) {
  if (req.query.admin_token) {
    try {
      var jwt = require('jsonwebtoken');
      var payload = jwt.verify(req.query.admin_token, services.jwtSecret);
      if (payload.admin === true && payload.slug === 'tandooriroute') {
        // Set self-verifying JWT cookie — works across all replicas without Redis
        try {
          var adminJwt = jwt.sign({ admin: true, slug: 'tandooriroute', userId: payload.userId || 0 }, services.jwtSecret, { expiresIn: '24h' });
          res.cookie('pwa_admin_tandooriroute', adminJwt, {
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
