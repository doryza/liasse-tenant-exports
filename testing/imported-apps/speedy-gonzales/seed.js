module.exports = async function(db) {
  const settings = [
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778991712/tapavis_tenant_speedy-gonzales/build_speedy-gonzales_1778991712855.png'],
    ['hero_title_fr', 'Livraison rapide à Montréal et Laval'],
    ['hero_title_en', 'Fast delivery across Montreal and Laval'],
    ['hero_subtitle_fr', 'Service de courrier dédié aux entreprises. Express, jour même ou jour suivant — vous choisissez.'],
    ['hero_subtitle_en', 'Business courier service. Express, same day or next day — your choice.'],
    ['tagline_fr', 'Le service de courrier dont votre entreprise a besoin'],
    ['tagline_en', 'The courier service your business needs'],
    ['about_title_fr', 'Une équipe locale, un service personnalisé'],
    ['about_title_en', 'A local team, personalized service'],
    ['about_text_fr', 'Speedy Gonzales est un service de courrier indépendant basé à Montréal. Nous desservons l\'ensemble du Grand Montréal incluant Laval et les couronnes nord et sud. Notre flotte de coursiers à vélo, scooter et fourgonnette est prête à répondre aux besoins logistiques de votre entreprise, qu\'il s\'agisse d\'une livraison urgente d\'un document ou d\'un envoi de plusieurs colis volumineux.'],
    ['about_text_en', 'Speedy Gonzales is an independent courier service based in Montreal. We serve the entire Greater Montreal area including Laval and the north and south shores. Our fleet of bike, scooter and van couriers stands ready to handle your business logistics, from an urgent document to a multi-parcel shipment.'],
    ['service_area_fr', 'Grand Montréal, Laval, Rive-Sud, Rive-Nord'],
    ['service_area_en', 'Greater Montreal, Laval, South Shore, North Shore'],
    ['contact_email', (await getCfg('contactEmail')) || 'dory@liasse.tech'],
    ['contact_phone', '514-555-0199'],
    ['business_name', 'Speedy Gonzales'],
    ['business_address', 'Montréal, Québec, Canada'],
    ['footer_text_fr', 'Service de courrier pour entreprises — Grand Montréal'],
    ['footer_text_en', 'Business courier service — Greater Montreal']
  ];
  async function getCfg(k) { return null; }
  for (const [k, v] of settings) {
    if (k === '_p_hero_image_url') {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
    } else {
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
    }
  }

  const rates = [
    ['express', 'Express', 'Express', 25, 3.50, '14:00', 'Livraison en moins de 2 heures, peu importe l\'heure de la commande avant 14h. Idéal pour les documents urgents et les pièces critiques.', 'Delivered in under 2 hours when ordered before 2 PM. Perfect for urgent documents and critical parts.'],
    ['same_day', 'Jour même', 'Same Day', 15, 2.25, '11:00', 'Ramassage et livraison le jour même pour les commandes passées avant 11h. Économique pour les envois non urgents qui doivent être livrés aujourd\'hui.', 'Pickup and delivery the same day for orders placed before 11 AM. Cost-effective for non-urgent shipments that must arrive today.'],
    ['next_day', 'Jour suivant', 'Next Day', 10, 1.50, '17:00', 'Livraison le jour ouvrable suivant pour les commandes passées avant 17h. Notre option la plus économique.', 'Delivery on the next business day for orders placed before 5 PM. Our most affordable option.']
  ];
  for (const [sl, dnf, dne, bp, ppk, ct, dfr, den] of rates) {
    await db.run('INSERT INTO rates (service_level, display_name_fr, display_name_en, base_price, price_per_km, cutoff_time, description_fr, description_en, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1) ON CONFLICT (service_level) DO NOTHING', [sl, dnf, dne, bp, ppk, ct, dfr, den]);
  }

  const existing = await db.get('SELECT COUNT(*) as c FROM posts');
  if (existing.c == 0) {
    const posts = [
      ['Bienvenue chez Speedy Gonzales', 'Nous sommes ravis de lancer notre nouveau service de courrier dédié aux entreprises du Grand Montréal. Inscrivez votre entreprise dès aujourd\'hui et profitez de nos tarifs préférentiels sur toutes vos livraisons.', 'Annonces'],
      ['Nouveau service Express disponible', 'À partir de ce mois-ci, nous offrons un service Express avec livraison garantie en moins de 2 heures partout sur l\'île de Montréal. Réservez vos livraisons urgentes avant 14h pour une livraison le jour même.', 'Services'],
      ['Couverture étendue à Laval et la Rive-Nord', 'Speedy Gonzales étend ses services à Laval, Boisbriand, Sainte-Thérèse et Blainville. Tous nos niveaux de service (Express, Jour même, Jour suivant) sont disponibles sans frais supplémentaires.', 'Nouvelles'],
      ['Conseils pour optimiser vos livraisons', 'Saviez-vous que regrouper plusieurs livraisons à partir du même point de ramassage peut vous faire économiser jusqu\'à 30%? Découvrez nos astuces pour réduire vos coûts de courrier.', 'Conseils']
    ];
    for (const [t, c, cat] of posts) {
      await db.run('INSERT INTO posts (title, content, category, published) VALUES ($1,$2,$3,1)', [t, c, cat]);
    }
  }
};