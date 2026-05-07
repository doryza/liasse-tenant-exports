module.exports = async function(db) {
  const cfg = (typeof arguments[1] === 'object' && arguments[1]) || {};
  const settings = [
    ['business_name', 'Pavage Montréal'],
    ['tagline', 'Nous réparons, nettoyons et scellons tout… Nous sommes les spécialistes du pavage depuis 1991.'],
    ['hero_title', '12 Services offerts'],
    ['hero_subtitle', 'Spécialistes du pavage depuis 1991 — Asphalte et Pavé-Uni'],
    ['pillar', 'Service, Qualité… Professionnalisme'],
    ['about_title', 'À propos de nous'],
    ['about_text', 'Pavage Montréal (Montreal Scellant Inc.) est une entreprise familiale fondée en 1991. Forts de plus de 30 ans d\'expérience, nous nous spécialisons dans l\'asphalte et le pavé-uni pour les secteurs résidentiel, commercial, industriel et municipal. Notre engagement : un service rapide, une qualité irréprochable et un professionnalisme reconnu partout dans la grande région de Montréal.'],
    ['banner_text', '30 ans d\'expérience à votre service'],
    ['contact_email', 'info@pavagemontreal.com'],
    ['contact_phone', '514-321-7325'],
    ['contact_phone_alt', '514-PAVE-UNI'],
    ['business_address', '11805 boul. Rivière-des-Prairies, Montréal (QC) H1C 1R2'],
    ['hours', 'Lundi au Samedi : 08h00 – 17h00'],
    ['facebook_url', 'https://facebook.com/pavagemontreal'],
    ['footer_text', '© Pavage Montréal — Montreal Scellant Inc. Tous droits réservés.'],
    ['cta_quote_title', 'Soumission Gratuite'],
    ['cta_quote_subtitle', 'Demandez votre estimation sans frais — réponse rapide garantie.'],
    ['value_qualite_title', 'Qualité'],
    ['value_qualite_text', 'Des matériaux supérieurs et un fini impeccable sur chaque projet, peu importe l\'envergure.'],
    ['value_service_title', 'Service'],
    ['value_service_text', 'Une équipe à l\'écoute, des délais respectés et un suivi personnalisé du début à la fin.'],
    ['value_pro_title', 'Professionnalisme'],
    ['value_pro_text', 'Plus de 30 ans d\'expertise au service des résidences, commerces, condos et municipalités.']
  ];
  for (const [k, v] of settings) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775417/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775417645.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775432/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775432100.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_banner_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775424/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775424170.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");

  const services = [
    ['unite-mobile-reparation', 'Unité mobile', 'Réparation d\'asphalte rapide', 'Notre unité mobile se déplace partout pour des réparations d\'asphalte rapides et durables, en toute saison.', 'Notre unité mobile spécialisée intervient rapidement sur votre site pour réparer nids-de-poule, fissures et zones endommagées. Solution efficace pour stationnements, voies d\'accès et infrastructures qui ne peuvent attendre.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775425/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775425802.png', 1],
    ['unite-mobile-resurfacage', 'Unité mobile', 'Resurfaçage', 'Resurfaçage professionnel sur place pour redonner vie à vos surfaces asphaltées usées.', 'Le resurfaçage prolonge la durée de vie de votre asphalte tout en restaurant son apparence. Idéal pour les surfaces présentant des signes d\'usure mais dont la base demeure solide.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775419/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775419796.png', 2],
    ['asphalte-industriel', 'Asphalte Industriel', 'Nids-de-poule', 'Réparation industrielle de nids-de-poule pour usines, entrepôts et zones de circulation lourde.', 'Surfaces soumises à des charges lourdes : nous utilisons des mélanges spécialement conçus pour résister au passage répété de camions et d\'équipement industriel.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775417/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775417499.png', 3],
    ['asphalte-commercial', 'Asphalte Commercial', 'Stationnements', 'Stationnements commerciaux clé en main : excavation, drainage, asphaltage, lignage.', 'De la planification au lignage final, nous réalisons des stationnements commerciaux durables qui valorisent votre propriété et améliorent l\'expérience client.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775428/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775428303.png', 4],
    ['asphalte-souterrain', 'Asphalte Souterrain', 'Condos et bâtiments', 'Asphalte souterrain pour stationnements de condos, immeubles à logements et bâtiments commerciaux.', 'Travaux spécialisés en milieu fermé avec ventilation contrôlée. Solutions adaptées aux contraintes des stationnements souterrains et garages d\'immeubles.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775430/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775430769.png', 5],
    ['asphalte-residentielle', 'Asphalte Résidentielle', 'Nouveau et réparation', 'Entrées résidentielles neuves ou réparées avec finition soignée et durable.', 'Que vous prépariez une nouvelle entrée ou souhaitiez restaurer l\'existante, nous offrons un fini soigné qui rehausse l\'apparence de votre propriété.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775421/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775421170.png', 6],
    ['pave-uni', 'Pavé-Uni', 'Résidentiel, Commercial, Industriel, Municipal', 'Installation experte de pavé-uni pour tous types de projets : entrées, terrasses, places publiques.', 'Spécialistes du pavé-uni depuis plus de 30 ans. Conception, choix de matériaux, installation et scellement — un travail d\'artisan pour un résultat exceptionnel.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775430/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775430172.png', 7],
    ['conception', 'Conception', 'Avant / Après', 'Service de conception et transformation : visualisez votre projet avant les travaux.', 'Notre équipe vous accompagne dans la conception de votre projet avec des visuels avant/après pour vous aider à prendre la meilleure décision.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775424/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775424542.png', 8]
  ];
  for (const [slug, title, subtitle, short_desc, long_desc, image_url, sort_order] of services) {
    await db.run('INSERT INTO services (slug, title, subtitle, short_desc, long_desc, image_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (slug) DO NOTHING', [slug, title, subtitle, short_desc, long_desc, image_url, sort_order]);
  }

  const projects = [
    ['Stationnement commercial — Anjou', 'Stationnement de 80 places refait à neuf : excavation, drainage, asphaltage et lignage.', 'asphalte-commercial', 'Anjou, Montréal', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775428/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775428303.png', 1],
    ['Réparation rapide — Boulevard Henri-Bourassa', 'Intervention d\'urgence avec notre unité mobile : 14 nids-de-poule réparés en une journée.', 'unite-mobile-reparation', 'Montréal-Nord', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775425/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775425802.png', 2],
    ['Entrée résidentielle — Rivière-des-Prairies', 'Nouvelle entrée d\'asphalte avec bordure de pavé-uni décorative.', 'asphalte-residentielle', 'Rivière-des-Prairies', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775421/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775421170.png', 3],
    ['Terrasse en pavé-uni — Laval', 'Terrasse arrière en pavé-uni avec motif circulaire et joints scellés.', 'pave-uni', 'Laval', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775430/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775430172.png', 4],
    ['Stationnement souterrain — Condos Plateau', 'Reprise complète d\'un stationnement souterrain de 3 niveaux.', 'asphalte-souterrain', 'Plateau-Mont-Royal', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775430/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775430769.png', 5],
    ['Resurfaçage industriel — Saint-Léonard', 'Resurfaçage de 4500 m² pour un site industriel à fort achalandage.', 'asphalte-industriel', 'Saint-Léonard', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775417/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775417499.png', 6],
    ['Allée commerciale — Centre commercial', 'Resurfaçage des allées d\'un centre commercial réalisé en travail de nuit.', 'unite-mobile-resurfacage', 'Pointe-aux-Trembles', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775419/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775419796.png', 7],
    ['Cour intérieure — Projet résidentiel', 'Conception complète d\'une cour avec pavé-uni, bordures et drainage intégré.', 'conception', 'Mercier-Est', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775424/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775424542.png', 8]
  ];
  for (const p of projects) {
    await db.run('INSERT INTO projects (title, description, service_slug, location, image_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6)', p);
  }

  const testimonials = [
    ['Marc Lévesque', 'Propriétaire — Résidence', 'Travail impeccable du début à la fin. L\'équipe a été ponctuelle, propre et le résultat dépasse mes attentes. Je recommande sans hésiter.', 5],
    ['Sylvie Tremblay', 'Gestionnaire d\'immeuble', 'Pavage Montréal a refait notre stationnement souterrain : organisation parfaite, communication claire avec les locataires et finition de qualité.', 5],
    ['Jean-François Boucher', 'Directeur — Industriel', 'Notre site demande une fiabilité absolue. Pavage Montréal livre toujours dans les délais et la qualité est constante depuis 8 ans.', 5],
    ['Caroline Dubé', 'Cliente résidentielle', 'Mon entrée en pavé-uni est magnifique. Les conseils en conception nous ont permis de visualiser le résultat avant même les travaux.', 5]
  ];
  for (const t of testimonials) {
    await db.run('INSERT INTO testimonials (author, role, content, rating) VALUES ($1,$2,$3,$4)', t);
  }

  const jobs = [
    ['Installateur Pavé-Uni', 'Nous recherchons un installateur expérimenté en pavé-uni pour rejoindre notre équipe. Travail varié sur des projets résidentiels, commerciaux et municipaux.', '3 ans d\'expérience minimum • Maîtrise des techniques de pose • Esprit d\'équipe • Permis de conduire valide', 'Montréal et région', 'Temps plein', null, 1],
    ['Ouvrier d\'asphalte', 'Ouvrier d\'asphalte pour travaux de pose, réparation et resurfaçage. Saison de mars à novembre.', 'Bonne forme physique • Expérience un atout • Ponctualité • Travail d\'équipe', 'Montréal', 'Temps plein saisonnier', null, 2],
    ['Chauffeur classe 1', 'Chauffeur classe 1 pour transport de matériaux et équipement entre les chantiers.', 'Permis classe 1 valide • Dossier de conduite impeccable • 2 ans d\'expérience', 'Montréal et région', 'Temps plein', null, 3],
    ['Opérateur de pelle', 'Opérateur de pelle mécanique pour préparation de sols, excavation et travaux de terrassement.', 'Carte de compétence ASP • 5 ans d\'expérience • Précision et rigueur', 'Montréal', 'Temps plein', null, 4],
    ['Mécanicien diesel', 'Mécanicien diesel pour entretien et réparation de notre flotte d\'équipements lourds.', 'DEP en mécanique • Expérience sur équipement lourd • Autonomie', 'Atelier Rivière-des-Prairies', 'Temps plein', null, 5],
    ['Vendeur', 'Représentant des ventes pour développer les relations avec une clientèle commerciale et municipale.', 'Expérience en vente B2B • Sens du service à la clientèle • Bilinguisme un atout', 'Montréal', 'Temps plein', null, 6]
  ];
  for (const j of jobs) {
    await db.run('INSERT INTO jobs (title, description, requirements, location, employment_type, image_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)', j);
  }

  const posts = [
    ['Comment prolonger la durée de vie de votre asphalte', 'Le scellement régulier de votre asphalte (tous les 2 à 3 ans) protège la surface contre les rayons UV, l\'humidité et les sels de déglaçage. Un scellement préventif coûte une fraction d\'un resurfaçage complet et peut doubler la longévité de votre stationnement.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775419/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775419796.png', 'Conseils', 1],
    ['Pavé-Uni vs Asphalte : que choisir ?', 'Le choix dépend de l\'usage, du budget et de l\'esthétique recherchée. L\'asphalte est rapide à installer et économique. Le pavé-uni offre une apparence haut de gamme et permet des réparations localisées sans casser une surface entière.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775430/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775430172.png', 'Guide', 1],
    ['Préparer votre projet pour le printemps', 'L\'automne est le moment idéal pour planifier vos travaux de pavage du printemps suivant. Contactez-nous dès maintenant pour réserver votre place dans notre calendrier de la saison.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775421/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775421170.png', 'Saison', 1],
    ['30 ans d\'expertise — Notre histoire', 'Fondée en 1991, Pavage Montréal est née d\'une passion familiale pour le travail bien fait. Trois décennies plus tard, nous demeurons fidèles aux valeurs qui nous ont menés ici : qualité, service et professionnalisme.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777775432/tapavis_tenant_pavage-montreal/build_pavage-montreal_1777775432100.png', 'Entreprise', 1]
  ];
  for (const p of posts) {
    await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1,$2,$3,$4,$5)', p);
  }
};
