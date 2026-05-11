module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;

  const T = {
    fr: {
      nav_home: 'Accueil',
      nav_services: 'Services',
      nav_about: 'À propos',
      nav_contact: 'Contact',
      nav_login: 'Connexion',
      hero_title: 'Un ménage impeccable, à chaque fois',
      hero_subtitle: 'Service professionnel de ménage après construction, commercial et déménagement partout au Québec.',
      hero_cta: 'Réserver maintenant',
      hero_cta2: 'Voir nos services',
      services_title: 'Nos services',
      services_subtitle: 'Des solutions de nettoyage adaptées à vos besoins',
      service_more: 'En savoir plus',
      about_title: 'À propos de Noxa Service',
      about_cta: 'Nous joindre',
      contact_title: 'Contactez-nous',
      contact_subtitle: 'Demandez votre soumission gratuite',
      form_name: 'Nom complet',
      form_email: 'Courriel',
      form_phone: 'Téléphone',
      form_service: 'Type de service',
      form_date: 'Date souhaitée',
      form_address: 'Adresse',
      form_message: 'Détails supplémentaires',
      form_submit: 'Envoyer la demande',
      form_sending: 'Envoi en cours...',
      form_success: 'Merci! Nous vous contacterons sous peu.',
      form_error: 'Une erreur est survenue. Veuillez réessayer.',
      footer_rights: 'Tous droits réservés.',
      footer_phone: 'Téléphone',
      footer_email: 'Courriel',
      testimonials_title: 'Ce que disent nos clients',
      why_title: 'Pourquoi choisir Noxa Service',
      why_1_title: 'Équipe certifiée',
      why_1_desc: 'Personnel formé, assuré et professionnel.',
      why_2_title: 'Produits écologiques',
      why_2_desc: 'Des produits sécuritaires pour vous et l\'environnement.',
      why_3_title: 'Satisfaction garantie',
      why_3_desc: 'Nous ne sommes satisfaits que lorsque vous l\'êtes.',
      why_4_title: 'Devis gratuit',
      why_4_desc: 'Estimation rapide et transparente sans engagement.',
      cta_title: 'Prêt à profiter d\'un espace impeccable?',
      cta_subtitle: 'Obtenez votre soumission gratuite dès aujourd\'hui.',
      cta_btn: 'Demander une soumission',
      enable_notif: 'Activer les notifications'
    }
  };

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const s = {};
      rows.forEach(r => { s[r.key] = r.value; });
      return s;
    } catch(e) { return {}; }
  }

  function applyTextOverrides(t, settings, lang) {
    for (var k in settings) {
      if (k.startsWith('text_') && k.endsWith('_' + lang)) {
        var tKey = k.slice(5, -(lang.length + 1));
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  async function buildLocals() {
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T.fr), settings, 'fr');
    return { lang: 'fr', t, settings };
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  router.get('/', async function(req, res) {
    try {
      const locals = await buildLocals();
      const servicesList = await db.all('SELECT * FROM services WHERE published = 1 ORDER BY display_order ASC, id ASC');
      const testimonials = await db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY created_at DESC LIMIT 6');
      res.render('index', Object.assign(locals, { servicesList, testimonials }));
    } catch(e) {
      console.error('Home route error:', e.message);
      res.status(500).send('Erreur du serveur');
    }
  });

  router.get('/services', async function(req, res) {
    try {
      const locals = await buildLocals();
      const servicesList = await db.all('SELECT * FROM services WHERE published = 1 ORDER BY display_order ASC, id ASC');
      res.render('services', Object.assign(locals, { servicesList }));
    } catch(e) {
      console.error(e.message);
      res.status(500).send('Erreur du serveur');
    }
  });

  router.get('/services/:slug', async function(req, res) {
    try {
      const locals = await buildLocals();
      const service = await db.get('SELECT * FROM services WHERE slug = $1 AND published = 1', [req.params.slug]);
      if (!service) return res.redirect('services');
      const others = await db.all('SELECT * FROM services WHERE slug <> $1 AND published = 1 ORDER BY display_order ASC LIMIT 3', [req.params.slug]);
      res.render('service-detail', Object.assign(locals, { service, others }));
    } catch(e) {
      console.error(e.message);
      res.status(500).send('Erreur du serveur');
    }
  });

  router.get('/a-propos', async function(req, res) {
    try {
      const locals = await buildLocals();
      res.render('about', locals);
    } catch(e) { res.status(500).send('Erreur'); }
  });

  router.get('/contact', async function(req, res) {
    try {
      const locals = await buildLocals();
      const servicesList = await db.all('SELECT id, name FROM services WHERE published = 1 ORDER BY display_order ASC');
      res.render('contact', Object.assign(locals, { servicesList }));
    } catch(e) { res.status(500).send('Erreur'); }
  });

  router.post('/api/reservation', async function(req, res) {
    try {
      const { name, email, phone, service_type, preferred_date, address, message } = req.body || {};
      if (!name || !phone) return res.status(400).json({ error: 'Nom et téléphone requis' });
      await db.run(
        'INSERT INTO reservations (name, email, phone, service_type, preferred_date, address, message, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [name, email || '', phone, service_type || '', preferred_date || null, address || '', message || '', 'nouveau']
      );
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: 'Nouvelle demande de réservation - Noxa Service',
            html: '<h2>Nouvelle demande de réservation</h2>' +
              '<p><strong>Nom:</strong> ' + name + '</p>' +
              '<p><strong>Courriel:</strong> ' + (email||'-') + '</p>' +
              '<p><strong>Téléphone:</strong> ' + phone + '</p>' +
              '<p><strong>Service:</strong> ' + (service_type||'-') + '</p>' +
              '<p><strong>Date souhaitée:</strong> ' + (preferred_date||'-') + '</p>' +
              '<p><strong>Adresse:</strong> ' + (address||'-') + '</p>' +
              '<p><strong>Détails:</strong><br>' + (message||'-').replace(/\n/g,'<br>') + '</p>'
          });
        }
      } catch(emailErr) { console.error('Email failed:', emailErr.message); }
      res.json({ success: true });
    } catch(err) {
      console.error('Reservation error:', err.message);
      res.status(500).json({ error: 'Erreur lors de l\'envoi' });
    }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) {
      if (req.path.startsWith('/api/')) return res.status(403).json({ error: 'Forbidden' });
      return res.redirect('admin/login');
    }
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const userCount = (await db.get('SELECT COUNT(*)::int AS c FROM users')).c || 0;
      const pushCount = (await db.get('SELECT COUNT(*)::int AS c FROM push_subscriptions')).c || 0;
      const totalVisits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c || 0;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'")).c || 0;
      const reservationCount = (await db.get('SELECT COUNT(*)::int AS c FROM reservations')).c || 0;
      const newReservations = (await db.get("SELECT COUNT(*)::int AS c FROM reservations WHERE status = 'nouveau'")).c || 0;
      const serviceCount = (await db.get('SELECT COUNT(*)::int AS c FROM services')).c || 0;
      const testimonialCount = (await db.get('SELECT COUNT(*)::int AS c FROM testimonials')).c || 0;
      const postCount = (await db.get('SELECT COUNT(*)::int AS c FROM posts')).c || 0;
      const recentReservations = await db.all('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 5');
      res.render('admin', {
        stats: { userCount, pushCount, totalVisits, recentVisits, reservationCount, newReservations, serviceCount, testimonialCount, postCount },
        recentReservations
      });
    } catch(e) {
      console.error('Admin dashboard error:', e.message);
      res.status(500).send('Erreur: ' + e.message);
    }
  });

  router.get('/admin/services', requireAdmin, async function(req, res) {
    const items = await db.all('SELECT * FROM services ORDER BY display_order ASC, id ASC');
    res.render('admin-services', { items });
  });

  router.get('/admin/reservations', requireAdmin, async function(req, res) {
    const items = await db.all('SELECT * FROM reservations ORDER BY created_at DESC');
    res.render('admin-reservations', { items });
  });

  router.get('/admin/testimonials', requireAdmin, async function(req, res) {
    const items = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.render('admin-testimonials', { items });
  });

  router.get('/admin/posts', requireAdmin, async function(req, res) {
    const items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
    res.render('admin-posts', { items });
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    const userCount = (await db.get('SELECT COUNT(*)::int AS c FROM users')).c || 0;
    const pushSubscriberCount = (await db.get('SELECT COUNT(*)::int AS c FROM push_subscriptions')).c || 0;
    const totalVisits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c || 0;
    const recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE visited_at > NOW() - INTERVAL '7 days'")).c || 0;
    res.json({ userCount, pushSubscriberCount, totalVisits, recentVisits });
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        {
          key: 'services', label: 'Services', icon: 'package',
          fields: [
            { name: 'name', type: 'text', required: true, maxLength: 100, description: 'Nom du service tel qu\'affiché sur le site.', placeholder: 'ex. Ménage après construction' },
            { name: 'slug', type: 'text', required: true, maxLength: 50, description: 'Identifiant URL unique (sans espaces). Exemple: menage-construction', placeholder: 'menage-construction' },
            { name: 'short_description', type: 'text', required: false, maxLength: 200, description: 'Phrase courte affichée sur la carte de service.', placeholder: 'Nettoyage complet après vos travaux' },
            { name: 'description', type: 'textarea', required: false, description: 'Description complète professionnelle du service. Affichée sur la page détaillée.', placeholder: 'Décrivez en détail ce service...' },
            { name: 'icon', type: 'text', required: false, description: 'Emoji ou icône représentant le service.', placeholder: '🏗️' },
            { name: 'image_url', type: 'image', required: false, description: 'Image illustrant le service. Recommandé: 1200×900px.' },
            { name: 'display_order', type: 'number', required: false, description: 'Ordre d\'affichage (plus petit = en premier).', placeholder: '1', min: 0, step: 1 },
            { name: 'published', type: 'boolean', default: true, description: 'Décochez pour masquer ce service du site.' }
          ]
        },
        {
          key: 'reservations', label: 'Réservations', icon: 'calendar',
          fields: [
            { name: 'name', type: 'text', required: true, description: 'Nom du client.', placeholder: 'Jean Tremblay' },
            { name: 'email', type: 'email', required: false, description: 'Courriel du client.', placeholder: 'client@exemple.com' },
            { name: 'phone', type: 'text', required: true, description: 'Téléphone du client.', placeholder: '438-555-1234' },
            { name: 'service_type', type: 'text', required: false, description: 'Type de service demandé.', placeholder: 'Ménage commercial' },
            { name: 'preferred_date', type: 'date', required: false, description: 'Date souhaitée par le client.' },
            { name: 'address', type: 'text', required: false, description: 'Adresse du lieu à nettoyer.', placeholder: '123 rue Principale' },
            { name: 'message', type: 'textarea', required: false, description: 'Détails supplémentaires fournis par le client.', placeholder: 'Notes additionnelles...' },
            { name: 'status', type: 'select', required: false, options: ['nouveau','contacte','confirme','complete','annule'], default: 'nouveau', description: 'État de la réservation.' }
          ]
        },
        {
          key: 'testimonials', label: 'Témoignages', icon: 'star',
          fields: [
            { name: 'author', type: 'text', required: true, description: 'Nom du client qui témoigne.', placeholder: 'Marie L.' },
            { name: 'role', type: 'text', required: false, description: 'Rôle ou type de client (ex. Propriétaire, Gestionnaire d\'immeuble).', placeholder: 'Propriétaire résidentiel' },
            { name: 'content', type: 'textarea', required: true, description: 'Le témoignage du client.', placeholder: 'Service exceptionnel...' },
            { name: 'rating', type: 'number', required: false, min: 1, max: 5, step: 1, description: 'Note sur 5 étoiles.', placeholder: '5' },
            { name: 'avatar_url', type: 'image', required: false, description: 'Photo du client. Recommandé: carré 200×200px.' },
            { name: 'published', type: 'boolean', default: true, description: 'Décochez pour masquer ce témoignage.' }
          ]
        },
        {
          key: 'posts', label: 'Articles', icon: 'edit',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre de l\'article.', placeholder: 'ex. Conseils pour un ménage écologique' },
            { name: 'content', type: 'textarea', required: false, description: 'Contenu de l\'article.', placeholder: 'Écrivez votre article...' },
            { name: 'image_url', type: 'image', required: false, description: 'Image vedette. Recommandé: 1200×630px.' },
            { name: 'category', type: 'text', required: false, description: 'Catégorie pour regrouper les articles.', placeholder: 'Conseils' },
            { name: 'published', type: 'boolean', default: true, description: 'Décochez pour enregistrer en brouillon.' }
          ]
        }
      ]
    });
  });

  function crud(table, fields) {
    router.get('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        const rows = await db.all('SELECT * FROM ' + table + ' ORDER BY created_at DESC');
        const out = {}; out[table] = rows; res.json(out);
      } catch(e) { res.status(500).json({ error: e.message }); }
    });

    router.post('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        const cols = [], vals = [], placeholders = [];
        let idx = 1;
        fields.forEach(f => {
          if (req.body[f] !== undefined) {
            cols.push(f); vals.push(req.body[f]); placeholders.push('$' + idx); idx++;
          }
        });
        if (cols.length === 0) return res.status(400).json({ error: 'Aucune donnée' });
        const sql = 'INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING id';
        const r = await db.run(sql, vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [r.lastInsertRowid]);
        const out = {}; out[table.slice(0,-1)] = row; res.json(out);
      } catch(e) { res.status(500).json({ error: e.message }); }
    });

    router.put('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        const sets = [], vals = [];
        let idx = 1;
        fields.forEach(f => {
          if (req.body[f] !== undefined) { sets.push(f + ' = $' + idx); vals.push(req.body[f]); idx++; }
        });
        if (sets.length === 0) return res.status(400).json({ error: 'Aucune donnée' });
        sets.push('updated_at = NOW()');
        vals.push(req.params.id);
        const sql = 'UPDATE ' + table + ' SET ' + sets.join(', ') + ' WHERE id = $' + idx;
        await db.run(sql, vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [req.params.id]);
        const out = {}; out[table.slice(0,-1)] = row; res.json(out);
      } catch(e) { res.status(500).json({ error: e.message }); }
    });

    router.delete('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        await db.run('DELETE FROM ' + table + ' WHERE id = $1', [req.params.id]);
        res.json({ success: true });
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
  }

  crud('services', ['name','slug','short_description','description','icon','image_url','display_order','published']);
  crud('reservations', ['name','email','phone','service_type','preferred_date','address','message','status']);
  crud('testimonials', ['author','role','content','rating','avatar_url','published']);
  crud('posts', ['title','content','image_url','category','published']);

  // Explicit CRUD routes for services
  router.get('/api/admin/services', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM services ORDER BY display_order ASC, id ASC'); res.json({ services: rows }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/services', requireAdmin, async function(req, res) {
    try { const { name, slug, short_description, description, icon, image_url, display_order, published } = req.body || {}; if (!name || !slug) return res.status(400).json({ error: 'name et slug requis' }); const r = await db.run('INSERT INTO services (name,slug,short_description,description,icon,image_url,display_order,published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [name, slug, short_description||'', description||'', icon||'', image_url||'', display_order||0, published!==undefined?published:1]); const row = await db.get('SELECT * FROM services WHERE id = $1', [r.lastInsertRowid]); res.json({ service: row }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try { const { name, slug, short_description, description, icon, image_url, display_order, published } = req.body || {}; await db.run('UPDATE services SET name=$1,slug=$2,short_description=$3,description=$4,icon=$5,image_url=$6,display_order=$7,published=$8,updated_at=NOW() WHERE id=$9', [name, slug, short_description||'', description||'', icon||'', image_url||'', display_order||0, published!==undefined?published:1, req.params.id]); const row = await db.get('SELECT * FROM services WHERE id = $1', [req.params.id]); res.json({ service: row }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM services WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Explicit CRUD routes for reservations
  router.get('/api/admin/reservations', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM reservations ORDER BY created_at DESC'); res.json({ reservations: rows }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/reservations', requireAdmin, async function(req, res) {
    try { const { name, email, phone, service_type, preferred_date, address, message, status } = req.body || {}; if (!name || !phone) return res.status(400).json({ error: 'name et phone requis' }); const r = await db.run('INSERT INTO reservations (name,email,phone,service_type,preferred_date,address,message,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [name, email||'', phone, service_type||'', preferred_date||null, address||'', message||'', status||'nouveau']); const row = await db.get('SELECT * FROM reservations WHERE id = $1', [r.lastInsertRowid]); res.json({ reservation: row }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/reservations/:id', requireAdmin, async function(req, res) {
    try { const { name, email, phone, service_type, preferred_date, address, message, status } = req.body || {}; await db.run('UPDATE reservations SET name=$1,email=$2,phone=$3,service_type=$4,preferred_date=$5,address=$6,message=$7,status=$8,updated_at=NOW() WHERE id=$9', [name, email||'', phone, service_type||'', preferred_date||null, address||'', message||'', status||'nouveau', req.params.id]); const row = await db.get('SELECT * FROM reservations WHERE id = $1', [req.params.id]); res.json({ reservation: row }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/reservations/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM reservations WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Explicit CRUD routes for testimonials
  router.get('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC'); res.json({ testimonials: rows }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try { const { author, role, content, rating, avatar_url, published } = req.body || {}; if (!author || !content) return res.status(400).json({ error: 'author et content requis' }); const r = await db.run('INSERT INTO testimonials (author,role,content,rating,avatar_url,published) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [author, role||'', content, rating||5, avatar_url||'', published!==undefined?published:1]); const row = await db.get('SELECT * FROM testimonials WHERE id = $1', [r.lastInsertRowid]); res.json({ testimonial: row }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try { const { author, role, content, rating, avatar_url, published } = req.body || {}; await db.run('UPDATE testimonials SET author=$1,role=$2,content=$3,rating=$4,avatar_url=$5,published=$6,updated_at=NOW() WHERE id=$7', [author, role||'', content, rating||5, avatar_url||'', published!==undefined?published:1, req.params.id]); const row = await db.get('SELECT * FROM testimonials WHERE id = $1', [req.params.id]); res.json({ testimonial: row }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM testimonials WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Explicit CRUD routes for posts
  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM posts ORDER BY created_at DESC'); res.json({ posts: rows }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try { const { title, content, image_url, category, published } = req.body || {}; if (!title) return res.status(400).json({ error: 'title requis' }); const r = await db.run('INSERT INTO posts (title,content,image_url,category,published) VALUES ($1,$2,$3,$4,$5) RETURNING id', [title, content||'', image_url||'', category||'', published!==undefined?published:1]); const row = await db.get('SELECT * FROM posts WHERE id = $1', [r.lastInsertRowid]); res.json({ post: row }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { const { title, content, image_url, category, published } = req.body || {}; await db.run('UPDATE posts SET title=$1,content=$2,image_url=$3,category=$4,published=$5,updated_at=NOW() WHERE id=$6', [title, content||'', image_url||'', category||'', published!==undefined?published:1, req.params.id]); const row = await db.get('SELECT * FROM posts WHERE id = $1', [req.params.id]); res.json({ post: row }); } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    const rows = await db.all('SELECT key, value FROM admin_settings');
    const out = {};
    rows.forEach(r => { out[r.key] = r.value; });
    res.json(out);
  });

  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'key requis' });
      await db.run(
        'INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
        [key, value || '']
      );
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
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
