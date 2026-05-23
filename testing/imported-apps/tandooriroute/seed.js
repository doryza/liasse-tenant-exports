module.exports = async function(db, services) {
  services = services || {};
  const cfg = services.config || {};

  const settingsDefault = [
    ['tagline', 'Votre route vers la saveur — la cuisine indienne authentique à Blainville.'],
    ['business_name', cfg.businessName || cfg.displayName || 'Tandoori Route'],
    ['contact_email', cfg.contactEmail || 'tandooriroute@gmail.com'],
    ['contact_phone', cfg.contactPhone || ''],
    ['business_address', cfg.businessAddress || '1185 Bd Curé-Labelle, Blainville, QC, J7C 4K6'],
    ['hours', 'Mar-Jeu : 11h30 - 21h\nVen-Sam : 11h30 - 22h\nDim : 12h - 21h\nLun : Fermé'],
    ['about_text_fr', "Tandoori Route, c'est l'aventure d'une famille passionnée qui a choisi Blainville pour faire découvrir aux Basses-Laurentides les saveurs authentiques de la cuisine indienne. Nos plats sortent tout droit du tandoor — ce four d'argile traditionnel qui cuit à 480°C et donne à nos viandes leur croûte fumée et leur tendreté incomparable. Du Biryani au poulet mariné 24 heures aux currys mijotés avec nos mélanges d'épices maison, chaque plat est une étape sur votre route vers la saveur. Premier restaurant indien de la région — venez découvrir."],
    ['about_text_en', "Tandoori Route is the story of a passionate family who chose Blainville to bring authentic Indian flavors to the Basses-Laurentides. Our dishes come straight out of the tandoor — the traditional clay oven that roars at 480°C and gives our meats their smoky crust and unmatched tenderness. From 24-hour marinated Chicken Biryani to curries simmered with our house spice blends, every plate is a stop on your route to flavor. The first Indian restaurant in the area — come and discover."],
    ['footer_intro_fr', "Votre route vers la saveur. Cuisine indienne authentique, tandoor au feu de bois et épices fraîches — au cœur de Blainville."],
    ['footer_intro_en', "Your route to flavor. Authentic Indian cuisine, wood-fired tandoor and fresh spices — in the heart of Blainville."]
  ];
  for (const [k, v] of settingsDefault) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }

  const menuCount = await db.get('SELECT COUNT(*) AS c FROM menu_items').catch(function(){ return { c: 0 }; });
  if (!menuCount || Number(menuCount.c) === 0) {
    const items = [
      ['Biryani au Poulet', 'Chicken Biryani', "Notre plat signature. Poulet mariné 24h au yogourt et épices, riz basmati safrané, oignons frits croustillants et raïta de concombre. La saveur la plus demandée depuis l'ouverture.", "Our signature dish. Chicken marinated 24h in yogurt and spices, saffron basmati rice, crispy fried onions and cucumber raita. The most-requested flavor since we opened.", 18.99, 'biryani', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561490/tandooriroute/menu/biryani_1779561489634.png', 1, 1, 1],
      ['Poulet Tikka Tandoori', 'Tandoori Chicken Tikka', "Cubes de poulet marinés dans notre mélange d'épices secret puis cuits au tandoor à 480°C. Croûte fumée, cœur tendre et juteux.", "Chicken cubes marinated in our secret spice blend and roasted in the tandoor at 480°C. Smoky crust, tender juicy center.", 17.49, 'tandoor', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561496/tandooriroute/menu/tikka_1779561495519.png', 2, 1, 1],
      ['Agneau Rogan Josh', 'Lamb Rogan Josh', "Agneau mijoté lentement dans une sauce aromatique au cachemire — yogourt, oignons caramélisés, gingembre frais et notre garam masala maison.", "Lamb slow-simmered in a fragrant Kashmiri sauce — yogurt, caramelized onions, fresh ginger and our house garam masala.", 21.99, 'curry', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561511/tandooriroute/menu/rogan_josh_1779561510397.png', 3, 1, 1],
      ['Butter Chicken', 'Butter Chicken', "Le classique incontournable : poulet tandoori dans une sauce crémeuse à la tomate, beurre indien et fenugrec. Onctueux et légèrement sucré.", "The classic favorite: tandoori chicken in a creamy tomato sauce with Indian butter and fenugreek. Silky and subtly sweet.", 18.49, 'curry', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561510/tandooriroute/menu/butter_chicken_1779561509160.png', 4, 1, 1],
      ['Paneer Tikka Masala', 'Paneer Tikka Masala', "Cubes de fromage paneer maison grillés au tandoor, mijotés dans une sauce tomate-cardamome onctueuse. 100% végétarien.", "House paneer cubes grilled in the tandoor, simmered in a velvety tomato-cardamom sauce. 100% vegetarian.", 16.99, 'vege', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561511/tandooriroute/menu/paneer_1779561509975.png', 5, 1, 1],
      ['Chana Masala', 'Chana Masala', "Pois chiches mijotés aux épices du Pendjab, tomates fraîches, gingembre et coriandre. Réconfortant et vegan.", "Chickpeas simmered in Punjabi spices, fresh tomatoes, ginger and cilantro. Comforting and vegan.", 13.99, 'vege', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561514/tandooriroute/menu/chana_1779561513454.png', 6, 0, 1],
      ['Naan à l\'ail & beurre', 'Garlic Butter Naan', "Pain naan cuit au tandoor, badigeonné de beurre, ail frais et coriandre. Sort encore fumant.", "Naan bread baked in the tandoor, brushed with butter, fresh garlic and cilantro. Served piping hot.", 4.49, 'pain', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561516/tandooriroute/menu/naan_1779561515519.png', 7, 0, 1],
      ['Samosa aux légumes (2 mcx)', 'Vegetable Samosas (2 pcs)', "Chaussons croustillants faits maison, garnis de pommes de terre épicées et petits pois. Servis avec chutney tamarin.", "Crispy house-made pastries filled with spiced potatoes and peas. Served with tamarind chutney.", 6.99, 'pain', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561526/tandooriroute/menu/samosas_1779561525035.png', 8, 0, 1],
      ['Gulab Jamun (3 mcx)', 'Gulab Jamun (3 pcs)', "Beignets de lait moelleux trempés dans un sirop à la cardamome et à l'eau de rose. Le dessert préféré de l'Inde.", "Soft milk dumplings soaked in cardamom and rose-water syrup. India's beloved dessert.", 6.99, 'dessert', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561528/tandooriroute/menu/gulab_1779561527852.png', 9, 0, 1],
      ['Mango Lassi', 'Mango Lassi', "Boisson rafraîchissante au yogourt, mangue Alphonso et une touche de cardamome. L'accompagnement parfait des plats épicés.", "Refreshing yogurt drink with Alphonso mango and a touch of cardamom. The perfect companion to spicy dishes.", 4.99, 'dessert', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779561616/tandooriroute/menu/lassi_1779561615541.png', 10, 0, 1]
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
      ["Tandoori Route ouvre ses portes à Blainville !", "Enfin de la cuisine indienne dans les Basses-Laurentides. Notre tandoor est allumé, nos épices sont fraîchement moulues et notre Biryani au poulet n'attend que vous. Venez essayer le premier restaurant indien de Blainville — au 1185 Bd Curé-Labelle.", "Ouverture", 1]);
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ["Notre Biryani au poulet : 24 heures de patience", "Le secret d'un vrai Biryani, c'est le temps. Nous marinons notre poulet pendant 24 heures dans un mélange de yogourt, gingembre, ail, garam masala maison et une pointe de safran. Résultat : chaque grain de basmati absorbe ces arômes et chaque bouchée raconte une histoire.", "Coulisses", 1]);
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ["Suivez-nous sur Facebook et Instagram", "Photos de plats fraîchement sortis du tandoor, événements spéciaux, nouveautés au menu — toute l'actualité de Tandoori Route est sur nos réseaux sociaux. Rejoignez la communauté qui a déjà adopté son restaurant indien préféré à Blainville.", "Communauté", 1]);
  }
};
