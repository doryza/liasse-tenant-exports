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
      back_home:"Retour à l'accueil"
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
      back_home:"Back to home"
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
