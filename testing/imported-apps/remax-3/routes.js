module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function formatDate(d) { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-CA', { year:'numeric', month:'short', day:'numeric' }); } catch(e) { return ''; } }

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const out = {};
      for (const r of rows) out[r.key] = r.value;
      return out;
    } catch(e) { return {}; }
  }

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  router.get('/', async function(req, res) {
    try {
      const settings = await getSettings();
      const properties = await db.all("SELECT * FROM sold_properties ORDER BY featured DESC, sold_date DESC NULLS LAST, id DESC LIMIT 8");
      const testimonials = await db.all('SELECT * FROM testimonials WHERE featured = 1 ORDER BY id DESC LIMIT 6');
      const skills = await db.all('SELECT * FROM skills ORDER BY order_index ASC, id ASC');
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', { settings, properties, testimonials, skills, posts, formatDate, escapeHtml });
    } catch(e) {
      console.error('Home error:', e);
      res.render('index', { settings: {}, properties: [], testimonials: [], skills: [], posts: [], formatDate, escapeHtml });
    }
  });

  router.post('/api/leads', async function(req, res) {
    try {
      const { name, email, phone, message, interest } = req.body || {};
      if (!name || (!email && !phone)) return res.status(400).json({ error: 'Please provide your name and at least one way to reach you.' });
      const result = await db.run(
        'INSERT INTO leads (name, email, phone, message, interest, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [name, email || '', phone || '', message || '', interest || 'general', 'new']
      );
      try {
        if (services.config.contactEmail) {
          const html = '<h2>New Seller Lead</h2>' +
            '<p><strong>Name:</strong> ' + escapeHtml(name) + '</p>' +
            '<p><strong>Email:</strong> ' + escapeHtml(email||'-') + '</p>' +
            '<p><strong>Phone:</strong> ' + escapeHtml(phone||'-') + '</p>' +
            '<p><strong>Interest:</strong> ' + escapeHtml(interest||'-') + '</p>' +
            '<p><strong>Message:</strong><br>' + escapeHtml(message||'-').replace(/\n/g,'<br>') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'New lead from ' + name, html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch(emailErr) { console.error('Email send failed:', emailErr.message); }
      res.json({ success: true, id: result.lastInsertRowid });
    } catch(e) {
      console.error('Lead error:', e);
      res.status(500).json({ error: 'Submission failed. Please try again or call directly.' });
    }
  });

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const userCount = (await db.get('SELECT COUNT(*)::int AS c FROM users')).c || 0;
      const pushCount = (await db.get('SELECT COUNT(*)::int AS c FROM push_subscriptions')).c || 0;
      const totalVisits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c || 0;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c || 0;
      const leadCount = (await db.get('SELECT COUNT(*)::int AS c FROM leads')).c || 0;
      const newLeadCount = (await db.get("SELECT COUNT(*)::int AS c FROM leads WHERE status='new'")).c || 0;
      const propertyCount = (await db.get('SELECT COUNT(*)::int AS c FROM sold_properties')).c || 0;
      const testimonialCount = (await db.get('SELECT COUNT(*)::int AS c FROM testimonials')).c || 0;
      const skillCount = (await db.get('SELECT COUNT(*)::int AS c FROM skills')).c || 0;
      const postCount = (await db.get('SELECT COUNT(*)::int AS c FROM posts')).c || 0;
      const recentLeads = await db.all('SELECT id, name, email, phone, created_at, status, interest FROM leads ORDER BY created_at DESC LIMIT 8');
      res.render('admin', {
        adminPage: 'dashboard',
        stats: { userCount, pushCount, totalVisits, recentVisits, leadCount, newLeadCount, propertyCount, testimonialCount, skillCount, postCount },
        recentLeads,
        formatDate
      });
    } catch(e) {
      console.error('Admin dashboard error:', e);
      res.render('admin', { adminPage: 'dashboard', stats: {}, recentLeads: [], formatDate, error: 'Some data could not load.' });
    }
  });

  function adminModulePage(view, pageKey) {
    return async function(req, res) {
      if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
      res.render(view, { adminPage: pageKey });
    };
  }
  router.get('/admin/properties', adminModulePage('admin-properties', 'properties'));
  router.get('/admin/testimonials', adminModulePage('admin-testimonials', 'testimonials'));
  router.get('/admin/skills', adminModulePage('admin-skills', 'skills'));
  router.get('/admin/leads', adminModulePage('admin-leads', 'leads'));
  router.get('/admin/posts', adminModulePage('admin-posts', 'posts'));

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = (await db.get('SELECT COUNT(*)::int AS c FROM users')).c || 0;
      const pushSubscriberCount = (await db.get('SELECT COUNT(*)::int AS c FROM push_subscriptions')).c || 0;
      const totalVisits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c || 0;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c || 0;
      res.json({ userCount, pushSubscriberCount, totalVisits, recentVisits });
    } catch(e) { res.status(500).json({ error: 'Stats failed' }); }
  });

  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    try {
      const leads = await db.all('SELECT * FROM leads ORDER BY created_at DESC LIMIT 100');
      res.json({ submissions: leads });
    } catch(e) { res.status(500).json({ error: 'Failed' }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        {
          key: 'leads', label: 'Leads', icon: 'users',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 120, description: "Lead's full name as submitted via the contact form.", placeholder: 'e.g. Marie Tremblay' },
            { name: 'email', type: 'email', required: false, description: 'Email provided by the lead. Use this to follow up.', placeholder: 'name@example.com' },
            { name: 'phone', type: 'text', required: false, description: 'Phone number provided by the lead.', placeholder: '514-555-1234' },
            { name: 'interest', type: 'select', options: ['general','selling','buying','valuation'], default: 'general', description: 'What the lead is interested in.' },
            { name: 'message', type: 'textarea', required: false, description: 'Message left by the lead through the contact form.', placeholder: 'Their message...' },
            { name: 'status', type: 'select', options: ['new','contacted','qualified','closed','archived'], default: 'new', description: 'Track where this lead is in your pipeline.' }
          ]
        },
        {
          key: 'sold_properties', label: 'Recently Sold', icon: 'home',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 160, description: 'Property name or short address shown on the card.', placeholder: 'e.g. Charming Plateau Condo' },
            { name: 'neighborhood', type: 'text', required: false, maxLength: 80, description: 'Neighborhood / borough — shown under the title.', placeholder: 'e.g. Plateau-Mont-Royal' },
            { name: 'price', type: 'text', required: false, maxLength: 40, description: 'Sale price displayed as text (include currency symbol).', placeholder: 'e.g. $645,000' },
            { name: 'image_url', type: 'image', required: false, description: 'Photo of the sold property. Recommended: landscape 1200x800px.' },
            { name: 'link_url', type: 'url', required: false, description: 'Optional external link to the listing (Centris, Realtor, etc.).', placeholder: 'https://...' },
            { name: 'sold_date', type: 'date', required: false, description: 'When the property was sold — used for sorting.' },
            { name: 'bedrooms', type: 'number', required: false, min: 0, max: 20, step: 1, description: 'Number of bedrooms.', placeholder: 'e.g. 3' },
            { name: 'bathrooms', type: 'number', required: false, min: 0, max: 20, step: 1, description: 'Number of bathrooms.', placeholder: 'e.g. 2' },
            { name: 'featured', type: 'boolean', default: false, description: 'Featured properties appear first on the homepage.' }
          ]
        },
        {
          key: 'testimonials', label: 'Testimonials', icon: 'star',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 120, description: 'Name of the client giving the testimonial.', placeholder: 'e.g. Alex & Sophie' },
            { name: 'role', type: 'text', required: false, maxLength: 120, description: 'Optional role / context (e.g. "Sold a duplex in Rosemont").', placeholder: 'e.g. Sold in Rosemont' },
            { name: 'content', type: 'textarea', required: true, description: 'The testimonial quote.', placeholder: 'Joe was incredible from start to finish...' },
            { name: 'avatar_url', type: 'image', required: false, description: 'Optional avatar / photo of the client. Square 400x400px works best.' },
            { name: 'image_url', type: 'image', required: false, description: 'Alternative larger image (unused for now).' },
            { name: 'rating', type: 'number', required: false, min: 1, max: 5, step: 1, default: 5, description: 'Star rating 1-5.', placeholder: '5' },
            { name: 'featured', type: 'boolean', default: true, description: 'Uncheck to hide this testimonial from the homepage.' }
          ]
        },
        {
          key: 'skills', label: 'Skills & Specialties', icon: 'star',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 80, description: 'Name of the skill or specialty.', placeholder: 'e.g. Negotiation' },
            { name: 'description', type: 'textarea', required: false, description: 'Short description shown under the skill name.', placeholder: 'I negotiate firmly while keeping the deal warm...' },
            { name: 'icon', type: 'text', required: false, maxLength: 8, description: 'Emoji shown as the skill icon.', placeholder: 'e.g. 🏆' },
            { name: 'image_url', type: 'image', required: false, description: 'Optional image — emoji icon is used if left blank.' },
            { name: 'order_index', type: 'number', required: false, min: 0, max: 999, step: 1, default: 0, description: 'Lower numbers appear first.', placeholder: '0' }
          ]
        },
        {
          key: 'posts', label: 'Posts', icon: 'edit',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 200, description: 'The headline shown on the homepage and post detail.', placeholder: 'e.g. 3 Tips for Selling Fast in Montreal' },
            { name: 'content', type: 'textarea', required: false, description: 'Full post body. Keep paragraphs short for mobile.', placeholder: 'Write your post content here...' },
            { name: 'image_url', type: 'image', required: false, description: 'Featured image. Recommended: 1200x630px landscape.' },
            { name: 'category', type: 'text', required: false, maxLength: 50, description: 'Group posts by category (e.g. Tips, News).', placeholder: 'e.g. Tips' },
            { name: 'published', type: 'boolean', default: true, description: 'Uncheck to save as draft — hidden from visitors.' }
          ]
        }
      ],
      settingsFields: []
    });
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const out = {};
      for (const r of rows) out[r.key] = r.value;
      res.json({ settings: out });
    } catch(e) { res.status(500).json({ error: 'Failed' }); }
  });

  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'Key required' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value || '']);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Save failed' }); }
  });

  // --- leads CRUD ---
  router.get('/api/admin/leads', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM leads ORDER BY id DESC');
      res.json({ leads: rows });
    } catch(e) { console.error('leads list error:', e); res.status(500).json({ error: 'Failed' }); }
  });
  router.post('/api/admin/leads', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','email','phone','message','interest','status','image_url'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          cols.push(f);
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i);
          i++;
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'No fields provided' });
      const row = await db.get('INSERT INTO leads (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ item: row });
    } catch(e) { console.error('leads create error:', e); res.status(500).json({ error: 'Create failed: ' + e.message }); }
  });
  router.put('/api/admin/leads/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const allowed = ['name','email','phone','message','interest','status','image_url'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          sets.push(f + '=$' + i);
          i++;
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'No fields provided' });
      sets.push('updated_at=NOW()');
      vals.push(id);
      const row = await db.get('UPDATE leads SET ' + sets.join(',') + ' WHERE id=$' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json({ item: row });
    } catch(e) { console.error('leads update error:', e); res.status(500).json({ error: 'Update failed' }); }
  });
  router.delete('/api/admin/leads/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      await db.run('DELETE FROM leads WHERE id=$1', [id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Delete failed' }); }
  });

  // --- sold_properties CRUD ---
  router.get('/api/admin/sold_properties', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM sold_properties ORDER BY id DESC');
      res.json({ sold_properties: rows });
    } catch(e) { console.error('sold_properties list error:', e); res.status(500).json({ error: 'Failed' }); }
  });
  router.post('/api/admin/sold_properties', requireAdmin, async function(req, res) {
    try {
      const allowed = ['title','neighborhood','price','image_url','link_url','sold_date','bedrooms','bathrooms','featured'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          cols.push(f);
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i);
          i++;
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'No fields provided' });
      const row = await db.get('INSERT INTO sold_properties (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ item: row });
    } catch(e) { console.error('sold_properties create error:', e); res.status(500).json({ error: 'Create failed: ' + e.message }); }
  });
  router.put('/api/admin/sold_properties/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const allowed = ['title','neighborhood','price','image_url','link_url','sold_date','bedrooms','bathrooms','featured'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          sets.push(f + '=$' + i);
          i++;
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'No fields provided' });
      sets.push('updated_at=NOW()');
      vals.push(id);
      const row = await db.get('UPDATE sold_properties SET ' + sets.join(',') + ' WHERE id=$' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json({ item: row });
    } catch(e) { console.error('sold_properties update error:', e); res.status(500).json({ error: 'Update failed' }); }
  });
  router.delete('/api/admin/sold_properties/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      await db.run('DELETE FROM sold_properties WHERE id=$1', [id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Delete failed' }); }
  });

  // --- testimonials CRUD ---
  router.get('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM testimonials ORDER BY id DESC');
      res.json({ testimonials: rows });
    } catch(e) { console.error('testimonials list error:', e); res.status(500).json({ error: 'Failed' }); }
  });
  router.post('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','role','content','avatar_url','image_url','rating','featured'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          cols.push(f);
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i);
          i++;
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'No fields provided' });
      const row = await db.get('INSERT INTO testimonials (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ item: row });
    } catch(e) { console.error('testimonials create error:', e); res.status(500).json({ error: 'Create failed: ' + e.message }); }
  });
  router.put('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const allowed = ['name','role','content','avatar_url','image_url','rating','featured'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          sets.push(f + '=$' + i);
          i++;
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'No fields provided' });
      sets.push('updated_at=NOW()');
      vals.push(id);
      const row = await db.get('UPDATE testimonials SET ' + sets.join(',') + ' WHERE id=$' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json({ item: row });
    } catch(e) { console.error('testimonials update error:', e); res.status(500).json({ error: 'Update failed' }); }
  });
  router.delete('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      await db.run('DELETE FROM testimonials WHERE id=$1', [id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Delete failed' }); }
  });

  // --- skills CRUD ---
  router.get('/api/admin/skills', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM skills ORDER BY id DESC');
      res.json({ skills: rows });
    } catch(e) { console.error('skills list error:', e); res.status(500).json({ error: 'Failed' }); }
  });
  router.post('/api/admin/skills', requireAdmin, async function(req, res) {
    try {
      const allowed = ['name','description','icon','image_url','order_index'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          cols.push(f);
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i);
          i++;
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'No fields provided' });
      const row = await db.get('INSERT INTO skills (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ item: row });
    } catch(e) { console.error('skills create error:', e); res.status(500).json({ error: 'Create failed: ' + e.message }); }
  });
  router.put('/api/admin/skills/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const allowed = ['name','description','icon','image_url','order_index'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          sets.push(f + '=$' + i);
          i++;
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'No fields provided' });
      sets.push('updated_at=NOW()');
      vals.push(id);
      const row = await db.get('UPDATE skills SET ' + sets.join(',') + ' WHERE id=$' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json({ item: row });
    } catch(e) { console.error('skills update error:', e); res.status(500).json({ error: 'Update failed' }); }
  });
  router.delete('/api/admin/skills/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      await db.run('DELETE FROM skills WHERE id=$1', [id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Delete failed' }); }
  });

  // --- posts CRUD ---
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM posts ORDER BY id DESC');
      res.json({ posts: rows });
    } catch(e) { console.error('posts list error:', e); res.status(500).json({ error: 'Failed' }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const allowed = ['title','content','image_url','category','published'];
      const cols = [], vals = [], ph = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          cols.push(f);
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
          ph.push('$' + i);
          i++;
        }
      }
      if (!cols.length) return res.status(400).json({ error: 'No fields provided' });
      const row = await db.get('INSERT INTO posts (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
      res.json({ item: row });
    } catch(e) { console.error('posts create error:', e); res.status(500).json({ error: 'Create failed: ' + e.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const allowed = ['title','content','image_url','category','published'];
      const sets = [], vals = [];
      let i = 1;
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          sets.push(f + '=$' + i);
          i++;
          let v = req.body[f];
          if (v === '') v = null;
          if (typeof v === 'boolean') v = v ? 1 : 0;
          vals.push(v);
        }
      }
      if (!sets.length) return res.status(400).json({ error: 'No fields provided' });
      sets.push('updated_at=NOW()');
      vals.push(id);
      const row = await db.get('UPDATE posts SET ' + sets.join(',') + ' WHERE id=$' + i + ' RETURNING *', vals);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json({ item: row });
    } catch(e) { console.error('posts update error:', e); res.status(500).json({ error: 'Update failed' }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      await db.run('DELETE FROM posts WHERE id=$1', [id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Delete failed' }); }
  });

  router.use(function(req, res) {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.redirect('.');
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
