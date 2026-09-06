const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,root}=require('./harness.cjs'),mail=require(root+'/mailing-service-v2');
test('recipient links stay stable, private and specific to confirmed mailings',async()=>{
 const h=await create();
 try{
  const broker=await h.db.get("INSERT INTO brokers(slug,full_name,email,access_plan,status,published) VALUES('recipient-test','QA Agent','qa@example.test','mailing','invited',1) RETURNING *");
  const addresses=[{numero:'4410',rue:'Pl. de la Meuse',unit:'2',ville:'Laval',province:'QC',postal:'H7W 4Y4',lat:45.55,lng:-73.764},{numero:'123',rue:'rue Autre',ville:'Laval',postal:'H7W 4Y4'}];
  const campaign=await h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,addresses) VALUES($1,'paid','confirmed','paid',$2) RETURNING *",[broker.id,JSON.stringify(addresses)]);
  const [one,two]=await Promise.all([mail.prepareRecipients(h.db,campaign),mail.prepareRecipients(h.db,campaign)]);
  assert.deepEqual(one.addresses,two.addresses,'simultaneous prints must agree on recipient codes');
  assert.equal(one.mailing_token,two.mailing_token);assert.notEqual(one.addresses[0].mailing_id,one.addresses[1].mailing_id);
  const prefix='/courrier/'+one.mailing_token;
  for(const [i,a] of one.addresses.entries()){
   const response=await fetch(h.url+prefix+'/'+a.mailing_id+'?lang=fr');assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/private, no-store/);
   const html=await response.text();assert.ok(html.includes('window.VV_INITIAL_ADDRESS = '+JSON.stringify(mail.addressLines(a).join(', '))));
   assert.ok(!html.includes(one.addresses[1-i].mailing_id));
  }
  assert.equal((await fetch(h.url+prefix+'/'+'f'.repeat(32))).status,404);
  assert.equal((await fetch(h.url+prefix)).status,200,'old printed campaign links still work');
  const admin={'x-test-admin':'yes'};
  await h.db.run("UPDATE broker_campaigns SET status='pending_payment',payment_status='pending' WHERE id=$1",[campaign.id]);
  assert.equal((await fetch(h.url+'/admin/campagnes/'+campaign.id+'/lettres',{headers:admin})).status,409);
  assert.equal((await fetch(h.url+prefix+'/'+one.addresses[0].mailing_id)).status,404);
  await h.db.run("UPDATE broker_campaigns SET kind='included',payment_status='none',status='confirmed' WHERE id=$1",[campaign.id]);
  assert.equal((await fetch(h.url+prefix+'/'+one.addresses[0].mailing_id)).status,200,'purchased legacy mailing credits remain usable');
  await h.db.run("UPDATE broker_campaigns SET status='cancelled' WHERE id=$1",[campaign.id]);assert.equal((await fetch(h.url+prefix)).status,404);
 }finally{await h.close();}
});
test('the mailing deadline is 72 elapsed hours, including weekends',()=>{
 for(const start of ['2026-09-04T21:00:00-04:00','2026-11-01T00:30:00-04:00','2026-03-07T23:30:00-05:00'])assert.equal(mail.deadline(start).getTime()-new Date(start).getTime(),72*3600000);
});
