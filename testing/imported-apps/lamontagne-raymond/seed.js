module.exports = async function(db){
  async function S(k,v){ await db.run("INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING",[k,v]); }
  async function SI(k,v){ await db.run("INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()",[k,v]); }
  await S("tagline","Entretien de terrain en Mauricie, à chaque saison.");
  await S("hero_eyebrow","Entreprise locale · Mauricie");
  await S("hero_title","Votre terrain impeccable, en toute saison");
  await S("hero_subtitle","Pelouse, feuilles et déneigement — un seul partenaire local, fiable et abordable, pour Shawinigan, Grand-Mère, Trois-Rivières et Nicolet.");
  await S("about_title","Une équipe d'ici, du printemps à l'hiver");
  await S("about_text","Lamontagne Raymond est une jeune entreprise mauricienne fondée sur une idée simple : offrir un entretien de terrain fiable, soigné et abordable, du premier gazon du printemps à la dernière bordée de neige. Nous habitons la région, nous connaissons son climat, et nous traitons chaque propriété comme la nôtre.");
  await S("cta_title","Obtenez votre soumission gratuite");
  await S("cta_text","Décrivez votre terrain et recevez une estimation sans engagement en moins de 24 heures.");
  await S("service_area_note","Desservant Shawinigan, Grand-Mère, Trois-Rivières et Nicolet.");
  await S("business_hours","Lun au ven 7h à 18h · Sam 8h à 14h");
  await S("payment_instructions","Le paiement se fait par virement Interac à la confirmation de votre commande. Vous recevrez les instructions de paiement par courriel.");
  await S("etransfer_email","");
  await S("guarantee_text","Satisfaction garantie · Devis sans engagement");
  await SI("_p_hero_image_url","https://res.cloudinary.com/duhp69meg/image/upload/v1781322914/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322914051.png");
  await SI("_p_about_image_url","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916242.png");

  var sc = await db.get("SELECT COUNT(*)::int AS c FROM services");
  if(!sc || sc.c===0){
    var svc=[
     ["Tonte de pelouse","Tonte hebdomadaire ou aux deux semaines, bordures et coupe-herbe inclus. Un gazon propre et nivelé à chaque visite.",35,"par visite","Été","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916813.png",1,1],
     ["Entretien complet et fertilisation","Programme saisonnier complet : fertilisation, contrôle des mauvaises herbes et aération pour un gazon dense et bien vert toute la saison.",null,"sur soumission","Toutes saisons","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916813.png",1,2],
     ["Ramassage de feuilles","Ramassage, soufflage et disposition des feuilles à l'automne. On laisse votre terrain net et prêt pour l'hiver.",89,"à partir de","Automne","https://res.cloudinary.com/duhp69meg/image/upload/v1781322913/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322913648.png",1,3],
     ["Déneigement résidentiel","Déneigement d'entrée pour la saison complète, avec passage prioritaire après chaque bordée de neige.",null,"forfait saisonnier","Hiver","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916569.png",1,4],
     ["Déneigement commercial","Stationnements et accès commerciaux dégagés tôt le matin, épandage d'abrasif inclus pour la sécurité de vos clients.",null,"sur soumission","Hiver","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916569.png",0,5],
     ["Aération et terreautage","Aération mécanique et terreautage pour décompacter le sol et favoriser des racines saines et profondes.",120,"à partir de","Été","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916242.png",0,6]
    ];
    for(var i=0;i<svc.length;i++){ await db.run("INSERT INTO services (name,description,price,price_unit,season,image_url,featured,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",svc[i]); }
  }

  var pc = await db.get("SELECT COUNT(*)::int AS c FROM products");
  if(!pc || pc.c===0){
    var prods=[
     ["Engrais à gazon 20 kg","Engrais à libération lente pour un verdissement durable, sans risque de brûlure. Couvre environ 400 m².",24.99,"le sac","Engrais","https://res.cloudinary.com/duhp69meg/image/upload/v1781322914/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322913950.png",1,1],
     ["Semence à gazon premium 5 kg","Mélange résistant au climat québécois, à germination rapide, idéal pour réparer les zones dénudées.",32.50,"le sac","Semences","https://res.cloudinary.com/duhp69meg/image/upload/v1781322914/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322914176.png",1,1],
     ["Sel de déglaçage 20 kg","Fondant à glace efficace même par grand froid, parfait pour les entrées et les marches.",14.99,"le sac","Déneigement","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916921.png",1,1],
     ["Terreau d'enrichissement 30 L","Terreau riche en matière organique pour le terreautage et les nouvelles plantations.",9.99,"le sac","Engrais","https://res.cloudinary.com/duhp69meg/image/upload/v1781322914/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322913950.png",1,0],
     ["Râteau à feuilles robuste","Râteau large à dents souples pour ramasser feuilles et débris sans abîmer le gazon.",19.99,"l'unité","Outils","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916242.png",1,0],
     ["Calcium de déglaçage écolo 10 kg","Fondant au chlorure de calcium, moins dommageable pour le béton et la végétation.",21.99,"le sac","Déneigement","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916921.png",1,0]
    ];
    for(var j=0;j<prods.length;j++){ await db.run("INSERT INTO products (name,description,price,unit,category,image_url,featured,in_stock) VALUES ($1,$2,$3,$4,$5,$6,$7,1)",prods[j]); }
  }

  var tc = await db.get("SELECT COUNT(*)::int AS c FROM testimonials");
  if(!tc || tc.c===0){
    var test=[
     ["Sylvie T.","Shawinigan","Service rapide et impeccable, ma pelouse n'a jamais été aussi belle. Je recommande sans hésiter.",5],
     ["Martin G.","Grand-Mère","Déneigement toujours fait avant que je parte travailler. Vraiment fiable tout l'hiver.",5],
     ["Caroline B.","Trois-Rivières","Ils ont ramassé toutes les feuilles en une seule visite. Terrain nickel avant la première neige.",5],
     ["Jean-François L.","Nicolet","Bon prix, bon contact, travail soigné. Une entreprise d'ici qu'on a envie d'encourager.",4]
    ];
    for(var k=0;k<test.length;k++){ await db.run("INSERT INTO testimonials (author,location,content,rating) VALUES ($1,$2,$3,$4)",test[k]); }
  }

  var poc = await db.get("SELECT COUNT(*)::int AS c FROM posts");
  if(!poc || poc.c===0){
    var posts=[
     ["Quand faire la première tonte au printemps en Mauricie","La fonte des neiges laisse souvent un gazon détrempé. Attendez que le sol soit bien ressuyé avant de sortir la tondeuse, généralement vers la mi-mai.\n\nPour la première tonte, réglez la lame plus haute que d'habitude : couper trop court fragilise les racines et favorise les mauvaises herbes. Une coupe au tiers de la hauteur est l'idéal.\n\nUn bon départ au printemps fait toute la différence sur la santé de votre pelouse pour le reste de la saison.","Pelouse","Été","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916813.png"],
     ["Préparer sa pelouse pour l'hiver en 5 étapes","Avant l'hiver, votre pelouse a besoin d'un peu d'attention pour repartir en force au printemps.\n\nTondez une dernière fois un peu plus court. Ramassez toutes les feuilles. Aérez le sol. Appliquez un engrais d'automne riche en potassium. Réparez les zones dénudées avec de la semence.\n\nCes quelques gestes protègent les racines durant le gel et accélèrent la reprise au dégel.","Pelouse","Automne","https://res.cloudinary.com/duhp69meg/image/upload/v1781322913/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322913648.png"],
     ["Pourquoi ramasser ses feuilles avant la neige","Les feuilles mortes qui restent au sol tout l'hiver étouffent le gazon et créent des plaques jaunes au printemps.\n\nUne couche humide de feuilles emprisonne l'humidité et favorise les maladies fongiques sous la neige. Mieux vaut tout ramasser avant la première bordée.\n\nNous offrons un service de ramassage rapide qui laisse votre terrain net et prêt pour l'hiver.","Feuilles","Automne","https://res.cloudinary.com/duhp69meg/image/upload/v1781322913/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322913648.png"],
     ["Déneigement : bien dégager son entrée pour éviter la glace","Un déneigement bien fait, c'est aussi une entrée sécuritaire et sans glace.\n\nDégagez la neige jusqu'à l'asphalte pour éviter qu'une couche compactée ne se transforme en glace. Un épandage d'abrasif au bon moment réduit considérablement les risques de chute.\n\nAvec un forfait saisonnier, vous n'avez plus à vous soucier de la pelle après chaque tempête.","Neige","Hiver","https://res.cloudinary.com/duhp69meg/image/upload/v1781322916/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322916569.png"],
     ["Le bon calendrier de fertilisation pour un gazon vert","Un gazon vert et dense, c'est avant tout une question de calendrier de fertilisation.\n\nAu printemps, un engrais riche en azote stimule la croissance. En été, optez pour une formule équilibrée. À l'automne, le potassium prépare les racines au froid.\n\nTrop d'engrais au mauvais moment peut brûler la pelouse : c'est pourquoi un programme adapté à votre terrain donne les meilleurs résultats.","Pelouse","Été","https://res.cloudinary.com/duhp69meg/image/upload/v1781322914/tapavis_tenant_lamontagne-raymond/build_lamontagne-raymond_1781322913950.png"]
    ];
    for(var p=0;p<posts.length;p++){ await db.run("INSERT INTO posts (title,content,category,season,image_url,published) VALUES ($1,$2,$3,$4,$5,1)",posts[p]); }
  }

  var qc = await db.get("SELECT COUNT(*)::int AS c FROM quotes");
  if(!qc || qc.c===0){
    await db.run("INSERT INTO quotes (customer_name,email,phone,address,service_type,property_size,message,source,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",["Sylvie Tremblay","sylvie@example.com","819-555-0142","12 rue des Érables, Shawinigan","Entretien de pelouse","Moyen (500 à 1500 m²)","Bonjour, j'aimerais un forfait de tonte pour la saison estivale.","Soumission","Nouveau"]);
    await db.run("INSERT INTO quotes (customer_name,email,phone,address,service_type,property_size,message,source,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",["Marc Bélanger","marc@example.com","819-555-0199","45 av. Principale, Grand-Mère","Déneigement","Grand (plus de 1500 m²)","Besoin d'un déneigement pour cet hiver, entrée double.","Soumission","Nouveau"]);
  }

  var bc = await db.get("SELECT COUNT(*)::int AS c FROM bookings");
  if(!bc || bc.c===0){
    await db.run("INSERT INTO bookings (customer_name,email,phone,address,service,preferred_date,preferred_time,message,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",["Caroline Boucher","caroline@example.com","819-555-0177","88 rue du Parc, Trois-Rivières","Ramassage de feuilles","2025-10-20","Avant-midi","Beaucoup de feuilles, grand terrain arrière.","Nouveau"]);
  }
};