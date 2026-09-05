const {test}=require('node:test'),assert=require('node:assert/strict');
const {create}=require('./harness.cjs');
test('demo and paying brokers use the same template, with isolated demo leads',async()=>{
 const h=await create();try{
  const app=h.server.listeners('request')[0],render=app.render.bind(app),views=[];
  app.render=(name,locals,done)=>{views.push({name,isDemo:locals.isDemo});return render(name,locals,done)};
  await h.db.run("INSERT INTO brokers(slug,full_name,email,agency,status,published,membership_expires_at,profile) VALUES ('qa-real','Actual Broker','real@example.test','Agency','active',1,NOW()+INTERVAL '1 year','{}')");
  for(const lang of ['fr','en']){
   let r=await fetch(h.url+'/richard-tremblay?lang='+lang);assert.equal(r.status,200);let html=await r.text();assert.deepEqual(views.at(-1),{name:'broker-page',isDemo:true});assert.match(html,/Richard Tremblay/);assert.match(html,/RE\/MAX/);assert.match(html,/id="addressInput"/);assert.match(html,/id="leadForm"/);assert.match(html,/window.VV_DEMO = true/);
   r=await fetch(h.url+'/qa-real?lang='+lang);assert.equal(r.status,200);html=await r.text();assert.deepEqual(views.at(-1),{name:'broker-page',isDemo:false});assert.match(html,/window.VV_DEMO = false/);assert.doesNotMatch(html,/class="bp-demo"/);
  }
  const payload={name:'Demo Visitor',email:'demo@example.test',address:'123 Example Street'};
  for(const prefix of ['','/pwa/vendvite']){const r=await fetch(h.url+prefix+'/api/courtier/richard-tremblay/piste',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});assert.equal(r.status,200);assert.equal((await r.json()).demo,true);}
  assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM broker_leads')).n,0);assert.equal(h.emails.length,0);
  const r=await fetch(h.url+'/api/courtier/qa-real/piste',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});assert.equal(r.status,200);assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM broker_leads')).n,1);
 }finally{await h.close()}
});
