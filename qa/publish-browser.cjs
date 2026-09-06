const assert=require('node:assert/strict');
const {create,root}=require('./harness.cjs');
const {chromium}=require('/home/liassetech/liasse.tech/node_modules/playwright');
const authTools=require(root+'/broker-auth-v1');
(async()=>{
 const h=await create(),auth=authTools.create(h.services),browser=await chromium.launch({headless:true}),errors=[];
 try{
  for(const width of [1440,390,320])for(const lang of ['fr','en']){
   const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,membership_expires_at,profile) VALUES ($1,'Marie Tremblay',$2,'active',NOW()+INTERVAL '1 year','{}') RETURNING *",['publish-'+width+lang,'qa'+width+lang+'@example.test']);
   const context=await browser.newContext({viewport:{width,height:width===1440?800:568}}),page=await context.newPage();
   await context.route('https://**/*',r=>r.abort());
   page.on('pageerror',e=>errors.push(e.message));
   const token=await auth.mint(b.id,'access');await page.goto(h.url+'/pwa/vendvite/acces/'+token+'?lang='+lang);
   await page.locator('form button').click();await page.waitForURL('**/espace');
   const pub=page.locator('[data-publish=true]');
   assert.ok((await pub.boundingBox()).y<800,'overview publication visible on arrival '+width+lang);
   await page.goto(h.url+'/pwa/vendvite/espace/page');
   assert.equal(await page.locator('body').evaluate(b=>b.scrollWidth<=innerWidth),true,'no editor overflow '+width+lang);
   let rect=await pub.boundingBox();assert.ok(rect.y>=0 && rect.y+rect.height<=(width===1440?800:568),'publication visible without scrolling '+width+lang);
   await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
   rect=await pub.boundingBox();assert.ok(rect.y>=0 && rect.y+rect.height<=(width===1440?800:568),'publication stays visible at bottom '+width+lang);
   await page.evaluate(()=>window.scrollTo(0,0));
   if(lang==='fr')await page.screenshot({path:'/tmp/vendvite-publish-editor-'+width+'.png'});
   await page.locator('#f_agent_name').fill('');await pub.click();
   await page.waitForFunction(()=>document.querySelector('#savedFlag').classList.contains('is-error'));
   let stored=await h.db.get('SELECT profile,published FROM brokers WHERE id=$1',[b.id]);assert.ok(!stored.profile.setup_completed_at);assert.equal(stored.published,0);
   await page.locator('#f_agent_name').fill('Marie Tremblay');
   await page.locator('#saveBtn').click();await page.waitForFunction(()=>document.querySelector('#savedFlag').textContent.match(/Modifications enregistrées|Changes saved/));
   stored=await h.db.get('SELECT profile,published FROM brokers WHERE id=$1',[b.id]);assert.ok(stored.profile.setup_completed_at);assert.equal(stored.published,0,'saving never publishes');
   await page.goto(h.url+'/pwa/vendvite/espace');assert.equal(await page.locator('.ws-checklist li').first().getAttribute('class'),'is-done');
   await page.goto(h.url+'/pwa/vendvite/espace/apercu');assert.equal(await page.locator('.bp-peek-btn').getAttribute('href'),'espace/page#pageActions');assert.match(await page.locator('.bp-peek-btn').textContent(),/Publier|Publish/);
   await page.locator('.bp-peek-btn').click();await page.waitForURL('**/espace/page#pageActions');
   await h.db.run('UPDATE brokers SET profile_version=profile_version+1 WHERE id=$1',[b.id]);
   await page.locator('#f_about').fill('Keep this draft');await pub.click();await page.waitForFunction(()=>document.querySelector('#savedFlag').classList.contains('is-error'));
   assert.equal((await h.db.get('SELECT published FROM brokers WHERE id=$1',[b.id])).published,0,'conflicting save blocks publish');
   assert.equal(await page.locator('#f_about').inputValue(),'Keep this draft');
   page.on('dialog',d=>d.accept());await page.reload();
   await page.locator('#f_about').fill('Saved with publication');await pub.click();
   await page.waitForFunction(()=>window.VV.live===true);
   stored=await h.db.get('SELECT profile,published FROM brokers WHERE id=$1',[b.id]);assert.equal(stored.published,1);assert.equal(stored.profile.about,'Saved with publication');
   assert.equal(await page.locator('[data-publish=true]').count(),0);
   // Existing live pages count as personalized even without the old timestamp.
   await h.db.run("UPDATE brokers SET profile=profile-'setup_completed_at' WHERE id=$1",[b.id]);
   await page.goto(h.url+'/pwa/vendvite/espace');assert.equal(await page.locator('.ws-checklist li').first().getAttribute('class'),'is-done');
   await h.db.run('UPDATE brokers SET published=0 WHERE id=$1',[b.id]);await page.reload();
   await pub.click();await page.waitForFunction(()=>window.VV.live===true);
   stored=await h.db.get('SELECT profile,published FROM brokers WHERE id=$1',[b.id]);assert.ok(stored.profile.setup_completed_at);assert.equal(stored.published,1,'overview publishes saved page');
   // Unpaid editors save successfully and continue to membership, without publishing or charging.
   await h.db.run("UPDATE brokers SET status='invited',published=0,membership_expires_at=NULL,profile=profile-'setup_completed_at' WHERE id=$1",[b.id]);
   await page.goto(h.url+'/pwa/vendvite/espace/page');await page.locator('#f_about').fill('Ready for membership');await pub.click();await page.waitForURL('**/espace/abonnement');
   stored=await h.db.get('SELECT profile,published FROM brokers WHERE id=$1',[b.id]);assert.ok(stored.profile.setup_completed_at);assert.equal(stored.published,0);
   assert.equal((await h.db.get('SELECT COUNT(*)::int n FROM broker_invoices')).n,0);
   await context.close();console.log('Publish flow passed at '+width+'px ('+lang+').');
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close();await h.close();}
})().catch(e=>{console.error(e);process.exit(1)});
