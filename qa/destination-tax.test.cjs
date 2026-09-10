const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('crypto'),fs=require('fs');
const {create,root}=require('./harness.cjs'),tax=require(root+'/canadian-tax-v2');
const postal={AB:'T2P 1A1',BC:'V6B 1A1',MB:'R3C 1A1',NB:'E3B 1A1',NL:'A1A 1A1',NS:'B3J 1A1',NT:'X1A 1A1',NU:'X0A 1A1',ON:'M5V 1A1',PE:'C1A 1A1',QC:'H2X 1A1',SK:'S4P 1A1',YT:'Y1A 1A1'};
const address=p=>({legal_name:'Example Realty',line1:'123 Main Street',city:'Example City',province:p,postal_code:postal[p],country:'CA'});
const policy=tax.policy();
test('every billing/destination combination uses destination rates; never stacks billing province tax',()=>{
 const expected={AB:10500,BC:11200,MB:11200,NB:11500,NL:11500,NS:11400,NT:10500,NU:10500,ON:11300,PE:11500,QC:11498,SK:11100,YT:10500};
 for(const billing of Object.keys(postal))for(const destination of Object.keys(postal)){
  const s=tax.calculateMailing(10000,address(billing),{[destination]:100},100,policy);
  assert.equal(s.total_cents,expected[destination],billing+' to '+destination);assert.equal(s.billing_province,billing);assert.equal(s.province,destination);assert.equal(s.basis,'supplier_mailed_destination');assert(s.lines.every(l=>l.registration===''));
 }
 const ab=tax.calculateMailing(10000,address('BC'),{AB:100},100,policy);assert.deepEqual(ab.lines.map(l=>l.code),['GST']);
 assert.equal(tax.calculateMailing(10000,address('ON'),{NS:100},100,policy,new Date('2025-03-31')).total_cents,11500);
});
test('destination counts are mandatory and exact; discount allocation is deterministic with no lost cents',()=>{
 for(const counts of [undefined,[],{}, {ZZ:1},{BC:0},{BC:-1},{BC:1.5},{BC:'1'},{BC:Number.MAX_SAFE_INTEGER}])assert.throws(()=>tax.calculateMailing(159,address('ON'),counts,1,policy),/DESTINATION/);
 assert.throws(()=>tax.calculateMailing(159,address('ON'),{BC:1,MB:1},1,policy),/DESTINATION_COUNT_MISMATCH/);
 assert.throws(()=>tax.calculateMailing(159,address('ON'),{BC:1},1,tax.policy({pst:{BC:{treatment:'unknown'}}})),/PROVINCIAL_TAX_REVIEW/);
 assert.throws(()=>tax.calculateMailing(159,address('ON'),{BC:1},1,tax.policy({campaign_classification:'general_service'})),/TAX_CLASSIFICATION_REVIEW/);
 const counts={SK:1,MB:1,BC:1,AB:1};const s=tax.calculateMailing(159,address('ON'),counts,4,policy);
 assert.deepEqual(s.allocations.map(a=>[a.province,a.subtotal_cents]),[['AB',40],['BC',40],['MB',40],['SK',39]]);assert.equal(s.total_cents,175);
 assert.deepEqual(tax.calculateMailing(159,address('ON'),{AB:1,BC:1,MB:1,SK:1},4,policy),s);
 for(const subtotal of [0,1,159,23850,190800]){const q=tax.calculateMailing(subtotal,address('QC'),counts,4,policy);assert.equal(q.allocations.reduce((v,a)=>v+a.subtotal_cents,0),subtotal);assert.equal(q.total_cents,subtotal+q.lines.reduce((v,l)=>v+l.amount_cents,0));}
});
test('mixed destinations: checkout rejects forged/stale totals, freezes allocation through PayPal and eight-line invoice',async()=>{
 const h=await create();try{
 const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,published,access_plan,billing_address,billing_confirmed_at) VALUES('destination-tax','Tax Tester','tax@example.test','invited',1,'mailing',$1,NOW()) RETURNING *",[JSON.stringify(address('ON'))]);
 const raw=crypto.randomBytes(32).toString('hex');await h.db.run("INSERT INTO broker_sessions(broker_id,token_hash,idle_expires_at,absolute_expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour',NOW()+INTERVAL '1 hour')",[b.id,crypto.createHash('sha256').update(raw).digest('hex')]);
 const cookie='vv_broker_session='+raw,session=await (await fetch(h.url+'/api/espace/session',{headers:{cookie}})).json(),headers={cookie,'Content-Type':'application/json','x-vv-csrf':session.csrf};
 const post=(path,body)=>fetch(h.url+path,{method:'POST',headers,body:JSON.stringify(body)});
 Object.assign(h.services.externalVars,{PAYPAL_MODE:'live',PAYPAL_CLIENT_ID:'test',PAYPAL_CLIENT_SECRET:'test'});
 const centres={AB:[51.0447,-114.0719],BC:[49.2827,-123.1207],MB:[49.8951,-97.1384],SK:[50.4452,-104.6189],QC:[45.5017,-73.5673],ON:[43.6532,-79.3832],NS:[44.6488,-63.5752],NB:[45.9636,-66.6431]};
 const destinationCounts=Object.fromEntries(Object.keys(centres).map(p=>[p,10]));
 const quote=await (await post('/api/espace/campagne/devis',{count:80,destinationCounts})).json();assert.equal(quote.price.taxReady,true);assert.equal(quote.price.total,14263);assert.equal(quote.price.taxLines.length,8);
 const missing=await (await post('/api/espace/campagne/devis',{count:80,destinations:['BC','MB']})).json();assert.equal(missing.price.taxReady,false);assert.equal(missing.price.total,null);
 let calls=0,orderBody,captures=0,providerStatus='CREATED';
 h.services.fetch=async(url,opts)=>{
  calls++;
  if(url.endsWith('/v1/oauth2/token'))return {ok:true,json:async()=>({access_token:'fake'})};
  if(url.endsWith('/v2/checkout/orders')){orderBody=JSON.parse(opts.body);return {ok:true,json:async()=>({id:'ORDER-MIXED',links:[{rel:'approve',href:'https://www.paypal.com/checkoutnow?token=ORDER-MIXED'}]})};}
  if(url.endsWith('/capture')){captures++;providerStatus='COMPLETED';return {ok:true,json:async()=>({status:'COMPLETED',purchase_units:[{payments:{captures:[{id:'CAPTURE-MIXED',status:'COMPLETED',amount:{currency_code:'CAD',value:'142.63'}}]}}]})};}
  return {ok:true,json:async()=>({id:'ORDER-MIXED',status:providerStatus,purchase_units:orderBody.purchase_units.map(u=>({...u,...(providerStatus==='COMPLETED'?{payments:{captures:[{id:'CAPTURE-MIXED',status:'COMPLETED',amount:{currency_code:'CAD',value:'142.63'}}]}}:{})})),links:[{rel:'approve',href:'https://www.paypal.com/checkoutnow?token=ORDER-MIXED'}]})};
 };
 // Claimed province is deliberately false: checkout must use coordinates.
 const adresses=Object.entries(centres).flatMap(([p,[lat,lng]])=>Array.from({length:10},(_,i)=>({numero:String(100+i),rue:'Main Street',ville:p+' City',postal:postal[p],lat,lng,source:'point',province:'AB'})));
 const payload={centre:{libelle:'Canada',lat:43.65,lng:-79.38},adresses,quantite:80,expectedTotal:13356,destinationCounts:{AB:80}};
 const rejected=await post('/api/espace/campagne/commander',payload);assert.equal(rejected.status,409);assert.equal((await rejected.json()).code,'PRICE_CHANGED');assert.equal(calls,0);
 payload.expectedTotal=14263;
 const r=await post('/api/espace/campagne/commander',payload);assert.equal(r.status,200,await r.clone().text());const order=await r.json();assert.equal(orderBody.purchase_units[0].amount.breakdown.tax_total.value,'15.43');
 const stored=await h.db.get('SELECT * FROM broker_campaigns WHERE id=$1',[order.id]);assert.deepEqual(stored.tax_snapshot,quote.price.taxSnapshot);
 await h.db.run('UPDATE brokers SET billing_address=$1 WHERE id=$2',[JSON.stringify(address('QC')),b.id]);h.services.externalVars.VENDVITE_TAX_POLICY=JSON.stringify({pst:{BC:{treatment:'not_applicable',review_reference:'Changed later'}}});
 providerStatus='APPROVED';
 await fetch(h.url+'/espace/campagne/retour?token=ORDER-MIXED&mode=live',{headers,redirect:'manual'});
 const invoice=await h.db.get('SELECT * FROM broker_invoices WHERE campaign_id=$1',[order.id]);assert(invoice);assert.equal(invoice.total_cents,14263);assert.deepEqual(invoice.tax_snapshot,stored.tax_snapshot);assert.equal(invoice.pst_cents,317);assert.match(h.emails[0].text,/PST.*BC/);assert.match(h.emails[0].text,/PST.*SK/);assert.match(h.emails[0].text,/RST.*MB/);
 fs.mkdirSync(__dirname+'/tax-preview',{recursive:true});fs.writeFileSync(__dirname+'/tax-preview/invoice-mixed.pdf',require(root+'/invoice-v5').buildInvoicePdf({...invoice,campaign:stored},b,{name:'Liasse Technologique',email:'billing@example.test'}));
 await fetch(h.url+'/espace/campagne/retour?token=ORDER-MIXED&mode=live',{headers,redirect:'manual'});assert.equal(captures,1);
 }finally{await h.close();}
});
