/**
 * Garage Paul Hebert — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "remorquage",
    "icon": "tow",
    "duration_min": 0,
    "bookable": 0,
    "featured": 1,
    "option": "towing",
    "name": "Remorquage",
    "name_en": "Towing",
    "tagline": "Le véhicule ne roule plus? Appelez le garage.",
    "tagline_en": "Car won’t move? Call the garage.",
    "body": "En panne à Saint-Boniface ou dans les environs? Appelez directement le garage. Au moment de réserver, vous pouvez aussi indiquer que le véhicule doit être remorqué et l’adresse où il se trouve : le garage vous rappelle pour organiser la prise en charge.",
    "body_en": "Broken down in Saint-Boniface or nearby? Call the garage directly. When booking, you can also say the vehicle needs a tow and where it is: the garage calls you back to arrange the pickup.",
    "signs": "[\"Le véhicule ne démarre plus\", \"Voyant rouge ou surchauffe sur la route\", \"Accident ou crevaison sans roue de secours\"]",
    "signs_en": "[\"The car will not start\", \"A red warning light or overheating on the road\", \"An accident or a flat without a spare\"]",
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
    "slug": "carrosserie",
    "icon": "wrench",
    "duration_min": 120,
    "bookable": 1,
    "featured": 1,
    "name": "Carrosserie",
    "name_en": "Body work",
    "tagline": "Bosses, rayures, pièces de carrosserie.",
    "tagline_en": "Dents, scratches, body panels.",
    "body": "La carrosserie protège le véhicule et sa structure. Après un accrochage ou avec le temps, une évaluation détermine ce qui se répare et ce qui se remplace. Réservez pour une évaluation : le travail est chiffré avant de commencer.",
    "body_en": "The body protects the vehicle and its structure. After a scrape or over time, an assessment decides what can be repaired and what must be replaced. Book an assessment: the work is estimated before it starts.",
    "signs": "[\"Bosse ou éraflure après un accrochage\", \"Pièce de carrosserie qui bouge\", \"Rouille qui perce\", \"Porte ou capot qui ferme mal\"]",
    "signs_en": "[\"A dent or scrape after a bump\", \"A loose body panel\", \"Rust coming through\", \"A door or hood that won’t close right\"]",
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
    "slug": "freins",
    "icon": "brake",
    "duration_min": 90,
    "bookable": 1,
    "featured": 0,
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
