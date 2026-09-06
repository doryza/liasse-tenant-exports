const assert=require('node:assert/strict'),{create,root}=require('./harness.cjs');
const {chromium}=require('/home/liassetech/liasse.tech/node_modules/playwright'),authTools=require(root+'/broker-auth-v1');
const M=require(root+'/public/js/campaign-model-v1');
// Province-wide flow must work with address data alone, with no building attributes.
const center={lat:48.428,lng:-71.063,libelle:'Chicoutimi, Saguenay'},city='Saguenay';
const elements=[.001,.002,.005,.007,.01].map((delta,i)=>({type:'node',id:i+1,lat:center.lat+delta,lon:center.lng,tags:{'addr:housenumber':String(100+i),'addr:street':'rue du Test','addr:city':city}}));
(async()=>{
 const h=await create(),auth=authTools.create(h.services),browser=await chromium.launch({headless:true}),errors=[];let analysis=0,queries=[];
 try{
 for(const [width,lang] of [[1440,'fr'],[390,'en'],[320,'fr']]){
  const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,profile) VALUES($1,'Courtier Test',$2,'invited','{}') RETURNING *",['radius-'+width,'radius'+width+'@example.test']);
  const addresses=M.parse(elements,center,city,800),excluded=addresses[0].id;
  const legacy={center,city,radius:800,target:150,addresses,selected:addresses.slice(1).map(a=>a.id),excluded:[excluded],notes:'Keep my draft',polygon:[[45.1,-73.1],[45.2,-73.1],[45.1,-73.2]]};
  await h.db.run('INSERT INTO broker_campaign_drafts(broker_id,revision,data) VALUES ($1,1,$2)',[b.id,JSON.stringify(legacy)]);
  const c=await browser.newContext({viewport:{width,height:800}});
  await c.route('https://**/*',r=>r.abort());
  await c.route('https://photon.komoot.io/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({features:[{geometry:{coordinates:[center.lng,center.lat]},properties:{name:'Chicoutimi',city,countrycode:'CA'}}]})}));
  await c.route('https://overpass*/**',r=>{queries.push(new URLSearchParams(r.request().postData()).get('data'));return r.fulfill({contentType:'application/json',body:JSON.stringify({elements})});});
  const page=await c.newPage();page.on('pageerror',e=>{errors.push(e.message);console.error('Browser error:',e.message);});page.on('response',async r=>{if(r.url().includes('/api/espace/')&&r.status()>=400)console.error('API error:',r.status(),await r.text());});page.on('request',req=>{if(req.url().includes('/campagne/analyse'))analysis++;});
  const token=await auth.mint(b.id,'access');await page.goto(h.url+'/pwa/vendvite/acces/'+token+'?lang='+lang);await page.locator('form button').click();await page.waitForURL('**/espace');
  await page.goto(h.url+'/pwa/vendvite/espace/courrier-cible');await page.waitForFunction(()=>document.querySelector('#csSelected').textContent==='3');
  assert.equal(await page.locator('#csType,#csUnitFilter,#csSourceFilter,#csUnits,#csDraw,#csFinishDraw,#csClearDraw,#csPick,#csSearchHere').count(),0);
  assert.equal(await page.locator('#csNotes').inputValue(),'Keep my draft');
  assert.equal(await page.locator('.cs-address input').first().isChecked(),false,'legacy exclusions retained');
  await page.locator('#csSearch').fill('Chicoutimi');await page.locator('#csSearchForm button[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#csSearch').value.includes('Saguenay'));
  await page.locator('#csRadius').selectOption('400');await page.locator('#csScan').click();
  await page.waitForFunction(()=>document.querySelector('#csFound').textContent==='2');assert.equal(await page.locator('#csSelected').textContent(),'1');
  assert.match(queries.at(-1),/around:400,48\.428,-71\.063/);assert.ok(!queries.at(-1).includes('["building"]'));
  await page.waitForFunction(()=>/Brouillon enregistré|Draft saved/.test(document.querySelector('#csDraftStatus').textContent),null,{timeout:8000}).catch(async e=>{console.error(await page.locator('#csDraftStatus').innerText());throw e;});
  let draft=(await h.db.get('SELECT data FROM broker_campaign_drafts WHERE broker_id=$1',[b.id])).data;assert.deepEqual(draft.polygon,[],'legacy polygon no longer clips future searches');assert.ok(draft.excluded.includes(excluded));assert.equal(draft.radius,400);
  await page.locator('#csRadius').selectOption('800');await page.locator('#csScan').click();await page.waitForFunction(()=>document.querySelector('#csFound').textContent==='4');
  assert.equal(await page.locator('#csSelected').textContent(),'3');assert.equal(await page.locator('.cs-address input').first().isChecked(),false,'rescan does not reselect a removed address');
  await page.locator('#csAddressSearch').fill('102');assert.equal(await page.locator('.cs-address').count(),1);await page.locator('.cs-address input').uncheck();assert.equal(await page.locator('#csSelected').textContent(),'2');
  await page.locator('#csAddressSearch').fill('');await page.locator('#csUndo').click();assert.equal(await page.locator('#csSelected').textContent(),'3');
  await page.waitForFunction(()=>/Brouillon enregistré|Draft saved/.test(document.querySelector('#csDraftStatus').textContent),null,{timeout:8000}).catch(async e=>{console.error(await page.locator('#csDraftStatus').innerText());throw e;});
  await page.reload();await page.waitForFunction(()=>document.querySelector('#csSelected').textContent==='3');assert.equal(await page.locator('#csRadius').inputValue(),'800');
  assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true,'no overflow');
  await page.screenshot({path:'/tmp/vendvite-radius-'+width+'.png',fullPage:true});
  // Failed lookups retain the exact saved selection.
  await c.route('https://overpass*/**',r=>r.fulfill({status:503,body:'unavailable'}));await page.locator('#csScan').click();await page.waitForFunction(()=>document.querySelector('#csError').textContent.length>0);assert.equal(await page.locator('#csSelected').textContent(),'3');
  page.on('dialog',d=>d.accept());await page.locator('#csNew').click();await page.waitForFunction(()=>document.querySelector('#csSelected').textContent==='0');await page.waitForFunction(()=>/Brouillon enregistré|Draft saved/.test(document.querySelector('#csDraftStatus').textContent),null,{timeout:8000}).catch(async e=>{console.error(await page.locator('#csDraftStatus').innerText());throw e;});
  await c.close();console.log('Radius targeting passed at '+width+'px ('+lang+').');
 }
 assert.deepEqual(errors,[]);assert.equal(analysis,0,'no property enrichment requests');assert.equal(h.emails.length,0);
 }finally{await browser.close();await h.close();}
})().catch(e=>{console.error(e);process.exit(1)});
