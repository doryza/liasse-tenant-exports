module.exports = function(services){
const express=require('express');
const router=express.Router();
const db=services.db;

const T={
fr:{
meta_title:'Grillades arabes au feu de bois — Blainville',
meta_desc:'Le seul gril au bois des Laurentides. Filet mignon, shish taouk, poulet, kafta et maaneh grillés sur charbon de bois. Commande pour emporter à Blainville.',
nav_home:'Accueil',nav_menu:'Menu',nav_news:'Actualités',nav_order:'Commander',
hero_eyebrow:'Grillé au bois · Blainville',
hero_title:'Le seul gril au bois des Laurentides',
hero_title_echo:'The only wood-fired grill in the Laurentides',
hero_cta:'Commander pour emporter',
hero_secondary:'Voir le menu',
hero_img_alt:'Brochettes grillées sur le charbon de bois',
sig_label:'La signature',
sig_title:'Grillé au bois. Rien d’autre.',
sig_title_echo:'Wood-grilled. Nothing else.',
sig_wood_title:'Le bois',
sig_wood_text:'Du vrai bois franc, pas de gaz. Chaque service commence par des bûches allumées à la main.',
sig_braise_title:'La braise',
sig_braise_text:'On attend la braise. C’est sa chaleur vive qui saisit la viande et garde le jus à l’intérieur.',
sig_fumee_title:'La fumée',
sig_fumee_text:'La fumée du charbon donne ce goût qu’aucun four ne reproduit. C’est notre unique dans les Laurentides.',
ved_label:'Ce qui sort du gril',
ved_title:'Nos vedettes',
ved_echo:'Straight off the coals',
menu_label:'Menu emporter',
menu_title:'Le menu',
menu_title_echo:'The menu',
menu_empty:'Le menu arrive bientôt. Revenez nous voir.',
ob_label:'Prêt à manger',
ob_title:'Commandez, on grille, vous ramassez.',
ob_title_echo:'Order now, pick up hot.',
ob_cta:'Commander pour emporter',
ob_platform_default:'Commande en ligne',
ob_pickup_default:'Prêt en 20–30 min',
order_img_alt:'Viandes grillées sur le gril au bois',
hours_label:'Nous trouver',
hours_title:'Heures & adresse',
hours_echo:'Hours & address',
hours_open:'Heures d’ouverture',
directions:'Itinéraire',
contact_title:'Une question ?',
contact_sub:'Écrivez-nous, on répond vite.',
form_name:'Votre nom',
form_email:'Votre courriel',
form_message:'Votre message',
form_send:'Envoyer le message',
form_ok:'Merci ! Votre message est envoyé.',
form_err:'Un souci est survenu. Réessayez ou appelez-nous.',
news_label:'Du restaurant',
news_title:'Actualités',
news_empty:'Aucune actualité pour l’instant.',
back_news:'Toutes les actualités',
footer_claim:'Le seul gril au bois des Laurentides.',
footer_claim_echo:'The only wood-fired grill in the Laurentides.',
enable_notif:'Activer les notifications',
phone_tbd:'Téléphone à venir',
address_tbd:'Adresse à venir'
},
en:{
meta_title:'Arabic wood-fired grill — Blainville',
meta_desc:'The only wood-fired grill in the Laurentides. Filet mignon, shish taouk, chicken, kafta and maaneh grilled over charcoal. Order takeout in Blainville.',
nav_home:'Home',nav_menu:'Menu',nav_news:'News',nav_order:'Order',
hero_eyebrow:'Wood-grilled · Blainville',
hero_title:'The only wood-fired grill in the Laurentides',
hero_title_echo:'Le seul gril au bois des Laurentides',
hero_cta:'Order takeout',
hero_secondary:'See the menu',
hero_img_alt:'Skewers grilling over wood charcoal',
sig_label:'The signature',
sig_title:'Wood-grilled. Nothing else.',
sig_title_echo:'Grillé au bois. Rien d’autre.',
sig_wood_title:'The wood',
sig_wood_text:'Real hardwood, no gas. Every service starts with logs lit by hand.',
sig_braise_title:'The coals',
sig_braise_text:'We wait for the coals. Their fierce heat sears the meat and keeps the juices in.',
sig_fumee_title:'The smoke',
sig_fumee_text:'Charcoal smoke gives a taste no oven can copy. It is our one and only in the Laurentides.',
ved_label:'Off the grill',
ved_title:'Our signatures',
ved_echo:'Ce qui sort du gril',
menu_label:'Takeout menu',
menu_title:'The menu',
menu_title_echo:'Le menu',
menu_empty:'The menu is coming soon. Check back with us.',
ob_label:'Ready to eat',
ob_title:'Order now, we grill, you pick up.',
ob_title_echo:'Commandez, on grille, vous ramassez.',
ob_cta:'Order takeout',
ob_platform_default:'Online ordering',
ob_pickup_default:'Ready in 20–30 min',
order_img_alt:'Grilled meats over the wood grill',
hours_label:'Find us',
hours_title:'Hours & address',
hours_echo:'Heures & adresse',
hours_open:'Opening hours',
directions:'Directions',
contact_title:'A question?',
contact_sub:'Write to us, we reply fast.',
form_name:'Your name',
form_email:'Your email',
form_message:'Your message',
form_send:'Send message',
form_ok:'Thanks! Your message is on its way.',
form_err:'Something went wrong. Try again or call us.',
news_label:'From the restaurant',
news_title:'News',
news_empty:'No news yet.',
back_news:'All news',
footer_claim:'The only wood-fired grill in the Laurentides.',
footer_claim_echo:'Le seul gril au bois des Laurentides.',
enable_notif:'Enable notifications',
phone_tbd:'Phone coming soon',
address_tbd:'Address coming soon'
}
};

const MENU_CATEGORIES=[
{key:'Filet Mignon',slug:'filet',fr:'Filet Mignon',en:'Filet Mignon'},
{key:'Shish Taouk',slug:'taouk',fr:'Shish Taouk',en:'Shish Taouk'},
{key:'Poulet',slug:'poulet',fr:'Poulet',en:'Chicken'},
{key:'Kafta',slug:'kafta',fr:'Kafta',en:'Kafta'},
{key:'Maaneh',slug:'maaneh',fr:'Maaneh',en:'Maaneh'}
];

const MODULES=[
{key:'menu_items',label:'Plats du menu',icon:'utensils',fields:[
{name:'name',label:'Nom (FR)',type:'text',required:true,maxLength:120,description:'Nom du plat en français, affiché en gros sur le menu.',placeholder:'ex. Filet Mignon Grillé'},
{name:'name_en',label:'Nom (EN)',type:'text',required:false,maxLength:120,description:'Nom du plat en anglais (affiché en mode EN).',placeholder:'e.g. Grilled Filet Mignon'},
{name:'price',label:'Prix ($)',type:'number',required:true,min:0,step:0.01,description:'Prix en dollars. Utilisez le point pour les décimales.',placeholder:'ex. 18.99'},
{name:'description',label:'Description (FR)',type:'textarea',required:false,description:'Courte description en français : accompagnements, garnitures.',placeholder:'ex. Servi avec riz, salade et ail toum'},
{name:'description_en',label:'Description (EN)',type:'textarea',required:false,description:'Courte description en anglais.',placeholder:'e.g. Served with rice, salad and garlic toum'},
{name:'category',label:'Catégorie',type:'select',required:true,options:['Filet Mignon','Shish Taouk','Poulet','Kafta','Maaneh'],description:'Section du menu où le plat apparaît.'},
{name:'image_url',label:'Photo',type:'image',required:false,description:'Photo du plat. Recommandé : paysage 800×600px.'},
{name:'sort_order',label:'Ordre',type:'number',required:false,min:0,step:1,description:'Ordre d’affichage dans la catégorie (petit = en premier).',placeholder:'ex. 1'},
{name:'featured',label:'En vedette',type:'boolean',default:false,description:'Cochez pour afficher le plat sur la page d’accueil.'},
{name:'available',label:'Disponible',type:'boolean',default:true,description:'Décochez pour masquer temporairement le plat (rupture).'}
]},
{key:'posts',label:'Actualités',icon:'edit',fields:[
{name:'title',label:'Titre',type:'text',required:true,maxLength:200,description:'Titre affiché sur la page Actualités.',placeholder:'ex. Nouvel arrivage de bois franc'},
{name:'content',label:'Contenu',type:'textarea',required:false,description:'Texte complet de l’actualité.',placeholder:'Écrivez votre annonce ici...'},
{name:'image_url',label:'Image',type:'image',required:false,description:'Image mise en avant. Recommandé : 1200×630px.'},
{name:'category',label:'Catégorie',type:'text',required:false,maxLength:50,description:'Étiquette pour regrouper les actualités.',placeholder:'ex. Nouvelles'},
{name:'published',label:'Publié',type:'boolean',default:true,description:'Décochez pour enregistrer en brouillon (invisible au public).'}
]}
];

const SETTINGS_FIELDS=[
{name:'order_url',type:'url',label:'Lien de commande en ligne',description:'Adresse complète de votre plateforme de commande tierce (UberEats, DoorDash, SkipTheDishes...). Le bouton doré « Commander » y mène directement.'}
];

// form_submissions module registered so the admin panel can manage contact messages
MODULES.push({key:'form_submissions',label:'Messages reçus',icon:'envelope',fields:[
{name:'name',label:'Nom',type:'text',required:false,maxLength:200,description:'Nom de l\'expéditeur.'},
{name:'email',label:'Courriel',type:'text',required:false,maxLength:200,description:'Adresse courriel de l\'expéditeur.'},
{name:'message',label:'Message',type:'textarea',required:false,description:'Contenu du message reçu via le formulaire de contact.'}
]});

function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':'&gt;';});}
function bool(v){return (v===true||v===1||v==='1'||v==='true'||v==='on'||v==='yes')?1:0;}
function formatPrice(p,lang){var n=Number(p);if(isNaN(n)){n=0;}return lang==='en' ? ('$'+n.toFixed(2)) : (n.toFixed(2).replace('.',',')+' $');}
function formatDate(d,lang){try{return new Date(d).toLocaleDateString(lang==='en'?'en-CA':'fr-CA',{year:'numeric',month:'long',day:'numeric'});}catch(e){return '';}}
async function getSettings(){try{var rows=await db.all('SELECT key,value FROM admin_settings',[]);var s={};(rows||[]).forEach(function(r){s[r.key]=r.value;});return s;}catch(e){return {};}}
function applyTextOverrides(t,settings,lang){for(var k in settings){if(k.indexOf('text_')===0&&k.length>(5+lang.length+1)&&k.slice(-(lang.length+1))===('_'+lang)){var tk=k.slice(5,-(lang.length+1));if(tk){t[tk]=settings[k];}}}return t;}
async function pageVars(req){var settings=await getSettings();var lang=req.lang||'fr';var t=applyTextOverrides(Object.assign({},T[lang]||T.fr),settings,lang);var rel=req.path;if(rel.charAt(0)==='/'){rel=rel.slice(1);}return {t:t,lang:lang,settings:settings,currentPath:req.path,langFr:rel+'?lang=fr',langEn:rel+'?lang=en',formatPrice:function(p){return formatPrice(p,lang);},formatDate:formatDate,categories:MENU_CATEGORIES,businessName:(settings.business_name||services.config.businessName||services.config.displayName||'Alibaba Grillade')};}
function requireAdmin(req,res,next){if(!services.admin.isAdmin(req)){return res.status(403).json({error:'Accès refusé'});}next();}

router.use(function(req,res,next){var lang=req.query.lang||(req.cookies&&req.cookies.pwa_lang)||'fr';if(lang!=='fr'&&lang!=='en'){lang='fr';}if(req.query.lang){try{res.cookie('pwa_lang',lang,{maxAge:31536000000});}catch(e){}}req.lang=lang;next();});
router.use(function(req,res,next){if(req.method==='GET'&&req.path.indexOf('/api')!==0&&req.path.indexOf('/admin')!==0&&req.path.indexOf('.')===-1){db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]).catch(function(){});}next();});

