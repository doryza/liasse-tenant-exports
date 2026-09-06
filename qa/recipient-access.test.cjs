const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('crypto');
const {create,root}=require('./harness.cjs'),mail=require(root+'/mailing-service-v4'),model=require(root+'/public/js/campaign-model-v1');
test('only an issued campaign/recipient pair authorizes a page and lead, including legacy accounts and owners',async()=>{
 const h=await create();
 async function request(path,body,headers={}){return fetch(h.url+path,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});}
 async function home(path,headers){const r=await request(path,undefined,headers);assert.equal(r.status,302,path);assert.equal(r.headers.get('location'),path.startsWith('/pwa/vendvite/')?'/pwa/vendvite/':'/');assert.match(r.headers.get('cache-control'),/no-store/);}
 try{
  const brokers=[];
  for(const plan of ['mailing','legacy'])brokers.push(await h.db.get("INSERT INTO brokers(slug,full_name,email,access_plan,status,published,membership_expires_at) VALUES($1,'QA Agent',$3,$2,'active',1,NOW()+INTERVAL '1 year') RETURNING *",['qa-'+plan,plan,'qa-'+plan+'@example.test']));
  const address={numero:'4410',rue:'Pl. de la Meuse',ville:'Laval',postal:'H7W 4Y4',lat:45.55,lng:-73.764};
  const campaigns=[];
  for(const broker of brokers){
   const c=await h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,addresses) VALUES($1,'paid','confirmed','paid',$2) RETURNING *",[broker.id,JSON.stringify([address])]);campaigns.push(await mail.prepareRecipients(h.db,c));
  }
  const c=campaigns[0],a=c.addresses[0],path='/courrier/'+c.mailing_token+'/'+a.mailing_id;
  const raw=crypto.randomBytes(32).toString('hex');await h.db.run("INSERT INTO broker_sessions(broker_id,token_hash,device_label,idle_expires_at,absolute_expires_at) VALUES($1,$2,'QA',NOW()+INTERVAL '1 hour',NOW()+INTERVAL '1 hour')",[brokers[0].id,crypto.createHash('sha256').update(raw).digest('hex')]);const owner={cookie:'vv_broker_session='+raw};
  for(const prefix of ['', '/pwa/vendvite']){
   for(const b of brokers)for(const suffix of ['', '?address=123+Fake&lat=45&lng=-73'])await home(prefix+'/'+b.slug+suffix,owner);
   for(const p of ['/courrier/'+c.mailing_token,'/courrier/'+c.mailing_token+'?address=123+Fake','/courrier/'+c.mailing_token+'/'+'f'.repeat(32),'/courrier/'+c.mailing_token+'/'+campaigns[1].addresses[0].mailing_id,'/courrier/invalid/'+a.mailing_id])await home(prefix+p);
   const valid=await request(prefix+path+'?address=123+Fake&lang=en');assert.equal(valid.status,200);assert.match(valid.headers.get('x-robots-tag'),/noindex/);assert.equal(valid.headers.get('referrer-policy'),'no-referrer');const html=await valid.text();assert.match(html,/window.VV_INITIAL_ADDRESS = "4410 Pl. de la Meuse, Laval QC H7W 4Y4"/);assert.ok(html.includes('window.VV_MAILING_RECIPIENT = "'+a.mailing_id+'"'));assert.ok(!html.includes(campaigns[1].mailing_token));
  }
  for(const [i,b] of brokers.entries()){
   const camp=campaigns[i],key=camp.addresses[0].mailing_id,lead={name:'Homeowner',address:'987 Updated address, Laval QC H7W 4Y4'},url='/api/courtier/'+b.slug+'/piste';
   for(const credentials of [{},{mailingToken:camp.mailing_token},{mailingRecipient:key},{mailingToken:camp.mailing_token,mailingRecipient:'f'.repeat(32)},{mailingToken:camp.mailing_token,mailingRecipient:campaigns[1-i].addresses[0].mailing_id},{mailingToken:campaigns[1-i].mailing_token,mailingRecipient:campaigns[1-i].addresses[0].mailing_id},{mailingToken:[camp.mailing_token],mailingRecipient:key}])assert.equal((await request(url,{...lead,...credentials},owner)).status,403,JSON.stringify(credentials));
   assert.equal((await request(url,{...lead,mailingToken:camp.mailing_token,mailingRecipient:key})).status,200);
   const saved=await h.db.all('SELECT address FROM broker_leads WHERE broker_id=$1',[b.id]);assert.deepEqual(saved.map(r=>r.address),[lead.address]);
  }
  // A copied private sample cannot submit leads, even for its signed-in owner.
  await h.db.run('INSERT INTO broker_campaign_drafts(broker_id,data) VALUES($1,$2)',[brokers[0].id,JSON.stringify({addresses:[address],selected:[model.key(address)]})]);
  const qrTargets=[];h.services.qrcode.toDataURL=async target=>{qrTargets.push(target);return ''};
  const proof=await request('/espace/lettre-proprietaires?proof=1',undefined,owner);assert.equal(proof.status,200);assert.match(await proof.text(),/Aperçu privé/);assert.deepEqual(qrTargets,[h.url+'/espace/apercu?proof=1']);
  const sample=await request('/espace/apercu?proof=1',undefined,owner);assert.equal(sample.status,200);const html=await sample.text();assert.match(html,/window.VV_PAGE_PREVIEW = true/);assert.match(html,/window.VV_INITIAL_ADDRESS = "4410 Pl. de la Meuse, Laval QC H7W 4Y4"/);assert.match(html,/window.VV_MAILING_TOKEN = null/);assert.match(html,/window.VV_MAILING_RECIPIENT = null/);
  const anonymous=await request('/espace/apercu?proof=1');assert.doesNotMatch(await anonymous.text(),/window.VV_INITIAL_ADDRESS/);
  assert.match(await (await request('/espace/page',undefined,owner)).text(),/window.VV_INITIAL_ADDRESS = null/);
  assert.equal((await request('/admin/campagnes/'+c.id+'/lettres',undefined,owner)).status,302);
  await h.db.run("UPDATE broker_campaigns SET kind='included',payment_status='none' WHERE id=$1",[c.id]);
  assert.equal((await request('/api/espace/campagne/'+c.id+'/territoire',undefined,owner)).status,404,'included campaigns must not expose recipient keys in territory APIs');
  const payload={name:'Blocked',address:'123 Test',mailingToken:c.mailing_token,mailingRecipient:a.mailing_id};
  for(const state of [{status:'cancelled',payment_status:'paid',is_test:0},{status:'confirmed',payment_status:'pending',is_test:0},{status:'confirmed',payment_status:'paid',is_test:1}]){
   await h.db.run('UPDATE broker_campaigns SET status=$1,payment_status=$2,is_test=$3 WHERE id=$4',[state.status,state.payment_status,state.is_test,c.id]);await home(path);assert.equal((await request('/api/courtier/'+brokers[0].slug+'/piste',payload,owner)).status,403);
  }
  await h.db.run("UPDATE broker_campaigns SET status='mailed',payment_status='paid',is_test=0 WHERE id=$1",[c.id]);assert.equal((await request(path)).status,200);
  await h.db.run('UPDATE brokers SET published=0 WHERE id=$1',[brokers[0].id]);await home(path);assert.equal((await request('/api/courtier/'+brokers[0].slug+'/piste',payload,owner)).status,403);
  assert.equal((await h.db.get('SELECT COUNT(*)::int AS n FROM broker_leads')).n,2);
 }finally{await h.close();}
});
