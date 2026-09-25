/**
 * First-install seed. Everything factual comes from what the garage itself
 * published:
 *  - its Google Business listing « Garage Martin et Martin » (address, phone,
 *    opening hours);
 *  - its own website (site.gem-car.com/mecaniquestjerome), which carries the
 *    garage's words — the welcome text, « nous faisons tout, sauf de la
 *    carrosserie et des alignements », the four reasons to choose them, the
 *    service list, the oil-change price and the public email address.
 * That website brands the same address and phone « Mécanique St-Jérôme »;
 * the site is built under the Google name, Garage Martin & Martin, and the
 * owner confirms the name (site.contract.json → gaps).
 *
 * Nothing is invented about the business — no reviews, no photographs of the
 * shop, no team names, no warranties, no prices beyond the one they posted.
 * Every gate that speaks for the garage or acts on its behalf starts OFF:
 * bookings run in preview mode, nothing is emailed, the privacy notice is a
 * draft awaiting approval. Runs once, guarded by the platform `_seed_version`
 * sentinel.
 */
const catalog = require('./lib/catalog');
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });
const NAME = 'Garage Martin & Martin';
const ADDRESS = '17525, rue de la Paix, Mirabel (Québec) J7J 1M3';
const PHONE = '450-419-5222';

const SETTINGS = {
  business_name: NAME,
  contact_phone: PHONE,
  contact_email: 'mecaniquestjerome@outlook.com',
  business_address: ADDRESS,
  service_areas: J('Mirabel, Saint-Jérôme et les environs', 'Mirabel, Saint-Jérôme and nearby'),
  hero_kicker: J('Mécanique générale · Mirabel', 'General repair · Mirabel'),
  hero_title: J('Tout, sauf la carrosserie.', 'Everything but the bodywork.'),
  hero_subtitle: J(
    'Depuis plus de 20 ans, un propriétaire mécanicien expérimenté et passionné entretient et répare vos véhicules rue de la Paix, à Mirabel : entretien, freins, moteur, diagnostics, pneus et antirouille — de la voiture au gros pick-up.',
    'For more than 20 years, an experienced, passionate owner-mechanic has serviced and repaired vehicles on rue de la Paix in Mirabel: maintenance, brakes, engines, diagnostics, tires and rust-proofing — from the family car to the heavy-duty pickup.'),
  not_offered_text: J(
    'Nous nous concentrons exclusivement sur les réparations mécaniques et n’offrons pas de services de carrosserie ou d’alignements.',
    'We focus exclusively on mechanical repairs and do not offer bodywork or wheel alignments.'),
  why_1_title: J('Expérience', 'Experience'),
  why_1_text: J('Plus de 20 ans d’expertise dans la réparation automobile.', 'More than 20 years of expertise in auto repair.'),
  why_2_title: J('Passion', 'Passion'),
  why_2_text: J('Une équipe de passionnés qui aime ce qu’elle fait et s’engage à fournir le meilleur service.', 'A team of enthusiasts who love what they do and are committed to the best service.'),
  why_3_title: J('Honnêteté', 'Honesty'),
  why_3_text: J('Nous croyons en une communication transparente et en des solutions honnêtes pour nos clients.', 'We believe in transparent communication and honest solutions for our customers.'),
  why_4_title: J('Détermination', 'Determination'),
  why_4_text: J('Chaque problème a sa solution, et nous travaillons sans relâche pour vous offrir des résultats à la hauteur de vos attentes.', 'Every problem has a solution, and we work tirelessly to deliver results that meet your expectations.'),
  about_text: J(
    'Depuis plus de 20 ans, notre entreprise de réparation automobile est dirigée par un propriétaire mécanicien expérimenté et passionné. Située au 17 525, rue de la Paix, à Mirabel, elle offre une large gamme de services pour répondre à tous vos besoins mécaniques.\nChez Garage Martin & Martin, nous faisons tout, sauf de la carrosserie et des alignements. Que ce soit pour l’entretien régulier de votre véhicule, les réparations complexes ou les diagnostics avancés, notre équipe est à votre disposition pour vous offrir un service de qualité.\nNous sommes une équipe passionnée, honnête et déterminée à servir nos clients avec le plus grand soin. Chaque membre de notre équipe partage la même passion pour l’automobile et met un point d’honneur à fournir un travail impeccable. Notre objectif est de garantir votre satisfaction en vous offrant des solutions fiables et durables.\nChez Garage Martin & Martin, votre satisfaction est notre priorité. Venez découvrir la différence que peut faire une équipe dédiée et passionnée par l’automobile.',
    'For more than 20 years, our auto repair business has been run by an experienced, passionate owner-mechanic. Located at 17525 rue de la Paix in Mirabel, it offers a wide range of services to meet all your mechanical needs.\nAt Garage Martin & Martin, we do everything except bodywork and wheel alignments. Whether it is regular maintenance, complex repairs or advanced diagnostics, our team is here to give you quality service.\nWe are a passionate, honest team, determined to serve our customers with the greatest care. Every member of our team shares the same passion for cars and takes pride in flawless work. Our goal is your satisfaction, with reliable, lasting solutions.\nAt Garage Martin & Martin, your satisfaction is our priority. Come and see the difference a dedicated team with a passion for cars can make.'),
  contact_intro: J(
    'Pour plus d’informations ou pour prendre rendez-vous, n’hésitez pas à nous contacter. Nous sommes ici pour prendre soin de votre véhicule avec l’expertise et la passion qui nous caractérisent.',
    'For more information or to book an appointment, do not hesitate to contact us. We are here to take care of your vehicle with the expertise and passion that define us.'),
  how_1: J('Choisissez les travaux, votre véhicule et votre heure d’arrivée.', 'Pick the work, your vehicle and your arrival time.'),
  how_2: J('Le garage confirme, et la confirmation vous arrive par courriel.', 'The garage confirms, and the confirmation reaches you by email.'),
  how_3: J('Laissez le véhicule, ou attendez sur place.', 'Leave the vehicle, or wait on site.'),
  how_4: J('Suivez l’avancement dans votre compte, jusqu’à « Prêt à récupérer ».', 'Follow the progress in your account, right up to "Ready for pickup".'),
  privacy_notice: J(
    `BROUILLON À APPROUVER PAR LE GARAGE\n\n${NAME} recueille votre nom, votre numéro de téléphone, votre adresse courriel et les renseignements sur votre véhicule uniquement pour gérer vos rendez-vous, vous joindre au sujet des travaux et tenir l’historique d’entretien de votre véhicule.\n\nCes renseignements sont conservés de façon sécurisée sur la plateforme Liasse, au Canada, et ne sont jamais vendus ni transmis à des tiers à des fins publicitaires.\n\nVous pouvez consulter, corriger ou supprimer vos renseignements en tout temps depuis votre compte ou en appelant le garage au ${PHONE}.\n\nResponsable de la protection des renseignements personnels : [nom à compléter], ${NAME}, ${ADDRESS}.`,
    `DRAFT FOR THE GARAGE TO APPROVE\n\n${NAME} collects your name, phone number, email address and vehicle details only to manage your appointments, reach you about the work and keep your vehicle’s service history.\n\nThis information is stored securely on the Liasse platform, in Canada, and is never sold or shared with third parties for advertising.\n\nYou can view, correct or delete your information at any time from your account or by calling the garage at ${PHONE}.\n\nPerson responsible for personal information: [name to be completed], ${NAME}, ${ADDRESS}.`),
  // Booking rules (editable in Réglages). No courtesy car and no towing: the
  // garage never advertised either, so the wizard does not offer them.
  bays: '2', slot_minutes: '30', lead_hours: '16', horizon_days: '45', max_booking_minutes: '240', courtesy_cars: '0', cancel_cutoff_hours: '12',
  towing_offered: '0',
  // Gates — all closed until the owner opens them.
  contact_verified: '0', address_verified: '0', hours_verified: '0', privacy_approved: '0',
  bookings_live: '0', auto_confirm: '0', messages_enabled: '0', live_actions_enabled: '0',
};

// From the Google listing: Monday–Thursday 7:00–18:00, Friday 7:00–12:00,
// closed on weekends.
const HOURS = [[1, '07:00', '18:00', 0], [2, '07:00', '18:00', 0], [3, '07:00', '18:00', 0], [4, '07:00', '18:00', 0], [5, '07:00', '12:00', 0], [6, null, null, 1], [7, null, null, 1]];

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
      `INSERT INTO services(slug,name,name_en,tagline,tagline_en,body,body_en,signs,signs_en,icon,duration_min,price_from_cents,price_verified,bookable,featured,option_kind,published,sort_order,image_url,vehicle_classes)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NULL,1,$16,$17,$18 WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug=$1)`,
      [s.slug, s.name, s.name_en, s.tagline, s.tagline_en, s.body, s.body_en, s.signs, s.signs_en, s.icon, s.duration_min,
        s.price == null ? null : s.price, s.price == null ? 0 : 1, s.bookable, s.featured, i + 1, assets.services[s.slug] || null, s.classes || null]);
  }
};

module.exports.SETTINGS = SETTINGS;
module.exports.HOURS = HOURS;
