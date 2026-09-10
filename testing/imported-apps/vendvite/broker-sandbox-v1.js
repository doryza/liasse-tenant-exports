'use strict';
const crypto=require('crypto'),name='vv_sandbox_mode';
function signature(req){const s=req._vvSession;return s&&s.raw?crypto.createHmac('sha256',s.raw).update('vendvite-sandbox:'+s.broker_id).digest('hex'):null;}
function enabled(req){const expected=signature(req),actual=(req.cookies||{})[name];return !!(expected&&typeof actual==='string'&&/^[a-f0-9]{64}$/.test(actual)&&crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(expected)));}
function set(req,res,on){const options={httpOnly:true,secure:!!(req.secure||req.get('x-forwarded-proto')==='https'),sameSite:'lax',path:'/',maxAge:86400000};if(on)res.cookie(name,signature(req),options);else {delete options.maxAge;res.clearCookie(name,options);}}
module.exports={enabled,set};
