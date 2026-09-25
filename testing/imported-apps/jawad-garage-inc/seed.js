/**
 * First-install seed — facts from the sources below only; nothing invented
 * (no prices, team, warranties beyond the legal one, testimonials or photos).
 * Dossier (Google: address, phone, 10+ years, « Opens 6 a.m. Fri »; rating 4.1/748 not quoted) + PagesJaunes 2340420 « Jawad Mécanique » (same phone/address): hours Mon–Fri 06:00–16:30, Sat 06:00–13:30 — agree with Google. Services not listed → « À confirmer ».
 * Every gate that speaks for the garage starts OFF.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

const SETTINGS = {
  business_name: "Jawad Garage",
  contact_phone: '514-323-0769',
  business_address: "10370, avenue Armand-Lavergne, Montréal-Nord (Québec) H1H 3N4",
  payment_methods: J("À confirmer — demandez au garage.", "To be confirmed — ask the garage."),
  service_areas: J("Montréal-Nord et les environs", "Montréal-Nord and nearby"),
  hero_title: J("Ouvert dès 6\u00a0h, à Montréal-⁠Nord.", "Open from 6\u00a0a.m. in Montréal-⁠Nord."),
  hero_subtitle: J("En affaires depuis plus de 10 ans. Ouvert du lundi au vendredi de 6 h à 16 h 30, et le samedi de 6 h à 13 h 30. Réservez en ligne et suivez les travaux depuis votre téléphone.", "In business for over 10 years. Open Monday to Friday 6 a.m. to 4:30 p.m., Saturday 6 a.m. to 1:30 p.m.. Book online and follow the work from your phone."),
  how_1: J("Choisissez les travaux et le moment qui vous convient.", "Pick the work and a time that suits you."),
  how_2: J("Le garage confirme et vous recevez un courriel.", "The garage confirms and you get an email."),
  how_3: J("Déposez la voiture ou attendez sur place.", "Drop the car off or wait on site."),
  how_4: J("Suivez l’avancement : en atelier, prête à récupérer.", "Follow along: in the shop, ready for pickup."),
  about_text: J("Jawad Garage est un garage de mécanique automobile situé au 10370, avenue Armand-Lavergne, à Montréal-Nord. Le garage est en affaires depuis plus de 10 ans.\n\nLe garage est ouvert du lundi au vendredi de 6 h à 16 h 30, et le samedi de 6 h à 13 h 30. Pour faire vérifier votre véhicule ou obtenir une estimation, réservez en ligne ou appelez le 514-323-0769.", "Jawad Garage is an auto repair shop at 10370, avenue Armand-Lavergne in Montréal-Nord. The garage has been in business for over 10 years.\n\nThe garage is open Monday to Friday 6 a.m. to 4:30 p.m., Saturday 6 a.m. to 1:30 p.m.. To have your vehicle looked at or get an estimate, book online or call 514-323-0769."),
  contact_intro: J("Une question ou une estimation? Le plus rapide : un coup de fil au 514-323-0769.", "A question or an estimate? The fastest way: a call to 514-323-0769."),
  privacy_notice: J("BROUILLON À APPROUVER PAR LE GARAGE\n\nJawad Garage recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 514-323-0769.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Jawad Garage, 10370, avenue Armand-Lavergne, Montréal-Nord (Québec) H1H 3N4.", "DRAFT FOR THE GARAGE TO APPROVE\n\nJawad Garage collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 514-323-0769.\n\nPerson responsible for personal information: [name to be completed], Jawad Garage, 10370, avenue Armand-Lavergne, Montréal-Nord (Québec) H1H 3N4."),
  // Booking rules (editable in Réglages). No courtesy car, no towing (not published).
  bays: '2', slot_minutes: '30', lead_hours: '16', horizon_days: '45', max_booking_minutes: '240', courtesy_cars: '0', cancel_cutoff_hours: '12',
  towing_offered: '0', hours_known: '1',
  // Gates — all closed until the owner opens them.
  contact_verified: '0', address_verified: '0', hours_verified: '0', privacy_approved: '0',
  bookings_live: '0', auto_confirm: '0', messages_enabled: '0', live_actions_enabled: '0',
};

// From PagesJaunes (same phone and address as the Google listing): Monday–Friday 08:00–17:00; weekend not listed = closed.
const HOURS = [[1, "06:00", "16:30", 0], [2, "06:00", "16:30", 0], [3, "06:00", "16:30", 0], [4, "06:00", "16:30", 0], [5, "06:00", "16:30", 0], [6, "06:00", "13:30", 0], [7, null, null, 1]];

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
