var express = require('express');

module.exports = function(services){
  var router = express.Router();
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  var db = services.db;
  var cfg = services.config || {};

  var T = {
    fr: {
      meta_title:"Évaluation gratuite de propriété",
      meta_desc:"Découvrez la valeur réelle de votre maison. Saisissez votre adresse, recevez une fiche visuelle et une évaluation gratuite, sans engagement.",
      topbar_cta:"Évaluation gratuite",
      hero_eyebrow:"Évaluation gratuite · sans engagement",
      hero_title:"Combien vaut votre maison, vraiment ?",
      hero_sub:"Saisissez votre adresse. Nous assemblons la fiche de votre propriété et vous remettons une évaluation juste, appuyée par les ventes réelles de votre secteur.",
      address_label:"Adresse de la propriété",
      address_ph:"Commencez à taper votre adresse…",
      hero_note:"Aucuns frais. Aucune obligation. Réponse sous 24 heures.",
      fiche_label:"Dossier",
      fiche_photo_pending:"Aperçu de la rue",
      fiche_empty:"Votre fiche apparaît ici dès que vous choisissez une adresse.",
      form_name:"Nom complet",
      form_name_ph:"Ex. Marie Tremblay",
      form_email:"Courriel",
      form_email_ph:"vous@exemple.com",
      form_phone:"Téléphone",
      form_phone_ph:"(514) 000-0000",
      form_timeframe:"Échéancier de vente",
      tf_placeholder:"Choisissez…",
      tf_asap:"Dès que possible",
      tf_3:"D'ici 3 mois",
      tf_6:"D'ici 6 mois",
      tf_explore:"J'explore simplement",
      form_submit:"Sceller ma demande",
      form_submitting:"Envoi…",
      success_title:"Votre demande est scellée.",
      success_text:"Votre fiche est enregistrée. Nous préparons votre évaluation et vous joignons sous 24 heures.",
      err_required:"Veuillez indiquer votre nom et une adresse.",
      err_generic:"Un problème est survenu. Veuillez réessayer.",
      stamp_text:"Reçue",
      dir_n:"N",dir_s:"S",dir_e:"E",dir_w:"O",
      proto_eyebrow:"Le protocole",
      proto_title:"Trois gestes. Une évaluation.",
      proto_sub:"De l'adresse à la valeur, un parcours clair et sans pression.",
      step1_t:"L'adresse",
      step1_d:"Saisissez votre adresse ; l'autocomplétion la reconnaît instantanément.",
      step2_t:"L'aperçu",
      step2_d:"Votre fiche s'assemble avec la vue de rue et les coordonnées exactes.",
      step3_t:"L'évaluation",
      step3_d:"Vous scellez la demande ; nous livrons une valeur appuyée par le marché.",
      stats_title:"Les preuves en chiffres",
      stat_homes_label:"Propriétés vendues",
      stat_days_label:"Jours au marché (moy.)",
      stat_days_unit:"jours",
      stat_ratio_label:"Ratio prix vendu / demandé",
      stat_volume_label:"Volume de carrière",
      stat_volume_unit:"M$",
      agent_eyebrow:"L'agent",
      agent_title:"Courtier immobilier · RE/MAX",
      agent_credo:"Je ne récolte pas des prospects — je présente des propriétés comme des actifs. Chaque vente commence par une évaluation honnête, appuyée par les chiffres du secteur.",
      agent_remax:"Courtier immobilier agréé · Chaque agence RE/MAX est une entreprise indépendante et autonome. Permis OACIQ.",
      testi_eyebrow:"Ils ont vendu",
      testi_title:"Des dossiers conclus au-dessus des attentes.",
      testi_result_label:"Résultat",
      testi_empty:"Les témoignages arrivent bientôt.",
      journal_eyebrow:"Le journal",
      journal_title:"Notes de marché",
      journal_read:"Lire la note",
      journal_empty:"Aucune note pour le moment.",
      social_eyebrow:"Le fil",
      social_title:"Suivez les ventes en direct",
      seal_line:"Votre évaluation vous attend.",
      seal_btn:"Obtenir mon évaluation",
      footer_disclaimer:"Chaque agence RE/MAX est une entreprise indépendante et autonome. Courtier immobilier — permis OACIQ.",
      footer_rights:"Tous droits réservés.",
      push_btn:"Activer les alertes de ventes",
      back_home:"Retour à l'accueil",
      exp_eyebrow:"Lien échu",
      exp_title:"Ce lien a expiré.",
      exp_lede:"Par sécurité, chaque lien d'accès est personnel et vit 72 heures. Demandez-en un nouveau et il arrivera dans votre boîte en quelques instants.",
      exp_cta:"Demander un nouveau lien",
      inv_meta_title:"Sur invitation seulement",
      inv_meta_desc:"VendVite confie à un nombre restreint de courtiers une page privée qui transforme une adresse en mandat.",
      inv_eyebrow:"Sur invitation seulement",
      inv_title:"Les meilleurs courtiers ne courent plus après les vendeurs.",
      inv_lede:"VendVite remet à un cercle restreint de courtiers une page privée qui transforme une simple adresse en mandat signé. Laissez vos coordonnées. Si votre secteur est encore libre, votre invitation suivra.",
      inv_form_title:"Demander une invitation",
      inv_form_sub:"Quatre renseignements. Rien de plus. Nous vérifions la disponibilité de votre secteur avant de répondre.",
      inv_f_name:"Nom complet",
      inv_f_name_ph:"Ex. Marie Tremblay",
      inv_f_agency:"Agence",
      inv_f_agency_ph:"Ex. RE/MAX Signature",
      inv_f_phone:"Téléphone",
      inv_f_phone_ph:"(514) 000-0000",
      inv_f_email:"Courriel",
      inv_f_email_ph:"vous@exemple.com",
      inv_f_submit:"Demander mon invitation",
      inv_f_sending:"Envoi…",
      inv_fineprint:"Aucun engagement à cette étape. Votre invitation vous donne accès à votre page, que vous pourrez bâtir avant toute activation.",
      inv_done_title:"Votre demande est scellée.",
      inv_done_text:"Vérifiez votre courriel : votre invitation contient le lien privé vers votre page VendVite.",
      inv_mark_1:"Une page privée, à votre nom et à vos couleurs.",
      inv_mark_2:"Chaque adresse saisie devient une piste qualifiée.",
      inv_mark_3:"Les pistes vous parviennent instantanément, à vous seul.",
      inv_foot:"Cercle privé de courtiers",
      inv_err_required:"Tous les champs sont requis.",
      inv_err_email:"Ce courriel semble invalide.",
      inv_err_generic:"Un problème est survenu. Veuillez réessayer.",
      inv_err_dup:"Une invitation a déjà été envoyée à ce courriel. Vérifiez votre boîte de réception.",
    },
    en: {
      meta_title:"Free home valuation",
      meta_desc:"Find out what your home is really worth. Enter your address, get a visual property dossier and a free, no-obligation valuation.",
      topbar_cta:"Free valuation",
      hero_eyebrow:"Free valuation · no obligation",
      hero_title:"What is your home really worth?",
      hero_sub:"Type your address. We assemble your property dossier and give you a fair valuation, backed by real sales in your area.",
      address_label:"Property address",
      address_ph:"Start typing your address…",
      hero_note:"No fees. No obligation. A reply within 24 hours.",
      fiche_label:"Dossier",
      fiche_photo_pending:"Street preview",
      fiche_empty:"Your dossier appears here as soon as you choose an address.",
      form_name:"Full name",
      form_name_ph:"e.g. Marie Tremblay",
      form_email:"Email",
      form_email_ph:"you@example.com",
      form_phone:"Phone",
      form_phone_ph:"(514) 000-0000",
      form_timeframe:"Selling timeframe",
      tf_placeholder:"Choose…",
      tf_asap:"As soon as possible",
      tf_3:"Within 3 months",
      tf_6:"Within 6 months",
      tf_explore:"Just exploring",
      form_submit:"Seal my request",
      form_submitting:"Sending…",
      success_title:"Your request is sealed.",
      success_text:"Your dossier is saved. We are preparing your valuation and will reach you within 24 hours.",
      err_required:"Please enter your name and an address.",
      err_generic:"Something went wrong. Please try again.",
      stamp_text:"Received",
      dir_n:"N",dir_s:"S",dir_e:"E",dir_w:"W",
      proto_eyebrow:"The protocol",
      proto_title:"Three moves. One valuation.",
      proto_sub:"From address to value — a clear path, with no pressure.",
      step1_t:"The address",
      step1_d:"Type your address; autocomplete recognises it instantly.",
      step2_t:"The preview",
      step2_d:"Your dossier assembles with the street view and exact coordinates.",
      step3_t:"The valuation",
      step3_d:"You seal the request; we deliver a market-backed value.",
      stats_title:"The proof, in numbers",
      stat_homes_label:"Properties sold",
      stat_days_label:"Days on market (avg.)",
      stat_days_unit:"days",
      stat_ratio_label:"Sold-to-list price ratio",
      stat_volume_label:"Career volume",
      stat_volume_unit:"M$",
      agent_eyebrow:"The agent",
      agent_title:"Real estate broker · RE/MAX",
      agent_credo:"I don't harvest leads — I present homes as assets. Every sale begins with an honest valuation, backed by the numbers of your area.",
      agent_remax:"Licensed real estate broker · Each RE/MAX office is independently owned and operated. OACIQ licence.",
      testi_eyebrow:"They sold",
      testi_title:"Files that closed above expectations.",
      testi_result_label:"Result",
      testi_empty:"Testimonials are coming soon.",
      journal_eyebrow:"The journal",
      journal_title:"Market notes",
      journal_read:"Read the note",
      journal_empty:"No notes yet.",
      social_eyebrow:"The feed",
      social_title:"Follow the sales live",
      seal_line:"Your valuation is waiting.",
      seal_btn:"Get my valuation",
      footer_disclaimer:"Each RE/MAX office is independently owned and operated. Real estate broker — OACIQ licence.",
      footer_rights:"All rights reserved.",
      push_btn:"Enable sales alerts",
      back_home:"Back to home",
      exp_eyebrow:"Link expired",
      exp_title:"This link has expired.",
      exp_lede:"For safety, every access link is personal and lives 72 hours. Request a new one and it lands in your inbox within moments.",
      exp_cta:"Request a new link",
      inv_meta_title:"By invitation only",
      inv_meta_desc:"VendVite gives a small circle of brokers a private page that turns an address into a signed mandate.",
      inv_eyebrow:"By invitation only",
      inv_title:"The best brokers stopped chasing sellers.",
      inv_lede:"VendVite hands a restricted circle of brokers a private page that turns a simple address into a signed mandate. Leave your details. If your territory is still open, your invitation follows.",
      inv_form_title:"Request an invitation",
      inv_form_sub:"Four details. Nothing more. We check your territory before replying.",
      inv_f_name:"Full name",
      inv_f_name_ph:"e.g. Marie Tremblay",
      inv_f_agency:"Agency",
      inv_f_agency_ph:"e.g. RE/MAX Signature",
      inv_f_phone:"Phone",
      inv_f_phone_ph:"(514) 000-0000",
      inv_f_email:"Email",
      inv_f_email_ph:"you@example.com",
      inv_f_submit:"Request my invitation",
      inv_f_sending:"Sending…",
      inv_fineprint:"No commitment at this stage. Your invitation unlocks your page, which you can build before any activation.",
      inv_done_title:"Your request is sealed.",
      inv_done_text:"Check your inbox: your invitation holds the private link to your VendVite page.",
      inv_mark_1:"A private page, in your name and your colours.",
      inv_mark_2:"Every address entered becomes a qualified lead.",
      inv_mark_3:"Leads reach you instantly, and you alone.",
      inv_foot:"Private circle of brokers",
      inv_err_required:"All fields are required.",
      inv_err_email:"That email looks invalid.",
      inv_err_generic:"Something went wrong. Please try again.",
      inv_err_dup:"An invitation was already sent to this email. Check your inbox.",
    }
  };

  var MODULES = [
    { key:'leads', label:'Demande', icon:'inbox', columns:['name','address','timeframe','status','created_at'], fields:[
      { name:'name', type:'text', required:true, label:'Nom', description:"Nom complet du propriétaire.", placeholder:'Ex. Marie Tremblay' },
      { name:'email', type:'email', label:'Courriel', description:"Adresse courriel pour le suivi.", placeholder:'personne@exemple.com' },
      { name:'phone', type:'text', label:'Téléphone', description:'Numéro de téléphone du prospect.', placeholder:'(514) 000-0000' },
      { name:'address', type:'textarea', label:'Adresse', description:"Adresse de la propriété à évaluer.", placeholder:'123 rue Principale, Montréal' },
      { name:'timeframe', type:'text', label:'Échéancier', description:'Quand le propriétaire souhaite vendre.', placeholder:"Ex. D'ici 3 mois" },
      { name:'status', type:'select', options:['nouveau','contacté','évalué','fermé'], default:'nouveau', label:'Statut', description:'Étape de suivi du dossier.' },
      { name:'notes', type:'textarea', label:'Notes internes', description:"Notes privées visibles seulement dans l'administration.", placeholder:'Ex. Rappeler jeudi après-midi.' }
    ]},
    { key:'testimonials', label:'Témoignage', icon:'star', columns:['author','neighborhood','sale_result','published','created_at'], fields:[
      { name:'author', type:'text', required:true, label:'Nom du vendeur', description:'Nom affiché sous le témoignage.', placeholder:'Ex. Julie & Marc' },
      { name:'neighborhood', type:'text', label:'Quartier', description:'Secteur ou quartier de la vente.', placeholder:'Ex. Rosemont, Montréal' },
      { name:'quote', type:'textarea', required:true, label:'Témoignage', description:'Le texte du témoignage client.', placeholder:'Ex. Vendu en six jours au-dessus du prix demandé…' },
      { name:'sale_result', type:'text', label:'Résultat de vente', description:'Résultat chiffré affiché en rouge (ex. +12 % du prix demandé).', placeholder:'Ex. +12 % du prix demandé' },
      { name:'sort_order', type:'number', min:0, step:1, label:"Ordre d'affichage", description:'Plus petit = affiché en premier.', placeholder:'0' },
      { name:'published', type:'boolean', default:true, label:'Publié', description:'Décochez pour masquer ce témoignage du site.' }
    ]},
    { key:'posts', label:'Note', icon:'edit', columns:['title','category','published','created_at'], fields:[
      { name:'title', type:'text', required:true, maxLength:160, label:'Titre', description:'Titre de la note de marché.', placeholder:'Ex. Le marché des vendeurs à Laval ce printemps' },
      { name:'excerpt', type:'textarea', label:'Extrait', description:'Court résumé affiché sur la carte (2-3 phrases).', placeholder:'Ex. Les délais de vente se resserrent…' },
      { name:'content', type:'textarea', label:'Contenu', description:'Corps complet de la note. Séparez les paragraphes par une ligne vide.', placeholder:'Rédigez votre note ici…' },
      { name:'image_url', type:'image', label:'Image de couverture', description:'Image affichée en tête de la note. Recommandé : 1200×675 px paysage.' },
      { name:'category', type:'text', maxLength:50, label:'Catégorie', description:'Regroupe les notes (ex. Marché, Conseils).', placeholder:'Ex. Marché' },
      { name:'published', type:'boolean', default:true, label:'Publié', description:'Décochez pour enregistrer en brouillon.' }
    ]}
  ];

  var SETTINGS_FIELDS = [
    { name:'social_facebook', type:'url', label:'Facebook', description:'Lien de votre page Facebook.' },
    { name:'social_instagram', type:'url', label:'Instagram', description:'Lien de votre profil Instagram.' },
    { name:'social_linkedin', type:'url', label:'LinkedIn', description:'Lien de votre profil LinkedIn.' },
    { name:'social_youtube', type:'url', label:'YouTube', description:'Lien de votre chaîne YouTube.' },
    { name:'social_tiktok', type:'url', label:'TikTok', description:'Lien de votre compte TikTok.' }
  ];

  var SETTINGS_GROUPS = [
    { title:"Coordonnées de l'agent", fields:[
      { key:'agent_name', label:'Nom affiché', type:'text', placeholder:'Ex. Marie Tremblay' },
      { key:'agent_email', label:'Courriel', type:'email', placeholder:'vous@exemple.com' },
      { key:'agent_phone', label:'Téléphone', type:'text', placeholder:'(514) 000-0000' },
      { key:'agent_license', label:'Permis / titre', type:'text', placeholder:'Courtier immobilier · OACIQ' },
      { key:'tagline', label:'Slogan', type:'text', placeholder:'Évaluation gratuite de votre propriété' }
    ]},
    { title:"Statistiques (page d'accueil)", fields:[
      { key:'stat_homes_sold', label:'Propriétés vendues', type:'number', placeholder:'512' },
      { key:'stat_avg_days', label:'Jours au marché (moyenne)', type:'number', placeholder:'19' },
      { key:'stat_list_to_sale', label:'Ratio prix vendu / demandé (%)', type:'number', placeholder:'99' },
      { key:'stat_career_volume', label:'Volume de carrière (M$)', type:'number', placeholder:'285' }
    ]},
    { title:'Réseaux sociaux', fields:[
      { key:'social_facebook', label:'Facebook', type:'url', placeholder:'https://facebook.com/...' },
      { key:'social_instagram', label:'Instagram', type:'url', placeholder:'https://instagram.com/...' },
      { key:'social_linkedin', label:'LinkedIn', type:'url', placeholder:'https://linkedin.com/in/...' },
      { key:'social_youtube', label:'YouTube', type:'url', placeholder:'https://youtube.com/@...' },
      { key:'social_tiktok', label:'TikTok', type:'url', placeholder:'https://tiktok.com/@...' }
    ]}
  ];

  function tp(req, p){ return (typeof req.tenantPath === 'function') ? req.tenantPath(p) : p.replace(/^\//,''); }
  function formatPhone(p){ if(!p) return ''; var d=String(p).replace(/\D/g,''); if(d.length===10) return '('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6); if(d.length===11 && d[0]==='1') return '1 ('+d.slice(1,4)+') '+d.slice(4,7)+'-'+d.slice(7); return p; }
  function formatDate(d, lang){ if(!d) return ''; try{ return new Date(d).toLocaleDateString(lang==='en'?'en-CA':'fr-CA',{ year:'numeric', month:'long', day:'numeric' }); }catch(e){ return ''; } }
  function statusClass(s){ s=(s||'nouveau'); if(s==='contacté'||s==='contacted') return 'badge-contacted'; if(s==='évalué'||s==='valued') return 'badge-valued'; if(s==='fermé'||s==='closed') return 'badge-closed'; return 'badge-new'; }
  async function getSettings(){ try{ var rows=await db.all('SELECT key,value FROM admin_settings'); var s={}; rows.forEach(function(r){ s[r.key]=r.value; }); return s; }catch(e){ return {}; } }
  function applyTextOverrides(t, settings, lang){ for(var k in settings){ if(k.indexOf('text_')===0 && k.slice(-(lang.length+1))==='_'+lang){ var tk=k.slice(5, -(lang.length+1)); if(tk) t[tk]=settings[k]; } } return t; }

  (async function(){
    try{
      var defs = {
        agent_name: cfg.businessName || cfg.ownerName || cfg.displayName || 'Votre courtier RE/MAX',
        agent_email: cfg.contactEmail || '',
        agent_phone: cfg.contactPhone || '',
        agent_license: 'Courtier immobilier · OACIQ'
      };
      for(var k in defs){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[k, defs[k]]); }
    }catch(e){}
  })();

  router.use(async function(req,res,next){
    try{ if(req.method==='GET' && req.path.indexOf('/api/')!==0 && req.path.indexOf('/admin')!==0 && req.path.indexOf('.')===-1){ await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); } }catch(e){}
    next();
  });

  router.use(function(req,res,next){
    var lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if(lang!=='en') lang='fr';
    if(req.query.lang){ try{ res.cookie('pwa_lang', lang, { maxAge:31536000000 }); }catch(e){} }
    req.lang = lang;
    next();
  });

  async function baseLocals(req){
    var lang=req.lang; var settings=await getSettings();
    var t=applyTextOverrides(Object.assign({}, T[lang]||T.fr), settings, lang);
    var ogImage = settings._p_agent_image_url || '';
    var canonical = '';
    try{ if(typeof req.tenantUrl==='function') canonical=req.tenantUrl('/'); }catch(e){}
    return { t:t, lang:lang, settings:settings, formatDate:function(d){ return formatDate(d, lang); }, formatPhone:formatPhone, googleApiKey:(services.google && services.google.mapsApiKey) || '', ogImage:ogImage, canonical:canonical, statusClass:statusClass };
  }

  router.get('/', async function(req,res){
    try{
      var L=await baseLocals(req);
      var testimonials=await db.all('SELECT * FROM testimonials WHERE published=1 ORDER BY sort_order ASC, created_at DESC');
      var posts=await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', Object.assign(L, { testimonials:testimonials, posts:posts, isHome:true }));
    }catch(e){ console.error('index', e); res.status(500).send('Erreur'); }
  });

  router.get('/journal/:id', async function(req,res){
    try{
      var L=await baseLocals(req);
      var post=await db.get('SELECT * FROM posts WHERE id=$1',[req.params.id]);
      if(!post || !(post.published==1 || post.published===true)) return res.redirect('.');
      res.render('journal', Object.assign(L, { post:post, isHome:false }));
    }catch(e){ console.error('journal', e); res.redirect('.'); }
  });

  router.post('/api/lead', async function(req,res){
    try{
      var b=req.body||{};
      var name=(b.name||'').trim(), address=(b.address||'').trim();
      if(!name || !address) return res.status(400).json({ error:'missing' });
      var lat=b.lat?parseFloat(b.lat):null, lng=b.lng?parseFloat(b.lng):null;
      if(isNaN(lat)) lat=null; if(isNaN(lng)) lng=null;
      await db.run('INSERT INTO leads (name,email,phone,address,lat,lng,timeframe,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[name,(b.email||'').trim(),(b.phone||'').trim(),address,lat,lng,(b.timeframe||'').trim(),'nouveau']);
      try{
        if(cfg.contactEmail){
          var html="<h2>Nouvelle demande d'évaluation</h2><p><b>Nom :</b> "+name+"</p><p><b>Courriel :</b> "+(b.email||'—')+"</p><p><b>Téléphone :</b> "+(b.phone||'—')+"</p><p><b>Adresse :</b> "+address+"</p><p><b>Échéancier :</b> "+(b.timeframe||'—')+"</p>"+(lat?("<p><b>Coordonnées :</b> "+lat+", "+lng+"</p>"):"");
          try { await services.email.send({ to:cfg.contactEmail, subject:'Nouvelle évaluation — '+name, html:html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      }catch(mailErr){ console.error('lead email', mailErr.message); }
      res.json({ success:true });
    }catch(e){ console.error('lead', e); res.status(500).json({ error:'server' }); }
  });

  function requireAdmin(req,res,next){ if(!services.admin.isAdmin(req)) return res.redirect(tp(req,'/admin/login')); next(); }
  function apiAdmin(req,res){ if(!services.admin.isAdmin(req)){ res.status(403).json({ error:'Forbidden' }); return false; } return true; }
  function findModule(k){ for(var i=0;i<MODULES.length;i++){ if(MODULES[i].key===k) return MODULES[i]; } return null; }

  async function gatherStats(){
    var s={ leads:0,newLeads:0,testimonials:0,posts:0,visits:0,recentVisits:0,pushCount:0,userCount:0 };
    try{ var r=await db.get('SELECT COUNT(*)::int c FROM leads'); s.leads=r.c; }catch(e){}
    try{ var r2=await db.get("SELECT COUNT(*)::int c FROM leads WHERE status='nouveau'"); s.newLeads=r2.c; }catch(e){}
    try{ var r3=await db.get('SELECT COUNT(*)::int c FROM testimonials'); s.testimonials=r3.c; }catch(e){}
    try{ var r4=await db.get('SELECT COUNT(*)::int c FROM posts'); s.posts=r4.c; }catch(e){}
    try{ var r5=await db.get('SELECT COUNT(*)::int c FROM site_visits'); s.visits=r5.c; }catch(e){}
    try{ var r6=await db.get("SELECT COUNT(*)::int c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"); s.recentVisits=r6.c; }catch(e){}
    try{ if(services.push && services.push.getSubscriptionCount){ s.pushCount=await services.push.getSubscriptionCount(); } }catch(e){}
    try{ if(services.auth && services.auth.getUserCount){ s.userCount=await services.auth.getUserCount(); } }catch(e){}
    return s;
  }

  router.get('/admin', requireAdmin, async function(req,res){
    try{
      var L=await baseLocals(req);
      var stats=await gatherStats();
      var recentLeads=await db.all('SELECT * FROM leads ORDER BY created_at DESC LIMIT 8');
      res.render('admin', Object.assign(L, { active:'dashboard', stats:stats, recentLeads:recentLeads }));
    }catch(e){ console.error('admin', e); res.status(500).send('Erreur'); }
  });

  router.get('/admin/leads', requireAdmin, async function(req,res){ var L=await baseLocals(req); res.render('admin-leads', Object.assign(L, { active:'leads', moduleConfig:findModule('leads') })); });
  router.get('/admin/testimonials', requireAdmin, async function(req,res){ var L=await baseLocals(req); res.render('admin-testimonials', Object.assign(L, { active:'testimonials', moduleConfig:findModule('testimonials') })); });
  router.get('/admin/posts', requireAdmin, async function(req,res){ var L=await baseLocals(req); res.render('admin-posts', Object.assign(L, { active:'posts', moduleConfig:findModule('posts') })); });
  router.get('/admin/settings', requireAdmin, async function(req,res){ var L=await baseLocals(req); res.render('admin-settings', Object.assign(L, { active:'settings', settingsGroups:SETTINGS_GROUPS })); });

  router.get('/api/admin/stats', async function(req,res){ if(!apiAdmin(req,res))return; try{ var s=await gatherStats(); res.json({ userCount:s.userCount, pushSubscriberCount:s.pushCount, totalVisits:s.visits, recentVisits:s.recentVisits, leads:s.leads, newLeads:s.newLeads, testimonials:s.testimonials, posts:s.posts }); }catch(e){ res.status(500).json({ error:'server' }); } });

  router.get('/api/admin/modules', function(req,res){ if(!apiAdmin(req,res))return; res.json({ modules:MODULES.map(function(m){ return { key:m.key, label:m.label, icon:m.icon, fields:m.fields }; }), settingsFields:SETTINGS_FIELDS }); });

  router.get('/api/admin/settings', async function(req,res){ if(!apiAdmin(req,res))return; res.json(await getSettings()); });
  router.put('/api/admin/settings', async function(req,res){ if(!apiAdmin(req,res))return; try{ var k=req.body.key, v=req.body.value; if(!k) return res.status(400).json({ error:'key' }); await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k,v]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'server' }); } });

  function normalize(m, body){ var data={}; m.fields.forEach(function(f){ if(body[f.name]===undefined) return; var v=body[f.name]; if(f.type==='boolean'){ v=(v===true||v==='true'||v===1||v==='1'||v==='on')?1:0; } else if(f.type==='number'){ v=(v===''||v===null)?null:Number(v); } data[f.name]=v; }); return data; }

  function buildInsert(tbl, data){
    var keys=Object.keys(data);
    var cols=keys.join(',');
    var ph=keys.map(function(x,i){ return '$'+(i+1); }).join(',');
    var vals=keys.map(function(k){ return data[k]; });
    return { sql:'INSERT INTO '+tbl+' ('+cols+') VALUES ('+ph+') RETURNING id', vals:vals };
  }

  function buildUpdate(tbl, data, id){
    var keys=Object.keys(data);
    var set=keys.map(function(k,i){ return k+'=$'+(i+1); }).join(',');
    var vals=keys.map(function(k){ return data[k]; });
    vals.push(id);
    return { sql:'UPDATE '+tbl+' SET '+set+', updated_at=NOW() WHERE id=$'+(keys.length+1), vals:vals };
  }

  // --- CRUD: leads ---
  router.get('/api/admin/leads', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var rows=await db.all('SELECT * FROM leads ORDER BY created_at DESC'); res.json({ leads:rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/leads', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('leads'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildInsert('leads',data); var r=await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM leads WHERE id=$1',[r.lastInsertRowid]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/leads/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('leads'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildUpdate('leads',data,req.params.id); await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM leads WHERE id=$1',[req.params.id]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/leads/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ await db.run('DELETE FROM leads WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'server' }); }
  });

  // --- CRUD: testimonials ---
  router.get('/api/admin/testimonials', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var rows=await db.all('SELECT * FROM testimonials ORDER BY created_at DESC'); res.json({ testimonials:rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/testimonials', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('testimonials'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildInsert('testimonials',data); var r=await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM testimonials WHERE id=$1',[r.lastInsertRowid]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/testimonials/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('testimonials'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildUpdate('testimonials',data,req.params.id); await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM testimonials WHERE id=$1',[req.params.id]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/testimonials/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ await db.run('DELETE FROM testimonials WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'server' }); }
  });

  // --- CRUD: posts ---
  router.get('/api/admin/posts', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var rows=await db.all('SELECT * FROM posts ORDER BY created_at DESC'); res.json({ posts:rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/posts', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('posts'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildInsert('posts',data); var r=await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM posts WHERE id=$1',[r.lastInsertRowid]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/posts/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ var data=normalize(findModule('posts'),req.body); var keys=Object.keys(data); if(!keys.length) return res.status(400).json({ error:'empty' }); var q=buildUpdate('posts',data,req.params.id); await db.run(q.sql,q.vals); var row=await db.get('SELECT * FROM posts WHERE id=$1',[req.params.id]); res.json({ success:true, item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/posts/:id', async function(req,res){
    if(!apiAdmin(req,res))return;
    try{ await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'server' }); }
  });

  router.post('/api/admin/generate-image', async function(req,res){ if(!apiAdmin(req,res))return; try{ var prompt=req.body.prompt; var ar=req.body.aspectRatio||'16:9'; if(!prompt) return res.status(400).json({ error:'prompt' }); var url=await services.ai.generateImage(prompt, { aspectRatio:ar }); res.json({ imageUrl:url }); }catch(e){ console.error('genimg', e); res.status(500).json({ error:'La génération a échoué. Téléversez une image manuellement.' }); } });

  // ══ Cercle de courtiers — invitation, espace privé, page publique ══════
  //
  // Membership lifecycle: invited → active (paid) → expired/cancelled.
  // A broker may edit and preview their page at ANY status; only `active`
  // + published makes the public page reachable and lead capture live.
  // Payment is a PayPal subscription; PAYPAL_* come from api_variables
  // (services.externalVars), never hardcoded.

  var BROKER_COOKIE = 'vv_courtier';
  var BROKER_TOKEN_TTL_H = 72;
  var PRICE_BASE = 599;
  var TAX_GST = 0.05;
  var TAX_QST = 0.09975;
  function priceLines(){
    var gst = Math.round(PRICE_BASE * TAX_GST * 100) / 100;
    var qst = Math.round(PRICE_BASE * TAX_QST * 100) / 100;
    return { base: PRICE_BASE, gst: gst, qst: qst, total: Math.round((PRICE_BASE + gst + qst) * 100) / 100 };
  }

  // Paths the broker-slug catch-all must never swallow.
  var RESERVED_SLUGS = ['api','admin','acces','espace','journal','public','manifest.json','sw.js','favicon.ico','robots.txt','_platform','__preview','courtier','courtiers','index'];

  function slugifyPart(s){
    return String(s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  async function uniqueBrokerSlug(name, agency){
    var base = [slugifyPart(name), slugifyPart(agency)].filter(Boolean).join('-') || 'courtier';
    if (RESERVED_SLUGS.indexOf(base) !== -1) base = base + '-courtier';
    var candidate = base, n = 1;
    while (true) {
      var hit = await db.get('SELECT id FROM brokers WHERE slug=$1', [candidate]);
      if (!hit) return candidate;
      n++;
      candidate = base + '-' + n;
    }
  }

  function brokerIsActive(b){
    if (!b || b.status !== 'active') return false;
    if (!b.membership_expires_at) return false;
    return new Date(b.membership_expires_at).getTime() > Date.now();
  }
  function brokerPageLive(b){ return brokerIsActive(b) && Number(b.published) === 1; }

  function brokerProfile(b){
    var p = {};
    try { p = (b && b.profile) ? (typeof b.profile === 'string' ? JSON.parse(b.profile) : b.profile) : {}; } catch(e){ p = {}; }
    return p || {};
  }

  async function logBrokerEvent(brokerId, kind, detail){
    try { await db.run('INSERT INTO broker_events (broker_id,kind,detail) VALUES ($1,$2,$3)', [brokerId, kind, (detail || '').slice(0, 500)]); } catch(e){}
  }

  function absoluteUrl(req, path){
    try { if (typeof req.tenantUrl === 'function') return req.tenantUrl(path); } catch(e){}
    var proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0];
    return proto + '://' + req.get('host') + (path.charAt(0) === '/' ? path : '/' + path);
  }

  // ── Magic-link tokens (hash-at-rest; the raw token only ever exists in the email)
  async function mintBrokerToken(brokerId, purpose){
    var raw = services.crypto.randomBytes(32);
    var hash = services.crypto.sha256(raw);
    var expires = new Date(Date.now() + BROKER_TOKEN_TTL_H * 3600 * 1000).toISOString();
    await db.run('INSERT INTO broker_tokens (broker_id,token_hash,purpose,expires_at) VALUES ($1,$2,$3,$4)', [brokerId, hash, purpose || 'access', expires]);
    return raw;
  }

  async function consumeBrokerToken(raw){
    if (!raw || typeof raw !== 'string' || raw.length < 20) return null;
    var hash = services.crypto.sha256(raw);
    var row = await db.get('SELECT * FROM broker_tokens WHERE token_hash=$1', [hash]);
    if (!row) return null;
    if (row.used_at) return null;
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return null;
    await db.run('UPDATE broker_tokens SET used_at=NOW() WHERE id=$1', [row.id]);
    return await db.get('SELECT * FROM brokers WHERE id=$1', [row.broker_id]);
  }

  // ── Broker session: signed cookie (HMAC over id, keyed by the platform JWT secret)
  function signBrokerSession(id){
    var payload = String(id) + '.' + Date.now();
    var sig = require('crypto').createHmac('sha256', services.jwtSecret || 'vv').update(payload).digest('hex').slice(0, 32);
    return payload + '.' + sig;
  }
  function readBrokerSession(raw){
    if (!raw) return null;
    var parts = String(raw).split('.');
    if (parts.length !== 3) return null;
    var payload = parts[0] + '.' + parts[1];
    var expect = require('crypto').createHmac('sha256', services.jwtSecret || 'vv').update(payload).digest('hex').slice(0, 32);
    var a = Buffer.from(parts[2]);
    var b = Buffer.from(expect);
    if (a.length !== b.length || !require('crypto').timingSafeEqual(a, b)) return null;
    if (Date.now() - Number(parts[1]) > 30 * 24 * 3600 * 1000) return null;
    return Number(parts[0]);
  }

  async function currentBroker(req){
    var id = readBrokerSession(req.cookies ? req.cookies[BROKER_COOKIE] : null);
    if (!id) return null;
    return await db.get('SELECT * FROM brokers WHERE id=$1', [id]);
  }

  async function requireBroker(req, res){
    var b = await currentBroker(req);
    if (!b) { res.redirect('acces-expire'); return null; }
    return b;
  }
  async function requireBrokerApi(req, res){
    var b = await currentBroker(req);
    if (!b) { res.status(401).json({ error: 'session' }); return null; }
    return b;
  }

  // ── Invitation email
  async function sendInviteEmail(req, broker, rawToken, lang){
    var link = absoluteUrl(req, '/acces/' + rawToken);
    var fr = (lang !== 'en');
    var subject = fr ? 'Votre invitation VendVite' : 'Your VendVite invitation';
    var pageUrl = absoluteUrl(req, '/' + broker.slug);
    var html = ''
      + '<div style="background:#0D0A0B;padding:34px 20px;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif">'
      + '<div style="max-width:520px;margin:0 auto;background:linear-gradient(165deg,#171213,#0f0b0c);border:1px solid rgba(245,239,230,.12);border-radius:10px;padding:32px 28px;color:#F5EFE6">'
      + '<div style="font-family:IBM Plex Mono,monospace;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#C79A5B;margin-bottom:18px">'
      + (fr ? 'Sur invitation seulement' : 'By invitation only') + '</div>'
      + '<h1 style="font-family:Georgia,serif;font-size:25px;line-height:1.15;margin:0 0 14px;color:#F5EFE6">'
      + (fr ? 'Votre page vous attend, ' : 'Your page is waiting, ') + escapeHtml(broker.full_name.split(' ')[0]) + '.</h1>'
      + '<p style="color:rgba(245,239,230,.64);font-size:15px;line-height:1.6;margin:0 0 22px">'
      + (fr
        ? 'Votre place dans le cercle VendVite est réservée. Le lien ci-dessous ouvre votre page privée — vous pouvez la bâtir, la personnaliser et la prévisualiser dès maintenant, sans aucun engagement.'
        : 'Your place in the VendVite circle is reserved. The link below opens your private page — build it, personalise it and preview it right away, with no commitment.')
      + '</p>'
      + '<a href="' + link + '" style="display:block;text-align:center;padding:16px;border-radius:4px;background:#E30B2D;color:#fff;text-decoration:none;font-family:Georgia,serif;font-weight:bold;font-size:16px;box-shadow:inset 0 0 0 1.5px rgba(199,154,91,.5)">'
      + (fr ? 'Ouvrir ma page privée' : 'Open my private page') + '</a>'
      + '<p style="color:rgba(245,239,230,.34);font-size:12.5px;line-height:1.6;margin:20px 0 0">'
      + (fr ? 'Votre adresse réservée : ' : 'Your reserved address: ') + '<span style="color:#C79A5B">' + pageUrl + '</span><br>'
      + (fr ? 'Ce lien est personnel et expire dans 72 heures.' : 'This link is personal and expires in 72 hours.')
      + '</p></div></div>';
    var text = (fr ? 'Votre page privée VendVite : ' : 'Your private VendVite page: ') + link;
    return await services.email.send({ to: broker.email, subject: subject, html: html, text: text });
  }

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }

  // ── POST /api/courtier/candidature — the homepage form
  router.post('/api/courtier/candidature', async function(req, res){
    try{
      var b = req.body || {};
      var lang = req.lang || 'fr';
      var TT = T[lang] || T.fr;
      var name = String(b.name || '').trim().slice(0, 120);
      var agency = String(b.agency || '').trim().slice(0, 120);
      var phone = String(b.phone || '').trim().slice(0, 40);
      var email = String(b.email || '').trim().toLowerCase().slice(0, 190);
      if (!name || !agency || !phone || !email) return res.status(400).json({ error: TT.inv_err_required });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: TT.inv_err_email });

      var existing = await db.get('SELECT * FROM brokers WHERE LOWER(email)=$1', [email]);
      if (existing) {
        // Re-invite rather than leak whether the address is already enrolled.
        var reToken = await mintBrokerToken(existing.id, 'access');
        try { await sendInviteEmail(req, existing, reToken, lang); } catch(e){ console.error('invite resend', e); }
        await logBrokerEvent(existing.id, 'invite_resent', email);
        return res.json({ success: true, message: TT.inv_done_text });
      }

      var slug = await uniqueBrokerSlug(name, agency);
      var ins = await db.get(
        'INSERT INTO brokers (slug,full_name,agency,phone,email,status,profile) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [slug, name, agency, phone, email, 'invited', JSON.stringify({
          agent_name: name,
          agency: agency,
          agent_phone: phone,
          agent_email: email,
          hero_title: null,
          links: []
        })]
      );
      var raw = await mintBrokerToken(ins.id, 'access');
      try { await sendInviteEmail(req, ins, raw, lang); }
      catch(e){ console.error('invite email', e); }
      await logBrokerEvent(ins.id, 'applied', agency + ' / ' + email);
      res.json({ success: true, message: TT.inv_done_text, slug: slug });
    }catch(e){
      console.error('candidature', e);
      var TT2 = T[req.lang || 'fr'] || T.fr;
      res.status(500).json({ error: TT2.inv_err_generic });
    }
  });

  // ── GET /acces/:token — magic link lands here, opens the private space
  router.get('/acces/:token', async function(req, res){
    try{
      var broker = await consumeBrokerToken(req.params.token);
      if (!broker) return res.redirect('../acces-expire');
      res.cookie(BROKER_COOKIE, signBrokerSession(broker.id), {
        httpOnly: true, sameSite: 'lax', secure: true, maxAge: 30 * 24 * 3600 * 1000
      });
      await db.run('UPDATE brokers SET last_seen_at=NOW() WHERE id=$1', [broker.id]);
      await logBrokerEvent(broker.id, 'access_link_used', '');
      res.redirect('../espace');
    }catch(e){ console.error('acces', e); res.redirect('../acces-expire'); }
  });


  // ── Expired / invalid magic link
  router.get('/acces-expire', async function(req, res){
    var L = await baseLocals(req);
    res.status(410).render('acces-expire', Object.assign(L, { isHome: false }));
  });

  // ── Broker private space
  async function espaceLocals(req, broker){
    var L = await baseLocals(req);
    var leads = await db.all('SELECT * FROM broker_leads WHERE broker_id=$1 ORDER BY created_at DESC LIMIT 200', [broker.id]);
    var counts = await db.get("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='nouveau')::int AS fresh, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')::int AS recent FROM broker_leads WHERE broker_id=$1", [broker.id]);
    return Object.assign(L, {
      isHome: false,
      broker: broker,
      profile: brokerProfile(broker),
      leads: leads || [],
      counts: counts || { total: 0, fresh: 0, recent: 0 },
      isActive: brokerIsActive(broker),
      isLive: brokerPageLive(broker),
      price: priceLines(),
      pageUrl: absoluteUrl(req, '/' + broker.slug)
    });
  }

  router.get('/espace', async function(req, res){
    var broker = await requireBroker(req, res);
    if (!broker) return;
    try{
      await db.run('UPDATE brokers SET last_seen_at=NOW() WHERE id=$1', [broker.id]);
      res.render('espace', await espaceLocals(req, broker));
    }catch(e){ console.error('espace', e); res.status(500).send('Erreur'); }
  });

  // Live preview of the broker's own page, regardless of published/paid state.
  router.get('/espace/apercu', async function(req, res){
    var broker = await requireBroker(req, res);
    if (!broker) return;
    try{ await renderBrokerPage(req, res, broker, true); }
    catch(e){ console.error('apercu', e); res.status(500).send('Erreur'); }
  });

  router.post('/api/espace/profil', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var incoming = req.body && typeof req.body === 'object' ? req.body : {};
      var current = brokerProfile(broker);
      var ALLOWED = ['agent_name','agency','agent_phone','agent_email','agent_title','agent_photo_url','hero_title','hero_sub','hero_note','about','stat_homes','stat_days','stat_ratio','stat_volume','links','testimonials'];
      var next = Object.assign({}, current);
      ALLOWED.forEach(function(k){
        if (!(k in incoming)) return;
        var v = incoming[k];
        if (k === 'links') {
          if (!Array.isArray(v)) return;
          next.links = v.slice(0, 12).map(function(l){
            return {
              label: String((l && l.label) || '').slice(0, 40),
              url: String((l && l.url) || '').slice(0, 300)
            };
          }).filter(function(l){ return l.label && /^https?:\/\//i.test(l.url); });
          return;
        }
        if (k === 'testimonials') {
          if (!Array.isArray(v)) return;
          next.testimonials = v.slice(0, 12).map(function(x){
            return {
              author: String((x && x.author) || '').slice(0, 80),
              neighborhood: String((x && x.neighborhood) || '').slice(0, 80),
              quote: String((x && x.quote) || '').slice(0, 600),
              sale_result: String((x && x.sale_result) || '').slice(0, 80)
            };
          }).filter(function(x){ return x.author && x.quote; });
          return;
        }
        next[k] = v == null ? null : String(v).slice(0, 1200);
      });
      await db.run('UPDATE brokers SET profile=$1, updated_at=NOW() WHERE id=$2', [JSON.stringify(next), broker.id]);
      await logBrokerEvent(broker.id, 'profile_saved', '');
      res.json({ success: true, profile: next });
    }catch(e){ console.error('profil', e); res.status(500).json({ error: 'server' }); }
  });

  // Photo upload → Cloudinary, scoped to this broker's folder.
  router.post('/api/espace/photo', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var dataUrl = (req.body && req.body.image) || '';
      if (!/^data:image\/(png|jpe?g|webp);base64,/.test(dataUrl)) return res.status(400).json({ error: 'format' });
      if (dataUrl.length > 8 * 1024 * 1024) return res.status(413).json({ error: 'taille' });
      var up = await services.cloudinary.uploader.upload(dataUrl, {
        folder: 'vendvite_courtiers/' + broker.slug,
        public_id: 'portrait',
        overwrite: true,
        resource_type: 'image'
      });
      var url = (up && (up.secure_url || up.url)) || '';
      if (!url) return res.status(502).json({ error: 'upload' });
      var prof = brokerProfile(broker);
      prof.agent_photo_url = url;
      await db.run('UPDATE brokers SET profile=$1, updated_at=NOW() WHERE id=$2', [JSON.stringify(prof), broker.id]);
      res.json({ success: true, url: url });
    }catch(e){ console.error('photo', e); res.status(500).json({ error: 'server' }); }
  });

  router.post('/api/espace/publier', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    var want = req.body && req.body.published === false ? 0 : 1;
    if (want === 1 && !brokerIsActive(broker)) {
      return res.status(402).json({ error: 'abonnement', code: 'PAYMENT_REQUIRED' });
    }
    try{
      await db.run('UPDATE brokers SET published=$1, updated_at=NOW() WHERE id=$2', [want, broker.id]);
      await logBrokerEvent(broker.id, want ? 'published' : 'unpublished', '');
      res.json({ success: true, published: want === 1 });
    }catch(e){ console.error('publier', e); res.status(500).json({ error: 'server' }); }
  });

  router.get('/api/espace/leads', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var rows = await db.all('SELECT * FROM broker_leads WHERE broker_id=$1 ORDER BY created_at DESC LIMIT 500', [broker.id]);
      res.json({ leads: rows || [] });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });

  router.put('/api/espace/leads/:id', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    try{
      var owned = await db.get('SELECT id FROM broker_leads WHERE id=$1 AND broker_id=$2', [req.params.id, broker.id]);
      if (!owned) return res.status(404).json({ error: 'introuvable' });
      var status = req.body && req.body.status ? String(req.body.status).slice(0, 40) : null;
      var notes = req.body && req.body.notes != null ? String(req.body.notes).slice(0, 4000) : null;
      await db.run('UPDATE broker_leads SET status=COALESCE($1,status), notes=COALESCE($2,notes), updated_at=NOW() WHERE id=$3', [status, notes, req.params.id]);
      res.json({ success: true });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });


  // ── PayPal subscription ($599/yr + GST + QST). Credentials come from the
  //    tenant's api_variables (services.externalVars) — never hardcoded.
  //    PAYPAL_MODE: 'live' | 'sandbox' (defaults to sandbox, fail-safe).
  function paypalCfg(){
    var v = services.externalVars || {};
    var mode = (v.PAYPAL_MODE || 'sandbox').toLowerCase();
    return {
      mode: mode,
      base: mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com',
      clientId: v.PAYPAL_CLIENT_ID || '',
      secret: v.PAYPAL_SECRET || v.PAYPAL_CLIENT_SECRET || '',
      planId: v.PAYPAL_PLAN_ID || '',
      webhookId: v.PAYPAL_WEBHOOK_ID || ''
    };
  }
  function paypalReady(c){ return !!(c.clientId && c.secret && c.planId); }

  async function paypalToken(c){
    var r = await services.fetch(c.base + '/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(c.clientId + ':' + c.secret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    if (!r.ok) throw new Error('paypal auth ' + r.status);
    var j = await r.json();
    return j.access_token;
  }

  router.post('/api/espace/abonnement', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    var c = paypalCfg();
    if (!paypalReady(c)) return res.status(503).json({ error: 'paypal_absent', code: 'NOT_CONFIGURED' });
    try{
      var token = await paypalToken(c);
      var r = await services.fetch(c.base + '/v1/billing/subscriptions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'PayPal-Request-Id': 'vv-' + broker.id + '-' + Date.now() },
        body: JSON.stringify({
          plan_id: c.planId,
          custom_id: String(broker.id),
          subscriber: {
            name: { given_name: (broker.full_name || '').split(' ')[0] || 'Courtier', surname: (broker.full_name || '').split(' ').slice(1).join(' ') || '.' },
            email_address: broker.email
          },
          application_context: {
            brand_name: 'VendVite',
            locale: (req.lang === 'en' ? 'en-CA' : 'fr-CA'),
            user_action: 'SUBSCRIBE_NOW',
            return_url: absoluteUrl(req, '/espace/abonnement/retour'),
            cancel_url: absoluteUrl(req, '/espace')
          }
        })
      });
      var j = await r.json();
      if (!r.ok) { console.error('paypal sub', j); return res.status(502).json({ error: 'paypal' }); }
      var approve = (j.links || []).filter(function(l){ return l.rel === 'approve'; })[0];
      await db.run('UPDATE brokers SET paypal_subscription_id=$1, updated_at=NOW() WHERE id=$2', [j.id, broker.id]);
      await logBrokerEvent(broker.id, 'subscription_created', j.id);
      res.json({ success: true, approveUrl: approve ? approve.href : null });
    }catch(e){ console.error('abonnement', e); res.status(500).json({ error: 'server' }); }
  });

  async function activateBroker(broker, subscriptionId, detail){
    var until = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
    await db.run(
      'UPDATE brokers SET status=$1, membership_started_at=COALESCE(membership_started_at,NOW()), membership_expires_at=$2, paypal_subscription_id=COALESCE($3,paypal_subscription_id), updated_at=NOW() WHERE id=$4',
      ['active', until, subscriptionId || null, broker.id]
    );
    await logBrokerEvent(broker.id, 'membership_activated', detail || '');
  }

  router.get('/espace/abonnement/retour', async function(req, res){
    var broker = await requireBroker(req, res);
    if (!broker) return;
    var c = paypalCfg();
    var subId = req.query.subscription_id || broker.paypal_subscription_id;
    try{
      if (paypalReady(c) && subId) {
        var token = await paypalToken(c);
        var r = await services.fetch(c.base + '/v1/billing/subscriptions/' + encodeURIComponent(subId), {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        var j = await r.json();
        if (r.ok && (j.status === 'ACTIVE' || j.status === 'APPROVED')) {
          await activateBroker(broker, subId, 'return:' + j.status);
        }
      }
    }catch(e){ console.error('retour', e); }
    res.redirect('../../espace');
  });

  router.post('/api/espace/abonnement/annuler', async function(req, res){
    var broker = await requireBrokerApi(req, res);
    if (!broker) return;
    var c = paypalCfg();
    try{
      if (paypalReady(c) && broker.paypal_subscription_id) {
        var token = await paypalToken(c);
        await services.fetch(c.base + '/v1/billing/subscriptions/' + encodeURIComponent(broker.paypal_subscription_id) + '/cancel', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Annulation par le courtier' })
        });
      }
      // Access runs to the end of the paid term — only the renewal stops.
      await db.run("UPDATE brokers SET status='cancelled', updated_at=NOW() WHERE id=$1", [broker.id]);
      await logBrokerEvent(broker.id, 'membership_cancelled', '');
      res.json({ success: true });
    }catch(e){ console.error('annuler', e); res.status(500).json({ error: 'server' }); }
  });

  // PayPal webhook. The event itself is UNTRUSTED — anyone can POST here, and
  // a forged BILLING.SUBSCRIPTION.ACTIVATED would otherwise hand out a $599
  // membership for free. So the event is only ever a NUDGE: we re-fetch the
  // subscription from PayPal and act solely on the status PayPal reports.
  router.post('/api/paypal/webhook', async function(req, res){
    try{
      var ev = req.body || {};
      var resource = ev.resource || {};
      var subId = resource.id || resource.billing_agreement_id || '';
      var brokerId = resource.custom_id || (resource.subscriber && resource.subscriber.custom_id) || null;
      var broker = null;
      if (brokerId) broker = await db.get('SELECT * FROM brokers WHERE id=$1', [brokerId]);
      if (!broker && subId) broker = await db.get('SELECT * FROM brokers WHERE paypal_subscription_id=$1', [subId]);
      if (!broker) return res.json({ received: true });

      var c = paypalCfg();
      var lookupId = subId || broker.paypal_subscription_id;
      if (!paypalReady(c) || !lookupId) return res.json({ received: true });

      var token = await paypalToken(c);
      var r = await services.fetch(c.base + '/v1/billing/subscriptions/' + encodeURIComponent(lookupId), {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!r.ok) return res.json({ received: true });
      var sub = await r.json();

      // Only PayPal's own answer moves money-bearing state.
      if (sub.status === 'ACTIVE') {
        await activateBroker(broker, lookupId, 'verified:' + (ev.event_type || 'webhook'));
      } else if (['CANCELLED', 'EXPIRED', 'SUSPENDED'].indexOf(sub.status) !== -1) {
        await db.run("UPDATE brokers SET status='expired', published=0, updated_at=NOW() WHERE id=$1", [broker.id]);
        await logBrokerEvent(broker.id, 'membership_stopped', 'verified:' + sub.status);
      }
      res.json({ received: true });
    }catch(e){ console.error('paypal webhook', e); res.json({ received: true }); }
  });

  // ── Public broker page. Renders the lead funnel under the broker's identity.
  async function renderBrokerPage(req, res, broker, isPreview){
    var L = await baseLocals(req);
    var prof = brokerProfile(broker);
    var settings = Object.assign({}, L.settings, {
      agent_name: prof.agent_name || broker.full_name,
      agent_phone: prof.agent_phone || broker.phone,
      agent_email: prof.agent_email || broker.email,
      agent_title: prof.agent_title || broker.agency,
      agency: prof.agency || broker.agency,
      _p_agent_image_url: prof.agent_photo_url || L.settings._p_agent_image_url || ''
    });
    var t = Object.assign({}, L.t);
    if (prof.hero_title) t.hero_title = prof.hero_title;
    if (prof.hero_sub) t.hero_sub = prof.hero_sub;
    if (prof.hero_note) t.hero_note = prof.hero_note;
    ['stat_homes','stat_days','stat_ratio','stat_volume'].forEach(function(k){
      if (prof[k]) settings[k] = prof[k];
    });
    var testimonials = Array.isArray(prof.testimonials) && prof.testimonials.length
      ? prof.testimonials.map(function(x, i){ return Object.assign({ id: 'p' + i, published: 1, sort_order: i }, x); })
      : await db.all('SELECT * FROM testimonials WHERE published=1 ORDER BY sort_order ASC, created_at DESC');
    var posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
    res.render('broker-page', Object.assign(L, {
      t: t,
      settings: settings,
      testimonials: testimonials || [],
      posts: posts || [],
      isHome: true,
      brokerSlug: broker.slug,
      brokerLinks: Array.isArray(prof.links) ? prof.links : [],
      isPreview: !!isPreview,
      canonical: absoluteUrl(req, '/' + broker.slug)
    }));
  }

  // ── Lead capture from a broker page → broker_leads + instant email
  router.post('/api/courtier/:slug/piste', async function(req, res){
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE slug=$1', [req.params.slug]);
      if (!broker) return res.status(404).json({ error: 'introuvable' });
      if (!brokerPageLive(broker)) return res.status(403).json({ error: 'inactif' });
      var b = req.body || {};
      var name = String(b.name || '').trim().slice(0, 120);
      var address = String(b.address || '').trim().slice(0, 300);
      if (!name || !address) return res.status(400).json({ error: (T[req.lang || 'fr'] || T.fr).err_required });
      var lat = b.lat ? Number(b.lat) : null;
      var lng = b.lng ? Number(b.lng) : null;
      var row = await db.get(
        'INSERT INTO broker_leads (broker_id,name,email,phone,address,lat,lng,timeframe,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        [broker.id, name, String(b.email || '').trim().slice(0, 190), String(b.phone || '').trim().slice(0, 40), address,
         isFinite(lat) ? lat : null, isFinite(lng) ? lng : null, String(b.timeframe || '').trim().slice(0, 80), 'nouveau']
      );
      notifyBrokerOfLead(req, broker, row).catch(function(e){ console.error('lead mail', e); });
      res.json({ success: true });
    }catch(e){ console.error('piste', e); res.status(500).json({ error: 'server' }); }
  });

  async function notifyBrokerOfLead(req, broker, lead){
    var fr = true;
    var esc = escapeHtml;
    var rows = [
      ['Nom', lead.name], ['Adresse', lead.address], ['Courriel', lead.email],
      ['Téléphone', lead.phone ? formatPhone(lead.phone) : ''], ['Échéancier', lead.timeframe]
    ].filter(function(r){ return r[1]; });
    var html = ''
      + '<div style="background:#0D0A0B;padding:30px 20px;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif">'
      + '<div style="max-width:520px;margin:0 auto;background:linear-gradient(165deg,#171213,#0f0b0c);border:1px solid rgba(245,239,230,.12);border-radius:10px;padding:28px;color:#F5EFE6">'
      + '<div style="font-family:IBM Plex Mono,monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#C79A5B;margin-bottom:14px">Nouvelle piste</div>'
      + '<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 18px">' + esc(lead.name) + '</h1>'
      + '<table style="width:100%;border-collapse:collapse;font-size:14px">'
      + rows.map(function(r){
          return '<tr><td style="padding:7px 0;color:rgba(245,239,230,.42);width:38%">' + esc(r[0]) + '</td>'
            + '<td style="padding:7px 0;color:#F5EFE6">' + esc(r[1]) + '</td></tr>';
        }).join('')
      + '</table>'
      + '<a href="' + absoluteUrl(req, '/espace') + '" style="display:block;text-align:center;margin-top:22px;padding:14px;border-radius:4px;background:#E30B2D;color:#fff;text-decoration:none;font-family:Georgia,serif;font-weight:bold">Ouvrir mon espace</a>'
      + '</div></div>';
    return await services.email.send({
      to: broker.email,
      subject: 'Nouvelle piste — ' + lead.name,
      html: html,
      text: 'Nouvelle piste: ' + lead.name + ' — ' + lead.address
    });
  }


  // ── Operator: roster + manual activation. Needed because a broker cannot
  //    self-activate until a PayPal plan exists, and for comped accounts.
  router.get('/api/admin/courtiers', async function(req, res){
    if(!apiAdmin(req,res)) return;
    try{
      var rows = await db.all(
        'SELECT b.*, (SELECT COUNT(*)::int FROM broker_leads l WHERE l.broker_id=b.id) AS lead_count'
        + ' FROM brokers b ORDER BY b.created_at DESC'
      );
      res.json({ courtiers: rows || [] });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });

  router.post('/api/admin/courtiers/:id/activer', async function(req, res){
    if(!apiAdmin(req,res)) return;
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE id=$1', [req.params.id]);
      if (!broker) return res.status(404).json({ error: 'introuvable' });
      var months = Number(req.body && req.body.months) || 12;
      var until = new Date(Date.now() + months * 30.44 * 24 * 3600 * 1000).toISOString();
      await db.run(
        "UPDATE brokers SET status='active', membership_started_at=COALESCE(membership_started_at,NOW()), membership_expires_at=$1, updated_at=NOW() WHERE id=$2",
        [until, broker.id]
      );
      await logBrokerEvent(broker.id, 'membership_activated', 'operator/' + months + 'm');
      res.json({ success: true, expires: until });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });

  router.post('/api/admin/courtiers/:id/relancer', async function(req, res){
    if(!apiAdmin(req,res)) return;
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE id=$1', [req.params.id]);
      if (!broker) return res.status(404).json({ error: 'introuvable' });
      var raw = await mintBrokerToken(broker.id, 'access');
      await sendInviteEmail(req, broker, raw, req.lang || 'fr');
      await logBrokerEvent(broker.id, 'invite_resent', 'operator');
      res.json({ success: true });
    }catch(e){ res.status(500).json({ error: 'server' }); }
  });

  // ── GET /:slug — a broker's public page. Must remain the LAST route before
  //    the catch-all: it matches any single path segment, so every reserved
  //    platform/app path has to be refused explicitly.
  router.get('/:slug', async function(req, res, next){
    var slug = String(req.params.slug || '');
    if (!slug || RESERVED_SLUGS.indexOf(slug.toLowerCase()) !== -1) return next();
    if (slug.indexOf('.') !== -1) return next();
    if (!/^[a-z0-9-]+$/.test(slug)) return next();
    try{
      var broker = await db.get('SELECT * FROM brokers WHERE slug=$1', [slug]);
      if (!broker) return next();
      // Unpaid or unpublished pages do not exist publicly — the broker reaches
      // their own draft through /espace/apercu instead.
      if (!brokerPageLive(broker)) {
        var me = await currentBroker(req);
        if (!me || me.id !== broker.id) return next();
      }
      await renderBrokerPage(req, res, broker, false);
    }catch(e){ console.error('broker page', e); next(); }
  });


  router.use(function(req,res){
    if(req.method==='GET'){
      if(req.path.indexOf('/api')===0) return res.status(404).json({ error:'not found' });
      if(req.path.indexOf('/admin')===0) return res.status(404).send('Introuvable');
      return res.redirect('.');
    }
    res.status(404).json({ error:'not found' });
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
