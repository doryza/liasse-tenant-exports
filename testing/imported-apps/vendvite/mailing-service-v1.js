// New free-page accounts use paid VendVite mailings. Legacy licences retain
// their purchased access/credits. Neither URL query fields nor profile edits
// can change the plan: it is a dedicated server-owned broker column.
const crypto=require('crypto');
function isMailing(b){return !!b&&b.access_plan==='mailing';}
function access(b){return isMailing(b)&&['invited','active'].includes(b.status);}
function token(){return crypto.randomBytes(24).toString('hex');}
async function campaignForToken(db,raw){
  if(!/^[a-f0-9]{48}$/.test(raw||''))return null;
  return db.get("SELECT c.* FROM broker_campaigns c WHERE c.mailing_token=$1 AND c.payment_status='paid' AND c.is_test=0 AND c.status IN ('confirmed','processing','mailed')",[raw]);
}
module.exports={isMailing,access,token,campaignForToken};
