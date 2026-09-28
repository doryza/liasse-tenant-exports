/**
 * Mécanique Import Lotbinière — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
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
  },
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
    "slug": "entretien-preventif",
    "icon": "oil",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Entretien préventif",
    "name_en": "Preventive maintenance",
    "tagline": "L’entretien prévu par le fabricant, au bon moment.",
    "tagline_en": "The maker’s maintenance schedule, on time.",
    "body": "Le carnet d’entretien du fabricant prévoit des inspections et des remplacements selon le kilométrage et le temps : liquides, filtres, courroies, freins, pneus. Les suivre aide à éviter les pannes et les grosses réparations, et garde un historique utile à la revente.",
    "body_en": "The maker’s maintenance schedule calls for inspections and replacements by mileage and time: fluids, filters, belts, brakes, tires. Keeping to it helps avoid breakdowns and big repairs, and leaves a history that helps at resale.",
    "signs": "[\"Voyant d’entretien allumé\", \"Kilométrage prévu au carnet atteint\", \"Avant un long voyage\", \"Changement de saison\"]",
    "signs_en": "[\"Service light on\", \"Scheduled mileage reached\", \"Before a long trip\", \"Change of season\"]",
    "confirmed": 1
  }
];
