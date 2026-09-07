const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('crypto'),fs=require('fs');
const {create,root}=require('./harness.cjs'),tax=require(root+'/canadian-tax-v1');
const postal={AB:'T2P 1A1',BC:'V6B 1A1',MB:'R3C 1A1',NB:'E3B 1A1',NL:'A1A 1A1',NS:'B3J 1A1',NT:'X1A 1A1',NU:'X0A 1A1',ON:'M5V 1A1',PE:'C1A 1A1',QC:'H2X 1A1',SK:'S4P 1A1',YT:'Y1A 1A1'};
const address=p=>({legal_name:'Example Realty Inc.',line1:'123 Main Street',city:'Example City',province:p,postal_code:postal[p],country:'CA'});
const policy={campaign_classification:'general_service',gst_number:'123456789RT0001',qst_number:'1234567890TQ0001',pst:{BC:{treatment:'taxable',registration:'PST-123',review_reference:'QA'},MB:{treatment:'taxable',registration:'RST-123',review_reference:'QA'},SK:{treatment:'taxable',registration:'SK-123',review_reference:'QA'}}};
test('13 jurisdictions, current HST rates, integer rounding and paid-review gates',()=>{
 const expected={AB:10500,BC:11200,MB:11200,NB:11500,NL:11500,NS:11400,NT:10500,NU:10500,ON:11300,PE:11500,QC:11498,SK:11100,YT:10500};
 for(const p of Object.keys(postal)){const s=tax.calculate(10000,address(p),policy);assert.equal(s.total_cents,expected[p],p);tax.assertCollectable(s,policy);for(const n of [0,159,23850,190800]){const q=tax.calculate(n,address(p),policy);assert.equal(q.total_cents,n+q.lines.reduce((v,l)=>v+l.amount_cents,0));}}
 assert.equal(tax.calculate(10000,address('NS'),policy,new Date('2025-03-31')).total_cents,11500);
 assert.throws(()=>tax.billing({profile:{province:'QC'}}),/BILLING_ADDRESS_REQUIRED/);
 assert.throws(()=>tax.validate({...address('ON'),postal_code:'H2X 1A1'}),/BILLING_POSTAL_MISMATCH/);
 assert.throws(()=>tax.calculate(-1,address('ON'),policy),/BAD_SUBTOTAL/);
 const bc=tax.calculate(10000,address('BC'),{});assert.throws(()=>tax.assertCollectable(bc,policy.gst_number?{...policy,pst:{}}:{}),/PROVINCIAL_TAX_REVIEW/);
 assert.throws(()=>tax.assertCollectable(bc,{gst_number:'123'}),/TAX_CLASSIFICATION_REVIEW/);
 assert.equal(tax.rows({gst_cents:1193,qst_cents:2379})[1].amount_cents,2379);
});
async function broker(h){const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,published,access_plan) VALUES('tax-test','Tax Tester','tax@example.test','invited',1,'mailing') RETURNING *");const raw=crypto.randomBytes(32).toString('hex');await h.db.run("INSERT INTO broker_sessions(broker_id,token_hash,idle_expires_at,absolute_expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour',NOW()+INTERVAL '1 hour')",[b.id,crypto.createHash('sha256').update(raw).digest('hex')]);const cookie='vv_broker_session='+raw;const session=await (await fetch(h.url+'/api/espace/session',{headers:{cookie}})).json();return {b,headers:{cookie,'Content-Type':'application/json','x-vv-csrf':session.csrf}};}
test('real routes: confirm address, freeze Ontario tax through PayPal, invoice and changed customer address',async()=>{
 const h=await create();try{
 const f=await broker(h),post=async(path,body,method='POST')=>fetch(h.url+path,{method,headers:f.headers,body:JSON.stringify(body)});
 Object.assign(h.services.externalVars,{VENDVITE_TAX_POLICY:JSON.stringify(policy),PAYPAL_MODE:'live',PAYPAL_CLIENT_ID:'test',PAYPAL_CLIENT_SECRET:'test'});
 let q=await (await post('/api/espace/campagne/devis',{count:150})).json();assert.equal(q.price.taxReady,false);assert.equal(q.price.total,null);
 assert.equal((await post('/api/espace/billing-address',{confirmed:false,address:address('ON')},'PUT')).status,400);
 assert.equal((await post('/api/espace/billing-address',{confirmed:true,address:address('ON')},'PUT')).status,200);
 q=await (await post('/api/espace/campagne/devis',{count:150})).json();assert.equal(q.price.total,26951);assert.equal(q.price.taxReady,true);
 const html=await (await fetch(h.url+'/espace',{headers:f.headers})).text();assert.match(html,/billingAddressForm/);assert.match(html,/Ontario/);
 let orderBody,captureCalls=0,badAmount=false;
 h.services.fetch=async(url,opts)=>{if(url.endsWith('/v1/oauth2/token'))return {ok:true,json:async()=>({access_token:'fake'})};if(url.endsWith('/v2/checkout/orders')){orderBody=JSON.parse(opts.body);return {ok:true,json:async()=>({id:'ORDER-CA',links:[{rel:'approve',href:'https://example.test/approve'}]})};}if(url.endsWith('/capture')){captureCalls++;return {ok:true,json:async()=>({status:'COMPLETED',purchase_units:[{payments:{captures:[{id:'CAPTURE-CA',status:'COMPLETED',amount:{currency_code:'CAD',value:'269.51'}}]}}]})};}return {ok:true,json:async()=>({status:'APPROVED',purchase_units:badAmount?[{...orderBody.purchase_units[0],amount:{currency_code:'CAD',value:'1.00'}}]:orderBody.purchase_units})};};
 const adresses=Array.from({length:150},(_,i)=>({numero:String(100+i),rue:'Rue Test',ville:'Montreal',postal:'H2X 1A1',source:'point',lat:45.5,lng:-73.6}));
 const payload={centre:{libelle:'Montreal',lat:45.5,lng:-73.6},adresses,quantite:150,expectedTotal:q.price.total};
 assert.equal((await post('/api/espace/campagne/commander',{...payload,expectedTotal:1})).status,409);
 const r=await post('/api/espace/campagne/commander',payload);assert.equal(r.status,200,await r.clone().text());const order=await r.json();assert.equal(orderBody.purchase_units[0].amount.breakdown.tax_total.value,'31.01');
 let stored=await h.db.get('SELECT * FROM broker_campaigns WHERE id=$1',[order.id]);assert.equal(stored.hst_cents,3101);assert.equal(stored.gst_cents,0);assert.equal(stored.tax_snapshot.province,'ON');
 assert.equal((await post('/api/espace/campagne/commander',{...payload,reprend:order.id})).status,409);
 badAmount=true;await fetch(h.url+'/espace/campagne/retour?token=ORDER-CA&mode=live',{headers:f.headers,redirect:'manual'});assert.equal(captureCalls,0,'Do not capture a different PayPal amount');badAmount=false;
 await post('/api/espace/billing-address',{confirmed:true,address:address('QC')},'PUT');
 await fetch(h.url+'/espace/campagne/retour?token=ORDER-CA&mode=live',{headers:f.headers,redirect:'manual'});
 const invoice=await h.db.get('SELECT * FROM broker_invoices WHERE campaign_id=$1',[order.id]);assert(invoice);assert.equal(invoice.hst_cents,3101);assert.equal(invoice.tax_snapshot.billing_address.province,'ON');assert.equal(invoice.total_cents,26951);assert.equal(captureCalls,1);assert.match(h.emails[0].text,/HST/);assert.doesNotMatch(h.emails[0].text,/QST/);
 const pdf=require(root+'/invoice-v4').buildInvoicePdf({...invoice,campaign:stored},f.b,{name:'Liasse',gst:policy.gst_number,email:'billing@example.test'});fs.mkdirSync(__dirname+'/tax-preview',{recursive:true});fs.writeFileSync(__dirname+'/tax-preview/invoice-on.pdf',pdf);
 await fetch(h.url+'/espace/campagne/retour?token=ORDER-CA&mode=live',{headers:f.headers,redirect:'manual'});assert.equal(captureCalls,1);
 }finally{await h.close();}
});
