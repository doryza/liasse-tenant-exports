/**
 * First-install seed. Souhoud signed up with a brief and no catalogue, no
 * photographs and no address, so what is seeded here is a STARTER STORE:
 * the categories a school-supply shop needs, a representative catalogue the
 * owner edits from the admin area, and four school lists. Nothing here
 * claims to be a fact about the business — every price is marked
 * unconfirmed (the site shows « Prix à confirmer » and refuses to sell it
 * until the owner ticks it), the images are studio illustrations, and every
 * gate that speaks for the shop or moves money starts closed.
 *
 * Runs once, guarded by the platform `_seed_version` sentinel.
 */
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });
const img = (group, slug) => (assets[group] && assets[group][slug]) || '';

// [slug, fr, en, fr description, en description]
const CATEGORIES = [
  ['cahiers-et-papeterie', 'Cahiers & papeterie', 'Notebooks & paper',
    'Cahiers, feuilles mobiles, cartables et séparateurs pour toute l’année.', 'Notebooks, loose-leaf paper, binders and dividers for the whole year.'],
  ['ecriture', 'Écriture', 'Writing',
    'Crayons, stylos, surligneurs, gommes et ensembles de géométrie.', 'Pencils, pens, highlighters, erasers and geometry sets.'],
  ['arts-et-bricolage', 'Arts & bricolage', 'Arts & crafts',
    'Crayons de couleur, marqueurs, ciseaux et colle pour créer.', 'Coloured pencils, markers, scissors and glue for making things.'],
  ['sacs-a-dos', 'Sacs à dos', 'Backpacks',
    'Du premier sac de maternelle au sac à dos avec pochette pour ordinateur.', 'From the first kindergarten bag to a backpack with a laptop sleeve.'],
  ['valises', 'Valises & sacs de voyage', 'Suitcases & travel bags',
    'Valises cabine, sacs de sport et trousses pour les sorties et les voyages.', 'Carry-on suitcases, gym bags and pouches for trips and outings.'],
  ['livres', 'Livres & cahiers d’exercices', 'Books & workbooks',
    'Dictionnaires, cahiers d’activités et agendas scolaires.', 'Dictionaries, activity workbooks and school agendas.'],
  ['organisation', 'Étuis, boîtes à lunch & organisation', 'Cases, lunch boxes & organization',
    'Étuis à crayons, boîtes à lunch et bouteilles pour une journée bien rangée.', 'Pencil cases, lunch boxes and bottles for a well-organized day.'],
];

