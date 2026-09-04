const assert=require('node:assert/strict'),{create,root}=require('./harness.cjs');
const {chromium}=require('/home/liassetech/liasse.tech/node_modules/playwright'),authTools=require(root+'/broker-auth-v1');
const M=require(root+'/public/js/campaign-model-v1');
const elements=Array.from({length:165},(_,i)=>({type:'node',id:i+1,lat:45.522+(Math.floor(i/15)-5)*.0002,lon:-73.581+((i%15)-7)*.0002,tags:{'addr:housenumber':String(1000+i),'addr:street':'rue du Test','addr:city':'Montréal','addr:postcode':'H2A 1A1',building:i%4===0?'house':i%4===1?'apartments':i%4===2?'residential':'yes',...(i%4===1?{'building:flats':'8'}:i%4===2?{ownership:'condominium','building:flats':'4'}:{})}}));
(async()=>{
 const h=await create(),auth=authTools.create(h.services),browser=await chromium.launch({headless:true}),errors=[];
 h.services.fetch=async url=>{assert.match(url,/donnees.montreal.ca/);return {ok:true,json:async()=>({success:true,result:{records:[]}})}};
 try{
 const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,agency,status,profile) VALUES('qa-studio','Marie Tremblay','studio@example.test','Agence locale','invited',$1) RETURNING *",[JSON.stringify({agent_name:'Marie Tremblay',agency:'Agence locale',agent_email:'studio@example.test',agent_phone:'5145550100'})]);
 async function context(width,lang='fr'){
  const c=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});
  await c.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=','base64')}));
  await c.route('https://overpass*/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({elements})}));
  await c.route('https://photon.komoot.io/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({features:[{geometry:{coordinates:[-73.581,45.522]},properties:{name:'Montréal',city:'Montréal',countrycode:'CA'}}]})}));
  const page=await c.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  let token=await auth.mint(b.id,'access');await page.goto(h.url+'/pwa/vendvite/acces/'+token+'?lang='+lang);await page.locator('form button').click();await page.waitForURL('**/espace');
  await page.goto(h.url+'/pwa/vendvite/espace/courrier-cible?lang='+lang);await page.waitForFunction(()=>/enregistré|saved/i.test(document.querySelector('#csDraftStatus').textContent));return {c,page};
 }
 const {c,page}=await context(1440);
 assert.equal(await page.locator('#csLetterDialog').isVisible(),false);assert.equal(await page.locator('#csLetterFrame').getAttribute('src'),null);
 let controls=await page.locator('.cs-controls').boundingBox(),map=await page.locator('#csMap').boundingBox();assert.ok(map.x>controls.x+controls.width,'map is on the right');
 assert.equal(await page.locator('body').evaluate(b=>b.scrollWidth<=innerWidth),true);
 const tiles=await page.locator('.leaflet-tile').evaluateAll(imgs=>imgs.map(i=>i.src));assert.ok(tiles.length&&tiles.every(t=>Number(t.match(/openstreetmap.org\/(\d+)/)?.[1])<=5),'initial map shows province, not city: '+tiles.slice(0,2));
 await page.screenshot({path:'qa/campaign-desktop-initial.png',fullPage:true});
 await page.locator('[data-city=montreal]').click();await page.locator('#csScan').click();await page.waitForFunction(()=>document.querySelector('#csFound').textContent==='165');await page.waitForFunction(()=>!document.querySelector('#csCheckout').disabled);
 assert.equal(await page.locator('#csSelected').innerText(),'150');
 const first=await page.locator('.cs-address').first().getAttribute('data-address-id');await page.locator('.cs-address input').first().uncheck();assert.equal(await page.locator('#csSelected').innerText(),'149');
 await page.locator('#csFill').click();assert.equal(await page.locator('#csSelected').innerText(),'150');assert.equal(await page.locator('.cs-address').filter({has:page.locator('input:not(:checked)')}).count(),1);
 await page.locator('#csUndo').click();assert.equal(await page.locator('#csSelected').innerText(),'149');
 await page.locator('.cs-address-title').nth(1).click();await page.locator('#csProperty').waitFor();await page.locator('#csProperty > button').click();assert.equal(await page.locator('#csSelected').innerText(),'148');
 await page.waitForFunction(()=>document.querySelector('#csDraftStatus').textContent==='Brouillon enregistré');
 await page.reload();await page.waitForFunction(()=>document.querySelector('#csSelected').textContent==='148');
 const draft=await h.db.get('SELECT data FROM broker_campaign_drafts WHERE broker_id=$1',[b.id]);assert.equal(draft.data.selected.length,148);assert.equal(draft.data.excluded.length,2);assert.ok(draft.data.excluded.includes(first));
 await page.locator('[data-view=removed]').click();assert.equal(await page.locator('.cs-address').count(),17);await page.locator('[data-view=all]').click();
 await page.locator('#csType').selectOption('condo');assert.ok(await page.locator('.cs-address').count()>0);assert.equal(await page.locator('.cs-address .cs-condo').count(),await page.locator('.cs-address').count());await page.locator('#csType').selectOption('');
 await page.locator('#csSelectFiltered').click();await page.waitForFunction(()=>document.querySelector('#csQuoteExtra').textContent==='15'&&!document.querySelector('#csCheckout').disabled);assert.equal(await page.locator('#csSelected').innerText(),'165');
 await page.locator('.cs-address input').first().uncheck();await page.waitForFunction(()=>document.querySelector('#csQuoteExtra').textContent==='14'&&!document.querySelector('#csCheckout').disabled);
 await page.locator('#csCheckout').click();assert.equal(await page.locator('#csReviewDialog').isVisible(),true);assert.match(await page.locator('#csReviewContent').innerText(),/164 lettres/);await page.locator('#csReviewDialog [data-close-dialog]').first().click();
 const download=page.waitForEvent('download');await page.locator('#csExport').click();assert.equal((await download).suggestedFilename(),'vendvite-selection.csv');
 await page.locator('#csLetterOpen').click();assert.equal(await page.locator('#csLetterDialog').isVisible(),true);assert.match(await page.locator('#csLetterFrame').getAttribute('src'),/lettre-proprietaires/);await page.locator('#csLetterDialog [data-close-dialog]').click();
 await page.screenshot({path:'qa/campaign-desktop-selection.png',fullPage:true});
 await page.waitForFunction(()=>document.querySelector('#csDraftStatus').textContent==='Brouillon enregistré');
 // A new device restores the saved target and exact exclusions.
 const second=await context(390,'en');assert.equal(await second.page.locator('#csSelected').innerText(),'164');assert.equal(await second.page.locator('body').evaluate(b=>b.scrollWidth<=innerWidth),true);await second.page.screenshot({path:'qa/campaign-mobile-selection.png',fullPage:true});
 // Conflicting tabs retain the local change; no silent overwrite.
 await page.locator('#csNotes').fill('Tab A saved');await page.waitForFunction(()=>document.querySelector('#csDraftStatus').textContent==='Brouillon enregistré');await second.page.locator('#csNotes').fill('Tab B kept locally');await second.page.waitForFunction(()=>document.querySelector('#csDraftStatus').textContent.toLowerCase().includes('another tab'));await second.page.reload();await second.page.waitForFunction(()=>document.querySelector('#csNotes').value==='Tab B kept locally');assert.match(await second.page.locator('#csDraftStatus').innerText(),/another tab/i);
 await second.page.locator('#csDraftRestore').click();await second.page.waitForFunction(()=>document.querySelector('#csNotes').value==='Tab A saved');assert.equal(await second.page.locator('#csDraftRestore').isVisible(),false);await second.c.close();await c.close();
 for(const width of [390,320])for(const lang of ['fr','en']){let p=await context(width,lang);assert.equal(await p.page.locator('body').evaluate(b=>b.scrollWidth<=innerWidth),true,`${width} ${lang} overflow`);assert.equal(await p.page.locator('#csLetterDialog').isVisible(),false);await p.c.close();}
 assert.deepEqual(errors,[]);assert.equal(h.emails.length,0);console.log('Campaign browser checks passed: Québec overview, map right, selection/exclusion/undo, exact quote, cross-device drafts, conflict recovery, filters, letter dialog and FR/EN mobile widths. No external messages or payments.');
 }finally{await browser.close();await h.close()}
})().catch(e=>{console.error(e);process.exit(1)});
