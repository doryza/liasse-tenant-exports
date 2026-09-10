'use strict';
const crypto=require('crypto');
const MAX_ATTEMPTS=12;
function create(services){
 const db=services.db;
 async function enqueue(jobKey,payload,meta={}){
  if(!jobKey||!payload||!payload.to||!payload.subject)throw Error('Notification payload incomplete');
  return db.get("INSERT INTO notification_jobs(job_key,kind,payload,broker_id,lead_id,campaign_id) VALUES($1,$2,$3::jsonb,$4,$5,$6) ON CONFLICT(job_key) DO UPDATE SET job_key=EXCLUDED.job_key RETURNING id,status",[jobKey,meta.kind||'email',JSON.stringify(payload),meta.brokerId||null,meta.leadId||null,meta.campaignId||null]);
 }
 async function run({limit=10}={}){
  const result={sent:0,failed:0,cancelled:0};
  await db.run("UPDATE notification_jobs SET status='failed',last_error='Delivery worker interrupted at retry limit; operator retry required.',lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE status='sending' AND lease_until<NOW() AND attempts>=$1",[MAX_ATTEMPTS]);
  // A lease survives a worker crash. Retries are at-least-once: mail providers
  // that do not support idempotency can duplicate a receipt after an ambiguous timeout.
  for(let i=0;i<Math.max(1,Math.min(100,Number(limit)||10));i++){
   const lease=crypto.randomBytes(24).toString('hex');
   const job=await db.get("WITH due AS (SELECT id FROM notification_jobs WHERE ((status IN ('pending','failed') AND next_attempt_at<=NOW()) OR (status='sending' AND lease_until<NOW())) AND attempts<$1 ORDER BY next_attempt_at,id FOR UPDATE SKIP LOCKED LIMIT 1) UPDATE notification_jobs n SET status='sending',attempts=attempts+1,lease_token=$2,lease_until=NOW()+INTERVAL '5 minutes',updated_at=NOW() FROM due WHERE n.id=due.id RETURNING n.*",[MAX_ATTEMPTS,lease]);
   if(!job)break;
   try{
    if(job.kind==='lead_reminder'){
     const lead=await db.get('SELECT contacted_at,analysis_delivered_at,status FROM broker_leads WHERE id=$1',[job.lead_id]);
     if(!lead||lead.contacted_at||lead.analysis_delivered_at||lead.status==='fermé'){
      await db.run("UPDATE notification_jobs SET status='cancelled',lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE id=$1 AND lease_token=$2",[job.id,lease]);result.cancelled++;continue;
     }
    }
    let timer;try{
     const delivered=await Promise.race([services.email.send(typeof job.payload==='string'?JSON.parse(job.payload):job.payload),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Email timeout')),45000);})]);
     if(!delivered||delivered.success!==true||delivered.skipped||delivered.error)throw Error('Email provider did not accept delivery');
    }finally{clearTimeout(timer);}
    await db.run("UPDATE notification_jobs SET status='sent',sent_at=NOW(),last_error=NULL,lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE id=$1 AND lease_token=$2",[job.id,lease]);result.sent++;
   }catch(error){
    const delay=Math.min(21600,60*Math.pow(2,Math.max(0,Number(job.attempts)-1)));
    await db.run("UPDATE notification_jobs SET status='failed',last_error=$1,next_attempt_at=NOW()+($2::text||' seconds')::interval,lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE id=$3 AND lease_token=$4",['Email provider unavailable or rejected delivery; retry scheduled.',delay,job.id,lease]);result.failed++;
   }
  }
  return result;
 }
 async function summary(){return db.get("SELECT COUNT(*) FILTER(WHERE status IN ('pending','sending'))::int AS pending,COUNT(*) FILTER(WHERE status='failed' AND attempts<$1)::int AS retrying,COUNT(*) FILTER(WHERE status='failed' AND attempts>=$1)::int AS failed,COUNT(*) FILTER(WHERE status='sent')::int AS sent FROM notification_jobs",[MAX_ATTEMPTS]);}
 async function list({limit=50,offset=0}={}){return db.all("SELECT id,job_key,kind,broker_id,lead_id,campaign_id,status,attempts,next_attempt_at,sent_at,last_error,created_at,payload->>'to' AS recipient FROM notification_jobs ORDER BY (status='failed') DESC,created_at DESC,id DESC LIMIT $1 OFFSET $2",[Math.max(1,Math.min(200,Number(limit)||50)),Math.max(0,Number(offset)||0)]);}
 async function retry(id){return db.get("UPDATE notification_jobs SET status='pending',attempts=0,next_attempt_at=NOW(),last_error=NULL,lease_token=NULL,lease_until=NULL,updated_at=NOW() WHERE id=$1 AND (status IN ('failed','pending') OR (status='sending' AND lease_until<NOW())) RETURNING id,status",[id]);}
 return {enqueue,run,summary,list,retry};
}
module.exports={create,MAX_ATTEMPTS};
