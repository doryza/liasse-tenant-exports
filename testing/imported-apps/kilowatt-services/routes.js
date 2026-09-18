const translations = require('./lib/i18n');
const getModules = require('./lib/modules');
const requests = require('./lib/requests');
const content = require('./lib/content');
module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;
  const paths = { home:{fr:'generatrice',en:'en/generators'},services:{fr:'services',en:'en/services'},quote:{fr:'soumission',en:'en/request-a-quote'},appointment:{fr:'rendez-vous',en:'en/book-an-appointment'},contact:{fr:'contact',en:'en/contact'},account:{fr:'mes-demandes',en:'en/my-requests'},privacy:{fr:'confidentialite',en:'en/privacy'} };
  const wrap = fn => async function(req,res,next) {
    try { await fn(req,res,next); }
    catch(e) {
      const message = res.locals.t ? res.locals.t.serverError : 'Service temporairement indisponible. Réessayez.';
      if (req.path.startsWith('/api/')) return res.status(500).json({error:message});
      if (res.locals.t) return res.status(500).render('error',{errorMessage:message});
      res.status(503).send('Service temporairement indisponible. Réessayez.');
    }
  };
  function requireAdmin(req,res,next) {
    if (!services.admin.isAdmin(req)) {
      if (req.path.startsWith('/api/')) return res.status(403).json({error:res.locals.t.forbidden});
      return res.redirect(req.tenantPath('/admin/login'));
    }
    next();
  }
  router.use(express.json({limit:'6mb'}));
  router.use(express.urlencoded({extended:false,limit:'32kb'}));
  router.use(function(req,res,next) {
    if (['POST','PUT','PATCH','DELETE'].includes(req.method) && req.get('origin')) {
      try {
        if (new URL(req.get('origin')).host !== req.get('host')) return res.status(403).json({error:'Origine non autorisée / Origin not allowed'});
      } catch(e) { return res.status(403).json({error:'Origine non autorisée / Origin not allowed'}); }
    }
    next();
  });
  router.use(wrap(async function(req,res,next) {
    const found = Object.keys(paths).find(key => Object.values(paths[key]).includes(req.path.slice(1)));
    const explicit = ['fr','en'].includes(req.query.lang) ? req.query.lang : null;
    const cookie = req.cookies && ['fr','en'].includes(req.cookies.pwa_lang) ? req.cookies.pwa_lang : 'fr';
    const lang = explicit || (req.path.startsWith('/en/') ? 'en' : cookie);
    req.lang = lang;
    res.cookie('pwa_lang',lang,{maxAge:31536000000,path:req.baseUrl || '/pwa/kilowatt-services',sameSite:'lax',secure:true});
    if (found && req.path.slice(1) !== paths[found][lang]) {
      const query = new URLSearchParams();
      Object.entries(req.query).forEach(([k,v]) => { if (k !== 'lang' && typeof v === 'string') query.set(k,v); });
      return res.redirect(302,req.tenantPath('/' + paths[found][lang]) + (query.size ? '?' + query.toString() : ''));
    }
    const settings = await content.settings(db);
    const t = Object.assign({},translations[lang]);
    Object.keys(settings).forEach(key => {
      if (key.startsWith('text_') && key.endsWith('_' + lang)) {
        const name = key.slice(5,-(lang.length + 1)).replace(/^t:/,'');
        if (name) t[name] = settings[key];
      }
    });
    const link = key => paths[key][lang];
    const fieldName = (row,key) => lang === 'en' && row[key + '_en'] ? key + '_en' : key;
    const field = (row,key) => row[fieldName(row,key)] || '';
    const switchLink = target => {
      const query = new URLSearchParams();
      Object.entries(req.query).forEach(([k,v]) => { if (typeof v === 'string' && k !== 'lang') query.set(k,v); });
      query.set('lang',target);
      const path = found ? paths[found][target] : req.path.slice(1);
      return path + '?' + query.toString();
    };
    Object.assign(res.locals,{settings,t,lang,paths,link,field,fieldName,tenantBase:req.tenantPath('/').replace(/\/?$/, '/'),page:found || 'home',switchFr:switchLink('fr'),switchEn:switchLink('en'),isAdminPage:req.path.startsWith('/admin'),user:null,adminUser:null,items:[],errorMessage:'',title:t[found + 'Title'] || t.homeTitle,description:t.metaDescription});
    next();
  }));
  router.use(wrap(async function(req,res,next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); } catch(e) {}
    }
    next();
  }));
  router.get('/',function(req,res) { res.redirect(301,req.tenantPath('/generatrice')); });
  function pageRoutes(key,handler) {
    Object.values(paths[key]).forEach(path => router.get('/' + path,services.auth.optionalAuth,wrap(async function(req,res) {
      res.locals.user = req.user || null;
      await handler(req,res);
    })));
  }
  pageRoutes('home',async function(req,res) {
    const steps = await db.all('SELECT * FROM steps WHERE published = 1 ORDER BY position,id');
    const faqs = await db.all('SELECT * FROM faqs WHERE published = 1 ORDER BY position,id');
    res.render('index',{steps,faqs});
  });
  pageRoutes('services',async function(req,res) {
    const items = await db.all('SELECT * FROM services WHERE published = 1 ORDER BY position,id');
    res.render('services',{items});
  });
  pageRoutes('quote',async function(req,res) {
    res.render('request',{kind:'quote',requestKey:services.crypto.randomUUID(),reason:'quote',today:requests.today()});
  });
  pageRoutes('appointment',async function(req,res) {
    const reason = requests.reasons.includes(req.query.motif) ? req.query.motif : 'maintenance';
    res.render('request',{kind:'appointment',requestKey:services.crypto.randomUUID(),reason,today:requests.today()});
  });
  pageRoutes('contact',async function(req,res) { res.render('contact'); });
  pageRoutes('privacy',async function(req,res) { res.render('privacy'); });
  pageRoutes('account',async function(req,res) {
    res.set('Cache-Control','private, no-store');
    res.render('account');
  });
  const limits = new Map();
  function limit(req,res,next) {
    const key = String(req.user ? req.user.id : req.ip);
    const now = Date.now();
    const previous = limits.get(key);
    const state = previous && previous.until > now ? previous : {count:0,until:now + 600000};
    state.count += 1;
    limits.set(key,state);
    if (limits.size > 2000) for (const [k,v] of limits) if (v.until <= now) limits.delete(k);
    if (state.count > 8) return res.status(429).json({error:res.locals.t.rateLimit});
    next();
  }
  router.post('/api/quotes',services.auth.optionalAuth,limit,wrap(async function(req,res) {
    await requests.create(services,req,res,'quote');
  }));
  router.post('/api/appointments',services.auth.requireAuth,limit,wrap(async function(req,res) {
    await requests.create(services,req,res,'appointment');
  }));
  router.get('/api/my-requests',services.auth.requireAuth,wrap(async function(req,res) {
    res.set('Cache-Control','private, no-store');
    const page = Math.max(1,parseInt(req.query.page,10) || 1);
    const userId = String(req.user.id);
    const count = await db.get('SELECT COUNT(*)::int AS count FROM requests WHERE user_id = $1',[userId]);
    const rows = await db.all('SELECT id,reference,kind,reason,requested_date,preferred_period,status,created_at FROM requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10 OFFSET $2',[userId,(page - 1) * 10]);
    res.json({requests:rows,total:count.count,page});
  }));
  router.patch('/api/requests/:id/cancel',services.auth.requireAuth,wrap(async function(req,res) {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({error:res.locals.t.invalidRequest});
    const row = await db.get("UPDATE requests SET status = 'canceled',updated_at = NOW() WHERE id = $1 AND user_id = $2 AND status IN ('received','reviewing','contacted') RETURNING id",[req.params.id,String(req.user.id)]);
    if (!row) return res.status(409).json({error:res.locals.t.cannotCancel});
    res.json({success:true});
  }));
  function privateAdminResponse(req,res,next) {
    res.set('Cache-Control','private, no-store');
    next();
  }
  router.use('/admin',services.auth.optionalAuth,requireAdmin,privateAdminResponse);
  router.use('/api/admin',requireAdmin,privateAdminResponse);
  async function stats() {
    const visits = await db.get("SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS recent FROM site_visits");
    const counts = {};
    for (const module of getModules('fr',translations.fr)) {
      const row = await db.get('SELECT COUNT(*)::int AS count FROM ' + module.key);
      counts[module.key] = row.count;
    }
    let userCount = 0;
    let pushSubscriberCount = 0;
    try { userCount = await services.auth.getUserCount(); } catch(e) {}
    try { pushSubscriberCount = await services.push.getSubscriptionCount(); } catch(e) {}
    return {userCount,pushSubscriberCount,totalVisits:visits.total,recentVisits:visits.recent,counts};
  }
  router.get('/admin',wrap(async function(req,res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath('/admin/login'));
    const recent = await db.all('SELECT * FROM requests ORDER BY created_at DESC LIMIT 5');
    res.render('admin',{stats:await stats(),recent,modules:getModules(req.lang,res.locals.t),adminUser:{name:services.config.ownerName || res.locals.t.owner},mailReady:Boolean(services.config.contactEmail) && res.locals.settings.mail_delivery_enabled === 'true'});
  }));
  router.get('/admin/settings',wrap(async function(req,res) {
    res.render('admin-settings',{adminUser:{name:services.config.ownerName || res.locals.t.owner},modules:getModules(req.lang,res.locals.t),mailConfigured:Boolean(services.config.contactEmail)});
  }));
  router.get('/api/admin/stats',wrap(async function(req,res) { res.json(await stats()); }));
  router.get('/api/admin/submissions',wrap(async function(req,res) {
    res.json({submissions:await db.all('SELECT * FROM requests ORDER BY created_at DESC')});
  }));
  router.get('/api/admin/modules',function(req,res) {
    res.json({modules:getModules(req.lang,res.locals.t),settingsFields:[{name:'mail_delivery_enabled',type:'boolean',label:res.locals.t.mailEnable,description:res.locals.t.mailHelp,default:false}]});
  });
  router.get('/api/admin/settings',wrap(async function(req,res) { res.json(await content.settings(db)); }));
  router.put('/api/admin/settings',wrap(async function(req,res) {
    const error = content.validateSetting(req.body,res.locals.t);
    if (error) return res.status(400).json({error});
    await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value,updated_at = NOW()',[req.body.key,String(req.body.value)]);
    res.json({success:true});
  }));
  router.post('/api/admin/requests/:id/notify',wrap(async function(req,res) {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({error:res.locals.t.invalidRequest});
    const row = await db.get('SELECT * FROM requests WHERE id = $1',[req.params.id]);
    if (!row) return res.status(404).json({error:res.locals.t.notFound});
    if (row.email_status === 'sent') return res.status(409).json({error:res.locals.t.alreadySent});
    const state = await requests.notify(services,row,res.locals.settings,req);
    res.json({email_status:state});
  }));
  for (const definition of getModules('fr',translations.fr)) {
    const key = definition.key;
    router.get('/admin/' + key,wrap(async function(req,res) {
      const modules = getModules(req.lang,res.locals.t);
      const module = modules.find(item => item.key === key);
      const items = await db.all('SELECT * FROM ' + key + ' ORDER BY id DESC');
      res.render('admin-' + key,{items,module,modules,title:module.label,adminUser:{name:services.config.ownerName || res.locals.t.owner}});
    }));
    router.get('/api/admin/' + key,wrap(async function(req,res) {
      res.json({[key]:await db.all('SELECT * FROM ' + key + ' ORDER BY id DESC')});
    }));
    router.post('/api/admin/' + key,wrap(async function(req,res) {
      const module = getModules(req.lang,res.locals.t).find(item => item.key === key);
      const result = content.validate(module,req.body,res.locals.t);
      if (result.error) return res.status(400).json({error:result.error});
      if (key === 'requests') {
        result.data.reference = services.crypto.randomUUID().slice(0,8).toUpperCase();
        result.data.request_key = services.crypto.randomUUID();
        result.data.user_id = result.data.user_id || null;
        result.data.email_status = 'pending';
      }
      const names = Object.keys(result.data);
      const row = await db.get('INSERT INTO ' + key + ' (' + names.join(',') + ') VALUES (' + names.map((n,i) => '$' + (i + 1)).join(',') + ') RETURNING *',Object.values(result.data));
      res.status(201).json({[definition.singular]:row});
    }));
    router.put('/api/admin/' + key + '/:id',wrap(async function(req,res) {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({error:res.locals.t.invalidRequest});
      if (!/^\d+$/.test(req.params.id)) return res.status(400).json({error:res.locals.t.invalidRequest});
      const old = await db.get('SELECT * FROM ' + key + ' WHERE id = $1',[req.params.id]);
      if (!old) return res.status(404).json({error:res.locals.t.notFound});
      const module = getModules(req.lang,res.locals.t).find(item => item.key === key);
      const result = content.validate(module,Object.assign({},old,req.body),res.locals.t);
      if (result.error) return res.status(400).json({error:result.error});
      const names = Object.keys(result.data);
      const values = Object.values(result.data);
      values.push(req.params.id);
      const row = await db.get('UPDATE ' + key + ' SET ' + names.map((name,i) => name + ' = $' + (i + 1)).join(',') + ',updated_at = NOW() WHERE id = $' + values.length + ' RETURNING *',values);
      res.json({[definition.singular]:row});
    }));
    router.delete('/api/admin/' + key + '/:id',wrap(async function(req,res) {
      if (!/^\d+$/.test(req.params.id)) return res.status(400).json({error:res.locals.t.invalidRequest});
      const deleted = await db.get('DELETE FROM ' + key + ' WHERE id = $1 RETURNING id',[req.params.id]);
      if (!deleted) return res.status(404).json({error:res.locals.t.notFound});
      res.json({success:true});
    }));
  }
  router.post('/api/admin/upload',wrap(async function(req,res) {
    const image = req.body.image;
    if (typeof image !== 'string' || image.length > 5600000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) return res.status(400).json({error:res.locals.t.imageInvalid});
    if (!services.cloudinary || !services.cloudinary.uploader || typeof services.cloudinary.uploader.upload !== 'function') return res.status(503).json({error:res.locals.t.uploadUnavailable});
    try {
      const result = await services.cloudinary.uploader.upload(image,{folder:services.config.slug + '/content',resource_type:'image',timeout:20000});
      res.json({imageUrl:result.secure_url});
    } catch(e) { res.status(502).json({error:res.locals.t.uploadFailed}); }
  }));
  let imageRequestedAt = 0;
  router.post('/api/admin/generate-image',wrap(async function(req,res) {
    const prompt = typeof req.body.prompt === 'string' ? req.body.prompt.trim() : '';
    if (prompt.length < 15 || prompt.length > 1500) return res.status(400).json({error:res.locals.t.promptInvalid});
    if (Date.now() - imageRequestedAt < 30000) return res.status(429).json({error:res.locals.t.rateLimit});
    imageRequestedAt = Date.now();
    try {
      const imageUrl = await services.ai.generateImage(prompt + '. Clearly illustrative, not a documentary depiction of Kilowatt Services, no text overlays, no logos, no people. Restrained monochrome architectural illustration, charcoal ground, white linework, soft graphite shading.',{aspectRatio:'4:3'});
      res.json({imageUrl});
    } catch(e) { res.status(502).json({error:res.locals.t.generateFailed}); }
  }));
  router.use('/api',function(req,res) { res.status(404).json({error:res.locals.t.notFound}); });
  router.use(function(req,res,next) {
    if (req.path === '/admin' || req.path.startsWith('/admin/')) return next();
    res.redirect(req.tenantPath('/generatrice'));
  });
  
// Auto-injected admin page routes for orphaned views
router.get('/admin/faqs', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM faqs ORDER BY created_at DESC');
  res.render('admin-faqs', { items: items });
});
router.get('/admin/posts', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
  res.render('admin-posts', { items: items });
});
router.get('/admin/steps', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM steps ORDER BY created_at DESC');
  res.render('admin-steps', { items: items });
});
router.get('/admin/requests', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM requests ORDER BY created_at DESC');
  res.render('admin-requests', { items: items });
});
router.get('/admin/services', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM services ORDER BY created_at DESC');
  res.render('admin-services', { items: items });
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