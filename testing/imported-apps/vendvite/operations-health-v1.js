'use strict';
// The external uptime check wakes lazy tenant schedulers after host restarts.
// Expose only readiness, never queue counts, customer data or provider errors.
const bootAt=Date.now();
const names=['vendvite-payments-v1','vendvite-notifications-v1','vendvite-reminders-v1'];
function register(router,services){router.get('/health/operations',async(req,res)=>{
 res.set('Cache-Control','private, no-store');res.set('X-Robots-Tag','noindex, nofollow');
 try{const jobs=await services.db.all('SELECT name,finished_at,last_error FROM operations_job_runs');const failed=jobs.some(j=>names.includes(j.name)&&j.last_error);const ready=names.every(name=>jobs.some(j=>j.name===name&&j.finished_at&&Date.now()-new Date(j.finished_at).getTime()<15*60000));const starting=!failed&&!ready&&Date.now()-bootAt<6*60000;res.status(!failed&&(ready||starting)?200:503).json({state:failed?'unavailable':ready?'ready':starting?'starting':'unavailable'});}
 catch(e){res.status(503).json({state:'unavailable'});}
});}
module.exports={register};
