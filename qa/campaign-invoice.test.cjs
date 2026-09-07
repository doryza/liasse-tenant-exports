const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('crypto'),fs=require('fs'),os=require('os'),path=require('path'),{execFileSync}=require('child_process');
const {create,root}=require('./harness.cjs'),pdfTools=require(root+'/invoice-v3');
function pdfText(pdf){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vv-invoice-'));try{fs.writeFileSync(dir+'/invoice.pdf',pdf);return execFileSync('pdftotext',['-layout',dir+'/invoice.pdf','-'],{encoding:'utf8'});}finally{fs.rmSync(dir,{recursive:true,force:true});}}
async function fixture(h,mode='sandbox',state='pending'){
 const name='invoice-'+crypto.randomBytes(4).toString('hex');
 const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,agency,status,published,access_plan) VALUES($1,'Camille Exemple',$2,'Agence Exemple','invited',1,'mailing') RETURNING *",[name,name+'@example.test']);
 const c=await h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,paypal_order_id,paypal_capture_id,paypal_mode,is_test,quantity,address_count,centre_label,subtotal_cents,gst_cents,qst_cents,total_cents) VALUES($1,'paid',$2,$3,$4,$5,$6,$7,150,150,'1383 Boulevard Élisabeth, Laval',23850,1193,2379,27422) RETURNING *",[b.id,state==='paid'?'confirmed':'pending_payment',state,name+'-order',state==='paid'?name+'-capture':null,mode,mode==='sandbox'?1:0]);
 const raw=crypto.randomBytes(32).toString('hex');await h.db.run("INSERT INTO broker_sessions(broker_id,token_hash,idle_expires_at,absolute_expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour',NOW()+INTERVAL '1 hour')",[b.id,crypto.createHash('sha256').update(raw).digest('hex')]);
 return {b,c,cookie:'vv_broker_session='+raw,url:h.url+'/espace/campagne/retour?token='+c.paypal_order_id+'&mode='+mode};
}
function mockPaypal(h){
 const calls=[];Object.assign(h.services.externalVars,{PAYPAL_CLIENT_ID:'mock',PAYPAL_CLIENT_SECRET:'mock',PAYPAL_SANDBOX_CLIENT_ID:'mock',PAYPAL_SANDBOX_CLIENT_SECRET:'mock'});
 h.services.fetch=async(url,options)=>{calls.push(url);if(url.endsWith('/v1/oauth2/token'))return {ok:true,json:async()=>({access_token:'fake'})};assert.match(url,/\/v2\/checkout\/orders\//);return {ok:true,json:async()=>url.endsWith('/capture')?{status:'COMPLETED',purchase_units:[{payments:{captures:[{id:url.split('/').at(-2)+'-capture'}]}}]}:{status:'APPROVED'}};};
 return calls;
}
const admin={'x-test-admin':'yes','Content-Type':'application/json'};
const send=(h,id,headers=admin,body={})=>fetch(h.url+'/api/admin/ventes/factures/'+id+'/envoyer',{method:'POST',headers,body:JSON.stringify(body)});

test('confirmed campaign payments email an accurate PDF once in live and sandbox mode',async()=>{
 const h=await create(),calls=mockPaypal(h);h.services.config.contactEmail='operator@example.test';
 await h.db.run("UPDATE admin_settings SET value='1' WHERE key='invoice_attach_pdf'");
 try{for(const mode of ['live','sandbox']){
  const f=await fixture(h,mode);const r=await fetch(f.url,{headers:{cookie:f.cookie},redirect:'manual'});assert.equal(r.status,302);
  const i=await h.db.get('SELECT * FROM broker_invoices WHERE campaign_id=$1',[f.c.id]);assert(i.emailed_at);assert.equal(i.total_cents,27422);
  const emails=h.emails.filter(e=>e.to===f.b.email);assert.equal(emails.length,1);const email=emails[0];assert.equal(email.attachments.length,1);assert.equal(email.attachments[0].filename,i.invoice_number+'.pdf');assert.match(email.text,/150/);assert.match(email.text,/274,22/);assert.doesNotMatch(email.text,/599|annuel|licence/);
  const text=pdfText(Buffer.from(email.attachments[0].content,'base64'));assert.match(text,/Campagne postale VendVite/);assert.match(text,/150 lettres/);assert.match(text,/238,50/);assert.match(text,/11,93/);assert.match(text,/23,79/);assert.match(text,/274,22/);assert.doesNotMatch(text,/Abonnement|Période couverte|1970/);
  if(mode==='sandbox'){assert.match(text,/TOTAL SIMULÉ/);assert.match(email.text,/aucun courrier ne sera posté/);}else{assert.match(text,/TOTAL PAYÉ/);assert.doesNotMatch(email.text,/sous 72 heures/);assert.doesNotMatch(email.subject,/TEST/);}
  const before=calls.length;await fetch(f.url,{headers:{cookie:f.cookie},redirect:'manual'});assert.equal(calls.length,before,'Already paid returns do not recapture');assert.equal(h.emails.filter(e=>e.to===f.b.email).length,1);
  const own=await fetch(h.url+'/espace/factures/'+i.id+'/pdf',{headers:{cookie:f.cookie}});assert.equal(own.status,200);assert.match(pdfText(Buffer.from(await own.arrayBuffer())),/150 lettres/);
  const anonymous=await fetch(h.url+'/espace/factures/'+i.id+'/pdf',{redirect:'manual'});assert.equal(anonymous.status,302);
  const outsider=await fixture(h);assert.equal((await fetch(h.url+'/espace/factures/'+i.id+'/pdf',{headers:{cookie:outsider.cookie}})).status,404);
 }}finally{await h.close();}
});

test('email errors, skipped sends and operator failures keep invoices retryable without changing paid status',async()=>{
 const h=await create();mockPaypal(h);h.services.config.contactEmail='operator@example.test';
 try{for(const failed of [{success:false},{skipped:true},{error:{message:'provider rejected'}},null,'throw']){
  const f=await fixture(h);h.services.email.send=async()=>{if(failed==='throw')throw Error('Provider unavailable');return failed;};
  assert.equal((await fetch(f.url,{headers:{cookie:f.cookie},redirect:'manual'})).status,302);
  let i=await h.db.get('SELECT * FROM broker_invoices WHERE campaign_id=$1',[f.c.id]);assert.equal(i.emailed_at,null);assert.equal(i.email_claimed_at,null);assert(i.email_error);assert.equal((await h.db.get('SELECT payment_status FROM broker_campaigns WHERE id=$1',[f.c.id])).payment_status,'paid');
  h.services.email.send=async m=>{h.emails.push(m);return {success:true,response:{headers:{'x-message-id':'mock-message'}}};};
  assert.equal((await send(h,i.id)).status,200);i=await h.db.get('SELECT * FROM broker_invoices WHERE id=$1',[i.id]);assert(i.emailed_at);assert.equal(i.email_message_id,'mock-message');assert.equal(i.email_error,null);
 }
 const f=await fixture(h);h.services.email.send=async m=>{if(m.to===h.services.config.contactEmail)throw Error('Operator mailbox unavailable');h.emails.push(m);return {success:true};};await fetch(f.url,{headers:{cookie:f.cookie},redirect:'manual'});assert((await h.db.get('SELECT emailed_at FROM broker_invoices WHERE campaign_id=$1',[f.c.id])).emailed_at);
 }finally{await h.close();}
});

test('existing invoices send to their recorded broker only; concurrent sends and unauthorized requests cannot duplicate them',async()=>{
 const h=await create();mockPaypal(h);
 try{
  const f=await fixture(h,'sandbox','paid');const i=await h.db.get("INSERT INTO broker_invoices(broker_id,kind,campaign_id,invoice_number,payment_key,payment_time,subtotal_cents,gst_cents,qst_cents,total_cents,is_test,paypal_mode) VALUES($1,'campagne',$2,'VV-TEST-2026-000034','old-camille-key',NOW(),23850,1193,2379,27422,1,'sandbox') RETURNING *",[f.b.id,f.c.id]);
  assert.equal((await send(h,i.id,{'Content-Type':'application/json'})).status,403);assert.equal((await send(h,i.id,{...admin,origin:'https://evil.test'})).status,403);assert.equal((await send(h,i.id,{...admin,'sec-fetch-site':'cross-site'})).status,403);assert.equal((await send(h,999999)).status,404);
  let release,entered;const waiting=new Promise(r=>entered=r),gate=new Promise(r=>release=r);h.services.email.send=async m=>{h.emails.push(m);entered();await gate;return {success:true};};
  const first=send(h,i.id,admin,{to:'unwanted@example.test'});await waiting;const second=await send(h,i.id);assert.equal(second.status,202);release();assert.equal((await first).status,200);
  const third=await send(h,i.id);assert.equal((await third.json()).status,'already_sent');assert.equal(h.emails.length,1);assert.equal(h.emails[0].to,f.b.email);
  const adminPdf=await fetch(h.url+'/admin/ventes/factures/'+i.id+'/pdf',{headers:admin});assert.match(pdfText(Buffer.from(await adminPdf.arrayBuffer())),/150 lettres/);
  const pending=await fixture(h);await h.db.run('UPDATE broker_invoices SET campaign_id=$1,emailed_at=NULL WHERE id=$2',[pending.c.id,i.id]);assert.equal((await send(h,i.id)).status,502);assert.equal(h.emails.length,1);
 }finally{await h.close();}
});

test('legacy subscription PDFs retain their subscription description',()=>{
 const text=pdfText(pdfTools.buildInvoicePdf({invoice_number:'VV-2026-000001',payment_time:'2026-09-06',period_start:'2026-09-06',period_end:'2027-09-06',subtotal_cents:59900,gst_cents:2995,qst_cents:5975,total_cents:68870,kind:'subscription'}, {full_name:'Agent Exemple'},{}));
 assert.match(text,/Abonnement annuel VendVite/);assert.match(text,/Période couverte/);assert.match(text,/688,70/);assert.doesNotMatch(text,/Campagne postale/);
});
