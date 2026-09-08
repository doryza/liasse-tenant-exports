const {test}=require('node:test'),assert=require('node:assert/strict');
const search=require('../testing/imported-apps/vendvite/public/js/address-search-v1');
const options={attempts:3,delayMs:1,timeoutMs:100,budgetMs:500,validate:d=>Array.isArray(d.elements)&&!d.remark};
const ok=elements=>new Response(JSON.stringify({elements}),{status:200});
async function mocked(fn,run){const original=global.fetch;global.fetch=fn;try{await run();}finally{global.fetch=original;}}
test('busy, partial and network responses retry across providers, accepting only complete data',async()=>{
 const urls=[],progress=[];await mocked(async url=>{urls.push(url);if(urls.length===1)return new Response('busy',{status:429});if(urls.length===2)return new Response(JSON.stringify({elements:[{id:9}],remark:'runtime timeout'}));return ok([{id:1}]);},async()=>{
  const r=await search.requestJSON(['a','b'],{}, {...options,onProgress:e=>progress.push(e)});assert.deepEqual(r.elements,[{id:1}]);assert.deepEqual(urls,['a','b','a']);assert.deepEqual(progress.filter(e=>e.stage==='retry').map(e=>e.attempt),[2,3]);
 });
 let n=0;await mocked(async()=>{n++;if(n===1)throw new TypeError('network');return ok([]);},async()=>{assert.deepEqual((await search.requestJSON(['a','b'],{},options)).elements,[]);assert.equal(n,2,'A valid empty result ends retries');});
});
test('permanent errors and oversized areas stop; malformed responses exhaust a bounded number of attempts',async()=>{
 for(const [response,code,expected] of [[()=>new Response('bad',{status:400}),'HTTP_400',1],[()=>new Response('x'.repeat(101)),'TOO_LARGE',1],[()=>new Response('<html>gateway</html>'),'INVALID_RESPONSE',3]]){
  let n=0;await mocked(async()=>{n++;return response();},async()=>{await assert.rejects(()=>search.requestJSON(['a','b'],{},{...options,maxChars:100}),e=>e.code===code);assert.equal(n,expected);});
 }
});
test('timeout, cancellation during fetch/backoff, Retry-After and deadline are honored',async()=>{
 let n=0;await mocked((url,request)=>{n++;return new Promise((resolve,reject)=>request.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));},async()=>{await assert.rejects(()=>search.requestJSON(['a','b'],{},{...options,timeoutMs:5}),e=>e.code==='TIMEOUT');assert.equal(n,3);});
 for(const when of ['fetch','backoff']){const controller=new AbortController();n=0;await mocked((url,request)=>{n++;if(when==='backoff')return Promise.resolve(new Response('busy',{status:503}));setTimeout(()=>controller.abort(),1);return new Promise((resolve,reject)=>request.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));},async()=>{
  await assert.rejects(()=>search.requestJSON(['a','b'],{},{...options,signal:controller.signal,onProgress:e=>{if(when==='backoff'&&e.stage==='retry')controller.abort();}}),e=>e.code==='CANCELLED');assert.equal(n,1);
 });}
 n=0;await mocked(async()=>{n++;return new Response('busy',{status:429,headers:{'Retry-After':'60'}});},async()=>{await assert.rejects(()=>search.requestJSON(['a'],{},{...options,budgetMs:100}),e=>e.code==='HTTP_429');assert.equal(n,1,'Never retry before the server cooldown or exceed deadline');});
});
