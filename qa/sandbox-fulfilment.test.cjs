'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {create,root}=require('./harness.cjs'),P=require(root+'/production-v2');
const admin={'x-test-admin':'yes','Content-Type':'application/json'};
async function session(h,id){const raw=crypto.randomBytes(32).toString('hex');await h.db.run("INSERT INTO broker_sessions(broker_id,token_hash,idle_expires_at,absolute_expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour',NOW()+INTERVAL '1 hour')",[id,crypto.createHash('sha256').update(raw).digest('hex')]);return {cookie:'vv_broker_session='+raw,'Content-Type':'application/json'};}
async function expectOK(r){assert.equal(r.status,200,await r.clone().text());return r;}
const load=(h,c)=>h.db.get('SELECT * FROM broker_campaigns WHERE id=$1',[c.id]);
async function setup(h,isTest){const nonce=crypto.randomBytes(4).toString('hex'),b=await h.db.get("INSERT INTO brokers(slug,full_name,email,access_plan,status,published) VALUES($1,'Sandbox Agent',$2,'mailing','active',1) RETURNING *",['sandbox-flow-'+nonce,nonce+'@example.test']),addresses=[1,2,3].map(n=>({numero:String(n),rue:'Rue Exemple',ville:'Montréal',province:'QC',postal:'H2X 1Y4',unit:'',lat:45.5,lng:-73.6,analysis:n===2?{type:'apartment',units:2}:{type:'house'}})),c=await h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,address_count,quantity,addresses,total_cents,paypal_mode,is_test) VALUES($1,'paid','confirmed','paid',3,3,$2,549,$3,$4) RETURNING *",[b.id,JSON.stringify(addresses),isTest?'sandbox':'live',isTest?1:0]);return {b,c,owner:await session(h,b.id)};}
const post=(h,c,path,body)=>fetch(h.url+'/api/admin/campagnes/'+c.id+'/'+path,{method:'POST',headers:admin,body:JSON.stringify(body)});

test('sandbox postal rehearsal carries test terms, private recipient links, preview/inbox links and a simulated deposit',async()=>{const h=await create();try{
 const {b,c,owner}=await setup(h,true),stranger=await setup(h,true);
 let response=await expectOK(await fetch(h.url+'/admin/campagnes/'+c.id+'/preparation',{headers:admin})),html=await response.text();assert.match(html,/TEST SANDBOX — simulation uniquement/);assert.match(html,/admin\/tests\/leads\?campaign=/);assert.match(html,/admin\/tests\/notifications\?campaign=/);
 const rows=P.original(c).slice(0,2).flatMap(a=>(a.numero==='2'?['1','2']:['']).map(unit=>[P.addressId(a),a.numero,a.rue,unit,a.ville,a.province,a.postal]));
 await expectOK(await post(h,c,'import-postal',{revision:0,csv:P.csv(rows)}));let saved=await load(h,c),selected=saved.production.candidates.filter(a=>a.address.unit!=='2').map(a=>a.id);
 assert.equal((await post(h,c,'approve-postal',{revision:1,selected,acknowledge:true})).status,400);
 await expectOK(await post(h,c,'request-shortfall',{revision:1,selected}));saved=await load(h,c);assert.equal(saved.production.shortfall.test,true);assert.match(saved.production.shortfall.terms,/Simulation uniquement/);
 response=await expectOK(await fetch(h.url+'/espace/campagnes/'+c.id+'/decision?lang=en',{headers:owner}));html=await response.text();assert.match(html,/TEST SANDBOX/);assert.match(html,/no real financial agreement or mailing/);assert.match(html,/Simulate acceptance at the full test price/);assert.match(html,/espace\/tests\/notifications\?campaign=/);
 assert.equal((await fetch(h.url+'/espace/campagnes/'+c.id+'/decision',{headers:stranger.owner})).status,404);
 await expectOK(await fetch(h.url+'/api/espace/campagnes/'+c.id+'/decision',{method:'POST',headers:owner,body:JSON.stringify({revision:saved.production.revision,decision:'accept',acknowledge:true})}));saved=await load(h,c);
 await expectOK(await post(h,c,'approve-postal',{revision:saved.production.revision,selected,acknowledge:true}));saved=await load(h,c);assert.equal(saved.production.preparedCount,2);assert.equal(saved.total_cents,549);assert.equal(saved.production.shortfall.test,true);
 const testPath='/courrier-test/'+saved.mailing_token+'/'+saved.production.recipients[0].mailing_id;
 response=await expectOK(await fetch(h.url+'/admin/campagnes/'+c.id+'/preparation',{headers:admin}));html=await response.text();assert.match(html,/Enregistrer le dépôt simulé/);assert.doesNotMatch(html,/Déclarer le dépôt réel/);assert(html.includes(testPath.slice(1)));
 response=await expectOK(await fetch(h.url+'/espace/commandes/'+c.id+'?lang=en',{headers:owner}));html=await response.text();assert.match(html,/Full rehearsal/);assert.match(html,/Simulated total/);assert.match(html,/espace\/pistes\?mode=test/);assert.match(html,/espace\/tests\/notifications\?campaign=/);assert(html.includes(testPath.slice(1)));
 const signedOut=await fetch(h.url+testPath,{redirect:'manual'});assert([302,401,403].includes(signedOut.status));const other=await fetch(h.url+testPath,{headers:stranger.owner,redirect:'manual'});assert([302,401,403,404].includes(other.status));
 assert.equal((await post(h,c,'postee',{revision:saved.production.revision,count:2,date:new Date().toISOString(),acknowledge:true})).status,400);
 await expectOK(await fetch(h.url+'/admin/campagnes/'+c.id+'/lettres',{headers:admin}));
 response=await expectOK(await post(h,c,'postee',{revision:saved.production.revision,count:2,date:new Date().toISOString(),acknowledge:true}));assert.equal((await response.json()).simulated,true);saved=await load(h,c);assert.equal(saved.production.deposited.simulated,true);assert.equal(saved.production.audit.at(-1).simulated,true);
 response=await expectOK(await fetch(h.url+'/espace/commandes/'+c.id+'?lang=en',{headers:owner}));html=await response.text();assert.match(html,/Simulated deposit recorded on/);assert.doesNotMatch(html,/Deposited with Canada Post on/);assert.equal(h.emails.length,0);
 }finally{await h.close();}});

