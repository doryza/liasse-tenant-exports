/* Opaque, revocable broker sessions. Keep this filename versioned when exports
 * change: Liasse can retain required helper modules across tenant updates. */
var crypto = require('crypto');
var SESSION_COOKIE = 'vv_broker_session';
var CHALLENGE_COOKIE = 'vv_signin_challenge';
var ACCEPTED = ['invited','active','cancelled','expired'];
var DAY = 86400000;
function hash(s){ return crypto.createHash('sha256').update(String(s)).digest('hex'); }
function random(){ return crypto.randomBytes(32).toString('hex'); }
function equal(a,b){ return typeof a==='string' && typeof b==='string' && a.length===b.length && crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b)); }
function secure(req){return req.secure || String(req.headers['x-forwarded-proto']||'').split(',')[0]==='https';}
function cookieOptions(req,age){return {httpOnly:true,secure:secure(req),sameSite:'lax',path:'/',maxAge:age};}
function allowed(b){return !!b && ACCEPTED.indexOf(b.status)!==-1;}
function safeNext(value){return ['espace','espace/page','espace/courrier-cible','espace/pistes','espace/abonnement','espace/compte','espace/apercu'].indexOf(value)!==-1?value:'espace';}
function sameOrigin(req){
  if(req.headers['sec-fetch-site']==='cross-site')return false;
  if(!req.headers.origin)return true; // CSRF token is still required for mutations.
  // A no-referrer page produces Origin: null on a form POST in Chromium.
  // Trust that case only with browser-verified same-origin Fetch Metadata;
  // the unpredictable cookie-bound challenge/CSRF token is still mandatory.
  if(req.headers.origin==='null')return req.headers['sec-fetch-site']==='same-origin';
  try{return new URL(req.headers.origin).host.toLowerCase()===String(req.get('host')).toLowerCase();}catch(e){return false;}
}
function protect(res){
  require('./homepage-experiment-v1').privateResponse(res);
  res.set('Referrer-Policy','no-referrer');
  // Existing Liasse service workers exclude owner responses from CacheStorage.
  res.set('X-Liasse-Owner','broker');
}
function create(services){
  var db=services.db;
  function setSession(req,res,raw,row){
    res.cookie(SESSION_COOKIE,raw,cookieOptions(req,Math.min(30*DAY,Math.max(0,new Date(row.absolute_expires_at).getTime()-Date.now()))));
    req._vvSession={id:row.id,broker_id:row.broker_id,raw:raw,csrf:hash('csrf:'+raw),absolute_expires_at:row.absolute_expires_at};
  }
  async function current(req,res){
    if(req._vvAuthLoaded)return req._vvBroker||null;
    req._vvAuthLoaded=true;
    var raw=(req.cookies||{})[SESSION_COOKIE];
    if(/^[a-f0-9]{64}$/.test(raw||'')){
      var row=await db.get("SELECT s.id AS session_id,s.absolute_expires_at,s.idle_expires_at,b.* FROM broker_sessions s JOIN brokers b ON b.id=s.broker_id WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.idle_expires_at>NOW() AND s.absolute_expires_at>NOW()",[hash(raw)]);
      if(row && allowed(row)){
        req._vvBroker=row;
        req._vvSession={id:row.session_id,broker_id:row.id,raw:raw,csrf:hash('csrf:'+raw),absolute_expires_at:row.absolute_expires_at};
        if(res){
          await db.run("UPDATE broker_sessions SET last_seen_at=NOW(),idle_expires_at=LEAST(NOW()+INTERVAL '30 days',absolute_expires_at) WHERE id=$1 AND revoked_at IS NULL",[row.session_id]);
          res.cookie(SESSION_COOKIE,raw,cookieOptions(req,Math.min(30*DAY,Math.max(0,new Date(row.absolute_expires_at).getTime()-Date.now()))));
        }
        return row;
      }
      if(res)res.clearCookie(SESSION_COOKIE,cookieOptions(req,0));
    }
    // Preserve authentic old sessions only when a real signing secret exists.
    // Never accept the old publicly guessable 'vv' fallback.
    var legacy=(req.cookies||{}).vv_courtier;
    if(!raw && res && services.jwtSecret && services.jwtSecret!=='vv' && /^\d+\.\d{13}\.[a-f0-9]{32}$/.test(legacy||'')){
      var parts=legacy.split('.'),age=Date.now()-Number(parts[1]);
      var signature=crypto.createHmac('sha256',services.jwtSecret).update(parts[0]+'.'+parts[1]).digest('hex').slice(0,32);
      if(age>=0 && age<30*DAY && equal(signature,parts[2])){
        var broker=await db.get('SELECT * FROM brokers WHERE id=$1',[Number(parts[0])]);
        if(allowed(broker) && (!broker.auth_valid_after || Number(parts[1])>=new Date(broker.auth_valid_after).getTime())){
          var session=await start(broker.id,req,res);
          if(session){req._vvBroker=broker;res.clearCookie('vv_courtier',cookieOptions(req,0));return broker;}
        }
      }
    }
    return null;
  }
  async function start(brokerId,req,res){
    var raw=random();
    var row=await db.get("INSERT INTO broker_sessions(broker_id,token_hash,device_label,idle_expires_at,absolute_expires_at) SELECT id,$2,$3,NOW()+INTERVAL '30 days',NOW()+INTERVAL '90 days' FROM brokers WHERE id=$1 AND status IN ('invited','active','cancelled','expired') RETURNING *",[brokerId,hash(raw),device(req)]);
    if(row)setSession(req,res,raw,row);return row;
  }
  function device(req){
    var ua=String(req.headers['user-agent']||'');
    var os=/iPhone|iPad/.test(ua)?'iOS':/Android/.test(ua)?'Android':/Windows/.test(ua)?'Windows':/Macintosh/.test(ua)?'Mac':/Linux/.test(ua)?'Linux':'Appareil';
    var browser=/Edg\//.test(ua)?'Edge':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Navigateur';
    return browser+' · '+os;
  }
  async function mint(brokerId,purpose){
    var raw=random();
    var row=await db.get("INSERT INTO broker_tokens(broker_id,token_hash,purpose,expires_at) SELECT id,$2,$3,NOW()+($4::int*INTERVAL '1 hour') FROM brokers WHERE id=$1 AND status IN ('invited','active','cancelled','expired') RETURNING id",[brokerId,hash(raw),purpose||'access',purpose==='login'?1:72]);
    if(!row)throw Error('Broker access not approved');return raw;
  }
  async function inspect(raw){
    if(!/^[a-f0-9]{64}$/.test(raw||''))return null;
    return await db.get("SELECT t.id FROM broker_tokens t JOIN brokers b ON b.id=t.broker_id WHERE t.token_hash=$1 AND t.purpose IN ('access','login') AND t.used_at IS NULL AND t.revoked_at IS NULL AND t.expires_at>NOW() AND b.status IN ('invited','active','cancelled','expired')",[hash(raw)]);
  }
  function challenge(req,res){
    var old=(req.cookies||{})[CHALLENGE_COOKIE];var value=/^[a-f0-9]{64}$/.test(old||'')?old:random();res.cookie(CHALLENGE_COOKIE,value,cookieOptions(req,10*60000));return hash('signin:'+value);
  }
  function validChallenge(req){
    var value=(req.cookies||{})[CHALLENGE_COOKIE];
    return sameOrigin(req) && /^[a-f0-9]{64}$/.test(value||'') && equal(hash('signin:'+value),String((req.body||{}).challenge||''));
  }
  async function redeem(req,res,raw){
    if(!validChallenge(req)||!/^[a-f0-9]{64}$/.test(raw||''))return null;
    var sessionRaw=random();
    // Consume the link and create a session in one atomic statement. GET and
    // HEAD never consume links; concurrent confirmations have exactly one winner.
    var row=await db.get("WITH consumed AS (UPDATE broker_tokens t SET used_at=NOW() FROM brokers b WHERE t.broker_id=b.id AND t.token_hash=$1 AND t.purpose IN ('access','login') AND t.used_at IS NULL AND t.revoked_at IS NULL AND t.expires_at>NOW() AND b.status IN ('invited','active','cancelled','expired') RETURNING t.broker_id) INSERT INTO broker_sessions(broker_id,token_hash,device_label,idle_expires_at,absolute_expires_at) SELECT broker_id,$2,$3,NOW()+INTERVAL '30 days',NOW()+INTERVAL '90 days' FROM consumed RETURNING *",[hash(raw),hash(sessionRaw),device(req)]);
    if(!row)return null;
    setSession(req,res,sessionRaw,row);res.clearCookie(CHALLENGE_COOKIE,cookieOptions(req,0));
    // This browser has authenticated; invalidate older outstanding links to it.
    await db.run('UPDATE broker_tokens SET revoked_at=NOW() WHERE broker_id=$1 AND used_at IS NULL AND revoked_at IS NULL',[row.broker_id]);
    return await db.get('SELECT * FROM brokers WHERE id=$1',[row.broker_id]);
  }
  function csrf(req){return req._vvSession && sameOrigin(req) && equal(req._vvSession.csrf,String(req.headers['x-vv-csrf']||(req.body||{})._csrf||''));}
  async function limit(key,max,cooldown){
    return !!await db.get("INSERT INTO broker_login_limits(bucket_key,hits,window_started_at,last_request_at) VALUES ($1,1,NOW(),NOW()) ON CONFLICT(bucket_key) DO UPDATE SET hits=CASE WHEN broker_login_limits.window_started_at<NOW()-INTERVAL '1 hour' THEN 1 ELSE broker_login_limits.hits+1 END,window_started_at=CASE WHEN broker_login_limits.window_started_at<NOW()-INTERVAL '1 hour' THEN NOW() ELSE broker_login_limits.window_started_at END,last_request_at=NOW() WHERE (broker_login_limits.hits<$2 OR broker_login_limits.window_started_at<NOW()-INTERVAL '1 hour') AND broker_login_limits.last_request_at<=NOW()-($3::int*INTERVAL '1 second') RETURNING bucket_key",[hash(key),max,cooldown]);
  }
  async function requestLink(req,email,send){
    if(!await limit('ip:'+String(req.ip||req.socket.remoteAddress||''),30,0))return 'limited';
    if(!await limit('email:'+email,5,60))return 'ok';
    var b=await db.get('SELECT * FROM brokers WHERE LOWER(email)=$1',[email]);
    if(!allowed(b))return 'ok';
    var raw=await mint(b.id,'login');
    try{var result=await send(b,raw);if(result===false||(result&&result.success===false))throw Error('Email delivery failed');}
    catch(e){await db.run('UPDATE broker_tokens SET revoked_at=NOW() WHERE token_hash=$1',[hash(raw)]);console.error('broker login delivery failed');}
    return 'ok';
  }
  async function logout(req,res,all){
    if(!req._vvSession)return;
    if(all){
      // One statement prevents partially completed all-device revocation.
      await db.run('WITH account AS (UPDATE brokers SET auth_valid_after=NOW() WHERE id=$1 RETURNING id), sessions AS (UPDATE broker_sessions SET revoked_at=NOW() WHERE broker_id IN (SELECT id FROM account) AND revoked_at IS NULL) UPDATE broker_tokens SET revoked_at=NOW() WHERE broker_id IN (SELECT id FROM account) AND used_at IS NULL',[req._vvSession.broker_id]);
    }else{
      await db.run('UPDATE broker_sessions SET revoked_at=NOW() WHERE broker_id=$1 AND id=$2',[req._vvSession.broker_id,req._vvSession.id]);
    }
    res.clearCookie(SESSION_COOKIE,cookieOptions(req,0));res.clearCookie('vv_courtier',cookieOptions(req,0));
  }
  return {current:current,start:start,mint:mint,inspect:inspect,challenge:challenge,validChallenge:validChallenge,redeem:redeem,csrf:csrf,requestLink:requestLink,logout:logout};
}
module.exports={create:create,protect:protect,allowed:allowed,safeNext:safeNext,hash:hash,cookie:SESSION_COOKIE};
