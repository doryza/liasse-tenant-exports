/**
 * Garage Tremblay Auto Électrique — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "freins",
    "icon": "brake",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Freins",
    "name_en": "Brakes",
    "tagline": "Plaquettes, disques, étriers et liquide : des freins qui répondent.",
    "tagline_en": "Pads, rotors, calipers and fluid: brakes that answer.",
    "body": "Les freins s’usent un peu à chaque arrêt. L’inspection mesure les plaquettes et les disques, vérifie les étriers, les conduites et le liquide de frein, puis vous dit ce qui est usé, ce qui peut attendre et ce qui presse.\nLe sel et les hivers québécois sont durs pour les étriers et les conduites : un bruit ou une vibration au freinage mérite d’être vérifié rapidement.",
    "body_en": "Brakes wear a little at every stop. The inspection measures the pads and rotors, checks the calipers, lines and brake fluid, then tells you what is worn, what can wait and what is urgent.\nSalt and Québec winters are hard on calipers and lines: a noise or vibration when braking deserves a quick check.",
    "signs": "[\"Grincement ou sifflement au freinage\",\"Vibration dans la pédale ou le volant\",\"La pédale est molle ou descend plus bas\",\"Le véhicule tire d’un côté au freinage\"]",
    "signs_en": "[\"Squealing or grinding when braking\",\"Vibration in the pedal or steering wheel\",\"The pedal feels soft or sinks lower\",\"The vehicle pulls to one side when braking\"]",
    "confirmed": 1
  },
  {
    "slug": "silencieux",
    "icon": "exhaust",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Silencieux et échappement",
    "name_en": "Muffler & exhaust",
    "tagline": "Un échappement étanche, silencieux et conforme.",
    "tagline_en": "An exhaust that is sealed, quiet and compliant.",
    "body": "Le sel de nos hivers est dur pour l’échappement. Un silencieux percé ou un tuyau rouillé rend la voiture bruyante et peut laisser entrer des gaz dans l’habitacle. L’inspection couvre le silencieux, les tuyaux, les supports et les joints.",
    "body_en": "Winter road salt is hard on an exhaust. A holed muffler or a rusted pipe makes the car loud and can let fumes into the cabin. The inspection covers the muffler, pipes, hangers and gaskets.",
    "signs": "[\"Grondement plus fort qu’avant\",\"Cliquetis sous le véhicule\",\"Odeur de gaz d’échappement dans l’habitacle\"]",
    "signs_en": "[\"A louder rumble than before\",\"Rattling under the car\",\"Exhaust smell inside the cabin\"]",
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
    "slug": "injection",
    "icon": "spark",
    "duration_min": 90,
    "bookable": 1,
    "featured": 0,
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
    "slug": "systeme-electrique",
    "icon": "spark",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Électricité et électronique",
    "name_en": "Electrical and electronics",
    "tagline": "Batterie, alternateur, capteurs, câblage.",
    "tagline_en": "Battery, alternator, sensors, wiring.",
    "body": "Les véhicules récents dépendent de leur système électrique : batterie, alternateur, démarreur, capteurs, modules et câblage. Un diagnostic méthodique trouve la cause d’un voyant, d’une panne intermittente ou d’un accessoire qui ne fonctionne plus.",
    "body_en": "Recent vehicles depend on their electrical system: battery, alternator, starter, sensors, modules and wiring. Methodical diagnostics find the cause of a warning light, an intermittent fault or an accessory that stopped working.",
    "signs": "[\"Voyant allumé au tableau de bord\", \"Batterie qui se décharge\", \"Accessoire qui ne répond plus\", \"Démarrage difficile\"]",
    "signs_en": "[\"Warning light on the dashboard\", \"Battery that keeps draining\", \"An accessory that stopped working\", \"Hard starting\"]",
    "confirmed": 1
  }
];
