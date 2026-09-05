module.exports = function(services){
const router = require('express').Router();
const db = services.db;

const T = {
fr:{
nav_home:`Accueil`,nav_book:`Réserver`,nav_account:`Mon compte`,nav_login:`Connexion`,
footer_powered:`Propulsé par Garage Buzz`,footer_legal:`Mentions légales`,footer_notify:`Notifications`,
hero_h1:`Votre visite, écrite avant d'arriver.`,hero_sub:`Entrez votre véhicule, choisissez les travaux, réservez l'heure. Votre fiche se remplit à mesure — et vous la retrouverez plus tard avec la facture.`,
hero_make:`Marque`,hero_model:`Modèle`,hero_year:`Année`,hero_start:`Commencer`,hero_note:`Aucun paiement en ligne. Vous payez au garage.`,
docket_title:`Fiche de travail`,dl_vehicle:`Véhicule`,dl_work:`Travaux`,dl_appt:`Rendez-vous`,dl_dropoff:`Dépôt`,dl_time:`Temps estimé`,docket_hint:`Votre fiche se remplit à mesure que vous réservez.`,docket_pending:`En attente`,
how_eyebrow:`Comment ça marche`,how_title:`Quatre étapes. Rien de plus.`,
how1_t:`Véhicule`,how1_d:`Marque, modèle et année inscrits sur la fiche.`,
how2_t:`Symptômes ou entretien`,how2_d:`Les travaux exacts que vous demandez, en toutes lettres.`,
how3_t:`Date et heure`,how3_d:`Votre plage confirmée, sans appel téléphonique.`,
how4_t:`Dépôt des clés`,how4_d:`Comment la voiture nous parvient le jour venu.`,
routine_eyebrow:`Entretien courant`,routine_title:`Durées connues d'avance.`,routine_book:`Réserver`,routine_empty:`Aucun service pour l'instant.`,
trans_eyebrow:`Transparence`,trans_title:`La même fiche, du rendez-vous à la facture.`,trans_sub:`Chaque visite reste écrite. Vous revoyez les travaux passés, l'historique du véhicule et les factures — au même endroit.`,
trans_b1:`Historique d'entretien`,trans_b2:`Travaux passés`,trans_b3:`Factures`,
sample_ref:`GB-4KD2P`,sample_vehicle:`2018 Honda Civic · GAB 204`,sample_work:`Vidange · Freins avant · Inspection`,sample_appt:`Jeu. 14 mars · 09:00`,sample_time:`1 h 30`,sample_bill_label:`Facture`,sample_bill:`245 $`,sample_paid:`Payé au garage`,
pay_band:`Vous payez au garage, une fois la voiture prête. Rien en ligne.`,
garage_eyebrow:`Le garage`,garage_title:`Où nous trouver`,garage_hours:`Heures`,garage_call:`Appeler`,closed:`Fermé`,
day_mon:`Lundi`,day_tue:`Mardi`,day_wed:`Mercredi`,day_thu:`Jeudi`,day_fri:`Vendredi`,day_sat:`Samedi`,day_sun:`Dimanche`,
faq_eyebrow:`Questions`,faq_title:`Bon à savoir`,faq_empty:`Aucune question pour l'instant.`,
book_h:`Réserver un rendez-vous`,step_of:`Étape`,
s1_t:`Véhicule`,s2_t:`Travaux`,s3_t:`Rendez-vous`,s4_t:`Dépôt`,s5_t:`Vérification`,
v_make:`Marque`,v_model:`Modèle`,v_year:`Année`,v_plate:`Plaque`,v_vin:`NIV`,v_optional:`facultatif`,
tab_sym:`Symptômes`,tab_ent:`Entretien`,sym_note:`Dans vos mots`,sym_note_ph:`Décrivez ce que vous remarquez…`,
cat_freins:`Freins`,cat_moteur:`Moteur`,cat_electrique:`Électrique`,cat_pneus:`Pneus`,cat_bruits:`Bruits`,
appt_date_h:`Choisir une date`,appt_time_h:`Heures libres`,appt_closed_note:`Les jours fermés sont barrés.`,no_time:`Choisissez d'abord une date.`,
dropoff_wait_t:`J'attends sur place`,dropoff_wait_d:`Vous patientez pendant les travaux.`,
dropoff_leave_t:`Je laisse la voiture`,dropoff_leave_d:`Vous déposez le matin, récupérez plus tard.`,
dropoff_keybox_t:`Boîte à clés`,dropoff_keybox_d:`Dépôt la veille dans la boîte sécurisée.`,
dropoff_early_t:`Dépôt tôt le matin`,dropoff_early_d:`Avant l'ouverture, clés dans la boîte.`,
verify_h:`Vos coordonnées`,v_name:`Nom`,v_phone:`Téléphone`,v_email:`Courriel`,
next:`Continuer`,back:`Retour`,confirm:`Confirmer le rendez-vous`,login_confirm:`Connectez-vous pour confirmer votre rendez-vous.`,
confirm_h:`Rendez-vous confirmé`,confirm_sub:`Votre fiche est ouverte. Nous vous attendons.`,confirm_ref_l:`Référence`,print:`Imprimer`,add_cal:`Ajouter au calendrier`,confirm_pay:`Rien à payer en ligne — le règlement se fait au garage.`,go_account:`Voir mon compte`,
need_vehicle:`Entrez au moins la marque.`,need_work:`Choisissez au moins un travail ou décrivez le problème.`,need_appt:`Choisissez une date et une heure.`,need_dropoff:`Choisissez comment la voiture nous parvient.`,err_book:`La réservation a échoué. Réessayez.`,
acct_h:`Mon compte`,acct_login:`Connectez-vous pour voir vos véhicules, vos rendez-vous et vos factures.`,
acct_vehicles:`Véhicules`,no_vehicles:`Aucun véhicule enregistré. Il s'ajoutera à votre première réservation.`,
acct_upcoming:`À venir`,no_upcoming:`Aucun rendez-vous à venir.`,modify:`Nouveau rendez-vous`,cancel:`Annuler`,cancel_confirm:`Annuler ce rendez-vous ?`,
acct_history:`Historique`,no_history:`Aucune visite passée pour l'instant.`,all_vehicles:`Tous`,
bill_l:`Facture`,paid_at:`Payé au garage`,to_pay:`À payer au garage`,
st_pending:`En attente`,st_confirmed:`Confirmé`,st_completed:`Terminé`,st_cancelled:`Annulé`
},
en:{
nav_home:`Home`,nav_book:`Book`,nav_account:`My account`,nav_login:`Log in`,
footer_powered:`Powered by Garage Buzz`,footer_legal:`Legal`,footer_notify:`Notifications`,
hero_h1:`Your visit, written before you arrive.`,hero_sub:`Enter your vehicle, choose the work, book the time. Your work order fills in as you go — and you'll find it later with the bill.`,
hero_make:`Make`,hero_model:`Model`,hero_year:`Year`,hero_start:`Start`,hero_note:`No online payment. You pay at the garage.`,
docket_title:`Work order`,dl_vehicle:`Vehicle`,dl_work:`Work`,dl_appt:`Appointment`,dl_dropoff:`Drop-off`,dl_time:`Est. time`,docket_hint:`Your work order fills in as you book.`,docket_pending:`Pending`,
how_eyebrow:`How it works`,how_title:`Four steps. Nothing more.`,
how1_t:`Vehicle`,how1_d:`Make, model and year written on the order.`,
how2_t:`Symptoms or service`,how2_d:`The exact work you ask for, spelled out.`,
how3_t:`Date and time`,how3_d:`Your confirmed slot, no phone call.`,
how4_t:`Key drop-off`,how4_d:`How the car reaches us on the day.`,
routine_eyebrow:`Routine service`,routine_title:`Durations known upfront.`,routine_book:`Book`,routine_empty:`No services yet.`,
trans_eyebrow:`Transparency`,trans_title:`The same sheet, from booking to bill.`,trans_sub:`Every visit stays written down. You review past work, the vehicle's history and invoices — all in one place.`,
trans_b1:`Service history`,trans_b2:`Past work`,trans_b3:`Invoices`,
sample_ref:`GB-4KD2P`,sample_vehicle:`2018 Honda Civic · GAB 204`,sample_work:`Oil change · Front brakes · Inspection`,sample_appt:`Thu Mar 14 · 09:00`,sample_time:`1 h 30`,sample_bill_label:`Invoice`,sample_bill:`$245`,sample_paid:`Paid at garage`,
pay_band:`You pay at the garage, once the car is ready. Nothing online.`,
garage_eyebrow:`The garage`,garage_title:`Where to find us`,garage_hours:`Hours`,garage_call:`Call`,closed:`Closed`,
day_mon:`Monday`,day_tue:`Tuesday`,day_wed:`Wednesday`,day_thu:`Thursday`,day_fri:`Friday`,day_sat:`Saturday`,day_sun:`Sunday`,
faq_eyebrow:`Questions`,faq_title:`Good to know`,faq_empty:`No questions yet.`,
book_h:`Book an appointment`,step_of:`Step`,
s1_t:`Vehicle`,s2_t:`Work`,s3_t:`Appointment`,s4_t:`Drop-off`,s5_t:`Review`,
v_make:`Make`,v_model:`Model`,v_year:`Year`,v_plate:`Plate`,v_vin:`VIN`,v_optional:`optional`,
tab_sym:`Symptoms`,tab_ent:`Service`,sym_note:`In your words`,sym_note_ph:`Describe what you notice…`,
cat_freins:`Brakes`,cat_moteur:`Engine`,cat_electrique:`Electrical`,cat_pneus:`Tires`,cat_bruits:`Noises`,
appt_date_h:`Pick a date`,appt_time_h:`Open times`,appt_closed_note:`Closed days are struck through.`,no_time:`Pick a date first.`,
dropoff_wait_t:`I wait on site`,dropoff_wait_d:`You wait while we work.`,
dropoff_leave_t:`I leave the car`,dropoff_leave_d:`Drop in the morning, pick up later.`,
dropoff_keybox_t:`Key box`,dropoff_keybox_d:`Drop the night before in the secure box.`,
dropoff_early_t:`Early morning drop`,dropoff_early_d:`Before opening, keys in the box.`,
verify_h:`Your details`,v_name:`Name`,v_phone:`Phone`,v_email:`Email`,
next:`Continue`,back:`Back`,confirm:`Confirm appointment`,login_confirm:`Log in to confirm your appointment.`,
confirm_h:`Appointment confirmed`,confirm_sub:`Your order is open. We'll be expecting you.`,confirm_ref_l:`Reference`,print:`Print`,add_cal:`Add to calendar`,confirm_pay:`Nothing to pay online — settle up at the garage.`,go_account:`View my account`,
need_vehicle:`Enter at least the make.`,need_work:`Pick at least one job or describe the issue.`,need_appt:`Pick a date and time.`,need_dropoff:`Choose how the car reaches us.`,err_book:`Booking failed. Please try again.`,
acct_h:`My account`,acct_login:`Log in to see your vehicles, appointments and invoices.`,
acct_vehicles:`Vehicles`,no_vehicles:`No vehicle saved yet. It's added on your first booking.`,
acct_upcoming:`Upcoming`,no_upcoming:`No upcoming appointments.`,modify:`New booking`,cancel:`Cancel`,cancel_confirm:`Cancel this appointment?`,
acct_history:`History`,no_history:`No past visits yet.`,all_vehicles:`All`,
bill_l:`Invoice`,paid_at:`Paid at garage`,to_pay:`Pay at garage`,
st_pending:`Pending`,st_confirmed:`Confirmed`,st_completed:`Completed`,st_cancelled:`Cancelled`
}
};

function applyTextOverrides(t, settings, lang){
for (var k in settings){ if(k.indexOf('text_')===0 && k.slice(-(lang.length+1))==='_'+lang){ var tk=k.slice(5, -(lang.length+1)); if(tk) t[tk]=settings[k]; } }
return t;
}
function formatPrice(v,lang){ if(v===null||v===undefined||v==='') return ''; return (lang==='en')?('$'+v):(v+' $'); }
function formatDuration(min,lang){ min=parseInt(min,10)||0; if(!min) return '—'; var h=Math.floor(min/60),m=min%60,o=''; if(h)o+=h+' h'; if(m)o+=(o?' ':'')+m+' min'; return o; }
function formatDate(s,lang){ if(!s) return ''; var str=String(s); var d=new Date(str.length<=10?str+'T00:00:00':str); if(isNaN(d.getTime())) return str; return d.toLocaleDateString(lang==='en'?'en-CA':'fr-CA',{weekday:'short',day:'numeric',month:'short',year:'numeric'}); }
function genRef(){ var c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',s=''; for(var i=0;i<5;i++) s+=c[services.crypto.randomInt(0,c.length)]; return 'GB-'+s; }
function requireAdmin(req,res,next){ if(!services.admin.isAdmin(req)) return res.status(403).json({error:'Forbidden'}); next(); }

async function getSettings(){
var o={};
try{ var rows=await db.all('SELECT key,value FROM admin_settings'); rows.forEach(function(r){ o[r.key]=r.value; }); }catch(e){}
o.garage_name = o.garage_name || services.config.businessName || services.config.displayName || 'Dory Garage';
o.garage_phone = o.garage_phone || services.config.contactPhone || '';
o.garage_address = o.garage_address || services.config.businessAddress || '';
o.contact_email = o.contact_email || services.config.contactEmail || '';
return o;
}
async function ensureDefaults(){
try{
var rows=await db.all('SELECT key FROM admin_settings'); var have={}; rows.forEach(function(r){ have[r.key]=1; });
async function s(k,v){ if(!have[k] && v) await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[k,v]); }
await s('garage_name', services.config.businessName||services.config.displayName||'Dory Garage');
await s('garage_phone', services.config.contactPhone||'');
await s('garage_address', services.config.businessAddress||'');
await s('contact_email', services.config.contactEmail||'');
}catch(e){}
}
ensureDefaults();

router.use(function(req,res,next){
var lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
if(lang!=='fr' && lang!=='en') lang='fr';
if(req.query.lang){ try{ res.cookie('pwa_lang', lang, {maxAge:31536000000}); }catch(e){} }
req.lang=lang;
next();
});
router.use(async function(req,res,next){
if(req.method==='GET' && req.path.indexOf('/api/admin')!==0 && req.path.indexOf('.')===-1){ try{ await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); }catch(e){} }
next();
});

