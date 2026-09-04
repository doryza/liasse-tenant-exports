/* One tenant, one experiment. Assignment and outcomes live in Postgres so
 * restarts, multiple replicas and duplicate browser events cannot reset them. */
var KEY = 'homepage-price-v1';
var COOKIE = 'vv_home_price_v1';
var LOOKS = [250, 500, 1000, 2000, 4000, 8000, 16000, 32000];
var DAYS = 14;

function interval(successes, total) {
  if (!total) return [0, 1];
  // Eight planned looks, two arms: Bonferroni-adjusted Wilson intervals.
  // z=3 is slightly more conservative than the required 2.956.
  var z = 3, p = successes / total, d = 1 + z*z/total;
  var centre = (p + z*z/(2*total)) / d;
  var margin = z * Math.sqrt(p*(1-p)/total + z*z/(4*total*total)) / d;
  return [Math.max(0, centre-margin), Math.min(1, centre+margin)];
}
function decide(a, b) {
  if (a.paid + b.paid < 20) return null;
  var ia = interval(a.paid, a.visitors), ib = interval(b.paid, b.visitors);
  return ia[0] > ib[1] ? 'visible' : ib[0] > ia[1] ? 'gated' : null;
}
function cookieId(req) {
  var id = (req.cookies || {})[COOKIE];
  return /^[a-f0-9]{32}$/.test(id || '') ? id : null;
}
function excluded(req, services) {
  return (services.admin && services.admin.isAdmin(req)) ||
    /bot|crawler|spider|headless|preview|facebookexternalhit|slurp/i.test(String(req.headers['user-agent'] || ''));
}

function privateResponse(res) {
  if (res._vvPrivateResponse) return;
  res._vvPrivateResponse = true;
  res.vary('Cookie');
  res.set('Cache-Control','private, no-store');
  // Liasse's HTML injection replaces Cache-Control in res.send. Apply the
  // experiment policy at header flush, after that wrapper has finished.
  var writeHead = res.writeHead;
  res.writeHead = function() {
    res.setHeader('Cache-Control','private, no-store');
    return writeHead.apply(this,arguments);
  };
}

function create(services) {
  var db = services.db;
  async function state() {
    return await db.get('SELECT * FROM homepage_experiments WHERE experiment=$1', [KEY]);
  }
  async function assign(req, res) {
    privateResponse(res);
    var preview = req.query.vv_preview;
    if (preview === 'visible' || preview === 'gated') { res.set('X-Liasse-Preview','homepage-experiment'); return { variant:preview, preview:true, track:false }; }
    if (excluded(req, services)) return { variant:'visible', preview:false, track:false };
    var id = cookieId(req);
    var visitor = id && await db.get('SELECT variant FROM homepage_visitors WHERE experiment=$1 AND visitor_id=$2', [KEY,id]);
    if (visitor) return { variant:visitor.variant, preview:false, track:true };
    var s = await state();
    if (!s) return { variant:'visible', preview:false, track:false };
    id = services.crypto.randomBytes(16);
    var roll = parseInt(id.slice(0,8),16) / 4294967296;
    var variant = s.winner ? (roll < 0.9 ? s.winner : (s.winner === 'visible' ? 'gated' : 'visible')) : (roll < 0.5 ? 'visible' : 'gated');
    await db.run('INSERT INTO homepage_visitors (experiment,visitor_id,variant) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [KEY,id,variant]);
    res.cookie(COOKIE,id,{ httpOnly:true, sameSite:'lax', secure:req.secure || req.headers['x-forwarded-proto']==='https', maxAge:180*86400000, path:'/' });
    return { variant:variant, preview:false, track:true };
  }
  async function event(req) {
    if (excluded(req, services)) return;
    var id = cookieId(req), kind = (req.body || {}).event;
    var column = { view:'exposed_at', start:'form_started_at', cta:'cta_at' }[kind];
    if (!id || !column) return;
    await db.run('UPDATE homepage_visitors SET exposed_at=COALESCE(exposed_at,NOW())'+(kind==='view'?'':', '+column+'=COALESCE('+column+',NOW())')+' WHERE experiment=$1 AND visitor_id=$2', [KEY,id]);
  }
  async function convert(req, brokerId) {
    var id = cookieId(req);
    if (!id || excluded(req, services)) return;
    // Called only for a newly persisted broker. Existing applicants never
    // inflate conversion, and one broker can belong to only one visitor.
    await db.run('UPDATE homepage_visitors SET exposed_at=COALESCE(exposed_at,NOW()), applied_at=NOW(), broker_id=$3 WHERE experiment=$1 AND visitor_id=$2 AND broker_id IS NULL', [KEY,id,brokerId]);
  }
  async function results(limit) {
    var capped = Number.isInteger(limit);
    return await db.all(`WITH visitors AS (
      SELECT v.*, ROW_NUMBER() OVER (PARTITION BY variant ORDER BY exposed_at,visitor_id) AS position
      FROM homepage_visitors v WHERE experiment=$1 AND exposed_at IS NOT NULL
      ${capped ? "AND exposed_at <= NOW() - INTERVAL '14 days'" : ''}
    ) SELECT variant, COUNT(*)::int AS visitors,
      COUNT(form_started_at)::int AS starts, COUNT(cta_at)::int AS clicks,
      COUNT(applied_at)::int AS applications,
      COUNT(*) FILTER (WHERE exposed_at <= NOW() - INTERVAL '14 days')::int AS mature,
      COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM broker_invoices i
        WHERE i.broker_id=v.broker_id AND COALESCE(i.is_test,0)=0 AND i.paypal_mode='live'
        AND COALESCE(i.kind,'subscription')='subscription' AND i.total_cents>0
        AND i.payment_time>=v.applied_at
        ${capped ? "AND i.payment_time<=v.exposed_at + INTERVAL '14 days'" : ''}
      ))::int AS paid
      FROM visitors v ${capped ? 'WHERE position<=$2' : ''} GROUP BY variant`, capped ? [KEY,limit] : [KEY]);
  }
  async function evaluate() {
    // Distributed hourly lease. A result is only examined once per planned
    // sample size, with a full 14-day payment window for every visitor.
    var s = await db.get("UPDATE homepage_experiments SET checked_at=NOW() WHERE experiment=$1 AND winner IS NULL AND next_look<8 AND (checked_at IS NULL OR checked_at<NOW()-INTERVAL '1 hour') RETURNING *", [KEY]);
    if (!s) return;
    var n = LOOKS[s.next_look], rows = await results(n);
    var a = rows.find(function(r){return r.variant==='visible';});
    var b = rows.find(function(r){return r.variant==='gated';});
    if (!a || !b || a.visitors<n || b.visitors<n) return;
    var winner = decide(a,b);
    await db.run('UPDATE homepage_experiments SET next_look=next_look+1,winner=$3::text,decided_at=CASE WHEN $3::text IS NOT NULL THEN NOW() ELSE NULL END,last_result=$4::jsonb WHERE experiment=$1 AND next_look=$2 AND winner IS NULL', [KEY,s.next_look,winner,JSON.stringify({n:n,visible:a,gated:b})]);
  }
  return { assign:assign, event:event, convert:convert, results:results, state:state, evaluate:evaluate };
}
module.exports = { privateResponse:privateResponse, create:create, interval:interval, decide:decide, key:KEY, looks:LOOKS, windowDays:DAYS };
