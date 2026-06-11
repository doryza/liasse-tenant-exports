module.exports = async function(db, services) {
const cfg = (services && services.config) || {};
const businessName = cfg.businessName || cfg.displayName || 'Les aménagements paysagers Godard Mario';
const contactEmail = cfg.contactEmail || '';
const contactPhone = cfg.contactPhone || '';
const businessAddress = cfg.businessAddress || 'Saint-Jérôme, QC';
const seedSettings = [
['business_name', businessName],
['contact_email', contactEmail],
['contact_phone', contactPhone],
['business_address', businessAddress],
['tagline', 'Précision, qualité et passion depuis 1998'],
['hero_title', 'Aménagement paysager, excavation et déneigement'],
['hero_subtitle', 'Transformez votre terrain avec un travail soigné, durable et garanti. Service à Saint-Jérôme et dans toutes les Laurentides.'],
['about_title', 'À propos de notre entreprise'],
['about_text', 'Depuis plus de 25 ans, Les aménagements paysagers Godard Mario réalisent des projets d\'aménagement, d\'excavation et de déneigement avec un souci du détail incomparable. Notre équipe certifiée transforme vos idées en espaces extérieurs durables, fonctionnels et magnifiques.'],
['service_area_title', 'Notre zone de service'],
['service_area_subtitle', 'Nous desservons Saint-Jérôme et un rayon de 50 km autour, incluant les Laurentides.'],
['service_area_lat', '45.7811'],
['service_area_lng', '-74.0050'],
['service_area_radius', '50'],
['cta_title', 'Prêt à transformer votre terrain?'],
['cta_text', 'Demandez votre soumission gratuite ou prenez rendez-vous en quelques clics.'],
['footer_text', 'Service professionnel d\'aménagement paysager, excavation et déneigement à Saint-Jérôme et dans les Laurentides.']
];
for (const [k, v] of seedSettings) {
await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
}
await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619136/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619136315.png']);
const svcCount = (await db.get('SELECT COUNT(*) as c FROM services')).c;
if (svcCount == 0) {
const svcs = [
['Paysagement résidentiel', 'Conception et réalisation de jardins, plates-bandes, terrasses et murets.', 'Notre équipe transforme votre cour en un espace de vie extérieur unique. Conception personnalisée, choix de matériaux, plantation d\'arbres et arbustes, installation de pavé-uni, murets, escaliers et plates-bandes décoratives. Garantie de 2 ans sur tous nos travaux.', 'leaf', '#22c55e', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619133/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619133651.png', 'paysagement', 1, 1],
['Excavation', 'Travaux d\'excavation, terrassement, drainage et préparation de terrain.', 'Excavation pour fondations, piscines, drains français, travaux de drainage, terrassement et nivellement. Équipement moderne et opérateurs certifiés pour des travaux précis et sécuritaires.', 'shovel', '#78716c', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619136/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619136026.png', 'excavation', 2, 1],
['Déneigement résidentiel', 'Service de déneigement saisonnier pour résidences et commerces.', 'Forfait saisonnier complet : déneigement de l\'entrée, dégagement de l\'accès au garage, épandage de sel et abrasifs au besoin. Surveillance proactive lors des tempêtes.', 'snowflake', '#3b82f6', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619132/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619132444.png', 'deneigement', 3, 1],
['Pavé-uni et dallage', 'Installation de pavé-uni, dalles et patios pour entrées et terrasses.', 'Création d\'allées piétonnières, entrées d\'auto et terrasses en pavé-uni. Pose professionnelle avec base concassée, géotextile et joint polymère pour une durabilité maximale.', 'tool', '#22c55e', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619133/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619133155.png', 'paysagement', 4, 1],
['Murets et bordures', 'Construction de murets décoratifs, bordures et escaliers extérieurs.', 'Murets en blocs architecturaux, bordures de plates-bandes et escaliers extérieurs. Solutions esthétiques et durables pour structurer votre terrain.', 'home', '#22c55e', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619133/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619133773.png', 'paysagement', 5, 1],
['Transport en vrac', 'Livraison de terre, sable, gravier, paillis et pierre décorative.', 'Service de livraison de matériaux en vrac : terre noire, terre à jardin, sable, gravier 0-3/4, pierre concassée, paillis de cèdre et pierre décorative. Camion-benne et minicharge disponibles.', 'truck', '#78716c', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619138/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619138421.png', 'excavation', 6, 1]
];
for (const s of svcs) await db.run('INSERT INTO services (name,short_description,description,icon,color,image_url,category,display_order,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', s);
}
const tCount = (await db.get('SELECT COUNT(*) as c FROM testimonials')).c;
if (tCount == 0) {
const tests = [
['Marie Tremblay', 'Saint-Jérôme', 'Travail impeccable du début à la fin. L\'équipe a complètement transformé notre cour arrière en quelques jours. Très professionnels, ponctuels et minutieux. Je recommande sans hésiter!', 5, 1, 1],
['Pierre Lavoie', 'Mirabel', 'Mario et son équipe ont fait l\'excavation pour notre piscine creusée. Travail précis, terrain bien restauré et excellent suivi. Vrai souci du détail.', 5, 2, 1],
['Sylvie Gagnon', 'Sainte-Adèle', 'Service de déneigement fiable depuis 4 hivers. Toujours là après chaque tempête, peu importe l\'heure. Tranquillité d\'esprit garantie.', 5, 3, 1],
['Jean-François Dubé', 'Saint-Sauveur', 'Magnifique muret en pierre et nouvelle terrasse en pavé-uni. Le résultat dépasse nos attentes. Prix très compétitif pour la qualité du travail.', 5, 4, 1],
['Caroline Bergeron', 'Saint-Jérôme', 'Aménagement complet de notre devanture avec plates-bandes et arbustes. L\'équipe est passionnée et le résultat est superbe. Merci!', 5, 5, 1],
['Robert Caron', 'Prévost', 'Drain français installé avec professionnalisme. Aucune infiltration depuis. Service rapide et explications claires à chaque étape.', 5, 6, 1]
];
for (const t of tests) await db.run('INSERT INTO testimonials (author,role,content,rating,display_order,published) VALUES ($1,$2,$3,$4,$5,$6)', t);
}
const gCount = (await db.get('SELECT COUNT(*) as c FROM gallery')).c;
if (gCount == 0) {
const gals = [
['Aménagement complet — Cour arrière', 'Transformation complète d\'une cour arrière avec terrasse en pavé-uni, plates-bandes et muret décoratif.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619137/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619137633.png', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619151/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619151277.png', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619151/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619151277.png', 'paysagement', 1],
['Entrée d\'auto en pavé-uni', 'Remplacement d\'une entrée d\'asphalte par une entrée en pavé-uni avec bordure assortie.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619141/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619141533.png', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619136/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619136064.png', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619136/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619136064.png', 'paysagement', 1],
['Excavation pour piscine creusée', 'Excavation, terrassement et préparation du site pour l\'installation d\'une piscine creusée.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619133/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619133672.png', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619133/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619133093.png', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619133/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619133093.png', 'excavation', 1],
['Plates-bandes et arbustes', 'Création de plates-bandes structurées avec sélection d\'arbustes ornementaux et paillis de cèdre.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619139/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619139723.png', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619135/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619135725.png', 'https://res.cloudinary.com/duhp69meg/image/upload/v1777619135/tapavis_tenant_ammenagementpaysager_gm/build_ammenagementpaysager_gm_1777619135725.png', 'paysagement', 1]
];
for (const g of gals) await db.run('INSERT INTO gallery (title,description,before_image_url,after_image_url,image_url,category,published) VALUES ($1,$2,$3,$4,$5,$6,$7)', g);
}
const cCount = (await db.get('SELECT COUNT(*) as c FROM certifications')).c;
if (cCount == 0) {
const certs = [
['RBQ — Régie du bâtiment du Québec', 'Licence d\'entrepreneur en construction', 1],
['CNESST', 'Conformité en santé et sécurité du travail', 1],
['APPQ', 'Membre de l\'Association des paysagistes professionnels du Québec', 1],
['Garantie écrite', 'Garantie écrite de 2 ans sur tous nos travaux', 1]
];
for (const c of certs) await db.run('INSERT INTO certifications (name,description,active) VALUES ($1,$2,$3)', c);
}
const pCount = (await db.get('SELECT COUNT(*) as c FROM posts')).c;
if (pCount == 0) {
const posts = [
['Préparer son terrain pour le printemps', 'Le printemps est la saison idéale pour redonner vie à votre terrain. Voici nos conseils pour bien démarrer la saison.\n\nNettoyage des plates-bandes, taille des arbustes, fertilisation de la pelouse et inspection du système de drainage : autant d\'étapes essentielles pour garantir un beau jardin tout l\'été. Notre équipe peut vous accompagner à chaque étape.', 'Conseils pour bien démarrer votre saison de jardinage avec un terrain en santé.', '{{IMG_POST1}}', 'Conseils', 1],
['Pourquoi choisir le pavé-uni?', 'Le pavé-uni offre une durabilité, une esthétique et une polyvalence inégalées pour vos entrées d\'auto, terrasses et allées.\n\nContrairement à l\'asphalte ou au béton coulé, le pavé-uni se répare facilement, résiste aux cycles de gel-dégel québécois et offre des possibilités décoratives infinies. Avec une installation professionnelle, votre pavé peut durer 30 ans et plus.', 'Découvrez les avantages du pavé-uni pour vos projets extérieurs.', '{{IMG_POST2}}', 'Projets', 1],
['Préparer son entrée pour l\'hiver', 'Avant les premières neiges, quelques préparatifs simples peuvent faire toute la différence pour un déneigement efficace.\n\nMarquez clairement les bordures de votre entrée avec des balises, dégagez les zones autour des bornes-fontaines et boîtes aux lettres, et vérifiez le drainage de votre terrain. Réservez votre forfait de déneigement avant le 15 octobre pour les meilleurs tarifs.', 'Conseils pratiques pour préparer votre entrée et votre terrain avant l\'hiver.', '{{IMG_POST3}}', 'Saison', 1]
];
for (const p of posts) await db.run('INSERT INTO posts (title,content,excerpt,image_url,category,published) VALUES ($1,$2,$3,$4,$5,$6)', p);
}
};