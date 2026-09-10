'use strict';
const crypto=require('crypto'),M=require('./public/js/campaign-model-v2'),G=require('./public/js/canada-geography-v1');
const columns=['address_id','house_number','street','unit','city','province','postal_code'];
const original=c=>(typeof c.addresses==='string'?JSON.parse(c.addresses):c.addresses||[]).map(a=>({...a,ville:a.ville||c.city||'',province:a.province||M.province(a)||c.province||''}));
const building=a=>[M.norm(a.numero),M.street(a.rue),M.norm(a.ville),a.province||M.province(a)].join('|');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,24);
const addressId=a=>'addr_'+digest(building(a)+'|'+M.norm(a.unit));
function field(v){let s=String(v==null?'':v);if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function csv(rows){return '\uFEFF'+[columns,...rows].map(r=>r.map(field).join(',')).join('\r\n');}
function template(c){return csv(original(c).map(a=>[addressId(a),a.numero,a.rue,a.unit||'',a.ville||c.city||'',a.province||M.province(a),a.postal||'']));}
function parse(raw){if(typeof raw!=='string'||raw.length>3000000)throw Error('Fichier CSV limité à 3 Mo.');raw=raw.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<raw.length;i++){const ch=raw[i];if(ch==='"'){if(quoted&&raw[i+1]==='"'){cell+='"';i++;}else if(!quoted&&cell!=='')throw Error('CSV invalide : guillemet inattendu.');else quoted=!quoted;}else if(ch===','&&!quoted){row.push(cell.trim());cell='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&raw[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=ch;}
 if(quoted)throw Error('CSV invalide : guillemets non fermés.');row.push(cell.trim());if(row.some(Boolean))rows.push(row);if(!rows.length||JSON.stringify(rows.shift())!==JSON.stringify(columns))throw Error('Utilisez exactement les colonnes du fichier modèle.');if(!rows.length||rows.length>12000)throw Error('Importez entre 1 et 12 000 lignes.');return rows;
}
function stage(c,raw){const rows=parse(raw),source=new Map(original(c).map(a=>[addressId(a),a])),candidates=[],seen=new Set();
 for(const [index,r] of rows.entries()){
  if(r.length!==7)throw Error('Ligne '+(index+2)+' : 7 colonnes requises.');const [id,numero,rue,unit,ville,province,postalInput]=r,a=source.get(id);if(!a)throw Error('Ligne '+(index+2)+' : address_id inconnu pour cette commande.');
  if([numero,rue,unit,ville,province,postalInput].some(s=>s.length>160||/[\u0000-\u001f\u007f]/.test(s))||unit.length>20)throw Error('Ligne trop longue.');
  const clean={...a,numero,rue,unit,ville,province:province.toUpperCase(),postal:postalInput.toUpperCase().replace(/\s/g,'')};
  if(building(clean)!==building(a))throw Error('Ligne '+(index+2)+' : le bâtiment diffère de la commande. Conservez numéro, rue, ville et province.');
  const key=digest(building(clean)+'|'+M.norm(unit));if(seen.has(key))throw Error('Ligne '+(index+2)+' : unité en double.');seen.add(key);
  const postalOK=/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/.test(clean.postal)&&(!G.postalProvince(clean.postal)||G.postalProvince(clean.postal)===clean.province);
  if(postalOK)clean.postal=clean.postal.slice(0,3)+' '+clean.postal.slice(3);
  candidates.push({id:key,addressId:id,building:building(clean),address:clean,postalOK});
 }
 const groups=new Map();for(const a of original(c)){const key=building(a);if(!groups.has(key))groups.set(key,{key,address:a,knownUnits:0,flagged:false});const g=groups.get(key),p=a.analysis||{};g.knownUnits=Math.max(g.knownUnits,Number(p.units)||0);g.flagged=g.flagged||!!a.unit||g.knownUnits>1||['plex','apartment','condo'].includes(p.type);}
 for(const g of groups.values()){g.candidates=candidates.filter(a=>a.building===g.key);g.flagged=g.flagged||g.candidates.length>1||g.candidates.some(a=>!!a.address.unit);}
 const selected=[];for(const g of groups.values())if(!g.flagged&&g.candidates.length===1&&g.candidates[0].postalOK)selected.push(g.candidates[0].id);
 return {revision:Number((c.production||{}).revision||0)+1,importedAt:new Date().toISOString(),candidates,groups:Array.from(groups.values()),selected,approvedAt:null};
}
function approve(c,selected){const p=c.production;if(!p||!Array.isArray(p.candidates)||!Array.isArray(selected)||!selected.length)throw Error('Sélectionnez les destinataires à imprimer.');if(new Set(selected).size!==selected.length||selected.length>Number(c.address_count))throw Error('Nombre de lettres invalide.');const byId=new Map(p.candidates.map(a=>[a.id,a])),groups=new Set(),recipients=[];
 for(const id of selected){const a=byId.get(id);if(!a||!a.postalOK)throw Error('Chaque destinataire doit avoir un code postal valide.');if(groups.has(a.building))throw Error('Une seule unité par bâtiment est permise.');const g=p.groups.find(g=>g.key===a.building);if(g.flagged&&!a.address.unit)throw Error('Précisez l’unité choisie pour ce bâtiment.');groups.add(a.building);const previous=original(c).find(old=>building(old)===a.building&&M.norm(old.unit)===M.norm(a.address.unit));recipients.push({...a.address,mailing_id:previous&&/^[a-f0-9]{32}$/.test(previous.mailing_id||'')?previous.mailing_id:crypto.randomBytes(16).toString('hex')});}
 const report=p.groups.map(g=>{const chosen=p.candidates.find(a=>a.building===g.key&&selected.includes(a.id));return {address:g.address,knownUnits:g.knownUnits,multiUnit:g.flagged,selected:chosen?chosen.address:null,omitted:g.candidates.filter(a=>a.building===g.key&&!selected.includes(a.id)).map(a=>({address:a.address,reason:a.postalOK?'Unité ou adresse non retenue':'Code postal manquant ou invalide'})),missing:g.candidates.length===0};}).filter(g=>g.multiUnit||g.missing||g.omitted.length||!g.selected);
 return {...p,revision:p.revision+1,selected,recipients,report,approvedAt:new Date().toISOString(),orderedCount:Number(c.address_count),preparedCount:recipients.length};
}
function ready(c){return !!(c.production&&c.production.approvedAt&&c.production.recipients&&c.production.recipients.length);}
function editable(c){return ['confirmed','processing'].includes(c.status)&&(c.payment_status==='paid'||c.kind==='included'&&c.payment_status==='none')&&!ready(c);}
module.exports={columns,original,building,addressId,csv,template,parse,stage,approve,ready,editable};