router.get('/', async function(req,res){
try{
var settings=await getSettings();
var t=applyTextOverrides(Object.assign({},T[req.lang]||T.fr),settings,req.lang);
var servicesList=await db.all('SELECT * FROM services WHERE published=1 ORDER BY sort_order ASC, id ASC');
var faqs=await db.all('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC');
res.render('index',{lang:req.lang,t,settings,servicesList,faqs,formatDuration});
}catch(e){ res.status(500).send('Error'); }
});

router.get('/book', services.auth.optionalAuth, async function(req,res){
try{
var settings=await getSettings();
var t=applyTextOverrides(Object.assign({},T[req.lang]||T.fr),settings,req.lang);
var servicesList=await db.all('SELECT * FROM services WHERE published=1 ORDER BY sort_order ASC, id ASC');
var syms=await db.all('SELECT * FROM symptoms ORDER BY category ASC, sort_order ASC, id ASC');
var cats=['freins','moteur','electrique','pneus','bruits']; var grouped={}; cats.forEach(function(c){grouped[c]=[];});
syms.forEach(function(sy){ if(!grouped[sy.category]) grouped[sy.category]=[]; grouped[sy.category].push(sy); });
var map={hours_sun:0,hours_mon:1,hours_tue:2,hours_wed:3,hours_thu:4,hours_fri:5,hours_sat:6}; var closedDays=[];
Object.keys(map).forEach(function(k){ if(!settings[k] || String(settings[k]).trim()==='') closedDays.push(map[k]); });
var prefill={make:req.query.make||'',model:req.query.model||'',year:req.query.year||''};
res.render('book',{lang:req.lang,t,settings,servicesList,grouped,cats,closedDays,prefill,user:req.user||null,formatDuration});
}catch(e){ res.status(500).send('Error'); }
});

