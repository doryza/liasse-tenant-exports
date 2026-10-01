/**
 * Therrien Auto Électrique — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "batterie-demarreur-alternateur",
    "icon": "spark",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Batterie, démarreur et alternateur",
    "name_en": "Battery, starter and alternator",
    "tagline": "Le véhicule démarre mal ou pas du tout?",
    "tagline_en": "Slow start or no start?",
    "body": "La batterie fournit l’énergie au démarrage, le démarreur fait tourner le moteur et l’alternateur recharge la batterie en roulant. Un test du système de charge indique lequel est en cause. Nos hivers sont durs pour les batteries : mieux vaut la tester à l’automne.",
    "body_en": "The battery powers the start, the starter turns the engine and the alternator recharges the battery while driving. A charging-system test shows which one is at fault. Our winters are hard on batteries: test yours in the fall.",
    "signs": "[\"Démarrage lent le matin\", \"Clic sans démarrage\", \"Voyant de batterie allumé\", \"Phares qui faiblissent\"]",
    "signs_en": "[\"Slow cranking in the morning\", \"A click but no start\", \"Battery light on\", \"Headlights dimming\"]",
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
    "slug": "injection",
    "icon": "spark",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Injection",
    "name_en": "Fuel injection",
    "tagline": "Injecteurs, pompe et capteurs : le bon mélange, au bon moment.",
    "tagline_en": "Injectors, pump and sensors: the right mixture at the right time.",
    "body": "Le système d’injection dose l’essence envoyée au moteur. Un injecteur encrassé ou un capteur fatigué fait perdre de la puissance et augmenter la consommation. Le diagnostic commence par la lecture des codes d’erreur, puis vérifie la pression d’essence, les injecteurs et les capteurs.",
    "body_en": "The injection system meters the fuel sent to the engine. A clogged injector or a tired sensor costs power and raises fuel use. The diagnosis starts by reading the fault codes, then checks fuel pressure, the injectors and the sensors.",
    "signs": "[\"Démarrage difficile, surtout à froid\",\"Ralenti irrégulier ou le moteur qui cale\",\"Consommation d’essence en hausse\",\"Voyant « Check engine » allumé\"]",
    "signs_en": "[\"Hard starts, especially when cold\",\"Rough idle or the engine stalls\",\"Rising fuel consumption\",\"A \\\"Check engine\\\" light\"]",
    "confirmed": 1
  },
  {
    "slug": "diagnostic-electronique",
    "icon": "spark",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Diagnostic électronique",
    "name_en": "Electronic diagnostics",
    "tagline": "Voyants, codes d’erreur, capteurs.",
    "tagline_en": "Warning lights, fault codes, sensors.",
    "body": "Un voyant allumé enregistre un code d’erreur dans l’ordinateur du véhicule. Le diagnostic lit ces codes avec un lecteur adapté, puis vérifie les capteurs, le câblage et les composants en cause, pour réparer la bonne pièce plutôt que de deviner.",
    "body_en": "A warning light stores a fault code in the vehicle’s computer. Diagnostics read those codes with a proper scan tool, then check the sensors, wiring and parts involved, so the right part gets fixed instead of guessing.",
    "signs": "[\"Voyant moteur ou ABS allumé\", \"Perte de puissance\", \"Démarrage difficile\", \"Consommation qui augmente\"]",
    "signs_en": "[\"Check-engine or ABS light on\", \"Loss of power\", \"Hard starting\", \"Rising fuel use\"]",
    "confirmed": 1
  }
];
