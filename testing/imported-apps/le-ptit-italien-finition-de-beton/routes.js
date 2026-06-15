module.exports = function(services){
  const router = require('express').Router();
  const db = services.db;

  function formatDate(d, lang){ if(!d) return ''; try { return new Date(d).toLocaleDateString(lang==='en'?'en-CA':'fr-CA',{year:'numeric',month:'long',day:'numeric'}); } catch(e){ return ''; } }
  function truncate(s, n){ s=String(s||''); return s.length>n ? s.slice(0,n).trim()+'…' : s; }
  function telHref(p){ var x=String(p||'').replace(/[^0-9+]/g,''); return x?('tel:'+x):'contact'; }
  function nl2br(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function svcIcon(k){var i={concrete:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 10h18M9 4v16M15 10v10"/></svg>',terrazzo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><circle cx="11" cy="15" r="1.4" fill="currentColor"/><circle cx="15.5" cy="14.5" r="0.9" fill="currentColor"/></svg>',acrylic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="13" height="6" rx="1"/><path d="M16 7h4v4h-7M12 13v3a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v0"/></svg>',plaster:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 14 14 3l4 4L7 18z"/><path d="m14 7 3 3"/><path d="M3 21h18"/></svg>',foundation:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="12"/><path d="M3 12h18M9 6v6M15 12v6"/></svg>',exterior:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20 9 4h6l5 16"/><path d="M9 12h6M8 8h8"/></svg>',default:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12 4 4L19 6"/></svg>'};return i[k]||i.default;}

  const T = {
    fr: {
      meta_title: "Finition de plancher de béton au Québec",
      meta_desc: "Le P'tit Italien — finition de plancher de béton, terrazzo, acrylique, plâtrage et réparation de solage. Travail d'artisan garanti, partout au Québec.",
      nav_home: "Accueil", nav_work: "Réalisations", nav_services: "Services", nav_testimonials: "Témoignages", nav_advice: "Conseils", nav_contact: "Contact", nav_menu: "Menu",
      call: "Appeler", call_now: "Appeler maintenant", get_quote: "Demander une soumission", enable_notifs: "Activer les notifications",
      slogan: "Quand j'ai terminé le plancher, vous marcherez sur mon plancher ou vous ne me payez pas",
      hero_kicker: "Finisseur de plancher de béton · Artisan québécois",
      hero_sub: "Béton poli, terrazzo, acrylique de toutes les couleurs, plâtrage et réparation de solage. Un fini impeccable, garanti — du résidentiel au commercial, partout au Québec.",
      hero_cta2: "Demander une soumission",
      guarantee_eyebrow: "La parole de l'artisan", guarantee_title: "Satisfaction garantie, ou vous ne payez pas",
      guarantee_text: "Chaque plancher porte ma signature. Si le résultat ne vous satisfait pas pleinement, vous ne me payez pas. C'est aussi simple — et aussi sérieux — que ça.",
      guarantee_seal: "GARANTIE · SATISFACTION TOTALE · ", guarantee_badge: "GARANTI",
      services_eyebrow: "Notre savoir-faire", services_title: "Des services de finition complets", services_sub: "De la dalle brute au fini soigné, un seul artisan pour un résultat cohérent.", services_all: "Voir tous les services", price_default: "Estimation gratuite",
      work_eyebrow: "Réalisations", work_title: "Des planchers qui parlent d'eux-mêmes", work_sub: "Béton poli, terrazzo et finitions acryliques réalisés à la main.", work_all: "Voir toute la galerie", filter_all: "Tout",
      about_eyebrow: "L'artisan", about_title: "Le P'tit Italien",
      about_text: "Le P'tit Italien, c'est un métier appris à la dure et perfectionné pendant des décennies. Mario Pannitti finit le béton comme on termine une œuvre : à la flatteuse, à la truelle, avec l'œil et la main. Du plancher poli au fini terrazzo en passant par l'acrylique de couleur, chaque chantier reçoit la même obsession du détail.",
      about_p2: "Résidentiel ou commercial, petit ou grand : le résultat doit être impeccable. Sinon, vous ne payez pas.",
      testi_eyebrow: "Témoignages", testi_title: "Ce que disent nos clients", testi_sub: "La satisfaction, client après client.",
      season_eyebrow: "Haute saison", season_title: "Réservez votre projet avant la cohue", season_text: "La saison du béton commence avec l'été et s'intensifie avant les vacances de la construction et le retour du froid. Les bonnes dates partent vite — parlons de votre projet dès maintenant.", season_cta: "Réserver",
      advice_eyebrow: "Conseils & actualités", advice_title: "Conseils & actualités", advice_sub: "Pour planifier vos travaux au bon moment.", advice_all: "Tous les articles", read_more: "Lire la suite",
      contact_eyebrow: "Contact", contact_info_title: "Coordonnées",
      form_name: "Nom complet", form_phone: "Téléphone", form_email: "Courriel", form_service: "Type de projet", form_message: "Détails du projet", form_send: "Envoyer ma demande", form_select: "Sélectionnez un service", form_note: "Réponse rapide, sans engagement.",
      form_success: "Merci! Votre demande a été envoyée. Nous vous rappellerons rapidement.", form_error: "Une erreur est survenue. Veuillez réessayer ou nous appeler directement.",
      phone_label: "Téléphone", email_label: "Courriel", address_label: "Adresse", area_label: "Zone desservie", area_default: "Partout au Québec",
      contact_cta_title: "Parlons de votre projet", contact_cta_text: "Un appel suffit pour obtenir une estimation gratuite et sans engagement.",
      empty_work: "La galerie sera bientôt remplie de nos réalisations.", empty_services: "Les services seront affichés ici sous peu.", empty_testimonials: "Les témoignages seront affichés ici sous peu.", empty_advice: "Aucun article pour le moment.",
      back_to_advice: "Retour aux conseils", published_on: "Publié le",
      footer_tagline: "Finition de plancher de béton et travaux connexes — un travail d'artisan, garanti.", footer_rights: "Tous droits réservés.", footer_nav: "Navigation", footer_contact_title: "Nous joindre",
      page_work_title: "Nos réalisations", page_work_sub: "Une sélection de planchers et de finitions livrés au Québec.",
      page_services_title: "Nos services", page_services_sub: "Le savoir-faire complet de la finition de béton et des travaux connexes.",
      page_testi_title: "Témoignages clients", page_testi_sub: "La satisfaction garantie, dans les mots de ceux qui ont marché sur nos planchers.",
      page_advice_title: "Conseils & actualités", page_advice_sub: "Tout pour planifier et réussir vos travaux de béton.",
      page_contact_title: "Contactez-nous", page_contact_sub: "Appelez directement ou remplissez le formulaire — réponse rapide."
    },
    en: {
      meta_title: "Concrete Floor Finishing in Quebec",
      meta_desc: "Le P'tit Italien — concrete floor finishing, terrazzo, acrylic, plastering and foundation repair. Guaranteed craftsmanship, across Quebec.",
      nav_home: "Home", nav_work: "Projects", nav_services: "Services", nav_testimonials: "Reviews", nav_advice: "Tips", nav_contact: "Contact", nav_menu: "Menu",
      call: "Call", call_now: "Call now", get_quote: "Request a quote", enable_notifs: "Enable notifications",
      slogan: "When I'm done your floor, you walk on my floor — or you don't pay me",
      hero_kicker: "Concrete floor finisher · Quebec craftsman",
      hero_sub: "Polished concrete, terrazzo, acrylic in every colour, plastering and foundation repair. A flawless finish, guaranteed — residential to commercial, across Quebec.",
      hero_cta2: "Request a quote",
      guarantee_eyebrow: "The craftsman's word", guarantee_title: "Satisfaction guaranteed, or you don't pay",
      guarantee_text: "Every floor carries my signature. If you're not fully satisfied with the result, you don't pay me. It's that simple — and that serious.",
      guarantee_seal: "GUARANTEED · TOTAL SATISFACTION · ", guarantee_badge: "GUARANTEED",
      services_eyebrow: "Our craft", services_title: "Complete finishing services", services_sub: "From raw slab to refined finish, one craftsman for a consistent result.", services_all: "View all services", price_default: "Free estimate",
      work_eyebrow: "Projects", work_title: "Floors that speak for themselves", work_sub: "Polished concrete, terrazzo and acrylic finishes done by hand.", work_all: "View the full gallery", filter_all: "All",
      about_eyebrow: "The craftsman", about_title: "Le P'tit Italien",
      about_text: "Le P'tit Italien is a trade learned the hard way and perfected over decades. Mario Pannitti finishes concrete the way an artist finishes a piece: with the power trowel, the hand trowel, the eye and the hand. From polished floors to terrazzo to coloured acrylic, every job gets the same obsession with detail.",
      about_p2: "Residential or commercial, big or small: the result must be flawless. Otherwise, you don't pay.",
      testi_eyebrow: "Reviews", testi_title: "What our clients say", testi_sub: "Satisfaction, client after client.",
      season_eyebrow: "Peak season", season_title: "Book your project before the rush", season_text: "Concrete season starts in summer and peaks before the construction holidays and the first cold snap. The best dates go fast — let's talk about your project now.", season_cta: "Book now",
      advice_eyebrow: "Tips & news", advice_title: "Tips & news", advice_sub: "To plan your work at the right time.", advice_all: "All articles", read_more: "Read more",
      contact_eyebrow: "Contact", contact_info_title: "Contact details",
      form_name: "Full name", form_phone: "Phone", form_email: "Email", form_service: "Project type", form_message: "Project details", form_send: "Send my request", form_select: "Select a service", form_note: "Fast reply, no obligation.",
      form_success: "Thank you! Your request has been sent. We'll get back to you quickly.", form_error: "Something went wrong. Please try again or call us directly.",
      phone_label: "Phone", email_label: "Email", address_label: "Address", area_label: "Service area", area_default: "Across Quebec",
      contact_cta_title: "Let's talk about your project", contact_cta_text: "One call is all it takes for a free, no-obligation estimate.",
      empty_work: "The gallery will soon be filled with our projects.", empty_services: "Services will appear here shortly.", empty_testimonials: "Reviews will appear here shortly.", empty_advice: "No articles yet.",
      back_to_advice: "Back to tips", published_on: "Published on",
      footer_tagline: "Concrete floor finishing and related trades — craftsmanship, guaranteed.", footer_rights: "All rights reserved.", footer_nav: "Navigation", footer_contact_title: "Get in touch",
      page_work_title: "Our projects", page_work_sub: "A selection of floors and finishes delivered across Quebec.",
      page_services_title: "Our services", page_services_sub: "The full craft of concrete finishing and related trades.",
      page_testi_title: "Client reviews", page_testi_sub: "Satisfaction guaranteed, in the words of those who've walked on our floors.",
      page_advice_title: "Tips & news", page_advice_sub: "Everything to plan and succeed with your concrete work.",
      page_contact_title: "Contact us", page_contact_sub: "Call directly or fill out the form — fast reply."
    }
  };

  async function getSettings(){ try { var rows=await db.all('SELECT key,value FROM admin_settings'); var o={}; (rows||[]).forEach(function(r){ o[r.key]=r.value; }); return o; } catch(e){ return {}; } }
  function applyTextOverrides(t, settings, lang){ for (var k in settings){ if(k.indexOf('text_')===0 && k.slice(-(lang.length+1))==='_'+lang){ var tk=k.slice(5,-(lang.length+1)); if(tk) t[tk]=settings[k]; } } return t; }
  async function baseCtx(req, extra){ var lang=req.lang||'fr'; var settings=await getSettings(); var t=applyTextOverrides(Object.assign({}, T[lang]||T.fr), settings, lang); return Object.assign({ t:t, lang:lang, settings:settings, active:'', fmtDate:function(d){return formatDate(d,lang);}, truncate:truncate, telHref:telHref, nl2br:nl2br, svcIcon:svcIcon }, extra||{}); }

  (async function(){ try { var cfg=services.config||{}; var defs=[['business_name', cfg.businessName||cfg.displayName||"Le P'tit Italien"],['contact_email', cfg.contactEmail||''],['contact_phone', cfg.contactPhone||''],['business_address', cfg.businessAddress||''],['service_area','Partout au Québec']]; for(var i=0;i<defs.length;i++){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[defs[i][0], defs[i][1]]); } } catch(e){} })();

  router.use(function(req,res,next){ var lang=req.query.lang || (req.cookies && req.cookies.pwa_lang) || 'fr'; if(lang!=='fr' && lang!=='en') lang='fr'; if(req.query.lang){ try { res.cookie('pwa_lang', lang, { maxAge: 365*24*60*60*1000, httpOnly:false }); } catch(e){} } req.lang=lang; next(); });

  router.use(async function(req,res,next){ try { if(req.method==='GET' && req.path.indexOf('/api')!==0 && req.path.indexOf('/admin')!==0 && !req.path.includes('.')){ await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); } } catch(e){} next(); });

  function requireAdmin(req,res,next){ if(!services.admin.isAdmin(req)) return res.status(403).json({error:'Forbidden'}); next(); }

  router.get('/', async function(req,res){ try { var projects=await db.all("SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, created_at DESC LIMIT 6"); var serviceList=await db.all("SELECT * FROM services ORDER BY sort_order ASC, created_at DESC"); var testimonials=await db.all("SELECT * FROM testimonials ORDER BY featured DESC, created_at DESC LIMIT 6"); var posts=await db.all("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3"); res.render('index', await baseCtx(req,{ active:'home', projects:projects||[], serviceList:serviceList||[], testimonials:testimonials||[], posts:posts||[] })); } catch(e){ console.error(e); res.status(500).send('Erreur'); } });

  router.get('/realisations', async function(req,res){ try { var projects=await db.all("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC"); var cats=[]; (projects||[]).forEach(function(p){ if(p.category && cats.indexOf(p.category)<0) cats.push(p.category); }); res.render('realisations', await baseCtx(req,{ active:'work', projects:projects||[], cats:cats })); } catch(e){ console.error(e); res.status(500).send('Erreur'); } });

  router.get('/services', async function(req,res){ try { var serviceList=await db.all("SELECT * FROM services ORDER BY sort_order ASC, created_at DESC"); res.render('services', await baseCtx(req,{ active:'services', serviceList:serviceList||[] })); } catch(e){ console.error(e); res.status(500).send('Erreur'); } });

  router.get('/temoignages', async function(req,res){ try { var testimonials=await db.all("SELECT * FROM testimonials ORDER BY featured DESC, created_at DESC"); res.render('temoignages', await baseCtx(req,{ active:'testimonials', testimonials:testimonials||[] })); } catch(e){ console.error(e); res.status(500).send('Erreur'); } });

  router.get('/conseils', async function(req,res){ try { var posts=await db.all("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC"); res.render('conseils', await baseCtx(req,{ active:'advice', posts:posts||[] })); } catch(e){ console.error(e); res.status(500).send('Erreur'); } });

  router.get('/conseils/:id', async function(req,res){ try { var post=await db.get('SELECT * FROM posts WHERE id=$1 AND published=1',[req.params.id]); if(!post) return res.redirect('conseils'); res.render('conseil', await baseCtx(req,{ active:'advice', post:post })); } catch(e){ console.error(e); res.redirect('conseils'); } });

  router.get('/contact', async function(req,res){ try { res.render('contact', await baseCtx(req,{ active:'contact' })); } catch(e){ console.error(e); res.status(500).send('Erreur'); } });

  router.post('/api/contact', async function(req,res){ try { var b=req.body||{}; var name=b.name, phone=b.phone, email=b.email; if(!name || (!phone && !email)) return res.status(400).json({error:'Champs requis manquants'}); await db.run('INSERT INTO form_submissions (name,email,phone,service,message) VALUES ($1,$2,$3,$4,$5)',[name, email||'', phone||'', b.service||'', b.message||'']); try { if(services.config && services.config.contactEmail){ await services.email.send({ to: services.config.contactEmail, subject: 'Nouvelle demande de soumission — '+name, html: '<h2>Nouvelle demande</h2><p><b>Nom:</b> '+esc(name)+'</p><p><b>Téléphone:</b> '+esc(phone||'-')+'</p><p><b>Courriel:</b> '+esc(email||'-')+'</p><p><b>Type de projet:</b> '+esc(b.service||'-')+'</p><p><b>Message:</b><br>'+esc(b.message||'-')+'</p>' }); } } catch(em){ console.error('email', em.message); } res.json({success:true}); } catch(e){ console.error(e); res.status(500).json({error:'Echec de l\'envoi'}); } });

  router.get('/admin', async function(req,res){ if(!services.admin.isAdmin(req)) return res.redirect('admin/login'); try { async function cnt(t){ try { var r=await db.get('SELECT COUNT(*) c FROM '+t); return Number(r.c)||0; } catch(e){ return 0; } } var stats={ projects:await cnt('projects'), services:await cnt('services'), testimonials:await cnt('testimonials'), posts:await cnt('posts'), submissions:await cnt('form_submissions'), totalVisits:await cnt('site_visits'), recentVisits:0 }; try { var rv=await db.get("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"); stats.recentVisits=Number(rv.c)||0; } catch(e){} var subs=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 8'); res.render('admin', { active:'dashboard', stats:stats, subs:subs||[], fmtDate:function(d){return formatDate(d,'fr');} }); } catch(e){ console.error(e); res.status(500).send('Erreur'); } });

  function adminPageRoute(view){ return function(req,res){ if(!services.admin.isAdmin(req)) return res.redirect('admin/login'); res.render(view, {}); }; }
  router.get('/admin/posts', adminPageRoute('admin-posts'));
  router.get('/admin/projects', adminPageRoute('admin-projects'));
  router.get('/admin/services', adminPageRoute('admin-services'));
  router.get('/admin/testimonials', adminPageRoute('admin-testimonials'));
  router.get('/admin/settings', adminPageRoute('admin-settings'));

  router.get('/api/admin/stats', requireAdmin, async function(req,res){ try { async function cnt(t){ try { var r=await db.get('SELECT COUNT(*) c FROM '+t); return Number(r.c)||0; } catch(e){ return 0; } } var totalVisits=await cnt('site_visits'); var recentVisits=0; try { var rv=await db.get("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"); recentVisits=Number(rv.c)||0; } catch(e){} res.json({ userCount:0, pushSubscriberCount:0, totalVisits:totalVisits, recentVisits:recentVisits, submissions:await cnt('form_submissions'), projects:await cnt('projects'), services:await cnt('services'), testimonials:await cnt('testimonials'), posts:await cnt('posts') }); } catch(e){ res.status(500).json({error:'err'}); } });

  router.get('/api/admin/submissions', requireAdmin, async function(req,res){ try { var rows=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC'); res.json({ submissions: rows||[] }); } catch(e){ res.status(500).json({error:'err'}); } });

  router.get('/api/admin/modules', requireAdmin, function(req,res){ res.json({ modules: [
    { key:'projects', label:'Réalisations', icon:'image', fields:[
      { name:'title', label:'Titre', type:'text', required:true, maxLength:160, description:"Nom de la réalisation affiché sur la carte.", placeholder:'ex. Plancher de béton poli — Garage' },
      { name:'category', label:'Catégorie', type:'select', options:['Béton poli','Terrazzo','Acrylique','Plâtrage / Crépi','Solage','Extérieur'], description:'Sert de filtre dans la galerie publique.' },
      { name:'location', label:'Lieu', type:'text', description:'Ville ou région du projet.', placeholder:'ex. Trois-Rivières' },
      { name:'description', label:'Description', type:'textarea', description:'Courte description affichée au survol.', placeholder:'Décrivez brièvement le projet…' },
      { name:'image_url', label:'Photo', type:'image', description:'Photo de la réalisation. Recommandé : paysage 1200x900 px.' },
      { name:'video_url', label:'Vidéo (optionnel)', type:'url', description:'Lien d intégration YouTube/Vimeo ou fichier .mp4.', placeholder:'https://...' },
      { name:'featured', label:'En vedette', type:'boolean', description:"Cochez pour afficher en priorité sur la page d'accueil." },
      { name:'sort_order', label:'Ordre', type:'number', min:0, step:1, description:'Ordre d affichage (plus petit = en premier).', placeholder:'0' }
    ]},
    { key:'services', label:'Services', icon:'list', fields:[
      { name:'name', label:'Nom', type:'text', required:true, maxLength:120, description:'Nom du service.', placeholder:'ex. Finition de plancher de béton' },
      { name:'icon', label:'Pictogramme', type:'select', options:['concrete','terrazzo','acrylic','plaster','foundation','exterior'], description:'Icône affichée sur la carte de service.' },
      { name:'description', label:'Description', type:'textarea', description:'Description du service.', placeholder:'Décrivez ce service…' },
      { name:'price_note', label:'Note de prix', type:'text', description:'Mention affichée (ex. Estimation gratuite). Champ fonctionnel affiché sur la carte de service.', placeholder:'Estimation gratuite' },
      { name:'image_url', label:'Image', type:'image', description:'Image optionnelle. Recommandé : paysage 1200x800 px.' },
      { name:'featured', label:'En vedette', type:'boolean', description:'Cochez pour mettre ce service en avant.' },
      { name:'sort_order', label:'Ordre', type:'number', min:0, step:1, description:'Ordre d affichage.', placeholder:'0' }
    ]},
    { key:'testimonials', label:'Témoignages', icon:'star', fields:[
      { name:'author', label:'Client', type:'text', required:true, maxLength:120, description:'Nom du client.', placeholder:'ex. Jean Tremblay' },
      { name:'role', label:'Ville / type', type:'text', description:'Ville ou type de client.', placeholder:'ex. Propriétaire, Shawinigan' },
      { name:'content', label:'Témoignage', type:'textarea', required:true, description:'Texte du témoignage.', placeholder:'Ce que le client a dit…' },
      { name:'rating', label:'Note (1-5)', type:'number', min:1, max:5, step:1, default:5, description:"Nombre d'étoiles affichées.", placeholder:'5' },
      { name:'image_url', label:'Photo', type:'image', description:'Photo du client (optionnel). Carré 200x200 px.' },
      { name:'featured', label:'En vedette', type:'boolean', description:'Cochez pour afficher en priorité.' }
    ]},
    { key:'posts', label:'Conseils', icon:'edit', fields:[
      { name:'title', label:'Titre', type:'text', required:true, maxLength:200, description:"Titre de l'article affiché sur la page Conseils.", placeholder:'ex. Réserver vos travaux avant les vacances' },
      { name:'category', label:'Catégorie', type:'select', options:['Conseils','Actualités','Béton','Terrazzo','Acrylique'], description:'Regroupe les articles par thème.' },
      { name:'image_url', label:'Image', type:'image', description:'Image à la une. Recommandé : paysage 1200x630 px.' },
      { name:'content', label:'Contenu', type:'textarea', description:'Corps de l article. Les sauts de ligne sont conservés.', placeholder:'Rédigez votre article ici…' },
      { name:'published', label:'Publié', type:'boolean', default:true, description:'Décochez pour enregistrer comme brouillon (masqué du site).' }
    ]},
    { key:'form_submissions', label:'Soumissions', icon:'inbox', fields:[
      { name:'name', label:'Nom', type:'text', description:'Nom du demandeur.' },
      { name:'email', label:'Courriel', type:'text', description:'Adresse courriel.' },
      { name:'phone', label:'Téléphone', type:'text', description:'Numéro de téléphone.' },
      { name:'service', label:'Service', type:'text', description:'Type de projet demandé.' },
      { name:'message', label:'Message', type:'textarea', description:'Détails du projet.' }
    ]}
  ], settingsFields: [] }); });

  router.get('/api/admin/settings', requireAdmin, async function(req,res){ res.json(await getSettings()); });
  router.put('/api/admin/settings', requireAdmin, async function(req,res){ try { var b=req.body||{}; if(!b.key) return res.status(400).json({error:'key requis'}); await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[b.key, b.value]); res.json({success:true}); } catch(e){ res.status(500).json({error:'err'}); } });

  router.post('/api/admin/upload', requireAdmin, async function(req,res){ try { var dataUri=(req.body||{}).dataUri; if(!dataUri) return res.status(400).json({error:'Aucune image'}); if(!(services.cloudinary && services.cloudinary.uploader && typeof services.cloudinary.uploader.upload==='function')) return res.status(503).json({error:'Téléversement non disponible'}); var result=await services.cloudinary.uploader.upload(dataUri, { folder:'le-ptit-italien-finition-de-beton/uploads' }); res.json({ url: result.secure_url }); } catch(e){ console.error('upload', e.message); res.status(500).json({error:'Echec du téléversement'}); } });

  router.post('/api/admin/generate-image', requireAdmin, async function(req,res){ var b=req.body||{}; if(!b.prompt) return res.status(400).json({error:'Description requise'}); try { var url=await services.ai.generateImage(b.prompt, { aspectRatio: b.aspectRatio || '4:3' }); res.json({ imageUrl: url }); } catch(e){ console.error('genimg', e.message); res.status(500).json({error:'Echec de la génération. Téléversez une image manuellement.'}); } });

  var REG = {
    posts: ['title','content','image_url','category','published'],
    projects: ['title','description','image_url','video_url','category','location','featured','sort_order'],
    services: ['name','description','image_url','price_note','icon','featured','sort_order'],
    testimonials: ['author','role','content','rating','image_url','featured'],
    form_submissions: ['name','email','phone','service','message']
  };

  function normVal(col, v){ if(col==='published'||col==='featured'){ return (v===true||v===1||v==='1'||v==='true')?1:0; } if(col==='sort_order'||col==='rating'){ var n=parseInt(v,10); return isNaN(n)?0:n; } return v==null?null:v; }
  function orderFor(t){ return (t==='projects'||t==='services') ? 'sort_order ASC, created_at DESC' : 'created_at DESC'; }

  function buildInsert(table, fields, body){
    var cols = fields.filter(function(c){ return body[c] !== undefined; });
    var vals = cols.map(function(c){ return normVal(c, body[c]); });
    var ph = cols.map(function(_, i){ return '$' + (i + 1); });
    return { cols: cols, vals: vals, ph: ph };
  }

  function buildUpdate(fields, body){
    var cols = fields.filter(function(c){ return body[c] !== undefined; });
    var vals = cols.map(function(c){ return normVal(c, body[c]); });
    var sets = cols.map(function(c, i){ return c + '=$' + (i + 1); });
    return { cols: cols, vals: vals, sets: sets };
  }

  // Explicit CRUD routes for each admin-managed table

  router.get('/api/admin/posts', requireAdmin, async function(req,res){ try { var rows=await db.all('SELECT * FROM posts ORDER BY created_at DESC'); res.json({ posts: rows||[] }); } catch(e){ res.status(500).json({error:'err'}); } });
  router.post('/api/admin/posts', requireAdmin, async function(req,res){ try { var p=buildInsert('posts',REG.posts,req.body||{}); if(!p.cols.length) return res.status(400).json({error:'Aucune donnée'}); var row=await db.get('INSERT INTO posts ('+p.cols.join(',')+') VALUES ('+p.ph.join(',')+') RETURNING *',p.vals); res.json({success:true,item:row}); } catch(e){ console.error('create posts',e.message); res.status(500).json({error:'Création échouée'}); } });
  router.put('/api/admin/posts/:id', requireAdmin, async function(req,res){ try { var u=buildUpdate(REG.posts,req.body||{}); if(!u.cols.length) return res.status(400).json({error:'Aucune donnée'}); u.vals.push(req.params.id); var row=await db.get('UPDATE posts SET '+u.sets.join(',')+', updated_at=NOW() WHERE id=$'+u.cols.length+1+' RETURNING *',u.vals); res.json({success:true,item:row}); } catch(e){ console.error('update posts',e.message); res.status(500).json({error:'Mise à jour échouée'}); } });
  router.delete('/api/admin/posts/:id', requireAdmin, async function(req,res){ try { await db.run('DELETE FROM posts WHERE id=$1',[req.params.id]); res.json({success:true}); } catch(e){ res.status(500).json({error:'Suppression échouée'}); } });

  router.get('/api/admin/projects', requireAdmin, async function(req,res){ try { var rows=await db.all('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC'); res.json({ projects: rows||[] }); } catch(e){ res.status(500).json({error:'err'}); } });
  router.post('/api/admin/projects', requireAdmin, async function(req,res){ try { var p=buildInsert('projects',REG.projects,req.body||{}); if(!p.cols.length) return res.status(400).json({error:'Aucune donnée'}); var row=await db.get('INSERT INTO projects ('+p.cols.join(',')+') VALUES ('+p.ph.join(',')+') RETURNING *',p.vals); res.json({success:true,item:row}); } catch(e){ console.error('create projects',e.message); res.status(500).json({error:'Création échouée'}); } });
  router.put('/api/admin/projects/:id', requireAdmin, async function(req,res){ try { var u=buildUpdate(REG.projects,req.body||{}); if(!u.cols.length) return res.status(400).json({error:'Aucune donnée'}); u.vals.push(req.params.id); var row=await db.get('UPDATE projects SET '+u.sets.join(',')+', updated_at=NOW() WHERE id=$'+u.cols.length+1+' RETURNING *',u.vals); res.json({success:true,item:row}); } catch(e){ console.error('update projects',e.message); res.status(500).json({error:'Mise à jour échouée'}); } });
  router.delete('/api/admin/projects/:id', requireAdmin, async function(req,res){ try { await db.run('DELETE FROM projects WHERE id=$1',[req.params.id]); res.json({success:true}); } catch(e){ res.status(500).json({error:'Suppression échouée'}); } });

  router.get('/api/admin/services', requireAdmin, async function(req,res){ try { var rows=await db.all('SELECT * FROM services ORDER BY sort_order ASC, created_at DESC'); res.json({ services: rows||[] }); } catch(e){ res.status(500).json({error:'err'}); } });
  router.post('/api/admin/services', requireAdmin, async function(req,res){ try { var p=buildInsert('services',REG.services,req.body||{}); if(!p.cols.length) return res.status(400).json({error:'Aucune donnée'}); var row=await db.get('INSERT INTO services ('+p.cols.join(',')+') VALUES ('+p.ph.join(',')+') RETURNING *',p.vals); res.json({success:true,item:row}); } catch(e){ console.error('create services',e.message); res.status(500).json({error:'Création échouée'}); } });
  router.put('/api/admin/services/:id', requireAdmin, async function(req,res){ try { var u=buildUpdate(REG.services,req.body||{}); if(!u.cols.length) return res.status(400).json({error:'Aucune donnée'}); u.vals.push(req.params.id); var row=await db.get('UPDATE services SET '+u.sets.join(',')+', updated_at=NOW() WHERE id=$'+u.cols.length+1+' RETURNING *',u.vals); res.json({success:true,item:row}); } catch(e){ console.error('update services',e.message); res.status(500).json({error:'Mise à jour échouée'}); } });
  router.delete('/api/admin/services/:id', requireAdmin, async function(req,res){ try { await db.run('DELETE FROM services WHERE id=$1',[req.params.id]); res.json({success:true}); } catch(e){ res.status(500).json({error:'Suppression échouée'}); } });

  router.get('/api/admin/testimonials', requireAdmin, async function(req,res){ try { var rows=await db.all('SELECT * FROM testimonials ORDER BY created_at DESC'); res.json({ testimonials: rows||[] }); } catch(e){ res.status(500).json({error:'err'}); } });
  router.post('/api/admin/testimonials', requireAdmin, async function(req,res){ try { var p=buildInsert('testimonials',REG.testimonials,req.body||{}); if(!p.cols.length) return res.status(400).json({error:'Aucune donnée'}); var row=await db.get('INSERT INTO testimonials ('+p.cols.join(',')+') VALUES ('+p.ph.join(',')+') RETURNING *',p.vals); res.json({success:true,item:row}); } catch(e){ console.error('create testimonials',e.message); res.status(500).json({error:'Création échouée'}); } });
  router.put('/api/admin/testimonials/:id', requireAdmin, async function(req,res){ try { var u=buildUpdate(REG.testimonials,req.body||{}); if(!u.cols.length) return res.status(400).json({error:'Aucune donnée'}); u.vals.push(req.params.id); var row=await db.get('UPDATE testimonials SET '+u.sets.join(',')+', updated_at=NOW() WHERE id=$'+u.cols.length+1+' RETURNING *',u.vals); res.json({success:true,item:row}); } catch(e){ console.error('update testimonials',e.message); res.status(500).json({error:'Mise à jour échouée'}); } });
  router.delete('/api/admin/testimonials/:id', requireAdmin, async function(req,res){ try { await db.run('DELETE FROM testimonials WHERE id=$1',[req.params.id]); res.json({success:true}); } catch(e){ res.status(500).json({error:'Suppression échouée'}); } });

  router.get('/api/admin/form_submissions', requireAdmin, async function(req,res){ try { var rows=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC'); res.json({ form_submissions: rows||[] }); } catch(e){ res.status(500).json({error:'err'}); } });
  router.post('/api/admin/form_submissions', requireAdmin, async function(req,res){ try { var p=buildInsert('form_submissions',REG.form_submissions,req.body||{}); if(!p.cols.length) return res.status(400).json({error:'Aucune donnée'}); var row=await db.get('INSERT INTO form_submissions ('+p.cols.join(',')+') VALUES ('+p.ph.join(',')+') RETURNING *',p.vals); res.json({success:true,item:row}); } catch(e){ console.error('create form_submissions',e.message); res.status(500).json({error:'Création échouée'}); } });
  router.put('/api/admin/form_submissions/:id', requireAdmin, async function(req,res){ try { var u=buildUpdate(REG.form_submissions,req.body||{}); if(!u.cols.length) return res.status(400).json({error:'Aucune donnée'}); u.vals.push(req.params.id); var row=await db.get('UPDATE form_submissions SET '+u.sets.join(',')+'WHERE id=$'+u.cols.length+1+' RETURNING *',u.vals); res.json({success:true,item:row}); } catch(e){ console.error('update form_submissions',e.message); res.status(500).json({error:'Mise à jour échouée'}); } });
  router.delete('/api/admin/form_submissions/:id', requireAdmin, async function(req,res){ try { await db.run('DELETE FROM form_submissions WHERE id=$1',[req.params.id]); res.json({success:true}); } catch(e){ res.status(500).json({error:'Suppression échouée'}); } });

  // Generic wildcard CRUD (catches any REG table not matched above)
  router.get('/api/admin/:table', requireAdmin, async function(req,res){ var t=req.params.table; if(!REG[t]) return res.status(404).json({error:'Module inconnu'}); try { var rows=await db.all('SELECT * FROM '+t+' ORDER BY '+orderFor(t)); var o={}; o[t]=rows||[]; res.json(o); } catch(e){ res.status(500).json({error:'err'}); } });
  router.post('/api/admin/:table', requireAdmin, async function(req,res){ var t=req.params.table; if(!REG[t]) return res.status(404).json({error:'Module inconnu'}); try { var p=buildInsert(t,REG[t],req.body||{}); if(!p.cols.length) return res.status(400).json({error:'Aucune donnée'}); var row=await db.get('INSERT INTO '+t+' ('+p.cols.join(',')+') VALUES ('+p.ph.join(',')+') RETURNING *',p.vals); res.json({success:true,item:row}); } catch(e){ console.error('create',e.message); res.status(500).json({error:'Création échouée'}); } });
  router.put('/api/admin/:table/:id', requireAdmin, async function(req,res){ var t=req.params.table; if(!REG[t]) return res.status(404).json({error:'Module inconnu'}); try { var u=buildUpdate(REG[t],req.body||{}); if(!u.cols.length) return res.status(400).json({error:'Aucune donnée'}); u.vals.push(req.params.id); var row=await db.get('UPDATE '+t+' SET '+u.sets.join(',')+', updated_at=NOW() WHERE id=$'+u.cols.length+1+' RETURNING *',u.vals); res.json({success:true,item:row}); } catch(e){ console.error('update',e.message); res.status(500).json({error:'Mise à jour échouée'}); } });
  router.delete('/api/admin/:table/:id', requireAdmin, async function(req,res){ var t=req.params.table; if(!REG[t]) return res.status(404).json({error:'Module inconnu'}); try { await db.run('DELETE FROM '+t+' WHERE id=$1',[req.params.id]); res.json({success:true}); } catch(e){ res.status(500).json({error:'Suppression échouée'}); } });

  router.get('*', function(req,res,next){ if(req.path.indexOf('/admin')===0 || req.path.indexOf('/api')===0) return next(); res.redirect('.'); });

  return router;
};
