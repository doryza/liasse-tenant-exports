const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,root}=require('./harness.cjs'),email=require(root+'/invoice-email-v3'),config=require(root+'/invoice-settings-v1');
const admin={'x-test-admin':'yes','Content-Type':'application/json'};
async function fixture(h){
 const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,agency) VALUES('invoice-settings','Camille Exemple','camille@example.test','Agence Exemple') RETURNING *");
 const c=await h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,address_count,quantity,centre_label) VALUES($1,'paid','confirmed','paid',150,150,'Laval') RETURNING *",[b.id]);
 async function invoice(key){return h.db.get("INSERT INTO broker_invoices(broker_id,kind,campaign_id,invoice_number,payment_key,payment_time,subtotal_cents,gst_cents,qst_cents,total_cents) VALUES($1,'campagne',$2,$3,$3,NOW(),23850,1193,2379,27422) RETURNING *",[b.id,c.id,key]);}
 return {b,c,invoice};
}
test('invoice emails default to body-only with complete amounts and preserve sandbox notices',()=>{
 const invoice={kind:'campagne',invoice_number:'VV-TEST-1',campaign_id:35,payment_time:'2026-09-06',is_test:1,subtotal_cents:23850,gst_cents:1193,qst_cents:2379,total_cents:27422,campaign:{address_count:150,centre_label:'Laval'}};
 const msg=email.message(invoice,{full_name:'Camille <script>x</script>',email:'camille@example.test'},{name:'VendVite',email:'billing@example.test'},'https://vendvite.app/espace/factures/1/pdf');
 assert.equal('attachments' in msg,false);assert.equal(msg.skipInbox,true);assert.match(msg.text,/274,22 \$/);assert.doesNotMatch(msg.text,/\bCAD\b/);assert.match(msg.text,/11,93/);assert.match(msg.text,/23,79/);assert.match(msg.text,/150/);assert.match(msg.text,/billing@example.test/);assert.match(msg.text,/Aucun paiement réel/);assert.doesNotMatch(msg.html,/<script>/);assert.doesNotMatch(msg.text,/jointe en PDF/);
 const settings={invoice_attach_pdf:'1',invoice_pdf_link:'0',invoice_email_subject:'Merci {nom_agent} — {numero_facture}',invoice_email_title:'Votre commande {numero_campagne}',invoice_email_intro:'{nombre_lettres} lettres pour {total}.\n<script>alert(1)</script>',invoice_email_footer:'À bientôt'};
 const customized=email.message(invoice,{full_name:'Camille',email:'camille@example.test'},{},'https://vendvite.app/private-pdf',settings);assert.equal(customized.attachments.length,1);assert.match(customized.subject,/TEST PAYPAL/);assert.match(customized.subject,/Merci Camille/);assert.match(customized.text,/150 lettres pour 274,22/);assert.doesNotMatch(customized.text,/private-pdf/);assert.doesNotMatch(customized.html,/<script>/);assert.match(customized.html,/&lt;script&gt;/);assert.match(customized.text,/Document de test/);
 const legacy=email.message({...invoice,kind:'subscription',campaign:null,paypal_subscription_id:'SUB-1',period_start:'2026-09-06',period_end:'2027-09-06'},{full_name:'Camille',email:'camille@example.test'},{},'https://vendvite.app/pdf');assert.equal('attachments' in legacy,false);assert.match(legacy.text,/Abonnement annuel/);assert.doesNotMatch(legacy.text,/aucun courrier|72 heures/);
});

