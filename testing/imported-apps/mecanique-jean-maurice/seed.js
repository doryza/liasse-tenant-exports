/**
 * First-install seed. Everything factual here comes from the garage's own
 * public listing (411garage.com, « Mécanique Jean-Maurice - Garage automobile
 * Mirabel ») and the matching Google business panel: the twelve services, the
 * address, the phone and email, the seven-day hours, the payment methods and
 * the area served. Nothing is invented about the business — no prices (every
 * service shows « Sur estimation »), no history, no team, no warranties, no
 * photographs of the shop; no courtesy car or towing (not listed).
 *
 * Every gate that speaks for the garage or acts on its behalf starts OFF:
 * bookings run in preview mode, nothing is emailed, the privacy notice is a
 * draft awaiting approval. Runs once, guarded by the platform `_seed_version`
 * sentinel.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });
const PHONE = '514-927-5738';
const ADDRESS = '14173, boulevard du Curé-Labelle, Mirabel (Québec) J7J 1M3';

const SETTINGS = {
  business_name: 'Mécanique Jean-Maurice',
  contact_phone: PHONE,
  contact_email: 'mecaniquejeanmaurice@gmail.com',
  business_address: ADDRESS,
  payment_methods: J('Comptant, débit Interac, virement Interac, Visa, Mastercard, American Express et Apple Pay',
    'Cash, Interac debit, Interac e-Transfer, Visa, Mastercard, American Express and Apple Pay'),
  service_areas: J('Mirabel et les environs', 'Mirabel and nearby'),
  hero_title: J('Votre garage à Mirabel, 7\u00a0jours sur\u00a07.', 'Your Mirabel garage, 7\u00a0days a\u00a0week.'),
  hero_subtitle: J(
    'Mécanique générale, freins, climatisation, injection et entretien, y compris les voitures coréennes, japonaises et allemandes. Réservez en deux minutes et suivez les travaux depuis votre téléphone.',
    'General repair, brakes, air conditioning, fuel injection and maintenance, including Korean, Japanese and German cars. Book in two minutes and follow the work from your phone.'),
  how_1: J('Choisissez les travaux et le moment qui vous convient.', 'Pick the work and a time that suits you.'),
  how_2: J('Le garage confirme et vous recevez un courriel.', 'The garage confirms and you get an email.'),
  how_3: J('Déposez la voiture ou attendez sur place.', 'Drop the car off or wait on site.'),
  how_4: J('Suivez l’avancement : en atelier, prête à récupérer.', 'Follow along: in the shop, ready for pickup.'),
  about_text: J(
    'Mécanique Jean-Maurice est un garage de mécanique générale situé au 14173, boulevard du Curé-Labelle, à Mirabel. Le garage entretient et répare les véhicules de Mirabel et des environs : mécanique, freins, suspension, silencieux, refroidissement, climatisation, injection, transmission, pneus et vidanges d’huile, y compris les voitures importées coréennes, japonaises et allemandes.\n\nLe garage est ouvert tous les jours : en semaine de 8 h à 18 h, le samedi de 9 h à 15 h et le dimanche de 9 h à midi.',
    'Mécanique Jean-Maurice is a general repair shop at 14173 boulevard du Curé-Labelle in Mirabel. The garage services and repairs vehicles for people in Mirabel and nearby: mechanics, brakes, suspension, exhaust, cooling, air conditioning, fuel injection, transmission, tires and oil changes, including imported Korean, Japanese and German cars.\n\nThe garage is open every day: weekdays 8 a.m. to 6 p.m., Saturday 9 a.m. to 3 p.m. and Sunday 9 a.m. to noon.'),
  contact_intro: J('Une question, une estimation, une urgence? Le plus rapide reste le téléphone — même le dimanche matin.', 'A question, an estimate, an emergency? The phone is still the fastest — even on Sunday morning.'),
  privacy_notice: J(
    'BROUILLON À APPROUVER PAR LE GARAGE\n\nMécanique Jean-Maurice recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au 514-927-5738.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], Mécanique Jean-Maurice, 14173, boulevard du Curé-Labelle, Mirabel (Québec) J7J 1M3.',
    'DRAFT FOR THE GARAGE TO APPROVE\n\nMécanique Jean-Maurice collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at 514-927-5738.\n\nPerson responsible for personal information: [name to be completed], Mécanique Jean-Maurice, 14173 boulevard du Curé-Labelle, Mirabel (Québec) J7J 1M3.'),
  // Booking rules (editable in Réglages). No courtesy car, no towing: not in the listing.
  bays: '2', slot_minutes: '30', lead_hours: '16', horizon_days: '45', max_booking_minutes: '240', courtesy_cars: '0', cancel_cutoff_hours: '12',
  towing_offered: '0',
  // Gates — all closed until the owner opens them.
  contact_verified: '0', address_verified: '0', hours_verified: '0', privacy_approved: '0',
  bookings_live: '0', auto_confirm: '0', messages_enabled: '0', live_actions_enabled: '0',
};

// Seven days a week (from the public listing): Mon–Fri 8–18, Sat 9–15, Sun 9–12.
const HOURS = [[1, '08:00', '18:00', 0], [2, '08:00', '18:00', 0], [3, '08:00', '18:00', 0], [4, '08:00', '18:00', 0], [5, '08:00', '18:00', 0], [6, '09:00', '15:00', 0], [7, '09:00', '12:00', 0]];

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
