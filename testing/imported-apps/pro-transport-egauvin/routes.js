module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const out = {};
      for (const r of rows) out[r.key] = r.value;
      return out;
    } catch (e) { return {}; }
  }

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) {
      if (req.path.startsWith('/api/')) return res.status(403).json({ error: 'Acces refuse' });
      return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    }
    next();
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES (?)', [req.path]); } catch(e) {}
    }
    next();
  });

  router.get('/', async function(req, res) {
    try {
      const settings = await getSettings();
      const services2 = await db.all('SELECT * FROM services WHERE featured = 1 ORDER BY sort_order ASC LIMIT 4');
      const gallery = await db.all('SELECT * FROM gallery ORDER BY sort_order ASC LIMIT 4');
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', { settings, services: services2, gallery, posts, page: 'home' });
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/services', async function(req, res) {
    try {
      const settings = await getSettings();
      const services2 = await db.all('SELECT * FROM services ORDER BY sort_order ASC');
      res.render('services', { settings, services: services2, page: 'services' });
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/galerie', async function(req, res) {
    try {
      const settings = await getSettings();
      const category = req.query.cat || '';
      let gallery;
      if (category) {
        gallery = await db.all('SELECT * FROM gallery WHERE category = ? ORDER BY sort_order ASC, created_at DESC', [category]);
      } else {
        gallery = await db.all('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC');
      }
      const cats = await db.all("SELECT DISTINCT category FROM gallery WHERE category IS NOT NULL AND category <> '' ORDER BY category");
      res.render('galerie', { settings, gallery, categories: cats, currentCat: category, page: 'galerie' });
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/horaires', async function(req, res) {
    try {
      const settings = await getSettings();
      res.render('horaires', { settings, page: 'horaires' });
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/contact', async function(req, res) {
    try {
      const settings = await getSettings();
      res.render('contact', { settings, page: 'contact', success: req.query.ok === '1', error: null });
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/articles/:id', async function(req, res) {
    try {
      const settings = await getSettings();
      const post = await db.get('SELECT * FROM posts WHERE id = ? AND published = 1', [req.params.id]);
      if (!post) return res.redirect('.');
      const related = await db.all('SELECT * FROM posts WHERE published = 1 AND id <> ? ORDER BY created_at DESC LIMIT 3', [post.id]);
      res.render('article', { settings, post, related, page: 'articles' });
    } catch (err) { console.error(err); res.redirect('.'); }
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const { name, email, phone, subject, message } = req.body || {};
      if (!name || !message) return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires.' });
      await db.run('INSERT INTO form_submissions (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)', [name, email || '', phone || '', subject || 'Demande de devis', message]);
      try {
        if (services.config.contactEmail && services.email && services.email.send) {
          const html = '<h2>Nouvelle demande de devis</h2>' +
            '<p><strong>Nom:</strong> ' + escapeHtml(name) + '</p>' +
            '<p><strong>Courriel:</strong> ' + escapeHtml(email || '-') + '</p>' +
            '<p><strong>Telephone:</strong> ' + escapeHtml(phone || '-') + '</p>' +
            '<p><strong>Sujet:</strong> ' + escapeHtml(subject || '-') + '</p>' +
            '<p><strong>Message:</strong></p><p>' + escapeHtml(message).replace(/\n/g, '<br>') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle demande - ' + (subject || 'Devis'), html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (e) { console.error('Email failed:', e.message); }
      res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ error: "Erreur lors de l'envoi. Veuillez reessayer." }); }
  });

  function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  router.get('/admin', requireAdmin, async function(req, res) {
    try {
      const settings = await getSettings();
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*) AS c FROM site_visits')).c;
      const recentVisits = (await db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c;
      const postCount = (await db.get('SELECT COUNT(*) AS c FROM posts')).c;
      const serviceCount = (await db.get('SELECT COUNT(*) AS c FROM services')).c;
      const galleryCount = (await db.get('SELECT COUNT(*) AS c FROM gallery')).c;
      const submissionCount = (await db.get('SELECT COUNT(*) AS c FROM form_submissions')).c;
      const newSubmissions = (await db.get("SELECT COUNT(*) AS c FROM form_submissions WHERE status = 'nouveau'")).c;
      const recentSubs = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5');
      res.render('admin', { settings, stats: { userCount, pushCount, totalVisits, recentVisits, postCount, serviceCount, galleryCount, submissionCount, newSubmissions }, recentSubs, page: 'admin' });
    } catch (err) { console.error(err); res.status(500).send('Erreur'); }
  });

  router.get('/admin/posts', requireAdmin, async function(req, res) { const settings = await getSettings(); res.render('admin-posts', { settings, page: 'admin' }); });
  router.get('/admin/services', requireAdmin, async function(req, res) { const settings = await getSettings(); res.render('admin-services', { settings, page: 'admin' }); });
  router.get('/admin/gallery', requireAdmin, async function(req, res) { const settings = await getSettings(); res.render('admin-gallery', { settings, page: 'admin' }); });
  router.get('/admin/submissions', requireAdmin, async function(req, res) { const settings = await getSettings(); res.render('admin-submissions', { settings, page: 'admin' }); });
  router.get('/admin/settings', requireAdmin, async function(req, res) { const settings = await getSettings(); res.render('admin-settings', { settings, page: 'admin' }); });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*) AS c FROM site_visits')).c;
      const recentVisits = (await db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c;
      res.json({ userCount, pushSubscriberCount: pushCount, totalVisits, recentVisits });
    } catch (err) { res.status(500).json({ error: 'Erreur' }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        { key: 'posts', label: 'Actualites', icon: 'edit', fields: [
          { name: 'title', type: 'text', required: true, maxLength: 200, description: "Titre de l'article affiche sur la liste et le detail", placeholder: 'ex. Service 24/7 desormais disponible' },
          { name: 'content', type: 'textarea', required: true, description: "Contenu complet de l'article. Gardez les paragraphes courts pour la lecture mobile.", placeholder: 'Redigez votre article ici...' },
          { name: 'image_url', type: 'image', required: false, description: "Image vedette en haut de l'article. Recommande: 1200x630px" },
          { name: 'category', type: 'text', required: false, maxLength: 50, description: 'Categorie pour grouper les articles (ex. Annonce, Conseils)', placeholder: 'ex. Annonce' },
          { name: 'published', type: 'boolean', default: true, description: "Decocher pour cacher l'article du site public" }
        ]},
        { key: 'services', label: 'Services', icon: 'package', fields: [
          { name: 'name', type: 'text', required: true, maxLength: 100, description: 'Nom du service (ex. Terre, Sable, Gravier)', placeholder: 'ex. Gravier' },
          { name: 'description', type: 'textarea', required: true, description: 'Description detaillee du service affichee sur la page Services', placeholder: 'Decrivez le materiau et ses utilisations...' },
          { name: 'image_url', type: 'image', required: false, description: 'Photo du materiau ou du service. Recommande: 800x600px' },
          { name: 'price_info', type: 'text', required: false, maxLength: 100, description: 'Information de tarification (ex. "Sur devis" ou "A partir de 50$/verge")', placeholder: 'ex. Sur devis selon volume' },
          { name: 'featured', type: 'boolean', default: true, description: "Cocher pour mettre en vedette sur la page d'accueil" },
          { name: 'sort_order', type: 'number', default: 0, min: 0, step: 1, description: "Ordre d'affichage (plus petit = en premier)", placeholder: '0' }
        ]},
        { key: 'gallery', label: 'Galerie', icon: 'image', fields: [
          { name: 'image_url', type: 'image', required: true, description: 'Photo a afficher dans la galerie. Recommande: format paysage 1200x900px' },
          { name: 'title', type: 'text', required: false, maxLength: 100, description: 'Titre de la photo (optionnel, affiche au survol)', placeholder: 'ex. Livraison chantier Sherbrooke' },
          { name: 'description', type: 'textarea', required: false, description: 'Description detaillee (optionnel)', placeholder: 'Details du projet...' },
          { name: 'category', type: 'text', required: false, maxLength: 50, description: 'Categorie pour filtrer la galerie (ex. Chantier, Flotte, Operation)', placeholder: 'ex. Chantier' },
          { name: 'sort_order', type: 'number', default: 0, min: 0, step: 1, description: "Ordre d'affichage", placeholder: '0' }
        ]},
        { key: 'form_submissions', label: 'Soumissions', icon: 'inbox', fields: [
          { name: 'name', type: 'text', required: false, description: "Nom de l'expediteur" },
          { name: 'email', type: 'text', required: false, description: "Courriel de l'expediteur" },
          { name: 'phone', type: 'text', required: false, description: "Telephone de l'expediteur" },
          { name: 'subject', type: 'text', required: false, description: 'Sujet du message' },
          { name: 'message', type: 'textarea', required: false, description: 'Contenu du message' },
          { name: 'status', type: 'text', required: false, description: 'Statut de la soumission (nouveau, lu, archive)' }
        ]}
      ]
    });
  });

  // posts CRUD
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM posts ORDER BY created_at DESC'); res.json({ posts: items }); }
    catch (e) { res.status(500).json({ error: 'Erreur' }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const body = req.body || {};
      const cols = Object.keys(body).filter(k => k !== 'id');
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnee' });
      const placeholders = cols.map(() => '?').join(', ');
      const vals = cols.map(c => body[c] === '' ? null : body[c]);
      const r = await db.run('INSERT INTO posts (' + cols.join(', ') + ') VALUES (' + placeholders + ')', vals);
      const item = await db.get('SELECT * FROM posts WHERE id = ?', [r.lastInsertRowid]);
      res.json({ post: item, item });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur creation: ' + e.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const body = req.body || {};
      const cols = Object.keys(body).filter(k => k !== 'id');
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnee' });
      const sets = cols.map(c => c + ' = ?').join(', ');
      const vals = cols.map(c => body[c] === '' ? null : body[c]);
      vals.push(req.params.id);
      await db.run('UPDATE posts SET ' + sets + ', updated_at = NOW() WHERE id = ?', vals);
      const item = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
      res.json({ post: item, item });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur modification: ' + e.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Erreur suppression' }); }
  });

  // services CRUD
  router.get('/api/admin/services', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM services ORDER BY created_at DESC'); res.json({ services: items }); }
    catch (e) { res.status(500).json({ error: 'Erreur' }); }
  });
  router.post('/api/admin/services', requireAdmin, async function(req, res) {
    try {
      const body = req.body || {};
      const cols = Object.keys(body).filter(k => k !== 'id');
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnee' });
      const placeholders = cols.map(() => '?').join(', ');
      const vals = cols.map(c => body[c] === '' ? null : body[c]);
      const r = await db.run('INSERT INTO services (' + cols.join(', ') + ') VALUES (' + placeholders + ')', vals);
      const item = await db.get('SELECT * FROM services WHERE id = ?', [r.lastInsertRowid]);
      res.json({ service: item, item });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur creation: ' + e.message }); }
  });
  router.put('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try {
      const body = req.body || {};
      const cols = Object.keys(body).filter(k => k !== 'id');
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnee' });
      const sets = cols.map(c => c + ' = ?').join(', ');
      const vals = cols.map(c => body[c] === '' ? null : body[c]);
      vals.push(req.params.id);
      await db.run('UPDATE services SET ' + sets + ', updated_at = NOW() WHERE id = ?', vals);
      const item = await db.get('SELECT * FROM services WHERE id = ?', [req.params.id]);
      res.json({ service: item, item });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur modification: ' + e.message }); }
  });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM services WHERE id = ?', [req.params.id]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Erreur suppression' }); }
  });

  // gallery CRUD
  router.get('/api/admin/gallery', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM gallery ORDER BY created_at DESC'); res.json({ gallery: items }); }
    catch (e) { res.status(500).json({ error: 'Erreur' }); }
  });
  router.post('/api/admin/gallery', requireAdmin, async function(req, res) {
    try {
      const body = req.body || {};
      const cols = Object.keys(body).filter(k => k !== 'id');
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnee' });
      const placeholders = cols.map(() => '?').join(', ');
      const vals = cols.map(c => body[c] === '' ? null : body[c]);
      const r = await db.run('INSERT INTO gallery (' + cols.join(', ') + ') VALUES (' + placeholders + ')', vals);
      const item = await db.get('SELECT * FROM gallery WHERE id = ?', [r.lastInsertRowid]);
      res.json({ gallery: item, item });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur creation: ' + e.message }); }
  });
  router.put('/api/admin/gallery/:id', requireAdmin, async function(req, res) {
    try {
      const body = req.body || {};
      const cols = Object.keys(body).filter(k => k !== 'id');
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnee' });
      const sets = cols.map(c => c + ' = ?').join(', ');
      const vals = cols.map(c => body[c] === '' ? null : body[c]);
      vals.push(req.params.id);
      await db.run('UPDATE gallery SET ' + sets + ', updated_at = NOW() WHERE id = ?', vals);
      const item = await db.get('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
      res.json({ gallery: item, item });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur modification: ' + e.message }); }
  });
  router.delete('/api/admin/gallery/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM gallery WHERE id = ?', [req.params.id]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Erreur suppression' }); }
  });

  // form_submissions CRUD
  router.get('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC'); res.json({ form_submissions: items }); }
    catch (e) { res.status(500).json({ error: 'Erreur' }); }
  });
  router.post('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      const body = req.body || {};
      const cols = Object.keys(body).filter(k => k !== 'id');
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnee' });
      const placeholders = cols.map(() => '?').join(', ');
      const vals = cols.map(c => body[c] === '' ? null : body[c]);
      const r = await db.run('INSERT INTO form_submissions (' + cols.join(', ') + ') VALUES (' + placeholders + ')', vals);
      const item = await db.get('SELECT * FROM form_submissions WHERE id = ?', [r.lastInsertRowid]);
      res.json({ form_submission: item, item });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur creation: ' + e.message }); }
  });
  router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try {
      const body = req.body || {};
      const cols = Object.keys(body).filter(k => k !== 'id');
      if (!cols.length) return res.status(400).json({ error: 'Aucune donnee' });
      const sets = cols.map(c => c + ' = ?').join(', ');
      const vals = cols.map(c => body[c] === '' ? null : body[c]);
      vals.push(req.params.id);
      await db.run('UPDATE form_submissions SET ' + sets + ' WHERE id = ?', vals);
      const item = await db.get('SELECT * FROM form_submissions WHERE id = ?', [req.params.id]);
      res.json({ form_submission: item, item });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur modification: ' + e.message }); }
  });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM form_submissions WHERE id = ?', [req.params.id]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Erreur suppression' }); }
  });

  // Legacy submissions alias (backward compat)
  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    try { const items = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC'); res.json({ submissions: items }); }
    catch (e) { res.status(500).json({ error: 'Erreur' }); }
  });
  router.put('/api/admin/submissions/:id', requireAdmin, async function(req, res) {
    try { const { status } = req.body || {}; await db.run('UPDATE form_submissions SET status = ? WHERE id = ?', [status || 'nouveau', req.params.id]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Erreur' }); }
  });
  router.delete('/api/admin/submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM form_submissions WHERE id = ?', [req.params.id]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Erreur suppression' }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    const s = await getSettings(); res.json({ settings: s });
  });
  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'Cle manquante' });
      await db.run('INSERT INTO admin_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value || '']);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Erreur' }); }
  });

  router.post('/api/admin/generate-image', requireAdmin, async function(req, res) {
    try {
      const { prompt, aspectRatio } = req.body || {};
      if (!prompt) return res.status(400).json({ error: 'Prompt manquant' });
      const imageUrl = await services.ai.generateImage(prompt, { aspectRatio: aspectRatio || '16:9' });
      res.json({ imageUrl });
    } catch (e) { res.status(500).json({ error: "Generation d'image echouee. Televersez manuellement." }); }
  });

  router.get('*', (req, res, next) => {
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
