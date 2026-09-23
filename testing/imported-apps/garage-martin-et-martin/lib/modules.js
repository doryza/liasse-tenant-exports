/**
 * Admin module definitions. One entry per editable table: the admin shell
 * builds its list, its form and its API from this spec. Appointments are not
 * here — they have their own board (/admin/rendez-vous) with status actions.
 */
module.exports = function (lang) {
  const en = lang === 'en';
  const pick = (fr, eng) => (en ? eng : fr);

  const f = (name, type, fr, eng, help = ['', ''], options = {}) => Object.assign({
    name, type, label: pick(fr, eng), description: pick(help[0], help[1]),
    placeholder: '', maxLength: type === 'textarea' ? 8000 : 400,
  }, options);
  const text = (name, fr, eng, opts = {}) => f(name, 'text', fr, eng, ['', ''], opts);
  const area = (name, fr, eng, opts = {}) => f(name, 'textarea', fr, eng, ['', ''], opts);
  const num = (name, fr, eng, min, max, help = ['', '']) => f(name, 'number', fr, eng, help, { min, max, step: 1 });
  const bool = (name, fr, eng, help = ['', '']) => f(name, 'boolean', fr, eng, help, { default: 0 });

  const modules = [
    {
      key: 'services', singular: 'service', icon: 'wrench',
      label: pick('Services', 'Services'),
      description: pick('Ce que le garage offre, la durée prévue en atelier et le prix affiché.', 'What the garage offers, the planned shop time and the displayed price.'),
      fields: [
        text('name', 'Nom (français)', 'Name (French)', { required: true }),
        text('name_en', 'Nom (anglais)', 'Name (English)'),
        f('slug', 'text', 'Adresse web (slug)', 'Web address (slug)', ['Laissez vide : elle sera créée à partir du nom.', 'Leave empty: it is built from the name.'], { maxLength: 80 }),
        text('tagline', 'Accroche (français)', 'Tagline (French)'),
        text('tagline_en', 'Accroche (anglais)', 'Tagline (English)'),
        area('body', 'Description (français)', 'Description (French)'),
        area('body_en', 'Description (anglais)', 'Description (English)'),
        f('signs', 'list', 'Quand consulter (français)', 'When to come in (French)', ['Un signe par ligne.', 'One sign per line.'], { maxLength: 2000 }),
        f('signs_en', 'list', 'Quand consulter (anglais)', 'When to come in (English)', ['Un signe par ligne.', 'One sign per line.'], { maxLength: 2000 }),
        num('duration_min', 'Temps prévu en atelier (minutes)', 'Planned shop time (minutes)', 0, 600,
          ['Sert à réserver la bonne durée dans l’horaire. 0 pour une option (voiture de courtoisie, remorquage).', 'Used to hold the right time in the schedule. 0 for an option (courtesy car, towing).']),
        num('price_from_cents', 'Prix « à partir de » (en cents)', '"From" price (in cents)', 0, 100000000,
          ['Ex. 8995 pour 89,95 $. Laissez vide pour « Sur estimation ».', 'E.g. 8995 for $89.95. Leave empty for "On estimate".']),
        bool('price_verified', 'Prix confirmé', 'Price confirmed', ['Tant que ce n’est pas coché, le site affiche « Sur estimation ».', 'Until this is checked the site shows "On estimate".']),
        bool('bookable', 'Réservable en ligne', 'Bookable online'),
        bool('featured', 'Mis en avant sur l’accueil', 'Featured on the home page'),
        bool('published', 'Visible sur le site', 'Visible on the site'),
        num('sort_order', 'Ordre d’affichage', 'Display order', 0, 9999),
        f('vehicle_classes', 'text', 'Gabarits (pneus, antirouille)', 'Vehicle sizes (tires, rust-proofing)', ['Séparés par des virgules : voiture, vus, pickup, gros. Vide = tous les véhicules.', 'Comma-separated: voiture, vus, pickup, gros. Empty = every vehicle.'], { maxLength: 60 }),
        f('image_url', 'image', 'Illustration', 'Illustration', ['Adresse https d’une image.', 'An https image address.']),
      ],
    },
    {
      key: 'customer_profiles', singular: 'customer', icon: 'user',
      label: pick('Clients', 'Customers'),
      description: pick('Les clients qui ont créé un compte pour réserver.', 'Customers who created an account to book.'),
      fields: [
        f('user_id', 'readonly', 'Compte', 'Account'),
        text('first_name', 'Prénom', 'First name'),
        text('last_name', 'Nom', 'Last name'),
        text('phone', 'Téléphone', 'Phone', { maxLength: 40 }),
        f('language', 'select', 'Langue', 'Language', ['', ''], { options: ['fr', 'en'] }),
        area('notes', 'Notes internes', 'Internal notes', { maxLength: 4000 }),
      ],
    },
    {
      key: 'vehicles', singular: 'vehicle', icon: 'car',
      label: pick('Véhicules', 'Vehicles'),
      description: pick('Les véhicules enregistrés par vos clients.', 'Vehicles saved by your customers.'),
      fields: [
        f('user_id', 'readonly', 'Compte', 'Account'),
        num('year', 'Année', 'Year', 1950, 2100),
        text('make', 'Marque', 'Make', { maxLength: 60 }),
        text('model', 'Modèle', 'Model', { maxLength: 80 }),
        text('trim', 'Version', 'Trim', { maxLength: 80 }),
        text('vin', 'NIV', 'VIN', { maxLength: 17 }),
        text('plate', 'Plaque', 'Plate', { maxLength: 12 }),
        num('odometer_km', 'Kilométrage', 'Mileage', 0, 2000000),
        num('last_oil_km', 'Km à la dernière vidange', 'Km at last oil change', 0, 2000000),
        f('last_oil_date', 'date', 'Date de la dernière vidange', 'Last oil change date'),
        area('notes', 'Notes', 'Notes', { maxLength: 2000 }),
      ],
    },
    {
      key: 'hours', singular: 'hour', icon: 'clock',
      label: pick('Heures d’ouverture', 'Opening hours'),
      description: pick('Un jour par ligne, de lundi (1) à dimanche (7). Les plages de rendez-vous en découlent.', 'One row per day, Monday (1) to Sunday (7). Booking times are built from these.'),
      fields: [
        num('weekday', 'Jour (1 = lundi)', 'Day (1 = Monday)', 1, 7),
        text('opens', 'Ouverture (HH:MM)', 'Opens (HH:MM)', { maxLength: 5 }),
        text('closes', 'Fermeture (HH:MM)', 'Closes (HH:MM)', { maxLength: 5 }),
        bool('closed', 'Fermé', 'Closed'),
      ],
    },
    {
      key: 'closures', singular: 'closure', icon: 'calendar',
      label: pick('Fermetures', 'Closures'),
      description: pick('Jours fériés et vacances : aucun rendez-vous n’est offert ces jours-là.', 'Holidays and vacations: no appointments are offered on those days.'),
      fields: [
        f('date', 'date', 'Date (AAAA-MM-JJ)', 'Date (YYYY-MM-DD)', ['', ''], { required: true }),
        text('reason', 'Motif (français)', 'Reason (French)', { maxLength: 120 }),
        text('reason_en', 'Motif (anglais)', 'Reason (English)', { maxLength: 120 }),
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
  ];

  // Switches on the Réglages page. Every one gates something the site says
  // or does on the owner's behalf; all start OFF.
  const settingsFields = [
    { name: 'contact_verified', label: pick('Coordonnées confirmées', 'Contact details confirmed'), description: pick('Le téléphone vient de votre fiche Google et de votre site actuel. Confirmez qu’il est exact.', 'The phone number comes from your Google listing and your current site. Confirm it is correct.') },
    { name: 'address_verified', label: pick('Adresse confirmée', 'Address confirmed'), description: pick('L’adresse vient de votre fiche Google. Confirmez qu’elle est exacte.', 'The address comes from your Google listing. Confirm it is correct.') },
    { name: 'hours_verified', label: pick('Heures confirmées', 'Hours confirmed'), description: pick('Les heures viennent de votre fiche Google. Les plages de rendez-vous en découlent.', 'The hours come from your Google listing. Booking times are built from them.') },
    { name: 'privacy_approved', label: pick('Avis de confidentialité approuvé', 'Privacy notice approved'), description: pick('Requis avant d’accepter des rendez-vous ou des messages. Un brouillon conforme à la Loi 25 est prêt : relisez-le.', 'Required before taking appointments or messages. A Law 25 draft is ready: read it over.') },
    { name: 'bookings_live', label: pick('Réservations en ligne actives', 'Online booking live'), description: pick('Les rendez-vous deviennent réels : vous les recevez et les clients reçoivent leurs confirmations. Tant que c’est fermé, la réservation fonctionne en mode aperçu.', 'Appointments become real: you receive them and customers get their confirmations. While off, booking runs in preview mode.') },
    { name: 'auto_confirm', label: pick('Confirmer automatiquement', 'Confirm automatically'), description: pick('Chaque réservation est confirmée tout de suite. Sinon, vous confirmez chaque demande.', 'Every booking is confirmed right away. Otherwise you confirm each request.') },
    { name: 'towing_offered', label: pick('Remorquage offert', 'Towing offered'), description: pick('Ajoute « Mon véhicule doit être remorqué » à la prise de rendez-vous. Fermé : votre site n’en annonce pas.', 'Adds "My vehicle needs a tow" to booking. Off: your site does not advertise towing.') },
    { name: 'messages_enabled', label: pick('Formulaire de contact actif', 'Contact form enabled'), description: pick('Permet aux visiteurs de vous écrire depuis le site.', 'Lets visitors write to you from the site.') },
    { name: 'live_actions_enabled', label: pick('Envois réels activés', 'Live sending enabled'), description: pick('Interrupteur général : courriels, textos et notifications envoyés, téléversements permis.', 'Master switch: emails, texts and notifications are sent, uploads allowed.') },
  ];

  // Numeric booking rules on the same page.
  const bookingFields = [
    { name: 'bays', label: pick('Nombre de baies de service', 'Number of service bays'), hint: pick('Combien de véhicules peuvent être en atelier en même temps.', 'How many vehicles can be worked on at once.'), min: 1, max: 12, fallback: 2 },
    { name: 'slot_minutes', label: pick('Intervalle des plages (minutes)', 'Time-slot interval (minutes)'), hint: '15, 30 ou/or 60.', min: 15, max: 60, fallback: 30 },
    { name: 'lead_hours', label: pick('Préavis minimum (heures)', 'Minimum notice (hours)'), hint: pick('Délai avant le premier rendez-vous offert.', 'Time before the first bookable slot.'), min: 0, max: 168, fallback: 16 },
    { name: 'horizon_days', label: pick('Réservation jusqu’à (jours)', 'Book up to (days ahead)'), hint: '', min: 7, max: 120, fallback: 45 },
    { name: 'max_booking_minutes', label: pick('Durée maximale réservée (minutes)', 'Longest booked job (minutes)'), hint: pick('Au-delà, le reste des travaux se planifie avec le client.', 'Beyond this, the rest of the work is planned with the customer.'), min: 30, max: 600, fallback: 240 },
    { name: 'courtesy_cars', label: pick('Voitures de courtoisie', 'Courtesy cars'), hint: pick('0 pour ne pas en offrir.', '0 to not offer any.'), min: 0, max: 20, fallback: 1 },
    { name: 'cancel_cutoff_hours', label: pick('Annulation en ligne jusqu’à (heures avant)', 'Online cancellation until (hours before)'), hint: '', min: 0, max: 168, fallback: 12 },
  ];

  return { modules, settingsFields, bookingFields };
};
