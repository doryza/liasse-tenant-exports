module.exports = async function(db, services) {
  services = services || {};
  const cfg = services.config || {};
  const IMG = 'https://res.cloudinary.com/duhp69meg/image/upload';
  const site = function(name){ return IMG + '/ristorantevoga/site/' + name; };
  const g = function(n){ return IMG + '/ristorantevoga/gallery/' + n + '.jpg'; };

  // ---------------------------------------------------------------------------
  // Site settings — every string below is editable from the admin backend.
  // ---------------------------------------------------------------------------
  const settingsDefault = [
    ['business_name', 'Ristorante Voga'],
    ['established_year', '2014'],
    ['tagline_fr', 'Cuisine italienne authentique & bar à vin'],
    ['tagline_en', 'Authentic Italian cuisine & wine bar'],
    ['seo_description_fr', 'Ristorante Voga — cuisine italienne authentique et bar à vin au 330, rue Saint-Georges à Saint-Jérôme. Pâtes fraîches, risottos, pizzas, grande carte des vins et menu dégustation. Réservez votre table.'],
    ['seo_description_en', 'Ristorante Voga — authentic Italian cuisine and wine bar at 330 Rue Saint-Georges in Saint-Jérôme. Fresh pasta, risotto, pizza, a fine wine list and a tasting menu. Reserve your table.'],

    ['admin_email', cfg.contactEmail || ''],
    ['contact_email', ''],
    ['contact_phone', ''],
    ['business_address', '330 Rue Saint-Georges, Saint-Jérôme, QC'],
    ['map_embed_url', ''],
    ['hours_json', JSON.stringify([
      { day:'mon', open:'', close:'', closed:false },
      { day:'tue', open:'', close:'', closed:false },
      { day:'wed', open:'', close:'', closed:false },
      { day:'thu', open:'', close:'', closed:false },
      { day:'fri', open:'', close:'', closed:false },
      { day:'sat', open:'', close:'', closed:false },
      { day:'sun', open:'', close:'', closed:false }
    ])],

    // Hero
    ['hero_kicker_fr', 'Ristorante · Bar à vin · Saint-Jérôme'],
    ['hero_kicker_en', 'Ristorante · Wine bar · Saint-Jérôme'],
    ['hero_title_fr', "L'Italie, à votre table"],
    ['hero_title_en', 'Italy, at your table'],
    ['hero_subtitle_fr', 'Pâtes fraîches, risottos crémeux, pizzas généreuses et une belle carte des vins, au cœur de Saint-Jérôme.'],
    ['hero_subtitle_en', 'Fresh pasta, creamy risotto, generous pizza and a fine wine list, in the heart of Saint-Jérôme.'],

    // Story / À propos
    ['story_title_fr', 'Notre histoire'],
    ['story_title_en', 'Our story'],
    ['story_kicker_fr', 'Depuis 2014'],
    ['story_kicker_en', 'Since 2014'],
    ['story_body_fr', "Au cœur de Saint-Jérôme, Ristorante Voga célèbre l'Italie comme on l'aime : généreuse, chaleureuse et sincère. Depuis 2014, nous réunissons autour de nos tables les grands classiques de la cuisine italienne — pâtes fraîches, risottos crémeux, pizzas garnies et plats mijotés — préparés avec des ingrédients soignés et un vrai souci du détail.\n\nDans une salle élégante aux banquettes vertes et à la lumière dorée, accompagnés d'une belle carte des vins, chaque repas se vit comme une soirée en bonne compagnie. Benvenuti."],
    ['story_body_en', "In the heart of Saint-Jérôme, Ristorante Voga celebrates Italy the way we love it: generous, warm and heartfelt. Since 2014 we have gathered guests around the great classics of Italian cooking — fresh pasta, creamy risotto, loaded pizza and slow-simmered dishes — prepared with carefully chosen ingredients and real attention to detail.\n\nIn an elegant room of green banquettes and golden light, paired with a fine wine list, every meal feels like an evening among good company. Benvenuti."],

    // Signature dishes
    ['signature_title_fr', 'Nos spécialités'],
    ['signature_title_en', 'Signature dishes'],
    ['signature_intro_fr', "Quelques-uns des plats qui font la réputation de la maison."],
    ['signature_intro_en', "A few of the dishes that have made the house's name."],

    // Menu
    ['menu_title_fr', 'Le menu'],
    ['menu_title_en', 'The menu'],
    ['menu_intro_fr', "Antipasti, pâtes, risottos, pizzas et grandes assiettes — la cuisine italienne dans toute sa générosité. Les prix affichés à deux valeurs correspondent aux formats petite / grande."],
    ['menu_intro_en', 'Antipasti, pasta, risotto, pizza and hearty mains — Italian cooking in all its generosity. Two-value prices indicate small / large portions.'],

    // Wine
    ['wine_title_fr', 'La carte des vins'],
    ['wine_title_en', 'The wine list'],
    ['wine_intro_fr', "Notre bar à vin met à l'honneur de belles bouteilles d'Italie et d'ailleurs, à découvrir au verre ou en bouteille. Demandez-nous nos suggestions d'accords."],
    ['wine_intro_en', 'Our wine bar showcases fine bottles from Italy and beyond, by the glass or the bottle. Ask us for pairing suggestions.'],

    // Tasting
    ['tasting_title_fr', 'Menu dégustation'],
    ['tasting_title_en', 'Tasting menu'],
    ['tasting_kicker_fr', "Vivez l'expérience"],
    ['tasting_kicker_en', 'Live the experience'],
    ['tasting_price', '75'],
    ['tasting_intro_fr', "Laissez la cuisine vous guider à travers une succession de services pensés par le chef — une découverte gourmande, du premier au dernier plat. Informez-vous auprès de votre serveur."],
    ['tasting_intro_en', 'Let the kitchen guide you through a succession of chef-designed courses — a delicious journey from the first plate to the last. Ask your server for details.'],

    // Reservation widget (third-party). mode: 'embed' | 'link' | 'soon'
    ['reservation_mode', 'soon'],
    ['reservation_embed_code', ''],
    ['reservation_url', ''],
    ['reservation_title_fr', 'Réservez votre table'],
    ['reservation_title_en', 'Reserve your table'],
    ['reservation_intro_fr', "Réservez en quelques secondes. Pour les groupes et les occasions spéciales, écrivez-nous."],
    ['reservation_intro_en', 'Book in seconds. For groups and special occasions, write to us.'],
    ['reservation_note_fr', ''],
    ['reservation_note_en', ''],

    // Contact
    ['contact_title_fr', 'Nous joindre'],
    ['contact_title_en', 'Contact us'],
    ['contact_intro_fr', "Une question, un commentaire ou une demande pour un événement ? Écrivez-nous, nous vous répondrons avec plaisir."],
    ['contact_intro_en', 'A question, a comment or an event request? Write to us — we will be glad to reply.'],
    ['contact_disclaimer_fr', "Ce formulaire ne sert pas aux réservations. Pour réserver une table, utilisez le bouton « Réservez »."],
    ['contact_disclaimer_en', 'This form cannot be used for reservations. To book a table, please use the “Reserve” button.'],

    // Location
    ['location_title_fr', 'Nous trouver'],
    ['location_title_en', 'Find us'],
    ['location_intro_fr', "Au 330, rue Saint-Georges, à Saint-Jérôme — au cœur du Vieux-Saint-Jérôme."],
    ['location_intro_en', 'At 330 Rue Saint-Georges in Saint-Jérôme — in the heart of Old Saint-Jérôme.'],

    // Reviews
    ['reviews_title_fr', 'Ce que disent nos invités'],
    ['reviews_title_en', 'What our guests say'],
    ['reviews_intro_fr', 'Merci à celles et ceux qui partagent leur soirée chez Voga.'],
    ['reviews_intro_en', 'Thank you to everyone who shares their evening at Voga.'],

    // Gallery
    ['gallery_title_fr', 'Galerie'],
    ['gallery_title_en', 'Gallery'],
    ['gallery_intro_fr', "Un aperçu de la salle, des assiettes et de l'ambiance."],
    ['gallery_intro_en', 'A glimpse of the room, the plates and the atmosphere.'],

    // Footer
    ['footer_intro_fr', "Cuisine italienne authentique et bar à vin, au cœur de Saint-Jérôme depuis 2014."],
    ['footer_intro_en', 'Authentic Italian cuisine and wine bar, in the heart of Saint-Jérôme since 2014.'],

    // Image slots (also kept in migrations.sql). Stored BARE; render-time transforms.
    ['_p_nav_logo_url', site('voga_logo.png')],
    ['_p_hero_image_url', site('hero_rigatoni.jpg')],
    ['_p_story_image_url', site('interior_banquettes.jpg')],
    ['_p_atmosphere_image_url', site('interior_room.jpg')],
    ['_p_wine_image_url', g('g12')],
    ['_p_tasting_image_url', g('g06')],
    ['_p_promo_image_url', site('capellini_dish.jpg')],
    ['_p_location_image_url', g('g30')],
    ['_p_reservation_image_url', site('cocktail_flame.jpg')],

    // Socials (operator adds the real links)
    ['social_facebook', ''],
    ['social_instagram', '']
  ];
  for (const [k, v] of settingsDefault) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }

  // ---------------------------------------------------------------------------
  // Menu categories
  // ---------------------------------------------------------------------------
  const categories = [
    ['zuppe', 'Zuppe', 'Zuppe', 'Soupes', 'Soups', 1],
    ['insalate', 'Insalate', 'Insalate', 'Salades', 'Salads', 2],
    ['sfizi', 'Sfizi', 'Sfizi', 'Entrées & petites assiettes', 'Starters & small plates', 3],
    ['risotto', 'Risotto', 'Risotto', 'Risottos crémeux', 'Creamy risotto', 4],
    ['pizza', 'Pizza', 'Pizza', 'Pizzas', 'Pizza', 5],
    ['pasta', 'Pasta', 'Pasta', 'Pâtes', 'Pasta', 6],
    ['scaloppini', 'Scaloppini e Pollo', 'Scaloppini e Pollo', 'Escalopes & poulet — servis avec des pâtes, choix du chef', 'Veal scaloppine & chicken — served with pasta, chef’s choice', 7],
    ['dolci', 'Dolci', 'Dolci', 'Desserts', 'Desserts', 8]
  ];
  for (const c of categories) {
    await db.run(
      'INSERT INTO menu_categories (slug, name_fr, name_en, subtitle_fr, subtitle_en, position) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING',
      c
    );
  }

  // Two-portion price helper (e.g. $13 / $18).
  const twoPrice = function(p1, p2){
    return JSON.stringify([
      { label_fr: 'Petite', label_en: 'Small', price: p1 },
      { label_fr: 'Grande', label_en: 'Large', price: p2 }
    ]);
  };

  // ---------------------------------------------------------------------------
  // Menu items — transcribed from the Ristorante Voga menu (2025-10-21).
  // [name_fr, name_en, desc_fr, desc_en, price, sizes_json, category, image_url, is_signature]
  // ---------------------------------------------------------------------------
  const items = [
    // --- Zuppe ---
    ['Stracciatella della nonna', 'Stracciatella della nonna', null, null, 9, null, 'zuppe', null, 0],
    ['Zuppa Vogà', 'Zuppa Vogà', null, null, 9, null, 'zuppe', null, 0],
    ['Potage inspiration', 'Potage inspiration', null, null, 10, null, 'zuppe', null, 0],

    // --- Insalate ---
    ['Arugula & Prosciutto', 'Arugula & Prosciutto', "Salade de roquette, prosciutto, Padano, huile d'olive & réduction de balsamique.", 'Arugula salad, prosciutto, Padano, olive oil & balsamic reduction.', null, twoPrice(13, 18), 'insalate', null, 0],
    ['Mista', 'Mista', "Salade mixte à l'italienne.", 'Italian-style mixed salad.', null, twoPrice(12, 17), 'insalate', null, 0],
    ['Cesare en Vogà', 'Cesare en Vogà', "Romaine, bacon et prosciutto croustillant, croûtons à l'ail rôti & Padano.", 'Romaine, crispy bacon and prosciutto, roasted-garlic croutons & Padano.', null, twoPrice(13, 18), 'insalate', g('g19'), 1],
    ['Cesare Piccante', 'Cesare Piccante', "Notre classique salade César, relevée d'une touche épicée, croûtons émiettés maison, bacon & parmesan.", 'Our classic Caesar with a spicy kick, house crumbled croutons, bacon & parmesan.', null, twoPrice(14, 19), 'insalate', null, 0],
    ['Giò', 'Giò', "Salade mixte, romaine, endives, radicchio, bocconcini, prosciutto, olives & tomates cerises. Servie avec poitrine de poulet grillé, paillard ou saucisses italiennes grillées.", 'Mixed greens, romaine, endive, radicchio, bocconcini, prosciutto, olives & cherry tomatoes. Served with grilled chicken breast, paillard or grilled Italian sausage.', 26, null, 'insalate', null, 0],
    ['Ajout de protéine', 'Add a protein', "Poulet grillé, saucisse italienne ou paillard, en ajout à votre salade.", 'Grilled chicken, Italian sausage or paillard, added to your salad.', 8, null, 'insalate', null, 0],

    // --- Sfizi ---
    ['Polpette della nonna (3)', 'Polpette della nonna (3)', "Recette secrète « della nonna », sauce tomate, Padano & basilic frais.", "Grandmother's secret recipe, tomato sauce, Padano & fresh basil.", 17, null, 'sfizi', g('g15'), 1],
    ['Polpettes à la Gigi (2) ou à la Fiorentina (2)', 'Polpette alla Gigi (2) or alla Fiorentina (2)', "Deux boulettes à la Gigi, ou deux à la Fiorentina.", 'Two meatballs alla Gigi, or two alla Fiorentina.', 17, null, 'sfizi', null, 0],
    ['Calamari Fritti alla Fradiavolo', 'Calamari Fritti alla Fradiavolo', "Calmars frits, sauce fra diavolo.", 'Fried calamari, fra diavolo sauce.', 20, null, 'sfizi', null, 0],
    ['Salmone Affumicato alla Ricotta', 'Salmone Affumicato alla Ricotta', "Saumon fumé, mélange de ricotta, fromage à la crème & aneth frais, servi sur des croûtons de concombre.", 'Smoked salmon, ricotta blend, cream cheese & fresh dill, served on cucumber croutons.', 20, null, 'sfizi', null, 0],
    ['Arancini alla Siciliana (2)', 'Arancini alla Siciliana (2)', "Boules de risotto panées & farcies à la sicilienne.", 'Sicilian-style breaded, stuffed risotto balls.', 17, null, 'sfizi', null, 0],
    ['Salsiccia Peperonata', 'Salsiccia Peperonata', "Saucisses italiennes piquantes, poivrons, oignons, champignons & sauce tomate.", 'Spicy Italian sausage, peppers, onions, mushrooms & tomato sauce.', 17, null, 'sfizi', null, 0],
    ['Bruschetta', 'Bruschetta', null, null, 12, null, 'sfizi', null, 0],
    ['Fondue Parmigiana', 'Fondue Parmigiana', "Recette maison.", 'House recipe.', 16, null, 'sfizi', null, 0],
    ['Caprese di Bufalone con Pomodoro', 'Caprese di Bufalone con Pomodoro', "Fromage bufalone, prosciutto, huile d'olive, pesto, tomates fraîches & basilic frais.", 'Bufala cheese, prosciutto, olive oil, pesto, fresh tomatoes & fresh basil.', 17, null, 'sfizi', g('g02'), 1],
    ['Brie in Crosta', 'Brie in Crosta', "Brie fondant enveloppé dans une pâte à pizza, bruschetta maison, oignons caramélisés, miel & réduction de balsamique.", 'Melting brie wrapped in pizza dough, house bruschetta, caramelized onions, honey & balsamic reduction.', 22, null, 'sfizi', null, 0],
    ['Poutine Vogà gourmet', 'Poutine Vogà gourmet', null, null, 22, null, 'sfizi', null, 0],
    ['Poutine 2puff', 'Poutine 2puff', "Sauce aux poivres, frites au parmesan & bacon, mozzarella & fromage en grains frais.", 'Pepper sauce, parmesan-and-bacon fries, mozzarella & fresh squeaky cheese curds.', 22, null, 'sfizi', null, 0],

    // --- Risotto ---
    ['Vogà', 'Vogà', "Cinq fromages, huile de truffe & champignons sauvages.", 'Five cheeses, truffle oil & wild mushrooms.', 26, null, 'risotto', g('g13'), 1],
    ['Alla Clo Clo', 'Alla Clo Clo', "Prosciutto, épinards, champignons, Padano & vin blanc.", 'Prosciutto, spinach, mushrooms, Padano & white wine.', 26, null, 'risotto', null, 0],
    ['Risotto Michele Angelo', 'Risotto Michele Angelo', "Saucisses italiennes, cinq fromages, poivrons, tomates séchées, asperges, brocoli & épinards.", 'Italian sausage, five cheeses, peppers, sun-dried tomatoes, asparagus, broccoli & spinach.', 27, null, 'risotto', null, 0],
    ['Risotto Frutti di Mare', 'Risotto Frutti di Mare', "Crevettes, pétoncles, crabe, champignons, cinq fromages & épinards.", 'Shrimp, scallops, crab, mushrooms, five cheeses & spinach.', 34, null, 'risotto', null, 0],
    ['Giò', 'Giò', "Champignons, bœuf braisé, épinards, poivrons grillés, huile de truffe & Padano.", 'Mushrooms, braised beef, spinach, grilled peppers, truffle oil & Padano.', 32, null, 'risotto', null, 0],

    // --- Pizza ---
    ['Pizza Americana', 'Pizza Americana', "Sauce tomate, pepperoni, champignons, poivrons & mozzarella.", 'Tomato sauce, pepperoni, mushrooms, peppers & mozzarella.', 23, null, 'pizza', null, 0],
    ['Alla Peppino', 'Alla Peppino', "Capicollo piquant, champignons, mozzarella, tomates fraîches, bacon & oignons rouges.", 'Spicy capicollo, mushrooms, mozzarella, fresh tomatoes, bacon & red onions.', 25, null, 'pizza', null, 0],
    ['Polpettini', 'Polpettini', "Boulettes, basilic frais, Padano, bocconcini & mozzarella.", 'Meatballs, fresh basil, Padano, bocconcini & mozzarella.', 26, null, 'pizza', null, 0],
    ['Vogà', 'Vogà', "Pepperoni, champignons, oignons, piments forts, bacon & mozzarella.", 'Pepperoni, mushrooms, onions, hot peppers, bacon & mozzarella.', 25, null, 'pizza', null, 1],
    ['Margherita', 'Margherita', "Sauce tomate, mozzarella, tomates fraîches & fines herbes.", 'Tomato sauce, mozzarella, fresh tomatoes & herbs.', 21, null, 'pizza', null, 0],
    ['Mafiosa', 'Mafiosa', "Saucisses italiennes piquantes, mozzarella & basilic frais.", 'Spicy Italian sausage, mozzarella & fresh basil.', 24, null, 'pizza', null, 0],
    ['Carolina', 'Carolina', "Pancetta, champignons, tomates séchées, épinards, mozzarella & fromage de chèvre.", 'Pancetta, mushrooms, sun-dried tomatoes, spinach, mozzarella & goat cheese.', 25, null, 'pizza', null, 0],
    ['Bufalone Prosciutto & Arugula', 'Bufalone Prosciutto & Arugula', "Sauce tomate, fromage bufalone, prosciutto & roquette.", 'Tomato sauce, bufala cheese, prosciutto & arugula.', 28, null, 'pizza', null, 0],
    ['Mortadella e Burrata', 'Mortadella e Burrata', "Sauce tomate, mozzarella, garnie de mortadelle italienne, burrata crémeuse & un filet de pesto frais.", 'Tomato sauce, mozzarella, topped with Italian mortadella, creamy burrata & a drizzle of fresh pesto.', 28, null, 'pizza', null, 0],
    ['Cosa Nostra', 'Cosa Nostra', "Saucisses italiennes piquantes, pancetta, boulettes, capicollo, soppressata calabrese, mozzarella & Padano.", 'Spicy Italian sausage, pancetta, meatballs, capicollo, Calabrese soppressata, mozzarella & Padano.', 30, null, 'pizza', null, 0],
    ['Frutti di Mare', 'Frutti di Mare', "Croûte beurre à l'ail et sauce crème maison, câpres frits, garnie de crevettes, chair de crabe, pétoncles & roquette croquante.", 'Garlic-butter crust and house cream sauce, fried capers, topped with shrimp, crab meat, scallops & crisp arugula.', 35, null, 'pizza', null, 0],

    // --- Pasta ---
    ['Rigatoni Arrabbiata & Salsiccia', 'Rigatoni Arrabbiata & Salsiccia', "Sauce tomate épicée et saucisse italienne piquante.", 'Spicy tomato sauce and hot Italian sausage.', 24, null, 'pasta', g('g01'), 0],
    ['Capellini del Capo', 'Capellini del Capo', "Consommé, huile d'olive, pesto, poivrons, roquette, ail, tomates fraîches, échalotes, Padano & vin blanc.", 'Consommé, olive oil, pesto, peppers, arugula, garlic, fresh tomatoes, shallots, Padano & white wine.', 23, null, 'pasta', g('g05'), 1],
    ['Capellini Carolina', 'Capellini Carolina', "Consommé, huile d'olive, tomates séchées, asperges, kale, champignons, fromage de chèvre, Padano & vin blanc.", 'Consommé, olive oil, sun-dried tomatoes, asparagus, kale, mushrooms, goat cheese, Padano & white wine.', 24, null, 'pasta', null, 0],
    ['Pennine Marco Polo', 'Pennine Marco Polo', "Sauce rosée piquante, brocoli, pancetta, ail, échalotes, Padano & vin blanc.", 'Spicy rosé sauce, broccoli, pancetta, garlic, shallots, Padano & white wine.', 25, null, 'pasta', null, 0],
    ['Tagliatelle Monte Carlo', 'Tagliatelle Monte Carlo', "Sauce à la crème, saucisses italiennes piquantes, cinq fromages, tomates séchées, épinards, Padano & vin blanc.", 'Cream sauce, spicy Italian sausage, five cheeses, sun-dried tomatoes, spinach, Padano & white wine.', 28, null, 'pasta', null, 0],
    ['Gnocchi con Pomodoro, Basilico & Bocconcini', 'Gnocchi con Pomodoro, Basilico & Bocconcini', "Sauce tomate, bocconcini, basilic frais, pesto, Padano & vin blanc.", 'Tomato sauce, bocconcini, fresh basil, pesto, Padano & white wine.', 25, null, 'pasta', null, 0],
    ['Linguini Piemontese', 'Linguini Piemontese', "Consommé, épinards, tomates fraîches, champignons, bocconcini, Padano & vin blanc.", 'Consommé, spinach, fresh tomatoes, mushrooms, bocconcini, Padano & white wine.', 25, null, 'pasta', null, 0],
    ['Linguini Nautica', 'Linguini Nautica', "Sauce rosée, crevettes, pétoncles, crabe, ail, échalotes & vin blanc.", 'Rosé sauce, shrimp, scallops, crab, garlic, shallots & white wine.', 35, null, 'pasta', null, 0],
    ['Tortellini ou Gnocchi Rosé', 'Tortellini or Gnocchi Rosé', "Tortellini ou gnocchi, sauce rosée.", 'Tortellini or gnocchi, rosé sauce.', 25, null, 'pasta', null, 0],
    ['Tortellini ou Gnocchi Vogà', 'Tortellini or Gnocchi Vogà', "Sauce rosée, pancetta, champignons, échalotes, Padano & vin blanc.", 'Rosé sauce, pancetta, mushrooms, shallots, Padano & white wine.', 26, null, 'pasta', null, 0],
    ['Tagliatelle alla Mortadella con Funghi e Spinaci', 'Tagliatelle alla Mortadella con Funghi e Spinaci', "Sauce crémeuse à la mortadelle, champignons sautés, épinards frais, ail & Padano.", 'Creamy mortadella sauce, sautéed mushrooms, fresh spinach, garlic & Padano.', 29, null, 'pasta', null, 0],
    ['Fettuccini alla Gigi', 'Fettuccini alla Gigi', "Sauce rosée, champignons, prosciutto, Padano & vin blanc.", 'Rosé sauce, mushrooms, prosciutto, Padano & white wine.', 25, null, 'pasta', null, 0],
    ['Rigatoni Montanara Vogà', 'Rigatoni Montanara Vogà', "Sauce à la viande rosée, saucisses italiennes piquantes, poivrons, champignons, oignons, Padano & basilic frais.", 'Rosé meat sauce, spicy Italian sausage, peppers, mushrooms, onions, Padano & fresh basil.', 29, null, 'pasta', null, 0],
    ['Tagliatelle « Giò »', 'Tagliatelle “Giò”', "Consommé, fond de veau, légèrement tomaté, bœuf braisé et légumes du marché, vin blanc, basilic frais & Padano.", 'Consommé, veal stock, lightly tomatoed, braised beef and market vegetables, white wine, fresh basil & Padano.', 32, null, 'pasta', null, 0],
    ['Linguini Siracusa', 'Linguini Siracusa', "Sauce crème, ail, échalotes, vin blanc, crevettes, épinards, basilic frais & Padano.", 'Cream sauce, garlic, shallots, white wine, shrimp, spinach, fresh basil & Padano.', 32, null, 'pasta', null, 0],
    ['Rigatoni Mona Lisa', 'Rigatoni Mona Lisa', "Sauce à la crème, pesto, poulet grillé, brocoli, Padano & vin blanc.", 'Cream sauce, pesto, grilled chicken, broccoli, Padano & white wine.', 28, null, 'pasta', null, 0],
    ['Spaghetti Bolognese, Polpette & Bocconcini', 'Spaghetti Bolognese, Polpette & Bocconcini', "Sauce à la viande maison, basilic frais, Padano, boulettes & bocconcini.", 'House meat sauce, fresh basil, Padano, meatballs & bocconcini.', 28, null, 'pasta', null, 0],
    ['Spaghetti Carbonara', 'Spaghetti Carbonara', "Crème, œufs, pancetta, Padano, oignons & vin blanc.", 'Cream, eggs, pancetta, Padano, onions & white wine.', 26, null, 'pasta', null, 0],
    ['Tagliatelle alla Peppino', 'Tagliatelle alla Peppino', "Sauce tomate piquante, saucisses italiennes, boulettes, rapinis, champignons, basilic, bocconcini, Padano & vin blanc.", 'Spicy tomato sauce, Italian sausage, meatballs, rapini, mushrooms, basil, bocconcini, Padano & white wine.', 28, null, 'pasta', g('g21'), 0],
    ['Lasagna Vogà', 'Lasagna Vogà', "Boulettes, saucisses italiennes, pancetta, cinq fromages, sauce à la viande rosée, gratinée.", 'Meatballs, Italian sausage, pancetta, five cheeses, rosé meat sauce, gratinéed.', 26, null, 'pasta', null, 1],

    // --- Scaloppini e Pollo (served with pasta, chef's choice) ---
    ['Saltimbocca Vogà', 'Saltimbocca Vogà', "Vin blanc, demi-glace, tomates fraîches, prosciutto, bocconcini & basilic frais.", 'White wine, demi-glace, fresh tomatoes, prosciutto, bocconcini & fresh basil.', 31, null, 'scaloppini', null, 1],
    ['Piccata al Limone', 'Piccata al Limone', "Sauce au beurre citronné & vin blanc.", 'Lemon-butter sauce & white wine.', 32, null, 'scaloppini', null, 0],
    ['Alla Parmigiana', 'Alla Parmigiana', "Panée, nappée de sauce tomate, gratinée, basilic & Padano.", 'Breaded, topped with tomato sauce, gratinéed, basil & Padano.', 32, null, 'scaloppini', null, 0],
    ['Alla Francesca', 'Alla Francesca', "Panée à l'œuf, sauce au beurre citronné & vin blanc.", 'Egg-battered, lemon-butter sauce & white wine.', 32, null, 'scaloppini', null, 0],
    ['La Marsala', 'La Marsala', "Vin marsala, demi-glace & champignons.", 'Marsala wine, demi-glace & mushrooms.', 31, null, 'scaloppini', null, 0],
    ['Alla Fiorentina', 'Alla Fiorentina', "Crème, échalotes, champignons, épinards, tomates séchées & vin blanc.", 'Cream, shallots, mushrooms, spinach, sun-dried tomatoes & white wine.', 32, null, 'scaloppini', null, 0],
    ['Roccato', 'Roccato', "Sauce aux cinq poivres, flambée au cognac, pancetta, poivrons & champignons.", 'Five-pepper sauce, flambéed in cognac, pancetta, peppers & mushrooms.', 31, null, 'scaloppini', null, 0],
    ['Pollo Parmigiana', 'Pollo Parmigiana', "Poulet pané, nappé de sauce tomate, gratiné, basilic & Padano.", 'Breaded chicken, topped with tomato sauce, gratinéed, basil & Padano.', 32, null, 'scaloppini', null, 0],
    ['Pollo Toscano', 'Pollo Toscano', "Poitrine de poulet grillée, garnie de courgettes et poivrons sautés, sauce jardinière, fromage de chèvre fondant, accompagnée de pâtes aglio e olio maison.", 'Grilled chicken breast, topped with sautéed zucchini and peppers, garden sauce, melting goat cheese, served with house aglio e olio pasta.', 33, null, 'scaloppini', null, 0],

    // --- Dolci ---
    ['Barres Mars ou Caramilk frites', 'Fried Mars or Caramilk bar', "Une gourmandise croustillante à l'extérieur, irrésistiblement fondante à l'intérieur.", 'Crisp on the outside, irresistibly molten within.', 8, null, 'dolci', null, 0],
    ['Cornetti au Nutella', 'Nutella Cornetti', "La gourmandise à l'italienne : pâte légère, Nutella fondant, pur plaisir.", 'Italian indulgence: light pastry, molten Nutella, pure pleasure.', 8, null, 'dolci', null, 0],
    ['Cannoli à la ricotta maison', 'House ricotta Cannoli', "Délice italien garni d'une onctueuse ricotta préparée sur place.", 'Italian classic filled with silky house-made ricotta.', 8, null, 'dolci', null, 0],
    ['Gâteau au fromage & carottes caramel', 'Cheesecake & caramel carrot cake', "Un mariage gourmand entre la douceur du cheesecake et le moelleux du carrot cake, nappé de caramel.", 'A gourmand marriage of creamy cheesecake and tender carrot cake, draped in caramel.', 12, null, 'dolci', null, 0],
    ['Tarte Divine Key Lime', 'Divine Key Lime tart', "Acidulée et crémeuse, sur une croûte croustillante.", 'Tangy and creamy on a crisp crust.', 12, null, 'dolci', null, 0],
    ['Tiramisu fait maison', 'House-made Tiramisu', "Classique italien crémeux, café et mascarpone, préparé sur place avec amour.", 'Creamy Italian classic, coffee and mascarpone, made in-house with love.', 12, null, 'dolci', null, 1],
    ['Tarte Frutti di Bosco', 'Frutti di Bosco tart', "Fraîche et colorée, un mélange de baies juteuses sur un lit crémeux.", 'Fresh and colourful, a medley of juicy berries on a creamy base.', 10, null, 'dolci', null, 0],
    ['Gelato', 'Gelato', "Citron, pistache, Nutella, vanille ou framboise.", 'Lemon, pistachio, Nutella, vanilla or raspberry.', 7, null, 'dolci', null, 0]
  ];

  const menuCount = await db.get('SELECT COUNT(*) AS c FROM menu_items').catch(function(){ return { c: 0 }; });
  if (!menuCount || Number(menuCount.c) === 0) {
    // position is sequential within category; reset counter when category changes
    const catPos = {};
    for (const it of items) {
      const cat = it[6];
      catPos[cat] = (catPos[cat] || 0) + 1;
      await db.run(
        'INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,sizes_json,category,image_url,is_signature,position,available) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1)',
        [it[0], it[1], it[2], it[3], it[4], it[5], it[6], it[7], it[8], catPos[cat]]
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Gallery — 30 photos with unique descriptive alt text (FR + EN).
  // [label, category, alt_fr, alt_en]
  // ---------------------------------------------------------------------------
  const gallery = [
    ['g14', 'interior', "Salle à manger aux alcôves cintrées en bois rétroéclairées, banquette verte et tables dressées de verres", 'Dining room with backlit arched wood alcoves, green banquette and set tables with stemware'],
    ['g01', 'dishes', "Rigatoni en sauce tomate dans un bol à liseré doré, garni de menthe, avec panier de pain", 'Rigatoni in red tomato sauce in a gold-rimmed bowl, garnished with mint, beside a bread basket'],
    ['g22', 'interior', "Salle à manger chaleureuse avec banquettes, chaises en bois, fresque murale et long bar latéral", 'Warm dining room with banquette seating, wooden chairs, mural wall and a long side bar'],
    ['g15', 'dishes', "Boulettes de viande en sauce tomate garnies de copeaux de fromage sur assiette blanche", 'Meatballs in tomato sauce topped with shaved cheese on a white plate'],
    ['g12', 'wine', "Deux mains trinquant avec des verres gravés du logo Voga, vin blanc et vin rouge", 'Two hands toasting Voga-etched wine glasses, one white and one red wine'],
    ['g07', 'interior', "Salle à manger chaleureuse aux banquettes vertes, arches lumineuses et bar en bois massif", 'Warm dining room with green banquettes, lit arched alcoves and a live-edge wood bar'],
    ['g02', 'dishes', "Crostino grillé garni de pesto, mozzarella et charcuterie italienne sur assiette blanche", 'Grilled crostino topped with pesto, mozzarella and Italian cured ham on a white plate'],
    ['g25', 'drinks', "Cocktail rouge orangé sur glace garni d'une tranche d'agrume séchée, dans une ambiance tamisée", 'Reddish-orange cocktail over ice garnished with a dried citrus slice in dim mood lighting'],
    ['g04', 'interior', "Banquette courbe en cuir vert, miroirs en arche rétroéclairés et décor de cerfs dorés", 'Curved green leather banquette, backlit arched mirrors and golden deer decor'],
    ['g13', 'dishes', "Risotto crémeux aux champignons dans un bol à liseré doré, garni de menthe", 'Creamy mushroom risotto in a gold-rimmed bowl, garnished with mint'],
    ['g28', 'interior', "Bar aux étagères à spiritueux rétroéclairées sous une arche, tabourets sombres et foyer allumé", 'Bar with backlit liquor shelves under an arch, dark stools and a lit fireplace'],
    ['g21', 'dishes', "Tagliatelles fraîches en sauce tomate au basilic, servies avec un verre de vin rouge griffé Voga", 'Fresh tagliatelle in tomato sauce with basil, served with a Voga-branded glass of red wine'],
    ['g10', 'interior', "Vue large de la salle aux alcôves cintrées, banquettes vertes et pilier central", 'Wide dining room view with arched alcoves, green banquettes and a central pillar'],
    ['g17', 'dishes', "Beignets dorés avec tranche de citron, garniture croustillante et sauce crémeuse sur assiette blanche", 'Golden battered fritters with lemon, crispy garnish and creamy sauce on a white plate'],
    ['g09', 'drinks', "Cocktail café en verre coupe à côté d'une flamme sur une table sombre", 'Coffee cocktail in a coupe glass beside a flame on a dark table'],
    ['g06', 'atmosphere', "Grande table garnie de plats italiens, deux bouteilles de vin et des verres devant une banquette verte", 'Table laid with many Italian dishes, two wine bottles and glasses before a green booth'],
    ['g08', 'interior', "Vue en enfilade de la salle à manger : banquette verte, table dressée, miroirs en arche et mur de marbre", 'Angled view down the dining room with green banquette, set table, arched mirrors and marble wall'],
    ['g19', 'dishes', "Salade César vue de dessus avec romaine, croûtons et fromage râpé dans un bol", 'Overhead Caesar salad with romaine, croutons and grated cheese in a bowl'],
    ['g11', 'interior', "Salle à manger avec foyer décoratif lumineux, plante et table dressée devant une murale en agate", 'Dining room with a glowing decorative fireplace, potted plant and a set table by an agate mural'],
    ['g16', 'drinks', "Cocktail rouge en verre haut à bord givré, garni de citron, cornichon, olive et pepperoni", 'Tall red cocktail with a salted rim, garnished with lemon, pickle, olive and pepperoni'],
    ['g03', 'dishes', "Assiette de viande grillée, sauce et légumes avec risotto, carafe dorée et vin rouge en arrière-plan", 'Plate of grilled meat with sauce and vegetables alongside risotto, gold carafe and red wine behind'],
    ['g24', 'interior', "Rangée de banquettes vertes et tables en bois sous des arches rétroéclairées, derrière une cloison à lattes", 'Row of green banquettes and wood tables beneath backlit arches behind a wood-slat partition'],
    ['g05', 'dishes', "Bol de capellini en sauce tomate aux légumes, garni de roquette, vu de haut sur bois foncé", 'Bowl of capellini in tomato sauce with vegetables, topped with arugula, on dark wood'],
    ['g18', 'interior', "Comptoir-bar en bois avec chaises noires, lustre à sphères et logo Voga rétroéclairé", 'Wooden bar counter with black chairs, sphere chandelier and backlit Voga logo'],
    ['g23', 'dishes', "Plat en sauce crémeuse aux épinards, champignons et tomates séchées, garni d'une tuile de parmesan", 'Plated dish in creamy sauce with spinach, mushrooms and sun-dried tomatoes, topped with a Parmesan tuile'],
    ['g20', 'drinks', "Cocktail bleu garni d'une rondelle d'agrume près d'un cocktail de café sur un bar sombre", 'Bright blue cocktail with a citrus wheel beside a coffee cocktail on a dark bar'],
    ['g26', 'interior', "Coin repas intime avec banquette verte, cloisons en lattes de bois et arche rétroéclairée en lumière ambrée", 'Intimate dining nook with green banquette, wooden slat partitions and a backlit arch in warm amber light'],
    ['g27', 'dishes', "Deux salades fraîches en assiettes avec bouteille et verre de vin rouge en arrière-plan", 'Two fresh plated salads with a bottle and glass of red wine in the softly lit background'],
    ['g29', 'drinks', "Trois shooters garnis de concombre devant des cocktails dont un martini espresso et une boisson bleue", 'Three pale shooters garnished with cucumber in front of cocktails including an espresso martini and a blue drink'],
    ['g30', 'exterior', "Façade en brique du restaurant Voga au crépuscule, enseigne lumineuse et adresse 330", 'Brick facade of Voga restaurant at dusk, with illuminated sign and the address 330']
  ];
  const galleryCount = await db.get('SELECT COUNT(*) AS c FROM gallery_images').catch(function(){ return { c: 0 }; });
  if (!galleryCount || Number(galleryCount.c) === 0) {
    let pos = 0;
    for (const row of gallery) {
      pos++;
      await db.run(
        'INSERT INTO gallery_images (image_url, alt_fr, alt_en, category, position, active) VALUES ($1,$2,$3,$4,$5,1)',
        [g(row[0]), row[2], row[3], row[1], pos]
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Current promotion — the house special offer (the tasting experience).
  // ---------------------------------------------------------------------------
  const promoCount = await db.get('SELECT COUNT(*) AS c FROM promotions').catch(function(){ return { c: 0 }; });
  if (!promoCount || Number(promoCount.c) === 0) {
    await db.run(
      'INSERT INTO promotions (title_fr,title_en,description_fr,description_en,badge_fr,badge_en,image_url,cta_label_fr,cta_label_en,cta_url,position,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
      [
        "Vivez l'expérience — Menu dégustation",
        'Live the experience — Tasting menu',
        "Laissez le chef vous guider à travers une succession de services. 75 $ par personne. Informez-vous auprès de votre serveur.",
        'Let the chef guide you through a succession of courses. $75 per person. Ask your server for details.',
        "À l'affiche",
        'Featured',
        IMG + '/ristorantevoga/site/capellini_dish.jpg',
        'Réservez',
        'Reserve',
        '#reservation',
        1,
        1
      ]
    );
  }

  // tasting_courses, wine_items and reviews are intentionally left empty — the
  // operator adds the real seven courses, the wine list (Carte des vins) and
  // genuine guest reviews from the admin backend. The site renders graceful,
  // on-brand states for each until then.
};
