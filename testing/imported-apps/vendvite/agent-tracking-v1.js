'use strict';
const crypto=require('crypto');
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const bot=req=>/bot|spider|crawler|preview|facebookexternalhit|headless|lighthouse/i.test(req.get('user-agent')||'');
function sameOrigin(req){if(req.get('sec-fetch-site')==='cross-site')return false;try{return !req.get('origin')||new URL(req.get('origin')).host===req.get('host');}catch(e){return false;}}
function create(services){const db=services.db;
 async function issue(req,res,context){
  if(!context||services.admin.isAdmin(req)||bot(req)||req.cookies.vv_broker_session||req.query.vv_preview)return null;
  let visitor=req.cookies.vv_audience;if(!/^[a-f0-9]{48}$/.test(visitor||'')){visitor=crypto.randomBytes(24).toString('hex');res.cookie('vv_audience',visitor,{httpOnly:true,secure:req.secure||req.get('x-forwarded-proto')==='https',sameSite:'lax',maxAge:30*86400000,path:'/'});}
  const token=crypto.randomBytes(24).toString('hex');await db.run('INSERT INTO agent_page_activity(token_hash,visitor_hash,agent_id,broker_id,kind) VALUES($1,$2,$3,$4,$5)',[hash(token),hash(visitor),context.agentId||null,context.brokerId||null,context.kind]);return token;
 }
 function register(router){router.post('/api/page-activity',async(req,res)=>{res.set('Cache-Control','private, no-store');try{
  if(!sameOrigin(req)||services.admin.isAdmin(req)||bot(req)||req.cookies.vv_broker_session)return res.sendStatus(204);
  const {token,active}=req.body||{},visitor=req.cookies.vv_audience;if(!/^[a-f0-9]{48}$/.test(token||'')||!/^[a-f0-9]{48}$/.test(visitor||'')||typeof active!=='boolean')return res.sendStatus(400);
  await db.run("UPDATE agent_page_activity SET first_seen_at=CASE WHEN $3 THEN COALESCE(first_seen_at,NOW()) ELSE first_seen_at END,last_seen_at=NOW(),active=$3 WHERE token_hash=$1 AND visitor_hash=$2 AND issued_at>NOW()-INTERVAL '24 hours'",[hash(token),hash(visitor),active]);res.sendStatus(204);
 }catch(e){console.error('page activity',e.message);res.sendStatus(503);}});}
 return {issue,register};
}
module.exports={create,sameOrigin};