test('tenant invoice settings persist, previews send nothing, and future sends use the saved configuration',async()=>{
 const h=await create();
 const request=(method,url,body,headers=admin)=>fetch(h.url+url,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});
 try{
  const f=await fixture(h),base='/api/admin/invoice-settings';
  assert.equal((await request('GET',base,undefined,{})).status,403);
  assert.equal((await request('PUT',base,{settings:{invoice_attach_pdf:true}},{...admin,origin:'https://evil.test'})).status,403);
  let saved=await (await request('GET',base)).json();assert.equal(saved.settings.invoice_attach_pdf,'0');
  const one=await f.invoice('VV-2026-SETTINGS-1');assert.equal((await request('POST','/api/admin/ventes/factures/'+one.id+'/envoyer',{})).status,200);assert.equal(h.emails.length,1);assert.equal('attachments' in h.emails[0],false);assert.equal(h.emails[0].replyTo.email,'notifications@vendvite.app');
  const changes={invoice_attach_pdf:true,invoice_pdf_link:false,invoice_email_subject:'Votre envoi {numero_facture}',invoice_email_intro:'{nom_agent}, voici vos {nombre_lettres} lettres : {total}.',invoice_email_footer:'Votre équipe locale',invoice_issuer_name:'Agence de facturation',invoice_issuer_email:'billing@example.test',invoice_gst_number:'TPS-EXEMPLE',invoice_qst_number:'TVQ-EXEMPLE'};
  assert.equal((await request('PUT',base,{settings:changes})).status,200);saved=await (await request('GET',base)).json();assert.equal(saved.settings.invoice_attach_pdf,'1');assert.equal(saved.issuer.name,'Agence de facturation');assert.equal(saved.issuer.email,'billing@example.test');
  await h.pg.exec(require('fs').readFileSync(root+'/migrations.sql','utf8'));assert.equal((await h.db.get("SELECT value FROM admin_settings WHERE key='invoice_attach_pdf'")).value,'1','Migrations must preserve the chosen setting');
  const preview=await request('POST',base+'/preview',{settings:{invoice_email_subject:'Brouillon {numero_facture}'},sandbox:true});assert.equal(preview.status,200);const p=await preview.json();assert.match(p.subject,/Brouillon EXEMPLE-001/);assert.match(p.html,/TEST PAYPAL/);assert.equal(p.hasAttachment,true);assert.equal(h.emails.length,1);assert.equal((await (await request('GET',base)).json()).settings.invoice_email_subject,changes.invoice_email_subject,'Preview must not save edits');
  const two=await f.invoice('VV-2026-SETTINGS-2');await request('POST','/api/admin/ventes/factures/'+two.id+'/envoyer',{});assert.equal(h.emails.length,2);const msg=h.emails[1];assert.equal(msg.replyTo.email,changes.invoice_issuer_email);assert.equal(msg.attachments.length,1);assert.match(msg.text,/Camille Exemple, voici vos 150 lettres : 274,22/);assert.match(msg.text,/TPS-EXEMPLE/);assert.match(msg.text,/Agence de facturation/);assert.doesNotMatch(msg.html,/Télécharger ma facture/);
  const pdf=await request('GET','/admin/ventes/factures/'+two.id+'/pdf');assert.equal(pdf.status,200);assert(Buffer.from(await pdf.arrayBuffer()).toString('latin1').includes('Agence de facturation'));
  const prior=JSON.stringify((await (await request('GET',base)).json()).settings);
  for(const settings of [{invoice_attach_pdf:'bad'},{invoice_email_subject:'Bad {missing}'},{invoice_email_title:''},{invoice_issuer_email:'not an email'},{invoice_email_subject:'x\nBcc: y@example.test'},{paypal_mode:'live'}])assert.equal((await request('PUT',base,{settings})).status,400);
  assert.equal(JSON.stringify((await (await request('GET',base)).json()).settings),prior);
  assert.equal((await request('PUT','/api/admin/settings',{key:'invoice_attach_pdf',value:'bad'})).status,400);
  await request('PUT',base,{settings:{invoice_attach_pdf:false}});const three=await f.invoice('VV-2026-SETTINGS-3');await request('POST','/api/admin/ventes/factures/'+three.id+'/envoyer',{});assert.equal('attachments' in h.emails[2],false);
 }finally{await h.close();}
});
