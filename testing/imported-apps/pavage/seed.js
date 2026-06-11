module.exports = async function(db) {
  const config = global.__tenantConfig || {};
  const settings = [
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159108/pavage/site/hero_1781159107017.png'],
    ['business_name', 'Pavage Pro Québec'],
    ['primary_color', '#0E6B63'],
    ['tagline_fr', "L'excellence en pavage résidentiel"],
    ['tagline_en', 'Excellence in residential paving'],
    ['hero_title_fr', 'Transformez votre propriété avec un pavage de qualité supérieure'],
    ['hero_title_en', 'Transform your property with premium paving'],
    ['hero_subtitle_fr', 'Plus de 20 ans d’expertise au service des propriétaires québécois. Devis gratuit, garantie 10 ans.'],
    ['hero_subtitle_en', 'Over 20 years of expertise serving Quebec homeowners. Free quote, 10-year warranty.'],
    ['about_title_fr', 'Notre histoire'],
    ['about_title_en', 'Our story'],
    ['about_text_fr', 'Depuis plus de deux décennies, Pavage Pro Québec se distingue par son savoir-faire artisanal, ses matériaux de première qualité et son engagement envers la satisfaction client. Notre équipe certifiée transforme entrées, patios et allées en véritables œuvres d’art durables, conçues pour résister aux rigueurs des hivers québécois.'],
    ['about_text_en', 'For over two decades, Pavage Pro Québec has set itself apart through artisanal craftsmanship, premium materials, and an unwavering commitment to customer satisfaction. Our certified team transforms driveways, patios, and walkways into durable works of art, built to withstand harsh Quebec winters.'],
    ['stat_years_fr', '20+ ans d’expérience'],
    ['stat_years_en', '20+ years of experience'],
    ['stat_projects_fr', '2500+ projets réalisés'],
    ['stat_projects_en', '2500+ completed projects'],
    ['stat_warranty_fr', 'Garantie 10 ans'],
    ['stat_warranty_en', '10-year warranty'],
    ['stat_satisfaction_fr', '98% clients satisfaits'],
    ['stat_satisfaction_en', '98% client satisfaction'],
    ['cta_title_fr', 'Prêt à transformer votre propriété ?'],
    ['cta_title_en', 'Ready to transform your property?'],
    ['cta_subtitle_fr', 'Demandez votre soumission gratuite dès aujourd’hui'],
    ['cta_subtitle_en', 'Request your free quote today'],
    ['contact_email', config.contactEmail || 'pavage@liasse.tech'],
    ['contact_phone', config.contactPhone || '+1 514 555 0199'],
    ['business_address', config.businessAddress || 'Montréal, Québec, Canada'],
    ['hours_fr', 'Lun-Ven 7h-18h | Sam 8h-15h'],
    ['hours_en', 'Mon-Fri 7am-6pm | Sat 8am-3pm'],
    ['social_facebook', 'https://facebook.com'],
    ['social_instagram', 'https://instagram.com'],
    ['social_linkedin', 'https://linkedin.com'],
    ['social_youtube', 'https://youtube.com']
  ];
  for (const [k, v] of settings) {
    if (k.startsWith('_p_') || k.includes('image_url')) {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
    } else {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
    }
  }
  const projectCount = await db.get('SELECT COUNT(*) AS c FROM projects');
  if (Number(projectCount.c) === 0) {
    const projects = [
      ['Entrée à motif chevron - Westmount', 'Magnifique entrée résidentielle de 250 m² avec pavés autobloquants en motif chevron. Bordures décoratives et drainage optimisé.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159107/pavage/projects/proj_chevron_westmount_1781159105824.png', 'driveway', 'Westmount, QC', '2024-09-15', 1],
      ['Patio arrière de luxe - Laval', 'Aménagement complet d’un patio de 80 m² avec pavés de pierre naturelle, foyer extérieur intégré et éclairage paysager.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159107/pavage/projects/proj_patio_laval_1781159106254.png', 'patio', 'Laval, QC', '2024-08-20', 1],
      ['Asphaltage résidentiel - Brossard', 'Asphaltage complet d’une entrée double de 180 m² avec finition lisse, scellant haute qualité et bordures béton.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159107/pavage/projects/proj_asphalte_brossard_1781159105339.png', 'asphalt', 'Brossard, QC', '2024-07-10', 1],
      ['Allée de jardin - Outremont', 'Création d’une allée sinueuse en pavés de pierre naturelle reliant la rue à l’entrée principale. 45 m linéaires.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159118/pavage/projects/proj_allee_outremont_1781159116627.png', 'walkway', 'Outremont, QC', '2024-06-25', 1],
      ['Terrasse de piscine - Saint-Lambert', 'Aménagement d’une terrasse de piscine moderne en pavés grand format. Surface antidérapante et résistante au chlore.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159119/pavage/projects/proj_piscine_stlambert_1781159117561.png', 'patio', 'Saint-Lambert, QC', '2024-05-30', 1],
      ['Entrée circulaire - Mont-Royal', 'Entrée circulaire prestigieuse de 320 m² avec bordure décorative et fontaine centrale. Pavés haut de gamme.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159118/pavage/projects/proj_circulaire_montroyal_1781159117382.png', 'driveway', 'Mont-Royal, QC', '2024-09-05', 1]
    ];
    for (const p of projects) {
      await db.run('INSERT INTO projects (title, description, image_url, category, location, completed_date, featured) VALUES ($1, $2, $3, $4, $5, $6, $7)', p);
    }
  }
  const serviceCount = await db.get('SELECT COUNT(*) AS c FROM services');
  if (Number(serviceCount.c) === 0) {
    const svc = [
      ['Pavés autobloquants', 'Installation professionnelle de pavés autobloquants pour entrées, patios et allées. Large choix de couleurs et motifs.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159118/pavage/services/svc_paves_1781159116505.png', 'grid', '85$ - 150$ / m²', 1, 1],
      ['Asphaltage', 'Asphaltage neuf et resurfaçage de qualité supérieure pour entrées résidentielles. Finition impeccable.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159128/pavage/services/svc_asphalte_1781159126066.png', 'truck', '12$ - 20$ / m²', 1, 2],
      ['Pierre naturelle', 'Aménagement haut de gamme avec pierres naturelles québécoises. Esthétique unique et durable.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159131/pavage/services/svc_pierre_1781159128494.png', 'mountain', '120$ - 250$ / m²', 1, 3],
      ['Réparation et scellement', 'Réparation de fissures, nivellement et application de scellant pour prolonger la durée de vie de votre pavage.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159132/pavage/services/svc_reparation_1781159129861.png', 'wrench', 'Sur devis', 0, 4],
      ['Bordures et finitions', 'Installation de bordures béton, drainage et finitions décoratives pour parfaire votre projet.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159131/pavage/services/svc_bordures_1781159128550.png', 'ruler', 'Sur devis', 0, 5],
      ['Aménagement complet', 'Service clé en main : conception, excavation, drainage, pavage et aménagement paysager.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159139/pavage/services/svc_amenagement_1781159137053.png', 'home', 'Sur devis', 1, 6]
    ];
    for (const s of svc) {
      await db.run('INSERT INTO services (name, description, image_url, icon, price_range, featured, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)', s);
    }
  }
  const testCount = await db.get('SELECT COUNT(*) AS c FROM testimonials');
  if (Number(testCount.c) === 0) {
    const tests = [
      ['Marie-Claude Dubois', 'Westmount, QC', 'Travail exceptionnel ! L’équipe de Pavage Pro a transformé notre entrée en quelques jours. Le résultat dépasse nos attentes. Hautement recommandé.', 5],
      ['Jean-François Tremblay', 'Laval, QC', 'Service professionnel du début à la fin. Le devis était précis, les délais respectés et la qualité du travail est remarquable. Notre patio est magnifique.', 5],
      ['Sophie Lavoie', 'Brossard, QC', 'Trois ans après l’installation, notre entrée pavée est encore comme neuve. La garantie 10 ans nous donne une grande tranquillité d’esprit.', 5],
      ['Robert Côté', 'Outremont, QC', 'Une équipe à l’écoute, des conseils judicieux et un travail soigné. C’est rare de trouver une entreprise aussi fiable au Québec. Bravo !', 5],
      ['Isabelle Gagnon', 'Mont-Royal, QC', 'Notre entrée circulaire est devenue le joyau du quartier. L’attention aux détails et la qualité des matériaux sont impressionnantes.', 5],
      ['Michel Bergeron', 'Saint-Lambert, QC', 'Excellente expérience. L’équipe a su gérer un terrain complexe avec professionnalisme. Le drainage fonctionne à merveille.', 5]
    ];
    for (const t of tests) {
      await db.run('INSERT INTO testimonials (author, location, content, rating, featured) VALUES ($1, $2, $3, $4, 1)', t);
    }
  }
  const postCount = await db.get('SELECT COUNT(*) AS c FROM posts');
  if (Number(postCount.c) === 0) {
    const posts = [
      ['Comment choisir le bon type de pavage pour votre propriété', 'Le choix du pavage dépend de plusieurs facteurs : esthétique, budget, durabilité et entretien. Les pavés autobloquants offrent une grande flexibilité de design, tandis que l’asphalte est économique et rapide à installer. La pierre naturelle, plus coûteuse, ajoute un cachet unique. Notre équipe vous conseille la meilleure option selon votre projet.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159139/pavage/posts/post_choisir_1781159137466.png', 'Conseils', 1],
      ['Préparer votre pavage pour l’hiver québécois', 'Les hivers québécois sont rigoureux. Pour préserver votre pavage : appliquez un scellant à l’automne, évitez les sels de déglaçage corrosifs, dégagez la neige avec une pelle en plastique et faites inspecter les fissures dès le printemps. Un entretien préventif prolonge la durée de vie de votre investissement.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159144/pavage/posts/post_hiver_1781159141950.png', 'Entretien', 1],
      ['Tendances 2024 en aménagement paysager', 'Cette année, les grands formats de pavés, les motifs géométriques et les couleurs naturelles dominent. Les terrasses extérieures avec foyer intégré et éclairage encastré gagnent en popularité. Pavage Pro Québec vous accompagne dans la création d’espaces extérieurs modernes et durables.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159141/pavage/posts/post_tendances_1781159139275.png', 'Tendances', 1],
      ['L’importance d’un bon drainage', 'Un drainage adéquat est essentiel pour éviter l’accumulation d’eau, le gel-dégel et les déformations. Notre équipe analyse la pente du terrain, installe les drains français nécessaires et garantit une évacuation optimale. Ne négligez jamais cette étape cruciale.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781159143/pavage/posts/post_drainage_1781159141903.png', 'Conseils', 1]
    ];
    for (const p of posts) {
      await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1, $2, $3, $4, $5)', p);
    }
  }
};