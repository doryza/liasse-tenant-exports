module.exports = async function(db, services) {
  var cfg = (services && services.config) || {};
  async function set(k, v, force) {
    if (v === undefined || v === null || v === '') return;
    if (force) await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
    else await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
  await set('business_name', cfg.businessName || cfg.displayName || 'Surface Époxy');
  await set('contact_email', cfg.contactEmail);
  await set('contact_phone', cfg.contactPhone);
  await set('business_address', cfg.businessAddress);
  await set('business_hours', 'Lun–Ven : 7 h – 18 h • Sam : 8 h – 12 h');
  await set('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203515/tapavis_tenant_epoxy/build_epoxy_1781203515202.png', true);
  await set('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203517/tapavis_tenant_epoxy/build_epoxy_1781203516961.png', true);
  var c = await db.get('SELECT COUNT(*)::int AS c FROM projects');
  if (!c || !c.c) {
    var P = [
      ['Garage double — flocons granit', 'Meulage diamanté, réparation des fissures et système époxy 3 couches avec flocons de vinyle pleine couverture. Posé en deux jours, prêt à rouler en 72 heures.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203512/tapavis_tenant_epoxy/build_epoxy_1781203512662.png', 'garage', 'Granit poivre et sel', '#8a8f98', 'Laval', '550 pi²'],
      ['Plancher métallique cobalt', 'Époxy métallique à effet marbré, coulé en une seule pièce sans joints. Scellant polyaspartique haute brillance résistant aux UV.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203513/tapavis_tenant_epoxy/build_epoxy_1781203513057.png', 'metallique', 'Cobalt nacré', '#4549c0', 'Montréal', '480 pi²'],
      ['Entrepôt logistique', 'Revêtement époxy industriel haute résistance pour circulation de chariots élévateurs, avec lignes de démarcation de sécurité jaunes.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203512/tapavis_tenant_epoxy/build_epoxy_1781203512760.png', 'commercial', 'Charbon satiné', '#3a3d44', 'Longueuil', '8 200 pi²'],
      ['Sous-sol familial', 'Fini blanc perle lumineux qui agrandit la pièce. Surface lavable, sans poussière de béton, idéale pour une salle de jeux.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203513/tapavis_tenant_epoxy/build_epoxy_1781203513532.png', 'residentiel', 'Blanc perle', '#e9e7e0', 'Brossard', '720 pi²'],
      ['Salle de montre — cuivre fondu', 'Époxy métallique cuivré avec reflets profonds pour une salle de montre automobile. Un plancher qui vend autant que les produits.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203514/tapavis_tenant_epoxy/build_epoxy_1781203514278.png', 'metallique', 'Cuivre fondu', '#b06a3b', 'Terrebonne', '1 150 pi²'],
      ['Atelier mécanique', 'Système époxy résistant aux huiles, aux solvants et aux impacts. Nettoyage à la raclette en quelques minutes.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203513/tapavis_tenant_epoxy/build_epoxy_1781203513110.png', 'garage', 'Charbon moucheté', '#4a4e57', 'Saint-Jérôme', '1 400 pi²']
    ];
    for (var i = 0; i < P.length; i++) await db.run('INSERT INTO projects (title, description, image_url, category, color_name, color_hex, location, surface, featured) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1)', P[i]);
  }
  c = await db.get('SELECT COUNT(*)::int AS c FROM services');
  if (!c || !c.c) {
    var S = [
      ['Époxy de garage à flocons', 'Notre système le plus populaire : base époxy teintée, flocons décoratifs pleine couverture et scellant transparent ultra-résistant. Antidérapant, lavable et garanti contre le pelage.', 'À partir de 5 $/pi²', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203512/tapavis_tenant_epoxy/build_epoxy_1781203512662.png', 1],
      ['Époxy métallique 3D', 'Des pigments métalliques coulés à la main pour un effet marbré unique — aucun plancher n’est identique. Parfait pour les sous-sols, salles de montre et commerces.', 'À partir de 8 $/pi²', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203513/tapavis_tenant_epoxy/build_epoxy_1781203513057.png', 1],
      ['Planchers commerciaux et industriels', 'Systèmes haute performance pour entrepôts, cuisines, ateliers et commerces : résistance chimique, circulation lourde et lignes de sécurité intégrées.', 'À partir de 4,50 $/pi²', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203512/tapavis_tenant_epoxy/build_epoxy_1781203512760.png', 1],
      ['Sous-sols et intérieurs résidentiels', 'Un fini continu, sans joints et sans poussière qui transforme un sous-sol en véritable espace de vie. Plusieurs couleurs et niveaux de lustre offerts.', 'À partir de 6 $/pi²', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203513/tapavis_tenant_epoxy/build_epoxy_1781203513532.png', 0],
      ['Préparation, meulage et réparation de béton', 'Meulage diamanté, réparation de fissures, ragréage et nivellement — la fondation de tout plancher durable, aussi offerte seule.', 'Sur évaluation', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203513/tapavis_tenant_epoxy/build_epoxy_1781203513110.png', 0]
    ];
    for (var j = 0; j < S.length; j++) await db.run('INSERT INTO services (name, description, price_from, image_url, featured) VALUES ($1,$2,$3,$4,$5)', S[j]);
  }
  c = await db.get('SELECT COUNT(*)::int AS c FROM testimonials');
  if (!c || !c.c) {
    var TT = [
      ['Marie-Claude G.', 'Laval', 'Notre garage est devenu la plus belle pièce de la maison. Travail propre, équipe ponctuelle et le résultat dépasse les photos.', 5],
      ['Jonathan R.', 'Montréal', 'Le fini métallique de notre sous-sol est spectaculaire. On nous demande chaque fois qui a fait le plancher.', 5],
      ['Caroline et Éric', 'Brossard', 'Soumission claire, prix respecté, aucune surprise. Trois ans plus tard, le plancher est encore comme neuf.', 5],
      ['Gestion Delisle inc.', 'Longueuil', 'Nos 8 000 pi² d’entrepôt ont été faits en fin de semaine pour ne pas arrêter nos opérations. Très professionnel.', 5]
    ];
    for (var k2 = 0; k2 < TT.length; k2++) await db.run('INSERT INTO testimonials (author, location, content, rating) VALUES ($1,$2,$3,$4)', TT[k2]);
  }
  c = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (!c || !c.c) {
    var PO = [
      ['Combien de temps dure un plancher d’époxy ?', 'Un système époxy posé sur un béton bien préparé dure de 15 à 20 ans en résidentiel. La clé : le meulage diamanté, qui ouvre les pores du béton et garantit l’adhérence. C’est pourquoi nous offrons une garantie écrite de 5 ans contre le pelage.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203512/tapavis_tenant_epoxy/build_epoxy_1781203512662.png', 'Conseils'],
      ['Flocons ou métallique : quel fini choisir ?', 'Les flocons offrent une surface texturée, antidérapante et très tolérante aux marques — idéale pour les garages. Le métallique crée un effet marbré spectaculaire, parfait pour les espaces de vie et les commerces. Notre équipe apporte des échantillons des deux lors de l’évaluation.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203513/tapavis_tenant_epoxy/build_epoxy_1781203513057.png', 'Guides'],
      ['Préparer son garage avant la pose', 'Videz le garage, et nous nous occupons du reste : meulage, réparation des fissures et dépoussiérage industriel. Prévoyez 24 h sans marcher sur la surface et 72 h avant d’y stationner un véhicule.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203513/tapavis_tenant_epoxy/build_epoxy_1781203513110.png', 'Conseils'],
      ['L’entretien d’un plancher d’époxy en hiver', 'Le calcium et la gadoue ne pénètrent pas l’époxy : un coup de raclette et c’est sec. Évitez simplement les abrasifs agressifs et rincez à l’eau tiède au printemps pour retrouver le lustre d’origine.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781203512/tapavis_tenant_epoxy/build_epoxy_1781203512760.png', 'Conseils']
    ];
    for (var m = 0; m < PO.length; m++) await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1,$2,$3,$4,1)', PO[m]);
  }
};