router.get('/account', services.auth.optionalAuth, async function(req,res){
try{
var settings=await getSettings();
var t=applyTextOverrides(Object.assign({},T[req.lang]||T.fr),settings,req.lang);
var vehicles=[],upcoming=[],history=[];
if(req.user){
vehicles=await db.all('SELECT * FROM vehicles WHERE user_id=$1 ORDER BY updated_at DESC',[req.user.id]);
var all=await db.all('SELECT * FROM bookings WHERE user_id=$1 ORDER BY created_at DESC',[req.user.id]);
upcoming=all.filter(function(x){return x.status==='pending'||x.status==='confirmed';});
history=all.filter(function(x){return x.status==='completed'||x.status==='cancelled';});
}
res.render('account',{lang:req.lang,t,settings,user:req.user||null,vehicles,upcoming,history,formatPrice,formatDuration,formatDate});
}catch(e){ res.status(500).send('Error'); }
});

router.post('/api/bookings', services.auth.requireAuth, async function(req,res){
try{
var b=req.body||{};
if(!b.make||!b.date||!b.time) return res.status(400).json({error:'Champs manquants'});
var ref=genRef();
var items=Array.isArray(b.work_items)?b.work_items:[];
var summary=b.work_summary||items.join(', ');
var r=await db.run('INSERT INTO bookings (user_id,reference,make,model,year,plate,vin,work_items,work_summary,notes,appt_date,appt_time,dropoff,estimated_min,customer_name,customer_phone,customer_email) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id',[req.user.id,ref,b.make,b.model||'',b.year||'',b.plate||'',b.vin||'',JSON.stringify(items),summary,b.notes||'',b.date,b.time,b.dropoff||'',parseInt(b.est_min,10)||0,b.name||'',b.phone||'',b.email||'']);
try{ var ex=await db.get('SELECT id FROM vehicles WHERE user_id=$1 AND make=$2 AND model=$3 AND year=$4',[req.user.id,b.make,b.model||'',b.year||'']); if(!ex) await db.run('INSERT INTO vehicles (user_id,make,model,year,plate,vin) VALUES ($1,$2,$3,$4,$5,$6)',[req.user.id,b.make,b.model||'',b.year||'',b.plate||'',b.vin||'']); else if(b.plate||b.vin) await db.run('UPDATE vehicles SET plate=$1,vin=$2,updated_at=NOW() WHERE id=$3',[b.plate||'',b.vin||'',ex.id]); }catch(e){}
try{ if(services.config.contactEmail){ var msg={to:services.config.contactEmail,subject:'Nouveau rendez-vous '+ref,html:'<p>Réf: '+ref+'</p><p>'+(b.name||'')+' — '+(b.phone||'')+' — '+(b.email||'')+'</p><p>'+(b.year||'')+' '+(b.make||'')+' '+(b.model||'')+(b.plate?(' · '+b.plate):'')+'</p><p>Travaux: '+summary+'</p><p>Date: '+b.date+' '+b.time+'</p><p>Dépôt: '+(b.dropoff||'')+'</p>'}; if(b.email) msg.replyTo={email:b.email}; await services.email.send(msg); } }catch(e){}
res.json({success:true,reference:ref,id:r.lastInsertRowid});
}catch(e){ res.status(500).json({error:'Booking failed'}); }
});

