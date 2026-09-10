'use strict';
const crypto=require('crypto');
const clone=x=>JSON.parse(JSON.stringify(x||{}));
const validId=x=>/^[A-Z0-9-]{6,80}$/i.test(String(x||''));
const failure=(code,message)=>Object.assign(new Error(message||code),{code});
// A sandbox label alone never authorizes a test charge: both persisted fields
// must agree. Neither configuration nor the browser may change an order's mode.
function modeFor(c){return c&&c.paypal_mode==='live'&&Number(c.is_test)===0?'live':c&&c.paypal_mode==='sandbox'&&Number(c.is_test)===1?'sandbox':null;}
function approveLink(order,mode){const l=(order.links||[]).find(x=>x.rel==='approve'||x.rel==='payer-action');if(!l)return null;try{const u=new URL(l.href);return u.protocol==='https:'&&u.hostname===(mode==='sandbox'?'www.sandbox.paypal.com':'www.paypal.com')?u.href:null;}catch(e){return null;}}
function matches(order,c){const units=order&&order.purchase_units;if(!order||order.id!==c.paypal_order_id||!Array.isArray(units)||units.length!==1)return false;const u=units[0];return u.custom_id==='camp:'+c.broker_id+':'+c.id&&u.amount&&u.amount.currency_code==='CAD'&&/^\d+\.\d{2}$/.test(String(u.amount.value))&&Math.round(Number(u.amount.value)*100)===Number(c.total_cents);}
function completedCapture(order,c){if(order.status!=='COMPLETED'||!matches(order,c))return null;const captures=order.purchase_units[0].payments&&order.purchase_units[0].payments.captures;if(!Array.isArray(captures)||captures.length!==1)return null;const cap=captures[0];return validId(cap.id)&&cap.status==='COMPLETED'&&cap.amount&&cap.amount.currency_code==='CAD'&&/^\d+\.\d{2}$/.test(String(cap.amount.value))&&Math.round(Number(cap.amount.value)*100)===Number(c.total_cents)?cap:null;}
function create(services,h){
 const db=services.db;
 async function patch(id,lease,values,delay=60){const row=await db.get("UPDATE broker_campaigns SET payment_recovery=payment_recovery||$1::jsonb,payment_check_after=NOW()+($2::int*INTERVAL '1 second') WHERE id=$3 AND payment_lease_token=$4 RETURNING *",[JSON.stringify(values),delay,id,lease]);if(!row)throw failure('BUSY');return row;}
 async function request(url,opts){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);try{const r=await services.fetch(url,{...opts,signal:controller.signal});let body;try{body=await r.json();}catch(e){throw failure('PROVIDER_UNAVAILABLE');}return {ok:r.ok,status:r.status,body};}finally{clearTimeout(timer);}}
 async function afterPaid(req,c,lease){try{const b=await db.get('SELECT * FROM brokers WHERE id=$1',[c.broker_id]);if(!b)throw failure('BROKER_MISSING');const done=await h.afterPaid(req,b,c);c=await patch(c.id,lease,{effectsComplete:done!==false,error:done===false?'RECEIPT_RETRY':null},done===false?300:86400);return c;}catch(e){await patch(c.id,lease,{effectsComplete:false,error:'RECEIPT_RETRY'},300);return c;}}
 async function reconcile(id,options={}){
  const lease=crypto.randomBytes(24).toString('hex');let c=await db.get("UPDATE broker_campaigns SET payment_lease_token=$1,payment_lease_until=NOW()+INTERVAL '3 minutes' WHERE id=$2 AND kind='paid' AND (payment_lease_until IS NULL OR payment_lease_until<NOW()) RETURNING *",[lease,id]);
  if(!c)return {state:'busy',id:Number(id)};
  try{
   if(!modeFor(c))throw failure('MODE_MISMATCH');
   if(c.payment_status==='paid'){c=await afterPaid(options.req,c,lease);return {state:'paid',campaign:c};}
   let meta=c.payment_recovery||{};
   if(options.cancel&&!c.paypal_order_id&&!meta.createKey){c=await db.get("UPDATE broker_campaigns SET status='cancelled',payment_status='cancelled',quota_period=NULL,payment_recovery=payment_recovery||'{\"cancelled\":true}'::jsonb,updated_at=NOW() WHERE id=$1 AND payment_status<>'paid' AND payment_lease_token=$2 RETURNING *",[c.id,lease]);return {state:'cancelled',campaign:c};}
   let cfg=await h.cfg(c.paypal_mode);
   if(!cfg.clientId||!cfg.secret)throw failure('NOT_CONFIGURED');
   if(cfg.mode!==modeFor(c)||cfg.base!==(cfg.mode==='sandbox'?'https://api-m.sandbox.paypal.com':'https://api-m.paypal.com'))throw failure('MODE_MISMATCH');
   const token=await h.token(cfg),headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
   if(!c.paypal_order_id){
    if(!meta.createPayload||!meta.createKey){return {state:'draft',campaign:c};}
    if(meta.cancelled&&!options.resume)return {state:'cancelled',campaign:c};
    // No approval URL has been exposed until its provider ID is safely stored.
    // An uncertain create is retried with the original immutable payload/key.
    const created=await request(cfg.base+'/v2/checkout/orders',{method:'POST',headers:{...headers,'PayPal-Request-Id':meta.createKey},body:JSON.stringify(meta.createPayload)});
    if(!created.ok||!validId(created.body.id))throw failure('CREATE_RETRY');
    const recorded=await db.get("UPDATE broker_campaigns SET paypal_order_id=$1,updated_at=NOW() WHERE id=$2 AND paypal_order_id IS NULL AND payment_lease_token=$3 RETURNING *",[created.body.id,c.id,lease]);if(!recorded)throw failure('BUSY');c=recorded;
   }
   let found=await request(cfg.base+'/v2/checkout/orders/'+encodeURIComponent(c.paypal_order_id),{headers});
   if(!found.ok)throw failure('PROVIDER_UNAVAILABLE');
   let order=found.body;
   if(!matches(order,c))throw failure('PAYMENT_MISMATCH');
   c=await patch(c.id,lease,{checkedAt:new Date().toISOString(),providerStatus:order.status,error:null});meta=c.payment_recovery;
   if(options.cancel&&order.status!=='COMPLETED'){
    // A timed-out capture must be reconciled; cancelling it could hide a charge.
    if(meta.captureStarted)throw failure('CAPTURE_IN_PROGRESS');
    if(!['CREATED','SAVED','PAYER_ACTION_REQUIRED','APPROVED','VOIDED'].includes(order.status))throw failure('CANNOT_CANCEL');
    c=await db.get("UPDATE broker_campaigns SET status='cancelled',payment_status='cancelled',quota_period=NULL,payment_recovery=payment_recovery||$1::jsonb,updated_at=NOW(),payment_check_after=NOW()+INTERVAL '1 day' WHERE id=$2 AND payment_status<>'paid' AND payment_lease_token=$3 RETURNING *",[JSON.stringify({cancelled:true,cancelledAt:new Date().toISOString()}),c.id,lease]);
    return {state:'cancelled',campaign:c};
   }
   if(meta.cancelled&&order.status!=='COMPLETED')return {state:'cancelled',campaign:c};
   if(order.status==='APPROVED'&&options.capture!==false){
    c=await patch(c.id,lease,{captureStarted:true});
    // Always the same key. On a timeout or ORDER_ALREADY_CAPTURED, read the
    // order again instead of trusting an error response or charging anew.
    try{await request(cfg.base+'/v2/checkout/orders/'+encodeURIComponent(c.paypal_order_id)+'/capture',{method:'POST',headers:{...headers,'PayPal-Request-Id':'vvcap-'+c.id},body:'{}'});}catch(e){}
    found=await request(cfg.base+'/v2/checkout/orders/'+encodeURIComponent(c.paypal_order_id),{headers});if(!found.ok)throw failure('PROVIDER_UNAVAILABLE');order=found.body;
    if(!matches(order,c))throw failure('PAYMENT_MISMATCH');
   }
   if(order.status==='COMPLETED'){
    const capture=completedCapture(order,c);if(!capture)throw failure('PAYMENT_MISMATCH');
    const paid=await db.get("UPDATE broker_campaigns SET status='confirmed',payment_status='paid',paypal_capture_id=$1,deadline_at=$2,updated_at=NOW(),payment_recovery=payment_recovery||$3::jsonb WHERE id=$4 AND payment_status<>'paid' AND payment_lease_token=$5 RETURNING *",[capture.id,h.deadline(),JSON.stringify({providerStatus:'COMPLETED',error:null,cancelled:false,paidAt:new Date().toISOString()}),c.id,lease]);
    if(!paid)throw failure('BUSY');c=await afterPaid(options.req,paid,lease);return {state:'paid',campaign:c};
   }
   if(order.status==='VOIDED'){
    c=await db.get("UPDATE broker_campaigns SET status='cancelled',payment_status='cancelled',quota_period=NULL,payment_recovery=payment_recovery||'{\"providerStatus\":\"VOIDED\",\"cancelled\":true}'::jsonb,updated_at=NOW() WHERE id=$1 AND payment_status<>'paid' AND payment_lease_token=$2 RETURNING *",[c.id,lease]);return {state:'cancelled',campaign:c};
   }
   c=await patch(c.id,lease,{providerStatus:order.status,error:null},order.status==='APPROVED'?60:300);
   return {state:order.status==='APPROVED'?'processing':'pending',campaign:c,approve:approveLink(order,cfg.mode)};
  }catch(e){const attempts=Number((c.payment_recovery||{}).attempts||0)+1;await patch(c.id,lease,{attempts,error:e.code||'PROVIDER_UNAVAILABLE',checkedAt:new Date().toISOString()},Math.min(3600,60*Math.pow(2,Math.min(attempts,6))));return {state:'verification',code:e.code||'PROVIDER_UNAVAILABLE',campaign:await db.get('SELECT * FROM broker_campaigns WHERE id=$1',[c.id])};}
  finally{await db.run('UPDATE broker_campaigns SET payment_lease_until=NULL,payment_lease_token=NULL WHERE id=$1 AND payment_lease_token=$2',[id,lease]);}
 }
 async function prepare(c,payload,key){return await db.get("UPDATE broker_campaigns SET payment_recovery=payment_recovery||$1::jsonb,payment_check_after=NOW() WHERE id=$2 AND paypal_order_id IS NULL AND payment_status='pending' AND NOT payment_recovery ? 'createKey' RETURNING *",[JSON.stringify({createPayload:clone(payload),createKey:key,createStartedAt:new Date().toISOString()}),c.id])||await db.get('SELECT * FROM broker_campaigns WHERE id=$1',[c.id]);}
 // Default scheduled work covers both genuine live orders and explicitly
 // initialized sandbox rehearsals. Optional mode filtering is for an operator
 // rehearsal run; it never changes the persisted mode or credentials selected.
 async function run(options={}){
  const mode=options.mode==null||options.mode==='both'?null:options.mode;
  if(mode!==null&&!['live','sandbox'].includes(mode))throw failure('BAD_MODE');
  const rows=await db.all("SELECT c.id,c.paypal_mode,c.is_test FROM broker_campaigns c WHERE c.kind='paid' AND ((c.is_test=0 AND c.paypal_mode='live') OR (c.is_test=1 AND c.paypal_mode='sandbox')) AND ($2::text IS NULL OR c.paypal_mode=$2) AND (c.payment_recovery ? 'createKey' OR c.payment_recovery ? 'checkedAt') AND c.payment_check_after<=NOW() AND (c.payment_lease_until IS NULL OR c.payment_lease_until<NOW()) AND ((c.payment_status='pending') OR (c.payment_status='paid' AND (COALESCE((c.payment_recovery->>'effectsComplete')::boolean,false)=false OR NOT EXISTS(SELECT 1 FROM broker_invoices i WHERE i.campaign_id=c.id AND i.broker_id=c.broker_id AND ((c.is_test=0 AND c.paypal_mode='live' AND i.is_test=0 AND i.paypal_mode='live' AND i.emailed_at IS NOT NULL) OR (c.is_test=1 AND c.paypal_mode='sandbox' AND i.is_test=1 AND i.paypal_mode='sandbox' AND i.email_previewed_at IS NOT NULL))))) OR (c.payment_status='cancelled' AND c.paypal_order_id IS NOT NULL AND c.updated_at>NOW()-INTERVAL '7 days')) ORDER BY c.payment_check_after,c.id LIMIT $1",[Math.max(1,Math.min(50,Number(options.limit)||10)),mode]);
  const results=[];for(const row of rows){const r=await reconcile(row.id,options);results.push({id:row.id,state:r.state,mode:row.paypal_mode,isTest:Number(row.is_test)===1});}return results;
 }
 async function webhook(event,req){if(!/^(CHECKOUT\.ORDER\.|PAYMENT\.CAPTURE\.|CHECKOUT\.PAYMENT-APPROVAL\.)/.test(String(event.event_type||'')))return false;const r=event.resource||{},related=r.supplementary_data&&r.supplementary_data.related_ids||{},orderId=related.order_id||(/^CHECKOUT\.ORDER\./.test(event.event_type)?r.id:null);let c;if(validId(orderId))c=await db.get("SELECT * FROM broker_campaigns WHERE kind='paid' AND paypal_order_id=$1",[orderId]);if(!c&&/^PAYMENT\.CAPTURE\./.test(event.event_type)&&validId(r.id))c=await db.get("SELECT * FROM broker_campaigns WHERE kind='paid' AND paypal_capture_id=$1",[r.id]);if(c)await reconcile(c.id,{req,capture:!!(c.payment_recovery||{}).createKey});return true;}
 return {reconcile,prepare,run,webhook};
}
module.exports={create,matches,completedCapture,approveLink,modeFor};
