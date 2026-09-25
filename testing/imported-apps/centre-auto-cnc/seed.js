/**
 * First-install seed — facts from the sources below only; nothing invented
 * (no prices, team, warranties beyond the legal one, testimonials or photos).
 * Dossier (Google: address, phone, rating 4.9/54, 15+ years, « Opens 8 a.m. Fri ») + PagesJaunes 7784070 « Centre De L’Auto CNC » (same phone/address): Mon–Fri 08:00–17:00, Sat 08:00–16:00 — agree. Services not listed → « À confirmer ».
 * Every gate that speaks for the garage starts OFF.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

const SETTINGS = {
  business_name: "Centre Auto CNC",
  contact_phone: '450-575-9988',
  business_address: "14, rue de Cassis, Laval (Québec) H7N 1A7",
  payment_methods: J("À confirmer — demandez au garage.", "To be confirmed — ask the garage."),
  service_areas: J("Laval et les environs", "Laval and nearby"),
  hero_title: J("Plus de 15 ans, rue de Cassis.", "Over 15 years on rue de Cassis."),
  hero_subtitle: J("Noté 4,9 sur 5 par 54 clients sur Google (septembre 2026), en affaires depuis plus de 15 ans. Ouvert du lundi au vendredi de 8 h à 17 h, et le samedi de 8 h à 16 h. Réservez en ligne et suivez les travaux depuis votre téléphone.", "Rated 4.9 out of 5 by 54 customers on Google (September 2026), in business for over 15 years. Open Monday to Friday 8 a.m. to 5 p.m., Saturday 8 a.m. to 4 p.m.. Book online and follow the work from your phone."),
  how_1: J("Choisissez les travaux et le moment qui vous convient.", "Pick the work and a time that suits you."),
  how_2: J("Le garage confirme et vous recevez un courriel.", "The garage confirms and you get an email."),
  how_3: J("Déposez la voiture ou attendez sur place.", "Drop the car off or wait on site."),
  how_4: J("Suivez l’avancement : en atelier, prête à récupérer.", "Follow along: in the shop, ready for pickup."),
  about_text: J("Centre Auto CNC est un garage de mécanique automobile situé au 14, rue de Cassis, à Laval. Le garage est en affaires depuis plus de 15 ans. Ses clients lui donnent 4,9 sur 5 sur Google (54 avis, septembre 2026).\n\nLe garage est ouvert du lundi au vendredi de 8 h à 17 h, et le samedi de 8 h à 16 h. Pour faire vérifier votre véhicule ou obtenir une estimation, réservez en ligne ou appelez le 450-575-9988.", "Centre Auto CNC is an auto repair shop at 14, rue de Cassis in Laval. The garage has been in business for over 15 years. Its customers rate it 4.9 out of 5 on Google (54 reviews, September 2026).\n\nThe garage is open Monday to Friday 8 a.m. to 5 p.m., Saturday 8 a.m. to 4 p.m.. To have your vehicle looked at or get an estimate, book online or call 450-575-9988."),
  contact_intro: J("Une question ou une estimation? Le plus rapide : un coup de fil au 450-575-9988.", "A question or an estimate? The fastest way: a call to 450-575-9988."),
  privacy_notice: J("BROUILLON À APPROUVER PAR LE GARAGE\n\nCentre Auto CNC recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 450-575-9988.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Centre Auto CNC, 14, rue de Cassis, Laval (Québec) H7N 1A7.", "DRAFT FOR THE GARAGE TO APPROVE\n\nCentre Auto CNC collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 450-575-9988.\n\nPerson responsible for personal information: [name to be completed], Centre Auto CNC, 14, rue de Cassis, Laval (Québec) H7N 1A7."),
  // Booking rules (editable in Réglages). No courtesy car, no towing (not published).
  bays: '2', slot_minutes: '30', lead_hours: '16', horizon_days: '45', max_booking_minutes: '240', courtesy_cars: '0', cancel_cutoff_hours: '12',
  towing_offered: '0', hours_known: '1',
  // Gates — all closed until the owner opens them.
  contact_verified: '0', address_verified: '0', hours_verified: '0', privacy_approved: '0',
  bookings_live: '0', auto_confirm: '0', messages_enabled: '0', live_actions_enabled: '0',
};

// From PagesJaunes (same phone and address as the Google listing): Monday–Friday 08:00–17:00; weekend not listed = closed.
const HOURS = [[1, "08:00", "17:00", 0], [2, "08:00", "17:00", 0], [3, "08:00", "17:00", 0], [4, "08:00", "17:00", 0], [5, "08:00", "17:00", 0], [6, "08:00", "16:00", 0], [7, null, null, 1]];

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
