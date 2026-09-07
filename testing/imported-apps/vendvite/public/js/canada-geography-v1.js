/* Map coverage only. Tax jurisdiction comes from confirmed billing data. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./canada-boundaries-v1'));else root.VVCanadaGeography=factory(root.VVCanadaBoundaries);})(this,function(data){
 'use strict';
 var names={AB:'Alberta',BC:'British Columbia',MB:'Manitoba',NB:'New Brunswick',NL:'Newfoundland and Labrador',NS:'Nova Scotia',NT:'Northwest Territories',NU:'Nunavut',ON:'Ontario',PE:'Prince Edward Island',QC:'Québec',SK:'Saskatchewan',YT:'Yukon'};
 var bounds=[[41.6,-141.1],[83.2,-52.5]],regions={},grid={},cache=new Map();
 function valid(p){return !!p&&p.lat!==null&&p.lng!==null&&p.lat!==''&&p.lng!==''&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lng));}
 function inBox(x,y,b){return x>=b[0]&&y>=b[1]&&x<=b[2]&&y<=b[3];}
 function inside(x,y,r){var hit=false;for(var i=0,j=r.length-1;i<r.length;j=i++){var a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
 (data||[]).forEach(function(region){var rb=[180,90,-180,-90];region[1].forEach(function(poly){var b=poly[0];rb=[Math.min(rb[0],b[0]),Math.min(rb[1],b[1]),Math.max(rb[2],b[2]),Math.max(rb[3],b[3])];var item={province:region[0],box:b,rings:poly[1]};for(var x=Math.floor(b[0]);x<=Math.floor(b[2]);x++)for(var y=Math.floor(b[1]);y<=Math.floor(b[3]);y++){var k=x+','+y;(grid[k]||(grid[k]=[])).push(item);}});regions[region[0]]=[[rb[1],rb[0]],[rb[3],rb[2]]];});
 function province(p){if(!valid(p))return '';var x=Number(p.lng),y=Number(p.lat);if(y<41.6||y>83.2||x< -141.1||x> -52.5)return '';var k=x.toFixed(6)+','+y.toFixed(6);if(cache.has(k))return cache.get(k);var candidates=grid[Math.floor(x)+','+Math.floor(y)]||[],result='';for(var c of candidates){if(inBox(x,y,c.box)&&inside(x,y,c.rings[0])&&!c.rings.slice(1).some(function(hole){return inside(x,y,hole);})){result=c.province;break;}}if(cache.size>16000)cache.clear();cache.set(k,result);return result;}
 function canada(p){return !!province(p);}
 function normalize(v){var s=String(v||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/^CA-/,'');if(names[s])return s;return Object.keys(names).find(function(k){return names[k].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()===s;})||'';}
 function postalProvince(postal){var p=String(postal||'').toUpperCase().replace(/\s/g,'');if(!/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/.test(p))return '';return p[0]==='X'?(['X0A','X0B','X0C'].includes(p.slice(0,3))?'NU':'NT'):({A:'NL',B:'NS',C:'PE',E:'NB',G:'QC',H:'QC',J:'QC',K:'ON',L:'ON',M:'ON',N:'ON',P:'ON',R:'MB',S:'SK',T:'AB',V:'BC',Y:'YT'}[p[0]]||'');}
 return {postalProvince:postalProvince,canada:canada,province:province,normalize:normalize,names:names,bounds:bounds,regionBounds:function(p){return regions[normalize(p)]||bounds;}};
});
