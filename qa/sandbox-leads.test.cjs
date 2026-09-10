const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),crypto=require('crypto');
const {create,root}=require('./harness.cjs'),Lead=require(root+'/lead-service-v2'),Outbox=require(root+'/notification-outbox-v2');
async function setup(){
 const h=await create();await h.pg.exec(fs.readFileSync(root+'/sandbox-migration-v1.sql','utf8'));
 const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,access_plan,published,profile) VALUES('sandbox-leads','QA Broker','broker@example.test','invited','mailing',1,$1::jsonb) RETURNING *",[JSON.stringify({agent_name:'QA Broker',agent_email:'broker@example.test'})]);
 const recipient={numero:'10',rue:'Rue Test',ville:'Montréal',province:'QC',postal:'H2X 1Y4',mailing_id:'a'.repeat(32)};
 const campaign=async(isTest,paypalMode)=>h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,is_test,paypal_mode,mailing_token,addresses,address_count,quantity) VALUES($1,'paid','mailed','paid',$2,$3,$4,$5::jsonb,1,1) RETURNING *",[b.id,isTest,paypalMode,crypto.randomBytes(24).toString('hex'),JSON.stringify([recipient])]);
 const live=await campaign(0,'live'),sandbox=await campaign(1,'sandbox');
 return {...h,b,recipient,live,sandbox,campaign,leads:Lead.create(h.services),outbox:Outbox.create(h.services)};
}
const input=overrides=>({name:'QA Homeowner',address:'10 Rue Test',email:'homeowner@example.test',phone:'',submissionKey:crypto.randomUUID(),...overrides});
const capture=(h,c,data=input())=>h.leads.capture({broker:h.b,origin:{campaign:c,recipient:h.recipient},input:data,workspaceUrl:h.url+'/espace/pistes?mode=test'});
test('sandbox lead attribution is authoritative, mode-isolated, deduplicated and cannot be changed by request fields',async()=>{
 const h=await setup();try{
  const data=input({isTest:false,is_test:0,delivery_mode:'email'});
  const testResult=await capture(h,{...h.sandbox,is_test:0,paypal_mode:'live'},data);assert.equal(testResult.isTest,true);
  assert.equal((await capture(h,h.sandbox,data)).duplicate,true);
  assert.equal((await capture(h,h.sandbox,{...data,submissionKey:crypto.randomUUID()})).duplicate,true);
  assert.equal((await capture(h,h.live,{...data,isTest:true,is_test:1})).isTest,false);
  const rows=await h.db.all('SELECT * FROM broker_leads ORDER BY id');assert.equal(rows.length,2);assert.equal(rows[0].is_test,1);assert.equal(rows[1].is_test,0);assert.equal(rows[0].campaign_id,h.sandbox.id);assert.equal(rows[0].recipient_id,h.recipient.mailing_id);
  await h.leads.update(h.b.id,rows[0].id,{notes:'Test notes',isTest:false,is_test:0,campaign_id:h.live.id});
  const retained=await h.db.get('SELECT * FROM broker_leads WHERE id=$1',[rows[0].id]);assert.equal(retained.is_test,1);assert.equal(retained.campaign_id,h.sandbox.id);
  await assert.rejects(h.leads.capture({broker:{...h.b,id:h.b.id+1},origin:{campaign:h.sandbox,recipient:h.recipient},input:input()}),e=>e.code==='ORIGIN_INVALID');
  const mismatched=await h.campaign(0,'sandbox');assert.equal((await capture(h,mismatched,input({name:'Conservative sandbox'}))).isTest,true);
 }finally{await h.close();}
});
test('sandbox agent and homeowner emails become durable labelled previews; live emails remain real and metrics stay separate',async()=>{
 const h=await setup();try{
  await capture(h,h.sandbox);await capture(h,h.live,input({name:'Real request'}));
  assert.equal((await h.outbox.summary()).pending,2);assert.equal((await h.outbox.summary({isTest:true})).pending,2);
  const result=await h.outbox.run({limit:10});assert.equal(result.sent,2);assert.equal(result.previewed,2);assert.equal(result.failed,0);assert.equal(h.emails.length,2);assert(h.emails.every(m=>!m.subject.startsWith('TEST')));
  const previews=await h.outbox.previews({brokerId:h.b.id,campaignId:h.sandbox.id});assert.equal(previews.length,2);assert.deepEqual(previews.map(p=>p.kind).sort(),['lead_agent','lead_receipt']);
  for(const p of previews){assert.equal(p.status,'sent');assert.equal(p.is_test,1);assert.equal(p.delivery_mode,'preview');assert(p.sent_at);assert.match(p.payload.subject,/^TEST \/ SIMULATION/);assert.match(p.payload.text,/No email was sent/);assert.match(p.payload.html,/data-vv-simulation/);}
  assert.equal((await h.outbox.preview({brokerId:h.b.id,id:previews[0].id})).id,previews[0].id);assert.equal(await h.outbox.preview({brokerId:h.b.id+1,id:previews[0].id}),null);assert.equal(await h.outbox.preview({id:previews[0].id}),null);assert.equal((await h.outbox.previews({brokerId:h.b.id+1})).length,0);
  assert.equal((await h.outbox.summary()).sent,2);assert.equal((await h.outbox.summary()).previewed,0);assert.equal((await h.outbox.summary({isTest:true})).sent,0);assert.equal((await h.outbox.summary({isTest:true})).previewed,2);
  assert.equal((await h.outbox.list()).length,2);assert((await h.outbox.list()).every(j=>j.is_test===0));assert((await h.outbox.list({isTest:true})).every(j=>j.is_test===1));
  assert.equal((await h.outbox.run()).previewed,0);assert.equal(h.emails.length,2);
 }finally{await h.close();}
});
test('test rehearsal queues an overdue reminder without touching live or foreign leads; contact cancels the queued reminder',async()=>{
 const h=await setup();try{
  await capture(h,h.sandbox);await capture(h,h.live);const testLead=await h.db.get('SELECT * FROM broker_leads WHERE is_test=1'),liveLead=await h.db.get('SELECT * FROM broker_leads WHERE is_test=0');
  await h.outbox.run();const sentBefore=h.emails.length;
  await assert.rejects(h.leads.rehearseOverdue({brokerId:h.b.id,leadId:liveLead.id}),e=>e.code==='TEST_LEAD_REQUIRED');
  await assert.rejects(h.leads.rehearseOverdue({brokerId:h.b.id+1,leadId:testLead.id}),e=>e.code==='TEST_LEAD_REQUIRED');
  const rehearsal=await h.leads.rehearseOverdue({brokerId:h.b.id,leadId:testLead.id});assert.equal(rehearsal.isTest,true);assert.equal(rehearsal.status,'pending');
  assert.equal((await h.outbox.run()).previewed,1);assert.equal(h.emails.length,sentBefore);const reminder=await h.outbox.preview({brokerId:h.b.id,id:rehearsal.jobId});assert.equal(reminder.kind,'lead_reminder');assert.match(reminder.payload.subject,/retard|overdue/);assert.match(reminder.payload.text,/mode=test/);
  assert.equal((await h.leads.rehearseOverdue({brokerId:h.b.id,leadId:testLead.id})).jobId,rehearsal.jobId);assert.equal((await h.outbox.run()).previewed,0);
  assert.equal(String((await h.db.get('SELECT response_due_at FROM broker_leads WHERE id=$1',[liveLead.id])).response_due_at),String(liveLead.response_due_at));
  const second=await h.campaign(1,'sandbox');await capture(h,second,input({name:'Handled test'}));const another=await h.db.get('SELECT * FROM broker_leads WHERE campaign_id=$1',[second.id]);await h.leads.rehearseOverdue({brokerId:h.b.id,leadId:another.id});await h.leads.update(h.b.id,another.id,{status:'contacté'});assert.equal((await h.outbox.run()).cancelled,1);
  await assert.rejects(h.leads.rehearseOverdue({brokerId:h.b.id,leadId:another.id}),e=>e.code==='TEST_LEAD_REQUIRED');
  await assert.rejects(h.leads.update(h.b.id,another.id,{status:'évalué'}),e=>e.code==='DELIVERY_REQUIRED');
  const delivered=await h.leads.update(h.b.id,another.id,{status:'évalué',deliveryAcknowledged:true,deliveryMethod:'email',deliveryReference:'Sandbox rehearsal only'});assert.equal(delivered.is_test,1);assert(delivered.analysis_delivered_at);assert.equal(h.emails.length,sentBefore);
 }finally{await h.close();}
});
test('scheduled overdue reminders and legacy sandbox producers are protected at the delivery boundary',async()=>{
 const h=await setup();try{
  await capture(h,h.sandbox);const lead=await h.db.get('SELECT * FROM broker_leads');await h.db.run("UPDATE broker_leads SET response_due_at=NOW()-INTERVAL '1 hour' WHERE id=$1",[lead.id]);
  assert.equal(await h.leads.enqueueOverdue(),1);assert.equal(await h.leads.enqueueOverdue(),0);
  const stale=await h.db.get("INSERT INTO notification_jobs(job_key,kind,payload,broker_id,campaign_id) VALUES('old-test-producer','email',$1::jsonb,$2,$3) RETURNING id",[JSON.stringify({to:'do-not-send@example.test',subject:'Old job',text:'Stored by old producer'}),h.b.id,h.sandbox.id]);
  h.services.email.send=async()=>{throw Error('Sandbox must never call the email provider');};const result=await h.outbox.run({limit:10});assert.equal(result.previewed,4);assert.equal(result.failed,0);assert.equal(result.sent,0);
  const stored=await h.outbox.preview({brokerId:h.b.id,id:stale.id});assert.equal(stored.delivery_mode,'preview');assert.equal(stored.is_test,1);
  const immutable=await h.outbox.enqueue('old-test-producer',{to:'new@example.test',subject:'Try switching mode'},{brokerId:h.b.id,campaignId:h.live.id});assert.equal(immutable.delivery_mode,'preview');assert.equal((await h.outbox.preview({brokerId:h.b.id,id:stale.id})).payload.to,'do-not-send@example.test');
  const invoice=await h.outbox.enqueue('invoice:legacy-test:preview',{to:'broker@example.test',subject:'Invoice'},{brokerId:h.b.id,isTest:true});assert.equal(invoice.delivery_mode,'preview');assert.equal((await h.outbox.run()).previewed,1);
 }finally{await h.close();}
});
test('immediate preview generation is scoped to owned test jobs and leaves real email pending',async()=>{
 const h=await setup();try{
  await capture(h,h.sandbox);await capture(h,h.live,input({name:'Real pending request'}));
  const initial=await h.outbox.run({isTest:true,brokerId:h.b.id+1});assert.equal(initial.previewed,0);assert.equal(initial.sent,0);
  const result=await h.outbox.run({isTest:true,brokerId:h.b.id});assert.equal(result.previewed,2);assert.equal(result.sent,0);assert.equal(h.emails.length,0);assert.equal((await h.outbox.summary()).pending,2);
  assert.equal((await h.outbox.run({isTest:false})).sent,2);assert.equal(h.emails.length,2);
 }finally{await h.close();}
});
test('sandbox preview failures use durable retries and retain preview-only delivery after an interrupted lease',async()=>{
 const h=await setup();try{
  await capture(h,h.sandbox);let fail=true;const wrapped={...h.services,db:{...h.db,run:async(sql,args)=>{if(fail&&sql.includes("SET is_test=1,delivery_mode='preview',payload")){fail=false;throw Error('Simulated preview storage failure');}return h.db.run(sql,args);}}};
  const outbox=Outbox.create(wrapped);let result=await outbox.run({limit:2});assert.equal(result.failed,1);assert.equal(result.previewed,1);assert.equal(h.emails.length,0);assert.equal((await outbox.summary({isTest:true})).retrying,1);
  const job=await h.db.get("SELECT * FROM notification_jobs WHERE status='failed'");await h.db.run("UPDATE notification_jobs SET status='sending',lease_until=NOW()-INTERVAL '1 minute' WHERE id=$1",[job.id]);result=await outbox.run();assert.equal(result.previewed,1);assert.equal(result.sent,0);assert.equal(h.emails.length,0);assert.equal((await h.db.get('SELECT delivery_mode FROM notification_jobs WHERE id=$1',[job.id])).delivery_mode,'preview');
 }finally{await h.close();}
});
test('test contact validation and concurrent per-recipient limit match live protection',async()=>{
 const h=await setup();try{
  await assert.rejects(capture(h,h.sandbox,input({email:'',phone:''})),e=>e.code==='CONTACT_REQUIRED');await assert.rejects(capture(h,h.sandbox,input({website:'bot'})),e=>e.code==='SPAM');
  const results=await Promise.allSettled(Array.from({length:8},(_,i)=>capture(h,h.sandbox,input({name:'Test homeowner '+i}))));assert.equal(results.filter(r=>r.status==='fulfilled').length,5);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.code==='RATE_LIMIT').length,3);assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM broker_leads WHERE is_test=1')).n,5);assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM notification_jobs WHERE is_test=1 AND delivery_mode=\'preview\'')).n,10);
  assert.equal((await capture(h,h.live,input({name:'Live limit independent'}))).success,true);
 }finally{await h.close();}
});
async function session(h,brokerId=h.b.id){const raw=crypto.randomBytes(32).toString('hex');await h.db.run("INSERT INTO broker_sessions(broker_id,token_hash,idle_expires_at,absolute_expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour',NOW()+INTERVAL '1 hour')",[brokerId,crypto.createHash('sha256').update(raw).digest('hex')]);return {cookie:'vv_broker_session='+raw,'X-VV-CSRF':crypto.createHash('sha256').update('csrf:'+raw).digest('hex'),Origin:h.url,'Content-Type':'application/json'};}
test('private test homeowner route resumes after sign-in, enforces owner/admin and CSRF, and isolates real recipient endpoints and inboxes',async()=>{
 const h=await setup();try{
  const path='/courrier-test/'+h.sandbox.mailing_token+'/'+h.recipient.mailing_id,headers=await session(h),url=h.url+'/api/courtier/'+h.b.slug+'/piste-test',data={...input({name:'QA Test Journey'}),mailingToken:h.sandbox.mailing_token,mailingRecipient:h.recipient.mailing_id};
  let r=await fetch(h.url+path,{redirect:'manual'});assert.equal(r.status,302);const login=new URL(r.headers.get('location'),h.url);assert.equal(login.pathname,'/connexion');assert.equal(login.searchParams.get('next'),path.slice(1));
  r=await fetch(h.url+path,{headers});assert.equal(r.status,200,await r.clone().text());let html=await r.text();assert.match(html,/window.VV_SANDBOX = true/);assert.match(html,/piste-test/);assert.match(html,/Envoyer ma demande de test/);assert.match(html,/espace\/pistes\?mode=test/);assert.match(html,/window.VV_ACTIVITY = null/);assert.match(r.headers.get('cache-control'),/no-store/);
  const post=(body=data,hdr=headers)=>fetch(url,{method:'POST',headers:hdr,body:JSON.stringify(body)});
  assert.equal((await post(data,{'Content-Type':'application/json',Origin:h.url})).status,401);
  assert.equal((await post(data,{...headers,'X-VV-CSRF':'wrong'})).status,403);assert.equal((await post(data,{...headers,Origin:'https://evil.example'})).status,403);
  assert.equal((await post({...data,mailingToken:h.live.mailing_token})).status,403);
  r=await fetch(h.url+'/api/courtier/'+h.b.slug+'/piste',{method:'POST',headers,body:JSON.stringify(data)});assert.equal(r.status,403);
  const other=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,access_plan,published) VALUES('other-owner','Other Owner','other@example.test','invited','mailing',1) RETURNING id");const foreign=await session(h,other.id);assert.equal((await post(data,foreign)).status,404);assert.equal((await fetch(h.url+path,{headers:foreign})).status,404);
  r=await post();assert.equal(r.status,200,await r.clone().text());assert.equal((await r.json()).isTest,true);assert.equal(h.emails.length,0);assert.equal((await h.outbox.summary({isTest:true})).previewed,2);
  const liveData=input({name:'Real Homeowner Kept Separate'});await capture(h,h.live,liveData);
  r=await fetch(h.url+'/api/espace/leads',{headers});assert.deepEqual((await r.json()).leads.map(l=>l.name),[liveData.name]);
  r=await fetch(h.url+'/api/espace/leads?mode=test',{headers});const lead=(await r.json()).leads[0];assert.equal(lead.name,data.name);assert.equal(lead.is_test,1);
  r=await fetch(h.url+'/espace/pistes?mode=test',{headers});assert.equal(r.status,200,await r.clone().text());html=await r.text();assert.match(html,/Demandes de test/);assert.match(html,/data-test-overdue/);assert.match(html,/Remise simulée|remise simulée/);assert.doesNotMatch(html,/Real Homeowner Kept Separate/);assert.doesNotMatch(html,/href="mailto:homeowner@example.test/);
  r=await fetch(h.url+'/espace/pistes',{headers});html=await r.text();assert.match(html,/Real Homeowner Kept Separate/);assert.doesNotMatch(html,/QA Test Journey/);
  r=await fetch(h.url+'/api/espace/tests/leads/'+lead.id+'/overdue',{method:'POST',headers,body:'{}'});assert.equal(r.status,200,await r.clone().text());
  r=await fetch(h.url+'/api/espace/leads/'+lead.id,{method:'PUT',headers,body:JSON.stringify({status:'contacté'})});assert.equal(r.status,200);assert((await r.json()).lead.contacted_at);
  r=await fetch(h.url+'/api/espace/leads/'+lead.id,{method:'PUT',headers,body:JSON.stringify({status:'évalué',deliveryAcknowledged:true,deliveryMethod:'email',deliveryReference:'Simulated only'})});assert.equal(r.status,200);const delivered=(await r.json()).lead;assert.equal(delivered.is_test,1);assert(delivered.analysis_delivered_at);assert.equal(h.emails.length,0);
  r=await post({...input({name:'Operator Rehearsal'}),mailingToken:h.sandbox.mailing_token,mailingRecipient:h.recipient.mailing_id},{'x-test-admin':'yes','Content-Type':'application/json',Origin:h.url});assert.equal(r.status,200,await r.clone().text());assert.equal(h.emails.length,0);
 }finally{await h.close();}
});
test('signed test mode visibly identifies shared real profile edits only in the page editor',async()=>{
 const h=await setup();try{
  const headers=await session(h);let r=await fetch(h.url+'/espace/page?lang=en',{headers});assert.equal(r.status,200);assert.doesNotMatch(await r.text(),/data-sandbox-profile-boundary/);
  const raw=headers.cookie.split('=')[1],signed=crypto.createHmac('sha256',raw).update('vendvite-sandbox:'+h.b.id).digest('hex'),testHeaders={...headers,cookie:headers.cookie+'; vv_sandbox_mode='+signed};
  r=await fetch(h.url+'/espace/page?lang=en',{headers:testHeaders});assert.equal(r.status,200,await r.clone().text());const html=await r.text();assert.match(html,/data-sandbox-profile-boundary/);assert.match(html,/Changes saved here also apply to your real page/);assert.match(html,/Turn off test mode before changing/);
  r=await fetch(h.url+'/espace/apercu?lang=en',{headers:testHeaders});assert.equal(r.status,200);const generic=await r.text();assert.doesNotMatch(generic,/data-sandbox-profile-boundary/);assert.match(generic,/window.VV_SANDBOX = false/);assert.match(generic,/window.VV_MAILING_TOKEN = null/);
  assert.equal(h.emails.length,0);
 }finally{await h.close();}
});
