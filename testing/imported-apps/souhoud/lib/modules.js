/**
 * Admin module definitions. One entry per editable table: the admin shell
 * builds its list, its form and its API from this spec, so adding a column
 * here is all it takes to make it editable.
 *
 * Product categories live in their own table so the owner can add one; the
 * router fills the products form's category options from that table.
 */
module.exports = function (lang, categories = []) {
  const en = lang === 'en';
  const pick = (fr, eng) => (en ? eng : fr);

  const f = (name, type, fr, eng, help = ['', ''], options = {}) => Object.assign({
    name, type, label: pick(fr, eng), description: pick(help[0], help[1]),
    placeholder: '', maxLength: type === 'textarea' ? 8000 : 400,
  }, options);

  const text = (name, fr, eng, opts = {}) => f(name, 'text', fr, eng,
    ['Texte affiché dans la langue indiquée.', 'Text shown in the indicated language.'], opts);
  const area = (name, fr, eng, opts = {}) => f(name, 'textarea', fr, eng,
    ['Texte affiché dans la langue indiquée.', 'Text shown in the indicated language.'], opts);
  const num = (name, fr, eng, min = 0, max = 100000000) => f(name, 'number', fr, eng,
    ['Nombre entier. Les montants sont en cents : 100 = 1,00 $.', 'Whole number. Money is in cents: 100 = $1.00.'], { min, max, step: 1 });
  const bool = (name, fr, eng, help) => f(name, 'boolean', fr, eng, help, { default: 0 });
  const img = () => f('image_url', 'image', 'Image', 'Image',
    ['Image autorisée, idéalement 1200 × 1200 px. Laissez vide si vous n’avez pas encore la bonne image.',
      'Authorized image, ideally 1200 × 1200 px. Leave empty until you have the right one.']);
  const slug = () => f('slug', 'text', 'Adresse web (slug)', 'Web address (slug)',
    ['Laissez vide : elle sera créée à partir du nom.', 'Leave empty: it will be built from the name.'], { maxLength: 80 });
  const order = () => num('sort_order', 'Ordre d’affichage', 'Display order', 0, 9999);

  const modules = [
    {
      key: 'products', singular: 'product', icon: 'bag',
      label: pick('Produits', 'Products'),
      description: pick('Les articles en vente, leur prix, leur catégorie et leur disponibilité.', 'Items for sale, their price, category and availability.'),
      fields: [
        text('name', 'Nom (français)', 'Name (French)', { required: true }),
        text('name_en', 'Nom (anglais)', 'Name (English)'),
        f('category', 'select', 'Catégorie', 'Category',
          ['Rayon de la boutique où l’article apparaît.', 'Shop section the item appears in.'],
          { options: categories.map((c) => c.slug), required: true }),
        slug(),
        num('price_cents', 'Prix en cents (hors taxes)', 'Price in cents (before tax)'),
        bool('price_verified', 'Prix confirmé', 'Price confirmed',
          ['Tant que ce n’est pas coché, le site affiche « Prix à confirmer » et l’article ne peut pas être commandé.',
            'Until this is checked the site shows "Price to be confirmed" and the item cannot be ordered.']),
        text('brand', 'Marque', 'Brand', { maxLength: 80 }),
        text('sku', 'Code produit (SKU)', 'Product code (SKU)', { maxLength: 60 }),
        area('description', 'Description (français)', 'Description (French)'),
        area('description_en', 'Description (anglais)', 'Description (English)'),
        text('variant_label', 'Nom du choix (ex. Couleur)', 'Option label (e.g. Colour)', { maxLength: 60 }),
        text('variant_label_en', 'Nom du choix (anglais)', 'Option label (English)', { maxLength: 60 }),
        f('variants', 'list', 'Choix offerts', 'Available options',
          ['Un choix par ligne (couleurs, formats…).', 'One option per line (colours, sizes…).'], { maxLength: 2000 }),
        bool('in_stock', 'En stock', 'In stock', ['Décocher affiche « Rupture de stock ».', 'Unchecking shows "Out of stock".']),
        bool('taxable', 'Taxable', 'Taxable', ['Les livres imprimés sont exonérés de TVQ : décochez et ajustez au besoin.', 'Printed books are QST-exempt: uncheck and adjust as needed.']),
        bool('featured', 'Essentiel de la rentrée', 'Back-to-school essential', ['Affiche l’article sur l’accueil et en tête de boutique.', 'Shows the item on the home page and at the top of the shop.']),
        bool('published', 'Visible sur le site', 'Visible on the site', ['', '']),
        order(), img(),
      ],
    },
    {
      key: 'categories', singular: 'category', icon: 'grid',
      label: pick('Catégories', 'Categories'),
      description: pick('Les rayons de la boutique. Chaque produit appartient à une catégorie.', 'The shop sections. Every product belongs to one category.'),
      fields: [
        text('name', 'Nom (français)', 'Name (French)', { required: true }),
        text('name_en', 'Nom (anglais)', 'Name (English)'),
        slug(),
        area('description', 'Description (français)', 'Description (French)', { maxLength: 600 }),
        area('description_en', 'Description (anglais)', 'Description (English)', { maxLength: 600 }),
        bool('published', 'Visible sur le site', 'Visible on the site', ['', '']),
        order(), img(),
      ],
    },
    {
      key: 'bundles', singular: 'bundle', icon: 'list',
      label: pick('Listes scolaires', 'School lists'),
      description: pick('Une liste par niveau : les parents l’ajoutent au panier en un clic.', 'One list per grade: parents add it to their cart in one click.'),
      fields: [
        text('name', 'Nom (français)', 'Name (French)', { required: true }),
        text('name_en', 'Nom (anglais)', 'Name (English)'),
        slug(),
        text('grade', 'Niveau (français)', 'Grade (French)', { maxLength: 80 }),
        text('grade_en', 'Niveau (anglais)', 'Grade (English)', { maxLength: 80 }),
        area('description', 'Description (français)', 'Description (French)', { maxLength: 1000 }),
        area('description_en', 'Description (anglais)', 'Description (English)', { maxLength: 1000 }),
        f('items', 'list', 'Articles de la liste', 'Items in the list',
          ['Un article par ligne : « adresse-web-du-produit x quantité », ex. cahier-ligne-80-pages x 4.',
            'One item per line: "product-web-address x quantity", e.g. lined-notebook-80-pages x 4.'], { maxLength: 6000 }),
        bool('published', 'Visible sur le site', 'Visible on the site', ['', '']),
        order(), img(),
      ],
    },
    {
      key: 'orders', singular: 'order', icon: 'receipt',
      label: pick('Commandes', 'Orders'),
      description: pick('Les commandes de la boutique. Les montants ne sont jamais modifiables à la main.', 'Shop orders. Amounts can never be edited by hand.'),
      fields: [
        f('reference', 'readonly', 'Numéro', 'Reference'),
        text('name', 'Nom du client', 'Customer name', { required: true }),
        f('email', 'email', 'Courriel', 'Email', ['', ''], { required: true }),
        text('phone', 'Téléphone', 'Phone', { maxLength: 40 }),
        f('status', 'select', 'État', 'Status',
          ['« Prête » avertit le client que sa commande l’attend en boutique.', '"Ready" tells the customer their order is waiting in store.'],
          { options: ['awaiting_payment', 'paid', 'preparing', 'ready', 'shipped', 'fulfilled', 'cancelled'] }),
        f('fulfilment', 'select', 'Mode', 'Fulfilment', ['', ''], { options: ['pickup', 'shipping'] }),
        text('address_line', 'Adresse', 'Address'),
        text('address_city', 'Ville', 'City', { maxLength: 120 }),
        text('address_province', 'Province', 'Province', { maxLength: 60 }),
        text('address_postal', 'Code postal', 'Postal code', { maxLength: 12 }),
        text('tracking', 'Numéro de suivi', 'Tracking number', { maxLength: 120 }),
        area('note', 'Note', 'Note'),
        f('payment_status', 'readonly', 'Paiement', 'Payment'),
        f('total_cents', 'readonly', 'Total', 'Total'),
      ],
    },
    {
      key: 'messages', singular: 'message', icon: 'mail',
      label: pick('Messages', 'Messages'),
      description: pick('Les messages reçus par le formulaire de contact.', 'Messages received through the contact form.'),
      fields: [
        text('first_name', 'Prénom', 'First name', { required: true }),
        text('last_name', 'Nom', 'Last name'),
        f('email', 'email', 'Courriel', 'Email', ['', ''], { required: true }),
        text('phone', 'Téléphone', 'Phone', { maxLength: 40 }),
        text('subject', 'Sujet', 'Subject'),
        area('body', 'Message', 'Message', { required: true }),
        f('status', 'select', 'État', 'Status', ['', ''], { options: ['new', 'read', 'answered', 'archived'] }),
      ],
    },
    {
      key: 'hours', singular: 'hour', icon: 'clock',
      label: pick('Heures de cueillette', 'Pickup hours'),
      description: pick('Un jour par ligne, de lundi (1) à dimanche (7).', 'One row per day, Monday (1) to Sunday (7).'),
      fields: [
        num('weekday', 'Jour (1 = lundi)', 'Day (1 = Monday)', 1, 7),
        text('opens', 'Ouverture (HH:MM)', 'Opens (HH:MM)', { maxLength: 5 }),
        text('closes', 'Fermeture (HH:MM)', 'Closes (HH:MM)', { maxLength: 5 }),
        bool('closed', 'Fermé', 'Closed', ['', '']),
        text('note', 'Note (français)', 'Note (French)', { maxLength: 120 }),
        text('note_en', 'Note (anglais)', 'Note (English)', { maxLength: 120 }),
      ],
    },
  ];

  // Settings toggles surfaced on the Réglages page. Every one of these gates
  // something the site says or does on the owner's behalf.
  const settingsFields = [
    { name: 'contact_verified', label: pick('Coordonnées confirmées', 'Contact details confirmed'), description: pick('Téléphone et courriel exacts. Tant que ce n’est pas coché, le site les masque.', 'Phone and email are correct. Until this is checked the site hides them.') },
    { name: 'address_verified', label: pick('Adresse de cueillette confirmée', 'Pickup address confirmed'), description: pick('Active l’adresse et le lien d’itinéraire.', 'Enables the address and the directions link.') },
    { name: 'hours_verified', label: pick('Heures de cueillette confirmées', 'Pickup hours confirmed'), description: pick('Retire la mention « à confirmer » à côté des heures.', 'Removes the "to be confirmed" note next to the hours.') },
    { name: 'privacy_approved', label: pick('Avis de confidentialité approuvé', 'Privacy notice approved'), description: pick('Requis avant d’activer les formulaires et les commandes. L’avis doit être rempli en français et en anglais.', 'Required before enabling forms and orders. The notice must be filled in both languages.') },
    { name: 'messages_enabled', label: pick('Formulaire de contact actif', 'Contact form enabled'), description: pick('Permet aux visiteurs de vous écrire depuis le site.', 'Lets visitors write to you from the site.') },
    { name: 'shipping_enabled', label: pick('Livraison offerte', 'Shipping offered'), description: pick('Nécessite un tarif de livraison. Sans cela, seule la cueillette est proposée.', 'Needs a shipping rate. Without one, only pickup is offered.') },
    { name: 'payment_terms_approved', label: pick('Conditions de vente approuvées', 'Terms of sale approved'), description: pick('Requis avant d’encaisser. Les conditions doivent être rédigées dans les deux langues.', 'Required before taking money. The terms must be written in both languages.') },
    { name: 'payments_enabled', label: pick('Paiement en ligne actif', 'Online payment enabled'), description: pick('Active PayPal à la caisse. Demande aussi les clés PayPal.', 'Turns on PayPal at checkout. Also needs the PayPal keys.') },
    { name: 'live_actions_enabled', label: pick('Actions réelles activées', 'Live actions enabled'), description: pick('Interrupteur général : courriels envoyés, paiements encaissés, téléversements permis.', 'Master switch: emails sent, payments captured, uploads allowed.') },
  ];

  return { modules, settingsFields };
};
