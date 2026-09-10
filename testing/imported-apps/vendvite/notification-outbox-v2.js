'use strict';
const crypto=require('crypto');
const MAX_ATTEMPTS=12;
const SIMULATION_NOTICE='TEST / SIMULATION — Aucun courriel envoyé. No email was sent. This is a sandbox preview only.';
function simulatePayload(payload){
 const p=typeof payload==='string'?JSON.parse(payload):{...payload};
 if(!String(p.subject||'').startsWith('TEST / SIMULATION — '))p.subject='TEST / SIMULATION — '+String(p.subject||'');
 if(!String(p.text||'').startsWith(SIMULATION_NOTICE))p.text=SIMULATION_NOTICE+'\n\n'+String(p.text||'');
 if(!String(p.html||'').includes('data-vv-simulation="true"'))p.html='<div data-vv-simulation="true" style="padding:16px;background:#fff3ce;color:#31220a;font:700 16px Arial,sans-serif">'+SIMULATION_NOTICE+'</div>'+String(p.html||'');
 return p;
}
function create(services){
 const db=services.db;
 async function testSource({campaignId,leadId,isTest}={}){
  if(isTest===true||isTest===1)return true;
  if(!campaignId&&!leadId)return false;
  const source=await db.get("SELECT EXISTS(SELECT 1 FROM broker_campaigns WHERE id=$1 AND (is_test=1 OR paypal_mode='sandbox')) OR EXISTS(SELECT 1 FROM broker_leads l LEFT JOIN broker_campaigns c ON c.id=l.campaign_id WHERE l.id=$2 AND (l.is_test=1 OR c.is_test=1 OR c.paypal_mode='sandbox')) AS is_test",[campaignId||null,leadId||null]);
  return !!(source&&source.is_test);
 }
 async function enqueue(jobKey,payload,meta={}){
  if(!jobKey||!payload||!payload.to||!payload.subject)throw Error('Notification payload incomplete');
  const isTest=await testSource(meta),mode=isTest?'preview':'email';
  return db.get("INSERT INTO notification_jobs(job_key,kind,payload,broker_id,lead_id,campaign_id,is_test,delivery_mode) VALUES($1,$2,$3::jsonb,$4,$5,$6,$7,$8) ON CONFLICT(job_key) DO UPDATE SET job_key=EXCLUDED.job_key RETURNING id,status,is_test,delivery_mode",[jobKey,meta.kind||'email',JSON.stringify(isTest?simulatePayload(payload):payload),meta.brokerId||null,meta.leadId||null,meta.campaignId||null,isTest?1:0,mode]);
 }
 async function run({limit=10,isTest=null,brokerId=null,jobId=null}={}){
  const mode=isTest===null?null:isTest?1:0;
  const result={sent:0,previewed:0,failed:0,cancelled:0};
  await db.run("UPDATE notification_jobs SET status='failed',last_error='Delivery worker interrupted at retry limit; operator retry required.',lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE status='sending' AND lease_until<NOW() AND attempts>=$1 AND ($2::int IS NULL OR is_test=$2) AND ($3::int IS NULL OR broker_id=$3) AND ($4::bigint IS NULL OR id=$4)",[MAX_ATTEMPTS,mode,brokerId,jobId]);
  // A lease survives a worker crash. Real email delivery remains at-least-once;
  // sandbox follows the same queue, leases and retries with a local preview sink.
  for(let i=0;i<Math.max(1,Math.min(100,Number(limit)||10));i++){
   const lease=crypto.randomBytes(24).toString('hex');
   const job=await db.get("WITH due AS (SELECT id FROM notification_jobs WHERE ((status IN ('pending','failed') AND next_attempt_at<=NOW()) OR (status='sending' AND lease_until<NOW())) AND attempts<$1 AND ($3::int IS NULL OR is_test=$3) AND ($4::int IS NULL OR broker_id=$4) AND ($5::bigint IS NULL OR id=$5) ORDER BY next_attempt_at,id FOR UPDATE SKIP LOCKED LIMIT 1) UPDATE notification_jobs n SET status='sending',attempts=attempts+1,lease_token=$2,lease_until=NOW()+INTERVAL '5 minutes',updated_at=NOW() FROM due WHERE n.id=due.id RETURNING n.*",[MAX_ATTEMPTS,lease,mode,brokerId,jobId]);
   if(!job)break;
   try{
    if(job.kind==='lead_reminder'){
     const lead=await db.get('SELECT contacted_at,analysis_delivered_at,status FROM broker_leads WHERE id=$1',[job.lead_id]);
     if(!lead||lead.contacted_at||lead.analysis_delivered_at||lead.status==='fermé'){
      await db.run("UPDATE notification_jobs SET status='cancelled',lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE id=$1 AND lease_token=$2",[job.id,lease]);result.cancelled++;continue;
     }
    }
    // Recheck persisted sources at delivery as a second boundary: even an older
    // producer that forgot the test flag must never email a sandbox recipient.
    const isTest=job.delivery_mode==='preview'||await testSource({isTest:Number(job.is_test)===1,campaignId:job.campaign_id,leadId:job.lead_id});
    if(isTest){
     const payload=simulatePayload(job.payload);
     await db.run("UPDATE notification_jobs SET is_test=1,delivery_mode='preview',payload=$1::jsonb,status='sent',sent_at=NOW(),last_error=NULL,lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE id=$2 AND lease_token=$3",[JSON.stringify(payload),job.id,lease]);
     result.previewed++;continue;
    }
    let timer;try{
     const delivered=await Promise.race([services.email.send(typeof job.payload==='string'?JSON.parse(job.payload):job.payload),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Email timeout')),45000);})]);
     if(!delivered||delivered.success!==true||delivered.skipped||delivered.error)throw Error('Email provider did not accept delivery');
    }finally{clearTimeout(timer);}
    await db.run("UPDATE notification_jobs SET status='sent',sent_at=NOW(),last_error=NULL,lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE id=$1 AND lease_token=$2",[job.id,lease]);result.sent++;
   }catch(error){
    const delay=Math.min(21600,60*Math.pow(2,Math.max(0,Number(job.attempts)-1)));
    await db.run("UPDATE notification_jobs SET status='failed',last_error=$1,next_attempt_at=NOW()+($2::text||' seconds')::interval,lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE id=$3 AND lease_token=$4",['Notification processing failed; retry scheduled.',delay,job.id,lease]);result.failed++;
   }
  }
  return result;
 }
 async function summary({isTest=false}={}){return db.get("SELECT COUNT(*) FILTER(WHERE status IN ('pending','sending'))::int AS pending,COUNT(*) FILTER(WHERE status='failed' AND attempts<$1)::int AS retrying,COUNT(*) FILTER(WHERE status='failed' AND attempts>=$1)::int AS failed,COUNT(*) FILTER(WHERE status='sent' AND delivery_mode='email')::int AS sent,COUNT(*) FILTER(WHERE status='sent' AND delivery_mode='preview')::int AS previewed FROM notification_jobs WHERE ($2::int IS NULL OR is_test=$2)",[MAX_ATTEMPTS,isTest===null?null:isTest?1:0]);}
 async function list({limit=50,offset=0,isTest=false}={}){return db.all("SELECT id,job_key,kind,broker_id,lead_id,campaign_id,is_test,delivery_mode,status,attempts,next_attempt_at,sent_at,last_error,created_at,payload->>'to' AS recipient,payload->>'subject' AS subject FROM notification_jobs WHERE ($3::int IS NULL OR is_test=$3) ORDER BY (status='failed') DESC,created_at DESC,id DESC LIMIT $1 OFFSET $2",[Math.max(1,Math.min(200,Number(limit)||50)),Math.max(0,Number(offset)||0),isTest===null?null:isTest?1:0]);}
 async function retry(id){return db.get("UPDATE notification_jobs SET status='pending',attempts=0,next_attempt_at=NOW(),last_error=NULL,lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE id=$1 AND (status IN ('failed','pending') OR (status='sending' AND lease_until<NOW())) RETURNING id,status,is_test,delivery_mode",[id]);}
 async function previews({brokerId,leadId=null,campaignId=null,limit=50,offset=0}={}){
  if(!Number.isSafeInteger(Number(brokerId))||Number(brokerId)<1)return [];
  return db.all("SELECT id,kind,lead_id,campaign_id,status,attempts,sent_at,last_error,created_at,payload,is_test,delivery_mode FROM notification_jobs WHERE broker_id=$1 AND is_test=1 AND delivery_mode='preview' AND ($2::int IS NULL OR lead_id=$2) AND ($3::int IS NULL OR campaign_id=$3) ORDER BY created_at DESC,id DESC LIMIT $4 OFFSET $5",[brokerId,leadId,campaignId,Math.max(1,Math.min(200,Number(limit)||50)),Math.max(0,Number(offset)||0)]);
 }
 async function preview({brokerId,id}={}){
  if(!Number.isSafeInteger(Number(brokerId))||Number(brokerId)<1)return null;
  return await db.get("SELECT id,kind,lead_id,campaign_id,status,attempts,sent_at,last_error,created_at,payload,is_test,delivery_mode FROM notification_jobs WHERE id=$1 AND broker_id=$2 AND is_test=1 AND delivery_mode='preview'",[id,brokerId])||null;
 }
 return {enqueue,run,summary,list,retry,previews,preview};
}
module.exports={create,MAX_ATTEMPTS,simulatePayload};