// [slug, category, fr name, en name, price_cents, taxable, fr description, en description, variant label fr, variant label en, variants[]]
const PRODUCTS = [
  ['cahier-ligne-80-pages', 'cahiers-et-papeterie', 'Cahier ligné 80 pages', 'Lined notebook, 80 pages', 149, 1,
    'Le classique du primaire : 80 pages lignées, couverture souple et marge rouge.', 'The primary-school classic: 80 lined pages, soft cover and a red margin.',
    'Couleur', 'Colour', ['Bleu', 'Rouge', 'Vert', 'Jaune']],
  ['cahier-spirale-3-sujets', 'cahiers-et-papeterie', 'Cahier spirale 3 sujets, 300 pages', '3-subject spiral notebook, 300 pages', 599, 1,
    'Trois sections séparées par des onglets, parfait pour le secondaire.', 'Three sections split by tabs — ideal for high school.', '', '', []],
  ['feuilles-mobiles-200', 'cahiers-et-papeterie', 'Feuilles mobiles lignées, 200 feuilles', 'Lined loose-leaf paper, 200 sheets', 449, 1,
    'Format lettre, trois trous, prêtes pour le cartable.', 'Letter size, three-hole punched, ready for the binder.', '', '', []],
  ['cartable-1-pouce', 'cahiers-et-papeterie', 'Cartable à anneaux 1 po', '1-inch ring binder', 499, 1,
    'Anneaux en D, pochette intérieure et couverture rigide.', 'D-rings, inside pocket and a rigid cover.', 'Couleur', 'Colour', ['Bleu', 'Noir', 'Rose']],
  ['separateurs-8-onglets', 'cahiers-et-papeterie', 'Séparateurs 8 onglets', '8-tab dividers', 299, 1,
    'Huit onglets de couleur à insérer dans le cartable.', 'Eight coloured tabs to slot into the binder.', '', '', []],

  ['crayons-hb-boite-12', 'ecriture', 'Crayons à mine HB, boîte de 12', 'HB pencils, box of 12', 349, 1,
    'Mine HB, bois certifié, avec gomme au bout.', 'HB lead, certified wood, eraser tip.', '', '', []],
  ['stylos-gel-8-couleurs', 'ecriture', 'Stylos gel, 8 couleurs', 'Gel pens, 8 colours', 799, 1,
    'Encre gel fluide, pointe 0,7 mm, huit couleurs vives.', 'Smooth gel ink, 0.7 mm tip, eight bright colours.', '', '', []],
  ['surligneurs-4', 'ecriture', 'Surligneurs, paquet de 4', 'Highlighters, pack of 4', 449, 1,
    'Pointe biseautée, encre qui ne traverse pas la page.', 'Chisel tip, ink that does not bleed through.', '', '', []],
  ['gommes-a-effacer-3', 'ecriture', 'Gommes à effacer blanches, paquet de 3', 'White erasers, pack of 3', 249, 1,
    'Efface proprement sans tacher le papier.', 'Erases cleanly without smudging the page.', '', '', []],
  ['ensemble-geometrie', 'ecriture', 'Ensemble de géométrie', 'Geometry set', 699, 1,
    'Règle 30 cm, deux équerres, rapporteur et compas dans un étui rigide.', '30 cm ruler, two set squares, protractor and compass in a hard case.', '', '', []],

  ['crayons-de-couleur-24', 'arts-et-bricolage', 'Crayons de couleur, 24', 'Coloured pencils, 24', 899, 1,
    'Vingt-quatre couleurs pré-taillées, mine résistante.', 'Twenty-four pre-sharpened colours, break-resistant lead.', '', '', []],
  ['marqueurs-lavables-12', 'arts-et-bricolage', 'Marqueurs lavables, 12', 'Washable markers, 12', 799, 1,
    'Encre lavable qui part des mains et des vêtements.', 'Washable ink that comes off hands and clothes.', '', '', []],
  ['ciseaux-5-pouces', 'arts-et-bricolage', 'Ciseaux à bouts ronds 5 po', 'Blunt-tip scissors, 5 in', 349, 1,
    'Bouts ronds et poignées souples, pour les petites mains.', 'Rounded tips and soft handles, made for small hands.', 'Main', 'Hand', ['Droitier', 'Gaucher']],
  ['batons-de-colle-3', 'arts-et-bricolage', 'Bâtons de colle, paquet de 3', 'Glue sticks, pack of 3', 399, 1,
    'Colle non toxique, séchage transparent.', 'Non-toxic glue that dries clear.', '', '', []],

  ['sac-a-dos-junior', 'sacs-a-dos', 'Sac à dos junior 15 L', 'Junior backpack 15 L', 3499, 1,
    'Léger, bretelles rembourrées et poche avant à glissière. Idéal de la maternelle à la 3e année.', 'Light, padded straps and a zipped front pocket. Ideal from kindergarten to grade 3.',
    'Motif', 'Pattern', ['Dinosaures', 'Licornes', 'Espace', 'Fleurs']],
  ['sac-a-dos-ado-25l', 'sacs-a-dos', 'Sac à dos 25 L avec pochette ordinateur', '25 L backpack with laptop sleeve', 5999, 1,
    'Dos rembourré, pochette pour ordinateur 15 po et porte-bouteille.', 'Padded back, 15-inch laptop sleeve and bottle holder.',
    'Couleur', 'Colour', ['Bleu ciel', 'Noir', 'Gris', 'Vert forêt']],

  ['valise-cabine-roulettes', 'valises', 'Valise cabine à roulettes 20 po', '20-inch carry-on suitcase', 9999, 1,
    'Coque rigide, quatre roulettes pivotantes et poignée télescopique.', 'Hard shell, four spinner wheels and a telescopic handle.',
    'Couleur', 'Colour', ['Bleu ciel', 'Noir', 'Rose']],
  ['sac-de-sport', 'valises', 'Sac de sport 30 L', 'Gym bag 30 L', 3999, 1,
    'Compartiment à chaussures et bandoulière ajustable.', 'Shoe compartment and adjustable shoulder strap.', '', '', []],
  ['trousse-de-toilette', 'valises', 'Trousse de toilette', 'Toiletry bag', 1499, 1,
    'Doublure lavable et crochet de suspension.', 'Washable lining and a hanging hook.', '', '', []],

  ['dictionnaire-francais', 'livres', 'Dictionnaire de français, édition scolaire', 'French dictionary, school edition', 2499, 0,
    'Le dictionnaire demandé au primaire et au secondaire.', 'The dictionary asked for in elementary and high school.', '', '', []],
  ['cahier-activites-maths', 'livres', 'Cahier d’activités — mathématiques', 'Activity workbook — mathematics', 1299, 0,
    'Exercices et corrigé pour pratiquer à la maison.', 'Exercises and answer key to practise at home.',
    'Niveau', 'Grade', ['1re année', '2e année', '3e année', '4e année', '5e année', '6e année']],
  ['agenda-scolaire', 'livres', 'Agenda scolaire', 'School agenda', 999, 1,
    'Une semaine sur deux pages, de septembre à juin.', 'A week across two pages, September to June.', '', '', []],

  ['etui-a-crayons', 'organisation', 'Étui à crayons', 'Pencil case', 899, 1,
    'Deux compartiments à glissière, tissu robuste.', 'Two zipped compartments, sturdy fabric.', 'Couleur', 'Colour', ['Bleu ciel', 'Jaune', 'Corail']],
  ['boite-a-lunch-isotherme', 'organisation', 'Boîte à lunch isotherme', 'Insulated lunch box', 2499, 1,
    'Garde le repas au frais jusqu’au dîner, intérieur lavable.', 'Keeps lunch cool until noon, wipe-clean lining.', '', '', []],
  ['bouteille-d-eau-500', 'organisation', 'Bouteille d’eau 500 ml', 'Water bottle 500 ml', 1299, 1,
    'Sans BPA, bouchon à paille et anse de transport.', 'BPA-free, straw lid and carry loop.', '', '', []],
];

