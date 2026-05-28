module.exports = async function(db) {
  const settings = [
    ['tagline_fr', 'Véhicules d\'occasion de qualité'],
    ['tagline_en', 'Quality used vehicles'],
    ['hero_title_fr', 'Trouvez votre véhicule idéal'],
    ['hero_title_en', 'Find your perfect vehicle'],
    ['hero_subtitle_fr', 'Sélection rigoureuse de véhicules d\'occasion certifiés. Financement disponible — 2e et 3e chance au crédit.'],
    ['hero_subtitle_en', 'Carefully selected certified used vehicles. Financing available — 2nd and 3rd chance credit.'],
    ['about_title_fr', 'À propos de X-Auto'],
    ['about_title_en', 'About X-Auto'],
    ['about_text_fr', 'Depuis notre fondation, X-Auto s\'est imposé comme un concessionnaire de confiance pour des véhicules d\'occasion de qualité. Chaque véhicule est minutieusement inspecté avant d\'être mis en vente. Notre équipe passionnée vous accompagne à chaque étape, de la sélection au financement.'],
    ['about_text_en', 'Since our founding, X-Auto has established itself as a trusted dealer for quality used vehicles. Every vehicle is thoroughly inspected before being put up for sale. Our passionate team supports you every step of the way, from selection to financing.'],
    ['business_hours_fr', 'Lun-Ven: 9h-19h\nSam: 9h-17h\nDim: Fermé'],
    ['business_hours_en', 'Mon-Fri: 9am-7pm\nSat: 9am-5pm\nSun: Closed']
  ];
  for (const [k, v] of settings) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951724/tapavis_tenant_x-auto/build_x-auto_1778951724521.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951718/tapavis_tenant_x-auto/build_x-auto_1778951718560.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_financing_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951723/tapavis_tenant_x-auto/build_x-auto_1778951723140.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");

  const vCount = await db.get('SELECT COUNT(*)::int AS c FROM vehicles');
  if (!vCount || vCount.c === 0) {
    const vehicles = [
      ['Honda', 'Civic', 2020, 18995, 62000, 'Automatique', 'Essence', 'Berline', 'Argent', '2HGFC2F69LH123456', 'Honda Civic 2020 en excellente condition. Faible kilométrage, un seul propriétaire, historique d\'entretien complet. Sièges chauffants, écran tactile, caméra de recul, Apple CarPlay et Android Auto. Parfaite pour la ville comme pour les longs trajets.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951719/tapavis_tenant_x-auto/build_x-auto_1778951719227.png', 1, 0],
      ['Toyota', 'RAV4', 2021, 28995, 48000, 'Automatique', 'Essence', 'VUS', 'Noir', '2T3F1RFV6MW123456', 'Toyota RAV4 2021 traction intégrale AWD. Toit ouvrant, sièges en cuir, démarreur à distance, système de sécurité Toyota Safety Sense. Idéal pour les familles actives qui veulent un VUS fiable et économique.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951721/tapavis_tenant_x-auto/build_x-auto_1778951721894.png', 1, 0],
      ['Ford', 'F-150', 2019, 32995, 89000, 'Automatique', 'Essence', 'Camionnette', 'Gris', '1FTFW1E59KFA12345', 'Ford F-150 XLT 2019 cabine multiplace 4x4. Moteur V8 5.0L EcoBoost, boîte de chargement standard, marche-pieds, attache de remorque intégrée. Camionnette puissante et fiable pour le travail comme pour les loisirs.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951729/tapavis_tenant_x-auto/build_x-auto_1778951729961.png', 1, 0],
      ['Mazda', 'CX-5', 2020, 24995, 71000, 'Automatique', 'Essence', 'VUS', 'Blanc', 'JM3KFBCM4L0123456', 'Mazda CX-5 GS 2020 AWD. Design SKYACTIV, intérieur soigné, sièges chauffants, écran 10 pouces, système audio Bose. Conduite dynamique et raffinée, consommation très raisonnable.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951716/tapavis_tenant_x-auto/build_x-auto_1778951716690.png', 0, 0],
      ['Hyundai', 'Elantra', 2018, 13495, 95000, 'Automatique', 'Essence', 'Berline', 'Rouge', 'KMHD84LF8JU123456', 'Hyundai Elantra GLS 2018. Berline compacte économique et fiable. Bluetooth, sièges chauffants avant, caméra de recul. Excellent rapport qualité-prix, parfait premier véhicule ou véhicule pour étudiant.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951721/tapavis_tenant_x-auto/build_x-auto_1778951721806.png', 0, 0],
      ['Nissan', 'Rogue', 2019, 21995, 78000, 'CVT', 'Essence', 'VUS', 'Argent', '5N1AT2MV4KC123456', 'Nissan Rogue SV 2019 AWD. VUS compact polyvalent, intérieur spacieux, toit panoramique, ProPILOT Assist. Parfait équilibre entre confort, sécurité et économie de carburant.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778951730/tapavis_tenant_x-auto/build_x-auto_1778951730145.png', 0, 0]
    ];
    for (const v of vehicles) {
      await db.run('INSERT INTO vehicles (make, model, year, price, mileage, transmission, fuel_type, body_type, color, vin, description, image_url, featured, sold) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)', v);
    }
  }

  const tCount = await db.get('SELECT COUNT(*)::int AS c FROM testimonials');
  if (!tCount || tCount.c === 0) {
    const testimonials = [
      ['Marie L.', 5, 'Service exceptionnel du début à la fin! L\'équipe de X-Auto a pris le temps de bien comprendre mes besoins et m\'a aidée à trouver le véhicule parfait. Je recommande à 100%.', 'Honda Civic 2019'],
      ['Jean-François P.', 5, 'J\'avais un crédit difficile, mais grâce à leur programme de 2e chance, j\'ai pu obtenir un VUS fiable pour ma famille. Merci à toute l\'équipe pour leur patience et leur professionnalisme.', 'Toyota RAV4 2018'],
      ['Sophie B.', 4, 'Très bonne expérience d\'achat. Le véhicule était propre, bien entretenu, exactement comme décrit. Le processus a été rapide et transparent. Je reviendrai pour mon prochain achat.', 'Mazda CX-5 2019'],
      ['Alexandre T.', 5, 'Après avoir visité plusieurs concessionnaires, X-Auto m\'a offert le meilleur prix et le meilleur service. Aucune pression, juste de bons conseils honnêtes. Très satisfait de mon F-150!', 'Ford F-150 2018']
    ];
    for (const t of testimonials) {
      await db.run('INSERT INTO testimonials (author, rating, content, vehicle_purchased, published) VALUES ($1,$2,$3,$4,1)', t);
    }
  }

  const pCount = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (!pCount || pCount.c === 0) {
    const posts = [
      ['Préparer votre véhicule pour l\'hiver québécois', 'L\'hiver approche et il est temps de préparer votre véhicule. Voici nos conseils essentiels : pneus d\'hiver de qualité, vérification de la batterie, antigel, et inspection des essuie-glaces. Une bonne préparation peut éviter bien des soucis sur la route.', 'Conseils'],
      ['Pourquoi acheter un véhicule d\'occasion certifié?', 'Acheter un véhicule d\'occasion certifié offre plusieurs avantages : prix avantageux, inspection rigoureuse, historique d\'entretien transparent et garantie. C\'est un excellent moyen d\'obtenir un véhicule de qualité sans payer le prix du neuf.', 'Guides'],
      ['Financement: comprendre la 2e et 3e chance au crédit', 'Un mauvais crédit ne devrait pas vous empêcher d\'avoir un véhicule fiable. Les programmes de 2e et 3e chance au crédit permettent à plus de gens d\'accéder à la mobilité tout en reconstruisant leur cote de crédit. Parlez-nous de votre situation.', 'Financement'],
      ['Entretien préventif: les 5 indispensables', 'Pour prolonger la durée de vie de votre véhicule, certains entretiens sont incontournables : changement d\'huile régulier, rotation des pneus, vérification des freins, contrôle des liquides et inspection annuelle complète.', 'Conseils']
    ];
    for (const p of posts) {
      await db.run('INSERT INTO posts (title, content, category, published) VALUES ($1,$2,$3,1)', p);
    }
  }
};
