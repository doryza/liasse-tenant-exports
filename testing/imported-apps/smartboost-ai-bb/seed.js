module.exports = async function(db) {
  const cfg = arguments[1] || {};
  const settings = [
    ['_p_hero_image_url','https://placehold.co/800x450/e2e8f0/64748b/png?text=Image+Coming+Soon#%7B%7BIMG_HERO%7D%7D'],
    ['tagline','Marketing IA pour propulser votre entreprise'],
    ['hero_title','Créez du marketing professionnel avec l\'IA'],
    ['hero_subtitle','Publicités, captions, slogans, visuels et campagnes générés en quelques secondes par l\'intelligence artificielle.'],
    ['hero_title_en','Create professional marketing with AI'],
    ['hero_subtitle_en','Ads, captions, slogans, visuals and campaigns generated in seconds with artificial intelligence.'],
    ['about_text','SmartBoost AI aide les petites entreprises à briller en ligne grâce à une suite complète d\'outils d\'IA marketing. Notre mission est de démocratiser le marketing professionnel.'],
    ['about_text_en','SmartBoost AI helps small businesses shine online with a complete suite of AI marketing tools. Our mission is to democratize professional marketing.'],
    ['contact_email','alvarezbadillo.bryan@cra.education'],
    ['business_name','SmartBoost AI'],
    ['footer_text','© SmartBoost AI — Le marketing intelligent pour les entreprises modernes.']
  ];
  for (const [k,v] of settings) {
    if (k.startsWith('_p_')) {
      await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k,v]);
    } else {
      await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[k,v]);
    }
  }
  const postCount = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (!postCount || postCount.c === 0) {
    const posts = [
      ['5 façons dont l\'IA transforme le marketing PME','L\'intelligence artificielle révolutionne la manière dont les petites entreprises créent leur contenu marketing. Découvrez comment automatiser vos campagnes sans sacrifier la qualité.','L\'IA accessible aux PME : économisez du temps, gagnez en performance.','Tendances','Équipe SmartBoost'],
      ['Le guide ultime des captions Instagram en 2025','Une bonne caption peut doubler votre engagement. Voici nos meilleures stratégies pour rédiger des légendes qui convertissent, avec ou sans IA.','Doublez votre engagement avec ces techniques éprouvées.','Réseaux sociaux','Équipe SmartBoost'],
      ['Comment lancer une campagne TikTok virale avec SmartBoost','Du script vidéo à la publication, suivez notre processus en 7 étapes pour créer du contenu TikTok qui décolle.','Le processus complet pour créer des TikToks viraux.','Tutoriels','Équipe SmartBoost'],
      ['Étude de cas : +320% de conversions pour un café local','Découvrez comment Le Petit Grain a transformé sa présence en ligne en 3 mois grâce à SmartBoost AI.','Une PME montréalaise multiplie ses ventes en ligne.','Études de cas','Équipe SmartBoost'],
      ['L\'avenir du marketing : IA générative et automation','Plongée dans les technologies qui définiront le marketing de demain.','Ce qui attend les marketeurs en 2025-2026.','Tendances','Équipe SmartBoost']
    ];
    for (const [t,c,e,cat,a] of posts) {
      await db.run('INSERT INTO posts (title,content,excerpt,category,author,published) VALUES ($1,$2,$3,$4,$5,1)',[t,c,e,cat,a]);
    }
  }
  const featCount = await db.get('SELECT COUNT(*)::int AS c FROM features');
  if (!featCount || featCount.c === 0) {
    const feats = [
      ['Générateur de captions IA','Créez des légendes parfaites pour Instagram, Facebook et TikTok en moins de 5 secondes.','sparkles',1],
      ['Publicités automatisées','Générez des annonces complètes avec accroche, corps de texte et appel à l\'action.','megaphone',1],
      ['Scripts vidéo TikTok','Des scénarios courts et accrocheurs pour vos Reels et TikToks.','video',1],
      ['Logos et identité visuelle','Concevez un logo professionnel adapté à votre niche.','image',1],
      ['Campagnes email','Séquences email complètes prêtes à envoyer.','mail',1],
      ['Analytique de contenu','Suivez les performances de chaque pièce générée.','bar-chart',1]
    ];
    for (let i=0;i<feats.length;i++) {
      const [t,d,ic,f] = feats[i];
      await db.run('INSERT INTO features (title,description,icon,sort_order,featured) VALUES ($1,$2,$3,$4,$5)',[t,d,ic,i,f]);
    }
  }
  const planCount = await db.get('SELECT COUNT(*)::int AS c FROM pricing_plans');
  if (!planCount || planCount.c === 0) {
    const plans = [
      ['Gratuit',0,'mois','Pour découvrir la puissance de l\'IA marketing','5 générations par jour\nCaptions et slogans\nModèles de base\nSupport communautaire','Commencer gratuitement',0,0],
      ['Pro',20,'mois','Pour les entrepreneurs et PME ambitieuses','Générations illimitées\nTous les outils IA\nScripts vidéo et campagnes email\nLogos et visuels HD\nAnalytique avancée\nSupport prioritaire','S\'abonner',1,1],
      ['Agence',79,'mois','Pour les agences et équipes marketing','Tout dans Pro\nMulti-utilisateurs (5 sièges)\nMarque blanche\nAPI et intégrations\nGestionnaire de compte dédié','Contacter les ventes',0,2]
    ];
    for (const [n,p,per,d,f,c,h,o] of plans) {
      await db.run('INSERT INTO pricing_plans (name,price,period,description,features,cta_label,highlighted,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[n,p,per,d,f,c,h,o]);
    }
  }
  const testCount = await db.get('SELECT COUNT(*)::int AS c FROM testimonials');
  if (!testCount || testCount.c === 0) {
    const tests = [
      ['Maria Hernandez','Propriétaire — Café Solea','SmartBoost AI a transformé notre présence Instagram. Nos posts ont triplé en engagement et je gagne 10 heures par semaine.','https://placehold.co/800x450/e2e8f0/64748b/png?text=Image+Coming+Soon#%7B%7BIMG_AVATAR1%7D%7D',5,1],
      ['Jamal Thompson','Restaurateur — Burger Fusion','J\'ai lancé une campagne TikTok en 15 minutes. Résultat : +200 commandes en deux semaines. Incroyable.','https://placehold.co/800x450/e2e8f0/64748b/png?text=Image+Coming+Soon#%7B%7BIMG_AVATAR2%7D%7D',5,1],
      ['Kim Tanaka','Boutique en ligne — Noah & Lin','Les visuels et les captions générés ressemblent à du travail d\'agence. Pour 20$/mois, c\'est imbattable.','https://placehold.co/800x450/e2e8f0/64748b/png?text=Image+Coming+Soon#%7B%7BIMG_AVATAR3%7D%7D',5,1]
    ];
    for (const [a,r,c,i,rt,f] of tests) {
      await db.run('INSERT INTO testimonials (author,role,content,image_url,rating,featured) VALUES ($1,$2,$3,$4,$5,$6)',[a,r,c,i,rt,f]);
    }
  }
  const tplCount = await db.get('SELECT COUNT(*)::int AS c FROM templates');
  if (!tplCount || tplCount.c === 0) {
    const tpls = [
      ['Post Instagram restaurant','Annoncez un nouveau plat ou menu avec style','Instagram','Crée une publication Instagram captivante pour annoncer [PLAT/MENU] dans mon restaurant [NOM]. Cible : [AUDIENCE]. Inclure caption, hashtags et idée visuelle.','https://placehold.co/800x450/e2e8f0/64748b/png?text=Image+Coming+Soon#%7B%7BIMG_TEMPLATE1%7D%7D',0],
      ['Pub TikTok salle de sport','Script vidéo de 15 secondes','TikTok','Écris un script TikTok de 15 secondes pour une salle de sport ciblant les jeunes adultes. Mettre en avant [OFFRE].','https://placehold.co/800x450/e2e8f0/64748b/png?text=Image+Coming+Soon#%7B%7BIMG_TEMPLATE2%7D%7D',1],
      ['Annonce Facebook boutique','Promotion week-end','Facebook','Crée une annonce Facebook pour une boutique de [PRODUITS] avec une promo week-end. Ton convivial et accrocheur.','https://placehold.co/800x450/e2e8f0/64748b/png?text=Image+Coming+Soon#%7B%7BIMG_TEMPLATE3%7D%7D',0],
      ['Campagne email lancement','Séquence de 3 emails','Email','Rédige une séquence de 3 emails pour le lancement de [PRODUIT/SERVICE]. Audience : [CIBLE]. Inclure objet, corps et CTA.','https://placehold.co/800x450/e2e8f0/64748b/png?text=Image+Coming+Soon#%7B%7BIMG_TEMPLATE4%7D%7D',1]
    ];
    for (const [n,d,c,p,i,pr] of tpls) {
      await db.run('INSERT INTO templates (name,description,category,prompt_template,image_url,is_premium) VALUES ($1,$2,$3,$4,$5,$6)',[n,d,c,p,i,pr]);
    }
  }
};