router.get('/',async function(req,res){try{var v=await pageVars(req);var rows=await db.all('SELECT * FROM menu_items WHERE available=1 ORDER BY category ASC, sort_order ASC, id ASC',[]);var grouped={};rows.forEach(function(r){(grouped[r.category]=grouped[r.category]||[]).push(r);});var featured=await db.all('SELECT * FROM menu_items WHERE available=1 AND featured=1 ORDER BY sort_order ASC, id ASC LIMIT 4',[]);res.render('index',Object.assign(v,{menuGrouped:grouped,featured:featured,menuScope:'home'}));}catch(e){console.error(e);res.status(500).send('Erreur serveur');}});
router.get('/menu',async function(req,res){try{var v=await pageVars(req);var rows=await db.all('SELECT * FROM menu_items WHERE available=1 ORDER BY category ASC, sort_order ASC, id ASC',[]);var grouped={};rows.forEach(function(r){(grouped[r.category]=grouped[r.category]||[]).push(r);});res.render('menu',Object.assign(v,{menuGrouped:grouped,menuScope:'menu'}));}catch(e){console.error(e);res.status(500).send('Erreur serveur');}});
router.get('/actualites',async function(req,res){try{var v=await pageVars(req);var posts=await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC',[]);res.render('actualites',Object.assign(v,{posts:posts}));}catch(e){console.error(e);res.status(500).send('Erreur serveur');}});
router.get('/actualites/:id',async function(req,res){try{var v=await pageVars(req);var post=await db.get('SELECT * FROM posts WHERE id=$1 AND published=1',[req.params.id]);if(!post){return res.redirect('actualites');}var postHtml='';try{var marked=await services.getMarked();postHtml=marked.parse(post.content||'');}catch(e){postHtml='<p>'+esc(post.content||'')+'</p>';}res.render('article',Object.assign(v,{post:post,postHtml:postHtml}));}catch(e){console.error(e);res.redirect('actualites');}});

router.post('/api/contact',async function(req,res){try{var name=req.body.name,email=req.body.email,message=req.body.message;if(!name||!message){return res.status(400).json({error:'Champs requis manquants'});}await db.run('INSERT INTO form_submissions (name,email,message,created_at) VALUES ($1,$2,$3,NOW())',[name,email||'',message]);try{if(services.config.contactEmail){await services.email.send({to:services.config.contactEmail,subject:'Nouveau message — Alibaba Grillade',html:'<p><strong>'+esc(name)+'</strong> ('+esc(email||'—')+')</p><p>'+esc(message)+'</p>'});}}catch(mailErr){console.error('email',mailErr&&mailErr.message);}res.json({success:true});}catch(e){console.error(e);res.status(500).json({error:'Envoi impossible'});}});

router.get('/api/admin/stats',requireAdmin,async function(req,res){try{var menuCount=Number((await db.get('SELECT COUNT(*) c FROM menu_items',[])).c)||0;var postCount=Number((await db.get('SELECT COUNT(*) c FROM posts',[])).c)||0;var subCount=Number((await db.get('SELECT COUNT(*) c FROM form_submissions',[])).c)||0;var totalVisits=Number((await db.get('SELECT COUNT(*) c FROM site_visits',[])).c)||0;var recentVisits=Number((await db.get("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'",[])).c)||0;var userCount=0;try{userCount=await services.auth.getUserCount();}catch(e){}var pushCount=0;try{pushCount=await services.push.getSubscriptionCount();}catch(e){}res.json({menuCount:menuCount,postCount:postCount,subCount:subCount,totalVisits:totalVisits,recentVisits:recentVisits,userCount:userCount,pushSubscriberCount:pushCount});}catch(e){res.status(500).json({error:'Erreur'});}});
router.get('/api/admin/submissions',requireAdmin,async function(req,res){try{var rows=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 200',[]);res.json({submissions:rows});}catch(e){res.status(500).json({error:'Erreur'});}});
router.get('/api/admin/modules',requireAdmin,function(req,res){res.json({modules:MODULES,settingsFields:SETTINGS_FIELDS});});
router.get('/api/admin/settings',requireAdmin,async function(req,res){try{res.json(await getSettings());}catch(e){res.status(500).json({error:'Erreur'});}});
router.put('/api/admin/settings',requireAdmin,async function(req,res){try{var key=req.body.key,value=req.body.value;if(!key){return res.status(400).json({error:'Clé manquante'});}await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[key,value==null?'':String(value)]);res.json({success:true});}catch(e){res.status(500).json({error:'Enregistrement impossible'});}});

router.get('/api/admin/menu_items',requireAdmin,async function(req,res){try{var rows=await db.all('SELECT * FROM menu_items ORDER BY category ASC, sort_order ASC, id ASC',[]);res.json({menu_items:rows});}catch(e){res.status(500).json({error:'Erreur'});}});
router.post('/api/admin/menu_items',requireAdmin,async function(req,res){try{var b=req.body;var r=await db.run('INSERT INTO menu_items (name,name_en,description,description_en,price,category,image_url,sort_order,featured,available,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW()) RETURNING id',[b.name||'',b.name_en||'',b.description||'',b.description_en||'',Number(b.price)||0,b.category||'',b.image_url||'',Number(b.sort_order)||0,bool(b.featured),b.available===undefined?1:bool(b.available)]);var row=await db.get('SELECT * FROM menu_items WHERE id=$1',[r.lastInsertRowid]);res.json({item:row});}catch(e){console.error(e);res.status(500).json({error:'Création impossible'});}});
router.put('/api/admin/menu_items/:id',requireAdmin,async function(req,res){try{var b=req.body;await db.run('UPDATE menu_items SET name=$1,name_en=$2,description=$3,description_en=$4,price=$5,category=$6,image_url=$7,sort_order=$8,featured=$9,available=$10,updated_at=NOW() WHERE id=$11',[b.name||'',b.name_en||'',b.description||'',b.description_en||'',Number(b.price)||0,b.category||'',b.image_url||'',Number(b.sort_order)||0,bool(b.featured),bool(b.available),req.params.id]);var row=await db.get('SELECT * FROM menu_items WHERE id=$1',[req.params.id]);res.json({item:row});}catch(e){console.error(e);res.status(500).json({error:'Mise à jour impossible'});}});
router.delete('/api/admin/menu_items/:id',requireAdmin,async function(req,res){try{await db.run('DELETE FROM menu_items WHERE id=$1',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:'Suppression impossible'});}});

router.get('/api/admin/posts',requireAdmin,async function(req,res){try{var rows=await db.all('SELECT * FROM posts ORDER BY created_at DESC',[]);res.json({posts:rows});}catch(e){res.status(500).json({error:'Erreur'});}});
router.post('/api/admin/posts',requireAdmin,async function(req,res){try{var b=req.body;var r=await db.run('INSERT INTO posts (title,content,image_url,category,published,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING id',[b.title||'',b.content||'',b.image_url||'',b.category||'',b.published===undefined?1:bool(b.published)]);var row=await db.get('SELECT * FROM posts WHERE id=$1',[r.lastInsertRowid]);res.json({post:row});}catch(e){console.error(e);res.status(500).json({error:'Création impossible'});}});
router.put('/api/admin/posts/:id',requireAdmin,async function(req,res){try{var b=req.body;await db.run('UPDATE posts SET title=$1,content=$2,image_url=$3,category=$4,published=$5,updated_at=NOW() WHERE id=$6',[b.title||'',b.content||'',b.image_url||'',b.category||'',bool(b.published),req.params.id]);var row=await db.get('SELECT * FROM posts WHERE id=$1',[req.params.id]);res.json({post:row});}catch(e){console.error(e);res.status(500).json({error:'Mise à jour impossible'});}});
router.delete('/api/admin/posts/:id',requireAdmin,async function(req,res){try{await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:'Suppression impossible'});}});

router.get('/api/admin/form_submissions',requireAdmin,async function(req,res){try{var rows=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC',[]);res.json({form_submissions:rows});}catch(e){res.status(500).json({error:'Erreur'});}});
router.post('/api/admin/form_submissions',requireAdmin,async function(req,res){try{var b=req.body;var r=await db.run('INSERT INTO form_submissions (name,email,message,created_at) VALUES ($1,$2,$3,NOW()) RETURNING id',[b.name||'',b.email||'',b.message||'']);var row=await db.get('SELECT * FROM form_submissions WHERE id=$1',[r.lastInsertRowid]);res.json({form_submission:row});}catch(e){console.error(e);res.status(500).json({error:'Création impossible'});}});
router.put('/api/admin/form_submissions/:id',requireAdmin,async function(req,res){try{var b=req.body;await db.run('UPDATE form_submissions SET name=$1,email=$2,message=$3 WHERE id=$4',[b.name||'',b.email||'',b.message||'',req.params.id]);var row=await db.get('SELECT * FROM form_submissions WHERE id=$1',[req.params.id]);res.json({form_submission:row});}catch(e){console.error(e);res.status(500).json({error:'Mise à jour impossible'});}});
router.delete('/api/admin/form_submissions/:id',requireAdmin,async function(req,res){try{await db.run('DELETE FROM form_submissions WHERE id=$1',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:'Suppression impossible'});}});

router.post('/api/admin/generate-image',requireAdmin,async function(req,res){try{var url=await services.ai.generateImage(req.body.prompt,{aspectRatio:req.body.aspectRatio||'4:3'});res.json({imageUrl:url,url:url});}catch(e){res.status(500).json({error:'Génération impossible. Téléversez une image.'});}});
router.post('/api/admin/upload',requireAdmin,async function(req,res){try{var dataUri=req.body.dataUri;if(!dataUri){return res.status(400).json({error:'Aucune image'});}if(!(services.cloudinary&&services.cloudinary.uploader&&typeof services.cloudinary.uploader.upload==='function')){return res.status(503).json({error:'Téléversement indisponible'});}var r=await services.cloudinary.uploader.upload(dataUri,{folder:'ali-baba-blainville'});res.json({url:r.secure_url,imageUrl:r.secure_url});}catch(e){console.error(e);res.status(500).json({error:'Téléversement impossible'});}});

router.get('/admin',async function(req,res){if(!services.admin.isAdmin(req)){return res.redirect('admin/login');}try{var settings=await getSettings();var menuCount=Number((await db.get('SELECT COUNT(*) c FROM menu_items',[])).c)||0;var postCount=Number((await db.get('SELECT COUNT(*) c FROM posts',[])).c)||0;var subCount=Number((await db.get('SELECT COUNT(*) c FROM form_submissions',[])).c)||0;var totalVisits=Number((await db.get('SELECT COUNT(*) c FROM site_visits',[])).c)||0;var recentVisits=Number((await db.get("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'",[])).c)||0;var submissions=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 8',[]);res.render('admin',{active:'dashboard',settings:settings,stats:{menuCount:menuCount,postCount:postCount,subCount:subCount,totalVisits:totalVisits,recentVisits:recentVisits},submissions:submissions,formatDate:formatDate});}catch(e){console.error(e);res.status(500).send('Erreur serveur');}});
router.get('/admin/menu',async function(req,res){if(!services.admin.isAdmin(req)){return res.redirect('admin/login');}try{var items=await db.all('SELECT * FROM menu_items ORDER BY category ASC, sort_order ASC, id ASC',[]);var mod=MODULES[0];res.render('admin-menu',{active:'menu',items:items,moduleKey:mod.key,moduleLabel:mod.label,fields:mod.fields});}catch(e){console.error(e);res.status(500).send('Erreur serveur');}});
router.get('/admin/posts',async function(req,res){if(!services.admin.isAdmin(req)){return res.redirect('admin/login');}try{var items=await db.all('SELECT * FROM posts ORDER BY created_at DESC',[]);var mod=MODULES[1];res.render('admin-posts',{active:'posts',items:items,moduleKey:mod.key,moduleLabel:mod.label,fields:mod.fields});}catch(e){console.error(e);res.status(500).send('Erreur serveur');}});

router.use(function(req,res,next){ if(req.path.indexOf('/api/')===0){return res.status(404).json({error:'Introuvable'});} if(req.path==='/admin'||req.path.indexOf('/admin/')===0){return next();} if(req.method==='GET'){return res.redirect('.');} res.status(404).json({error:'Introuvable'});});
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
