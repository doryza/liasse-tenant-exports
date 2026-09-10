'use strict';
const crypto=require('crypto'),language=require('./mailing-language-v1');
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function error(code,fr,en,lang,status=400){const e=Error(lang==='en'?en:fr);e.code=code;e.status=status;return e;}
function validate(input,lang='fr'){
 const name=String(input.name||'').trim().slice(0,120),address=String(input.address||'').trim().slice(0,300),email=String(input.email||'').trim().toLowerCase(),phone=String(input.phone||'').trim();
 if(!name||!address)throw error('REQUIRED','Indiquez votre nom et l’adresse de la propriété.','Enter your name and property address.',lang);
 if(!email&&!phone)throw error('CONTACT_REQUIRED','Indiquez un courriel ou un numéro de téléphone pour que votre courtier puisse vous joindre.','Enter an email or phone number so your broker can reach you.',lang);
 if(email&&(email.length>190||! /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)))throw error('EMAIL_INVALID','Vérifiez votre adresse courriel.','Check your email address.',lang);
 const digits=phone.replace(/\D/g,'');
 if(phone&&(phone.length>40||! /^[+\d\s().-]+$/.test(phone)||digits.length<10||digits.length>15||/^(\d)\1+$/.test(digits)))throw error('PHONE_INVALID','Indiquez un numéro valide, avec l’indicatif régional.','Enter a valid phone number including its area code.',lang);
 if(/[\u0000-\u001f]/.test(name+address+email+phone))throw error('REQUIRED','Vérifiez les renseignements saisis.','Check the information entered.',lang);
 return {name,address,email,phone,timeframe:String(input.timeframe||'').trim().slice(0,80),lat:input.lat!==''&&Number.isFinite(Number(input.lat))&&Math.abs(Number(input.lat))<=90?Number(input.lat):null,lng:input.lng!==''&&Number.isFinite(Number(input.lng))&&Math.abs(Number(input.lng))<=180?Number(input.lng):null};
}
function profile(b){try{return typeof b.profile==='string'?JSON.parse(b.profile):b.profile||{};}catch(_){return {};}}
function email(to,subject,paragraphs,link,label){return {to,subject,text:paragraphs.join('\n\n')+(link?'\n\n'+label+': '+link:''),html:'<div style="font-family:Arial,sans-serif;max-width:580px;padding:28px;color:#242124"><h1 style="font-size:24px">'+esc(subject)+'</h1>'+paragraphs.map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join('')+(link?'<p><a href="'+esc(link)+'">'+esc(label)+'</a></p>':'')+'</div>'};}
function brokerMessage(b,lead,url,reminder=false){const en=language.englishOnly(b),p=profile(b);return email(p.agent_email||b.email,en?(reminder?'Follow-up overdue — ':'New analysis request — ')+lead.name:(reminder?'Suivi en retard — ':'Nouvelle demande d’analyse — ')+lead.name,[en?(reminder?'This homeowner has been waiting more than 24 hours. Contact them and record the follow-up in your workspace.':'Please contact this homeowner within 24 hours. You prepare and deliver the comparative market analysis; record contact and delivery in your workspace.'):(reminder?'Ce propriétaire attend depuis plus de 24 heures. Contactez-le et consignez votre suivi dans votre espace.':'Contactez ce propriétaire dans les 24 heures. Vous préparez et remettez l’analyse comparative de marché; consignez le contact et la remise dans votre espace.'),[lead.name,lead.address,lead.email,lead.phone,lead.timeframe].filter(Boolean).join('\n')],url,en?'Open requests':'Ouvrir mes demandes');}
function receipt(b,lead,lang){const en=lang==='en',p=profile(b),name=p.agent_name||b.full_name;return email(lead.email,en?'Your analysis request was received':'Votre demande d’analyse a été reçue',[en?'Hello '+lead.name+', your request for '+lead.address+' has been saved and sent to '+name+'.':'Bonjour '+lead.name+', votre demande pour '+lead.address+' a été enregistrée et transmise à '+name+'.',en?'Your broker will contact you to discuss your property, prepare the comparative market analysis, and agree with you on when and how it will be delivered. This is a personal service, not an automatic valuation.':'Votre courtier vous contactera pour discuter de votre propriété, préparer l’analyse comparative de marché et convenir avec vous du moment et du mode de remise. Il s’agit d’un service personnalisé, pas d’une estimation automatique.',[name,p.agent_email||b.email,p.agent_phone||b.phone].filter(Boolean).join(' · ')]);}
function testWorkspaceUrl(url){try{const parsed=new URL(url||'https://vendvite.app/espace/pistes');parsed.searchParams.set('mode','test');return parsed.href;}catch(_){return 'https://vendvite.app/espace/pistes?mode=test';}}
function create(services){
 const db=services.db,outbox=require('./notification-outbox-v2').create(services);
 async function capture({broker,origin,input,lang='fr',workspaceUrl}){
  const l=validate(input,lang);
  // Origin is authenticated by the recipient route; persisted ownership and mode
  // remain authoritative even if a caller supplies a stale origin object.
  const campaign=await db.get('SELECT id,broker_id,is_test,paypal_mode FROM broker_campaigns WHERE id=$1 AND broker_id=$2',[origin&&origin.campaign&&origin.campaign.id,broker.id]);
  if(!campaign)throw error('ORIGIN_INVALID','Cette lettre n’est pas disponible.','This letter is not available.',lang,404);
  const isTest=Number(campaign.is_test)===1||campaign.paypal_mode==='sandbox',mode=isTest?1:0;
  if(!origin.recipient||!origin.recipient.mailing_id)throw error('ORIGIN_INVALID','Cette lettre n’est pas disponible.','This letter is not available.',lang,404);
  if(input.website)throw error('SPAM','La demande n’a pas été envoyée.','The request was not sent.',lang);
  const key=String(input.submissionKey||'');if(!/^[a-zA-Z0-9_-]{16,100}$/.test(key))throw error('REQUEST_KEY','Rechargez la page puis réessayez.','Reload the page and try again.',lang);
  const duplicate=hash([origin.campaign.id,origin.recipient.mailing_id,l.name.toLowerCase(),l.address.toLowerCase(),l.email,l.phone.replace(/\D/g,'')].join('|'));
  const existing=await db.get("SELECT id FROM broker_leads WHERE broker_id=$1 AND is_test=$4 AND (submission_key=$2 OR (duplicate_key=$3 AND created_at>NOW()-INTERVAL '10 minutes')) ORDER BY id LIMIT 1",[broker.id,key,duplicate,mode]);
  if(existing)return {success:true,duplicate:true,isTest};
  const count=await db.get("SELECT COUNT(*)::int AS n FROM broker_leads WHERE campaign_id=$1 AND recipient_id=$2 AND is_test=$3 AND created_at>NOW()-INTERVAL '24 hours'",[origin.campaign.id,origin.recipient.mailing_id,mode]);
  if(Number(count.n)>=5)throw error('RATE_LIMIT','Plusieurs demandes ont déjà été reçues pour cette lettre. Contactez votre courtier directement ou réessayez demain.','Several requests have already been received for this letter. Contact your broker directly or try again tomorrow.',lang,429);
  const messages=[{kind:'lead_agent',payload:brokerMessage(broker,l,isTest?testWorkspaceUrl(workspaceUrl):workspaceUrl)}];if(l.email)messages.push({kind:'lead_receipt',payload:receipt(broker,l,lang)});
  if(isTest)for(const message of messages)message.payload=require('./notification-outbox-v2').simulatePayload(message.payload);
  // One statement commits both the request and its durable email jobs.
  const row=await db.get("WITH gate AS (INSERT INTO lead_request_limits(scope_hash) VALUES($15) ON CONFLICT(scope_hash) DO UPDATE SET requests=CASE WHEN lead_request_limits.window_started_at<=NOW()-INTERVAL '24 hours' THEN 1 ELSE lead_request_limits.requests+1 END,window_started_at=CASE WHEN lead_request_limits.window_started_at<=NOW()-INTERVAL '24 hours' THEN NOW() ELSE lead_request_limits.window_started_at END WHERE lead_request_limits.requests<5 OR lead_request_limits.window_started_at<=NOW()-INTERVAL '24 hours' RETURNING scope_hash), lead AS (INSERT INTO broker_leads(broker_id,name,email,phone,address,lat,lng,timeframe,status,campaign_id,recipient_id,lang,submission_key,duplicate_key,duplicate_window,response_due_at,is_test) SELECT $1,$2,$3,$4,$5,$6,$7,$8,'nouveau',$9,$10,$11,$12,$13,FLOOR(EXTRACT(EPOCH FROM NOW())/600)::bigint,NOW()+INTERVAL '24 hours',$16 FROM gate ON CONFLICT DO NOTHING RETURNING *), jobs AS (INSERT INTO notification_jobs(job_key,kind,payload,broker_id,lead_id,campaign_id,is_test,delivery_mode) SELECT 'lead:'||lead.id||':'||(j->>'kind'),j->>'kind',j->'payload',lead.broker_id,lead.id,lead.campaign_id,lead.is_test,CASE WHEN lead.is_test=1 THEN 'preview' ELSE 'email' END FROM lead CROSS JOIN jsonb_array_elements($14::jsonb) j RETURNING id) SELECT (SELECT id FROM lead) AS id,(SELECT COUNT(*) FROM gate)::int AS admitted,(SELECT COUNT(*) FROM jobs) AS jobs",[broker.id,l.name,l.email,l.phone,l.address,l.lat,l.lng,l.timeframe,origin.campaign.id,origin.recipient.mailing_id,lang,key,duplicate,JSON.stringify(messages),hash(mode+'/'+origin.campaign.id+'/'+origin.recipient.mailing_id),mode]);
  if(!row.admitted)throw error('RATE_LIMIT','Plusieurs demandes ont déjà été reçues pour cette lettre. Contactez votre courtier directement ou réessayez demain.','Several requests have already been received for this letter. Contact your broker directly or try again tomorrow.',lang,429);
  return {success:true,duplicate:!row.id,isTest};
 }
 async function update(brokerId,id,input,lang='fr'){
  const owned=await db.get('SELECT * FROM broker_leads WHERE id=$1 AND broker_id=$2',[id,brokerId]);if(!owned)throw error('NOT_FOUND','Demande introuvable.','Request not found.',lang,404);
  const status=input.status?String(input.status):owned.status;if(!['nouveau','contacté','évalué','fermé'].includes(status))throw error('INVALID_STATUS','Statut invalide.','Invalid status.',lang);
  const delivery=status==='évalué'&&!owned.analysis_delivered_at;
  if(delivery&&(input.deliveryAcknowledged!==true||!['email','phone','in_person','other'].includes(input.deliveryMethod)))throw error('DELIVERY_REQUIRED','Confirmez la remise de l’analyse et indiquez le mode utilisé.','Confirm that the analysis was delivered and select how.',lang);
  const reference=String(input.deliveryReference||'').trim().slice(0,500);
  if(delivery&&input.deliveryMethod==='other'&&!reference)throw error('DELIVERY_REQUIRED','Précisez comment l’analyse a été remise.','Describe how the analysis was delivered.',lang);
  // Marking an analysis delivered records a broker attestation. It never sends
  // the report or claims to validate a third-party document.
  const notes=input.notes==null?null:String(input.notes).slice(0,4000);
  return db.get("UPDATE broker_leads SET status=$1,notes=COALESCE($2,notes),contacted_at=CASE WHEN $1 IN ('contacté','évalué') THEN COALESCE(contacted_at,NOW()) ELSE contacted_at END,analysis_delivered_at=CASE WHEN $3 THEN COALESCE(analysis_delivered_at,NOW()) ELSE analysis_delivered_at END,delivery_method=CASE WHEN $3 AND analysis_delivered_at IS NULL THEN $4 ELSE delivery_method END,delivery_reference=CASE WHEN $3 AND analysis_delivered_at IS NULL THEN $5 ELSE delivery_reference END,updated_at=NOW() WHERE id=$6 AND broker_id=$7 RETURNING *",[status,notes,delivery,input.deliveryMethod||null,reference||null,id,brokerId]);
 }
 async function enqueueOverdue({limit=100,workspaceUrl='https://vendvite.app/espace/pistes'}={}){
  const rows=await db.all("SELECT l.*,row_to_json(b) AS broker FROM broker_leads l JOIN brokers b ON b.id=l.broker_id WHERE l.response_due_at<=NOW() AND l.contacted_at IS NULL AND l.analysis_delivered_at IS NULL AND l.status<>'fermé' AND NOT EXISTS(SELECT 1 FROM notification_jobs n WHERE n.job_key='lead:'||l.id||':reminder') ORDER BY l.response_due_at LIMIT $1",[Math.min(500,Math.max(1,Number(limit)||100))]);
  for(const l of rows)await outbox.enqueue('lead:'+l.id+':reminder',brokerMessage(l.broker,l,Number(l.is_test)===1?testWorkspaceUrl(workspaceUrl):workspaceUrl,true),{kind:'lead_reminder',brokerId:l.broker_id,leadId:l.id,campaignId:l.campaign_id,isTest:Number(l.is_test)===1});
  return rows.length;
 }
 async function rehearseOverdue({brokerId,leadId,workspaceUrl='https://vendvite.app/espace/pistes?mode=test',lang='fr'}={}){
  // This shortcut exists only for an owned test request; it cannot accelerate a
  // real homeowner's reminder or reopen a request already handled by the broker.
  const lead=await db.get("UPDATE broker_leads l SET response_due_at=NOW()-INTERVAL '1 second',updated_at=NOW() WHERE l.id=$1 AND l.broker_id=$2 AND l.is_test=1 AND l.contacted_at IS NULL AND l.analysis_delivered_at IS NULL AND l.status<>'fermé' AND EXISTS(SELECT 1 FROM broker_campaigns c WHERE c.id=l.campaign_id AND c.broker_id=l.broker_id AND (c.is_test=1 OR c.paypal_mode='sandbox')) RETURNING l.*",[leadId,brokerId]);
  if(!lead)throw error('TEST_LEAD_REQUIRED','Choisissez une demande de test qui attend encore un suivi.','Choose a test request that is still awaiting follow-up.',lang,404);
  const broker=await db.get('SELECT * FROM brokers WHERE id=$1',[brokerId]);
  const job=await outbox.enqueue('lead:'+lead.id+':reminder',brokerMessage(broker,lead,testWorkspaceUrl(workspaceUrl),true),{kind:'lead_reminder',brokerId,leadId:lead.id,campaignId:lead.campaign_id,isTest:true});
  return {success:true,leadId:lead.id,jobId:job.id,status:job.status,isTest:true};
 }
 return {capture,update,enqueueOverdue,rehearseOverdue};
}
module.exports={create,validate,brokerMessage,receipt};
