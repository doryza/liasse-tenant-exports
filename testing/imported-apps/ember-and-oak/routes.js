module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const MODULE_TABLES = {
    posts: { cols: ['title','content','image_url','category','published'] },
    roasts: { cols: ['name','origin','tasting_notes','roast_level','description','price','image_url','sort_order','published'] },
    story_moments: { cols: ['year','title','description','image_url','sort_order'] },
    hours: { cols: ['day','hours','sort_order'] },
    wholesale_enquiries: { cols: ['name','cafe','volume','email','message','status'] }
  };
  const ORDER = { posts: 'created_at DESC', roasts: 'sort_order ASC, id ASC', story_moments: 'sort_order ASC, id ASC', hours: 'sort_order ASC, id ASC', wholesale_enquiries: 'created_at DESC' };
  const NUMERIC = new Set(['published','roast_level','sort_order']);

  function coerce(col, val) {
    if (NUMERIC.has(col)) {
      if (val === '' || val == null) return col === 'published' ? 1 : (col === 'roast_level' ? 2 : 0);
      const n = parseInt(val, 10);
      return isNaN(n) ? (col === 'published' ? 1 : 0) : n;
    }
    return val == null ? '' : val;
  }

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const s = {};
      (rows || []).forEach(function(r){ s[r.key] = r.value; });
      return s;
    } catch (e) { return {}; }
  }

  (async function initConfigSettings() {
    try {
      const c = services.config || {};
      const pairs = [['contact_email', c.contactEmail], ['contact_phone', c.contactPhone]];
      for (const p of pairs) {
        if (p[1]) await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [p[0], p[1]]);
      }
    } catch (e) {}
  })();

  function requireAdminApi(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/admin') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch (e) {}
    }
    next();
  });

  router.get('/', async function(req, res) {
    try {
      const settings = await getSettings();
      const roasts = await db.all('SELECT * FROM roasts WHERE published = 1 ORDER BY sort_order ASC, id ASC');
      const story = await db.all('SELECT * FROM story_moments ORDER BY sort_order ASC, id ASC');
      const hours = await db.all('SELECT * FROM hours ORDER BY sort_order ASC, id ASC');
      res.render('index', { settings: settings, roasts: roasts || [], story: story || [], hours: hours || [] });
    } catch (err) {
      console.error('home error', err.message);
      res.status(500).send('We hit a snag loading the roastery. Please refresh.');
    }
  });

  router.post('/api/wholesale', async function(req, res) {
    try {
      const b = req.body || {};
      const name = (b.name || '').trim();
      const message = (b.message || '').trim();
      if (!name || !message) return res.status(400).json({ error: 'Please add your name and a short note.' });
      await db.run('INSERT INTO wholesale_enquiries (name, cafe, volume, email, message, status) VALUES ($1,$2,$3,$4,$5,$6)', [name, (b.cafe||'').trim(), (b.volume||'').trim(), (b.email||'').trim(), message, 'new']);
      try {
        if (services.config && services.config.contactEmail) {
          const html = '<h2>New wholesale enquiry</h2><p><strong>Name:</strong> ' + name + '</p><p><strong>Cafe/Business:</strong> ' + (b.cafe||'—') + '</p><p><strong>Weekly volume:</strong> ' + (b.volume||'—') + '</p><p><strong>Email:</strong> ' + (b.email||'—') + '</p><p><strong>Message:</strong><br>' + message + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'New wholesale enquiry — ' + name, html: html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (mailErr) { console.error('email fail', mailErr.message); }
      res.json({ success: true });
    } catch (err) {
      console.error('wholesale error', err.message);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      const tv = await db.get('SELECT COUNT(*)::int c FROM site_visits');
      const rv = await db.get("SELECT COUNT(*)::int c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const en = await db.get('SELECT COUNT(*)::int c FROM wholesale_enquiries');
      const ne = await db.get("SELECT COUNT(*)::int c FROM wholesale_enquiries WHERE status = 'new'");
      const ro = await db.get('SELECT COUNT(*)::int c FROM roasts');
      const recentEnquiries = await db.all('SELECT * FROM wholesale_enquiries ORDER BY id DESC LIMIT 5');
      const stats = { totalVisits: (tv&&tv.c)||0, recentVisits: (rv&&rv.c)||0, enquiries: (en&&en.c)||0, newEnquiries: (ne&&ne.c)||0, roasts: (ro&&ro.c)||0 };
      res.render('admin', { stats: stats, recentEnquiries: recentEnquiries || [], active: 'dashboard' });
    } catch (err) {
      console.error('admin dash error', err.message);
      res.status(500).send('Dashboard error.');
    }
  });

  function adminPage(path, view, locals) {
    router.get(path, function(req, res) {
      if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
      res.render(view, locals);
    });
  }
  adminPage('/admin/roasts', 'admin-roasts', { title: 'Signature roasts', moduleKey: 'roasts', moduleLabel: 'Roast', active: 'roasts' });
  adminPage('/admin/story_moments', 'admin-story_moments', { title: 'Story timeline', moduleKey: 'story_moments', moduleLabel: 'Moment', active: 'story_moments' });
  adminPage('/admin/hours', 'admin-hours', { title: 'Opening hours', moduleKey: 'hours', moduleLabel: 'Row', active: 'hours' });
  adminPage('/admin/posts', 'admin-posts', { title: 'Journal', moduleKey: 'posts', moduleLabel: 'Post', active: 'posts' });
  adminPage('/admin/enquiries', 'admin-enquiries', { title: 'Wholesale enquiries', active: 'enquiries' });

  router.get('/api/admin/stats', requireAdminApi, async function(req, res) {
    try {
      const tv = await db.get('SELECT COUNT(*)::int c FROM site_visits');
      const rv = await db.get("SELECT COUNT(*)::int c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      const en = await db.get('SELECT COUNT(*)::int c FROM wholesale_enquiries');
      res.json({ userCount: 0, pushSubscriberCount: 0, totalVisits: (tv&&tv.c)||0, recentVisits: (rv&&rv.c)||0, enquiries: (en&&en.c)||0 });
    } catch (e) { res.status(500).json({ error: 'stats failed' }); }
  });

  router.get('/api/admin/modules', requireAdminApi, function(req, res) {
    res.json({ modules: [
      { key: 'roasts', label: 'Roasts', icon: 'package', fields: [
        { name: 'name', type: 'text', required: true, maxLength: 80, description: 'The roast name shown as the headline of each row on the home page.', placeholder: 'e.g. Alleyway' },
        { name: 'origin', type: 'text', required: false, maxLength: 80, description: 'Where the beans come from — shown next to the name.', placeholder: 'e.g. Guji, Ethiopia' },
        { name: 'tasting_notes', type: 'text', required: false, description: 'Three tasting notes, comma-separated. Shown as underlined ember words.', placeholder: 'e.g. Blueberry, Jasmine, Cane sugar' },
        { name: 'roast_level', type: 'number', required: false, min: 1, max: 3, step: 1, description: 'Roast depth from 1 (light) to 3 (dark). Shown as inked flame marks.', placeholder: 'e.g. 2' },
        { name: 'description', type: 'textarea', required: false, description: 'A short, sensory note about this roast — batch size, drop temperature, who it is for.', placeholder: 'Washed Guji, dropped just past first crack at 198C...' },
        { name: 'price', type: 'text', required: false, maxLength: 40, description: 'Price and bag size, shown at the end of the row.', placeholder: 'e.g. $21 / 340g' },
        { name: 'image_url', type: 'image', required: false, aspectRatio: '4:3', description: 'Hand-drawn bean-to-cup vignette. Recommended 4:3, roughly 700x525px.' },
        { name: 'sort_order', type: 'number', required: false, min: 0, step: 1, description: 'Lower numbers appear first on the page.', placeholder: 'e.g. 1' },
        { name: 'published', type: 'boolean', default: 1, description: 'Uncheck to hide this roast from the home page without deleting it.' }
      ]},
      { key: 'story_moments', label: 'Story timeline', icon: 'calendar', fields: [
        { name: 'year', type: 'text', required: false, maxLength: 12, description: 'The year or date shown in ember on the timeline.', placeholder: 'e.g. 2016' },
        { name: 'title', type: 'text', required: true, maxLength: 80, description: 'The headline for this moment in the story.', placeholder: 'e.g. The first roast' },
        { name: 'description', type: 'textarea', required: false, description: 'One or two sentences describing the moment.', placeholder: 'A secondhand 5-kilo drum in an alley off Saint-Laurent...' },
        { name: 'image_url', type: 'image', required: false, aspectRatio: '4:3', description: 'Optional illustration for this moment.' },
        { name: 'sort_order', type: 'number', required: false, min: 0, step: 1, description: 'Lower numbers appear first on the timeline.', placeholder: 'e.g. 1' }
      ]},
      { key: 'hours', label: 'Opening hours', icon: 'list', fields: [
        { name: 'day', type: 'text', required: true, maxLength: 30, description: 'Day label shown on the left of the hours table.', placeholder: 'e.g. Monday' },
        { name: 'hours', type: 'text', required: false, maxLength: 40, description: 'Opening window shown on the right. Use Closed if shut.', placeholder: 'e.g. 7:00 - 17:00' },
        { name: 'sort_order', type: 'number', required: false, min: 0, step: 1, description: 'Lower numbers appear first. Keep days in week order.', placeholder: 'e.g. 1' }
      ]},
      { key: 'posts', label: 'Journal', icon: 'edit', fields: [
        { name: 'title', type: 'text', required: true, maxLength: 200, description: 'The headline of the journal entry.', placeholder: 'e.g. Lot 47 is on the drum' },
        { name: 'content', type: 'textarea', required: false, description: 'The body of the entry. Keep paragraphs short.', placeholder: 'Write the roaster note here...' },
        { name: 'image_url', type: 'image', required: false, aspectRatio: '16:9', description: 'Optional featured image. Recommended 16:9.' },
        { name: 'category', type: 'text', required: false, maxLength: 50, description: 'Group entries, e.g. This week, Roasting notes, Cupping.', placeholder: 'e.g. This week' },
        { name: 'published', type: 'boolean', default: 1, description: 'Uncheck to keep as a draft.' }
      ]},
      { key: 'wholesale_enquiries', label: 'Wholesale enquiries', icon: 'users', readOnly: true, canCreate: false, fields: [
        { name: 'name', type: 'text', description: 'Who reached out.' },
        { name: 'cafe', type: 'text', description: 'Their cafe or business.' },
        { name: 'volume', type: 'text', description: 'Estimated weekly volume.' },
        { name: 'email', type: 'text', description: 'Reply-to email.' },
        { name: 'message', type: 'textarea', description: 'What they wrote.' },
        { name: 'status', type: 'select', options: ['new','contacted','archived'], description: 'Track where each enquiry stands.' }
      ]}
    ]});
  });

  router.get('/api/admin/settings', requireAdminApi, async function(req, res) {
    res.json({ settings: await getSettings() });
  });
  router.put('/api/admin/settings', requireAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.key) return res.status(400).json({ error: 'Missing key' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [b.key, b.value || '']);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Could not save setting.' }); }
  });

  router.post('/api/admin/upload', requireAdminApi, async function(req, res) {
    try {
      const dataUri = (req.body || {}).dataUri;
      if (!dataUri) return res.status(400).json({ error: 'No image provided.' });
      if (!(services.cloudinary && services.cloudinary.uploader && typeof services.cloudinary.uploader.upload === 'function')) return res.status(503).json({ error: 'Image hosting is not configured yet.' });
      const result = await services.cloudinary.uploader.upload(dataUri, { folder: 'ember-and-oak/uploads' });
      res.json({ url: result.secure_url });
    } catch (e) { console.error('upload', e.message); res.status(500).json({ error: 'Upload failed.' }); }
  });

  router.post('/api/admin/generate-image', requireAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.prompt) return res.status(400).json({ error: 'Describe the image first.' });
      const imageUrl = await services.ai.generateImage(b.prompt + ' Hand-drawn charcoal line illustration with subtle ember-orange fills on warm cream paper, cozy artisanal woodcut feel, no text, no logos.', { aspectRatio: b.aspectRatio || '4:3' });
      res.json({ url: imageUrl });
    } catch (e) { console.error('genimg', e.message); res.status(500).json({ error: 'Image generation failed. Try uploading instead.' }); }
  });

  // Explicit CRUD routes for posts
  router.get('/api/admin/posts', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM posts ORDER BY ' + ORDER.posts);
      res.json({ posts: rows || [] });
    } catch (e) { console.error('list posts', e.message); res.status(500).json({ error: 'Could not load.' }); }
  });
  router.post('/api/admin/posts', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.posts;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to save.' });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      const ph = cols.map(function(c, i){ return '$' + (i + 1); }).join(',');
      const row = await db.get('INSERT INTO posts (' + cols.join(',') + ') VALUES (' + ph + ') RETURNING *', vals);
      res.json({ item: row });
    } catch (e) { console.error('create posts', e.message); res.status(500).json({ error: 'Could not save.' }); }
  });
  router.put('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.posts;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
      const sets = cols.map(function(c, i){ return c + '=$' + (i + 1); });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      vals.push(req.params.id);
      const row = await db.get('UPDATE posts SET ' + sets.join(',') + ', updated_at = NOW() WHERE id = $' + (cols.length + 1) + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found.' });
      res.json({ item: row });
    } catch (e) { console.error('update posts', e.message); res.status(500).json({ error: 'Could not update.' }); }
  });
  router.delete('/api/admin/posts/:id', requireAdminApi, async function(req, res) {
    try {
      await db.run('DELETE FROM posts WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Could not delete.' }); }
  });

  // Explicit CRUD routes for roasts
  router.get('/api/admin/roasts', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM roasts ORDER BY ' + ORDER.roasts);
      res.json({ roasts: rows || [] });
    } catch (e) { console.error('list roasts', e.message); res.status(500).json({ error: 'Could not load.' }); }
  });
  router.post('/api/admin/roasts', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.roasts;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to save.' });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      const ph = cols.map(function(c, i){ return '$' + (i + 1); }).join(',');
      const row = await db.get('INSERT INTO roasts (' + cols.join(',') + ') VALUES (' + ph + ') RETURNING *', vals);
      res.json({ item: row });
    } catch (e) { console.error('create roasts', e.message); res.status(500).json({ error: 'Could not save.' }); }
  });
  router.put('/api/admin/roasts/:id', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.roasts;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
      const sets = cols.map(function(c, i){ return c + '=$' + (i + 1); });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      vals.push(req.params.id);
      const row = await db.get('UPDATE roasts SET ' + sets.join(',') + ', updated_at = NOW() WHERE id = $' + (cols.length + 1) + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found.' });
      res.json({ item: row });
    } catch (e) { console.error('update roasts', e.message); res.status(500).json({ error: 'Could not update.' }); }
  });
  router.delete('/api/admin/roasts/:id', requireAdminApi, async function(req, res) {
    try {
      await db.run('DELETE FROM roasts WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Could not delete.' }); }
  });

  // Explicit CRUD routes for story_moments
  router.get('/api/admin/story_moments', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM story_moments ORDER BY ' + ORDER.story_moments);
      res.json({ story_moments: rows || [] });
    } catch (e) { console.error('list story_moments', e.message); res.status(500).json({ error: 'Could not load.' }); }
  });
  router.post('/api/admin/story_moments', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.story_moments;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to save.' });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      const ph = cols.map(function(c, i){ return '$' + (i + 1); }).join(',');
      const row = await db.get('INSERT INTO story_moments (' + cols.join(',') + ') VALUES (' + ph + ') RETURNING *', vals);
      res.json({ item: row });
    } catch (e) { console.error('create story_moments', e.message); res.status(500).json({ error: 'Could not save.' }); }
  });
  router.put('/api/admin/story_moments/:id', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.story_moments;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
      const sets = cols.map(function(c, i){ return c + '=$' + (i + 1); });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      vals.push(req.params.id);
      const row = await db.get('UPDATE story_moments SET ' + sets.join(',') + ', updated_at = NOW() WHERE id = $' + (cols.length + 1) + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found.' });
      res.json({ item: row });
    } catch (e) { console.error('update story_moments', e.message); res.status(500).json({ error: 'Could not update.' }); }
  });
  router.delete('/api/admin/story_moments/:id', requireAdminApi, async function(req, res) {
    try {
      await db.run('DELETE FROM story_moments WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Could not delete.' }); }
  });

  // Explicit CRUD routes for hours
  router.get('/api/admin/hours', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM hours ORDER BY ' + ORDER.hours);
      res.json({ hours: rows || [] });
    } catch (e) { console.error('list hours', e.message); res.status(500).json({ error: 'Could not load.' }); }
  });
  router.post('/api/admin/hours', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.hours;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to save.' });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      const ph = cols.map(function(c, i){ return '$' + (i + 1); }).join(',');
      const row = await db.get('INSERT INTO hours (' + cols.join(',') + ') VALUES (' + ph + ') RETURNING *', vals);
      res.json({ item: row });
    } catch (e) { console.error('create hours', e.message); res.status(500).json({ error: 'Could not save.' }); }
  });
  router.put('/api/admin/hours/:id', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.hours;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
      const sets = cols.map(function(c, i){ return c + '=$' + (i + 1); });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      vals.push(req.params.id);
      const row = await db.get('UPDATE hours SET ' + sets.join(',') + ', updated_at = NOW() WHERE id = $' + (cols.length + 1) + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found.' });
      res.json({ item: row });
    } catch (e) { console.error('update hours', e.message); res.status(500).json({ error: 'Could not update.' }); }
  });
  router.delete('/api/admin/hours/:id', requireAdminApi, async function(req, res) {
    try {
      await db.run('DELETE FROM hours WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Could not delete.' }); }
  });

  // Explicit CRUD routes for wholesale_enquiries
  router.get('/api/admin/wholesale_enquiries', requireAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM wholesale_enquiries ORDER BY ' + ORDER.wholesale_enquiries);
      res.json({ wholesale_enquiries: rows || [] });
    } catch (e) { console.error('list wholesale_enquiries', e.message); res.status(500).json({ error: 'Could not load.' }); }
  });
  router.post('/api/admin/wholesale_enquiries', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.wholesale_enquiries;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to save.' });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      const ph = cols.map(function(c, i){ return '$' + (i + 1); }).join(',');
      const row = await db.get('INSERT INTO wholesale_enquiries (' + cols.join(',') + ') VALUES (' + ph + ') RETURNING *', vals);
      res.json({ item: row });
    } catch (e) { console.error('create wholesale_enquiries', e.message); res.status(500).json({ error: 'Could not save.' }); }
  });
  router.put('/api/admin/wholesale_enquiries/:id', requireAdminApi, async function(req, res) {
    const cfg = MODULE_TABLES.wholesale_enquiries;
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
      const sets = cols.map(function(c, i){ return c + '=$' + (i + 1); });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      vals.push(req.params.id);
      const row = await db.get('UPDATE wholesale_enquiries SET ' + sets.join(',') + ', updated_at = NOW() WHERE id = $' + (cols.length + 1) + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found.' });
      res.json({ item: row });
    } catch (e) { console.error('update wholesale_enquiries', e.message); res.status(500).json({ error: 'Could not update.' }); }
  });
  router.delete('/api/admin/wholesale_enquiries/:id', requireAdminApi, async function(req, res) {
    try {
      await db.run('DELETE FROM wholesale_enquiries WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Could not delete.' }); }
  });

  // Generic parametric fallback for any other module
  router.get('/api/admin/:module', requireAdminApi, async function(req, res) {
    const m = req.params.module;
    if (!MODULE_TABLES[m]) return res.status(404).json({ error: 'Unknown section' });
    try {
      const rows = await db.all('SELECT * FROM ' + m + ' ORDER BY ' + ORDER[m]);
      res.json({ [m]: rows || [] });
    } catch (e) { console.error('list', m, e.message); res.status(500).json({ error: 'Could not load.' }); }
  });

  router.post('/api/admin/:module', requireAdminApi, async function(req, res) {
    const m = req.params.module, cfg = MODULE_TABLES[m];
    if (!cfg) return res.status(404).json({ error: 'Unknown section' });
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to save.' });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      const ph = cols.map(function(c, i){ return '$' + (i + 1); }).join(',');
      const row = await db.get('INSERT INTO ' + m + ' (' + cols.join(',') + ') VALUES (' + ph + ') RETURNING *', vals);
      res.json({ item: row });
    } catch (e) { console.error('create', m, e.message); res.status(500).json({ error: 'Could not save.' }); }
  });

  router.put('/api/admin/:module/:id', requireAdminApi, async function(req, res) {
    const m = req.params.module, cfg = MODULE_TABLES[m];
    if (!cfg) return res.status(404).json({ error: 'Unknown section' });
    try {
      const b = req.body || {};
      const cols = cfg.cols.filter(function(c){ return b[c] !== undefined; });
      if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
      const sets = cols.map(function(c, i){ return c + '=$' + (i + 1); });
      const vals = cols.map(function(c){ return coerce(c, b[c]); });
      vals.push(req.params.id);
      const row = await db.get('UPDATE ' + m + ' SET ' + sets.join(',') + ', updated_at = NOW() WHERE id = $' + (cols.length + 1) + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found.' });
      res.json({ item: row });
    } catch (e) { console.error('update', m, e.message); res.status(500).json({ error: 'Could not update.' }); }
  });

  router.delete('/api/admin/:module/:id', requireAdminApi, async function(req, res) {
    const m = req.params.module;
    if (!MODULE_TABLES[m]) return res.status(404).json({ error: 'Unknown section' });
    try {
      await db.run('DELETE FROM ' + m + ' WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Could not delete.' }); }
  });

  router.get('*', function(req, res, next) {
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (req.path === '/admin' || req.path.startsWith('/admin/')) {
      return next();
    }
    res.redirect('./');
  });

  return router;
};
