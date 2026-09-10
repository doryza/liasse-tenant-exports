const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('crypto');
const {create,root}=require('./harness.cjs'),M=require(root+'/public/js/campaign-model-v2'),H=require(root+'/campaign-history-v2');
const address=(n,extra={})=>M.sanitize({numero:String(n),rue:'Rue Mélanie',ville:'Saint-Jérôme',lat:45.78,lng:-74,source:'point',...extra});
test('history policy validation and stable unit/province identity',()=>{
 for(const value of [{mode:'days',days:0},{mode:'days',days:1.5},{mode:'days',days:36501},{mode:'unknown'},'all'])assert.throws(()=>H.policy(value));
 assert.deepEqual(H.policy(),{mode:'off'});assert.deepEqual(H.policy({mode:'days',days:90}),{mode:'days',days:90});
 assert.equal(H.key(address(100)),H.key(address(100,{rue:'RUE MELANIE',ville:'Saint Jerome',lat:45.7801})));
 assert.notEqual(H.key(address(100)),H.key(address(100,{unit:'2'})));assert.notEqual(H.key(address(100)),H.key({...address(100),province:'ON'}));
});
test('own completed campaigns, lookback boundary, saved exclusions and checkout enforcement',async()=>{const h=await create();h.services.externalVars.PAYPAL_MODE='live';try{
 const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,published,membership_started_at,membership_expires_at) VALUES('history-qa','History QA','qa@example.test','active',1,NOW(),NOW()+INTERVAL '1 year') RETURNING *"),other=await h.db.get("INSERT INTO brokers(slug,full_name,email) VALUES('history-other','Other','other@example.test') RETURNING *");
 const now=new Date('2026-09-09T12:00:00Z'),ago=d=>new Date(now.getTime()-d*86400000);
 async function past(n,days,extra={}){await h.db.run('INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,is_test,addresses,created_at,mailed_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[extra.broker||b.id,'paid',extra.status||'confirmed',extra.payment||'paid',extra.test||0,JSON.stringify([address(n,extra.address)]),ago(days),extra.mailed||null]);}
 await past(100,10);await past(100,5);await past(101,90);await past(102,91);await past(103,2,{broker:other.id});await past(104,2,{test:1});await past(105,2,{status:'cancelled'});await past(106,2,{status:'pending_payment',payment:'pending'});await past(107,2,{address:{unit:'2'}});await past(108,150,{status:'mailed',mailed:ago(3)});
 const addresses=Array.from({length:10},(_,i)=>address(100+i));
 assert.deepEqual((await H.matches(h.db,b.id,addresses,{mode:'days',days:90},now)).map(a=>a.id),[100,101,108].map(n=>address(n).id));
 assert.equal((await H.matches(h.db,b.id,addresses,{mode:'all'},now))[0].targetedAt,ago(5).toISOString());assert.equal((await H.matches(h.db,b.id,addresses,{mode:'all'},now)).length,4);assert.equal((await H.matches(h.db,b.id,addresses,{mode:'days',days:4},now)).length,1);assert.equal((await H.matches(h.db,b.id,addresses,{mode:'off'},now)).length,0);
 const raw=crypto.randomBytes(32).toString('hex');await h.db.run("INSERT INTO broker_sessions(broker_id,token_hash,idle_expires_at,absolute_expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour',NOW()+INTERVAL '1 hour')",[b.id,crypto.createHash('sha256').update(raw).digest('hex')]);const cookie='vv_broker_session='+raw,session=await(await fetch(h.url+'/api/espace/session',{headers:{cookie}})).json(),headers={cookie,'X-VV-Payment-Mode':'live','Content-Type':'application/json','x-vv-csrf':session.csrf};
 const req=(path,body,method='POST',auth=headers)=>fetch(h.url+'/api/espace/campagne'+path,{method,headers:auth,body:JSON.stringify(body)});
 assert.equal((await req('/historique-adresses',{addresses,historyFilter:{mode:'all'}},'POST',{})).status,401);assert.equal((await req('/historique-adresses',{addresses},'POST',{cookie,'Content-Type':'application/json'})).status,403);
 assert.equal((await req('/historique-adresses',{addresses,historyFilter:{mode:'days',days:-1}})).status,400);
 const data=await(await req('/historique-adresses',{addresses,historyFilter:{mode:'all'}})).json();assert.equal(data.matches.length,4);assert(!data.matches.some(a=>a.id===address(103).id));
 const draft={center:{lat:45.78,lng:-74,libelle:'Saint-Jérôme'},radius:800,target:150,addresses,selected:addresses.map(M.key),excluded:[],historyFilter:{mode:'all'}};
 const saved=await(await req('/brouillon',{revision:0,data:draft},'PUT')).json();assert.equal(saved.selected.length,6);assert.equal(saved.historyMatches.length,4);const stored=await h.db.get('SELECT data FROM broker_campaign_drafts WHERE broker_id=$1',[b.id]);assert.equal(stored.data.historyFilter.mode,'all');assert(!stored.data.selected.includes(address(100).id));
 const payload={centre:draft.center,adresses:[address(100)],quantite:1,expectedTotal:0};
 for(const endpoint of ['/commander','']){const r=await req(endpoint,payload);assert.equal(r.status,409);assert.equal((await r.json()).code,'ALREADY_TARGETED',endpoint);}
 assert.equal(h.emails.length,0);
 }finally{await h.close();}});
