/**
 * Garage M. Joncas — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "entretien-preventif",
    "icon": "oil",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Entretien préventif",
    "name_en": "Preventive maintenance",
    "tagline": "L’entretien prévu par le fabricant, au bon moment.",
    "tagline_en": "The maker’s maintenance schedule, on time.",
    "body": "Le carnet d’entretien du fabricant prévoit des inspections et des remplacements selon le kilométrage et le temps : liquides, filtres, courroies, freins, pneus. Les suivre aide à éviter les pannes et les grosses réparations, et garde un historique utile à la revente.",
    "body_en": "The maker’s maintenance schedule calls for inspections and replacements by mileage and time: fluids, filters, belts, brakes, tires. Keeping to it helps avoid breakdowns and big repairs, and leaves a history that helps at resale.",
    "signs": "[\"Voyant d’entretien allumé\", \"Kilométrage prévu au carnet atteint\", \"Avant un long voyage\", \"Changement de saison\"]",
    "signs_en": "[\"Service light on\", \"Scheduled mileage reached\", \"Before a long trip\", \"Change of season\"]",
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
    "slug": "mise-au-point",
    "icon": "spark",
    "duration_min": 120,
    "bookable": 1,
    "featured": 1,
    "name": "Mise au point du moteur",
    "name_en": "Engine tune-up",
    "tagline": "Bougies, filtres, allumage : retrouver la puissance et l’économie.",
    "tagline_en": "Plugs, filters, ignition: get the power and the mileage back.",
    "body": "Une mise au point remplace les pièces d’usure qui font perdre de la puissance et augmenter la consommation : bougies, filtres à air et à carburant, et vérification de l’allumage. Les intervalles varient selon le véhicule; le manuel du fabricant fait foi.",
    "body_en": "A tune-up replaces the wear parts that cost power and raise fuel use: spark plugs, air and fuel filters, and an ignition check. Intervals vary by vehicle; the manufacturer’s manual is the reference.",
    "signs": "[\"Consommation d’essence en hausse\",\"Ralenti irrégulier ou ratés\",\"Accélération paresseuse\"]",
    "signs_en": "[\"Rising fuel consumption\",\"Rough idle or misfires\",\"Sluggish acceleration\"]",
    "confirmed": 1
  },
  {
    "slug": "equilibrage-rotation-pneus",
    "icon": "wheel",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Équilibrage et rotation des pneus",
    "name_en": "Tire balancing and rotation",
    "tagline": "Des pneus qui s’usent également et une conduite sans vibration.",
    "tagline_en": "Tires that wear evenly and a ride without vibration.",
    "body": "L’équilibrage élimine les vibrations dans le volant et le siège; la rotation fait passer les pneus d’une position à l’autre pour qu’ils s’usent également et durent plus longtemps. C’est aussi le bon moment pour vérifier la pression et l’usure.",
    "body_en": "Balancing removes vibration in the steering wheel and seat; rotation moves the tires between positions so they wear evenly and last longer. It is also the right moment to check pressure and wear.",
    "signs": "[\"Vibration dans le volant sur l’autoroute\",\"Usure inégale des pneus\",\"Le passage aux pneus d’hiver ou d’été\"]",
    "signs_en": "[\"Steering-wheel vibration on the highway\",\"Uneven tire wear\",\"Switching to winter or summer tires\"]",
    "confirmed": 1
  },
  {
    "slug": "direction",
    "icon": "gear",
    "duration_min": 90,
    "bookable": 1,
    "featured": 0,
    "name": "Direction",
    "name_en": "Steering",
    "tagline": "Biellettes, crémaillère, servodirection.",
    "tagline_en": "Tie rods, rack, power steering.",
    "body": "La direction transmet chaque mouvement du volant aux roues. Une inspection vérifie les embouts et les biellettes, la crémaillère et ses soufflets, l’assistance hydraulique ou électrique et le liquide de servodirection. Du jeu dans le volant ou un bruit en tournant sont à faire vérifier sans tarder.",
    "body_en": "The steering carries every turn of the wheel to the tires. An inspection checks the tie-rod ends, the rack and its boots, the hydraulic or electric assist and the power-steering fluid. Play in the wheel or a noise when turning should be checked without delay.",
    "signs": "[\"Jeu ou flottement dans le volant\", \"Bruit ou grincement en tournant\", \"Volant dur à tourner\", \"Fuite de liquide rougeâtre à l’avant\"]",
    "signs_en": "[\"Play or wander in the steering wheel\", \"A noise or squeak when turning\", \"Steering feels heavy\", \"Reddish fluid leaking at the front\"]",
    "confirmed": 1
  }
];
