module.exports = function(services){
  const router = require('express').Router();
  const db = services.db;

  const MODULES = {
    posts: ['title','content','image_url','category','published'],
    tracks: ['title','album','side','track_no','description','audio_url','image_url','duration','release_date','featured','published'],
    shows: ['title','venue','city','description','show_date','show_time','ticket_url','price','image_url','sold_out','published'],
    favorites: ['user_id','track_id'],
    form_submissions: ['name','email','subject','message']
  };
  const BOOLS = ['published','featured','sold_out'];
  const INTS = ['track_no'];

  function normalize(c,v){
    if(BOOLS.indexOf(c)>=0){ return (v===true||v==='true'||v===1||v==='1')?1:0; }
    if(v===''||v===undefined) return null;
    if(INTS.indexOf(c)>=0){ var n=parseInt(v); return isNaN(n)?null:n; }
    return v;
  }
  function esc(s){ return String(s==null?'':s).replace(/[&<>]/g,function(c){ return c==='&'?'&amp;':(c==='<'?'&lt;':'&gt;'); }); }
  function fmtDate(d){ if(!d) return ''; try{ return new Date(d).toLocaleDateString('fr-CA',{year:'numeric',month:'long',day:'numeric'}); }catch(e){ return ''; } }
  function fmtDay(d){ if(!d) return {}; try{ var dt=new Date(d); var mois=['janv.','fevr.','mars','avr.','mai','juin','juill.','aout','sept.','oct.','nov.','dec.']; return { d: dt.getDate(), m: mois[dt.getMonth()], y: dt.getFullYear() }; }catch(e){ return {}; } }
  async function getSettings(){ var s={}; try{ var rows=await db.all('SELECT key,value FROM admin_settings'); rows.forEach(function(r){ s[r.key]=r.value; }); }catch(e){} return s; }
  function requireAdmin(req,res,next){ if(!services.admin.isAdmin(req)) return res.status(403).json({error:'Acces refuse'}); next(); }

  router.use(async function(req,res,next){
    if(req.method==='GET' && req.path.indexOf('/api/admin')!==0 && req.path.indexOf('.')<0){ try{ await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); }catch(e){} }
    next();
  });

  router.get('/', async function(req,res){
    try{
      var settings=await getSettings();
      var tracks=await db.all('SELECT * FROM tracks WHERE published=1 AND featured=1 ORDER BY side ASC, track_no ASC, id ASC LIMIT 5');
      if(!tracks.length) tracks=await db.all('SELECT * FROM tracks WHERE published=1 ORDER BY id ASC LIMIT 5');
      var shows=await db.all('SELECT * FROM shows WHERE published=1 AND show_date >= CURRENT_DATE ORDER BY show_date ASC LIMIT 3');
      var posts=await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
      var latest=await db.get('SELECT * FROM tracks WHERE published=1 ORDER BY release_date DESC NULLS LAST, id DESC LIMIT 1');
      res.render('index',{settings,tracks,shows,posts,latest,fmtDate,fmtDay,page:'accueil'});
    }catch(e){ console.error('home',e.message); res.render('index',{settings:{},tracks:[],shows:[],posts:[],latest:null,fmtDate,fmtDay,page:'accueil'}); }
  });

  router.get('/musique', async function(req,res){
    var settings=await getSettings();
    var tracks=await db.all('SELECT * FROM tracks WHERE published=1 ORDER BY release_date DESC NULLS LAST, side ASC, track_no ASC, id ASC');
    res.render('musique',{settings,tracks,fmtDate,fmtDay,page:'musique'});
  });

  router.get('/spectacles', async function(req,res){
    var settings=await getSettings();
    var upcoming=await db.all('SELECT * FROM shows WHERE published=1 AND show_date >= CURRENT_DATE ORDER BY show_date ASC');
    var past=await db.all('SELECT * FROM shows WHERE published=1 AND show_date < CURRENT_DATE ORDER BY show_date DESC LIMIT 8');
    res.render('spectacles',{settings,upcoming,past,fmtDate,fmtDay,page:'spectacles'});
  });

  router.get('/journal', async function(req,res){
    var settings=await getSettings();
    var posts=await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC');
    res.render('journal',{settings,posts,fmtDate,fmtDay,page:'journal'});
  });

  router.get('/journal/:id', async function(req,res){
    var settings=await getSettings();
    var post=await db.get('SELECT * FROM posts WHERE id=$1 AND published=1',[req.params.id]);
    if(!post) return res.redirect('journal');
    var more=await db.all('SELECT * FROM posts WHERE published=1 AND id<>$1 ORDER BY created_at DESC LIMIT 3',[req.params.id]);
    res.render('article',{settings,post,more,fmtDate,fmtDay,page:'journal'});
  });

  router.get('/a-propos', async function(req,res){
    var settings=await getSettings();
    res.render('apropos',{settings,fmtDate,fmtDay,page:'apropos'});
  });

  router.get('/contact', async function(req,res){
    var settings=await getSettings();
    res.render('contact',{settings,fmtDate,fmtDay,page:'contact'});
  });

  router.get('/favoris', services.auth.optionalAuth, async function(req,res){
    var settings=await getSettings();
    var favs=[];
    if(req.user){ try{ favs=await db.all('SELECT t.* FROM favorites f JOIN tracks t ON t.id=f.track_id WHERE f.user_id=$1 AND t.published=1 ORDER BY f.created_at DESC',[req.user.id]); }catch(e){} }
    res.render('favoris',{settings,user:req.user||null,favs,fmtDate,fmtDay,page:'favoris'});
  });

  router.post('/api/contact', async function(req,res){
    try{
      var name=req.body.name, email=req.body.email, subject=req.body.subject, message=req.body.message;
      if(!name||!message) return res.status(400).json({error:'Veuillez remplir votre nom et votre message.'});
      await db.run('INSERT INTO form_submissions (name,email,subject,message) VALUES ($1,$2,$3,$4)',[name,email||'',subject||'',message]);
      try{ if(services.config.contactEmail){ await services.email.send({to:services.config.contactEmail,subject:'Nouveau message du site — '+(subject||'Contact'),html:'<p><strong>'+esc(name)+'</strong> &lt;'+esc(email||'')+'&gt;</p><p>'+esc(subject||'')+'</p><div style="white-space:pre-wrap">'+esc(message)+'</div>'}); } }catch(em){ console.error('email',em.message); }
      res.json({success:true});
    }catch(e){ console.error('contact',e.message); res.status(500).json({error:'Echec de l\'envoi. Reessayez.'}); }
  });

  router.get('/api/favorites', services.auth.requireAuth, async function(req,res){
    var rows=await db.all('SELECT track_id FROM favorites WHERE user_id=$1',[req.user.id]);
    res.json({ids: rows.map(function(r){ return r.track_id; })});
  });
  router.post('/api/favorites', services.auth.requireAuth, async function(req,res){
    var t=parseInt(req.body.trackId); if(!t) return res.status(400).json({error:'Piste invalide'});
    var ex=await db.get('SELECT id FROM favorites WHERE user_id=$1 AND track_id=$2',[req.user.id,t]);
    if(ex){ await db.run('DELETE FROM favorites WHERE id=$1',[ex.id]); return res.json({favorited:false}); }
    await db.run('INSERT INTO favorites (user_id,track_id) VALUES ($1,$2)',[req.user.id,t]);
    res.json({favorited:true});
  });

  router.get('/admin', async function(req,res){
    if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
    var settings=await getSettings();
    var stats={users:0,push:0,visits:0,visits7:0,tracks:0,shows:0,posts:0,messages:0};
    try{ stats.users=await services.auth.getUserCount(); }catch(e){}
    try{ stats.push=await services.push.getSubscriptionCount(); }catch(e){}
    try{ stats.visits=parseInt((await db.get('SELECT COUNT(*) c FROM site_visits')).c)||0; }catch(e){}
    try{ stats.visits7=parseInt((await db.get("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c)||0; }catch(e){}
    try{ stats.tracks=parseInt((await db.get('SELECT COUNT(*) c FROM tracks')).c)||0; }catch(e){}
    try{ stats.shows=parseInt((await db.get('SELECT COUNT(*) c FROM shows')).c)||0; }catch(e){}
    try{ stats.posts=parseInt((await db.get('SELECT COUNT(*) c FROM posts')).c)||0; }catch(e){}
    try{ stats.messages=parseInt((await db.get('SELECT COUNT(*) c FROM form_submissions')).c)||0; }catch(e){}
    var recent=[]; try{ recent=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5'); }catch(e){}
    res.render('admin',{settings,stats,recent,fmtDate});
  });
  router.get('/admin/tracks', function(req,res){ if(!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-tracks'); });
  router.get('/admin/shows', function(req,res){ if(!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-shows'); });
  router.get('/admin/posts', function(req,res){ if(!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-posts'); });
  router.get('/admin/messages', function(req,res){ if(!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-messages'); });
  router.get('/admin/settings', function(req,res){ if(!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render('admin-settings'); });

  router.get('/api/admin/stats', requireAdmin, async function(req,res){
    var out={};
    try{ out.userCount=await services.auth.getUserCount(); }catch(e){ out.userCount=0; }
    try{ out.pushSubscriberCount=await services.push.getSubscriptionCount(); }catch(e){ out.pushSubscriberCount=0; }
    try{ out.totalVisits=parseInt((await db.get('SELECT COUNT(*) c FROM site_visits')).c)||0; }catch(e){ out.totalVisits=0; }
    try{ out.recentVisits=parseInt((await db.get("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c)||0; }catch(e){ out.recentVisits=0; }
    res.json(out);
  });

  router.get('/api/admin/modules', requireAdmin, function(req,res){
    res.json({ modules: [
      { key:'tracks', label:'Musique', icon:'music', fields:[
        { name:'title', label:'Titre', type:'text', required:true, maxLength:200, description:'Le nom de la chanson.', placeholder:'ex. Lueurs de minuit' },
        { name:'album', label:'Album', type:'text', description:'Nom de l\'album ou du single.', placeholder:'ex. Lueurs de minuit' },
        { name:'side', label:'Face', type:'select', options:['A','B'], description:'Face A ou B.' },
        { name:'track_no', label:'Numero de piste', type:'number', min:1, step:1, description:'Position de la piste sur la face.', placeholder:'ex. 1' },
        { name:'duration', label:'Duree', type:'text', description:'Duree affichee au format minutes:secondes.', placeholder:'ex. 3:52' },
        { name:'description', label:'Notes / paroles', type:'textarea', description:'Texte affiche sous la piste.', placeholder:'Quelques mots sur la chanson...' },
        { name:'audio_url', label:'Lien audio (MP3)', type:'url', description:'Lien direct vers un fichier MP3.', placeholder:'https://.../extrait.mp3' },
        { name:'image_url', label:'Pochette', type:'image', description:'Image carree de la pochette. Recommande : 800x800px.' },
        { name:'release_date', label:'Date de sortie', type:'date', description:'Date de parution.' },
        { name:'featured', label:'Mise en avant', type:'boolean', description:'Coché : la piste apparait dans la selection de la page d\'accueil.' },
        { name:'published', label:'Publie', type:'boolean', default:true, description:'Decochez pour masquer la piste du site.' }
      ]},
      { key:'shows', label:'Spectacles', icon:'calendar', fields:[
        { name:'title', label:'Titre du spectacle', type:'text', required:true, maxLength:200, description:'Le nom affiche de la date.', placeholder:'ex. Lancement d\'album' },
        { name:'venue', label:'Salle / lieu', type:'text', description:'Nom de la salle ou du lieu.', placeholder:'ex. Salle J.-Antonio-Thompson' },
        { name:'city', label:'Ville', type:'text', description:'Ville du spectacle.', placeholder:'ex. Trois-Rivieres' },
        { name:'show_date', label:'Date', type:'date', required:true, description:'Date du spectacle.' },
        { name:'show_time', label:'Heure', type:'text', description:'Heure de debut affichee.', placeholder:'ex. 20h00' },
        { name:'price', label:'Prix', type:'text', description:'Prix affiche des billets.', placeholder:'ex. 32 $' },
        { name:'ticket_url', label:'Lien billetterie', type:'url', description:'Lien vers la billetterie.', placeholder:'https://...' },
        { name:'description', label:'Description', type:'textarea', description:'Details du spectacle.' },
        { name:'image_url', label:'Affiche', type:'image', description:'Affiche du spectacle. Recommande : 1200x800px.' },
        { name:'sold_out', label:'Complet', type:'boolean', description:'Coché : affiche la mention Complet.' },
        { name:'published', label:'Publie', type:'boolean', default:true, description:'Decochez pour masquer la date du site.' }
      ]},
      { key:'posts', label:'Journal', icon:'edit', fields:[
        { name:'title', label:'Titre', type:'text', required:true, maxLength:200, description:'Le titre de l\'article.', placeholder:'ex. Lueurs de minuit est disponible' },
        { name:'category', label:'Categorie', type:'text', description:'Etiquette de regroupement.', placeholder:'ex. Sortie' },
        { name:'image_url', label:'Image', type:'image', description:'Image de couverture. Recommande : 1200x630px.' },
        { name:'content', label:'Contenu', type:'textarea', description:'Le texte complet de l\'article.', placeholder:'Ecrivez votre article...' },
        { name:'published', label:'Publie', type:'boolean', default:true, description:'Decochez pour enregistrer comme brouillon.' }
      ]},
      { key:'favorites', label:'Favoris', icon:'heart', fields:[
        { name:'user_id', label:'Utilisateur (ID)', type:'number', required:true, description:"Identifiant de l'utilisateur." },
        { name:'track_id', label:'Piste (ID)', type:'number', required:true, description:"Identifiant de la piste mise en favori." }
      ]},
      { key:'form_submissions', label:'Messages recus', icon:'mail', fields:[
        { name:'name', label:'Nom', type:'text', description:"Nom de l'expediteur." },
        { name:'email', label:'Courriel', type:'text', description:"Adresse courriel de l'expediteur." },
        { name:'subject', label:'Sujet', type:'text', description:'Sujet du message.' },
        { name:'message', label:'Message', type:'textarea', description:'Contenu du message.' }
      ]}
    ], settingsFields: [
      { name:'contact_phone', type:'text', label:'Telephone', description:'Numero affiche sur la page Contact.' },
      { name:'social_spotify', type:'url', label:'Spotify', description:'Lien vers votre profil Spotify.' },
      { name:'social_youtube', type:'url', label:'YouTube', description:'Lien vers votre chaine YouTube.' },
      { name:'social_instagram', type:'url', label:'Instagram', description:'Lien vers votre compte Instagram.' },
      { name:'social_bandcamp', type:'url', label:'Bandcamp', description:'Lien vers votre page Bandcamp.' }
    ]});
  });

  router.get('/api/admin/settings', requireAdmin, async function(req,res){ var s=await getSettings(); res.json({settings:s}); });
  router.put('/api/admin/settings', requireAdmin, async function(req,res){
    var key=req.body.key, value=req.body.value;
    if(!key) return res.status(400).json({error:'Cle manquante'});
    await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[key, value==null?'':String(value)]);
    res.json({success:true});
  });

  router.get('/api/admin/submissions', requireAdmin, async function(req,res){ var rows=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC'); res.json({submissions:rows}); });
  router.delete('/api/admin/submissions/:id', requireAdmin, async function(req,res){ await db.run('DELETE FROM form_submissions WHERE id=$1',[req.params.id]); res.json({success:true}); });

  router.post('/api/admin/generate-image', requireAdmin, async function(req,res){
    var prompt=req.body.prompt, aspectRatio=req.body.aspectRatio;
    if(!prompt) return res.status(400).json({error:'Description requise'});
    try{ var url=await services.ai.generateImage(prompt,{aspectRatio:aspectRatio||'1:1'}); res.json({imageUrl:url}); }
    catch(e){ res.status(500).json({error:'Echec de la generation. Televersez une image manuellement.'}); }
  });
  router.post('/api/admin/upload', requireAdmin, async function(req,res){
    try{
      var dataUri=req.body.dataUri;
      if(!dataUri) return res.status(400).json({error:'Aucune image'});
      if(!(services.cloudinary && services.cloudinary.uploader && typeof services.cloudinary.uploader.upload==='function')) return res.status(503).json({error:'Televersement non configure'});
      var r=await services.cloudinary.uploader.upload(dataUri,{folder:'j-s-faubert/uploads'});
      res.json({url:r.secure_url});
    }catch(e){ res.status(500).json({error:'Echec du televersement'}); }
  });

  router.get('/api/admin/posts', requireAdmin, async function(req,res){
    var rows=await db.all('SELECT * FROM posts ORDER BY id DESC');
    res.json({posts:rows});
  });
  router.post('/api/admin/posts', requireAdmin, async function(req,res){
    var cols=MODULES.posts,keys=[],vals=[],ph=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ keys.push(c); vals.push(normalize(c,req.body[c])); ph.push('$'+i++); } });
    if(!keys.length) return res.status(400).json({error:'Aucune donnee'});
    var r=await db.run('INSERT INTO posts ('+keys.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals);
    var row=await db.get('SELECT * FROM posts WHERE id=$1',[r.lastInsertRowid]);
    res.json({item:row});
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req,res){
    var cols=MODULES.posts,sets=[],vals=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+i++); vals.push(normalize(c,req.body[c])); } });
    if(!sets.length) return res.status(400).json({error:'Aucune donnee'});
    sets.push('updated_at=NOW()'); vals.push(req.params.id);
    await db.run('UPDATE posts SET '+sets.join(',')+' WHERE id=$'+i,vals);
    var row=await db.get('SELECT * FROM posts WHERE id=$1',[req.params.id]);
    res.json({item:row});
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req,res){
    await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]);
    res.json({success:true});
  });

  router.get('/api/admin/tracks', requireAdmin, async function(req,res){
    var rows=await db.all('SELECT * FROM tracks ORDER BY id DESC');
    res.json({tracks:rows});
  });
  router.post('/api/admin/tracks', requireAdmin, async function(req,res){
    var cols=MODULES.tracks,keys=[],vals=[],ph=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ keys.push(c); vals.push(normalize(c,req.body[c])); ph.push('$'+i++); } });
    if(!keys.length) return res.status(400).json({error:'Aucune donnee'});
    var r=await db.run('INSERT INTO tracks ('+keys.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals);
    var row=await db.get('SELECT * FROM tracks WHERE id=$1',[r.lastInsertRowid]);
    res.json({item:row});
  });
  router.put('/api/admin/tracks/:id', requireAdmin, async function(req,res){
    var cols=MODULES.tracks,sets=[],vals=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+i++); vals.push(normalize(c,req.body[c])); } });
    if(!sets.length) return res.status(400).json({error:'Aucune donnee'});
    sets.push('updated_at=NOW()'); vals.push(req.params.id);
    await db.run('UPDATE tracks SET '+sets.join(',')+' WHERE id=$'+i,vals);
    var row=await db.get('SELECT * FROM tracks WHERE id=$1',[req.params.id]);
    res.json({item:row});
  });
  router.delete('/api/admin/tracks/:id', requireAdmin, async function(req,res){
    await db.run('DELETE FROM tracks WHERE id=$1',[req.params.id]);
    res.json({success:true});
  });

  router.get('/api/admin/shows', requireAdmin, async function(req,res){
    var rows=await db.all('SELECT * FROM shows ORDER BY id DESC');
    res.json({shows:rows});
  });
  router.post('/api/admin/shows', requireAdmin, async function(req,res){
    var cols=MODULES.shows,keys=[],vals=[],ph=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ keys.push(c); vals.push(normalize(c,req.body[c])); ph.push('$'+i++); } });
    if(!keys.length) return res.status(400).json({error:'Aucune donnee'});
    var r=await db.run('INSERT INTO shows ('+keys.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals);
    var row=await db.get('SELECT * FROM shows WHERE id=$1',[r.lastInsertRowid]);
    res.json({item:row});
  });
  router.put('/api/admin/shows/:id', requireAdmin, async function(req,res){
    var cols=MODULES.shows,sets=[],vals=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+i++); vals.push(normalize(c,req.body[c])); } });
    if(!sets.length) return res.status(400).json({error:'Aucune donnee'});
    sets.push('updated_at=NOW()'); vals.push(req.params.id);
    await db.run('UPDATE shows SET '+sets.join(',')+' WHERE id=$'+i,vals);
    var row=await db.get('SELECT * FROM shows WHERE id=$1',[req.params.id]);
    res.json({item:row});
  });
  router.delete('/api/admin/shows/:id', requireAdmin, async function(req,res){
    await db.run('DELETE FROM shows WHERE id=$1',[req.params.id]);
    res.json({success:true});
  });

  router.get('/api/admin/favorites', requireAdmin, async function(req,res){
    var rows=await db.all('SELECT * FROM favorites ORDER BY id DESC');
    res.json({favorites:rows});
  });
  router.post('/api/admin/favorites', requireAdmin, async function(req,res){
    var cols=MODULES.favorites,keys=[],vals=[],ph=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ keys.push(c); vals.push(normalize(c,req.body[c])); ph.push('$'+i++); } });
    if(!keys.length) return res.status(400).json({error:'Aucune donnee'});
    var r=await db.run('INSERT INTO favorites ('+keys.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals);
    var row=await db.get('SELECT * FROM favorites WHERE id=$1',[r.lastInsertRowid]);
    res.json({item:row});
  });
  router.put('/api/admin/favorites/:id', requireAdmin, async function(req,res){
    var cols=MODULES.favorites,sets=[],vals=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+i++); vals.push(normalize(c,req.body[c])); } });
    if(!sets.length) return res.status(400).json({error:'Aucune donnee'});
    vals.push(req.params.id);
    await db.run('UPDATE favorites SET '+sets.join(',')+' WHERE id=$'+i,vals);
    var row=await db.get('SELECT * FROM favorites WHERE id=$1',[req.params.id]);
    res.json({item:row});
  });
  router.delete('/api/admin/favorites/:id', requireAdmin, async function(req,res){
    await db.run('DELETE FROM favorites WHERE id=$1',[req.params.id]);
    res.json({success:true});
  });

  router.get('/api/admin/form_submissions', requireAdmin, async function(req,res){
    var rows=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
    res.json({form_submissions:rows});
  });
  router.post('/api/admin/form_submissions', requireAdmin, async function(req,res){
    var cols=MODULES.form_submissions,keys=[],vals=[],ph=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ keys.push(c); vals.push(normalize(c,req.body[c])); ph.push('$'+i++); } });
    if(!keys.length) return res.status(400).json({error:'Aucune donnee'});
    var r=await db.run('INSERT INTO form_submissions ('+keys.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals);
    var row=await db.get('SELECT * FROM form_submissions WHERE id=$1',[r.lastInsertRowid]);
    res.json({item:row});
  });
  router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req,res){
    var cols=MODULES.form_submissions,sets=[],vals=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+i++); vals.push(normalize(c,req.body[c])); } });
    if(!sets.length) return res.status(400).json({error:'Aucune donnee'});
    vals.push(req.params.id);
    await db.run('UPDATE form_submissions SET '+sets.join(',')+' WHERE id=$'+i,vals);
    var row=await db.get('SELECT * FROM form_submissions WHERE id=$1',[req.params.id]);
    res.json({item:row});
  });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req,res){
    await db.run('DELETE FROM form_submissions WHERE id=$1',[req.params.id]);
    res.json({success:true});
  });

  router.get('/api/admin/:module', requireAdmin, async function(req,res,next){
    var m=req.params.module; if(!MODULES[m]) return next();
    var rows=await db.all('SELECT * FROM '+m+' ORDER BY id DESC');
    res.json({[m]:rows});
  });
  router.post('/api/admin/:module', requireAdmin, async function(req,res,next){
    var m=req.params.module; var cols=MODULES[m]; if(!cols) return next();
    var keys=[],vals=[],ph=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ keys.push(c); vals.push(normalize(c,req.body[c])); ph.push('$'+i++); } });
    if(!keys.length) return res.status(400).json({error:'Aucune donnee'});
    var r=await db.run('INSERT INTO '+m+' ('+keys.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals);
    var row=await db.get('SELECT * FROM '+m+' WHERE id=$1',[r.lastInsertRowid]);
    res.json({item:row});
  });
  router.put('/api/admin/:module/:id', requireAdmin, async function(req,res,next){
    var m=req.params.module; var cols=MODULES[m]; if(!cols) return next();
    var sets=[],vals=[],i=1;
    cols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+i++); vals.push(normalize(c,req.body[c])); } });
    if(!sets.length) return res.status(400).json({error:'Aucune donnee'});
    sets.push('updated_at=NOW()'); vals.push(req.params.id);
    await db.run('UPDATE '+m+' SET '+sets.join(',')+' WHERE id=$'+i, vals);
    var row=await db.get('SELECT * FROM '+m+' WHERE id=$1',[req.params.id]);
    res.json({item:row});
  });
  router.delete('/api/admin/:module/:id', requireAdmin, async function(req,res,next){
    var m=req.params.module; if(!MODULES[m]) return next();
    await db.run('DELETE FROM '+m+' WHERE id=$1',[req.params.id]);
    res.json({success:true});
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
