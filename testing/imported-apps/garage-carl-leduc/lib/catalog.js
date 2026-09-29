/**
 * Garage Carl Leduc — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
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
    "slug": "suspension",
    "icon": "spring",
    "duration_min": 120,
    "bookable": 1,
    "featured": 0,
    "name": "Suspension",
    "name_en": "Suspension",
    "tagline": "Amortisseurs, ressorts, rotules : stabilité et confort.",
    "tagline_en": "Shocks, springs, ball joints: stability and comfort.",
    "body": "Nids-de-poule et routes bosselées usent vite la suspension. Des amortisseurs fatigués allongent les distances de freinage et usent les pneus. L’inspection vérifie amortisseurs, ressorts, rotules, biellettes et bras de suspension.",
    "body_en": "Potholes and rough roads wear a suspension quickly. Tired shocks lengthen braking distances and wear tires. The inspection covers shocks, springs, ball joints, links and control arms.",
    "signs": "[\"Cognements dans les bosses\",\"Le véhicule tire d’un côté\",\"Le nez plonge au freinage\",\"Rebonds après une bosse\"]",
    "signs_en": "[\"Clunks over bumps\",\"The car pulls to one side\",\"The nose dives when braking\",\"Bouncing after a bump\"]",
    "confirmed": 1
  }
];
