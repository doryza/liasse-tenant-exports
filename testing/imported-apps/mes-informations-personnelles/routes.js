module.exports = function(services) {
const router = require('express').Router();
const db = services.db;

const T = {
fr: {
site_name: 'Soutien AA', tagline: 'Ensemble, un jour à la fois',
nav_home: 'Accueil', nav_coordonnees: 'Mes coordonnées', nav_ressources: 'Ressources', nav_reunions: 'Réunions', nav_temoignages: 'Partages', nav_contact: 'Contact',
login: 'Connexion', menu: 'Menu', close: 'Fermer',
hero_title: 'Vous n\'êtes pas seul', hero_subtitle: 'Un espace de soutien confidentiel pour les membres AA et ceux qui cherchent de l\'aide.',
hero_cta_help: 'Obtenir de l\'aide', hero_cta_contact: 'Me contacter',
mission_title: 'Notre engagement', mission_text: 'Offrir un soutien fraternel, partager des ressources et accompagner toute personne aux prises avec l\'alcool, en respectant l\'anonymat le plus complet.',
feat1_title: 'Confidentialité', feat1_text: 'Chaque échange est protégé. Votre vie privée est sacrée.',
feat2_title: 'Écoute', feat2_text: 'Une oreille attentive, sans jugement, à tout moment.',
feat3_title: 'Communauté', feat3_text: 'Vous faites partie d\'une fraternité bienveillante.',
need_help: 'Besoin d\'aide maintenant?', need_help_text: 'N\'hésitez pas à me joindre. Une seule conversation peut tout changer.',
see_more: 'Voir plus', see_all: 'Tout voir', back_home: 'Retour à l\'accueil',
coord_title: 'Mes coordonnées', coord_intro: 'Voici comment me joindre directement. Tout ce que vous partagez avec moi reste strictement confidentiel.',
coord_phone: 'Téléphone', coord_email: 'Courriel', coord_availability: 'Disponibilité', coord_location: 'Région',
coord_call_btn: 'Appeler', coord_email_btn: 'Envoyer un courriel', coord_save: 'Ajouter à mes contacts',
res_title: 'Ressources et liens utiles', res_intro: 'Des ressources soigneusement sélectionnées pour vous accompagner.',
res_visit: 'Visiter le site', res_no_link: 'Information',
reu_title: 'Horaire des réunions', reu_intro: 'Trouvez une réunion près de chez vous.',
reu_day: 'Jour', reu_time: 'Heure', reu_location: 'Lieu', reu_type: 'Type', reu_address: 'Adresse',
tem_title: 'Partages et témoignages', tem_intro: 'Des messages d\'espoir et d\'expérience.',
tem_by: 'Par', tem_read: 'Lire',
contact_title: 'Me contacter', contact_intro: 'Envoyez-moi un message confidentiel. Je vous répondrai dès que possible.',
contact_name: 'Votre prénom (ou anonyme)', contact_email: 'Courriel (optionnel)', contact_phone: 'Téléphone (optionnel)', contact_message: 'Votre message',
contact_send: 'Envoyer le message', contact_sending: 'Envoi...', contact_success: 'Message envoyé. Je vous répondrai dès que possible.', contact_error: 'Une erreur est survenue. Veuillez réessayer.',
footer_copyright: 'Tous droits réservés', footer_anonymity: 'Anonymat respecté en tout temps', footer_links: 'Liens',
empty_resources: 'Aucune ressource disponible pour le moment.', empty_meetings: 'Aucune réunion publiée pour le moment.', empty_posts: 'Aucun partage disponible pour le moment.',
emergency_title: 'Lignes d\'aide 24/7',
enable_notif: 'Activer les notifications', notif_text: 'Recevez les nouveaux partages et annonces.',
lang_label: 'Langue', cta_subscribe: 'Rester informé'
},
en: {
site_name: 'AA Support', tagline: 'Together, one day at a time',
nav_home: 'Home', nav_coordonnees: 'My Contact Info', nav_ressources: 'Resources', nav_reunions: 'Meetings', nav_temoignages: 'Shares', nav_contact: 'Contact',
login: 'Sign In', menu: 'Menu', close: 'Close',
hero_title: 'You are not alone', hero_subtitle: 'A confidential support space for AA members and those seeking help.',
hero_cta_help: 'Get help', hero_cta_contact: 'Contact me',
mission_title: 'Our commitment', mission_text: 'Provide fellowship, share resources, and support anyone struggling with alcohol, with the strictest anonymity.',
feat1_title: 'Confidentiality', feat1_text: 'Every exchange is protected. Your privacy is sacred.',
feat2_title: 'Listening', feat2_text: 'A caring ear, without judgment, anytime.',
feat3_title: 'Community', feat3_text: 'You are part of a caring fellowship.',
need_help: 'Need help now?', need_help_text: 'Reach out at any time. One conversation can change everything.',
see_more: 'See more', see_all: 'See all', back_home: 'Back to home',
coord_title: 'My Contact Info', coord_intro: 'Here is how to reach me directly. Anything you share with me remains strictly confidential.',
coord_phone: 'Phone', coord_email: 'Email', coord_availability: 'Availability', coord_location: 'Area',
coord_call_btn: 'Call', coord_email_btn: 'Send an email', coord_save: 'Add to contacts',
res_title: 'Resources & helpful links', res_intro: 'Carefully selected resources to support you.',
res_visit: 'Visit website', res_no_link: 'Information',
reu_title: 'Meeting schedule', reu_intro: 'Find a meeting near you.',
reu_day: 'Day', reu_time: 'Time', reu_location: 'Location', reu_type: 'Type', reu_address: 'Address',
tem_title: 'Shares & testimonials', tem_intro: 'Messages of hope and experience.',
tem_by: 'By', tem_read: 'Read',
contact_title: 'Contact me', contact_intro: 'Send me a confidential message. I will reply as soon as possible.',
contact_name: 'Your first name (or anonymous)', contact_email: 'Email (optional)', contact_phone: 'Phone (optional)', contact_message: 'Your message',
contact_send: 'Send message', contact_sending: 'Sending...', contact_success: 'Message sent. I will reply soon.', contact_error: 'An error occurred. Please try again.',
footer_copyright: 'All rights reserved', footer_anonymity: 'Anonymity respected at all times', footer_links: 'Links',
empty_resources: 'No resources available yet.', empty_meetings: 'No meetings published yet.', empty_posts: 'No shares available yet.',
emergency_title: '24/7 Helplines',
enable_notif: 'Enable notifications', notif_text: 'Get new shares and announcements.',
lang_label: 'Language', cta_subscribe: 'Stay informed'
}
};

function applyTextOverrides(t, settings, lang) {
for (var k in settings) {
if (k.indexOf('text_') === 0 && k.lastIndexOf('_' + lang) === k.length - lang.length - 1) {
var tKey = k.slice(5, -(lang.length + 1));
if (tKey) t[tKey] = settings[k];
}
}
return t;
}

async function getSettings() {
const rows = await db.all('SELECT key, value FROM admin_settings');
const out = {};
for (const r of rows) out[r.key] = r.value;
return out;
}

function formatDate(d, lang) { try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year:'numeric', month:'long', day:'numeric' }); } catch(e) { return ''; } }

