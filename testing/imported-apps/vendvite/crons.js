'use strict';
// Platform-owned scheduler survives browser closure. Rows and leases retain
// pending work across process restarts; every run starts from durable state.
const crypto=require('crypto');
module.exports=function(services){
 if(!services.scheduler||typeof services.scheduler.register!=='function')return;
 const canonical='https://vendvite.app';
 const req={lang:'fr',query:{},body:{},headers:{host:'vendvite.app','x-forwarded-proto':'https'},protocol:'https',secure:true,get:name=>name.toLowerCase()==='host'?'vendvite.app':undefined,tenantUrl:path=>canonical+path,tenantPath:path=>path};
 function task(name,interval,work){services.scheduler.register(name,interval,async({db}={})=>{
  db=db||services.db;const token=crypto.randomBytes(24).toString('hex');
  const lock=await db.get("INSERT INTO operations_job_runs(name,started_at,lease_until,lease_token) VALUES($1,NOW(),NOW()+INTERVAL '12 minutes',$2) ON CONFLICT(name) DO UPDATE SET started_at=NOW(),lease_until=NOW()+INTERVAL '12 minutes',lease_token=EXCLUDED.lease_token WHERE operations_job_runs.lease_until IS NULL OR operations_job_runs.lease_until<NOW() RETURNING name",[name,token]);if(!lock)return;
  try{const result=await work(Object.assign({},services,{db}));await db.run('UPDATE operations_job_runs SET finished_at=NOW(),last_error=NULL,details=$1::jsonb,lease_until=NULL,lease_token=NULL WHERE name=$2 AND lease_token=$3',[JSON.stringify(result||{}),name,token]);}
  catch(e){await db.run('UPDATE operations_job_runs SET finished_at=NOW(),last_error=$1,lease_until=NULL,lease_token=NULL WHERE name=$2 AND lease_token=$3',['Automatic processing failed. Check the related pending items and retry.',name,token]);throw e;}
 });}
 task('vendvite-payments-v1',60000,async s=>{
  // The platform resolves a fresh tenant DB on every tick. Payment, tax
  // configuration and invoice hooks must all bind to it after a reconnect.
  // Rebuilding the router only registers handlers; it executes no requests.
  if(s.db!==services.db)require('./routes')(s);
  if(!s.vendvitePaymentRecovery)throw Error('Payment recovery is not registered');
  const result=await s.vendvitePaymentRecovery.run({req,limit:5});return {checked:result.length};
 });
 task('vendvite-notifications-v1',60000,s=>require('./notification-outbox-v1').create(s).run({limit:10}));
 task('vendvite-reminders-v1',300000,async s=>({queued:await require('./lead-service-v1').create(s).enqueueOverdue({limit:100,workspaceUrl:canonical+'/espace/pistes'})}));
};
