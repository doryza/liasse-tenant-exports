/**
 * Garage Ghislain Beaulieu — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "climatisation",
    "icon": "snow",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Entretien de la climatisation",
    "name_en": "Air conditioning service",
    "tagline": "De l’air froid l’été, un pare-brise qui désembue l’hiver.",
    "tagline_en": "Cold air in summer, a windshield that clears in winter.",
    "body": "La climatisation ne sert pas qu’en juillet : elle assèche l’air et aide le pare-brise à désembuer par temps froid et humide. L’entretien vérifie la charge de réfrigérant, cherche les fuites et contrôle le compresseur et le filtre d’habitacle.",
    "body_en": "Air conditioning is not only for July: it dries the air and helps clear the windshield in cold, damp weather. The service checks the refrigerant charge, looks for leaks and checks the compressor and cabin filter.",
    "signs": "[\"L’air ne refroidit plus comme avant\",\"Odeur d’humidité à la mise en marche\",\"Le pare-brise désembue mal\",\"Bruit quand la climatisation démarre\"]",
    "signs_en": "[\"The air is not as cold as it used to be\",\"A musty smell when it starts\",\"The windshield clears poorly\",\"A noise when the A/C kicks in\"]",
    "confirmed": 1
  },
  {
    "slug": "alignement",
    "icon": "wheel",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Alignement des roues",
    "name_en": "Wheel alignment",
    "tagline": "Une auto qui roule droit et des pneus qui durent.",
    "tagline_en": "A car that tracks straight and tires that last.",
    "body": "L’alignement règle l’angle des roues selon les données du fabricant. Un nid-de-poule, un choc contre une bordure ou des pièces de suspension usées suffisent à le dérégler : le véhicule tire d’un côté et les pneus s’usent de façon inégale. On le vérifie aussi après le remplacement de pièces de direction ou de suspension.",
    "body_en": "An alignment sets the wheel angles to the maker’s specifications. A pothole, a hit against a curb or worn suspension parts are enough to throw it off: the car pulls to one side and the tires wear unevenly. It is also checked after steering or suspension parts are replaced.",
    "signs": "[\"Le véhicule tire d’un côté\", \"Volant décentré en ligne droite\", \"Usure inégale des pneus\", \"Après un choc contre une bordure\"]",
    "signs_en": "[\"The car pulls to one side\", \"Steering wheel off-centre when driving straight\", \"Uneven tire wear\", \"After hitting a curb\"]",
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
