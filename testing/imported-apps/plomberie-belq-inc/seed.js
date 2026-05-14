module.exports = async function(db) {
  const settings = [
    ['business_name', 'Plomberie Belq Inc'],
    ['tagline_fr', 'Plomberie résidentielle et commerciale — service rapide 24/7'],
    ['tagline_en', 'Residential and commercial plumbing — fast 24/7 service'],
    ['hero_title_fr', 'Plomberie de confiance, 24/7'],
    ['hero_title_en', 'Plumbing You Can Trust, 24/7'],
    ['hero_subtitle_fr', 'Service rapide, travail garanti, prix transparents.'],
    ['hero_subtitle_en', 'Fast service, guaranteed work, transparent pricing.'],
    ['about_text_fr', 'Plomberie Belq Inc dessert la région depuis des années. Notre équipe de plombiers certifiés intervient pour les urgences, l\'entretien et les rénovations, autant en résidentiel qu\'en commercial.'],
    ['about_text_en', 'Plomberie Belq Inc has served the region for years. Our certified plumbers handle emergencies, maintenance, and renovations for residential and commercial customers alike.'],
    ['hours_fr', 'Lundi au vendredi : 7h00 — 18h00\nSamedi : 8h00 — 16h00\nDimanche : urgences seulement\nUrgences 24/7 disponibles'],
    ['hours_en', 'Monday to Friday: 7:00 AM — 6:00 PM\nSaturday: 8:00 AM — 4:00 PM\nSunday: emergencies only\n24/7 emergency service available']
  ];
  for (const [k, v] of settings) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }

  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778784343/tapavis_tenant_plomberie-belq-inc/build_plomberie-belq-inc_1778784343452.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");

  const sc = await db.get('SELECT COUNT(*)::int AS c FROM services');
  if (!sc || sc.c === 0) {
    const items = [
      ['Plomberie d\'urgence 24/7', '24/7 Emergency Plumbing', 'Fuites, dégâts d\'eau, bouchons soudains — intervention rapide jour et nuit, partout dans votre secteur.', 'Leaks, water damage, sudden clogs — fast intervention day and night, anywhere in your area.', '🚨', 'À partir de 150$', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778784320/tapavis_tenant_plomberie-belq-inc/build_plomberie-belq-inc_1778784320136.png', 1, 1],
      ['Débouchage de drains', 'Drain Cleaning', 'Débouchage des éviers, toilettes, baignoires et drains principaux avec équipement professionnel et caméra.', 'Unclogging sinks, toilets, bathtubs and main drains with professional equipment and camera inspection.', '🌀', 'À partir de 125$', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778784346/tapavis_tenant_plomberie-belq-inc/build_plomberie-belq-inc_1778784345913.png', 1, 2],
      ['Chauffe-eau', 'Water Heaters', 'Installation, réparation et remplacement de chauffe-eau électriques et au gaz, toutes marques.', 'Installation, repair, and replacement of electric and gas water heaters, all brands.', '🔥', 'Devis gratuit', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778784332/tapavis_tenant_plomberie-belq-inc/build_plomberie-belq-inc_1778784332282.png', 1, 3],
      ['Rénovation salle de bain', 'Bathroom Renovation', 'Rénovation complète : plomberie, robinetterie, baignoires, douches et toilettes neuves.', 'Complete bathroom renovations: plumbing, fixtures, bathtubs, showers and new toilets.', '🚿', 'Devis gratuit', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778784339/tapavis_tenant_plomberie-belq-inc/build_plomberie-belq-inc_1778784339705.png', 1, 4],
      ['Inspection caméra', 'Camera Inspection', 'Inspection caméra des canalisations pour détecter racines, fissures et obstructions avant qu\'elles n\'empirent.', 'Camera inspection of pipes to detect roots, cracks and obstructions before they get worse.', '📹', 'À partir de 200$', '', 0, 5],
      ['Détection de fuites', 'Leak Detection', 'Localisation précise des fuites cachées dans les murs, planchers et conduites principales — sans démolition.', 'Precise location of hidden leaks in walls, floors and main lines — without demolition.', '💧', 'À partir de 175$', '', 0, 6]
    ];
    for (const s of items) {
      await db.run('INSERT INTO services (name_fr, name_en, description_fr, description_en, icon, price_range, image_url, featured, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', s);
    }
  }

  const pc = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (!pc || pc.c === 0) {
    const items = [
      ['5 signes que vos drains demandent de l\'attention', '5 Signs Your Drains Need Attention', 'Un évier qui se vide lentement, des odeurs persistantes, des bruits de glouglou dans les tuyaux — votre plomberie essaie de vous parler. Voici cinq signes à ne jamais ignorer.\n\nUn drain qui ralentit est souvent le premier indice d\'un bouchon en formation. N\'attendez pas qu\'il soit complètement bloqué pour agir, car un débouchage préventif coûte beaucoup moins cher qu\'un dégât d\'eau.\n\nLes odeurs qui remontent indiquent souvent une accumulation organique dans la tuyauterie ou un siphon asséché. Quant aux bruits de glouglou, ils signalent un problème de ventilation dans le réseau de plomberie.', 'A slow-draining sink, persistent smells, gurgling sounds in pipes — your plumbing is trying to tell you something. Here are five signs you should never ignore.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778784316/tapavis_tenant_plomberie-belq-inc/build_plomberie-belq-inc_1778784316631.png', 'Conseils', 1],
      ['Comment éviter les dégâts d\'eau cet hiver', 'How to Prevent Water Damage This Winter', 'L\'hiver québécois met vos tuyaux à rude épreuve. Voici nos meilleurs conseils pour éviter le gel des canalisations et les dégâts d\'eau coûteux qui s\'ensuivent.\n\nIsolez tous les tuyaux exposés dans le sous-sol, le grenier et les murs extérieurs. Lors des vagues de froid extrême, laissez couler un mince filet d\'eau froide et chaude pour empêcher le gel. Fermez l\'arrivée d\'eau extérieure et purgez les boyaux d\'arrosage avant le premier gel.', 'Quebec winters put your pipes to the test. Here are our best tips to prevent frozen pipes and the costly water damage that follows.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778784324/tapavis_tenant_plomberie-belq-inc/build_plomberie-belq-inc_1778784324598.png', 'Conseils', 1],
      ['Quand faut-il remplacer son chauffe-eau?', 'When Should You Replace Your Water Heater?', 'La plupart des chauffe-eau résidentiels durent entre 8 et 12 ans. Si le vôtre approche cet âge ou présente des symptômes inquiétants (eau rouille, claquements, fuites à la base), il est temps d\'envisager le remplacement avant la catastrophe.\n\nUn chauffe-eau qui fuit peut causer en quelques heures des milliers de dollars de dégâts d\'eau. Mieux vaut prévenir que guérir.', 'Most residential water heaters last between 8 and 12 years. If yours is approaching that age or showing warning signs, it\'s time to consider replacement.', '', 'Nouvelles', 1],
      ['Pourquoi choisir un plombier certifié', 'Why Choose a Certified Plumber', 'Faire affaire avec un plombier certifié, c\'est l\'assurance d\'un travail conforme au Code de construction, couvert par une garantie écrite, et exécuté par un professionnel formé. Voici pourquoi la certification fait toute la différence pour vos travaux de plomberie.', 'Hiring a certified plumber means guaranteed code-compliant work, written warranty coverage, and a trained professional on the job. Here\'s why certification makes all the difference.', '', 'Conseils', 1]
    ];
    for (const p of items) {
      await db.run('INSERT INTO posts (title_fr, title_en, content_fr, content_en, image_url, category, published) VALUES ($1,$2,$3,$4,$5,$6,$7)', p);
    }
  }
};
