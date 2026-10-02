/**
 * Mécanique à Domicile Daniel Sanschagrin — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
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
    "slug": "systeme-de-refroidissement",
    "icon": "thermo",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Système de refroidissement",
    "name_en": "Cooling system",
    "tagline": "Radiateur, pompe à eau, thermostat, antigel.",
    "tagline_en": "Radiator, water pump, thermostat, coolant.",
    "body": "Le système de refroidissement protège le moteur de la surchauffe l’été et du gel l’hiver. Une inspection vérifie le niveau et l’état de l’antigel, l’étanchéité du radiateur et des boyaux, la pompe à eau et le thermostat. Une surchauffe ignorée peut endommager le moteur : mieux vaut agir au premier signe.",
    "body_en": "The cooling system keeps the engine from overheating in summer and freezing in winter. An inspection checks the coolant level and condition, the radiator and hoses for leaks, the water pump and the thermostat. Ignored overheating can damage the engine, so act at the first sign.",
    "signs": "[\"L’aiguille de température monte\",\"Liquide vert, orange ou rose sous le véhicule\",\"Chauffage faible l’hiver\",\"Odeur sucrée dans l’habitacle\"]",
    "signs_en": "[\"The temperature needle climbs\",\"Green, orange or pink fluid under the car\",\"Weak heat in winter\",\"A sweet smell in the cabin\"]",
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
  }
];
