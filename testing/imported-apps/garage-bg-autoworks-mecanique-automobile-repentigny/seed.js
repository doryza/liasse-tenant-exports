/**
 * First-install seed — facts from the sources below only; nothing invented
 * (no prices, team, warranties beyond the legal one, testimonials or photos).
 * Dossier (Google: Garage BG Autoworks - Mécanique Automobile Repentigny, address, phone, rating 5.0/220, 20+ years; « Opens 8 a.m. Fri » snippet differs from the listing’s 9:00 — listing kept, flagged) + the garage’s own 411garage.com listing (same phone): 11 services in the listing’s order (mécanique générale, voitures importées incl. allemandes BMW/Mercedes/Porsche, refroidissement, équilibrage et permutation, freins, mise au point, parallélisme, silencieux, suspension, transmission, vidange d’huile), hours Mon–Thu 9–18, Fri 9–16, Sat–Sun sur appel, payments (cash, cheque, Interac, Visa, MC, Amex), area Repentigny. PagesJaunes 105389232 matches (no hours/services). Logo: only a 92-px Google thumbnail exists (none on 411) → original handwritten-style BG mark; owner’s logo file to obtain at claim. Email in dossier NOT published.
 * Every gate that speaks for the garage starts OFF.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

const SETTINGS = {
  business_name: "Garage BG Autoworks",
  contact_phone: '438-864-2886',
  business_address: "585, rue Leclerc, local 1, Repentigny (Québec) J6A 7N3",
  payment_methods: J("Argent comptant, chèque, Interac, Visa, Mastercard et American Express.", "Cash, cheque, Interac, Visa, Mastercard and American Express."),
  service_areas: J("Repentigny et les environs", "Repentigny and nearby"),
  hero_title: J("Mécanique et voitures allemandes.", "Repairs and German cars."),
  hero_subtitle: J("Noté 5,0 sur 5 par 220 clients sur Google (septembre 2026), en affaires depuis plus de 20 ans. Ouvert du lundi au jeudi de 9 h à 18 h et le vendredi de 9 h à 16 h. Réservez en ligne et suivez les travaux depuis votre téléphone.", "Rated 5.0 out of 5 by 220 customers on Google (September 2026), in business for over 20 years. Open Monday to Thursday 9 a.m. to 6 p.m. and Friday 9 a.m. to 4 p.m. Book online and follow the work from your phone."),
  how_1: J("Choisissez les travaux et le moment qui vous convient.", "Pick the work and a time that suits you."),
  how_2: J("Le garage confirme et vous recevez un courriel.", "The garage confirms and you get an email."),
  how_3: J("Déposez la voiture ou attendez sur place.", "Drop the car off or wait on site."),
  how_4: J("Suivez l’avancement : en atelier, prête à récupérer.", "Follow along: in the shop, ready for pickup."),
  about_text: J("Garage BG Autoworks est un garage de mécanique automobile situé au 585, rue Leclerc, local 1, à Repentigny. Le garage est en affaires depuis plus de 20 ans. Ses clients lui donnent 5,0 sur 5 sur Google (220 avis, septembre 2026). Le samedi et le dimanche, le garage est disponible sur appel. Services offerts : mécanique générale, voitures importées, système de refroidissement, équilibrage et permutation des pneus, freins, mise au point du moteur, parallélisme des roues, silencieux et échappement, suspension, transmission et vidange d’huile.\n\nLe garage est ouvert du lundi au jeudi de 9 h à 18 h et le vendredi de 9 h à 16 h. Pour faire vérifier votre véhicule ou obtenir une estimation, réservez en ligne ou appelez le 438-864-2886.", "Garage BG Autoworks is an auto repair shop at 585, rue Leclerc, local 1 in Repentigny. The garage has been in business for over 20 years. Its customers rate it 5.0 out of 5 on Google (220 reviews, September 2026). On Saturday and Sunday, the garage is available on call. Services: general repair, imported cars, cooling system, tire balancing and rotation, brakes, engine tune-up, wheel alignment, muffler & exhaust, suspension, transmission and oil change.\n\nThe garage is open Monday to Thursday 9 a.m. to 6 p.m. and Friday 9 a.m. to 4 p.m. To have your vehicle looked at or get an estimate, book online or call 438-864-2886."),
  contact_intro: J("Une question ou une estimation? Le plus rapide : un coup de fil au 438-864-2886.", "A question or an estimate? The fastest way: a call to 438-864-2886."),
  privacy_notice: J("BROUILLON À APPROUVER PAR LE GARAGE\n\nGarage BG Autoworks recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 438-864-2886.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Garage BG Autoworks, 585, rue Leclerc, local 1, Repentigny (Québec) J6A 7N3.", "DRAFT FOR THE GARAGE TO APPROVE\n\nGarage BG Autoworks collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 438-864-2886.\n\nPerson responsible for personal information: [name to be completed], Garage BG Autoworks, 585, rue Leclerc, local 1, Repentigny (Québec) J6A 7N3."),
  // Booking rules (editable in Réglages). No courtesy car, no towing (not published).
  bays: '2', slot_minutes: '30', lead_hours: '16', horizon_days: '45', max_booking_minutes: '240', courtesy_cars: '0', cancel_cutoff_hours: '12',
  towing_offered: '0', hours_known: '1',
  // Gates — all closed until the owner opens them.
  contact_verified: '0', address_verified: '0', hours_verified: '0', privacy_approved: '0',
  bookings_live: '0', auto_confirm: '0', messages_enabled: '0', live_actions_enabled: '0',
};

// From the garage’s own 411garage.com listing: Monday–Thursday 09:00–18:00, Friday 09:00–16:00; Saturday and Sunday « sur appel » (closed in the booking grid, said in the texts).
const HOURS = [[1, "09:00", "18:00", 0], [2, "09:00", "18:00", 0], [3, "09:00", "18:00", 0], [4, "09:00", "18:00", 0], [5, "09:00", "16:00", 0], [6, null, null, 1], [7, null, null, 1]];

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
