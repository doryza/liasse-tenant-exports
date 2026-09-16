const localizedKeys = ['hero_title','hero_subtitle','visit_title','visit_text','footer_text','tax_note','hours'];
const toggles = ['contact_verified','location_verified','hours_verified','hero_photo_real'];
const simpleKeys = ['business_name','brand_electro','brand_plus','contact_phone','contact_email','business_address'];
exports.localizedKeys = localizedKeys;
exports.getSettings = async function(db) {
return Object.fromEntries((await db.all('SELECT key,value FROM admin_settings')).map(function(r){return [r.key,r.value];}));
};
exports.seedConfig = async function(db,config) {
const values = {business_name:config.businessName || config.displayName || 'Electro Plus',contact_email:config.contactEmail,contact_phone:config.contactPhone,business_address:config.businessAddress};
for (const key of Object.keys(values)) if (values[key]) await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[key,String(values[key])]);
};
exports.locals = function(req,services,settings,lang,T) {
const t = Object.assign({},T[lang]);
for (const key in settings) if (key.startsWith('text_') && key.endsWith('_'+lang)) { const k=key.slice(5,-(lang.length+1)); if(k) t[k]=settings[key]; }
function s(key) {
if (settings['text_'+key+'_'+lang] !== undefined) return settings['text_'+key+'_'+lang];
const value = settings[key];
if (value === undefined || value === null) return t[key] || '';
try { const parsed=JSON.parse(value); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed[lang] || ''; } catch(e) {}
return String(value);
}
const hasPhone = settings.contact_verified === '1' && /^[+()\d\s.\-]{7,30}$/.test(settings.contact_phone || '');
const hasAddress = settings.location_verified === '1' && !!(settings.business_address || '').trim();
const hasEmail = settings.contact_verified === '1' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact_email || '');
const telephone = hasPhone ? 'tel:'+settings.contact_phone.replace(/[^+\d]/g,'') : '';
const directionsUrl = hasAddress ? 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(settings.business_address) : '';
const currentPath = req.path === '/' ? '.' : req.path.replace(/^\//,'');
function link(path,patch,hash) {
const params = new URLSearchParams();
for (const key of ['lang','category','q','page','edit','new']) if (typeof req.query[key] === 'string' && req.query[key]) params.set(key,req.query[key]);
for (const key in (patch || {})) { if (patch[key] === null || patch[key] === '') params.delete(key); else params.set(key,String(patch[key])); }
return path+(params.toString() ? '?'+params.toString() : '')+(hash ? '#'+hash : '');
}
const canonicalPath=req.path==='/'?'':req.path;
const seo=typeof req.tenantUrl==='function'?{canonical:req.tenantUrl(canonicalPath+'?lang='+lang),fr:req.tenantUrl(canonicalPath+'?lang=fr'),en:req.tenantUrl(canonicalPath+'?lang=en')}:{};
return {settings,t,lang,s,hasPhone,hasEmail,hasAddress,telephone,directionsUrl,currentPath,link,seo,tenantRoot:req.tenantPath('/'),adminMode:false,googleApiKey:(services.google && services.google.mapsApiKey) || '',contactConfigured:!!(services.config && services.config.contactEmail),col:function(fr,en){return lang==='en'?en:fr;},money:function(value){return new Intl.NumberFormat(lang==='fr'?'fr-CA':'en-CA',{minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(value));},date:function(value){const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString(lang==='fr'?'fr-CA':'en-CA',{year:'numeric',month:'short',day:'numeric'});}};
};
exports.settingFields = function(t) {
return simpleKeys.concat(toggles,localizedKeys,['_p_hero_image_url']).map(function(name) {
const copy=t.settingLabels[name];
const group=['business_name','brand_electro','brand_plus'].includes(name)?'groupBrand':['_p_hero_image_url','hero_photo_real'].includes(name)?'groupStoreImage':localizedKeys.includes(name)&&name!=='hours'?'groupCopy':'groupContact';
return {name,label:copy[0],description:copy[1],placeholder:copy[0],type:toggles.includes(name)?'boolean':name==='_p_hero_image_url'?'image':localizedKeys.includes(name)||name==='business_address'?'textarea':name==='contact_email'?'email':name==='contact_phone'?'tel':'text',localized:localizedKeys.includes(name),group,maxLength:name==='_p_hero_image_url'?2048:6000,aspectRatio:name==='_p_hero_image_url'?'4:5':undefined};
});
};
exports.saveSettings = async function(db,values,t) {
if (!values || typeof values !== 'object' || Array.isArray(values) || !Object.keys(values).length || Object.keys(values).length > 80) throw Object.assign(new Error(t.invalidRecord),{status:400});
const allowed=simpleKeys.concat(toggles,localizedKeys,['_p_hero_image_url','_p_nav_logo_url']);
const previous=await exports.getSettings(db),entries=[];
for(const key of Object.keys(values)) {
if (!allowed.includes(key) && !/^text_[a-z0-9_:-]{1,64}_(fr|en)$/.test(key)) throw Object.assign(new Error(t.invalidField+key),{status:400});
let value=typeof values[key]==='string'?values[key]:toggles.includes(key)&&typeof values[key]==='boolean'?(values[key]?'1':'0'):String(values[key] == null?'':values[key]);
if(value.length>12000) throw Object.assign(new Error(t.invalidField+key),{status:400});
if(toggles.includes(key) && !['0','1'].includes(value)) throw Object.assign(new Error(t.invalidField+key),{status:400});
if(key.endsWith('_url') && value && !(value===previous[key] && /^\{\{IMG_[A-Z0-9_]+\}\}$/.test(value))) { try { if(new URL(value).protocol!=='https:') throw new Error(); } catch(e) { throw Object.assign(new Error(t.invalidField+key),{status:400}); } }
if(key==='contact_phone' && value && !/^[+()\d\s.\-]{7,30}$/.test(value)) throw Object.assign(new Error(t.invalidField+key),{status:400});
if(key==='contact_email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw Object.assign(new Error(t.invalidField+key),{status:400});
if(localizedKeys.includes(key) && value.startsWith('{')) { try { const o=JSON.parse(value); if(typeof o.fr!=='string'||typeof o.en!=='string') throw new Error(); } catch(e) { throw Object.assign(new Error(t.invalidField+key),{status:400}); } }
entries.push([key,value]);
}
const params=[];
const slots=entries.map(function(e,i){params.push(e[0],e[1]);return '($'+(i*2+1)+',$'+(i*2+2)+')';});
await db.run('INSERT INTO admin_settings (key,value) VALUES '+slots.join(',')+' ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()',params);
};