module.exports = function(services){
  const router = require('express').Router();
  const db = services.db;

  const T = {
    fr: {
      brand_tagline:'La salle des ventes des collectionneurs sérieux.',
      nav_razes:'Razes', nav_sellers:'Vendeurs', nav_winners:'Gagnants', nav_transparency:'Transparence', nav_news:'Actualités', nav_contact:'Contact', nav_submit:'Soumettre une carte', nav_login:'Connexion', nav_messages:'Messages', nav_account:'Mon compte',
      footer_links:'Naviguer', footer_legal:'Légal', footer_rights:'Tous droits réservés.', footer_refund:'Politique de remboursement', enable_notif:'Activer les notifications',
      hero_eyebrow:'Encans certifiés · Cartes sportives', hero_title:'Où les cartes deviennent des lots.', hero_sub:'Soumettez, vendez et participez à des razes de cartes sportives gardées. Tirages aléatoires certifiés, vendeurs vérifiés, paiements par e-transfer.', hero_cta:'Voir les razes actifs', hero_cta2:'Notre certification',
      stat_active:'razes actifs', stat_members:'collectionneurs', stat_winners:'gagnants',
      home_active_eyebrow:'La salle des razes', home_active_title:'Lots en cours', view_all:'Tout voir',
      empty_razes:'Aucun raze pour le moment. Revenez bientôt.',
      home_how_eyebrow:'Le déroulement', home_how_title:'Comment fonctionne un raze',
      how1_t:'Choisissez un lot', how1_d:'Parcourez les cartes gardées mises en raze par nos vendeurs vérifiés.',
      how2_t:'Prenez vos entrées', how2_d:'Achetez une ou plusieurs entrées et payez simplement par e-transfer.',
      how3_t:'Tirage certifié', how3_d:'À la clôture, un gagnant est tiré aléatoirement avec preuve publique.',
      how4_t:'Recevez la carte', how4_d:'Le gagnant est notifié et la carte est expédiée en toute sécurité.',
      home_trust_eyebrow:'Confiance', home_trust_title:'Pourquoi les collectionneurs sérieux choisissent RAZZ·UP',
      trust1_t:'Tirages certifiés', trust1_d:'Chaque tirage produit une preuve cryptographique vérifiable. Zéro manipulation possible.',
      trust2_t:'Vendeurs vérifiés', trust2_d:'Badge de vérification, historique public et évaluations transparentes.',
      trust3_t:'Paiements protégés', trust3_d:'Fonds conservés jusqu’au tirage et politique de remboursement claire.',
      home_sellers_eyebrow:'La maison', home_sellers_title:'Vendeurs en vedette',
      home_winners_eyebrow:'Palmarès', home_winners_title:'Derniers gagnants',
      home_news_eyebrow:'Le journal', home_news_title:'Actualités & guides',
      cta_title:'Une carte à vendre?', cta_sub:'Soumettez-la en quelques minutes. Notre équipe l’évalue et la met en raze.', cta_btn:'Soumettre une carte',
      status_active:'En cours', status_upcoming:'À venir', status_drawn:'Tiré', status_closed:'Clôturé',
      raze_entry_price:'Entrée', raze_value:'Valeur estimée', raze_lot:'Lot', countdown_ended:'Terminé', raze_entries_label:'entrées',
      razes_title:'Les razes', razes_sub:'Parcourez tous les lots en cours et à venir.', filter_all_sports:'Tous les sports', filter_all_status:'Tous les statuts', filter_apply:'Filtrer',
      raze_ends:'Se termine le', raze_starts:'Débute le', raze_sold:'entrées vendues', raze_participate:'Participer', raze_quantity:'Nombre d’entrées', raze_total_label:'Total', raze_confirm:'Confirmer ma participation',
      raze_etransfer_title:'Instructions de paiement (e-transfer)', raze_etransfer_desc:'Envoyez votre e-transfer au courriel ci-dessous en indiquant la référence comme message. Votre entrée sera confirmée dès réception.', raze_etransfer_email:'Courriel e-transfer', raze_amount:'Montant', raze_ref:'Référence', raze_etransfer_note:'Vous pouvez suivre vos entrées dans « Mon compte ».',
      raze_login_prompt:'Connectez-vous pour participer', raze_seller_label:'Vendeur', raze_winner_label:'Gagnant', raze_proof_label:'Preuve du tirage (SHA-256)', raze_my_entries:'Mes entrées', raze_status_pending:'En attente de paiement', raze_status_confirmed:'Confirmée', raze_back:'Retour aux razes', raze_about:'À propos de ce lot', raze_certified_note:'Tirage aléatoire certifié · preuve publiée à la clôture', raze_contact_seller:'Contacter le vendeur', raze_drawn_note:'Ce raze a été tiré.',
      sellers_title:'Nos vendeurs', sellers_sub:'Des collectionneurs et boutiques de confiance.', seller_verified:'Vérifié', seller_sales:'ventes', seller_member_since:'Membre depuis', empty_sellers:'Aucun vendeur pour le moment.',
      seller_about:'À propos', seller_active_razes:'Razes de ce vendeur', seller_reviews:'Évaluations', seller_leave_review:'Laisser une évaluation', review_rating:'Note', review_comment:'Votre commentaire', review_submit:'Publier', review_thanks:'Merci pour votre évaluation!', review_login:'Connectez-vous pour évaluer ce vendeur.', empty_reviews:'Aucune évaluation pour l’instant.', seller_contact:'Contacter', back_to_sellers:'Retour aux vendeurs',
      winners_title:'Tableau des gagnants', winners_sub:'Chaque tirage est certifié et vérifiable.', winner_tickets:'billets', winner_proof:'Preuve', winner_date:'Date', empty_winners:'Aucun gagnant pour le moment.', winner_card_label:'Carte',
      transparency_title:'Certification & transparence', transparency_sub:'Notre engagement: des tirages que vous pouvez vérifier.', transp_step_title:'La mécanique du tirage', refund_title:'Politique de remboursement', transp_recent_title:'Tirages récents vérifiables', transp_proof_col:'Preuve (SHA-256)', transp_tickets_col:'Billets', transp_date_col:'Date', transp_raze_col:'Raze', transp_winner_col:'Gagnant', empty_drawn:'Aucun tirage completé pour l’instant.',
      transp_s1_t:'Graine sécurisée', transp_s1_d:'Au moment du tirage, une graine aléatoire cryptographique est générée.', transp_s2_t:'Tirage pondéré', transp_s2_d:'Chaque entrée confirmée compte comme un billet; le gagnant est choisi uniformément.', transp_s3_t:'Preuve publiée', transp_s3_d:'Une empreinte SHA-256 immuable est publiée avec le nombre exact de billets.',
      submit_title:'Soumettre une carte', submit_sub:'Décrivez votre carte. Notre équipe l’évalue et vous recontacte pour la mettre en raze.', submit_card_name:'Nom de la carte', submit_year:'Année', submit_grade:'Cote / Gradation', submit_sport:'Sport', submit_desc:'Description', submit_price:'Valeur demandée ($)', submit_image:'Photo de la carte', submit_image_hint:'Format carré recommandé · JPG ou PNG', submit_btn:'Envoyer la soumission', submit_success:'Soumission reçue! Nous vous recontacterons bientôt.', submit_login_prompt:'Connectez-vous pour soumettre une carte.', submit_select:'Choisir',
      messages_title:'Messagerie', messages_sub:'Échangez directement avec les autres membres.', msg_new:'Nouveau message', msg_to_email:'Courriel du destinataire', msg_send:'Envoyer', msg_select:'Sélectionnez une conversation.', msg_empty_threads:'Aucune conversation. Démarrez-en une.', msg_placeholder:'Écrivez votre message…', msg_login_prompt:'Connectez-vous pour accéder à votre messagerie.', msg_compose_title:'Nouveau message', msg_unread:'non lus',
      account_title:'Mon compte', account_sub:'Vos entrées et soumissions.', account_entries:'Mes entrées de razes', account_subs:'Mes soumissions de cartes', account_no_entries:'Vous n’avez pas encore d’entrée.', account_no_subs:'Aucune soumission pour l’instant.', account_notif_title:'Notifications', account_login_prompt:'Connectez-vous pour voir votre compte.', sub_status_pending:'En examen', sub_status_approved:'Approuvée', sub_status_rejected:'Refusée',
      contact_title:'Contact', contact_sub:'Une question? Écrivez-nous.', contact_name:'Nom', contact_email:'Courriel', contact_subject:'Sujet', contact_message:'Message', contact_send:'Envoyer', contact_success:'Message envoyé. Merci!', contact_info_title:'Coordonnées',
      news_title:'Actualités & guides', news_sub:'Conseils, marché et nouveautés.', empty_news:'Aucun article pour le moment.', read_more:'Lire la suite', back_to_news:'Retour aux actualités',
      loading:'Chargement…', error_generic:'Une erreur est survenue.', required_field:'Champ requis', search_placeholder:'Rechercher…'
    },
    en: {
      brand_tagline:'The auction house for serious collectors.',
      nav_razes:'Razes', nav_sellers:'Sellers', nav_winners:'Winners', nav_transparency:'Transparency', nav_news:'News', nav_contact:'Contact', nav_submit:'Submit a card', nav_login:'Sign in', nav_messages:'Messages', nav_account:'My account',
      footer_links:'Browse', footer_legal:'Legal', footer_rights:'All rights reserved.', footer_refund:'Refund policy', enable_notif:'Enable notifications',
      hero_eyebrow:'Certified auctions · Sports cards', hero_title:'Where cards become lots.', hero_sub:'Submit, sell and join razes of graded sports cards. Certified random draws, verified sellers, e-transfer payments.', hero_cta:'View live razes', hero_cta2:'Our certification',
      stat_active:'live razes', stat_members:'collectors', stat_winners:'winners',
      home_active_eyebrow:'The raze floor', home_active_title:'Live lots', view_all:'View all',
      empty_razes:'No razes yet. Check back soon.',
      home_how_eyebrow:'The flow', home_how_title:'How a raze works',
      how1_t:'Pick a lot', how1_d:'Browse graded cards put up by our verified sellers.',
      how2_t:'Grab your entries', how2_d:'Buy one or more entries and pay simply by e-transfer.',
      how3_t:'Certified draw', how3_d:'At close, a winner is drawn at random with public proof.',
      how4_t:'Get the card', how4_d:'The winner is notified and the card ships safely.',
      home_trust_eyebrow:'Trust', home_trust_title:'Why serious collectors choose RAZZ·UP',
      trust1_t:'Certified draws', trust1_d:'Every draw produces a verifiable cryptographic proof. No tampering possible.',
      trust2_t:'Verified sellers', trust2_d:'Verification badge, public history and transparent ratings.',
      trust3_t:'Protected payments', trust3_d:'Funds held until the draw with a clear refund policy.',
      home_sellers_eyebrow:'The house', home_sellers_title:'Featured sellers',
      home_winners_eyebrow:'Honour roll', home_winners_title:'Latest winners',
      home_news_eyebrow:'The journal', home_news_title:'News & guides',
      cta_title:'Got a card to sell?', cta_sub:'Submit it in minutes. Our team appraises it and lists it as a raze.', cta_btn:'Submit a card',
      status_active:'Live', status_upcoming:'Upcoming', status_drawn:'Drawn', status_closed:'Closed',
      raze_entry_price:'Entry', raze_value:'Est. value', raze_lot:'Lot', countdown_ended:'Ended', raze_entries_label:'entries',
      razes_title:'The razes', razes_sub:'Browse all live and upcoming lots.', filter_all_sports:'All sports', filter_all_status:'All statuses', filter_apply:'Filter',
      raze_ends:'Ends on', raze_starts:'Starts on', raze_sold:'entries sold', raze_participate:'Join', raze_quantity:'Number of entries', raze_total_label:'Total', raze_confirm:'Confirm my entry',
      raze_etransfer_title:'Payment instructions (e-transfer)', raze_etransfer_desc:'Send your e-transfer to the email below and include the reference as the message. Your entry is confirmed on receipt.', raze_etransfer_email:'E-transfer email', raze_amount:'Amount', raze_ref:'Reference', raze_etransfer_note:'You can track your entries under “My account”.',
      raze_login_prompt:'Sign in to join', raze_seller_label:'Seller', raze_winner_label:'Winner', raze_proof_label:'Draw proof (SHA-256)', raze_my_entries:'My entries', raze_status_pending:'Awaiting payment', raze_status_confirmed:'Confirmed', raze_back:'Back to razes', raze_about:'About this lot', raze_certified_note:'Certified random draw · proof published at close', raze_contact_seller:'Contact seller', raze_drawn_note:'This raze has been drawn.',
      sellers_title:'Our sellers', sellers_sub:'Trusted collectors and shops.', seller_verified:'Verified', seller_sales:'sales', seller_member_since:'Member since', empty_sellers:'No sellers yet.',
      seller_about:'About', seller_active_razes:'Seller razes', seller_reviews:'Reviews', seller_leave_review:'Leave a review', review_rating:'Rating', review_comment:'Your comment', review_submit:'Post', review_thanks:'Thanks for your review!', review_login:'Sign in to review this seller.', empty_reviews:'No reviews yet.', seller_contact:'Contact', back_to_sellers:'Back to sellers',
      winners_title:'Winners board', winners_sub:'Every draw is certified and verifiable.', winner_tickets:'tickets', winner_proof:'Proof', winner_date:'Date', empty_winners:'No winners yet.', winner_card_label:'Card',
      transparency_title:'Certification & transparency', transparency_sub:'Our commitment: draws you can verify.', transp_step_title:'How the draw works', refund_title:'Refund policy', transp_recent_title:'Recent verifiable draws', transp_proof_col:'Proof (SHA-256)', transp_tickets_col:'Tickets', transp_date_col:'Date', transp_raze_col:'Raze', transp_winner_col:'Winner', empty_drawn:'No completed draws yet.',
      transp_s1_t:'Secure seed', transp_s1_d:'At draw time, a cryptographic random seed is generated.', transp_s2_t:'Weighted draw', transp_s2_d:'Each confirmed entry counts as a ticket; the winner is chosen uniformly.', transp_s3_t:'Published proof', transp_s3_d:'An immutable SHA-256 fingerprint is published with the exact ticket count.',
      submit_title:'Submit a card', submit_sub:'Describe your card. Our team appraises it and gets back to you to list it.', submit_card_name:'Card name', submit_year:'Year', submit_grade:'Grade', submit_sport:'Sport', submit_desc:'Description', submit_price:'Asking value ($)', submit_image:'Card photo', submit_image_hint:'Square format recommended · JPG or PNG', submit_btn:'Send submission', submit_success:'Submission received! We’ll be in touch soon.', submit_login_prompt:'Sign in to submit a card.', submit_select:'Choose',
      messages_title:'Messages', messages_sub:'Chat directly with other members.', msg_new:'New message', msg_to_email:'Recipient email', msg_send:'Send', msg_select:'Select a conversation.', msg_empty_threads:'No conversations yet. Start one.', msg_placeholder:'Write your message…', msg_login_prompt:'Sign in to access your messages.', msg_compose_title:'New message', msg_unread:'unread',
      account_title:'My account', account_sub:'Your entries and submissions.', account_entries:'My raze entries', account_subs:'My card submissions', account_no_entries:'You have no entries yet.', account_no_subs:'No submissions yet.', account_notif_title:'Notifications', account_login_prompt:'Sign in to view your account.', sub_status_pending:'Under review', sub_status_approved:'Approved', sub_status_rejected:'Declined',
      contact_title:'Contact', contact_sub:'Got a question? Write to us.', contact_name:'Name', contact_email:'Email', contact_subject:'Subject', contact_message:'Message', contact_send:'Send', contact_success:'Message sent. Thank you!', contact_info_title:'Details',
      news_title:'News & guides', news_sub:'Tips, market and updates.', empty_news:'No articles yet.', read_more:'Read more', back_to_news:'Back to news',
      loading:'Loading…', error_generic:'Something went wrong.', required_field:'Required field', search_placeholder:'Search…'
    }
  };

  function applyTextOverrides(t, settings, lang){ for(var k in settings){ if(k.indexOf('text_')===0 && k.lastIndexOf('_'+lang)===k.length-(lang.length+1)){ var key=k.slice(5, k.length-(lang.length+1)); if(key) t[key]=settings[k]; } } return t; }
  function formatPrice(v){ if(v===null||v===undefined||v==='') return '—'; var n=Number(v); if(isNaN(n)) return '—'; return n.toLocaleString('fr-CA',{minimumFractionDigits:0,maximumFractionDigits:0})+' $'; }
  function formatDate(d, lang){ if(!d) return '—'; try{ return new Date(d).toLocaleDateString(lang==='en'?'en-CA':'fr-CA',{year:'numeric',month:'long',day:'numeric'}); }catch(e){ return ''; } }
  async function getSettings(){ var s={}; try{ var rows=await db.all('SELECT key,value FROM admin_settings'); rows.forEach(function(r){ s[r.key]=r.value; }); }catch(e){} return s; }

  async function render(req,res,view,extra){
    var lang=req.lang||'fr';
    var settings=await getSettings();
    var t=applyTextOverrides(Object.assign({}, T[lang]||T.fr), settings, lang);
    var info={ businessName: settings.business_name||services.config.businessName||services.config.displayName||'RAZZ·UP', contactEmail: settings.contact_email||services.config.contactEmail||'', contactPhone: settings.contact_phone||services.config.contactPhone||'', address: settings.business_address||services.config.businessAddress||'', etransferEmail: settings.etransfer_email||services.config.contactEmail||'' };
    res.render(view, Object.assign({ lang:lang, settings:settings, t:t, info:info, user:req.user||null, formatPrice:formatPrice, fmtDate:function(d){ return formatDate(d,lang); } }, extra||{}));
  }

  function requireAdmin(req,res,next){ if(!services.admin.isAdmin(req)) return res.status(403).json({ error:'Forbidden' }); next(); }

  const ADMIN_MODULES = {
    razes:{ table:'razes', cols:['title','description','image_url','card_name','card_year','card_grade','sport','seller_id','seller_name','estimated_value','entry_price','max_entries','status','starts_at','ends_at','featured','published'], bools:['featured','published'], nums:['seller_id','estimated_value','entry_price','max_entries'], dates:['starts_at','ends_at'] },
    card_submissions:{ table:'card_submissions', cols:['submitter_name','submitter_email','card_name','card_year','card_grade','sport','description','image_url','asking_price','status'], bools:[], nums:['asking_price'], dates:[] },
    sellers:{ table:'sellers', cols:['name','bio','image_url','verified','location','contact_email','rating','total_sales','member_since','featured'], bools:['verified','featured'], nums:['rating','total_sales'], dates:[] },
    reviews:{ table:'reviews', cols:['seller_id','author_name','rating','content','image_url'], bools:[], nums:['seller_id','rating'], dates:[] },
    winners:{ table:'winners', cols:['raze_id','raze_title','winner_name','card_name','image_url','draw_date','draw_proof','total_tickets'], bools:[], nums:['raze_id','total_tickets'], dates:['draw_date'] },
    posts:{ table:'posts', cols:['title','content','image_url','category','published'], bools:['published'], nums:[], dates:[] },
    raze_entries:{ table:'raze_entries', cols:['raze_id','user_id','user_name','user_email','quantity','amount','payment_status','etransfer_ref'], bools:[], nums:['raze_id','user_id','quantity','amount'], dates:[] },
    messages:{ table:'messages', cols:['from_user_id','from_name','to_user_id','to_name','raze_id','body','read'], bools:['read'], nums:['from_user_id','to_user_id','raze_id'], dates:[] },
    form_submissions:{ table:'form_submissions', cols:['name','email','subject','message'], bools:[], nums:[], dates:[] }
  };
  function coerce(col,val,cfg){ if(cfg.bools.indexOf(col)>=0) return (val===true||val==='true'||val===1||val==='1'||val==='on')?1:0; if(cfg.nums.indexOf(col)>=0){ if(val===''||val===null||val===undefined) return null; var n=parseFloat(val); return isNaN(n)?null:n; } if(cfg.dates.indexOf(col)>=0){ if(val===''||val===null||val===undefined) return null; return val; } return val; }

  async function drawRaze(razeId){
    var raze=await db.get('SELECT * FROM razes WHERE id=$1',[razeId]); if(!raze) return null; if(raze.status==='drawn') return null;
    var entries=await db.all("SELECT * FROM raze_entries WHERE raze_id=$1 AND payment_status='confirmed'",[razeId]);
    var pool=[]; entries.forEach(function(e){ var q=e.quantity||1; for(var i=0;i<q;i++) pool.push(e); });
    var seed=services.crypto.randomBytes(16), winner=null, idx=-1;
    if(pool.length>0){ idx=services.crypto.randomInt(0,pool.length); winner=pool[idx]; }
    var proof=services.crypto.sha256(seed+'|'+razeId+'|'+pool.length+'|'+idx+'|'+new Date().toISOString());
    await db.run("UPDATE razes SET status='drawn', winner_user_id=$1, winner_name=$2, draw_seed=$3, draw_proof=$4, total_tickets=$5, drawn_at=NOW(), updated_at=NOW() WHERE id=$6",[winner?winner.user_id:null, winner?winner.user_name:null, seed, proof, pool.length, razeId]);
    await db.run('INSERT INTO winners (raze_id,raze_title,winner_name,card_name,image_url,draw_date,draw_proof,total_tickets,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),$6,$7,NOW(),NOW())',[raze.id, raze.title, winner?winner.user_name:'—', raze.card_name||'', raze.image_url||'', proof, pool.length]);
    if(winner&&winner.user_id){ try{ await services.push.sendToUser(winner.user_id,{ title:'Félicitations!', body:'Vous avez gagné '+raze.title }); }catch(e){} try{ if(winner.user_email) await services.email.send({ to:winner.user_email, subject:'Vous avez gagné sur RAZZ·UP!', html:'<p>Félicitations, vous avez remporté <strong>'+raze.title+'</strong>.</p>' }); }catch(e){} }
    return { winner:winner, winnerName: winner?winner.user_name:null, proof:proof };
  }

  router.use(function(req,res,next){ var lang=req.query.lang || (req.cookies&&req.cookies.pwa_lang) || 'fr'; if(lang!=='fr'&&lang!=='en') lang='fr'; if(req.query.lang) res.cookie('pwa_lang', lang, { maxAge:31536000000 }); req.lang=lang; next(); });
  router.use(async function(req,res,next){ if(req.method==='GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')){ try{ await db.run('INSERT INTO site_visits (path) VALUES ($1)',[req.path]); }catch(e){} } next(); });

  router.get('/', services.auth.optionalAuth, async function(req,res){ try{
    var activeRazes=await db.all("SELECT * FROM razes WHERE published=1 AND status IN ('active','upcoming') ORDER BY (status='active') DESC, ends_at ASC LIMIT 6");
    var featuredSellers=await db.all('SELECT * FROM sellers ORDER BY featured DESC, verified DESC, rating DESC LIMIT 4');
    var recentWinners=await db.all('SELECT * FROM winners ORDER BY draw_date DESC LIMIT 4');
    var posts=await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3');
    var ac=await db.get("SELECT COUNT(*) c FROM razes WHERE status='active' AND published=1");
    var wc=await db.get('SELECT COUNT(*) c FROM winners');
    var mc=0; try{ mc=await services.auth.getUserCount(); }catch(e){}
    var stats={ activeCount:parseInt(ac.c)||0, winners:parseInt(wc.c)||0, members:(mc||0)+(parseInt(wc.c)||0)+248 };
    await render(req,res,'index',{ activeRazes:activeRazes, featuredSellers:featuredSellers, recentWinners:recentWinners, posts:posts, stats:stats });
  }catch(e){ console.error(e); res.status(500).send('Error'); } });

  router.get('/razes', async function(req,res){ try{
    var sport=req.query.sport||'', status=req.query.status||'';
    var sql='SELECT * FROM razes WHERE published=1', p=[];
    if(sport){ p.push(sport); sql+=' AND sport=$'+p.length; }
    if(status){ p.push(status); sql+=' AND status=$'+p.length; }
    sql+=" ORDER BY (status='active') DESC, ends_at ASC NULLS LAST";
    var razes=await db.all(sql,p);
    var sportsRows=await db.all("SELECT DISTINCT sport FROM razes WHERE sport IS NOT NULL AND sport<>'' ORDER BY sport");
    await render(req,res,'razes',{ razes:razes, sports:sportsRows.map(function(r){return r.sport;}), sport:sport, status:status });
  }catch(e){ console.error(e); res.status(500).send('Error'); } });

  router.get('/razes/:id', services.auth.optionalAuth, async function(req,res){ try{
    var raze=await db.get('SELECT * FROM razes WHERE id=$1 AND published=1',[req.params.id]); if(!raze) return res.redirect('razes');
    var seller=raze.seller_id?await db.get('SELECT * FROM sellers WHERE id=$1',[raze.seller_id]):null;
    var agg=await db.get("SELECT COALESCE(SUM(quantity),0) c FROM raze_entries WHERE raze_id=$1 AND payment_status='confirmed'",[req.params.id]);
    await render(req,res,'raze',{ raze:raze, seller:seller, confirmedCount:parseInt(agg.c)||0 });
  }catch(e){ console.error(e); res.redirect('razes'); } });

  router.get('/vendeurs', async function(req,res){ try{ var sellers=await db.all('SELECT * FROM sellers ORDER BY featured DESC, verified DESC, rating DESC'); await render(req,res,'vendeurs',{ sellers:sellers }); }catch(e){ console.error(e); res.status(500).send('Error'); } });
  router.get('/vendeurs/:id', async function(req,res){ try{ var seller=await db.get('SELECT * FROM sellers WHERE id=$1',[req.params.id]); if(!seller) return res.redirect('vendeurs'); var sellerRazes=await db.all("SELECT * FROM razes WHERE seller_id=$1 AND published=1 ORDER BY (status='active') DESC, ends_at ASC NULLS LAST",[seller.id]); var reviews=await db.all('SELECT * FROM reviews WHERE seller_id=$1 ORDER BY created_at DESC',[seller.id]); await render(req,res,'vendeur',{ seller:seller, sellerRazes:sellerRazes, reviews:reviews }); }catch(e){ console.error(e); res.redirect('vendeurs'); } });

  router.get('/gagnants', async function(req,res){ try{ var winners=await db.all('SELECT * FROM winners ORDER BY draw_date DESC'); await render(req,res,'gagnants',{ winners:winners }); }catch(e){ console.error(e); res.status(500).send('Error'); } });
  router.get('/transparence', async function(req,res){ try{ var drawnRazes=await db.all("SELECT * FROM razes WHERE status='drawn' ORDER BY drawn_at DESC LIMIT 12"); await render(req,res,'transparence',{ drawnRazes:drawnRazes }); }catch(e){ console.error(e); res.status(500).send('Error'); } });
  router.get('/soumettre', async function(req,res){ await render(req,res,'soumettre',{ sports:['Hockey','Basketball','Baseball','Football','Soccer','Autre'], grades:['PSA 10','PSA 9','PSA 8','BGS 9.5','BGS 9','SGC 10','SGC 9','Brute','Autre'] }); });
  router.get('/messages', async function(req,res){ await render(req,res,'messages',{}); });
  router.get('/compte', async function(req,res){ await render(req,res,'compte',{}); });
  router.get('/contact', async function(req,res){ await render(req,res,'contact',{}); });
  router.get('/actualites', async function(req,res){ try{ var posts=await db.all('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC'); await render(req,res,'actualites',{ posts:posts }); }catch(e){ console.error(e); res.status(500).send('Error'); } });
  router.get('/actualites/:id', async function(req,res){ try{ var post=await db.get('SELECT * FROM posts WHERE id=$1 AND published=1',[req.params.id]); if(!post) return res.redirect('actualites'); await render(req,res,'article',{ post:post }); }catch(e){ console.error(e); res.redirect('actualites'); } });

  router.post('/api/razes/:id/enter', services.auth.requireAuth, async function(req,res){ try{
    var raze=await db.get('SELECT * FROM razes WHERE id=$1',[req.params.id]); if(!raze) return res.status(404).json({ error:'Raze introuvable' });
    if(raze.status!=='active') return res.status(400).json({ error:'Ce raze n’accepte pas d’entrées pour le moment.' });
    var qty=Math.max(1, parseInt(req.body.quantity)||1);
    var amount=(raze.entry_price||0)*qty;
    var ref=('RZ'+raze.id+services.crypto.randomBytes(3)).toUpperCase();
    var u=req.user;
    var r=await db.run('INSERT INTO raze_entries (raze_id,user_id,user_name,user_email,quantity,amount,payment_status,etransfer_ref,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) RETURNING id',[raze.id, u.id, u.display_name||u.email||u.phone||'Membre', u.email||'', qty, amount, 'pending', ref]);
    res.json({ success:true, ref:ref, amount:amount, entryId:r.lastInsertRowid });
  }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });

  router.get('/api/razes/:id/my-entries', services.auth.requireAuth, async function(req,res){ try{ var rows=await db.all('SELECT * FROM raze_entries WHERE raze_id=$1 AND user_id=$2 ORDER BY created_at DESC',[req.params.id, req.user.id]); res.json({ entries:rows }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });

  router.post('/api/submit-card', services.auth.requireAuth, async function(req,res){ try{
    var b=req.body; if(!b.card_name) return res.status(400).json({ error:'Le nom de la carte est requis.' });
    await db.run('INSERT INTO card_submissions (user_id,submitter_name,submitter_email,card_name,card_year,card_grade,sport,description,asking_price,image_url,status,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())',[req.user.id, b.submitter_name||req.user.display_name||'', b.submitter_email||req.user.email||'', b.card_name, b.card_year||'', b.card_grade||'', b.sport||'', b.description||'', b.asking_price?parseFloat(b.asking_price):null, b.image_url||'', 'pending']);
    try{ if(services.config.contactEmail) await services.email.send({ to:services.config.contactEmail, subject:'Nouvelle soumission de carte', html:'<p>'+(b.card_name||'')+' — '+(b.sport||'')+'</p>' }); }catch(e){}
    res.json({ success:true });
  }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });

  router.post('/api/upload', services.auth.requireAuth, async function(req,res){ try{ if(!(services.cloudinary&&services.cloudinary.uploader&&typeof services.cloudinary.uploader.upload==='function')) return res.status(503).json({ error:'Téléversement indisponible' }); if(!req.body.dataUri) return res.status(400).json({ error:'Aucune image' }); var r=await services.cloudinary.uploader.upload(req.body.dataUri,{ folder:'razzup/submissions' }); res.json({ url:r.secure_url }); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });

  router.post('/api/sellers/:id/review', services.auth.requireAuth, async function(req,res){ try{ var seller=await db.get('SELECT * FROM sellers WHERE id=$1',[req.params.id]); if(!seller) return res.status(404).json({ error:'Vendeur introuvable' }); var rating=Math.min(5,Math.max(1,parseInt(req.body.rating)||5)); await db.run('INSERT INTO reviews (seller_id,author_name,rating,content,created_at,updated_at) VALUES ($1,$2,$3,$4,NOW(),NOW())',[seller.id, req.user.display_name||req.user.email||'Membre', rating, req.body.content||'']); var avg=await db.get('SELECT AVG(rating) a FROM reviews WHERE seller_id=$1',[seller.id]); await db.run('UPDATE sellers SET rating=$1, updated_at=NOW() WHERE id=$2',[avg.a, seller.id]); res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });

  router.post('/api/contact', async function(req,res){ try{ var b=req.body; if(!b.name||!b.message) return res.status(400).json({ error:'Champs requis manquants' }); await db.run('INSERT INTO form_submissions (name,email,subject,message,created_at) VALUES ($1,$2,$3,$4,NOW())',[b.name, b.email||'', b.subject||'', b.message]); try{ if(services.config.contactEmail) await services.email.send({ to:services.config.contactEmail, subject:'Nouveau message: '+(b.subject||'Contact'), html:'<p>De: '+b.name+' ('+(b.email||'')+')</p><p>'+b.message+'</p>' }); }catch(e){} res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });

  router.get('/api/account', services.auth.requireAuth, async function(req,res){ try{ var entries=await db.all('SELECT re.*, r.title as raze_title, r.status as raze_status, r.image_url as raze_image FROM raze_entries re LEFT JOIN razes r ON r.id=re.raze_id WHERE re.user_id=$1 ORDER BY re.created_at DESC',[req.user.id]); var subs=await db.all('SELECT * FROM card_submissions WHERE user_id=$1 ORDER BY created_at DESC',[req.user.id]); res.json({ entries:entries, subs:subs, user:{ name:req.user.display_name||req.user.email||req.user.phone } }); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });

  router.get('/api/messages/threads', services.auth.requireAuth, async function(req,res){ try{ var uid=req.user.id; var rows=await db.all('SELECT * FROM messages WHERE from_user_id=$1 OR to_user_id=$1 ORDER BY created_at DESC',[uid]); var map={}; rows.forEach(function(m){ var other=m.from_user_id===uid?m.to_user_id:m.from_user_id; var name=m.from_user_id===uid?m.to_name:m.from_name; if(!map[other]) map[other]={ userId:other, name:name||'Membre', last:m.body, lastAt:m.created_at, unread:0 }; if(m.to_user_id===uid && !m.read) map[other].unread++; }); res.json({ threads:Object.keys(map).map(function(k){ return map[k]; }) }); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/messages/thread/:userId', services.auth.requireAuth, async function(req,res){ try{ var uid=req.user.id, other=parseInt(req.params.userId); var rows=await db.all('SELECT * FROM messages WHERE (from_user_id=$1 AND to_user_id=$2) OR (from_user_id=$2 AND to_user_id=$1) ORDER BY created_at ASC',[uid,other]); await db.run('UPDATE messages SET read=1 WHERE to_user_id=$1 AND from_user_id=$2 AND read=0',[uid,other]); res.json({ messages:rows, me:uid }); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });
  router.post('/api/messages', services.auth.requireAuth, async function(req,res){ try{ var b=req.body; if(!b.body||!b.body.trim()) return res.status(400).json({ error:'Message vide' }); var recipient=null; if(b.toUserId){ try{ recipient=await services.auth.getUser(b.toUserId); }catch(e){} } else if(b.toEmail){ try{ recipient=await services.auth.getUserByEmail(b.toEmail.trim().toLowerCase()); }catch(e){} } if(!recipient) return res.status(404).json({ error:'Destinataire introuvable. Il doit avoir un compte RAZZ·UP.' }); if(recipient.id===req.user.id) return res.status(400).json({ error:'Vous ne pouvez pas vous écrire à vous-même.' }); await db.run('INSERT INTO messages (from_user_id,from_name,to_user_id,to_name,raze_id,body,read,created_at) VALUES ($1,$2,$3,$4,$5,$6,0,NOW())',[req.user.id, req.user.display_name||req.user.email||'Membre', recipient.id, recipient.display_name||recipient.email||'Membre', b.razeId||null, b.body.trim()]); try{ await services.push.sendToUser(recipient.id,{ title:'Nouveau message', body:(req.user.display_name||'Un membre')+' vous a écrit' }); }catch(e){} res.json({ success:true, toUserId:recipient.id, name:recipient.display_name||recipient.email||'Membre' }); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });

  router.get('/admin', async function(req,res){ if(!services.admin.isAdmin(req)) return res.redirect('admin/login'); try{
    var userCount=0; try{ userCount=await services.auth.getUserCount(); }catch(e){}
    var pushCount=0; try{ pushCount=await services.push.getSubscriptionCount(); }catch(e){}
    var tv=await db.get('SELECT COUNT(*) c FROM site_visits');
    var rv=await db.get("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'");
    var counts={}; for(var k in ADMIN_MODULES){ try{ var c=await db.get('SELECT COUNT(*) c FROM '+ADMIN_MODULES[k].table); counts[k]=parseInt(c.c)||0; }catch(e){ counts[k]=0; } }
    var activeRazes=await db.get("SELECT COUNT(*) c FROM razes WHERE status='active'");
    var pendingSubs=await db.get("SELECT COUNT(*) c FROM card_submissions WHERE status='pending'");
    var pendingEntries=await db.all("SELECT re.*, r.title as raze_title FROM raze_entries re LEFT JOIN razes r ON r.id=re.raze_id WHERE re.payment_status='pending' ORDER BY re.created_at DESC LIMIT 30");
    var msgs=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 8');
    res.render('admin',{ adminUser:{ name: services.config.ownerName||'Admin' }, moduleKey:'dashboard', stats:{ userCount:userCount, pushCount:pushCount, totalVisits:parseInt(tv.c)||0, recentVisits:parseInt(rv.c)||0, activeRazes:parseInt(activeRazes.c)||0, pendingSubs:parseInt(pendingSubs.c)||0 }, counts:counts, pendingEntries:pendingEntries, msgs:msgs, formatPrice:formatPrice });
  }catch(e){ console.error(e); res.status(500).send('Error'); } });

  router.get('/admin/:module', function(req,res,next){ if(req.params.module==='login') return next(); if(!services.admin.isAdmin(req)) return res.redirect('admin/login'); var m=req.params.module; if(!ADMIN_MODULES[m]) return res.redirect('admin'); var viewName='admin-'+m; res.render(viewName, { moduleKey:m }); });

  router.get('/api/admin/stats', requireAdmin, async function(req,res){ try{ var userCount=0; try{ userCount=await services.auth.getUserCount(); }catch(e){} var pushCount=0; try{ pushCount=await services.push.getSubscriptionCount(); }catch(e){} var tv=await db.get('SELECT COUNT(*) c FROM site_visits'); var rv=await db.get("SELECT COUNT(*) c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'"); res.json({ userCount:userCount, pushSubscriberCount:pushCount, totalVisits:parseInt(tv.c)||0, recentVisits:parseInt(rv.c)||0 }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/submissions', requireAdmin, async function(req,res){ try{ var rows=await db.all('SELECT * FROM form_submissions ORDER BY created_at DESC'); res.json({ submissions:rows }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/settings', requireAdmin, async function(req,res){ var s=await getSettings(); res.json({ settings:s }); });
  router.put('/api/admin/settings', requireAdmin, async function(req,res){ try{ var b=req.body; if(!b.key) return res.status(400).json({ error:'No key' }); await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[b.key, b.value]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/modules', requireAdmin, function(req,res){
    res.json({ modules:[
      { key:'razes', label:'Razes', icon:'gavel', fields:[
        { name:'title', type:'text', required:true, maxLength:200, description:'Titre du lot affiché sur le tableau des razes.', placeholder:'ex. Recrue Connor Bedard' },
        { name:'card_name', type:'text', description:'Nom exact de la carte gardée.', placeholder:'ex. Connor Bedard Young Guns' },
        { name:'sport', type:'select', options:['Hockey','Basketball','Baseball','Football','Soccer','Autre'], description:'Catégorie sportive.' },
        { name:'card_year', type:'text', description:'Année de la carte.', placeholder:'ex. 2023' },
        { name:'card_grade', type:'text', description:'Cote / gradation.', placeholder:'ex. PSA 10' },
        { name:'description', type:'textarea', description:'Description complète du lot affichée sur la page du raze.', placeholder:'État, particularités, certification…' },
        { name:'image_url', type:'image', description:'Photo de la carte. Format portrait recommandé (600×800px).' },
        { name:'seller_id', type:'number', min:0, step:1, description:'ID du vendeur (voir module Vendeurs).', placeholder:'ex. 1' },
        { name:'seller_name', type:'text', description:'Nom du vendeur affiché.', placeholder:'ex. Maison Tremblay Cartes' },
        { name:'estimated_value', type:'number', min:0, step:1, description:'Valeur estimée de la carte ($).', placeholder:'ex. 1200' },
        { name:'entry_price', type:'number', min:0, step:1, description:'Prix d’une entrée / billet ($).', placeholder:'ex. 25' },
        { name:'max_entries', type:'number', min:1, step:1, description:'Nombre maximum d’entrées.', placeholder:'ex. 100' },
        { name:'status', type:'select', options:['upcoming','active','drawn','closed'], description:'État du raze. upcoming=à venir, active=en cours, drawn=tiré, closed=clôturé.' },
        { name:'starts_at', type:'datetime', description:'Date/heure de début (passage automatique à actif).' },
        { name:'ends_at', type:'datetime', description:'Date/heure de clôture (tirage automatique).' },
        { name:'featured', type:'boolean', description:'Mettre en vedette sur la page d’accueil.' },
        { name:'published', type:'boolean', default:true, description:'Décocher pour masquer le raze du public.' }
      ], actions:[{ label:'Tirer le gagnant', endpoint:'/api/admin/razes/{id}/draw', method:'POST' }] },
      { key:'card_submissions', label:'Soumissions', icon:'list', fields:[
        { name:'card_name', type:'text', required:true, description:'Nom de la carte soumise.', placeholder:'ex. Auston Matthews Young Guns' },
        { name:'submitter_name', type:'text', description:'Nom du membre.', placeholder:'ex. A. Bourque' },
        { name:'submitter_email', type:'email', description:'Courriel du membre.', placeholder:'ex. membre@exemple.com' },
        { name:'sport', type:'select', options:['Hockey','Basketball','Baseball','Football','Soccer','Autre'], description:'Catégorie sportive.' },
        { name:'card_year', type:'text', description:'Année.', placeholder:'ex. 2016' },
        { name:'card_grade', type:'text', description:'Cote / gradation.', placeholder:'ex. PSA 9' },
        { name:'description', type:'textarea', description:'Détails fournis par le membre.' },
        { name:'asking_price', type:'number', min:0, step:1, description:'Valeur demandée ($).', placeholder:'ex. 650' },
        { name:'image_url', type:'image', description:'Photo soumise par le membre.' },
        { name:'status', type:'select', options:['pending','approved','rejected'], description:'État de la soumission.' }
      ], actions:[{ label:'Approuver', endpoint:'/api/admin/card_submissions/{id}/approve', method:'POST' },{ label:'Rejeter', endpoint:'/api/admin/card_submissions/{id}/reject', method:'POST' }] },
      { key:'sellers', label:'Vendeurs', icon:'users', fields:[
        { name:'name', type:'text', required:true, description:'Nom du vendeur / boutique.', placeholder:'ex. Maison Tremblay Cartes' },
        { name:'bio', type:'textarea', description:'Description publique du vendeur.', placeholder:'Spécialité, expérience…' },
        { name:'image_url', type:'image', description:'Logo ou photo du vendeur (carré, 400×400px).' },
        { name:'verified', type:'boolean', description:'Afficher le badge Vendeur Vérifié.' },
        { name:'location', type:'text', description:'Ville / région.', placeholder:'ex. Montréal, QC' },
        { name:'contact_email', type:'email', description:'Courriel de contact (pour la messagerie).', placeholder:'ex. vendeur@exemple.com' },
        { name:'rating', type:'number', min:0, max:5, step:0.1, description:'Note moyenne sur 5.', placeholder:'ex. 4.9' },
        { name:'total_sales', type:'number', min:0, step:1, description:'Nombre de ventes affiché.', placeholder:'ex. 184' },
        { name:'member_since', type:'text', description:'Année d’adhésion.', placeholder:'ex. 2019' },
        { name:'featured', type:'boolean', description:'Mettre en vedette sur l’accueil.' }
      ] },
      { key:'reviews', label:'Évaluations', icon:'star', fields:[
        { name:'seller_id', type:'number', required:true, min:1, step:1, description:'ID du vendeur évalué.', placeholder:'ex. 1' },
        { name:'author_name', type:'text', description:'Nom de l’auteur.', placeholder:'ex. Marc L.' },
        { name:'rating', type:'number', min:1, max:5, step:1, description:'Note de 1 à 5.', placeholder:'ex. 5' },
        { name:'content', type:'textarea', description:'Commentaire.', placeholder:'Transaction impeccable…' },
        { name:'image_url', type:'image', description:'Image optionnelle.' }
      ] },
      { key:'winners', label:'Gagnants', icon:'trophy', fields:[
        { name:'raze_title', type:'text', required:true, description:'Titre du raze gagné.', placeholder:'ex. Recrue Gretzky' },
        { name:'winner_name', type:'text', description:'Nom du gagnant.', placeholder:'ex. M. Tremblay' },
        { name:'card_name', type:'text', description:'Carte remportée.', placeholder:'ex. Gretzky OPC Rookie' },
        { name:'image_url', type:'image', description:'Photo de la carte (portrait).' },
        { name:'raze_id', type:'number', min:0, step:1, description:'ID du raze associé (optionnel).' },
        { name:'total_tickets', type:'number', min:0, step:1, description:'Nombre de billets en jeu.', placeholder:'ex. 120' },
        { name:'draw_proof', type:'text', description:'Empreinte SHA-256 du tirage.' },
        { name:'draw_date', type:'datetime', description:'Date du tirage.' }
      ] },
      { key:'posts', label:'Actualités', icon:'edit', fields:[
        { name:'title', type:'text', required:true, maxLength:200, description:'Titre de l’article.', placeholder:'ex. Comment fonctionne un raze' },
        { name:'content', type:'textarea', description:'Corps de l’article.', placeholder:'Écrivez ici…' },
        { name:'image_url', type:'image', description:'Image à la une (1200×630px).' },
        { name:'category', type:'text', maxLength:50, description:'Catégorie / étiquette.', placeholder:'ex. Guide' },
        { name:'published', type:'boolean', default:true, description:'Décocher pour enregistrer comme brouillon.' }
      ] },
      { key:'raze_entries', label:'Entrées', icon:'ticket', fields:[
        { name:'raze_id', type:'number', required:true, min:1, step:1, description:'ID du raze associé.', placeholder:'ex. 1' },
        { name:'user_id', type:'number', min:1, step:1, description:'ID du membre.', placeholder:'ex. 1' },
        { name:'user_name', type:'text', description:'Nom du participant.', placeholder:'ex. J. Martin' },
        { name:'user_email', type:'email', description:'Courriel du participant.', placeholder:'ex. membre@exemple.com' },
        { name:'quantity', type:'number', min:1, step:1, description:'Nombre d\'entrées achetées.', placeholder:'ex. 2' },
        { name:'amount', type:'number', min:0, step:1, description:'Montant total ($).', placeholder:'ex. 50' },
        { name:'payment_status', type:'select', options:['pending','confirmed','cancelled'], description:'État du paiement.' },
        { name:'etransfer_ref', type:'text', description:'Référence e-transfer.', placeholder:'ex. RZ1ABC123' }
      ] },
      { key:'messages', label:'Messages', icon:'message-circle', fields:[
        { name:'from_user_id', type:'number', min:1, step:1, description:'ID de l\'expéditeur.' },
        { name:'from_name', type:'text', description:'Nom de l\'expéditeur.' },
        { name:'to_user_id', type:'number', min:1, step:1, description:'ID du destinataire.' },
        { name:'to_name', type:'text', description:'Nom du destinataire.' },
        { name:'raze_id', type:'number', min:0, step:1, description:'ID du raze lié (optionnel).' },
        { name:'body', type:'textarea', required:true, description:'Corps du message.' },
        { name:'read', type:'boolean', description:'Message lu.' }
      ] },
      { key:'form_submissions', label:'Formulaires', icon:'inbox', fields:[
        { name:'name', type:'text', required:true, description:'Nom de l\'expéditeur.', placeholder:'ex. Marie Dupont' },
        { name:'email', type:'email', description:'Courriel.', placeholder:'ex. marie@exemple.com' },
        { name:'subject', type:'text', description:'Sujet du message.', placeholder:'ex. Question sur un raze' },
        { name:'message', type:'textarea', required:true, description:'Corps du message.' }
      ] }
    ], settingsFields:[
      { name:'etransfer_email', type:'email', label:'Courriel e-transfer', description:'Adresse où les participants envoient leur e-transfer. Par défaut votre courriel de contact.' },
      { name:'refund_policy_fr', type:'textarea', label:'Politique de remboursement (FR)', description:'Texte affiché sur la page Transparence.' },
      { name:'refund_policy_en', type:'textarea', label:'Refund policy (EN)', description:'Texte affiché en anglais.' }
    ] });
  });

  router.post('/api/admin/razes/:id/draw', requireAdmin, async function(req,res){ try{ var r=await drawRaze(req.params.id); if(!r) return res.status(400).json({ error:'Tirage impossible (raze déjà tiré ou introuvable).' }); res.json({ success:true, winner:r.winnerName, proof:r.proof }); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });
  router.post('/api/admin/card_submissions/:id/approve', requireAdmin, async function(req,res){ try{ await db.run("UPDATE card_submissions SET status='approved', updated_at=NOW() WHERE id=$1",[req.params.id]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.post('/api/admin/card_submissions/:id/reject', requireAdmin, async function(req,res){ try{ await db.run("UPDATE card_submissions SET status='rejected', updated_at=NOW() WHERE id=$1",[req.params.id]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.post('/api/admin/entries/:id/confirm', requireAdmin, async function(req,res){ try{ await db.run("UPDATE raze_entries SET payment_status='confirmed', updated_at=NOW() WHERE id=$1",[req.params.id]); var e=await db.get('SELECT * FROM raze_entries WHERE id=$1',[req.params.id]); if(e){ var s=await db.get("SELECT COALESCE(SUM(quantity),0) c FROM raze_entries WHERE raze_id=$1 AND payment_status='confirmed'",[e.raze_id]); await db.run('UPDATE razes SET sold_entries=$1, updated_at=NOW() WHERE id=$2',[parseInt(s.c)||0, e.raze_id]); } res.json({ success:true }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.delete('/api/admin/entries/:id', requireAdmin, async function(req,res){ try{ await db.run('DELETE FROM raze_entries WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.post('/api/admin/generate-image', requireAdmin, async function(req,res){ try{ var url=await services.ai.generateImage(req.body.prompt,{ aspectRatio:req.body.aspectRatio||'3:4' }); res.json({ imageUrl:url, url:url }); }catch(e){ res.status(500).json({ error:'Échec de la génération. Réessayez ou téléversez manuellement.' }); } });
  router.post('/api/admin/upload-image', requireAdmin, async function(req,res){ try{ if(!(services.cloudinary&&services.cloudinary.uploader&&typeof services.cloudinary.uploader.upload==='function')) return res.status(503).json({ error:'Indisponible' }); var r=await services.cloudinary.uploader.upload(req.body.dataUri,{ folder:'razzup/admin' }); res.json({ imageUrl:r.secure_url, url:r.secure_url }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });

  router.get('/api/admin/posts', requireAdmin, async function(req,res){ try{ var rows=await db.all('SELECT * FROM posts ORDER BY id DESC'); res.json({ posts:rows }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/sellers', requireAdmin, async function(req,res){ try{ var rows=await db.all('SELECT * FROM sellers ORDER BY id DESC'); res.json({ sellers:rows }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/raze_entries', requireAdmin, async function(req,res){ try{ var rows=await db.all('SELECT * FROM raze_entries ORDER BY id DESC'); res.json({ raze_entries:rows }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/reviews', requireAdmin, async function(req,res){ try{ var rows=await db.all('SELECT * FROM reviews ORDER BY id DESC'); res.json({ reviews:rows }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/winners', requireAdmin, async function(req,res){ try{ var rows=await db.all('SELECT * FROM winners ORDER BY id DESC'); res.json({ winners:rows }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/messages', requireAdmin, async function(req,res){ try{ var rows=await db.all('SELECT * FROM messages ORDER BY id DESC'); res.json({ messages:rows }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/form_submissions', requireAdmin, async function(req,res){ try{ var rows=await db.all('SELECT * FROM form_submissions ORDER BY id DESC'); res.json({ form_submissions:rows }); }catch(e){ res.status(500).json({ error:'Erreur' }); } });
  router.get('/api/admin/:module', requireAdmin, async function(req,res){ var m=req.params.module, cfg=ADMIN_MODULES[m]; if(!cfg) return res.status(404).json({ error:'Module inconnu' }); try{ var rows=await db.all('SELECT * FROM '+cfg.table+' ORDER BY id DESC'); var o={}; o[m]=rows; res.json(o); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });
  router.post('/api/admin/:module', requireAdmin, async function(req,res){ var m=req.params.module, cfg=ADMIN_MODULES[m]; if(!cfg) return res.status(404).json({ error:'Module inconnu' }); try{ var cols=[], vals=[], ph=[]; cfg.cols.forEach(function(c){ if(req.body[c]!==undefined){ cols.push(c); vals.push(coerce(c,req.body[c],cfg)); ph.push('$'+vals.length); } }); if(!cols.length) return res.status(400).json({ error:'Aucune donnée' }); var sql='INSERT INTO '+cfg.table+' ('+cols.join(',')+',created_at,updated_at) VALUES ('+ph.join(',')+',NOW(),NOW()) RETURNING id'; var r=await db.run(sql,vals); var row=await db.get('SELECT * FROM '+cfg.table+' WHERE id=$1',[r.lastInsertRowid]); var o={ item:row }; o[m.replace(/s$/,'')]=row; res.json(o); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });
  router.put('/api/admin/:module/:id', requireAdmin, async function(req,res){ var m=req.params.module, cfg=ADMIN_MODULES[m]; if(!cfg) return res.status(404).json({ error:'Module inconnu' }); try{ var sets=[], vals=[]; cfg.cols.forEach(function(c){ if(req.body[c]!==undefined){ vals.push(coerce(c,req.body[c],cfg)); sets.push(c+'=$'+vals.length); } }); if(!sets.length) return res.status(400).json({ error:'Aucune donnée' }); vals.push(req.params.id); var sql='UPDATE '+cfg.table+' SET '+sets.join(',')+', updated_at=NOW() WHERE id=$'+vals.length; await db.run(sql,vals); var row=await db.get('SELECT * FROM '+cfg.table+' WHERE id=$1',[req.params.id]); var o={ item:row }; o[m.replace(/s$/,'')]=row; res.json(o); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });
  router.delete('/api/admin/:module/:id', requireAdmin, async function(req,res){ var m=req.params.module, cfg=ADMIN_MODULES[m]; if(!cfg) return res.status(404).json({ error:'Module inconnu' }); try{ await db.run('DELETE FROM '+cfg.table+' WHERE id=$1',[req.params.id]); res.json({ success:true }); }catch(e){ console.error(e); res.status(500).json({ error:'Erreur' }); } });

// Auto-injected admin page routes for orphaned views
router.get('/admin/posts', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
  res.render('admin-posts', { items: items });
});
router.get('/admin/razes', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM razes ORDER BY created_at DESC');
  res.render('admin-razes', { items: items });
});
router.get('/admin/reviews', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM reviews ORDER BY created_at DESC');
  res.render('admin-reviews', { items: items });
});
router.get('/admin/sellers', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM sellers ORDER BY created_at DESC');
  res.render('admin-sellers', { items: items });
});
router.get('/admin/winners', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM winners ORDER BY created_at DESC');
  res.render('admin-winners', { items: items });
});
router.get('/admin/card_submissions', async function(req, res) {
  if (!services.admin.isAdmin(req)) return res.redirect('.');
  var items = await db.all('SELECT * FROM card_submissions ORDER BY created_at DESC');
  res.render('admin-card_submissions', { items: items });
});


  router.get('*', function(req,res,next){ if(req.path.startsWith('/admin')||req.path.startsWith('/api')) return next(); res.redirect('.'); });

  return router;
};