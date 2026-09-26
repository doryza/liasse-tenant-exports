/**
 * Garage Lemieux — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "mecanique-generale",
    "icon": "wrench",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
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
    "slug": "electricite-electronique",
    "icon": "spark",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Électricité et électronique",
    "name_en": "Electrical and electronics",
    "tagline": "Démarrage, charge, capteurs, modules.",
    "tagline_en": "Starting, charging, sensors, modules.",
    "body": "Les véhicules récents dépendent de leur électricité et de leurs modules électroniques : démarrage, recharge, éclairage, capteurs et calculateurs. Le diagnostic mesure la batterie et l’alternateur, lit les codes d’erreur et suit le câblage jusqu’à la cause de la panne.",
    "body_en": "Modern vehicles depend on their electrical system and electronic modules: starting, charging, lights, sensors and computers. Diagnosis measures the battery and alternator, reads the fault codes and follows the wiring to the cause of the fault.",
    "signs": "[\"Voyant allumé au tableau de bord\", \"Démarrage lent\", \"Accessoire qui ne fonctionne plus\", \"Batterie qui se décharge\"]",
    "signs_en": "[\"A warning light on the dash\", \"Slow cranking\", \"An accessory that stopped working\", \"A battery that keeps draining\"]",
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
    "slug": "abs-coussins",
    "icon": "spark",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "ABS et coussins gonflables",
    "name_en": "ABS and airbags",
    "tagline": "Voyants ABS ou coussin gonflable allumés.",
    "tagline_en": "ABS or airbag light on.",
    "body": "Le système ABS empêche les roues de bloquer au freinage et les coussins gonflables protègent les occupants. Un voyant allumé signale un défaut enregistré : le diagnostic lit le code, vérifie les capteurs, le câblage et les modules, puis corrige la cause.",
    "body_en": "ABS keeps the wheels from locking under braking and airbags protect the occupants. A warning light signals a stored fault: diagnosis reads the code, checks the sensors, wiring and modules, then fixes the cause.",
    "signs": "[\"Voyant ABS allumé\", \"Voyant de coussin gonflable allumé\", \"Après un accrochage\"]",
    "signs_en": "[\"ABS light on\", \"Airbag light on\", \"After a minor collision\"]",
    "confirmed": 1
  },
  {
    "slug": "inspection-mecanique",
    "icon": "wrench",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Inspection",
    "name_en": "Inspection",
    "tagline": "Avant un achat, un voyage ou pour l’assurance.",
    "tagline_en": "Before buying, a trip, or for insurance.",
    "body": "L’inspection passe en revue les points essentiels du véhicule : freins, pneus, suspension, direction, éclairage, fuites, échappement et état général, avec un rapport des travaux à prévoir. Utile avant d’acheter un véhicule d’occasion, avant un long voyage ou lorsqu’un assureur la demande.",
    "body_en": "An inspection reviews the vehicle’s key points: brakes, tires, suspension, steering, lights, leaks, exhaust and general condition, with a report of the work to plan. Useful before buying a used vehicle, before a long trip, or when an insurer asks for one.",
    "signs": "[\"Achat d’un véhicule d’occasion\", \"Long voyage à venir\", \"Demande de l’assureur\", \"Bruits ou fuites inexpliqués\"]",
    "signs_en": "[\"Buying a used vehicle\", \"A long trip ahead\", \"Insurer request\", \"Unexplained noises or leaks\"]",
    "confirmed": 1
  },
  {
    "slug": "pneus",
    "icon": "wheel",
    "duration_min": 45,
    "bookable": 1,
    "featured": 0,
    "name": "Vente et installation de pneus",
    "name_en": "Tire sales and installation",
    "tagline": "Pneus d’hiver et d’été, pose et équilibrage.",
    "tagline_en": "Winter and summer tires, mounting and balancing.",
    "body": "Au Québec, les pneus d’hiver sont obligatoires du 1er décembre au 15 mars. Le garage pose et équilibre les pneus et vérifie la pression, l’usure et l’état des jantes à chaque changement de saison.",
    "body_en": "In Québec, winter tires are mandatory from December 1 to March 15. The garage mounts and balances tires and checks pressure, tread wear and the rims at each seasonal change.",
    "signs": "[\"Le changement de saison approche\", \"Usure proche du témoin\", \"Vibration au volant\", \"Crevaison ou hernie\"]",
    "signs_en": "[\"The seasonal change is coming\", \"Tread close to the wear bar\", \"Steering-wheel vibration\", \"A puncture or a bulge\"]",
    "confirmed": 1
  }
];
