module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  function formatDate(d) {
    try { return new Date(d).toLocaleDateString('fr-CA', { year:'numeric', month:'long', day:'numeric' }); }
    catch(e) { return ''; }
  }
  function truncate(s, n) {
    if (!s) return '';
    s = String(s);
    return s.length > n ? s.slice(0, n) + '…' : s;
  }
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const o = {};
      for (const r of rows) o[r.key] = r.value;
      return o;
    } catch(e) { return {}; }
  }

  function baseRender(req, res, view, data) {
    return getSettings().then(function(settings) {
      res.render(view, Object.assign({
        settings: settings,
        user: req.user || null,
        config: services.config,
        formatDate: formatDate,
        truncate: truncate,
        escapeHtml: escapeHtml,
        currentPath: req.path
      }, data || {}));
    }).catch(function(err) {
      console.error('Render error:', err);
      res.status(500).send('Erreur du serveur');
    });
  }

  router.use(function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]).catch(function(){});
    }
    next();
  });

  router.get('/', services.auth.optionalAuth, async function(req, res) {
    try {
      const featuredServices = await db.all("SELECT * FROM services WHERE published = 1 AND featured = 1 ORDER BY sort_order ASC, id ASC LIMIT 6");
      const testimonials = await db.all("SELECT * FROM testimonials WHERE published = 1 ORDER BY id DESC LIMIT 4");
      const recentPosts = await db.all("SELECT id, title, content, image_url, category, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3");
      baseRender(req, res, 'index', { featuredServices: featuredServices, testimonials: testimonials, recentPosts: recentPosts });
    } catch(err) {
      console.error(err);
      baseRender(req, res, 'index', { featuredServices: [], testimonials: [], recentPosts: [] });
    }
  });

  router.get('/services', services.auth.optionalAuth, async function(req, res) {
    try {
      const allServices = await db.all("SELECT * FROM services WHERE published = 1 ORDER BY sort_order ASC, id ASC");
      baseRender(req, res, 'services', { allServices: allServices });
    } catch(err) {
      console.error(err);
      baseRender(req, res, 'services', { allServices: [] });
    }
  });

  router.get('/apropos', services.auth.optionalAuth, async function(req, res) {
    const testimonials = await db.all("SELECT * FROM testimonials WHERE published = 1 ORDER BY id DESC").catch(function(){ return []; });
    baseRender(req, res, 'apropos', { testimonials: testimonials });
  });

  router.get('/contact', services.auth.optionalAuth, function(req, res) {
    baseRender(req, res, 'contact', { submitted: req.query.submitted === '1' });
  });

  router.get('/reservation', services.auth.optionalAuth, async function(req, res) {
    const allServices = await db.all("SELECT id, name, price FROM services WHERE published = 1 ORDER BY sort_order ASC").catch(function(){ return []; });
    baseRender(req, res, 'reservation', { allServices: allServices, submitted: req.query.submitted === '1', preselected: req.query.service || '' });
  });

  router.get('/article/:id', services.auth.optionalAuth, async function(req, res) {
    const id = parseInt(req.params.id);
    if (!id) return res.redirect('.');
    const post = await db.get("SELECT * FROM posts WHERE id = $1 AND published = 1", [id]);
    if (!post) return res.redirect('.');
    const related = await db.all("SELECT id, title, image_url, category FROM posts WHERE id != $1 AND published = 1 ORDER BY created_at DESC LIMIT 3", [id]);
    baseRender(req, res, 'article', { post: post, related: related });
  });

  router.get('/articles', services.auth.optionalAuth, async function(req, res) {
    const posts = await db.all("SELECT id, title, content, image_url, category, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC").catch(function(){ return []; });
    baseRender(req, res, 'articles', { posts: posts });
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const body = req.body || {};
      const name = body.name;
      const email = body.email;
      const phone = body.phone;
      const subject = body.subject;
      const message = body.message;
      if (!name || !message) return res.status(400).json({ error: 'Nom et message requis' });
      await db.run('INSERT INTO form_submissions (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)', [name, email||'', phone||'', subject||'Contact', message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'FreshBin - Nouveau message de ' + name,
            html: '<h2>Nouveau message</h2><p><strong>Nom:</strong> ' + escapeHtml(name) + '</p><p><strong>Courriel:</strong> ' + escapeHtml(email||'') + '</p><p><strong>Message:</strong></p><p>' + escapeHtml(message).replace(/\n/g,'<br>') + '</p>'
          });
        }
      } catch(e) { console.error('Email send failed:', e.message); }
      res.json({ success: true });
    } catch(err) {
      console.error('Contact error:', err);
      res.status(500).json({ error: 'Erreur envoi' });
    }
  });

  router.post('/api/reservation', async function(req, res) {
    try {
      const body = req.body || {};
      const customer_name = body.customer_name;
      const email = body.email;
      const phone = body.phone;
      const service_type = body.service_type;
      const preferred_date = body.preferred_date;
      const address = body.address;
      const message = body.message;
      if (!customer_name || !phone) return res.status(400).json({ error: 'Nom et telephone requis' });
      await db.run('INSERT INTO bookings (customer_name, email, phone, service_type, preferred_date, address, message) VALUES ($1,$2,$3,$4,$5,$6,$7)', [customer_name, email||'', phone, service_type||'', preferred_date||'', address||'', message||'']);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'FreshBin - Nouvelle reservation: ' + (service_type||''),
            html: '<h2>Nouvelle demande de reservation</h2><p><strong>Client:</strong> ' + escapeHtml(customer_name) + '</p><p><strong>Telephone:</strong> ' + escapeHtml(phone) + '</p><p><strong>Service:</strong> ' + escapeHtml(service_type||'') + '</p>'
          });
        }
      } catch(e) { console.error('Email send failed:', e.message); }
      res.json({ success: true });
    } catch(err) {
      console.error('Reservation error:', err);
      res.status(500).json({ error: 'Erreur envoi' });
    }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Acces refuse' });
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const stats = {
        userCount: (await services.auth.getUserCount?.()) || 0,
        pushSubscriberCount: (await services.push.getSubscriptionCount?.()) || 0,
        totalVisits: (await db.get("SELECT COUNT(*)::int AS c FROM site_visits"))?.c || 0,
        recentVisits: (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"))?.c || 0,
        servicesCount: (await db.get("SELECT COUNT(*)::int AS c FROM services"))?.c || 0,
        postsCount: (await db.get("SELECT COUNT(*)::int AS c FROM posts"))?.c || 0,
        testimonialsCount: (await db.get("SELECT COUNT(*)::int AS c FROM testimonials"))?.c || 0,
        bookingsCount: (await db.get("SELECT COUNT(*)::int AS c FROM bookings"))?.c || 0,
        submissionsCount: (await db.get("SELECT COUNT(*)::int AS c FROM form_submissions"))?.c || 0,
        newBookingsCount: (await db.get("SELECT COUNT(*)::int AS c FROM bookings WHERE status = 'nouveau'"))?.c || 0,
        newSubmissionsCount: (await db.get("SELECT COUNT(*)::int AS c FROM form_submissions WHERE status = 'nouveau'"))?.c || 0
      };
      const recentBookings = await db.all("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5");
      const recentSubmissions = await db.all("SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5");
      const settings = await getSettings();
      res.render('admin', { stats: stats, recentBookings: recentBookings, recentSubmissions: recentSubmissions, settings: settings, currentModule: 'dashboard', config: services.config, formatDate: formatDate });
    } catch(err) {
      console.error('Admin dashboard error:', err);
      res.status(500).send('Erreur dashboard');
    }
  });

  router.get('/admin/posts', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const settings = await getSettings();
    res.render('admin-posts', { currentModule: 'posts', settings: settings, config: services.config, formatDate: formatDate });
  });

  router.get('/admin/services', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const settings = await getSettings();
    res.render('admin-services', { currentModule: 'services', settings: settings, config: services.config, formatDate: formatDate });
  });

  router.get('/admin/testimonials', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const settings = await getSettings();
    res.render('admin-testimonials', { currentModule: 'testimonials', settings: settings, config: services.config, formatDate: formatDate });
  });

  router.get('/admin/bookings', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const settings = await getSettings();
    res.render('admin-bookings', { currentModule: 'bookings', settings: settings, config: services.config, formatDate: formatDate });
  });

  router.get('/admin/submissions', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const settings = await getSettings();
    res.render('admin-submissions', { currentModule: 'submissions', settings: settings, config: services.config, formatDate: formatDate });
  });

  router.get('/admin/settings', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const settings = await getSettings();
    res.render('admin-settings', { currentModule: 'settings', settings: settings, config: services.config, formatDate: formatDate });
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = (await services.auth.getUserCount?.()) || 0;
      const pushSubscriberCount = (await services.push.getSubscriptionCount?.()) || 0;
      const totalVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits"))?.c || 0;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"))?.c || 0;
      res.json({ userCount: userCount, pushSubscriberCount: pushSubscriberCount, totalVisits: totalVisits, recentVisits: recentVisits });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        {
          key: 'services', label: 'Services', icon: 'package',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 120 },
            { name: 'short_description', type: 'text', required: false, maxLength: 200 },
            { name: 'description', type: 'textarea', required: false },
            { name: 'price', type: 'text', required: false, maxLength: 60 },
            { name: 'category', type: 'text', required: false, maxLength: 60 },
            { name: 'image_url', type: 'image', required: false },
            { name: 'icon', type: 'select', required: false, options: ['trash','car','leaf','sparkles','tools','default'] },
            { name: 'featured', type: 'boolean', default: true },
            { name: 'published', type: 'boolean', default: true },
            { name: 'sort_order', type: 'number', required: false, min: 0, step: 1 }
          ]
        },
        {
          key: 'posts', label: 'Articles', icon: 'edit',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 200 },
            { name: 'content', type: 'textarea', required: false },
            { name: 'image_url', type: 'image', required: false },
            { name: 'category', type: 'text', required: false, maxLength: 60 },
            { name: 'published', type: 'boolean', default: true }
          ]
        },
        {
          key: 'testimonials', label: 'Temoignages', icon: 'star',
          fields: [
            { name: 'author', type: 'text', required: true, maxLength: 120 },
            { name: 'role', type: 'text', required: false, maxLength: 120 },
            { name: 'content', type: 'textarea', required: true },
            { name: 'rating', type: 'number', required: false, min: 1, max: 5, step: 1, default: 5 },
            { name: 'avatar_url', type: 'image', required: false },
            { name: 'published', type: 'boolean', default: true }
          ]
        },
        {
          key: 'bookings', label: 'Reservations', icon: 'calendar',
          fields: [
            { name: 'customer_name', type: 'text', required: true, maxLength: 120 },
            { name: 'email', type: 'email', required: false, maxLength: 200 },
            { name: 'phone', type: 'text', required: true, maxLength: 40 },
            { name: 'service_type', type: 'text', required: false, maxLength: 120 },
            { name: 'preferred_date', type: 'text', required: false, maxLength: 60 },
            { name: 'address', type: 'text', required: false, maxLength: 250 },
            { name: 'message', type: 'textarea', required: false },
            { name: 'status', type: 'select', required: false, options: ['nouveau','confirme','complete','annule'], default: 'nouveau' }
          ]
        },
        {
          key: 'form_submissions', label: 'Messages de contact', icon: 'mail',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'email', required: false },
            { name: 'phone', type: 'text', required: false },
            { name: 'subject', type: 'text', required: false },
            { name: 'message', type: 'textarea', required: true },
            { name: 'status', type: 'select', required: false, options: ['nouveau','lu','traite','archive'], default: 'nouveau' }
          ]
        }
      ]
    });
  });

  function makePlaceholders(n) {
    var parts = [];
    for (var i = 1; i <= n; i++) parts.push('DOLLAR' + i);
    return parts.join(', ');
  }

  function makeSetClause(keys) {
    return keys.map(function(k, i) { return k + ' = DOLLAR' + (i + 1); }).join(', ');
  }

  // --- CRUD: posts ---
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM posts ORDER BY created_at DESC, id DESC');
      res.json({ posts: rows });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const data = req.body || {};
      const keys = Object.keys(data).filter(function(k) { return k !== 'id'; });
      if (!keys.length) return res.status(400).json({ error: 'Aucune donnee fournie' });
      const cols = keys.join(', ');
      const ph = makePlaceholders(keys.length).replace(/DOLLAR/g, '$');
      const values = keys.map(function(k) { return data[k]; });
      const result = await db.run('INSERT INTO posts (' + cols + ') VALUES (' + ph + ') RETURNING id', values);
      const row = await db.get('SELECT * FROM posts WHERE id = $1', [result.lastInsertRowid]);
      res.json({ post: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = req.body || {};
      const keys = Object.keys(data).filter(function(k) { return k !== 'id'; });
      if (!keys.length) return res.status(400).json({ error: 'Aucune donnee' });
      const sc = makeSetClause(keys).replace(/DOLLAR/g, '$');
      const values = keys.map(function(k) { return data[k]; });
      values.push(id);
      await db.run('UPDATE posts SET ' + sc + ', updated_at = NOW() WHERE id = $' + values.length, values);
      const row = await db.get('SELECT * FROM posts WHERE id = $1', [id]);
      res.json({ post: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM posts WHERE id = $1', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // --- CRUD: services ---
  router.get('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
      res.json({ services: rows });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      const data = req.body || {};
      const keys = Object.keys(data).filter(function(k) { return k !== 'id'; });
      if (!keys.length) return res.status(400).json({ error: 'Aucune donnee fournie' });
      const cols = keys.join(', ');
      const ph = makePlaceholders(keys.length).replace(/DOLLAR/g, '$');
      const values = keys.map(function(k) { return data[k]; });
      const result = await db.run('INSERT INTO services (' + cols + ') VALUES (' + ph + ') RETURNING id', values);
      const row = await db.get('SELECT * FROM services WHERE id = $1', [result.lastInsertRowid]);
      res.json({ service: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = req.body || {};
      const keys = Object.keys(data).filter(function(k) { return k !== 'id'; });
      if (!keys.length) return res.status(400).json({ error: 'Aucune donnee' });
      const sc = makeSetClause(keys).replace(/DOLLAR/g, '$');
      const values = keys.map(function(k) { return data[k]; });
      values.push(id);
      await db.run('UPDATE services SET ' + sc + ', updated_at = NOW() WHERE id = $' + values.length, values);
      const row = await db.get('SELECT * FROM services WHERE id = $1', [id]);
      res.json({ service: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM services WHERE id = $1', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // --- CRUD: testimonials ---
  router.get('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC, id DESC');
      res.json({ testimonials: rows });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try {
      const data = req.body || {};
      const keys = Object.keys(data).filter(function(k) { return k !== 'id'; });
      if (!keys.length) return res.status(400).json({ error: 'Aucune donnee fournie' });
      const cols = keys.join(', ');
      const ph = makePlaceholders(keys.length).replace(/DOLLAR/g, '$');
      const values = keys.map(function(k) { return data[k]; });
      const result = await db.run('INSERT INTO testimonials (' + cols + ') VALUES (' + ph + ') RETURNING id', values);
      const row = await db.get('SELECT * FROM testimonials WHERE id = $1', [result.lastInsertRowid]);
      res.json({ testimonial: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = req.body || {};
      const keys = Object.keys(data).filter(function(k) { return k !== 'id'; });
      if (!keys.length) return res.status(400).json({ error: 'Aucune donnee' });
      const sc = makeSetClause(keys).replace(/DOLLAR/g, '$');
      const values = keys.map(function(k) { return data[k]; });
      values.push(id);
      await db.run('UPDATE testimonials SET ' + sc + ', updated_at = NOW() WHERE id = $' + values.length, values);
      const row = await db.get('SELECT * FROM testimonials WHERE id = $1', [id]);
      res.json({ testimonial: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM testimonials WHERE id = $1', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // --- CRUD: bookings ---
  router.get('/api/admin/bookings', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM bookings ORDER BY created_at DESC, id DESC');
      res.json({ bookings: rows });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/bookings', requireAdmin, async function(req, res) {
    try {
      const data = req.body || {};
      const keys = Object.keys(data).filter(function(k) { return k !== 'id'; });
      if (!keys.length) return res.status(400).json({ error: 'Aucune donnee fournie' });
      const cols = keys.join(', ');
      const ph = makePlaceholders(keys.length).replace(/DOLLAR/g, '$');
      const values = keys.map(function(k) { return data[k]; });
      const result = await db.run('INSERT INTO bookings (' + cols + ') VALUES (' + ph + ') RETURNING id', values);
      const row = await db.get('SELECT * FROM bookings WHERE id = $1', [result.lastInsertRowid]);
      res.json({ booking: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/bookings/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = req.body || {};
      const keys = Object.keys(data).filter(function(k) { return k !== 'id'; });
      if (!keys.length) return res.status(400).json({ error: 'Aucune donnee' });
      const sc = makeSetClause(keys).replace(/DOLLAR/g, '$');
      const values = keys.map(function(k) { return data[k]; });
      values.push(id);
      await db.run('UPDATE bookings SET ' + sc + ', updated_at = NOW() WHERE id = $' + values.length, values);
      const row = await db.get('SELECT * FROM bookings WHERE id = $1', [id]);
      res.json({ booking: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/bookings/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM bookings WHERE id = $1', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // --- CRUD: form_submissions ---
  router.get('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
      res.json({ form_submissions: rows });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      const data = req.body || {};
      const keys = Object.keys(data).filter(function(k) { return k !== 'id'; });
      if (!keys.length) return res.status(400).json({ error: 'Aucune donnee fournie' });
      const cols = keys.join(', ');
      const ph = makePlaceholders(keys.length).replace(/DOLLAR/g, '$');
      const values = keys.map(function(k) { return data[k]; });
      const result = await db.run('INSERT INTO form_submissions (' + cols + ') VALUES (' + ph + ') RETURNING id', values);
      const row = await db.get('SELECT * FROM form_submissions WHERE id = $1', [result.lastInsertRowid]);
      res.json({ form_submission: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id);
      const status = (req.body || {}).status;
      await db.run('UPDATE form_submissions SET status = $1 WHERE id = $2', [status||'lu', id]);
      const row = await db.get('SELECT * FROM form_submissions WHERE id = $1', [id]);
      res.json({ form_submission: row, item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM form_submissions WHERE id = $1', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  // Also expose submissions alias (form_submissions table)
  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
      res.json({ submissions: rows });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/submissions/:id', requireAdmin, async function(req, res) {
    try {
      const id = parseInt(req.params.id);
      const status = (req.body || {}).status;
      await db.run('UPDATE form_submissions SET status = $1 WHERE id = $2', [status||'lu', id]);
      const row = await db.get('SELECT * FROM form_submissions WHERE id = $1', [id]);
      res.json({ item: row });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.delete('/api/admin/submissions/:id', requireAdmin, async function(req, res) {
    try {
      await db.run('DELETE FROM form_submissions WHERE id = $1', [parseInt(req.params.id)]);
      res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try { res.json({ settings: await getSettings() }); }
    catch(err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const key = (req.body || {}).key;
      const value = (req.body || {}).value;
      if (!key) return res.status(400).json({ error: 'Cle requise' });
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value||'']);
      res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/api/admin/generate-image', requireAdmin, async function(req, res) {
    try {
      const prompt = (req.body || {}).prompt;
      const aspectRatio = (req.body || {}).aspectRatio;
      if (!prompt) return res.status(400).json({ error: 'Prompt requis' });
      const imageUrl = await services.ai.generateImage(prompt, { aspectRatio: aspectRatio || '16:9' });
      res.json({ imageUrl: imageUrl });
    } catch(err) { res.status(500).json({ error: 'Generation image echouee' }); }
  });

  router.post('/api/admin/upload-data-uri', requireAdmin, async function(req, res) {
    try {
      const dataUri = (req.body || {}).dataUri;
      if (!dataUri) return res.status(400).json({ error: 'Image requise' });
      if (!services.cloudinary || !services.cloudinary.uploader) return res.status(500).json({ error: 'Service upload indisponible' });
      const result = await services.cloudinary.uploader.upload(dataUri, { folder: (services.config.slug || 'freshbin') + '/uploads' });
      res.json({ url: result.secure_url });
    } catch(err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Televersement echoue' });
    }
  });

  router.use(function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      return res.redirect('.');
    }
    next();
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
