/**
 * First-install seed — facts from the sources below only; nothing invented
 * (no prices, team, warranties beyond the legal one, testimonials or photos).
 * Dossier (Google: Station Service Tracy Inc, 2805 Chem. Saint-Roch, Sorel-Tracy, QC J3R 5J8, 450-743-7711, rating 4.7/19). PagesJaunes « Station Service Tracy Inc » (7735632.html; same phone and address): hours du lundi au jeudi, de 8 h à 17 h 30 et le vendredi, de 8 h à 12 h; services listed → mecanique-generale, climatisation, pneus, batterie-demarreur-alternateur, systeme-de-refroidissement, silencieux, vidange-huile, suspension, equilibrage-rotation-pneus, mise-au-point, diagnostic-electronique, inspection-mecanique. Mode: full. Facts as of septembre 2026.
 * Every gate that speaks for the garage starts OFF.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

const SETTINGS = {
  business_name: "Station Service Tracy",
  contact_phone: '450-743-7711',
  business_address: "2805, chemin Saint-Roch, Sorel-Tracy (Québec) J3R 5J8",
  payment_methods: J("À confirmer — demandez au garage.", "To be confirmed — ask the garage."),
  service_areas: J("Sorel-Tracy et les environs", "Sorel-Tracy and nearby"),
  hero_title: J("Votre garage à Sorel-⁠Tracy.", "Your garage in Sorel-⁠Tracy."),
  hero_subtitle: J("Noté 4,7 sur 5 par 19 clients sur Google (septembre 2026). Ouvert du lundi au jeudi, de 8 h à 17 h 30 et le vendredi, de 8 h à 12 h. Réservez en ligne et suivez les travaux depuis votre téléphone.", "Rated 4.7 out of 5 by 19 customers on Google (September 2026). Open Monday to Thursday, 8 a.m. to 5:30 p.m. and Friday, 8 a.m. to 12 p.m.. Book online and follow the work from your phone."),
  how_1: J("Choisissez les travaux et le moment qui vous convient.", "Pick the work and a time that suits you."),
  how_2: J("Le garage confirme et vous recevez un courriel.", "The garage confirms and you get an email."),
  how_3: J("Déposez la voiture ou attendez sur place.", "Drop the car off or wait on site."),
  how_4: J("Suivez l’avancement : en atelier, prête à récupérer.", "Follow along: in the shop, ready for pickup."),
  about_text: J("Station Service Tracy est un garage de mécanique automobile situé au 2805, chemin Saint-Roch, à Sorel-Tracy. Ses clients lui donnent 4,7 sur 5 sur Google (19 avis, septembre 2026). Services offerts : mécanique générale, entretien de la climatisation, vente et pose de pneus, batterie, démarreur et alternateur, système de refroidissement, silencieux et échappement, vidange d’huile, suspension, équilibrage et rotation des pneus, mise au point du moteur, diagnostic électronique et inspection mécanique.\n\nLe garage est ouvert du lundi au jeudi, de 8 h à 17 h 30 et le vendredi, de 8 h à 12 h. Pour faire vérifier votre véhicule ou obtenir une estimation, réservez en ligne ou appelez le 450-743-7711.", "Station Service Tracy is an auto repair shop at 2805, chemin Saint-Roch in Sorel-Tracy. Its customers rate it 4.7 out of 5 on Google (19 reviews, September 2026). Services: general repair, air conditioning service, tire sales and mounting, battery, starter and alternator, cooling system, muffler & exhaust, oil change, suspension, tire balancing and rotation, engine tune-up, electronic diagnostics and mechanical inspection.\n\nThe garage is open Monday to Thursday, 8 a.m. to 5:30 p.m. and Friday, 8 a.m. to 12 p.m.. To have your vehicle looked at or get an estimate, book online or call 450-743-7711."),
  contact_intro: J("Une question ou une estimation? Le plus rapide : un coup de fil au 450-743-7711.", "A question or an estimate? The fastest way: a call to 450-743-7711."),
  privacy_notice: J("BROUILLON À APPROUVER PAR LE GARAGE\n\nStation Service Tracy recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 450-743-7711.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Station Service Tracy, 2805, chemin Saint-Roch, Sorel-Tracy (Québec) J3R 5J8.", "DRAFT FOR THE GARAGE TO APPROVE\n\nStation Service Tracy collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 450-743-7711.\n\nPerson responsible for personal information: [name to be completed], Station Service Tracy, 2805, chemin Saint-Roch, Sorel-Tracy (Québec) J3R 5J8."),
  // Booking rules (editable in Réglages). No courtesy car, no towing (not published).
  bays: '2', slot_minutes: '30', lead_hours: '16', horizon_days: '45', max_booking_minutes: '240', courtesy_cars: '0', cancel_cutoff_hours: '12',
  towing_offered: '0', hours_known: '1',
  // Gates — all closed until the owner opens them.
  contact_verified: '0', address_verified: '0', hours_verified: '0', privacy_approved: '0',
  bookings_live: '0', auto_confirm: '0', messages_enabled: '0', live_actions_enabled: '0',
};

// From PagesJaunes (same phone and address as the Google listing): du lundi au jeudi, de 8 h à 17 h 30 et le vendredi, de 8 h à 12 h; days not listed = closed.
const HOURS = [[1, "08:00", "17:30", 0], [2, "08:00", "17:30", 0], [3, "08:00", "17:30", 0], [4, "08:00", "17:30", 0], [5, "08:00", "12:00", 0], [6, null, null, 1], [7, null, null, 1]];

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
