/**
 * Shawbridge Auto — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "mecanique-diesel",
    "icon": "gear",
    "duration_min": 120,
    "bookable": 1,
    "featured": 1,
    "name": "Mécanique diesel",
    "name_en": "Diesel repair",
    "tagline": "Moteurs diesel : diagnostic, injection, entretien.",
    "tagline_en": "Diesel engines: diagnostics, injection, maintenance.",
    "body": "Les moteurs diesel ont leurs propres systèmes : injection haute pression, turbo, filtres à particules et traitement des gaz d’échappement. Un diagnostic adapté cible la bonne pièce, qu’il s’agisse d’une camionnette ou d’un véhicule lourd. Précisez le véhicule et le symptôme en réservant.",
    "body_en": "Diesel engines have their own systems: high-pressure injection, turbo, particulate filters and exhaust after-treatment. The right diagnostics target the right part, whether it is a pickup or a heavy vehicle. Give the vehicle and the symptom when you book.",
    "signs": "[\"Fumée noire ou blanche\", \"Perte de puissance\", \"Voyant du filtre à particules\", \"Démarrage difficile par temps froid\"]",
    "signs_en": "[\"Black or white smoke\", \"Loss of power\", \"Particulate filter light\", \"Hard starting in the cold\"]",
    "confirmed": 1
  },
  {
    "slug": "pneus",
    "icon": "wheel",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Vente et pose de pneus",
    "name_en": "Tire sales and mounting",
    "tagline": "Pneus neufs, pose et balancement.",
    "tagline_en": "New tires, mounting and balancing.",
    "body": "Au changement de saison ou quand l’usure l’exige, les pneus sont montés sur les jantes, balancés et installés, puis la pression est ajustée. Demandez conseil pour choisir des pneus adaptés à votre véhicule et à votre conduite.",
    "body_en": "At the seasonal change or when wear calls for it, tires are mounted on the rims, balanced and installed, and the pressure is set. Ask for advice to choose tires suited to your vehicle and driving.",
    "signs": "[\"Changement de saison\", \"Témoin d’usure atteint\", \"Vibration à haute vitesse\", \"Flanc fissuré ou bosselé\"]",
    "signs_en": "[\"Change of season\", \"Tread-wear bar reached\", \"Vibration at highway speed\", \"Cracked or bulging sidewall\"]",
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
    "slug": "systeme-electrique",
    "icon": "spark",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Électricité et électronique",
    "name_en": "Electrical and electronics",
    "tagline": "Batterie, alternateur, capteurs, câblage.",
    "tagline_en": "Battery, alternator, sensors, wiring.",
    "body": "Les véhicules récents dépendent de leur système électrique : batterie, alternateur, démarreur, capteurs, modules et câblage. Un diagnostic méthodique trouve la cause d’un voyant, d’une panne intermittente ou d’un accessoire qui ne fonctionne plus.",
    "body_en": "Recent vehicles depend on their electrical system: battery, alternator, starter, sensors, modules and wiring. Methodical diagnostics find the cause of a warning light, an intermittent fault or an accessory that stopped working.",
    "signs": "[\"Voyant allumé au tableau de bord\", \"Batterie qui se décharge\", \"Accessoire qui ne répond plus\", \"Démarrage difficile\"]",
    "signs_en": "[\"Warning light on the dashboard\", \"Battery that keeps draining\", \"An accessory that stopped working\", \"Hard starting\"]",
    "confirmed": 1
  },
  {
    "slug": "climatisation",
    "icon": "snow",
    "duration_min": 90,
    "bookable": 1,
    "featured": 0,
    "name": "Entretien de la climatisation",
    "name_en": "Air conditioning service",
    "tagline": "De l’air froid l’été, un pare-brise qui désembue l’hiver.",
    "tagline_en": "Cold air in summer, a windshield that clears in winter.",
    "body": "La climatisation ne sert pas qu’en juillet : elle assèche l’air et aide le pare-brise à désembuer par temps froid et humide. L’entretien vérifie la charge de réfrigérant, cherche les fuites et contrôle le compresseur et le filtre d’habitacle.",
    "body_en": "Air conditioning is not only for July: it dries the air and helps clear the windshield in cold, damp weather. The service checks the refrigerant charge, looks for leaks and checks the compressor and cabin filter.",
    "signs": "[\"L’air ne refroidit plus comme avant\",\"Odeur d’humidité à la mise en marche\",\"Le pare-brise désembue mal\",\"Bruit quand la climatisation démarre\"]",
    "signs_en": "[\"The air is not as cold as it used to be\",\"A musty smell when it starts\",\"The windshield clears poorly\",\"A noise when the A/C kicks in\"]",
    "confirmed": 1
  }
];
