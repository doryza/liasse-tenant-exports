module.exports = async function(db) {
  const S = [
    ['business_name', 'Boutique Gélinas'],
    ['tagline', 'Des objets utiles et bien faits, vendus par catalogue.'],
    ['catalogue_edition', 'Catalogue — Édition automne-hiver'],
    ['hero_title', 'Des objets utiles, choisis avec soin.'],
    ['hero_subtitle', "Un petit catalogue d'articles pour la maison et l'atelier — commandés en ligne, emballés à la main, postés chez vous."],
    ['about_title', 'Le mot du comptoir'],
    ['about_text', "Boutique Gélinas, c'est un comptoir de vente par catalogue comme dans le temps : peu d'articles, mais des bons. Chaque pièce est choisie pour durer, vérifiée à la main, puis emballée dans du papier kraft et mise à la poste avec soin. Pas d'entrepôt géant, pas de pacotille — juste des objets qu'on est fiers de vous poster."],
    ['how_title', "Commander, c'est simple"],
    ['shipping_text', 'Livraison partout au Québec en 2 à 5 jours ouvrables. Emballage kraft recyclable, sans frais cachés.'],
    ['push_cta_text', 'Recevez un avis quand de nouveaux articles entrent au catalogue.']
  ];
  for (const [k, v] of S) await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  const IMG = [['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063217/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063217116.png'], ['_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063216/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063216114.png']];
  for (const [k, v] of IMG) await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
  const pc = await db.get('SELECT COUNT(*)::int AS n FROM products');
  if (!pc || !pc.n) {
    const P = [
      ['Planche à découper en érable', '1001', "Érable massif du Québec, huilée à la main à l'huile de lin. Rainure à jus, 40 × 25 cm. Elle s'use bien et se ressuie d'un coup de torchon.", 68, 'Cuisine', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063216/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063216338.png', 1, 1],
      ['Tasse en grès indigo', '1002', 'Tournée à la main, émail indigo profond, prise franche. 350 ml, va au lave-vaisselle et au micro-ondes.', 32, 'Cuisine', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063219/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063218911.png', 1, 0],
      ['Bougie de soya « Forêt boréale »', '1003', 'Cire de soya pure et huiles essentielles de sapin baumier. Environ 45 heures de combustion, mèche de coton.', 24, 'Maison', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063216/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063216315.png', 1, 1],
      ['Couverture de laine tissée', '1004', 'Laine mérinos tissée serrée, lisière cousue, rayure indigo. 130 × 180 cm — la couverture du salon pour les soirs frisquets.', 145, 'Maison', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063215/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063215409.png', 1, 0],
      ["Tablier d'atelier en toile cirée", '1005', 'Toile cirée 12 oz, sangles de cuir réglables, trois poches renforcées aux rivets. Il vieillit mieux que nous.', 85, 'Atelier', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063217/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063217645.png', 1, 1],
      ['Couteau pliant en noyer', '1006', 'Lame en inox de 8 cm, manche en noyer huilé, cran de sûreté. Livré affûté, prêt à travailler.', 96, 'Atelier', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063217/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063216930.png', 1, 0]
    ];
    for (const p of P) await db.run('INSERT INTO products (name, item_number, description, price, category, image_url, in_stock, featured) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', p);
  }
  const bc = await db.get('SELECT COUNT(*)::int AS n FROM posts');
  if (!bc || !bc.n) {
    const A = [
      ["Le catalogue d'automne est arrivé", "La nouvelle édition est en ligne : six pièces choisies pour la saison froide, de la planche d'érable à la couverture de laine.\n\nComme toujours, les quantités sont limitées — quand un numéro est épuisé, il quitte le catalogue jusqu'à la prochaine fournée. Activez les avis pour ne rien manquer.", 'Nouveautés', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063216/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063216619.png'],
      ['Comment nous emballons vos commandes', "Chaque bon de commande est préparé à la main : papier kraft, ficelle de coton, coins renforcés.\n\nPas de plastique bulle, pas de boîte trois fois trop grande. Votre colis part avec son numéro de bon et arrive comme une lettre qu'on a hâte d'ouvrir.", 'Coulisses', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783063216/tapavis_tenant_steven-gelinas/build_steven-gelinas_1783063216770.png'],
      ['Trois idées-cadeaux à moins de 40 $', "La tasse en grès indigo (nº 1002) et la bougie Forêt boréale (nº 1003) sont des valeurs sûres à offrir, sans se ruiner.\n\nGlissez une note au moment de commander et nous l'ajouterons au colis, écrite à la main.", 'Conseils', null],
      ['Les commandes des Fêtes', "Pour recevoir votre colis avant les Fêtes, postez votre bon de commande au plus tard le 15 décembre.\n\nAprès cette date, nous continuons d'expédier, mais la poste fait ce qu'elle peut — et nous aussi.", 'Avis', null]
    ];
    for (const a of A) await db.run('INSERT INTO posts (title, content, category, image_url, published) VALUES ($1,$2,$3,$4,1)', a);
  }
};