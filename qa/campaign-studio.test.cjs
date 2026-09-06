const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,root}=require('./harness.cjs');
const M=require(root+'/public/js/campaign-model-v1'),D=require(root+'/campaign-data-v1'),authTools=require(root+'/broker-auth-v1');
const center={lat:45.522,lng:-73.581,libelle:'Montréal'};
const address=(n=3936)=>{let a={numero:String(n),rue:'avenue Henri-Julien',ville:'Montréal',lat:45.522,lng:-73.581,source:'point',unit:'',postal:'H2W 2A2'};a.id=M.key(a);return a};
const record=(extra={})=>({ID_UEV:'test-1',MUNICIPALITE:'50',CIVIQUE_DEBUT:'3936',CIVIQUE_FIN:'3938',NOM_RUE:'avenue Henri-Julien (MTL)',NOMBRE_LOGEMENT:'2',CODE_UTILISATION:'1000',CATEGORIE_UEF:'Régulier',ANNEE_CONSTRUCTION:'1885',ETAGE_HORS_SOL:'2',...extra});
test('property analysis preserves unknowns, unit addresses and source boundaries',()=>{
 assert.equal(M.classify({building:'house','building:levels':'3'}).units,null);
 assert.equal(M.classify({building:'apartments','building:flats':'8'}).type,'apartment');
 assert.equal(M.classify({building:'apartments',ownership:'condominium'}).type,'condo');
 assert.equal(M.classify({building:'house','building:flats':'2'}).type,'plex');
 assert.notEqual(M.key(address()),M.key({...address(),unit:'2'}));
 let known=D.analyze(address(),[record(),record()]);assert.equal(known.units,2);assert.equal(known.records,1);
 assert.equal(D.analyze(address(3937),[record()]),null,'do not attach even-side assessment to odd number');
 assert.equal(D.analyze(address(),[record({MUNICIPALITE:'29'})]),null,'municipality is required');
 assert.equal(D.analyze(address(),[record({LETTRE_DEBUT:'A'})]),null);
 assert.equal(D.analyze(address(),[record()],true),null,'truncated query never yields a guessed total');
 assert.equal(D.analyze(address(),[record(),record({ID_UEV:'test-2',NOM_RUE:'avenue Henri-Julien (SLR)'})]),null,'ambiguous borough streets remain unknown');
 const condos=[record({CATEGORIE_UEF:'Condominium',NOMBRE_LOGEMENT:'1',SUITE_DEBUT:'1'}),record({ID_UEV:'test-2',CATEGORIE_UEF:'Condominium',NOMBRE_LOGEMENT:'1',SUITE_DEBUT:'2'})];
 let whole=D.analyze(address(),condos),unit=D.analyze({...address(),unit:'1'},condos);assert.equal(whole.units,2);assert.equal(unit.units,1);assert.equal(whole.type,'condo');
 assert.equal(M.summary([{...address(),analysis:whole},{...address(),unit:'1',analysis:unit}]).knownUnits,2,'assessment records counted once');
 assert.equal(D.analyze(address(),[record({NOMBRE_LOGEMENT:null})]).units,null);
 const elements=[{type:'node',id:1,lat:center.lat,lon:center.lng,tags:{'addr:housenumber':'100','addr:street':'rue Test',building:'house'}},{type:'node',id:2,lat:center.lat+.001,lon:center.lng,tags:{'addr:housenumber':'104','addr:street':'rue Test'}},{type:'way',id:3,nodes:[1,2],tags:{'addr:interpolation':'even'}}];
 let parsed=M.parse(elements,center,'Montréal',800,[]);assert.equal(parsed.length,3);assert.equal(parsed.find(a=>a.numero==='100').source,'point');assert.equal(parsed.find(a=>a.numero==='102').source,'interpole');assert.equal(parsed.find(a=>a.numero==='102').analysis.units,null);
 assert.equal(M.parse(elements,center,'Montréal',5,[]).length,1);
 assert.equal(M.parse(elements,center,'Montréal',800,[[46,-72],[46,-71],[47,-71]]).length,0);
 assert.equal(M.sanitize({...address(),lat:40}),null);
});
test('draft isolation, concurrency, source caching and exact mailing quotes',async()=>{
 const h=await create(),auth=authTools.create(h.services);let calls=0;
 h.services.fetch=async url=>{assert.match(url,/^https:\/\/donnees.montreal.ca\//);calls++;return {ok:true,json:async()=>({success:true,result:{records:[record()]}})}};
 async function sign(slug){const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,status) VALUES($1,'QA Broker',$2,'invited') RETURNING *",[slug,slug+'@example.test']);let token=await auth.mint(b.id,'access'),r=await fetch(h.url+'/acces/'+token),j={};function cookies(r){r.headers.getSetCookie().forEach(c=>{let [k,...v]=c.split(';')[0].split('=');j[k]=v.join('=')})}cookies(r);let html=await r.text();r=await fetch(h.url+'/acces/'+token,{method:'POST',redirect:'manual',headers:{'content-type':'application/json',cookie:Object.entries(j).map(([k,v])=>k+'='+v).join('; ')},body:JSON.stringify({challenge:html.match(/name="challenge" value="([^"]*)"/)[1]})});cookies(r);let cookie=Object.entries(j).map(([k,v])=>k+'='+v).join('; ');let session=await (await fetch(h.url+'/api/espace/session',{headers:{cookie}})).json();return {b,headers:{cookie,'content-type':'application/json','x-vv-csrf':session.csrf}};}
 try{
 const a=await sign('campaign-a'),b=await sign('campaign-b');
 const req=(path,body,who=a,method='POST')=>fetch(h.url+'/api/espace/campagne/'+path,{method,headers:who.headers,body:body===undefined?undefined:JSON.stringify(body)});
 assert.equal((await req('devis',{count:151},{headers:{}})).status,401);
 assert.equal((await req('devis',{count:151},{headers:{cookie:a.headers.cookie,'content-type':'application/json'}})).status,403);
 for(const n of [1,149,150,151,299,301,1200]){let r=await req('devis',{count:n});assert.equal(r.status,200);let {price:p}=await r.json();assert.equal(p.quantite,n);assert.equal(p.facturable,Math.max(0,n-150));assert.equal(p.sousTotal,p.facturable*159);assert.equal(p.total,p.sousTotal+Math.round(p.sousTotal*.05)+Math.round(p.sousTotal*.09975));}
 assert.equal((await req('devis',{count:1201})).status,400);assert.equal((await req('devis',{count:1.5})).status,400);
 const addr=address();let r=await req('analyse',{addresses:[addr]});assert.equal(r.status,200);let result=await r.json();assert.equal(result.results[0].analysis.units,2);assert.equal(calls,1);
 await req('analyse',{addresses:[addr]});assert.equal(calls,1,'public property cache avoids repeated upstream calls');
 let data={center,city:'Montréal',radius:800,target:150,addresses:[addr,address(3940)],selected:[addr.id],excluded:[address(3940).id],notes:'Keep one address excluded',polygon:[]};
 r=await req('brouillon',{revision:0,data},a,'PUT');assert.equal(r.status,200);assert.equal((await r.json()).revision,1);
 let saved=await (await req('brouillon',undefined,a,'GET')).json();assert.deepEqual(saved.data.excluded,data.excluded);assert.equal(saved.data.addresses[0].analysis.source,'montreal');assert.equal(saved.data.addresses[0].analysis.units,2);
 assert.equal((await (await req('brouillon',undefined,b,'GET')).json()).data,null,'draft belongs to its broker');
 let race=await Promise.all([1,2].map(()=>req('brouillon',{revision:1,data},a,'PUT')));assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);
 assert.equal((await req('brouillon',{revision:2,data:{...data,selected:['not-present']}},a,'PUT')).status,400);
 assert.equal((await req('brouillon',{revision:2,data:{...data,addresses:[addr,addr]}},a,'PUT')).status,400);
 assert.equal((await req('brouillon',{revision:2,data:{...data,center:{lat:40,lng:-70}}},a,'PUT')).status,400);
 const overflow=Array.from({length:1201},(_,i)=>address(10000+i));
 r=await req('brouillon',{revision:2,data:{...data,target:1200,addresses:overflow,selected:overflow.map(a=>a.id)}},a,'PUT');
 assert.equal(r.status,400);assert.equal((await r.json()).code,'BAD_DRAFT');
 saved=await (await req('brouillon',undefined,a,'GET')).json();assert.equal(saved.revision,2);assert.deepEqual(saved.data.selected,data.selected,'overflow cannot overwrite the valid draft');

 // Payment creation is mocked, but the stored quantity and PayPal payload
 // come through the real route. No external PayPal call or mail is sent.
 await h.db.run("UPDATE brokers SET status='active',published=1,membership_expires_at=NOW()+INTERVAL '1 year' WHERE id=$1",[a.b.id]);
 Object.assign(h.services.externalVars,{PAYPAL_MODE:'live',PAYPAL_CLIENT_ID:'test',PAYPAL_CLIENT_SECRET:'test'});
 const orders=[];h.services.fetch=async(url,opts)=>{if(url.endsWith('/v1/oauth2/token'))return {ok:true,json:async()=>({access_token:'fake'})};assert.ok(url.endsWith('/v2/checkout/orders'));orders.push({body:JSON.parse(opts.body),key:opts.headers['PayPal-Request-Id']});return {ok:true,json:async()=>({id:'QA-'+orders.length,links:[{rel:'approve',href:'https://example.test/mock-payment'}]})}};
 const batch=Array.from({length:152},(_,i)=>address(5000+i));
 let payload={centre:center,ville:'Montréal',rayon:800,adresses:batch.slice(0,151),quantite:151,expectedTotal:183};
 assert.equal((await req('commander',{...payload,adresses:overflow,quantite:1201})).status,400);
 assert.equal((await req('commander',{...payload,adresses:overflow,quantite:1200})).status,400,'understating quantity cannot bypass the address cap');
 assert.equal(orders.length,0,'overflow never creates a payment');
 assert.equal((await req('commander',{...payload,quantite:150})).status,400);
 assert.equal((await req('commander',{...payload,quantite:151.5})).status,400);
 assert.equal((await req('commander',{...payload,expectedTotal:1})).status,409);
 r=await req('commander',payload);assert.equal(r.status,200);let order=await r.json();assert.equal(order.total,183);assert.equal(orders[0].body.purchase_units[0].amount.value,'1.83');
 let stored=await h.db.get('SELECT * FROM broker_campaigns WHERE id=$1',[order.id]);assert.equal(stored.address_count,151);assert.equal(stored.quantity,151);
 let resumed=await (await req('devis',{count:152,reprise:order.id})).json();assert.equal(resumed.price.offert,150,'resuming retains its reserved credit');
 r=await req('commander',{...payload,adresses:batch,quantite:152,expectedTotal:resumed.price.total,reprend:order.id});assert.equal(r.status,200);assert.notEqual(orders[0].key,orders[1].key,'changed address selection cannot reuse the old PayPal order');assert.ok(orders[1].key.length<=38);
 stored=await h.db.get('SELECT * FROM broker_campaigns WHERE id=$1',[order.id]);assert.equal(stored.address_count,152);assert.equal(stored.total_cents,resumed.price.total);
 assert.equal(h.emails.length,0);console.log('Campaign API: exact quotes, broker isolation, exclusions, CAS conflicts and cached official data passed.');
 }finally{await h.close()}
});
