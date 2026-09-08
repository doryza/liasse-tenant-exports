(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.VVAddressSearch=factory();})(this,function(){
 'use strict';
 function failure(code,retryable){var e=new Error(code);e.code=code;e.retryable=!!retryable;return e;}
 function aborted(signal){if(signal&&signal.aborted)throw failure('CANCELLED',false);}
 function pause(ms,signal){return new Promise(function(resolve,reject){var timer;function cleanup(){clearTimeout(timer);if(signal)signal.removeEventListener('abort',cancel);}function cancel(){cleanup();reject(failure('CANCELLED',false));}if(signal&&signal.aborted)return cancel();if(signal)signal.addEventListener('abort',cancel,{once:true});timer=setTimeout(function(){cleanup();resolve();},ms);});}
 function retryAfter(value){if(!value)return 0;var seconds=Number(value);return Math.max(0,Number.isFinite(seconds)?seconds*1000:Date.parse(value)-Date.now())||0;}
 // Independent attempt controllers avoid AbortSignal.any/timeout compatibility
 // gaps on mobile. Cancellation also interrupts backoff and body downloads.
 async function requestJSON(urls,request,options){
  var o=options||{},signal=o.signal,attempts=o.attempts||3,timeout=o.timeoutMs||40000,deadline=Date.now()+(o.budgetMs||100000),delay=o.delayMs==null?1500:o.delayMs,cooldown={},last;
  for(var attempt=1;attempt<=attempts;attempt++){
   aborted(signal);if(Date.now()>=deadline)throw last||failure('TIMEOUT',true);
   var url=urls[(attempt-1)%urls.length],wait=Math.max(attempt===1?0:delay*(attempt-1),(cooldown[url]||0)-Date.now());
   if(wait>0){if(Date.now()+wait>=deadline)throw last||failure('TIMEOUT',true);if(o.onProgress)o.onProgress({stage:'retry',attempt:attempt,attempts:attempts,waitMs:wait,reason:last&&last.code});await pause(wait,signal);}
   aborted(signal);var controller=new AbortController(),timedOut=false,timer;
   function cancel(){controller.abort();}
   if(signal)signal.addEventListener('abort',cancel,{once:true});
   timer=setTimeout(function(){timedOut=true;controller.abort();},Math.min(timeout,deadline-Date.now()));
   try{
    if(o.onProgress)o.onProgress({stage:'request',attempt:attempt,attempts:attempts});
    var response=await fetch(url,Object.assign({},request,{signal:controller.signal}));
    if(!response.ok){var error=failure('HTTP_'+response.status,response.status===408||response.status===429||response.status>=500);cooldown[url]=Date.now()+retryAfter(response.headers.get('Retry-After'));throw error;}
    if(o.onProgress)o.onProgress({stage:'download',attempt:attempt,attempts:attempts});
    var raw=await response.text();aborted(signal);
    if(raw.length>(o.maxChars||24000000))throw failure('TOO_LARGE',false);
    var data;try{data=JSON.parse(raw);}catch(e){throw failure('INVALID_RESPONSE',true);}
    if(o.validate&&!o.validate(data))throw failure('INCOMPLETE_RESPONSE',true);
    return data;
   }catch(e){
    aborted(signal);last=timedOut?failure('TIMEOUT',true):e.code?e:failure('NETWORK',true);
    if(!last.retryable||attempt===attempts)throw last;
   }finally{clearTimeout(timer);if(signal)signal.removeEventListener('abort',cancel);}
  }
  throw last||failure('NETWORK',true);
 }
 return {requestJSON:requestJSON};
});
