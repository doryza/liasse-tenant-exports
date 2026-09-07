const test=require('node:test'),assert=require('node:assert/strict');
const {create}=require('./harness.cjs');
const {demos,demoFor}=require('../testing/imported-apps/vendvite/province-demos-v1');
const root='../testing/imported-apps/vendvite/';
test('every campaign region has a matching letter and QR demo, without changing locale rules',async()=>{
 const h=await create();
 try{
  assert.equal(Object.keys(demos).length,12);
  for(const [province,demo] of Object.entries(demos)){
   assert.ok(demo.address.includes(', '+province));assert.ok(demo.streetView.pano);assert.ok(Number.isFinite(demo.location.lat));
   const campaign=await h.db.get('INSERT INTO solicitation_campaigns(name,format) VALUES($1,$2) RETURNING id',[province,province==='QC'?'duplex':'en']);
   const tag='VV-'+Buffer.from(province).toString('hex').padEnd(32,'0');
   await h.db.run('INSERT INTO solicitation_agents(campaign_id,tag,name,agency,address1,address2,source_meta) VALUES($1,$2,$3,$4,$5,$6,$7)',[campaign.id,tag,'Agent '+province,'Example','1 Example Street','Example '+province+' A1A 1A1',JSON.stringify({province})]);
   const page=await fetch(h.url+'/invitation/'+tag+'?lang=fr');assert.equal(page.status,200);const html=await page.text();
   const initial=JSON.parse(html.match(/window.VV_INITIAL_ADDRESS = (.*?);/)[1]);assert.equal(initial,demo.address);
   assert.deepEqual(JSON.parse(html.match(/window.VV_INITIAL_LOCATION = (.*?);/)[1]),demo.location);
   assert.deepEqual(JSON.parse(html.match(/window.VV_DEMO_STREET_VIEW = (.*?);/)[1]),demo.streetView);
   assert.match(html,new RegExp('<html lang="'+(province==='QC'?'fr':'en')+'"'));
   const print=await fetch(h.url+'/admin/sollicitations/'+campaign.id+'/imprimer',{headers:{'x-test-admin':'yes'}});assert.equal(print.status,200);const letter=await print.text();assert.ok(letter.includes(demo.address.replace(/'/g,'&#39;')));
   assert.equal((letter.match(/class="sheet"/g)||[]).length,province==='QC'?2:1);assert.doesNotMatch(letter,/4410/);
  }
  assert.equal(demoFor({address2:'LAVAL QC H7W 4Y4'}),demos.QC);
  assert.equal(demoFor({source_meta:{province:'ON'},address2:'LAVAL QC H7W 4Y4'}),demos.ON);
  assert.equal(demoFor({source_meta:{province:'NU'}}),null);
  assert.equal(demoFor({}),null);
 }finally{await h.close()}
});

test('verified camera applies only to demo; expired panorama falls back to the selected property',async()=>{
 const vm=require('node:vm'),fs=require('node:fs');
 async function run(demo,expired=false){
  const pending=[],views=[];
  const nodes={addressInput:{value:'',addEventListener(){}},addressSuggest:{addEventListener(){}},streetview:{innerHTML:''},fichePhoto:{classList:{add(){}},dataset:{}}};
  const maps={importLibrary:async()=>({AutocompleteSuggestion:{},AutocompleteSessionToken:function(){}}),StreetViewStatus:{OK:'OK'},StreetViewService:function(){this.getPanorama=(q,cb)=>pending.push({q,cb})},geometry:{spherical:{computeHeading:()=>123}},StreetViewPanorama:function(el,opts){views.push(opts)}};
  const window={VV_INITIAL_ADDRESS:'Selected house',VV_INITIAL_LOCATION:{lat:45,lng:-73},VV_DEMO_STREET_VIEW:demo};
  const context={window,document:{getElementById:id=>nodes[id]||null,addEventListener(){}},google:{maps},console};
  vm.runInNewContext(fs.readFileSync(require.resolve(root+'public/js/app.js'),'utf8'),context);await window.initVendvite();
  if(expired){pending[0].cb(null,'ZERO_RESULTS');assert.deepEqual(JSON.parse(JSON.stringify(pending[1].q)),{location:window.VV_INITIAL_LOCATION,radius:120});}
  const request=pending.at(-1);request.cb({location:{pano:'resolved',latLng:{}}},'OK');return {pending,views,nodes};
 }
 const demo=demos.QC.streetView;
 const fixed=await run(demo);assert.equal(fixed.pending[0].q.pano,demo.pano);assert.equal(fixed.views[0].pov.heading,demo.heading);assert.equal(fixed.views[0].zoom,demo.zoom);
 const fallback=await run(demo,true);assert.equal(fallback.views[0].pov.heading,123);assert.equal(fallback.views[0].zoom,0.6);
 const normal=await run(null);assert.equal(normal.pending[0].q.location.lat,45);assert.equal(normal.views[0].pov.heading,123);
 const stale=await run(demo);stale.nodes.addressInput.value='New house';stale.pending[0].cb({location:{pano:'old',latLng:{}}},'OK');assert.equal(stale.views.length,1,'late result does not redraw old house');
});
