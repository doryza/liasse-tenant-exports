module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  function fmtPrice(cents, lang) {
    if (!cents) return lang === 'en' ? 'Free' : 'Gratuit';
    const v = (cents / 100).toFixed(2);
    return v + ' $';
  }
  function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

  const T = {
    fr: {
      brand: 'My Story', tagline: 'Histoires originales dictées à la voix',
      nav_home: 'Accueil', nav_library: 'Ma bibliothèque', nav_about: 'À propos', nav_contact: 'Contact', nav_login: 'Connexion', nav_admin: 'Admin',
      hero_title: 'Des histoires qui prennent vie', hero_subtitle: 'Chaque récit est dicté à voix haute, transcrit avec soin, puis affiné.', hero_cta: 'Découvrir les histoires',
      featured_label: 'À la une', all_stories: 'Toutes les histoires', no_stories: 'Aucune histoire publiée pour le moment. Revenez bientôt.',
      read_excerpt: "Lire l'extrait", buy_now: 'Acheter', free: 'Gratuit', ebook: 'Ebook numérique', by_author: 'par',
      preview: 'Aperçu', synopsis: 'Synopsis', chapters_count: 'chapitres', words: 'mots', back_home: "Retour à l'accueil",
      checkout_title: 'Finaliser votre achat', checkout_sub: 'Quelques informations pour vous envoyer votre livre',
      form_name: 'Nom complet', form_email: 'Adresse courriel', form_phone: 'Téléphone (optionnel)', form_message: 'Message (optionnel)', form_submit: 'Confirmer la commande',
      checkout_success_title: 'Merci !', checkout_success_msg: "Votre commande est enregistrée. Suivez les instructions de paiement ci-dessous, puis l'auteure vous fera parvenir l'accès au livre.",
      payment_instructions: 'Instructions de paiement', reference: 'Référence', amount_due: 'Montant',
      library_title: 'Ma bibliothèque', library_empty: 'Aucun livre dans votre bibliothèque pour le moment. Vos achats apparaîtront ici une fois confirmés par l’auteure.', open_book: 'Ouvrir', reader_back: 'Retour à la bibliothèque',
      about_title: "À propos de l'auteure", contact_title: "Contactez l'auteure", contact_sub: "Une question, une suggestion, ou simplement envie d'échanger ?", contact_sent: 'Message envoyé. Merci !',
      footer_copyright: 'Tous droits réservés.', login_required: 'Veuillez vous connecter pour accéder à votre bibliothèque.',
      view_purchases: 'Voir mes livres', already_purchased: 'Déjà acheté', reading_now: 'Lecture en cours',
      table_of_contents: 'Table des matières', copyright_notice: 'Ce livre est protégé par les droits d’auteur. Merci de ne pas le partager.',
      catalog: 'Catalogue', stories_made_with_love: 'Récits faits avec soin', read_anytime: 'Lecture sur tous vos appareils', signed_author: 'Suivi personnel par l’auteure',
      pending: 'En attente', paid: 'Payé', cancelled: 'Annulé', published: 'Publié', draft: 'Brouillon',
      enable_notif: 'Recevoir les nouvelles parutions', drafts_only: 'Aucun ebook publié pour le moment.',
      access_pending: 'Votre commande est en attente de validation. Une fois votre paiement reçu, votre livre apparaîtra ici.',
      story_not_found: 'Histoire introuvable.', invalid_request: 'Requête invalide.',
      please_login_to_buy: 'Connectez-vous pour suivre vos achats dans votre bibliothèque.',
      hero_value_prop: "Des récits originaux, dictés à voix haute, à lire dans l'intimité d'un thé chaud.",
      explore: 'Explorer', read_more: 'Lire la suite', share: 'Partager',
      buy_to_read: 'Acheter pour lire', preview_only: "Vous lisez l'aperçu gratuit. Procurez-vous le livre complet pour découvrir la suite."
    },
    en: {
      brand: 'My Story', tagline: 'Original stories dictated by voice',
      nav_home: 'Home', nav_library: 'My Library', nav_about: 'About', nav_contact: 'Contact', nav_login: 'Sign In', nav_admin: 'Admin',
      hero_title: 'Stories that come alive', hero_subtitle: 'Each tale is spoken aloud, carefully transcribed, then polished.', hero_cta: 'Browse stories',
      featured_label: 'Featured', all_stories: 'All stories', no_stories: 'No stories published yet. Check back soon.',
      read_excerpt: 'Read excerpt', buy_now: 'Buy', free: 'Free', ebook: 'Digital ebook', by_author: 'by',
      preview: 'Preview', synopsis: 'Synopsis', chapters_count: 'chapters', words: 'words', back_home: 'Back home',
      checkout_title: 'Complete your purchase', checkout_sub: 'A few details so we can send you the book',
      form_name: 'Full name', form_email: 'Email address', form_phone: 'Phone (optional)', form_message: 'Message (optional)', form_submit: 'Confirm order',
      checkout_success_title: 'Thank you!', checkout_success_msg: "Your order is logged. Follow the payment instructions below and the author will grant you access to the book.",
      payment_instructions: 'Payment instructions', reference: 'Reference', amount_due: 'Amount',
      library_title: 'My library', library_empty: 'No books in your library yet. Your purchases will appear here once confirmed by the author.', open_book: 'Open', reader_back: 'Back to library',
      about_title: 'About the author', contact_title: 'Contact the author', contact_sub: 'A question, a suggestion, or just want to chat?', contact_sent: 'Message sent. Thank you!',
      footer_copyright: 'All rights reserved.', login_required: 'Please sign in to access your library.',
      view_purchases: 'View my books', already_purchased: 'Already owned', reading_now: 'Now reading',
      table_of_contents: 'Table of contents', copyright_notice: 'This book is protected by copyright. Please do not share.',
      catalog: 'Catalog', stories_made_with_love: 'Stories made with care', read_anytime: 'Read on any device', signed_author: 'Personal follow-up from the author',
      pending: 'Pending', paid: 'Paid', cancelled: 'Cancelled', published: 'Published', draft: 'Draft',
      enable_notif: 'Get notified of new releases', drafts_only: 'No ebooks published yet.',
      access_pending: 'Your order is awaiting validation. Once payment is received, your book will appear here.',
      story_not_found: 'Story not found.', invalid_request: 'Invalid request.',
      please_login_to_buy: 'Sign in to track your purchases in your library.',
      hero_value_prop: 'Original tales, dictated aloud, to read with a warm cup of tea.',
      explore: 'Explore', read_more: 'Read more', share: 'Share',
      buy_to_read: 'Buy to read', preview_only: "You're reading the free preview. Get the full book to continue the journey."
    }
  };

  function getLang(req) {
    if (req.query && (req.query.lang === 'en' || req.query.lang === 'fr')) return req.query.lang;
    if (req.cookies && req.cookies.pwa_lang === 'en') return 'en';
    return 'fr';
  }

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const o = {};
      for (const r of rows) o[r.key] = r.value;
      return o;
    } catch(e) { return {}; }
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

  async function ctx(req) {
    const lang = getLang(req);
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[lang]), settings, lang);
    const titledKey = 'hero_title_' + lang;
    const subKey = 'hero_subtitle_' + lang;
    const aboutKey = 'about_text_' + lang;
    const aboutTitleKey = 'about_title_' + lang;
    const taglineKey = 'tagline_' + lang;
    const featuredKey = 'featured_label_' + lang;
    const heroCtaKey = 'hero_cta_' + lang;
    const paymentKey = 'payment_instructions_' + lang;
    const contactTextKey = 'contact_text_' + lang;
    if (settings[titledKey]) t.hero_title = settings[titledKey];
    if (settings[subKey]) t.hero_subtitle = settings[subKey];
    if (settings[aboutKey]) t.about_text = settings[aboutKey];
    if (settings[aboutTitleKey]) t.about_title = settings[aboutTitleKey];
    if (settings[taglineKey]) t.tagline = settings[taglineKey];
    if (settings[featuredKey]) t.featured_label = settings[featuredKey];
    if (settings[heroCtaKey]) t.hero_cta = settings[heroCtaKey];
    if (settings[paymentKey]) t.payment_instructions_text = settings[paymentKey];
    if (settings[contactTextKey]) t.contact_text = settings[contactTextKey];
    return { lang, t, settings, fmtPrice: (c)=>fmtPrice(c, lang), user: req.user || null };
  }

  router.use(async function(req, res, next) {
    if (req.query && (req.query.lang === 'fr' || req.query.lang === 'en')) {
      try { res.cookie('pwa_lang', req.query.lang, { maxAge: 365*24*60*60*1000, path: '/' }); } catch(e){}
    }
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e){}
    }
    next();
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }
  function requireAdminPage(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    next();
  }

  router.get('/', async function(req, res) {
    try {
      const c = await ctx(req);
      const featured = await db.all("SELECT * FROM stories WHERE status='published' AND featured=1 ORDER BY updated_at DESC LIMIT 3");
      const all = await db.all("SELECT * FROM stories WHERE status='published' ORDER BY featured DESC, updated_at DESC");
      const upcoming = await db.all("SELECT * FROM stories WHERE status='draft' ORDER BY updated_at DESC LIMIT 3");
      res.render('index', Object.assign(c, { featured, allStories: all, upcoming }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/story/:id', async function(req, res) {
    try {
      const c = await ctx(req);
      const story = await db.get('SELECT * FROM stories WHERE id=$1', [req.params.id]);
      if (!story) return res.status(404).render('story', Object.assign(c, { story: null, chapters: [] }));
      const chapters = await db.all('SELECT id, title, position, LEFT(content, 600) AS preview FROM chapters WHERE story_id=$1 ORDER BY position ASC', [story.id]);
      const chapterCount = chapters.length;
      res.render('story', Object.assign(c, { story, chapters, chapterCount }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/checkout/:id', async function(req, res) {
    try {
      const c = await ctx(req);
      const story = await db.get("SELECT * FROM stories WHERE id=$1 AND status='published'", [req.params.id]);
      if (!story) return res.redirect('.');
      res.render('checkout', Object.assign(c, { story, success: null, reference: null }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.post('/api/checkout', async function(req, res) {
    try {
      const c = await ctx(req);
      const { story_id, name, email, phone, message } = req.body || {};
      if (!story_id || !name || !email) return res.status(400).json({ error: c.t.invalid_request });
      const story = await db.get("SELECT * FROM stories WHERE id=$1 AND status='published'", [story_id]);
      if (!story) return res.status(404).json({ error: c.t.story_not_found });
      const ref = 'MS-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random()*9000+1000);
      const r = await db.run('INSERT INTO purchases (story_id, customer_name, customer_email, customer_phone, customer_message, amount_cents, payment_reference, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [story.id, name, email, phone||'', message||'', story.price_cents, ref, 'pending']);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouvelle commande My Story — ' + story.title,
            html: '<h2>Nouvelle commande</h2><p><strong>Livre :</strong> ' + escapeHtml(story.title) + '</p><p><strong>Référence :</strong> ' + ref + '</p><p><strong>Montant :</strong> ' + fmtPrice(story.price_cents, c.lang) + '</p><hr><p><strong>Client :</strong> ' + escapeHtml(name) + '</p><p><strong>Courriel :</strong> ' + escapeHtml(email) + '</p><p><strong>Téléphone :</strong> ' + escapeHtml(phone||'—') + '</p><p><strong>Message :</strong> ' + escapeHtml(message||'—') + '</p><p>Connectez-vous au tableau de bord admin pour confirmer le paiement.</p>'
          });
        }
      } catch(emailErr) { console.error('Email failed:', emailErr.message); }
      try {
        await services.email.send({
          to: email,
          subject: (c.lang==='en'?'Your My Story order — ':'Votre commande My Story — ') + story.title,
          html: '<h2>' + escapeHtml(story.title) + '</h2><p>' + escapeHtml(c.t.checkout_success_msg) + '</p><p><strong>' + escapeHtml(c.t.reference) + ' :</strong> ' + ref + '</p><p><strong>' + escapeHtml(c.t.amount_due) + ' :</strong> ' + fmtPrice(story.price_cents, c.lang) + '</p><hr><p>' + escapeHtml(c.t.payment_instructions_text || c.t.payment_instructions) + '</p>'
        });
      } catch(emailErr2) { console.error('Customer email failed:', emailErr2.message); }
      res.json({ success: true, reference: ref, purchase_id: r.lastInsertRowid });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });

  router.get('/library', services.auth.optionalAuth, async function(req, res) {
    try {
      const c = await ctx(req);
      let purchases = [];
      if (req.user && req.user.email) {
        purchases = await db.all("SELECT p.*, s.title AS story_title, s.image_url AS story_image, s.subtitle AS story_subtitle, s.author_name FROM purchases p JOIN stories s ON s.id=p.story_id WHERE LOWER(p.customer_email)=LOWER($1) ORDER BY p.created_at DESC", [req.user.email]);
      }
      res.render('library', Object.assign(c, { purchases }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/reader/:id', services.auth.optionalAuth, async function(req, res) {
    try {
      const c = await ctx(req);
      const story = await db.get('SELECT * FROM stories WHERE id=$1', [req.params.id]);
      if (!story) return res.redirect('library');
      let access = false;
      let purchase = null;
      if (req.user && req.user.email) {
        purchase = await db.get("SELECT * FROM purchases WHERE story_id=$1 AND LOWER(customer_email)=LOWER($2) ORDER BY created_at DESC LIMIT 1", [story.id, req.user.email]);
        if (purchase && purchase.status === 'paid') access = true;
      }
      const chapters = access ? await db.all('SELECT * FROM chapters WHERE story_id=$1 ORDER BY position ASC', [story.id]) : [];
      res.render('reader', Object.assign(c, { story, chapters, access, purchase }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/about', async function(req, res) {
    try {
      const c = await ctx(req);
      res.render('about', c);
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/contact', async function(req, res) {
    try {
      const c = await ctx(req);
      res.render('contact', Object.assign(c, { sent: false }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const { name, email, message } = req.body || {};
      if (!name || !message) return res.status(400).json({ error: 'Missing fields' });
      await db.run('INSERT INTO form_submissions (name, email, message) VALUES ($1,$2,$3)', [name, email||'', message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message — My Story', html: '<p><strong>De :</strong> ' + escapeHtml(name) + ' (' + escapeHtml(email||'—') + ')</p><p>' + escapeHtml(message).replace(/\n/g,'<br>') + '</p>' });
        }
      } catch(emailErr) { console.error('Contact email failed:', emailErr.message); }
      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });

  router.get('/admin', requireAdminPage, async function(req, res) {
    try {
      const c = await ctx(req);
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const visitsTotalRow = await db.get('SELECT COUNT(*) AS n FROM site_visits');
      const visitsRecentRow = await db.get("SELECT COUNT(*) AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const storyCountRow = await db.get('SELECT COUNT(*) AS n FROM stories');
      const publishedCountRow = await db.get("SELECT COUNT(*) AS n FROM stories WHERE status='published'");
      const purchasesPendingRow = await db.get("SELECT COUNT(*) AS n FROM purchases WHERE status='pending'");
      const purchasesPaidRow = await db.get("SELECT COUNT(*) AS n FROM purchases WHERE status='paid'");
      const revenueRow = await db.get("SELECT COALESCE(SUM(amount_cents),0) AS total FROM purchases WHERE status='paid'");
      const submissionsRow = await db.get('SELECT COUNT(*) AS n FROM form_submissions');
      const recentPurchases = await db.all("SELECT p.*, s.title AS story_title FROM purchases p LEFT JOIN stories s ON s.id=p.story_id ORDER BY p.created_at DESC LIMIT 5");
      res.render('admin', Object.assign(c, {
        adminUser: { email: services.config.ownerEmail, name: services.config.ownerName },
        stats: {
          userCount, pushCount,
          visitsTotal: parseInt(visitsTotalRow.n||0,10), visitsRecent: parseInt(visitsRecentRow.n||0,10),
          storyCount: parseInt(storyCountRow.n||0,10), publishedCount: parseInt(publishedCountRow.n||0,10),
          purchasesPending: parseInt(purchasesPendingRow.n||0,10), purchasesPaid: parseInt(purchasesPaidRow.n||0,10),
          revenue: parseInt(revenueRow.total||0,10), submissionCount: parseInt(submissionsRow.n||0,10)
        },
        recentPurchases
      }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/admin/stories', requireAdminPage, async function(req, res) {
    try {
      const c = await ctx(req);
      const stories = await db.all('SELECT s.*, (SELECT COUNT(*) FROM chapters WHERE story_id=s.id) AS chapter_count, (SELECT COUNT(*) FROM story_segments WHERE story_id=s.id) AS segment_count FROM stories s ORDER BY s.updated_at DESC');
      res.render('admin-stories', Object.assign(c, { stories, adminUser: { email: services.config.ownerEmail } }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/admin/stories/:id/editor', requireAdminPage, async function(req, res) {
    try {
      const c = await ctx(req);
      const story = await db.get('SELECT * FROM stories WHERE id=$1', [req.params.id]);
      if (!story) return res.redirect('../');
      const chapters = await db.all('SELECT * FROM chapters WHERE story_id=$1 ORDER BY position ASC', [story.id]);
      const segments = await db.all('SELECT * FROM story_segments WHERE story_id=$1 ORDER BY position ASC, created_at ASC', [story.id]);
      const hasGemini = !!services.externalVars.GOOGLE_GEMINI_API_KEY;
      res.render('admin-story-editor', Object.assign(c, { story, chapters, segments, hasGemini, adminUser: { email: services.config.ownerEmail } }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/admin/purchases', requireAdminPage, async function(req, res) {
    try {
      const c = await ctx(req);
      const purchases = await db.all('SELECT p.*, s.title AS story_title FROM purchases p LEFT JOIN stories s ON s.id=p.story_id ORDER BY p.created_at DESC');
      res.render('admin-purchases', Object.assign(c, { purchases, adminUser: { email: services.config.ownerEmail }, fmtPrice: (n)=>fmtPrice(n, c.lang) }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/admin/submissions', requireAdminPage, async function(req, res) {
    try {
      const c = await ctx(req);
      const submissions = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
      res.render('admin-submissions', Object.assign(c, { submissions, adminUser: { email: services.config.ownerEmail } }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/admin/posts', requireAdminPage, async function(req, res) {
    try {
      const c = await ctx(req);
      const posts = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
      res.render('admin-posts', Object.assign(c, { posts, adminUser: { email: services.config.ownerEmail } }));
    } catch(e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisitsRow = await db.get('SELECT COUNT(*) AS n FROM site_visits');
      const recentVisitsRow = await db.get("SELECT COUNT(*) AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      res.json({ userCount, pushSubscriberCount: pushCount, totalVisits: parseInt(totalVisitsRow.n||0,10), recentVisits: parseInt(recentVisitsRow.n||0,10) });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        { key:'stories', label:'Histoires', icon:'book', fields: [
          { name:'title', type:'text', required:true, maxLength:200, description:'Titre du livre affiché en haut de la page de détail et dans la grille du catalogue.', placeholder:'ex. Le chemin du brouillard' },
          { name:'subtitle', type:'text', required:false, maxLength:200, description:'Sous-titre court affiché sous le titre principal.', placeholder:'ex. Un récit d’automne' },
          { name:'description', type:'textarea', required:false, description:'Synopsis du livre — apparaît sur la page de détail et dans les cartes du catalogue.', placeholder:'Décrivez l’histoire en quelques phrases...' },
          { name:'excerpt', type:'textarea', required:false, description:'Extrait gratuit montré aux visiteurs avant l’achat.', placeholder:'Premières lignes de l’histoire...' },
          { name:'image_url', type:'image', required:false, description:'Image de couverture du livre. Recommandé : 800×1067 px (ratio 3:4).' },
          { name:'price_cents', type:'number', required:false, min:0, step:1, description:'Prix en cents (ex. 499 = 4,99 $). Mettez 0 pour offrir gratuitement.', placeholder:'499' },
          { name:'genre', type:'text', required:false, maxLength:50, description:'Catégorie littéraire affichée comme étiquette.', placeholder:'ex. Roman court' },
          { name:'author_name', type:'text', required:false, maxLength:100, description:'Nom d’auteure affiché sur la couverture et la page détail.', placeholder:'ex. Dory' },
          { name:'word_count', type:'number', required:false, min:0, description:'Nombre approximatif de mots — affiché à titre indicatif.', placeholder:'8000' },
          { name:'language', type:'select', required:false, options:['fr','en'], description:'Langue principale du livre.' },
          { name:'status', type:'select', required:false, options:['draft','published'], description:'Brouillon = invisible aux visiteurs. Publié = visible et achetable.' },
          { name:'featured', type:'boolean', default:false, description:'Cocher pour afficher le livre dans la section À la une de l’accueil.' }
        ],actions:[{label:'Assemble',endpoint:'/api/admin/stories/{id}/assemble',method:'POST'}]},
        { key:'chapters', label:'Chapitres', icon:'list', fields: [
          { name:'story_id', type:'number', required:true, description:'ID du livre auquel ce chapitre appartient.', placeholder:'1' },
          { name:'position', type:'number', required:false, min:0, description:'Ordre du chapitre dans le livre (1, 2, 3...).', placeholder:'1' },
          { name:'title', type:'text', required:false, maxLength:200, description:'Titre du chapitre.', placeholder:'ex. Chapitre 1 — Le départ' },
          { name:'content', type:'textarea', required:false, description:'Contenu complet du chapitre — texte du livre.', placeholder:'Texte du chapitre...' },
          { name:'image_url', type:'image', required:false, description:'Image d’illustration du chapitre (optionnel).' }
        ]},
        { key:'purchases', label:'Commandes', icon:'shopping-cart', fields: [
          { name:'customer_name', type:'text', readonly:true, description:'Nom du client.' },
          { name:'customer_email', type:'email', readonly:true, description:'Courriel du client — utilisé pour donner accès au livre dans sa bibliothèque.' },
          { name:'customer_phone', type:'text', readonly:true, description:'Téléphone du client (optionnel).' },
          { name:'customer_message', type:'textarea', readonly:true, description:'Message laissé par le client lors de la commande.' },
          { name:'amount_cents', type:'number', readonly:true, description:'Montant en cents.' },
          { name:'payment_reference', type:'text', readonly:true, description:'Référence de la commande.' },
          { name:'status', type:'select', options:['pending','paid','cancelled'], description:'Passez à "paid" une fois le virement reçu — le client verra alors le livre dans sa bibliothèque.' }
        ]},
        { key:'posts', label:'Articles', icon:'edit', fields: [
          { name:'title', type:'text', required:true, maxLength:200, description:'Titre de l’article.', placeholder:'ex. Bienvenue sur My Story' },
          { name:'content', type:'textarea', description:'Contenu de l’article.', placeholder:'Écrivez votre article ici...' },
          { name:'image_url', type:'image', description:'Image en vedette pour l’article (optionnel).' },
          { name:'category', type:'text', maxLength:50, description:'Catégorie de l’article.', placeholder:'ex. Annonce' },
          { name:'published', type:'boolean', default:true, description:'Cocher pour publier l’article.' }
        ]},
        { key:'form_submissions', label:'Messages reçus', icon:'mail', fields: [
          { name:'name', type:'text', readonly:true, description:'Nom de l’expéditeur.' },
          { name:'email', type:'email', readonly:true, description:'Courriel de l’expéditeur.' },
          { name:'message', type:'textarea', readonly:true, description:'Contenu du message.' }
        ]}
      ],
      settingsFields: [
        { name:'payment_instructions_fr', type:'textarea', label:'Instructions de paiement (FR)', description:'Texte affiché au client après la commande, expliquant comment vous payer (Interac, virement, etc.).' },
        { name:'payment_instructions_en', type:'textarea', label:'Payment instructions (EN)', description:'Text shown to the customer after ordering, explaining how to pay you.' }
      ]
    });
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try { const settings = await getSettings(); res.json({ settings }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()', [key, value||'']);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.get('/api/admin/stories', requireAdmin, async function(req, res) {
    try { const stories = await db.all('SELECT * FROM stories ORDER BY updated_at DESC'); res.json({ stories }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/api/admin/stories', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const r = await db.run('INSERT INTO stories (title, subtitle, description, excerpt, image_url, price_cents, genre, author_name, language, status, featured, word_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id', [b.title||'Untitled', b.subtitle||'', b.description||'', b.excerpt||'', b.image_url||'', parseInt(b.price_cents||0,10), b.genre||'', b.author_name||services.config.ownerName||'', b.language||'fr', b.status||'draft', b.featured?1:0, parseInt(b.word_count||0,10)]);
      const story = await db.get('SELECT * FROM stories WHERE id=$1', [r.lastInsertRowid]);
      res.json({ story });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/api/admin/stories/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const fields = ['title','subtitle','description','excerpt','image_url','price_cents','genre','author_name','language','status','featured','word_count','full_text'];
      const sets = []; const vals = []; let i = 1;
      for (const f of fields) {
        if (b[f] !== undefined) {
          if (f==='featured') { sets.push(f+'=$'+i); vals.push(b[f]?1:0); }
          else if (f==='price_cents'||f==='word_count') { sets.push(f+'=$'+i); vals.push(parseInt(b[f]||0,10)); }
          else { sets.push(f+'=$'+i); vals.push(b[f]); }
          i++;
        }
      }
      if (sets.length) {
        sets.push('updated_at=NOW()');
        vals.push(req.params.id);
        await db.run('UPDATE stories SET ' + sets.join(', ') + ' WHERE id=$' + i, vals);
      }
      const story = await db.get('SELECT * FROM stories WHERE id=$1', [req.params.id]);
      res.json({ story });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/api/admin/stories/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM stories WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.get('/api/admin/chapters', requireAdmin, async function(req, res) {
    try {
      const sid = req.query.story_id;
      const chapters = sid ? await db.all('SELECT * FROM chapters WHERE story_id=$1 ORDER BY position ASC', [sid]) : await db.all('SELECT * FROM chapters ORDER BY story_id, position');
      res.json({ chapters });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/api/admin/chapters', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.story_id) return res.status(400).json({ error: 'story_id required' });
      let pos = parseInt(b.position||0,10);
      if (!pos) {
        const maxRow = await db.get('SELECT COALESCE(MAX(position),0) AS m FROM chapters WHERE story_id=$1', [b.story_id]);
        pos = parseInt(maxRow.m||0,10) + 1;
      }
      const r = await db.run('INSERT INTO chapters (story_id, position, title, content, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING id', [b.story_id, pos, b.title||('Chapitre '+pos), b.content||'', b.image_url||'']);
      const chapter = await db.get('SELECT * FROM chapters WHERE id=$1', [r.lastInsertRowid]);
      res.json({ chapter });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/api/admin/chapters/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const fields = ['position','title','content','image_url'];
      const sets = []; const vals = []; let i = 1;
      for (const f of fields) {
        if (b[f] !== undefined) { sets.push(f+'=$'+i); vals.push(f==='position'?parseInt(b[f]||0,10):b[f]); i++; }
      }
      if (sets.length) { sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE chapters SET '+sets.join(', ')+' WHERE id=$'+i, vals); }
      const chapter = await db.get('SELECT * FROM chapters WHERE id=$1', [req.params.id]);
      res.json({ chapter });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/api/admin/chapters/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM chapters WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  async function geminiTranscribe(base64Audio, mimeType, language) {
    const apiKey = services.externalVars.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('NO_KEY');
    const langName = language === 'en' ? 'English' : 'French (français du Québec si applicable)';
    const prompt = 'Transcribe this audio recording in ' + langName + '. Output ONLY the transcribed text — no labels, no commentary, no "Speaker:" prefix. Preserve natural punctuation, paragraph breaks where there are clear pauses. If the audio is unclear or silent, output an empty string.';
    const response = await services.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Audio } }] }] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error && data.error.message ? data.error.message : 'Gemini error');
    return (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text || '').trim();
  }

  async function geminiPolish(rawText, language, instruction) {
    const apiKey = services.externalVars.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('NO_KEY');
    const langName = language === 'en' ? 'English' : 'French';
    const defaultInstr = 'You are a literary editor working in ' + langName + '. Clean up the dictated draft below: fix punctuation, spelling, grammar; remove filler words ("euh", "um", "uh", "like", false starts); merge fragmented sentences; preserve paragraph structure and the author\'s voice. Do NOT add new content, do NOT summarize, do NOT translate. Output only the cleaned text.';
    const finalInstr = (instruction && instruction.trim()) ? instruction.trim() : defaultInstr;
    const prompt = finalInstr + '\n\n--- DRAFT TEXT ---\n' + rawText + '\n--- END ---';
    const response = await services.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error && data.error.message ? data.error.message : 'Gemini error');
    return (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text || '').trim();
  }

  router.post('/api/admin/segments/record', requireAdmin, async function(req, res) {
    try {
      const { story_id, chapter_id, audio_base64, mime_type, duration, language } = req.body || {};
      if (!story_id || !audio_base64) return res.status(400).json({ error: 'story_id and audio_base64 required' });
      if (!services.cloudinary || !services.cloudinary.uploader) return res.status(503).json({ error: 'Cloudinary not configured' });
      const dataUri = 'data:' + (mime_type||'audio/webm') + ';base64,' + audio_base64;
      let audioUrl = '';
      try {
        const up = await services.cloudinary.uploader.upload(dataUri, { resource_type: 'video', folder: 'mystory/segments' });
        audioUrl = up.secure_url;
      } catch(uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr.message);
        return res.status(500).json({ error: 'Audio upload failed: ' + uploadErr.message });
      }
      const maxRow = await db.get('SELECT COALESCE(MAX(position),0) AS m FROM story_segments WHERE story_id=$1', [story_id]);
      const pos = parseInt(maxRow.m||0,10) + 1;
      const r = await db.run("INSERT INTO story_segments (story_id, chapter_id, position, audio_url, duration_seconds, language, kind, status) VALUES ($1,$2,$3,$4,$5,$6,'voice','transcribing') RETURNING id", [story_id, chapter_id||null, pos, audioUrl, parseInt(duration||0,10), language||'fr']);
      const segId = r.lastInsertRowid;
      let transcript = '';
      let transcribeError = null;
      try {
        transcript = await geminiTranscribe(audio_base64, mime_type||'audio/webm', language||'fr');
      } catch(transErr) {
        transcribeError = transErr.message;
        console.error('Transcription failed:', transErr.message);
      }
      await db.run('UPDATE story_segments SET transcript=$1, edited_text=$1, status=$2, updated_at=NOW() WHERE id=$3', [transcript, transcribeError ? 'error' : 'ready', segId]);
      const segment = await db.get('SELECT * FROM story_segments WHERE id=$1', [segId]);
      res.json({ segment, transcribeError });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Server error' }); }
  });

  router.post('/api/admin/segments/text', requireAdmin, async function(req, res) {
    try {
      const { story_id, chapter_id, text, language } = req.body || {};
      if (!story_id || !text) return res.status(400).json({ error: 'story_id and text required' });
      const maxRow = await db.get('SELECT COALESCE(MAX(position),0) AS m FROM story_segments WHERE story_id=$1', [story_id]);
      const pos = parseInt(maxRow.m||0,10) + 1;
      const r = await db.run("INSERT INTO story_segments (story_id, chapter_id, position, transcript, edited_text, language, kind, status) VALUES ($1,$2,$3,$4,$4,$5,'text','ready') RETURNING id", [story_id, chapter_id||null, pos, text, language||'fr']);
      const segment = await db.get('SELECT * FROM story_segments WHERE id=$1', [r.lastInsertRowid]);
      res.json({ segment });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/api/admin/segments/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const fields = ['edited_text','chapter_id','position'];
      const sets = []; const vals = []; let i = 1;
      for (const f of fields) {
        if (b[f] !== undefined) {
          if (f==='position') { sets.push(f+'=$'+i); vals.push(parseInt(b[f]||0,10)); }
          else if (f==='chapter_id') { sets.push(f+'=$'+i); vals.push(b[f]||null); }
          else { sets.push(f+'=$'+i); vals.push(b[f]); }
          i++;
        }
      }
      if (sets.length) { sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE story_segments SET '+sets.join(', ')+' WHERE id=$'+i, vals); }
      const segment = await db.get('SELECT * FROM story_segments WHERE id=$1', [req.params.id]);
      res.json({ segment });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/api/admin/segments/:id/retranscribe', requireAdmin, async function(req, res) {
    try {
      const seg = await db.get('SELECT * FROM story_segments WHERE id=$1', [req.params.id]);
      if (!seg) return res.status(404).json({ error: 'Not found' });
      if (!seg.audio_url) return res.status(400).json({ error: 'No audio attached' });
      const apiKey = services.externalVars.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) return res.status(503).json({ error: 'Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY in the Admin tab.' });
      try {
        const audioRes = await services.fetch(seg.audio_url);
        if (!audioRes.ok) return res.status(500).json({ error: 'Could not fetch audio for re-transcription' });
        const arr = await audioRes.arrayBuffer();
        const b64 = Buffer.from(arr).toString('base64');
        const mime = audioRes.headers.get('content-type') || 'audio/webm';
        const transcript = await geminiTranscribe(b64, mime, seg.language||'fr');
        await db.run('UPDATE story_segments SET transcript=$1, edited_text=$1, status=$2, updated_at=NOW() WHERE id=$3', [transcript, 'ready', seg.id]);
        const segment = await db.get('SELECT * FROM story_segments WHERE id=$1', [seg.id]);
        res.json({ segment });
      } catch(err) { console.error(err); res.status(500).json({ error: err.message || 'Transcription failed' }); }
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/api/admin/segments/:id/polish', requireAdmin, async function(req, res) {
    try {
      const seg = await db.get('SELECT * FROM story_segments WHERE id=$1', [req.params.id]);
      if (!seg) return res.status(404).json({ error: 'Not found' });
      const apiKey = services.externalVars.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) return res.status(503).json({ error: 'Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY in the Admin tab.' });
      try {
        const polished = await geminiPolish(seg.edited_text || seg.transcript || '', seg.language||'fr', req.body && req.body.instruction);
        await db.run('UPDATE story_segments SET edited_text=$1, updated_at=NOW() WHERE id=$2', [polished, seg.id]);
        const segment = await db.get('SELECT * FROM story_segments WHERE id=$1', [seg.id]);
        res.json({ segment });
      } catch(err) { console.error(err); res.status(500).json({ error: err.message || 'Polish failed' }); }
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/api/admin/segments/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM story_segments WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/api/admin/stories/:id/assemble', requireAdmin, async function(req, res) {
    try {
      const sid = req.params.id;
      const story = await db.get('SELECT * FROM stories WHERE id=$1', [sid]);
      if (!story) return res.status(404).json({ error: 'Not found' });
      const chapters = await db.all('SELECT * FROM chapters WHERE story_id=$1 ORDER BY position ASC', [sid]);
      const allSegments = await db.all('SELECT * FROM story_segments WHERE story_id=$1 ORDER BY position ASC', [sid]);
      const parts = [];
      let totalWords = 0;
      for (const c of chapters) {
        const segs = allSegments.filter(s => s.chapter_id === c.id);
        const segText = segs.map(s => (s.edited_text || s.transcript || '').trim()).filter(Boolean).join('\n\n');
        const finalContent = segText || (c.content || '');
        if (segText) await db.run('UPDATE chapters SET content=$1, updated_at=NOW() WHERE id=$2', [finalContent, c.id]);
        if (finalContent) {
          parts.push('## ' + (c.title || ('Chapitre ' + c.position)) + '\n\n' + finalContent);
          totalWords += finalContent.split(/\s+/).filter(Boolean).length;
        }
      }
      const fullText = parts.join('\n\n');
      await db.run('UPDATE stories SET full_text=$1, word_count=$2, updated_at=NOW() WHERE id=$3', [fullText, totalWords, sid]);
      const updated = await db.get('SELECT * FROM stories WHERE id=$1', [sid]);
      res.json({ story: updated, wordCount: totalWords, chapterCount: chapters.length });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });

  router.get('/api/admin/segments', requireAdmin, async function(req, res) {
    try {
      const sid = req.query.story_id;
      const segments = sid ? await db.all('SELECT * FROM story_segments WHERE story_id=$1 ORDER BY position ASC', [sid]) : await db.all('SELECT * FROM story_segments ORDER BY story_id, position');
      res.json({ segments });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.get('/api/admin/purchases', requireAdmin, async function(req, res) {
    try { const purchases = await db.all('SELECT p.*, s.title AS story_title FROM purchases p LEFT JOIN stories s ON s.id=p.story_id ORDER BY p.created_at DESC'); res.json({ purchases }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/api/admin/purchases/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const sets = []; const vals = []; let i = 1;
      if (b.status !== undefined) { sets.push('status=$'+i); vals.push(b.status); i++; if (b.status === 'paid') { sets.push('paid_at=NOW()'); } }
      if (sets.length) { sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE purchases SET '+sets.join(', ')+' WHERE id=$'+i, vals); }
      const purchase = await db.get('SELECT p.*, s.title AS story_title FROM purchases p LEFT JOIN stories s ON s.id=p.story_id WHERE p.id=$1', [req.params.id]);
      if (b.status === 'paid' && purchase && purchase.customer_email) {
        try {
          const lang = req.cookies && req.cookies.pwa_lang === 'en' ? 'en' : 'fr';
          const subj = lang === 'en' ? 'Your book is ready: ' + purchase.story_title : 'Votre livre est prêt : ' + purchase.story_title;
          const body = lang === 'en'
            ? '<h2>Thank you!</h2><p>Your payment has been received. You can now read <strong>' + escapeHtml(purchase.story_title) + '</strong> in your library.</p><p>Sign in with this email address (' + escapeHtml(purchase.customer_email) + ') and visit <a href="https://liasse.tech/pwa/mystory/library">your library</a>.</p>'
            : '<h2>Merci !</h2><p>Votre paiement est bien reçu. Vous pouvez maintenant lire <strong>' + escapeHtml(purchase.story_title) + '</strong> dans votre bibliothèque.</p><p>Connectez-vous avec cette adresse courriel (' + escapeHtml(purchase.customer_email) + ') et rendez-vous dans <a href="https://liasse.tech/pwa/mystory/library">votre bibliothèque</a>.</p>';
          try { await services.email.send({ to: purchase.customer_email, subject: subj, html: body }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        } catch(emailErr) { console.error('Confirmation email failed:', emailErr.message); }
      }
      res.json({ purchase });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/api/admin/purchases/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM purchases WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    try { const form_submissions = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC'); res.json({ form_submissions }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/api/admin/submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM form_submissions WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try { const posts = await db.all('SELECT * FROM posts ORDER BY created_at DESC'); res.json({ posts }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const r = await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1,$2,$3,$4,$5) RETURNING id', [b.title||'Untitled', b.content||'', b.image_url||'', b.category||'', b.published?1:0]);
      const post = await db.get('SELECT * FROM posts WHERE id=$1', [r.lastInsertRowid]);
      res.json({ post });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const fields = ['title','content','image_url','category','published'];
      const sets=[]; const vals=[]; let i=1;
      for (const f of fields) { if (b[f]!==undefined) { sets.push(f+'=$'+i); vals.push(f==='published'?(b[f]?1:0):b[f]); i++; } }
      if (sets.length) { sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE posts SET '+sets.join(', ')+' WHERE id=$'+i, vals); }
      const post = await db.get('SELECT * FROM posts WHERE id=$1', [req.params.id]);
      res.json({ post });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/api/admin/generate-image', requireAdmin, async function(req, res) {
    try {
      const { prompt, aspectRatio } = req.body || {};
      if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
      const imageUrl = await services.ai.generateImage(prompt, { aspectRatio: aspectRatio || '4:3' });
      res.json({ imageUrl });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Image generation failed: ' + e.message }); }
  });

  
// Auto-injected admin page routes for orphaned views
router.get('/admin/story-editor', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM story_editor ORDER BY created_at DESC');
  res.render('admin-story-editor', { items: items });
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
