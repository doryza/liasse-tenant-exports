const crypto = require('crypto');
const { demoFor } = require('./province-demos-v1');
const newTag = () => 'VV-' + crypto.randomBytes(16).toString('hex');
function photoUrl(value) {
  if (!value) return '';
  let url; try { url = new URL(value); } catch (_) { throw Error('URL du portrait invalide.'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw Error('Le portrait doit utiliser une URL HTTPS publique.');
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) throw Error('URL du portrait non publique.');
  return url.href;
}
function csv(value) {
  const result=[];let item='',quoted=false;
  for(let i=0;i<value.length;i++){
    if(value[i]==='"'){if(quoted&&value[i+1]==='"'){item+='"';i++;}else quoted=!quoted;}
    else if(value[i]===','&&!quoted){result.push(item.trim());item='';}else item+=value[i];
  }
  if(quoted)throw Error('Guillemets non fermés dans les métadonnées.');
  result.push(item.trim());return result;
}
function parseAddresses(raw) {
  if(typeof raw!=='string'||raw.length>300000)throw Error('Saisissez au maximum 300 000 caractères.');
  const blocks=raw.trim().split(/\r?\n\s*\r?\n/).filter(Boolean);
  if(!blocks.length||blocks.length>500)throw Error('Une campagne doit contenir de 1 à 500 agents.');
  const seen=new Set();
  const measure=new (require('pdfkit'))({autoFirstPage:false});measure.font('Helvetica').fontSize(8);
  return blocks.map((block,index)=>{
    try {
      const lines=block.split(/\r?\n/).map(s=>s.trim());
      if(lines.length!==3||lines.some(s=>!s))throw Error('Trois lignes requises : identité, adresse 1, adresse 2.');
      const match=lines[0].match(/^([^{}]+)\s*\{(.*)\}\s*$/);
      if(!match)throw Error('Format : Nom {agence, titre, téléphone, URL du portrait}.');
      const name=match[1].trim();let fields;
      if(/^\s*"(?:agency|agency_name|title|phone|headshot_url)"\s*:/.test(match[2])){
        const data=JSON.parse('{'+match[2]+'}');fields=[data.agency||data.agency_name||'',data.title||'',data.phone||'',data.headshot_url||''];
      }else fields=csv(match[2]);
      if(fields.length!==4)throw Error('Quatre métadonnées requises; laissez vide une valeur inconnue.');
      const [agency,title,phone,photo]=fields.map(s=>String(s||'').trim());
      if(name.length>120||agency.length>120||title.length>120||phone.length>40||photo.length>1200||lines[1].length>70||lines[2].length>70)throw Error('Un champ est trop long pour la lettre.');
      if([name,...lines.slice(1)].some(line=>measure.widthOfString(line)>3.05*72))throw Error('Le nom ou une ligne d’adresse dépasse la fenêtre, même à 8 points. Abrégez avant de créer la campagne.');
      const key=[name,lines[1],lines[2]].join('|').toLowerCase();
      if(seen.has(key))throw Error('Agent et adresse en double.');seen.add(key);
      return {name,agency,title,phone,photo_url:photoUrl(photo),address1:lines[1],address2:lines[2]};
    }catch(e){throw Error('Bloc '+(index+1)+' : '+e.message);}
  });
}
function register(router,services,h) {
  const db=services.db;
  function admin(req,res,next){
    if(!services.admin.isAdmin(req))return res.status(401).json({error:'Accès administrateur requis.'});
    let cross=req.get('sec-fetch-site')==='cross-site';
    if(req.get('origin')){try{cross=cross||new URL(req.get('origin')).host!==req.get('host');}catch(_){cross=true;}}
    if(cross)return res.status(403).json({error:'Origine refusée.'});next();
  }
  function endpoint(fn){return (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(e=>{console.error('solicitation',e.message);if(!res.headersSent)res.status(500).json({error:'Impossible de traiter la campagne. Réessayez.'});});}
  router.get('/admin/sollicitations',h.requireAdmin,endpoint(async(req,res)=>{
    const campaigns=await db.all('SELECT c.*, (SELECT COUNT(*)::int FROM solicitation_agents a WHERE a.campaign_id=c.id) AS count, (SELECT COUNT(*)::int FROM solicitation_agents a WHERE a.campaign_id=c.id AND a.broker_id IS NOT NULL) AS registered FROM solicitation_campaigns c ORDER BY c.batch_number ASC NULLS LAST,c.id ASC');
    const filter=['pending','sent','all'].includes(req.query.status)?req.query.status:'pending';
    const batches=campaigns.filter(c=>c.batch_number!=null);
    res.render('admin-sollicitations',Object.assign(await h.baseLocals(req),{active:'sollicitations',campaigns,filter,nextCampaign:batches.find(c=>!c.sent_at)||null,pendingCount:batches.filter(c=>!c.sent_at).length,sentCount:batches.filter(c=>c.sent_at).length}));
  }));
  router.post('/api/admin/sollicitations/:id/sent',admin,endpoint(async(req,res)=>{
    if(!/^[1-9]\d*$/.test(req.params.id)||typeof (req.body||{}).sent!=='boolean')return res.status(400).json({error:'Campagne et état valides requis.'});
    const campaign=await db.get('UPDATE solicitation_campaigns SET sent_at=CASE WHEN $2::boolean THEN COALESCE(sent_at,NOW()) ELSE NULL END WHERE id=$1 RETURNING *',[req.params.id,req.body.sent]);
    if(!campaign)return res.status(404).json({error:'Campagne introuvable.'});
    const next=await db.get('SELECT id FROM solicitation_campaigns WHERE batch_number IS NOT NULL AND sent_at IS NULL ORDER BY batch_number,id LIMIT 1');
    res.json({id:campaign.id,sent_at:campaign.sent_at,nextCampaignId:next?next.id:null});
  }));
  router.post('/api/admin/sollicitations/preview',admin,(req,res)=>{try{res.json({agents:parseAddresses((req.body||{}).addresses)});}catch(e){res.status(400).json({error:e.message});}});
  router.post('/api/admin/sollicitations',admin,endpoint(async(req,res)=>{
    let agents;try{agents=parseAddresses((req.body||{}).addresses);}catch(e){return res.status(400).json({error:e.message});}
    const name=String(req.body.name||'').trim();const format=req.body.format||'duplex';
    if(!name||name.length>120||!['duplex','fr','en'].includes(format)||req.body.template!=='vendvite')return res.status(400).json({error:'Nom, modèle VendVite et format valides requis.'});
    agents=agents.map(a=>Object.assign(a,{tag:newTag()}));
    const result=await db.get(`WITH campaign AS (INSERT INTO solicitation_campaigns(name,format) VALUES($1,$2) RETURNING id), agents AS (
      INSERT INTO solicitation_agents(campaign_id,tag,name,agency,title,phone,photo_url,address1,address2)
      SELECT campaign.id,a.tag,a.name,a.agency,a.title,a.phone,a.photo_url,a.address1,a.address2 FROM campaign,jsonb_to_recordset($3::jsonb) AS a(tag text,name text,agency text,title text,phone text,photo_url text,address1 text,address2 text) RETURNING id)
      SELECT campaign.id,(SELECT COUNT(*)::int FROM agents) AS count FROM campaign`,[name,format,JSON.stringify(agents)]);
    res.status(201).json(result);
  }));
  router.get('/admin/sollicitations/:id',h.requireAdmin,endpoint(async(req,res)=>{
    const campaign=await db.get('SELECT * FROM solicitation_campaigns WHERE id=$1',[req.params.id]);if(!campaign)return res.sendStatus(404);
    const agents=await db.all('SELECT * FROM solicitation_agents WHERE campaign_id=$1 ORDER BY id',[campaign.id]);
    const nextCampaign=await db.get('SELECT id,name FROM solicitation_campaigns WHERE batch_number IS NOT NULL AND sent_at IS NULL AND id<>$1 ORDER BY batch_number,id LIMIT 1',[campaign.id]);
    res.render('admin-sollicitation-detail',Object.assign(await h.baseLocals(req),{active:'sollicitations',campaign,agents,nextCampaign}));
  }));
  router.get('/admin/sollicitations/:id/imprimer',h.requireAdmin,endpoint(async(req,res)=>{
    const campaign=await db.get('SELECT * FROM solicitation_campaigns WHERE id=$1',[req.params.id]);if(!campaign)return res.sendStatus(404);
    if(campaign.batch_summary&&campaign.batch_summary.archived)return res.status(409).send('Campagne de test archivée. Imprimez un lot Courtiers Canada à préparer.');
    const agents=await db.all('SELECT * FROM solicitation_agents WHERE campaign_id=$1 ORDER BY id',[campaign.id]);
    const pages=[];
    for(const agent of agents){for(const lang of campaign.format==='duplex'?['fr','en']:[campaign.format]){
      const url=h.absoluteUrl(req,'/invitation/'+agent.tag)+'?lang='+lang;
      pages.push({agent,lang,url,demo:demoFor(agent),qr:await services.qrcode.toDataURL(url,{errorCorrectionLevel:'M',margin:4,width:480})});
    }}
    res.set('Cache-Control','private, no-store');
    res.render('lettre-sollicitation',{campaign,pages});
  }));
  router.get('/invitation/:tag',endpoint(async(req,res)=>{
    if(!/^VV-[a-f0-9]{32}$/.test(req.params.tag))return res.sendStatus(404);
    const agent=await db.get('SELECT * FROM solicitation_agents WHERE tag=$1',[req.params.tag]);if(!agent)return res.sendStatus(404);
    await db.run('UPDATE solicitation_agents SET visits=visits+1,last_visited_at=NOW() WHERE id=$1',[agent.id]);
    const demo=demoFor(agent);
    req.vvInvitation=agent;req.vvInitialAddress=demo?demo.address:null;
    req.vvInitialLocation=demo?demo.location:null;req.vvDemoStreetView=demo?demo.streetView:null;
    const broker={slug:'richard-tremblay',full_name:agent.name,agency:agent.agency,phone:agent.phone,email:'',profile:{agent_name:agent.name,agency:agent.agency,agent_title:agent.title,agent_phone:agent.phone,agent_photo_url:agent.photo_url}};
    require('./broker-auth-v1').protect(res);
    res.set('Referrer-Policy','strict-origin-when-cross-origin');
    await h.renderBrokerPage(req,res,broker,false,true);
  }));
  router.get('/demarrer/:tag',endpoint(async(req,res)=>{
    const agent=await db.get('SELECT * FROM solicitation_agents WHERE tag=$1',[req.params.tag]);if(!agent)return res.sendStatus(404);
    require('./broker-auth-v1').protect(res);
    res.render('onboarding-mailing',Object.assign(await h.baseLocals(req),{agent,isHome:false,mailingOnboarding:true}));
  }));
  router.post('/api/courtier/demarrer',endpoint(async(req,res)=>{
    require('./broker-auth-v1').protect(res);
    const b=req.body||{},fr=req.lang!=='en';
    const message=fr?'Vérifiez votre courriel pour ouvrir votre espace. Si vous avez déjà un compte, utilisez Connexion courtier.':'Check your email to open your workspace. If you already have an account, use Broker sign-in.';
    const offer={amount:fr?'0 $':'$0',term:fr?'pour votre page':'for your page',includes:fr?'Réservée aux envois VendVite.':'Reserved for VendVite mailings.',billing:fr?'1,59 $ par lettre, avant taxes. Aucun abonnement à la page.':'$1.59 per letter, before tax. No page subscription.'};
    if(b.homepage_preview===true)return res.json({success:true,preview:true,message:fr?'Aucune inscription créée en aperçu.':'No account created in preview.',offer});
    if(b.mailing_terms!==true)return res.status(400).json({error:fr?'Acceptez l’usage réservé aux campagnes postales VendVite.':'Accept use exclusively with VendVite postal campaigns.'});
    const name=String(b.name||'').trim(),agency=String(b.agency||'').trim(),phone=String(b.phone||'').trim(),email=String(b.email||'').trim().toLowerCase();
    if(!name||name.length>120||!agency||agency.length>120||!phone||phone.length>40||email.length>190||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return res.status(400).json({error:fr?'Vérifiez le nom, l’agence, le téléphone et le courriel.':'Check your name, brokerage, phone and email.'});
    let agent=null;
    if(b.tag){agent=await db.get('SELECT * FROM solicitation_agents WHERE tag=$1',[String(b.tag)]);if(!agent)return res.status(400).json({error:'Invitation introuvable.'});}
    const key=crypto.createHash('sha256').update(email).digest('hex');
    const limit=await db.get("INSERT INTO mailing_signup_limits(key,last_at) VALUES($1,NOW()) ON CONFLICT(key) DO UPDATE SET last_at=NOW() WHERE mailing_signup_limits.last_at<NOW()-INTERVAL '2 minutes' RETURNING key",[key]);
    if(!limit)return res.status(429).json({error:fr?'Patientez deux minutes avant de réessayer.':'Wait two minutes before retrying.'});
    const existing=await db.get('SELECT * FROM brokers WHERE LOWER(email)=$1',[email]);
    if(existing){
      if(agent&&require('./mailing-language-v1').englishOnly(agent)){
        await db.run("UPDATE brokers SET profile=jsonb_set(COALESCE(profile,'{}'::jsonb),'{mailing_province}',to_jsonb($2::text),true) WHERE id=$1",[existing.id,require('./mailing-language-v1').province(agent)]);
        existing.profile=Object.assign({},existing.profile,{mailing_province:require('./mailing-language-v1').province(agent)});
      }
      if(require('./broker-auth-v1').allowed(existing))await h.brokerAuth.requestLink(req,email,async(broker,raw)=>h.sendMailingInvite(req,broker,raw));
      return res.json({success:true,message,offer});
    }
    const profile={agent_name:name,agency,agent_phone:phone,agent_email:email,agent_title:agent?agent.title:'',agent_photo_url:agent?agent.photo_url:'',links:[],mailing_terms_accepted_at:new Date().toISOString(),solicitation_tag:agent?agent.tag:null,mailing_province:agent?require('./mailing-language-v1').province(agent):null};
    const slug=await h.uniqueBrokerSlug(name,agency);
    const broker=await db.get("INSERT INTO brokers(slug,full_name,agency,phone,email,status,access_plan,profile) VALUES($1,$2,$3,$4,$5,'invited','mailing',$6) RETURNING *",[slug,name,agency,phone,email,JSON.stringify(profile)]);
    if(agent)await db.run('UPDATE solicitation_agents SET broker_id=$1 WHERE id=$2 AND broker_id IS NULL',[broker.id,agent.id]);
    const raw=await h.brokerAuth.mint(broker.id,'access');
    await h.sendMailingInvite(req,broker,raw);
    res.status(201).json({success:true,message,offer});
  }));
}
module.exports={parseAddresses,photoUrl,newTag,register};
