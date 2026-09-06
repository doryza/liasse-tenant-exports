const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../testing/imported-apps/vendvite/public/js/campaign-model-v1.js');

const center={lat:45.78,lng:-74};
function node(id,numero,rue,offset=0){
 return {type:'node',id,lat:center.lat+offset,lon:center.lng,tags:{'addr:housenumber':String(numero),'addr:street':rue}};
}
function sortedByDistance(addresses){
 assert.ok(addresses.every((a,i)=>i===0||addresses[i-1].metres<=a.metres),'retained results are ordered by distance');
}

test('nearby interpolated numbers cannot crowd mapped addresses out of the 4,000 result cap',()=>{
 const elements=[];let id=0;
 for(let street=0;street<12;street++){
  const a=node(++id,1,'Rue estimée '+street,street*0.00001);
  const b=node(++id,401,'Rue estimée '+street,street*0.00001+0.000001);
  b.lon+=0.0005;
  elements.push(a,b,{type:'way',id:++id,nodes:[a.id,b.id],tags:{'addr:interpolation':'all'}});
 }
 // These mapped addresses are all in the radius, beyond the closer estimates.
 const mapped=[];
 for(let number=1;number<=1250;number++){
  const address=node(++id,number,'Rue cartographiée',0.005+number/10000000);
  elements.push(address);mapped.push(address);
 }
 const results=M.parse(elements,center,'Saint-Jérôme',2800);
 assert.equal(results.length,4000);
 assert.equal(results.filter(a=>a.source==='point').length,1274);
 assert.equal(results.filter(a=>a.source==='interpole').length,2726);
 const retained=new Set(results.map(a=>a.id));
 for(const address of mapped){
  assert.ok(retained.has(M.key({numero:address.tags['addr:housenumber'],rue:address.tags['addr:street'],ville:'Saint-Jérôme'})));
 }
 sortedByDistance(results);
});

test('when mapped addresses alone exceed the cap, only the nearest 4,000 remain',()=>{
 const elements=Array.from({length:4500},(_,i)=>node(i+1,i+1,'Rue cartographiée',(i+1)/1000000)).reverse();
 const results=M.parse(elements,center,'Saint-Jérôme',2800);
 assert.equal(results.length,4000);
 assert.ok(results.every(a=>a.source==='point'));
 // Select points beyond a rounded-distance tie to establish the boundary.
 assert.ok(results.some(a=>a.numero==='1'));
 assert.ok(results.some(a=>a.numero==='3990'));
 assert.ok(!results.some(a=>a.numero==='4010'));
 assert.ok(!results.some(a=>a.numero==='4500'));
 const nearestExcluded=M.distance(center,{lat:elements[0].lat,lng:elements[0].lon});
 assert.ok(results[results.length-1].metres<nearestExcluded);
 sortedByDistance(results);
});

test('deduplication retains a mapped address instead of its interpolated counterpart',()=>{
 const start=node(1,100,'rue Test');
 const end=node(2,104,'rue Test',0.001);
 const mapped=node(3,102,'rue Test',0.0006);
 const elements=[start,end,mapped,{type:'way',id:4,nodes:[1,2],tags:{'addr:interpolation':'even'}}];
 const results=M.parse(elements,center,'Saint-Jérôme',2800);
 assert.equal(results.length,3);
 assert.equal(new Set(results.map(a=>a.id)).size,3);
 const result=results.find(a=>a.numero==='102');
 assert.equal(result.source,'point');
 assert.equal(result.lat,mapped.lat);
 sortedByDistance(results);
});
