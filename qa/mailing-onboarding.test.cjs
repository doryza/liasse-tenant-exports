const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,root}=require('./harness.cjs');
const tools=require(root+'/solicitation-v1'),mailing=require(root+'/mailing-service-v4'),authModule=require(root+'/broker-auth-v1');
const raw='Marie Tremblay {"Agence, Exemple", Courtier immobilier, 514 555-0100, https://example.test/marie.jpg}\n1234 RUE DES ÉRABLES\nLAVAL QC H7W 4Y4';
function jar(r){return r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');}
test('strict agent parsing separates identity from delivery lines',()=>{
 const a=tools.parseAddresses(raw)[0];assert.equal(a.agency,'Agence, Exemple');assert.equal(a.address1,'1234 RUE DES ÉRABLES');assert.equal(a.title,'Courtier immobilier');
 assert.throws(()=>tools.parseAddresses(raw+'\nExtra'),/Trois lignes/);
 assert.throws(()=>tools.parseAddresses(raw+'\n\n'+raw),/double/);
 assert.throws(()=>tools.parseAddresses(raw.replace('https://example.test/marie.jpg','javascript:alert(1)')),/HTTPS/);
 assert.equal(tools.parseAddresses('A {"agency":"B","title":"C","phone":"123","headshot_url":""}\n12 RUE TEST\nLAVAL QC H7W 4Y4')[0].agency,'B');
});
test('saved campaigns, personalized demos, free onboarding and campaign-only capture',async()=>{
 const h=await create();h.services.qrcode=require('/home/liassetech/liasse.tech/node_modules/qrcode');
 const auth=authModule.create(h.services);
 async function req(path,body,headers={}){return fetch(h.url+path,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});}
 const admin={'x-test-admin':'yes'};
 try{
  assert.equal((await req('/api/admin/sollicitations',{addresses:raw})).status,401);
  assert.equal((await req('/api/admin/sollicitations/preview',{addresses:raw},{...admin,origin:'https://evil.test'})).status,403);
  const create=await req('/api/admin/sollicitations',{name:'QA campaign',format:'duplex',template:'vendvite',addresses:raw},admin);assert.equal(create.status,201);const c=await create.json();assert.equal(c.count,1);
  const agent=await h.db.get('SELECT * FROM solicitation_agents WHERE campaign_id=$1',[c.id]);assert.match(agent.tag,/^VV-[a-f0-9]{32}$/);
  for(const path of ['/admin/sollicitations','/admin/sollicitations/'+c.id,'/admin/sollicitations/'+c.id+'/imprimer']){const r=await req(path,undefined,admin);assert.equal(r.status,200,path);const html=await r.text();assert.match(html,/Marie Tremblay/);if(path.endsWith('imprimer')){assert.equal((html.match(/class="sheet"/g)||[]).length,2);const windows=[...html.matchAll(/class="address">(.*?)<\/div>/gs)];assert.equal(windows.length,2);windows.forEach(w=>{assert.doesNotMatch(w[1],/Marie|Agence|514|https:/);assert.match(w[1],/1234 RUE/);});}}
  const demo=await req('/pwa/vendvite/invitation/'+agent.tag+'?lang=fr');assert.equal(demo.status,200);const html=await demo.text();assert.match(html,/4410 Pl\. de la Meuse/);assert.match(html,/Marie Tremblay/);assert.match(html,/window.VV_DEMO = true/);assert.match(html,/demarrer\/VV-/);assert.match(html,/0 \$/);
  assert.equal((await req('/demarrer/'+agent.tag)).status,200);
  const body={name:'Marie Tremblay',agency:'Agence Exemple',phone:'5145550100',email:'qa@example.test',tag:agent.tag,mailing_terms:true};
  assert.equal((await req('/api/courtier/demarrer',{...body,mailing_terms:false})).status,400);
  const signup=await req('/api/courtier/demarrer',body);assert.equal(signup.status,201);assert.equal(h.emails.length,1);assert.match(h.emails[0].text,/0 \$/);
  const broker=await h.db.get('SELECT * FROM brokers WHERE email=$1',[body.email]);assert.equal(broker.access_plan,'mailing');assert.equal(broker.profile.agent_photo_url,'https://example.test/marie.jpg');assert.equal(broker.profile.solicitation_tag,agent.tag);assert.ok(mailing.access(broker));assert.equal(broker.membership_expires_at,null);
  // Authenticate with the normal emailed-link challenge/confirmation protocol.
  const token=h.emails[0].text.match(/\/acces\/([a-f0-9]{64})/)[1];const access=await req('/acces/'+token);const challenge=(await access.text()).match(/name="challenge" value="([^"]*)"/)[1];const confirm=await req('/acces/'+token,{challenge,next:'espace/page'},{cookie:jar(access)});assert.equal(confirm.status,303);const cookie=jar(confirm);
  const session=await req('/api/espace/session',undefined,{cookie});const csrf=(await session.json()).csrf;const headers={cookie,'x-vv-csrf':csrf};
  const account=await req('/espace/abonnement',undefined,{cookie});assert.equal(account.status,200);assert.doesNotMatch(await account.text(),/id="subBtn"|id="cancelBtn"/);
  const studio=await req('/espace/courrier-cible',undefined,{cookie});assert.equal(studio.status,200);assert.match(await studio.text(),/credit: 0/);
  assert.equal((await req('/api/espace/abonnement',{},headers)).status,409);
  assert.equal((await req('/api/espace/publier',{published:true},headers)).status,200);
  const direct=await req('/'+broker.slug);assert.notEqual(direct.status,200,'free page is not a standalone public website');
  const lead={name:'Homeowner',address:'123 Test',email:'home@example.test'};
  assert.equal((await req('/api/courtier/'+broker.slug+'/piste',lead)).status,403);
  const paid=await h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,addresses) VALUES($1,'paid','confirmed','paid',$2) RETURNING *",[broker.id,JSON.stringify([{numero:'1234',rue:'RUE TEST',ville:'LAVAL',postal:'H7W 4Y4',unit:'2'}])]);
  const production=await req('/admin/campagnes/'+paid.id+'/lettres',undefined,admin);assert.equal(production.status,200);const letter=await production.text();assert.match(letter,/2-1234 RUE TEST/);assert.match(letter,/H7W 4Y4/);
  const refreshed=await h.db.get('SELECT * FROM broker_campaigns WHERE id=$1',[paid.id]);assert.match(refreshed.mailing_token,/^[a-f0-9]{48}$/);
  const recipient=refreshed.addresses[0].mailing_id;
  assert.equal((await req('/courrier/'+refreshed.mailing_token)).status,302);
  assert.equal((await req('/courrier/'+refreshed.mailing_token+'/'+recipient)).status,200);
  assert.equal((await req('/api/courtier/'+broker.slug+'/piste',{...lead,mailingToken:refreshed.mailing_token,mailingRecipient:recipient})).status,200);
  await h.db.run("UPDATE broker_campaigns SET status='cancelled' WHERE id=$1",[paid.id]);assert.equal((await req('/courrier/'+refreshed.mailing_token+'/'+recipient)).status,302);assert.equal((await req('/api/courtier/'+broker.slug+'/piste',{...lead,mailingToken:refreshed.mailing_token,mailingRecipient:recipient})).status,403);
 }finally{await h.close();}
});
