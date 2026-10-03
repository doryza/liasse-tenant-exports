/**
 * First-install seed — facts from the sources below only; nothing invented
 * (no prices, team, warranties beyond the legal one, testimonials or photos).
 * Dossier (Google: Centre Pneu Rad LaPrairie, 430 Bd Taschereau, La Prairie, QC J5R 1T9, 450-984-1123, rating 4/1; rating not quoted under 10 reviews). Confirmed by hand (business name / Google category): pneus. Mode: draft. Facts as of octobre 2026.
 * Every gate that speaks for the garage starts OFF.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

const SETTINGS = {
  business_name: "Centre Pneu Rad LaPrairie",
  contact_phone: '450-984-1123',
  business_address: "430, boulevard Taschereau, La Prairie (Québec) J5R 1T9",
  payment_methods: J("À confirmer — demandez au garage.", "To be confirmed — ask the garage."),
  service_areas: J("La Prairie et les environs", "La Prairie and nearby"),
  hero_title: J("Votre garage à La Prairie.", "Your garage in La Prairie."),
  hero_subtitle: J("Garage de mécanique au 430, boulevard Taschereau, à La Prairie. Demandez un rendez-vous en ligne : le garage vous rappelle pour fixer l’heure.", "An auto repair shop at 430, boulevard Taschereau in La Prairie. Request an appointment online: the garage calls you back to set the time."),
  how_1: J("Choisissez les travaux et la journée qui vous convient.", "Pick the work and a day that suits you."),
  how_2: J("Le garage vous rappelle pour fixer l’heure.", "The garage calls you back to set the time."),
  how_3: J("Déposez la voiture ou attendez sur place.", "Drop the car off or wait on site."),
  how_4: J("Suivez l’avancement : en atelier, prête à récupérer.", "Follow along: in the shop, ready for pickup."),
  about_text: J("Centre Pneu Rad LaPrairie est un garage de mécanique automobile situé au 430, boulevard Taschereau, à La Prairie.\n\nPour connaître les heures d’ouverture ou faire vérifier votre véhicule, appelez le 450-984-1123.", "Centre Pneu Rad LaPrairie is an auto repair shop at 430, boulevard Taschereau in La Prairie.\n\nTo check the opening hours or have your vehicle looked at, call 450-984-1123."),
  contact_intro: J("Une question ou une estimation? Le plus rapide : un coup de fil au 450-984-1123.", "A question or an estimate? The fastest way: a call to 450-984-1123."),
  privacy_notice: J("BROUILLON À APPROUVER PAR LE GARAGE\n\nCentre Pneu Rad LaPrairie recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 450-984-1123.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Centre Pneu Rad LaPrairie, 430, boulevard Taschereau, La Prairie (Québec) J5R 1T9.", "DRAFT FOR THE GARAGE TO APPROVE\n\nCentre Pneu Rad LaPrairie collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 450-984-1123.\n\nPerson responsible for personal information: [name to be completed], Centre Pneu Rad LaPrairie, 430, boulevard Taschereau, La Prairie (Québec) J5R 1T9."),
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
