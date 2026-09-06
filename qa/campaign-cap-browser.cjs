const assert=require('node:assert/strict'),{create,root}=require('./harness.cjs');
const {chromium}=require('/home/liassetech/liasse.tech/node_modules/playwright'),authTools=require(root+'/broker-auth-v1');
const M=require(root+'/public/js/campaign-model-v1');
const center={lat:45.78,lng:-74,libelle:'Saint-Jérôme'};
const addresses=Array.from({length:1205},(_,i)=>{
 const a={numero:String(10000+i),rue:'rue Test',ville:'Saint-Jérôme',unit:'',postal:'',source:i===1204?'interpole':'point',lat:center.lat+Math.floor(i/50)*.00002,lng:center.lng+(i%50)*.00002};
 a.id=M.key(a);a.metres=M.distance(center,a);return a;
});
const number=text=>Number(text.replace(/\D/g,''));
async function count(page,n){
 await page.waitForFunction(n=>Number(document.querySelector('#csSelected').textContent.replace(/\D/g,''))===n&&Number(document.querySelector('#csQuoteCount').textContent.replace(/\D/g,''))===n&&!document.querySelector('#csCheckout').disabled,n);
 assert.equal(number(await page.locator('#csMapCount').innerText()),n);
}
async function saved(page,h,id,n){
 await page.waitForFunction(()=>/Brouillon enregistré|Draft saved/.test(document.querySelector('#csDraftStatus').textContent));
 const draft=await h.db.get('SELECT revision,data FROM broker_campaign_drafts WHERE broker_id=$1',[id]);
 assert.equal(draft.data.selected.length,n);return draft;
}
(async()=>{
 const h=await create(),auth=authTools.create(h.services),browser=await chromium.launch({headless:true}),errors=[];
 try{
  for(const [width,lang] of [[1440,'fr'],[390,'en'],[320,'fr']]){
   const broker=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,profile) VALUES($1,'Cap Test',$2,'invited','{}') RETURNING *",['cap-'+width,'cap'+width+'@example.test']);
   const draft={center,city:'Saint-Jérôme',radius:800,target:1200,addresses,selected:addresses.slice(0,1199).map(a=>a.id),excluded:[],notes:'Cap regression',polygon:[],reprise:0};
   await h.db.run('INSERT INTO broker_campaign_drafts(broker_id,revision,data) VALUES($1,1,$2)',[broker.id,JSON.stringify(draft)]);
   const context=await browser.newContext({viewport:{width,height:1000},isMobile:width<500,hasTouch:width<500});
   await context.route('https://**/*',r=>r.abort());
   await context.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=','base64')}));
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   const token=await auth.mint(broker.id,'access');await page.goto(h.url+'/pwa/vendvite/acces/'+token+'?lang='+lang);await page.locator('form button').click();await page.waitForURL('**/espace');
   await page.goto(h.url+'/pwa/vendvite/espace/courrier-cible?lang='+lang);await count(page,1199);
   await page.locator('[data-view="removed"]').click();
   const checks=page.locator('.cs-address input');
   await checks.first().click();await count(page,1200);
   // The remaining rows must never look selected after a rejected native change.
   await checks.first().evaluate(input=>{input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));});
   assert.equal(await checks.first().isChecked(),false,'rejected checkbox is restored to actual selection');
   assert.equal(await checks.first().isDisabled(),true,'extra doors are disabled at the cap');
   assert.equal(await checks.count(),5);assert.equal(await page.locator('.cs-address input:checked').count(),0);
   assert.equal(await page.locator('#csSelectFiltered').isDisabled(),true);
   assert.match(await page.locator('#csSelectionLimit').innerText(),lang==='fr'?/Retirez.*adresse/:/Remove.*address/);
   const atCap=await saved(page,h,broker.id,1200);
   await page.locator('.cs-address-title').first().click();
   assert.equal(await page.locator('#csProperty .esp-btn').isDisabled(),true,'property add blocked');
   assert.equal(await page.locator('.leaflet-popup-content button').isDisabled(),true,'map popup add blocked');
   assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true);
   await page.locator('#csProperty .cs-property-actions button').click();
   // Rejected additions must not introduce an undo step or save a fake selection.
   await page.locator('#csUndo').click();await count(page,1199);
   assert.equal(await checks.first().isDisabled(),false);
   assert.equal(await page.locator('#csUndo').isDisabled(),true);
   assert.equal(await page.locator('#csSelectionLimit').isVisible(),false);
   // Keyboard selection reaches the same cap, including estimated addresses.
   await checks.last().focus();await page.keyboard.press('Space');await count(page,1200);
   let stored=await saved(page,h,broker.id,1200);assert.ok(stored.data.selected.includes(addresses[1204].id));
   assert.ok(stored.revision>atCap.revision);
   await page.locator('[data-view="selected"]').click();await page.locator('.cs-address input').first().click();await count(page,1199);
   await page.locator('[data-view="removed"]').click();await checks.last().click();await count(page,1200);
   stored=await saved(page,h,broker.id,1200);assert.ok(!stored.data.selected.includes(addresses[0].id));assert.ok(stored.data.selected.includes(addresses[1203].id));
   // Bulk addition can only use the remaining two slots, across the filtered list.
   await page.locator('[data-view="selected"]').click();await page.locator('.cs-address input').first().click();await page.locator('.cs-address input').first().click();await count(page,1198);
   await page.locator('[data-view="removed"]').click();await page.locator('#csSelectFiltered').click();await count(page,1200);
   assert.equal(await page.locator('.cs-address input:checked').count(),0);
   assert.equal(await page.locator('#csSelectFiltered').isDisabled(),true);
   stored=await saved(page,h,broker.id,1200);
   await page.reload();await count(page,1200);await page.locator('[data-view="removed"]').click();
   assert.equal(await checks.first().isDisabled(),true);
   assert.equal(await page.locator('.cs-address input:checked').count(),0);
   const downloadPromise=page.waitForEvent('download');await page.locator('#csExport').click();const download=await downloadPromise;
   const csv=require('fs').readFileSync(await download.path(),'utf8');assert.equal(csv.split('\r\n').length-1,1200,'export contains the same 1,200 selected doors');
   await page.locator('#csCheckout').click();assert.equal(number((await page.locator('#csReviewContent .cs-review-total').first().innerText()).split(' · ')[0]),1200);
   assert.equal(new Set(stored.data.selected).size,1200);
   await context.close();console.log('Selection cap browser checks passed at '+width+'px ('+lang+').');
  }
  assert.deepEqual(errors,[]);assert.equal(h.emails.length,0);
 }finally{await browser.close();await h.close();}
})().catch(e=>{console.error(e);process.exit(1)});
