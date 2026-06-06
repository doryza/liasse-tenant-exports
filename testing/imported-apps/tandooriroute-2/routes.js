module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;
  const SLUG = (services.config && services.config.slug) || "tandooriroute-2";

  const T = {
    fr: {
      site_name: "Tandoori Route",
      tagline_short: "Cuisine indienne · Blainville",
      meta_desc: "Tandoori Route — cuisine indienne authentique à Blainville, Québec. Commandez en ligne pour emporter ou sur place.",
      nav_home: "Accueil", nav_gallery: "Galerie", nav_news: "Nouvelles", nav_contact: "Contact", nav_order: "Commander en ligne", login: "Connexion", account: "Mon compte",
      hero_eyebrow: "Cuisine indienne authentique · Blainville, QC",
      hero_title: "La route des saveurs indiennes",
      hero_subtitle: "Des plats généreux, des épices vibrantes et une table chaleureuse au cœur de Blainville.",
      hero_cta: "Commander en ligne", hero_cta_secondary: "Voir la galerie",
      about_eyebrow: "Bienvenue", intro_title: "Tandoori Route",
      intro_text: "Au cœur de Blainville, Tandoori Route vous invite à découvrir la richesse de la cuisine indienne : currys parfumés, grillades dorées, pains moelleux et plats végétariens généreux.",
      intro_text2: "Sur place ou à emporter, nous mettons les saveurs authentiques de l'Inde dans votre assiette, dans une ambiance moderne et chaleureuse.",
      featured_subtitle: "Un aperçu du menu", featured_title: "Nos plats vedettes", view_all_gallery: "Voir toute la galerie",
      order_cta_band_title: "Une faim de saveurs?", order_cta_band_text: "Commandez en ligne en quelques clics — pour emporter ou sur place.",
      reviews_subtitle: "Avis de notre clientèle", reviews_title: "Ce que disent nos clients", read_more_google: "Lire plus d'avis sur Google", reviews_empty: "Les avis seront affichés bientôt.",
      hours_title: "Heures d'ouverture", hours_eyebrow: "Visitez-nous", closed: "Fermé", hours_soon: "Heures à venir.",
      contact_eyebrow: "Nous joindre", contact_title: "Contact", contact_subtitle: "Une question, une réservation, un événement? Écrivez-nous.", info_title: "Coordonnées", address_label: "Adresse", phone_label: "Téléphone", email_label: "Courriel",
      gallery_eyebrow: "Galerie", gallery_title: "Nos plats en images", gallery_intro: "Laissez-vous tenter par un avant-goût de notre cuisine.", gallery_empty: "La galerie sera bientôt disponible.", all: "Tout",
      news_eyebrow: "Actualités", news_title: "Nouvelles & événements", news_empty: "Aucune nouvelle pour le moment. Revenez bientôt!", read_more: "Lire la suite", back_news: "Retour aux nouvelles",
      form_title: "Envoyez-nous un message", form_name: "Nom", form_email: "Courriel", form_phone: "Téléphone", form_message: "Message", form_send: "Envoyer le message", form_success: "Merci! Votre message a bien été envoyé.", form_error: "Une erreur est survenue. Veuillez réessayer.", contact_login_hint: "Vous êtes un habitué? Connectez-vous pour aller plus vite :",
      footer_tagline: "Cuisine indienne authentique au cœur de Blainville, Québec.", footer_explore: "Explorer", footer_rights: "Tous droits réservés.", made_blainville: "Fièrement à Blainville, QC", enable_notif: "Activer les notifications"
    },
    en: {
      site_name: "Tandoori Route",
      tagline_short: "Indian Cuisine · Blainville",
      meta_desc: "Tandoori Route — authentic Indian cuisine in Blainville, Quebec. Order online for take-out or dine-in.",
      nav_home: "Home", nav_gallery: "Gallery", nav_news: "News", nav_contact: "Contact", nav_order: "Order Online", login: "Sign In", account: "My Account",
      hero_eyebrow: "Authentic Indian cuisine · Blainville, QC",
      hero_title: "The road to Indian flavours",
      hero_subtitle: "Generous dishes, vibrant spices and a warm table in the heart of Blainville.",
      hero_cta: "Order Online", hero_cta_secondary: "View Gallery",
      about_eyebrow: "Welcome", intro_title: "Tandoori Route",
      intro_text: "In the heart of Blainville, Tandoori Route invites you to discover the richness of Indian cuisine: fragrant curries, golden grilled dishes, soft breads and generous vegetarian plates.",
      intro_text2: "Dine-in or take-out, we bring the authentic flavours of India to your plate in a modern, welcoming setting.",
      featured_subtitle: "A taste of the menu", featured_title: "Our featured dishes", view_all_gallery: "View the full gallery",
      order_cta_band_title: "Hungry for flavour?", order_cta_band_text: "Order online in just a few clicks — for take-out or dine-in.",
      reviews_subtitle: "From our guests", reviews_title: "What our customers say", read_more_google: "Read more reviews on Google", reviews_empty: "Reviews will be shown soon.",
      hours_title: "Opening Hours", hours_eyebrow: "Visit us", closed: "Closed", hours_soon: "Hours coming soon.",
      contact_eyebrow: "Get in touch", contact_title: "Contact", contact_subtitle: "A question, a reservation, an event? Write to us.", info_title: "Details", address_label: "Address", phone_label: "Phone", email_label: "Email",
      gallery_eyebrow: "Gallery", gallery_title: "Our dishes in pictures", gallery_intro: "Treat yourself to a preview of our cuisine.", gallery_empty: "The gallery will be available soon.", all: "All",
      news_eyebrow: "News", news_title: "News & Events", news_empty: "No news yet. Check back soon!", read_more: "Read more", back_news: "Back to news",
      form_title: "Send us a message", form_name: "Name", form_email: "Email", form_phone: "Phone", form_message: "Message", form_send: "Send message", form_success: "Thank you! Your message has been sent.", form_error: "An error occurred. Please try again.", contact_login_hint: "A regular? Sign in to go faster:",
      footer_tagline: "Authentic Indian cuisine in the heart of Blainville, Quebec.", footer_explore: "Explore", footer_rights: "All rights reserved.", made_blainville: "Proudly in Blainville, QC", enable_notif: "Enable notifications"
    }
  };

  const ADMIN_TABLES = {
    posts: ["title","content","image_url","category","published"],
    dishes: ["name","description","category","image_url","featured","sort_order","published"],
    reviews: ["author","rating","content","review_date","image_url","published"],
    hours: ["day_fr","day_en","hours_text","closed","sort_order"],
    form_submissions: ["name","email","phone","message"]
  };
  const COL_TYPES = { published:"bool", featured:"bool", closed:"bool", rating:"int", sort_order:"int" };
  const SETTINGS_FIELDS = [
    {name:"order_online_url",type:"url",label:"Lien commande en ligne",desc:"URL de la plateforme de commande externe (sur place / à emporter). Le bouton « Commander en ligne » mène ici."},
    {name:"google_reviews_url",type:"url",label:"Lien avis Google",desc:"Lien vers votre page d'avis Google."},
    {name:"facebook_url",type:"url",label:"Facebook",desc:"URL de votre page Facebook."},
    {name:"instagram_url",type:"url",label:"Instagram",desc:"URL de votre profil Instagram."},
    {name:"tiktok_url",type:"url",label:"TikTok",desc:"URL de votre profil TikTok."},
    {name:"contact_phone",type:"text",label:"Téléphone",desc:"Numéro de téléphone affiché sur le site."},
    {name:"contact_email",type:"email",label:"Courriel affiché",desc:"Adresse courriel affichée sur le site."},
    {name:"business_address",type:"text",label:"Adresse",desc:"Adresse du restaurant affichée sur le site."},
    {name:"map_query",type:"text",label:"Recherche carte Google",desc:"Texte utilisé pour la carte (ex. nom + ville)."}
  ];

  function normalize(c,v){
    if(COL_TYPES[c]==="bool") return (v===true||v==="true"||v===1||v==="1"||v==="on")?1:0;
    if(COL_TYPES[c]==="int"){ var n=parseInt(v,10); return isNaN(n)?0:n; }
    return v;
  }
  function escapeHtml(s){ return String(s==null?"":s).replace(/[&<>\"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];}); }
  function renderText(s){ if(!s) return ""; return String(s).split(/\n{2,}/).map(function(p){ return "<p>"+escapeHtml(p).replace(/\n/g,"<br>")+"</p>"; }).join(""); }
  function stars(n){ n=Math.round(Number(n)||0); var s=""; for(var i=0;i<5;i++){ s+= i<n?"★":"☆"; } return s; }
  function formatDate(lang,d){ if(!d) return ""; try{ return new Date(d).toLocaleDateString(lang==="en"?"en-CA":"fr-CA",{year:"numeric",month:"long",day:"numeric"}); }catch(e){ return ""; } }

  async function getSettings(){ try{ var rows=await db.all("SELECT key, value FROM admin_settings"); var o={}; rows.forEach(function(r){ o[r.key]=r.value; }); return o; }catch(e){ return {}; } }
  function applyTextOverrides(t,settings,lang){ for(var k in settings){ if(k.indexOf("text_")===0 && k.slice(-(lang.length+1))==="_"+lang){ var key=k.slice(5,-(lang.length+1)); if(key) t[key]=settings[k]; } } return t; }

  router.use(async function(req,res,next){ if(req.method==="GET" && req.path.indexOf("/api/admin")!==0 && req.path.indexOf(".")===-1){ try{ await db.run("INSERT INTO site_visits (path) VALUES ($1)",[req.path]); }catch(e){} } next(); });
  router.use(services.auth.optionalAuth);
  router.use(async function(req,res,next){
    try{
      var lang = req.query.lang || (req.cookies && req.cookies.pwa_lang) || "fr";
      if(lang!=="fr" && lang!=="en") lang="fr";
      if(req.query.lang) res.cookie("pwa_lang",lang,{maxAge:31536000000});
      var settings = await getSettings();
      var t = applyTextOverrides(Object.assign({}, T[lang]||T.fr), settings, lang);
      res.locals.lang = lang;
      res.locals.t = t;
      res.locals.settings = settings;
      res.locals.user = req.user || null;
      res.locals.pathRel = req.path.replace(/^\/+/,"");
      res.locals.orderUrl = (settings.order_online_url && settings.order_online_url.trim()) ? settings.order_online_url.trim() : "contact";
      res.locals.formatDate = function(d){ return formatDate(lang,d); };
      res.locals.renderText = renderText;
      res.locals.stars = stars;
    }catch(e){ console.error("ctx",e.message); }
    next();
  });

  function requireAdminPage(req,res,next){ if(!services.admin.isAdmin(req)) return res.redirect("admin/login"); next(); }
  function requireAdminApi(req,res,next){ if(!services.admin.isAdmin(req)) return res.status(403).json({error:"Forbidden"}); next(); }

  router.get("/", async function(req,res){
    try{
      var dishes = await db.all("SELECT * FROM dishes WHERE published=1 ORDER BY featured DESC, sort_order ASC, id DESC LIMIT 6");
      var reviews = await db.all("SELECT * FROM reviews WHERE published=1 ORDER BY id DESC LIMIT 6");
      var posts = await db.all("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 3");
      var hours = await db.all("SELECT * FROM hours ORDER BY sort_order ASC, id ASC");
      var avg = reviews.length ? (reviews.reduce(function(a,r){return a+(Number(r.rating)||0);},0)/reviews.length) : 0;
      res.render("index",{dishes:dishes,reviews:reviews,posts:posts,hours:hours,avgRating:avg,pageTitle:""});
    }catch(e){ console.error(e.message); res.render("index",{dishes:[],reviews:[],posts:[],hours:[],avgRating:0,pageTitle:""}); }
  });
  router.get("/galerie", async function(req,res){
    try{
      var dishes = await db.all("SELECT * FROM dishes WHERE published=1 ORDER BY sort_order ASC, id DESC");
      var cats = []; dishes.forEach(function(d){ if(d.category && cats.indexOf(d.category)===-1) cats.push(d.category); });
      res.render("galerie",{dishes:dishes,cats:cats,pageTitle:res.locals.t.gallery_title});
    }catch(e){ res.render("galerie",{dishes:[],cats:[],pageTitle:""}); }
  });
  router.get("/nouvelles", async function(req,res){
    try{ var posts = await db.all("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC"); res.render("nouvelles",{posts:posts,pageTitle:res.locals.t.news_title}); }
    catch(e){ res.render("nouvelles",{posts:[],pageTitle:""}); }
  });
  router.get("/nouvelles/:id", async function(req,res){
    try{
      var post = await db.get("SELECT * FROM posts WHERE id=$1 AND published=1",[req.params.id]);
      if(!post) return res.redirect("nouvelles");
      var more = await db.all("SELECT * FROM posts WHERE published=1 AND id<>$1 ORDER BY created_at DESC LIMIT 3",[req.params.id]);
      res.render("nouvelle",{post:post,more:more,pageTitle:post.title});
    }catch(e){ res.redirect("nouvelles"); }
  });
  router.get("/contact", async function(req,res){
    try{ var hours = await db.all("SELECT * FROM hours ORDER BY sort_order ASC, id ASC"); res.render("contact",{hours:hours,pageTitle:res.locals.t.contact_title}); }
    catch(e){ res.render("contact",{hours:[],pageTitle:""}); }
  });

  router.post("/api/contact", async function(req,res){
    try{
      var b=req.body||{};
      if(!b.name || !b.message) return res.status(400).json({error:"Champs requis manquants"});
      await db.run("INSERT INTO form_submissions (name,email,phone,message) VALUES ($1,$2,$3,$4)",[b.name,b.email||"",b.phone||"",b.message]);
      try{ if(services.config.contactEmail){ await services.email.send({to:services.config.contactEmail,subject:"Nouveau message — Tandoori Route",html:"<p><strong>"+escapeHtml(b.name)+"</strong> ("+escapeHtml(b.email||"")+" "+escapeHtml(b.phone||"")+")</p><p>"+escapeHtml(b.message).replace(/\n/g,"<br>")+"</p>"}); } }catch(em){ console.error("email",em.message); }
      res.json({success:true});
    }catch(e){ console.error("contact",e.message); res.status(500).json({error:"Échec de l'envoi"}); }
  });

  router.get("/admin", requireAdminPage, async function(req,res){
    var stats={visits:0,recent:0,users:0,push:0,posts:0,dishes:0,reviews:0,hours:0,submissions:0};
    try{ stats.users=await services.auth.getUserCount(); }catch(e){}
    try{ stats.push=await services.push.getSubscriptionCount(); }catch(e){}
    try{ stats.visits=(await db.get("SELECT COUNT(*)::int c FROM site_visits")).c; }catch(e){}
    try{ stats.recent=(await db.get("SELECT COUNT(*)::int c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c; }catch(e){}
    try{ stats.posts=(await db.get("SELECT COUNT(*)::int c FROM posts")).c; }catch(e){}
    try{ stats.dishes=(await db.get("SELECT COUNT(*)::int c FROM dishes")).c; }catch(e){}
    try{ stats.reviews=(await db.get("SELECT COUNT(*)::int c FROM reviews")).c; }catch(e){}
    try{ stats.hours=(await db.get("SELECT COUNT(*)::int c FROM hours")).c; }catch(e){}
    try{ stats.submissions=(await db.get("SELECT COUNT(*)::int c FROM form_submissions")).c; }catch(e){}
    var subs=[]; try{ subs=await db.all("SELECT * FROM form_submissions ORDER BY id DESC LIMIT 8"); }catch(e){}
    res.render("admin",{stats:stats,subs:subs,fmt:function(d){return formatDate("fr",d);}});
  });
  router.get("/admin/posts", requireAdminPage, function(req,res){ res.render("admin-posts"); });
  router.get("/admin/dishes", requireAdminPage, function(req,res){ res.render("admin-dishes"); });
  router.get("/admin/reviews", requireAdminPage, function(req,res){ res.render("admin-reviews"); });
  router.get("/admin/hours", requireAdminPage, function(req,res){ res.render("admin-hours"); });
  router.get("/admin/settings", requireAdminPage, async function(req,res){ var settings=await getSettings(); res.render("admin-settings",{settings:settings,fields:SETTINGS_FIELDS}); });
  router.get("/admin/logout", function(req,res){ try{ res.clearCookie(services.config.adminCookieName||"admin_token"); }catch(e){} res.redirect("."); });

  router.get("/api/admin/stats", requireAdminApi, async function(req,res){
    var out={userCount:0,pushSubscriberCount:0,totalVisits:0,recentVisits:0};
    try{ out.userCount=await services.auth.getUserCount(); }catch(e){}
    try{ out.pushSubscriberCount=await services.push.getSubscriptionCount(); }catch(e){}
    try{ out.totalVisits=(await db.get("SELECT COUNT(*)::int c FROM site_visits")).c; }catch(e){}
    try{ out.recentVisits=(await db.get("SELECT COUNT(*)::int c FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).c; }catch(e){}
    res.json(out);
  });
  router.get("/api/admin/submissions", requireAdminApi, async function(req,res){ try{ var r=await db.all("SELECT * FROM form_submissions ORDER BY id DESC"); res.json({submissions:r}); }catch(e){ res.status(500).json({error:"Erreur"}); } });
  router.get("/api/admin/modules", requireAdminApi, function(req,res){
    res.json({ modules:[
      {key:"dishes",label:"Plats / Galerie",icon:"utensils",fields:[
        {name:"name",type:"text",required:true,maxLength:120,description:"Nom du plat affiché dans la galerie et la page d'accueil.",placeholder:"ex. Poulet au beurre"},
        {name:"description",type:"textarea",required:false,description:"Courte description appétissante du plat (1 à 2 phrases).",placeholder:"ex. Morceaux de poulet tendres dans une sauce crémeuse à la tomate."},
        {name:"category",type:"select",required:false,options:["Entrées","Plats principaux","Tandoor","Pains","Végétarien","Desserts","Boissons"],description:"Catégorie utilisée pour filtrer la galerie."},
        {name:"image_url",type:"image",required:false,description:"Photo du plat. Format recommandé : carré ou 4:3, env. 800×800px."},
        {name:"featured",type:"boolean",default:true,description:"Cochez pour mettre ce plat en vedette sur la page d'accueil."},
        {name:"sort_order",type:"number",required:false,min:0,step:1,description:"Ordre d'affichage (les plus petits nombres en premier).",placeholder:"ex. 1"},
        {name:"published",type:"boolean",default:true,description:"Décochez pour masquer ce plat du site."}
      ]},
      {key:"reviews",label:"Avis Google",icon:"star",fields:[
        {name:"author",type:"text",required:true,maxLength:120,description:"Nom du client tel qu'affiché.",placeholder:"ex. Marie-Claude L."},
        {name:"rating",type:"number",required:false,min:1,max:5,step:1,default:5,description:"Note de 1 à 5 étoiles.",placeholder:"5"},
        {name:"content",type:"textarea",required:false,description:"Texte de l'avis.",placeholder:"ex. Le meilleur restaurant indien de la région!"},
        {name:"review_date",type:"text",required:false,description:"Date affichée sous l'avis (texte libre).",placeholder:"ex. Il y a 2 semaines"},
        {name:"image_url",type:"image",required:false,description:"Photo de profil du client (facultatif). Carré, env. 100×100px."},
        {name:"published",type:"boolean",default:true,description:"Décochez pour masquer cet avis."}
      ]},
      {key:"posts",label:"Nouvelles",icon:"edit",fields:[
        {name:"title",type:"text",required:true,maxLength:200,description:"Titre de la nouvelle affiché dans la liste et en haut de l'article.",placeholder:"ex. La commande en ligne est arrivée!"},
        {name:"content",type:"textarea",required:false,description:"Contenu complet. Laissez une ligne vide entre les paragraphes.",placeholder:"Rédigez votre nouvelle ici..."},
        {name:"image_url",type:"image",required:false,description:"Image principale. Format paysage 16:10, env. 1200×750px."},
        {name:"category",type:"text",required:false,maxLength:50,description:"Étiquette de catégorie (ex. Annonce, Menu).",placeholder:"ex. Annonce"},
        {name:"published",type:"boolean",default:true,description:"Décochez pour enregistrer comme brouillon (masqué du public)."}
      ]},
      {key:"hours",label:"Heures d'ouverture",icon:"clock",fields:[
        {name:"day_fr",type:"text",required:true,description:"Nom du jour en français.",placeholder:"ex. Lundi"},
        {name:"day_en",type:"text",required:false,description:"Nom du jour en anglais.",placeholder:"ex. Monday"},
        {name:"hours_text",type:"text",required:false,description:"Plage horaire affichée.",placeholder:"ex. 11h00 – 22h00"},
        {name:"closed",type:"boolean",default:false,description:"Cochez si le restaurant est fermé ce jour-là."},
        {name:"sort_order",type:"number",required:false,min:0,step:1,description:"Ordre d'affichage des jours.",placeholder:"ex. 1"}
      ]},
      {key:"form_submissions",label:"Messages reçus",icon:"envelope",fields:[
        {name:"name",type:"text",required:true,description:"Nom de l'expéditeur."},
        {name:"email",type:"email",required:false,description:"Courriel de l'expéditeur."},
        {name:"phone",type:"text",required:false,description:"Téléphone de l'expéditeur."},
        {name:"message",type:"textarea",required:false,description:"Contenu du message."}
      ]}
    ], settingsFields: SETTINGS_FIELDS.map(function(f){ return {name:f.name,type:f.type,label:f.label,description:f.desc}; }) });
  });
  router.get("/api/admin/settings", requireAdminApi, async function(req,res){ var s=await getSettings(); res.json(s); });
  router.put("/api/admin/settings", requireAdminApi, async function(req,res){ try{ var b=req.body||{}; if(!b.key) return res.status(400).json({error:"Clé manquante"}); await db.run("INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()",[b.key,b.value==null?"":String(b.value)]); res.json({success:true}); }catch(e){ res.status(500).json({error:"Erreur"}); } });
  router.post("/api/admin/upload", requireAdminApi, async function(req,res){ try{ if(!(services.cloudinary && services.cloudinary.uploader && typeof services.cloudinary.uploader.upload==="function")) return res.status(503).json({error:"Téléversement indisponible"}); var data=(req.body||{}).data; if(!data) return res.status(400).json({error:"Aucune donnée"}); var result=await services.cloudinary.uploader.upload(data,{folder:SLUG+"/uploads"}); res.json({url:result.secure_url}); }catch(e){ console.error("upload",e.message); res.status(500).json({error:"Échec du téléversement"}); } });
  router.post("/api/admin/generate-image", requireAdminApi, async function(req,res){ try{ var b=req.body||{}; if(!b.prompt) return res.status(400).json({error:"Description requise"}); var url=await services.ai.generateImage(b.prompt,{aspectRatio:b.aspectRatio||"4:3"}); res.json({imageUrl:url}); }catch(e){ console.error("genimg",e.message); res.status(500).json({error:"Génération échouée"}); } });

  // Explicit named CRUD routes — posts
  router.get("/api/admin/posts", requireAdminApi, async function(req,res){
    try{ var rows=await db.all("SELECT * FROM posts ORDER BY id DESC"); res.json({posts:rows}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });
  router.post("/api/admin/posts", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.posts;
    try{ var cols=[],vals=[],ph=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ cols.push(c); vals.push(normalize(c,b[c])); ph.push("$"+i); i++; } }); if(!cols.length) return res.status(400).json({error:"Aucune donnée"}); var row=await db.get("INSERT INTO posts ("+cols.join(",")+") VALUES ("+ph.join(",")+") RETURNING *",vals); res.json({item:row}); }
    catch(e){ console.error("create",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.put("/api/admin/posts/:id", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.posts;
    try{ var sets=[],vals=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ sets.push(c+"=$"+i); vals.push(normalize(c,b[c])); i++; } }); if(!sets.length) return res.status(400).json({error:"Aucune donnée"}); sets.push("updated_at=NOW()"); vals.push(req.params.id); var row=await db.get("UPDATE posts SET "+sets.join(",")+" WHERE id=$"+i+" RETURNING *",vals); if(!row) return res.status(404).json({error:"Introuvable"}); res.json({item:row}); }
    catch(e){ console.error("update",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.delete("/api/admin/posts/:id", requireAdminApi, async function(req,res){
    try{ await db.run("DELETE FROM posts WHERE id=$1",[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });

  // Explicit named CRUD routes — dishes
  router.get("/api/admin/dishes", requireAdminApi, async function(req,res){
    try{ var rows=await db.all("SELECT * FROM dishes ORDER BY id DESC"); res.json({dishes:rows}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });
  router.post("/api/admin/dishes", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.dishes;
    try{ var cols=[],vals=[],ph=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ cols.push(c); vals.push(normalize(c,b[c])); ph.push("$"+i); i++; } }); if(!cols.length) return res.status(400).json({error:"Aucune donnée"}); var row=await db.get("INSERT INTO dishes ("+cols.join(",")+") VALUES ("+ph.join(",")+") RETURNING *",vals); res.json({item:row}); }
    catch(e){ console.error("create",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.put("/api/admin/dishes/:id", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.dishes;
    try{ var sets=[],vals=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ sets.push(c+"=$"+i); vals.push(normalize(c,b[c])); i++; } }); if(!sets.length) return res.status(400).json({error:"Aucune donnée"}); sets.push("updated_at=NOW()"); vals.push(req.params.id); var row=await db.get("UPDATE dishes SET "+sets.join(",")+" WHERE id=$"+i+" RETURNING *",vals); if(!row) return res.status(404).json({error:"Introuvable"}); res.json({item:row}); }
    catch(e){ console.error("update",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.delete("/api/admin/dishes/:id", requireAdminApi, async function(req,res){
    try{ await db.run("DELETE FROM dishes WHERE id=$1",[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });

  // Explicit named CRUD routes — reviews
  router.get("/api/admin/reviews", requireAdminApi, async function(req,res){
    try{ var rows=await db.all("SELECT * FROM reviews ORDER BY id DESC"); res.json({reviews:rows}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });
  router.post("/api/admin/reviews", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.reviews;
    try{ var cols=[],vals=[],ph=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ cols.push(c); vals.push(normalize(c,b[c])); ph.push("$"+i); i++; } }); if(!cols.length) return res.status(400).json({error:"Aucune donnée"}); var row=await db.get("INSERT INTO reviews ("+cols.join(",")+") VALUES ("+ph.join(",")+") RETURNING *",vals); res.json({item:row}); }
    catch(e){ console.error("create",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.put("/api/admin/reviews/:id", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.reviews;
    try{ var sets=[],vals=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ sets.push(c+"=$"+i); vals.push(normalize(c,b[c])); i++; } }); if(!sets.length) return res.status(400).json({error:"Aucune donnée"}); sets.push("updated_at=NOW()"); vals.push(req.params.id); var row=await db.get("UPDATE reviews SET "+sets.join(",")+" WHERE id=$"+i+" RETURNING *",vals); if(!row) return res.status(404).json({error:"Introuvable"}); res.json({item:row}); }
    catch(e){ console.error("update",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.delete("/api/admin/reviews/:id", requireAdminApi, async function(req,res){
    try{ await db.run("DELETE FROM reviews WHERE id=$1",[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });

  // Explicit named CRUD routes — hours
  router.get("/api/admin/hours", requireAdminApi, async function(req,res){
    try{ var rows=await db.all("SELECT * FROM hours ORDER BY sort_order ASC, id ASC"); res.json({hours:rows}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });
  router.post("/api/admin/hours", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.hours;
    try{ var cols=[],vals=[],ph=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ cols.push(c); vals.push(normalize(c,b[c])); ph.push("$"+i); i++; } }); if(!cols.length) return res.status(400).json({error:"Aucune donnée"}); var row=await db.get("INSERT INTO hours ("+cols.join(",")+") VALUES ("+ph.join(",")+") RETURNING *",vals); res.json({item:row}); }
    catch(e){ console.error("create",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.put("/api/admin/hours/:id", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.hours;
    try{ var sets=[],vals=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ sets.push(c+"=$"+i); vals.push(normalize(c,b[c])); i++; } }); if(!sets.length) return res.status(400).json({error:"Aucune donnée"}); sets.push("updated_at=NOW()"); vals.push(req.params.id); var row=await db.get("UPDATE hours SET "+sets.join(",")+" WHERE id=$"+i+" RETURNING *",vals); if(!row) return res.status(404).json({error:"Introuvable"}); res.json({item:row}); }
    catch(e){ console.error("update",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.delete("/api/admin/hours/:id", requireAdminApi, async function(req,res){
    try{ await db.run("DELETE FROM hours WHERE id=$1",[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });

  // Explicit named CRUD routes — form_submissions
  router.get("/api/admin/form_submissions", requireAdminApi, async function(req,res){
    try{ var rows=await db.all("SELECT * FROM form_submissions ORDER BY id DESC"); res.json({form_submissions:rows}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });
  router.post("/api/admin/form_submissions", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.form_submissions;
    try{ var cols=[],vals=[],ph=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ cols.push(c); vals.push(normalize(c,b[c])); ph.push("$"+i); i++; } }); if(!cols.length) return res.status(400).json({error:"Aucune donnée"}); var row=await db.get("INSERT INTO form_submissions ("+cols.join(",")+") VALUES ("+ph.join(",")+") RETURNING *",vals); res.json({item:row}); }
    catch(e){ console.error("create",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.put("/api/admin/form_submissions/:id", requireAdminApi, async function(req,res){
    var cfg=ADMIN_TABLES.form_submissions;
    try{ var sets=[],vals=[],i=1,b=req.body||{}; cfg.forEach(function(c){ if(b[c]!==undefined){ sets.push(c+"=$"+i); vals.push(normalize(c,b[c])); i++; } }); if(!sets.length) return res.status(400).json({error:"Aucune donnée"}); sets.push("updated_at=NOW()"); vals.push(req.params.id); var row=await db.get("UPDATE form_submissions SET "+sets.join(",")+" WHERE id=$"+i+" RETURNING *",vals); if(!row) return res.status(404).json({error:"Introuvable"}); res.json({item:row}); }
    catch(e){ console.error("update",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.delete("/api/admin/form_submissions/:id", requireAdminApi, async function(req,res){
    try{ await db.run("DELETE FROM form_submissions WHERE id=$1",[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });

  router.get("/api/admin/:table", requireAdminApi, async function(req,res){
    var table=req.params.table; if(!ADMIN_TABLES[table]) return res.status(404).json({error:"Module inconnu"});
    try{ var order = table==="hours" ? "sort_order ASC, id ASC" : "id DESC"; var rows=await db.all("SELECT * FROM "+table+" ORDER BY "+order); var o={}; o[table]=rows; res.json(o); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });
  router.post("/api/admin/:table", requireAdminApi, async function(req,res){
    var table=req.params.table; var cfg=ADMIN_TABLES[table]; if(!cfg) return res.status(404).json({error:"Module inconnu"});
    try{
      var cols=[],vals=[],ph=[],i=1,b=req.body||{};
      cfg.forEach(function(c){ if(b[c]!==undefined){ cols.push(c); vals.push(normalize(c,b[c])); ph.push("$"+i); i++; } });
      if(!cols.length) return res.status(400).json({error:"Aucune donnée"});
      var row=await db.get("INSERT INTO "+table+" ("+cols.join(",")+") VALUES ("+ph.join(",")+") RETURNING *",vals);
      res.json({item:row});
    }catch(e){ console.error("create",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.put("/api/admin/:table/:id", requireAdminApi, async function(req,res){
    var table=req.params.table; var cfg=ADMIN_TABLES[table]; if(!cfg) return res.status(404).json({error:"Module inconnu"});
    try{
      var sets=[],vals=[],i=1,b=req.body||{};
      cfg.forEach(function(c){ if(b[c]!==undefined){ sets.push(c+"=$"+i); vals.push(normalize(c,b[c])); i++; } });
      if(!sets.length) return res.status(400).json({error:"Aucune donnée"});
      sets.push("updated_at=NOW()"); vals.push(req.params.id);
      var row=await db.get("UPDATE "+table+" SET "+sets.join(",")+" WHERE id=$"+i+" RETURNING *",vals);
      if(!row) return res.status(404).json({error:"Introuvable"});
      res.json({item:row});
    }catch(e){ console.error("update",e.message); res.status(500).json({error:"Erreur"}); }
  });
  router.delete("/api/admin/:table/:id", requireAdminApi, async function(req,res){
    var table=req.params.table; if(!ADMIN_TABLES[table]) return res.status(404).json({error:"Module inconnu"});
    try{ await db.run("DELETE FROM "+table+" WHERE id=$1",[req.params.id]); res.json({success:true}); }
    catch(e){ res.status(500).json({error:"Erreur"}); }
  });

  router.use(function(req,res){ if(req.method==="GET") return res.redirect("."); res.status(404).json({error:"Not found"}); });
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
