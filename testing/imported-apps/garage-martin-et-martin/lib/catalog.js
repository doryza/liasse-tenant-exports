/**
 * Service catalogue — what the garage lists on its own public website
 * (site.gem-car.com/mecaniquestjerome, « Nos Services de Réparation
 * Automobile » + its price list), in its own words wherever it wrote any.
 * The first paragraph of every body is theirs; anything after it is general
 * automotive guidance, never a claim about this garage's prices, warranties,
 * certifications or history.
 *
 * Only one price was ever published — the oil change, « à partir de 95 $,
 * taxes en sus » — so it is the only row that ships price_verified = 1.
 * Every other service shows « Sur estimation » until the owner prices it.
 *
 * `vehicle_classes` drives the « Votre gabarit » selector on the home page:
 * the garage prices tire installation and rust-proofing by vehicle size
 * (voiture · VUS / mini-van · pick-up · gros pick-up), exactly as its own
 * price list splits them. Durations are planning estimates the owner edits.
 */
const list = (...x) => JSON.stringify(x);

module.exports = [
  {
    slug: 'changement-huile', icon: 'oil', duration_min: 45, bookable: 1, featured: 1, price: 9500,
    name: 'Changement d’huile', name_en: 'Oil change',
    tagline: 'Huile, filtre à l’huile, et vérification des filtres à air moteur et d’habitacle.',
    tagline_en: 'Oil, oil filter, and a check of the engine and cabin air filters.',
    body: 'Le service comprend le changement d’huile, filtre à l’huile ainsi que la vérification des filtres à air moteur & d’habitacle. Le prix varie selon le nombre de litres d’huile et le prix du filtre à l’huile. Prix de base à partir de 95 $, taxes en sus.\nGardez votre moteur en bonne santé avec des vidanges régulières et des filtres de haute qualité.',
    body_en: 'The service covers the oil change, the oil filter, and a check of the engine and cabin air filters. The price depends on how many litres of oil your engine takes and on the oil filter. Base price from $95, taxes extra.\nKeep your engine healthy with regular oil changes and high-quality filters.',
    signs: list('Le rappel d’entretien s’affiche au tableau de bord', 'Le kilométrage recommandé par le fabricant est atteint', 'L’huile est foncée ou le niveau baisse entre deux vidanges'),
    signs_en: list('The maintenance reminder shows on the dashboard', 'You have reached the manufacturer’s recommended mileage', 'The oil looks dark or the level drops between changes'),
  },
  {
    slug: 'inspection-securitaire', icon: 'check', duration_min: 60, bookable: 1, featured: 1, price: null,
    name: 'Inspection sécuritaire', name_en: 'Safety inspection',
    tagline: 'Les composants dont dépend votre sécurité, vérifiés un à un.',
    tagline_en: 'The parts your safety depends on, checked one by one.',
    body: 'Seule une analyse de sécurité complète peut garantir votre sécurité sur la route.\nFreins, pneus, direction, suspension, éclairage, essuie-glaces et fuites : l’inspection passe en revue les composants de sécurité et vous dit clairement ce qui est correct, ce qui est à surveiller et ce qui doit être réparé.',
    body_en: 'Only a complete safety check can keep you safe on the road.\nBrakes, tires, steering, suspension, lights, wipers and leaks: the inspection goes through the safety components and tells you plainly what is fine, what to keep an eye on and what needs fixing.',
    signs: list('Avant un long voyage', 'Avant d’acheter ou de vendre un véhicule d’occasion', 'Après un choc, un nid-de-poule ou une sortie de route', 'Au changement de saison'),
    signs_en: list('Before a long trip', 'Before buying or selling a used vehicle', 'After a hit, a pothole or going off the road', 'At the change of season'),
  },
  {
    slug: 'diagnostic-code-moteur', icon: 'scan', duration_min: 60, bookable: 1, featured: 1, price: null,
    name: 'Analyse avec appareil — code moteur', name_en: 'Scan-tool analysis — engine codes',
    tagline: 'Un voyant s’allume? On branche l’appareil, on lit les codes, on trouve la cause.',
    tagline_en: 'A warning light came on? We plug in the scanner, read the codes and find the cause.',
    body: 'Utilisation d’outils de diagnostic avancés pour identifier et résoudre les problèmes électroniques. Analyse complète des performances de votre véhicule pour détecter et corriger les anomalies.\nUn code d’erreur indique où chercher, pas toujours quoi remplacer. Le diagnostic confirme la cause avant la réparation, pour que vous ne payiez que ce qui règle vraiment le problème.',
    body_en: 'Advanced diagnostic tools to find and fix electronic problems. A complete analysis of your vehicle’s performance to detect and correct anomalies.\nA fault code tells you where to look, not always what to replace. The diagnosis confirms the cause before the repair, so you only pay for what actually fixes the problem.',
    signs: list('Le voyant « Check engine » est allumé ou clignote', 'Le moteur manque de puissance ou hésite', 'La consommation d’essence a augmenté', 'Un voyant ABS, coussin gonflable ou batterie reste allumé'),
    signs_en: list('The "Check engine" light is on or flashing', 'The engine lacks power or hesitates', 'Fuel consumption has gone up', 'An ABS, airbag or battery light stays on'),
  },
  {
    slug: 'freins', icon: 'brake', duration_min: 120, bookable: 1, featured: 1, price: null,
    name: 'Freins et système de freinage', name_en: 'Brakes and braking system',
    tagline: 'Plaquettes, disques et inspection complète du système.',
    tagline_en: 'Pads, rotors and a full inspection of the system.',
    body: 'Remplacement de plaquettes, disques, et inspection du système de freinage pour assurer votre sécurité.\nL’inspection couvre aussi les étriers, les conduites et le liquide de frein. Vous savez ce qui est usé, ce qui peut attendre et ce qui presse.',
    body_en: 'Pad and rotor replacement, and an inspection of the braking system to keep you safe.\nThe inspection also covers the calipers, the lines and the brake fluid. You know what is worn, what can wait and what is urgent.',
    signs: list('Grincement ou sifflement au freinage', 'Vibration dans la pédale ou le volant', 'La pédale est molle ou descend plus bas', 'Le véhicule tire d’un côté quand vous freinez'),
    signs_en: list('Squealing or grinding when braking', 'Vibration in the pedal or the steering wheel', 'The pedal feels soft or sinks lower', 'The vehicle pulls to one side when braking'),
  },
  {
    slug: 'moteur-transmission', icon: 'engine', duration_min: 120, bookable: 1, featured: 1, price: null,
    name: 'Moteur et transmission', name_en: 'Engine and transmission',
    tagline: 'Diagnostic et réparation, pour un véhicule sur lequel vous pouvez compter.',
    tagline_en: 'Diagnosis and repair, for a vehicle you can count on.',
    body: 'Diagnostic et réparation des problèmes de moteur et de transmission pour garantir la fiabilité de votre véhicule.\nLe rendez-vous commence par un diagnostic : l’estimation des travaux vous est présentée avant toute réparation.',
    body_en: 'Diagnosis and repair of engine and transmission problems to keep your vehicle reliable.\nThe appointment starts with a diagnosis: the estimate is presented to you before any repair.',
    signs: list('Les vitesses passent mal ou en retard', 'Bruits de cognement ou de claquement', 'Fumée à l’échappement', 'Fuite d’huile ou de liquide de transmission'),
    signs_en: list('Gears shift roughly or late', 'Knocking or clunking noises', 'Smoke from the exhaust', 'Oil or transmission fluid leak'),
  },
  {
    slug: 'suspension-direction', icon: 'spring', duration_min: 120, bookable: 1, featured: 1, price: null,
    name: 'Suspension et direction', name_en: 'Suspension and steering',
    tagline: 'Pour une conduite confortable et sécurisée.',
    tagline_en: 'For a comfortable, safe ride.',
    body: 'Réparation et remplacement des composants de suspension et de direction pour une conduite confortable et sécurisée.\nAmortisseurs, ressorts, rotules, biellettes et crémaillère : sur nos routes, ces pièces travaillent fort. Une suspension en bon état garde aussi vos pneus en contact avec la chaussée.',
    body_en: 'Repair and replacement of suspension and steering components for a comfortable, safe ride.\nShocks, springs, ball joints, links and the steering rack: our roads make these parts work hard. A healthy suspension also keeps your tires on the road.',
    signs: list('Cognements dans les bosses', 'Le véhicule rebondit ou plonge au freinage', 'Du jeu dans le volant', 'Usure inégale des pneus'),
    signs_en: list('Clunks over bumps', 'The vehicle bounces or dives when braking', 'Play in the steering wheel', 'Uneven tire wear'),
  },
  {
    slug: 'climatisation', icon: 'snow', duration_min: 90, bookable: 1, featured: 0, price: null,
    name: 'Systèmes de climatisation', name_en: 'Air conditioning',
    tagline: 'Réparation et entretien, pour un confort optimal en toutes saisons.',
    tagline_en: 'Repair and maintenance, for comfort in every season.',
    body: 'Réparation et entretien des systèmes de climatisation pour un confort optimal en toutes saisons.\nLa climatisation sert aussi l’hiver : c’est elle qui assèche l’air et désembue le pare-brise rapidement.',
    body_en: 'Repair and maintenance of air-conditioning systems for comfort in every season.\nAir conditioning works in winter too: it dries the air and clears a fogged windshield quickly.',
    signs: list('L’air ne sort plus froid', 'Odeur d’humidité dans l’habitacle', 'Bruit quand la climatisation démarre', 'Le pare-brise désembue mal'),
    signs_en: list('The air no longer blows cold', 'A musty smell in the cabin', 'A noise when the A/C kicks in', 'The windshield is slow to clear'),
  },
  {
    slug: 'inspection-reglage', icon: 'wrench', duration_min: 60, bookable: 1, featured: 0, price: null,
    name: 'Inspection et réglage', name_en: 'Inspection and tune-up',
    tagline: 'Entretien régulier : vérifier et ajuster l’essentiel.',
    tagline_en: 'Regular maintenance: check and adjust the essentials.',
    body: 'Vérifiez et ajustez les composants essentiels pour une performance optimale de votre véhicule.\nL’entretien régulier, fait au bon moment, évite la plupart des réparations coûteuses.',
    body_en: 'Check and adjust the essential components for your vehicle’s best performance.\nRegular maintenance, done at the right time, prevents most costly repairs.',
    signs: list('Le calendrier d’entretien du fabricant est dû', 'Le moteur tourne moins rondement', 'Avant l’hiver ou avant l’été'),
    signs_en: list('The manufacturer’s maintenance schedule is due', 'The engine runs less smoothly', 'Before winter or before summer'),
  },
  {
    slug: 'pneus-voiture-vus', icon: 'tire', duration_min: 60, bookable: 1, featured: 0, price: null, classes: 'voiture,vus',
    name: 'Pose de pneus — voiture, VUS', name_en: 'Tire installation — car, SUV',
    tagline: 'Montage, équilibrage et pose de vos pneus de saison.',
    tagline_en: 'Mounting, balancing and installing your seasonal tires.',
    body: 'Montage, équilibrage et rotation des pneus pour une meilleure adhérence et une usure uniforme.\nAu Québec, les pneus d’hiver sont obligatoires du 1er décembre au 15 mars. Réservez tôt : les semaines avant ces dates sont les plus achalandées.',
    body_en: 'Tire mounting, balancing and rotation for better grip and even wear.\nIn Québec, winter tires are mandatory from December 1 to March 15. Book early: the weeks before those dates are the busiest.',
    signs: list('Changement de saison', 'Vibration à vitesse d’autoroute', 'Usure inégale d’un pneu à l’autre'),
    signs_en: list('Change of season', 'Vibration at highway speed', 'Uneven wear from one tire to another'),
  },
  {
    slug: 'pneus-pick-up', icon: 'tire', duration_min: 60, bookable: 1, featured: 0, price: null, classes: 'pickup',
    name: 'Pose de pneus — pick-up', name_en: 'Tire installation — pickup',
    tagline: 'Montage et équilibrage de pneus de camionnette.',
    tagline_en: 'Mounting and balancing pickup truck tires.',
    body: 'Montage, équilibrage et rotation des pneus pour une meilleure adhérence et une usure uniforme.\nAu Québec, les pneus d’hiver sont obligatoires du 1er décembre au 15 mars.',
    body_en: 'Tire mounting, balancing and rotation for better grip and even wear.\nIn Québec, winter tires are mandatory from December 1 to March 15.',
    signs: list('Changement de saison', 'Vibration à vitesse d’autoroute', 'Usure inégale d’un pneu à l’autre'),
    signs_en: list('Change of season', 'Vibration at highway speed', 'Uneven wear from one tire to another'),
  },
  {
    slug: 'pneus-gros-pick-up', icon: 'tire', duration_min: 90, bookable: 1, featured: 0, price: null, classes: 'gros',
    name: 'Pose de pneus — gros pick-up (F‑250, GMC 2500…)', name_en: 'Tire installation — heavy-duty pickup (F‑250, GMC 2500…)',
    tagline: 'Les gros formats aussi : F‑250, GMC 2500 et compagnie.',
    tagline_en: 'Big sizes too: F‑250, GMC 2500 and the like.',
    body: 'Montage, équilibrage et rotation des pneus pour une meilleure adhérence et une usure uniforme.\nLes camionnettes lourdes (F‑250, GMC 2500 et autres) ont leur propre tarif : leurs pneus et leurs roues demandent plus de temps et d’équipement.',
    body_en: 'Tire mounting, balancing and rotation for better grip and even wear.\nHeavy-duty pickups (F‑250, GMC 2500 and others) have their own rate: their tires and wheels take more time and equipment.',
    signs: list('Changement de saison', 'Vibration à vitesse d’autoroute', 'Usure inégale d’un pneu à l’autre'),
    signs_en: list('Change of season', 'Vibration at highway speed', 'Uneven wear from one tire to another'),
  },
  {
    slug: 'pneus-sur-jantes', icon: 'tire', duration_min: 30, bookable: 1, featured: 0, price: null, classes: 'voiture,vus,pickup,gros',
    name: 'Pose de pneus montés sur jantes ou mags', name_en: 'Installing tires already mounted on rims or mags',
    tagline: 'Vos pneus sont déjà sur leurs roues? La pose est rapide.',
    tagline_en: 'Tires already on their wheels? Installation is quick.',
    body: 'Vos pneus de saison sont déjà montés sur leurs jantes ou leurs mags : on retire les roues, on pose les autres et on serre les écrous au bon couple.\nC’est la façon la plus rapide de faire le changement de saison.',
    body_en: 'Your seasonal tires are already mounted on their rims or mags: we take the wheels off, put the others on and torque the nuts properly.\nIt is the fastest way to do the seasonal swap.',
    signs: list('Changement de saison', 'Vous avez un deuxième jeu de roues'),
    signs_en: list('Change of season', 'You have a second set of wheels'),
  },
  {
    slug: 'antirouille-voiture', icon: 'shield', duration_min: 45, bookable: 1, featured: 0, price: null, classes: 'voiture',
    name: 'Antirouille — voiture', name_en: 'Rust-proofing — car',
    tagline: 'Un traitement pour protéger la carrosserie et le dessous contre le sel.',
    tagline_en: 'A treatment to protect the body and underside from road salt.',
    body: 'Le sel et le calcium des routes d’hiver attaquent le dessous du véhicule, les ailes et les bas de portes. Un traitement antirouille, refait à intervalle régulier, ralentit la corrosion et aide à garder la valeur du véhicule.',
    body_en: 'Salt and calcium from winter roads attack the underside, the fenders and the rocker panels. A rust-proofing treatment, redone at regular intervals, slows corrosion and helps the vehicle keep its value.',
    signs: list('Avant l’hiver', 'Taches de rouille aux ailes ou aux bas de portes', 'Vous gardez votre véhicule longtemps'),
    signs_en: list('Before winter', 'Rust spots on fenders or rocker panels', 'You keep your vehicles a long time'),
  },
  {
    slug: 'antirouille-vus-mini-van', icon: 'shield', duration_min: 60, bookable: 1, featured: 0, price: null, classes: 'vus',
    name: 'Antirouille — VUS, mini-van', name_en: 'Rust-proofing — SUV, minivan',
    tagline: 'Le même traitement, au format VUS et mini-van.',
    tagline_en: 'The same treatment, sized for SUVs and minivans.',
    body: 'Le sel et le calcium des routes d’hiver attaquent le dessous du véhicule, les ailes et les bas de portes. Un traitement antirouille, refait à intervalle régulier, ralentit la corrosion et aide à garder la valeur du véhicule.',
    body_en: 'Salt and calcium from winter roads attack the underside, the fenders and the rocker panels. A rust-proofing treatment, redone at regular intervals, slows corrosion and helps the vehicle keep its value.',
    signs: list('Avant l’hiver', 'Taches de rouille aux ailes ou aux bas de portes', 'Vous gardez votre véhicule longtemps'),
    signs_en: list('Before winter', 'Rust spots on fenders or rocker panels', 'You keep your vehicles a long time'),
  },
  {
    slug: 'antirouille-gros-pick-up', icon: 'shield', duration_min: 60, bookable: 1, featured: 0, price: null, classes: 'gros',
    name: 'Antirouille — gros pick-up (F‑250, GMC 2500…)', name_en: 'Rust-proofing — heavy-duty pickup (F‑250, GMC 2500…)',
    tagline: 'Châssis, caisse et dessous des camionnettes lourdes.',
    tagline_en: 'Frame, box and underside of heavy-duty pickups.',
    body: 'Le sel et le calcium des routes d’hiver attaquent le châssis, la caisse et le dessous du véhicule. Un traitement antirouille, refait à intervalle régulier, ralentit la corrosion et aide à garder la valeur de votre camionnette.',
    body_en: 'Salt and calcium from winter roads attack the frame, the box and the underside. A rust-proofing treatment, redone at regular intervals, slows corrosion and helps your truck keep its value.',
    signs: list('Avant l’hiver', 'Rouille sur le châssis ou la caisse', 'Vous gardez votre camionnette longtemps'),
    signs_en: list('Before winter', 'Rust on the frame or the box', 'You keep your truck a long time'),
  },
];
