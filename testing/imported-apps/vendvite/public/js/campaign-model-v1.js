(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.VVCampaignModel=factory();})(this,function(){
 'use strict';
 function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
 function street(s){return norm(String(s||'').replace(/\s*\([^)]*\)\s*$/,'')).replace(/\b(boul|bd|blvd)\b/g,'boulevard').replace(/\b(av)\b/g,'avenue').replace(/\b(ch)\b/g,'chemin').replace(/\b(st)\b/g,'saint').replace(/\b(ste)\b/g,'sainte').replace(/\b(west|w)\b/g,'ouest').replace(/\b(east)\b/g,'est');}
 function key(a){return [norm(a.numero),street(a.rue),norm(a.ville),norm(a.unit)].join('|');}
 function valid(p){return p&&p.lat!==null&&p.lng!==null&&p.lat!==''&&p.lng!==''&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lng))&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lng))<=180;}
 function qc(p){return valid(p)&&Number(p.lat)>=44.8&&Number(p.lat)<=62.7&&Number(p.lng)>=-80&&Number(p.lng)<=-57;}
 function distance(a,b){var t=Math.PI/180,dlat=(b.lat-a.lat)*t,dlng=(b.lng-a.lng)*t,h=Math.sin(dlat/2)**2+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dlng/2)**2;return Math.round(12742000*Math.asin(Math.sqrt(Math.min(1,h))));}
 function integer(v,max){return /^\d+$/.test(String(v||''))&&Number(v)>0&&Number(v)<=(max||9999)?Number(v):null;}
 function classify(t){
  t=t||{};var building=String(t.building||t['building:use']||'').toLowerCase(),units=integer(t['building:flats']),type='unknown';
  if(['commercial','retail','industrial','warehouse','school','church','hospital','garage','garages','shed','roof','yes:commercial'].includes(building)||t.shop||t.office||t.amenity)type='nonresidential';
  else if(t.ownership==='condominium'||t.residential==='condominium'||building==='condominium')type='condo';
  else if(units&&units>=2&&units<=5)type='plex';
  else if(units&&units>5||['apartments','dormitory'].includes(building))type='apartment';
  else if(['house','detached','semidetached_house','terrace','bungalow'].includes(building))type='house';
  else if(building==='residential')type='residential';
  return {type:type,units:units,levels:integer(t['building:levels'],200),year:integer(t.start_date,2100),source:'osm',confidence:type==='unknown'?'unknown':'mapped',buildingId:null,unitScope:units?'building':null};
 }
 function inside(point,poly){if(!poly||poly.length<3)return true;var result=false;for(var i=0,j=poly.length-1;i<poly.length;j=i++){var a=poly[i],b=poly[j];if((a[0]>point.lat)!==(b[0]>point.lat)&&point.lng<(b[1]-a[1])*(point.lat-a[0])/(b[0]-a[0])+a[1])result=!result;}return result;}
 function parse(elements,center,city,radius,polygon){
  var nodes={},points=[],buildings=[];
  elements.forEach(function(e){if(e.type==='node')nodes[e.id]=e;var t=e.tags||{};if(e.type==='way'&&t.building&&e.geometry&&e.geometry.length>=3)buildings.push({id:'way/'+e.id,tags:t,poly:e.geometry.map(function(p){return [p.lat,p.lon];})});});
  elements.forEach(function(e){var t=e.tags||{};if(!t['addr:housenumber'])return;var pos={lat:e.lat!=null?e.lat:e.center&&e.center.lat,lng:e.lon!=null?e.lon:e.center&&e.center.lon};if(!valid(pos))return;
   var analysis=classify(t),building=buildings.find(function(b){return inside(pos,b.poly);});
   if(building){analysis=classify(Object.assign({},building.tags,t));analysis.buildingId=building.id;}
   else if(t.building)analysis.buildingId=e.type+'/'+e.id;
   points.push({numero:String(t['addr:housenumber']),rue:t['addr:street']||'',ville:t['addr:city']||city||'',postal:t['addr:postcode']||'',unit:t['addr:unit']||'',source:'point',lat:Number(pos.lat),lng:Number(pos.lng),analysis:analysis});
  });
  elements.forEach(function(w){var t=w.tags||{},mode=t['addr:interpolation'];if(w.type!=='way'||!mode||!w.nodes)return;var step=mode==='all'?1:mode==='even'||mode==='odd'?2:integer(mode,20);if(!step)return;
   var ends=w.nodes.map(function(id){return nodes[id];}).filter(function(n){return n&&n.tags&&/^\d+$/.test(n.tags['addr:housenumber']);});
   for(var i=0;i+1<ends.length;i++){var a=ends[i],b=ends[i+1],lo=Number(a.tags['addr:housenumber']),hi=Number(b.tags['addr:housenumber']);if(lo>hi){var z=a;a=b;b=z;lo=Number(a.tags['addr:housenumber']);hi=Number(b.tags['addr:housenumber']);}if((hi-lo)/step>400)continue;
    for(var n=lo;n<=hi;n+=step){var f=hi===lo?0:(n-lo)/(hi-lo);points.push({numero:String(n),rue:a.tags['addr:street']||b.tags['addr:street']||t['addr:street']||'',ville:a.tags['addr:city']||city||'',postal:'',unit:'',source:'interpole',lat:a.lat+(b.lat-a.lat)*f,lng:a.lon+(b.lon-a.lon)*f,analysis:classify({})});}
   }
  });
  var dedup=new Map();points.forEach(function(a){if(!a.rue||!valid(a)||!qc(a)||!inside(a,polygon))return;a.metres=distance(center,a);if(a.metres>radius)return;var k=key(a),old=dedup.get(k);if(!old||old.source==='interpole'&&a.source==='point')dedup.set(k,a);});
  return Array.from(dedup.values()).sort(function(a,b){return a.metres-b.metres;}).slice(0,4000).map(function(a){a.id=key(a);return a;});
 }
 function summary(list){var s={letters:list.length,knownUnits:0,unknownUnits:0,review:0,house:0,plex:0,apartment:0,condo:0,residential:0,nonresidential:0,unknown:0},buildings=new Set();list.forEach(function(a){var p=a.analysis||classify({});s[['house','plex','apartment','condo','residential','nonresidential','unknown'].includes(p.type)?p.type:'unknown']++;if(a.source==='interpole'||p.type==='unknown'||p.type==='nonresidential')s.review++;if(p.source==='montreal'&&Array.isArray(p.assessments)){p.assessments.forEach(function(record){var id='assessment:'+record.id;if(buildings.has(id))return;buildings.add(id);if(record.units)s.knownUnits+=record.units;else s.unknownUnits++;});return;}var k=p.buildingId||a.id||key(a);if(buildings.has(k))return;buildings.add(k);if(p.units)s.knownUnits+=p.units;else s.unknownUnits++;});return s;}
 function filter(a,f){var p=a.analysis||classify({});return (!f.type||p.type===f.type)&&(!f.search||norm([a.numero,a.rue,a.ville,a.postal].join(' ')).includes(norm(f.search)))&&(!f.source||a.source===f.source)&&(!f.units||p.units!==null&&(f.units==='1'?p.units===1:f.units==='2-5'?p.units>=2&&p.units<=5:p.units>=6));}
 function sanitize(a){if(!a||!valid(a))return null;var out={numero:String(a.numero||'').trim().slice(0,20),rue:String(a.rue||'').trim().slice(0,160),ville:String(a.ville||'').trim().slice(0,120),postal:String(a.postal||'').trim().slice(0,10),unit:String(a.unit||'').trim().slice(0,20),lat:Math.round(Number(a.lat)*1e6)/1e6,lng:Math.round(Number(a.lng)*1e6)/1e6,source:a.source==='point'?'point':'interpole',metres:Number.isFinite(Number(a.metres))?Math.max(0,Math.round(Number(a.metres))):null};if(!out.numero||!out.rue||!qc(out))return null;out.id=key(out);return out;}
 return {norm:norm,street:street,key:key,valid:valid,qc:qc,distance:distance,integer:integer,classify:classify,inside:inside,parse:parse,summary:summary,filter:filter,sanitize:sanitize};
});
