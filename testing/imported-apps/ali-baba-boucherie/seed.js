module.exports = async function(db, services) {
  services = services || {};
  const cfg = services.config || {};

  const settingsDefault = [
    ['tagline', 'Grillades libanaises sur charbon de bois — boucherie & comptoir à Blainville.'],
    ['business_name', cfg.businessName || cfg.displayName || 'Ali Baba Grillades'],
    ['contact_email', cfg.contactEmail || ''],
    ['contact_phone', cfg.contactPhone || '(450) 420-0003'],
    ['business_address', cfg.businessAddress || '1185 Bd Curé-Labelle, Local 3, Blainville, QC J7C 4K6'],
    ['hours', 'Mer-Dim : 9h - 19h\nLun-Mar : Fermé'],
    ['hours_json', '[{"day":"mon","open":"","close":"","closed":true},{"day":"tue","open":"","close":"","closed":true},{"day":"wed","open":"09:00","close":"19:00","closed":false},{"day":"thu","open":"09:00","close":"19:00","closed":false},{"day":"fri","open":"09:00","close":"19:00","closed":false},{"day":"sat","open":"09:00","close":"19:00","closed":false},{"day":"sun","open":"09:00","close":"19:00","closed":false}]'],
    // Google Places facts (place_id ChIJF4-Q7NnXyEwRTorFpzfVkmc), via place-id-fetcher.
    ['google_place_id', 'ChIJF4-Q7NnXyEwRTorFpzfVkmc'],
    ['map_embed_url', 'https://www.google.com/maps?q=1185%20Bd%20Cur%C3%A9-Labelle%20Local%203%2C%20Blainville%2C%20QC%20J7C%204K6%2C%20Canada&output=embed'],
    ['about_text_fr', 'Ali Baba Grillades, c\'est une boucherie et un comptoir de grillades libanaises au cœur de Blainville. Toutes nos viandes sont grillées sur charbon de bois — taouk, kafta, filet mignon, côtelettes d\'agneau, makanek, soujouk — pour ce goût fumé qu\'aucun autre feu ne donne. Servies en assiette avec légumes grillés, pain pita épicé, houmous et sauce à l\'ail, ou en sandwich. On y trouve aussi nos tartares libanais (tablé, kebbeh, kafta, malsé) et nos pâtisseries orientales maison. De la vitrine de la boucherie au charbon ardent : la fraîcheur d\'abord, la flamme ensuite.'],
    ['about_text_en', 'Ali Baba Grillades is a Lebanese butcher shop and charcoal-grill counter in the heart of Blainville. Every cut is grilled over real wood charcoal — taouk, kafta, filet mignon, lamb chops, makanek, soujouk — for a smoky flavour no other fire delivers. Served on a platter with grilled vegetables, spiced pita bread, hummus and garlic sauce, or in a sandwich. We also serve our Lebanese tartares (tablé, kebbeh, kafta, malsé) and house-made Oriental pastries. From the butcher\'s case to the glowing coals: freshness first, fire second.'],
    ['footer_intro_fr', 'Boucherie et grillades libanaises sur charbon de bois à Blainville. Viandes fraîches, marinades maison et plats préparés à la commande.'],
    ['footer_intro_en', 'Lebanese butcher shop and charcoal grill in Blainville. Fresh meats, house marinades and made-to-order dishes.']
  ];
  for (const [k, v] of settingsDefault) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }

  const menuCount = await db.get('SELECT COUNT(*) AS c FROM menu_items').catch(function(){ return { c: 0 }; });
  if (!menuCount || Number(menuCount.c) === 0) {
    const items = [
      ["Babaghanouge", "Baba Ghanoush", "Caviar d'aubergine grillée au tahini, citron et ail.", "Smoky grilled-eggplant dip with tahini, lemon and garlic.", 7.99, "entrees", null, 1, 0, 1],
      ["Patates à l'ail", "Garlic Potatoes", "Pommes de terre sautées à l'ail et coriandre. Format petit ou grand.", "Potatoes sautéed in garlic and coriander. Small or large.", 4.99, "entrees", null, 2, 0, 1],
      ["Riz", "Rice", "Riz libanais parfumé. Format petit ou grand.", "Fragrant Lebanese rice. Small or large.", 3.99, "entrees", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898979/tapavis_menu/296/cfz05akntqy9cvmgoj7q.jpg", 3, 0, 1],
      ["Hommous", "Hummus", "Purée de pois chiches au tahini, citron et huile d'olive. Format petit ou grand.", "Chickpea purée with tahini, lemon and olive oil. Small or large.", 7.5, "entrees", null, 4, 0, 1],
      ["Fattouche", "Fattoush", "Salade de légumes croquants et pain pita grillé, vinaigrette au sumac.", "Crisp vegetable salad with toasted pita and a sumac dressing.", 4.99, "entrees", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898980/tapavis_menu/296/cyrudrgnomuladqj5s2s.jpg", 5, 0, 1],
      ["Taboulé", "Tabbouleh", "Salade de persil, boulgour, tomate et menthe, citron et huile d'olive.", "Parsley, bulgur, tomato and mint salad with lemon and olive oil.", 4.99, "entrees", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898980/tapavis_menu/296/kaplmu0fx59xu6xmtx0n.jpg", 6, 0, 1],
      ["Sauce à l'ail", "Garlic Sauce", "Notre sauce à l'ail maison, crémeuse et généreuse.", "Our creamy house-made garlic sauce.", 7.5, "entrees", null, 7, 0, 1],
      ["Pain pita épicé", "Spiced Pita Bread", "Pain pita moyen assaisonné de sauce piquante et d'oignons, le tout grillé.", "Medium pita seasoned with hot sauce and onions, then grilled.", 3.57, "entrees", null, 8, 0, 1],
      ["Sac de 5 pitas moyennes", "Bag of 5 Medium Pitas", "Sac de 5 pains pita moyens.", "Bag of 5 medium pita breads.", 2.5, "entrees", null, 9, 0, 1],
      ["Sandwich Shish taouk", "Shish Taouk Sandwich", "Poitrine de poulet marinée, grillée sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Marinated chicken breast charcoal-grilled. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898972/tapavis_menu/296/zxacvy75nmtgrcl0jd1t.jpg", 1, 0, 1],
      ["Sandwich Filet mignon", "Filet Mignon Sandwich", "Filet mignon grillé sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Charcoal-grilled filet mignon. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898973/tapavis_menu/296/okka7eig9hv5cczktkff.jpg", 2, 0, 1],
      ["Sandwich Steak", "Steak Sandwich", "Steak grillé sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Charcoal-grilled steak. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898975/tapavis_menu/296/un8hwnr3asdhm68gpxho.jpg", 3, 0, 1],
      ["Sandwich Kafta", "Kafta Sandwich", "Brochette de bœuf haché, persil, oignon et épices, grillée sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Charcoal-grilled ground-beef kafta with parsley, onion and spices. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898974/tapavis_menu/296/ac30uszwyjejexi27bhr.jpg", 4, 0, 1],
      ["Sandwich Makaneek", "Makanek Sandwich", "Saucisses libanaises non piquantes, grillées sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Charcoal-grilled mild Lebanese sausages. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898977/tapavis_menu/296/suycuncj0ylxjb5qo3x4.jpg", 5, 0, 1],
      ["Sandwich Soujouk", "Soujouk Sandwich", "Saucisses arméniennes piquantes, grillées sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Charcoal-grilled spicy Armenian sausages. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898977/tapavis_menu/296/klmcglqmwktai6dbdm1d.jpg", 6, 0, 1],
      ["Sandwich Arayes", "Arayes Sandwich", "Pain pita farci de kafta et grillé sur charbon, croustillant. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Pita stuffed with kafta and charcoal-grilled until crisp. Topped with tomato, pickle, onion, hummus or garlic sauce.", 12.99, "sandwichs", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898978/tapavis_menu/296/eqcby2c0p8avm0lmxdde.jpg", 7, 0, 1],
      ["Sandwich Foie", "Liver Sandwich", "Foie grillé sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Charcoal-grilled liver. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", null, 8, 0, 1],
      ["Sandwich Crevettes", "Shrimp Sandwich", "Crevettes grillées sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Charcoal-grilled shrimp. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", null, 9, 0, 1],
      ["Hamburger", "Hamburger", "Galette de bœuf grillée sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Charcoal-grilled beef patty. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", null, 10, 0, 1],
      ["Sandwich Agneau", "Lamb Sandwich", "Agneau grillé sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.", "Charcoal-grilled lamb. Topped with tomato, pickle, onion, hummus or garlic sauce.", 9.99, "sandwichs", null, 11, 0, 1],
      ["Bœuf (tartare)", "Beef Tartare", "Tartare de bœuf libanais. Styles tablé, kebbeh, kafta ou malsé. Sandwich ou au kilo.", "Lebanese-style beef tartare. Tablé, kebbeh, kafta or malsé. Sandwich or by the kilo.", 9.5, "tartares", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781899013/tapavis_menu/296/yyhhj3jhqznnjyqmujre.jpg", 1, 0, 1],
      ["Agneau (tartare)", "Lamb Tartare", "Tartare d'agneau libanais. Styles tablé, kebbeh, kafta ou malsé. Sandwich ou au kilo.", "Lebanese-style lamb tartare. Tablé, kebbeh, kafta or malsé. Sandwich or by the kilo.", 9.99, "tartares", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781899015/tapavis_menu/296/i86zl9dfmhfnf1widnya.jpg", 2, 0, 1],
      ["Veau (tartare)", "Veal Tartare", "Tartare de veau libanais. Styles tablé, kebbeh, kafta ou malsé. Sandwich ou au kilo.", "Lebanese-style veal tartare. Tablé, kebbeh, kafta or malsé. Sandwich or by the kilo.", 9.5, "tartares", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781899014/tapavis_menu/296/f4zigtnpkzxgxttfvngu.jpg", 3, 0, 1],
      ["Poulet sur charbon en crapaudine", "Charcoal Crapaudine Chicken", "Poulet entier en crapaudine, grillé sur charbon de bois.", "Whole spatchcock chicken charcoal-grilled.", 25.99, "assiettes", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898961/tapavis_menu/296/zkpkruhfiq2vqdzvisx0.jpg", 1, 0, 1],
      ["Mix", "Mixed Grill", "Taouk, kafta et filet mignon grillés sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Charcoal-grilled taouk, kafta and filet mignon. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 32, "assiettes", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898959/tapavis_menu/296/l6qrlo9ykavj0wszyh2c.jpg", 2, 0, 1],
      ["Filet mignon", "Filet Mignon", "Bœuf tendre grillé sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Tender charcoal-grilled beef. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 39, "assiettes", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898960/tapavis_menu/296/w9hcgfmjapohgaglmm4a.jpg", 3, 0, 1],
      ["Kafta", "Kafta", "Bœuf haché, persil, oignon et épices, grillé sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Ground beef with parsley, onion and spices, charcoal-grilled. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 30, "assiettes", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898962/tapavis_menu/296/pwmlbzi4kkrjrn6aazi0.jpg", 4, 0, 1],
      ["Taouk", "Taouk", "Poitrine de poulet marinée, grillée sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Marinated chicken breast charcoal-grilled. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 32, "assiettes", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898962/tapavis_menu/296/iruy1v5h35zxwriqzabi.jpg", 5, 0, 1],
      ["Makanek", "Makanek", "Saucisses libanaises non piquantes, grillées sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Mild Lebanese sausages charcoal-grilled. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 32, "assiettes", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898963/tapavis_menu/296/qoo2efrlejjtvlbodfzh.jpg", 6, 0, 1],
      ["Côtelettes d'agneau", "Lamb Chops", "Côtelettes d'agneau grillées sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Charcoal-grilled lamb chops. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 40, "assiettes", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898966/tapavis_menu/296/yt9pwpwp02y7vnrcxkm3.jpg", 7, 0, 1],
      ["Soujouk", "Soujouk", "Saucisses arméniennes piquantes, grillées sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Spicy Armenian sausages charcoal-grilled. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 32, "assiettes", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898965/tapavis_menu/296/fpruetusiyssanepfoea.jpg", 8, 0, 1],
      ["Merguez", "Merguez", "Saucisses marocaines non piquantes, grillées sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Mild Moroccan sausages charcoal-grilled. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 32, "assiettes", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898964/tapavis_menu/296/rxbuefnkkkmleg7prcjl.jpg", 9, 0, 1],
      ["Foie de veau de grain", "Grain-fed Veal Liver", "Foie de veau de grain grillé sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Charcoal-grilled grain-fed veal liver. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 35, "assiettes", null, 10, 0, 1],
      ["Agneau qc. en cubes", "Quebec Lamb Cubes", "Agneau du Québec en cubes, grillé sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.", "Charcoal-grilled Quebec lamb cubes. Served with grilled vegetables, spiced pita bread, hummus and garlic sauce. ½ kg or 1 kg.", 40, "assiettes", null, 11, 0, 1],
      ["Pepsi", "Pepsi", null, null, 3.25, "breuvages", null, 1, 0, 1],
      ["Pepsi Diète", "Diet Pepsi", null, null, 3.25, "breuvages", null, 2, 0, 1],
      ["Coca-Cola", "Coca-Cola", null, null, 3.25, "breuvages", null, 3, 0, 1],
      ["7 UP", "7 UP", null, null, 3.25, "breuvages", null, 4, 0, 1],
      ["Crush", "Crush", null, null, 3.25, "breuvages", null, 5, 0, 1],
      ["Bouteille d'eau", "Bottled Water", null, null, 3.25, "breuvages", null, 6, 0, 1],
      ["Ayrane", "Ayran", "Boisson lactée rafraîchissante à base de yogourt.", "Refreshing yogurt-based drink.", 4.5, "breuvages", null, 7, 0, 1],
      ["Mélange de Baklava", "Baklava Assortment", "10 morceaux de baklavas frais.", "10 pieces of fresh baklava.", 9.86, "dessert", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898981/tapavis_menu/296/bor0dhsbt3tdtyx1xzpk.jpg", 1, 0, 1],
      ["Bassboussa", "Basbousa", "400 g de gâteaux orientaux à la semoule de blé, noix de coco et amandes.", "400 g of semolina pastries with coconut and almonds.", 15.7, "dessert", null, 2, 0, 1],
      ["Maamoul", "Maamoul", "400 g de biscuits à la semoule de blé, noix de Grenoble et dattes.", "400 g of semolina cookies with walnuts and dates.", 14.27, "dessert", null, 3, 0, 1],
      ["Tamara", "Tamara", "400 g d'assortiment de biscuits orientaux aux noix variées.", "400 g assortment of Oriental cookies with mixed nuts.", 14.27, "dessert", null, 4, 0, 1],
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
      ["Ali Baba Grillades — la grillade sur charbon à Blainville", "Boucherie le jour, comptoir de grillades sur charbon midi et soir. Taouk, kafta, filet mignon, côtelettes d'agneau et notre poulet en crapaudine grillé sur charbon de bois. Venez nous voir au 1185 Bd Curé-Labelle, local 3.", "Bienvenue", 1]);
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ["Pourquoi le charbon de bois change tout", "Le charbon de bois monte plus haut et saisit la viande sans la dessécher : une croûte fumée à l'extérieur, tendre et juteuse à l'intérieur. C'est ce qui distingue nos brochettes et notre poulet en crapaudine. Rien à voir avec le gril ordinaire.", "Coulisses", 1]);
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ["Boucherie + traiteur : commandez au kilo", "Au-delà des assiettes, notre boucherie vous prépare vos viandes marinées à emporter et nos grillades au kilo (½ kg ou 1 kg) pour vos repas en famille et vos réceptions. Tartares libanais et pâtisseries orientales maison aussi disponibles.", "Boucherie", 1]);
  }
};