router.post('/api/bookings/:id/cancel', services.auth.requireAuth, async function(req,res){
try{
var bk=await db.get('SELECT * FROM bookings WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);
if(!bk) return res.status(404).json({error:'Introuvable'});
await db.run(`UPDATE bookings SET status='cancelled', updated_at=NOW() WHERE id=$1`,[req.params.id]);
res.json({success:true});
}catch(e){ res.status(500).json({error:'x'}); }
});

router.get('/admin', async function(req,res){
if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
var stats={users:0,push:0,visits7:0,bookingsTotal:0,bookingsPending:0,posts:0,services:0,symptoms:0,faqs:0};
try{ stats.users=await services.auth.getUserCount(); }catch(e){}
try{ stats.push=await services.push.getSubscriptionCount(); }catch(e){}
try{ var v=await db.get(`SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'`); stats.visits7=v?v.c:0; }catch(e){}
try{ var bt=await db.get('SELECT COUNT(*)::int AS c FROM bookings'); stats.bookingsTotal=bt?bt.c:0; }catch(e){}
try{ var bp=await db.get(`SELECT COUNT(*)::int AS c FROM bookings WHERE status='pending'`); stats.bookingsPending=bp?bp.c:0; }catch(e){}
for(const tb of ['posts','services','symptoms','faqs']){ try{ var c=await db.get('SELECT COUNT(*)::int AS c FROM '+tb); stats[tb]=c?c.c:0; }catch(e){} }
var recent=[]; try{ recent=await db.all('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 6'); }catch(e){}
res.render('admin',{stats,recent,adminUser:(services.config.ownerName||'Admin')});
});

// --- Admin page routes (explicit literal render calls) ---
router.get('/admin/bookings', function(req,res){
if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
res.render('admin-bookings',{adminUser:(services.config.ownerName||'Admin'),moduleKey:'bookings',moduleLabel:'Rendez-vous'});
});
router.get('/admin/services', function(req,res){
if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
res.render('admin-services',{adminUser:(services.config.ownerName||'Admin'),moduleKey:'services',moduleLabel:'Entretien'});
});
router.get('/admin/symptoms', function(req,res){
if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
res.render('admin-symptoms',{adminUser:(services.config.ownerName||'Admin'),moduleKey:'symptoms',moduleLabel:'Symptômes'});
});
router.get('/admin/faqs', function(req,res){
if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
res.render('admin-faqs',{adminUser:(services.config.ownerName||'Admin'),moduleKey:'faqs',moduleLabel:'FAQ'});
});
router.get('/admin/posts', function(req,res){
if(!services.admin.isAdmin(req)) return res.redirect('admin/login');
res.render('admin-posts',{adminUser:(services.config.ownerName||'Admin'),moduleKey:'posts',moduleLabel:'Articles'});
});

router.get('/api/admin/stats', requireAdmin, async function(req,res){
try{
var userCount=0,push=0,totalVisits=0,recentVisits=0;
try{ userCount=await services.auth.getUserCount(); }catch(e){}
try{ push=await services.push.getSubscriptionCount(); }catch(e){}
try{ var a=await db.get('SELECT COUNT(*)::int AS c FROM site_visits'); totalVisits=a?a.c:0; }catch(e){}
try{ var b=await db.get(`SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'`); recentVisits=b?b.c:0; }catch(e){}
res.json({userCount:userCount,pushSubscriberCount:push,totalVisits:totalVisits,recentVisits:recentVisits});
}catch(e){ res.status(500).json({error:'x'}); }
});

router.get('/api/admin/submissions', requireAdmin, async function(req,res){
try{ var rows=await db.all('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 50'); res.json({submissions:rows}); }catch(e){ res.json({submissions:[]}); }
});

router.get('/api/admin/settings', requireAdmin, async function(req,res){
try{ var s=await getSettings(); res.json(s); }catch(e){ res.status(500).json({error:'x'}); }
});
router.put('/api/admin/settings', requireAdmin, async function(req,res){
try{ var key=req.body.key, value=req.body.value; if(!key) return res.status(400).json({error:'key'}); await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[key,value]); res.json({success:true}); }catch(e){ res.status(500).json({error:'x'}); }
});

