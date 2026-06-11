module.exports = function(services) {
  const router = require('express').Router();
  const SLOTS = ['08:00','10:00','13:00','15:00','17:00'];
  const CATS = [{key:'garage',hex:'#8a8f98'},{key:'residentiel',hex:'#e9e7e0'},{key:'commercial',hex:'#3a3d44'},{key:'metallique',hex:'#4549c0'}];
  const T = {
    fr: {
      meta_desc:'Planchers d’époxy résidentiels et commerciaux — soumission gratuite, réalisations et prise de rendez-vous en ligne.',
      nav_home:'Accueil',nav_gallery:'Réalisations',nav_services:'Services',nav_quote:'Soumission gratuite',nav_booking:'Rendez-vous',call:'Appeler',
      hero_kicker:'Planchers d’époxy — Résidentiel & commercial',hero_title:'Un plancher coulé comme un miroir',
      hero_sub:'Garage, sous-sol, commerce ou entrepôt : nous transformons votre béton en une surface d’époxy durable, étanche et éclatante. Préparation diamantée, produits de qualité industrielle, garantie écrite.',
      hero_cta_quote:'Demander une soumission gratuite',hero_cta_gallery:'Voir nos réalisations',hero_badge:'Fini métallique — garage résidentiel',
      trust1:'Soumission gratuite en 24 h',trust2:'Garantie écrite de 5 ans',trust3:'Applicateurs certifiés',
      finishes_title:'Choisissez votre fini',finishes_sub:'Chaque chantier commence par un échantillon. Touchez une pastille pour voir les projets réalisés avec ce fini.',
      cat_garage:'Garage',cat_residentiel:'Résidentiel',cat_commercial:'Commercial',cat_metallique:'Métallique',
      featured_title:'Réalisations récentes',featured_sub:'Des planchers réels, posés chez de vrais clients.',view_all:'Toutes les réalisations',
      empty_projects:'Les premières réalisations seront publiées sous peu. Revenez bientôt !',
      services_title:'Nos services',services_sub:'Des systèmes d’époxy adaptés à chaque surface et à chaque usage.',from_price:'À partir de',
      empty_services:'La liste des services sera publiée sous peu. Contactez-nous pour en savoir plus.',ask_quote:'Obtenir un prix',
      process_title:'Notre méthode, en 4 étapes',
      p1t:'Évaluation sur place',p1d:'On mesure, on inspecte le béton et on vous recommande le bon système pour votre usage.',
      p2t:'Préparation du béton',p2d:'Meulage diamanté, réparation des fissures et dépoussiérage complet — la clé d’une adhérence parfaite.',
      p3t:'Coulée de l’époxy',p3d:'Application de la base, des flocons ou des pigments métalliques, puis du scellant de finition.',
      p4t:'Cure et livraison',p4d:'Après 24 à 72 heures de cure, vous marchez sur un plancher neuf, garanti par écrit.',
      s1n:'10 ans',s1l:'d’expérience terrain',s2n:'500+',s2l:'planchers livrés',s3n:'24 h',s3l:'délai de réponse',s4n:'5 ans',s4l:'de garantie écrite',
      testi_title:'Ce que disent nos clients',empty_testi:'Soyez notre prochain client satisfait — demandez votre soumission dès aujourd’hui.',
      about_title:'Une équipe d’applicateurs passionnés',
      about_text:'Derrière chaque plancher, il y a une équipe qui prépare, coule et scelle avec le même soin que si c’était chez elle. Nous travaillons avec des résines de qualité industrielle et nous restons joignables après la pose.',
      cta_title:'Prêt à transformer votre plancher ?',cta_sub:'Soumission gratuite, sans engagement. Réponse en moins de 24 heures ouvrables.',
      cta_quote:'Demander une soumission',cta_book:'Prendre rendez-vous',
      gallery_title:'Nos réalisations',gallery_sub:'Filtrez par fini pour voir des projets comme le vôtre.',filter_all:'Tous les projets',
      quote_title:'Demande de soumission',quote_sub:'Décrivez votre projet — on vous rappelle avec un prix clair, sans surprise.',
      f_name:'Nom complet',f_email:'Courriel',f_phone:'Téléphone',f_type:'Type de projet',f_surface:'Surface approximative (pi²)',f_message:'Décrivez votre projet',f_service:'Service souhaité',f_date:'Date souhaitée',f_time:'Plage horaire',
      opt_select:'Sélectionnez…',type_garage:'Garage',type_basement:'Sous-sol',type_commercial:'Commercial / industriel',type_metallic:'Époxy métallique',type_other:'Autre',
      btn_send:'Envoyer ma demande',btn_book:'Confirmer le rendez-vous',
      q_success_t:'Demande reçue !',q_success_m:'Merci ! Nous vous contacterons dans les 24 heures ouvrables pour discuter de votre projet.',
      b_success_t:'Rendez-vous demandé !',b_success_m:'Votre demande a bien été envoyée. Nous confirmerons l’heure exacte par téléphone ou par courriel.',b_when:'Date et heure choisies :',
      err_required:'Veuillez remplir tous les champs requis.',err_slot:'Cette plage horaire vient d’être réservée. Choisissez-en une autre.',err_generic:'Une erreur est survenue. Réessayez ou appelez-nous directement.',slot_taken:'(complet)',
      next_title:'Et ensuite ?',n1:'On vous rappelle en moins de 24 h ouvrables.',n2:'Évaluation gratuite sur place (environ 45 minutes).',n3:'Soumission détaillée, prix ferme et date de pose.',
      direct_title:'Vous préférez parler à quelqu’un ?',
      booking_title:'Prendre rendez-vous',booking_sub:'Choisissez la date et l’heure qui vous conviennent pour une évaluation gratuite à domicile.',booking_note:'Évaluation gratuite d’environ 45 minutes, directement à votre adresse.',back_home:'Retour à l’accueil',
      footer_about:'Spécialistes du revêtement d’époxy résidentiel et commercial. Préparation diamantée, produits de qualité industrielle et finition garantie.',
      footer_nav:'Navigation',footer_contact:'Contact',footer_hours:'Heures d’ouverture',notif_btn:'Activer les notifications',rights:'Tous droits réservés.',
      push_title:'Restez informé',push_desc:'Recevez nos promotions et nouvelles réalisations.'
    },
    en: {
      meta_desc:'Residential and commercial epoxy floors — free quote, project gallery and online booking.',
      nav_home:'Home',nav_gallery:'Our Work',nav_services:'Services',nav_quote:'Free Quote',nav_booking:'Book a Visit',call:'Call',
      hero_kicker:'Epoxy floors — Residential & commercial',hero_title:'A floor poured like a mirror',
      hero_sub:'Garage, basement, shop or warehouse: we turn your concrete into a durable, waterproof, mirror-gloss epoxy surface. Diamond grinding, industrial-grade products, written warranty.',
      hero_cta_quote:'Request a free quote',hero_cta_gallery:'See our work',hero_badge:'Metallic finish — residential garage',
      trust1:'Free quote within 24 h',trust2:'5-year written warranty',trust3:'Certified installers',
      finishes_title:'Pick your finish',finishes_sub:'Every job starts with a sample. Tap a chip to see projects done with that finish.',
      cat_garage:'Garage',cat_residentiel:'Residential',cat_commercial:'Commercial',cat_metallique:'Metallic',
      featured_title:'Recent projects',featured_sub:'Real floors, installed for real clients.',view_all:'All projects',
      empty_projects:'Our first projects will be published soon. Check back shortly!',
      services_title:'Our services',services_sub:'Epoxy systems tailored to every surface and every use.',from_price:'From',
      empty_services:'Our service list is coming soon. Contact us to learn more.',ask_quote:'Get a price',
      process_title:'Our method, in 4 steps',
      p1t:'On-site assessment',p1d:'We measure, inspect the concrete and recommend the right system for your use.',
      p2t:'Concrete preparation',p2d:'Diamond grinding, crack repair and full dust removal — the key to perfect adhesion.',
      p3t:'Epoxy pour',p3d:'Base coat, flakes or metallic pigments, then the protective top coat.',
      p4t:'Cure and delivery',p4d:'After 24 to 72 hours of curing, you walk on a brand-new floor, backed in writing.',
      s1n:'10 yrs',s1l:'of field experience',s2n:'500+',s2l:'floors delivered',s3n:'24 h',s3l:'response time',s4n:'5 yrs',s4l:'written warranty',
      testi_title:'What our clients say',empty_testi:'Be our next happy client — request your free quote today.',
      about_title:'A team of passionate installers',
      about_text:'Behind every floor is a crew that grinds, pours and seals with the same care as if it were their own home. We work with industrial-grade resins and stay reachable after the job.',
      cta_title:'Ready to transform your floor?',cta_sub:'Free quote, no obligation. Answer within one business day.',
      cta_quote:'Request a quote',cta_book:'Book a visit',
      gallery_title:'Our work',gallery_sub:'Filter by finish to see projects like yours.',filter_all:'All projects',
      quote_title:'Request a quote',quote_sub:'Describe your project — we call you back with a clear, no-surprise price.',
      f_name:'Full name',f_email:'Email',f_phone:'Phone',f_type:'Project type',f_surface:'Approximate area (sq ft)',f_message:'Describe your project',f_service:'Service needed',f_date:'Preferred date',f_time:'Time slot',
      opt_select:'Select…',type_garage:'Garage',type_basement:'Basement',type_commercial:'Commercial / industrial',type_metallic:'Metallic epoxy',type_other:'Other',
      btn_send:'Send my request',btn_book:'Confirm appointment',
      q_success_t:'Request received!',q_success_m:'Thank you! We will contact you within one business day to discuss your project.',
      b_success_t:'Appointment requested!',b_success_m:'Your request has been sent. We will confirm the exact time by phone or email.',b_when:'Selected date and time:',
      err_required:'Please fill in all required fields.',err_slot:'This time slot was just booked. Please pick another one.',err_generic:'Something went wrong. Try again or call us directly.',slot_taken:'(full)',
      next_title:'What happens next?',n1:'We call you back within one business day.',n2:'Free on-site assessment (about 45 minutes).',n3:'Detailed quote, firm price and installation date.',
      direct_title:'Prefer to talk to someone?',
      booking_title:'Book a visit',booking_sub:'Pick the date and time that suit you for a free in-home assessment.',booking_note:'Free assessment of about 45 minutes, right at your address.',back_home:'Back to home',
      footer_about:'Residential and commercial epoxy coating specialists. Diamond preparation, industrial-grade products and a guaranteed finish.',
      footer_nav:'Navigation',footer_contact:'Contact',footer_hours:'Opening hours',notif_btn:'Enable notifications',rights:'All rights reserved.',
      push_title:'Stay in the loop',push_desc:'Get our promotions and latest projects.'
    }
  };
  const MODULES = {
    quote_requests: { table:'quote_requests', label:'Soumissions', icon:'list', fields:[
      {name:'name',type:'text',label:'Nom',required:true,maxLength:120,description:'Nom du client qui a fait la demande',placeholder:'p. ex. Marc Tremblay'},
      {name:'phone',type:'text',label:'Téléphone',description:'Numéro pour rappeler le client',placeholder:'p. ex. 514 555-0192'},
      {name:'email',type:'email',label:'Courriel',description:'Adresse courriel du client',placeholder:'p. ex. client@exemple.com'},
      {name:'project_type',type:'text',label:'Type de projet',description:'Surface demandée (garage, sous-sol, commercial…)',placeholder:'p. ex. Garage'},
      {name:'surface',type:'text',label:'Surface',description:'Surface approximative indiquée par le client',placeholder:'p. ex. 550 pi²'},
      {name:'status',type:'select',label:'Statut',options:['nouveau','contacte','soumission_envoyee','gagne','perdu'],default:'nouveau',description:'Suivi de la demande — « nouveau » = pas encore traité'},
      {name:'message',type:'textarea',label:'Message',description:'Description du projet fournie par le client',placeholder:'Détails du projet…'}
    ]},
    appointments: { table:'appointments', label:'Rendez-vous', icon:'calendar', fields:[
      {name:'name',type:'text',label:'Nom',required:true,description:'Nom du client',placeholder:'p. ex. Julie Bélanger'},
      {name:'phone',type:'text',label:'Téléphone',description:'Numéro pour confirmer le rendez-vous',placeholder:'p. ex. 450 555-0144'},
      {name:'date',type:'date',label:'Date',description:'Date du rendez-vous (évaluation sur place)'},
      {name:'time_slot',type:'select',label:'Heure',options:SLOTS,description:'Plage horaire réservée'},
      {name:'status',type:'select',label:'Statut',options:['en_attente','confirme','complete','annule'],default:'en_attente',description:'« annule » libère la plage horaire pour d’autres clients'},
      {name:'email',type:'email',label:'Courriel',description:'Adresse courriel du client',placeholder:'p. ex. client@exemple.com'},
      {name:'service_type',type:'text',label:'Service',description:'Service demandé par le client',placeholder:'p. ex. Époxy de garage à flocons'},
      {name:'message',type:'textarea',label:'Notes',description:'Détails fournis par le client ou vos notes internes',placeholder:'Notes…'}
    ]},
    projects: { table:'projects', label:'Réalisations', icon:'image', fields:[
      {name:'title',type:'text',label:'Titre',required:true,maxLength:150,description:'Nom du projet affiché dans la galerie',placeholder:'p. ex. Garage double — flocons granit'},
      {name:'image_url',type:'image',label:'Photo',description:'Photo du plancher terminé. Recommandé : 1200×900 px (format 4:3)'},
      {name:'category',type:'select',label:'Catégorie',options:['garage','residentiel','commercial','metallique'],default:'garage',description:'Catégorie utilisée par le filtre de la galerie'},
      {name:'color_name',type:'text',label:'Nom de la couleur',description:'Nom du fini affiché sur la fiche du projet',placeholder:'p. ex. Granit poivre et sel'},
      {name:'color_hex',type:'color',label:'Pastille de couleur',default:'#6366f1',description:'Couleur de la pastille d’échantillon affichée sur la carte'},
      {name:'location',type:'text',label:'Ville',description:'Ville où le projet a été réalisé',placeholder:'p. ex. Laval'},
      {name:'surface',type:'text',label:'Surface',description:'Surface du projet, telle qu’affichée',placeholder:'p. ex. 550 pi²'},
      {name:'featured',type:'boolean',label:'En vedette',default:1,description:'Coché = affiché sur la page d’accueil'},
      {name:'description',type:'textarea',label:'Description',description:'Courte description du projet (2-3 phrases)',placeholder:'Meulage diamanté, système 3 couches…'}
    ]},
    services: { table:'services', label:'Services', icon:'package', fields:[
      {name:'name',type:'text',label:'Nom du service',required:true,maxLength:150,description:'Nom affiché sur la page Services',placeholder:'p. ex. Époxy de garage à flocons'},
      {name:'price_from',type:'text',label:'Prix affiché',description:'Texte libre, p. ex. « À partir de 5 $/pi² » ou « Sur évaluation »',placeholder:'p. ex. À partir de 5 $/pi²'},
      {name:'image_url',type:'image',label:'Photo',description:'Photo illustrant le service. Recommandé : 1200×900 px'},
      {name:'featured',type:'boolean',label:'En vedette',default:0,description:'Coché = affiché en premier et sur la page d’accueil'},
      {name:'description',type:'textarea',label:'Description',description:'Description complète affichée sur la page Services',placeholder:'Décrivez le service…'}
    ]},
    testimonials: { table:'testimonials', label:'Témoignages', icon:'star', fields:[
      {name:'author',type:'text',label:'Auteur',required:true,description:'Nom du client (initiale du nom de famille suggérée)',placeholder:'p. ex. Marie-Claude G.'},
      {name:'location',type:'text',label:'Ville',description:'Ville du client',placeholder:'p. ex. Laval'},
      {name:'rating',type:'number',label:'Note',min:1,max:5,step:1,default:5,description:'Nombre d’étoiles, de 1 à 5'},
      {name:'image_url',type:'image',label:'Photo (optionnelle)',description:'Photo du client ou du projet. Recommandé : carré 400×400 px'},
      {name:'content',type:'textarea',label:'Témoignage',description:'Le témoignage tel qu’affiché sur le site',placeholder:'Notre garage est devenu…'}
    ]},
    posts: { table:'posts', label:'Articles', icon:'edit', fields:[
      {name:'title',type:'text',label:'Titre',required:true,maxLength:200,description:'Titre de l’article ou du conseil',placeholder:'p. ex. Combien de temps dure un plancher d’époxy ?'},
      {name:'image_url',type:'image',label:'Image',description:'Image d’en-tête. Recommandé : 1200×630 px'},
      {name:'category',type:'text',label:'Catégorie',maxLength:50,description:'Regroupe les articles (p. ex. Conseils, Guides)',placeholder:'p. ex. Conseils'},
      {name:'published',type:'boolean',label:'Publié',default:1,description:'Décoché = brouillon'},
      {name:'content',type:'textarea',label:'Contenu',description:'Texte complet de l’article. Paragraphes courts recommandés',placeholder:'Rédigez votre article…'}
    ]}
  };
  const SETTINGS_FIELDS = [
    {name:'business_name',type:'text',label:'Nom de l’entreprise',description:'Affiché dans l’en-tête, le pied de page et l’onglet du navigateur'},
    {name:'contact_phone',type:'text',label:'Téléphone affiché',description:'Utilisé pour le bouton d’appel direct, le bouton flottant et le pied de page'},
    {name:'contact_email',type:'email',label:'Courriel affiché',description:'Affiché sur le site (les courriels de notification utilisent le courriel de contact du compte)'},
    {name:'business_address',type:'text',label:'Adresse',description:'Affichée dans le pied de page'},
    {name:'business_hours',type:'text',label:'Heures d’ouverture',description:'Affichées dans le pied de page et la page Rendez-vous'}
  ];
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':'&quot;'; }); }
  function requireAdmin(req,res,next){ if(!services.admin.isAdmin(req)) return res.status(403).json({error:'Accès refusé'}); next(); }
  async function getSettings(){ try{ const rows=await services.db.all('SELECT key, value FROM admin_settings'); const s={}; rows.forEach(function(r){ s[r.key]=r.value; }); return s; }catch(e){ return {}; } }
  function applyTextOverrides(t,settings,lang){ for(var k in settings){ if(k.indexOf('text_')===0&&k.slice(-(lang.length+1))==='_'+lang){ var tk=k.slice(5,-(lang.length+1)); if(tk)t[tk]=settings[k]; } } return t; }
  async function base(req){ const settings=await getSettings(); const t=applyTextOverrides(Object.assign({},T[req.lang]||T.fr),settings,req.lang); return { lang:req.lang, t, settings, cats:CATS, pagePath:(req.path==='/'?'.':req.path.replace(/^\//,'')) }; }

  router.use(function(req,res,next){ var lang=req.query.lang||(req.cookies&&req.cookies.pwa_lang)||'fr'; if(lang!=='fr'&&lang!=='en')lang='fr'; if(req.query.lang&&typeof res.cookie==='function'){ try{ res.cookie('pwa_lang',lang,{maxAge:31536000000}); }catch(e){} } req.lang=lang; next(); });
  router.use(async function(req,res,next){ if(req.method==='GET'&&req.path.indexOf('/api')!==0&&req.path.indexOf('/admin')!==0&&req.path.indexOf('.')===-1){ try{ await services.db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); }catch(e){} } next(); });

  router.get('/', async function(req,res){ try{
    const d=await base(req);
    let projects=[]; try{ projects=await services.db.all('SELECT * FROM projects WHERE featured=1 ORDER BY created_at DESC LIMIT 6'); if(!projects.length) projects=await services.db.all('SELECT * FROM projects ORDER BY created_at DESC LIMIT 6'); }catch(e){}
    let svcItems=[]; try{ svcItems=await services.db.all('SELECT * FROM services ORDER BY featured DESC, id ASC LIMIT 3'); }catch(e){}
    let testimonials=[]; try{ testimonials=await services.db.all('SELECT * FROM testimonials ORDER BY created_at DESC LIMIT 3'); }catch(e){}
    res.render('index', Object.assign(d,{active:'home',pageTitle:'',projects,svcItems,testimonials}));
  }catch(err){ res.status(500).send('Erreur serveur'); } });

  router.get('/realisations', async function(req,res){ try{
    const d=await base(req);
    var keys=CATS.map(function(c){return c.key;});
    var cat=keys.indexOf(req.query.cat)>=0?req.query.cat:'';
    let projects=[]; try{ projects=cat?await services.db.all('SELECT * FROM projects WHERE category=$1 ORDER BY created_at DESC',[cat]):await services.db.all('SELECT * FROM projects ORDER BY created_at DESC'); }catch(e){}
    res.render('realisations', Object.assign(d,{active:'gallery',pageTitle:d.t.gallery_title,projects,cat}));
  }catch(err){ res.status(500).send('Erreur serveur'); } });

  router.get('/services', async function(req,res){ try{
    const d=await base(req);
    let svcItems=[]; try{ svcItems=await services.db.all('SELECT * FROM services ORDER BY featured DESC, id ASC'); }catch(e){}
    res.render('services', Object.assign(d,{active:'services',pageTitle:d.t.services_title,svcItems}));
  }catch(err){ res.status(500).send('Erreur serveur'); } });

  router.get('/soumission', async function(req,res){ try{
    const d=await base(req);
    res.render('soumission', Object.assign(d,{active:'quote',pageTitle:d.t.quote_title}));
  }catch(err){ res.status(500).send('Erreur serveur'); } });

  router.get('/rendez-vous', async function(req,res){ try{
    const d=await base(req);
    let svcItems=[]; try{ svcItems=await services.db.all('SELECT name FROM services ORDER BY featured DESC, id ASC'); }catch(e){}
    res.render('rendezvous', Object.assign(d,{active:'booking',pageTitle:d.t.booking_title,svcItems,slots:SLOTS}));
  }catch(err){ res.status(500).send('Erreur serveur'); } });

  router.post('/api/soumission', async function(req,res){ try{
    var b=req.body||{};
    if(!b.name||!b.phone) return res.status(400).json({error:'missing'});
    await services.db.run('INSERT INTO quote_requests (name, email, phone, project_type, surface, message) VALUES ($1,$2,$3,$4,$5,$6)',[b.name,b.email||'',b.phone,b.project_type||'',b.surface||'',b.message||'']);
    try{ if(services.config.contactEmail){ await services.email.send({to:services.config.contactEmail,subject:'Nouvelle demande de soumission — '+b.name,html:'<h2>Nouvelle demande de soumission</h2><p><b>Nom :</b> '+esc(b.name)+'</p><p><b>Téléphone :</b> '+esc(b.phone)+'</p><p><b>Courriel :</b> '+esc(b.email||'')+'</p><p><b>Type :</b> '+esc(b.project_type||'')+'</p><p><b>Surface :</b> '+esc(b.surface||'')+'</p><p><b>Message :</b> '+esc(b.message||'')+'</p>'}); } }catch(e){}
    res.json({success:true});
  }catch(err){ res.status(500).json({error:'fail'}); } });

  router.get('/api/rendez-vous/slots', async function(req,res){ try{
    var date=req.query.date||''; if(!date) return res.json({taken:[]});
    var rows=await services.db.all("SELECT time_slot FROM appointments WHERE date=$1 AND status!='annule'",[date]);
    res.json({taken:rows.map(function(r){return r.time_slot;})});
  }catch(e){ res.json({taken:[]}); } });

  router.post('/api/rendez-vous', async function(req,res){ try{
    var b=req.body||{};
    if(!b.name||!b.phone||!b.date||!b.time_slot) return res.status(400).json({error:'missing'});
    if(SLOTS.indexOf(b.time_slot)===-1) return res.status(400).json({error:'slot'});
    var today=new Date(); today.setHours(0,0,0,0);
    if(new Date(b.date+'T12:00:00')<today) return res.status(400).json({error:'date'});
    var exists=await services.db.get("SELECT id FROM appointments WHERE date=$1 AND time_slot=$2 AND status!='annule'",[b.date,b.time_slot]);
    if(exists) return res.status(409).json({error:'slot'});
    await services.db.run('INSERT INTO appointments (name, email, phone, service_type, date, time_slot, message) VALUES ($1,$2,$3,$4,$5,$6,$7)',[b.name,b.email||'',b.phone,b.service_type||'',b.date,b.time_slot,b.message||'']);
    try{ if(services.config.contactEmail){ await services.email.send({to:services.config.contactEmail,subject:'Nouveau rendez-vous — '+b.name+' ('+b.date+' '+b.time_slot+')',html:'<h2>Nouvelle demande de rendez-vous</h2><p><b>Nom :</b> '+esc(b.name)+'</p><p><b>Téléphone :</b> '+esc(b.phone)+'</p><p><b>Courriel :</b> '+esc(b.email||'')+'</p><p><b>Service :</b> '+esc(b.service_type||'')+'</p><p><b>Date :</b> '+esc(b.date)+' à '+esc(b.time_slot)+'</p><p><b>Message :</b> '+esc(b.message||'')+'</p>'}); } }catch(e){}
    res.json({success:true});
  }catch(err){ res.status(500).json({error:'fail'}); } });

  router.get('/admin', async function(req,res){
    if(!services.admin.isAdmin(req)) return res.redirect(req.tenantPath?req.tenantPath('/admin/login'):'admin/login');
    var stats={visits7:0,visitsTotal:0,quotesNew:0,appts:0,projects:0};
    try{
      stats.visits7=((await services.db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"))||{}).c||0;
      stats.visitsTotal=((await services.db.get('SELECT COUNT(*)::int AS c FROM site_visits'))||{}).c||0;
      stats.quotesNew=((await services.db.get("SELECT COUNT(*)::int AS c FROM quote_requests WHERE status='nouveau'"))||{}).c||0;
      stats.appts=((await services.db.get("SELECT COUNT(*)::int AS c FROM appointments WHERE status='en_attente'"))||{}).c||0;
      stats.projects=((await services.db.get('SELECT COUNT(*)::int AS c FROM projects'))||{}).c||0;
    }catch(e){}
    var recentQuotes=[],recentAppts=[];
    try{ recentQuotes=await services.db.all('SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 6'); }catch(e){}
    try{ recentAppts=await services.db.all("SELECT * FROM appointments WHERE status!='annule' ORDER BY date ASC, time_slot ASC LIMIT 6"); }catch(e){}
    res.render('admin',{stats,recentQuotes,recentAppts});
  });

  Object.keys(MODULES).forEach(function(key){
    router.get('/admin/'+key, function(req,res){
      if(!services.admin.isAdmin(req)) return res.redirect(req.tenantPath?req.tenantPath('/admin/login'):'admin/login');
      res.render('admin-'+key,{});
    });
  });

  router.get('/admin/settings', function(req,res){
    if(!services.admin.isAdmin(req)) return res.redirect(req.tenantPath?req.tenantPath('/admin/login'):'admin/login');
    res.render('admin-settings',{settingsFields:SETTINGS_FIELDS});
  });

  router.get('/api/admin/stats', requireAdmin, async function(req,res){
    var out={userCount:0,pushSubscriberCount:0,totalVisits:0,recentVisits:0};
    try{ out.userCount=await services.auth.getUserCount(); }catch(e){}
    try{ out.pushSubscriberCount=await services.push.getSubscriptionCount(); }catch(e){}
    try{ out.totalVisits=((await services.db.get('SELECT COUNT(*)::int AS c FROM site_visits'))||{}).c||0; out.recentVisits=((await services.db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"))||{}).c||0; }catch(e){}
    res.json(out);
  });

  router.get('/api/admin/submissions', requireAdmin, async function(req,res){
    try{ var rows=await services.db.all('SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 100'); res.json({submissions:rows}); }catch(e){ res.status(500).json({error:'Erreur'}); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req,res){
    res.json({ modules: Object.keys(MODULES).map(function(k){ var m=MODULES[k]; return {key:k,label:m.label,icon:m.icon,fields:m.fields}; }), settingsFields: SETTINGS_FIELDS });
  });

  router.get('/api/admin/settings', requireAdmin, async function(req,res){ res.json({settings: await getSettings()}); });

  router.put('/api/admin/settings', requireAdmin, async function(req,res){ try{
    var b=req.body||{};
    if(b.key){ await services.db.run('INSERT INTO admin_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[b.key,b.value==null?'':String(b.value)]); }
    else{ for(var k in b){ await services.db.run('INSERT INTO admin_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k,b[k]==null?'':String(b[k])]); } }
    res.json({success:true});
  }catch(e){ res.status(500).json({error:'Erreur'}); } });

  router.get('/api/admin/:mod', requireAdmin, async function(req,res){
    var m=MODULES[req.params.mod]; if(!m) return res.status(404).json({error:'Module inconnu'});
    try{ var rows=await services.db.all('SELECT * FROM '+m.table+' ORDER BY id DESC'); var out={}; out[req.params.mod]=rows; res.json(out); }catch(e){ res.status(500).json({error:'Erreur base de données'}); }
  });

  router.post('/api/admin/:mod', requireAdmin, async function(req,res){
    var m=MODULES[req.params.mod]; if(!m) return res.status(404).json({error:'Module inconnu'});
    var b=req.body||{};
    var missing=m.fields.filter(function(f){ return f.required&&(b[f.name]==null||b[f.name]===''); });
    if(missing.length) return res.status(400).json({error:'Champs requis : '+missing.map(function(f){return f.label||f.name;}).join(', ')});
    var cols=[],vals=[],ph=[];
    m.fields.forEach(function(f){ var v=b[f.name]; if(v===undefined)v=(f.default!==undefined?f.default:null); cols.push(f.name); vals.push(v); ph.push('$'+vals.length); });
    try{
      var r=await services.db.run('INSERT INTO '+m.table+' ('+cols.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals);
      var row=await services.db.get('SELECT * FROM '+m.table+' WHERE id=$1',[r.lastInsertRowid]);
      res.json({item:row});
    }catch(e){ res.status(500).json({error:'Erreur base de données'}); }
  });

  router.put('/api/admin/:mod/:id', requireAdmin, async function(req,res){
    var m=MODULES[req.params.mod]; if(!m) return res.status(404).json({error:'Module inconnu'});
    var b=req.body||{};
    var sets=[],vals=[];
    m.fields.forEach(function(f){ if(b[f.name]!==undefined){ vals.push(b[f.name]); sets.push(f.name+'=$'+vals.length); } });
    if(!sets.length) return res.status(400).json({error:'Aucun champ à modifier'});
    sets.push('updated_at=NOW()');
    vals.push(req.params.id);
    try{
      await services.db.run('UPDATE '+m.table+' SET '+sets.join(', ')+' WHERE id=$'+vals.length,vals);
      var row=await services.db.get('SELECT * FROM '+m.table+' WHERE id=$1',[req.params.id]);
      if(!row) return res.status(404).json({error:'Élément introuvable'});
      res.json({item:row});
    }catch(e){ res.status(500).json({error:'Erreur base de données'}); }
  });

  router.delete('/api/admin/:mod/:id', requireAdmin, async function(req,res){
    var m=MODULES[req.params.mod]; if(!m) return res.status(404).json({error:'Module inconnu'});
    try{ await services.db.run('DELETE FROM '+m.table+' WHERE id=$1',[req.params.id]); res.json({success:true}); }catch(e){ res.status(500).json({error:'Erreur base de données'}); }
  });

  router.use(function(req,res){ if(req.method==='GET'){ res.redirect('.'); } else { res.status(404).json({error:'Introuvable'}); } });

  
// Auto-injected admin page routes for orphaned views
router.get('/admin/posts', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
  res.render('admin-posts', { items: items });
});
router.get('/admin/projects', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM projects ORDER BY created_at DESC');
  res.render('admin-projects', { items: items });
});
router.get('/admin/services', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM services ORDER BY created_at DESC');
  res.render('admin-services', { items: items });
});
router.get('/admin/appointments', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM appointments ORDER BY created_at DESC');
  res.render('admin-appointments', { items: items });
});
router.get('/admin/testimonials', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
  res.render('admin-testimonials', { items: items });
});
router.get('/admin/quote_requests', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM quote_requests ORDER BY created_at DESC');
  res.render('admin-quote_requests', { items: items });
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
