/**
 * Garage A. Collard — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "mecanique-generale",
    "icon": "wrench",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Mécanique générale",
    "name_en": "General repair",
    "tagline": "Diagnostic, freins, courroies, direction : on trouve la cause, on répare.",
    "tagline_en": "Diagnostics, brakes, belts, steering: we find the cause and fix it.",
    "body": "Un bruit nouveau, un voyant qui s’allume, une conduite qui a changé : la mécanique générale commence par un diagnostic. Le véhicule est inspecté, les codes d’erreur sont lus, et vous recevez une explication claire de ce qui se passe avant toute réparation.\nFreins, courroies, direction, démarreur, alternateur, batterie : la plupart des réparations courantes se font dans la même visite.",
    "body_en": "A new noise, a warning light, a car that drives differently: general repair starts with a diagnosis. The vehicle is inspected, fault codes are read, and you get a clear explanation of what is going on before any repair.\nBrakes, belts, steering, starter, alternator, battery: most everyday repairs are handled in the same visit.",
    "signs": "[\"Un voyant « Check engine » allumé\",\"Grincement ou vibration au freinage\",\"Difficulté à démarrer\",\"Odeur de brûlé ou fuite sous le véhicule\"]",
    "signs_en": "[\"A \\\"Check engine\\\" light\",\"Squealing or vibration when braking\",\"Hard starts\",\"A burning smell or a leak under the car\"]",
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
  }
];
