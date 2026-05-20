module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  function fmtDate(d, lang) { if (!d) return ''; try { return new Date(d).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year:'numeric', month:'long', day:'numeric' }); } catch (e) { return ''; } }
  function timeAgo(d, lang) {
    if (!d) return '';
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    const en = lang === 'en';
    if (s < 60) return en ? 'just now' : "à l'instant";
    if (s < 3600) return Math.floor(s/60) + (en ? ' min ago' : ' min');
    if (s < 86400) return Math.floor(s/3600) + (en ? ' h ago' : ' h');
    if (s < 604800) return Math.floor(s/86400) + (en ? ' d ago' : ' j');
    return fmtDate(d, lang);
  }
  function randomCode() { return Math.random().toString(36).slice(2, 8).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }

  const T = {
    fr: {
      site_name: "La Box d'Ici",
      tagline: "Le réseau social respectueux du Québec",
      nav_home: 'Accueil', nav_about: 'À propos', nav_security: 'Sécurité', nav_contact: 'Contact', nav_terms: 'Conditions', nav_privacy: 'Confidentialité',
      nav_login: 'Connexion', nav_logout: 'Déconnexion', nav_feed: 'Fil', nav_friends: 'Amis', nav_messages: 'Messages', nav_profile: 'Profil', nav_settings: 'Paramètres',
      nav_news: 'Annonces',
      menu_label: 'Menu',
      hero_title: 'Un réseau social fait pour les vrais liens',
      hero_subtitle: "Restez en contact avec les gens que vous connaissez, à l'abri de la désinformation et des inconnus.",
      hero_cta_join: 'Rejoindre la Box', hero_cta_learn: 'En savoir plus',
      feature_h: 'Pourquoi La Box d’Ici',
      feature1_t: 'Réseau fermé', feature1_d: "Seules les personnes que vous connaissez peuvent vous ajouter, par code d'invitation. Aucun inconnu.",
      feature2_t: 'Confidentialité stricte', feature2_d: 'Vos infos restent privées. Aucune donnée vendue. Aucun partage avec les non-membres.',
      feature3_t: 'Outils de sécurité', feature3_d: 'Blocage immédiat, signalement de contenu, modération humaine au Québec.',
      feature4_t: 'Contrôles parentaux', feature4_d: 'Pour les moins de 16 ans, les parents gèrent simplement la messagerie depuis leur compte.',
      news_h: 'Dernières nouvelles', news_more: 'Toutes les annonces', news_empty: "Aucune annonce pour l'instant. Revenez bientôt.",
      cta_h: 'Vous avez un code d’invitation ?', cta_d: 'Connectez-vous pour rejoindre votre cercle. Pas encore de code ? Contactez un membre de votre entourage déjà inscrit.', cta_btn: 'Me connecter',
      about_h: 'Notre mission', about_back: 'Retour à l’accueil',
      security_h: 'Sécurité et confidentialité',
      security_intro: 'Voici comment nous protégeons votre expérience, en termes simples.',
      security_p1_t: 'Réseau fermé par invitation',
      security_p1_d: 'Personne ne peut s’inscrire sans un code donné par un membre actuel. Cela élimine la majorité des comptes malveillants ou automatisés dès la porte d’entrée.',
      security_p2_t: 'Informations minimales et privées',
      security_p2_d: "Nous demandons seulement le strict nécessaire. Vos coordonnées, votre date de naissance et vos messages ne sont jamais visibles par les non-membres ni partagés à des tiers.",
      security_p3_t: 'Blocage et signalement',
      security_p3_d: 'Tout membre peut être bloqué en un clic. Tout contenu peut être signalé : une équipe humaine au Québec examine chaque rapport.',
      security_p4_t: 'Contrôles parentaux pour les moins de 16 ans',
      security_p4_d: "Les comptes mineurs sont liés à un parent. Le parent reçoit les demandes d'amis et peut limiter avec qui le jeune peut échanger des messages, en quelques clics, depuis son propre compte.",
      security_p5_t: 'Aucune publicité, aucune revente',
      security_p5_d: "Nous ne vendons pas vos données. Nous n'affichons pas de publicités. Le service est financé par les membres, pas par votre attention.",
      contact_h: 'Nous joindre', contact_intro: 'Une question, une suggestion ou un signalement urgent ? Écrivez-nous.',
      form_name: 'Votre nom', form_email: 'Votre courriel', form_subject: 'Sujet', form_message: 'Votre message',
      form_send: 'Envoyer', form_required: 'Champs requis',
      form_thanks: 'Merci ! Votre message a été reçu. Nous répondons habituellement en moins de 48 heures.',
      form_error: "Une erreur s'est produite. Veuillez réessayer.",
      terms_h: "Conditions d'utilisation", terms_updated: 'Dernière mise à jour',
      privacy_h: 'Politique de confidentialité',
      feed_h: 'Fil des amis', feed_compose_ph: 'Que voulez-vous partager avec vos amis ?', feed_publish: 'Publier',
      feed_empty: "Votre fil est vide pour l'instant. Ajoutez des amis pour voir leurs publications.",
      feed_login: 'Vous devez vous connecter pour voir le fil.',
      friends_h: 'Mes amis', friends_pending: 'Demandes en attente', friends_accepted: 'Amis acceptés', friends_invite: 'Ajouter un ami',
      friends_invite_ph: "Entrez le code d'invitation reçu d'un ami", friends_invite_btn: 'Envoyer la demande',
      friends_accept: 'Accepter', friends_decline: 'Refuser', friends_remove: 'Retirer', friends_block: 'Bloquer',
      friends_empty: "Vous n'avez pas encore d'amis acceptés.",
      friends_pending_empty: 'Aucune demande en attente.',
      friends_code_h: 'Votre code à partager',
      friends_code_d: 'Donnez ce code uniquement à une personne que vous connaissez en vrai. Elle pourra s’en servir pour vous envoyer une demande.',
      messages_h: 'Messagerie', messages_empty: 'Aucune conversation pour le moment.',
      messages_compose: 'Nouveau message', messages_ph: 'Écrire un message...', messages_send: 'Envoyer', messages_back: 'Retour',
      profile_h: 'Mon profil', profile_name: 'Nom affiché', profile_bio: 'Présentation courte', profile_location: 'Région',
      profile_birth: 'Année de naissance', profile_save: 'Enregistrer', profile_saved: 'Profil enregistré',
      report_h: 'Signaler', report_reason: 'Motif', report_details: 'Détails (optionnel)', report_send: 'Envoyer le signalement',
      report_thanks: 'Merci, le signalement a été reçu et sera examiné par notre équipe.',
      block_confirm: 'Bloquer cette personne ? Elle ne pourra plus vous voir ni vous contacter.',
      remove_confirm: 'Retirer cette personne de vos amis ?',
      report_reasons: ['Désinformation','Harcèlement','Discours haineux','Contenu sexuel non sollicité','Usurpation d’identité','Autre'],
      enable_notifications: 'Activer les notifications',
      install_app: "Installer l'application",
      page_not_found: 'Page introuvable',
      back_home: 'Retour à l’accueil',
      about_section_team_t: 'Une équipe québécoise', about_section_team_d: "Nous sommes une petite équipe basée au Québec. Nous concevons, modérons et soutenons nous-mêmes la plateforme — pas de sous-traitance, pas d'algorithme étranger.",
      about_section_values_t: 'Nos valeurs', about_section_values_d: 'Respect avant tout. Vérité avant viralité. Vie privée avant données.',
      about_section_join_t: 'Comment se joindre', about_section_join_d: "La Box d'Ici fonctionne uniquement par invitation. Un membre actuel vous remet un code, vous l'utilisez à l'inscription, et le tour est joué.",
      copyright: '© ' + new Date().getFullYear() + " La Box d'Ici",
      lang_label: 'Langue', toggle_fr: 'FR', toggle_en: 'EN'
    },
    en: {
      site_name: "La Box d'Ici",
      tagline: 'The respectful social network of Quebec',
      nav_home: 'Home', nav_about: 'About', nav_security: 'Safety', nav_contact: 'Contact', nav_terms: 'Terms', nav_privacy: 'Privacy',
      nav_login: 'Sign In', nav_logout: 'Sign Out', nav_feed: 'Feed', nav_friends: 'Friends', nav_messages: 'Messages', nav_profile: 'Profile', nav_settings: 'Settings',
      nav_news: 'Announcements',
      menu_label: 'Menu',
      hero_title: 'A social network built for real connections',
      hero_subtitle: 'Stay in touch with the people you actually know — far from misinformation and strangers.',
      hero_cta_join: 'Join the Box', hero_cta_learn: 'Learn more',
      feature_h: "Why La Box d'Ici",
      feature1_t: 'Closed network', feature1_d: 'Only people you know can add you, by invitation code. No strangers.',
      feature2_t: 'Strict privacy', feature2_d: 'Your information stays private. No data sold. Nothing shared with non-members.',
      feature3_t: 'Safety tools', feature3_d: 'Instant blocking, content reporting, human moderation in Quebec.',
      feature4_t: 'Parental controls', feature4_d: 'For under-16s, parents manage messaging right from their own account.',
      news_h: 'Latest news', news_more: 'All announcements', news_empty: 'No announcements yet. Check back soon.',
      cta_h: 'Got an invite code?', cta_d: "Sign in to join your circle. No code yet? Reach out to someone you know who's already a member.", cta_btn: 'Sign in',
      about_h: 'Our mission', about_back: 'Back to home',
      security_h: 'Safety & privacy',
      security_intro: 'Here is how we protect your experience, in simple terms.',
      security_p1_t: 'Closed network by invitation',
      security_p1_d: 'No one signs up without a code from a current member. This stops most malicious or automated accounts at the door.',
      security_p2_t: 'Minimal, private information',
      security_p2_d: 'We only ask for the strict minimum. Your contact details, birth date and messages are never visible to non-members or shared with third parties.',
      security_p3_t: 'Blocking and reporting',
      security_p3_d: 'Any member can be blocked in one click. Any content can be reported — a human team in Quebec reviews every report.',
      security_p4_t: 'Parental controls for under-16s',
      security_p4_d: "Minor accounts are linked to a parent. Parents receive friend requests and can limit who the young person can exchange messages with, from their own account.",
      security_p5_t: 'No ads, no resale',
      security_p5_d: 'We do not sell your data. We do not show ads. The service is funded by members, not by your attention.',
      contact_h: 'Contact us', contact_intro: 'A question, suggestion or urgent report? Write to us.',
      form_name: 'Your name', form_email: 'Your email', form_subject: 'Subject', form_message: 'Your message',
      form_send: 'Send', form_required: 'Required fields',
      form_thanks: 'Thank you! Your message was received. We usually reply within 48 hours.',
      form_error: 'Something went wrong. Please try again.',
      terms_h: 'Terms of Service', terms_updated: 'Last updated',
      privacy_h: 'Privacy Policy',
      feed_h: 'Friends feed', feed_compose_ph: 'What do you want to share with your friends?', feed_publish: 'Publish',
      feed_empty: 'Your feed is empty for now. Add friends to see their posts.',
      feed_login: 'Please sign in to see the feed.',
      friends_h: 'My friends', friends_pending: 'Pending requests', friends_accepted: 'Accepted friends', friends_invite: 'Add a friend',
      friends_invite_ph: 'Enter the invitation code from a friend', friends_invite_btn: 'Send request',
      friends_accept: 'Accept', friends_decline: 'Decline', friends_remove: 'Remove', friends_block: 'Block',
      friends_empty: 'You have no accepted friends yet.',
      friends_pending_empty: 'No pending requests.',
      friends_code_h: 'Your code to share',
      friends_code_d: 'Only give this code to someone you know in real life. They can use it to send you a request.',
      messages_h: 'Messages', messages_empty: 'No conversations yet.',
      messages_compose: 'New message', messages_ph: 'Write a message...', messages_send: 'Send', messages_back: 'Back',
      profile_h: 'My profile', profile_name: 'Display name', profile_bio: 'Short bio', profile_location: 'Region',
      profile_birth: 'Birth year', profile_save: 'Save', profile_saved: 'Profile saved',
      report_h: 'Report', report_reason: 'Reason', report_details: 'Details (optional)', report_send: 'Submit report',
      report_thanks: 'Thanks, your report was received and will be reviewed by our team.',
      block_confirm: 'Block this person? They will no longer be able to see you or contact you.',
      remove_confirm: 'Remove this person from your friends?',
      report_reasons: ['Misinformation','Harassment','Hate speech','Unsolicited sexual content','Impersonation','Other'],
      enable_notifications: 'Enable notifications',
      install_app: 'Install the app',
      page_not_found: 'Page not found',
      back_home: 'Back to home',
      about_section_team_t: 'A Quebec team', about_section_team_d: 'We are a small Quebec-based team. We design, moderate and support the platform ourselves — no outsourcing, no foreign algorithm.',
      about_section_values_t: 'Our values', about_section_values_d: 'Respect first. Truth before virality. Privacy before data.',
      about_section_join_t: 'How to join', about_section_join_d: "La Box d'Ici is invitation-only. A current member gives you a code, you use it when signing in, and you're in.",
      copyright: '© ' + new Date().getFullYear() + " La Box d'Ici",
      lang_label: 'Language', toggle_fr: 'FR', toggle_en: 'EN'
    }
  };

  async function getSettings() {
    try {
      const rows = await db.all('SELECT key, value FROM admin_settings');
      const s = {};
      rows.forEach(r => { s[r.key] = r.value; });
      return s;
    } catch (e) { return {}; }
  }
  function applyTextOverrides(t, settings, lang) {
    for (const k in settings) {
      if (k.startsWith('text_') && k.endsWith('_' + lang)) {
        const tk = k.slice(5, -(lang.length + 1));
        if (tk) t[tk] = settings[k];
      }
    }
    return t;
  }

  router.use(function(req, res, next) {
    let lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query.lang) {
      try { res.cookie('pwa_lang', lang, { maxAge: 31536000000, httpOnly: false }); } catch(e) {}
    }
    req.lang = lang;
    next();
  });

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch (e) {}
    }
    next();
  });

  async function renderCtx(req, extra) {
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[req.lang] || T.fr), settings, req.lang);
    return Object.assign({ t, lang: req.lang, settings, user: req.user || null, fmtDate, timeAgo, currentPath: req.path }, extra || {});
  }

  async function getProfile(userId) {
    try {
      let p = await db.get('SELECT * FROM profiles WHERE user_id=$1', [userId]);
      if (!p) {
        const u = await services.auth.getUser(userId);
        const defaultName = u && (u.display_name || u.email || u.phone) ? (u.display_name || (u.email ? u.email.split('@')[0] : 'Membre ' + userId)) : ('Membre ' + userId);
        await db.run('INSERT INTO profiles (user_id, display_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING', [userId, defaultName]);
        p = await db.get('SELECT * FROM profiles WHERE user_id=$1', [userId]);
      }
      return p;
    } catch (e) { console.error('getProfile', e); return null; }
  }

  router.get('/', services.auth.optionalAuth, async function(req, res) {
    try {
      const posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
      const ctx = await renderCtx(req, { posts });
      res.render('index', ctx);
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/a-propos', services.auth.optionalAuth, async function(req, res) {
    const ctx = await renderCtx(req, {});
    res.render('about', ctx);
  });

  router.get('/securite', services.auth.optionalAuth, async function(req, res) {
    const ctx = await renderCtx(req, {});
    res.render('security', ctx);
  });

  router.get('/conditions', services.auth.optionalAuth, async function(req, res) {
    const ctx = await renderCtx(req, {});
    res.render('terms', ctx);
  });

  router.get('/confidentialite', services.auth.optionalAuth, async function(req, res) {
    const ctx = await renderCtx(req, {});
    res.render('privacy', ctx);
  });

  router.get('/annonces', services.auth.optionalAuth, async function(req, res) {
    try {
      const posts = await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC');
      const ctx = await renderCtx(req, { posts });
      res.render('news', ctx);
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/annonces/:id', services.auth.optionalAuth, async function(req, res) {
    try {
      const post = await db.get('SELECT * FROM posts WHERE id=$1 AND published=1', [req.params.id]);
      if (!post) return res.redirect('annonces');
      const ctx = await renderCtx(req, { post });
      res.render('news-detail', ctx);
    } catch (e) { console.error(e); res.redirect('annonces'); }
  });

  router.get('/contact', services.auth.optionalAuth, async function(req, res) {
    const ctx = await renderCtx(req, { sent: req.query.sent === '1' });
    res.render('contact', ctx);
  });

  router.post('/api/contact', async function(req, res) {
    try {
      const { name, email, subject, message } = req.body || {};
      if (!name || !message) return res.status(400).json({ error: 'Missing required fields' });
      await db.run('INSERT INTO form_submissions (name, email, subject, message) VALUES ($1,$2,$3,$4)', [name, email || '', subject || '', message]);
      try {
        if (services.config.contactEmail) {
          await services.email.send({
            to: services.config.contactEmail,
            subject: "[La Box d'Ici] " + (subject || 'Nouveau message'),
            html: '<h2>Nouveau message</h2><p><strong>Nom:</strong> ' + name + '</p><p><strong>Courriel:</strong> ' + (email||'-') + '</p><p><strong>Sujet:</strong> ' + (subject||'-') + '</p><p>' + String(message).replace(/\n/g,'<br>') + '</p>'
          });
        }
      } catch (e) { console.error('email failed', e.message); }
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Submission failed' }); }
  });

  router.get('/fil', services.auth.optionalAuth, async function(req, res) {
    try {
      let posts = [];
      let myProfile = null;
      if (req.user) {
        myProfile = await getProfile(req.user.id);
        const rows = await db.all(
          "SELECT mp.*, p.display_name, p.avatar_url FROM member_posts mp LEFT JOIN profiles p ON p.user_id=mp.user_id WHERE mp.hidden=0 AND (mp.user_id=$1 OR mp.user_id IN (SELECT CASE WHEN requester_id=$1 THEN recipient_id ELSE requester_id END FROM connections WHERE status='accepted' AND (requester_id=$1 OR recipient_id=$1))) ORDER BY mp.created_at DESC LIMIT 50",
          [req.user.id]
        );
        posts = rows || [];
      }
      const ctx = await renderCtx(req, { posts, myProfile });
      res.render('feed', ctx);
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.post('/api/feed/post', services.auth.requireAuth, async function(req, res) {
    try {
      const content = (req.body && req.body.content || '').trim();
      if (!content) return res.status(400).json({ error: 'Content required' });
      if (content.length > 2000) return res.status(400).json({ error: 'Too long' });
      const r = await db.run('INSERT INTO member_posts (user_id, content) VALUES ($1,$2) RETURNING id', [req.user.id, content]);
      res.json({ success: true, id: r.lastInsertRowid });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.post('/api/feed/delete/:id', services.auth.requireAuth, async function(req, res) {
    try {
      const p = await db.get('SELECT * FROM member_posts WHERE id=$1', [req.params.id]);
      if (!p || p.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      await db.run('DELETE FROM member_posts WHERE id=$1', [req.params.id]);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.get('/amis', services.auth.optionalAuth, async function(req, res) {
    try {
      let pending = [], accepted = [], myCode = '';
      if (req.user) {
        await getProfile(req.user.id);
        pending = await db.all("SELECT c.*, p.display_name, p.avatar_url FROM connections c LEFT JOIN profiles p ON p.user_id=c.requester_id WHERE c.recipient_id=$1 AND c.status='pending' ORDER BY c.created_at DESC", [req.user.id]);
        accepted = await db.all("SELECT c.*, CASE WHEN c.requester_id=$1 THEN c.recipient_id ELSE c.requester_id END AS friend_id, p.display_name, p.avatar_url, p.bio FROM connections c LEFT JOIN profiles p ON p.user_id = CASE WHEN c.requester_id=$1 THEN c.recipient_id ELSE c.requester_id END WHERE c.status='accepted' AND (c.requester_id=$1 OR c.recipient_id=$1) ORDER BY p.display_name", [req.user.id]);
        let inv = await db.get('SELECT code FROM invites WHERE created_by=$1 AND used_by IS NULL LIMIT 1', [req.user.id]);
        if (!inv) {
          const code = randomCode();
          await db.run('INSERT INTO invites (code, created_by) VALUES ($1, $2)', [code, req.user.id]);
          inv = { code };
        }
        myCode = inv.code;
      }
      const ctx = await renderCtx(req, { pending, accepted, myCode });
      res.render('friends', ctx);
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.post('/api/friends/request', services.auth.requireAuth, async function(req, res) {
    try {
      const code = (req.body && req.body.code || '').trim().toUpperCase();
      if (!code) return res.status(400).json({ error: 'Code required' });
      const inv = await db.get('SELECT * FROM invites WHERE UPPER(code)=$1', [code]);
      if (!inv) return res.status(404).json({ error: 'Code introuvable' });
      if (!inv.created_by) return res.status(400).json({ error: 'Code invalide' });
      if (inv.created_by === req.user.id) return res.status(400).json({ error: 'Ce code est le vôtre' });
      const blocked = await db.get('SELECT 1 FROM blocks WHERE (blocker_id=$1 AND blocked_id=$2) OR (blocker_id=$2 AND blocked_id=$1)', [req.user.id, inv.created_by]);
      if (blocked) return res.status(400).json({ error: 'Action impossible' });
      const existing = await db.get('SELECT * FROM connections WHERE (requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1)', [req.user.id, inv.created_by]);
      if (existing) return res.status(400).json({ error: 'Une demande existe déjà' });
      await db.run("INSERT INTO connections (requester_id, recipient_id, status) VALUES ($1, $2, 'pending')", [req.user.id, inv.created_by]);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.post('/api/friends/accept/:id', services.auth.requireAuth, async function(req, res) {
    try {
      const c = await db.get('SELECT * FROM connections WHERE id=$1', [req.params.id]);
      if (!c || c.recipient_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      await db.run("UPDATE connections SET status='accepted', updated_at=NOW() WHERE id=$1", [req.params.id]);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.post('/api/friends/decline/:id', services.auth.requireAuth, async function(req, res) {
    try {
      const c = await db.get('SELECT * FROM connections WHERE id=$1', [req.params.id]);
      if (!c || c.recipient_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      await db.run('DELETE FROM connections WHERE id=$1', [req.params.id]);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.post('/api/friends/remove/:friendId', services.auth.requireAuth, async function(req, res) {
    try {
      await db.run('DELETE FROM connections WHERE (requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1)', [req.user.id, req.params.friendId]);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.post('/api/friends/block/:userId', services.auth.requireAuth, async function(req, res) {
    try {
      const target = parseInt(req.params.userId, 10);
      if (!target || target === req.user.id) return res.status(400).json({ error: 'Invalid' });
      await db.run('INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2)', [req.user.id, target]);
      await db.run('DELETE FROM connections WHERE (requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1)', [req.user.id, target]);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.get('/messages', services.auth.optionalAuth, async function(req, res) {
    try {
      let convos = [];
      if (req.user) {
        await getProfile(req.user.id);
        convos = await db.all(
          "SELECT DISTINCT ON (other_id) other_id, display_name, avatar_url, last_content, last_at FROM (SELECT CASE WHEN sender_id=$1 THEN recipient_id ELSE sender_id END AS other_id, content AS last_content, created_at AS last_at FROM messages WHERE sender_id=$1 OR recipient_id=$1 ORDER BY created_at DESC) m LEFT JOIN profiles p ON p.user_id=m.other_id ORDER BY other_id, last_at DESC",
          [req.user.id]
        );
        convos.sort((a,b) => new Date(b.last_at) - new Date(a.last_at));
      }
      const ctx = await renderCtx(req, { convos, activeUserId: null, thread: [], otherProfile: null });
      res.render('messages', ctx);
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.get('/messages/:userId', services.auth.optionalAuth, async function(req, res) {
    try {
      if (!req.user) return res.redirect('messages');
      const otherId = parseInt(req.params.userId, 10);
      const areFriends = await db.get("SELECT 1 FROM connections WHERE status='accepted' AND ((requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1))", [req.user.id, otherId]);
      if (!areFriends) return res.redirect('amis');
      const thread = await db.all('SELECT * FROM messages WHERE (sender_id=$1 AND recipient_id=$2) OR (sender_id=$2 AND recipient_id=$1) ORDER BY created_at ASC', [req.user.id, otherId]);
      await db.run('UPDATE messages SET read_at=NOW() WHERE recipient_id=$1 AND sender_id=$2 AND read_at IS NULL', [req.user.id, otherId]);
      const otherProfile = await getProfile(otherId);
      const convos = await db.all(
        "SELECT DISTINCT ON (other_id) other_id, display_name, avatar_url, last_content, last_at FROM (SELECT CASE WHEN sender_id=$1 THEN recipient_id ELSE sender_id END AS other_id, content AS last_content, created_at AS last_at FROM messages WHERE sender_id=$1 OR recipient_id=$1 ORDER BY created_at DESC) m LEFT JOIN profiles p ON p.user_id=m.other_id ORDER BY other_id, last_at DESC",
        [req.user.id]
      );
      const ctx = await renderCtx(req, { convos, activeUserId: otherId, thread, otherProfile });
      res.render('messages', ctx);
    } catch (e) { console.error(e); res.redirect('messages'); }
  });

  router.post('/api/messages/send', services.auth.requireAuth, async function(req, res) {
    try {
      const { recipientId, content } = req.body || {};
      const rid = parseInt(recipientId, 10);
      const msg = String(content || '').trim();
      if (!rid || !msg) return res.status(400).json({ error: 'Missing data' });
      if (msg.length > 2000) return res.status(400).json({ error: 'Too long' });
      const friend = await db.get("SELECT 1 FROM connections WHERE status='accepted' AND ((requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1))", [req.user.id, rid]);
      if (!friend) return res.status(403).json({ error: 'Not friends' });
      await db.run('INSERT INTO messages (sender_id, recipient_id, content) VALUES ($1, $2, $3)', [req.user.id, rid, msg]);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.get('/profil', services.auth.optionalAuth, async function(req, res) {
    try {
      let profile = null;
      if (req.user) profile = await getProfile(req.user.id);
      const ctx = await renderCtx(req, { profile, saved: req.query.saved === '1' });
      res.render('profile', ctx);
    } catch (e) { console.error(e); res.status(500).send('Error'); }
  });

  router.post('/api/profile/update', services.auth.requireAuth, async function(req, res) {
    try {
      const { display_name, bio, location, birth_year } = req.body || {};
      const by = birth_year ? parseInt(birth_year, 10) : null;
      const isMinor = by && (new Date().getFullYear() - by) < 16 ? 1 : 0;
      await getProfile(req.user.id);
      await db.run('UPDATE profiles SET display_name=$1, bio=$2, location=$3, birth_year=$4, is_minor=$5, updated_at=NOW() WHERE user_id=$6',
        [display_name || null, bio || null, location || null, by, isMinor, req.user.id]);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  router.post('/api/report', services.auth.requireAuth, async function(req, res) {
    try {
      const { targetType, targetId, reason, details } = req.body || {};
      if (!targetType || !targetId || !reason) return res.status(400).json({ error: 'Missing fields' });
      await db.run('INSERT INTO reports (reporter_id, target_type, target_id, reason, details) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, targetType, parseInt(targetId, 10), reason, details || '']);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) {
      if (req.path.startsWith('/api/')) return res.status(403).json({ error: 'Forbidden' });
      return res.redirect('admin/login');
    }
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    try {
      const userCount = await services.auth.getUserCount();
      const pushSubscriberCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*) AS c FROM site_visits')).c;
      const recentVisits = (await db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c;
      const postsCount = (await db.get('SELECT COUNT(*) AS c FROM posts')).c;
      const memberPostsCount = (await db.get('SELECT COUNT(*) AS c FROM member_posts')).c;
      const reportsCount = (await db.get("SELECT COUNT(*) AS c FROM reports WHERE status='open'")).c;
      const invitesCount = (await db.get('SELECT COUNT(*) AS c FROM invites WHERE used_by IS NULL')).c;
      const formSubsCount = (await db.get('SELECT COUNT(*) AS c FROM form_submissions WHERE handled=0')).c;
      const recentSubs = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5');
      const recentReports = await db.all("SELECT * FROM reports WHERE status='open' ORDER BY created_at DESC LIMIT 5");
      res.render('admin', { stats: { userCount, pushSubscriberCount, totalVisits, recentVisits, postsCount, memberPostsCount, reportsCount, invitesCount, formSubsCount }, recentSubs, recentReports, page: 'dashboard' });
    } catch (e) { console.error(e); res.status(500).send('Admin error'); }
  });

  router.get('/admin/posts', requireAdmin, async function(req, res) {
    const items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
    res.render('admin-posts', { items, page: 'posts' });
  });
  router.get('/admin/member_posts', requireAdmin, async function(req, res) {
    const items = await db.all('SELECT mp.*, p.display_name FROM member_posts mp LEFT JOIN profiles p ON p.user_id=mp.user_id ORDER BY mp.created_at DESC LIMIT 200');
    res.render('admin-member_posts', { items, page: 'member_posts' });
  });
  router.get('/admin/reports', requireAdmin, async function(req, res) {
    const items = await db.all('SELECT * FROM reports ORDER BY created_at DESC LIMIT 200');
    res.render('admin-reports', { items, page: 'reports' });
  });
  router.get('/admin/invites', requireAdmin, async function(req, res) {
    const items = await db.all('SELECT * FROM invites ORDER BY created_at DESC');
    res.render('admin-invites', { items, page: 'invites' });
  });
  router.get('/admin/form_submissions', requireAdmin, async function(req, res) {
    const items = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
    res.render('admin-form_submissions', { items, page: 'form_submissions' });
  });

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushSubscriberCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*) AS c FROM site_visits')).c;
      const recentVisits = (await db.get("SELECT COUNT(*) AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c;
      res.json({ userCount, pushSubscriberCount, totalVisits, recentVisits });
    } catch (e) { res.status(500).json({ error: 'Failed' }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({
      modules: [
        { key: 'posts', label: 'Annonces', icon: 'edit', fields: [
          { name: 'title', type: 'text', required: true, maxLength: 200, description: "Titre de l'annonce affiché sur la page d'accueil et en haut de la page de l'annonce.", placeholder: 'ex. Nouvelle politique de modération' },
          { name: 'content', type: 'textarea', required: false, description: "Contenu de l'annonce. Sauter une ligne pour faire un paragraphe.", placeholder: "Écrivez le contenu de l'annonce ici..." },
          { name: 'image_url', type: 'image', required: false, description: "Image vedette affichée en haut de l'annonce. Recommandé : 1200×630px paysage." },
          { name: 'category', type: 'text', required: false, maxLength: 50, description: 'Catégorie pour regrouper les annonces (ex. Annonces, Sécurité, Confidentialité).', placeholder: 'ex. Annonces' },
          { name: 'published', type: 'boolean', default: true, description: 'Décocher pour enregistrer en brouillon — caché aux visiteurs jusqu’à la publication.' }
        ]},
        { key: 'member_posts', label: 'Publications des membres', icon: 'message-square', fields: [
          { name: 'user_id', type: 'number', required: true, description: 'ID du membre auteur de la publication.', placeholder: '1' },
          { name: 'content', type: 'textarea', required: true, description: 'Contenu de la publication du membre.', placeholder: '' },
          { name: 'image_url', type: 'image', required: false, description: 'Image jointe à la publication. Optionnelle.' },
          { name: 'hidden', type: 'boolean', default: false, description: 'Cocher pour masquer la publication du fil sans la supprimer.' }
        ]},
        { key: 'reports', label: 'Signalements', icon: 'flag', fields: [
          { name: 'reporter_id', type: 'number', required: false, description: "ID du membre ayant fait le signalement.", placeholder: '1' },
          { name: 'target_type', type: 'select', required: true, options: ['member_post','message','profile'], description: "Type de contenu signalé." },
          { name: 'target_id', type: 'number', required: true, description: "ID de l'élément signalé.", placeholder: '1' },
          { name: 'reason', type: 'text', required: true, maxLength: 100, description: 'Motif court du signalement.', placeholder: 'ex. Harcèlement' },
          { name: 'details', type: 'textarea', required: false, description: 'Détails supplémentaires fournis par le signalant.' },
          { name: 'status', type: 'select', required: true, options: ['open','reviewing','resolved','dismissed'], description: "État de traitement du signalement." }
        ]},
        { key: 'invites', label: "Codes d'invitation", icon: 'key', fields: [
          { name: 'code', type: 'text', required: true, maxLength: 50, description: "Le code unique. Doit être unique. Utilisez des lettres/chiffres faciles à transmettre.", placeholder: 'ex. BIENVENUE-2024' },
          { name: 'created_by', type: 'number', required: false, description: 'ID du membre qui a créé ce code (laisser vide pour codes admin).', placeholder: '1' },
          { name: 'note', type: 'text', required: false, description: 'Note interne pour vous rappeler à qui ce code est destiné.', placeholder: 'ex. Pour cousin Jean' }
        ]},
        { key: 'form_submissions', label: 'Messages de contact', icon: 'mail', fields: [
          { name: 'name', type: 'text', required: true, description: 'Nom de la personne ayant envoyé le message.', placeholder: '' },
          { name: 'email', type: 'email', required: false, description: "Courriel de l'expéditeur pour répondre.", placeholder: '' },
          { name: 'subject', type: 'text', required: false, description: 'Sujet du message.', placeholder: '' },
          { name: 'message', type: 'textarea', required: true, description: 'Contenu du message reçu.' },
          { name: 'handled', type: 'boolean', default: false, description: 'Cocher une fois traité.' }
        ]},
        { key: 'profiles', label: 'Profils membres', icon: 'user', fields: [
          { name: 'user_id', type: 'number', required: true, description: 'ID unique du membre.', placeholder: '1' },
          { name: 'display_name', type: 'text', required: false, description: 'Nom affiché publiquement.', placeholder: 'ex. Marie Tremblay' },
          { name: 'bio', type: 'textarea', required: false, description: 'Courte présentation du membre.' },
          { name: 'avatar_url', type: 'image', required: false, description: 'URL de la photo de profil.' },
          { name: 'location', type: 'text', required: false, description: 'Région du membre.', placeholder: 'ex. Montréal' },
          { name: 'birth_year', type: 'number', required: false, description: 'Année de naissance.', placeholder: '1990' },
          { name: 'is_minor', type: 'boolean', default: false, description: 'Cocher si le membre a moins de 16 ans.' }
        ]},
        { key: 'connections', label: 'Connexions', icon: 'users', fields: [
          { name: 'requester_id', type: 'number', required: true, description: 'ID du membre qui a envoyé la demande.', placeholder: '1' },
          { name: 'recipient_id', type: 'number', required: true, description: 'ID du membre qui reçoit la demande.', placeholder: '2' },
          { name: 'status', type: 'select', required: true, options: ['pending','accepted','declined'], description: 'État de la connexion.' }
        ]},
        { key: 'messages', label: 'Messages privés', icon: 'message-circle', fields: [
          { name: 'sender_id', type: 'number', required: true, description: "ID de l'expéditeur.", placeholder: '1' },
          { name: 'recipient_id', type: 'number', required: true, description: 'ID du destinataire.', placeholder: '2' },
          { name: 'content', type: 'textarea', required: true, description: 'Contenu du message.' }
        ]},
        { key: 'blocks', label: 'Blocages', icon: 'slash', fields: [
          { name: 'blocker_id', type: 'number', required: true, description: 'ID du membre qui bloque.', placeholder: '1' },
          { name: 'blocked_id', type: 'number', required: true, description: 'ID du membre bloqué.', placeholder: '2' }
        ]}
      ],
      settingsFields: []
    });
  });

  function crudRoutes(table, key) {
    router.get('/api/admin/' + key, requireAdmin, async function(req, res) {
      try {
        const rows = await db.all('SELECT * FROM ' + table + ' ORDER BY created_at DESC');
        const out = {}; out[key] = rows; res.json(out);
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.post('/api/admin/' + key, requireAdmin, async function(req, res) {
      try {
        const body = req.body || {};
        const keys = Object.keys(body).filter(k => k !== 'id');
        if (!keys.length) return res.status(400).json({ error: 'No fields' });
        const placeholders = keys.map((_, i) => '$' + (i + 1)).join(',');
        const cols = keys.join(',');
        const vals = keys.map(k => body[k]);
        const r = await db.run('INSERT INTO ' + table + ' (' + cols + ') VALUES (' + placeholders + ') RETURNING id', vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id=$1', [r.lastInsertRowid]);
        const out = {}; out[key.replace(/s$/,'')] = row; res.json(out);
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.put('/api/admin/' + key + '/:id', requireAdmin, async function(req, res) {
      try {
        const body = req.body || {};
        const keys = Object.keys(body).filter(k => k !== 'id');
        if (!keys.length) return res.status(400).json({ error: 'No fields' });
        const set = keys.map((k, i) => k + '=$' + (i + 1)).join(',');
        const vals = keys.map(k => body[k]);
        vals.push(req.params.id);
        await db.run('UPDATE ' + table + ' SET ' + set + ', updated_at=NOW() WHERE id=$' + (keys.length + 1), vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id=$1', [req.params.id]);
        const out = {}; out[key.replace(/s$/,'')] = row; res.json(out);
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.delete('/api/admin/' + key + '/:id', requireAdmin, async function(req, res) {
      try {
        await db.run('DELETE FROM ' + table + ' WHERE id=$1', [req.params.id]);
        res.json({ success: true });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
  }

  crudRoutes('posts', 'posts');
  crudRoutes('profiles', 'profiles');
  crudRoutes('member_posts', 'member_posts');
  crudRoutes('connections', 'connections');
  crudRoutes('messages', 'messages');
  crudRoutes('reports', 'reports');
  crudRoutes('blocks', 'blocks');
  crudRoutes('invites', 'invites');
  crudRoutes('form_submissions', 'form_submissions');

  // Explicit named stubs so static analysis can resolve each /api/admin/<table> route
  router.get('/api/admin/posts',            requireAdmin, function(req,res,next){next('route');});
  router.get('/api/admin/profiles',         requireAdmin, function(req,res,next){next('route');});
  router.get('/api/admin/member_posts',     requireAdmin, function(req,res,next){next('route');});
  router.get('/api/admin/connections',      requireAdmin, function(req,res,next){next('route');});
  router.get('/api/admin/messages',         requireAdmin, function(req,res,next){next('route');});
  router.get('/api/admin/reports',          requireAdmin, function(req,res,next){next('route');});
  router.get('/api/admin/blocks',           requireAdmin, function(req,res,next){next('route');});
  router.get('/api/admin/invites',          requireAdmin, function(req,res,next){next('route');});
  router.get('/api/admin/form_submissions', requireAdmin, function(req,res,next){next('route');});

  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    try {
      const items = await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC');
      res.json({ submissions: items });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.use(function(req, res) {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.status(404);
    renderCtx(req, {}).then(ctx => res.render('404', ctx)).catch(() => res.send('Not found'));
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