module.exports = async function(db) {
  const settings = [
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951421/tapavis_tenant_pro-transport-egauvin/build_pro-transport-egauvin_1778951421318.png'],
    ['business_name', 'Pro Transport E. Gauvin'],
    ['tagline', 'Camionnage 12 roues — Service 24/7'],
    ['hero_title', 'Transport de matériaux en vrac'],
    ['hero_subtitle', 'Terre, sable, gravier et asphalte livrés rapidement. Service professionnel 24 heures sur 24, 7 jours sur 7 à travers la région.'],
    ['hero_cta', 'Demander un devis'],
    ['about_title', 'Une expertise qui roule depuis des années'],
    ['about_text', 'Pro Transport E. Gauvin est votre partenaire de confiance pour tous vos besoins en transport de matériaux en vrac. Notre flotte de camions 12 roues bien entretenus, opérés par des chauffeurs expérimentés, garantit des livraisons ponctuelles, sécuritaires et professionnelles pour vos chantiers résidentiels, commerciaux et industriels.'],
    ['hours_title', 'Disponible 24/7'],
    ['hours_text', 'Nos camions sont disponibles 24 heures sur 24, 7 jours sur 7. Que ce soit pour une urgence de chantier ou une livraison planifiée, nous sommes prêts à répondre à votre appel à toute heure.'],
    ['contact_email', 'shelbygt500_2020_2025@outlook.com'],
    ['contact_phone', ''],
    ['business_address', ''],
    ['service_area', 'Région et environs'],
    ['footer_text', 'Camionnage professionnel — Terre, sable, gravier, asphalte. Service 24/7.']
  ];
  for (const [k, v] of settings) {
    if (k.startsWith('_p_') && v && v.indexOf('{{IMG_') === 0) {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
    } else {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
    }
  }

  const services = [
    ['Terre', 'Terre noire de qualité, terre de remblai et terre tamisée. Idéale pour aménagement paysager, nivellement de terrain et préparation de jardin. Livraison directement sur votre site selon vos besoins.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951421/tapavis_tenant_pro-transport-egauvin/build_pro-transport-egauvin_1778951421782.png', 'Sur devis selon volume', 1, 1],
    ['Sable', 'Sable de construction, sable à béton, sable de remplissage. Matériau essentiel pour vos travaux de maçonnerie, drainage et fondations. Disponible en différentes granulométries.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951428/tapavis_tenant_pro-transport-egauvin/build_pro-transport-egauvin_1778951428131.png', 'Sur devis selon volume', 1, 2],
    ['Gravier', 'Gravier concassé, gravier de drainage, pierre nette de différentes tailles (0-3/4, 3/4 net, 1\"-2\"). Parfait pour entrées, fondations, drains français et finition de chantier.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951424/tapavis_tenant_pro-transport-egauvin/build_pro-transport-egauvin_1778951424203.png', 'Sur devis selon volume', 1, 3],
    ['Asphalte', 'Transport d\'asphalte chaud et asphalte recyclé pour vos projets de pavage, réparation de routes et entrées commerciales. Livraisons coordonnées avec votre équipe de pavage.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951435/tapavis_tenant_pro-transport-egauvin/build_pro-transport-egauvin_1778951435000.png', 'Sur devis selon volume', 1, 4]
  ];
  for (const s of services) {
    await db.run('INSERT INTO services (name, description, image_url, price_info, featured, sort_order) VALUES ($1, $2, $3, $4, $5, $6)', s);
  }

  const gallery = [
    ['Livraison de gravier', 'Camion 12 roues sur chantier de construction', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951424/tapavis_tenant_pro-transport-egauvin/build_pro-transport-egauvin_1778951424229.png', 'Chantier', 1],
    ['Déchargement', 'Déchargement de gravier sur site', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951423/tapavis_tenant_pro-transport-egauvin/build_pro-transport-egauvin_1778951423536.png', 'Opération', 2],
    ['Flotte en action', 'Vue aérienne d\'un chantier desservi par notre flotte', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951421/tapavis_tenant_pro-transport-egauvin/build_pro-transport-egauvin_1778951420965.png', 'Chantier', 3],
    ['Notre flotte', 'Camion 12 roues de notre flotte professionnelle', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951421/tapavis_tenant_pro-transport-egauvin/build_pro-transport-egauvin_1778951421603.png', 'Flotte', 4]
  ];
  for (const g of gallery) {
    await db.run('INSERT INTO gallery (title, description, image_url, category, sort_order) VALUES ($1, $2, $3, $4, $5)', g);
  }

  const posts = [
    ['Service de livraison 24/7 désormais disponible', 'Nous sommes fiers d\'annoncer que Pro Transport E. Gauvin offre désormais un service de camionnage 24 heures sur 24, 7 jours sur 7. Que ce soit pour une urgence sur votre chantier ou pour des livraisons planifiées en dehors des heures normales, nous sommes là pour vous. Contactez-nous pour planifier votre prochaine livraison.', null, 'Annonce', 1],
    ['Conseils pour bien estimer le volume de matériaux', 'Avant de commander vos matériaux, il est important de bien calculer le volume nécessaire. Une verge cube équivaut à environ 0,76 mètre cube. Pour une entrée d\'auto standard de 3 mètres par 6 mètres avec 10 cm de gravier, comptez environ 1,8 mètre cube. N\'hésitez pas à nous contacter pour une estimation précise.', null, 'Conseils', 1],
    ['Différents types de gravier expliqués', 'Le 0-3/4 est idéal pour les bases compactées d\'entrée. Le 3/4 net est parfait pour les drains français car il laisse passer l\'eau. Le concassé est utilisé pour les fondations. Chaque type a son usage spécifique selon votre projet.', null, 'Conseils', 1],
    ['Préparer votre chantier pour la livraison', 'Pour une livraison efficace et sécuritaire, assurez-vous que l\'accès à votre site est dégagé. Indiquez clairement l\'endroit où vous souhaitez le matériau. Vérifiez la hauteur des fils électriques et la stabilité du sol pour supporter le poids du camion.', null, 'Conseils', 1]
  ];
  for (const p of posts) {
    await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1, $2, $3, $4, $5)', p);
  }
};