const FEATURED = ['sac-a-dos-junior', 'cahier-ligne-80-pages', 'crayons-hb-boite-12', 'etui-a-crayons', 'valise-cabine-roulettes', 'boite-a-lunch-isotherme'];

// [slug, fr, en, grade fr, grade en, fr description, en description, items]
const BUNDLES = [
  ['maternelle', 'Liste Maternelle', 'Kindergarten list', 'Maternelle', 'Kindergarten',
    'Tout pour une première rentrée en douceur : de quoi dessiner, découper, coller et transporter son dîner.',
    'Everything for a gentle first September: things to draw, cut, glue and carry lunch.',
    ['crayons-de-couleur-24 x 1', 'marqueurs-lavables-12 x 1', 'ciseaux-5-pouces x 1', 'batons-de-colle-3 x 1', 'etui-a-crayons x 1', 'sac-a-dos-junior x 1', 'boite-a-lunch-isotherme x 1']],
  ['primaire-1-3', 'Liste 1re à 3e année', 'Grades 1 to 3 list', '1re à 3e année', 'Grades 1–3',
    'Les cahiers, crayons et outils d’un premier cycle du primaire.',
    'The notebooks, pencils and tools for the first cycle of elementary school.',
    ['cahier-ligne-80-pages x 4', 'crayons-hb-boite-12 x 1', 'gommes-a-effacer-3 x 1', 'crayons-de-couleur-24 x 1', 'ciseaux-5-pouces x 1', 'batons-de-colle-3 x 1', 'etui-a-crayons x 1', 'cartable-1-pouce x 1']],
  ['primaire-4-6', 'Liste 4e à 6e année', 'Grades 4 to 6 list', '4e à 6e année', 'Grades 4–6',
    'Plus de cahiers, un cartable, un ensemble de géométrie et le dictionnaire.',
    'More notebooks, a binder, a geometry set and the dictionary.',
    ['cahier-ligne-80-pages x 6', 'feuilles-mobiles-200 x 1', 'cartable-1-pouce x 2', 'separateurs-8-onglets x 1', 'crayons-hb-boite-12 x 1', 'stylos-gel-8-couleurs x 1', 'surligneurs-4 x 1', 'ensemble-geometrie x 1', 'dictionnaire-francais x 1', 'agenda-scolaire x 1']],
  ['secondaire', 'Liste Secondaire', 'High school list', 'Secondaire', 'High school',
    'Cahiers à spirale, cartables par matière et un sac qui protège l’ordinateur.',
    'Spiral notebooks, a binder per subject and a bag that protects the laptop.',
    ['cahier-spirale-3-sujets x 3', 'feuilles-mobiles-200 x 2', 'cartable-1-pouce x 3', 'separateurs-8-onglets x 2', 'stylos-gel-8-couleurs x 1', 'surligneurs-4 x 1', 'ensemble-geometrie x 1', 'sac-a-dos-ado-25l x 1', 'agenda-scolaire x 1']],
];

