/**
 * Garage Poirier Frontenac — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
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
    "slug": "equilibrage-rotation-pneus",
    "icon": "wheel",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Équilibrage et rotation des pneus",
    "name_en": "Tire balancing and rotation",
    "tagline": "Des pneus qui s’usent également et une conduite sans vibration.",
    "tagline_en": "Tires that wear evenly and a ride without vibration.",
    "body": "L’équilibrage élimine les vibrations dans le volant et le siège; la rotation fait passer les pneus d’une position à l’autre pour qu’ils s’usent également et durent plus longtemps. C’est aussi le bon moment pour vérifier la pression et l’usure.",
    "body_en": "Balancing removes vibration in the steering wheel and seat; rotation moves the tires between positions so they wear evenly and last longer. It is also the right moment to check pressure and wear.",
    "signs": "[\"Vibration dans le volant sur l’autoroute\",\"Usure inégale des pneus\",\"Le passage aux pneus d’hiver ou d’été\"]",
    "signs_en": "[\"Steering-wheel vibration on the highway\",\"Uneven tire wear\",\"Switching to winter or summer tires\"]",
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
    "slug": "carrosserie",
    "icon": "wrench",
    "duration_min": 120,
    "bookable": 1,
    "featured": 0,
    "name": "Carrosserie",
    "name_en": "Body work",
    "tagline": "Bosses, rayures, pièces de carrosserie.",
    "tagline_en": "Dents, scratches, body panels.",
    "body": "La carrosserie protège le véhicule et sa structure. Après un accrochage ou avec le temps, une évaluation détermine ce qui se répare et ce qui se remplace. Réservez pour une évaluation : le travail est chiffré avant de commencer.",
    "body_en": "The body protects the vehicle and its structure. After a scrape or over time, an assessment decides what can be repaired and what must be replaced. Book an assessment: the work is estimated before it starts.",
    "signs": "[\"Bosse ou éraflure après un accrochage\", \"Pièce de carrosserie qui bouge\", \"Rouille qui perce\", \"Porte ou capot qui ferme mal\"]",
    "signs_en": "[\"A dent or scrape after a bump\", \"A loose body panel\", \"Rust coming through\", \"A door or hood that won’t close right\"]",
    "confirmed": 1
  }
];
