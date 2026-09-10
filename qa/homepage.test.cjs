const {test}=require('node:test'),assert=require('node:assert/strict');
const {create}=require('./harness.cjs');
test('one homepage version; retired conversion test cannot track or evaluate and old admin bookmarks stay protected',async()=>{
 const h=await create();try{
 const before=await h.db.all('SELECT * FROM homepage_experiments');
 for(const mount of ['','/pwa/vendvite']){
  for(const query of ['','?vv_preview=visible','?vv_preview=gated']){
   const r=await fetch(h.url+mount+'/'+query);assert.equal(r.status,200);const html=await r.text();assert.match(html,/data-variant="visible"/);assert.match(html,/data-track="0"/);assert.match(r.headers.get('cache-control'),/no-store/);
  }
  for(const event of ['view','start'])assert.equal((await fetch(h.url+mount+'/api/homepage/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event})})).status,204);
  const denied=await fetch(h.url+mount+'/admin/conversions',{redirect:'manual'});assert.equal(denied.status,302);assert.equal(denied.headers.get('location'),mount+'/admin/login');
  const old=await fetch(h.url+mount+'/admin/conversions',{headers:{'x-test-admin':'yes'},redirect:'manual'});assert.equal(old.status,302);assert.equal(old.headers.get('location'),mount+'/admin/campagnes');assert.match(old.headers.get('cache-control'),/no-store/);
  const orders=await fetch(h.url+mount+'/admin/campagnes',{headers:{'x-test-admin':'yes'}});assert.equal(orders.status,200);const html=await orders.text();assert.doesNotMatch(html,/Test de conversion|admin\/conversions/);assert.match(html,/À poster/);assert.match(html,/admin\/courtiers/);
 }
 assert.deepEqual(await h.db.all('SELECT * FROM homepage_experiments'),before);assert.equal((await h.db.get('SELECT COUNT(*)::int AS n FROM homepage_visitors')).n,0);assert.equal(h.emails.length,0);
 }finally{await h.close();}
});
