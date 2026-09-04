// Scoped tenant release, preserving the exact live baseline and a normal restore point.
const fs=require('fs');
const {Client}=require('/home/liassetech/liasse.tech/node_modules/pg');
(async()=>{
 const baseline=JSON.parse(fs.readFileSync('/tmp/vendvite-campaign-homepage-baseline.json','utf8'));
 const db=new Client({connectionString:fs.readFileSync('/home/liassetech/.liasse-ops/db-public-url','utf8').trim(),ssl:{rejectUnauthorized:false},statement_timeout:15000});
 await db.connect();
 try {
  const {rows:[live]}=await db.query("SELECT generation_version,generated_files FROM subscriber_pwas WHERE id=433 AND slug='vendvite'");
  if(live.generation_version!==baseline.generation_version||JSON.stringify(live.generated_files)!==JSON.stringify(baseline.generated_files))throw Error('Live tenant changed; rebase required');
  console.log('Verified exact tenant 433 baseline, generation '+live.generation_version);
 } finally {await db.end()}
 if(process.argv[2]!=='publish')return;
 const credentials=fs.readFileSync('/home/liassetech/.liasse-ops/liasse-tech-admin-creds','utf8').trim();
 const response=await fetch('https://liasse.tech/admin/subscriber-pwas/433/import-from-testing',{
  method:'POST',headers:{Authorization:'Basic '+Buffer.from(credentials).toString('base64'),'Content-Type':'application/json'},
  body:JSON.stringify({source:'github',github:{owner:'doryza',repo:'liasse-tenant-exports',branch:'feat/vendvite-campaign-homepage'},note:'Make precision campaign builder and lead-capture page equally prominent in both FR/EN A/B variants; add builder illustration and done-for-you shipping center. Preserve pricing experiment and campaign studio.'}),signal:AbortSignal.timeout(180000)
 });
 const result=await response.text();if(!response.ok)throw Error('HTTP '+response.status+': '+result.slice(0,500));console.log(result);
})().catch(e=>{console.error(e.message);process.exit(1)});
