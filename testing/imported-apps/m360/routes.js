const express = require('express');
module.exports = function(services){
  const router = express.Router();
  const db = services.db;
  const TZ = 'America/Toronto';
  router.use(express.json({ limit: '12mb' }));

  const T = {
    fr: {
      meta_desc: `M360, garage mécanique. Diagnostic honnête et service rapide. Réservez en ligne et consultez nos taux.`,
      nav_home:`Accueil`, nav_services:`Taux et services`, nav_gallery:`Galerie`, nav_news:`Actualités`, nav_contact:`Contact`, nav_booking:`Rendez-vous`,
      status_date_label:`Aujourd'hui`, status_open:`OUVERT`, status_closed:`FERMÉ`, status_next:`Prochaine place`, status_no_next:`À confirmer`, status_book:`Réserver`,
      hero_kicker:`Garage mécanique`, hero_title:`Diagnostic honnête. Service rapide.`, hero_sub:`Vous voyez l'horaire, les taux et la prochaine place libre avant même d'appeler. Un garage rapide n'a rien à cacher.`, hero_cta:`Prendre rendez-vous`, hero_secondary:`Voir les taux`,
      rates_kicker:`Feuille de temps`, rates_title:`Taux et services`, rates_col_service:`Service`, rates_col_rate:`Taux`, rates_col_time:`Durée`, rates_hourly:`/ h`, rates_from:`dès`, rates_quote:`Sur évaluation`, rates_min:`min`, rates_view_all:`Tous les services`, rates_empty:`Les services seront affichés bientôt.`,
      booking_kicker:`3 étapes`, booking_title:`Prenez votre place`, booking_sub:`Aucun paiement en ligne. Vous réglez au garage.`,
      book_step1:`Service`, book_step2:`Date et heure`, book_step3:`Coordonnées`,
      book_pick_service:`Choisissez un service`, book_pick_date:`Choisissez une date`, book_pick_time:`Choisissez une heure`, book_no_slots:`Aucune place libre cette journée. Essayez une autre date.`, book_select_date_first:`Sélectionnez d'abord une date.`, book_loading:`Chargement…`,
      book_name:`Nom complet`, book_phone:`Téléphone`, book_email:`Courriel`, book_vehicle:`Véhicule (marque, modèle, année)`, book_notes:`Décrivez le problème (facultatif)`,
      book_next:`Continuer`, book_back:`Retour`, book_submit:`Confirmer le rendez-vous`, book_sending:`Envoi…`,
      book_success_title:`Place confirmée`, book_success_sub:`Présentez ce laissez-passer à votre arrivée.`, book_pass_ref:`Référence`, book_pass_service:`Service`, book_pass_when:`Quand`, book_pass_name:`Client`, book_another:`Prendre un autre rendez-vous`,
      gallery_kicker:`Nos baies`, gallery_title:`Le garage`, gallery_bay:`Baie`, gallery_view_all:`Voir la galerie`, gallery_empty:`Les photos arrivent bientôt.`,
      why_kicker:`Pourquoi M360`, why_title:`Les chiffres parlent`, stat_delay:`Délai moyen`, stat_delay_unit:`min`, stat_exp:`Ans d'expérience`, stat_exp_unit:`ans`, stat_reviews:`Note clients`, stat_reviews_unit:`/ 5`,
      loc_kicker:`Localisation`, loc_title:`Trouvez le garage`, loc_directions:`Itinéraire`, loc_no_address:`Adresse à venir. Configurez-la dans l'administration.`,
      news_kicker:`Nouvelles`, news_title:`Actualités`, news_read:`Lire`, news_empty:`Aucune actualité pour le moment.`, news_back:`Retour aux actualités`,
      contact_kicker:`Écrivez-nous`, contact_title:`Une question ?`, contact_name:`Nom`, contact_email:`Courriel`, contact_phone:`Téléphone`, contact_message:`Message`, contact_send:`Envoyer le message`, contact_sending:`Envoi…`, contact_success:`Message envoyé. On vous répond vite.`, contact_error:`Envoi impossible. Réessayez.`,
      footer_hours:`Horaire de la semaine`, footer_tagline:`Diagnostic honnête. Service rapide.`, footer_rights:`Tous droits réservés.`, footer_book:`Prendre rendez-vous`,
      push_enable:`Activer les notifications`, form_required:`Champs requis manquants.`, generic_error:`Une erreur est survenue. Réessayez.`,
      days:[`Dimanche`,`Lundi`,`Mardi`,`Mercredi`,`Jeudi`,`Vendredi`,`Samedi`],
      days_short:[`Dim`,`Lun`,`Mar`,`Mer`,`Jeu`,`Ven`,`Sam`],
      months:[`janv.`,`févr.`,`mars`,`avr.`,`mai`,`juin`,`juill.`,`août`,`sept.`,`oct.`,`nov.`,`déc.`]
    },
    en: {
      meta_desc: `M360, mechanic garage. Honest diagnostics and fast service. Book online and check our rates.`,
      nav_home:`Home`, nav_services:`Rates and services`, nav_gallery:`Gallery`, nav_news:`News`, nav_contact:`Contact`, nav_booking:`Book`,
      status_date_label:`Today`, status_open:`OPEN`, status_closed:`CLOSED`, status_next:`Next slot`, status_no_next:`To confirm`, status_book:`Book`,
      hero_kicker:`Mechanic garage`, hero_title:`Honest diagnostics. Fast service.`, hero_sub:`See the hours, the rates and the next open bay before you even call. A fast garage has nothing to hide.`, hero_cta:`Book your slot`, hero_secondary:`See the rates`,
      rates_kicker:`Timing sheet`, rates_title:`Rates and services`, rates_col_service:`Service`, rates_col_rate:`Rate`, rates_col_time:`Time`, rates_hourly:`/ h`, rates_from:`from`, rates_quote:`On assessment`, rates_min:`min`, rates_view_all:`All services`, rates_empty:`Services will appear here soon.`,
      booking_kicker:`3 steps`, booking_title:`Take your slot`, booking_sub:`No online payment. You pay at the garage.`,
      book_step1:`Service`, book_step2:`Date and time`, book_step3:`Your details`,
      book_pick_service:`Choose a service`, book_pick_date:`Choose a date`, book_pick_time:`Choose a time`, book_no_slots:`No open slots that day. Try another date.`, book_select_date_first:`Pick a date first.`, book_loading:`Loading…`,
      book_name:`Full name`, book_phone:`Phone`, book_email:`Email`, book_vehicle:`Vehicle (make, model, year)`, book_notes:`Describe the issue (optional)`,
      book_next:`Continue`, book_back:`Back`, book_submit:`Confirm appointment`, book_sending:`Sending…`,
      book_success_title:`Slot confirmed`, book_success_sub:`Show this pass when you arrive.`, book_pass_ref:`Reference`, book_pass_service:`Service`, book_pass_when:`When`, book_pass_name:`Client`, book_another:`Book another slot`,
      gallery_kicker:`Our bays`, gallery_title:`The garage`, gallery_bay:`Bay`, gallery_view_all:`See the gallery`, gallery_empty:`Photos coming soon.`,
      why_kicker:`Why M360`, why_title:`The numbers talk`, stat_delay:`Average wait`, stat_delay_unit:`min`, stat_exp:`Years of experience`, stat_exp_unit:`yrs`, stat_reviews:`Client rating`, stat_reviews_unit:`/ 5`,
      loc_kicker:`Location`, loc_title:`Find the garage`, loc_directions:`Directions`, loc_no_address:`Address coming soon. Set it in the admin.`,
      news_kicker:`News`, news_title:`News`, news_read:`Read`, news_empty:`No news yet.`, news_back:`Back to news`,
      contact_kicker:`Write to us`, contact_title:`A question?`, contact_name:`Name`, contact_email:`Email`, contact_phone:`Phone`, contact_message:`Message`, contact_send:`Send message`, contact_sending:`Sending…`, contact_success:`Message sent. We reply fast.`, contact_error:`Could not send. Try again.`,
      footer_hours:`Weekly hours`, footer_tagline:`Honest diagnostics. Fast service.`, footer_rights:`All rights reserved.`, footer_book:`Book your slot`,
      push_enable:`Enable notifications`, form_required:`Missing required fields.`, generic_error:`Something went wrong. Try again.`,
      days:[`Sunday`,`Monday`,`Tuesday`,`Wednesday`,`Thursday`,`Friday`,`Saturday`],
      days_short:[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],
      months:[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`]
    }
  };

  const MODULES = [
    { key:'appointments', label:'Rendez-vous', icon:'calendar', fields:[
      { name:'customer_name', type:'text', required:true, description:`Nom du client qui a réservé.`, placeholder:`ex. Jean Tremblay` },
      { name:'appt_date', type:'date', description:`Date du rendez-vous.` },
      { name:'appt_time', type:'time', description:`Heure du rendez-vous (format 24h).` },
      { name:'status', type:'select', options:['pending','confirmed','completed','cancelled'], default:'pending', description:`État: pending = en attente, confirmed = confirmé, completed = terminé, cancelled = annulé.` },
      { name:'service_name', type:'text', description:`Service demandé.`, placeholder:`ex. Changement d'huile` },
      { name:'phone', type:'text', description:`Téléphone du client.`, placeholder:`ex. 514-555-0142` },
      { name:'email', type:'email', description:`Courriel du client.`, placeholder:`ex. jean@courriel.com` },
      { name:'vehicle', type:'text', description:`Véhicule concerné.`, placeholder:`ex. Honda Civic 2018` },
      { name:'notes', type:'textarea', description:`Détails ou problème décrit par le client.`, placeholder:`...` }
    ]},
    { key:'services', label:'Taux et services', icon:'list', fields:[
      { name:'name', type:'text', required:true, maxLength:120, description:`Nom du service affiché dans la feuille de taux.`, placeholder:`ex. Changement d'huile et filtre` },
      { name:'price', type:'number', min:0, step:0.01, description:`Prix en dollars. Laissez vide pour « Sur évaluation ».`, placeholder:`ex. 55` },
      { name:'price_type', type:'select', options:['flat','hourly','from'], default:'flat', description:`flat = prix fixe, hourly = taux horaire, from = à partir de.` },
      { name:'duration_min', type:'number', min:0, step:5, description:`Durée estimée en minutes.`, placeholder:`ex. 45` },
      { name:'description', type:'textarea', description:`Courte description du service.`, placeholder:`ex. Huile synthétique, filtre inclus, inspection visuelle.` },
      { name:'category', type:'text', description:`Catégorie pour regrouper (Entretien, Freins, Diagnostic...).`, placeholder:`ex. Entretien` },
      { name:'image_url', type:'image', description:`Image facultative du service. Recommandé 800×600px.` },
      { name:'featured', type:'boolean', default:false, description:`Cochez pour mettre ce service en vedette.` },
      { name:'sort_order', type:'number', default:0, description:`Ordre d'affichage (plus petit en premier).`, placeholder:`0` },
      { name:'published', type:'boolean', default:true, description:`Décochez pour masquer ce service du site.` }
    ]},
    { key:'gallery', label:'Galerie', icon:'image', fields:[
      { name:'title', type:'text', description:`Titre ou légende de la photo.`, placeholder:`ex. Aire de diagnostic` },
      { name:'bay_number', type:'text', description:`Numéro de baie affiché sur la plaque.`, placeholder:`ex. 3` },
      { name:'equipment', type:'text', description:`Équipement montré sur la photo.`, placeholder:`ex. Pont élévateur 4 tonnes` },
      { name:'image_url', type:'image', required:true, description:`Photo du garage. Recommandé 1200×900px paysage.` },
      { name:'sort_order', type:'number', default:0, description:`Ordre d'affichage.`, placeholder:`0` }
    ]},
    { key:'posts', label:'Actualités', icon:'edit', fields:[
      { name:'title', type:'text', required:true, maxLength:200, description:`Titre de l'actualité.`, placeholder:`ex. Nouveau banc d'alignement` },
      { name:'content', type:'textarea', description:`Texte complet. Sautez une ligne entre les paragraphes.`, placeholder:`Écrivez votre nouvelle ici...` },
      { name:'image_url', type:'image', description:`Image en vedette. Recommandé 1200×630px.` },
      { name:'category', type:'text', description:`Catégorie (Nouvelle, Conseil, Promo).`, placeholder:`ex. Conseil` },
      { name:'published', type:'boolean', default:true, description:`Décochez pour garder en brouillon.` }
    ]},
    { key:'business_hours', label:'Horaire', icon:'clock', fields:[
      { name:'day_of_week', type:'number', min:0, max:6, description:`Jour: 0 = dimanche, 1 = lundi ... 6 = samedi.`, placeholder:`1` },
      { name:'open_time', type:'text', description:`Heure d'ouverture (format 24h HH:MM).`, placeholder:`08:00` },
      { name:'close_time', type:'text', description:`Heure de fermeture (format 24h HH:MM).`, placeholder:`18:00` },
      { name:'closed', type:'boolean', default:false, description:`Cochez si le garage est fermé ce jour.` }
    ]},
    { key:'form_submissions', label:'Messages reçus', icon:'mail', fields:[
      { name:'name', type:'text', description:`Nom de l'expéditeur.`, placeholder:`ex. Jean Tremblay` },
      { name:'email', type:'email', description:`Courriel de l'expéditeur.`, placeholder:`ex. jean@courriel.com` },
      { name:'phone', type:'text', description:`Téléphone de l'expéditeur.`, placeholder:`ex. 514-555-0142` },
      { name:'message', type:'textarea', description:`Contenu du message envoyé via le formulaire de contact.`, placeholder:`...` }
    ]}
  ];

  const SETTINGS_FIELDS = [
    { name:'booking_slot_minutes', type:'number', label:`Durée des créneaux (min)`, description:`Longueur de chaque plage de rendez-vous.` },
    { name:'meta_desc', type:'textarea', label:`Description SEO`, description:`Texte de description pour les moteurs de recherche.` }
  ];

  const TABLES = {
    posts:{ cols:['title','content','image_url','category','published'] },
    services:{ cols:['name','description','price','price_type','duration_min','category','image_url','featured','sort_order','published'] },
    gallery:{ cols:['title','bay_number','equipment','image_url','sort_order'] },
    appointments:{ cols:['customer_name','email','phone','vehicle','service_id','service_name','appt_date','appt_time','notes','status'] },
    business_hours:{ cols:['day_of_week','open_time','close_time','closed'] },
    form_submissions:{ cols:['name','email','phone','message'] }
  };
  const ORDERS = { posts:'created_at DESC', services:'sort_order, id', gallery:'sort_order, id', appointments:'appt_date DESC, appt_time DESC', business_hours:'day_of_week', form_submissions:'created_at DESC' };
  const INTS = ['duration_min','sort_order','day_of_week','service_id'];
  const BOOLS = ['published','featured','closed'];

  function coerce(col,val){
    if(BOOLS.indexOf(col)>=0) return (val===true||val===1||val==='1'||val==='true'||val==='on')?1:0;
    if(col==='price') return (val===''||val==null)?null:Number(val);
    if(INTS.indexOf(col)>=0) return (val===''||val==null)?null:parseInt(val,10);
    return val;
  }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function toMin(hhmm){ if(!hhmm) return null; const p=String(hhmm).split(':'); return parseInt(p[0],10)*60+parseInt(p[1],10); }
  function fromMin(m){ const h=Math.floor(m/60), mm=m%60; return (h<10?'0':'')+h+':'+(mm<10?'0':'')+mm; }
  function ymd(d){ const m=d.getMonth()+1, day=d.getDate(); return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(day<10?'0':'')+day; }
  function parseYmd(s){ const p=String(s).split('-'); return new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10)); }
  function tzNow(){ return new Date(new Date().toLocaleString('en-US',{ timeZone: TZ })); }
  function fmtDate(d,t){ return t.days[d.getDay()]+' '+d.getDate()+' '+t.months[d.getMonth()]; }

  function daySlots(row,dateObj,now,bset,slotMin){
    const out=[];
    if(!row||row.closed==1||!row.open_time||!row.close_time) return out;
    const o=toMin(row.open_time), c=toMin(row.close_time);
    const isToday = ymd(dateObj)===ymd(now);
    const cur = now.getHours()*60+now.getMinutes();
    for(let m=o; m+slotMin<=c; m+=slotMin){
      if(isToday && m<=cur+30) continue;
      const ts=fromMin(m);
      out.push({ time:ts, taken: bset.has(ymd(dateObj)+' '+ts) });
    }
    return out;
  }

  async function getSettings(){
    const o={};
    try{ const rows=await db.all('SELECT key, value FROM admin_settings'); rows.forEach(r=>{ o[r.key]=r.value; }); }catch(e){}
    return o;
  }
  function applyTextOverrides(t, settings, lang){
    for(const k in settings){ if(k.indexOf('text_')===0 && k.slice(-(lang.length+1))==='_'+lang){ const key=k.slice(5, -(lang.length+1)); if(key) t[key]=settings[k]; } }
    return t;
  }
  async function computeStatus(t, hours, slotMin){
    const now=tzNow(); const dow=now.getDay();
    const today=(hours||[]).find(r=>r.day_of_week===dow);
    let open=false, hoursLabel=t.status_closed;
    if(today && today.closed!=1 && today.open_time && today.close_time){
      hoursLabel=today.open_time+' \u2013 '+today.close_time;
      const cur=now.getHours()*60+now.getMinutes();
      open = cur>=toMin(today.open_time) && cur<toMin(today.close_time);
    }
    let nextLabel=t.status_no_next;
    try{
      const booked=await db.all("SELECT appt_date, appt_time FROM appointments WHERE appt_date >= $1 AND status <> 'cancelled'",[ymd(now)]);
      const bset=new Set(booked.map(b=>b.appt_date+' '+b.appt_time));
      for(let dd=0; dd<14; dd++){
        const day=new Date(now.getTime()+dd*86400000);
        const row=(hours||[]).find(r=>r.day_of_week===day.getDay());
        const slots=daySlots(row,day,now,bset,slotMin);
        const free=slots.find(s=>!s.taken);
        if(free){ nextLabel=t.days_short[day.getDay()]+' '+day.getDate()+' \u00b7 '+free.time; break; }
      }
    }catch(e){}
    return { open, dow, dateLabel:fmtDate(now,t), hoursLabel, nextLabel };
  }
  async function baseLocals(req,res){
    let lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if(lang!=='fr' && lang!=='en') lang='fr';
    if(req.query.lang){ try{ res.cookie('pwa_lang', lang, { maxAge: 31536000000 }); }catch(e){} }
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[lang]||T.fr), settings, lang);
    let hours=[]; try{ hours=await db.all('SELECT * FROM business_hours ORDER BY day_of_week'); }catch(e){}
    const slotMin = parseInt(settings.booking_slot_minutes||'60',10)||60;
    const status = await computeStatus(t, hours, slotMin);
    const currentPath = (req.path.charAt(0)==='/') ? req.path.slice(1) : req.path;
    return { lang, t, settings, status, hours, currentPath };
  }

  function formatNum(n){ n=Number(n); return Number.isInteger(n)? String(n) : n.toFixed(2); }
  function formatServicePrice(s,t){
    if(s.price===null||s.price===undefined||s.price==='') return t.rates_quote;
    let base=formatNum(s.price)+' $';
    if(s.price_type==='hourly') base=base+' '+t.rates_hourly;
    else if(s.price_type==='from') base=t.rates_from+' '+base;
    return base;
  }

  (async function init(){
    try{
      const d={ business_name: (services.config.businessName||services.config.displayName||'M360'), contact_email: (services.config.contactEmail||''), contact_phone: (services.config.contactPhone||''), business_address: (services.config.businessAddress||'') };
      for(const k in d){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[k, d[k]||'']); }
    }catch(e){}
  })();

  router.use(async function(req,res,next){
    if(req.method==='GET' && req.path.indexOf('/api')!==0 && req.path.indexOf('/admin')!==0 && req.path.indexOf('.')<0){
      try{ await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); }catch(e){}
    }
    next();
  });

  function requireAdmin(req,res,next){ if(!services.admin || !services.admin.isAdmin(req)) return res.status(403).json({ error:'Accès refusé' }); next(); }
  function pageAdmin(req,res,next){ if(!services.admin || !services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/')); next(); }

  router.get('/', async function(req,res){
    try{
      const base=await baseLocals(req,res);
      const svcs=await db.all("SELECT * FROM services WHERE published=1 ORDER BY sort_order, id");
      const gallery=await db.all("SELECT * FROM gallery ORDER BY sort_order, id LIMIT 6");
      const posts=await db.all("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3");
      res.render('index', Object.assign(base,{ page:'home', svcs, gallery, posts, formatServicePrice, googleApiKey: services.google.mapsApiKey }));
    }catch(e){ console.error(e); res.status(500).send('Erreur'); }
  });
  router.get('/services', async function(req,res){
    try{
      const base=await baseLocals(req,res);
      const svcs=await db.all("SELECT * FROM services WHERE published=1 ORDER BY sort_order, id");
      res.render('services', Object.assign(base,{ page:'services', svcs, formatServicePrice }));
    }catch(e){ console.error(e); res.status(500).send('Erreur'); }
  });
  router.get('/galerie', async function(req,res){
    try{
      const base=await baseLocals(req,res);
      const gallery=await db.all("SELECT * FROM gallery ORDER BY sort_order, id");
      res.render('galerie', Object.assign(base,{ page:'gallery', gallery }));
    }catch(e){ console.error(e); res.status(500).send('Erreur'); }
  });
  router.get('/rendez-vous', async function(req,res){
    try{
      const base=await baseLocals(req,res);
      const svcs=await db.all("SELECT * FROM services WHERE published=1 ORDER BY sort_order, id");
      res.render('rendez-vous', Object.assign(base,{ page:'booking', svcs, formatServicePrice }));
    }catch(e){ console.error(e); res.status(500).send('Erreur'); }
  });
  router.get('/actualites', async function(req,res){
    try{
      const base=await baseLocals(req,res);
      const posts=await db.all("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC");
      res.render('actualites', Object.assign(base,{ page:'news', posts }));
    }catch(e){ console.error(e); res.status(500).send('Erreur'); }
  });
  router.get('/actualites/:id', async function(req,res){
    try{
      const base=await baseLocals(req,res);
      const post=await db.get("SELECT * FROM posts WHERE id=$1 AND published=1",[req.params.id]);
      res.render('article', Object.assign(base,{ page:'news', post }));
    }catch(e){ console.error(e); res.status(500).send('Erreur'); }
  });
  router.get('/contact', async function(req,res){
    try{
      const base=await baseLocals(req,res);
      res.render('contact', Object.assign(base,{ page:'contact', googleApiKey: services.google.mapsApiKey }));
    }catch(e){ console.error(e); res.status(500).send('Erreur'); }
  });

  router.get('/api/availability', async function(req,res){
    try{
      const date=req.query.date; if(!date) return res.json({ slots:[] });
      const settings=await getSettings();
      const slotMin=parseInt(settings.booking_slot_minutes||'60',10)||60;
      const now=tzNow(); const dateObj=parseYmd(date);
      const hours=await db.all('SELECT * FROM business_hours ORDER BY day_of_week');
      const row=hours.find(r=>r.day_of_week===dateObj.getDay());
      const booked=await db.all("SELECT appt_time FROM appointments WHERE appt_date=$1 AND status <> 'cancelled'",[date]);
      const bset=new Set(booked.map(b=>date+' '+b.appt_time));
      const slots=daySlots(row,dateObj,now,bset,slotMin).filter(s=>!s.taken).map(s=>s.time);
      res.json({ slots });
    }catch(e){ console.error(e); res.json({ slots:[] }); }
  });

  router.post('/api/appointments', async function(req,res){
    try{
      const b=req.body||{};
      const name=(b.customer_name||'').trim();
      const phone=(b.phone||'').trim(), email=(b.email||'').trim();
      if(!name || (!phone && !email) || !b.appt_date || !b.appt_time) return res.status(400).json({ error:'missing' });
      let serviceName=''; let serviceId=null;
      if(b.service_id){ serviceId=parseInt(b.service_id,10)||null; if(serviceId){ const s=await db.get('SELECT name FROM services WHERE id=$1',[serviceId]); if(s) serviceName=s.name; } }
      const exists=await db.get("SELECT id FROM appointments WHERE appt_date=$1 AND appt_time=$2 AND status <> 'cancelled'",[b.appt_date,b.appt_time]);
      if(exists) return res.status(409).json({ error:'taken' });
      const r=await db.run("INSERT INTO appointments (customer_name,email,phone,vehicle,service_id,service_name,appt_date,appt_time,notes,status,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',NOW(),NOW()) RETURNING id",[name,email,phone,(b.vehicle||''),serviceId,serviceName,b.appt_date,b.appt_time,(b.notes||'')]);
      const id=r.lastInsertRowid;
      const ref='M360-'+String(1000+Number(id));
      try{
        if(services.config.contactEmail){
          const html='<p>Nouveau rendez-vous M360</p><ul><li>Client: '+esc(name)+'</li><li>Telephone: '+esc(phone)+'</li><li>Courriel: '+esc(email)+'</li><li>Vehicule: '+esc(b.vehicle||'')+'</li><li>Service: '+esc(serviceName)+'</li><li>Date: '+esc(b.appt_date)+' '+esc(b.appt_time)+'</li><li>Note: '+esc(b.notes||'')+'</li></ul>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau rendez-vous - '+name, html: html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      }catch(mailErr){ console.error('mail', mailErr.message); }
      res.json({ success:true, ref, id, service:serviceName, date:b.appt_date, time:b.appt_time, name });
    }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });

  router.post('/api/contact', async function(req,res){
    try{
      const b=req.body||{};
      const name=(b.name||'').trim(), message=(b.message||'').trim();
      if(!name || !message) return res.status(400).json({ error:'missing' });
      await db.run('INSERT INTO form_submissions (name,email,phone,message,created_at) VALUES ($1,$2,$3,$4,NOW())',[name,(b.email||''),(b.phone||''),message]);
      try{
        if(services.config.contactEmail){
          const html='<p>Nouveau message M360</p><ul><li>Nom: '+esc(name)+'</li><li>Courriel: '+esc(b.email||'')+'</li><li>Telephone: '+esc(b.phone||'')+'</li></ul><p>'+esc(message)+'</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message - '+name, html: html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      }catch(mailErr){ console.error('mail', mailErr.message); }
      res.json({ success:true });
    }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });

  router.get('/admin', pageAdmin, async function(req,res){
if(!services.admin.isAdmin(req))return res.redirect(req.tenantPath('/admin/login'));
    try{
      const stats={};
      const q=async(sql)=>{ try{ const r=await db.get(sql); return Number(r.c)||0; }catch(e){ return 0; } };
      stats.visitsTotal=await q("SELECT COUNT(*) c FROM site_visits");
      stats.visits7=await q("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      stats.appointments=await q("SELECT COUNT(*) c FROM appointments");
      stats.pending=await q("SELECT COUNT(*) c FROM appointments WHERE status='pending'");
      stats.services=await q("SELECT COUNT(*) c FROM services");
      stats.gallery=await q("SELECT COUNT(*) c FROM gallery");
      stats.submissions=await q("SELECT COUNT(*) c FROM form_submissions");
      let push=0; try{ push=await services.push.getSubscriptionCount(); }catch(e){}
      stats.push=push;
      const recent=await db.all("SELECT * FROM appointments ORDER BY created_at DESC LIMIT 8");
      res.render('admin', { stats, recent, active:'dash' });
    }catch(e){ console.error(e); res.status(500).send('Erreur'); }
  });
  router.get('/admin/appointments', pageAdmin, function(req,res){ res.render('admin-appointments'); });
  router.get('/admin/services', pageAdmin, function(req,res){ res.render('admin-services'); });
  router.get('/admin/gallery', pageAdmin, function(req,res){ res.render('admin-gallery'); });
  router.get('/admin/posts', pageAdmin, function(req,res){ res.render('admin-posts'); });
  router.get('/admin/hours', pageAdmin, function(req,res){ res.render('admin-hours', { active:'hours' }); });
  router.get('/admin/settings', pageAdmin, function(req,res){ res.render('admin-settings', { active:'settings' }); });
  router.get('/admin/messages', pageAdmin, function(req,res){ res.render('admin-messages', { active:'messages' }); });

  router.get('/api/admin/stats', requireAdmin, async function(req,res){
    try{
      const q=async(sql)=>{ try{ const r=await db.get(sql); return Number(r.c)||0; }catch(e){ return 0; } };
      let push=0; try{ push=await services.push.getSubscriptionCount(); }catch(e){}
      res.json({ totalVisits:await q("SELECT COUNT(*) c FROM site_visits"), recentVisits:await q("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"), appointments:await q("SELECT COUNT(*) c FROM appointments"), pushSubscriberCount:push, userCount:0 });
    }catch(e){ res.status(500).json({ error:'stats' }); }
  });
  router.get('/api/admin/submissions', requireAdmin, async function(req,res){
    try{ const rows=await db.all("SELECT * FROM form_submissions ORDER BY created_at DESC"); res.json({ submissions:rows }); }catch(e){ res.status(500).json({ error:'x' }); }
  });
  router.get('/api/admin/modules', requireAdmin, function(req,res){ res.json({ modules: MODULES, settingsFields: SETTINGS_FIELDS }); });
  router.get('/api/admin/settings', requireAdmin, async function(req,res){ res.json(await getSettings()); });
  router.put('/api/admin/settings', requireAdmin, async function(req,res){
    try{ const b=req.body||{}; const key=b.key; const value=b.value; if(!key) return res.status(400).json({ error:'key' }); await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[key, value==null?'':String(value)]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/upload-image', requireAdmin, async function(req,res){
    try{
      if(!(services.cloudinary && services.cloudinary.uploader && typeof services.cloudinary.uploader.upload==='function')) return res.status(503).json({ error:'Téléversement indisponible' });
      const dataUri=(req.body||{}).dataUri; if(!dataUri) return res.status(400).json({ error:'no image' });
      const r=await services.cloudinary.uploader.upload(dataUri, { folder:'m360' });
      res.json({ url:r.secure_url });
    }catch(e){ console.error(e); res.status(500).json({ error:'Téléversement échoué' }); }
  });
  router.post('/api/admin/generate-image', requireAdmin, async function(req,res){
    try{ const b=req.body||{}; const prompt=b.prompt; const aspectRatio=b.aspectRatio; if(!prompt) return res.status(400).json({ error:'prompt' }); const url=await services.ai.generateImage(prompt, { aspectRatio: aspectRatio||'4:3' }); res.json({ imageUrl:url }); }catch(e){ console.error(e); res.status(500).json({ error:'Génération échouée. Téléversez manuellement.' }); }
  });

  // Explicit CRUD routes for each table (required for admin module discovery)
  router.get('/api/admin/posts', requireAdmin, async function(req,res){
    try{ const rows=await db.all('SELECT * FROM posts ORDER BY '+ORDERS.posts); res.json({ posts: rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req,res){
    try{ const use=TABLES.posts.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); const ph=use.map(function(c,i){ return '$'+(i+1); }); const row=await db.get('INSERT INTO posts ('+use.join(',')+',created_at,updated_at) VALUES ('+ph.join(',')+',NOW(),NOW()) RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req,res){
    try{ const use=TABLES.posts.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const set=use.map(function(c,i){ return c+'=$'+(i+1); }).join(', '); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); vals.push(req.params.id); const row=await db.get('UPDATE posts SET '+set+', updated_at=NOW() WHERE id=$'+(use.length+1)+' RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });

  router.get('/api/admin/services', requireAdmin, async function(req,res){
    try{ const rows=await db.all('SELECT * FROM services ORDER BY '+ORDERS.services); res.json({ services: rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/services', requireAdmin, async function(req,res){
    try{ const use=TABLES.services.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); const ph=use.map(function(c,i){ return '$'+(i+1); }); const row=await db.get('INSERT INTO services ('+use.join(',')+',created_at,updated_at) VALUES ('+ph.join(',')+',NOW(),NOW()) RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/services/:id', requireAdmin, async function(req,res){
    try{ const use=TABLES.services.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const set=use.map(function(c,i){ return c+'=$'+(i+1); }).join(', '); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); vals.push(req.params.id); const row=await db.get('UPDATE services SET '+set+', updated_at=NOW() WHERE id=$'+(use.length+1)+' RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM services WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });

  router.get('/api/admin/gallery', requireAdmin, async function(req,res){
    try{ const rows=await db.all('SELECT * FROM gallery ORDER BY '+ORDERS.gallery); res.json({ gallery: rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/gallery', requireAdmin, async function(req,res){
    try{ const use=TABLES.gallery.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); const ph=use.map(function(c,i){ return '$'+(i+1); }); const row=await db.get('INSERT INTO gallery ('+use.join(',')+',created_at,updated_at) VALUES ('+ph.join(',')+',NOW(),NOW()) RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/gallery/:id', requireAdmin, async function(req,res){
    try{ const use=TABLES.gallery.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const set=use.map(function(c,i){ return c+'=$'+(i+1); }).join(', '); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); vals.push(req.params.id); const row=await db.get('UPDATE gallery SET '+set+', updated_at=NOW() WHERE id=$'+(use.length+1)+' RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/gallery/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM gallery WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });

  router.get('/api/admin/appointments', requireAdmin, async function(req,res){
    try{ const rows=await db.all('SELECT * FROM appointments ORDER BY '+ORDERS.appointments); res.json({ appointments: rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/appointments', requireAdmin, async function(req,res){
    try{ const use=TABLES.appointments.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); const ph=use.map(function(c,i){ return '$'+(i+1); }); const row=await db.get('INSERT INTO appointments ('+use.join(',')+',created_at,updated_at) VALUES ('+ph.join(',')+',NOW(),NOW()) RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/appointments/:id', requireAdmin, async function(req,res){
    try{ const use=TABLES.appointments.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const set=use.map(function(c,i){ return c+'=$'+(i+1); }).join(', '); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); vals.push(req.params.id); const row=await db.get('UPDATE appointments SET '+set+', updated_at=NOW() WHERE id=$'+(use.length+1)+' RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/appointments/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM appointments WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });

  router.get('/api/admin/business_hours', requireAdmin, async function(req,res){
    try{ const rows=await db.all('SELECT * FROM business_hours ORDER BY '+ORDERS.business_hours); res.json({ business_hours: rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/business_hours', requireAdmin, async function(req,res){
    try{ const use=TABLES.business_hours.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); const ph=use.map(function(c,i){ return '$'+(i+1); }); const row=await db.get('INSERT INTO business_hours ('+use.join(',')+',created_at,updated_at) VALUES ('+ph.join(',')+',NOW(),NOW()) RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/business_hours/:id', requireAdmin, async function(req,res){
    try{ const use=TABLES.business_hours.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const set=use.map(function(c,i){ return c+'=$'+(i+1); }).join(', '); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); vals.push(req.params.id); const row=await db.get('UPDATE business_hours SET '+set+', updated_at=NOW() WHERE id=$'+(use.length+1)+' RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/business_hours/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM business_hours WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });

  router.get('/api/admin/form_submissions', requireAdmin, async function(req,res){
    try{ const rows=await db.all('SELECT * FROM form_submissions ORDER BY '+ORDERS.form_submissions); res.json({ form_submissions: rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/form_submissions', requireAdmin, async function(req,res){
    try{ const use=TABLES.form_submissions.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); const ph=use.map(function(c,i){ return '$'+(i+1); }); const row=await db.get('INSERT INTO form_submissions ('+use.join(',')+',created_at) VALUES ('+ph.join(',')+',NOW()) RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req,res){
    try{ const use=TABLES.form_submissions.cols.filter(function(c){ return req.body[c]!==undefined; }); if(!use.length) return res.status(400).json({ error:'no fields' }); const set=use.map(function(c,i){ return c+'=$'+(i+1); }).join(', '); const vals=use.map(function(c){ return coerce(c,req.body[c]); }); vals.push(req.params.id); const row=await db.get('UPDATE form_submissions SET '+set+' WHERE id=$'+(use.length+1)+' RETURNING *',vals); res.json({ item:row }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req,res){
    try{ await db.run('DELETE FROM form_submissions WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });

  router.get('/api/admin/:table', requireAdmin, async function(req,res){
    const table=req.params.table; if(!TABLES[table]) return res.status(404).json({ error:'unknown' });
    try{ const rows=await db.all('SELECT * FROM '+table+' ORDER BY '+(ORDERS[table]||'id')); res.json({ [table]: rows }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.post('/api/admin/:table', requireAdmin, async function(req,res){
    const table=req.params.table; if(!TABLES[table]) return res.status(404).json({ error:'unknown' });
    try{
      const use=TABLES[table].cols.filter(function(c){ return req.body[c]!==undefined; });
      if(!use.length) return res.status(400).json({ error:'no fields' });
      const vals=use.map(function(c){ return coerce(c,req.body[c]); });
      const ph=use.map(function(c,i){ return '$'+(i+1); });
      const sql='INSERT INTO '+table+' ('+use.join(',')+',created_at,updated_at) VALUES ('+ph.join(',')+',NOW(),NOW()) RETURNING *';
      const row=await db.get(sql,vals);
      res.json({ item:row });
    }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.put('/api/admin/:table/:id', requireAdmin, async function(req,res){
    const table=req.params.table; if(!TABLES[table]) return res.status(404).json({ error:'unknown' });
    try{
      const use=TABLES[table].cols.filter(function(c){ return req.body[c]!==undefined; });
      if(!use.length) return res.status(400).json({ error:'no fields' });
      const set=use.map(function(c,i){ return c+'=$'+(i+1); }).join(', ');
      const vals=use.map(function(c){ return coerce(c,req.body[c]); }); vals.push(req.params.id);
      const sql='UPDATE '+table+' SET '+set+', updated_at=NOW() WHERE id=$'+(use.length+1)+' RETURNING *';
      const row=await db.get(sql,vals);
      res.json({ item:row });
    }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });
  router.delete('/api/admin/:table/:id', requireAdmin, async function(req,res){
    const table=req.params.table; if(!TABLES[table]) return res.status(404).json({ error:'unknown' });
    try{ await db.run('DELETE FROM '+table+' WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'server' }); }
  });

  router.use(function(req,res){ if(req.method==='GET' && req.path.indexOf('/api')!==0) return res.redirect('.'); res.status(404).json({ error:'not found' }); });
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
