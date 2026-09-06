// New free-page accounts use paid VendVite mailings. Legacy licences retain
// their purchased access/credits. Neither URL query fields nor profile edits
// can change the plan: it is a dedicated server-owned broker column.
// Keep helpers versioned: Liasse may retain modules across tenant releases.
const crypto=require('crypto');
function isMailing(b){return !!b&&b.access_plan==='mailing';}
function access(b){return isMailing(b)&&['invited','active'].includes(b.status);}
function isTest(c){return !!c&&(Number(c.is_test)===1||c.paypal_mode==='sandbox');}
function token(){return crypto.randomBytes(24).toString('hex');}
async function campaignForToken(db,raw){
  if(typeof raw!=='string'||!/^[a-f0-9]{48}$/.test(raw))return null;
  return db.get("SELECT c.* FROM broker_campaigns c WHERE c.mailing_token=$1 AND (c.payment_status='paid' OR (c.kind='included' AND c.payment_status='none')) AND c.is_test=0 AND c.paypal_mode<>'sandbox' AND c.status IN ('confirmed','processing','mailed')",[raw]);
}
// A campaign token alone cannot authorize a page or a lead. The random
// recipient key must belong to that exact eligible campaign in our database.
async function recipientForToken(db,campaignToken,recipientKey){
  if(typeof recipientKey!=='string'||!/^[a-f0-9]{32}$/.test(recipientKey))return null;
  const campaign=await campaignForToken(db,campaignToken);
  if(!campaign)return null;
  const recipient=addresses(campaign).find(a=>a.mailing_id===recipientKey);
  return recipient?{campaign,recipient}:null;
}
// Private test links use the same persisted recipient keys, but can never
// satisfy the production lookup used by public pages and lead submission.
async function testRecipientForToken(db,campaignToken,recipientKey){
  if(typeof campaignToken!=='string'||!/^[a-f0-9]{48}$/.test(campaignToken)||typeof recipientKey!=='string'||!/^[a-f0-9]{32}$/.test(recipientKey))return null;
  const campaign=await db.get("SELECT c.* FROM broker_campaigns c WHERE c.mailing_token=$1 AND (c.payment_status='paid' OR (c.kind='included' AND c.payment_status='none')) AND (c.is_test=1 OR c.paypal_mode='sandbox') AND c.status IN ('confirmed','processing','mailed')",[campaignToken]);
  if(!campaign)return null;
  const recipient=addresses(campaign).find(a=>a.mailing_id===recipientKey);
  return recipient?{campaign,recipient}:null;
}
function addresses(c){return typeof c.addresses==='string'?JSON.parse(c.addresses):c.addresses||[];}
function addressLines(a){return [(a.unit?a.unit+'-':'')+a.numero+' '+a.rue,[a.ville,a.province||'QC',a.postal||''].filter(Boolean).join(' ')];}
function deadline(now=new Date()){return new Date(new Date(now).getTime()+72*60*60*1000);}
// Keep recipient links stable on reprints. Compare-and-swap prevents concurrent
// print requests from replacing codes already emitted by another request.
async function prepareRecipients(db,campaign){
  for(let attempt=0;attempt<3;attempt++){
    const old=addresses(campaign);
    if(campaign.mailing_token&&old.every(a=>/^[a-f0-9]{32}$/.test(a.mailing_id||'')))return campaign;
    const next=old.map(a=>Object.assign({},a,{mailing_id:/^[a-f0-9]{32}$/.test(a.mailing_id||'')?a.mailing_id:crypto.randomBytes(16).toString('hex')}));
    const saved=await db.get('UPDATE broker_campaigns SET mailing_token=COALESCE(mailing_token,$1),addresses=$2::jsonb WHERE id=$3 AND addresses=$4::jsonb RETURNING *',[token(),JSON.stringify(next),campaign.id,JSON.stringify(old)]);
    if(saved)return saved;
    campaign=await db.get('SELECT * FROM broker_campaigns WHERE id=$1',[campaign.id]);
  }
  throw Error('Recipient links changed concurrently; retry printing.');
}
module.exports={isMailing,access,isTest,token,campaignForToken,recipientForToken,testRecipientForToken,addresses,addressLines,deadline,prepareRecipients};
