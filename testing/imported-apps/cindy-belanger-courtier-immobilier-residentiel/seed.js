module.exports = async function(db) {
  const settings = [
    ['business_name', 'Cindy Bélanger — Courtier Immobilier Résidentiel'],
    ['tagline', 'Votre partenaire de confiance pour acheter ou vendre au Québec'],
    ['hero_title', 'Réalisez votre projet immobilier en toute confiance'],
    ['hero_subtitle', 'Courtier immobilier résidentiel chez Via Capitale Elite — accompagnement personnalisé, évaluation gratuite, résultats concrets.'],
    ['hero_cta_primary', 'Évaluation gratuite'],
    ['hero_cta_secondary', 'Me contacter'],
    ['about_title', 'À propos de Cindy'],
    ['about_text', 'Passionnée par l\'immobilier et dévouée à mes clients, je vous accompagne à chaque étape de votre projet, que vous souhaitiez vendre votre propriété au meilleur prix ou trouver la maison de vos rêves. Affiliée à Via Capitale Elite, je mets à votre service mon expertise du marché local, mon réseau et un service personnalisé.'],
    ['about_highlight_1', 'Service personnalisé et à l\'écoute'],
    ['about_highlight_2', 'Évaluation rigoureuse du marché'],
    ['about_highlight_3', 'Stratégie marketing complète pour vendeurs'],
    ['about_highlight_4', 'Accompagnement de A à Z pour acheteurs'],
    ['why_title', 'Pourquoi me choisir'],
    ['why_subtitle', 'L\'expertise Via Capitale Elite au service de votre projet immobilier'],
    ['services_title', 'Mes services'],
    ['services_subtitle', 'Une approche complète pour vendre, acheter ou évaluer une propriété résidentielle'],
    ['testimonials_title', 'Ce que disent mes clients'],
    ['testimonials_subtitle', 'La confiance de mes clients est ma plus grande fierté'],
    ['posts_title', 'Conseils et actualités'],
    ['posts_subtitle', 'Tout ce qu\'il faut savoir sur le marché immobilier québécois'],
    ['cta_title', 'Prêt à passer à l\'action ?'],
    ['cta_subtitle', 'Obtenez une évaluation gratuite de votre propriété ou discutons de votre projet d\'achat — sans engagement.'],
    ['evaluation_title', 'Évaluation gratuite de votre propriété'],
    ['evaluation_subtitle', 'Recevez une estimation personnalisée et basée sur le marché actuel. Aucun engagement, aucune obligation.'],
    ['evaluation_promise', 'Réponse sous 24 à 48 heures ouvrables'],
    ['contact_title', 'Restons en contact'],
    ['contact_subtitle', 'Plusieurs façons de me joindre — choisissez celle qui vous convient le mieux.'],
    ['agency_name', 'Via Capitale Elite'],
    ['agency_tagline', 'Agence immobilière'],
    ['service_area', 'Région de Québec et environs'],
    ['footer_text', 'Cindy Bélanger, courtier immobilier résidentiel — Via Capitale Elite. Tous droits réservés.'],
    ['social_facebook', ''],
    ['social_instagram', ''],
    ['social_linkedin', ''],
  ];
  for (const [k, v] of settings) {
    await db.run("INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()", [k, v]);
  }
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384034/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384034620.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()", []);
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384031/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384031119.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()", []);
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_cta_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384025/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384025069.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()", []);

  const services = [
    ['Vendre votre propriété', 'Une stratégie de mise en marché clé en main : analyse comparative, photographie professionnelle, visibilité maximale et négociation à votre avantage pour obtenir le meilleur prix dans les meilleurs délais.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384024/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384024150.png', 'home', 1, 1, 'Demander une évaluation', 'evaluation', 'Honoraires sur commission'],
    ['Acheter une propriété', 'Recherche personnalisée selon vos critères, accompagnement aux visites, analyses comparatives de prix et négociation rigoureuse pour faire l\'acquisition de la maison qui vous correspond.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384028/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384028332.png', 'key', 1, 2, 'Discuter de mon projet', 'contact', 'Service sans frais pour l\'acheteur'],
    ['Évaluation gratuite', 'Estimation détaillée et réaliste de la valeur marchande de votre propriété, basée sur les ventes récentes comparables et les tendances actuelles du marché local.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384030/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384030553.png', 'chart', 1, 3, 'Obtenir mon évaluation', 'evaluation', 'Gratuit, sans engagement'],
    ['Conseils personnalisés', 'Vous hésitez à vendre ou à acheter ? Profitez d\'une consultation sans engagement pour clarifier vos options et planifier votre projet en fonction de vos objectifs.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384029/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384029569.png', 'chat', 0, 4, 'Prendre rendez-vous', 'contact', 'Consultation gratuite'],
  ];
  for (const s of services) {
    await db.run('INSERT INTO services (name, description, image_url, icon, featured, sort_order, cta_label, cta_link, price_info) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', s);
  }

  const testimonials = [
    ['Mélanie & Patrick T.', 'Vendeurs à Charlesbourg', 'Cindy a vendu notre maison en moins de trois semaines et au-dessus de notre prix demandé. Son approche professionnelle et humaine a fait toute la différence. Nous la recommandons sans hésiter.', 5, null],
    ['Sophie L.', 'Première acheteuse', 'Acheter une première maison peut être stressant, mais avec Cindy, tout s\'est déroulé à merveille. Elle a pris le temps de répondre à toutes mes questions et m\'a guidée à chaque étape.', 5, null],
    ['Jean-François M.', 'Acheteur à Sainte-Foy', 'Cindy connaît parfaitement le marché et a négocié pour nous une offre vraiment avantageuse. Service impeccable, je n\'hésiterai pas à faire à nouveau affaire avec elle.', 5, null],
    ['Caroline D.', 'Vendeuse à Beauport', 'Excellente courtière ! Communication claire, photos de la propriété magnifiques, et résultats au rendez-vous. Merci Cindy pour ton travail exceptionnel.', 5, null],
  ];
  for (const t of testimonials) {
    await db.run('INSERT INTO testimonials (author, role, content, rating, image_url) VALUES ($1,$2,$3,$4,$5)', t);
  }

  const posts = [
    ['5 conseils pour bien préparer la vente de votre maison', 'Avant de mettre votre propriété sur le marché, quelques préparatifs peuvent faire toute la différence sur le prix de vente et le délai.', 'La vente d\'une propriété ne s\'improvise pas. Voici cinq étapes essentielles pour maximiser votre prix de vente et accélérer le processus.\n\n1. Désencombrer et dépersonnaliser : les acheteurs doivent pouvoir se projeter dans la maison. Rangez les objets personnels et créez des espaces aérés.\n\n2. Petites réparations : un robinet qui fuit, une poignée brisée, une peinture écaillée — autant de détails qui peuvent inquiéter les acheteurs. Réglez-les avant les visites.\n\n3. Mise en valeur (home staging) : un éclairage soigné, quelques accessoires bien choisis et une décoration neutre peuvent transformer la perception d\'une pièce.\n\n4. Photos professionnelles : la première impression se fait en ligne. Des photos de qualité multiplient les visites.\n\n5. Fixer le bon prix : un prix trop élevé fait fuir, un prix trop bas vous fait perdre de l\'argent. Une évaluation rigoureuse est indispensable.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384028/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384028175.png', 'Conseils vendeurs', 1],
    ['Comment fonctionne l\'évaluation d\'une propriété ?', 'Comprendre la valeur marchande de votre propriété, c\'est la base de toute transaction réussie. Voici comment je procède.', 'L\'évaluation d\'une propriété repose sur trois piliers principaux.\n\nLes ventes comparables : nous analysons les propriétés similaires vendues récemment dans votre secteur. Superficie, nombre de chambres, état général, année de construction — tous ces critères entrent en ligne de compte.\n\nL\'état actuel du marché : un marché de vendeurs fait grimper les prix, tandis qu\'un marché d\'acheteurs les freine. Le taux d\'intérêt, le nombre d\'inscriptions actives et la durée moyenne des ventes sont des indicateurs clés.\n\nLes caractéristiques uniques : une vue exceptionnelle, des rénovations récentes, un grand terrain ou des matériaux haut de gamme peuvent justifier une valeur supérieure.\n\nL\'évaluation que je vous offre est gratuite et sans engagement. C\'est un excellent point de départ pour planifier votre projet, même si vous n\'êtes pas certain de vendre dans l\'immédiat.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384025/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384025834.png', 'Évaluation', 1],
    ['Premier achat : les étapes à connaître', 'Acheter sa première maison est un projet de vie. Voici un guide simple pour vous y retrouver, étape par étape.', 'Étape 1 — Préapprobation hypothécaire : avant même de visiter des propriétés, rencontrez un courtier hypothécaire ou votre institution financière pour connaître votre budget réel.\n\nÉtape 2 — Définir vos critères : nombre de chambres, secteur, proximité du travail ou des écoles, type de propriété. Faites la liste de vos « indispensables » et de vos « bonus ».\n\nÉtape 3 — Visiter les propriétés : avec votre courtier, ciblez les visites qui correspondent vraiment à vos critères. Ne vous éparpillez pas.\n\nÉtape 4 — Faire une offre : votre courtier rédige la promesse d\'achat avec les conditions qui vous protègent (inspection, financement, etc.).\n\nÉtape 5 — Inspection et négociation : un inspecteur en bâtiment vous donne l\'heure juste sur l\'état de la propriété. Selon les résultats, on peut renégocier.\n\nÉtape 6 — Notaire et prise de possession : signature finale et remise des clés !', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779384025/tapavis_tenant_cindy-belanger-courtier-immobilier-residentiel/build_cindy-belanger-courtier-immobilier-residentiel_1779384025320.png', 'Conseils acheteurs', 1],
    ['Marché immobilier de Québec : tendances actuelles', 'Un aperçu des grandes tendances qui influencent le marché résidentiel dans la région de Québec en ce moment.', 'Le marché immobilier de la région de Québec demeure dynamique. Voici les grandes tendances à surveiller.\n\nLes secteurs en demande : Lévis, Saint-Augustin et certains quartiers centraux de Québec continuent d\'attirer des acheteurs, avec des délais de vente courts pour les propriétés bien préparées.\n\nLes taux d\'intérêt : leur évolution influence directement le pouvoir d\'achat des futurs propriétaires. Une bonne préapprobation est essentielle pour sécuriser un taux avantageux.\n\nLes condos et plex : on observe un regain d\'intérêt pour les propriétés à revenus, particulièrement chez les investisseurs cherchant à diversifier leur portefeuille.\n\nLes propriétés rénovées : les acheteurs sont prêts à payer pour des maisons clés en main. Si vous vendez, certaines rénovations stratégiques offrent un excellent retour sur investissement.\n\nPour discuter de votre projet en fonction de ces tendances, contactez-moi pour une consultation gratuite.', '{{IMG_POST4}}', 'Marché', 1],
  ];
  for (const p of posts) {
    await db.run('INSERT INTO posts (title, excerpt, content, image_url, category, published) VALUES ($1,$2,$3,$4,$5,$6)', p);
  }
};
