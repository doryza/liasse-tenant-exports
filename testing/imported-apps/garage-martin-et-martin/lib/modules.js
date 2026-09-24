/**
 * Settings the back office writes (Réglages). Each list says what a setting
 * is FOR in the words a mechanic uses; the API refuses any key not listed
 * here. Site texts are not here: they are edited on the site itself with the
 * Liasse inline editor.
 */
module.exports = function (lang) {
  const en = lang === 'en';
  const pick = (fr, eng) => (en ? eng : fr);

  // On/off switches. Every one gates something the site says or does on the
  // owner's behalf; all start OFF.
  const settingsFields = [
    { name: 'contact_verified', group: 'garage', label: pick('Mon numéro de téléphone est exact', 'My phone number is correct'), description: pick('Il vient de votre fiche publique. Corrigez-le plus haut au besoin, puis cochez.', 'It comes from your public listing. Fix it above if needed, then check this.') },
    { name: 'address_verified', group: 'garage', label: pick('Mon adresse est exacte', 'My address is correct'), description: pick('Elle paraît sur le site, les estimations et les factures.', 'It shows on the site, estimates and invoices.') },
    { name: 'bookings_live', group: 'booking', label: pick('Les clients peuvent réserver en ligne', 'Customers can book online'), description: pick('Fermé : la réservation fonctionne en mode aperçu (rien de réel). Ouvert : vous recevez les vrais rendez-vous.', 'Off: booking runs in preview mode (nothing real). On: you receive real appointments.') },
    { name: 'auto_confirm', group: 'booking', label: pick('Confirmer les réservations tout seul', 'Confirm bookings automatically'), description: pick('Sinon, chaque demande attend que vous la confirmiez.', 'Otherwise each request waits for you to confirm it.') },
    { name: 'towing_offered', group: 'booking', label: pick('J’offre le remorquage', 'I offer towing'), description: pick('Ajoute « Mon véhicule doit être remorqué » à la réservation en ligne.', 'Adds "My vehicle needs towing" to online booking.') },
    { name: 'live_actions_enabled', group: 'sending', label: pick('Envoyer les courriels aux clients', 'Send emails to customers'), description: pick('Confirmations, rappels et « votre auto est prête ». Fermé : rien ne part.', 'Confirmations, reminders and "your car is ready". Off: nothing is sent.') },
    { name: 'messages_enabled', group: 'sending', label: pick('Formulaire de contact actif', 'Contact form on'), description: pick('Les visiteurs peuvent vous écrire depuis le site.', 'Visitors can write to you from the site.') },
    { name: 'privacy_approved', group: 'privacy', label: pick('J’ai relu et j’approuve l’avis de confidentialité', 'I have read and approve the privacy notice'), description: pick('Exigé par la Loi 25 avant de recevoir des rendez-vous ou des messages.', 'Required by Law 25 before taking appointments or messages.') },
    { name: 'hours_verified', group: 'hours', label: pick('Mes heures sont exactes', 'My hours are correct'), description: '' },
  ];

  // Numbers for online booking.
  const bookingFields = [
    { name: 'bays', label: pick('Autos en même temps à l’atelier', 'Cars in the shop at once'), hint: pick('Le nombre de baies (ponts) où vous travaillez.', 'The number of bays (lifts) you work on.'), min: 1, max: 12, fallback: 2, unit: '' },
    { name: 'slot_minutes', label: pick('Heures offertes aux', 'Times offered every'), hint: '', min: 15, max: 60, fallback: 30, unit: 'min', choices: [15, 30, 60] },
    { name: 'lead_hours', label: pick('Délai avant le premier rendez-vous', 'Notice before the first booking'), hint: pick('Ex. 16 h : on ne peut pas réserver pour dans une heure.', 'E.g. 16 h: nobody can book for an hour from now.'), min: 0, max: 168, fallback: 16, unit: 'h' },
    { name: 'horizon_days', label: pick('Réservation possible jusqu’à', 'Bookable up to'), hint: '', min: 7, max: 120, fallback: 45, unit: pick('jours', 'days') },
    { name: 'max_booking_minutes', label: pick('Plus long travail réservable en ligne', 'Longest job bookable online'), hint: pick('Au-delà, vous planifiez le reste avec le client.', 'Beyond this, you plan the rest with the customer.'), min: 30, max: 600, fallback: 240, unit: 'min' },
    { name: 'courtesy_cars', label: pick('Voitures de courtoisie', 'Courtesy cars'), hint: pick('0 pour ne pas en offrir.', '0 to offer none.'), min: 0, max: 20, fallback: 1, unit: '' },
    { name: 'cancel_cutoff_hours', label: pick('Le client peut annuler jusqu’à', 'Customer can cancel up to'), hint: pick('heures avant le rendez-vous', 'hours before the appointment'), min: 0, max: 168, fallback: 12, unit: 'h' },
  ];

  // Numbers for estimates and invoices.
  const docFields = [
    { name: 'estimate_valid_days', label: pick('Une estimation est valide pendant', 'An estimate is valid for'), hint: '', min: 1, max: 365, fallback: 30, unit: pick('jours', 'days') },
  ];

  // Free-text settings and their maximum length.
  const textKeys = {
    business_name: 200, contact_phone: 40, business_address: 240, notification_email: 200,
    tps_number: 40, tvq_number: 40, neq: 20, warranty_text: 2000, document_footer: 500,
  };

  return { settingsFields, bookingFields, docFields, numberFields: bookingFields.concat(docFields), textKeys };
};
