/**
 * First-install seed — facts from the sources below only; nothing invented
 * (no prices, team, warranties beyond the legal one, testimonials or photos).
 * Dossier only (Google: address, phone; 7 reviews → rating not quoted). No PagesJaunes page. Draft-to-confirm.
 * Every gate that speaks for the garage starts OFF.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

const SETTINGS = {
  business_name: "Garage mécanique Monzon et fils",
  contact_phone: '514-889-8070',
  business_address: "267, boulevard Curé-Labelle, local C, Laval (Québec) H7L 2Z9",
  payment_methods: J("À confirmer — demandez au garage.", "To be confirmed — ask the garage."),
  service_areas: J("Laval et les environs", "Laval and nearby"),
  hero_title: J("Monzon et fils, à Laval.", "Monzon & Sons, in Laval."),
  hero_subtitle: J("Garage de mécanique au 267, boulevard Curé-Labelle, local C, à Laval. Demandez un rendez-vous en ligne : le garage vous rappelle pour fixer l’heure.", "An auto repair shop at 267, boulevard Curé-Labelle, local C in Laval. Request an appointment online: the garage calls you back to set the time."),
  how_1: J("Choisissez les travaux et la journée qui vous convient.", "Pick the work and a day that suits you."),
  how_2: J("Le garage vous rappelle pour fixer l’heure.", "The garage calls you back to set the time."),
  how_3: J("Déposez la voiture ou attendez sur place.", "Drop the car off or wait on site."),
  how_4: J("Suivez l’avancement : en atelier, prête à récupérer.", "Follow along: in the shop, ready for pickup."),
  about_text: J("Garage mécanique Monzon et fils est un garage de mécanique automobile situé au 267, boulevard Curé-Labelle, local C, à Laval.\n\nPour connaître les heures d’ouverture ou faire vérifier votre véhicule, appelez le 514-889-8070.", "Garage mécanique Monzon et fils is an auto repair shop at 267, boulevard Curé-Labelle, local C in Laval.\n\nTo check the opening hours or have your vehicle looked at, call 514-889-8070."),
  contact_intro: J("Une question ou une estimation? Le plus rapide : un coup de fil au 514-889-8070.", "A question or an estimate? The fastest way: a call to 514-889-8070."),
  privacy_notice: J("BROUILLON À APPROUVER PAR LE GARAGE\n\nGarage mécanique Monzon et fils recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 514-889-8070.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Garage mécanique Monzon et fils, 267, boulevard Curé-Labelle, local C, Laval (Québec) H7L 2Z9.", "DRAFT FOR THE GARAGE TO APPROVE\n\nGarage mécanique Monzon et fils collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 514-889-8070.\n\nPerson responsible for personal information: [name to be completed], Garage mécanique Monzon et fils, 267, boulevard Curé-Labelle, local C, Laval (Québec) H7L 2Z9."),
  // Booking rules (editable in Réglages). No courtesy car, no towing (not published).
  bays: '2', slot_minutes: '30', lead_hours: '16', horizon_days: '45', max_booking_minutes: '240', courtesy_cars: '0', cancel_cutoff_hours: '12',
  towing_offered: '0', hours_known: '0',
  // Gates — all closed until the owner opens them.
  contact_verified: '0', address_verified: '0', hours_verified: '0', privacy_approved: '0',
  bookings_live: '0', auto_confirm: '0', messages_enabled: '0', live_actions_enabled: '0',
};

// INTERNAL working grid for the back office only (hours_known '0' hides it).
const HOURS = [[1, "08:00", "17:00", 0], [2, "08:00", "17:00", 0], [3, "08:00", "17:00", 0], [4, "08:00", "17:00", 0], [5, "08:00", "17:00", 0], [6, null, null, 1], [7, null, null, 1]];

module.exports = async function seed(db) {
  for (const [key, value] of Object.entries(SETTINGS)) {
    await db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO NOTHING', [key, value]);
  }
  for (const [weekday, opens, closes, closed] of HOURS) {
    await db.run('INSERT INTO hours(weekday,opens,closes,closed) VALUES($1,$2,$3,$4) ON CONFLICT(weekday) DO NOTHING', [weekday, opens, closes, closed]);
  }
  for (let i = 0; i < catalog.length; i++) {
    const s = catalog[i];
    await db.run(
      `INSERT INTO services(slug,name,name_en,tagline,tagline_en,body,body_en,signs,signs_en,icon,duration_min,price_from_cents,price_verified,bookable,featured,option_kind,published,sort_order,image_url,confirmed)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NULL,0,$12,$13,$14,1,$15,$16,$17 WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug=$1)`,
      [s.slug, s.name, s.name_en, s.tagline, s.tagline_en, s.body, s.body_en, s.signs, s.signs_en, s.icon, s.duration_min,
        s.bookable, s.featured, s.option || null, i + 1, assets.services[s.slug] || null, s.confirmed === 0 ? 0 : 1]);
  }
};

module.exports.SETTINGS = SETTINGS;
module.exports.HOURS = HOURS;
