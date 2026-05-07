module.exports = async function(db) {
  const config = arguments[1] || {};
  const ownerEmail = config.contactEmail || 'pavement@liasse.tech';
  const ownerPhone = config.contactPhone || '';
  const businessName = config.businessName || config.displayName || 'Pavage Depot';
  const businessAddress = config.businessAddress || '';

  const settings = [
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444528/tapavis_tenant_pavement/build_pavement_1777444528718.png'],
    ['business_name', businessName],
    ['tagline_fr', 'Pavage résidentiel de qualité au Québec'],
    ['tagline_en', 'Quality residential paving in Quebec'],
    ['hero_title_fr', 'L\'expertise du pavage à votre porte'],
    ['hero_title_en', 'Paving expertise at your doorstep'],
    ['hero_subtitle_fr', 'Plus de 20 ans d\'expérience à transformer les entrées de cour des Québécois. Soumission gratuite, travail garanti.'],
    ['hero_subtitle_en', 'Over 20 years transforming Quebec driveways. Free quotes, guaranteed work.'],
    ['hero_cta_fr', 'Demander une soumission'],
    ['hero_cta_en', 'Request a quote'],
    ['about_title_fr', 'Notre histoire'],
    ['about_title_en', 'Our story'],
    ['about_text_fr', 'Pavage Depot est une entreprise familiale québécoise spécialisée dans le pavage résidentiel depuis plus de deux décennies. Nous traitons chaque projet comme s\'il s\'agissait de notre propre entrée de cour : avec soin, précision et fierté du travail bien fait. Nos équipes utilisent uniquement de l\'asphalte de première qualité, conçu pour résister aux hivers rigoureux du Québec.'],
    ['about_text_en', 'Pavage Depot is a family-owned Quebec business specializing in residential paving for over two decades. We treat every project like it\'s our own driveway: with care, precision, and pride in the work. Our crews use only top-quality asphalt designed to withstand harsh Quebec winters.'],
    ['why_us_title_fr', 'Pourquoi nous choisir'],
    ['why_us_title_en', 'Why choose us'],
    ['contact_email', ownerEmail],
    ['contact_phone', ownerPhone || '1-800-PAVAGE-1'],
    ['business_address', businessAddress || 'Région du Grand Montréal, QC'],
    ['service_area_fr', 'Grand Montréal, Laval, Rive-Sud, Rive-Nord, Laurentides'],
    ['service_area_en', 'Greater Montreal, Laval, South Shore, North Shore, Laurentians'],
    ['guarantee_text_fr', 'Garantie de 5 ans sur tous nos travaux de pavage'],
    ['guarantee_text_en', '5-year warranty on all our paving work'],
    ['footer_text_fr', '© Pavage Depot. Tous droits réservés.'],
    ['footer_text_en', '© Pavage Depot. All rights reserved.']
  ];
  for (const [k, v] of settings) {
    if (k.endsWith('_image_url') || k.startsWith('_p_')) {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
    } else {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
    }
  }

  const services = [
    ['Pavage neuf', 'New paving', 'Installation complète d\'une nouvelle entrée de cour en asphalte. Préparation du sol, base de pierre concassée, et pavage professionnel avec finition impeccable.', 'Complete installation of a new asphalt driveway. Soil preparation, crushed stone base, and professional paving with flawless finish.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444531/tapavis_tenant_pavement/build_pavement_1777444530920.png', 'à partir de 4,50$/pi²', 1, 1],
    ['Réparation et resurfaçage', 'Repair and resurfacing', 'Vous avez des fissures, nids-de-poule ou affaissements? Nous redonnons vie à votre entrée de cour existante avec une nouvelle couche d\'asphalte.', 'Cracks, potholes or sinking? We bring your existing driveway back to life with a new layer of asphalt.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444517/tapavis_tenant_pavement/build_pavement_1777444517742.png', 'à partir de 2,75$/pi²', 1, 2],
    ['Scellement (sealcoating)', 'Sealcoating', 'Protégez votre investissement avec un scellant de qualité commerciale. Recommandé tous les 2-3 ans pour prolonger la durée de vie de votre asphalte.', 'Protect your investment with commercial-grade sealant. Recommended every 2-3 years to extend asphalt lifespan.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444519/tapavis_tenant_pavement/build_pavement_1777444519858.png', 'à partir de 0,40$/pi²', 1, 3],
    ['Excavation et drainage', 'Excavation and drainage', 'Service complet d\'excavation pour les nouveaux projets et solutions de drainage pour éviter l\'accumulation d\'eau sur votre entrée.', 'Full excavation service for new projects and drainage solutions to prevent water accumulation on your driveway.', '', 'devis personnalisé', 0, 4]
  ];
  for (const s of services) {
    await db.run('INSERT INTO services (name, name_en, description, description_en, image_url, price_from, featured, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', s);
  }

  const gallery = [
    ['Entrée résidentielle - Brossard', 'Residential driveway - Brossard', 'Pavage neuf avec bordures décoratives. 1200 pi² de surface.', 'New paving with decorative borders. 1200 sq ft surface.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444525/tapavis_tenant_pavement/build_pavement_1777444525475.png', 'Brossard, QC', 2024, 1],
    ['Allée circulaire - Laval', 'Circular driveway - Laval', 'Allée circulaire avec finition haut de gamme pour résidence luxueuse.', 'Circular driveway with premium finish for luxury home.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444526/tapavis_tenant_pavement/build_pavement_1777444526211.png', 'Laval, QC', 2024, 2],
    ['Entrée en pente - Saint-Bruno', 'Sloped driveway - Saint-Bruno', 'Solution de pavage avec drainage adapté pour pente prononcée.', 'Paving solution with adapted drainage for steep slope.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444522/tapavis_tenant_pavement/build_pavement_1777444522462.png', 'Saint-Bruno, QC', 2023, 3],
    ['Long chemin privé - Mont-Saint-Hilaire', 'Long private road - Mont-Saint-Hilaire', 'Pavage de 80 mètres pour résidence champêtre. Travail sur 3 jours.', '80m paving for country home. 3-day project.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444523/tapavis_tenant_pavement/build_pavement_1777444523113.png', 'Mont-Saint-Hilaire, QC', 2023, 4],
    ['Resurfaçage - Longueuil', 'Resurfacing - Longueuil', 'Resurfaçage complet d\'une entrée de 25 ans. Comme neuve!', 'Complete resurfacing of a 25-year-old driveway. Like new!', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444525/tapavis_tenant_pavement/build_pavement_1777444525475.png', 'Longueuil, QC', 2024, 5],
    ['Scellement - Boucherville', 'Sealcoating - Boucherville', 'Application de scellant après 2 ans pour protéger l\'investissement.', 'Sealant application after 2 years to protect the investment.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444526/tapavis_tenant_pavement/build_pavement_1777444526211.png', 'Boucherville, QC', 2024, 6]
  ];
  for (const g of gallery) {
    await db.run('INSERT INTO gallery (title, title_en, description, description_en, image_url, location, project_year, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', g);
  }

  const testimonials = [
    ['Marie-Claude Tremblay', 'Brossard', 'Service exceptionnel du début à la fin. L\'équipe était professionnelle, ponctuelle et le résultat dépasse mes attentes. Notre entrée a l\'air neuve et le prix était très juste.', 'Exceptional service from start to finish. The team was professional, punctual and the result exceeds my expectations. Our driveway looks new and the price was very fair.', 5, ''],
    ['Jean-François Bouchard', 'Laval', 'Pavage Depot a fait notre entrée circulaire l\'été dernier. Deux ans plus tard, aucune fissure, aucun problème. Je les recommande sans hésitation à mes voisins.', 'Pavage Depot did our circular driveway last summer. Two years later, no cracks, no problems. I recommend them without hesitation to my neighbors.', 5, ''],
    ['Sylvie Pelletier', 'Saint-Bruno', 'Soumission claire, prix honnête, travail soigné. Ils ont géré le drainage de notre entrée en pente comme des pros. Très satisfaite!', 'Clear quote, honest price, careful work. They handled the drainage on our sloped driveway like pros. Very satisfied!', 5, ''],
    ['Robert Gagnon', 'Boucherville', 'Cinquième fois que je fais affaire avec eux pour différents projets. Toujours impeccable. Une vraie entreprise de confiance.', 'Fifth time I\'ve worked with them on different projects. Always impeccable. A truly trustworthy company.', 5, '']
  ];
  for (const t of testimonials) {
    await db.run('INSERT INTO testimonials (author, location, content, content_en, rating, image_url, published) VALUES ($1,$2,$3,$4,$5,$6,1)', t);
  }

  const posts = [
    ['Quand faire paver son entrée au Québec?', 'When to pave your driveway in Quebec?', 'La meilleure saison pour le pavage au Québec s\'étend de mai à octobre. Les températures douces permettent à l\'asphalte de se compacter correctement. Évitez les périodes de pluie prolongées et les fortes chaleurs. Notre équipe peut vous conseiller sur le moment idéal pour votre projet.', 'The best season for paving in Quebec runs from May to October. Mild temperatures allow asphalt to compact properly. Avoid prolonged rainy periods and extreme heat. Our team can advise you on the ideal time for your project.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444525/tapavis_tenant_pavement/build_pavement_1777444525475.png', 'Conseils', 1],
    ['L\'importance du scellement', 'The importance of sealcoating', 'Le scellement protège votre asphalte des UV, du sel de déglaçage et de l\'humidité. Un scellement appliqué tous les 2-3 ans peut doubler la durée de vie de votre entrée. C\'est l\'investissement le plus rentable en entretien d\'asphalte.', 'Sealcoating protects your asphalt from UV rays, de-icing salt and moisture. A sealcoat applied every 2-3 years can double the life of your driveway. It\'s the most cost-effective investment in asphalt maintenance.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444519/tapavis_tenant_pavement/build_pavement_1777444519858.png', 'Entretien', 1],
    ['Pavage neuf vs resurfaçage: que choisir?', 'New paving vs resurfacing: which to choose?', 'Si votre base est solide et qu\'il n\'y a pas d\'affaissement majeur, le resurfaçage est souvent la solution idéale. Pour une entrée de plus de 25 ans ou présentant des problèmes structurels, le pavage neuf est recommandé. Notre équipe évalue gratuitement votre situation.', 'If your base is solid with no major sinking, resurfacing is often the ideal solution. For a driveway over 25 years old or with structural issues, new paving is recommended. Our team assesses your situation for free.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444522/tapavis_tenant_pavement/build_pavement_1777444522462.png', 'Conseils', 1],
    ['Garantie 5 ans: notre engagement', '5-year warranty: our commitment', 'Tous nos travaux de pavage neuf sont couverts par une garantie de 5 ans. Cela inclut les défauts de fabrication, les fissures prématurées et les problèmes de compactage. La preuve de notre confiance dans la qualité de notre travail.', 'All our new paving work is covered by a 5-year warranty. This includes manufacturing defects, premature cracks and compaction issues. Proof of our confidence in the quality of our work.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777444528/tapavis_tenant_pavement/build_pavement_1777444528718.png', 'À propos', 1]
  ];
  for (const p of posts) {
    await db.run('INSERT INTO posts (title, title_en, content, content_en, image_url, category, published) VALUES ($1,$2,$3,$4,$5,$6,$7)', p);
  }
};