/**
 * Garage Alain Ethier — the services its PagesJaunes listing names, in the listing's
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
    "slug": "direction",
    "icon": "gear",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Direction",
    "name_en": "Steering",
    "tagline": "Biellettes, crémaillère, servodirection.",
    "tagline_en": "Tie rods, rack, power steering.",
    "body": "La direction transmet chaque mouvement du volant aux roues. Une inspection vérifie les embouts et les biellettes, la crémaillère et ses soufflets, l’assistance hydraulique ou électrique et le liquide de servodirection. Du jeu dans le volant ou un bruit en tournant sont à faire vérifier sans tarder.",
    "body_en": "The steering carries every turn of the wheel to the tires. An inspection checks the tie-rod ends, the rack and its boots, the hydraulic or electric assist and the power-steering fluid. Play in the wheel or a noise when turning should be checked without delay.",
    "signs": "[\"Jeu ou flottement dans le volant\", \"Bruit ou grincement en tournant\", \"Volant dur à tourner\", \"Fuite de liquide rougeâtre à l’avant\"]",
    "signs_en": "[\"Play or wander in the steering wheel\", \"A noise or squeak when turning\", \"Steering feels heavy\", \"Reddish fluid leaking at the front\"]",
    "confirmed": 1
  },
  {
    "slug": "remorquage",
    "icon": "tow",
    "duration_min": 0,
    "bookable": 0,
    "featured": 0,
    "option": "towing",
    "name": "Remorquage",
    "name_en": "Towing",
    "tagline": "Le véhicule ne roule plus? Appelez le garage.",
    "tagline_en": "Car won’t move? Call the garage.",
    "body": "En panne à Saint-Jérôme ou dans les environs? Appelez directement le garage. Au moment de réserver, vous pouvez aussi indiquer que le véhicule doit être remorqué et l’adresse où il se trouve : le garage vous rappelle pour organiser la prise en charge.",
    "body_en": "Broken down in Saint-Jérôme or nearby? Call the garage directly. When booking, you can also say the vehicle needs a tow and where it is: the garage calls you back to arrange the pickup.",
    "signs": "[\"Le véhicule ne démarre plus\", \"Voyant rouge ou surchauffe sur la route\", \"Accident ou crevaison sans roue de secours\"]",
    "signs_en": "[\"The car will not start\", \"A red warning light or overheating on the road\", \"An accident or a flat without a spare\"]",
    "confirmed": 1
  },
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
    "slug": "specialite-jeep",
    "icon": "wrench",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Spécialité Jeep",
    "name_en": "Jeep specialty",
    "tagline": "Le garage indique les Jeep parmi ses spécialités.",
    "tagline_en": "The garage lists Jeep among its specialties.",
    "body": "Wrangler, Cherokee, Grand Cherokee, Compass : les Jeep ont leurs particularités — boîte de transfert et quatre roues motrices, essieux, suspension et direction souvent sollicités hors route comme sur nos routes d’hiver. Pour un entretien ou une réparation, précisez le modèle et l’année en réservant.",
    "body_en": "Wrangler, Cherokee, Grand Cherokee, Compass: Jeeps have their own particulars — transfer case and four-wheel drive, axles, suspension and steering that work hard off road and on our winter roads. For maintenance or a repair, give the model and year when you book.",
    "signs": "[\"Flottement du volant à vitesse d’autoroute\", \"Bruit ou claquement en quatre roues motrices\", \"Suspension ou direction qui a pris des coups\", \"Entretien prévu au carnet\"]",
    "signs_en": "[\"Steering shimmy at highway speed\", \"A noise or clunk in four-wheel drive\", \"Suspension or steering that has taken hits\", \"Scheduled maintenance due\"]",
    "confirmed": 1
  }
];
