module.exports = async function(db, services) {
  services = services || {};
  const cfg = services.config || {};

  const settingsUpsert = [
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779215127/tapavis_tenant_poutinefest/build_poutinefest_1779215127049.png'],
    ['_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779215130/tapavis_tenant_poutinefest/build_poutinefest_1779215130910.png']
  ];
  for (const [k, v] of settingsUpsert) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
  }

  const settingsDefault = [
    ['tagline', 'La poutine la plus authentique en ville.'],
    ['business_name', cfg.businessName || cfg.displayName || 'PoutineFest'],
    ['contact_email', cfg.contactEmail || ''],
    ['contact_phone', cfg.contactPhone || ''],
    ['business_address', cfg.businessAddress || ''],
    ['hours', 'Lun-Jeu : 11h - 22h\nVen-Sam : 11h - minuit\nDim : 12h - 21h'],
    ['about_text_fr', 'Depuis 2018, PoutineFest célèbre la cuisine québécoise avec passion. Nos pommes de terre proviennent de fermes québécoises, notre fromage en grains est livré tous les matins, et notre sauce brune maison mijote 6 heures pour un goût incomparable. Notre camion-restaurant parcourt la province pour servir festivals, mariages et événements corporatifs.'],
    ['about_text_en', 'Since 2018, PoutineFest has been celebrating Quebec cuisine with passion. Our potatoes come from Quebec farms, our cheese curds are delivered every morning, and our house-made gravy simmers for 6 hours to deliver an unmatched flavor. Our food truck travels across the province for festivals, weddings and corporate events.']
  ];
  for (const [k, v] of settingsDefault) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }

  const menuCount = await db.get('SELECT COUNT(*) AS c FROM menu_items').catch(function(){ return { c: 0 }; });
  if (!menuCount || Number(menuCount.c) === 0) {
    const items = [
      ['Classique', 'Classic Poutine', 'Frites fraîches maison, fromage en grains du jour et sauce brune mijotée 6 heures. La base intemporelle.', 'House-cut fresh fries, daily cheese curds, and 6-hour simmered house gravy. The timeless classic.', 9.99, 'classique', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779215126/tapavis_tenant_poutinefest/build_poutinefest_1779215126366.png', 1, 1, 1],
      ['Italienne', 'Italian', 'Sauce à la viande maison, parmesan râpé et fromage en grains. Une signature québécoise.', 'House meat sauce, grated parmesan, cheese curds. A Quebec staple.', 12.99, 'signature', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779215125/tapavis_tenant_poutinefest/build_poutinefest_1779215125800.png', 2, 1, 1],
      ['BBQ Pulled Pork', 'BBQ Pulled Pork', 'Effiloché de porc fumé 12 heures, sauce BBQ maison, oignons frits croustillants et fromage en grains.', '12hr smoked pulled pork, house BBQ sauce, crispy fried onions, cheese curds.', 14.99, 'signature', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779215126/tapavis_tenant_poutinefest/build_poutinefest_1779215126577.png', 3, 1, 1],
      ['Bacon Deluxe', 'Bacon Deluxe', 'Bacon croustillant double portion, oignons caramélisés et sauce au poivre noir.', 'Double crispy bacon, caramelized onions, black peppercorn gravy.', 13.99, 'signature', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779215133/tapavis_tenant_poutinefest/build_poutinefest_1779215133562.png', 4, 0, 1],
      ['Forestière Végé', 'Forest Veggie', 'Champignons sauvages sautés au beurre à l\'ail, sauce aux champignons et fromage en grains. 100% végétarienne.', 'Wild mushrooms sautéed in garlic butter, mushroom gravy, cheese curds. 100% vegetarian.', 12.99, 'vegan', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779215123/tapavis_tenant_poutinefest/build_poutinefest_1779215123464.png', 5, 1, 1],
      ['Deluxe Festival', 'Festival Deluxe', 'Bacon, saucisse fumée, poulet effiloché, double portion de fromage et sauce maison. Pour les grandes faims.', 'Bacon, smoked sausage, pulled chicken, double cheese, house gravy. For big appetites.', 17.99, 'signature', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779215133/tapavis_tenant_poutinefest/build_poutinefest_1779215133750.png', 6, 1, 1]
    ];
    for (const it of items) {
      await db.run('INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,featured,available) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', it);
    }
  }

  const platCount = await db.get('SELECT COUNT(*) AS c FROM delivery_platforms').catch(function(){ return { c: 0 }; });
  if (!platCount || Number(platCount.c) === 0) {
    const platforms = [
      ['Uber Eats', '', 'https://www.ubereats.com', 1, 1],
      ['DoorDash', '', 'https://www.doordash.com', 2, 1],
      ['SkipTheDishes', '', 'https://www.skipthedishes.com', 3, 1]
    ];
    for (const p of platforms) {
      await db.run('INSERT INTO delivery_platforms (name,logo_url,link_url,position,active) VALUES ($1,$2,$3,$4,$5)', p);
    }
  }

  const postCount = await db.get('SELECT COUNT(*) AS c FROM posts').catch(function(){ return { c: 0 }; });
  if (!postCount || Number(postCount.c) === 0) {
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ['Le camion sera au Festival de la Poutine!', 'Du 28 au 31 août, retrouvez notre camion-restaurant au Festival de la Poutine de Drummondville. Menu spécial sur place avec 2 poutines exclusives au festival, à ne pas manquer!', 'Événement', 1]);
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ['Nouveau menu d\'automne en arrivée', 'Découvrez nos 3 nouvelles poutines inspirées des saveurs d\'automne: érable-bacon, courge musquée rôtie, et notre nouvelle Forêt Noire à la sauce vénison. Disponibles dès le 15 septembre.', 'Menu', 1]);
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ['Réservez tôt pour le temps des fêtes', 'Notre camion est presque complet pour décembre. Réservez dès maintenant pour vos fêtes d\'entreprise et événements de fin d\'année. Tarif spécial pour les groupes de 50+.', 'Annonce', 1]);
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ['Notre fromage en grains : la fraîcheur avant tout', 'Saviez-vous que nos grains de fromage sont livrés tous les matins par une fromagerie de l\'Estrie? Si ça ne couine pas dans la bouche, on n\'en sert pas. C\'est notre engagement.', 'Coulisses', 1]);
  }
};
