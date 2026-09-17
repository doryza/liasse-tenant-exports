const T=require('./i18n');
function localized(value,lang){if(typeof value!=='string') return value||'';try{const x=JSON.parse(value);if(x&&typeof x==='object'&&!Array.isArray(x)) return x[lang]||x.fr||'';}catch(e){}return value;}
function both(value){try{const x=JSON.parse(value);return !!(x.fr&&x.en&&x.fr.trim()&&x.en.trim());}catch(e){return false;}}
function translate(raw,lang){const t=Object.assign({},T[lang]||T.fr);for(const key in raw) if(key.startsWith('text_')&&key.endsWith('_'+lang)){const k=key.slice(5,-(lang.length+1));if(k)t[k]=raw[key];}return t;}
function flag(raw,key){return raw[key]==='1';}
function safeJSON(x){return JSON.stringify(x).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
function error(code,status=400,detail=''){const e=new Error(code);e.code=code;e.status=status;e.detail=detail;return e;}
function money(cents,lang){return new Intl.NumberFormat(lang==='en'?'en-CA':'fr-CA',{style:'currency',currency:'CAD'}).format(Number(cents)/100);}
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function date(value,lang){return value?new Intl.DateTimeFormat(lang==='en'?'en-CA':'fr-CA',{timeZone:'America/Toronto',dateStyle:'long',timeStyle:'short'}).format(new Date(value)):'';}
function urls(lang){return lang==='en'?{home:'en/',services:'en/services/',about:'en/about/',contact:'en/contact/',appointments:'en/appointments/',privacy:'en/privacy/',payment:'en/appointments/payment/'}:{home:'.',services:'services/',about:'a-propos/',contact:'contact/',appointments:'rendez-vous/',privacy:'confidentialite/',payment:'rendez-vous/paiement/'};}
module.exports=function(services){let initialized;async function init(){if(!initialized) initialized=(async()=>{const c=services.config||{};for(const [key,value] of Object.entries({business_name:c.businessName||c.displayName||'Massothérapie Sens-Ô-Réel',contact_email:c.contactEmail,contact_phone:c.contactPhone,business_address:c.businessAddress})) if(value) await services.db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO NOTHING',[key,String(value)]);})().catch(e=>{initialized=null;throw e;});await initialized;}
return {async load(){await init();return Object.fromEntries((await services.db.all('SELECT key,value FROM admin_settings')).map(x=>[x.key,x.value]));}};};
Object.assign(module.exports,{localized,both,translate,flag,safeJSON,error,money,today,date,urls});