/**
 * Garage Tony Mercier — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
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
    "slug": "vidange-huile",
    "icon": "oil",
    "duration_min": 30,
    "bookable": 1,
    "featured": 0,
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
