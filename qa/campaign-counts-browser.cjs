const assert=require('node:assert/strict'),{create,root}=require('./harness.cjs');
const {chromium}=require('/home/liassetech/liasse.tech/node_modules/playwright'),authTools=require(root+'/broker-auth-v1');
const M=require(root+'/public/js/campaign-model-v1');
const center={lat:45.78,lng:-74,libelle:'Saint-Jérôme'},city='Saint-Jérôme';
const legacyAddresses=Array.from({length:4000},(_,i)=>{
 const a={numero:String(i<611?10000+i:20000+i-611),rue:i<611?'rue cartographiée':'rue estimée',ville:city,unit:'',postal:'',source:i<611?'point':'interpole',lat:center.lat+Math.floor(i/100)*0.00004,lng:center.lng+(i%100)*0.000025};
 a.id=M.key(a);a.metres=M.distance(center,a);return a;
}).sort((a,b)=>a.metres-b.metres);
const excludedEstimate=legacyAddresses.find(a=>a.source==='interpole');
const mappedFirst=legacyAddresses.find(a=>a.source==='point');
function rescanElements(){
 let id=0;const elements=[];
 for(let street=0;street<12;street++){
  const a={type:'node',id:++id,lat:center.lat+street*0.00001,lon:center.lng,tags:{'addr:housenumber':'1','addr:street':'Plage '+street}};
  const b={type:'node',id:++id,lat:a.lat+0.000001,lon:center.lng+0.0005,tags:{'addr:housenumber':'401','addr:street':'Plage '+street}};
  elements.push(a,b,{type:'way',id:++id,nodes:[a.id,b.id],tags:{'addr:interpolation':'all'}});
 }
 for(let i=0;i<1250;i++)elements.push({type:'node',id:++id,lat:center.lat+0.005+i/10000000,lon:center.lng,tags:{'addr:housenumber':String(30000+i),'addr:street':'Rue au loin'}});
 return elements;
}
const elements=rescanElements();
function number(text){return Number(text.replace(/\D/g,''));}
async function selected(page,n){await page.waitForFunction(n=>Number(document.querySelector('#csSelected').textContent.replace(/\D/g,''))===n,n);}
async function quote(page,n){await page.waitForFunction(n=>Number(document.querySelector('#csQuoteCount').textContent.replace(/\D/g,''))===n&&!document.querySelector('#csCheckout').disabled,n);}
async function target(page,n){await page.locator('#csTarget').fill(String(n));await page.locator('#csTarget').press('Tab');}
async function saved(page){await page.waitForFunction(()=>/Brouillon enregistré|Draft saved/.test(document.querySelector('#csDraftStatus').textContent),null,{timeout:10000});}

