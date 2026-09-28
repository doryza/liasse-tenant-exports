/**
 * Garage Ja-Ri Armatures — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "batterie-demarreur-alternateur",
    "icon": "spark",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Démarreurs, alternateurs et batteries",
    "name_en": "Starters, alternators and batteries",
    "tagline": "Le véhicule démarre mal ou pas du tout?",
    "tagline_en": "Slow start or no start?",
    "body": "La batterie fournit l’énergie au démarrage, le démarreur fait tourner le moteur et l’alternateur recharge la batterie en roulant. Un test du système de charge indique lequel est en cause. Nos hivers sont durs pour les batteries : mieux vaut la tester à l’automne.",
    "body_en": "The battery powers the start, the starter turns the engine and the alternator recharges the battery while driving. A charging-system test shows which one is at fault. Our winters are hard on batteries: test yours in the fall.",
    "signs": "[\"Démarrage lent le matin\", \"Clic sans démarrage\", \"Voyant de batterie allumé\", \"Phares qui faiblissent\"]",
    "signs_en": "[\"Slow cranking in the morning\", \"A click but no start\", \"Battery light on\", \"Headlights dimming\"]",
    "confirmed": 1
  },
  {
    "slug": "electricite-electronique",
    "icon": "spark",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Problèmes électriques : autos, camions, machines agricoles",
    "name_en": "Electrical problems: cars, trucks, farm machinery",
    "tagline": "Démarrage, charge, capteurs, modules.",
    "tagline_en": "Starting, charging, sensors, modules.",
    "body": "Les véhicules récents dépendent de leur électricité et de leurs modules électroniques : démarrage, recharge, éclairage, capteurs et calculateurs. Le diagnostic mesure la batterie et l’alternateur, lit les codes d’erreur et suit le câblage jusqu’à la cause de la panne.",
    "body_en": "Modern vehicles depend on their electrical system and electronic modules: starting, charging, lights, sensors and computers. Diagnosis measures the battery and alternator, reads the fault codes and follows the wiring to the cause of the fault.",
    "signs": "[\"Voyant allumé au tableau de bord\", \"Démarrage lent\", \"Accessoire qui ne fonctionne plus\", \"Batterie qui se décharge\"]",
    "signs_en": "[\"A warning light on the dash\", \"Slow cranking\", \"An accessory that stopped working\", \"A battery that keeps draining\"]",
    "confirmed": 1
  },
  {
    "slug": "generatrice",
    "icon": "spark",
    "duration_min": 90,
    "bookable": 1,
    "featured": 0,
    "name": "Génératrices",
    "name_en": "Generators",
    "tagline": "Réparation et entretien de génératrices.",
    "tagline_en": "Generator repair and maintenance.",
    "body": "Une génératrice doit démarrer le jour où on en a besoin. Le garage vérifie et répare les génératrices : démarrage, régulateur, alternateur et câblage. Précisez le modèle et la puissance en réservant.",
    "body_en": "A generator has to start on the day you need it. The garage checks and repairs generators: starting, regulator, alternator and wiring. Give the model and output when you book.",
    "signs": "[\"Ne démarre plus\", \"Tension instable\", \"Entretien avant l’hiver\"]",
    "signs_en": "[\"Will not start\", \"Unstable voltage\", \"Pre-winter maintenance\"]",
    "confirmed": 1
  },
  {
    "slug": "soudeuse",
    "icon": "spark",
    "duration_min": 90,
    "bookable": 1,
    "featured": 0,
    "name": "Réparation de soudeuses",
    "name_en": "Welder repair",
    "tagline": "Soudeuses électriques : diagnostic et réparation.",
    "tagline_en": "Electric welders: diagnosis and repair.",
    "body": "Le garage répare les soudeuses : alimentation, câblage, commandes et composants électriques. Apportez l’appareil ou décrivez le problème en réservant.",
    "body_en": "The garage repairs welders: power supply, wiring, controls and electrical parts. Bring the unit or describe the problem when you book.",
    "signs": "[\"Arc instable\", \"L’appareil ne démarre plus\", \"Câble ou connecteur abîmé\"]",
    "signs_en": "[\"Unstable arc\", \"The unit will not start\", \"A damaged cable or connector\"]",
    "confirmed": 1
  },
  {
    "slug": "solaire",
    "icon": "spark",
    "duration_min": 0,
    "bookable": 0,
    "featured": 0,
    "name": "Panneaux solaires et mini-éoliennes",
    "name_en": "Solar panels and small wind turbines",
    "tagline": "Indiqués par le garage — appelez pour les détails.",
    "tagline_en": "Listed by the garage — call for details.",
    "body": "La fiche du garage mentionne les panneaux solaires et les mini-éoliennes. Appelez le garage pour savoir ce qu’il offre et comment il peut vous aider.",
    "body_en": "The garage’s listing mentions solar panels and small wind turbines. Call the garage to find out what it offers and how it can help.",
    "signs": "[\"Projet d’alimentation autonome\", \"Question sur un système existant\"]",
    "signs_en": "[\"An off-grid power project\", \"A question about an existing system\"]",
    "confirmed": 1
  }
];
