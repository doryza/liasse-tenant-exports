/**
 * First-install seed — facts from the sources below only; nothing invented
 * (no prices, team, warranties beyond the legal one, testimonials or photos).
 * Dossier (Google: MULTI SERVICES INTERPROVINCIAL, 56 Bd Interprovincial, Pointe-à-la-Croix, QC G0C 1L0, 418-788-2000, rating 4.4/60). Mode: draft. Facts as of octobre 2026.
 * Every gate that speaks for the garage starts OFF.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

const SETTINGS = {
  business_name: "Multi Services Interprovincial",
  contact_phone: '418-788-2000',
  business_address: "56, boulevard Interprovincial, Pointe-à-la-Croix (Québec) G0C 1L0",
  payment_methods: J("À confirmer — demandez au garage.", "To be confirmed — ask the garage."),
  service_areas: J("Pointe-à-la-Croix et les environs", "Pointe-à-la-Croix and nearby"),
  hero_title: J("Multi Services.", "Multi Services."),
  hero_subtitle: J("Noté 4,4 sur 5 par 60 clients sur Google (octobre 2026). Demandez un rendez-vous en ligne : le garage vous rappelle pour fixer l’heure.", "Rated 4.4 out of 5 by 60 customers on Google (October 2026). Request an appointment online: the garage calls you back to set the time."),
  how_1: J("Choisissez les travaux et la journée qui vous convient.", "Pick the work and a day that suits you."),
  how_2: J("Le garage vous rappelle pour fixer l’heure.", "The garage calls you back to set the time."),
  how_3: J("Déposez la voiture ou attendez sur place.", "Drop the car off or wait on site."),
  how_4: J("Suivez l’avancement : en atelier, prête à récupérer.", "Follow along: in the shop, ready for pickup."),
  about_text: J("Multi Services Interprovincial est un garage de mécanique automobile situé au 56, boulevard Interprovincial, à Pointe-à-la-Croix. Ses clients lui donnent 4,4 sur 5 sur Google (60 avis, octobre 2026).\n\nPour connaître les heures d’ouverture ou faire vérifier votre véhicule, appelez le 418-788-2000.", "Multi Services Interprovincial is an auto repair shop at 56, boulevard Interprovincial in Pointe-à-la-Croix. Its customers rate it 4.4 out of 5 on Google (60 reviews, October 2026).\n\nTo check the opening hours or have your vehicle looked at, call 418-788-2000."),
  contact_intro: J("Une question ou une estimation? Le plus rapide : un coup de fil au 418-788-2000.", "A question or an estimate? The fastest way: a call to 418-788-2000."),
  privacy_notice: J("BROUILLON À APPROUVER PAR LE GARAGE\n\nMulti Services Interprovincial recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 418-788-2000.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Multi Services Interprovincial, 56, boulevard Interprovincial, Pointe-à-la-Croix (Québec) G0C 1L0.", "DRAFT FOR THE GARAGE TO APPROVE\n\nMulti Services Interprovincial collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 418-788-2000.\n\nPerson responsible for personal information: [name to be completed], Multi Services Interprovincial, 56, boulevard Interprovincial, Pointe-à-la-Croix (Québec) G0C 1L0."),
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
