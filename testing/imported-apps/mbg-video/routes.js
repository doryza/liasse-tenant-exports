module.exports = function(services){
 var router = require('express').Router();
 var db = services.db;
 var BRAND = 'MBG';

 var MODULES = [
  {key:'videos',label:'Rushs',icon:'video',fields:[
   {name:'title',label:'Titre',type:'text',required:true,maxLength:120,description:"Titre du projet, affiché sous la vignette et dans le lecteur.",placeholder:"ex. Épisode 12 — Documentaire de rue"},
   {name:'youtube_url',label:'Lien YouTube',type:'url',description:"Lien YouTube ou identifiant. Laissez vide tant que la vidéo n'est pas en ligne.",placeholder:"https://youtu.be/..."},
   {name:'video_type',label:'Type',type:'select',options:['Montage YouTube','Short','Pub'],description:"Catégorie affichée en label sur la vignette."},
   {name:'timecode',label:'Timecode',type:'text',description:"Repère de section, format 00:00:00:00. Décoratif.",placeholder:"00:01:24:12"},
   {name:'duration',label:'Durée',type:'text',description:"Durée affichée sous la vidéo.",placeholder:"12:34"},
   {name:'description',label:'Description',type:'textarea',description:"Court texte de contexte (optionnel).",placeholder:"Ce que raconte ce montage."},
   {name:'image_url',label:'Vignette',type:'image',description:"Vignette 16:9, recommandé 1280×720 px. Sinon la miniature YouTube est utilisée."},
   {name:'featured',label:'À la une',type:'boolean',default:false,description:"Cochez pour placer cette vidéo dans le lecteur principal de la page."},
   {name:'sort_order',label:'Ordre',type:'number',step:1,description:"Ordre dans la galerie (petit = premier).",placeholder:"0"}
  ]},
  {key:'timeline_clips',label:'Timeline',icon:'list',fields:[
   {name:'year',label:'Année',type:'text',required:true,description:"Repère de la piste (année ou étape).",placeholder:"2024"},
   {name:'title',label:'Titre',type:'text',description:"Titre court de l'étape.",placeholder:"L'étalonnage"},
   {name:'note',label:'Note',type:'textarea',description:"Bilan en voix de monteur, quelques phrases courtes.",placeholder:"2024. Je pose une vraie colorimétrie."},
   {name:'before_image_url',label:'Avant',type:'image',description:"Image « avant » du comparatif 16:9. Doit avoir une image « après » pour afficher le curseur."},
   {name:'after_image_url',label:'Après',type:'image',description:"Image « après » du comparatif 16:9."},
   {name:'image_url',label:'Image seule',type:'image',description:"Image simple, si pas de comparatif avant/après."},
   {name:'sort_order',label:'Ordre',type:'number',step:1,description:"Ordre sur la piste (petit = à gauche).",placeholder:"0"}
  ]},
  {key:'prestations',label:'Prestations',icon:'edit',fields:[
   {name:'name',label:'Prestation',type:'text',required:true,description:"Nom de la prestation.",placeholder:"Montage long format"},
   {name:'what_i_do',label:'Ce que je fais',type:'textarea',description:"Description de la prestation en une ou deux phrases.",placeholder:"Je monte vos vidéos YouTube..."},
   {name:'for_who',label:'Pour qui',type:'text',description:"Public visé.",placeholder:"Créateurs YouTube"},
   {name:'delay',label:'Délai type',type:'text',description:"Délai indicatif de livraison.",placeholder:"3 à 6 jours"},
   {name:'price',label:'Tarif',type:'text',description:"Tarif indicatif affiché sur la carte (ex. « Sur devis », « dès 150 € »).",placeholder:"Sur devis"},
   {name:'image_url',label:'Image',type:'image',description:"Image optionnelle."},
   {name:'sort_order',label:'Ordre',type:'number',step:1,description:"Ordre d'affichage.",placeholder:"0"}
  ]},
  {key:'posts',label:'Articles',icon:'edit',fields:[
   {name:'title',label:'Titre',type:'text',required:true,description:"Titre de l'article.",placeholder:"Pourquoi le montage invisible"},
   {name:'content',label:'Contenu',type:'textarea',description:"Corps de l'article.",placeholder:"Écrivez ici..."},
   {name:'image_url',label:'Image',type:'image',description:"Image de couverture, recommandé 1200×630 px."},
   {name:'category',label:'Catégorie',type:'text',description:"Regroupe les articles par thème.",placeholder:"Méthode"},
   {name:'published',label:'Publié',type:'boolean',default:true,description:"Décochez pour garder en brouillon."}
  ]}
 ];
 var SETTINGS_FIELDS = [
  {name:'contact_email',type:'email',label:'Courriel de réception',description:"Adresse qui reçoit les demandes de travail et s'affiche sous le formulaire de contact.",placeholder:"vous@exemple.com"},
  {name:'youtube_url',type:'url',label:'Lien chaîne YouTube',description:"Adresse de votre chaîne YouTube, affichée dans le pied de page.",placeholder:"https://youtube.com/@..."},
  {name:'instagram_url',type:'url',label:'Lien Instagram',description:"Adresse de votre profil Instagram.",placeholder:"https://instagram.com/..."},
  {name:'tiktok_url',type:'url',label:'Lien TikTok',description:"Adresse de votre profil TikTok.",placeholder:"https://tiktok.com/@..."}
 ];

 async function getSettings(){ var rows=await db.all('SELECT key,value FROM admin_settings'); var s={}; rows.forEach(function(r){ s[r.key]=r.value; }); return s; }
 function ytId(u){ if(!u) return ''; var m=String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/); if(m) return m[1]; if(/^[A-Za-z0-9_-]{6,}$/.test(String(u))) return String(u); return ''; }
 function requireAdmin(req,res,next){ if(!services.admin.isAdmin(req)) return res.status(403).json({error:'Accès refusé'}); next(); }
 function convert(f,v){ if(f.type==='boolean') return (v===true||v==='true'||v===1||v==='1')?1:0; if(f.type==='number') return (v===''||v==null)?null:Number(v); return v==null?null:String(v); }

 router.use(async function(req,res,next){ if(req.method==='GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')){ try{ await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); }catch(e){} } next(); });

 router.get('/', async function(req,res){
  try{
   var settings=await getSettings();
   var videos=await db.all('SELECT * FROM videos ORDER BY sort_order ASC, id ASC');
   var featured=videos.find(function(v){ return v.featured; })||null;
   var gallery;
   if(featured){ gallery=videos.filter(function(v){ return v.id!==featured.id; }); }
   else if(videos.length){ featured=videos[0]; gallery=videos.slice(1); }
   else { gallery=[]; }
   var timeline=await db.all('SELECT * FROM timeline_clips ORDER BY sort_order ASC, id ASC');
   var prestations=await db.all('SELECT * FROM prestations ORDER BY sort_order ASC, id ASC');
   var contactEmail=settings.contact_email||services.config.contactEmail||'';
   res.render('index',{settings:settings,featured:featured,gallery:gallery,timeline:timeline,prestations:prestations,ytId:ytId,brandName:BRAND,contactEmail:contactEmail});
  }catch(e){ console.error(e); res.status(500).send('Erreur du serveur'); }
 });

 router.post('/api/contact', async function(req,res){
  try{
   var b=req.body||{};
   if(!b.name||!b.message) return res.status(400).json({error:'Le nom et le message sont requis.'});
   await db.run('INSERT INTO form_submissions (name,email,project_type,rushes_link,message) VALUES ($1,$2,$3,$4,$5)',[b.name,b.email||'',b.project_type||'',b.rushes_link||'',b.message]);
   try{
    var s=await getSettings();
    var dest=s.contact_email||services.config.contactEmail;
    if(dest){
     var safe=String(b.message).replace(/</g,'&lt;');
     await services.email.send({to:dest,subject:'Nouvelle demande de montage — '+b.name,html:'<p><strong>'+b.name+'</strong> ('+(b.email||'—')+')</p><p>Type : '+(b.project_type||'—')+'</p><p>Rushs : '+(b.rushes_link||'—')+'</p><p>'+safe+'</p>'});
    }
   }catch(mailErr){ console.error('email', mailErr.message); }
   res.json({success:true});
  }catch(e){ console.error(e); res.status(500).json({error:'Envoi impossible'}); }
 });

 router.get('/admin', async function(req,res){
  if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
  try{
   var stats={};
   stats.videos=(await db.get('SELECT COUNT(*)::int AS n FROM videos')).n;
   stats.timeline=(await db.get('SELECT COUNT(*)::int AS n FROM timeline_clips')).n;
   stats.prestations=(await db.get('SELECT COUNT(*)::int AS n FROM prestations')).n;
   stats.posts=(await db.get('SELECT COUNT(*)::int AS n FROM posts')).n;
   stats.submissions=(await db.get('SELECT COUNT(*)::int AS n FROM form_submissions')).n;
   stats.recentVisits=(await db.get("SELECT COUNT(*)::int AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).n;
   var recent=await db.all('SELECT * FROM form_submissions ORDER BY id DESC LIMIT 6');
   res.render('admin',{stats:stats,recent:recent});
  }catch(e){ console.error(e); res.status(500).send('Erreur'); }
 });

 router.get('/admin/:module', async function(req,res,next){
  var key=req.params.module;
  if(key==='login'||key==='logout') return next();
  if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
  try{
   if(key==='submissions'){ var subs=await db.all('SELECT * FROM form_submissions ORDER BY id DESC'); return res.render('admin-submissions',{items:subs}); }
   if(key==='settings'){ var st=await getSettings(); return res.render('admin-settings',{settings:st,fields:SETTINGS_FIELDS}); }
   var m=MODULES.find(function(x){ return x.key===key; });
   if(!m) return next();
   var items=await db.all('SELECT * FROM '+m.key+' ORDER BY id DESC');
   res.render('admin-module',{module:m,items:items});
  }catch(e){ console.error(e); res.status(500).send('Erreur'); }
 });

 router.get('/api/admin/stats', requireAdmin, async function(req,res){
  try{
   var uc=0,pc=0;
   try{ uc=await services.auth.getUserCount(); }catch(e){}
   try{ pc=await services.push.getSubscriptionCount(); }catch(e){}
   var tv=(await db.get('SELECT COUNT(*)::int AS n FROM site_visits')).n;
   var rv=(await db.get("SELECT COUNT(*)::int AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).n;
   res.json({userCount:uc,pushSubscriberCount:pc,totalVisits:tv,recentVisits:rv});
  }catch(e){ res.status(500).json({error:'Erreur'}); }
 });

 router.get('/api/admin/modules', requireAdmin, function(req,res){ res.json({modules:MODULES,settingsFields:SETTINGS_FIELDS}); });

 router.get('/api/admin/settings', requireAdmin, async function(req,res){ res.json(await getSettings()); });
 router.put('/api/admin/settings', requireAdmin, async function(req,res){
  try{ var k=req.body.key,v=req.body.value; if(!k) return res.status(400).json({error:'Clé manquante'}); await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k,v==null?'':String(v)]); res.json({success:true}); }catch(e){ res.status(500).json({error:'Enregistrement impossible'}); }
 });

 router.get('/api/admin/submissions', requireAdmin, async function(req,res){ var rows=await db.all('SELECT * FROM form_submissions ORDER BY id DESC'); res.json({submissions:rows}); });
 router.delete('/api/admin/submissions/:id', requireAdmin, async function(req,res){ await db.run('DELETE FROM form_submissions WHERE id=$1',[req.params.id]); res.json({success:true}); });

 router.post('/api/admin/generate-image', requireAdmin, async function(req,res){
  try{ var p=req.body.prompt; var ar=req.body.aspectRatio||'16:9'; if(!p) return res.status(400).json({error:'Description manquante'}); var url=await services.ai.generateImage(p,{aspectRatio:ar}); res.json({imageUrl:url}); }catch(e){ res.status(500).json({error:'Génération impossible. Téléversez manuellement.'}); }
 });

 router.post('/api/admin/upload', requireAdmin, async function(req,res){
  try{ if(!(services.cloudinary&&services.cloudinary.uploader&&typeof services.cloudinary.uploader.upload==='function')) return res.status(503).json({error:'Téléversement indisponible'}); var dataUri=req.body.dataUri; if(!dataUri) return res.status(400).json({error:'Aucune image'}); var r=await services.cloudinary.uploader.upload(dataUri,{folder:'mbg-video/uploads'}); res.json({url:r.secure_url}); }catch(e){ res.status(500).json({error:'Téléversement impossible'}); }
 });

 // Explicit CRUD routes for each admin-managed table (required for module discovery)

 router.get('/api/admin/posts', requireAdmin, async function(req,res){
  var rows=await db.all('SELECT * FROM posts ORDER BY id DESC');
  res.json({posts:rows});
 });
 router.post('/api/admin/posts', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key==='posts'; });
  try{
   var cols=[],vals=[];
   m.fields.forEach(function(f){ if(!(f.name in req.body)) return; cols.push(f.name); vals.push(convert(f,req.body[f.name])); });
   if(!cols.length) return res.status(400).json({error:'Aucune donnée'});
   var ph=cols.map(function(_,i){ return '$'+(i+1); }).join(',');
   var row=await db.get('INSERT INTO posts ('+cols.join(',')+') VALUES ('+ph+') RETURNING *',vals);
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Enregistrement impossible'}); }
 });
 router.put('/api/admin/posts/:id', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key==='posts'; });
  try{
   var sets=[],vals=[];
   m.fields.forEach(function(f){ if(!(f.name in req.body)) return; vals.push(convert(f,req.body[f.name])); sets.push(f.name+'=$'+vals.length); });
   if(!sets.length) return res.status(400).json({error:'Aucune donnée'});
   sets.push('updated_at=NOW()');
   vals.push(req.params.id);
   var row=await db.get('UPDATE posts SET '+sets.join(', ')+' WHERE id=$'+vals.length+' RETURNING *',vals);
   if(!row) return res.status(404).json({error:'Introuvable'});
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Mise à jour impossible'}); }
 });
 router.delete('/api/admin/posts/:id', requireAdmin, async function(req,res){
  await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]);
  res.json({success:true});
 });

 router.get('/api/admin/videos', requireAdmin, async function(req,res){
  var rows=await db.all('SELECT * FROM videos ORDER BY id DESC');
  res.json({videos:rows});
 });
 router.post('/api/admin/videos', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key==='videos'; });
  try{
   var cols=[],vals=[];
   m.fields.forEach(function(f){ if(!(f.name in req.body)) return; cols.push(f.name); vals.push(convert(f,req.body[f.name])); });
   if(!cols.length) return res.status(400).json({error:'Aucune donnée'});
   var ph=cols.map(function(_,i){ return '$'+(i+1); }).join(',');
   var row=await db.get('INSERT INTO videos ('+cols.join(',')+') VALUES ('+ph+') RETURNING *',vals);
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Enregistrement impossible'}); }
 });
 router.put('/api/admin/videos/:id', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key==='videos'; });
  try{
   var sets=[],vals=[];
   m.fields.forEach(function(f){ if(!(f.name in req.body)) return; vals.push(convert(f,req.body[f.name])); sets.push(f.name+'=$'+vals.length); });
   if(!sets.length) return res.status(400).json({error:'Aucune donnée'});
   sets.push('updated_at=NOW()');
   vals.push(req.params.id);
   var row=await db.get('UPDATE videos SET '+sets.join(', ')+' WHERE id=$'+vals.length+' RETURNING *',vals);
   if(!row) return res.status(404).json({error:'Introuvable'});
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Mise à jour impossible'}); }
 });
 router.delete('/api/admin/videos/:id', requireAdmin, async function(req,res){
  await db.run('DELETE FROM videos WHERE id=$1',[req.params.id]);
  res.json({success:true});
 });

 router.get('/api/admin/timeline_clips', requireAdmin, async function(req,res){
  var rows=await db.all('SELECT * FROM timeline_clips ORDER BY id DESC');
  res.json({timeline_clips:rows});
 });
 router.post('/api/admin/timeline_clips', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key==='timeline_clips'; });
  try{
   var cols=[],vals=[];
   m.fields.forEach(function(f){ if(!(f.name in req.body)) return; cols.push(f.name); vals.push(convert(f,req.body[f.name])); });
   if(!cols.length) return res.status(400).json({error:'Aucune donnée'});
   var ph=cols.map(function(_,i){ return '$'+(i+1); }).join(',');
   var row=await db.get('INSERT INTO timeline_clips ('+cols.join(',')+') VALUES ('+ph+') RETURNING *',vals);
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Enregistrement impossible'}); }
 });
 router.put('/api/admin/timeline_clips/:id', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key==='timeline_clips'; });
  try{
   var sets=[],vals=[];
   m.fields.forEach(function(f){ if(!(f.name in req.body)) return; vals.push(convert(f,req.body[f.name])); sets.push(f.name+'=$'+vals.length); });
   if(!sets.length) return res.status(400).json({error:'Aucune donnée'});
   sets.push('updated_at=NOW()');
   vals.push(req.params.id);
   var row=await db.get('UPDATE timeline_clips SET '+sets.join(', ')+' WHERE id=$'+vals.length+' RETURNING *',vals);
   if(!row) return res.status(404).json({error:'Introuvable'});
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Mise à jour impossible'}); }
 });
 router.delete('/api/admin/timeline_clips/:id', requireAdmin, async function(req,res){
  await db.run('DELETE FROM timeline_clips WHERE id=$1',[req.params.id]);
  res.json({success:true});
 });

 router.get('/api/admin/prestations', requireAdmin, async function(req,res){
  var rows=await db.all('SELECT * FROM prestations ORDER BY id DESC');
  res.json({prestations:rows});
 });
 router.post('/api/admin/prestations', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key==='prestations'; });
  try{
   var cols=[],vals=[];
   m.fields.forEach(function(f){ if(!(f.name in req.body)) return; cols.push(f.name); vals.push(convert(f,req.body[f.name])); });
   if(!cols.length) return res.status(400).json({error:'Aucune donnée'});
   var ph=cols.map(function(_,i){ return '$'+(i+1); }).join(',');
   var row=await db.get('INSERT INTO prestations ('+cols.join(',')+') VALUES ('+ph+') RETURNING *',vals);
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Enregistrement impossible'}); }
 });
 router.put('/api/admin/prestations/:id', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key==='prestations'; });
  try{
   var sets=[],vals=[];
   m.fields.forEach(function(f){ if(!(f.name in req.body)) return; vals.push(convert(f,req.body[f.name])); sets.push(f.name+'=$'+vals.length); });
   if(!sets.length) return res.status(400).json({error:'Aucune donnée'});
   sets.push('updated_at=NOW()');
   vals.push(req.params.id);
   var row=await db.get('UPDATE prestations SET '+sets.join(', ')+' WHERE id=$'+vals.length+' RETURNING *',vals);
   if(!row) return res.status(404).json({error:'Introuvable'});
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Mise à jour impossible'}); }
 });
 router.delete('/api/admin/prestations/:id', requireAdmin, async function(req,res){
  await db.run('DELETE FROM prestations WHERE id=$1',[req.params.id]);
  res.json({success:true});
 });

 router.get('/api/admin/form_submissions', requireAdmin, async function(req,res){
  var rows=await db.all('SELECT * FROM form_submissions ORDER BY id DESC');
  res.json({form_submissions:rows});
 });
 router.post('/api/admin/form_submissions', requireAdmin, async function(req,res){
  try{
   var b=req.body||{};
   var row=await db.get('INSERT INTO form_submissions (name,email,project_type,rushes_link,message) VALUES ($1,$2,$3,$4,$5) RETURNING *',[b.name||'',b.email||'',b.project_type||'',b.rushes_link||'',b.message||'']);
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Enregistrement impossible'}); }
 });
 router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req,res){
  try{
   var b=req.body||{};
   var row=await db.get('UPDATE form_submissions SET name=$1,email=$2,project_type=$3,rushes_link=$4,message=$5 WHERE id=$6 RETURNING *',[b.name||'',b.email||'',b.project_type||'',b.rushes_link||'',b.message||'',req.params.id]);
   if(!row) return res.status(404).json({error:'Introuvable'});
   res.json({item:row});
  }catch(e){ console.error(e); res.status(500).json({error:'Mise à jour impossible'}); }
 });
 router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req,res){
  await db.run('DELETE FROM form_submissions WHERE id=$1',[req.params.id]);
  res.json({success:true});
 });

 // Generic fallback CRUD for any other module keys
 router.get('/api/admin/:module', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key===req.params.module; }); if(!m) return res.status(404).json({error:'Module inconnu'});
  var rows=await db.all('SELECT * FROM '+m.key+' ORDER BY id DESC'); var o={}; o[m.key]=rows; res.json(o);
 });
 router.post('/api/admin/:module', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key===req.params.module; }); if(!m) return res.status(404).json({error:'Module inconnu'});
  try{ var cols=[],vals=[]; m.fields.forEach(function(f){ if(!(f.name in req.body)) return; cols.push(f.name); vals.push(convert(f,req.body[f.name])); }); if(!cols.length) return res.status(400).json({error:'Aucune donnée'}); var ph=cols.map(function(_,i){ return '$'+(i+1); }).join(','); var row=await db.get('INSERT INTO '+m.key+' ('+cols.join(',')+') VALUES ('+ph+') RETURNING *',vals); res.json({item:row}); }catch(e){ console.error(e); res.status(500).json({error:'Enregistrement impossible'}); }
 });
 router.put('/api/admin/:module/:id', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key===req.params.module; }); if(!m) return res.status(404).json({error:'Module inconnu'});
  try{ var sets=[],vals=[]; m.fields.forEach(function(f){ if(!(f.name in req.body)) return; vals.push(convert(f,req.body[f.name])); sets.push(f.name+'=$'+vals.length); }); if(!sets.length) return res.status(400).json({error:'Aucune donnée'}); sets.push('updated_at=NOW()'); vals.push(req.params.id); var row=await db.get('UPDATE '+m.key+' SET '+sets.join(', ')+' WHERE id=$'+vals.length+' RETURNING *',vals); if(!row) return res.status(404).json({error:'Introuvable'}); res.json({item:row}); }catch(e){ console.error(e); res.status(500).json({error:'Mise à jour impossible'}); }
 });
 router.delete('/api/admin/:module/:id', requireAdmin, async function(req,res){
  var m=MODULES.find(function(x){ return x.key===req.params.module; }); if(!m) return res.status(404).json({error:'Module inconnu'}); await db.run('DELETE FROM '+m.key+' WHERE id=$1',[req.params.id]); res.json({success:true});
 });

 router.use(function(req,res,next){ if(req.method==='GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) return res.redirect('.'); next(); });

// Auto-injected admin page routes for orphaned views
router.get('/admin/module', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM module ORDER BY created_at DESC');
  res.render('admin-module', { items: items });
});
router.get('/admin/submissions', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM submissions ORDER BY created_at DESC');
  res.render('admin-submissions', { items: items });
});


 // Catch-all: redirect unknown GET routes to PWA home
 router.get('*', function(req,res,next){
  if(req.path.startsWith('/api/')||req.path.startsWith('/admin/api/')) return res.status(404).json({error:'Not found'});
  if(req.path==='/admin'||req.path.startsWith('/admin/')) return next();
  res.redirect('./');
 });

 return router;
};
