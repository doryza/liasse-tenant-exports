module.exports = async function(db) {
  const cfg = arguments[1] || {};
  const settings = [
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778636418/tapavis_tenant_freshbin/build_freshbin_1778636418777.png'],
    ['_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778636432/tapavis_tenant_freshbin/build_freshbin_1778636432276.png'],
    ['_p_env_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778636426/tapavis_tenant_freshbin/build_freshbin_1778636426837.png'],
    ['hero_title', 'Nettoyage des essentiels, pour un quotidien plus sain'],
    ['hero_subtitle', 'FreshBin offre des services de nettoyage professionnels avec une approche écologique. Investissez dans votre confort et dans la planète.'],
    ['hero_cta', 'Réserver un service'],
    ['tagline', 'Un service propre. Une planète plus saine.'],
    ['about_title', 'Un investissement important pour l’environnement'],
    ['about_intro', 'FreshBin n’est pas seulement une entreprise de nettoyage. C’est un engagement envers votre espace personnel et envers notre planète.'],
    ['about_text', 'Chaque bac de poubelle nettoyé, chaque véhicule détaillé et chaque pelouse entretenue représente un pas vers un environnement plus sain. Nous utilisons des produits respectueux de l’environnement et des méthodes éco-responsables. Choisir FreshBin, c’est choisir un service de qualité tout en investissant dans la durabilité de notre milieu de vie.'],
    ['env_title', 'Notre engagement écologique'],
    ['env_text', 'Eau filtrée et récupérée, produits biodégradables, équipement éco-énergétique. Chaque détail compte pour réduire notre empreinte environnementale et préserver votre espace personnel.'],
    ['services_title', 'Nos services'],
    ['services_subtitle', 'Des solutions complètes pour entretenir vos essentiels.'],
    ['contact_title', 'Contactez-nous'],
    ['contact_subtitle', 'Une question, une demande de soumission ou simplement envie d’en savoir plus? Écrivez-nous.'],
    ['contact_phone', cfg.contactPhone || '263-380-4164'],
    ['contact_email', cfg.contactEmail || 'matheo74747@gmail.com'],
    ['business_name', cfg.businessName || cfg.displayName || 'FreshBin'],
    ['business_address', cfg.businessAddress || ''],
    ['footer_text', '© FreshBin. Nettoyage professionnel et écologique.'],
    ['cta_banner_title', 'Prêt à offrir une seconde vie à vos essentiels?'],
    ['cta_banner_text', 'Réservez dès maintenant et découvrez la différence FreshBin.'],
    ['reservation_title', 'Demande de réservation'],
    ['reservation_subtitle', 'Remplissez le formulaire et nous vous contacterons dans les plus brefs délais.']
  ];
  for (const [k, v] of settings) {
    if (k.startsWith('_p_')) {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
    } else {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
    }
  }
  const svcCount = await db.get('SELECT COUNT(*)::int AS c FROM services');
  if (!svcCount || svcCount.c === 0) {
    const services = [
      ['Nettoyage de bacs de poubelle', 'Désinfection complète et désodorisation de vos bacs résidentiels.', 'Nous nettoyons et désinfectons en profondeur vos bacs à ordures et de recyclage avec de l’eau à haute pression et des produits biodégradables. Élimine les bactéries, les odeurs et les résidus. Le service inclut le rinçage, la désinfection complète, le séchage et l’application d’un agent désodorisant naturel.', '15$ par bac', 'Nettoyage', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778636448/tapavis_tenant_freshbin/build_freshbin_1778636448817.png', 'trash', 1, 1],
      ['Esthétique automobile - Intérieur ou Extérieur', 'Détaillage professionnel de votre véhicule, intérieur ou extérieur.', 'Service de détaillage complet au choix : nettoyage intérieur (aspirateur, tissus, plastiques, vitres) ou extérieur (lavage à la main, cire, jantes, pneus). Un choix idéal pour redonner de l’éclat à votre voiture.', '60$', 'Automobile', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778636434/tapavis_tenant_freshbin/build_freshbin_1778636434162.png', 'car', 1, 2],
      ['Esthétique automobile - Forfait Complet', 'Détaillage complet intérieur ET extérieur de votre véhicule.', 'Le grand luxe pour votre véhicule. Nous combinons le détaillage intérieur et extérieur pour un résultat impeccable. Inclut shampooing des tapis et sièges, traitement des plastiques, lavage et cire de carrosserie, nettoyage des jantes et finition complète.', '150$ complet', 'Automobile', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778636434/tapavis_tenant_freshbin/build_freshbin_1778636434162.png', 'car', 1, 3],
      ['Tonte de gazon - Contrat saisonnier', 'Contrat saisonnier d’entretien de pelouse, d’avril à septembre.', 'Contrat saisonnier pour l’entretien complet de votre pelouse pendant toute la saison estivale. Tonte régulière, finition aux endroits difficiles d’accès et ramassage si désiré. Une pelouse impeccable du printemps à l’automne sans soucis.', '500$ (avril à septembre)', 'Pelouse', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778636433/tapavis_tenant_freshbin/build_freshbin_1778636433270.png', 'leaf', 1, 4]
    ];
    for (const s of services) await db.run('INSERT INTO services (name, short_description, description, price, category, image_url, icon, featured, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', s);
  }
  const tCount = await db.get('SELECT COUNT(*)::int AS c FROM testimonials');
  if (!tCount || tCount.c === 0) {
    const tt = [
      ['Sophie Bergeron', 'Cliente résidentielle', 'Mes bacs étaient devenus impossibles à approcher tellement les odeurs étaient fortes. Après le passage de FreshBin, c’est comme s’ils étaient neufs! Service impeccable.', 5],
      ['Marc Tremblay', 'Propriétaire', 'J’ai pris le forfait complet pour ma voiture et le résultat dépasse mes attentes. Travail soigné, ponctuel et abordable. Je recommande sans hésiter.', 5],
      ['Julie Lavoie', 'Cliente saisonnière', 'Le contrat de tonte de gazon m’a sauvé l’été! Plus jamais à m’en occuper, ma pelouse est toujours impeccable. Un vrai investissement de tranquillité.', 5],
      ['François Dubé', 'Client fidèle', 'J’apprécie particulièrement l’approche écologique de FreshBin. Savoir que les produits utilisés sont biodégradables fait toute la différence pour ma famille.', 5]
    ];
    for (const x of tt) await db.run('INSERT INTO testimonials (author, role, content, rating) VALUES ($1,$2,$3,$4)', x);
  }
  const pCount = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (!pCount || pCount.c === 0) {
    const pp = [
      ['Pourquoi nettoyer ses bacs à ordures?', 'Les bacs à ordures accumulent bactéries, moisissures et insectes. Un nettoyage professionnel régulier prévient les odeurs, élimine les pathogènes et prolonge la durée de vie de vos bacs. C’est un geste simple pour la santé de votre famille et de votre environnement immédiat.', 'Conseils'],
      ['Notre approche écologique chez FreshBin', 'Chez FreshBin, nous croyons qu’offrir un service de qualité ne doit pas se faire au détriment de l’environnement. C’est pourquoi nous utilisons exclusivement des produits biodégradables, récupérons l’eau lorsque c’est possible et privilégions des méthodes à faible consommation énergétique.', 'Écologie'],
      ['Comment préparer son véhicule pour un détaillage?', 'Avant votre rendez-vous, retirez vos effets personnels et videz le coffre. Un véhicule dégagé permet à notre équipe de travailler efficacement et d’offrir le meilleur résultat possible. Voici quelques conseils pratiques.', 'Conseils'],
      ['Saison de tonte : nos astuces pour une pelouse en santé', 'Une pelouse en santé commence par une bonne fréquence de tonte. Trop courte, elle s’assèche; trop longue, elle s’étouffe. Voici nos meilleures pratiques pour maintenir un gazon vert et résistant tout l’été.', 'Pelouse']
    ];
    for (const x of pp) await db.run('INSERT INTO posts (title, content, category) VALUES ($1,$2,$3)', x);
  }
};
