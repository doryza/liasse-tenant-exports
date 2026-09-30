/**
 * Service Rapide Amqui — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "pare-brise",
    "icon": "wrench",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Remplacement de pare-brise",
    "name_en": "Windshield replacement",
    "tagline": "Pare-brise fissuré ou endommagé.",
    "tagline_en": "Cracked or damaged windshield.",
    "body": "Une fissure dans le pare-brise s’agrandit avec le gel, les secousses et le dégivrage. Le remplacement comprend la dépose, la préparation du cadre et la pose d’un pare-brise neuf avec un adhésif adapté.",
    "body_en": "A crack in the windshield grows with frost, bumps and defrosting. Replacement covers removal, preparing the frame and fitting a new windshield with a suitable adhesive.",
    "signs": "[\"Fissure qui s’agrandit\", \"Impact dans le champ de vision\", \"Infiltration d’eau\"]",
    "signs_en": "[\"A crack that keeps growing\", \"A chip in the line of sight\", \"Water leaking in\"]",
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
    "slug": "alignement",
    "icon": "wheel",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Alignement des roues",
    "name_en": "Wheel alignment",
    "tagline": "Une auto qui roule droit et des pneus qui durent.",
    "tagline_en": "A car that tracks straight and tires that last.",
    "body": "L’alignement règle l’angle des roues selon les données du fabricant. Un nid-de-poule, un choc contre une bordure ou des pièces de suspension usées suffisent à le dérégler : le véhicule tire d’un côté et les pneus s’usent de façon inégale. On le vérifie aussi après le remplacement de pièces de direction ou de suspension.",
    "body_en": "An alignment sets the wheel angles to the maker’s specifications. A pothole, a hit against a curb or worn suspension parts are enough to throw it off: the car pulls to one side and the tires wear unevenly. It is also checked after steering or suspension parts are replaced.",
    "signs": "[\"Le véhicule tire d’un côté\", \"Volant décentré en ligne droite\", \"Usure inégale des pneus\", \"Après un choc contre une bordure\"]",
    "signs_en": "[\"The car pulls to one side\", \"Steering wheel off-centre when driving straight\", \"Uneven tire wear\", \"After hitting a curb\"]",
    "confirmed": 1
  }
];