router.post('/api/admin/upload', requireAdmin, async function(req,res){
try{
if(!(services.cloudinary && services.cloudinary.uploader && typeof services.cloudinary.uploader.upload==='function')) return res.status(503).json({error:'Téléversement indisponible'});
var dataUri=req.body.dataUri; if(!dataUri) return res.status(400).json({error:'Aucune image'});
var r=await services.cloudinary.uploader.upload(dataUri,{folder:'garage-buzz/uploads'});
res.json({url:r.secure_url});
}catch(e){ res.status(500).json({error:'Téléversement échoué'}); }
});
router.post('/api/admin/generate-image', requireAdmin, async function(req,res){
try{ var url=await services.ai.generateImage(req.body.prompt,{aspectRatio:req.body.aspectRatio||'4:3'}); res.json({url:url}); }catch(e){ res.status(500).json({error:'Génération échouée'}); }
});

var BOOL_COLS={featured:1,published:1,bill_paid:1};
var NUM_COLS={duration_min:1,price:1,sort_order:1,estimated_min:1,bill_amount:1};
function norm(c,v){ if(BOOL_COLS[c]) return (v===true||v===1||v==='1'||v==='true'||v==='on')?1:0; if(NUM_COLS[c]){ if(v===''||v===null||v===undefined) return null; var n=Number(v); return isNaN(n)?null:n; } if(v==='') return null; return v; }

// --- /api/admin/posts ---
var postsCols=['title','content','image_url','category','published'];
router.get('/api/admin/posts', requireAdmin, async function(req,res){
try{ var rows=await db.all('SELECT * FROM posts ORDER BY sort_order ASC, id DESC'); res.json({posts:rows}); }catch(e){ res.status(500).json({error:'load failed'}); }
});
router.post('/api/admin/posts', requireAdmin, async function(req,res){
try{ var fc=[],vals=[],ph=[],i=1; postsCols.forEach(function(c){ if(req.body[c]!==undefined){ fc.push(c); vals.push(norm(c,req.body[c])); ph.push('$'+(i++)); } }); if(!fc.length) return res.status(400).json({error:'no fields'}); var r=await db.run('INSERT INTO posts ('+fc.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals); var row=await db.get('SELECT * FROM posts WHERE id=$1',[r.lastInsertRowid]); res.json({post:row}); }catch(e){ res.status(500).json({error:'create failed'}); }
});
router.put('/api/admin/posts/:id', requireAdmin, async function(req,res){
try{ var sets=[],vals=[],i=1; postsCols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+(i++)); vals.push(norm(c,req.body[c])); } }); if(!sets.length) return res.status(400).json({error:'no fields'}); sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE posts SET '+sets.join(',')+' WHERE id=$'+i,vals); var row=await db.get('SELECT * FROM posts WHERE id=$1',[req.params.id]); res.json({post:row}); }catch(e){ res.status(500).json({error:'update failed'}); }
});
router.delete('/api/admin/posts/:id', requireAdmin, async function(req,res){
try{ await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]); res.json({success:true}); }catch(e){ res.status(500).json({error:'delete failed'}); }
});

