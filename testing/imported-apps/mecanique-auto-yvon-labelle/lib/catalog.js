/**
 * Mécanique Auto Yvon Labelle — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "entretien-preventif",
    "icon": "oil",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Entretien préventif",
    "name_en": "Preventive maintenance",
    "tagline": "L’entretien prévu par le fabricant, au bon moment.",
    "tagline_en": "The maker’s maintenance schedule, on time.",
    "body": "Le carnet d’entretien du fabricant prévoit des inspections et des remplacements selon le kilométrage et le temps : liquides, filtres, courroies, freins, pneus. Les suivre aide à éviter les pannes et les grosses réparations, et garde un historique utile à la revente.",
    "body_en": "The maker’s maintenance schedule calls for inspections and replacements by mileage and time: fluids, filters, belts, brakes, tires. Keeping to it helps avoid breakdowns and big repairs, and leaves a history that helps at resale.",
    "signs": "[\"Voyant d’entretien allumé\", \"Kilométrage prévu au carnet atteint\", \"Avant un long voyage\", \"Changement de saison\"]",
    "signs_en": "[\"Service light on\", \"Scheduled mileage reached\", \"Before a long trip\", \"Change of season\"]",
    "confirmed": 1
  },
  {
    "slug": "vidange-huile",
    "icon": "oil",
    "duration_min": 30,
    "bookable": 1,
    "featured": 1,
    "name": "Vidange d’huile",
    "name_en": "Oil change",
    "tagline": "Huile, filtre et inspection des points essentiels.",
    "tagline_en": "Oil, filter and a check of the essentials.",
    "body": "La vidange est l’entretien le plus simple et le plus important pour la vie du moteur. Elle comprend l’huile appropriée à votre moteur, un filtre neuf et un coup d’œil aux niveaux, aux pneus et aux fuites. Réservez en ligne, déposez la voiture ou attendez sur place.",
    "body_en": "An oil change is the simplest and most important service for engine life. It includes the right oil for your engine, a new filter and a quick look at fluid levels, tires and leaks. Book online, drop the car off or wait on site.",
    "signs": "[\"Le rappel d’entretien s’affiche\",\"Kilométrage atteint depuis la dernière vidange\",\"Huile foncée ou niveau bas\"]",
    "signs_en": "[\"The service reminder appears\",\"Mileage reached since the last change\",\"Dark oil or a low level\"]",
    "confirmed": 1
  },
  {
    "slug": "antirouille",
    "icon": "oil",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Traitement antirouille",
    "name_en": "Rustproofing",
    "tagline": "Protéger le dessous du véhicule contre le sel.",
    "tagline_en": "Protect the underbody from road salt.",
    "body": "Le sel et le calcium de nos routes attaquent le dessous des véhicules. Un traitement antirouille appliqué chaque année, idéalement à l’automne, protège le châssis, les bas de caisse et les conduites.",
    "body_en": "Salt and calcium on our roads attack the underside of vehicles. A rustproofing treatment applied every year, ideally in the fall, protects the frame, rocker panels and lines.",
    "signs": "[\"Avant l’hiver\", \"Taches de rouille sur le châssis\", \"Véhicule neuf ou récent\", \"Bas de caisse qui bullent\"]",
    "signs_en": "[\"Before winter\", \"Rust spots on the frame\", \"A new or recent vehicle\", \"Bubbling rocker panels\"]",
    "confirmed": 1
  },
  {
    "slug": "transmission",
    "icon": "gear",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Transmission",
    "name_en": "Transmission",
    "tagline": "Entretien, diagnostic et réparation, automatique ou manuelle.",
    "tagline_en": "Service, diagnosis and repair, automatic or manual.",
    "body": "L’huile de transmission s’use comme l’huile moteur. Un entretien régulier prévient bien des réparations coûteuses. Au premier signe inhabituel, un diagnostic permet de distinguer un simple entretien d’une réparation.",
    "body_en": "Transmission fluid wears out just like engine oil. Regular service prevents many costly repairs. At the first unusual sign, a diagnosis tells a simple service apart from a repair.",
    "signs": "[\"Passages de vitesse brusques ou retardés\",\"Bruit en prise\",\"Fuite de liquide rouge\",\"Voyant de transmission\"]",
    "signs_en": "[\"Harsh or delayed shifts\",\"Noise in gear\",\"A red fluid leak\",\"A transmission warning light\"]",
    "confirmed": 1
  },
  {
    "slug": "pneus",
    "icon": "wheel",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Vente et pose de pneus",
    "name_en": "Tire sales and mounting",
    "tagline": "Pneus neufs, pose et balancement.",
    "tagline_en": "New tires, mounting and balancing.",
    "body": "Au changement de saison ou quand l’usure l’exige, les pneus sont montés sur les jantes, balancés et installés, puis la pression est ajustée. Demandez conseil pour choisir des pneus adaptés à votre véhicule et à votre conduite.",
    "body_en": "At the seasonal change or when wear calls for it, tires are mounted on the rims, balanced and installed, and the pressure is set. Ask for advice to choose tires suited to your vehicle and driving.",
    "signs": "[\"Changement de saison\", \"Témoin d’usure atteint\", \"Vibration à haute vitesse\", \"Flanc fissuré ou bosselé\"]",
    "signs_en": "[\"Change of season\", \"Tread-wear bar reached\", \"Vibration at highway speed\", \"Cracked or bulging sidewall\"]",
    "confirmed": 1
  }
];
