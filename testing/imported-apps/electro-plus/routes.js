const translations = require('./lib/i18n');
const site = require('./lib/site');
const content = require('./lib/content');
const catalog = require('./lib/catalog');
module.exports = function(services) {
const express = require('express');
const router = express.Router();
const db = services.db;
let configured;
router.use(express.json({limit:'8mb'}));
router.use(async function(req,res,next) {
const requested = req.query.lang;
const lang = ['fr','en'].includes(requested) ? requested : ((req.cookies && req.cookies.pwa_lang === 'en') ? 'en' : 'fr');
try {
if (['fr','en'].includes(requested)) res.cookie('pwa_lang',lang,{path:req.tenantPath('/'),maxAge:31536000000,sameSite:'lax',secure:true,httpOnly:true});
Object.assign(res.locals,site.locals(req,services,{},lang,translations));
if (!configured) configured = site.seedConfig(db,services.config || {}).catch(function(e){configured=null;throw e;});
await configured;
Object.assign(res.locals,site.locals(req,services,await site.getSettings(db),lang,translations));
next();
} catch(e) { next(e); }
});
router.use(async function(req,res,next) {
if (req.method === 'GET' && ['/','/liquidations','/nous-trouver'].includes(req.path)) {
try { await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); } catch(e) {}
}
next();
});
function run(handler) { return async function(req,res,next) { try { await handler(req,res); } catch(e) { next(e); } }; }
function requireAdmin(req,res,next) {
if (!services.admin.isAdmin(req)) return req.path.startsWith('/api/') ? res.status(403).json({error:res.locals.t.forbidden}) : res.redirect(req.tenantPath('/admin/login'));
res.locals.adminMode = true;
res.set('Cache-Control','private, no-store');
next();
}
router.use('/api/admin',function(req,res,next) {
if (!services.admin.isAdmin(req)) return res.status(403).json({error:res.locals.t.forbidden});
res.set('Cache-Control','private, no-store');
if (['POST','PUT','DELETE'].includes(req.method)) {
const origin = req.get('origin');
try { if (origin && new URL(origin).origin !== req.tenantOrigin) return res.status(403).json({error:res.locals.t.forbidden}); } catch(e) { return res.status(403).json({error:res.locals.t.forbidden}); }
if (req.method !== 'DELETE' && !req.is('application/json')) return res.status(415).json({error:res.locals.t.jsonRequired});
if (req.method !== 'DELETE' && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) return res.status(400).json({error:res.locals.t.invalidRecord});
}
next();
});
router.get('/',services.auth.optionalAuth,run(async function(req,res) {
res.render('index',Object.assign(await catalog.read(db,req.query),{user:req.user || null,pageTitle:res.locals.s('hero_title'),pagePath:'.'}));
}));
router.get('/liquidations',services.auth.optionalAuth,run(async function(req,res) {
res.render('liquidations',Object.assign(await catalog.read(db,req.query),{user:req.user || null,pageTitle:res.locals.t.navClearance,pagePath:'liquidations'}));
}));
router.get('/nous-trouver',services.auth.optionalAuth,run(async function(req,res) {
res.render('nous-trouver',{user:req.user || null,pageTitle:res.locals.t.navFind,pagePath:'nous-trouver'});
}));
router.get('/admin',services.auth.optionalAuth,requireAdmin,run(async function(req,res) {
const stats = await content.stats(services);
const recent = await db.all('SELECT id,title,title_en,is_example,verified,published,updated_at FROM products ORDER BY updated_at DESC,id DESC LIMIT 5');
res.render('admin',{adminMode:true,user:req.user || null,adminUser:(services.config || {}).ownerName || '',stats,recent,modules:content.modules(res.locals.t),pageTitle:res.locals.t.dashboard});
}));
for (const moduleKey of ['products','posts']) {
router.get('/admin/'+moduleKey,services.auth.optionalAuth,requireAdmin,run(async function(req,res) {
const moduleDef = content.modules(res.locals.t).find(function(m){return m.key===moduleKey;});
res.render('admin-'+moduleKey,{items:await content.list(db,moduleKey),user:req.user || null,moduleDef,modules:content.modules(res.locals.t),pageTitle:moduleDef.label});
}));
}
router.get('/admin/settings',services.auth.optionalAuth,requireAdmin,run(async function(req,res) {
res.render('admin-settings',{user:req.user || null,modules:content.modules(res.locals.t),settingFields:site.settingFields(res.locals.t),pageTitle:res.locals.t.settingsTitle});
}));
router.get('/api/admin/modules',run(async function(req,res) { res.json(content.modules(res.locals.t)); }));
router.get('/api/admin/stats',run(async function(req,res) { res.json(await content.stats(services)); }));
router.get('/api/admin/submissions',run(async function(req,res) { res.json({submissions:[]}); }));
router.get('/api/admin/settings',run(async function(req,res) { res.json({settings:await site.getSettings(db)}); }));
const saveSettings = run(async function(req,res) {
const values = req.body.values || (req.body.key ? {[req.body.key]:req.body.value} : req.body);
await site.saveSettings(db,values,res.locals.t);
res.json({settings:await site.getSettings(db)});
});
router.put('/api/admin/settings',saveSettings);
router.post('/api/admin/settings',saveSettings);
for (const moduleKey of ['products','posts']) {
router.get('/api/admin/'+moduleKey,run(async function(req,res) { res.json({[moduleKey]:await content.list(db,moduleKey)}); }));
router.post('/api/admin/'+moduleKey,run(async function(req,res) {
res.status(201).json({[moduleKey === 'products' ? 'product' : 'post']:await content.save(db,moduleKey,null,req.body,res.locals.t)});
}));
router.put('/api/admin/'+moduleKey+'/:id',run(async function(req,res) {
res.json({[moduleKey === 'products' ? 'product' : 'post']:await content.save(db,moduleKey,req.params.id,req.body,res.locals.t)});
}));
router.delete('/api/admin/'+moduleKey+'/:id',run(async function(req,res) {
if (!content.validId(req.params.id)) return res.status(400).json({error:res.locals.t.invalidRecord});
const result = await db.run('DELETE FROM '+moduleKey+' WHERE id=$1',[req.params.id]);
if (!result.changes) return res.status(404).json({error:res.locals.t.notFound});
res.json({success:true});
}));
}
router.post('/api/admin/upload-image',run(async function(req,res) {
if (!services.cloudinary || !services.cloudinary.uploader || typeof services.cloudinary.uploader.upload !== 'function') return res.status(503).json({error:res.locals.t.uploadUnavailable});
const data = req.body.data;
if (typeof data !== 'string' || data.length > 5600000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data)) return res.status(400).json({error:res.locals.t.badImage});
try {
const result = await services.cloudinary.uploader.upload(data,{folder:((services.config || {}).slug || 'electro-plus')+'/content',resource_type:'image'});
res.json({imageUrl:result.secure_url});
} catch(e) { res.status(502).json({error:res.locals.t.uploadFailed}); }
}));
router.post('/api/admin/generate-image',run(async function(req,res) {
const prompt = typeof req.body.prompt === 'string' ? req.body.prompt.trim() : '';
const ratios = ['1:1','9:16','16:9','3:4','4:3','3:2','2:3','5:4','4:5','21:9'];
if (prompt.length < 10 || prompt.length > 1600) return res.status(400).json({error:res.locals.t.promptLength});
try {
const imageUrl = await services.ai.generateImage(prompt+' No text overlays, no logos, no people. Clear diffuse daylight, straight-on documentary composition, true-to-material white and brushed steel, restrained sky-blue surroundings and crisp cobalt accents, neutral color grading.',{aspectRatio:ratios.includes(req.body.aspectRatio) ? req.body.aspectRatio : '4:3'});
res.json({imageUrl});
} catch(e) { res.status(502).json({error:res.locals.t.generationFailed}); }
}));
router.use(function(req,res) {
if (req.path.startsWith('/api/')) return res.status(404).json({error:res.locals.t.notFound});
res.redirect(req.tenantPath('/'));
});
router.use(function(err,req,res,next) {
if (res.headersSent) return next(err);
const t=res.locals.t || translations.fr;
const status = Number(err.status) >= 400 && Number(err.status) <= 599 ? Number(err.status) : 500;
const message = status < 500 && err.type !== 'entity.parse.failed' ? err.message : t.requestFailed;
if (req.path.startsWith('/api/')) return res.status(status).json({error:message});
res.status(status).render('error',{t,pageTitle:t.errorTitle,errorMessage:message,adminMode:false});
});

// Auto-injected admin page routes for orphaned views
router.get('/admin/posts', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
  res.render('admin-posts', { items: items });
});
router.get('/admin/products', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM products ORDER BY created_at DESC');
  res.render('admin-products', { items: items });
});
  // Catch-all: redirect unknown GET routes to PWA home (prevents "Cannot GET" errors)
  // Only matches GET requests — POST/PUT/DELETE API endpoints are unaffected
  router.get('*', (req, res, next) => {
    // Don't redirect API calls — return 404 JSON instead
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Let admin paths fall through to the platform's admin fallback handler
    if (req.path === '/admin' || req.path.startsWith('/admin/')) {
      return next();
    }
    res.redirect('./');
  });


return router;
};