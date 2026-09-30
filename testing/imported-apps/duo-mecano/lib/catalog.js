/**
 * Duo Mécano — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "inspection-mecanique",
    "icon": "wrench",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Inspection mécanique",
    "name_en": "Mechanical inspection",
    "tagline": "Avant un achat, un voyage ou pour l’assurance.",
    "tagline_en": "Before buying, a trip, or for insurance.",
    "body": "L’inspection passe en revue les points essentiels du véhicule : freins, pneus, suspension, direction, éclairage, fuites, échappement et état général, avec un rapport des travaux à prévoir. Utile avant d’acheter un véhicule d’occasion, avant un long voyage ou lorsqu’un assureur la demande.",
    "body_en": "An inspection reviews the vehicle’s key points: brakes, tires, suspension, steering, lights, leaks, exhaust and general condition, with a report of the work to plan. Useful before buying a used vehicle, before a long trip, or when an insurer asks for one.",
    "signs": "[\"Achat d’un véhicule d’occasion\", \"Long voyage à venir\", \"Demande de l’assureur\", \"Bruits ou fuites inexpliqués\"]",
    "signs_en": "[\"Buying a used vehicle\", \"A long trip ahead\", \"Insurer request\", \"Unexplained noises or leaks\"]",
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
    "slug": "transmission",
    "icon": "gear",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Transmission",
    "name_en": "Transmission",
    "tagline": "Entretien, diagnostic et réparation, automatique ou manuelle.",
    "tagline_en": "Service, diagnosis and repair, automatic or manual.",
    "body": "L’huile de transmission s’use comme l’huile moteur. Un entretien régulier prévient bien des réparations coûteuses. Au premier signe inhabituel, un diagnostic permet de distinguer un simple entretien d’une réparation.",
    "body_en": "Transmission fluid wears out just like engine oil. Regular service prevents many costly repairs. At the first unusual sign, a diagnosis tells a simple service apart from a repair.",
    "signs": "[\"Passages de vitesse brusques ou retardés\",\"Bruit en prise\",\"Fuite de liquide rouge\",\"Voyant de transmission\"]",
    "signs_en": "[\"Harsh or delayed shifts\",\"Noise in gear\",\"A red fluid leak\",\"A transmission warning light\"]",
    "confirmed": 1
  },
  {
    "slug": "mise-au-point",
    "icon": "spark",
    "duration_min": 120,
    "bookable": 1,
    "featured": 0,
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
  }
];
