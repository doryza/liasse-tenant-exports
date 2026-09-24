/**
 * Admin module definitions. One entry per editable table: the admin shell
 * builds its list, its form and its API from this spec, so adding a column
 * here is all it takes to make it editable.
 */
const FAMILIES = ['massotherapie', 'esthetique', 'ongles', 'corps', 'epilation', 'enfants', 'forfait', 'entreprise'];
const COLLECTIONS = ['ralentir', 'offrir', 'me-choisir', 'rituel'];

module.exports = function (lang) {
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
    ['Photo autorisée, idéalement 1200 × 1200 px. Laissez vide si vous n’avez pas encore la bonne photo.',
      'Authorized photo, ideally 1200 × 1200 px. Leave empty until you have the right one.']);
  const slug = () => f('slug', 'text', 'Adresse web (slug)', 'Web address (slug)',
    ['Laissez vide : elle sera créée à partir du nom.', 'Leave empty: it will be built from the name.'], { maxLength: 80 });
  const order = () => num('sort_order', 'Ordre d’affichage', 'Display order', 0, 9999);

  const modules = [
    {
      key: 'services', singular: 'service', icon: 'sparkle',
      label: pick('Soins et tarifs', 'Treatments & rates'),
      description: pick('Chaque soin affiché sur le site, avec sa durée et son tarif.', 'Every treatment shown on the site, with its duration and rate.'),
      fields: [
        text('name', 'Nom (français)', 'Name (French)', { required: true }),
        text('name_en', 'Nom (anglais)', 'Name (English)'),
        f('family', 'select', 'Famille de soins', 'Treatment family',
          ['Détermine la page sur laquelle le soin apparaît.', 'Decides which page the treatment appears on.'],
          { options: FAMILIES, required: true }),
        slug(),
        area('description', 'Résumé (français)', 'Summary (French)'),
        area('description_en', 'Résumé (anglais)', 'Summary (English)'),
        area('details', 'Détails (français)', 'Details (French)'),
        area('details_en', 'Détails (anglais)', 'Details (English)'),
        text('duration_label', 'Durée (français)', 'Duration (French)', { maxLength: 60 }),
        text('duration_label_en', 'Durée (anglais)', 'Duration (English)', { maxLength: 60 }),
        num('price_cents', 'Tarif en cents', 'Rate in cents'),
        bool('price_from', 'Tarif « à partir de »', 'Rate is a "from" price',
          ['Cochez si le tarif varie selon la durée choisie.', 'Check when the rate varies with the chosen duration.']),
        bool('price_verified', 'Tarif à jour', 'Rate is current',
          ['Décochez si le tarif doit être revalidé : le site invitera alors à téléphoner.', 'Uncheck when the rate needs re-checking: the site will invite visitors to call.']),
        text('booking_url', 'Lien de réservation particulier', 'Specific booking link',
          { maxLength: 500 }),
        bool('featured', 'Mettre en vedette', 'Feature on the home page',
          ['Affiche ce soin sur la page d’accueil.', 'Shows this treatment on the home page.']),
        bool('published', 'Visible sur le site', 'Visible on the site',
          ['Décocher masque le soin sans le supprimer.', 'Unchecking hides it without deleting it.']),
        order(), img(),
      ],
    },
    {
      key: 'packages', singular: 'package', icon: 'gift',
      label: pick('Forfaits', 'Packages'),
      description: pick('Les formules à plusieurs séances et les cures.', 'Multi-session packages and programmes.'),
      fields: [
        text('name', 'Nom (français)', 'Name (French)', { required: true }),
        text('name_en', 'Nom (anglais)', 'Name (English)'),
        slug(),
        area('summary', 'Résumé (français)', 'Summary (French)'),
        area('summary_en', 'Résumé (anglais)', 'Summary (English)'),
        text('validity', 'Validité (français)', 'Validity (French)', { maxLength: 80 }),
        text('validity_en', 'Validité (anglais)', 'Validity (English)', { maxLength: 80 }),
        num('price_cents', 'Prix en cents', 'Price in cents'),
        f('perks', 'list', 'Conditions (français)', 'Conditions (French)',
          ['Une condition par ligne.', 'One condition per line.'], { maxLength: 4000 }),
        f('perks_en', 'list', 'Conditions (anglais)', 'Conditions (English)',
          ['Une condition par ligne.', 'One condition per line.'], { maxLength: 4000 }),
        bool('popular', 'Marquer « populaire »', 'Mark as popular', ['', '']),
        bool('published', 'Visible sur le site', 'Visible on the site', ['', '']),
        order(), img(),
      ],
    },
    {
      key: 'products', singular: 'product', icon: 'bag',
      label: pick('Boutique', 'Shop'),
      description: pick('Les produits en vente, leur prix et leur disponibilité.', 'Products for sale, their price and availability.'),
      fields: [
        text('name', 'Nom (français)', 'Name (French)', { required: true }),
        text('name_en', 'Nom (anglais)', 'Name (English)'),
        slug(),
        num('price_cents', 'Prix en cents (hors taxes)', 'Price in cents (before tax)'),
        f('collection', 'select', 'Collection', 'Collection',
          ['Regroupement affiché en boutique.', 'Grouping shown in the shop.'], { options: COLLECTIONS }),
        area('description', 'Description (français)', 'Description (French)'),
        area('description_en', 'Description (anglais)', 'Description (English)'),
        text('variant_label', 'Nom du choix (ex. Parfum)', 'Option label (e.g. Scent)', { maxLength: 60 }),
        f('variants', 'list', 'Choix offerts', 'Available options',
          ['Un choix par ligne (parfums, formats…).', 'One option per line (scents, sizes…).'], { maxLength: 2000 }),
        bool('in_stock', 'En stock', 'In stock', ['Décocher affiche « Rupture de stock ».', 'Unchecking shows "Out of stock".']),
        bool('taxable', 'Taxable', 'Taxable', ['', '']),
        bool('featured', 'Coup de cœur', 'Most-loved', ['Affiche le produit sur l’accueil et en tête de boutique.', 'Shows the product on the home page and at the top of the shop.']),
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
          ['« Prête » avertit la cliente que sa commande l’attend en boutique.', '"Ready" tells the customer their order is waiting in store.'],
          { options: ['awaiting_payment', 'paid', 'preparing', 'ready', 'fulfilled', 'cancelled'] }),
        f('fulfilment', 'select', 'Mode', 'Fulfilment', ['', ''], { options: ['pickup', 'shipping'] }),
        text('address_line', 'Adresse', 'Address'),
        text('address_city', 'Ville', 'City', { maxLength: 120 }),
        text('address_province', 'Province', 'Province', { maxLength: 60 }),
        text('address_postal', 'Code postal', 'Postal code', { maxLength: 12 }),
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
      key: 'posts', singular: 'post', icon: 'pen',
      label: pick('Blog', 'Journal'),
      description: pick('Vos articles. Collez le texte complet dans « Contenu ».', 'Your articles. Paste the full text into "Content".'),
      fields: [
        text('title', 'Titre (français)', 'Title (French)', { required: true }),
        text('title_en', 'Titre (anglais)', 'Title (English)'),
        slug(),
        area('excerpt', 'Accroche (français)', 'Teaser (French)', { maxLength: 600 }),
        area('excerpt_en', 'Accroche (anglais)', 'Teaser (English)', { maxLength: 600 }),
        area('content', 'Contenu (français)', 'Content (French)'),
        area('content_en', 'Contenu (anglais)', 'Content (English)'),
        f('published_on', 'date', 'Date de publication', 'Publication date', ['', '']),
        bool('published', 'Publié', 'Published', ['', '']),
        order(), img(),
      ],
    },
    {
      key: 'hours', singular: 'hour', icon: 'clock',
      label: pick('Heures d’ouverture', 'Opening hours'),
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
    { name: 'address_verified', label: pick('Adresse confirmée', 'Address confirmed'), description: pick('Active l’adresse et le lien d’itinéraire.', 'Enables the address and the directions link.') },
    { name: 'hours_verified', label: pick('Heures confirmées', 'Hours confirmed'), description: pick('Retire la mention « à confirmer » à côté des heures.', 'Removes the "to be confirmed" note next to the hours.') },
    { name: 'booking_url_verified', label: pick('Lien de réservation confirmé', 'Booking link confirmed'), description: pick('Confirme que le lien « Prendre rendez-vous » mène au bon système.', 'Confirms the "Book" link points at the right system.') },
    { name: 'privacy_approved', label: pick('Avis de confidentialité approuvé', 'Privacy notice approved'), description: pick('Requis avant d’activer les formulaires. L’avis doit être rempli en français et en anglais.', 'Required before enabling forms. The notice must be filled in both languages.') },
    { name: 'messages_enabled', label: pick('Formulaire de contact actif', 'Contact form enabled'), description: pick('Permet aux visiteurs de vous écrire depuis le site.', 'Lets visitors write to you from the site.') },
    { name: 'shipping_enabled', label: pick('Livraison postale offerte', 'Shipping offered'), description: pick('Nécessite un tarif de livraison. Sans cela, seule la cueillette est proposée.', 'Needs a shipping rate. Without one, only pickup is offered.') },
    { name: 'payment_terms_approved', label: pick('Conditions de vente approuvées', 'Terms of sale approved'), description: pick('Requis avant d’encaisser. Les conditions doivent être rédigées dans les deux langues.', 'Required before taking money. The terms must be written in both languages.') },
    { name: 'payments_enabled', label: pick('Paiement en ligne actif', 'Online payment enabled'), description: pick('Active PayPal à la caisse. Demande aussi les clés PayPal.', 'Turns on PayPal at checkout. Also needs the PayPal keys.') },
    { name: 'live_actions_enabled', label: pick('Actions réelles activées', 'Live actions enabled'), description: pick('Interrupteur général : courriels envoyés, paiements encaissés, téléversements permis.', 'Master switch: emails sent, payments captured, uploads allowed.') },
  ];

  return { modules, settingsFields, FAMILIES, COLLECTIONS };
};

module.exports.FAMILIES = FAMILIES;
module.exports.COLLECTIONS = COLLECTIONS;
