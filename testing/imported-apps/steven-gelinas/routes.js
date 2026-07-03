module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;
  function formatPrice(v) { return Number(v || 0).toFixed(2).replace('.', ',') + ' $'; }
  function formatDate(d) { try { return new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return ''; } }
  async function getSettings() { try { const rows = await db.all('SELECT key, value FROM admin_settings'); const s = {}; (rows || []).forEach(function(r) { s[r.key] = r.value; }); return s; } catch (e) { return {}; } }
  async function baseLocals(page, title) { const settings = await getSettings(); return { settings: settings, page: page, title: title, formatPrice: formatPrice, formatDate: formatDate }; }
  function requireAdmin(req, res, next) { if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès refusé.' }); next(); }
  async function adminBadges() { try { const pd = await db.get("SELECT COUNT(*)::int AS n FROM orders WHERE status = 'Reçue'"); const mc = await db.get('SELECT COUNT(*)::int AS n FROM form_submissions'); return { pendingOrders: pd ? pd.n : 0, messages: mc ? mc.n : 0 }; } catch (e) { return { pendingOrders: 0, messages: 0 }; } }
  (async function() { try {
    const pairs = [['contact_email', services.config.contactEmail], ['contact_phone', services.config.contactPhone], ['business_name', services.config.businessName], ['business_address', services.config.businessAddress]];
    for (const pr of pairs) { if (pr[1]) await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [pr[0], pr[1]]); }
  } catch (e) {} })();
  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) { try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch (e) {} }
    next();
  });
  router.get('/', async function(req, res) {
    try {
      const locals = await baseLocals('accueil', null);
      let featured = await db.all('SELECT * FROM products WHERE in_stock = 1 AND featured = 1 ORDER BY created_at DESC LIMIT 6');
      if (!featured || !featured.length) featured = await db.all('SELECT * FROM products WHERE in_stock = 1 ORDER BY created_at DESC LIMIT 6');
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 2');
      const cr = await db.get('SELECT COUNT(*)::int AS n FROM products WHERE in_stock = 1');
      res.render('index', Object.assign(locals, { featured: featured || [], posts: posts || [], productCount: cr ? cr.n : 0 }));
    } catch (e) { res.status(500).send('Une erreur est survenue. Rechargez la page.'); }
  });
  router.get('/catalogue', async function(req, res) {
    try {
      const locals = await baseLocals('catalogue', 'Catalogue');
      const q = String(req.query.q || '').trim();
      const cat = String(req.query.categorie || '').trim();
      let sql = 'SELECT * FROM products';
      const params = []; const wh = [];
      if (q) { params.push('%' + q + '%'); wh.push('(name ILIKE $' + params.length + ' OR description ILIKE $' + params.length + ' OR item_number ILIKE $' + params.length + ')'); }
      if (cat) { params.push(cat); wh.push('category = $' + params.length); }
      if (wh.length) sql += ' WHERE ' + wh.join(' AND ');
      sql += ' ORDER BY featured DESC, created_at DESC';
      const products = await db.all(sql, params);
      const cats = await db.all("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category <> '' ORDER BY category");
      res.render('catalogue', Object.assign(locals, { products: products || [], cats: cats || [], q: q, cat: cat }));
    } catch (e) { res.status(500).send('Une erreur est survenue. Rechargez la page.'); }
  });
  router.get('/produit/:id', async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.redirect('catalogue');
      const p = await db.get('SELECT * FROM products WHERE id = $1', [id]);
      if (!p) return res.redirect('catalogue');
      let related = [];
      if (p.category) related = await db.all('SELECT * FROM products WHERE category = $1 AND id <> $2 AND in_stock = 1 ORDER BY created_at DESC LIMIT 3', [p.category, p.id]);
      if (!related || !related.length) related = await db.all('SELECT * FROM products WHERE id <> $1 AND in_stock = 1 ORDER BY created_at DESC LIMIT 3', [p.id]);
      const locals = await baseLocals('catalogue', p.name);
      res.render('produit', Object.assign(locals, { p: p, related: related || [] }));
    } catch (e) { res.status(500).send('Une erreur est survenue. Rechargez la page.'); }
  });
  router.get('/bulletin', async function(req, res) {
    try {
      const locals = await baseLocals('bulletin', 'Bulletin');
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
      res.render('bulletin', Object.assign(locals, { posts: posts || [] }));
    } catch (e) { res.status(500).send('Une erreur est survenue. Rechargez la page.'); }
  });
  router.get('/bulletin/:id', async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.redirect('bulletin');
      const post = await db.get('SELECT * FROM posts WHERE id = $1 AND published = 1', [id]);
      if (!post) return res.redirect('bulletin');
      const locals = await baseLocals('bulletin', post.title);
      res.render('bulletin-article', Object.assign(locals, { post: post }));
    } catch (e) { res.status(500).send('Une erreur est survenue. Rechargez la page.'); }
  });
  router.get('/contact', async function(req, res) {
    try { res.render('contact', await baseLocals('contact', 'Contact')); } catch (e) { res.status(500).send('Une erreur est survenue. Rechargez la page.'); }
  });
  router.get('/bon-de-commande', services.auth.optionalAuth, async function(req, res) {
    try { const locals = await baseLocals('bon', 'Bon de commande'); res.render('bon-de-commande', Object.assign(locals, { user: req.user || null })); } catch (e) { res.status(500).send('Une erreur est survenue. Rechargez la page.'); }
  });
  router.get('/commandes', services.auth.optionalAuth, async function(req, res) {
    try { const locals = await baseLocals('commandes', 'Mes commandes'); res.render('commandes', Object.assign(locals, { user: req.user || null })); } catch (e) { res.status(500).send('Une erreur est survenue. Rechargez la page.'); }
  });
  router.get('/api/products', async function(req, res) {
    try {
      const ids = String(req.query.ids || '').split(',').map(function(s) { return parseInt(s, 10); }).filter(function(n) { return !isNaN(n); });
      if (!ids.length) return res.json({ products: [] });
      const ph = ids.map(function(_, i) { return '$' + (i + 1); }).join(',');
      const products = await db.all('SELECT id, name, item_number, price, image_url, in_stock, category FROM products WHERE id IN (' + ph + ')', ids);
      res.json({ products: products || [] });
    } catch (e) { res.status(500).json({ error: 'Chargement impossible.' }); }
  });
  router.post('/api/orders', services.auth.requireAuth, async function(req, res) {
    try {
      const items = Array.isArray(req.body.items) ? req.body.items : [];
      const c = req.body.customer || {};
      if (!items.length) return res.status(400).json({ error: 'Votre bon de commande est vide.' });
      if (!c.name || !c.address || !c.city) return res.status(400).json({ error: 'Veuillez indiquer votre nom, votre adresse et votre ville.' });
      const ids = items.map(function(i) { return parseInt(i.id, 10); }).filter(function(n) { return !isNaN(n); });
      if (!ids.length) return res.status(400).json({ error: 'Articles invalides.' });
      const ph = ids.map(function(_, i) { return '$' + (i + 1); }).join(',');
      const prods = await db.all('SELECT * FROM products WHERE id IN (' + ph + ')', ids);
      const byId = {}; (prods || []).forEach(function(p) { byId[p.id] = p; });
      let total = 0; const lines = [];
      items.forEach(function(i) {
        const p = byId[parseInt(i.id, 10)];
        if (!p || !Number(p.in_stock)) return;
        const qty = Math.max(1, Math.min(20, parseInt(i.qty, 10) || 1));
        total += Number(p.price) * qty;
        lines.push({ p: p, qty: qty });
      });
      if (!lines.length) return res.status(400).json({ error: 'Ces articles ne sont plus disponibles.' });
      const r = await db.run('INSERT INTO orders (user_id, customer_name, email, phone, address, city, postal_code, note, status, total) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id', [req.user.id, c.name, req.user.email || '', c.phone || '', c.address, c.city, c.postal_code || '', c.note || '', 'Reçue', total.toFixed(2)]);
      const orderId = r.lastInsertRowid;
      for (const l of lines) await db.run('INSERT INTO order_items (order_id, product_id, product_name, item_number, price, quantity, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)', [orderId, l.p.id, l.p.name, l.p.item_number || String(l.p.id), l.p.price, l.qty, l.p.image_url || '']);
      try {
        if (services.config.contactEmail) {
          const rows = lines.map(function(l) { return '<li>' + l.qty + ' × ' + l.p.name + ' (nº ' + (l.p.item_number || l.p.id) + ') — ' + (Number(l.p.price) * l.qty).toFixed(2) + ' $</li>'; }).join('');
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle commande — Bon nº ' + orderId, html: '<h2>Bon nº ' + orderId + '</h2><p><strong>' + c.name + '</strong><br>' + c.address + ', ' + c.city + ' ' + (c.postal_code || '') + '<br>' + (c.phone || '') + '</p><ul>' + rows + '</ul><p><strong>Total : ' + total.toFixed(2) + ' $</strong></p>' + (c.note ? '<p>Note : ' + c.note + '</p>' : '') }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch (e) {}
      res.json({ success: true, orderId: orderId, total: total });
    } catch (e) { res.status(500).json({ error: 'La commande n\'a pas pu être enregistrée. Réessayez.' }); }
  });
  router.get('/api/my-orders', services.auth.requireAuth, async function(req, res) {
    try {
      const orders = await db.all('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
      if (orders && orders.length) {
        const ph = orders.map(function(_, i) { return '$' + (i + 1); }).join(',');
        const items = await db.all('SELECT * FROM order_items WHERE order_id IN (' + ph + ')', orders.map(function(o) { return o.id; }));
        const map = {}; (items || []).forEach(function(it) { (map[it.order_id] = map[it.order_id] || []).push(it); });
        orders.forEach(function(o) { o.items = map[o.id] || []; });
      }
      res.json({ orders: orders || [] });
    } catch (e) { res.status(500).json({ error: 'Chargement impossible.' }); }
  });
  router.post('/api/contact', async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.name || !b.message) return res.status(400).json({ error: 'Veuillez indiquer votre nom et votre message.' });
      await db.run('INSERT INTO form_submissions (name, email, message) VALUES ($1, $2, $3)', [b.name, b.email || '', b.message]);
      try {
        if (services.config.contactEmail) await services.email.send({ to: services.config.contactEmail, subject: 'Nouveau message de ' + b.name, html: '<p><strong>' + b.name + '</strong> (' + (b.email || 'sans courriel') + ')</p><p>' + b.message + '</p>' });
      } catch (e) {}
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Envoi impossible. Réessayez.' }); }
  });
  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const stats = {};
      try { stats.users = await services.auth.getUserCount(); } catch (e) { stats.users = 0; }
      try { stats.push = await services.push.getSubscriptionCount(); } catch (e) { stats.push = 0; }
      const tv = await db.get('SELECT COUNT(*)::int AS n FROM site_visits'); stats.visits = tv ? tv.n : 0;
      const rv = await db.get("SELECT COUNT(*)::int AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"); stats.recentVisits = rv ? rv.n : 0;
      const pc = await db.get('SELECT COUNT(*)::int AS n FROM products'); stats.products = pc ? pc.n : 0;
      const oc = await db.get('SELECT COUNT(*)::int AS n FROM orders'); stats.orders = oc ? oc.n : 0;
      const pd = await db.get("SELECT COUNT(*)::int AS n FROM orders WHERE status = 'Reçue'"); stats.pending = pd ? pd.n : 0;
      const mc = await db.get('SELECT COUNT(*)::int AS n FROM form_submissions'); stats.messages = mc ? mc.n : 0;
      const recentOrders = await db.all('SELECT * FROM orders ORDER BY created_at DESC LIMIT 6');
      const recentMessages = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5');
      const badges = await adminBadges();
      res.render('admin', { stats: stats, recentOrders: recentOrders || [], recentMessages: recentMessages || [], formatPrice: formatPrice, formatDate: formatDate, badges: badges, active: 'dashboard', pageTitle: 'Tableau de bord' });
    } catch (e) { res.status(500).send('Erreur du tableau de bord.'); }
  });
  router.get('/admin/products', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try { const items = await db.all('SELECT * FROM products ORDER BY created_at DESC'); res.render('admin-products', { items: items || [], badges: await adminBadges(), active: 'products', pageTitle: 'Produits' }); } catch (e) { res.status(500).send('Erreur.'); }
  });
  router.get('/admin/orders', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');
      const its = await db.all('SELECT * FROM order_items ORDER BY id');
      const map = {}; (its || []).forEach(function(it) { (map[it.order_id] = map[it.order_id] || []).push(it); });
      (orders || []).forEach(function(o) { o.items = map[o.id] || []; });
      res.render('admin-orders', { items: orders || [], badges: await adminBadges(), active: 'orders', pageTitle: 'Commandes' });
    } catch (e) { res.status(500).send('Erreur.'); }
  });
  router.get('/admin/posts', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try { const items = await db.all('SELECT * FROM posts ORDER BY created_at DESC'); res.render('admin-posts', { items: items || [], badges: await adminBadges(), active: 'posts', pageTitle: 'Bulletin' }); } catch (e) { res.status(500).send('Erreur.'); }
  });
  router.get('/admin/messages', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try { const items = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC'); res.render('admin-messages', { items: items || [], formatDate: formatDate, badges: await adminBadges(), active: 'messages', pageTitle: 'Messages' }); } catch (e) { res.status(500).send('Erreur.'); }
  });
  router.get('/admin/settings', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try { res.render('admin-settings', { settings: await getSettings(), badges: await adminBadges(), active: 'settings', pageTitle: 'Réglages' }); } catch (e) { res.status(500).send('Erreur.'); }
  });
  router.get('/admin/logout', function(req, res) { try { res.clearCookie(services.config.adminCookieName); } catch (e) {} res.redirect('.'); });
  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      let userCount = 0, pushSubscriberCount = 0;
      try { userCount = await services.auth.getUserCount(); } catch (e) {}
      try { pushSubscriberCount = await services.push.getSubscriptionCount(); } catch (e) {}
      const tv = await db.get('SELECT COUNT(*)::int AS n FROM site_visits');
      const rv = await db.get("SELECT COUNT(*)::int AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
      res.json({ userCount: userCount, pushSubscriberCount: pushSubscriberCount, totalVisits: tv ? tv.n : 0, recentVisits: rv ? rv.n : 0 });
    } catch (e) { res.status(500).json({ error: 'Erreur de chargement.' }); }
  });
  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({ modules: [
      { key: 'products', label: 'Produits', icon: 'package', fields: [
        { name: 'name', type: 'text', required: true, maxLength: 120, description: "Nom de l'article affiché au catalogue et sur sa fiche.", placeholder: 'ex. Planche à découper en érable' },
        { name: 'item_number', type: 'text', maxLength: 20, description: 'Numéro de catalogue affiché sous la forme « Nº 1001 ». Laissez vide pour utiliser le numéro interne.', placeholder: 'ex. 1007' },
        { name: 'category', type: 'text', maxLength: 40, description: 'Rayon du catalogue — sert au filtre de la page Catalogue (ex. Cuisine, Maison, Atelier).', placeholder: 'ex. Cuisine' },
        { name: 'price', type: 'number', min: 0, step: 0.01, required: true, description: 'Prix en dollars canadiens, sans le symbole $.', placeholder: 'ex. 42.00' },
        { name: 'description', type: 'textarea', description: "Description affichée sur la fiche de l'article. Deux ou trois phrases suffisent.", placeholder: 'ex. Érable massif du Québec, huilé à la main…' },
        { name: 'image_url', type: 'image', description: 'Photo de l’article. Recommandé : format carré 800 × 800 px sur fond neutre.' },
        { name: 'in_stock', type: 'boolean', default: true, description: 'Décochez pour afficher « Épuisé » — l’article reste visible mais ne peut plus être commandé.' },
        { name: 'featured', type: 'boolean', default: false, description: 'Cochez pour mettre l’article en vedette sur la page d’accueil.' }
      ] },
      { key: 'posts', label: 'Bulletin', icon: 'edit', fields: [
        { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre du billet affiché dans le bulletin et sur sa page.', placeholder: 'ex. Le catalogue d’automne est arrivé' },
        { name: 'content', type: 'textarea', description: 'Texte du billet. Séparez les paragraphes par une ligne vide.', placeholder: 'Écrivez votre nouvelle ici…' },
        { name: 'image_url', type: 'image', description: 'Image d’entête du billet. Recommandé : 1200 × 800 px, format paysage.' },
        { name: 'category', type: 'text', maxLength: 40, description: 'Rubrique du billet (ex. Nouveautés, Coulisses, Avis).', placeholder: 'ex. Nouveautés' },
        { name: 'published', type: 'boolean', default: true, description: 'Décochez pour garder le billet en brouillon, invisible aux visiteurs.' }
      ] },
      { key: 'orders', label: 'Commandes', icon: 'list', fields: [
        { name: 'customer_name', type: 'text', description: 'Nom du client tel qu’indiqué sur le bon de commande.', placeholder: 'ex. Marie Tremblay' },
        { name: 'email', type: 'email', description: 'Courriel du client (rempli automatiquement à la commande).', placeholder: 'ex. marie@exemple.ca' },
        { name: 'phone', type: 'text', description: 'Téléphone du client.', placeholder: 'ex. 819 555-0123' },
        { name: 'address', type: 'text', description: 'Adresse de livraison.', placeholder: 'ex. 123, rue Principale' },
        { name: 'city', type: 'text', description: 'Ville de livraison.', placeholder: 'ex. Trois-Rivières' },
        { name: 'postal_code', type: 'text', description: 'Code postal.', placeholder: 'ex. G8T 1A1' },
        { name: 'status', type: 'select', options: ['Reçue', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'], default: 'Reçue', description: 'Statut du bon — le client le voit dans « Mes commandes ».' },
        { name: 'total', type: 'number', min: 0, step: 0.01, description: 'Total de la commande en dollars (calculé automatiquement à la commande).', placeholder: 'ex. 128.00' },
        { name: 'note', type: 'textarea', description: 'Note laissée par le client à la commande.', placeholder: 'ex. Laisser le colis sur la galerie' }
      ] },
      { key: 'order_items', label: 'Lignes de commande', icon: 'list', fields: [
        { name: 'order_id', type: 'number', description: 'Identifiant de la commande parente.', placeholder: 'ex. 42' },
        { name: 'product_id', type: 'number', description: 'Identifiant du produit.', placeholder: 'ex. 7' },
        { name: 'product_name', type: 'text', description: 'Nom du produit au moment de la commande.', placeholder: 'ex. Planche à decouper en erable' },
        { name: 'item_number', type: 'text', description: 'Numero de catalogue au moment de la commande.', placeholder: 'ex. 1007' },
        { name: 'price', type: 'number', min: 0, step: 0.01, description: 'Prix unitaire au moment de la commande.', placeholder: 'ex. 42.00' },
        { name: 'quantity', type: 'number', min: 1, description: 'Quantite commandee.', placeholder: 'ex. 2' },
        { name: 'image_url', type: 'image', description: 'Photo du produit au moment de la commande.' }
      ] },
      { key: 'form_submissions', label: 'Messages', icon: 'mail', fields: [
        { name: 'name', type: 'text', description: "Nom de l'expediteur.", placeholder: 'ex. Jean Dupont' },
        { name: 'email', type: 'email', description: "Courriel de l'expediteur.", placeholder: 'ex. jean@exemple.ca' },
        { name: 'message', type: 'textarea', description: 'Contenu du message recu via le formulaire de contact.' }
      ] }
    ] });
  });
  router.get('/api/admin/products', requireAdmin, async function(req, res) {
    try { res.json({ products: await db.all('SELECT * FROM products ORDER BY created_at DESC') }); } catch (e) { res.status(500).json({ error: 'Erreur de chargement.' }); }
  });
  router.post('/api/admin/products', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.name) return res.status(400).json({ error: 'Le nom du produit est requis.' });
      const r = await db.run('INSERT INTO products (name, item_number, description, price, category, image_url, in_stock, featured) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [b.name, b.item_number || '', b.description || '', b.price || 0, b.category || '', b.image_url || '', b.in_stock != null ? (Number(b.in_stock) ? 1 : 0) : 1, Number(b.featured) ? 1 : 0]);
      res.json({ product: await db.get('SELECT * FROM products WHERE id = $1', [r.lastInsertRowid]) });
    } catch (e) { res.status(500).json({ error: 'Création impossible.' }); }
  });
  router.put('/api/admin/products/:id', requireAdmin, async function(req, res) {
    try {
      const ex = await db.get('SELECT * FROM products WHERE id = $1', [req.params.id]);
      if (!ex) return res.status(404).json({ error: 'Produit introuvable.' });
      const b = Object.assign({}, ex, req.body || {});
      await db.run('UPDATE products SET name=$1, item_number=$2, description=$3, price=$4, category=$5, image_url=$6, in_stock=$7, featured=$8, updated_at=NOW() WHERE id=$9', [b.name, b.item_number || '', b.description || '', b.price || 0, b.category || '', b.image_url || '', Number(b.in_stock) ? 1 : 0, Number(b.featured) ? 1 : 0, req.params.id]);
      res.json({ product: await db.get('SELECT * FROM products WHERE id = $1', [req.params.id]) });
    } catch (e) { res.status(500).json({ error: 'Mise à jour impossible.' }); }
  });
  router.delete('/api/admin/products/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM products WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try { res.json({ posts: await db.all('SELECT * FROM posts ORDER BY created_at DESC') }); } catch (e) { res.status(500).json({ error: 'Erreur de chargement.' }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.title) return res.status(400).json({ error: 'Le titre est requis.' });
      const r = await db.run('INSERT INTO posts (title, content, category, image_url, published) VALUES ($1,$2,$3,$4,$5) RETURNING id', [b.title, b.content || '', b.category || '', b.image_url || '', b.published != null ? (Number(b.published) ? 1 : 0) : 1]);
      res.json({ post: await db.get('SELECT * FROM posts WHERE id = $1', [r.lastInsertRowid]) });
    } catch (e) { res.status(500).json({ error: 'Création impossible.' }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try {
      const ex = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
      if (!ex) return res.status(404).json({ error: 'Billet introuvable.' });
      const b = Object.assign({}, ex, req.body || {});
      await db.run('UPDATE posts SET title=$1, content=$2, category=$3, image_url=$4, published=$5, updated_at=NOW() WHERE id=$6', [b.title, b.content || '', b.category || '', b.image_url || '', Number(b.published) ? 1 : 0, req.params.id]);
      res.json({ post: await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]) });
    } catch (e) { res.status(500).json({ error: 'Mise à jour impossible.' }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });
  router.get('/api/admin/orders', requireAdmin, async function(req, res) {
    try {
      const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');
      const its = await db.all('SELECT * FROM order_items ORDER BY id');
      const map = {}; (its || []).forEach(function(it) { (map[it.order_id] = map[it.order_id] || []).push(it); });
      (orders || []).forEach(function(o) { o.items = map[o.id] || []; });
      res.json({ orders: orders || [] });
    } catch (e) { res.status(500).json({ error: 'Erreur de chargement.' }); }
  });
  router.post('/api/admin/orders', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const r = await db.run('INSERT INTO orders (customer_name, email, phone, address, city, postal_code, note, status, total) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [b.customer_name || '', b.email || '', b.phone || '', b.address || '', b.city || '', b.postal_code || '', b.note || '', b.status || 'Reçue', b.total || 0]);
      res.json({ order: await db.get('SELECT * FROM orders WHERE id = $1', [r.lastInsertRowid]) });
    } catch (e) { res.status(500).json({ error: 'Création impossible.' }); }
  });
  router.put('/api/admin/orders/:id', requireAdmin, async function(req, res) {
    try {
      const ex = await db.get('SELECT * FROM orders WHERE id = $1', [req.params.id]);
      if (!ex) return res.status(404).json({ error: 'Commande introuvable.' });
      const b = Object.assign({}, ex, req.body || {});
      await db.run('UPDATE orders SET customer_name=$1, email=$2, phone=$3, address=$4, city=$5, postal_code=$6, note=$7, status=$8, total=$9, updated_at=NOW() WHERE id=$10', [b.customer_name || '', b.email || '', b.phone || '', b.address || '', b.city || '', b.postal_code || '', b.note || '', b.status || 'Reçue', b.total || 0, req.params.id]);
      res.json({ order: await db.get('SELECT * FROM orders WHERE id = $1', [req.params.id]) });
    } catch (e) { res.status(500).json({ error: 'Mise à jour impossible.' }); }
  });
  router.delete('/api/admin/orders/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM order_items WHERE order_id = $1', [req.params.id]); await db.run('DELETE FROM orders WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });
  router.get('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try { res.json({ form_submissions: await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC') }); } catch (e) { res.status(500).json({ error: 'Erreur de chargement.' }); }
  });
  router.post('/api/admin/form_submissions', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const r = await db.run('INSERT INTO form_submissions (name, email, message) VALUES ($1,$2,$3) RETURNING id', [b.name || '', b.email || '', b.message || '']);
      res.json({ form_submission: await db.get('SELECT * FROM form_submissions WHERE id = $1', [r.lastInsertRowid]) });
    } catch (e) { res.status(500).json({ error: 'Creation impossible.' }); }
  });
  router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try {
      const ex = await db.get('SELECT * FROM form_submissions WHERE id = $1', [req.params.id]);
      if (!ex) return res.status(404).json({ error: 'Message introuvable.' });
      const b = Object.assign({}, ex, req.body || {});
      await db.run('UPDATE form_submissions SET name=$1, email=$2, message=$3, updated_at=NOW() WHERE id=$4', [b.name || '', b.email || '', b.message || '', req.params.id]);
      res.json({ form_submission: await db.get('SELECT * FROM form_submissions WHERE id = $1', [req.params.id]) });
    } catch (e) { res.status(500).json({ error: 'Mise a jour impossible.' }); }
  });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM form_submissions WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });
  router.get('/api/admin/order_items', requireAdmin, async function(req, res) {
    try { res.json({ order_items: await db.all('SELECT * FROM order_items ORDER BY id') }); } catch (e) { res.status(500).json({ error: 'Erreur de chargement.' }); }
  });
  router.post('/api/admin/order_items', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      const r = await db.run('INSERT INTO order_items (order_id, product_id, product_name, item_number, price, quantity, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [b.order_id || null, b.product_id || null, b.product_name || '', b.item_number || '', b.price || 0, b.quantity || 1, b.image_url || '']);
      res.json({ order_item: await db.get('SELECT * FROM order_items WHERE id = $1', [r.lastInsertRowid]) });
    } catch (e) { res.status(500).json({ error: 'Creation impossible.' }); }
  });
  router.put('/api/admin/order_items/:id', requireAdmin, async function(req, res) {
    try {
      const ex = await db.get('SELECT * FROM order_items WHERE id = $1', [req.params.id]);
      if (!ex) return res.status(404).json({ error: 'Ligne introuvable.' });
      const b = Object.assign({}, ex, req.body || {});
      await db.run('UPDATE order_items SET order_id=$1, product_id=$2, product_name=$3, item_number=$4, price=$5, quantity=$6, image_url=$7, updated_at=NOW() WHERE id=$8', [b.order_id || null, b.product_id || null, b.product_name || '', b.item_number || '', b.price || 0, b.quantity || 1, b.image_url || '', req.params.id]);
      res.json({ order_item: await db.get('SELECT * FROM order_items WHERE id = $1', [req.params.id]) });
    } catch (e) { res.status(500).json({ error: 'Mise a jour impossible.' }); }
  });
  router.delete('/api/admin/order_items/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM order_items WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });
  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try { res.json({ settings: await getSettings() }); } catch (e) { res.status(500).json({ error: 'Erreur de chargement.' }); }
  });
  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const b = req.body || {};
      if (b.settings && typeof b.settings === 'object' && !Array.isArray(b.settings)) {
        for (const k of Object.keys(b.settings)) {
          if (!k) continue;
          await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, b.settings[k] == null ? '' : String(b.settings[k])]);
        }
        return res.json({ success: true });
      }
      if (!b.key) return res.status(400).json({ error: 'Clé manquante.' });
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [b.key, b.value == null ? '' : String(b.value)]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Enregistrement impossible.' }); }
  });
  router.post('/api/admin/generate-image', requireAdmin, async function(req, res) {
    const allowed = ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9'];
    const b = req.body || {};
    if (!b.prompt) return res.status(400).json({ error: 'Décrivez l\'image à générer.' });
    const ar = allowed.indexOf(b.aspectRatio) > -1 ? b.aspectRatio : '4:3';
    try { const imageUrl = await services.ai.generateImage(b.prompt, { aspectRatio: ar }); res.json({ imageUrl: imageUrl }); }
    catch (e) { res.status(500).json({ error: 'Génération impossible. Téléversez une image manuellement.' }); }
  });
  router.use(function(req, res) { if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Introuvable.' }); res.redirect('.'); });
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