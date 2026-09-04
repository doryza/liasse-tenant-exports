const path=require('path'), fs=require('fs'), crypto=require('crypto');
const deps='/home/liassetech/liasse.tech/node_modules/';
process.env.NODE_PATH=deps; require('module').Module._initPaths();
const express=require('express'), {PGlite}=require('@electric-sql/pglite'), ejs=require('ejs');
const root=path.join(__dirname,'../testing/imported-apps/vendvite');
async function create(port=0){
 const pg=new PGlite(); await pg.exec(fs.readFileSync(path.join(root,'schema.sql'),'utf8')); await pg.exec(fs.readFileSync(path.join(root,'migrations.sql'),'utf8'));
 const db={get:async(s,p)=>(await pg.query(s,p)).rows[0],all:async(s,p)=>(await pg.query(s,p)).rows,run:async(s,p)=>pg.query(s,p)};
 const emails=[];
 const services={db,externalVars:{},jwtSecret:'local-test-secret-never-production',config:{businessName:'VendVite'},qrcode:{toDataURL:async()=>''},cloudinary:{uploader:{upload:async()=>({secure_url:'https://example.test/portrait.webp'})}},crypto:{randomBytes:n=>crypto.randomBytes(n).toString('hex'),sha256:s=>crypto.createHash('sha256').update(s).digest('hex')},admin:{isAdmin:req=>req.get('x-test-admin')==='yes'},email:{send:async m=>{emails.push(m);return {success:true}}}};
 const app=express();app.set('views',path.join(root,'views'));app.set('view engine','ejs');app.engine('ejs',(f,data,cb)=>ejs.renderFile(f,data,{},(err,html)=>cb(err,html&&html.replace('<head>','<head><base href="'+(data._locals.base||'/')+'">'))));
 app.use(require('cookie-parser')());
 // Match Liasse's HTML send wrapper to verify cache policy survives it.
 app.use((req,res,next)=>{const send=res.send.bind(res);res.send=function(body){if(typeof body==='string'&&/<html/i.test(body))res.set('Cache-Control','no-cache');return send(body)};next()});
 for(const mount of ['/pwa/vendvite','']){
   const router=express.Router();router.use((req,res,next)=>{res.locals.base=mount+'/';req.tenantPath=p=>mount+p;req.tenantUrl=p=>'http://'+req.get('host')+mount+p;next();});
   router.use('/public',express.static(path.join(root,'public'))); router.use(require(path.join(root,'routes'))(services));app.use(mount||'/',router);
 }
 const server=await new Promise(resolve=>{const s=app.listen(port,'127.0.0.1',()=>resolve(s))});
 return {url:'http://127.0.0.1:'+server.address().port,pg,db,emails,services,server,close:async()=>{await new Promise(r=>server.close(r));await pg.close()}};
}
module.exports={create,root};
if(require.main===module)create(Number(process.env.PREVIEW_PORT)||4808).then(()=>console.log('Preview at http://127.0.0.1:4808/?vv_preview=visible'));
