/**
 * First-install seed — facts from the sources below only; nothing invented
 * (no prices, team, warranties beyond the legal one, testimonials or photos).
 * Dossier (Google: Centre Technique Gilco, 979 Bd du Lac, Lac-Beauport, QC G3B 0W4, 418-841-6391, rating 4.4/94). PagesJaunes « Centre Technique Gilco » (100127789.html; same phone and address): hours du lundi au mercredi, de 7 h 30 à 17 h 30, le jeudi, de 7 h 30 à 18 h et le vendredi, de 7 h 30 à 17 h 30; services listed → pare-brise, remorquage, pneus, entretien-preventif, silencieux, alignement, diagnostic-electronique, suspension, transmission, systeme-electrique, freins. Mode: full. Facts as of septembre 2026.
 * Every gate that speaks for the garage starts OFF.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

const SETTINGS = {
  business_name: "Centre Technique Gilco",
  contact_phone: '418-841-6391',
  business_address: "979, boulevard du Lac, Lac-Beauport (Québec) G3B 0W4",
  payment_methods: J("À confirmer — demandez au garage.", "To be confirmed — ask the garage."),
  service_areas: J("Lac-Beauport et les environs", "Lac-Beauport and nearby"),
  hero_title: J("Votre garage à Lac-⁠Beauport.", "Your garage in Lac-⁠Beauport."),
  hero_subtitle: J("Noté 4,4 sur 5 par 94 clients sur Google (septembre 2026). Ouvert du lundi au mercredi, de 7 h 30 à 17 h 30, le jeudi, de 7 h 30 à 18 h et le vendredi, de 7 h 30 à 17 h 30. Réservez en ligne et suivez les travaux depuis votre téléphone.", "Rated 4.4 out of 5 by 94 customers on Google (September 2026). Open Monday to Wednesday, 7:30 a.m. to 5:30 p.m., Thursday, 7:30 a.m. to 6 p.m. and Friday, 7:30 a.m. to 5:30 p.m.. Book online and follow the work from your phone."),
  how_1: J("Choisissez les travaux et le moment qui vous convient.", "Pick the work and a time that suits you."),
  how_2: J("Le garage confirme et vous recevez un courriel.", "The garage confirms and you get an email."),
  how_3: J("Déposez la voiture ou attendez sur place.", "Drop the car off or wait on site."),
  how_4: J("Suivez l’avancement : en atelier, prête à récupérer.", "Follow along: in the shop, ready for pickup."),
  about_text: J("Centre Technique Gilco est un garage de mécanique automobile situé au 979, boulevard du Lac, à Lac-Beauport. Ses clients lui donnent 4,4 sur 5 sur Google (94 avis, septembre 2026). Services offerts : remplacement de pare-brise, remorquage, vente et pose de pneus, entretien préventif, silencieux et échappement, alignement des roues, diagnostic électronique, suspension, transmission, électricité et électronique et freins.\n\nLe garage est ouvert du lundi au mercredi, de 7 h 30 à 17 h 30, le jeudi, de 7 h 30 à 18 h et le vendredi, de 7 h 30 à 17 h 30. Pour faire vérifier votre véhicule ou obtenir une estimation, réservez en ligne ou appelez le 418-841-6391.", "Centre Technique Gilco is an auto repair shop at 979, boulevard du Lac in Lac-Beauport. Its customers rate it 4.4 out of 5 on Google (94 reviews, September 2026). Services: windshield replacement, towing, tire sales and mounting, preventive maintenance, muffler & exhaust, wheel alignment, electronic diagnostics, suspension, transmission, electrical and electronics and brakes.\n\nThe garage is open Monday to Wednesday, 7:30 a.m. to 5:30 p.m., Thursday, 7:30 a.m. to 6 p.m. and Friday, 7:30 a.m. to 5:30 p.m.. To have your vehicle looked at or get an estimate, book online or call 418-841-6391."),
  contact_intro: J("Une question ou une estimation? Le plus rapide : un coup de fil au 418-841-6391.", "A question or an estimate? The fastest way: a call to 418-841-6391."),
  privacy_notice: J("BROUILLON À APPROUVER PAR LE GARAGE\n\nCentre Technique Gilco recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 418-841-6391.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Centre Technique Gilco, 979, boulevard du Lac, Lac-Beauport (Québec) G3B 0W4.", "DRAFT FOR THE GARAGE TO APPROVE\n\nCentre Technique Gilco collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 418-841-6391.\n\nPerson responsible for personal information: [name to be completed], Centre Technique Gilco, 979, boulevard du Lac, Lac-Beauport (Québec) G3B 0W4."),
  // Booking rules (editable in Réglages). No courtesy car (not published).
  bays: '2', slot_minutes: '30', lead_hours: '16', horizon_days: '45', max_booking_minutes: '240', courtesy_cars: '0', cancel_cutoff_hours: '12',
  towing_offered: '1', hours_known: '1',
  // Gates — all closed until the owner opens them.
  contact_verified: '0', address_verified: '0', hours_verified: '0', privacy_approved: '0',
  bookings_live: '0', auto_confirm: '0', messages_enabled: '0', live_actions_enabled: '0',
};

// From PagesJaunes (same phone and address as the Google listing): du lundi au mercredi, de 7 h 30 à 17 h 30, le jeudi, de 7 h 30 à 18 h et le vendredi, de 7 h 30 à 17 h 30; days not listed = closed.
const HOURS = [[1, "07:30", "17:30", 0], [2, "07:30", "17:30", 0], [3, "07:30", "17:30", 0], [4, "07:30", "18:00", 0], [5, "07:30", "17:30", 0], [6, null, null, 1], [7, null, null, 1]];

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
