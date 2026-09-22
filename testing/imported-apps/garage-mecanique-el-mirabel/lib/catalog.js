/**
 * Service catalogue — the eleven services Garage Mécanique E.L. lists on its
 * public 411garage.com profile, in the order it lists them. The descriptions
 * are general automotive guidance (what the service is, the signs that call
 * for it), never claims about this garage's prices, warranties or history.
 * Durations are planning estimates the owner edits in the admin; prices are
 * absent on purpose (« Sur estimation ») until the owner enters and confirms
 * them. Seeded once by seed.js.
 */
const list = (...x) => JSON.stringify(x);

module.exports = [
  {
    slug: 'mecanique', icon: 'wrench', duration_min: 60, bookable: 1, featured: 1,
    name: 'Mécanique générale', name_en: 'General repair',
    tagline: 'Diagnostic, freins, courroies, direction : on trouve la cause, on répare.',
    tagline_en: 'Diagnostics, brakes, belts, steering: we find the cause and fix it.',
    body: 'Un bruit nouveau, un voyant qui s’allume, une conduite qui a changé : la mécanique générale commence par un diagnostic. Le véhicule est inspecté, les codes d’erreur sont lus, et vous recevez une explication claire de ce qui se passe avant toute réparation.\nFreins, courroies, direction, démarreur, alternateur, batterie : la plupart des réparations courantes se font dans la même visite.',
    body_en: 'A new noise, a warning light, a car that drives differently: general repair starts with a diagnosis. The vehicle is inspected, fault codes are read, and you get a clear explanation of what is going on before any repair.\nBrakes, belts, steering, starter, alternator, battery: most everyday repairs are handled in the same visit.',
    signs: list('Un voyant « Check engine » allumé', 'Grincement ou vibration au freinage', 'Difficulté à démarrer', 'Odeur de brûlé ou fuite sous le véhicule'),
    signs_en: list('A "Check engine" light', 'Squealing or vibration when braking', 'Hard starts', 'A burning smell or a leak under the car'),
  },
  {
    slug: 'pose-moteur-transmission', icon: 'engine', duration_min: 60, bookable: 1, featured: 0,
    name: 'Pose de moteur et transmission', name_en: 'Engine & transmission replacement',
    tagline: 'Remplacement complet quand la réparation ne suffit plus.',
    tagline_en: 'Full replacement when a repair is no longer enough.',
    body: 'Quand un moteur ou une transmission est en fin de vie, le remplacement peut redonner des années au véhicule pour une fraction du prix d’une voiture neuve. Le rendez-vous en ligne sert à évaluer le véhicule : l’estimation, le choix de la pièce (neuve, usagée ou remise à neuf) et le délai sont discutés avec vous avant les travaux.',
    body_en: 'When an engine or transmission is worn out, a replacement can give the vehicle years more for a fraction of the price of a new car. The online appointment is for an assessment: the estimate, the choice of part (new, used or rebuilt) and the timing are discussed with you before any work.',
    signs: list('Cognement moteur persistant', 'Perte de compression ou consommation d’huile importante', 'Transmission qui patine ou refuse d’embrayer'),
    signs_en: list('Persistent engine knocking', 'Loss of compression or heavy oil consumption', 'A transmission that slips or will not engage'),
  },
  {
    slug: 'refroidissement', icon: 'thermo', duration_min: 90, bookable: 1, featured: 0,
    name: 'Système de refroidissement', name_en: 'Cooling system',
    tagline: 'Radiateur, pompe à eau, thermostat, antigel.',
    tagline_en: 'Radiator, water pump, thermostat, coolant.',
    body: 'Le système de refroidissement protège le moteur de la surchauffe l’été et du gel l’hiver. Une inspection vérifie le niveau et l’état de l’antigel, l’étanchéité du radiateur et des boyaux, la pompe à eau et le thermostat. Une surchauffe ignorée peut endommager le moteur : mieux vaut agir au premier signe.',
    body_en: 'The cooling system keeps the engine from overheating in summer and freezing in winter. An inspection checks the coolant level and condition, the radiator and hoses for leaks, the water pump and the thermostat. Ignored overheating can damage the engine, so act at the first sign.',
    signs: list('L’aiguille de température monte', 'Liquide vert, orange ou rose sous le véhicule', 'Chauffage faible l’hiver', 'Odeur sucrée dans l’habitacle'),
    signs_en: list('The temperature needle climbs', 'Green, orange or pink fluid under the car', 'Weak heat in winter', 'A sweet smell in the cabin'),
  },
  {
    slug: 'equilibrage-permutation', icon: 'wheel', duration_min: 60, bookable: 1, featured: 1,
    name: 'Équilibrage et permutation', name_en: 'Balancing & tire rotation',
    tagline: 'Des pneus qui s’usent également et une conduite sans vibration.',
    tagline_en: 'Tires that wear evenly and a ride without vibration.',
    body: 'L’équilibrage élimine les vibrations dans le volant et le siège; la permutation fait tourner les pneus d’une position à l’autre pour qu’ils s’usent également et durent plus longtemps. C’est le moment idéal pour vérifier la pression et l’usure, et le bon réflexe au changement de pneus saisonnier.',
    body_en: 'Balancing removes vibration in the steering wheel and seat; rotation moves the tires between positions so they wear evenly and last longer. It is the ideal moment to check pressure and wear, and a good habit at the seasonal tire change.',
    signs: list('Vibration du volant sur l’autoroute', 'Usure inégale des pneus', 'Changement de pneus été / hiver'),
    signs_en: list('Steering-wheel vibration on the highway', 'Uneven tire wear', 'Summer / winter tire changeover'),
  },
  {
    slug: 'mise-au-point', icon: 'spark', duration_min: 120, bookable: 1, featured: 0,
    name: 'Mise au point du moteur', name_en: 'Engine tune-up',
    tagline: 'Bougies, filtres, allumage : retrouver la puissance et l’économie.',
    tagline_en: 'Plugs, filters, ignition: get the power and the mileage back.',
    body: 'Une mise au point remplace les pièces d’usure qui font perdre de la puissance et augmenter la consommation : bougies, filtres à air et à carburant, et vérification de l’allumage. Les intervalles varient selon le véhicule; le manuel du fabricant fait foi.',
    body_en: 'A tune-up replaces the wear parts that cost power and raise fuel use: spark plugs, air and fuel filters, and an ignition check. Intervals vary by vehicle; the manufacturer’s manual is the reference.',
    signs: list('Consommation d’essence en hausse', 'Ralenti irrégulier ou ratés', 'Accélération paresseuse'),
    signs_en: list('Rising fuel consumption', 'Rough idle or misfires', 'Sluggish acceleration'),
  },
  {
    slug: 'silencieux', icon: 'exhaust', duration_min: 60, bookable: 1, featured: 0,
    name: 'Silencieux et échappement', name_en: 'Muffler & exhaust',
    tagline: 'Un échappement étanche, silencieux et conforme.',
    tagline_en: 'An exhaust that is sealed, quiet and compliant.',
    body: 'Le sel de nos hivers est dur pour l’échappement. Un silencieux percé ou un tuyau rouillé rend la voiture bruyante et peut laisser entrer des gaz dans l’habitacle. L’inspection couvre le silencieux, les tuyaux, les supports et les joints.',
    body_en: 'Winter road salt is hard on an exhaust. A holed muffler or a rusted pipe makes the car loud and can let fumes into the cabin. The inspection covers the muffler, pipes, hangers and gaskets.',
    signs: list('Grondement plus fort qu’avant', 'Cliquetis sous le véhicule', 'Odeur de gaz d’échappement dans l’habitacle'),
    signs_en: list('A louder rumble than before', 'Rattling under the car', 'Exhaust smell inside the cabin'),
  },
  {
    slug: 'suspension', icon: 'spring', duration_min: 120, bookable: 1, featured: 1,
    name: 'Suspension', name_en: 'Suspension',
    tagline: 'Amortisseurs, ressorts, rotules : stabilité et confort.',
    tagline_en: 'Shocks, springs, ball joints: stability and comfort.',
    body: 'Nids-de-poule et routes bosselées usent vite la suspension. Des amortisseurs fatigués allongent les distances de freinage et usent les pneus. L’inspection vérifie amortisseurs, ressorts, rotules, biellettes et bras de suspension.',
    body_en: 'Potholes and rough roads wear a suspension quickly. Tired shocks lengthen braking distances and wear tires. The inspection covers shocks, springs, ball joints, links and control arms.',
    signs: list('Cognements dans les bosses', 'Le véhicule tire d’un côté', 'Le nez plonge au freinage', 'Rebonds après une bosse'),
    signs_en: list('Clunks over bumps', 'The car pulls to one side', 'The nose dives when braking', 'Bouncing after a bump'),
  },
  {
    slug: 'voiture-de-courtoisie', icon: 'key', duration_min: 0, bookable: 0, featured: 0, option: 'courtesy',
    name: 'Voiture de courtoisie', name_en: 'Courtesy car',
    tagline: 'Restez mobile pendant les travaux.',
    tagline_en: 'Stay on the road while we work.',
    body: 'Une voiture de courtoisie peut être demandée au moment de prendre rendez-vous, selon la disponibilité du jour. La demande apparaît avec votre rendez-vous et vous est confirmée par le garage.',
    body_en: 'A courtesy car can be requested when you book, depending on availability that day. The request appears with your appointment and the garage confirms it with you.',
    signs: list('Réparation de plus d’une journée', 'Pas d’autre moyen de transport'),
    signs_en: list('A repair that takes more than a day', 'No other way to get around'),
  },
  {
    slug: 'transmission', icon: 'gear', duration_min: 90, bookable: 1, featured: 0,
    name: 'Transmission', name_en: 'Transmission',
    tagline: 'Entretien, diagnostic et réparation, automatique ou manuelle.',
    tagline_en: 'Service, diagnosis and repair, automatic or manual.',
    body: 'L’huile de transmission s’use comme l’huile moteur. Un entretien régulier prévient bien des réparations coûteuses. Au premier signe inhabituel, un diagnostic permet de distinguer un simple entretien d’une réparation.',
    body_en: 'Transmission fluid wears out just like engine oil. Regular service prevents many costly repairs. At the first unusual sign, a diagnosis tells a simple service apart from a repair.',
    signs: list('Passages de vitesse brusques ou retardés', 'Bruit en prise', 'Fuite de liquide rouge', 'Voyant de transmission'),
    signs_en: list('Harsh or delayed shifts', 'Noise in gear', 'A red fluid leak', 'A transmission warning light'),
  },
  {
    slug: 'vidange-huile', icon: 'oil', duration_min: 30, bookable: 1, featured: 1,
    name: 'Vidange d’huile', name_en: 'Oil change',
    tagline: 'Huile, filtre et inspection des points essentiels.',
    tagline_en: 'Oil, filter and a check of the essentials.',
    body: 'La vidange est l’entretien le plus simple et le plus important pour la vie du moteur. Elle comprend l’huile appropriée à votre moteur, un filtre neuf et un coup d’œil aux niveaux, aux pneus et aux fuites. Réservez en ligne, déposez la voiture ou attendez sur place.',
    body_en: 'An oil change is the simplest and most important service for engine life. It includes the right oil for your engine, a new filter and a quick look at fluid levels, tires and leaks. Book online, drop the car off or wait on site.',
    signs: list('Le rappel d’entretien s’affiche', 'Kilométrage atteint depuis la dernière vidange', 'Huile foncée ou niveau bas'),
    signs_en: list('The service reminder appears', 'Mileage reached since the last change', 'Dark oil or a low level'),
  },
  {
    slug: 'remorquage', icon: 'tow', duration_min: 0, bookable: 0, featured: 0, option: 'towing',
    name: 'Remorquage', name_en: 'Towing',
    tagline: 'Le véhicule ne roule plus? On le ramène au garage.',
    tagline_en: 'Car won’t move? We bring it to the garage.',
    body: 'En panne à Mirabel, Blainville ou dans les environs? Appelez directement le garage. Au moment de réserver, vous pouvez aussi indiquer que le véhicule doit être remorqué et l’adresse où il se trouve : le garage vous rappelle pour organiser la prise en charge.',
    body_en: 'Broken down in Mirabel, Blainville or nearby? Call the garage directly. When booking, you can also say the vehicle needs a tow and where it is: the garage calls you back to arrange the pickup.',
    signs: list('Le véhicule ne démarre plus', 'Voyant rouge ou surchauffe sur la route', 'Accident ou crevaison sans roue de secours'),
    signs_en: list('The car will not start', 'A red warning light or overheating on the road', 'An accident or a flat without a spare'),
  },
];
