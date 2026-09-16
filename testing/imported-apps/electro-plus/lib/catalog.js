exports.read=async function(db,query) {
const real=await db.get('SELECT COUNT(*) AS count FROM products WHERE published=1 AND verified=1 AND is_example=0');
const exampleMode=Number(real.count)===0;
const base=exampleMode?'published=1 AND is_example=1':'published=1 AND verified=1 AND is_example=0';
const categories=await db.all('SELECT DISTINCT category FROM products WHERE '+base+' ORDER BY category');
const category=typeof query.category==='string'?query.category.slice(0,40):'';
const q=typeof query.q==='string'?query.q.trim().slice(0,120):'';
const params=[];
let where=base;
if(category) { params.push(category);where+=' AND category=$'+params.length; }
if(q) { params.push('%'+q.replace(/[\\%_]/g,'\\$&')+'%');const p='$'+params.length;where+=' AND (title ILIKE '+p+' OR title_en ILIKE '+p+' OR brand ILIKE '+p+' OR model ILIKE '+p+')'; }
const count=await db.get('SELECT COUNT(*) AS count FROM products WHERE '+where,params);
const total=Number(count.count),pages=Math.max(1,Math.ceil(total/9));
const page=Math.min(pages,Math.max(1,parseInt(query.page,10)||1));
const products=await db.all('SELECT * FROM products WHERE '+where+' ORDER BY featured DESC,updated_at DESC,id DESC LIMIT 9 OFFSET $'+(params.length+1),params.concat([(page-1)*9]));
const featured=await db.get('SELECT * FROM products WHERE published=1 AND verified=1 AND is_example=0 ORDER BY featured DESC,updated_at DESC,id DESC LIMIT 1');
return {products,categories,category,q,total,pages,page,exampleMode,featured};
};