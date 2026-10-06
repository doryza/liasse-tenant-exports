'use strict';
const express=require('express');
const original=require('./business.json'), words=require('./lib/i18n');
const gates=Object.keys(original.initial_gates);
const editable=['business_name','phone','email','areas_fr','areas_en','hours_fr','hours_en','privacy_fr','privacy_en'];
const serviceKeys=original.services.map(s=>'service_confirmed_'+s.id);
module.exports=function(services){
 const router=express.Router(), db=services.db, limits=new Map();
 router.use(express.json({limit:'16kb'}));
 const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
 const owner=wrap(async(req,res,next)=>{if(!await services.admin.isAdmin(req))return res.status(403).json({error:'Owner access required'});next();});
 const sameOrigin=(req,res,next)=>{let host='';try{host=new URL(req.get('origin')||'').host;}catch(_){}if(host!==req.get('host')||req.get('x-requested-with')!=='plumbing-site')return res.status(403).json({error:'Invalid request origin'});next();};
 async function settings(){return Object.fromEntries((await db.all('SELECT key,value FROM admin_settings')).map(r=>[r.key,r.value]));}
 function business(s){const b={...original,theme:{...original.theme},services:original.services.map(item=>({...item,confirmed:s['service_confirmed_'+item.id]===undefined?item.confirmed:s['service_confirmed_'+item.id]==='1'}))};for(const k of ['business_name','phone','email'])if(s[k])b[k]=s[k];b.brand_name=b.business_name.replace(/\s+inc\.?$/i,'');
  if(s.areas_fr||s.areas_en)b.areas={fr:s.areas_fr||s.areas_en,en:s.areas_en||s.areas_fr};
  if(s.hours_fr||s.hours_en)b.hours={text:{fr:s.hours_fr||s.hours_en,en:s.hours_en||s.hours_fr}};
  const digits=b.phone.replace(/[^+\d]/g,'');b.tel='tel:'+(digits.length===10?'+1'+digits:digits);return b;
 }
 const live=s=>['contact_verified','privacy_approved','messages_enabled','live_actions_enabled'].every(k=>s[k]==='1')&&Boolean(s.privacy_fr?.trim()&&s.privacy_en?.trim());
 router.use(wrap(async(req,res,next)=>{
  const lang=req.path==='/en'||req.path.startsWith('/en/')?'en':'fr',s=await settings(),b=business(s);
  const prefix=lang==='en'?'en/':'',url=p=>prefix+p;
  // Always derive the base from the platform helper when available (custom domains included).
  let root=typeof req.tenantPath==='function'?req.tenantPath('/'):(req.baseUrl||'')+'/';if(!root.endsWith('/'))root+='/';
  const cleanPath=req.path.replace(/^\/en\/?/,'').replace(/^\//,'');
  const t={...words[lang]};for(const key of Object.keys(t))if(s['text_'+key+'_'+lang])t[key]=s['text_'+key+'_'+lang];
  res.locals={...res.locals,lang,t,b,s,live:live(s),url,base:root,currentPath:cleanPath,
   otherLang:lang==='fr'?'en/'+cleanPath:cleanPath||'./',text:v=>v?.[lang]||v?.fr||'',
   currentYear:new Date().getFullYear(),selectedService:'',error:false,sent:false,
   title:b.business_name+' · '+b.city,active:'',page:'',service:null,
   ratingText:b.rating?b.rating.value.toLocaleString(lang==='fr'?'fr-CA':'en-CA',{minimumFractionDigits:1}):'',
   themeStyle:Object.entries(b.theme).map(([k,v])=>'--'+k+':'+v).join(';')};next();
 }));
 function page(name,active){return(req,res)=>{res.locals.active=active||name;res.locals.page=name;res.render(name);};}
 router.get(['/', '/en','/en/'],page('index','home'));
 router.get(['/services','/en/services'],page('services','services'));
 router.get(['/services/:id','/en/services/:id'],(req,res)=>{const service=res.locals.b.services.find(s=>s.id===req.params.id);if(!service)return res.status(404).render('not-found');res.locals.service=service;res.locals.active='services';res.locals.title=res.locals.text(service.name)+' · '+res.locals.b.business_name;res.render('service');});
 router.get(['/contact','/en/contact'],page('contact','contact'));
 router.get(['/demande','/en/demande'],(req,res)=>{res.locals.active='request';res.locals.selectedService=original.services.some(s=>s.id===req.query.service)?req.query.service:'';res.render('request');});
 router.get(['/confidentialite','/en/confidentialite'],page('privacy'));
 router.post('/api/requests',sameOrigin,wrap(async(req,res)=>{
  const s=await settings();if(!live(s))return res.status(403).json({error:'Not activated'});
  if(!req.is('application/json'))return res.status(415).json({error:'JSON required'});
  const x=req.body||{};if(x.website)return res.status(400).json({error:'Invalid submission'});
  const clean=(k,n)=>typeof x[k]==='string'?x[k].trim().slice(0,n):'';
  const name=clean('name',120),phone=clean('phone',40),address=clean('address',300),message=clean('message',3000),serviceId=clean('service_id',80);
  if(name.length<2||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15||address.length<5||message.length<5||x.consent!==true)return res.status(400).json({error:'Invalid fields'});
  if(serviceId&&!business(s).services.some(e=>e.id===serviceId&&e.confirmed))return res.status(400).json({error:'Invalid service'});
  const key=req.ip||'unknown',now=Date.now();for(const [k,v] of limits)if(now-v.start>600000)limits.delete(k);
  const limit=limits.get(key)||{start:now,count:0};if(limit.count>=5)return res.status(429).json({error:'Try again later'});limit.count++;limits.set(key,limit);
  const row=await db.get('INSERT INTO plumbing_requests(name,phone,address,service_id,message,language) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',[name,phone,address,serviceId||null,message,x.language==='en'?'en':'fr']);
  res.status(201).json({id:row.id,status:'new',appointment_confirmed:false});
 }));
 router.get('/admin',owner,wrap(async(req,res)=>{res.locals.requests=await db.all('SELECT * FROM plumbing_requests ORDER BY created_at DESC LIMIT 200');res.locals.gates=gates;res.locals.editable=editable;res.locals.fieldLabels={business_name:'Nom de l’entreprise',phone:'Téléphone',email:'Courriel',areas_fr:'Secteurs — français',areas_en:'Secteurs — anglais',hours_fr:'Disponibilité — français',hours_en:'Disponibilité — anglais',privacy_fr:'Confidentialité — français',privacy_en:'Confidentialité — anglais',contact_verified:'Coordonnées confirmées (requis)',address_verified:'Adresse confirmée, si publiée',hours_verified:'Horaire confirmé',privacy_approved:'Confidentialité approuvée (requis)',messages_enabled:'Recevoir les demandes (requis)',live_actions_enabled:'Activer les demandes (requis)'};res.locals.statusLabels={new:'Nouvelle',contacted:'Contact établi',closed:'Terminée'};res.render('admin');}));
 router.put('/api/admin/settings',owner,sameOrigin,wrap(async(req,res)=>{
  const x=req.body||{};if(!x||Array.isArray(x)||Object.keys(x).some(k=>!gates.includes(k)&&!editable.includes(k)&&!serviceKeys.includes(k)))return res.status(400).json({error:'Invalid setting'});
  for(const [key,value]of Object.entries(x)){
   if(typeof value!=='string'||value.length>(key.startsWith('privacy_')&&!gates.includes(key)?5000:300)||((gates.includes(key)||serviceKeys.includes(key))&&!['0','1'].includes(value)))return res.status(400).json({error:'Invalid value'});
   if(key==='phone'&&(!/^\+?[\d ()-]{10,40}$/.test(value)||value.replace(/\D/g,'').length<10||value.replace(/\D/g,'').length>15))return res.status(400).json({error:'Invalid phone'});
   if(key==='email'&&value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return res.status(400).json({error:'Invalid email'});
   if(key==='business_name'&&!value.trim())return res.status(400).json({error:'Invalid name'});
  }
  // Validate the full payload before any mutation.
  for(const [key,value]of Object.entries(x))await db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value',[key,value]);res.json({ok:true});
 }));
 router.put('/api/admin/requests/:id',owner,sameOrigin,wrap(async(req,res)=>{
  if(!/^\d+$/.test(req.params.id)||!['new','contacted','closed'].includes(req.body?.status))return res.status(400).json({error:'Invalid status'});
  const row=await db.get('UPDATE plumbing_requests SET status=$1 WHERE id=$2 RETURNING id',[req.body.status,req.params.id]);if(!row)return res.status(404).json({error:'Not found'});res.json({ok:true});
 }));
 router.use((req,res)=>res.status(404).render('not-found'));
 router.use((err,req,res,_next)=>{if(err.type==='entity.too.large')return res.status(413).json({error:'Request too large'});if(err instanceof SyntaxError&&err.status===400)return res.status(400).json({error:'Invalid JSON'});res.status(500).json({error:'Unable to complete the request'});});
 return router;
};