// --- /api/admin/services ---
var servicesCols=['name','name_en','description','description_en','duration_min','price','sort_order','featured','image_url','published'];
router.get('/api/admin/services', requireAdmin, async function(req,res){
try{ var rows=await db.all('SELECT * FROM services ORDER BY sort_order ASC, id DESC'); res.json({services:rows}); }catch(e){ res.status(500).json({error:'load failed'}); }
});
router.post('/api/admin/services', requireAdmin, async function(req,res){
try{ var fc=[],vals=[],ph=[],i=1; servicesCols.forEach(function(c){ if(req.body[c]!==undefined){ fc.push(c); vals.push(norm(c,req.body[c])); ph.push('$'+(i++)); } }); if(!fc.length) return res.status(400).json({error:'no fields'}); var r=await db.run('INSERT INTO services ('+fc.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals); var row=await db.get('SELECT * FROM services WHERE id=$1',[r.lastInsertRowid]); res.json({service:row}); }catch(e){ res.status(500).json({error:'create failed'}); }
});
router.put('/api/admin/services/:id', requireAdmin, async function(req,res){
try{ var sets=[],vals=[],i=1; servicesCols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+(i++)); vals.push(norm(c,req.body[c])); } }); if(!sets.length) return res.status(400).json({error:'no fields'}); sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE services SET '+sets.join(',')+' WHERE id=$'+i,vals); var row=await db.get('SELECT * FROM services WHERE id=$1',[req.params.id]); res.json({service:row}); }catch(e){ res.status(500).json({error:'update failed'}); }
});
router.delete('/api/admin/services/:id', requireAdmin, async function(req,res){
try{ await db.run('DELETE FROM services WHERE id=$1',[req.params.id]); res.json({success:true}); }catch(e){ res.status(500).json({error:'delete failed'}); }
});

// --- /api/admin/symptoms ---
var symptomsCols=['name','name_en','category','sort_order','image_url'];
router.get('/api/admin/symptoms', requireAdmin, async function(req,res){
try{ var rows=await db.all('SELECT * FROM symptoms ORDER BY sort_order ASC, id DESC'); res.json({symptoms:rows}); }catch(e){ res.status(500).json({error:'load failed'}); }
});
router.post('/api/admin/symptoms', requireAdmin, async function(req,res){
try{ var fc=[],vals=[],ph=[],i=1; symptomsCols.forEach(function(c){ if(req.body[c]!==undefined){ fc.push(c); vals.push(norm(c,req.body[c])); ph.push('$'+(i++)); } }); if(!fc.length) return res.status(400).json({error:'no fields'}); var r=await db.run('INSERT INTO symptoms ('+fc.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals); var row=await db.get('SELECT * FROM symptoms WHERE id=$1',[r.lastInsertRowid]); res.json({symptom:row}); }catch(e){ res.status(500).json({error:'create failed'}); }
});
router.put('/api/admin/symptoms/:id', requireAdmin, async function(req,res){
try{ var sets=[],vals=[],i=1; symptomsCols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+(i++)); vals.push(norm(c,req.body[c])); } }); if(!sets.length) return res.status(400).json({error:'no fields'}); sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE symptoms SET '+sets.join(',')+' WHERE id=$'+i,vals); var row=await db.get('SELECT * FROM symptoms WHERE id=$1',[req.params.id]); res.json({symptom:row}); }catch(e){ res.status(500).json({error:'update failed'}); }
});
router.delete('/api/admin/symptoms/:id', requireAdmin, async function(req,res){
try{ await db.run('DELETE FROM symptoms WHERE id=$1',[req.params.id]); res.json({success:true}); }catch(e){ res.status(500).json({error:'delete failed'}); }
});

// --- /api/admin/faqs ---
var faqsCols=['question','question_en','answer','answer_en','sort_order','image_url'];
router.get('/api/admin/faqs', requireAdmin, async function(req,res){
try{ var rows=await db.all('SELECT * FROM faqs ORDER BY sort_order ASC, id DESC'); res.json({faqs:rows}); }catch(e){ res.status(500).json({error:'load failed'}); }
});
router.post('/api/admin/faqs', requireAdmin, async function(req,res){
try{ var fc=[],vals=[],ph=[],i=1; faqsCols.forEach(function(c){ if(req.body[c]!==undefined){ fc.push(c); vals.push(norm(c,req.body[c])); ph.push('$'+(i++)); } }); if(!fc.length) return res.status(400).json({error:'no fields'}); var r=await db.run('INSERT INTO faqs ('+fc.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals); var row=await db.get('SELECT * FROM faqs WHERE id=$1',[r.lastInsertRowid]); res.json({faq:row}); }catch(e){ res.status(500).json({error:'create failed'}); }
});
router.put('/api/admin/faqs/:id', requireAdmin, async function(req,res){
try{ var sets=[],vals=[],i=1; faqsCols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+(i++)); vals.push(norm(c,req.body[c])); } }); if(!sets.length) return res.status(400).json({error:'no fields'}); sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE faqs SET '+sets.join(',')+' WHERE id=$'+i,vals); var row=await db.get('SELECT * FROM faqs WHERE id=$1',[req.params.id]); res.json({faq:row}); }catch(e){ res.status(500).json({error:'update failed'}); }
});
router.delete('/api/admin/faqs/:id', requireAdmin, async function(req,res){
try{ await db.run('DELETE FROM faqs WHERE id=$1',[req.params.id]); res.json({success:true}); }catch(e){ res.status(500).json({error:'delete failed'}); }
});

