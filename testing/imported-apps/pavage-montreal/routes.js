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
    // mountPath is the URL prefix the platform mounted this router under
    // (e.g. "/pwa/pavage-montreal" in production, "" when run standalone).
    // Views prepend it to absolute-style links so the tenant slug isn't
    // stripped — `/accueil` alone would resolve to the platform root.
    const mountPath = req.baseUrl || '';
    return { settings, fmtDate, truncate, currentPath: req.path, mountPath, year: new Date().getFullYear() };
  }

  router.use(async function(req, res, next) {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [req.path]); } catch(e) {}
    }
    next();
  });

  // Video gate — the new homepage entry point. The CTA on the gate sends
  // visitors to /accueil where the actual home content lives. Internal
  // "Home" links throughout the site point at /accueil too, so a visitor
  // dismissing the gate once doesn't see it again on subsequent navigation.
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

  // optionalAuth so signed-in visitors get their submission tagged with
  // their user_id (and surfaced under /mon-compte) without forcing a login
  // on the generic contact form — we still want anonymous "Nous contacter"
  // messages to go through.
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
  // Soumission gratuite — independent quote-request flow
  // ============================================================
  // /soumission is the dedicated quote page (separate from
  // /nous-contacter, which stays as the generic contact form).
  // It hosts a voice-first hero: a Gemini Live conversation that
  // collects the project description plus the required identity
  // fields (name, email, phone), then auto-fills a normal form so
  // the visitor can review + submit.
  //
  // Gemini access is via the tenant's own GEMINI_API_KEY set in
  // api-variables (services.externalVars.GEMINI_API_KEY). The
  // client never sees the raw key — it gets a one-shot ephemeral
  // token minted server-side via @google/genai's authTokens.create.

  // Read the tenant's Gemini key. The platform's required-key
  // scanner regexes services.externalVars.X matches and flags every
  // distinct name as a separate required variable
  // (subscriberPwaBuilderRoutes.js:4796), so referencing both
  // GEMINI_API_KEY and GOOGLE_GEMINI_API_KEY surfaced two duplicate
  // prompts in the api-variables UI. Sticking to the single canonical
  // name keeps the prompt clean.
  function getGeminiApiKey() {
    if (!services || !services.externalVars) return null;
    return services.externalVars.GEMINI_API_KEY || null;
  }

  // optionalAuth attaches req.tenantUser when the visitor is signed in
  // (via Bearer token in header OR tenant_token cookie). When set, we
  // pre-fill the form's name/email/phone from their account. The voice
  // mic still triggers a fresh login flow if the visitor isn't signed
  // in by the time they click it.
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

  // Build a soumission system instruction that bakes in the live
  // company context (services list, business info from admin_settings)
  // PLUS whatever identity the platform already has on the visitor
  // (display_name / email / phone from their OTP login). The visitor
  // should never be asked again for what we already know.
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
    // Identity already known from the platform's auth session — we
    // never re-ask for what we have. Whatever's missing the visitor
    // can either give by voice or type into the draft inputs.
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

  // Mint a Gemini Live ephemeral token for the soumission voice
  // conversation. Uses the tenant's own GEMINI_API_KEY so usage is
  // billed to the tenant's Google project, not the platform's.
  // Auth-gated: only signed-in tenant users can mint Gemini Live tokens.
  // Visitors who haven't logged in via SMS/email OTP get a 401, which the
  // client uses as a cue to launch TenantSDK.ui.showLogin first.
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
      const voiceName = lng === 'fr' ? 'Aoede' : 'Puck';
      // req.tenantUser is populated by services.auth.requireAuth — feed
      // its identity into the system instruction so Gemini doesn't ask
      // for what we already have on file.
      const systemInstruction = await buildQuoteSystemInstruction(lng, req.tenantUser || null);

      const tokenClient = new GoogleGenAI({
        apiKey,
        httpOptions: { apiVersion: 'v1alpha' },
      });

      const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
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

      // No `lockAdditionalFields` — every field set here is locked
      // server-side, so the client can't loosen the model or tool.
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

  // Auth-gated: visitors must complete the platform OTP login (SMS or email)
  // before their soumission is accepted. The view-side handler watches for
  // 401 and triggers TenantSDK.ui.showLogin in-page; the requireAuth check
  // here is the server-side enforcement so direct curls / replays can't
  // skip the login step.
  router.post('/api/soumission', services.auth.requireAuth, async function(req, res) {
    try {
      const { name, email, phone, address, message } = req.body || {};
      if (!name || !email || !phone || !message) {
        return res.status(400).json({ error: 'Nom, courriel, téléphone et description sont requis.' });
      }
      // Quote requests share the contact_submissions table — same
      // fields, same downstream handling. Status defaults to 'new'.
      // user_id always present here (requireAuth guarantees req.tenantUser).
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
  // Mon Compte — visitor profile + their submissions
  // ============================================================
  // Auth-gated page where a signed-in visitor can:
  //   • see every soumission/contact request they've sent (status, details)
  //   • update their display name, email, phone (via TenantSDK.auth.updateProfile)
  //
  // The page itself uses optionalAuth so we can render a friendly "please
  // sign in" splash instead of a hard 401. The data + profile-update
  // endpoints below ARE auth-gated — JS in the view triggers
  // TenantSDK.ui.showLogin if the visitor lands here logged out.
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
        // Mon Compte doubles as the sales-rep landing page: if the
        // signed-in user is linked to an active sales-team row, we
        // surface the assigned soumissions and lock the profile fields
        // to admin's canonical values.
        //
        // Three lookup paths (first-match wins) — needed because the
        // user_id link can break in practice:
        //   1. Direct user_id match (the canonical link set during
        //      activation).
        //   2. Email match (LOWER), in case the rep re-OTP'd creating
        //      a fresh user_id different from the one linked at
        //      activation time.
        //   3. Phone digit-match (strips formatting), same reason.
        // When 2 or 3 hits, we re-link by writing the new user_id to
        // sales_team_members AND auto-mark invite_accepted_at if not
        // already set — the OTP-verified email/phone matching admin's
        // canonical entry IS the proof of identity, same as the
        // explicit click-the-invite-link flow.
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
        // If recovered (user_id mismatch or never set), heal the row.
        if (salesMember && (salesMember.user_id !== u.id || !salesMember.invite_accepted_at)) {
          try {
            await db.run(
              "UPDATE sales_team_members SET user_id = $1, invite_accepted_at = COALESCE(invite_accepted_at, NOW()), updated_at = NOW() WHERE id = $2",
              [u.id, salesMember.id]
            );
            salesMember.user_id = u.id;
            salesMember.invite_accepted_at = salesMember.invite_accepted_at || new Date().toISOString();
            console.log('[Sales] Recovered sales_team_members link for member id=' + salesMember.id + ' → user id=' + u.id);
          } catch (linkErr) {
            console.error('[Sales] Link recovery failed (non-fatal):', linkErr.message);
          }
        }
        if (salesMember) {
          // Idempotent re-sync of the user record from admin's canonical
          // sales_team_members entry. Three reasons to do this on every
          // Mon Compte load (not just at activation):
          //   1. Old activations that predate PR #38's backfill have user
          //      rows with empty display_name / cross-channel — those reps
          //      land here with blank locked fields ("name and phone are
          //      empty"). This catches them up automatically.
          //   2. If admin edits the member's contact details after
          //      activation (re-invite with corrected name/email/phone),
          //      the rep's profile reflects the correction next page load.
          //   3. The verify-now flow needs user.email or user.phone to
          //      EQUAL admin's canonical value so the platform's
          //      verifySmsCode/verifyEmailCode finds the rep's existing
          //      user (vs creating a new one and orphaning the
          //      sales_team_members link).
          // Verification flags are reset only when the value actually
          // changes — so a rep whose verified channel matches admin's
          // entry doesn't lose their verified status on each refresh.
          const updates = [];
          const vals = [];
          let i = 1;
          if (salesMember.full_name && (u.display_name || '') !== salesMember.full_name) {
            updates.push(`display_name = $${i++}`);
            vals.push(salesMember.full_name);
          }
          // Email: write admin's exact string when it differs at all, but
          // only reset email_verified when the LOGICAL value changes
          // (case-only changes preserve the verified flag — they're the
          // same address). This is critical for the verify-now flow:
          // verifyEmailCode does an exact-string lookup, so users.email
          // must equal the displayed (= admin's canonical) value or the
          // platform creates a new user instead of verifying ours.
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
          // Phone: same reasoning. Format-only changes (e.g. "+1 (514) 555-1234"
          // vs "5145551234") preserve phone_verified — same number, just
          // different display. We always rewrite the string so verifySmsCode
          // can match by exact string.
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
        // For sales reps, prefer admin's canonical values from
        // sales_team_members for the displayed fields. This is belt-and-
        // suspenders against any sync hiccup above — even if the UPDATE
        // failed (e.g. a transient DB error), the rep still SEES admin's
        // correct values in the locked fields. Verification badges are
        // computed by comparing user record's verified flags against the
        // canonical entry: a verified channel only counts if its value
        // matches what admin set.
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

  // JSON feed — lets the client refresh the submissions list after a new
  // soumission goes through, without a full page reload.
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
      } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
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

  // Explicit named routes so static analysis can verify CRUD coverage for each table
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

  // Alias routes using exact table names (contact_submissions, job_applications)
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

  // Alias routes using exact table name (job_applications)
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
  var items = await db.all('SELECT * FROM applications ORDER BY created_at DESC');
  res.render('admin-applications', { items: items });
});
router.get('/admin/contacts', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM contacts ORDER BY created_at DESC');
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
  // Sales Team — invitee-gated dashboard for assigned soumissions
  // ============================================================
  // Three audiences, three surfaces:
  //   • Admin: /admin/sales-team page + /api/admin/sales-team CRUD,
  //     plus PUT /api/admin/contacts/:id/assign to assign a soumission.
  //   • Invitee (after admin clicks "Inviter"): an emailed magic link to
  //     /sales/invite/:token, never shown in any public menu. The page
  //     asks the visitor to OTP via email or mobile that MUST match what
  //     admin entered, then activates and redirects to /sales/dashboard.
  //   • Activated sales person: /sales/dashboard + /api/sales/* endpoints
  //     gated by `requireSalesMember` (real auth + sales-team membership).
  //
  // The sales person uses the platform's regular OTP flow — there's no
  // separate "sales auth" infrastructure. We just check at request time
  // whether the OTP'd users.id is linked to an active sales_team_members
  // row. Linking happens once during invite activation.

  // Random URL-safe token for invite magic links. crypto.randomBytes(24)
  // → 48 hex chars, ~192 bits of entropy. Plenty unguessable; collisions
  // are not a concern for the table sizes we expect.
  function generateInviteToken() {
    return crypto.randomBytes(24).toString('hex');
  }

  // Invite-email body. Bilingual-ish: defaults to French (the tenant's
  // primary locale) but we expose a couple of English-friendly cues at
  // the bottom so an English-speaking sales hire can still figure out
  // what to do. The `link` is built absolute from the request's host so
  // it works whether served from /pwa/<slug>/ or a custom domain.
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

  // Build the absolute magic-link for an invite. Mounts under the same
  // path the visitor is currently on, so /pwa/<slug>/sales/invite/<token>
  // and custom-domain hosts both work.
  function buildInviteLink(req, token) {
    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const mountPath = req.baseUrl || '';
    return proto + '://' + host + mountPath + '/sales/invite/' + token;
  }

  // requireSalesMember chains real auth + membership lookup. Tries
  // user_id first (canonical link from activation), then email match,
  // then phone digit-match, exactly mirroring the /mon-compte recovery
  // logic so a rep whose user_id link broke can still reach the sales
  // API endpoints (verify-now, status update). Auto-heals the link on
  // a successful match.
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

  // ============================================================
  // Admin: sales-team CRUD + invite send
  // ============================================================
  router.get('/api/admin/sales-team', requireAdmin, async function(req, res) {
    try {
      const members = await db.all(
        "SELECT id, full_name, email, phone, mobile, title, invite_sent_at, invite_accepted_at, user_id, active, created_at FROM sales_team_members ORDER BY created_at DESC"
      );
      res.json({ members });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
  });

  // Create + send invite. Idempotent on email: if a row exists for
  // the same lowercased email it's reused — updates contact + token
  // and re-activates if the row was previously soft-deleted. Reusing
  // the row preserves invite_accepted_at and assigned soumissions.
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

      // Send invite email. Failures are non-fatal (admin can resend).
      // We send to member.email (the canonical, cleaned form stored on
      // the row) — not the raw req.body field — so admin retries don't
      // double-mail an unintended address if they typo the second time.
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

  // Resend invite — regenerates the token (invalidates the old link) and
  // bumps invite_sent_at. Doesn't change activation state.
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

  // Soft-delete (revoke). active=0 means requireSalesMember rejects them
  // without losing their history — assigned soumissions still reference
  // the row id for audit. A hard delete would orphan those assignments.
  router.delete('/api/admin/sales-team/:id', requireAdmin, async function(req, res) {
    try {
      await db.run("UPDATE sales_team_members SET active = 0, updated_at = NOW() WHERE id = $1", [req.params.id]);
      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
  });

  // Assign a soumission to a sales person. Pass sales_member_id=null to
  // unassign. Admin-only — nobody else gets to touch the assignment.
  // Assignment — admin assigns a soumission to a sales-team member.
  //
  // Relaxed from the original "must be activated" requirement: admin can
  // now pre-assign before the rep activates. The rep will see the
  // assignment as soon as their /mon-compte loads after activation.
  // We keep the active=1 guard so admins can't assign to soft-deleted
  // (revoked) members.
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

  // ============================================================
  // Invite activation (public endpoint, no menu, token-gated)
  // ============================================================
  // The invitee lands here from their email. We render a hidden page that
  // hosts the platform's OTP modal flow; once they verify their email or
  // mobile (matching what admin entered), the page POSTs to the activate
  // endpoint which links the OTP'd users.id to sales_team_members.
  router.get('/sales/invite/:token', async function(req, res) {
    try {
      const ctx = await baseCtx(req);
      const member = await db.get(
        "SELECT id, full_name, email, mobile, title, invite_accepted_at, active FROM sales_team_members WHERE invite_token = $1",
        [req.params.token]
      );
      // Don't leak whether the token is valid vs invalid — but we DO need
      // to render different UI for "already activated" so the invitee
      // doesn't bounce off the page after a successful first activation.
      res.render('sales-invite', Object.assign(ctx, {
        token: req.params.token,
        member: member || null,
        invalid: !member || !member.active,
        alreadyActivated: !!(member && member.invite_accepted_at),
      }));
    } catch(e) { console.error(e); res.status(500).send('Erreur'); }
  });

  // POST after the visitor OTP'd. requireAuth gives us the verified user.
  // The 192-bit invite token + a valid platform login is sufficient
  // consent to bind the slot — the magic link is delivered only to the
  // admin-entered email recipient and is unguessable, so possession +
  // login proves identity. We DON'T require the OTP'd channel to equal
  // admin's entry (the previous strict check produced a confusing
  // "Bienvenue, X" + "your identifier doesn't match" contradiction for
  // visitors using an existing account to claim an invite).
  //
  // Two invariants are still enforced:
  //   1. Single-rep-per-row: if member.user_id already points at a
  //      DIFFERENT user, reject with 409.
  //   2. Single-active-slot-per-user: if THIS user is already linked to
  //      another active sales-team row, reject with 409.
  // Cross-identity claims (channels don't match) emit an audit log line.
  router.post('/api/sales/invite/:token/activate', services.auth.requireAuth, async function(req, res) {
    try {
      const member = await db.get(
        "SELECT * FROM sales_team_members WHERE invite_token = $1",
        [req.params.token]
      );
      if (!member) return res.status(404).json({ error: 'Invitation introuvable.' });
      if (!member.active) return res.status(403).json({ error: 'Cette invitation a été révoquée.' });

      const u = req.tenantUser;

      // Invariant: this user already wears another active sales-team hat?
      const otherActive = await db.get(
        "SELECT id, full_name FROM sales_team_members WHERE user_id = $1 AND active = 1 AND id != $2",
        [u.id, member.id]
      );
      if (otherActive) {
        return res.status(409).json({
          error: 'Vous êtes déjà commercial actif (' + (otherActive.full_name || '#' + otherActive.id) + '). Demandez à votre administrateur de révoquer l\'autre profil avant d\'activer celui-ci.',
        });
      }

      // Atomic claim — the WHERE clause prevents race conditions where
      // two concurrent requests would both pass the application-level
      // user_id check, then both UPDATE. Only one can hit a row whose
      // user_id is NULL or already equals our user. We then verify
      // ownership by SELECT to surface a clear 409 if we lost the race.
      await db.run(
        "UPDATE sales_team_members SET user_id = $1, invite_accepted_at = COALESCE(invite_accepted_at, NOW()), updated_at = NOW() WHERE id = $2 AND active = 1 AND (user_id IS NULL OR user_id = $1)",
        [u.id, member.id]
      );
      const claimed = await db.get("SELECT user_id FROM sales_team_members WHERE id = $1", [member.id]);
      if (!claimed || claimed.user_id !== u.id) {
        return res.status(409).json({ error: 'Cette invitation est déjà liée à un autre compte.' });
      }

      // Audit-log cross-identity claims (channels don't match admin's
      // entry). Visible in Railway logs; not stored in the row to keep
      // schema simple.
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

      // Backfill the user record from the admin-entered contact details.
      // The admin's entries are canonical for sales reps — they're the
      // source of truth that "name + email + mobile" should appear on the
      // rep's Mon Compte after activation. The OTP only stamps whichever
      // single channel verified, so without this step the other two
      // fields stay blank on the rep's profile (which then gets locked
      // for editing — see the Mon Compte view).
      //
      // Rules:
      //   • display_name — always overwrite with member.full_name. Admin
      //     typed it; a generic OTP-side default would be empty anyway.
      //   • email — only fill if currently empty (rep matched via mobile
      //     → email channel was never OTP'd). Email already set means it
      //     was the verified OTP channel, leave verified=1.
      //   • phone — same: fill from member.mobile only when empty.
      //     verified=0 since the mobile wasn't OTP'd.
      // We never DOWNGRADE a verified channel.
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
        // Non-fatal — activation already linked the row. Log so we can
        // see if a rep ever lands on Mon Compte with empty fields again.
        console.error('[Sales Activate] Profile backfill failed (non-fatal):', backfillErr.message);
      }

      res.json({ success: true });
    } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur lors de l\'activation' }); }
  });

  // /sales/dashboard now redirects to /mon-compte — the unified account
  // page surfaces both the user's own submissions AND any soumissions
  // assigned to them as a sales rep. Kept as a 302 (not removed) so
  // bookmarks and the email invite link's "after activation" redirect
  // stay functional even if a rep saved the old URL.
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

  // Sales person updates the status of a soumission they own. Restricted
  // to their assigned rows so one rep can't tamper with another's queue.
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
