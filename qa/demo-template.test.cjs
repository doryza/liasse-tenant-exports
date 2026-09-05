const {test}=require('node:test'),assert=require('node:assert/strict');
const {create}=require('./harness.cjs');
test('demo and paying brokers use the same template, with isolated demo leads',async()=>{
 const h=await create();try{
  const app=h.server.listeners('request')[0],render=app.render.bind(app),views=[];
  app.render=(name,locals,done)=>{views.push({name,isDemo:locals.isDemo});return render(name,locals,done)};
  await h.db.run("INSERT INTO brokers(slug,full_name,email,agency,status,published,membership_expires_at,profile) VALUES ('qa-real','Actual Broker','real@example.test','Agency','active',1,NOW()+INTERVAL '1 year','{}')");
  await h.db.run("INSERT INTO admin_settings(key,value) VALUES ('stat_homes_sold','999'),('_p_agent_image_url','https://example.test/house-agent.jpg') ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value");
  await h.db.run("INSERT INTO testimonials(author,quote,published) VALUES ('House sample','Unrelated house testimonial',1)");
  for(const lang of ['fr','en']){
   let r=await fetch(h.url+'/richard-tremblay?lang='+lang);assert.equal(r.status,200);let html=await r.text();assert.deepEqual(views.at(-1),{name:'broker-page',isDemo:true});assert.match(html,/Richard Tremblay/);assert.match(html,/RE\/MAX/);assert.match(html,/id="addressInput"/);assert.match(html,/id="leadForm"/);assert.match(html,/window.VV_DEMO = true/);assert.equal((html.match(/<section /g)||[]).length,2);assert.doesNotMatch(html,/id="journal"|id="temoignages"|class="stats-band"/);assert.match(html,/class="bp-stats"/);
   r=await fetch(h.url+'/qa-real?lang='+lang);assert.equal(r.status,200);html=await r.text();assert.deepEqual(views.at(-1),{name:'broker-page',isDemo:false});assert.match(html,/window.VV_DEMO = false/);assert.doesNotMatch(html,/class="bp-demo"/);assert.doesNotMatch(html,/class="bp-stats"|id="temoignages"|Unrelated house testimonial|house-agent.jpg/);
  }
  await h.db.run("UPDATE brokers SET profile=$1 WHERE slug='qa-real'",[JSON.stringify({stat_homes:'35',stat_days:'',testimonials:[{author:'Own client',quote:'Broker-owned testimonial'}, {author:'',quote:'Incomplete'}]})]);
  const populated=await (await fetch(h.url+'/qa-real')).text();assert.match(populated,/Broker-owned testimonial/);assert.doesNotMatch(populated,/Unrelated house testimonial|Incomplete/);assert.match(populated,/<dd>35/);assert.equal((populated.match(/<section /g)||[]).length,3);
  const payload={name:'Demo Visitor',email:'demo@example.test',address:'123 Example Street'};
  for(const prefix of ['','/pwa/vendvite']){const r=await fetch(h.url+prefix+'/api/courtier/richard-tremblay/piste',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});assert.equal(r.status,200);assert.equal((await r.json()).demo,true);}
  assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM broker_leads')).n,0);assert.equal(h.emails.length,0);
  const r=await fetch(h.url+'/api/courtier/qa-real/piste',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});assert.equal(r.status,200);assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM broker_leads')).n,1);
 }finally{await h.close()}
});
