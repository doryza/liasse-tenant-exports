module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;
  const crypto = require('crypto');

  function fmtDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch(e) { return ''; }
  }
  function truncate(s, n) {
    if (!s) return '';
    s = String(s);
    return s.length > n ? s.slice(0, n).trim() + '…' : s;
  }

  async function getSettings() {
    const rows = await db.all('SELECT key, value FROM admin_settings');
    const o = {};
    for (const r of rows) o[r.key] = r.value;
    return o;
  }

  async function baseCtx(req) {
    const settings = await getSettings();
    const mountPath = req.baseUrl || '';
    return { settings, fmtDate, truncate, currentPath: req.path, mountPath, year: new Date().getFullYear() };
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  // Video gate — the lead-capture landing page. A full-bleed video splash
  // with a single CTA that drops visitors into /soumission (the custom
  // free-quote form, not the platform's built-in lead-capture facility).
  // The actual home content lives at /accueil; internal "Home" links
  // throughout the site point there so a visitor who has dismissed the
  // gate once never sees it again on subsequent navigation.
  router.get('/', async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      res.render('gate', ctx);
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  router.get('/accueil', async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      const servicesList = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
      const testimonials = await db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY id DESC LIMIT 3');
      res.render('index', Object.assign(ctx, { services: servicesList, testimonials }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  router.get('/a-propos', async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      const testimonials = await db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY id DESC LIMIT 4');
      res.render('about', Object.assign(ctx, { testimonials }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  router.get('/nos-projets', async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      const servicesList = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
      const projects = await db.all('SELECT * FROM projects ORDER BY sort_order ASC, id DESC');
      const testimonials = await db.all('SELECT * FROM testimonials WHERE published = 1 ORDER BY id DESC LIMIT 2');
      res.render('projets', Object.assign(ctx, { services: servicesList, projects, testimonials }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  router.get('/services/:slug', async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      const service = await db.get('SELECT * FROM services WHERE slug = $1', [req.params.slug]);
      if (!service) return res.redirect('nos-projets');
      const projects = await db.all('SELECT * FROM projects WHERE service_slug = $1 ORDER BY sort_order ASC, id DESC', [req.params.slug]);
      const allServices = await db.all('SELECT slug, title, subtitle, image_url FROM services ORDER BY sort_order ASC');
      res.render('gallery', Object.assign(ctx, { service, projects, allServices }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  router.get('/nous-contacter', async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      res.render('contact', Object.assign(ctx, { success: req.query.success === '1' }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  router.post('/api/contact', services.auth.optionalAuth, async function(req, res) {
    try {
      const { name, email, phone, address, message } = req.body || {};
      if (!name || !message) return res.status(400).json({ error: 'Veuillez remplir les champs requis.' });
      const userId = (req.tenantUser && req.tenantUser.id) ? req.tenantUser.id : null;
      await db.run('INSERT INTO contact_submissions (name, email, phone, address, message, user_id) VALUES ($1,$2,$3,$4,$5,$6)', [name, email||'', phone||'', address||'', message, userId]);
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouvelle soumission gratuite</h2><p><strong>Nom:</strong> ' + (name||'') + '</p><p><strong>Courriel:</strong> ' + (email||'') + '</p><p><strong>Téléphone:</strong> ' + (phone||'') + '</p><p><strong>Adresse:</strong> ' + (address||'') + '</p><p><strong>Message:</strong></p><p>' + String(message||'').replace(/\n/g,'<br>') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Soumission Gratuite — ' + (name||'Nouveau client'), html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch(emailErr) { console.error('Email failed:', emailErr.message); }
      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' }); }
  });

  // ============================================================
  // Soumission gratuite — voice-first quote-request flow
  // ============================================================

  function getGeminiApiKey() {
    if (!services || !services.externalVars) return null;
    return services.externalVars.GEMINI_API_KEY || null;
  }

  router.get('/soumission', services.auth.optionalAuth, async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      const servicesList = await db.all('SELECT slug, title, subtitle, short_desc FROM services ORDER BY sort_order ASC, id ASC');
      const u = req.tenantUser || null;
      res.render('soumission', Object.assign(ctx, {
        services: servicesList,
        success: req.query.success === '1',
        voiceAvailable: !!getGeminiApiKey(),
        prefillUser: u ? {
          name: u.display_name || '',
          email: u.email || '',
          phone: u.phone || '',
        } : null,
      }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  async function buildQuoteSystemInstruction(language, user) {
    const lang = language === 'en' ? 'en' : 'fr';
    const settings = await getSettings();
    const servicesList = await db.all('SELECT title, short_desc FROM services ORDER BY sort_order ASC, id ASC');
    const projectsCount = (await db.get('SELECT COUNT(*)::int AS c FROM projects')).c || 0;

    const businessName = settings.business_name || 'Pavage Montréal';
    const tagline = settings.tagline || '';
    const businessAddress = settings.business_address || '';
    const businessPhone = settings.contact_phone || '';
    const yearsInBusiness = settings.years_in_business || 'depuis 1991';
    const servicesBlock = servicesList
      .map(s => `- ${s.title}${s.short_desc ? ` — ${s.short_desc}` : ''}`)
      .join('\n');

    const languageName = lang === 'fr' ? 'French (Canadian/Québécois)' : 'English';
    const knownIdentity = (() => {
      if (!user) return '';
      const lines = [];
      if (user.display_name) lines.push(`- name: ${user.display_name}`);
      if (user.email)        lines.push(`- email: ${user.email}`);
      if (user.phone)        lines.push(`- phone: ${user.phone}`);
      if (lines.length === 0) return '';
      return `\n\nVISITOR IDENTITY ALREADY ON FILE (from their authenticated session — pre-filled in the draft):\n${lines.join('\n')}\nDo NOT ask for any of these fields. Greet the visitor by their first name if known, then go straight to the project description.`;
    })();

    const requiredFields = lang === 'fr'
      ? '- nom complet (déjà au dossier si connu, sinon à demander)\n- adresse courriel (déjà au dossier si connu)\n- numéro de téléphone (déjà au dossier si connu)\n- adresse du chantier (optionnel mais utile)'
      : '- full name (already on file if known, otherwise ask)\n- email address (already on file if known)\n- phone number (already on file if known)\n- job site address (optional but useful)';

    const wrapInstr = lang === 'fr'
      ? `Le visiteur peut décider de terminer à tout moment, même si certains champs sont vides : il complétera lui-même au formulaire en bas. Quand il dit qu'il a fini ("c'est tout", "j'ai fini", "envoie", "send it") OU quand tu as un résumé de projet clair, appelle updateQuoteDraft avec complete=true et termine par UNE phrase courte confirmant. Ne demande jamais deux fois le même champ — si tu l'as déjà (au dossier ou donné), considère-le acquis.`
      : `The visitor can choose to wrap up at any time, even with some fields empty — they'll fill the rest in the form below. When they say they're done ("that's all", "I'm done", "send it") OR once you have a clear project summary, call updateQuoteDraft with complete=true and close with ONE short sentence. Never ask for the same field twice — if it's already on file or given, treat it as captured.`;

    return `You are a friendly quote-request assistant for ${businessName}${tagline ? ` ("${tagline}")` : ''}, a paving contractor ${yearsInBusiness}.
A visitor just landed on the soumission page and wants a free quote. Have a short, natural spoken conversation that captures the project details plus the contact info ${businessName} needs to follow up.

LANGUAGE POLICY — speak in ${languageName}. If the visitor's most recent reply is clearly in a different language, switch to match theirs. Never mix languages in one turn. Use natural Québécois phrasing for French.

SPOKEN STYLE — you are speaking aloud in real time. Keep replies to 1–2 short sentences. Warm, conversational, no lists, no markdown, no emojis. Ask ONE focused question per turn. Acknowledge what they just said in a few words before asking the next thing.

WHAT TO COLLECT, in order of priority:
${requiredFields}
- type of work (asphalt, interlocking pavers, sealing, repairs…)
- scope (residential / commercial / industrial / municipal)
- size or rough description of the surface
- timeline / urgency

COMPANY CONTEXT — services we offer:
${servicesBlock || '(none yet listed)'}
Reference number of completed projects: ${projectsCount}.${businessAddress ? `\nOffice: ${businessAddress}.` : ''}${businessPhone ? `\nPhone (for reference only — visitor is here precisely so they don't have to call): ${businessPhone}.` : ''}

EMAIL & PHONE — VERY IMPORTANT. Voice transcription gets emails and phone numbers wrong almost every time (it captures sound, not spelling). The first time you need an email or phone, do NOT ask the visitor to dictate it — instead say (in their language) something like "Pour le courriel et le téléphone, écrivez-les directement dans le résumé à droite — la voix les capte mal" / "For email and phone, please type them directly in the draft on the right — voice gets them wrong". Then move on to the next topic.

If the visitor still tries to dictate an email or phone:
  • Repeat back what you understood, then immediately ask them to type it to confirm.
  • If you receive a system message saying "The visitor has typed their email/phone: …", that value is FINAL. Do NOT re-ask, do NOT propose a different spelling, and pass exactly that string in every subsequent updateQuoteDraft call.

DRAFT UPDATES — after EACH of your turns, call the \`updateQuoteDraft\` tool with the current state of the captured fields and a project summary. Always include every field you have; pass empty string for fields not yet captured. For fields the visitor has typed (you'll get a system message confirming the value) OR fields already on file, pass that exact string back unchanged on every call. Set complete=true when the visitor signals they're done OR when name, email, phone, AND a clear project summary are all present — whichever comes first.${knownIdentity}

${wrapInstr}`;
  }

  router.post('/soumission/voice-token', services.auth.requireAuth, async function(req, res) {
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(503).json({
          error: 'Voice unavailable',
          detail: 'GEMINI_API_KEY is not set on this tenant\'s api-variables.',
        });
      }

      let GoogleGenAI;
      try { ({ GoogleGenAI } = require('@google/genai')); } catch (loadErr) {
        console.error('[Soumission Voice] @google/genai unavailable:', loadErr.message);
        return res.status(503).json({ error: 'Voice unavailable', detail: 'AI SDK missing' });
      }

      const lng = (req.body && req.body.language) === 'en' ? 'en' : 'fr';
      // Pinned to 'Puck' across every language — 'Aoede' is not available
      // on gemini-3.1-flash-live-preview and the websocket closes with
      // 1011 ("unexpected condition") as soon as the client connects with
      // a token that referenced it. The platform's own voice mint
      // (services.voiceTokenMint) hard-pins Puck for the same reason.
      const voiceName = 'Puck';
      const systemInstruction = await buildQuoteSystemInstruction(lng, req.tenantUser || null);

      const tokenClient = new GoogleGenAI({
        apiKey,
        httpOptions: { apiVersion: 'v1alpha' },
      });

      const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const model = 'gemini-3.1-flash-live-preview';

      const updateDraftTool = {
        functionDeclarations: [{
          name: 'updateQuoteDraft',
          description: 'Update the visitor-facing quote-request draft after each of your turns. Always include every captured field; pass empty string for ones not yet captured.',
          parameters: {
            type: 'OBJECT',
            properties: {
              name:           { type: 'STRING', description: 'Visitor full name. Empty string if not captured yet.' },
              email:          { type: 'STRING', description: 'Visitor email. Empty string if not captured yet.' },
              phone:          { type: 'STRING', description: 'Visitor phone. Empty string if not captured yet.' },
              address:        { type: 'STRING', description: 'Job-site address. Empty string if not given.' },
              projectSummary: { type: 'STRING', description: 'Plain-text summary of the project (work type, scope, size, timeline). Under 800 chars.' },
              complete:       { type: 'BOOLEAN', description: 'True only when name, email, phone, AND projectSummary are all present and the visitor is ready to submit.' },
            },
            required: ['name', 'email', 'phone', 'address', 'projectSummary', 'complete'],
          },
        }],
      };

      const token = await tokenClient.authTokens.create({
        config: {
          uses: 1,
          expireTime,
          liveConnectConstraints: {
            model,
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
              systemInstruction: { parts: [{ text: systemInstruction }] },
              tools: [updateDraftTool],
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              realtimeInputConfig: { turnCoverage: 'TURN_INCLUDES_ONLY_ACTIVITY' },
            },
          },
        },
      });

      res.json({ token: token.name, model, expireTime });
    } catch(e) {
      console.error('[Soumission Voice] Token mint failed:', e && (e.stack || e.message || e));
      res.status(500).json({ error: 'Token mint failed', detail: e && e.message });
    }
  });

  router.post('/api/soumission', services.auth.requireAuth, async function(req, res) {
    try {
      const { name, email, phone, address, message } = req.body || {};
      if (!name || !email || !phone || !message) {
        return res.status(400).json({ error: 'Nom, courriel, téléphone et description sont requis.' });
      }
      await db.run(
        'INSERT INTO contact_submissions (name, email, phone, address, message, status, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [name, email, phone, address || '', message, 'new', req.tenantUser.id]
      );
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouvelle soumission gratuite (formulaire vocal)</h2>'
            + '<p><strong>Nom:</strong> ' + (name||'') + '</p>'
            + '<p><strong>Courriel:</strong> ' + (email||'') + '</p>'
            + '<p><strong>Téléphone:</strong> ' + (phone||'') + '</p>'
            + '<p><strong>Adresse:</strong> ' + (address||'') + '</p>'
            + '<p><strong>Description du projet:</strong></p><p>' + String(message||'').replace(/\n/g,'<br>') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Soumission Gratuite — ' + name, html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch(emailErr) { console.error('Email failed:', emailErr.message); }
      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' }); }
  });

  // ============================================================
  // Mon Compte
  // ============================================================
  router.get('/mon-compte', services.auth.optionalAuth, async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      let u = req.tenantUser || null;
      let submissions = [];
      let salesMember = null;
      let assignedSubmissions = [];
      if (u) {
        submissions = await db.all(
          'SELECT id, name, email, phone, address, message, status, created_at FROM contact_submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
          [u.id]
        );
        salesMember = await db.get(
          "SELECT * FROM sales_team_members WHERE user_id = $1 AND active = 1",
          [u.id]
        );
        if (!salesMember && u.email) {
          salesMember = await db.get(
            "SELECT * FROM sales_team_members WHERE LOWER(email) = LOWER($1) AND active = 1",
            [u.email]
          );
        }
        if (!salesMember && u.phone) {
          const userDigits = u.phone.replace(/\D/g, '');
          if (userDigits.length >= 7) {
            salesMember = await db.get(
              "SELECT * FROM sales_team_members WHERE regexp_replace(COALESCE(mobile, ''), '\\D', '', 'g') = $1 AND active = 1",
              [userDigits]
            );
          }
        }
        if (salesMember && (salesMember.user_id !== u.id || !salesMember.invite_accepted_at)) {
          try {
            await db.run(
              "UPDATE sales_team_members SET user_id = $1, invite_accepted_at = COALESCE(invite_accepted_at, NOW()), updated_at = NOW() WHERE id = $2",
              [u.id, salesMember.id]
            );
            salesMember.user_id = u.id;
            salesMember.invite_accepted_at = salesMember.invite_accepted_at || new Date().toISOString();
          } catch (linkErr) {
            console.error('[Sales] Link recovery failed (non-fatal):', linkErr.message);
          }
        }
        if (salesMember) {
          const updates = [];
          const vals = [];
          let i = 1;
          if (salesMember.full_name && (u.display_name || '') !== salesMember.full_name) {
            updates.push(`display_name = $${i++}`);
            vals.push(salesMember.full_name);
          }
          if (salesMember.email) {
            const userEmailExact = u.email || '';
            const userEmailLower = userEmailExact.toLowerCase();
            const memberEmailLower = salesMember.email.toLowerCase();
            if (userEmailExact !== salesMember.email) {
              updates.push(`email = $${i++}`); vals.push(salesMember.email);
              if (userEmailLower !== memberEmailLower) {
                updates.push(`email_verified = $${i++}`); vals.push(0);
              }
            }
          }
          if (salesMember.mobile) {
            const userPhoneExact = u.phone || '';
            const userPhoneDigits = userPhoneExact.replace(/\D/g, '');
            const memberMobileDigits = salesMember.mobile.replace(/\D/g, '');
            if (userPhoneExact !== salesMember.mobile) {
              updates.push(`phone = $${i++}`); vals.push(salesMember.mobile);
              if (userPhoneDigits !== memberMobileDigits) {
                updates.push(`phone_verified = $${i++}`); vals.push(0);
              }
            }
          }
          if (updates.length > 0) {
            updates.push('updated_at = NOW()');
            vals.push(u.id);
            try {
              await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = $${i}`, vals);
              const refreshed = await db.get('SELECT * FROM users WHERE id = $1', [u.id]);
              if (refreshed) u = refreshed;
            } catch (syncErr) {
              console.error('[Sales] Mon Compte sync from sales_team_members failed (non-fatal):', syncErr.message);
            }
          }
          assignedSubmissions = await db.all(
            "SELECT id, name, email, phone, address, message, status, assigned_at, created_at FROM contact_submissions WHERE assigned_to_sales_id = $1 ORDER BY assigned_at DESC NULLS LAST, created_at DESC LIMIT 200",
            [salesMember.id]
          );
        }
      }
      res.render('mon-compte', Object.assign(ctx, {
        signedIn: !!u,
        submissions,
        salesMember,
        assignedSubmissions,
        prefillUser: u ? (salesMember ? {
          id: u.id,
          name: salesMember.full_name || '',
          email: salesMember.email || '',
          phone: salesMember.mobile || '',
          email_verified: !!u.email_verified
            && (u.email || '').toLowerCase() === (salesMember.email || '').toLowerCase(),
          phone_verified: !!u.phone_verified
            && salesMember.mobile
            && (u.phone || '').replace(/\D/g, '') === salesMember.mobile.replace(/\D/g, ''),
        } : {
          id: u.id,
          name: u.display_name || '',
          email: u.email || '',
          phone: u.phone || '',
          email_verified: !!u.email_verified,
          phone_verified: !!u.phone_verified,
        }) : null,
      }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  router.get('/api/mon-compte/submissions', services.auth.requireAuth, async function(req, res) {
    try {
      const submissions = await db.all(
        'SELECT id, name, email, phone, address, message, status, created_at FROM contact_submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
        [req.tenantUser.id]
      );
      res.json({ submissions });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Une erreur est survenue.' }); }
  });

  router.get('/emplois', async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      const jobs = await db.all('SELECT * FROM jobs WHERE active = 1 ORDER BY sort_order ASC, id ASC');
      res.render('emplois', Object.assign(ctx, { jobs, success: req.query.success === '1' }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  router.post('/api/apply', async function(req, res) {
    try {
      const { name, email, phone, position, experience, message } = req.body || {};
      if (!name || !position) return res.status(400).json({ error: 'Veuillez remplir les champs requis.' });
      await db.run('INSERT INTO job_applications (name, email, phone, position, experience, message) VALUES ($1,$2,$3,$4,$5,$6)', [name, email||'', phone||'', position, experience||'', message||'']);
      try {
        if (services.config.contactEmail) {
          const html = '<h2>Nouvelle candidature</h2><p><strong>Nom:</strong> ' + name + '</p><p><strong>Poste:</strong> ' + position + '</p><p><strong>Courriel:</strong> ' + (email||'') + '</p><p><strong>Téléphone:</strong> ' + (phone||'') + '</p><p><strong>Expérience:</strong> ' + (experience||'') + '</p><p><strong>Message:</strong></p><p>' + String(message||'').replace(/\n/g,'<br>') + '</p>';
          try { await services.email.send({ to: services.config.contactEmail, subject: 'Candidature — ' + position + ' — ' + name, html }); } catch (emailErr) { console.error('Email send failed:', emailErr.message); }
        }
      } catch(emailErr) { console.error('Email failed:', emailErr.message); }
      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' }); }
  });

  function requireAdmin(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    next();
  }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const ctx = await baseCtx(req);
      const userCount = await services.auth.getUserCount();
      const pushCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c;
      const stats = {
        userCount, pushCount, totalVisits, recentVisits,
        services: (await db.get('SELECT COUNT(*)::int AS c FROM services')).c,
        projects: (await db.get('SELECT COUNT(*)::int AS c FROM projects')).c,
        testimonials: (await db.get('SELECT COUNT(*)::int AS c FROM testimonials')).c,
        jobs: (await db.get('SELECT COUNT(*)::int AS c FROM jobs')).c,
        posts: (await db.get('SELECT COUNT(*)::int AS c FROM posts')).c,
        contacts: (await db.get('SELECT COUNT(*)::int AS c FROM contact_submissions')).c,
        applications: (await db.get('SELECT COUNT(*)::int AS c FROM job_applications')).c,
        newContacts: (await db.get("SELECT COUNT(*)::int AS c FROM contact_submissions WHERE status = 'new'")).c,
        newApplications: (await db.get("SELECT COUNT(*)::int AS c FROM job_applications WHERE status = 'new'")).c
      };
      const recentContacts = await db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 5');
      const recentApplications = await db.all('SELECT * FROM job_applications ORDER BY created_at DESC LIMIT 5');
      res.render('admin', Object.assign(ctx, { stats, recentContacts, recentApplications, currentPage: 'dashboard' }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  const adminPages = [
    { route: 'services', view: 'admin-services', title: 'Services' },
    { route: 'projects', view: 'admin-projects', title: 'Projets' },
    { route: 'testimonials', view: 'admin-testimonials', title: 'Témoignages' },
    { route: 'jobs', view: 'admin-jobs', title: 'Emplois' },
    { route: 'posts', view: 'admin-posts', title: 'Articles' },
    { route: 'contacts', view: 'admin-contacts', title: 'Soumissions' },
    { route: 'applications', view: 'admin-applications', title: 'Candidatures' },
    { route: 'sales-team', view: 'admin-sales-team', title: 'Équipe commerciale' }
  ];
  for (const p of adminPages) {
    router.get('/admin/' + p.route, async function(req, res) {
      if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : '../admin/login');
      try {
        const ctx = await baseCtx(req);
        res.render(p.view, Object.assign(ctx, { pageTitle: p.title, currentPage: p.route }));
      } catch(e) { console.error(e); res.status(500).send('Erreur'); }
    });
  }

  router.get('/api/admin/stats', requireAdmin, async function(req, res) {
    try {
      const userCount = await services.auth.getUserCount();
      const pushSubscriberCount = await services.push.getSubscriptionCount();
      const totalVisits = (await db.get('SELECT COUNT(*)::int AS c FROM site_visits')).c;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c;
      res.json({ userCount, pushSubscriberCount, totalVisits, recentVisits });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/submissions', requireAdmin, async function(req, res) {
    try {
      const contacts = await db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 200');
      const applications = await db.all('SELECT * FROM job_applications ORDER BY created_at DESC LIMIT 200');
      res.json({ contacts, applications });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/modules', requireAdmin, function(req, res) {
    res.json({ modules: [
      { key: 'services', label: 'Services', icon: 'list', fields: [
        { name: 'slug', type: 'text', required: true, maxLength: 80, description: 'Identifiant unique dans l\'URL (ex: pave-uni). Utilisez minuscules et tirets uniquement.', placeholder: 'pave-uni' },
        { name: 'title', type: 'text', required: true, maxLength: 100, description: 'Titre principal affiché sur la tuile (ex: « Pavé-Uni »).', placeholder: 'Pavé-Uni' },
        { name: 'subtitle', type: 'text', maxLength: 150, description: 'Sous-titre court qui complète le titre.', placeholder: 'Résidentiel, Commercial, Industriel' },
        { name: 'short_desc', type: 'textarea', description: 'Description courte affichée sous le sous-titre dans la grille des services (1-2 phrases).', placeholder: 'Installation experte de pavé-uni…' },
        { name: 'long_desc', type: 'textarea', description: 'Description complète affichée sur la page galerie du service.', placeholder: 'Description longue…' },
        { name: 'image_url', type: 'image', description: 'Photo du service. Format paysage 4:3 recommandé (ex: 1200×900px).' },
        { name: 'sort_order', type: 'number', min: 0, step: 1, description: 'Ordre d\'affichage dans la grille (1 = premier, 8 = dernier).', placeholder: '1' },
        { name: 'featured', type: 'boolean', default: true, description: 'Cochez pour afficher dans la grille des services de la page d\'accueil.' }
      ]},
      { key: 'projects', label: 'Projets', icon: 'image', fields: [
        { name: 'title', type: 'text', required: true, maxLength: 150, description: 'Titre du projet réalisé.', placeholder: 'Stationnement commercial — Anjou' },
        { name: 'description', type: 'textarea', description: 'Description du projet (technique utilisée, défis, résultats).', placeholder: 'Stationnement de 80 places refait à neuf…' },
        { name: 'service_slug', type: 'text', maxLength: 80, description: 'Slug du service associé (ex: pave-uni). Détermine sur quelle page galerie ce projet apparaît.', placeholder: 'pave-uni' },
        { name: 'location', type: 'text', maxLength: 120, description: 'Lieu du projet.', placeholder: 'Anjou, Montréal' },
        { name: 'image_url', type: 'image', description: 'Photo du projet. Format paysage 4:3 recommandé (1200×900px).' },
        { name: 'sort_order', type: 'number', min: 0, step: 1, description: 'Ordre d\'affichage dans la galerie.', placeholder: '1' }
      ]},
      { key: 'testimonials', label: 'Témoignages', icon: 'star', fields: [
        { name: 'author', type: 'text', required: true, maxLength: 100, description: 'Nom du client qui témoigne.', placeholder: 'Marc Lévesque' },
        { name: 'role', type: 'text', maxLength: 100, description: 'Rôle ou contexte du client.', placeholder: 'Propriétaire — Résidence' },
        { name: 'content', type: 'textarea', required: true, description: 'Texte du témoignage.', placeholder: 'Travail impeccable du début à la fin…' },
        { name: 'rating', type: 'number', min: 1, max: 5, step: 1, default: 5, description: 'Note de 1 à 5 étoiles.', placeholder: '5' },
        { name: 'image_url', type: 'image', description: 'Photo du client (optionnel). Format carré recommandé (400×400px).' },
        { name: 'published', type: 'boolean', default: true, description: 'Décochez pour cacher ce témoignage du site public.' }
      ]},
      { key: 'jobs', label: 'Emplois', icon: 'users', fields: [
        { name: 'title', type: 'text', required: true, maxLength: 100, description: 'Titre du poste.', placeholder: 'Installateur Pavé-Uni' },
        { name: 'description', type: 'textarea', description: 'Description du poste et des responsabilités.', placeholder: 'Nous recherchons…' },
        { name: 'requirements', type: 'textarea', description: 'Exigences et qualifications requises (séparez par des points).', placeholder: '3 ans d\'expérience minimum • Permis valide…' },
        { name: 'location', type: 'text', maxLength: 100, description: 'Lieu de travail.', placeholder: 'Montréal et région' },
        { name: 'employment_type', type: 'text', maxLength: 60, description: 'Type d\'emploi.', placeholder: 'Temps plein' },
        { name: 'image_url', type: 'image', description: 'Image associée au poste (optionnel).' },
        { name: 'sort_order', type: 'number', min: 0, step: 1, description: 'Ordre d\'affichage des postes.', placeholder: '1' },
        { name: 'active', type: 'boolean', default: true, description: 'Décochez pour retirer ce poste de la page emplois.' }
      ]},
      { key: 'posts', label: 'Articles', icon: 'edit', fields: [
        { name: 'title', type: 'text', required: true, maxLength: 200, description: 'Titre de l\'article.', placeholder: 'Comment prolonger la durée de vie de votre asphalte' },
        { name: 'content', type: 'textarea', description: 'Contenu de l\'article.', placeholder: 'Le scellement régulier…' },
        { name: 'image_url', type: 'image', description: 'Image principale de l\'article (1200×630px recommandé).' },
        { name: 'category', type: 'text', maxLength: 50, description: 'Catégorie de l\'article (ex: Conseils, Guide).', placeholder: 'Conseils' },
        { name: 'published', type: 'boolean', default: true, description: 'Décochez pour mettre l\'article en brouillon.' }
      ]},
      { key: 'contact_submissions', label: 'Soumissions de contact', icon: 'mail', fields: [
        { name: 'name', type: 'text', required: true, maxLength: 150, description: 'Nom du demandeur.' },
        { name: 'email', type: 'text', maxLength: 200, description: 'Adresse courriel.' },
        { name: 'phone', type: 'text', maxLength: 30, description: 'Numéro de téléphone.' },
        { name: 'address', type: 'text', maxLength: 255, description: 'Adresse du projet.' },
        { name: 'message', type: 'textarea', description: 'Message du client.' },
        { name: 'status', type: 'text', maxLength: 30, default: 'new', description: 'Statut de la soumission (new, reviewed, etc.).' }
      ]},
      { key: 'job_applications', label: 'Candidatures', icon: 'briefcase', fields: [
        { name: 'name', type: 'text', required: true, maxLength: 150, description: 'Nom du candidat.' },
        { name: 'email', type: 'text', maxLength: 200, description: 'Adresse courriel.' },
        { name: 'phone', type: 'text', maxLength: 30, description: 'Numéro de téléphone.' },
        { name: 'position', type: 'text', required: true, maxLength: 100, description: 'Poste demandé.' },
        { name: 'experience', type: 'textarea', description: 'Expérience du candidat.' },
        { name: 'message', type: 'textarea', description: 'Message du candidat.' },
        { name: 'status', type: 'text', maxLength: 30, default: 'new', description: 'Statut de la candidature (new, reviewed, etc.).' }
      ]}
    ]});
  });

  function makeCRUD(table, fields) {
    router.get('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        const orderCol = ['services','projects','jobs'].includes(table) ? 'sort_order ASC, id ASC' : 'id DESC';
        const rows = await db.all('SELECT * FROM ' + table + ' ORDER BY ' + orderCol);
        res.json({ [table]: rows });
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
    router.post('/api/admin/' + table, requireAdmin, async function(req, res) {
      try {
        const cols = [], vals = [], placeholders = [];
        let i = 1;
        for (const f of fields) {
          if (req.body[f] !== undefined) {
            cols.push(f);
            let v = req.body[f];
            if (typeof v === 'boolean') v = v ? 1 : 0;
            vals.push(v);
            placeholders.push('$' + i);
            i++;
          }
        }
        if (cols.length === 0) return res.status(400).json({ error: 'Aucune donnée fournie' });
        const sql = 'INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + placeholders.join(',') + ') RETURNING *';
        const result = await db.run(sql, vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [result.lastInsertRowid]);
        res.json({ [table.replace(/s$/, '')]: row, item: row });
      } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
    });
    router.put('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        const sets = [], vals = [];
        let i = 1;
        for (const f of fields) {
          if (req.body[f] !== undefined) {
            sets.push(f + ' = $' + i);
            let v = req.body[f];
            if (typeof v === 'boolean') v = v ? 1 : 0;
            vals.push(v);
            i++;
          }
        }
        if (sets.length === 0) return res.status(400).json({ error: 'Aucune donnée fournie' });
        sets.push('updated_at = NOW()');
        vals.push(req.params.id);
        const sql = 'UPDATE ' + table + ' SET ' + sets.join(', ') + ' WHERE id = $' + i;
        await db.run(sql, vals);
        const row = await db.get('SELECT * FROM ' + table + ' WHERE id = $1', [req.params.id]);
        res.json({ item: row });
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
    router.delete('/api/admin/' + table + '/:id', requireAdmin, async function(req, res) {
      try {
        await db.run('DELETE FROM ' + table + ' WHERE id = $1', [req.params.id]);
        res.json({ success: true });
      } catch(e) { res.status(500).json({ error: e.message }); }
    });
  }

  makeCRUD('services', ['slug','title','subtitle','short_desc','long_desc','image_url','sort_order','featured']);
  makeCRUD('projects', ['title','description','service_slug','location','image_url','sort_order']);
  makeCRUD('testimonials', ['author','role','content','rating','image_url','published']);
  makeCRUD('jobs', ['title','description','requirements','location','employment_type','image_url','sort_order','active']);
  makeCRUD('posts', ['title','content','image_url','category','published']);

  router.get('/api/admin/services', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM services ORDER BY sort_order ASC, id ASC'); res.json({ services: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/services', requireAdmin, async function(req, res) {
    try { const { slug,title,subtitle,short_desc,long_desc,image_url,sort_order,featured } = req.body||{}; const r = await db.run('INSERT INTO services (slug,title,subtitle,short_desc,long_desc,image_url,sort_order,featured) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[slug,title,subtitle||'',short_desc||'',long_desc||'',image_url||'',sort_order||0,featured!==undefined?featured:1]); const row = await db.get('SELECT * FROM services WHERE id=$1',[r.lastInsertRowid]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try { const { slug,title,subtitle,short_desc,long_desc,image_url,sort_order,featured } = req.body||{}; await db.run('UPDATE services SET slug=$1,title=$2,subtitle=$3,short_desc=$4,long_desc=$5,image_url=$6,sort_order=$7,featured=$8,updated_at=NOW() WHERE id=$9',[slug,title,subtitle||'',short_desc||'',long_desc||'',image_url||'',sort_order||0,featured!==undefined?featured:1,req.params.id]); const row = await db.get('SELECT * FROM services WHERE id=$1',[req.params.id]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM services WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/projects', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM projects ORDER BY sort_order ASC, id DESC'); res.json({ projects: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/projects', requireAdmin, async function(req, res) {
    try { const { title,description,service_slug,location,image_url,sort_order } = req.body||{}; const r = await db.run('INSERT INTO projects (title,description,service_slug,location,image_url,sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',[title,description||'',service_slug||'',location||'',image_url||'',sort_order||0]); const row = await db.get('SELECT * FROM projects WHERE id=$1',[r.lastInsertRowid]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/projects/:id', requireAdmin, async function(req, res) {
    try { const { title,description,service_slug,location,image_url,sort_order } = req.body||{}; await db.run('UPDATE projects SET title=$1,description=$2,service_slug=$3,location=$4,image_url=$5,sort_order=$6,updated_at=NOW() WHERE id=$7',[title,description||'',service_slug||'',location||'',image_url||'',sort_order||0,req.params.id]); const row = await db.get('SELECT * FROM projects WHERE id=$1',[req.params.id]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/projects/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM projects WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM testimonials ORDER BY id DESC'); res.json({ testimonials: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/testimonials', requireAdmin, async function(req, res) {
    try { const { author,role,content,rating,image_url,published } = req.body||{}; const r = await db.run('INSERT INTO testimonials (author,role,content,rating,image_url,published) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',[author,role||'',content,rating||5,image_url||'',published!==undefined?published:1]); const row = await db.get('SELECT * FROM testimonials WHERE id=$1',[r.lastInsertRowid]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try { const { author,role,content,rating,image_url,published } = req.body||{}; await db.run('UPDATE testimonials SET author=$1,role=$2,content=$3,rating=$4,image_url=$5,published=$6,updated_at=NOW() WHERE id=$7',[author,role||'',content,rating||5,image_url||'',published!==undefined?published:1,req.params.id]); const row = await db.get('SELECT * FROM testimonials WHERE id=$1',[req.params.id]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/testimonials/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM testimonials WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/jobs', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM jobs ORDER BY sort_order ASC, id ASC'); res.json({ jobs: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/jobs', requireAdmin, async function(req, res) {
    try { const { title,description,requirements,location,employment_type,image_url,sort_order,active } = req.body||{}; const r = await db.run('INSERT INTO jobs (title,description,requirements,location,employment_type,image_url,sort_order,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[title,description||'',requirements||'',location||'',employment_type||'',image_url||'',sort_order||0,active!==undefined?active:1]); const row = await db.get('SELECT * FROM jobs WHERE id=$1',[r.lastInsertRowid]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/jobs/:id', requireAdmin, async function(req, res) {
    try { const { title,description,requirements,location,employment_type,image_url,sort_order,active } = req.body||{}; await db.run('UPDATE jobs SET title=$1,description=$2,requirements=$3,location=$4,employment_type=$5,image_url=$6,sort_order=$7,active=$8,updated_at=NOW() WHERE id=$9',[title,description||'',requirements||'',location||'',employment_type||'',image_url||'',sort_order||0,active!==undefined?active:1,req.params.id]); const row = await db.get('SELECT * FROM jobs WHERE id=$1',[req.params.id]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/jobs/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM jobs WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/posts', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM posts ORDER BY id DESC'); res.json({ posts: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/posts', requireAdmin, async function(req, res) {
    try { const { title,content,image_url,category,published } = req.body||{}; const r = await db.run('INSERT INTO posts (title,content,image_url,category,published) VALUES ($1,$2,$3,$4,$5) RETURNING *',[title,content||'',image_url||'',category||'',published!==undefined?published:1]); const row = await db.get('SELECT * FROM posts WHERE id=$1',[r.lastInsertRowid]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { const { title,content,image_url,category,published } = req.body||{}; await db.run('UPDATE posts SET title=$1,content=$2,image_url=$3,category=$4,published=$5,updated_at=NOW() WHERE id=$6',[title,content||'',image_url||'',category||'',published!==undefined?published:1,req.params.id]); const row = await db.get('SELECT * FROM posts WHERE id=$1',[req.params.id]); res.json({item:row}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]); res.json({success:true}); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/contacts', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC'); res.json({ contacts: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/contacts/:id', requireAdmin, async function(req, res) {
    try { await db.run('UPDATE contact_submissions SET status = $1 WHERE id = $2', [req.body.status || 'reviewed', req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/contacts/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM contact_submissions WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/contact_submissions', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC'); res.json({ contact_submissions: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/contact_submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('UPDATE contact_submissions SET status = $1 WHERE id = $2', [req.body.status || 'reviewed', req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/contact_submissions/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM contact_submissions WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/applications', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM job_applications ORDER BY created_at DESC'); res.json({ applications: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/applications/:id', requireAdmin, async function(req, res) {
    try { await db.run('UPDATE job_applications SET status = $1 WHERE id = $2', [req.body.status || 'reviewed', req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/applications/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM job_applications WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/job_applications', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM job_applications ORDER BY created_at DESC'); res.json({ job_applications: rows }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/job_applications/:id', requireAdmin, async function(req, res) {
    try { await db.run('UPDATE job_applications SET status = $1 WHERE id = $2', [req.body.status || 'reviewed', req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/job_applications/:id', requireAdmin, async function(req, res) {
    try { await db.run('DELETE FROM job_applications WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/settings', requireAdmin, async function(req, res) {
    try { const rows = await db.all('SELECT key, value FROM admin_settings'); const o = {}; for (const r of rows) o[r.key] = r.value; res.json({ settings: o }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/settings', requireAdmin, async function(req, res) {
    try {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'Clé requise' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value || '']);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Auto-injected admin page routes for orphaned views
  router.get('/admin/applications', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM job_applications ORDER BY created_at DESC');
    res.render('admin-applications', { items: items });
  });
  router.get('/admin/contacts', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.render('admin-contacts', { items: items });
  });
  router.get('/admin/jobs', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM jobs ORDER BY created_at DESC');
    res.render('admin-jobs', { items: items });
  });
  router.get('/admin/posts', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
    res.render('admin-posts', { items: items });
  });
  router.get('/admin/projects', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM projects ORDER BY created_at DESC');
    res.render('admin-projects', { items: items });
  });
  router.get('/admin/services', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM services ORDER BY created_at DESC');
    res.render('admin-services', { items: items });
  });
  router.get('/admin/testimonials', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect('.');
    var items = await db.all('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.render('admin-testimonials', { items: items });
  });

  // ============================================================
  // Sales Team
  // ============================================================
  function generateInviteToken() {
    return crypto.randomBytes(24).toString('hex');
  }

  function buildInviteEmail(member, link, businessName) {
    const html = ''
      + '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">'
      + '<h2 style="font-size:20px;margin:0 0 16px">Invitation — Équipe commerciale ' + (businessName || '') + '</h2>'
      + '<p style="font-size:15px;line-height:1.6">Bonjour ' + (member.full_name || '') + ',</p>'
      + '<p style="font-size:15px;line-height:1.6">Vous avez été invité(e) à rejoindre l\'équipe commerciale de <strong>' + (businessName || '') + '</strong>'
      + (member.title ? ' à titre de <strong>' + member.title + '</strong>' : '') + '.</p>'
      + '<p style="font-size:15px;line-height:1.6">Cliquez sur le bouton ci-dessous pour activer votre accès et accéder à votre tableau de bord :</p>'
      + '<p style="text-align:center;margin:24px 0"><a href="' + link + '" style="display:inline-block;padding:14px 28px;background:#ff6a13;color:#fff;text-decoration:none;font-weight:700;border-radius:8px;font-size:14px">Activer mon compte</a></p>'
      + '<p style="font-size:13px;color:#6b7280;line-height:1.5">À l\'activation, vous devrez vous connecter en utilisant le courriel <strong>' + (member.email || '') + '</strong>'
      + (member.mobile ? ' ou le mobile <strong>' + member.mobile + '</strong>' : '')
      + ' (ces coordonnées doivent correspondre à celles que l\'administrateur a saisies).</p>'
      + '<p style="font-size:13px;color:#6b7280;line-height:1.5">Si le bouton ne fonctionne pas, copiez ce lien : <br><span style="word-break:break-all">' + link + '</span></p>'
      + '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">'
      + '<p style="font-size:12px;color:#9ca3af">English: You\'ve been invited to the ' + (businessName || '') + ' sales team. Click the button above and sign in with the email/mobile your admin entered.</p>'
      + '</div>';
    const subject = 'Invitation — Équipe commerciale ' + (businessName || '');
    return { subject, html };
  }

  function buildInviteLink(req, token) {
    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const mountPath = req.baseUrl || '';
    return proto + '://' + host + mountPath + '/sales/invite/' + token;
  }

  function requireSalesMember(req, res, next) {
    services.auth.requireAuth(req, res, async function() {
      try {
        const u = req.tenantUser;
        let member = await db.get(
          "SELECT * FROM sales_team_members WHERE user_id = $1 AND active = 1",
          [u.id]
        );
        if (!member && u.email) {
          member = await db.get(
            "SELECT * FROM sales_team_members WHERE LOWER(email) = LOWER($1) AND active = 1",
            [u.email]
          );
        }
        if (!member && u.phone) {
          const userDigits = u.phone.replace(/\D/g, '');
          if (userDigits.length >= 7) {
            member = await db.get(
              "SELECT * FROM sales_team_members WHERE regexp_replace(COALESCE(mobile, ''), '\\D', '', 'g') = $1 AND active = 1",
              [userDigits]
            );
          }
        }
        if (!member) return res.status(403).json({ error: 'Accès commercial requis' });
        if (member.user_id !== u.id || !member.invite_accepted_at) {
          try {
            await db.run(
              "UPDATE sales_team_members SET user_id = $1, invite_accepted_at = COALESCE(invite_accepted_at, NOW()), updated_at = NOW() WHERE id = $2",
              [u.id, member.id]
            );
            member.user_id = u.id;
            member.invite_accepted_at = member.invite_accepted_at || new Date().toISOString();
          } catch (linkErr) { console.error('[Sales] requireSalesMember link recovery failed:', linkErr.message); }
        }
        req.salesMember = member;
        next();
      } catch (e) { console.error('[Sales] auth check failed:', e.message); res.status(500).json({ error: 'Erreur' }); }
    });
  }

  router.get('/api/admin/sales-team', requireAdmin, async function(req, res) {
    try {
      const members = await db.all(
        "SELECT id, full_name, email, phone, mobile, title, invite_sent_at, invite_accepted_at, user_id, active, created_at FROM sales_team_members ORDER BY created_at DESC"
      );
      res.json({ members });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/sales-team', requireAdmin, async function(req, res) {
    try {
      const { full_name, email, phone, mobile, title } = req.body || {};
      const cleanFullName = String(full_name || '').trim();
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanMobile = String(mobile || '').trim();
      const cleanPhone = String(phone || '').trim();
      const cleanTitle = String(title || '').trim();
      if (!cleanFullName || !cleanEmail) {
        return res.status(400).json({ error: 'Nom complet et courriel sont requis.' });
      }
      const token = generateInviteToken();

      const existing = await db.get(
        "SELECT id, invite_accepted_at FROM sales_team_members WHERE LOWER(email) = $1",
        [cleanEmail]
      );
      let memberId;
      if (existing) {
        await db.run(
          "UPDATE sales_team_members SET full_name = $1, email = $2, phone = $3, mobile = $4, title = $5, invite_token = $6, invite_sent_at = NOW(), active = 1, updated_at = NOW() WHERE id = $7",
          [cleanFullName, cleanEmail, cleanPhone, cleanMobile, cleanTitle, token, existing.id]
        );
        memberId = existing.id;
      } else {
        const result = await db.run(
          "INSERT INTO sales_team_members (full_name, email, phone, mobile, title, invite_token) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
          [cleanFullName, cleanEmail, cleanPhone, cleanMobile, cleanTitle, token]
        );
        memberId = result.lastInsertRowid;
      }

      const member = await db.get("SELECT * FROM sales_team_members WHERE id = $1", [memberId]);

      try {
        const settings = await getSettings();
        const businessName = settings.business_name || 'Pavage Montréal';
        const link = buildInviteLink(req, token);
        const { subject, html } = buildInviteEmail(member, link, businessName);
        await services.email.send({ to: member.email, subject, html });
      } catch (emailErr) {
        console.error('[Sales] Invite email send failed:', emailErr.message);
      }

      res.json({ member, sent: true });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/sales-team/:id/resend', requireAdmin, async function(req, res) {
    try {
      const member = await db.get("SELECT * FROM sales_team_members WHERE id = $1", [req.params.id]);
      if (!member) return res.status(404).json({ error: 'Membre introuvable' });
      const token = generateInviteToken();
      await db.run(
        "UPDATE sales_team_members SET invite_token = $1, invite_sent_at = NOW(), updated_at = NOW() WHERE id = $2",
        [token, member.id]
      );
      try {
        const settings = await getSettings();
        const businessName = settings.business_name || 'Pavage Montréal';
        const link = buildInviteLink(req, token);
        const { subject, html } = buildInviteEmail({ ...member, mobile: member.mobile }, link, businessName);
        await services.email.send({ to: member.email, subject, html });
      } catch (emailErr) {
        console.error('[Sales] Resend email failed:', emailErr.message);
      }
      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
  });

  router.delete('/api/admin/sales-team/:id', requireAdmin, async function(req, res) {
    try {
      await db.run("UPDATE sales_team_members SET active = 0, updated_at = NOW() WHERE id = $1", [req.params.id]);
      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/contacts/:id/assign', requireAdmin, async function(req, res) {
    try {
      const id = req.params.id;
      const sid = req.body && req.body.sales_member_id;
      if (sid == null || sid === '') {
        await db.run("UPDATE contact_submissions SET assigned_to_sales_id = NULL, assigned_at = NULL WHERE id = $1", [id]);
      } else {
        const member = await db.get("SELECT id FROM sales_team_members WHERE id = $1 AND active = 1", [sid]);
        if (!member) return res.status(400).json({ error: 'Commercial introuvable ou révoqué' });
        await db.run("UPDATE contact_submissions SET assigned_to_sales_id = $1, assigned_at = NOW() WHERE id = $2", [sid, id]);
      }
      const updated = await db.get("SELECT * FROM contact_submissions WHERE id = $1", [id]);
      res.json({ submission: updated });
    } catch(e) { console.error('[Sales Assign]', e); res.status(500).json({ error: e.message }); }
  });

  router.get('/sales/invite/:token', async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      const member = await db.get(
        "SELECT id, full_name, email, mobile, title, invite_accepted_at, active FROM sales_team_members WHERE invite_token = $1",
        [req.params.token]
      );
      res.render('sales-invite', Object.assign(ctx, {
        token: req.params.token,
        member: member || null,
        invalid: !member || !member.active,
        alreadyActivated: !!(member && member.invite_accepted_at),
      }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  router.post('/api/sales/invite/:token/activate', services.auth.requireAuth, async function(req, res) {
    try {
      const member = await db.get(
        "SELECT * FROM sales_team_members WHERE invite_token = $1",
        [req.params.token]
      );
      if (!member) return res.status(404).json({ error: 'Invitation introuvable.' });
      if (!member.active) return res.status(403).json({ error: 'Cette invitation a été révoquée.' });

      const u = req.tenantUser;

      const otherActive = await db.get(
        "SELECT id, full_name FROM sales_team_members WHERE user_id = $1 AND active = 1 AND id != $2",
        [u.id, member.id]
      );
      if (otherActive) {
        return res.status(409).json({
          error: 'Vous êtes déjà commercial actif (' + (otherActive.full_name || '#' + otherActive.id) + '). Demandez à votre administrateur de révoquer l\'autre profil avant d\'activer celui-ci.',
        });
      }

      await db.run(
        "UPDATE sales_team_members SET user_id = $1, invite_accepted_at = COALESCE(invite_accepted_at, NOW()), updated_at = NOW() WHERE id = $2 AND active = 1 AND (user_id IS NULL OR user_id = $1)",
        [u.id, member.id]
      );
      const claimed = await db.get("SELECT user_id FROM sales_team_members WHERE id = $1", [member.id]);
      if (!claimed || claimed.user_id !== u.id) {
        return res.status(409).json({ error: 'Cette invitation est déjà liée à un autre compte.' });
      }

      const userEmailLower = (u.email || '').toLowerCase();
      const userPhoneDigits = (u.phone || '').replace(/\D/g, '');
      const inviteEmailLower = (member.email || '').toLowerCase();
      const inviteMobileDigits = (member.mobile || '').replace(/\D/g, '');
      const channelMatches =
        (userEmailLower && userEmailLower === inviteEmailLower) ||
        (userPhoneDigits && inviteMobileDigits && userPhoneDigits === inviteMobileDigits);
      if (!channelMatches) {
        console.log('[Sales Activate] Cross-identity claim — invite ' + member.id + ' (' + (member.email || '') + ' / ' + (member.mobile || '') + ') accepted by user ' + u.id + ' (' + (u.email || '-') + ' / ' + (u.phone || '-') + ').');
      }

      try {
        const sets = ['display_name = $1', 'updated_at = NOW()'];
        const vals = [member.full_name || ''];
        let i = 2;
        if (!u.email && member.email) {
          sets.push(`email = $${i++}`); vals.push(member.email);
          sets.push(`email_verified = $${i++}`); vals.push(0);
        }
        if (!u.phone && member.mobile) {
          sets.push(`phone = $${i++}`); vals.push(member.mobile);
          sets.push(`phone_verified = $${i++}`); vals.push(0);
        }
        vals.push(u.id);
        await db.run(`UPDATE users SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      } catch (backfillErr) {
        console.error('[Sales Activate] Profile backfill failed (non-fatal):', backfillErr.message);
      }

      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur lors de l\'activation' }); }
  });

  router.get('/sales/dashboard', function(req, res) {
    return res.redirect('mon-compte');
  });

  router.get('/api/sales/submissions', requireSalesMember, async function(req, res) {
    try {
      const submissions = await db.all(
        "SELECT id, name, email, phone, address, message, status, assigned_at, created_at FROM contact_submissions WHERE assigned_to_sales_id = $1 ORDER BY assigned_at DESC NULLS LAST, created_at DESC LIMIT 200",
        [req.salesMember.id]
      );
      res.json({ submissions });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
  });

  router.put('/api/sales/submissions/:id/status', requireSalesMember, async function(req, res) {
    try {
      const allowed = new Set(['new', 'contacted', 'quoted', 'won', 'lost']);
      const status = String((req.body && req.body.status) || '').toLowerCase();
      if (!allowed.has(status)) return res.status(400).json({ error: 'Statut invalide' });
      const owned = await db.get(
        "SELECT id FROM contact_submissions WHERE id = $1 AND assigned_to_sales_id = $2",
        [req.params.id, req.salesMember.id]
      );
      if (!owned) return res.status(404).json({ error: 'Soumission introuvable ou non assignée' });
      await db.run("UPDATE contact_submissions SET status = $1 WHERE id = $2", [status, req.params.id]);
      res.json({ success: true, status });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
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
    var ctx = {};
    if (typeof prepareRender === 'function') {
      try { ctx = await prepareRender(req, res, { pageTitle: 'Voice Assistant' }); } catch (_) { ctx = {}; }
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
    }, ctx, {
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
      var leadEmail = '';
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

  // Catch-all
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
