const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('crypto');
const {create,root}=require('./harness.cjs'),mail=require(root+'/mailing-service-v4');
test('sandbox letters reproduce recipient output with stable private QR codes, never production access',async()=>{
 const h=await create(),admin={'x-test-admin':'yes'},targets=[];
 h.services.qrcode.toDataURL=async url=>{targets.push(url);return ''};
 const get=(path,headers={})=>fetch(h.url+path,{headers,redirect:'manual'});
 try{
  const broker=await h.db.get("INSERT INTO brokers(slug,full_name,email,access_plan,status,published) VALUES('sandbox-print','Camille Exemple','qa@example.test','mailing','invited',1) RETURNING *");
  const other=await h.db.get("INSERT INTO brokers(slug,full_name,email,access_plan,status) VALUES('other-print','Other Broker','other@example.test','mailing','invited') RETURNING *");
  async function session(b){const raw=crypto.randomBytes(32).toString('hex');await h.db.run("INSERT INTO broker_sessions(broker_id,token_hash,device_label,idle_expires_at,absolute_expires_at) VALUES($1,$2,'QA',NOW()+INTERVAL '1 hour',NOW()+INTERVAL '1 hour')",[b.id,crypto.createHash('sha256').update(raw).digest('hex')]);return {cookie:'vv_broker_session='+raw};}
  const owner=await session(broker),stranger=await session(other),addresses=[{numero:'4410',rue:'Pl. de la Meuse',unit:'203',ville:'Laval',postal:'H7W 4Y4',lat:45.55,lng:-73.764},{numero:'123',rue:'Rue Exemple',ville:'Laval',postal:'H7W 4Y4'}];
  const campaign=await h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,is_test,paypal_mode,address_count,addresses) VALUES($1,'paid','pending_payment','pending',1,'sandbox',2,$2) RETURNING *",[broker.id,JSON.stringify(addresses)]),print='/admin/campagnes/'+campaign.id+'/lettres';
  assert.equal((await get(print,admin)).status,409);assert.equal((await h.db.get('SELECT mailing_token FROM broker_campaigns WHERE id=$1',[campaign.id])).mailing_token,null);
  await h.db.run("UPDATE broker_campaigns SET status='confirmed',payment_status='paid' WHERE id=$1",[campaign.id]);
  for(const headers of [{},owner,stranger])assert.equal((await get(print,headers)).status,302);
  const response=await get(print,admin);assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/private, no-store/);const html=await response.text();assert.equal((html.match(/<main class="letter/g)||[]).length,4);assert.equal((html.match(/class="sandbox-mark"/g)||[]).length,4);assert.match(html,/203-4410 Pl. de la Meuse/);assert.match(html,/TEST PAYPAL/);assert.doesNotMatch(html,/\/courrier\//);
  const saved=await h.db.get('SELECT * FROM broker_campaigns WHERE id=$1',[campaign.id]);assert.equal(saved.is_test,1);assert.equal(saved.payment_status,'paid');assert.equal(saved.status,'confirmed');assert.equal(saved.paypal_mode,'sandbox');assert.equal(saved.mailed_at,null);assert.notEqual(saved.addresses[0].mailing_id,saved.addresses[1].mailing_id);
  assert.equal(targets.length,4);for(const [i,a] of saved.addresses.entries())for(const lang of ['fr','en'])assert(targets.includes(h.url+'/courrier-test/'+saved.mailing_token+'/'+a.mailing_id+'?lang='+lang));
  await get(print,admin);assert.deepEqual((await h.db.get('SELECT addresses FROM broker_campaigns WHERE id=$1',[campaign.id])).addresses,saved.addresses);
  for(const a of saved.addresses){
   const testPath='/courrier-test/'+saved.mailing_token+'/'+a.mailing_id;
   for(const prefix of ['', '/pwa/vendvite'])for(const headers of [admin,owner]){const r=await get(prefix+testPath+'?lang=fr&address=Fake',headers);assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);const page=await r.text();assert(page.includes('window.VV_INITIAL_ADDRESS = '+JSON.stringify(mail.addressLines(a).join(', '))));assert.match(page,/window.VV_PAGE_PREVIEW = true/);assert.match(page,/window.VV_MAILING_TOKEN = null/);assert.match(page,/window.VV_MAILING_RECIPIENT = null/);assert.match(page,/Test PayPal — aperçu du destinataire/);}
   for(const headers of [{},stranger]){const r=await get(testPath,headers);assert.equal(r.status,302);assert.equal(r.headers.get('location'),'/');}
   assert.equal((await get('/courrier/'+saved.mailing_token+'/'+a.mailing_id,owner)).status,302);
   const lead=await fetch(h.url+'/api/courtier/'+broker.slug+'/piste',{method:'POST',headers:{...owner,'Content-Type':'application/json'},body:JSON.stringify({name:'Blocked',address:'123 Fake',mailingToken:saved.mailing_token,mailingRecipient:a.mailing_id})});assert.equal(lead.status,403);
  }
  for(const suffix of ['', '/'+ 'f'.repeat(32)])assert.equal((await get('/courrier-test/'+saved.mailing_token+suffix,owner)).status,302);
  // Either persisted sandbox indicator is sufficient to keep codes out of production.
  for(const [flag,mode] of [[0,'sandbox'],[1,'live']]){await h.db.run('UPDATE broker_campaigns SET is_test=$1,paypal_mode=$2 WHERE id=$3',[flag,mode,campaign.id]);assert.equal((await get(print,admin)).status,200);assert.equal(await mail.recipientForToken(h.db,saved.mailing_token,saved.addresses[0].mailing_id),null);}
  await h.db.run("UPDATE broker_campaigns SET is_test=0,paypal_mode='live' WHERE id=$1",[campaign.id]);assert.equal((await get('/courrier-test/'+saved.mailing_token+'/'+saved.addresses[0].mailing_id,admin)).status,302);const live=await get(print,admin);assert.doesNotMatch(await live.text(),/class="sandbox-mark"/);assert.equal((await get('/courrier/'+saved.mailing_token+'/'+saved.addresses[0].mailing_id)).status,200);
  await h.db.run("UPDATE broker_campaigns SET is_test=1,paypal_mode='sandbox',status='cancelled' WHERE id=$1",[campaign.id]);assert.equal((await get(print,admin)).status,409);assert.equal((await get('/courrier-test/'+saved.mailing_token+'/'+saved.addresses[0].mailing_id,owner)).status,302);
  assert.equal((await h.db.get('SELECT COUNT(*)::int AS n FROM broker_leads')).n,0);assert.equal(h.emails.length,0);
 }finally{await h.close();}
});
