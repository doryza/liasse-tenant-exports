module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  // ===========================================================================
  // i18n — FR default + full EN. Every key is overridable from the admin
  // backend via a `text_<key>_<lang>` admin_settings row (applyTextOverrides),
  // so all copy is editable without a code change.
  // ===========================================================================
  const T = {
    fr: {
      brand: 'RED BOX', brand_tag: 'Poulet Nashville',
      nav_home: 'Accueil', nav_menu: 'Menu', nav_promise: 'Notre Promesse', nav_franchise: 'Franchise', nav_contact: 'Contact', nav_vip: 'VIP',
      order: 'Commander', order_view_menu: 'Voir le menu', learn_more: 'En savoir plus', back_home: "Retour à l'accueil",
      contact_us: 'Nous joindre', footer_rights: 'Tous droits réservés.',
      footer_intro: "Le poulet frit réinventé. Extrêmement croustillant. Zéro gras saturé. L'expérience fast-casual premium au Québec.",

      // Home
      hero_eyebrow: 'Poulet Nashville',
      hero_title_1: 'Le poulet le plus', hero_title_hl: 'croustillant', hero_title_2: 'en ville.',
      hero_tag1: 'Fait avec du vrai poulet', hero_tag2: 'Jamais gras', hero_tag3: 'Toujours parfait',
      hero_cta: 'Voir le menu',
      story_eyebrow: '100% vrai poulet Nashville',
      story_title: 'Une seule chose, faite à la perfection.',
      story_p1: "Pas de menu compliqué. Pas de poulet gras sur l'os. Juste des filets de poulet premium, ultra croustillants — la seule chose qu'on fait, et qu'on fait mieux que personne.",
      story_p2: "Un extérieur massivement croustillant qui scelle tout le jus à l'intérieur, servi dans la boîte rouge iconique avec des frites ondulées et notre sauce signature. L'expérience « cheat meal », sans le regret. 💯",
      story_cta: 'Découvrir notre secret',
      highlights_eyebrow: 'Pensez plus grand',
      highlights_title: 'Pour les grandes faims.',
      highlights_sub: 'Pour les grandes faims et ceux qui veulent tout.',
      feat_family_tag: 'Pour le groupe', feat_family_title: 'La Boîte Familiale',
      feat_family_desc: '12 filets croustillants, une montagne de frites ondulées, 4 Texas toasts et un assortiment de sauces.',
      feat_burger_tag: "L'alternative", feat_burger_title: 'Burger Red Box',
      feat_burger_desc: 'Trois filets premium empilés dans un pain brioché, avec salade de chou fraîche et sauce maison.',
      feat_link: 'Voir sur le menu',
      home_cta_title: 'Prêt pour la boîte rouge ?',
      home_cta_text: 'Découvrez tout le menu et trouvez votre prochain cheat meal.',
      home_cta_btn: 'Voir le menu complet',

      // Menu
      menu_eyebrow: 'Le menu', menu_title: 'Notre menu', menu_sub: 'Ultraspécialisé. La perfection dans une boîte.',
      cat_all: 'Tout', popular_badge: 'Le Populaire',
      menu_cta_title: 'Prêt pour la boîte rouge ?', menu_cta_sub: 'Venez vivre le croustillant en personne.',
      menu_cta_btn: 'Trouver notre succursale',

      // Promesse
      promise_eyebrow: 'Notre promesse', promise_title_1: 'Le secret ?', promise_title_hl: 'La technologie.',
      promise_sub: "L'excellence n'est pas un accident.",
      promise_story_eyebrow: 'Pas votre casse-croûte habituel',
      promise_story_title: "On a réinventé le poulet frit.",
      promise_p1: "On rejette l'idée que le poulet frit doit être lourd, huileux et plein de regrets. Inspirés par les géants américains, on amène au Québec le gold standard de la languette de poulet.",
      promise_p2: "Le secret, c'est l'ingénierie — pas seulement les épices.",
      promise_p3: "Un investissement de plus de 75 000 $ en technologie de friture ultramoderne qui scelle instantanément le jus d'un poulet 100% vrai et premium, tout en créant une croûte spectaculairement croustillante et sans gras.",
      promise_spec_num: '75 000 $+', promise_spec_lbl: 'investis en technologie',
      pullquote_1: 'Le gold standard', pullquote_hl: 'de la languette.',
      promise_tagline: 'Le croquant parfait. Zéro résidu huileux.',
      values_eyebrow: 'Ce qui nous définit', values_title: 'Nos valeurs',
      val1_t: 'Qualité Supérieure', val1_d: "Aussi « clean » que la friture le permet. Du vrai poulet, sans exception.",
      val2_t: 'Service Éclair', val2_d: "Faire une seule chose — les filets — nous permet de l'exécuter à la perfection, en un temps record.",
      val3_t: "L'Emballage", val3_d: 'Un service pratique dans la boîte rouge iconique. Facile à transporter, facile à savourer, écologique.',
      val4_t: 'Le « Cheat Meal »', val4_d: 'La récompense ultime : satisfaisant et réconfortant, avec zéro culpabilité après le repas.',

      // Franchise
      fr_eyebrow: 'Franchise', fr_title_1: 'Bâtissez votre', fr_title_hl: 'empire croustillant.',
      fr_sub: "Un modèle simple, scalable, conçu pour dominer.",
      fr_model_eyebrow: 'Le modèle « Copy-Paste »',
      fr_model_title: 'Conçu pour se répliquer.',
      fr_model_intro: "Un modèle d'affaires pensé pour une scalabilité massive et une simplicité opérationnelle. On a éliminé les complexités qui font échouer la restauration rapide.",
      fr_m1_t: 'Menu Intentionnellement Simple', fr_m1_d: 'Inventaire simplifié, moins de gaspillage, plus de marge.',
      fr_m2_t: 'Personnel Réduit', fr_m2_d: 'Une ligne de production rationalisée qui demande moins d\'employés.',
      fr_m3_t: 'Attrait de Marque Massif', fr_m3_d: 'Esthétique streetwear, image de marque audacieuse, fort potentiel viral.',
      fr_flagship_eyebrow: 'Notre succursale flagship',
      fr_flagship_title: 'Voyez la Red Box en action.',
      fr_flagship_body: 'Venez voir la « Red Box » en action dans notre concept Store-in-Store',
      fr_flagship_neighbour_pre: 'voisin de',
      fr_form_eyebrow: 'Joignez-vous à nous', fr_form_title: 'Demande de franchise',
      f_name: 'Nom complet', f_email: 'Courriel', f_phone: 'Téléphone', f_city: "Ville d'intérêt", f_experience: 'Votre expérience / message',
      fr_submit: 'Soumettre la demande', fr_confidential: 'Toutes les demandes sont confidentielles.',
      fr_success: 'Merci ! Votre demande a bien été reçue. Nous vous contacterons sous peu.',

      // Contact
      ct_eyebrow: 'Contact', ct_title_1: 'Une question ?', ct_title_hl: 'Écrivez-nous !',
      ct_sub: 'On répond vite. Promis.',
      ct_form_title: 'Envoyer un message',
      c_name: 'Nom complet', c_email: 'Courriel', c_subject: 'Sujet', c_message: 'Message', ct_send: 'Envoyer',
      ct_info_title: 'Coordonnées', address: 'Adresse', phone: 'Téléphone', email: 'Courriel',
      ct_map_cta: 'Trouver RED BOX', ct_get_directions: "Obtenir l'itinéraire",

      // Forms (shared)
      form_sending: 'Envoi…', form_error: 'Une erreur est survenue. Réessayez ou écrivez-nous directement par courriel.',
      form_required: 'Veuillez remplir les champs requis.',
      ct_success: 'Merci ! Votre message a bien été envoyé.',

      // VIP keychain (exclusive program)
      vip_eyebrow: 'Programme VIP',
      vip_title_1: 'Le porte-clés', vip_title_hl: 'VIP', vip_title_2: 'RED BOX.',
      vip_sub: "Procurez-vous-en un gratuitement avec votre premier repas à votre RED BOX. Tapez-le sur votre téléphone pour débloquer des offres et rabais réservés aux membres — accessibles uniquement avec le porte-clés.",
      vip_cta_menu: 'Voir le menu', vip_how_link: 'Comment ça marche',
      vip_deals_label: 'Offres', vip_deals_value: 'BOGO',
      vip_disc_label: 'Rabais', vip_disc_value: '15 %',
      vip_keychain_alt: 'Porte-clés NFC VIP RED BOX',
      vip_how_eyebrow: 'Comment ça marche',
      vip_how_title: 'Trois taps vers vos privilèges.',
      vip_how_sub: 'De votre première visite à une vie de récompenses.',
      vip_s1_t: 'Obtenez le vôtre en magasin', vip_s1_d: "Recevez votre porte-clés VIP gratuitement avec votre premier repas à votre RED BOX — la seule façon d'en obtenir un.",
      vip_s2_t: 'Tapez pour débloquer', vip_s2_d: 'Tapez le porte-clés sur votre téléphone — aucune application à installer — pour ouvrir vos offres VIP.',
      vip_s3_t: 'Économisez à chaque visite', vip_s3_d: "Profitez d'offres et de rabais réservés aux membres sur votre poulet préféré, encore et encore.",
      vip_perks_eyebrow: 'Réservé aux membres',
      vip_perks_title: 'Des privilèges exclusifs.',
      vip_p1_t: 'Offres BOGO', vip_p1_d: "Des offres « un acheté, un gratuit » réservées aux porteurs du porte-clés.",
      vip_p2_t: 'Rabais de 15 %', vip_p2_d: 'Un pourcentage de rabais exclusif, activé directement depuis votre porte-clés.',
      vip_p3_t: 'Accès en primeur', vip_p3_d: 'Priorité sur les nouveautés et les offres à durée limitée.',
      vip_exclusive: 'Non vendu — le porte-clés VIP est remis uniquement en magasin avec votre premier repas.',
      vip_cta_title: 'Prêt à devenir VIP ?',
      vip_cta_sub: 'Passez à votre RED BOX, commandez votre premier repas et repartez avec votre porte-clés.'
    },
    en: {
      brand: 'RED BOX', brand_tag: 'Nashville Chicken',
      nav_home: 'Home', nav_menu: 'Menu', nav_promise: 'Our Promise', nav_franchise: 'Franchise', nav_contact: 'Contact', nav_vip: 'VIP',
      order: 'Order', order_view_menu: 'See the menu', learn_more: 'Learn more', back_home: 'Back to home',
      contact_us: 'Contact us', footer_rights: 'All rights reserved.',
      footer_intro: 'Fried chicken reinvented. Extremely crispy. Zero saturated fat. The premium fast-casual experience in Quebec.',

      hero_eyebrow: 'Nashville Chicken',
      hero_title_1: 'The crispiest', hero_title_hl: 'chicken', hero_title_2: 'in town.',
      hero_tag1: 'Made with real chicken', hero_tag2: 'Never greasy', hero_tag3: 'Always perfect',
      hero_cta: 'See the menu',
      story_eyebrow: '100% real Nashville chicken',
      story_title: 'One thing, done perfectly.',
      story_p1: "No complicated menu. No greasy bone-in chicken. Just premium, ultra-crispy chicken tenders — the one thing we do, and we do it better than anyone.",
      story_p2: "A massively crispy exterior that seals all the juice inside, served in the iconic red box with wavy fries and our signature sauce. The cheat-meal experience, without the regret. 💯",
      story_cta: 'Discover our secret',
      highlights_eyebrow: 'Think bigger',
      highlights_title: 'For the big appetites.',
      highlights_sub: 'For big appetites and those who want it all.',
      feat_family_tag: 'For the group', feat_family_title: 'The Family Box',
      feat_family_desc: '12 crispy tenders, a mountain of wavy fries, 4 Texas toasts and an assortment of sauces.',
      feat_burger_tag: 'The alternative', feat_burger_title: 'Red Box Burger',
      feat_burger_desc: 'Three premium tenders stacked in a brioche bun with fresh coleslaw and house sauce.',
      feat_link: 'See on the menu',
      home_cta_title: 'Ready for the red box?',
      home_cta_text: 'Explore the full menu and find your next cheat meal.',
      home_cta_btn: 'See the full menu',

      menu_eyebrow: 'The menu', menu_title: 'Our menu', menu_sub: 'Ultra-specialized. Perfection in a box.',
      cat_all: 'All', popular_badge: 'The Popular',
      menu_cta_title: 'Ready for the red box?', menu_cta_sub: 'Come taste the crunch in person.',
      menu_cta_btn: 'Find our location',

      promise_eyebrow: 'Our promise', promise_title_1: 'The secret?', promise_title_hl: 'Technology.',
      promise_sub: 'Excellence is no accident.',
      promise_story_eyebrow: 'Not your usual snack bar',
      promise_story_title: 'We reinvented fried chicken.',
      promise_p1: 'We reject the idea that fried chicken has to be heavy, oily and full of regret. Inspired by the American giants, we bring the gold standard of the chicken tender to Quebec.',
      promise_p2: 'The secret is engineering — not just the spices.',
      promise_p3: 'An investment of over $75,000 in ultra-modern frying technology that instantly seals the juices of 100% real, premium chicken while creating a spectacularly crispy, grease-free crust.',
      promise_spec_num: '$75,000+', promise_spec_lbl: 'invested in technology',
      pullquote_1: 'The gold standard', pullquote_hl: 'of the tender.',
      promise_tagline: 'The perfect crunch. Zero oily residue.',
      values_eyebrow: 'What defines us', values_title: 'Our values',
      val1_t: 'Superior Quality', val1_d: 'As clean as frying allows. Real chicken, no exceptions.',
      val2_t: 'Lightning Service', val2_d: 'Doing one thing — the tenders — lets us execute it perfectly, in record time.',
      val3_t: 'The Packaging', val3_d: 'Practical service in the iconic red box. Easy to carry, easy to enjoy, eco-friendly.',
      val4_t: 'The Cheat Meal', val4_d: 'The ultimate reward: satisfying and comforting, with zero post-meal guilt.',

      fr_eyebrow: 'Franchise', fr_title_1: 'Build your', fr_title_hl: 'crispy empire.',
      fr_sub: 'A simple, scalable model built to dominate.',
      fr_model_eyebrow: 'The "Copy-Paste" model',
      fr_model_title: 'Built to replicate.',
      fr_model_intro: 'A business model designed for massive scalability and operational simplicity. We have eliminated the complexities that cause fast-food failure.',
      fr_m1_t: 'Intentionally Simple Menu', fr_m1_d: 'Simplified inventory, less waste, more margin.',
      fr_m2_t: 'Reduced Staffing', fr_m2_d: 'A streamlined production line needing fewer employees.',
      fr_m3_t: 'Massive Brand Appeal', fr_m3_d: 'Streetwear aesthetic, bold branding, high viral potential.',
      fr_flagship_eyebrow: 'Our flagship location',
      fr_flagship_title: 'See the Red Box in action.',
      fr_flagship_body: 'Come see the "Red Box" in action at our Store-in-Store concept',
      fr_flagship_neighbour_pre: 'next to',
      fr_form_eyebrow: 'Join us', fr_form_title: 'Franchise application',
      f_name: 'Full name', f_email: 'Email', f_phone: 'Phone', f_city: 'City of interest', f_experience: 'Your experience / message',
      fr_submit: 'Submit application', fr_confidential: 'All applications are confidential.',
      fr_success: 'Thank you! Your application has been received. We will be in touch soon.',

      ct_eyebrow: 'Contact', ct_title_1: 'A question?', ct_title_hl: 'Write to us!',
      ct_sub: 'We answer fast. Promise.',
      ct_form_title: 'Send a message',
      c_name: 'Full name', c_email: 'Email', c_subject: 'Subject', c_message: 'Message', ct_send: 'Send',
      ct_info_title: 'Get in touch', address: 'Address', phone: 'Phone', email: 'Email',
      ct_map_cta: 'Find RED BOX', ct_get_directions: 'Get directions',

      form_sending: 'Sending…', form_error: 'Something went wrong. Try again or email us directly.',
      form_required: 'Please fill in the required fields.',
      ct_success: 'Thank you! Your message has been sent.',

      // VIP keychain (exclusive program)
      vip_eyebrow: 'VIP program',
      vip_title_1: 'The RED BOX', vip_title_hl: 'VIP', vip_title_2: 'keychain.',
      vip_sub: 'Pick one up free with your first meal at your local RED BOX. Tap it on your phone to unlock member-only deals and discounts — available only with the keychain.',
      vip_cta_menu: 'See the menu', vip_how_link: 'How it works',
      vip_deals_label: 'Deals', vip_deals_value: 'BOGO',
      vip_disc_label: 'Discounts', vip_disc_value: '15%',
      vip_keychain_alt: 'RED BOX VIP NFC keychain',
      vip_how_eyebrow: 'How it works',
      vip_how_title: 'Three taps to your perks.',
      vip_how_sub: 'From your first visit to a lifetime of rewards.',
      vip_s1_t: 'Grab yours in-store', vip_s1_d: 'Get your VIP keychain free with your first meal at your local RED BOX — the only way to get one.',
      vip_s2_t: 'Tap to unlock', vip_s2_d: 'Tap the keychain on your phone — no app to install — to open your VIP offers.',
      vip_s3_t: 'Save every visit', vip_s3_d: 'Redeem member-only deals and discounts on your favourite chicken, again and again.',
      vip_perks_eyebrow: 'Members only',
      vip_perks_title: 'Exclusive perks.',
      vip_p1_t: 'BOGO deals', vip_p1_d: 'Buy-one-get-one offers reserved for keychain holders.',
      vip_p2_t: '15% discounts', vip_p2_d: 'Exclusive percentage off, activated straight from your keychain.',
      vip_p3_t: 'Early access', vip_p3_d: 'First dibs on new items and limited-time specials.',
      vip_exclusive: 'Not for sale — the VIP keychain is only handed out in-store with your first meal.',
      vip_cta_title: 'Ready to go VIP?',
      vip_cta_sub: 'Drop by your local RED BOX, order your first meal, and leave with your keychain.'
    }
  };

  // ===========================================================================
  // Helpers
  // ===========================================================================
  function formatPrice(p) { if (p == null || p === '') return ''; return Number(p).toFixed(2) + ' $'; }
  function pickLang(item, field, lang) { if (!item) return ''; return item[field + '_' + lang] || item[field + '_fr'] || item[field] || ''; }
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
  // Any T key can be overridden by a `text_<key>_<lang>` admin_settings row.
  function applyTextOverrides(t, settings, lang) {
    const suffix = '_' + lang;
    for (const k in settings) {
      if (k.indexOf('text_') === 0 && k.lastIndexOf(suffix) === k.length - suffix.length) {
        const tKey = k.slice(5, k.length - suffix.length);
        if (tKey && settings[k] != null && settings[k] !== '') t[tKey] = settings[k];
      }
    }
    return t;
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
    const t = applyTextOverrides(Object.assign({}, T[lang] || T.fr), settings, lang);
    const sx = function(key) {
      if (settings[key + '_' + lang] != null && settings[key + '_' + lang] !== '') return settings[key + '_' + lang];
      if (settings[key + '_fr'] != null && settings[key + '_fr'] !== '') return settings[key + '_fr'];
      return settings[key] != null ? settings[key] : '';
    };
    const address = settings.business_address || '';
    let mapEmbed = settings.map_embed_url || '';
    if (!mapEmbed && address) mapEmbed = 'https://maps.google.com/maps?q=' + encodeURIComponent(address + ' (' + (settings.business_name || t.brand) + ')') + '&z=16&output=embed';
    const mapLink = address ? ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address)) : '';
    const directionsLink = address ? ('https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(address)) : '';
    return {
      t: t, lang: lang, settings: settings, sx: sx,
      cimg: cimg, formatPrice: formatPrice, pickLang: pickLang,
      mapEmbed: mapEmbed, mapLink: mapLink, directionsLink: directionsLink,
      year: new Date().getFullYear()
    };
  }

  async function getActiveCategories() {
    return await db.all('SELECT * FROM menu_categories WHERE active = 1 ORDER BY position ASC, id ASC').catch(function(){ return []; });
  }
  async function getMenuItems() {
    return await db.all(
      'SELECT m.* FROM menu_items m LEFT JOIN menu_categories c ON c.slug = m.category ' +
      'WHERE m.available = 1 ORDER BY COALESCE(c.position, 999999) ASC, m.position ASC, m.id ASC'
    ).catch(function(){ return []; });
  }

  // ===========================================================================
  // Public pages
  // ===========================================================================
  router.get('/', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      res.render('index', ctx);
    } catch(e) { console.error('index error:', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/menu', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const categories = await getActiveCategories();
      const items = await getMenuItems();
      res.render('menu', Object.assign(ctx, { categories: categories, items: items }));
    } catch(e) { console.error('menu error:', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/promesse', async function(req, res) {
    try { res.render('promesse', await renderCtx(req)); }
    catch(e) { console.error('promesse error:', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/franchise', async function(req, res) {
    try { res.render('franchise', await renderCtx(req)); }
    catch(e) { console.error('franchise error:', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/contact', async function(req, res) {
    try { res.render('contact', await renderCtx(req)); }
    catch(e) { console.error('contact error:', e.message); res.status(500).send('Erreur'); }
  });

  // Exclusive VIP keychain landing (reached by tapping the in-store NFC keychain;
  // intentionally not in the main nav).
  router.get('/vip', async function(req, res) {
    try { res.render('vip', await renderCtx(req)); }
    catch(e) { console.error('vip error:', e.message); res.status(500).send('Erreur'); }
  });

  // ===========================================================================
  // Public form submissions
  // ===========================================================================
  function buildLeadEmailHtml(appName, title, rows) {
    const safe = function(s){ return escapeHtml(s).replace(/\n/g, '<br>'); };
    let body = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;color:#1b1411">' +
      '<h2 style="color:#E11313;margin:0 0 16px;text-transform:uppercase;letter-spacing:.02em">' + escapeHtml(title) + ' — ' + escapeHtml(appName) + '</h2>';
    rows.forEach(function(r){ if (r[1]) body += '<p style="margin:.3rem 0"><strong>' + escapeHtml(r[0]) + ' :</strong> ' + safe(r[1]) + '</p>'; });
    body += '</div>';
    return body;
  }

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
          const appName = (services.config && services.config.displayName) || settings.business_name || 'RED BOX';
          const html = buildLeadEmailHtml(appName, 'Nouveau message', [['Nom', name], ['Courriel', email], ['Téléphone', phone], ['Sujet', subject], ['Message', message]]);
          const subjName = name.replace(/[\r\n]+/g, ' ').slice(0, 120);
          await services.email.send({ to: to, subject: appName + ' — Message de ' + subjName, html: html, replyTo: email }).catch(function(err){ console.error('contact email error:', err && err.message); });
        }
      } catch(e) { console.error('contact email block error:', e.message); }

      if (!stored) return res.status(500).json({ error: 'store_failed' });
      res.json({ success: true });
    } catch(e) { console.error('contact error:', e.message); res.status(500).json({ error: e.message }); }
  });

  router.post('/api/franchise', async function(req, res) {
    try {
      const b = req.body || {};
      const full_name = (b.full_name || b.name || '').toString().trim().slice(0, 200);
      const email = (b.email || '').toString().trim().slice(0, 200);
      const phone = (b.phone || '').toString().trim().slice(0, 60);
      const city = (b.city || '').toString().trim().slice(0, 200);
      const experience = (b.experience || b.message || '').toString().trim().slice(0, 4000);
      const locale = (b.locale === 'en' ? 'en' : 'fr');
      if (!full_name || !email) return res.status(400).json({ error: 'missing_fields' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'invalid_email' });

      let stored = false;
      try { await db.run('INSERT INTO franchise_requests (full_name,email,phone,city,experience,locale) VALUES ($1,$2,$3,$4,$5,$6)', [full_name, email, phone, city, experience, locale]); stored = true; }
      catch(e) { console.error('franchise store error:', e.message); }

      try {
        const settings = await getSettings();
        const to = resolveAdminEmail(settings);
        if (to && services.email && typeof services.email.send === 'function') {
          const appName = (services.config && services.config.displayName) || settings.business_name || 'RED BOX';
          const html = buildLeadEmailHtml(appName, 'Demande de franchise', [['Nom', full_name], ['Courriel', email], ['Téléphone', phone], ['Ville', city], ['Message', experience]]);
          const subjName = full_name.replace(/[\r\n]+/g, ' ').slice(0, 120);
          await services.email.send({ to: to, subject: appName + ' — Demande de franchise : ' + subjName, html: html, replyTo: email }).catch(function(err){ console.error('franchise email error:', err && err.message); });
        }
      } catch(e) { console.error('franchise email block error:', e.message); }

      if (!stored) return res.status(500).json({ error: 'store_failed' });
      res.json({ success: true });
    } catch(e) { console.error('franchise error:', e.message); res.status(500).json({ error: e.message }); }
  });

  // ===========================================================================
  // Admin
  // ===========================================================================
  function isAdmin(req) { return !!(services.admin && services.admin.isAdmin && services.admin.isAdmin(req)); }
  function isAdminPage(req, res, next) { if (!isAdmin(req)) return res.redirect('admin/login'); next(); }
  function isAdminApi(req, res, next) { if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' }); next(); }
  const num = async function(sql){ try { const r = await db.get(sql); return r && r.c != null ? Number(r.c) : 0; } catch(e){ return 0; } };

  router.get('/admin', isAdminPage, async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const stats = {
        visits: await num('SELECT COUNT(*) AS c FROM site_visits'),
        visits7: await num("SELECT COUNT(*) AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'"),
        menu: await num('SELECT COUNT(*) AS c FROM menu_items'),
        messages: await num('SELECT COUNT(*) AS c FROM contact_messages'),
        newMessages: await num('SELECT COUNT(*) AS c FROM contact_messages WHERE handled = 0'),
        franchise: await num('SELECT COUNT(*) AS c FROM franchise_requests'),
        newFranchise: await num('SELECT COUNT(*) AS c FROM franchise_requests WHERE handled = 0')
      };
      const recentMessages = await db.all('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5').catch(function(){ return []; });
      const recentFranchise = await db.all('SELECT * FROM franchise_requests ORDER BY created_at DESC LIMIT 5').catch(function(){ return []; });
      res.render('admin', Object.assign(ctx, { adminPage: 'dashboard', stats: stats, recentMessages: recentMessages, recentFranchise: recentFranchise }));
    } catch(e) { console.error('admin error:', e.message); res.status(500).send('Erreur'); }
  });

  router.get('/admin/settings', isAdminPage, async function(req, res) {
    try { const ctx = await renderCtx(req); res.render('admin-settings', Object.assign(ctx, { adminPage: 'settings' })); }
    catch(e) { res.status(500).send('Erreur'); }
  });
  router.get('/admin/menu', isAdminPage, async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const categories = await db.all('SELECT * FROM menu_categories ORDER BY position ASC, id ASC').catch(function(){ return []; });
      const items = await db.all('SELECT * FROM menu_items ORDER BY category ASC, position ASC, id ASC').catch(function(){ return []; });
      res.render('admin-menu', Object.assign(ctx, { adminPage: 'menu', categories: categories, items: items }));
    } catch(e) { res.status(500).send('Erreur'); }
  });
  router.get('/admin/messages', isAdminPage, async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const messages = await db.all('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 500').catch(function(){ return []; });
      res.render('admin-messages', Object.assign(ctx, { adminPage: 'messages', messages: messages }));
    } catch(e) { res.status(500).send('Erreur'); }
  });
  router.get('/admin/franchise', isAdminPage, async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const requests = await db.all('SELECT * FROM franchise_requests ORDER BY created_at DESC LIMIT 500').catch(function(){ return []; });
      res.render('admin-franchise', Object.assign(ctx, { adminPage: 'franchise', requests: requests }));
    } catch(e) { res.status(500).send('Erreur'); }
  });

  // --- Admin JSON APIs ---
  router.get('/api/admin/settings', isAdminApi, async function(req, res) {
    try { res.json({ settings: await getSettings() }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/settings', isAdminApi, async function(req, res) {
    try {
      const body = req.body || {};
      const keys = Object.keys(body);
      for (const k of keys) {
        await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()', [k, body[k] == null ? '' : String(body[k])]);
      }
      res.json({ success: true, saved: keys.length });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  const MENU_FIELDS = ['name_fr','name_en','description_fr','description_en','price','category','image_url','position','is_popular','is_extra','available'];
  function buildUpsert(table, fields, body, id) {
    const cols = [], vals = [];
    fields.forEach(function(f){ if (body[f] !== undefined) { cols.push(f); vals.push(body[f] === '' && (f === 'price') ? null : body[f]); } });
    if (!cols.length) return null;
    if (id) {
      const sets = cols.map(function(c, i){ return c + ' = $' + (i + 1); });
      return { sql: 'UPDATE ' + table + ' SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + (cols.length + 1), vals: vals.concat([id]) };
    }
    const ph = cols.map(function(_, i){ return '$' + (i + 1); });
    return { sql: 'INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING id', vals: vals };
  }
  router.post('/api/admin/menu', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const q = buildUpsert('menu_items', MENU_FIELDS, b, b.id);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      res.json({ success: true, id: b.id || (r && r.lastInsertRowid) });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/menu/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM menu_items WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/menu_category', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const q = buildUpsert('menu_categories', ['slug','name_fr','name_en','served_note_fr','served_note_en','position','active'], b, b.id);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      res.json({ success: true, id: b.id || (r && r.lastInsertRowid) });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/menu_category/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM menu_categories WHERE id = $1', [req.params.id]); res.json({ success: true }); }
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
  router.put('/api/admin/franchise_requests/:id', isAdminApi, async function(req, res) {
    try { const handled = (req.body && req.body.handled) ? 1 : 0; await db.run('UPDATE franchise_requests SET handled = $1 WHERE id = $2', [handled, req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/franchise_requests/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM franchise_requests WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  return router;
};
