/**
 * Garage Bruno Houle — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "suspension",
    "icon": "spring",
    "duration_min": 120,
    "bookable": 1,
    "featured": 1,
    "name": "Suspension",
    "name_en": "Suspension",
    "tagline": "Amortisseurs, ressorts, rotules : stabilité et confort.",
    "tagline_en": "Shocks, springs, ball joints: stability and comfort.",
    "body": "Nids-de-poule et routes bosselées usent vite la suspension. Des amortisseurs fatigués allongent les distances de freinage et usent les pneus. L’inspection vérifie amortisseurs, ressorts, rotules, biellettes et bras de suspension.",
    "body_en": "Potholes and rough roads wear a suspension quickly. Tired shocks lengthen braking distances and wear tires. The inspection covers shocks, springs, ball joints, links and control arms.",
    "signs": "[\"Cognements dans les bosses\",\"Le véhicule tire d’un côté\",\"Le nez plonge au freinage\",\"Rebonds après une bosse\"]",
    "signs_en": "[\"Clunks over bumps\",\"The car pulls to one side\",\"The nose dives when braking\",\"Bouncing after a bump\"]",
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
    "body": "En panne à Saint-Jean-sur-Richelieu ou dans les environs? Appelez directement le garage. Au moment de réserver, vous pouvez aussi indiquer que le véhicule doit être remorqué et l’adresse où il se trouve : le garage vous rappelle pour organiser la prise en charge.",
    "body_en": "Broken down in Saint-Jean-sur-Richelieu or nearby? Call the garage directly. When booking, you can also say the vehicle needs a tow and where it is: the garage calls you back to arrange the pickup.",
    "signs": "[\"Le véhicule ne démarre plus\", \"Voyant rouge ou surchauffe sur la route\", \"Accident ou crevaison sans roue de secours\"]",
    "signs_en": "[\"The car will not start\", \"A red warning light or overheating on the road\", \"An accident or a flat without a spare\"]",
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
    "slug": "batterie-demarreur-alternateur",
    "icon": "spark",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
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
