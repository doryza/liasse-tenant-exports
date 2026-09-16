const categories=['fridge','range','washer','dryer','dishwasher','freezer'];
function field(t,name,type,extra,copyKey) {
const copy=t.fields[copyKey || name];
const group=type==='image'?'groupImages':type==='boolean'?'groupPublication':name==='price'?'groupPrice':['condition_text','condition_en','description','description_en','dimensions','dimensions_en','content','content_en'].includes(name)?'groupDetails':'groupIdentity';
return Object.assign({name,type,label:copy[0],description:copy[1],placeholder:copy[2],maxLength:type==='textarea'?6000:240,group},extra || {});
}
exports.modules=function(t) {
return [{key:'products',label:t.productsModule,icon:'package',description:t.productsHint,fields:[field(t,'title','text',{required:true,maxLength:160}),field(t,'title_en','text',{required:true,maxLength:160}),field(t,'category','select',{required:true,options:categories,optionLabels:categories.map(function(c){return t[c];})}),field(t,'brand','text'),field(t,'model','text'),field(t,'condition_text','textarea'),field(t,'condition_en','textarea'),field(t,'description','textarea'),field(t,'description_en','textarea'),field(t,'dimensions','text'),field(t,'dimensions_en','text'),field(t,'price','number',{min:0,max:1000000,step:0.01}),field(t,'image_url','image',{maxLength:2048}),field(t,'image_extra_url','image',{maxLength:2048}),field(t,'is_example','boolean',{default:true}),field(t,'verified','boolean',{default:false}),field(t,'published','boolean',{default:false}),field(t,'featured','boolean',{default:false})]},
{key:'posts',label:t.postsModule,icon:'edit',description:t.postsHint,fields:[field(t,'title','text',{required:true,maxLength:160}),field(t,'title_en','text',{required:true,maxLength:160}),field(t,'content','textarea'),field(t,'content_en','textarea'),field(t,'image_url','image',{maxLength:2048}),field(t,'category','text',{},'post_category'),field(t,'published','boolean',{default:false},'post_published')]}];
};
exports.validId=function(id){return /^\d+$/.test(String(id)) && Number.isSafeInteger(Number(id)) && Number(id)>0 && Number(id)<=2147483647;};
function assertKey(key){if(!['products','posts'].includes(key)) throw Object.assign(new Error('Invalid module'),{status:400});}
exports.list=async function(db,key) { assertKey(key);return await db.all('SELECT * FROM '+key+' ORDER BY updated_at DESC,id DESC'); };
exports.save=async function(db,key,id,body,t) {
assertKey(key);
if(!body || typeof body!=='object' || Array.isArray(body)) throw Object.assign(new Error(t.invalidRecord),{status:400});
const def=exports.modules(t).find(function(m){return m.key===key;});
if(id && !exports.validId(id)) throw Object.assign(new Error(t.invalidRecord),{status:400});
let previous={};
if(id) { previous=await db.get('SELECT * FROM '+key+' WHERE id=$1',[id]); if(!previous) throw Object.assign(new Error(t.notFound),{status:404}); }
const data={};
for(const f of def.fields) {
let value=Object.prototype.hasOwnProperty.call(body,f.name)?body[f.name]:previous[f.name];
if(value===undefined || (value===null && f.type!=='number')) value=f.type==='boolean'?(f.default?1:0):f.type==='number'?null:'';
if(f.type==='boolean') { if(![true,false,1,0,'1','0'].includes(value)) throw Object.assign(new Error(t.invalidField+f.label),{status:400}); value=[true,1,'1'].includes(value)?1:0; }
else if(f.type==='number') { if(value===''||value===null) value=null; else { if(!['number','string'].includes(typeof value)) throw Object.assign(new Error(t.invalidField+f.label),{status:400});value=Number(value); if(!Number.isFinite(value)||value<f.min||value>f.max||Math.abs(value*100-Math.round(value*100))>0.00001) throw Object.assign(new Error(t.invalidField+f.label),{status:400}); } }
else { if(typeof value!=='string') throw Object.assign(new Error(t.invalidField+f.label),{status:400}); value=value.trim(); if(value.length>f.maxLength || (f.required && !value)) throw Object.assign(new Error(t.invalidField+f.label),{status:400}); if(f.type==='select'&&!f.options.includes(value)) throw Object.assign(new Error(t.invalidField+f.label),{status:400}); if(f.type==='image'&&value && !(value===previous[f.name] && /^\{\{IMG_[A-Z0-9_]+\}\}$/.test(value))) { try { if(new URL(value).protocol!=='https:') throw new Error(); } catch(e) { throw Object.assign(new Error(t.invalidField+f.label),{status:400}); } } }
data[f.name]=value;
}
if(key==='products') {
if(data.is_example && (data.price!==null || data.verified)) throw Object.assign(new Error(t.examplePrice),{status:400});
if(!data.is_example && data.published && (!data.verified || data.price===null || !data.brand || !data.model || !data.condition_text || !data.condition_en || !/^https:\/\//.test(data.image_url))) throw Object.assign(new Error(t.confirmOffer),{status:400});
}
const names=Object.keys(data),values=Object.values(data);
if(id) {
values.push(id);
await db.run('UPDATE '+key+' SET '+names.map(function(n,i){return n+'=$'+(i+1);}).join(',')+',updated_at=NOW() WHERE id=$'+values.length,values);
return await db.get('SELECT * FROM '+key+' WHERE id=$1',[id]);
}
const result=await db.run('INSERT INTO '+key+' ('+names.join(',')+') VALUES ('+values.map(function(v,i){return '$'+(i+1);}).join(',')+') RETURNING id',values);
return await db.get('SELECT * FROM '+key+' WHERE id=$1',[result.lastInsertRowid]);
};
exports.stats=async function(services) {
const db=services.db;
const row=await db.get(`SELECT (SELECT COUNT(*) FROM products) AS products,(SELECT COUNT(*) FROM posts) AS posts,(SELECT COUNT(*) FROM products WHERE published=1 AND verified=1 AND is_example=0) AS confirmed,(SELECT COUNT(*) FROM products WHERE published=0) AS drafts,(SELECT COUNT(*) FROM products WHERE is_example=1) AS examples,(SELECT COUNT(*) FROM site_visits) AS total,(SELECT COUNT(*) FROM site_visits WHERE created_at>NOW()-INTERVAL '7 days') AS recent`);
let userCount=0,pushSubscriberCount=0;
try { userCount=Number(await services.auth.getUserCount()) || 0; } catch(e) {}
try { pushSubscriberCount=Number(await services.push.getSubscriptionCount()) || 0; } catch(e) {}
return {userCount,pushSubscriberCount,totalVisits:Number(row.total),recentVisits:Number(row.recent),products:Number(row.products),posts:Number(row.posts),confirmedProducts:Number(row.confirmed),draftProducts:Number(row.drafts),exampleProducts:Number(row.examples)};
};