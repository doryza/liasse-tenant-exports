'use strict';
const M=require('./public/js/campaign-model-v2');
function policy(value){
  if(value==null)return {mode:'off'};
  if(!value||typeof value!=='object')throw Error('BAD_HISTORY_FILTER');
  if(value.mode==='off'||value.mode==='all')return {mode:value.mode};
  if(value.mode==='days'&&Number.isInteger(value.days)&&value.days>=1&&value.days<=36500)return {mode:'days',days:value.days};
  throw Error('BAD_HISTORY_FILTER');
}
// Use civic address + unit + municipality + province, not changing map coordinates.
function key(a,city,province){return [M.norm(a.province||M.province(a)||province),M.key(Object.assign({},a,{ville:a.ville||city||''}))].join('|');}
async function matches(db,brokerId,addresses,filter,now=new Date()){
  filter=policy(filter);if(filter.mode==='off'||!addresses.length)return [];
  const since=filter.mode==='days'?new Date(now.getTime()-filter.days*86400000):null;
  const campaigns=await db.all("SELECT addresses,production,city,province,COALESCE(mailed_at,created_at) AS targeted_at FROM broker_campaigns WHERE broker_id=$1 AND is_test=0 AND status IN ('confirmed','processing','mailed') AND (kind='included' OR payment_status='paid') AND ($2::timestamptz IS NULL OR COALESCE(mailed_at,created_at)>=$2::timestamptz) ORDER BY COALESCE(mailed_at,created_at) DESC",[brokerId,since]);
  const wanted=new Set(addresses.map(a=>key(a))),latest=new Map();
  for(const campaign of campaigns){for(const a of (campaign.production&&campaign.production.approvedAt?campaign.production.recipients:campaign.addresses)||[]){const k=key(a,campaign.city,campaign.province);if(wanted.has(k)&&!latest.has(k))latest.set(k,new Date(campaign.targeted_at).toISOString());}}
  return addresses.filter(a=>latest.has(key(a))).map(a=>({id:M.key(a),targetedAt:latest.get(key(a))}));
}
module.exports={policy,key,matches};
