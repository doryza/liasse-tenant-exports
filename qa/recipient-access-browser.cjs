const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {create,root}=require('./harness.cjs'),mail=require(root+'/mailing-service-v4'),model=require(root+'/public/js/campaign-model-v1');
const {chromium}=require('/home/liassetech/courtier-outreach/node_modules/playwright-core');
const out='/home/liassetech/previews/vendvite-qr-gating';
(async()=>{
 const h=await create(),browser=await chromium.launch({executablePath:'/home/liassetech/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
 const targets=[],qr=require('/home/liassetech/liasse.tech/node_modules/qrcode');h.services.qrcode.toDataURL=async(url,options)=>{targets.push(url);return qr.toDataURL(url,options)};
 try{
  const broker=await h.db.get("INSERT INTO brokers(slug,full_name,email,agency,access_plan,status,published) VALUES('qa-qr-browser','Camille Exemple','qa@example.test','Agence Exemple','mailing','invited',1) RETURNING *");
  const address={numero:'4410',rue:'Pl. de la Meuse',ville:'Laval',postal:'H7W 4Y4',lat:45.55,lng:-73.764};
  await h.db.run('INSERT INTO broker_campaign_drafts(broker_id,data) VALUES($1,$2)',[broker.id,JSON.stringify({addresses:[address],selected:[model.key(address)]})]);
  const raw=crypto.randomBytes(32).toString('hex');await h.db.run("INSERT INTO broker_sessions(broker_id,token_hash,device_label,idle_expires_at,absolute_expires_at) VALUES($1,$2,'Browser QA',NOW()+INTERVAL '1 hour',NOW()+INTERVAL '1 hour')",[broker.id,crypto.createHash('sha256').update(raw).digest('hex')]);
  const owner=await browser.newContext({viewport:{width:390,height:844}});await owner.addCookies([{name:'vv_broker_session',value:raw,url:h.url}]);
  const page=await owner.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(h.url+'/pwa/vendvite/espace/lettre-proprietaires?proof=1&_embed=1');assert.equal(await page.locator('.qr img').count(),2);for(const img of await page.locator('.qr img').all())assert.equal(await img.evaluate(i=>i.complete&&i.naturalWidth>0),true);
  const proofUrl=targets[0];assert.equal(proofUrl,h.url+'/pwa/vendvite/espace/apercu?proof=1');assert.ok(await page.locator('.proof-note').isVisible());
  await page.screenshot({path:out+'/private-letter-mobile.png',fullPage:true});
  await page.goto(proofUrl);assert.equal(await page.locator('#addressInput').inputValue(),mail.addressLines(address).join(', '));await page.locator('#leadName').fill('Preview QA');await page.locator('#sealBtn').click();assert.match(await page.locator('#formError').innerText(),/Aucune demande envoyée/);assert.equal((await h.db.get('SELECT COUNT(*)::int AS n FROM broker_leads')).n,0);
  const publicContext=await browser.newContext({viewport:{width:390,height:844}}),visitor=await publicContext.newPage();visitor.on('pageerror',e=>errors.push(e.message));await visitor.goto(proofUrl);assert.equal(await visitor.locator('#leadForm').count(),0);
  const c=await h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,addresses) VALUES($1,'paid','confirmed','paid',$2) RETURNING *",[broker.id,JSON.stringify([address])]);
  const printer=await owner.newPage();await printer.setExtraHTTPHeaders({'x-test-admin':'yes'});await printer.goto(h.url+'/admin/campagnes/'+c.id+'/lettres');const campaign=await h.db.get('SELECT * FROM broker_campaigns WHERE id=$1',[c.id]);
  const url=h.url+'/courrier/'+campaign.mailing_token+'/'+campaign.addresses[0].mailing_id;assert.ok(targets.includes(url+'?lang=fr'));assert.ok(targets.includes(url+'?lang=en'));
  for(const lang of ['fr','en']){
   await visitor.goto(url+'?lang='+lang);assert.equal(await visitor.locator('#addressInput').inputValue(),mail.addressLines(address).join(', '));assert.equal(await visitor.locator('#leadForm').isVisible(),true);
   await visitor.locator('#changeRecipientAddress').click();await visitor.locator('#addressInput').fill('987 Nouvelle rue, Laval QC H7W 4Y4');await visitor.locator('#leadName').fill('Homeowner '+lang);await visitor.locator('#leadEmail').fill('home@example.test');
   const pending=visitor.waitForRequest(r=>r.url().endsWith('/piste'));await visitor.locator('#sealBtn').click();const payload=(await pending).postDataJSON();assert.equal(payload.mailingRecipient,campaign.addresses[0].mailing_id);assert.equal(payload.mailingToken,campaign.mailing_token);await visitor.locator('#ficheSuccess').waitFor({state:'visible'});
  }
  const leads=await h.db.all('SELECT address FROM broker_leads');assert.equal(leads.length,2);assert.ok(leads.every(l=>l.address==='987 Nouvelle rue, Laval QC H7W 4Y4'));
  await visitor.goto(h.url+'/'+broker.slug+'?address=123');assert.equal(visitor.url(),h.url+'/');
  await visitor.goto(h.url+'/courrier/'+campaign.mailing_token);assert.equal(visitor.url(),h.url+'/');
  assert.deepEqual(errors,[]);const report={privateQrPrefills:true,anonymousPreviewClosed:true,previewCreatesNoLead:true,productionQrBothLanguages:true,mobileSubmissionBothLanguages:true,updatedAddressSaved:true,bareUrlsRedirect:true,errors};fs.writeFileSync(out+'/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();await h.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