router.use(function(req, res, next) {
let lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
if (lang !== 'fr' && lang !== 'en') lang = 'fr';
if (req.query.lang) res.cookie('pwa_lang', lang, { maxAge: 365*24*60*60*1000, httpOnly: false });
req.lang = lang;
next();
});

router.use(async function(req, res, next) {
if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
}
next();
});

async function ctx(req) {
const settings = await getSettings();
const t = applyTextOverrides(Object.assign({}, T[req.lang] || T.fr), settings, req.lang);
return { lang: req.lang, t, settings, user: req.user || null, formatDate: function(d){ return formatDate(d, req.lang); } };
}

router.get('/', services.auth.optionalAuth, async function(req, res) {
try {
const base = await ctx(req);
const posts = await db.all("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3");
const ressources = await db.all('SELECT * FROM ressources ORDER BY created_at DESC LIMIT 3');
res.render('index', Object.assign(base, { posts, ressources }));
} catch(err) { console.error(err); res.status(500).send('Erreur'); }
});

router.get('/coordonnees', services.auth.optionalAuth, async function(req, res) {
const base = await ctx(req);
res.render('coordonnees', base);
});

router.get('/ressources', services.auth.optionalAuth, async function(req, res) {
const base = await ctx(req);
const ressources = await db.all('SELECT * FROM ressources ORDER BY category, created_at DESC');
res.render('ressources', Object.assign(base, { ressources }));
});

router.get('/reunions', services.auth.optionalAuth, async function(req, res) {
const base = await ctx(req);
const dayOrder = "CASE day WHEN 'Lundi' THEN 1 WHEN 'Monday' THEN 1 WHEN 'Mardi' THEN 2 WHEN 'Tuesday' THEN 2 WHEN 'Mercredi' THEN 3 WHEN 'Wednesday' THEN 3 WHEN 'Jeudi' THEN 4 WHEN 'Thursday' THEN 4 WHEN 'Vendredi' THEN 5 WHEN 'Friday' THEN 5 WHEN 'Samedi' THEN 6 WHEN 'Saturday' THEN 6 WHEN 'Dimanche' THEN 7 WHEN 'Sunday' THEN 7 ELSE 8 END";
const reunions = await db.all('SELECT * FROM reunions ORDER BY ' + dayOrder + ', time');
res.render('reunions', Object.assign(base, { reunions }));
});

