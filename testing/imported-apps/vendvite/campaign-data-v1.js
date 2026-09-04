/* Public property enrichment. No owner identities, no inferred unit counts. */
var crypto=require('crypto'),M=require('./public/js/campaign-model-v1');
var RESOURCE='2b9dfc3d-91d3-48de-b32c-a2a6d9417079';
var SOURCE='https://donnees.montreal.ca/dataset/unites-evaluation-fonciere';
// Municipality codes verified against the source's MUNICIPALITE column.
var MUNICIPALITIES={'montreal':'50','montreal est':'14','montreal ouest':'15','westmount':'29','dollard des ormeaux':'05','dorval':'06','pointe claire':'20','beaconsfield':'03','baie d urfe':'02','kirkland':'10','sainte anne de bellevue':'23','senneville':'22','hampstead':'07','cote saint luc':'04','mont royal':'13'};
['outremont','verdun','lachine','lasalle','saint laurent','saint leonard','anjou','pierrefonds','roxboro','ile bizard','montreal nord','riviere des prairies','pointe aux trembles'].forEach(function(city){MUNICIPALITIES[city]='50';});
function cacheKey(a){return crypto.createHash('sha256').update(M.key(a)+'|'+Number(a.lat).toFixed(4)+'|'+Number(a.lng).toFixed(4)).digest('hex');}
function supported(a){return a.lat>=45.38&&a.lat<=45.76&&a.lng>=-74.05&&a.lng<=-73.45&&!!MUNICIPALITIES[M.norm(a.ville)];}
function number(v){return /^\s*\d+\s*$/.test(String(v||''))?Number(v):null;}
function match(a,r){
 var n=number(a.numero),lo=number(r.CIVIQUE_DEBUT),hi=number(r.CIVIQUE_FIN)||lo;
 if(n===null||lo===null||!MUNICIPALITIES[M.norm(a.ville)]||MUNICIPALITIES[M.norm(a.ville)]!==r.MUNICIPALITE)return false;
 // An unresolved civic suffix or ambiguous side of the street is not a match.
 if(M.norm(r.LETTRE_DEBUT)||M.norm(r.LETTRE_FIN))return false;
 return n>=lo&&n<=hi&&(lo===hi||lo%2!==hi%2||n%2===lo%2)&&M.street(a.rue)===M.street(r.NOM_RUE)&&(!a.unit||M.norm(a.unit)===M.norm(r.SUITE_DEBUT));
}
function analyze(a,records,truncated){
 var seen=new Set(),rows=records.filter(function(r){if(!match(a,r)||seen.has(r.ID_UEV))return false;seen.add(r.ID_UEV);return true;});if(!rows.length||truncated||new Set(rows.map(function(r){return M.norm(r.NOM_RUE);})).size>1)return null;
 var condo=rows.some(function(r){return r.CATEGORIE_UEF==='Condominium';}),counts=rows.map(function(r){return M.integer(r.NOMBRE_LOGEMENT);}),units=counts.every(Boolean)?counts.reduce(function(x,y){return x+y;},0):null;
 var housing=rows.some(function(r){return Number(r.CODE_UTILISATION)>=1000&&Number(r.CODE_UTILISATION)<2000;}),type=condo?'condo':housing?(units===1?'house':units&&units<=5?'plex':units>5?'apartment':'residential'):'nonresidential';
 var years=Array.from(new Set(rows.map(function(r){return M.integer(r.ANNEE_CONSTRUCTION,2100);}).filter(Boolean))),levels=Array.from(new Set(rows.map(function(r){return M.integer(r.ETAGE_HORS_SOL,200);}).filter(Boolean)));
 var primary=rows[0];return {type:type,units:units,unitScope:'assessment',levels:levels.length===1?levels[0]:null,year:years.length===1?years[0]:null,source:'montreal',sourceUrl:SOURCE,confidence:'recorded',records:rows.length,assessments:rows.map(function(r){return {id:r.ID_UEV,units:M.integer(r.NOMBRE_LOGEMENT)};}),buildingId:'mtl:'+primary.MUNICIPALITE+'|'+M.street(primary.NOM_RUE)+'|'+primary.CIVIQUE_DEBUT+'|'+primary.CIVIQUE_FIN,fetchedAt:new Date().toISOString()};
}
function create(services){var db=services.db;
 async function limit(id,bucket,max){return !!await db.get("INSERT INTO campaign_request_limits(broker_id,bucket,window_at,hits) VALUES($1,$2,NOW(),1) ON CONFLICT(broker_id,bucket) DO UPDATE SET hits=CASE WHEN campaign_request_limits.window_at<NOW()-INTERVAL '1 minute' THEN 1 ELSE campaign_request_limits.hits+1 END,window_at=CASE WHEN campaign_request_limits.window_at<NOW()-INTERVAL '1 minute' THEN NOW() ELSE campaign_request_limits.window_at END WHERE campaign_request_limits.hits<$3 OR campaign_request_limits.window_at<NOW()-INTERVAL '1 minute' RETURNING broker_id",[id,bucket,max]);}
 async function enrich(addresses){
  var keys=addresses.map(cacheKey),cached=keys.length?await db.all('SELECT cache_key,payload FROM campaign_property_cache WHERE cache_key=ANY($1::text[]) AND expires_at>NOW()',[keys]):[];
  var byKey={};cached.forEach(function(r){byKey[r.cache_key]=r.payload;});var pending=addresses.filter(function(a){return supported(a)&&!(cacheKey(a) in byKey);}),status='ok';
  if(pending.length){
   // Bound civic ranges per street and municipality, not across the entire
   // neighbourhood. This keeps condo-heavy queries complete and small.
   var civic='CASE WHEN "CIVIQUE_DEBUT" ~ \'^ *[0-9]{1,7} *$\' THEN "CIVIQUE_DEBUT"::integer END';
   var end='CASE WHEN "CIVIQUE_FIN" ~ \'^ *[0-9]{1,7} *$\' THEN "CIVIQUE_FIN"::integer ELSE '+civic+' END';
   var groups={};pending.forEach(function(a){var n=number(a.numero);if(n===null)return;var city=MUNICIPALITIES[M.norm(a.ville)],key=city+'|'+M.street(a.rue);if(!groups[key])groups[key]={city:city,street:a.rue,nums:[]};groups[key].nums.push(n);});
   var where=Object.values(groups).map(function(g){var terms=g.street.replace(/^(rue|avenue|boulevard|boul\.?|chemin|av\.?)\s+/i,'').replace(/[%_]/g,'').split(/[\s-]+/).filter(Boolean);var name=terms.join('%').replace(/'/g,"''");return '("MUNICIPALITE"=\''+g.city+'\' AND "NOM_RUE" ILIKE \'%'+name+'%\' AND '+civic+'<='+Math.max.apply(Math,g.nums)+' AND '+end+'>='+Math.min.apply(Math,g.nums)+')';}).join(' OR ');
   if(where){
    var sql='SELECT "ID_UEV","CIVIQUE_DEBUT","CIVIQUE_FIN","NOM_RUE","SUITE_DEBUT","NOMBRE_LOGEMENT","ANNEE_CONSTRUCTION","ETAGE_HORS_SOL","CODE_UTILISATION","CATEGORIE_UEF","LETTRE_DEBUT","LETTRE_FIN","MUNICIPALITE" FROM "'+RESOURCE+'" WHERE '+where+' LIMIT 2001';
    try{
     var r=await (services.fetch||fetch)('https://donnees.montreal.ca/api/3/action/datastore_search_sql?sql='+encodeURIComponent(sql),{signal:AbortSignal.timeout(18000),headers:{'User-Agent':'VendVite/1.0 (+https://vendvite.app)'}});
     if(!r.ok)throw Error('source unavailable');var j=await r.json();if(!j.success)throw Error('source query');var records=j.result.records||[],truncated=records.length>2000;if(truncated)status='partial';
     if(!truncated){var writes=new Map();for(var a of pending){var analysis=analyze(a,records,false),key=cacheKey(a);byKey[key]=analysis;writes.set(key,{key:key,payload:analysis});}
      await db.run("INSERT INTO campaign_property_cache(cache_key,payload,expires_at) SELECT item->>'key',item->'payload',NOW()+CASE WHEN item->'payload'='null'::jsonb THEN INTERVAL '1 day' ELSE INTERVAL '7 days' END FROM jsonb_array_elements($1::jsonb) AS item ON CONFLICT(cache_key) DO UPDATE SET payload=EXCLUDED.payload,expires_at=EXCLUDED.expires_at",[JSON.stringify(Array.from(writes.values()))]);
     }
    }catch(e){status='unavailable';}
   }
  }
  return {status:status,sourceUrl:SOURCE,results:addresses.map(function(a){return {id:a.id||M.key(a),analysis:byKey[cacheKey(a)]||null,supported:supported(a)};})};
 }
 async function trusted(addresses){var rows=await db.all('SELECT cache_key,payload FROM campaign_property_cache WHERE cache_key=ANY($1::text[])',[addresses.map(cacheKey)]),known={};rows.forEach(function(r){known[r.cache_key]=r.payload;});return addresses.map(function(a){return Object.assign({},a,{analysis:known[cacheKey(a)]||null});});}
 return {enrich:enrich,limit:limit,trusted:trusted};
}
module.exports={create:create,analyze:analyze,supported:supported,cacheKey:cacheKey,match:match};