(async()=>{
 const h=await create(),auth=authTools.create(h.services),browser=await chromium.launch({headless:true}),errors=[];
 try{
  for(const [width,lang] of [[1440,'fr'],[390,'en'],[320,'fr']]){
   const b=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,profile) VALUES($1,'Courtier Test',$2,'invited','{}') RETURNING *",['counts-'+width,'counts'+width+'@example.test']);
   const draft={center,city,radius:2800,target:1200,addresses:legacyAddresses,selected:legacyAddresses.filter(a=>a.source==='point').map(a=>a.id),excluded:[excludedEstimate.id],notes:'Exact legacy count fixture',polygon:[],reprise:0};
   await h.db.run('INSERT INTO broker_campaign_drafts(broker_id,revision,data) VALUES ($1,1,$2)',[b.id,JSON.stringify(draft)]);
   const context=await browser.newContext({viewport:{width,height:1000},isMobile:width<500,hasTouch:width<500});let searches=[];
   await context.route('https://**/*',r=>r.abort());
   await context.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=','base64')}));
   await context.route('https://photon.komoot.io/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({features:[{geometry:{coordinates:[center.lng,center.lat]},properties:{name:city,city,countrycode:'CA'}}]})}));
   await context.route('https://overpass*/**',r=>{searches.push(new URLSearchParams(r.request().postData()).get('data'));return r.fulfill({contentType:'application/json',body:JSON.stringify({elements})});});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   const token=await auth.mint(b.id,'access');await page.goto(h.url+'/pwa/vendvite/acces/'+token+'?lang='+lang);await page.locator('form button').click();await page.waitForURL('**/espace');
   await page.goto(h.url+'/pwa/vendvite/espace/courrier-cible?lang='+lang);await selected(page,611);await quote(page,611);
   assert.equal(number(await page.locator('#csFound').innerText()),611,'found count excludes estimates');
   assert.equal(number(await page.locator('#csTargetTotal').innerText()),1200);
   assert.match(await page.locator('#csTargetProgress').innerText(),/589/);
   assert.equal(number(await page.locator('#csEstimatesNote').innerText()),3389);
   assert.equal(await page.locator('#csEstimatedSelected').isVisible(),false);
   assert.match(await page.locator('#csAddEstimated').innerText(),/589/);
   assert.doesNotMatch(await page.locator('#csLimitNote').innerText(),/dessin|draw/i);
   assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true,'no page overflow at '+width);
   assert.equal(await page.locator('.cs-selection-card').evaluate(el=>el.scrollWidth<=el.clientWidth),true,'no selection card overflow at '+width);
   await page.locator('.cs-selection-card').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
   await page.screenshot({path:'/tmp/vendvite-counts-'+width+'.png'});

   await page.locator('#csSelectFiltered').click();await selected(page,611);
   assert.equal(await page.locator('#csEstimatedSelected').isVisible(),false,'bulk mapped selection never adds estimates');
   await page.locator('#csAddEstimated').click();await selected(page,1200);await quote(page,1200);
   assert.equal(number(await page.locator('#csEstimatedSelected').innerText()),589);
   await saved(page);
   let stored=(await h.db.get('SELECT data FROM broker_campaign_drafts WHERE broker_id=$1',[b.id])).data;
   assert.equal(stored.selected.length,1200);assert.ok(!stored.selected.includes(excludedEstimate.id),'estimated fill respects manual estimate exclusion');
   await page.locator('#csCheckout').click();
   assert.match(await page.locator('#csReviewContent .ws-notice').innerText(),lang==='fr'?/numéros estimés.*existence/s:/estimated.*existence/s);
   await page.locator('#csReviewDialog [data-close-dialog]').first().click();
   await page.locator('#csUndo').click();await selected(page,611);assert.equal(await page.locator('#csEstimatedSelected').isVisible(),false);

   await page.locator('#csAddressSearch').fill(mappedFirst.numero);await page.locator('.cs-address input').uncheck();await selected(page,610);
   await page.locator('#csAddEstimated').click();await selected(page,1200);await saved(page);
   stored=(await h.db.get('SELECT data FROM broker_campaign_drafts WHERE broker_id=$1',[b.id])).data;
   assert.ok(!stored.selected.includes(mappedFirst.id));assert.ok(!stored.selected.includes(excludedEstimate.id));
   assert.equal(number(await page.locator('#csEstimatedSelected').innerText()),590);
   await page.locator('#csUndo').click();await selected(page,610);await page.locator('#csUndo').click();await selected(page,611);await page.locator('#csAddressSearch').fill('');

   await target(page,150);await selected(page,150);await target(page,500);await selected(page,500);
   assert.equal(await page.locator('#csEstimatedSelected').isVisible(),false,'raising target fills mapped addresses only');
   await page.locator('#csUndo').click();await selected(page,150);assert.equal(await page.locator('#csTarget').inputValue(),'150');
   await page.locator('#csUndo').click();await selected(page,611);assert.equal(await page.locator('#csTarget').inputValue(),'1200');

   await target(page,150);await selected(page,150);await page.locator('#csAddressSearch').fill(mappedFirst.numero);await page.locator('.cs-address input').uncheck();await selected(page,149);
   await page.locator('#csFill').click();await selected(page,150);
   assert.equal(await page.locator('.cs-address input').isChecked(),false,'global fill skips the excluded filtered result');
   assert.equal(await page.locator('#csAddressSearch').inputValue(),mappedFirst.numero,'fill works beyond the current list search');
   await page.locator('#csUndo').click();await selected(page,149);await page.locator('#csUndo').click();await selected(page,150);await page.locator('#csUndo').click();await selected(page,611);await page.locator('#csAddressSearch').fill('');

   await page.locator('#csRadius').selectOption('5000');
   assert.equal(await page.locator('#csExpandArea').isVisible(),false,'maximum radius never offers further expansion');
   assert.match(await page.locator('#csTargetHelp').innerText(),lang==='fr'?/Déplacez le secteur/:/Move the area/);
   assert.doesNotMatch(await page.locator('#csTargetHelp').innerText(),/Élargissez|Expand/);
   await page.locator('#csMapDiscard').click();assert.equal(await page.locator('#csRadius').inputValue(),'2800');
   await page.locator('#csExpandArea').click();await page.locator('#csMapPending').waitFor();assert.equal(await page.locator('#csRadius').inputValue(),'4200');
   assert.equal(searches.length,0,'expanding previews without immediately searching');await selected(page,611);assert.equal(number(await page.locator('#csFound').innerText()),611);
   assert.equal(await page.locator('#csCheckout').isDisabled(),true);assert.equal(await page.locator('#csAddEstimated').isDisabled(),true);
   await page.locator('#csMapDiscard').click();assert.equal(await page.locator('#csRadius').inputValue(),'2800');await selected(page,611);
   await page.locator('#csExpandArea').click();await page.locator('#csMapApply').click();await selected(page,1200);await quote(page,1200);
   assert.match(searches.at(-1),/around:4200,45\.78,-74/);
   assert.equal(number(await page.locator('#csFound').innerText()),1274,'rescan retains mapped addresses beyond nearby estimates');
   assert.equal(await page.locator('#csEstimatedSelected').isVisible(),false,'rescanning reaches target with mapped addresses alone');
   await saved(page);stored=(await h.db.get('SELECT data FROM broker_campaign_drafts WHERE broker_id=$1',[b.id])).data;
   assert.equal(stored.addresses.length,4000);assert.equal(stored.selected.length,1200);assert.equal(stored.radius,4200);
   assert.ok(stored.addresses.filter(a=>stored.selected.includes(a.id)).every(a=>a.source==='point'));
   assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true);
   await context.close();console.log('Count and target browser checks passed at '+width+'px ('+lang+').');
  }
  assert.deepEqual(errors,[]);assert.equal(h.emails.length,0);
 }finally{await browser.close();await h.close();}
})().catch(e=>{console.error(e);process.exit(1)});
