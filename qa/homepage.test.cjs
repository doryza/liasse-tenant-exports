const assert=require('node:assert/strict'), {test}=require('node:test');
const {create,root}=require('./harness.cjs');
const exp=require(root+'/homepage-experiment-v1');
const headers={'user-agent':'Vendvite QA browser','content-type':'application/json'};
test('homepage experiment: persisted assignments, attribution, exclusions and bounded winner selection',async()=>{
 const h=await create();
 try{
  const base=h.url;
  const get=(url,extra={})=>fetch(base+url,{headers:{...headers,...extra}});
  const post=(url,body,cookie)=>fetch(base+url,{method:'POST',headers:{...headers,cookie:cookie||''},body:JSON.stringify(body)});
  const response=await get('/');assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/no-store/);
  const cookie=response.headers.get('set-cookie').split(';')[0],html=await response.text();
  const variant=html.match(/data-variant="(.*?)"/)[1];
  assert.match(await (await get('/?lang=en',{cookie})).text(),new RegExp('data-variant="'+variant+'"'));
  const payload={name:'Test Broker',agency:'QA',target_region:'Montreal',phone:'5145550100',email:'qa@example.test'};
  for(const v of ['visible','gated']){
   const page=await get('/?vv_preview='+v);const body=await page.text();
   assert.equal(body.includes('599'),v==='visible');assert.equal(page.headers.get('set-cookie'),null);
   const result=await (await post('/api/courtier/candidature',{...payload,homepage_preview:true},cookie)).json();assert.ok(result.preview);assert.ok(result.offer.amount.includes('599'));
  }
  assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM brokers')).n,0);assert.equal(h.emails.length,0);
  await get('/',{'user-agent':'Googlebot'});await get('/',{'x-test-admin':'yes'});assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM homepage_visitors')).n,1);
  for(let i=0;i<3;i++)await post('/api/homepage/event',{event:'view'},cookie);
  await post('/api/homepage/event',{event:'start'},cookie);
  assert.equal((await post('/api/courtier/candidature',{...payload,email:'bad'},cookie)).status,400);
  let submit=await post('/api/courtier/candidature',payload,cookie);assert.equal(submit.status,200);assert.ok((await submit.json()).offer.amount.includes('599'));
  await post('/api/courtier/candidature',payload,cookie);
  const ex=exp.create(h.services);let counts=await ex.results();assert.equal(counts[0].visitors,1);assert.equal(counts[0].applications,1);assert.equal(counts[0].starts,1);
  const other=await get('/');const otherCookie=other.headers.get('set-cookie').split(';')[0];await post('/api/homepage/event',{event:'view'},otherCookie);await post('/api/courtier/candidature',payload,otherCookie);
  assert.equal((await h.db.get('SELECT COUNT(broker_id)::int n FROM homepage_visitors')).n,1);
  const broker=await h.db.get('SELECT id FROM brokers LIMIT 1');
  const invoice=async(key,mode,kind)=>h.db.run("INSERT INTO broker_invoices (broker_id,payment_key,payment_time,subtotal_cents,total_cents,is_test,paypal_mode,kind) VALUES ($1,$2,NOW(),59900,68870,$3,$4,$5)",[broker.id,key,mode==='sandbox'?1:0,mode,kind]);
  await invoice('sandbox','sandbox','subscription');await invoice('campaign','live','campaign');assert.equal((await ex.results()).reduce((s,r)=>s+r.paid,0),0);
  await invoice('paid','live','subscription');await invoice('renewal','live','subscription');assert.equal((await ex.results()).reduce((s,r)=>s+r.paid,0),1);
  const denied=await fetch(base+'/admin/conversions',{redirect:'manual'});assert.equal(denied.status,302);
  assert.equal((await get('/admin/conversions',{'x-test-admin':'yes'})).status,200);
  assert.equal((await get('/pwa/vendvite/?vv_preview=gated')).status,200);
  assert.equal(exp.decide({paid:0,visitors:250},{paid:0,visitors:250}),null);
  assert.equal(exp.decide({paid:55,visitors:250},{paid:50,visitors:250}),null);
  assert.equal(exp.decide({paid:60,visitors:250},{paid:5,visitors:250}),'visible');
  assert.equal(exp.decide({paid:5,visitors:250},{paid:60,visitors:250}),'gated');
  // Create a complete fixed cohort with matured payment windows.
  await h.pg.exec('TRUNCATE homepage_visitors,broker_invoices,broker_tokens,broker_events,brokers RESTART IDENTITY CASCADE');
  await h.pg.exec("UPDATE homepage_experiments SET checked_at=NULL,next_look=0,winner=NULL; INSERT INTO brokers(id,slug,full_name,email) SELECT n,'b'||n,'Broker','b'||n||'@example.test' FROM generate_series(1,500)n; INSERT INTO homepage_visitors(experiment,visitor_id,variant,exposed_at,applied_at,broker_id) SELECT 'homepage-price-v1',lpad(to_hex(n),32,'0'),CASE WHEN n<=250 THEN 'visible' ELSE 'gated' END,NOW()-INTERVAL '15 days',NOW()-INTERVAL '15 days',n FROM generate_series(1,500)n; INSERT INTO broker_invoices(broker_id,payment_key,payment_time,subtotal_cents,total_cents,kind,is_test,paypal_mode) SELECT n,'p'||n,NOW()-INTERVAL '14 days',59900,68870,'subscription',0,'live' FROM generate_series(1,60)n;");
  await ex.evaluate();const state=await ex.state();assert.equal(state.winner,'visible');assert.equal(state.next_look,1);
  // Paid outside the conversion window never enters the decision.
  await h.pg.exec("UPDATE homepage_experiments SET winner=NULL,checked_at=NULL,next_look=0; UPDATE broker_invoices SET payment_time=NOW();");
  await ex.evaluate();assert.equal((await ex.state()).winner,null);assert.equal((await ex.state()).next_look,1);
  // Immature cohorts do not consume a planned look.
  await h.pg.exec("UPDATE homepage_experiments SET checked_at=NULL,next_look=0;UPDATE homepage_visitors SET exposed_at=NOW();");
  await ex.evaluate();assert.equal((await ex.state()).next_look,0);
  console.log('Integration checks passed: both mounts, safe previews, no price leak, unique attribution, live-only payments, winner and maturity rules.');
 }finally{await h.close()}
});