module.exports = async function seed(db) {
  // ---- Settings -----------------------------------------------------------
  const settings = {
    business_name: 'Souhoud',
    tagline: J('Votre référence pour les fournitures scolaires.', 'The go-to place for school supplies.'),
    hero_title: J('La rentrée, sans le stress.', 'Back to school, minus the stress.'),
    hero_subtitle: J(
      'Cahiers, crayons, sacs à dos et valises : tout ce qu’il faut pour l’école, au même endroit.',
      'Notebooks, pencils, backpacks and suitcases: everything they need for school, in one place.'),
    hero_note: J('Commandez en ligne, ramassez en boutique ou faites-vous livrer.', 'Order online, pick up in store or get it delivered.'),
    lists_title: J('Une liste par niveau, un clic pour tout mettre au panier', 'One list per grade, one click to add it all'),
    lists_text: J(
      'Choisissez le niveau de votre enfant : la liste complète s’ajoute au panier et vous ajustez les quantités comme vous voulez.',
      'Choose your child’s grade: the whole list drops into the cart and you adjust the quantities however you like.'),
    story_title: J('Tout pour l’école, sans courir partout', 'Everything for school, without running around'),
    story_text: J(
      'Souhoud rassemble les fournitures scolaires au même endroit : cahiers, crayons, sacs à dos, valises et tout ce qui rend une rentrée plus simple.\n\nCommandez en ligne, puis ramassez votre commande en boutique ou faites-vous livrer.',
      'Souhoud brings school supplies together in one place: notebooks, pencils, backpacks, suitcases and everything that makes a new school year simpler.\n\nOrder online, then pick your order up in store or have it delivered.'),
    about_text: J(
      'Souhoud est une boutique de fournitures scolaires. Nous vendons cahiers, livres, sacs à dos et valises directement aux familles, en ligne.\n\nNotre promesse : être l’endroit où l’on pense en premier pour les fournitures scolaires, avec des listes prêtes par niveau et un service simple, du panier à la cueillette.',
      'Souhoud is a school-supply shop. We sell notebooks, books, backpacks and suitcases directly to families, online.\n\nOur promise: to be the first place people think of for school supplies, with ready-made lists per grade and a simple service from cart to pickup.'),
    boutique_intro: J('Toute la boutique', 'The whole shop'),
    boutique_text: J('Magasinez par rayon ou cherchez un article précis.', 'Shop by section or search for a specific item.'),
    listes_intro: J('Listes scolaires', 'School lists'),
    listes_text: J(
      'Les listes ci-dessous regroupent les articles demandés le plus souvent pour chaque niveau. Ajoutez la liste complète au panier, puis retirez ou ajustez ce que vous avez déjà.',
      'The lists below gather the items most often asked for at each grade. Add the whole list to your cart, then remove or adjust what you already have.'),
    livraison_text: J(
      'Cueillette en boutique : toujours gratuite, pendant nos heures de cueillette.\nLivraison : offerte dès que la boutique l’active, au tarif affiché au panier.',
      'In-store pickup: always free, during our pickup hours.\nShipping: offered as soon as the shop turns it on, at the rate shown in the cart.'),
    contact_intro: J(
      'Une question sur un article, une liste ou une commande? Écrivez-nous, il nous fera plaisir de vous répondre.',
      'A question about an item, a list or an order? Write to us — we will be glad to help.'),
    privacy_notice: J(
      'Ce site recueille vos coordonnées afin de traiter votre message ou votre commande. Votre espace personnel vous permet de retrouver vos commandes. Les paiements en ligne sont traités par PayPal : aucun numéro de carte n’est enregistré sur ce site. Communiquez avec la boutique pour toute question concernant vos renseignements.',
      'This site collects your contact details in order to handle your message or your order. Your personal space lets you find your orders again. Online payments are processed by PayPal: no card number is stored on this site. Contact the shop with any question about your information.'),
    payment_terms: J('', ''),
    // Owner-controlled gates. Everything that speaks for the shop or spends
    // money stays off until the owner confirms it from the admin area.
    contact_verified: '0', address_verified: '0', hours_verified: '0',
    privacy_approved: '0', messages_enabled: '0',
    payments_enabled: '0', payment_terms_approved: '0', live_actions_enabled: '0',
    shipping_enabled: '0',
    free_shipping_threshold_cents: '0',
    shipping_flat_cents: '',
    gst_rate_bp: '500', qst_rate_bp: '998',
    gst_number: '', qst_number: '',
    _p_hero_image_url: assets.hero || '',
    _p_about_image_url: assets.about || '',
    _p_lists_image_url: assets.lists || '',
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO NOTHING', [key, String(value)]);
  }

  // ---- Categories ---------------------------------------------------------
  for (let i = 0; i < CATEGORIES.length; i++) {
    const [slug, name, nameEn, desc, descEn] = CATEGORIES[i];
    await db.run(
      'INSERT INTO categories(slug,name,name_en,description,description_en,image_url,sort_order) '
      + 'SELECT $1,$2,$3,$4,$5,$6,$7 WHERE NOT EXISTS(SELECT 1 FROM categories WHERE slug=$1)',
      [slug, name, nameEn, desc, descEn, img('category', slug), i + 1],
    );
  }

  // ---- Products (prices deliberately unconfirmed) ------------------------
  for (let i = 0; i < PRODUCTS.length; i++) {
    const [slug, category, name, nameEn, price, taxable, desc, descEn, variantLabel, variantLabelEn, variants] = PRODUCTS[i];
    await db.run(
      'INSERT INTO products(slug,category,name,name_en,price_cents,price_verified,taxable,description,description_en,variant_label,variant_label_en,variants,image_url,sort_order,featured) '
      + 'SELECT $1,$2,$3,$4,$5,0,$6,$7,$8,$9,$10,$11,$12,$13,$14 WHERE NOT EXISTS(SELECT 1 FROM products WHERE slug=$1)',
      [slug, category, name, nameEn, price, taxable, desc, descEn, variantLabel, variantLabelEn,
        variants.length ? JSON.stringify(variants) : '', img('product', slug), i + 1, FEATURED.includes(slug) ? 1 : 0],
    );
  }

  // ---- School lists -------------------------------------------------------
  for (let i = 0; i < BUNDLES.length; i++) {
    const [slug, name, nameEn, grade, gradeEn, desc, descEn, items] = BUNDLES[i];
    await db.run(
      'INSERT INTO bundles(slug,name,name_en,grade,grade_en,description,description_en,items,image_url,sort_order) '
      + 'SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10 WHERE NOT EXISTS(SELECT 1 FROM bundles WHERE slug=$1)',
      [slug, name, nameEn, grade, gradeEn, desc, descEn, JSON.stringify(items), img('bundle', slug), i + 1],
    );
  }

  // No opening hours and no address are seeded: the brief gave none, and
  // the footer says they will be confirmed until the owner enters them.
};

module.exports.CATEGORIES = CATEGORIES;
module.exports.PRODUCTS = PRODUCTS;
module.exports.BUNDLES = BUNDLES;
