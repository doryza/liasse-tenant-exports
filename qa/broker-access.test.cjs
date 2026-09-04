const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('crypto');
const {create,root}=require('./harness.cjs');const authTools=require(root+'/broker-auth-v1');
function jar(res,old={}){for(const entry of res.headers.getSetCookie()){const item=entry.split(';')[0],i=item.indexOf('=');old[item.slice(0,i)]=item.slice(i+1);}return old;}
function cookies(j){return Object.entries(j).map(([k,v])=>k+'='+v).join('; ');}
function hidden(html,name){const m=html.match(new RegExp('name="'+name+'" value="([^"]*)"'));assert.ok(m,'hidden '+name);return m[1];}
test('broker access, session lifecycle, rate limits, CSRF and workspace save guarantees',async()=>{
 const h=await create(),auth=authTools.create(h.services),base=h.url;
 const headers={'user-agent':'Broker QA browser','content-type':'application/json'};
 async function request(path,{method='GET',body,j={},extra={}}={}){return fetch(base+path,{method,redirect:'manual',headers:{...headers,cookie:cookies(j),...extra},body:body===undefined?undefined:JSON.stringify(body)});}
 async function broker(status='invited',suffix='one'){return h.db.get("INSERT INTO brokers(slug,full_name,email,status,profile) VALUES ($1,'Test Broker',$2,$3,$4) RETURNING *",['qa-'+suffix,suffix+'@example.test',status,JSON.stringify({agent_name:'Test Broker',agent_email:suffix+'@example.test'})]);}
 async function signIn(b,prefix=''){
  const token=await auth.mint(b.id,'access');const get=await request(prefix+'/acces/'+token);assert.equal(get.status,200);const j=jar(get),html=await get.text();
  const confirm=await request(prefix+'/acces/'+token,{method:'POST',j,body:{challenge:hidden(html,'challenge'),next:'espace'}});assert.equal(confirm.status,303);jar(confirm,j);assert.ok(j.vv_broker_session);return {j,token};
 }
 try{
  const b=await broker();const pending=await broker('applied','pending'),refused=await broker('refused','refused');
  await assert.rejects(()=>auth.mint(pending.id,'access'));
  let redirect=await request('/espace');assert.equal(redirect.status,302);assert.match(redirect.headers.get('location'),/connexion/);
  // Merely following, previewing or scanning the email never consumes a link.
  const token=await auth.mint(b.id,'access');await request('/acces/'+token,{method:'HEAD'});const first=await request('/acces/'+token);let j=jar(first),page=await first.text();
  assert.equal((await h.db.get('SELECT used_at FROM broker_tokens WHERE token_hash=$1',[authTools.hash(token)])).used_at,null);
  assert.match(first.headers.get('cache-control'),/private, no-store/);assert.equal(first.headers.get('referrer-policy'),'no-referrer');assert.ok(first.headers.get('x-liasse-owner'));
  const challenge=hidden(page,'challenge');const bad=await request('/acces/'+token,{method:'POST',j,body:{challenge:'bad'}});assert.equal(bad.status,403);
  assert.equal((await request('/acces/'+token,{method:'POST',j,body:{challenge},extra:{origin:'null','sec-fetch-site':'cross-site'}})).status,403);
  const race=await Promise.all([1,2].map(()=>request('/acces/'+token,{method:'POST',j,body:{challenge,next:'https://evil.test'},extra:{origin:'null','sec-fetch-site':'same-origin'}})));
  const winner=race.find(r=>r.status===303);assert.ok(winner);assert.equal(race.filter(r=>r.status===303).length,1);assert.equal(winner.headers.get('location'),'/espace');jar(winner,j);
  assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM broker_sessions')).n,1);
  const raw=j.vv_broker_session;assert.equal(raw.length,64);assert.notEqual((await h.db.get('SELECT token_hash FROM broker_sessions')).token_hash,raw);
  // More than ten clicks on the same email work through the durable session.
  for(let i=0;i<12;i++){const r=await request('/acces/'+token,{j});assert.equal(r.status,302);assert.equal(r.headers.get('location'),'/espace');}
  const login=await request('/connexion',{j});assert.equal(login.headers.get('location'),'/espace');
  const home=await request('/espace',{j});assert.equal(home.status,200);assert.match(await home.text(),/Votre accès est accepté/);
  const sessionData=await (await request('/api/espace/session',{j})).json();let csrf=sessionData.csrf;assert.equal(typeof csrf,'string');
  const mutate=(path,body,opts={})=>request(path,{method:'POST',j,body,extra:{'x-vv-csrf':csrf,...opts}});
  assert.equal((await request('/api/espace/profil',{method:'POST',j,body:{}})).status,403);
  assert.equal((await mutate('/api/espace/profil',{}, {origin:'https://evil.test'})).status,403);
  assert.equal((await request('/api/espace/profil',{method:'POST',body:{}})).status,401);
  // Profile conflict detection, required identity, safe embedded script data.
  assert.equal((await mutate('/api/espace/profil',{profileVersion:0,agent_name:''})).status,400);
  const malicious='Broker </script><script>window.pwned=1</script>';
  const save=await mutate('/api/espace/profil',{profileVersion:0,agent_name:malicious,agent_email:b.email,links:[]});assert.equal(save.status,200);assert.equal((await save.json()).profileVersion,1);
  assert.equal((await mutate('/api/espace/profil',{profileVersion:0,agent_name:'Overwrite'})).status,409);
  const profileResponse=await request('/espace/page',{j});assert.equal(profileResponse.status,200);const profileHtml=await profileResponse.text();assert.ok(!profileHtml.includes('</script><script>window.pwned'));assert.match(profileHtml,/\\u003c\/script/);
  assert.equal((await mutate('/api/espace/page-prete',{profileVersion:0})).status,409);
  assert.equal((await mutate('/api/espace/page-prete',{profileVersion:1})).status,200);
  assert.equal((await mutate('/api/espace/publier',{published:true})).status,402,'unpaid access cannot publish');
  for(const path of ['/espace/pistes','/espace/compte','/espace/abonnement','/espace/courrier-cible'])assert.equal((await request(path,{j})).status,200,path);
  // Lead ownership and allowed status values.
  const lead=await h.db.get("INSERT INTO broker_leads(broker_id,name) VALUES ($1,'Homeowner') RETURNING *",[b.id]);
  const update=(id,status)=>request('/api/espace/leads/'+id,{method:'PUT',j,extra:{'x-vv-csrf':csrf},body:{status,notes:'Saved note'}});
  assert.equal((await update(lead.id,'arbitrary')).status,400);assert.equal((await update(lead.id,'contacté')).status,200);
  const foreign=await h.db.get("INSERT INTO broker_leads(broker_id,name) VALUES ($1,'Other') RETURNING *",[pending.id]);assert.equal((await update(foreign.id,'fermé')).status,404);
  // Revocation is immediate; refusing an account does not leave a stale session.
  const other=await signIn(b);await h.db.run("UPDATE brokers SET status='refused' WHERE id=$1",[b.id]);assert.equal((await request('/api/espace/session',{j:other.j})).status,401);await h.db.run("UPDATE brokers SET status='invited' WHERE id=$1",[b.id]);
  // 30-day idle refresh, fixed 90-day maximum, tamper-resistant cookie.
  await h.db.run("UPDATE broker_sessions SET idle_expires_at=NOW()+INTERVAL '1 day' WHERE token_hash=$1",[authTools.hash(raw)]);
  await request('/espace',{j});assert.ok((await h.db.get("SELECT idle_expires_at>NOW()+INTERVAL '29 days' ok FROM broker_sessions WHERE token_hash=$1",[authTools.hash(raw)])).ok);
  await h.db.run("UPDATE broker_sessions SET absolute_expires_at=NOW()-INTERVAL '1 second' WHERE token_hash=$1",[authTools.hash(raw)]);assert.equal((await request('/api/espace/session',{j})).status,401);
  assert.equal((await request('/api/espace/session',{j:{vv_broker_session:'f'.repeat(64)}})).status,401);
  // Known and unknown emails receive the same response; repeat requests are throttled.
  async function requestLogin(email){const r=await request('/connexion');const cj=jar(r),html=await r.text();return request('/api/courtier/connexion',{method:'POST',j:cj,body:{email,challenge:hidden(html,'challenge')}});}
  const count=h.emails.length;const known=await requestLogin(b.email);assert.equal(known.status,202);const unknown=await requestLogin('unknown@example.test');assert.deepEqual(await known.json(),await unknown.json());
  await requestLogin(b.email);await requestLogin(pending.email);await requestLogin(refused.email);assert.equal(h.emails.length,count+1);
  assert.match(h.emails.at(-1).text,/1 heure/);const emailed=h.emails.at(-1).text.match(/\/acces\/([a-f0-9]{64})/)[1];assert.ok(await auth.inspect(emailed));
  await h.db.run('UPDATE broker_tokens SET expires_at=NOW()-INTERVAL \'1 second\' WHERE token_hash=$1',[authTools.hash(emailed)]);assert.equal(await auth.inspect(emailed),undefined);
  // Scope-safe platform mount and all-device signout.
  const third=await signIn(b,'/pwa/vendvite');assert.equal((await request('/pwa/vendvite/espace',{j:third.j})).status,200);
  const tc=(await (await request('/api/espace/session',{j:third.j})).json()).csrf;
  const out=await request('/api/espace/deconnexion',{method:'POST',j:third.j,extra:{'x-vv-csrf':tc},body:{all:true}});assert.equal(out.status,200);
  assert.equal((await request('/api/espace/session',{j:third.j})).status,401);assert.equal((await request('/api/espace/session',{j:other.j})).status,401);
  const revokedPayload=b.id+'.'+(Date.now()-60000);const revokedLegacy=revokedPayload+'.'+crypto.createHmac('sha256',h.services.jwtSecret).update(revokedPayload).digest('hex').slice(0,32);
  assert.equal((await request('/api/espace/session',{j:{vv_courtier:revokedLegacy}})).status,401,'signout all also revokes legacy cookies');
  // Legacy fallback signatures must never authenticate.
  const legacyPayload=b.id+'.'+Date.now();const fallback=legacyPayload+'.'+crypto.createHmac('sha256','vv').update(legacyPayload).digest('hex').slice(0,32);
  assert.equal((await request('/api/espace/session',{j:{vv_courtier:fallback}})).status,401);
  const signed=legacyPayload+'.'+crypto.createHmac('sha256',h.services.jwtSecret).update(legacyPayload).digest('hex').slice(0,32);
  const migrated=await request('/api/espace/session',{j:{vv_courtier:signed}});assert.equal(migrated.status,200);assert.ok(jar(migrated).vv_broker_session);
  const photoSession=jar(migrated),photoCsrf=(await migrated.json()).csrf;
  const photo=await request('/api/espace/photo',{method:'POST',j:photoSession,extra:{'x-vv-csrf':photoCsrf},body:{profileVersion:2,image:'data:image/png;base64,'+'A'.repeat(140000)}});
  assert.equal(photo.status,200,'portrait uploads larger than Express default 100kb work');assert.equal((await photo.json()).profileVersion,3);
  assert.equal((await request('/api/espace/photo',{method:'POST',j:photoSession,extra:{'x-vv-csrf':photoCsrf},body:{profileVersion:2,image:'data:image/png;base64,AAAA'}})).status,409);
  // Database outages fail closed with a usable recovery page and JSON errors,
  // including failure before route-level auth has finished.
  const get=h.db.get;h.db.get=async()=>{throw Error('simulated database outage');};
  try{
    const outage=await request('/espace',{j:jar(migrated)});assert.equal(outage.status,503);assert.match(await outage.text(),/momentanément indisponible/);
    assert.equal((await request('/connexion',{j:photoSession})).status,503);
    const apiOutage=await request('/api/espace/session',{j:jar(migrated)});assert.equal(apiOutage.status,503);assert.equal((await apiOutage.json()).code,'TEMPORARILY_UNAVAILABLE');
  }finally{h.db.get=get;}
  console.log('Access and workspace integration checks passed. Email transport was stubbed; no external messages or payments.');
 }finally{await h.close();}
});
