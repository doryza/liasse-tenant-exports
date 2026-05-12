module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const T = {
    fr: {
      site_name:'SmartBoost AI', tagline:'Marketing IA pour PME',
      nav_home:'Accueil', nav_generator:'Générateur IA', nav_templates:'Modèles', nav_pricing:'Tarifs', nav_about:'À propos', nav_contact:'Contact', nav_dashboard:'Tableau de bord', nav_blog:'Blogue',
      nav_login:'Connexion', nav_logout:'Déconnexion',
      hero_badge:'Propulsé par l\'IA Gemini',
      hero_cta:'Essayer gratuitement', hero_cta2:'Voir les modèles',
      features_title:'Tout ce dont vous avez besoin', features_subtitle:'Une suite complète d\'outils marketing alimentés par l\'IA',
      templates_title:'Modèles prêts à l\'emploi', templates_subtitle:'Démarrez vos campagnes en un clic',
      pricing_title:'Plans transparents et abordables', pricing_subtitle:'Choisissez le plan adapté à votre croissance',
      testimonials_title:'Ils utilisent SmartBoost AI', testimonials_subtitle:'Des PME qui ont transformé leur marketing',
      cta_final_title:'Prêt à propulser votre marketing ?', cta_final_sub:'Inscrivez-vous gratuitement et générez votre premier contenu en moins d\'une minute.',
      generator_title:'Générateur IA', generator_subtitle:'Décrivez votre besoin, l\'IA fait le reste',
      generator_prompt_label:'Que voulez-vous créer ?', generator_prompt_ph:'Ex: Crée une pub Instagram pour mon café qui lance un nouveau latte saveur lavande',
      generator_type:'Type de contenu', generator_generate:'Générer',
      generator_result:'Résultat', generator_empty:'Aucun résultat pour le moment. Lancez votre première génération !',
      generator_login_req:'Connectez-vous pour générer du contenu.',
      generator_history:'Mes générations récentes',
      generator_loading:'Génération en cours...',
      contact_title:'Contactez-nous', contact_subtitle:'Une question ? Notre équipe vous répond en moins de 24h.',
      contact_name:'Nom', contact_email:'Courriel', contact_company:'Entreprise', contact_message:'Message', contact_send:'Envoyer',
      contact_success:'Message envoyé ! Nous vous répondrons rapidement.',
      contact_error:'Une erreur est survenue. Réessayez.',
      dashboard_title:'Mon tableau de bord', dashboard_welcome:'Bienvenue', dashboard_stats_gens:'Générations', dashboard_stats_recent:'Récentes (7j)',
      dashboard_quick:'Actions rapides', dashboard_open_gen:'Ouvrir le générateur', dashboard_view_templates:'Voir les modèles', dashboard_view_pricing:'Mettre à niveau',
      dashboard_history:'Historique', dashboard_no_history:'Aucune génération encore. Commencez par le générateur IA !',
      blog_title:'Blogue', blog_subtitle:'Conseils, études de cas et tendances',
      blog_empty:'Aucun article publié pour le moment.',
      about_title:'À propos', about_subtitle:'Notre mission : démocratiser le marketing professionnel grâce à l\'IA',
      templates_page_title:'Bibliothèque de modèles', templates_page_subtitle:'Des points de départ pour chaque type de campagne',
      templates_use:'Utiliser', templates_premium:'Premium',
      pricing_page_title:'Tarifs', pricing_page_subtitle:'Sans engagement, annulez quand vous voulez',
      pricing_recommended:'Recommandé', pricing_per:'par',
      footer_about:'À propos', footer_legal:'Mentions légales', footer_contact:'Contact', footer_rights:'Tous droits réservés',
      enable_notif:'Activer les notifications', read_more:'Lire la suite',
      type_caption:'Légende sociale', type_ad:'Publicité', type_slogan:'Slogan', type_email:'Email', type_video:'Script vidéo', type_hashtags:'Hashtags', type_idea:'Idée marketing',
      copy:'Copier', copied:'Copié !', delete:'Supprimer'
    },
    en: {
      site_name:'SmartBoost AI', tagline:'AI marketing for small businesses',
      nav_home:'Home', nav_generator:'AI Generator', nav_templates:'Templates', nav_pricing:'Pricing', nav_about:'About', nav_contact:'Contact', nav_dashboard:'Dashboard', nav_blog:'Blog',
      nav_login:'Sign in', nav_logout:'Sign out',
      hero_badge:'Powered by Gemini AI',
      hero_cta:'Try for free', hero_cta2:'See templates',
      features_title:'Everything you need', features_subtitle:'A complete suite of AI-powered marketing tools',
      templates_title:'Ready-to-use templates', templates_subtitle:'Kickstart your campaigns in one click',
      pricing_title:'Transparent, affordable pricing', pricing_subtitle:'Choose the plan that fits your growth',
      testimonials_title:'They use SmartBoost AI', testimonials_subtitle:'Small businesses that transformed their marketing',
      cta_final_title:'Ready to boost your marketing?', cta_final_sub:'Sign up free and generate your first content in under a minute.',
      generator_title:'AI Generator', generator_subtitle:'Describe what you need, the AI does the rest',
      generator_prompt_label:'What do you want to create?', generator_prompt_ph:'Ex: Create an Instagram ad for my cafe launching a new lavender latte',
      generator_type:'Content type', generator_generate:'Generate',
      generator_result:'Result', generator_empty:'No result yet. Start your first generation!',
      generator_login_req:'Sign in to generate content.',
      generator_history:'My recent generations',
      generator_loading:'Generating...',
      contact_title:'Contact us', contact_subtitle:'Have a question? Our team replies within 24 hours.',
      contact_name:'Name', contact_email:'Email', contact_company:'Company', contact_message:'Message', contact_send:'Send',
      contact_success:'Message sent! We will get back to you shortly.',
      contact_error:'Something went wrong. Please try again.',
      dashboard_title:'My dashboard', dashboard_welcome:'Welcome', dashboard_stats_gens:'Generations', dashboard_stats_recent:'Recent (7d)',
      dashboard_quick:'Quick actions', dashboard_open_gen:'Open generator', dashboard_view_templates:'View templates', dashboard_view_pricing:'Upgrade',
      dashboard_history:'History', dashboard_no_history:'No generations yet. Start with the AI Generator!',
      blog_title:'Blog', blog_subtitle:'Tips, case studies and trends',
      blog_empty:'No articles published yet.',
      about_title:'About', about_subtitle:'Our mission: democratize professional marketing with AI',
      templates_page_title:'Template library', templates_page_subtitle:'Starting points for every campaign type',
      templates_use:'Use', templates_premium:'Premium',
      pricing_page_title:'Pricing', pricing_page_subtitle:'No commitment, cancel anytime',
      pricing_recommended:'Recommended', pricing_per:'per',
      footer_about:'About', footer_legal:'Legal', footer_contact:'Contact', footer_rights:'All rights reserved',
      enable_notif:'Enable notifications', read_more:'Read more',
      type_caption:'Social caption', type_ad:'Advertisement', type_slogan:'Slogan', type_email:'Email', type_video:'Video script', type_hashtags:'Hashtags', type_idea:'Marketing idea',
      copy:'Copy', copied:'Copied!', delete:'Delete'
    }
  };

  function formatPrice(p) { p = Number(p)||0; return p === 0 ? '0' : p.toFixed(0); }
  function formatDate(d, lang) { try { return new Date(d).toLocaleDateString(lang==='en'?'en-CA':'fr-CA',{year:'numeric',month:'long',day:'numeric'}); } catch(e) { return ''; } }
  function truncate(s, n) { if (!s) return ''; s = String(s); return s.length>n ? s.substring(0,n)+'…' : s; }

  async function getSettings() {
    try { const rows = await db.all('SELECT key,value FROM admin_settings'); const out = {}; rows.forEach(r => out[r.key] = r.value); return out; } catch(e) { return {}; }
  }

  function applyTextOverrides(t, settings, lang) {
    for (var k in settings) {
      if (k.indexOf('text_') === 0 && k.lastIndexOf('_'+lang) === k.length - (lang.length+1)) {
        var tKey = k.slice(5, -(lang.length+1));
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  router.use(function(req, res, next) {
    var lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query.lang && (req.query.lang === 'fr' || req.query.lang === 'en')) {
      res.cookie('pwa_lang', req.query.lang, { maxAge: 365*24*60*60*1000, httpOnly: false });
    }
    req.lang = lang;
    next();
  });

  router.use(function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]).catch(function(){});
    }
    next();
  });

  async function commonLocals(req) {
    var lang = req.lang;
    var settings = await getSettings();
    var t = applyTextOverrides(Object.assign({}, T[lang]), settings, lang);
    return { lang: lang, t: t, settings: settings, formatPrice: formatPrice, formatDate: formatDate, truncate: truncate };
  }

  router.get('/', services.auth.optionalAuth, async function(req, res) {
    try {
      var locals = await commonLocals(req);
      var features = await db.all('SELECT * FROM features WHERE featured=1 ORDER BY sort_order LIMIT 6');
      var plans = await db.all('SELECT * FROM pricing_plans ORDER BY sort_order');
      var testimonials = await db.all('SELECT * FROM testimonials WHERE featured=1 ORDER BY id DESC LIMIT 3');
      var templates = await db.all('SELECT * FROM templates ORDER BY id DESC LIMIT 4');
      var posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', Object.assign(locals, { user: req.user||null, features: features, plans: plans, testimonials: testimonials, templates: templates, posts: posts }));
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/generator', services.auth.optionalAuth, async function(req, res) {
    try {
      var locals = await commonLocals(req);
      var history = [];
      if (req.user) {
        history = await db.all('SELECT * FROM generations WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10', [req.user.id]);
      }
      var templates = await db.all('SELECT * FROM templates ORDER BY id DESC LIMIT 8');
      res.render('generator', Object.assign(locals, { user: req.user||null, history: history, templates: templates }));
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/templates', async function(req, res) {
    try {
      var locals = await commonLocals(req);
      var templates = await db.all('SELECT * FROM templates ORDER BY id DESC');
      res.render('templates', Object.assign(locals, { templates: templates }));
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/pricing', async function(req, res) {
    try {
      var locals = await commonLocals(req);
      var plans = await db.all('SELECT * FROM pricing_plans ORDER BY sort_order');
      res.render('pricing', Object.assign(locals, { plans: plans }));
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/dashboard', services.auth.optionalAuth, async function(req, res) {
    try {
      var locals = await commonLocals(req);
      var stats = { total: 0, recent: 0 };
      var history = [];
      if (req.user) {
        var c1 = await db.get('SELECT COUNT(*)::int AS c FROM generations WHERE user_id=$1', [req.user.id]);
        var c2 = await db.get("SELECT COUNT(*)::int AS c FROM generations WHERE user_id=$1 AND created_at > NOW() - INTERVAL '7 days'", [req.user.id]);
        stats.total = c1 ? c1.c : 0; stats.recent = c2 ? c2.c : 0;
        history = await db.all('SELECT * FROM generations WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20', [req.user.id]);
      }
      res.render('dashboard', Object.assign(locals, { user: req.user||null, stats: stats, history: history }));
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/blog', async function(req, res) {
    try {
      var locals = await commonLocals(req);
      var posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC');
      res.render('blog', Object.assign(locals, { posts: posts }));
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/blog/:id', async function(req, res) {
    try {
      var locals = await commonLocals(req);
      var post = await db.get('SELECT * FROM posts WHERE id=$1 AND published=1', [req.params.id]);
      if (!post) return res.redirect('blog');
      res.render('blog-post', Object.assign(locals, { post: post }));
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/about', async function(req, res) {
    var locals = await commonLocals(req);
    res.render('about', locals);
  });

  router.get('/contact', async function(req, res) {
    var locals = await commonLocals(req);
    res.render('contact', locals);
  });

  router.post('/api/contact', async function(req, res) {
    try {
      var name = (req.body.name||'').toString().trim();
      var email = (req.body.email||'').toString().trim();
      var company = (req.body.company||'').toString().trim();
      var message = (req.body.message||'').toString().trim();
      if (!name || !message) return res.status(400).json({ error: 'Missing fields' });
      await db.run('INSERT INTO form_submissions (name,email,company,message) VALUES ($1,$2,$3,$4)', [name, email, company, message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouveau message SmartBoost AI — ' + name,
            html: '<p><b>De:</b> '+name+' &lt;'+email+'&gt;</p><p><b>Entreprise:</b> '+(company||'-')+'</p><p><b>Message:</b></p><p>'+message.replace(/</g,'&lt;').replace(/\n/g,'<br>')+'</p>'
          });
        }
      } catch (em) { console.error('email failed:', em.message); }
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/api/ai/generate', services.auth.requireAuth, async function(req, res) {
    try {
      var prompt = (req.body.prompt||'').toString().trim();
      var type = (req.body.type||'general').toString();
      if (!prompt) return res.status(400).json({ error: 'Empty prompt' });
      var apiKey = services.externalVars.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) return res.status(503).json({ error: 'AI service not configured. Ask the admin to add a Google Gemini API key in the Admin tab.' });
      var systemPrompts = {
        caption: 'You are a social media expert. Create engaging captions for Instagram, Facebook or TikTok. Include relevant emojis and 5-8 hashtags.',
        ad: 'You are an advertising copywriter. Create a complete ad with a hook, body, and call-to-action.',
        slogan: 'You are a branding expert. Create 5 catchy and memorable slogans.',
        email: 'You are an email marketing expert. Write a complete promotional email with subject line, body, and CTA.',
        video: 'You are a TikTok script writer. Create a 15-30 second video script with shot directions.',
        hashtags: 'You are a social media expert. Generate 15-20 strategic hashtags for this content.',
        idea: 'You are a marketing strategist. Brainstorm 5 creative marketing ideas.'
      };
      var systemPrompt = systemPrompts[type] || 'You are a marketing expert. Help create compelling marketing content.';
      var lang = req.lang || 'fr';
      var fullPrompt = systemPrompt + (lang === 'fr' ? ' Respond in French.' : ' Respond in English.') + '\n\nUser request: ' + prompt;
      var response = await services.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      });
      var data = await response.json();
      if (!response.ok) {
        console.error('Gemini error:', data);
        return res.status(response.status).json({ error: (data.error && data.error.message) || 'AI request failed' });
      }
      var text = '';
      try { text = data.candidates[0].content.parts[0].text; } catch (e) { text = ''; }
      if (!text) return res.status(500).json({ error: 'Empty AI response' });
      var ins = await db.run('INSERT INTO generations (user_id,prompt,result,type) VALUES ($1,$2,$3,$4) RETURNING id', [req.user.id, prompt, text, type]);
      res.json({ id: ins.lastInsertRowid, result: text, type: type, prompt: prompt });
    } catch (e) { console.error(e); res.status(500).json({ error: 'AI service temporarily unavailable' }); }
  });

  router.delete('/api/generations/:id', services.auth.requireAuth, async function(req, res) {
    try {
      await db.run('DELETE FROM generations WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) {
      if (req.path.indexOf('/api/') === 0) return res.status(403).json({ error: 'Forbidden' });
      return res.redirect('admin/login');
    }
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      var locals = await commonLocals(req);
      var users = await services.auth.getUserCount();
      var pushSubs = await services.push.getSubscriptionCount();
      var v1 = await db.get('SELECT COUNT(*)::int AS c FROM site_visits');
      var v2 = await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      var subs = await db.get('SELECT COUNT(*)::int AS c FROM form_submissions');
      var gens = await db.get('SELECT COUNT(*)::int AS c FROM generations');
      var gens7 = await db.get("SELECT COUNT(*)::int AS c FROM generations WHERE created_at > NOW() - INTERVAL '7 days'");
      var counts = {};
      var tables = ['posts','features','pricing_plans','testimonials','templates'];
      for (var i = 0; i < tables.length; i++) {
        var r = await db.get('SELECT COUNT(*)::int AS c FROM '+tables[i]);
        counts[tables[i]] = r ? r.c : 0;
      }
      var recentSubs = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 6');
      res.render('admin', Object.assign(locals, {
        stats: { users: users||0, pushSubs: pushSubs||0, totalVisits: v1?v1.c:0, recentVisits: v2?v2.c:0, submissions: subs?subs.c:0, generations: gens?gens.c:0, generations7: gens7?gens7.c:0 },
        counts: counts, recentSubs: recentSubs
      }));
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/admin/posts', function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    commonLocals(req).then(function(locals) {
      res.render('admin-posts', Object.assign(locals, { moduleKey: 'posts', moduleLabel: 'Article', title: 'Articles' }));
    }).catch(function(e) { console.error(e); res.status(500).send('Error'); });
  });

  router.get('/admin/features', function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    commonLocals(req).then(function(locals) {
      res.render('admin-features', Object.assign(locals, { moduleKey: 'features', moduleLabel: 'Fonctionnalité', title: 'Fonctionnalités' }));
    }).catch(function(e) { console.error(e); res.status(500).send('Error'); });
  });

  router.get('/admin/pricing_plans', function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    commonLocals(req).then(function(locals) {
      res.render('admin-pricing_plans', Object.assign(locals, { moduleKey: 'pricing_plans', moduleLabel: 'Plan tarifaire', title: 'Plans tarifaires' }));
    }).catch(function(e) { console.error(e); res.status(500).send('Error'); });
  });

  router.get('/admin/testimonials', function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    commonLocals(req).then(function(locals) {
      res.render('admin-testimonials', Object.assign(locals, { moduleKey: 'testimonials', moduleLabel: 'Témoignage', title: 'Témoignages' }));
    }).catch(function(e) { console.error(e); res.status(500).send('Error'); });
  });

  router.get('/admin/templates', function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    commonLocals(req).then(function(locals) {
      res.render('admin-templates', Object.assign(locals, { moduleKey: 'templates', moduleLabel: 'Modèle', title: 'Modèles' }));
    }).catch(function(e) { console.error(e); res.status(500).send('Error'); });
  });

  router.get('/admin/generations', function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    commonLocals(req).then(function(locals) {
      res.render('admin-generations', Object.assign(locals, { moduleKey: 'generations', moduleLabel: 'Génération', title: 'Générations' }));
    }).catch(function(e) { console.error(e); res.status(500).send('Error'); });
  });

  router.get('/admin/form_submissions', function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    commonLocals(req).then(function(locals) {
      res.render('admin-form_submissions', Object.assign(locals, { moduleKey: 'form_submissions', moduleLabel: 'Soumission', title: 'Soumissions de formulaire' }));
    }).catch(function(e) { console.error(e); res.status(500).send('Error'); });
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      var users = await services.auth.getUserCount();
      var pushSubs = await services.push.getSubscriptionCount();
      var v1 = await db.get('SELECT COUNT(*)::int AS c FROM site_visits');
      var v2 = await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      res.json({ userCount: users||0, pushSubscriberCount: pushSubs||0, totalVisits: v1?v1.c:0, recentVisits: v2?v2.c:0 });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
  });

  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 100'); res.json({ submissions: rows }); }
    catch (e) { res.status(500).json({ error: 'Error' }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        { key:'posts', label:'Articles', icon:'edit', fields: [
          { name:'title', label:'Titre', type:'text', required:true, maxLength:200, description:'Titre de l\'article affiché sur le blogue', placeholder:'Ex: 5 façons dont l\'IA transforme le marketing' },
          { name:'excerpt', label:'Résumé', type:'textarea', required:false, description:'Résumé court affiché sur la liste des articles (1-2 phrases)', placeholder:'Brève description du contenu...' },
          { name:'content', label:'Contenu', type:'textarea', required:false, description:'Contenu complet de l\'article', placeholder:'Écrivez votre article ici...' },
          { name:'image_url', label:'Image de couverture', type:'image', required:false, description:'Image de couverture. Recommandé : 1200x630px paysage' },
          { name:'category', label:'Catégorie', type:'text', required:false, maxLength:50, description:'Catégorie (ex: Tendances, Tutoriels)', placeholder:'Ex: Tendances' },
          { name:'author', label:'Auteur', type:'text', required:false, maxLength:80, description:'Nom de l\'auteur affiché sous le titre', placeholder:'Ex: Équipe SmartBoost' },
          { name:'published', label:'Publié', type:'boolean', default:true, description:'Décochez pour cacher cet article du blogue' }
        ]},
        { key:'features', label:'Fonctionnalités', icon:'star', fields: [
          { name:'title', label:'Titre', type:'text', required:true, maxLength:100, description:'Titre court de la fonctionnalité', placeholder:'Ex: Générateur de captions IA' },
          { name:'description', label:'Description', type:'textarea', required:false, description:'Description claire en 1-2 phrases', placeholder:'Décrivez ce que fait cette fonctionnalité' },
          { name:'icon', label:'Icône', type:'select', required:false, options:['sparkles','megaphone','video','image','mail','bar-chart','zap','brain','rocket','target'], description:'Icône affichée à côté du titre' },
          { name:'image_url', label:'Image', type:'image', required:false, description:'Image optionnelle. Recommandé : 800x600px' },
          { name:'sort_order', label:'Ordre', type:'number', required:false, min:0, step:1, default:0, description:'Ordre d\'affichage (plus petit = en premier)', placeholder:'0' },
          { name:'featured', label:'Mise en avant', type:'boolean', default:true, description:'Afficher sur la page d\'accueil' }
        ]},
        { key:'pricing_plans', label:'Plans tarifaires', icon:'tag', fields: [
          { name:'name', label:'Nom du plan', type:'text', required:true, maxLength:60, description:'Nom du plan (ex: Gratuit, Pro, Agence)', placeholder:'Ex: Pro' },
          { name:'price', label:'Prix', type:'number', required:true, min:0, step:0.01, description:'Prix mensuel en dollars. Mettre 0 pour gratuit', placeholder:'20.00' },
          { name:'period', label:'Période', type:'text', required:false, maxLength:20, description:'Période (mois, année)', placeholder:'Ex: mois' },
          { name:'description', label:'Phrase d\'accroche', type:'textarea', required:false, description:'Phrase d\'accroche du plan', placeholder:'Pour les entrepreneurs ambitieux' },
          { name:'features', label:'Fonctionnalités incluses', type:'textarea', required:false, description:'Liste des fonctionnalités, une par ligne', placeholder:'Générations illimitées\nSupport prioritaire\nAnalytique avancée' },
          { name:'cta_label', label:'Texte du bouton', type:'text', required:false, maxLength:40, description:'Texte du bouton', placeholder:'Ex: S\'abonner' },
          { name:'image_url', label:'Image', type:'image', required:false, description:'Image décorative optionnelle' },
          { name:'highlighted', label:'Plan recommandé', type:'boolean', default:false, description:'Mettre en surbrillance comme plan recommandé' },
          { name:'sort_order', label:'Ordre', type:'number', required:false, min:0, step:1, default:0, description:'Ordre d\'affichage (gauche à droite)', placeholder:'0' }
        ]},
        { key:'testimonials', label:'Témoignages', icon:'users', fields: [
          { name:'author', label:'Nom', type:'text', required:true, maxLength:80, description:'Nom de la personne qui donne le témoignage', placeholder:'Ex: Maria Hernandez' },
          { name:'role', label:'Rôle', type:'text', required:false, maxLength:100, description:'Poste et entreprise', placeholder:'Ex: Propriétaire — Café Solea' },
          { name:'content', label:'Témoignage', type:'textarea', required:true, description:'Le témoignage lui-même', placeholder:'Écrivez le témoignage...' },
          { name:'image_url', label:'Photo', type:'image', required:false, description:'Photo de profil. Recommandé : carré 400x400px' },
          { name:'rating', label:'Note', type:'number', required:false, min:1, max:5, step:1, default:5, description:'Note sur 5 étoiles', placeholder:'5' },
          { name:'featured', label:'Mise en avant', type:'boolean', default:true, description:'Afficher sur la page d\'accueil' }
        ]},
        { key:'templates', label:'Modèles', icon:'list', fields: [
          { name:'name', label:'Nom', type:'text', required:true, maxLength:100, description:'Nom du modèle', placeholder:'Ex: Post Instagram restaurant' },
          { name:'description', label:'Description', type:'textarea', required:false, description:'À quoi sert ce modèle', placeholder:'Décrivez l\'usage du modèle' },
          { name:'category', label:'Catégorie', type:'select', required:false, options:['Instagram','TikTok','Facebook','Email','Blog','Slogan','Logo','Autre'], description:'Plateforme ou type de campagne' },
          { name:'prompt_template', label:'Prompt IA', type:'textarea', required:false, description:'Prompt pré-rempli envoyé au générateur IA. Utilisez [VARIABLE] pour les zones à remplir', placeholder:'Crée une publication pour [TYPE D\'ENTREPRISE] avec le message [MESSAGE]' },
          { name:'image_url', label:'Image d\'aperçu', type:'image', required:false, description:'Aperçu visuel du modèle. Recommandé : 800x600px' },
          { name:'is_premium', label:'Premium', type:'boolean', default:false, description:'Réserver ce modèle aux utilisateurs payants' }
        ]},
        { key:'generations', label:'Générations', icon:'zap', fields: [
          { name:'user_id', label:'ID utilisateur', type:'number', required:false, description:'Identifiant de l\'utilisateur ayant effectué la génération' },
          { name:'prompt', label:'Invite', type:'textarea', required:false, description:'Texte de l\'invite soumis au générateur IA' },
          { name:'result', label:'Résultat', type:'textarea', required:false, description:'Contenu généré par l\'IA' },
          { name:'type', label:'Type', type:'text', required:false, maxLength:50, description:'Type de contenu généré (caption, ad, slogan, etc.)' }
        ]},
        { key:'form_submissions', label:'Soumissions de formulaire', icon:'mail', fields: [
          { name:'name', label:'Nom', type:'text', required:false, maxLength:100, description:'Nom du contact' },
          { name:'email', label:'Courriel', type:'text', required:false, maxLength:200, description:'Adresse courriel du contact' },
          { name:'company', label:'Entreprise', type:'text', required:false, maxLength:200, description:'Entreprise du contact' },
          { name:'message', label:'Message', type:'textarea', required:false, description:'Contenu du message envoyé via le formulaire de contact' }
        ]}
      ]
    });
  });

  // posts CRUD
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM posts ORDER BY id DESC'); res.json({ posts: rows }); }
    catch(e) { console.error(e); res.status(500).json({ error: 'Error' }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      var af = ['title','content','excerpt','image_url','category','author','published'];
      var cols = [], vals = [], ph = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { cols.push(f); vals.push(req.body[f]); ph.push('$' + idx); idx++; } });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var r = await db.run('INSERT INTO posts (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING id', vals);
      var row = await db.get('SELECT * FROM posts WHERE id=$1', [r.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      var af = ['title','content','excerpt','image_url','category','author','published'];
      var sets = [], vals = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + '=$' + idx); vals.push(req.body[f]); idx++; } });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE posts SET ' + sets.join(',') + ' WHERE id=$' + idx, vals);
      var row = await db.get('SELECT * FROM posts WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Error' }); }
  });

  // features CRUD
  router.get('/api/admin/features', requireAdmin, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM features ORDER BY id DESC'); res.json({ features: rows }); }
    catch(e) { console.error(e); res.status(500).json({ error: 'Error' }); }
  });
  router.post('/api/admin/features', requireAdmin, async function(req, res) {
    try {
      var af = ['title','description','icon','image_url','sort_order','featured'];
      var cols = [], vals = [], ph = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { cols.push(f); vals.push(req.body[f]); ph.push('$' + idx); idx++; } });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var r = await db.run('INSERT INTO features (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING id', vals);
      var row = await db.get('SELECT * FROM features WHERE id=$1', [r.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.put('/api/admin/features/:id', requireAdmin, async function(req, res) {
    try {
      var af = ['title','description','icon','image_url','sort_order','featured'];
      var sets = [], vals = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + '=$' + idx); vals.push(req.body[f]); idx++; } });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE features SET ' + sets.join(',') + ' WHERE id=$' + idx, vals);
      var row = await db.get('SELECT * FROM features WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.delete('/api/admin/features/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM features WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Error' }); }
  });

  // pricing_plans CRUD
  router.get('/api/admin/pricing_plans', requireAdmin, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM pricing_plans ORDER BY id DESC'); res.json({ pricing_plans: rows }); }
    catch(e) { console.error(e); res.status(500).json({ error: 'Error' }); }
  });
  router.post('/api/admin/pricing_plans', requireAdmin, async function(req, res) {
    try {
      var af = ['name','price','period','description','features','cta_label','image_url','highlighted','sort_order'];
      var cols = [], vals = [], ph = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { cols.push(f); vals.push(req.body[f]); ph.push('$' + idx); idx++; } });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var r = await db.run('INSERT INTO pricing_plans (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING id', vals);
      var row = await db.get('SELECT * FROM pricing_plans WHERE id=$1', [r.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.put('/api/admin/pricing_plans/:id', requireAdmin, async function(req, res) {
    try {
      var af = ['name','price','period','description','features','cta_label','image_url','highlighted','sort_order'];
      var sets = [], vals = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + '=$' + idx); vals.push(req.body[f]); idx++; } });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE pricing_plans SET ' + sets.join(',') + ' WHERE id=$' + idx, vals);
      var row = await db.get('SELECT * FROM pricing_plans WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.delete('/api/admin/pricing_plans/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM pricing_plans WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Error' }); }
  });

  // testimonials CRUD
  router.get('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM testimonials ORDER BY id DESC'); res.json({ testimonials: rows }); }
    catch(e) { console.error(e); res.status(500).json({ error: 'Error' }); }
  });
  router.post('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try {
      var af = ['author','role','content','image_url','rating','featured'];
      var cols = [], vals = [], ph = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { cols.push(f); vals.push(req.body[f]); ph.push('$' + idx); idx++; } });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var r = await db.run('INSERT INTO testimonials (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING id', vals);
      var row = await db.get('SELECT * FROM testimonials WHERE id=$1', [r.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.put('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try {
      var af = ['author','role','content','image_url','rating','featured'];
      var sets = [], vals = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + '=$' + idx); vals.push(req.body[f]); idx++; } });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE testimonials SET ' + sets.join(',') + ' WHERE id=$' + idx, vals);
      var row = await db.get('SELECT * FROM testimonials WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.delete('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM testimonials WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Error' }); }
  });

  // templates CRUD
  router.get('/api/admin/templates', requireAdmin, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM templates ORDER BY id DESC'); res.json({ templates: rows }); }
    catch(e) { console.error(e); res.status(500).json({ error: 'Error' }); }
  });
  router.post('/api/admin/templates', requireAdmin, async function(req, res) {
    try {
      var af = ['name','description','category','prompt_template','image_url','is_premium'];
      var cols = [], vals = [], ph = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { cols.push(f); vals.push(req.body[f]); ph.push('$' + idx); idx++; } });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var r = await db.run('INSERT INTO templates (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING id', vals);
      var row = await db.get('SELECT * FROM templates WHERE id=$1', [r.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.put('/api/admin/templates/:id', requireAdmin, async function(req, res) {
    try {
      var af = ['name','description','category','prompt_template','image_url','is_premium'];
      var sets = [], vals = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + '=$' + idx); vals.push(req.body[f]); idx++; } });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      await db.run('UPDATE templates SET ' + sets.join(',') + ' WHERE id=$' + idx, vals);
      var row = await db.get('SELECT * FROM templates WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.delete('/api/admin/templates/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM templates WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Error' }); }
  });

  // generations CRUD
  router.get('/api/admin/generations', requireAdmin, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM generations ORDER BY id DESC'); res.json({ generations: rows }); }
    catch(e) { console.error(e); res.status(500).json({ error: 'Error' }); }
  });
  router.post('/api/admin/generations', requireAdmin, async function(req, res) {
    try {
      var af = ['user_id','prompt','result','type'];
      var cols = [], vals = [], ph = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { cols.push(f); vals.push(req.body[f]); ph.push('$' + idx); idx++; } });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var r = await db.run('INSERT INTO generations (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING id', vals);
      var row = await db.get('SELECT * FROM generations WHERE id=$1', [r.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.put('/api/admin/generations/:id', requireAdmin, async function(req, res) {
    try {
      var af = ['user_id','prompt','result','type'];
      var sets = [], vals = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + '=$' + idx); vals.push(req.body[f]); idx++; } });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      vals.push(req.params.id);
      await db.run('UPDATE generations SET ' + sets.join(',') + ' WHERE id=$' + idx, vals);
      var row = await db.get('SELECT * FROM generations WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.delete('/api/admin/generations/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM generations WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Error' }); }
  });

  // form_submissions CRUD
  router.get('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try { var rows = await db.all('SELECT * FROM form_submissions ORDER BY id DESC'); res.json({ form_submissions: rows }); }
    catch(e) { console.error(e); res.status(500).json({ error: 'Error' }); }
  });
  router.post('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      var af = ['name','email','company','message'];
      var cols = [], vals = [], ph = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { cols.push(f); vals.push(req.body[f]); ph.push('$' + idx); idx++; } });
      if (!cols.length) return res.status(400).json({ error: 'No fields' });
      var r = await db.run('INSERT INTO form_submissions (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING id', vals);
      var row = await db.get('SELECT * FROM form_submissions WHERE id=$1', [r.lastInsertRowid]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try {
      var af = ['name','email','company','message'];
      var sets = [], vals = [], idx = 1;
      af.forEach(function(f) { if (req.body[f] !== undefined) { sets.push(f + '=$' + idx); vals.push(req.body[f]); idx++; } });
      if (!sets.length) return res.status(400).json({ error: 'No fields' });
      vals.push(req.params.id);
      await db.run('UPDATE form_submissions SET ' + sets.join(',') + ' WHERE id=$' + idx, vals);
      var row = await db.get('SELECT * FROM form_submissions WHERE id=$1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message || 'Error' }); }
  });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM form_submissions WHERE id=$1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: 'Error' }); }
  });

  router.post('/api/admin/upload-image', requireAdmin, async function(req, res) {
    try {
      if (!services.cloudinary || !services.cloudinary.uploader) return res.status(503).json({ error: 'Image upload not configured' });
      var dataUri = req.body.image;
      if (!dataUri) return res.status(400).json({ error: 'Missing image' });
      var result = await services.cloudinary.uploader.upload(dataUri, { folder: 'smartboost-ai-bb/admin' });
      res.json({ url: result.secure_url });
    } catch (e) { console.error(e); res.status(500).json({ error: e.message || 'Upload failed' }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try { var rows = await db.all('SELECT key,value FROM admin_settings'); var out = {}; rows.forEach(function(r) { out[r.key] = r.value; }); res.json({ settings: out }); }
    catch (e) { res.status(500).json({ error: 'Error' }); }
  });

  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      var key = req.body.key, value = req.body.value;
      if (!key) return res.status(400).json({ error: 'Missing key' });
      await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()', [key, value]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
  });

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
