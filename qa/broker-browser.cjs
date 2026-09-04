const assert=require('node:assert/strict'),{create,root}=require('./harness.cjs');
const {chromium}=require('/home/liassetech/liasse.tech/node_modules/playwright');const authTools=require(root+'/broker-auth-v1');
(async()=>{
 const h=await create(),auth=authTools.create(h.services),browser=await chromium.launch({headless:true}),errors=[];
 try{
  const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,agency,status,profile) VALUES ('qa-broker','Marie Tremblay','marie@example.test','Agence locale','invited',$1) RETURNING *",[JSON.stringify({agent_name:'Marie Tremblay',agency:'Agence locale',agent_email:'marie@example.test',agent_phone:'5145550100'})]);
  const lead=await h.db.get("INSERT INTO broker_leads(broker_id,name,email,address) VALUES ($1,'Jean Propriétaire','jean@example.test','123 rue Principale') RETURNING *",[b.id]);
  const loginContext=await browser.newContext(),login=await loginContext.newPage();
  await login.goto(h.url+'/pwa/vendvite/?vv_preview=visible');await login.locator('.hp-broker-login').click();
  await login.locator('#loginEmail').fill(b.email);await login.locator('#brokerLoginForm button').click();
  await login.locator('#loginResult.ws-success').waitFor();assert.equal(h.emails.length,1);assert.equal(await login.locator('#brokerLoginForm button').isDisabled(),true);
  await loginContext.close();
  for(const width of [1440,390,320])for(const lang of ['fr','en']){
   const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   const token=await auth.mint(b.id,'access');await page.goto(h.url+'/pwa/vendvite/acces/'+token+'?lang='+lang,{waitUntil:'networkidle'});
   assert.equal(await page.locator('body').evaluate(b=>b.scrollWidth<=innerWidth),true,'login overflow '+width);
   if(width!==320 && lang==='fr')await page.screenshot({path:'qa/broker-confirm-'+width+'.png',fullPage:true});
   await page.locator('form button').click();await page.waitForURL('**/pwa/vendvite/espace');
   for(const path of ['espace','espace/page','espace/pistes','espace/compte','espace/abonnement','espace/courrier-cible']){
    await page.goto(h.url+'/pwa/vendvite/'+path+'?lang='+lang,{waitUntil:'networkidle'});
    assert.equal(await page.locator('body').evaluate(b=>b.scrollWidth<=innerWidth),true,'overflow '+width+' '+lang+' '+path);
    assert.equal(await page.locator('.esp-tab[aria-current=page]').count(),1);
    if(width!==320 && lang==='fr' && ['espace','espace/pistes','espace/compte'].includes(path))await page.screenshot({path:'qa/broker-'+path.replaceAll('/','-')+'-'+width+'.png',fullPage:true});
   }
   await page.goto(h.url+'/pwa/vendvite/espace/page?lang='+lang,{waitUntil:'networkidle'});
   await page.locator('#f_about').fill('A carefully saved profile '+width+lang);assert.match(await page.locator('#savedFlag').innerText(),lang==='fr'?/non enregistrées/:/Unsaved/);
   await page.locator('#saveBtn').click();await page.waitForFunction(()=>document.querySelector('#savedFlag').textContent.match(/Modifications enregistrées|Changes saved/));
   assert.equal((await h.db.get('SELECT profile FROM brokers WHERE id=$1',[b.id])).profile.about,'A carefully saved profile '+width+lang);
   // A real server-side conflict leaves the broker's draft untouched.
   await h.db.run('UPDATE brokers SET profile_version=profile_version+1 WHERE id=$1',[b.id]);
   await page.locator('#f_about').fill('Keep this draft');await page.locator('#saveBtn').click();await page.waitForFunction(()=>document.querySelector('#savedFlag').classList.contains('is-error'));assert.equal(await page.locator('#f_about').inputValue(),'Keep this draft');
   page.on('dialog',d=>d.accept());await page.reload({waitUntil:'networkidle'});
   // One failed lead write, visible retry, then a successful persisted update.
   await page.goto(h.url+'/pwa/vendvite/espace/pistes?lang='+lang,{waitUntil:'networkidle'});
   await page.route('**/api/espace/leads/'+lead.id,route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"unavailable"}'}),{times:1});
   await page.locator('.esp-lead-notes').fill('Call after 5pm');await page.locator('[data-lead-retry]').waitFor({state:'visible'});assert.equal(await page.locator('.esp-lead-notes').inputValue(),'Call after 5pm');
   await page.locator('[data-lead-retry]').click();await page.waitForFunction(()=>document.querySelector('[data-lead-save]').textContent.match(/Modifications enregistrées|Changes saved/));assert.equal((await h.db.get('SELECT notes FROM broker_leads WHERE id=$1',[lead.id])).notes,'Call after 5pm');
   await page.locator('#leadSearch').fill('no match');assert.equal(await page.locator('#leadNoMatches').isVisible(),true);await page.locator('#leadSearch').fill('Jean');assert.equal(await page.locator('.esp-lead').isVisible(),true);
   // The same used invitation remains convenient on the authenticated browser.
   await page.goto(h.url+'/pwa/vendvite/acces/'+token);await page.waitForURL('**/pwa/vendvite/espace');
   await page.goto(h.url+'/pwa/vendvite/espace/compte');await page.locator('[data-signout=one]').click();await page.waitForURL('**/pwa/vendvite/connexion');assert.equal(await page.locator('#brokerLoginForm').isVisible(),true);
   await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log('36 workspace page scenarios passed (6 pages × FR/EN × desktop/mobile/narrow), plus real sign-in, saves, conflicts, failed-save retry, filtering, reused invitation and signout.');
 }finally{await browser.close();await h.close();}
})().catch(e=>{console.error(e);process.exit(1)});
