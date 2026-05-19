module.exports = async function(db, services) {
  const cfg = (services && services.config) || {};
  const email = cfg.contactEmail || 'contact@mtl-pavage.ca';
  const phone = cfg.contactPhone || '514-555-0199';
  const bizName = cfg.businessName || cfg.displayName || 'MTL Pavage';
  const bizAddr = cfg.businessAddress || 'Montréal, QC';

  const settings = [
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051627/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051627279.png'],
    ['hero_title_fr', 'Pavage professionnel à Montréal'],
    ['hero_title_en', 'Professional paving in Montreal'],
    ['hero_subtitle_fr', 'Allées, stationnements et scellement — un fini durable et impeccable, garanti.'],
    ['hero_subtitle_en', 'Driveways, parking lots and sealcoating — durable, flawless finish, guaranteed.'],
    ['tagline_fr', 'Une équipe locale qui livre la qualité depuis plus de 20 ans.'],
    ['tagline_en', 'A local team delivering quality for over 20 years.'],
    ['about_text_fr', 'MTL Pavage est une entreprise familiale spécialisée dans le pavage résidentiel et commercial au Grand Montréal. Notre équipe certifiée utilise des matériaux de première qualité et un équipement à la fine pointe pour des résultats qui durent.'],
    ['about_text_en', 'MTL Pavage is a family-owned business specializing in residential and commercial paving across Greater Montreal. Our certified team uses top-quality materials and state-of-the-art equipment for results that last.'],
    ['business_name', bizName],
    ['business_address', bizAddr],
    ['contact_email', email],
    ['contact_phone', phone],
    ['service_area_lat', '45.5017'],
    ['service_area_lng', '-73.5673'],
    ['service_area_radius_km', '40'],
    ['service_area_label_fr', 'Grand Montréal et Rive-Sud'],
    ['service_area_label_en', 'Greater Montreal and South Shore'],
    ['footer_about_fr', 'Spécialistes du pavage résidentiel et commercial. Service rapide, soumission gratuite.'],
    ['footer_about_en', 'Residential and commercial paving specialists. Fast service, free quote.']
  ];
  for (const [k, v] of settings) {
    if (v && /\{\{IMG_/.test(v)) {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()', [k, v]);
    } else {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', [k, v]);
    }
  }

  const svcCount = await db.get('SELECT COUNT(*)::int AS c FROM services');
  if (svcCount.c === 0) {
    const svcs = [
      ['Pavage d\'allées résidentielles', 'Installation complète d\'allées asphaltées avec préparation du sol, couche de fondation et finition lisse. Durabilité maximale, esthétique impeccable.', 'home', 8.50, '1-2 jours', 1, 1],
      ['Pavage de stationnements commerciaux', 'Solutions de pavage pour stationnements, entrepôts et centres commerciaux. Marquage de lignes inclus.', 'briefcase', 7.00, '2-5 jours', 1, 2],
      ['Scellement d\'asphalte', 'Protection contre les UV, l\'eau et les produits chimiques. Prolonge la vie de votre pavage de 5 à 10 ans.', 'shield', 0.45, '4-6 heures', 1, 3],
      ['Réparation de fissures', 'Réparation professionnelle des fissures avec scellant à chaud. Empêche l\'infiltration d\'eau et la détérioration.', 'tool', 4.00, '1 jour', 0, 4],
      ['Asphaltage de routes privées', 'Pavage de routes privées et chemins d\'accès. Solutions adaptées aux propriétés rurales et industrielles.', 'truck', 9.00, '3-7 jours', 0, 5],
      ['Marquage de lignes', 'Marquage professionnel de stationnements, lignes de circulation et numérotation.', 'edit', 1.25, '1 jour', 0, 6]
    ];
    for (const s of svcs) {
      await db.run('INSERT INTO services (name, description, icon, price_from, duration, featured, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7)', s);
    }
  }

  const projCount = await db.get('SELECT COUNT(*)::int AS c FROM projects');
  if (projCount.c === 0) {
    const projs = [
      ['Allée résidentielle - Outremont', 'Rénovation complète d\'une allée de 180 m² avec nouvelle fondation et finition asphalte premium.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051620/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051620167.png', 'Outremont, Montréal', 'Résidentiel', '2024-07-15', 1],
      ['Stationnement commercial - Laval', 'Pavage de 2400 m² incluant lignes de stationnement et zones piétonnes.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051632/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051632647.png', 'Laval, QC', 'Commercial', '2024-06-22', 1],
      ['Scellement - Pointe-Claire', 'Application de scellant sur une allée double de 250 m². Couleur restaurée en une journée.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051632/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051632134.png', 'Pointe-Claire, QC', 'Scellement', '2024-08-10', 1],
      ['Réparation de fissures - Verdun', 'Traitement de 35 mètres linéaires de fissures sur une cour commerciale.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051626/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051626317.png', 'Verdun, Montréal', 'Réparation', '2024-09-05', 0],
      ['Aménagement commercial - Brossard', 'Installation complète d\'une entrée et d\'un trottoir d\'accès pour un nouveau commerce.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051623/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051623523.png', 'Brossard, QC', 'Commercial', '2024-08-28', 1],
      ['Allée familiale - Saint-Lambert', 'Pavage neuf de 120 m² avec bordures de béton intégrées.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051620/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051620167.png', 'Saint-Lambert, QC', 'Résidentiel', '2024-09-18', 0]
    ];
    for (const p of projs) {
      await db.run('INSERT INTO projects (title, description, image_url, location, category, completed_date, featured) VALUES ($1,$2,$3,$4,$5,$6,$7)', p);
    }
  }

  const revCount = await db.get('SELECT COUNT(*)::int AS c FROM reviews');
  if (revCount.c === 0) {
    const revs = [
      ['Marie L.', 'Outremont', 5, 'Travail impeccable et équipe très professionnelle. Notre allée a l\'air comme neuve et le résultat dépasse nos attentes. Délais respectés!', 'Pavage d\'allée'],
      ['Jean-François B.', 'Laval', 5, 'MTL Pavage a refait le stationnement de notre commerce. Service rapide, prix juste, et la qualité est au rendez-vous. Je recommande sans hésitation.', 'Stationnement commercial'],
      ['Sophie T.', 'Pointe-Claire', 5, 'Excellente communication du début à la fin. Soumission claire, travail soigné et nettoyage parfait après les travaux. Bravo à toute l\'équipe!', 'Scellement'],
      ['Pierre M.', 'Verdun', 4, 'Bon travail de réparation des fissures. L\'équipe est arrivée à l\'heure et a terminé en une journée comme promis.', 'Réparation'],
      ['Caroline D.', 'Brossard', 5, 'Très satisfaite du résultat. Notre nouvelle allée transforme complètement l\'apparence de notre maison. Merci pour le professionnalisme.', 'Pavage d\'allée'],
      ['Marc-André P.', 'Saint-Lambert', 5, 'Service exceptionnel. Ils ont pris le temps de bien expliquer le processus et ont livré exactement ce qu\'ils avaient promis.', 'Pavage d\'allée']
    ];
    for (const r of revs) {
      await db.run('INSERT INTO reviews (author, location, rating, content, service_type) VALUES ($1,$2,$3,$4,$5)', r);
    }
  }

  const postCount = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (postCount.c === 0) {
    const posts = [
      ['Quand faut-il sceller son asphalte?', 'Le scellement d\'asphalte est une étape souvent négligée, mais essentielle pour prolonger la durée de vie de votre pavage. Idéalement, un nouveau pavage devrait être scellé environ 6 à 12 mois après son installation, puis tous les 2 à 3 ans par la suite. Les signes qu\'il est temps de sceller incluent une couleur grisâtre, l\'apparition de petites fissures, et une surface qui devient poreuse au toucher. Au Québec, le meilleur moment pour sceller est entre la fin du printemps et le début de l\'automne, lorsque la température se maintient au-dessus de 15°C pendant au moins 48 heures.', 'Tout savoir sur le moment idéal pour protéger votre pavage et prolonger sa durée de vie.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051621/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051621056.png', 'Entretien', 'Équipe MTL Pavage'],
      ['Comment choisir la bonne entreprise de pavage', 'Choisir un entrepreneur de pavage peut sembler complexe, mais quelques critères clés vous aideront à faire le bon choix. Vérifiez toujours que l\'entreprise possède une licence RBQ valide et une assurance responsabilité. Demandez à voir des projets récents similaires au vôtre et consultez les avis en ligne. Une bonne entreprise vous fournira une soumission détaillée par écrit, incluant les matériaux utilisés, l\'épaisseur de la couche d\'asphalte, et les délais d\'exécution. Méfiez-vous des prix trop bas qui cachent souvent une qualité inférieure.', 'Les critères essentiels pour sélectionner un entrepreneur fiable et professionnel.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051622/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051622178.png', 'Conseils', 'Équipe MTL Pavage'],
      ['La meilleure saison pour paver au Québec', 'La saison de pavage au Québec s\'étend généralement de la mi-mai à la mi-octobre, lorsque les températures sont propices au compactage optimal de l\'asphalte. Les mois de juin, juillet et août offrent les meilleures conditions, avec des températures stables et peu de précipitations. Au printemps, le sol doit être complètement dégelé pour assurer une fondation solide. À l\'automne, il est crucial de terminer les travaux avant les premières gelées. Planifier vos travaux tôt dans la saison vous permet d\'éviter les longs délais d\'attente.', 'Planifiez vos travaux au bon moment pour des résultats optimaux et durables.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779051622/tapavis_tenant_mtl-pavage/build_mtl-pavage_1779051622178.png', 'Saisonnier', 'Équipe MTL Pavage']
    ];
    for (const p of posts) {
      await db.run('INSERT INTO posts (title, content, excerpt, image_url, category, author) VALUES ($1,$2,$3,$4,$5,$6)', p);
    }
  }
};