router.get('/temoignages', services.auth.optionalAuth, async function(req, res) {
const base = await ctx(req);
const posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC');
res.render('temoignages', Object.assign(base, { posts }));
});

router.get('/temoignages/:id', services.auth.optionalAuth, async function(req, res) {
const base = await ctx(req);
const post = await db.get('SELECT * FROM posts WHERE id=$1 AND published=1', [req.params.id]);
if (!post) return res.redirect('temoignages');
res.render('temoignage-detail', Object.assign(base, { post }));
});

router.get('/contact', services.auth.optionalAuth, async function(req, res) {
const base = await ctx(req);
res.render('contact', base);
});

router.post('/api/contact', async function(req, res) {
try {
const { name, email, phone, message } = req.body;
if (!name || !message) return res.status(400).json({ error: 'Champs requis manquants' });
await db.run('INSERT INTO form_submissions (name, email, phone, message) VALUES ($1,$2,$3,$4)', [name, email||'', phone||'', message]);
try {
if (services.config.contactEmail) {
await services.email.send({
to: services.config.contactEmail,
subject: 'Nouveau message - Soutien AA',
html: '<h2>Nouveau message</h2><p><strong>De:</strong> ' + name + '</p><p><strong>Courriel:</strong> ' + (email||'-') + '</p><p><strong>Téléphone:</strong> ' + (phone||'-') + '</p><p><strong>Message:</strong></p><p>' + String(message).replace(/\n/g,'<br>') + '</p>'
});
}
} catch(e) { console.error('Email failed:', e.message); }
res.json({ success: true });
} catch(err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
});

function requireAdmin(req, res, next) {
if (!services.admin.isAdmin(req)) {
if (req.path.startsWith('/api')) return res.status(403).json({ error: 'Forbidden' });
return res.redirect('admin/login');
}
next();
}

router.get('/admin', async function(req, res) {
if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
const base = await ctx(req);
const userCount = await services.auth.getUserCount();
const pushCount = await services.push.getSubscriptionCount();
const totalVisits = (await db.get('SELECT COUNT(*) as c FROM site_visits')).c || 0;
const recentVisits = (await db.get("SELECT COUNT(*) as c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c || 0;
const postCount = (await db.get('SELECT COUNT(*) as c FROM posts')).c || 0;
const resCount = (await db.get('SELECT COUNT(*) as c FROM ressources')).c || 0;
const reunCount = (await db.get('SELECT COUNT(*) as c FROM reunions')).c || 0;
const msgCount = (await db.get('SELECT COUNT(*) as c FROM form_submissions')).c || 0;
const unread = (await db.get('SELECT COUNT(*) as c FROM form_submissions WHERE read_at IS NULL')).c || 0;
const recentMessages = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5');
res.render('admin', Object.assign(base, { stats: { userCount, pushCount, totalVisits, recentVisits, postCount, resCount, reunCount, msgCount, unread }, recentMessages }));
});

router.get('/admin/temoignages', requireAdmin, async function(req, res) {
const base = await ctx(req);
res.render('admin-temoignages', base);
});
router.get('/admin/ressources', requireAdmin, async function(req, res) {
const base = await ctx(req);
res.render('admin-ressources', base);
});
router.get('/admin/reunions', requireAdmin, async function(req, res) {
const base = await ctx(req);
res.render('admin-reunions', base);
});
router.get('/admin/messages', requireAdmin, async function(req, res) {
const base = await ctx(req);
const messages = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
res.render('admin-messages', Object.assign(base, { messages }));
});

router.get('/api/admin/stats', requireAdmin, async function(req, res) {
const userCount = await services.auth.getUserCount();
const pushSubscriberCount = await services.push.getSubscriptionCount();
const totalVisits = (await db.get('SELECT COUNT(*) as c FROM site_visits')).c || 0;
const recentVisits = (await db.get("SELECT COUNT(*) as c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c || 0;
res.json({ userCount, pushSubscriberCount, totalVisits, recentVisits });
});

router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
const submissions = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
res.json({ submissions });
});

router.post('/api/admin/messages/:id/read', requireAdmin, async function(req, res) {
await db.run('UPDATE form_submissions SET read_at = NOW() WHERE id=$1', [req.params.id]);
res.json({ success: true });
});
router.delete('/api/admin/messages/:id', requireAdmin, async function(req, res) {
await db.run('DELETE FROM form_submissions WHERE id=$1', [req.params.id]);
res.json({ success: true });
});

router.get('/api/admin/form_submissions', requireAdmin, function(req, res) { crudList('form_submissions', req, res).catch(e=>res.status(500).json({error:e.message})); });
router.get('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
try {
const row = await crudGet('form_submissions', req.params.id);
if (!row) return res.status(404).json({ error: 'Not found' });
res.json({ form_submission: row });
} catch(e) { res.status(500).json({ error: e.message }); }
});
router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
try {
const { read_at } = req.body;
await db.run('UPDATE form_submissions SET read_at=$1 WHERE id=$2', [read_at||null, req.params.id]);
const row = await crudGet('form_submissions', req.params.id);
res.json({ form_submission: row });
} catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req, res) {
try {
await db.run('DELETE FROM form_submissions WHERE id=$1', [req.params.id]);
res.json({ success: true });
} catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/admin/modules', requireAdmin, function(req, res) {
res.json({
modules: [
{ key: 'posts', label: 'Partages', icon: 'edit', fields: [
{ name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre du partage ou témoignage affiché sur le site.', placeholder: 'ex: Un jour à la fois' },
{ name: 'author', type: 'text', required: false, maxLength: 100, description: 'Auteur du partage. Utilisez un prénom seulement ou "Anonyme" pour respecter l\'anonymat.', placeholder: 'ex: Anonyme' },
{ name: 'content', type: 'textarea', required: true, description: 'Contenu complet du partage. Soyez authentique et inspirant.', placeholder: 'Écrivez le message ici...' },
{ name: 'image_url', type: 'image', required: false, description: 'Image illustrative (optionnelle). Recommandé: 1200×630px paysage.' },
{ name: 'category', type: 'select', required: false, options: ['Espoir','Expérience','Force','Étapes','Méditation'], description: 'Catégorie du partage pour faciliter la navigation.' },
{ name: 'published', type: 'boolean', default: true, description: 'Décochez pour sauvegarder comme brouillon (non visible aux visiteurs).' }
]},
{ key: 'ressources', label: 'Ressources', icon: 'list', fields: [
{ name: 'title', type: 'text', required: true, maxLength: 200, description: 'Nom de la ressource (organisme, ligne d\'aide, document).', placeholder: 'ex: AA Québec' },
{ name: 'description', type: 'textarea', required: false, description: 'Brève description de la ressource et de ce qu\'elle offre.', placeholder: 'ex: Aide 24h/24 pour les personnes aux prises avec l\'alcool' },
{ name: 'url', type: 'url', required: false, description: 'Lien web ou numéro de téléphone (tel:1-800-...).', placeholder: 'https://aa-quebec.org' },
{ name: 'phone', type: 'text', required: false, description: 'Numéro de téléphone (si applicable).', placeholder: '1-866-376-6378' },
{ name: 'category', type: 'select', required: false, options: ['Urgence','AA','Soutien','Famille','Lecture','Méditation'], description: 'Type de ressource.' },
{ name: 'image_url', type: 'image', required: false, description: 'Logo ou image. Recommandé: carré 400×400px.' }
]},
{ key: 'reunions', label: 'Réunions', icon: 'calendar', fields: [
{ name: 'day', type: 'select', required: true, options: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'], description: 'Jour de la semaine de la réunion.' },
{ name: 'time', type: 'text', required: true, maxLength: 20, description: 'Heure de la réunion (format libre).', placeholder: 'ex: 19h30' },
{ name: 'location', type: 'text', required: true, maxLength: 200, description: 'Nom du lieu (ex: Église Saint-Joseph).', placeholder: 'ex: Centre communautaire' },
{ name: 'address', type: 'text', required: false, maxLength: 300, description: 'Adresse complète du lieu.', placeholder: 'ex: 123 rue Principale, Québec' },
{ name: 'type', type: 'select', required: false, options: ['Ouverte','Fermée','Discussion','Étapes','Tradition','Débutants'], description: 'Type de réunion AA.' },
{ name: 'notes', type: 'textarea', required: false, description: 'Notes additionnelles (accessibilité, instructions, etc.).', placeholder: '' },
{ name: 'image_url', type: 'image', required: false, description: 'Image du lieu (optionnelle).' }
]},
{ key: 'form_submissions', label: 'Messages reçus', icon: 'mail', readOnly: true, fields: [
{ name: 'name', type: 'text', required: false, maxLength: 200, description: 'Prénom ou pseudonyme de l\'expéditeur.' },
{ name: 'email', type: 'text', required: false, maxLength: 200, description: 'Adresse courriel de l\'expéditeur (optionnelle).' },
{ name: 'phone', type: 'text', required: false, maxLength: 50, description: 'Numéro de téléphone de l\'expéditeur (optionnel).' },
{ name: 'message', type: 'textarea', required: false, description: 'Contenu du message envoyé via le formulaire de contact.' },
{ name: 'read_at', type: 'text', required: false, description: 'Date et heure de lecture du message (vide si non lu).' }
]}
]
});
});

async function crudList(table, req, res) {
const rows = await db.all('SELECT * FROM ' + table + ' ORDER BY created_at DESC');
const out = {}; out[table] = rows;
res.json(out);
}
async function crudGet(table, id) { return await db.get('SELECT * FROM ' + table + ' WHERE id=$1', [id]); }

router.get('/api/admin/posts', requireAdmin, function(req, res) { crudList('posts', req, res).catch(e=>res.status(500).json({error:e.message})); });
router.post('/api/admin/posts', requireAdmin, async function(req, res) {
try {
const { title, author, content, image_url, category, published } = req.body;
const r = await db.run('INSERT INTO posts (title, author, content, image_url, category, published) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [title||'', author||'Anonyme', content||'', image_url||'', category||'', published===false?0:1]);
const post = await crudGet('posts', r.lastInsertRowid);
res.json({ post });
} catch(e) { res.status(500).json({ error: e.message }); }
});
router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
try {
const { title, author, content, image_url, category, published } = req.body;
await db.run('UPDATE posts SET title=$1, author=$2, content=$3, image_url=$4, category=$5, published=$6, updated_at=NOW() WHERE id=$7', [title||'', author||'', content||'', image_url||'', category||'', published===false?0:1, req.params.id]);
const post = await crudGet('posts', req.params.id);
res.json({ post });
} catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
await db.run('DELETE FROM posts WHERE id=$1', [req.params.id]);
res.json({ success: true });
});

router.get('/api/admin/ressources', requireAdmin, function(req, res) { crudList('ressources', req, res).catch(e=>res.status(500).json({error:e.message})); });
router.post('/api/admin/ressources', requireAdmin, async function(req, res) {
try {
const { title, description, url, phone, category, image_url } = req.body;
const r = await db.run('INSERT INTO ressources (title, description, url, phone, category, image_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [title||'', description||'', url||'', phone||'', category||'', image_url||'']);
const row = await crudGet('ressources', r.lastInsertRowid);
res.json({ ressource: row });
} catch(e) { res.status(500).json({ error: e.message }); }
});
router.put('/api/admin/ressources/:id', requireAdmin, async function(req, res) {
try {
const { title, description, url, phone, category, image_url } = req.body;
await db.run('UPDATE ressources SET title=$1, description=$2, url=$3, phone=$4, category=$5, image_url=$6, updated_at=NOW() WHERE id=$7', [title||'', description||'', url||'', phone||'', category||'', image_url||'', req.params.id]);
const row = await crudGet('ressources', req.params.id);
res.json({ ressource: row });
} catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/api/admin/ressources/:id', requireAdmin, async function(req, res) {
await db.run('DELETE FROM ressources WHERE id=$1', [req.params.id]);
res.json({ success: true });
});

router.get('/api/admin/reunions', requireAdmin, function(req, res) { crudList('reunions', req, res).catch(e=>res.status(500).json({error:e.message})); });
router.post('/api/admin/reunions', requireAdmin, async function(req, res) {
try {
const { day, time, location, address, type, notes, image_url } = req.body;
const r = await db.run('INSERT INTO reunions (day, time, location, address, type, notes, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [day||'', time||'', location||'', address||'', type||'', notes||'', image_url||'']);
const row = await crudGet('reunions', r.lastInsertRowid);
res.json({ reunion: row });
} catch(e) { res.status(500).json({ error: e.message }); }
});
router.put('/api/admin/reunions/:id', requireAdmin, async function(req, res) {
try {
const { day, time, location, address, type, notes, image_url } = req.body;
await db.run('UPDATE reunions SET day=$1, time=$2, location=$3, address=$4, type=$5, notes=$6, image_url=$7, updated_at=NOW() WHERE id=$8', [day||'', time||'', location||'', address||'', type||'', notes||'', image_url||'', req.params.id]);
const row = await crudGet('reunions', req.params.id);
res.json({ reunion: row });
} catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/api/admin/reunions/:id', requireAdmin, async function(req, res) {
await db.run('DELETE FROM reunions WHERE id=$1', [req.params.id]);
res.json({ success: true });
});

router.get('/api/admin/settings', requireAdmin, async function(req, res) {
const rows = await db.all('SELECT key, value FROM admin_settings');
const out = {}; for (const r of rows) out[r.key] = r.value;
res.json({ settings: out });
});
router.put('/api/admin/settings', requireAdmin, async function(req, res) {
const { key, value } = req.body;
if (!key) return res.status(400).json({ error: 'Missing key' });
await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()', [key, value||'']);
res.json({ success: true });
});

  // === voice-module-v1 START ===
  router.get('/voice-assistant', services.auth.optionalAuth, async function(req, res, next) {
    // Reuse the tenant's existing prepareRender helper if it's defined in
    // this routes.js — that gives the voice EJS the same locals every other
    // tenant page receives (lang, t, settings, formatDate, ...) so that
    // partials/header and partials/footer render correctly. Falls back to
    // a plain locals object when the tenant's routes.js doesn't expose it,
    // which is fine because the voice EJS reads settings/business via
    // typeof guards and the platform wraps res.render's locals in a Proxy
    // that returns a safe default for missing keys.
    // The local `tenantLocals` name avoids shadowing the outer `ctx` function
    // (this tenant's locals helper is named `ctx`, not `prepareRender`); a
    // `var ctx = {}` here would have hidden it from the `typeof ctx` check.
    var tenantLocals = {};
    if (typeof prepareRender === 'function') {
      try { tenantLocals = await prepareRender(req, res, { pageTitle: 'Voice Assistant' }); } catch (_) { tenantLocals = {}; }
    } else if (typeof ctx === 'function') {
      try { tenantLocals = await ctx(req); } catch (_) { tenantLocals = {}; }
    }
    // Three-layer locals: defaults < ctx (prepareRender output) < hard overrides.
    //
    // The platform's res.render wraps locals in a Proxy that returns [] for
    // missing keys, so a partial that simply references `t` or `lang` won't
    // ReferenceError — but `[]` is an awkward placeholder for an i18n
    // dictionary or a language code, and patterns like `<html lang="<%= lang %>">`
    // would render `<html lang="">`. Pre-populating sensible empty defaults
    // for the names tenant partials most commonly reach for (matches the
    // conventions in claudeGeneratorService — see the i18n+ helpers section
    // there) lets partials interpolate them as expected. `ctx` (when
    // prepareRender exists and ran) wins over these defaults; the voice
    // page's own page/pageTitle/active/business keys win over both.
    var voiceLocals = Object.assign({
      t: {},
      lang: 'fr',
      settings: {},
      currentPage: null,
      user: req.tenantUser || null,
      formatDate: function(d) { return d == null ? '' : String(d); },
    }, tenantLocals, {
      business: (services.config && services.config.business) || services.business || {},
      tenantUser: req.tenantUser || null,
      // Tenants whose partials/header references per-route locals (page,
      // pageTitle, active — common pattern for highlighting nav items)
      // would otherwise throw ReferenceError under EJS strict mode. Pass
      // safe defaults so the partial renders cleanly.
      page: 'voice-assistant',
      pageTitle: 'Voice Assistant',
      active: 'voice-assistant',
    });
    // res.render with a callback catches BOTH sync and async EJS errors —
    // a bare try/catch around res.render() does NOT catch the async path,
    // and any error there propagates to next(err) which the platform's
    // tenant error boundary turns into a "Something Went Wrong" page. With
    // this callback we own the failure mode: log the render error, then
    // serve a minimal branded "temporarily unavailable" shell. Don't
    // include a non-functional mic button — the only reason render failed
    // is that the tenant's partials/header or partials/footer throw under
    // EJS strict mode (e.g. by referencing a local the route did not set);
    // even if we duplicated the voice JS we cannot fix the partial. So we
    // fail loudly to the operator (console.error + 5xx-equivalent log) and
    // softly to the visitor.
    res.render('voice-assistant', voiceLocals, function(err, html) {
      if (!err) return res.send(html);
      console.error('[voice-assistant render]', err && err.stack || err);
      var brand = (voiceLocals.business && voiceLocals.business.primaryColor)
        || (voiceLocals.settings && voiceLocals.settings.primary_color)
        || '#8b5cf6';
      var lng = (typeof voiceLocals.lang === 'string' && voiceLocals.lang === 'en') ? 'en' : 'fr';
      var T = lng === 'en'
        ? { title: 'Voice Assistant', heading: 'Voice assistant is being set up', sub: 'Our voice assistant is currently being prepared. Please check back shortly.' }
        : { title: 'Assistant vocal', heading: "L'assistant vocal est en cours de configuration", sub: "Notre assistant vocal est en cours de préparation. Veuillez revenir sous peu." };
      var fallback = '<!DOCTYPE html><html lang="' + lng + '"><head><meta charset="utf-8">'
        + '<meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<title>' + T.title + '</title>'
        + '<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f9fafb;color:#111827;'
        + 'min-height:100vh;display:flex;align-items:center;justify-content:center}'
        + '.va-wrap{max-width:32rem;padding:2.5rem 1.5rem;text-align:center}'
        + '.va-icon{width:4rem;height:4rem;margin:0 auto 1.5rem;border-radius:9999px;display:inline-flex;'
        + 'align-items:center;justify-content:center;color:#fff;background:' + brand + '}'
        + 'h1{font-size:1.5rem;letter-spacing:-.02em;margin:0 0 .75rem;color:#111827}'
        + 'p{color:#6b7280;margin:0;line-height:1.5}</style></head><body>'
        + '<main class="va-wrap"><div class="va-icon">'
        + '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>'
        + '</div><h1>' + T.heading + '</h1><p>' + T.sub + '</p></main></body></html>';
      // 200, not 500 — visitors see a calm "we're setting this up" page,
      // not a scary error. The render error is in the server log; the
      // operator's dashboard shows the install status and a re-install link.
      res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(fallback);
      // Pipe the error through next(err) AFTER sending the response so the
      // platform's tenant-route error capturer (errorCapturingNext in
      // subscriberPwaRouter) can write it to the runtime-errors table for the
      // operator's dashboard. The capturer guards on res.headersSent so it
      // won't try to send a competing error page; we just want the DB write.
      try { next(err); } catch (_) {}
    });
  });

  router.post('/voice-assistant/start', services.auth.optionalAuth, async function(req, res) {
    try {
      var endUserId = req.tenantUser ? req.tenantUser.id : null;
      var result = await services.voiceTokenMint.mint({ endUserId: endUserId, ip: req.ip });
      if (!result.ok) return res.status(result.status || 400).json({ error: result.error, reason: result.reason });
      res.json({
        token: result.token,
        model: result.model,
        expireTime: result.expireTime,
        sessionId: result.sessionId,
        maxSeconds: result.maxSeconds,
      });
    } catch (err) {
      res.status(503).json({ error: 'voice_unavailable', detail: err.message });
    }
  });

  router.post('/voice-assistant/finalize', services.auth.optionalAuth, async function(req, res) {
    try {
      var body = req.body || {};
      var result = await services.voiceTokenMint.finalize({
        sessionId: body.sessionId,
        durationMs: body.durationMs,
        inputTokens: body.inputTokens,
        outputTokens: body.outputTokens,
        abortReason: body.abortReason || null,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'finalize_failed', detail: err.message });
    }
  });

  router.post('/voice-assistant/submit', services.auth.optionalAuth, async function(req, res) {
    try {
      var fields = req.body || {};
      // services.db exposes the SQLite-style API (.run / .get / .all) —
      // .query is NOT defined and earlier installs hit a TypeError on
      // submit. Use db.run for INSERTs to match the rest of the tenant
      // routes.js pattern.
      await services.db.run(
        'INSERT INTO voice_submissions (user_id, fields, language, status, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [(req.tenantUser && req.tenantUser.id) || null, JSON.stringify(fields), 'both', 'new']
      );

      // Helpers for HTML email composition. Inline because routes.js has
      // no module-level utilities and we want this self-contained.
      function vsEscapeHtml(s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      }
      function vsPrettyLabel(k) {
        return String(k).replace(/[_-]+/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
      }

      // Build one HTML rows block — both emails reuse it. Empty / non-
      // string values are skipped so the table doesn't show blank rows.
      var rowsHtml = '';
      for (var fk in fields) {
        if (Object.prototype.hasOwnProperty.call(fields, fk)) {
          var fv = fields[fk];
          if (typeof fv !== 'string' || !fv.trim()) continue;
          rowsHtml += '<tr>'
            + '<td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;font-size:14px;width:35%;vertical-align:top">' + vsEscapeHtml(vsPrettyLabel(fk)) + '</td>'
            + '<td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;white-space:pre-wrap">' + vsEscapeHtml(fv.trim()) + '</td>'
            + '</tr>';
        }
      }
      if (!rowsHtml) {
        rowsHtml = '<tr><td colspan="2" style="padding:10px 14px;color:#9ca3af;font-size:14px;font-style:italic">(no fields submitted)</td></tr>';
      }

      // Tenant branding for the visitor email + tenant app mention in
      // the lead email. Defensive defaults so a missing config doesn't
      // crash the send.
      var tenantName = (services.config && (services.config.businessName || services.config.displayName)) || 'this app';
      var brandColor = (services.config && services.config.business && services.config.business.primaryColor) || '#8b5cf6';
      var brandLogo = (services.config && services.config.business && services.config.business.logoUrl) || null;

      // Find a visitor email — scan submitted values for the first
      // email-shaped string. Tenants pick their own field keys
      // (`email`, `courriel`, `client_email`…) so key-matching is
      // unreliable; value-matching is robust.
      var visitorEmail = null;
      for (var vk in fields) {
        if (typeof fields[vk] === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[vk].trim())) {
          visitorEmail = fields[vk].trim();
          break;
        }
      }

      // 1) LEAD email — Liasse-platform branded with mention of the
      //    tenant app, formatted as an HTML table for legibility.
      var leadEmail = 'yves.gagnon70@gmail.com';
      if (leadEmail && services.email && services.email.send) {
        var leadReplyLine = visitorEmail
          ? '<p style="margin:0 0 18px 0;color:#374151;font-size:15px;line-height:1.55">A visitor just submitted your AI voice assistant form. Their details are below — reply directly to <a href="mailto:' + vsEscapeHtml(visitorEmail) + '" style="color:#7c3aed;text-decoration:none;font-weight:600">' + vsEscapeHtml(visitorEmail) + '</a> to follow up.</p>'
          : '<p style="margin:0 0 18px 0;color:#374151;font-size:15px;line-height:1.55">A visitor just submitted your AI voice assistant form. Their details are below.</p>';
        var leadHtml = ''
          + '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f3f4f6;padding:24px 12px">'
          + '<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 6px -1px rgba(0,0,0,0.06)">'
          + '<div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:22px 26px;color:#ffffff">'
          + '<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.85">Liasse · Voice Assistant</div>'
          + '<div style="font-size:20px;font-weight:700;margin-top:6px;letter-spacing:-0.01em">' + vsEscapeHtml(tenantName) + ' — new lead</div>'
          + '</div>'
          + '<div style="padding:24px 26px">'
          + leadReplyLine
          + '<table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">' + rowsHtml + '</table>'
          + '</div>'
          + '<div style="padding:14px 26px;border-top:1px solid #e5e7eb;background:#f9fafb;color:#6b7280;font-size:12px;line-height:1.4">Sent by your Liasse Voice Assistant module · <a href="https://liasse.tech" style="color:#7c3aed;text-decoration:none">liasse.tech</a></div>'
          + '</div>'
          + '</div>';
        try {
          await services.email.send({
            to: leadEmail,
            subject: '[' + tenantName + '] New voice submission' + (visitorEmail ? ' from ' + visitorEmail : ''),
            html: leadHtml,
          });
        } catch (_) { /* non-fatal */ }
      }

      // 2) VISITOR confirmation — tenant-app-branded (logo if available,
      //    otherwise the tenant name as a header), with their submission
      //    inlined so they have a paper trail.
      if (visitorEmail && services.email && services.email.send) {
        var visitorNameVal = null;
        for (var nk in fields) {
          if (typeof fields[nk] === 'string' && /^(name|nom|fullname|full[_-]?name|firstname|first[_-]?name|prenom)$/i.test(nk)) {
            visitorNameVal = fields[nk].trim();
            break;
          }
        }
        var visitorHeaderInner = brandLogo
          ? '<img src="' + vsEscapeHtml(brandLogo) + '" alt="' + vsEscapeHtml(tenantName) + '" style="max-height:42px;max-width:180px;display:block;margin-bottom:8px"/>'
          : '<div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:4px;letter-spacing:-0.01em">' + vsEscapeHtml(tenantName) + '</div>';
        var greeting = visitorNameVal
          ? 'Hi ' + vsEscapeHtml(visitorNameVal) + ','
          : 'Hi there,';
        var visitorHtml = ''
          + '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f3f4f6;padding:24px 12px">'
          + '<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 6px -1px rgba(0,0,0,0.06)">'
          + '<div style="background:' + vsEscapeHtml(brandColor) + ';padding:22px 26px;color:#ffffff">'
          + visitorHeaderInner
          + '<div style="font-size:13px;opacity:0.92">Thanks — we got your request</div>'
          + '</div>'
          + '<div style="padding:24px 26px">'
          + '<p style="margin:0 0 14px 0;color:#111827;font-size:15px;line-height:1.55">' + greeting + '</p>'
          + '<p style="margin:0 0 18px 0;color:#374151;font-size:15px;line-height:1.55">Thanks for reaching out to <strong>' + vsEscapeHtml(tenantName) + '</strong>. We have received your request and will reply shortly. Here is a copy of what you sent us, for your records:</p>'
          + '<table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:18px">' + rowsHtml + '</table>'
          + '<p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5">— The ' + vsEscapeHtml(tenantName) + ' team</p>'
          + '</div>'
          + '<div style="padding:14px 26px;border-top:1px solid #e5e7eb;background:#f9fafb;color:#9ca3af;font-size:11px;line-height:1.4">This message was sent by ' + vsEscapeHtml(tenantName) + ' via <a href="https://liasse.tech" style="color:#9ca3af;text-decoration:none">Liasse Voice Assistant</a>.</div>'
          + '</div>'
          + '</div>';
        try {
          await services.email.send({
            to: visitorEmail,
            subject: 'Thanks — we received your request' + (tenantName !== 'this app' ? ' (' + tenantName + ')' : ''),
            html: visitorHtml,
          });
        } catch (_) { /* non-fatal */ }
      }

      // Return JSON so the front-end can swap the hero + form for the
      // inline thank-you panel without a navigation. visitorEmail is
      // returned so the panel can display "we sent a copy to <email>"
      // without duplicating the detection logic client-side.
      res.json({ ok: true, visitorEmail: visitorEmail });
    } catch (err) {
      console.error('[voice-assistant submit]', err);
      res.status(500).json({ ok: false, error: 'submit_failed' });
    }
  });
  // === voice-module-v1 END ===

router.use(function(req, res, next) {
if (req.method === 'GET' && !req.path.startsWith('/api')) return res.redirect('.');
next();
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
