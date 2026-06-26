module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  function escHtml(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];}); }
  function excerpt(txt,n){ if(!txt) return ''; var t=String(txt).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(); n=n||140; return t.length>n? t.slice(0,n).trim()+'…' : t; }
  function formatDate(d){ if(!d) return ''; try{ return new Date(d).toLocaleDateString('fr-CA',{year:'numeric',month:'long',day:'numeric'}); }catch(e){ return String(d); } }
  function catLabel(c){ return ({entretien:'Entretien',reparation:'Réparation',esthetique:'Esthétique & lavage'})[c] || 'Service'; }

  async function getSettings(){ var s={}; try{ var rows=await db.all('SELECT key,value FROM admin_settings'); (rows||[]).forEach(function(r){ s[r.key]=r.value; }); }catch(e){} return s; }

  function requireAdmin(req,res,next){ if(!services.admin.isAdmin(req)) return res.status(403).json({error:'Accès refusé'}); next(); }

  const MODULE_DEFS = [
    { key:'bookings', label:'Réservations', labelSingular:'réservation', icon:'calendar', fields:[
      { name:'name', label:'Client', type:'text', description:'Nom complet du client.', placeholder:'ex. Marie Tremblay' },
      { name:'phone', label:'Téléphone', type:'text', description:'Numéro de téléphone du client.', placeholder:'ex. 819 555-0123' },
      { name:'email', label:'Courriel', type:'email', description:'Adresse courriel du client.', placeholder:'client@exemple.com' },
      { name:'vehicle', label:'Véhicule', type:'text', description:'Marque, modèle et année.', placeholder:'ex. Honda Civic 2018' },
      { name:'service', label:'Service demandé', type:'text', description:'Service réservé.', placeholder:'ex. Changement d\'huile' },
      { name:'preferred_date', label:'Date souhaitée', type:'text', description:'Date et plage horaire préférées.', placeholder:'ex. 12 juin, avant-midi' },
      { name:'address', label:'Adresse', type:'text', description:'Adresse où réaliser le service à domicile.', placeholder:'Numéro, rue, ville' },
      { name:'notes', label:'Notes', type:'textarea', description:'Précisions fournies par le client.', placeholder:'Détails supplémentaires…' },
      { name:'status', label:'Statut', type:'select', default:'nouveau', description:'État de suivi du rendez-vous.', options:[{value:'nouveau',label:'Nouveau'},{value:'confirme',label:'Confirmé'},{value:'complete',label:'Complété'},{value:'annule',label:'Annulé'}] }
    ]},
    { key:'services', label:'Services', labelSingular:'service', icon:'wrench', fields:[
      { name:'name', label:'Nom du service', type:'text', required:true, maxLength:120, description:'Nom affiché sur le site.', placeholder:'ex. Changement d\'huile synthétique' },
      { name:'category', label:'Catégorie', type:'select', default:'entretien', description:'Détermine la pastille de couleur du code d\'inspection.', options:[{value:'entretien',label:'Entretien (vert)'},{value:'reparation',label:'Réparation (ambre)'},{value:'esthetique',label:'Esthétique / lavage (indigo)'}] },
      { name:'price', label:'Prix', type:'text', description:'Texte de prix affiché.', placeholder:'ex. À partir de 89 $' },
      { name:'duration', label:'Durée', type:'text', description:'Durée estimée affichée.', placeholder:'ex. 45 min' },
      { name:'description', label:'Description', type:'textarea', description:'Détails du service présentés sur la page Services.', placeholder:'Décrivez ce qui est inclus…' },
      { name:'image_url', label:'Photo', type:'image', description:'Photo du service. Format paysage 800×600px recommandé.' },
      { name:'featured', label:'Mis en avant', type:'boolean', default:1, description:'Coché : le service apparaît sur la page d\'accueil.' },
      { name:'sort_order', label:'Ordre d\'affichage', type:'number', min:0, step:1, default:0, description:'Plus petit = affiché en premier.', placeholder:'0' }
    ]},
    { key:'posts', label:'Conseils', labelSingular:'conseil', icon:'edit', fields:[
      { name:'title', label:'Titre', type:'text', required:true, maxLength:200, description:'Titre affiché sur la page Conseils.', placeholder:'ex. Quand changer son huile ?' },
      { name:'category', label:'Catégorie', type:'text', description:'Regroupe les conseils.', placeholder:'ex. Entretien' },
      { name:'content', label:'Contenu', type:'textarea', description:'Texte complet du conseil. Les sauts de ligne sont conservés.', placeholder:'Rédigez votre conseil…' },
      { name:'image_url', label:'Image de couverture', type:'image', description:'Image affichée en tête du conseil. 1200×630px recommandé.' },
      { name:'published', label:'Publié', type:'boolean', default:1, description:'Décoché : brouillon masqué aux visiteurs.' }
    ]},
    { key:'testimonials', label:'Témoignages', labelSingular:'témoignage', icon:'star', fields:[
      { name:'author', label:'Client', type:'text', required:true, description:'Nom du client.', placeholder:'ex. Marie L.' },
      { name:'vehicle', label:'Véhicule', type:'text', description:'Véhicule du client (optionnel).', placeholder:'ex. Toyota RAV4 2020' },
      { name:'rating', label:'Note (1 à 5)', type:'number', min:1, max:5, step:1, default:5, description:'Nombre d\'étoiles affichées.', placeholder:'5' },
      { name:'content', label:'Témoignage', type:'textarea', description:'Avis du client.', placeholder:'Ce que le client a dit…' },
      { name:'image_url', label:'Photo', type:'image', description:'Photo du client (optionnel). Carré 200×200px.' }
    ]},
    { key:'messages', label:'Messages', labelSingular:'message', icon:'mail', fields:[
      { name:'name', label:'Nom', type:'text', description:'Nom de la personne.' },
      { name:'email', label:'Courriel', type:'email', description:'Courriel fourni.' },
      { name:'phone', label:'Téléphone', type:'text', description:'Téléphone fourni.' },
      { name:'message', label:'Message', type:'textarea', description:'Contenu reçu via le formulaire de contact.' }
    ]}
  ];

  function defFor(key){ return MODULE_DEFS.find(function(m){ return m.key===key; }); }
  function coerceVal(def,name,v){ var f=def.fields.find(function(x){return x.name===name;}); if(f&&f.type==='boolean'){ if(v===true)return 1; if(v===false)return 0; return (v==1||v==='1'||v==='true')?1:0; } if(f&&f.type==='number'){ var n=Number(v); return isNaN(n)?(f.default!=null?f.default:0):n; } return v; }

  router.use(async function(req,res,next){
    if(req.method==='GET' && !req.path.startsWith('/api/admin') && !req.path.includes('.')){
      try{ await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); }catch(e){}
    }
    next();
  });

  // --- Public page routes ---

  router.get('/', async function(req,res){
    var settings={}, featured=[], testimonials=[], posts=[];
    try{ settings=await getSettings(); }catch(e){}
    try{ featured=await db.all('SELECT * FROM services WHERE featured=1 ORDER BY sort_order ASC, id ASC LIMIT 6'); }catch(e){}
    try{ testimonials=await db.all('SELECT * FROM testimonials ORDER BY created_at DESC LIMIT 6'); }catch(e){}
    try{ posts=await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3'); }catch(e){}
    res.render('index',{ settings:settings, featured:featured, testimonials:testimonials, posts:posts, catLabel:catLabel, excerpt:excerpt, formatDate:formatDate, pageTitle:null });
  });

  router.get('/services', async function(req,res){
    var settings={}, list=[];
    try{ settings=await getSettings(); }catch(e){}
    try{ list=await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC'); }catch(e){}
    res.render('services',{ settings:settings, services:list, catLabel:catLabel, excerpt:excerpt, pageTitle:'Services' });
  });

  router.get('/reservation', services.auth.optionalAuth, async function(req,res){
    var settings={}, list=[];
    try{ settings=await getSettings(); }catch(e){}
    try{ list=await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC'); }catch(e){}
    res.render('reservation',{ settings:settings, services:list, selectedService:req.query.service||'', user:req.user||null, pageTitle:'Réservation' });
  });

  router.get('/conseils', async function(req,res){
    var settings={}, posts=[];
    try{ settings=await getSettings(); }catch(e){}
    try{ posts=await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC'); }catch(e){}
    res.render('conseils',{ settings:settings, posts:posts, excerpt:excerpt, formatDate:formatDate, pageTitle:'Conseils' });
  });

  router.get('/conseils/:id', async function(req,res){
    var settings={}, post=null, more=[];
    try{ settings=await getSettings(); }catch(e){}
    try{ post=await db.get('SELECT * FROM posts WHERE id=$1 AND published=1',[req.params.id]); }catch(e){}
    if(!post) return res.redirect('conseils');
    try{ more=await db.all('SELECT * FROM posts WHERE published=1 AND id<>$1 ORDER BY created_at DESC LIMIT 3',[req.params.id]); }catch(e){}
    res.render('conseil',{ settings:settings, post:post, more:more, excerpt:excerpt, formatDate:formatDate, pageTitle:post.title });
  });

  router.get('/a-propos', async function(req,res){
    var settings={}, testimonials=[];
    try{ settings=await getSettings(); }catch(e){}
    try{ testimonials=await db.all('SELECT * FROM testimonials ORDER BY created_at DESC LIMIT 6'); }catch(e){}
    res.render('a-propos',{ settings:settings, testimonials:testimonials, pageTitle:'À propos' });
  });

  router.get('/contact', async function(req,res){
    var settings={};
    try{ settings=await getSettings(); }catch(e){}
    res.render('contact',{ settings:settings, pageTitle:'Contact' });
  });

  router.get('/mes-rendez-vous', services.auth.optionalAuth, async function(req,res){
    var settings={};
    try{ settings=await getSettings(); }catch(e){}
    res.render('mes-rendez-vous',{ settings:settings, pageTitle:'Mes rendez-vous' });
  });

  // --- Public API routes ---

  router.post('/api/reservation', services.auth.optionalAuth, async function(req,res){
    try{
      var b=req.body||{};
      if(!b.name || !b.phone || !b.service) return res.status(400).json({error:'Veuillez remplir le nom, le téléphone et le service.'});
      var uid=req.user?req.user.id:null;
      await db.run('INSERT INTO bookings (user_id,name,phone,email,vehicle,service,preferred_date,address,notes,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[uid,b.name,b.phone,b.email||'',b.vehicle||'',b.service,b.preferred_date||'',b.address||'',b.notes||'','nouveau']);
      try{
        if(services.config && services.config.contactEmail){
          var html='<h2>Nouvelle réservation à domicile</h2><p><b>Client :</b> '+escHtml(b.name)+'</p><p><b>Téléphone :</b> '+escHtml(b.phone)+'</p><p><b>Courriel :</b> '+escHtml(b.email||'')+'</p><p><b>Véhicule :</b> '+escHtml(b.vehicle||'')+'</p><p><b>Service :</b> '+escHtml(b.service)+'</p><p><b>Date souhaitée :</b> '+escHtml(b.preferred_date||'')+'</p><p><b>Adresse :</b> '+escHtml(b.address||'')+'</p><p><b>Notes :</b> '+escHtml(b.notes||'')+'</p>';
          try { await services.email.send({ to:services.config.contactEmail, subject:'Nouvelle réservation — '+b.name, html:html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      }catch(e){ console.error('email reservation', e.message); }
      res.json({ success:true });
    }catch(e){ console.error('reservation', e.message); res.status(500).json({error:'Une erreur est survenue. Réessayez.'}); }
  });

  router.post('/api/contact', async function(req,res){
    try{
      var b=req.body||{};
      if(!b.name || !b.message) return res.status(400).json({error:'Veuillez remplir votre nom et votre message.'});
      await db.run('INSERT INTO messages (name,email,phone,message) VALUES ($1,$2,$3,$4)',[b.name,b.email||'',b.phone||'',b.message]);
      try{
        if(services.config && services.config.contactEmail){
          var html='<h2>Nouveau message</h2><p><b>Nom :</b> '+escHtml(b.name)+'</p><p><b>Courriel :</b> '+escHtml(b.email||'')+'</p><p><b>Téléphone :</b> '+escHtml(b.phone||'')+'</p><p><b>Message :</b><br>'+escHtml(b.message)+'</p>';
          try { await services.email.send({ to:services.config.contactEmail, subject:'Nouveau message — '+b.name, html:html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      }catch(e){ console.error('email contact', e.message); }
      res.json({ success:true });
    }catch(e){ console.error('contact', e.message); res.status(500).json({error:'Une erreur est survenue. Réessayez.'}); }
  });

  router.get('/api/mes-rendez-vous', services.auth.requireAuth, async function(req,res){
    try{ var rows=await db.all('SELECT * FROM bookings WHERE user_id=$1 ORDER BY created_at DESC',[req.user.id]); res.json({ bookings:rows }); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });

  // --- Admin helpers ---

  async function computeStats(){
    var s={ totalVisits:0, recentVisits:0, bookings:0, newBookings:0, messages:0, users:0, push:0 };
    try{ s.totalVisits=Number((await db.get('SELECT COUNT(*) c FROM site_visits')).c)||0; }catch(e){}
    try{ s.recentVisits=Number((await db.get("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c)||0; }catch(e){}
    try{ s.bookings=Number((await db.get('SELECT COUNT(*) c FROM bookings')).c)||0; }catch(e){}
    try{ s.newBookings=Number((await db.get("SELECT COUNT(*) c FROM bookings WHERE status='nouveau'")).c)||0; }catch(e){}
    try{ s.messages=Number((await db.get('SELECT COUNT(*) c FROM messages')).c)||0; }catch(e){}
    try{ s.users=Number(await services.auth.getUserCount())||0; }catch(e){}
    try{ s.push=Number(await services.push.getSubscriptionCount())||0; }catch(e){}
    return s;
  }

  // --- Admin page routes ---

  router.get('/admin', async function(req,res){
    if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
    var settings=await getSettings();
    var stats=await computeStats();
    var recentBookings=[], recentMessages=[];
    try{ recentBookings=await db.all('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 6'); }catch(e){}
    try{ recentMessages=await db.all('SELECT * FROM messages ORDER BY created_at DESC LIMIT 5'); }catch(e){}
    res.render('admin',{ settings:settings, stats:stats, recentBookings:recentBookings, recentMessages:recentMessages, modules:MODULE_DEFS, formatDate:formatDate });
  });

  router.get('/admin/bookings', async function(req,res){
    if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
    var def=defFor('bookings');
    res.render('admin-bookings',{ moduleKey:'bookings', moduleLabel:def.label, moduleLabelSingular:def.labelSingular, fields:def.fields });
  });

  router.get('/admin/services', async function(req,res){
    if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
    var def=defFor('services');
    res.render('admin-services',{ moduleKey:'services', moduleLabel:def.label, moduleLabelSingular:def.labelSingular, fields:def.fields });
  });

  router.get('/admin/posts', async function(req,res){
    if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
    var def=defFor('posts');
    res.render('admin-posts',{ moduleKey:'posts', moduleLabel:def.label, moduleLabelSingular:def.labelSingular, fields:def.fields });
  });

  router.get('/admin/testimonials', async function(req,res){
    if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
    var def=defFor('testimonials');
    res.render('admin-testimonials',{ moduleKey:'testimonials', moduleLabel:def.label, moduleLabelSingular:def.labelSingular, fields:def.fields });
  });

  router.get('/admin/messages', async function(req,res){
    if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
    var def=defFor('messages');
    res.render('admin-messages',{ moduleKey:'messages', moduleLabel:def.label, moduleLabelSingular:def.labelSingular, fields:def.fields });
  });

  // --- Admin API: meta ---

  router.get('/api/admin/stats', requireAdmin, async function(req,res){ res.json(await computeStats()); });
  router.get('/api/admin/modules', requireAdmin, function(req,res){ res.json({ modules:MODULE_DEFS, settingsFields:[] }); });
  router.get('/api/admin/submissions', requireAdmin, async function(req,res){ try{ var rows=await db.all('SELECT * FROM messages ORDER BY created_at DESC'); res.json({ messages:rows }); }catch(e){ res.status(500).json({error:'Erreur'}); } });

  router.get('/api/admin/settings', requireAdmin, async function(req,res){ res.json(await getSettings()); });
  router.put('/api/admin/settings', requireAdmin, async function(req,res){
    try{ var k=req.body.key, v=req.body.value; if(!k) return res.status(400).json({error:'Clé requise'}); await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k,String(v==null?'':v)]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });

  router.post('/api/admin/upload-image', requireAdmin, async function(req,res){
    try{
      if(!(services.cloudinary && services.cloudinary.uploader && typeof services.cloudinary.uploader.upload==='function')) return res.status(503).json({error:'Téléversement indisponible'});
      var dataUri=req.body.dataUri; if(!dataUri) return res.status(400).json({error:'Aucune image'});
      var r=await services.cloudinary.uploader.upload(dataUri,{folder:'ams-auto-services'});
      res.json({ url:r.secure_url });
    }catch(e){ console.error('upload', e.message); res.status(500).json({error:'Téléversement échoué'}); }
  });

  router.post('/api/admin/generate-image', requireAdmin, async function(req,res){
    try{ var prompt=req.body.prompt; if(!prompt) return res.status(400).json({error:'Description requise'}); var url=await services.ai.generateImage(prompt,{ aspectRatio:req.body.aspectRatio||'4:3' }); res.json({ imageUrl:url }); }
    catch(e){ console.error('genimg', e.message); res.status(500).json({error:'Génération impossible. Téléversez manuellement.'}); }
  });

  // --- Admin API: bookings CRUD ---

  router.get('/api/admin/bookings', requireAdmin, async function(req,res){
    try{ var rows=await db.all('SELECT * FROM bookings ORDER BY created_at DESC'); res.json({ bookings:rows }); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });
  router.post('/api/admin/bookings', requireAdmin, async function(req,res){
    try{
      var def=defFor('bookings'), cols=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ cols.push(f.name); vals.push(coerceVal(def,f.name,req.body[f.name])); } });
      if(!cols.length) return res.status(400).json({error:'Aucune donnée'});
      var ph=cols.map(function(_,i){ return '$'+(i+1); });
      var row=await db.get('INSERT INTO bookings ('+cols.join(',')+') VALUES ('+ph.join(',')+') RETURNING *',vals);
      res.json({ item:row });
    }catch(e){ console.error('create bookings', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.put('/api/admin/bookings/:id', requireAdmin, async function(req,res){
    try{
      var def=defFor('bookings'), sets=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ vals.push(coerceVal(def,f.name,req.body[f.name])); sets.push(f.name+'=$'+vals.length); } });
      if(!sets.length) return res.status(400).json({error:'Aucune donnée'});
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      var row=await db.get('UPDATE bookings SET '+sets.join(',')+' WHERE id=$'+vals.length+' RETURNING *',vals);
      if(!row) return res.status(404).json({error:'Introuvable'});
      res.json({ item:row });
    }catch(e){ console.error('update bookings', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.delete('/api/admin/bookings/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM bookings WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });

  // --- Admin API: services CRUD ---

  router.get('/api/admin/services', requireAdmin, async function(req,res){
    try{ var rows=await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC'); res.json({ services:rows }); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });
  router.post('/api/admin/services', requireAdmin, async function(req,res){
    try{
      var def=defFor('services'), cols=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ cols.push(f.name); vals.push(coerceVal(def,f.name,req.body[f.name])); } });
      if(!cols.length) return res.status(400).json({error:'Aucune donnée'});
      var ph=cols.map(function(_,i){ return '$'+(i+1); });
      var row=await db.get('INSERT INTO services ('+cols.join(',')+') VALUES ('+ph.join(',')+') RETURNING *',vals);
      res.json({ item:row });
    }catch(e){ console.error('create services', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.put('/api/admin/services/:id', requireAdmin, async function(req,res){
    try{
      var def=defFor('services'), sets=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ vals.push(coerceVal(def,f.name,req.body[f.name])); sets.push(f.name+'=$'+vals.length); } });
      if(!sets.length) return res.status(400).json({error:'Aucune donnée'});
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      var row=await db.get('UPDATE services SET '+sets.join(',')+' WHERE id=$'+vals.length+' RETURNING *',vals);
      if(!row) return res.status(404).json({error:'Introuvable'});
      res.json({ item:row });
    }catch(e){ console.error('update services', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM services WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });

  // --- Admin API: posts CRUD ---

  router.get('/api/admin/posts', requireAdmin, async function(req,res){
    try{ var rows=await db.all('SELECT * FROM posts ORDER BY created_at DESC'); res.json({ posts:rows }); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req,res){
    try{
      var def=defFor('posts'), cols=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ cols.push(f.name); vals.push(coerceVal(def,f.name,req.body[f.name])); } });
      if(!cols.length) return res.status(400).json({error:'Aucune donnée'});
      var ph=cols.map(function(_,i){ return '$'+(i+1); });
      var row=await db.get('INSERT INTO posts ('+cols.join(',')+') VALUES ('+ph.join(',')+') RETURNING *',vals);
      res.json({ item:row });
    }catch(e){ console.error('create posts', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req,res){
    try{
      var def=defFor('posts'), sets=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ vals.push(coerceVal(def,f.name,req.body[f.name])); sets.push(f.name+'=$'+vals.length); } });
      if(!sets.length) return res.status(400).json({error:'Aucune donnée'});
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      var row=await db.get('UPDATE posts SET '+sets.join(',')+' WHERE id=$'+vals.length+' RETURNING *',vals);
      if(!row) return res.status(404).json({error:'Introuvable'});
      res.json({ item:row });
    }catch(e){ console.error('update posts', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });

  // --- Admin API: testimonials CRUD ---

  router.get('/api/admin/testimonials', requireAdmin, async function(req,res){
    try{ var rows=await db.all('SELECT * FROM testimonials ORDER BY created_at DESC'); res.json({ testimonials:rows }); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });
  router.post('/api/admin/testimonials', requireAdmin, async function(req,res){
    try{
      var def=defFor('testimonials'), cols=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ cols.push(f.name); vals.push(coerceVal(def,f.name,req.body[f.name])); } });
      if(!cols.length) return res.status(400).json({error:'Aucune donnée'});
      var ph=cols.map(function(_,i){ return '$'+(i+1); });
      var row=await db.get('INSERT INTO testimonials ('+cols.join(',')+') VALUES ('+ph.join(',')+') RETURNING *',vals);
      res.json({ item:row });
    }catch(e){ console.error('create testimonials', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.put('/api/admin/testimonials/:id', requireAdmin, async function(req,res){
    try{
      var def=defFor('testimonials'), sets=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ vals.push(coerceVal(def,f.name,req.body[f.name])); sets.push(f.name+'=$'+vals.length); } });
      if(!sets.length) return res.status(400).json({error:'Aucune donnée'});
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      var row=await db.get('UPDATE testimonials SET '+sets.join(',')+' WHERE id=$'+vals.length+' RETURNING *',vals);
      if(!row) return res.status(404).json({error:'Introuvable'});
      res.json({ item:row });
    }catch(e){ console.error('update testimonials', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.delete('/api/admin/testimonials/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM testimonials WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });

  // --- Admin API: messages CRUD ---

  router.get('/api/admin/messages', requireAdmin, async function(req,res){
    try{ var rows=await db.all('SELECT * FROM messages ORDER BY created_at DESC'); res.json({ messages:rows }); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });
  router.post('/api/admin/messages', requireAdmin, async function(req,res){
    try{
      var def=defFor('messages'), cols=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ cols.push(f.name); vals.push(coerceVal(def,f.name,req.body[f.name])); } });
      if(!cols.length) return res.status(400).json({error:'Aucune donnée'});
      var ph=cols.map(function(_,i){ return '$'+(i+1); });
      var row=await db.get('INSERT INTO messages ('+cols.join(',')+') VALUES ('+ph.join(',')+') RETURNING *',vals);
      res.json({ item:row });
    }catch(e){ console.error('create messages', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.put('/api/admin/messages/:id', requireAdmin, async function(req,res){
    try{
      var def=defFor('messages'), sets=[], vals=[];
      def.fields.forEach(function(f){ if(req.body[f.name]!==undefined){ vals.push(coerceVal(def,f.name,req.body[f.name])); sets.push(f.name+'=$'+vals.length); } });
      if(!sets.length) return res.status(400).json({error:'Aucune donnée'});
      sets.push('updated_at=NOW()'); vals.push(req.params.id);
      var row=await db.get('UPDATE messages SET '+sets.join(',')+' WHERE id=$'+vals.length+' RETURNING *',vals);
      if(!row) return res.status(404).json({error:'Introuvable'});
      res.json({ item:row });
    }catch(e){ console.error('update messages', e.message); res.status(500).json({error:'Erreur'}); }
  });
  router.delete('/api/admin/messages/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM messages WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:'Erreur'}); }
  });

  // --- Catch-all ---

  router.use(function(req,res){
    if(req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')){
      return res.status(404).json({ error:'Not found' });
    }
    res.redirect('./');
  });

  return router;
};
