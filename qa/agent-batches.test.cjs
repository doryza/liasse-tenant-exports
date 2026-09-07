const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,root}=require('./harness.cjs');
const admin={'x-test-admin':'yes'};
const raw='Alex Example {Example Realty, Sales Representative, 416 555-0100, }\n123 TEST ST\nTORONTO ON M5V 2T6';
function jar(r){return r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');}
test('campaign sent workflow preserves recipients, filters and advances; province controls printing and full English onboarding',async()=>{
 const h=await create();
 async function req(path,body,headers={}){return fetch(h.url+path,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});}
 try{
  const en=await (await req('/api/admin/sollicitations',{name:'Batch English',format:'en',template:'vendvite',addresses:raw},admin)).json();
  const qc=await (await req('/api/admin/sollicitations',{name:'Batch Quebec',format:'duplex',template:'vendvite',addresses:raw.replace('TORONTO ON M5V 2T6','LAVAL QC H7W 4Y4')},admin)).json();
  await h.db.run('UPDATE solicitation_campaigns SET batch_number=id');
  await h.db.run("UPDATE solicitation_agents SET source_meta=$1 WHERE campaign_id=$2",[JSON.stringify({province:'ON'}),en.id]);
  const original=await h.db.get('SELECT * FROM solicitation_agents WHERE campaign_id=$1',[en.id]);
  const endpoint='/api/admin/sollicitations/'+en.id+'/sent';
  assert.equal((await req(endpoint,{sent:true})).status,401);
  assert.equal((await req(endpoint,{sent:true},{...admin,origin:'https://evil.test'})).status,403);
  assert.equal((await req(endpoint,{sent:'yes'},admin)).status,400);
  assert.equal((await req('/api/admin/sollicitations/999/sent',{sent:true},admin)).status,404);
  const marked=await (await req(endpoint,{sent:true},admin)).json();assert.equal(marked.nextCampaignId,qc.id);assert.ok(marked.sent_at);
  assert.equal((await (await req(endpoint,{sent:true},admin)).json()).sent_at,marked.sent_at);
  let list=await (await req('/admin/sollicitations?status=pending',undefined,admin)).text();assert.doesNotMatch(list,/Batch English/);assert.match(list,/Batch Quebec/);
  list=await (await req('/admin/sollicitations?status=sent',undefined,admin)).text();assert.match(list,/Batch English/);
  assert.equal((await (await req(endpoint,{sent:false},admin)).json()).nextCampaignId,en.id);
  assert.deepEqual(await h.db.get('SELECT * FROM solicitation_agents WHERE id=$1',[original.id]),original);
  for(const [id,languages] of [[en.id,['en']],[qc.id,['fr','en']]]){
   const html=await (await req('/admin/sollicitations/'+id+'/imprimer',undefined,admin)).text();assert.deepEqual([...html.matchAll(/class="sheet" lang="(.*?)"/g)].map(m=>m[1]),languages);
  }
  const detail=await (await req('/pwa/vendvite/admin/sollicitations/'+en.id,undefined,admin)).text();assert.match(detail,/data-advance="true"/);assert.match(detail,/\?lang=en/);
  for(const path of ['/invitation/'+original.tag,'/demarrer/'+original.tag]){
   const r=await req(path+'?lang=fr',undefined,{cookie:'pwa_lang=fr'});const html=await r.text();assert.equal(r.status,200);assert.match(html,/<html lang="en">/);assert.doesNotMatch(html,/class="inv-lang"|class="footer-lang|OACIQ/);
  }
  const signup=await req('/api/courtier/demarrer?lang=fr',{name:original.name,agency:original.agency,phone:original.phone,email:'english@example.test',tag:original.tag,mailing_terms:true},{cookie:'pwa_lang=fr'});assert.equal(signup.status,201);assert.match((await signup.json()).message,/Check your email/);
  assert.equal(h.emails.length,1);assert.equal(h.emails[0].subject,'VendVite — Your workspace is ready');
  const b=await h.db.get("SELECT * FROM brokers WHERE email='english@example.test'");assert.equal(b.profile.mailing_province,'ON');
  const url=new URL(h.emails[0].text.match(/https?:\/\/\S+\/acces\/[a-f0-9]{64}\?\S+/)[0]);assert.equal(url.searchParams.get('lang'),'en');
  const access=await req(url.pathname+'?lang=fr');const ah=await access.text();assert.match(ah,/<html lang="en">/);const challenge=ah.match(/name="challenge" value="([^"]*)"/)[1];
  const confirm=await req(url.pathname,{challenge,next:'espace/page'},{cookie:jar(access)});assert.equal(confirm.status,303);const cookie=jar(confirm)+'; pwa_lang=fr';
  for(const path of ['/espace','/espace/page','/espace/courrier-cible','/espace/compte']){
   const r=await req(path+'?lang=fr',undefined,{cookie});assert.equal(r.status,200,path);const html=await r.text();assert.match(html,/<html lang="en">/,path);assert.doesNotMatch(html,/class="inv-lang"|href="espace\/page\?lang=fr"|data-proof-lang="fr"/,path);
  }
  const proof=await (await req('/espace/lettre-proprietaires?lang=fr',undefined,{cookie})).text();assert.deepEqual([...proof.matchAll(/class="letter[^"]*" lang="(.*?)"/g)].map(m=>m[1]),['en']);
  await h.db.run("UPDATE solicitation_campaigns SET batch_summary='{\"archived\":true}' WHERE id=$1",[qc.id]);assert.equal((await req('/admin/sollicitations/'+qc.id+'/imprimer',undefined,admin)).status,409);
  const archived=await (await req('/admin/sollicitations/'+qc.id,undefined,admin)).text();assert.match(archived,/Test archivé/);assert.doesNotMatch(archived,/data-campaign-sent/);
 }finally{await h.close()}
});