// --- /api/admin/bookings ---
var bookingsCols=['reference','customer_name','customer_phone','customer_email','make','model','year','plate','vin','work_summary','notes','appt_date','appt_time','dropoff','estimated_min','status','bill_amount','bill_paid','bill_date','image_url'];
router.get('/api/admin/bookings', requireAdmin, async function(req,res){
try{ var rows=await db.all('SELECT * FROM bookings ORDER BY created_at DESC'); res.json({bookings:rows}); }catch(e){ res.status(500).json({error:'load failed'}); }
});
router.post('/api/admin/bookings', requireAdmin, async function(req,res){
try{ var fc=[],vals=[],ph=[],i=1; bookingsCols.forEach(function(c){ if(req.body[c]!==undefined){ fc.push(c); vals.push(norm(c,req.body[c])); ph.push('$'+(i++)); } }); if(req.body.reference===undefined){ fc.push('reference'); vals.push(genRef()); ph.push('$'+(i++)); } if(!fc.length) return res.status(400).json({error:'no fields'}); var r=await db.run('INSERT INTO bookings ('+fc.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals); var row=await db.get('SELECT * FROM bookings WHERE id=$1',[r.lastInsertRowid]); res.json({booking:row}); }catch(e){ res.status(500).json({error:'create failed'}); }
});
router.put('/api/admin/bookings/:id', requireAdmin, async function(req,res){
try{ var sets=[],vals=[],i=1; bookingsCols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+(i++)); vals.push(norm(c,req.body[c])); } }); if(!sets.length) return res.status(400).json({error:'no fields'}); sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE bookings SET '+sets.join(',')+' WHERE id=$'+i,vals); var row=await db.get('SELECT * FROM bookings WHERE id=$1',[req.params.id]); res.json({booking:row}); }catch(e){ res.status(500).json({error:'update failed'}); }
});
router.delete('/api/admin/bookings/:id', requireAdmin, async function(req,res){
try{ await db.run('DELETE FROM bookings WHERE id=$1',[req.params.id]); res.json({success:true}); }catch(e){ res.status(500).json({error:'delete failed'}); }
});

// --- /api/admin/vehicles ---
var vehiclesCols=['user_id','make','model','year','plate','vin','image_url'];
router.get('/api/admin/vehicles', requireAdmin, async function(req,res){
try{ var rows=await db.all('SELECT * FROM vehicles ORDER BY id DESC'); res.json({vehicles:rows}); }catch(e){ res.status(500).json({error:'load failed'}); }
});
router.post('/api/admin/vehicles', requireAdmin, async function(req,res){
try{ var fc=[],vals=[],ph=[],i=1; vehiclesCols.forEach(function(c){ if(req.body[c]!==undefined){ fc.push(c); vals.push(norm(c,req.body[c])); ph.push('$'+(i++)); } }); if(!fc.length) return res.status(400).json({error:'no fields'}); var r=await db.run('INSERT INTO vehicles ('+fc.join(',')+') VALUES ('+ph.join(',')+') RETURNING id',vals); var row=await db.get('SELECT * FROM vehicles WHERE id=$1',[r.lastInsertRowid]); res.json({vehicle:row}); }catch(e){ res.status(500).json({error:'create failed'}); }
});
router.put('/api/admin/vehicles/:id', requireAdmin, async function(req,res){
try{ var sets=[],vals=[],i=1; vehiclesCols.forEach(function(c){ if(req.body[c]!==undefined){ sets.push(c+'=$'+(i++)); vals.push(norm(c,req.body[c])); } }); if(!sets.length) return res.status(400).json({error:'no fields'}); sets.push('updated_at=NOW()'); vals.push(req.params.id); await db.run('UPDATE vehicles SET '+sets.join(',')+' WHERE id=$'+i,vals); var row=await db.get('SELECT * FROM vehicles WHERE id=$1',[req.params.id]); res.json({vehicle:row}); }catch(e){ res.status(500).json({error:'update failed'}); }
});
router.delete('/api/admin/vehicles/:id', requireAdmin, async function(req,res){
try{ await db.run('DELETE FROM vehicles WHERE id=$1',[req.params.id]); res.json({success:true}); }catch(e){ res.status(500).json({error:'delete failed'}); }
});

