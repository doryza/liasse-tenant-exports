const assert=require('node:assert/strict'),fs=require('fs'),{create,root}=require('./harness.cjs');
const {chromium}=require('/home/liassetech/liasse.tech/node_modules/playwright'),authTools=require(root+'/broker-auth-v1'),M=require(root+'/public/js/campaign-model-v1');
const center={lat:48.428,lng:-71.063,libelle:'Chicoutimi, Saguenay'},city='Saguenay';
const elements=[.001,.002,.005,.007,.01].map((d,i)=>({type:'node',id:i+1,lat:center.lat+d,lon:center.lng,tags:{'addr:housenumber':String(100+i),'addr:street':'rue du Test','addr:city':city}}));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const h=await create(),auth=authTools.create(h.services),browser=await chromium.launch({headless:true}),errors=[];
 try{
 for(const [width,lang] of [[1440,'fr'],[390,'en'],[320,'fr']]){
  const mobile=width<1000,b=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,profile) VALUES($1,'Courtier Test',$2,'invited','{}') RETURNING *",['map-'+width,'map'+width+'@example.test']);
  const addresses=M.parse(elements,center,city,800),excluded=addresses[0].id;
  await h.db.run('INSERT INTO broker_campaign_drafts(broker_id,revision,data) VALUES ($1,1,$2)',[b.id,JSON.stringify({center,city,radius:800,target:150,addresses,selected:addresses.slice(1).map(a=>a.id),excluded:[excluded],notes:'Map QA',polygon:[]})]);
  const c=await browser.newContext({viewport:{width,height:800},hasTouch:mobile,isMobile:mobile});let scans=0,queries=[];
  await c.route('https://**/*',r=>r.abort());
  await c.route('https://photon.komoot.io/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({features:[{geometry:{coordinates:[center.lng,center.lat]},properties:{name:'Chicoutimi',city,countrycode:'CA'}}]})}));
  await c.route('https://overpass*/**',r=>{scans++;queries.push(new URLSearchParams(r.request().postData()).get('data'));return r.fulfill({contentType:'application/json',body:JSON.stringify({elements})});});
  // Observe Leaflet state for assertions; gestures themselves use real controls, mouse and touch events.
  await c.route('**/public/vendor/leaflet/leaflet.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(root+'/public/vendor/leaflet/leaflet.js','utf8')+'\n(function(){var original=L.map;L.map=function(){window.__qaMap=original.apply(this,arguments);return window.__qaMap;};})();'}));
  const page=await c.newPage();page.on('response',async r=>{if(r.url().includes('/api/espace/')&&r.status()>=400)console.error(r.status(),await r.text());});page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
  const token=await auth.mint(b.id,'access');await page.goto(h.url+'/pwa/vendvite/acces/'+token+'?lang='+lang);await page.locator('form button').click();await page.waitForURL('**/espace');
  await page.goto(h.url+'/pwa/vendvite/espace/courrier-cible');await page.waitForFunction(()=>document.querySelector('#csSelected').textContent==='3'&&!document.querySelector('#csCheckout').disabled);
  const radius=page.locator('#csRadius'),pending=page.locator('#csMapPending');assert.equal(await radius.inputValue(),'800');assert.equal(await pending.isVisible(),false);
  await page.locator('#csFullscreen').click();assert.equal(await page.locator('#csFullscreen').getAttribute('aria-expanded'),'true');assert.equal(await radius.inputValue(),'800');assert.equal(await pending.isVisible(),false,'expanding does not edit the area');
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
  await page.locator('.leaflet-control-zoom-in').click();await page.waitForFunction(()=>document.querySelector('#csRadius').value==='400');
  assert.equal(await pending.isVisible(),true);assert.equal(await page.locator('#csCheckout').isDisabled(),true);assert.equal(await page.locator('#csSelected').textContent(),'3','zoom only previews');assert.equal(scans,0,'zoom does not query before apply');
  if(mobile){await page.setViewportSize({width,height:568});await pause(150);}
  const applyBox=await page.locator('#csMapApply').boundingBox(),discardBox=await page.locator('#csMapDiscard').boundingBox();
  assert.ok(applyBox.y>=0&&applyBox.y+applyBox.height<=(mobile?568:800),'apply fits on short screens');assert.ok(discardBox.y+discardBox.height<=(mobile?568:800),'discard fits on short screens');
  await page.screenshot({path:'/tmp/vendvite-map-pending-'+width+'.png'});
  if(mobile){await page.setViewportSize({width,height:800});await pause(150);}
  await page.locator('#csMapDiscard').click();assert.equal(await radius.inputValue(),'800');assert.equal(await pending.isVisible(),false);
  // Native pinch changes the circle on touchscreens; wheel zoom does the same on desktop.
  let rect=await page.locator('#csMap').boundingBox(),cx=rect.x+rect.width/2,cy=rect.y+rect.height/2;
  if(mobile){
   const session=await c.newCDPSession(page);
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-28,y:cy},{x:cx+28,y:cy}]});
   for(const d of [36,46,58,70]){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-d,y:cy},{x:cx+d,y:cy}]});await pause(35);}
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
  }else{await page.mouse.move(cx,cy);await page.mouse.wheel(0,-120);}
  await page.waitForFunction(()=>Number(document.querySelector('#csRadius').value)<800);assert.equal(await pending.isVisible(),true);
  await page.locator('#csMapDiscard').click();
  // Click/tap sets a new centre; a map drag then moves that preview.
  rect=await page.locator('#csMap').boundingBox();const tap={x:Math.round(rect.width*.72),y:Math.round(rect.height*.55)};
  if(mobile)await page.locator('#csMap').tap({position:tap});else await page.locator('#csMap').click({position:tap});
  assert.equal(await pending.isVisible(),true);assert.equal(await radius.inputValue(),'800');
  if(!mobile){const p=await page.locator('#csMap').boundingBox();await page.mouse.move(p.x+p.width*.55,p.y+p.height*.7);await page.mouse.down();await page.mouse.move(p.x+p.width*.55+60,p.y+p.height*.7,{steps:8});await page.mouse.up();}
  await page.locator('#csMapDiscard').click();assert.equal(await pending.isVisible(),false);
  // Accessible slider, arbitrary radii, and bounds stay synchronized with the search control.
  await page.locator('#csMapRadius').focus();await page.keyboard.press('Home');assert.equal(await radius.inputValue(),'200');
  for(let i=0;i<9;i++)await page.keyboard.press('ArrowRight');assert.equal(await radius.inputValue(),'650');
  assert.match(await page.locator('#csMapRadiusValue').textContent(),/650/);
  await page.keyboard.press('End');assert.equal(await radius.inputValue(),'5000');await page.locator('#csMapDiscard').click();
  // Apply a 400 m preview; preserve manual exclusions and get a fresh quote.
  await page.locator('.leaflet-control-zoom-in').click();await page.waitForFunction(()=>document.querySelector('#csRadius').value==='400');
  await page.locator('#csMapApply').click();await page.waitForFunction(()=>document.querySelector('#csSelected').textContent==='1'&&!document.querySelector('#csQuickReview').disabled,null,{timeout:8000}).catch(async e=>{console.error(queries,await page.evaluate(()=>({selected:document.querySelector('#csSelected').textContent,found:document.querySelector('#csFound').textContent,radius:document.querySelector('#csRadius').value,pending:!document.querySelector('#csMapPending').hidden,error:document.querySelector('#csError').textContent,status:document.querySelector('#csDraftStatus').textContent,quote:document.querySelector('#csQuoteStatus').textContent})));await page.screenshot({path:'/tmp/vendvite-map-failed.png'});throw e;});
  assert.equal(scans,1);assert.equal(await pending.isVisible(),false);
  await page.waitForFunction(()=>/Brouillon enregistré|Draft saved/.test(document.querySelector('#csDraftStatus').textContent));
  const saved=(await h.db.get('SELECT data FROM broker_campaign_drafts WHERE broker_id=$1',[b.id])).data;assert.equal(saved.radius,400);assert.ok(saved.excluded.includes(excluded));
  // An outdated in-flight area search cannot replace a newer gesture or the saved draft.
  if(!mobile){
   await page.locator('.leaflet-control-zoom-out').click();await page.waitForFunction(()=>document.querySelector('#csRadius').value==='800');
   let release,started;const gate=new Promise(r=>release=r),seen=new Promise(r=>started=r);
   const delayed=async route=>{started();await gate;try{await route.fulfill({contentType:'application/json',body:JSON.stringify({elements})});}catch(e){}};
   await page.route('https://overpass*/**',delayed);await page.locator('#csMapApply').click();await seen;
   await page.locator('#csMapRadius').focus();await page.keyboard.press('End');release();await pause(250);
   assert.equal(await radius.inputValue(),'5000');assert.equal(await page.locator('#csSelected').textContent(),'1');assert.equal(await page.locator('#csQuickReview').isDisabled(),true);assert.equal(await page.locator('#csMapApply').isEnabled(),true);
   assert.equal((await h.db.get('SELECT data FROM broker_campaign_drafts WHERE broker_id=$1',[b.id])).data.radius,400);
   await page.unroute('https://overpass*/**',delayed);await page.locator('#csMapDiscard').click();
  }
  // Popup removal must not be interpreted as a map-centre edit, including its auto-pan.
  const point=await page.evaluate(()=>{const p=window.__qaMap.latLngToContainerPoint([48.430,-71.063]);return {x:p.x,y:p.y};});
  if(mobile)await page.locator('#csMap').tap({position:point});else await page.locator('#csMap').click({position:point});
  await page.locator('.leaflet-popup-content button').waitFor();await page.locator('.leaflet-popup-content button').click();assert.equal(await page.locator('#csSelected').textContent(),'0');assert.equal(await pending.isVisible(),false,'popup auto-pan never edits area');
  // Expanded view stays within the screen, including the touch controls and close action.
  assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true);
  const close=await page.locator('#csFullscreen').boundingBox();assert.ok(close.y>=0&&close.y+close.height<=800);
  await page.screenshot({path:'/tmp/vendvite-map-expanded-'+width+'.png'});
  await page.keyboard.press('Escape');assert.equal(await page.locator('#csFullscreen').getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  await page.locator('#csUndo').click();await page.waitForFunction(()=>document.querySelector('#csSelected').textContent==='1'&&!document.querySelector('#csCheckout').disabled);
  await page.locator('.cs-address-title').last().click();assert.equal(await pending.isVisible(),false,'list address focus never edits area');
  await page.waitForFunction(()=>/Brouillon enregistré|Draft saved/.test(document.querySelector('#csDraftStatus').textContent));
  await c.close();console.log('Map selection passed at '+width+'px ('+lang+'): zoom, '+(mobile?'pinch/tap':'wheel/drag')+', slider, apply/revert, popup removal and fullscreen.');
 }
 assert.deepEqual(errors,[]);assert.equal(h.emails.length,0);
 }finally{await browser.close();await h.close();}
})().catch(e=>{console.error(e);process.exit(1)});
