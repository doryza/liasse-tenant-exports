/**
 * First-install seed. Everything factual here comes from the garage's own
 * public listing (411garage.com, « Garage Mécanique E.L. Mirabel »): the
 * eleven services, the address, the phone number, the opening hours, the
 * payment methods and the areas served. Nothing is invented about the
 * business — no prices (every service shows « Sur estimation »), no history,
 * no warranties, no photographs of the shop.
 *
 * Every gate that speaks for the garage or acts on its behalf starts OFF:
 * bookings run in preview mode, nothing is emailed, the privacy notice is a
 * draft awaiting approval. Runs once, guarded by the platform `_seed_version`
 * sentinel.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

const SETTINGS = {
  business_name: 'Garage Mécanique E.L.',
  contact_phone: '450-820-8213',
  business_address: '17565, rue de la Paix, Mirabel (Québec) J7J 1M3',
  payment_methods: J('Argent comptant et Visa', 'Cash and Visa'),
  service_areas: J('Mirabel, Blainville et les environs', 'Mirabel, Blainville and nearby'),
  hero_title: J('Votre garage à Mirabel, en ligne.', 'Your Mirabel garage, online.'),
  hero_subtitle: J(
    'Mécanique générale, entretien et réparations. Réservez en deux minutes, retrouvez vos véhicules dans votre compte et suivez les travaux depuis votre téléphone.',
    'General repair, maintenance and service. Book in two minutes, keep your vehicles in your account and follow the work from your phone.'),
  how_1: J('Choisissez les travaux et le moment qui vous convient.', 'Pick the work and a time that suits you.'),
  how_2: J('Le garage confirme et vous recevez un courriel.', 'The garage confirms and you get an email.'),
  how_3: J('Déposez la voiture ou attendez sur place.', 'Drop the car off or wait on site.'),
  how_4: J('Suivez l’avancement : en atelier, prêt à récupérer.', 'Follow along: in the shop, ready for pickup.'),
  about_text: J(
    'Garage Mécanique E.L. est un atelier de mécanique générale situé rue de la Paix, à Mirabel. Le garage entretient et répare les véhicules des résidents de Mirabel, de Blainville et des environs : mécanique, freins, suspension, échappement, refroidissement, transmission et vidanges d’huile, avec une voiture de courtoisie et un service de remorquage.',
    'Garage Mécanique E.L. is a general repair shop on rue de la Paix in Mirabel. The garage services and repairs vehicles for people in Mirabel, Blainville and nearby: mechanics, brakes, suspension, exhaust, cooling, transmission and oil changes, with a courtesy car and a towing service.'),
  contact_intro: J('Une question, une estimation, une urgence? Le plus rapide reste le téléphone.', 'A question, an estimate, an emergency? The phone is still the fastest.'),
  privacy_notice: J(
    'BROUILLON À APPROUVER PAR LE GARAGE\n\nGarage Mécanique E.L. recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 450-820-8213.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Garage Mécanique E.L., 17565, rue de la Paix, Mirabel (Québec) J7J 1M3.',
    'DRAFT FOR THE GARAGE TO APPROVE\n\nGarage Mécanique E.L. collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 450-820-8213.\n\nPerson responsible for personal information: [name to be completed], Garage Mécanique E.L., 17565, rue de la Paix, Mirabel (Québec) J7J 1M3.'),
  // Booking rules (editable in Réglages).
  bays: '2', slot_minutes: '30', lead_hours: '16', horizon_days: '45', max_booking_minutes: '240', courtesy_cars: '1', cancel_cutoff_hours: '12',
  // Gates — all closed until the owner opens them.
  contact_verified: '0', address_verified: '0', hours_verified: '0', privacy_approved: '0',
  bookings_live: '0', auto_confirm: '0', messages_enabled: '0', live_actions_enabled: '0',
};

// Monday–Friday 9:00–18:00, closed on weekends (from the public listing).
const HOURS = [[1, '09:00', '18:00', 0], [2, '09:00', '18:00', 0], [3, '09:00', '18:00', 0], [4, '09:00', '18:00', 0], [5, '09:00', '18:00', 0], [6, null, null, 1], [7, null, null, 1]];

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
      `INSERT INTO services(slug,name,name_en,tagline,tagline_en,body,body_en,signs,signs_en,icon,duration_min,price_from_cents,price_verified,bookable,featured,option_kind,published,sort_order,image_url)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NULL,0,$12,$13,$14,1,$15,$16 WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug=$1)`,
      [s.slug, s.name, s.name_en, s.tagline, s.tagline_en, s.body, s.body_en, s.signs, s.signs_en, s.icon, s.duration_min,
        s.bookable, s.featured, s.option || null, i + 1, assets.services[s.slug] || null]);
  }
};

module.exports.SETTINGS = SETTINGS;
module.exports.HOURS = HOURS;