router.get('/api/admin/modules', requireAdmin, function(req,res){
res.json({modules:[
{key:'bookings',label:'Rendez-vous',icon:'calendar',fields:[
{name:'reference',type:'readonly',label:'Référence',description:`Code unique du rendez-vous, généré automatiquement.`},
{name:'customer_name',type:'text',label:'Client',description:`Nom du client.`,placeholder:`ex. Marie Tremblay`},
{name:'make',type:'text',label:'Marque',description:`Marque du véhicule.`,placeholder:`ex. Honda`},
{name:'model',type:'text',label:'Modèle',placeholder:`ex. Civic`},
{name:'year',type:'text',label:'Année',placeholder:`ex. 2018`},
{name:'plate',type:'text',label:'Plaque',placeholder:`ex. GAB 204`},
{name:'appt_date',type:'date',label:'Date',description:`Date du rendez-vous.`},
{name:'appt_time',type:'text',label:'Heure',placeholder:`ex. 09:00`},
{name:'dropoff',type:'select',label:'Dépôt',options:['wait','leave','keybox','early'],description:`Façon dont la voiture arrive.`},
{name:'status',type:'select',label:'Statut',options:['pending','confirmed','completed','cancelled'],description:`En attente, confirmé, terminé ou annulé. Les rendez-vous terminés apparaissent dans l'historique du client.`},
{name:'work_summary',type:'textarea',label:'Travaux',description:`Résumé des travaux demandés.`,placeholder:`ex. Vidange, freins avant`},
{name:'estimated_min',type:'number',label:'Temps estimé (min)',min:0,step:5,placeholder:`ex. 90`},
{name:'bill_amount',type:'number',label:'Facture ($)',min:0,step:1,description:`Montant facturé, en dollars. Apparaît dans l'historique une fois le rendez-vous terminé.`,placeholder:`ex. 245`},
{name:'bill_paid',type:'boolean',label:'Payé au garage',description:`Cochez lorsque le client a réglé au comptoir.`},
{name:'bill_date',type:'date',label:'Date de facturation'},
{name:'customer_phone',type:'text',label:'Téléphone',placeholder:`ex. 514 555 0142`},
{name:'customer_email',type:'email',label:'Courriel',placeholder:`ex. client@exemple.com`},
{name:'notes',type:'textarea',label:'Notes internes'}
]},
{key:'services',label:'Entretien',icon:'list',fields:[
{name:'name',type:'text',required:true,label:'Nom (FR)',description:`Nom du service dans le tableau d'entretien.`,placeholder:`ex. Vidange d'huile`},
{name:'name_en',type:'text',label:'Nom (EN)',description:`Traduction anglaise, affichée en mode EN.`,placeholder:`ex. Oil change`},
{name:'description',type:'textarea',label:'Description (FR)',placeholder:`Courte description du service`},
{name:'description_en',type:'textarea',label:'Description (EN)'},
{name:'duration_min',type:'number',label:'Durée estimée (min)',min:0,step:5,description:`Durée affichée en minutes à côté du service.`,placeholder:`ex. 30`},
{name:'price',type:'number',label:'Prix indicatif ($)',min:0,step:1,description:`Utilisé pour les factures. Non affiché sur le tableau public.`,placeholder:`ex. 60`},
{name:'sort_order',type:'number',label:'Ordre',min:0,step:1,description:`Plus petit = plus haut dans la liste.`},
{name:'featured',type:'boolean',label:'Mis en avant'},
{name:'image_url',type:'image',label:'Image',description:`Facultatif. Format 4:3 recommandé.`},
{name:'published',type:'boolean',label:'Publié',default:true,description:`Décochez pour masquer ce service du site.`}
]},
{key:'symptoms',label:'Symptômes',icon:'edit',fields:[
{name:'name',type:'text',required:true,label:'Symptôme (FR)',description:`Symptôme proposé dans la liste de réservation.`,placeholder:`ex. Grincement au freinage`},
{name:'name_en',type:'text',label:'Symptôme (EN)',placeholder:`ex. Squealing when braking`},
{name:'category',type:'select',label:'Catégorie',options:['freins','moteur','electrique','pneus','bruits'],description:`Regroupe le symptôme sous une rubrique.`},
{name:'sort_order',type:'number',label:'Ordre',min:0,step:1},
{name:'image_url',type:'image',label:'Image'}
]},
{key:'faqs',label:'FAQ',icon:'help',fields:[
{name:'question',type:'text',required:true,label:'Question (FR)',placeholder:`ex. Puis-je laisser ma voiture ?`},
{name:'question_en',type:'text',label:'Question (EN)'},
{name:'answer',type:'textarea',label:'Réponse (FR)'},
{name:'answer_en',type:'textarea',label:'Réponse (EN)'},
{name:'sort_order',type:'number',label:'Ordre',min:0,step:1},
{name:'image_url',type:'image',label:'Image'}
]},
{key:'posts',label:'Articles',icon:'edit',fields:[
{name:'title',type:'text',required:true,label:'Titre',placeholder:`ex. Préparez votre véhicule pour l'hiver`},
{name:'content',type:'textarea',label:'Contenu'},
{name:'image_url',type:'image',label:'Image',description:`Format 16:9 recommandé (1200×630).`},
{name:'category',type:'text',label:'Catégorie',placeholder:`ex. Conseils`},
{name:'published',type:'boolean',label:'Publié',default:true}
]},
{key:'vehicles',label:'Véhicules',icon:'car',fields:[
{name:'make',type:'text',label:'Marque',placeholder:`ex. Honda`},
{name:'model',type:'text',label:'Modèle',placeholder:`ex. Civic`},
{name:'year',type:'text',label:'Année',placeholder:`ex. 2018`},
{name:'plate',type:'text',label:'Plaque',placeholder:`ex. GAB 204`},
{name:'vin',type:'text',label:'NIV'},
{name:'image_url',type:'image',label:'Image'}
]}
],settingsFields:[]});
});

router.get('*', function(req,res,next){ if(req.path.indexOf('/api')===0||req.path.indexOf('/admin')===0) return next(); res.redirect('.'); });

return router;
};