test('production keeps real consent/deposit terms and never exposes sandbox links',async()=>{const h=await create();try{
 const {c,owner}=await setup(h,false);const rows=P.original(c).map(a=>[P.addressId(a),a.numero,a.rue,a.numero==='2'?'1':'',a.ville,a.province,a.postal]);await expectOK(await post(h,c,'import-postal',{revision:0,csv:P.csv(rows)}));let saved=await load(h,c);await expectOK(await post(h,c,'approve-postal',{revision:1,selected:saved.production.candidates.map(a=>a.id),acknowledge:true}));saved=await load(h,c);
 let response=await expectOK(await fetch(h.url+'/admin/campagnes/'+c.id+'/preparation',{headers:admin})),html=await response.text();assert.match(html,/Déclarer le dépôt réel/);assert.match(html,/Enregistrer le dépôt postal/);assert.doesNotMatch(html,/courrier-test\//);assert.doesNotMatch(html,/TEST SANDBOX/);
 response=await expectOK(await fetch(h.url+'/espace/commandes/'+c.id+'?lang=en',{headers:owner}));html=await response.text();assert.doesNotMatch(html,/Full rehearsal|Simulated total|mode=test|courrier-test\//);
 await expectOK(await fetch(h.url+'/admin/campagnes/'+c.id+'/lettres',{headers:admin}));await expectOK(await post(h,c,'postee',{revision:saved.production.revision,count:3,date:new Date().toISOString(),acknowledge:true}));saved=await load(h,c);assert.equal(saved.production.deposited.simulated,undefined);assert.equal(saved.production.audit.at(-1).simulated,undefined);assert.equal(h.emails.length,0);
 }finally{await h.close();}});

test('final sandbox preparation excludes prior sandbox recipients only and rechecks after import without excluding itself',async()=>{const h=await create();try{
 const {b,c}=await setup(h,true);await h.db.run('UPDATE broker_campaigns SET history_policy=$1::jsonb WHERE id=$2',[JSON.stringify({mode:'all'}),c.id]);const rows=P.original(c).map(a=>[P.addressId(a),a.numero,a.rue,a.numero==='2'?'1':'',a.ville,a.province,a.postal]);
 const prior=async(mode)=>h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,is_test,paypal_mode,addresses) VALUES($1,'paid','mailed','paid',$2,$3,$4::jsonb) RETURNING *",[b.id,mode==='sandbox'?1:0,mode,JSON.stringify([P.original(c)[0]])]);await prior('live');
 await expectOK(await post(h,c,'import-postal',{revision:0,csv:P.csv(rows)}));let saved=await load(h,c);assert(saved.production.candidates.every(a=>!a.historyBlocked),'live orders and current sandbox order do not block test addresses');const previous=await prior('sandbox');
 const rejected=await post(h,c,'approve-postal',{revision:saved.production.revision,selected:saved.production.candidates.map(a=>a.id),acknowledge:true});assert.equal(rejected.status,400);saved=await load(h,c);assert.equal(saved.status,'confirmed');
 const response=await expectOK(await fetch(h.url+'/admin/campagnes/'+c.id+'/preparation',{headers:admin})),html=await response.text();assert.match(html,/Déjà ciblée|déjà ciblée/);assert(html.includes(String(previous.id)));assert.equal(h.emails.length,0);
 }finally{await h.close();}});
