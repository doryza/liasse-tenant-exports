/**
 * Garage Pierre Mécanique — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
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
    "slug": "reparation-camions",
    "icon": "wrench",
    "duration_min": 120,
    "bookable": 1,
    "featured": 1,
    "name": "Réparation de camions",
    "name_en": "Truck repair",
    "tagline": "Camionnettes et camions : mécanique et entretien.",
    "tagline_en": "Pickups and trucks: repairs and maintenance.",
    "body": "Les camions et camionnettes travaillent fort : charges, remorquage, routes de chantier. Leur entretien suit le carnet du fabricant, avec une attention particulière aux freins, à la suspension, à la direction et au refroidissement. Précisez le modèle, l’année et l’usage en réservant.",
    "body_en": "Trucks and pickups work hard: loads, towing, work-site roads. Their maintenance follows the maker’s schedule, with extra attention to brakes, suspension, steering and cooling. Give the model, year and use when you book.",
    "signs": "[\"Bruit ou vibration sous charge\", \"Freins qui chauffent en remorquant\", \"Voyant moteur allumé\", \"Entretien prévu au carnet\"]",
    "signs_en": "[\"Noise or vibration under load\", \"Brakes overheating when towing\", \"Check-engine light on\", \"Scheduled maintenance due\"]",
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
    "slug": "essieux-chassis",
    "icon": "gear",
    "duration_min": 120,
    "bookable": 1,
    "featured": 1,
    "name": "Essieux et châssis",
    "name_en": "Axles and frame",
    "tagline": "Réparation d’essieux et de châssis.",
    "tagline_en": "Axle and frame repair.",
    "body": "Après un choc, un nid-de-poule ou avec l’usure, un essieu ou un élément du châssis peut se déformer. Le véhicule tire, les pneus s’usent mal et l’alignement ne tient plus. Une inspection détermine ce qui se redresse et ce qui se remplace.",
    "body_en": "After an impact, a pothole or with wear, an axle or frame part can bend. The vehicle pulls, tires wear badly and the alignment won’t hold. An inspection decides what can be straightened and what must be replaced.",
    "signs": "[\"Alignement qui ne tient pas\", \"Véhicule qui tire après un choc\", \"Usure anormale des pneus\"]",
    "signs_en": "[\"An alignment that won’t hold\", \"The car pulls after an impact\", \"Abnormal tire wear\"]",
    "confirmed": 1
  },
  {
    "slug": "inspection-mecanique",
    "icon": "wrench",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Inspection mécanique",
    "name_en": "Mechanical inspection",
    "tagline": "Avant un achat, un voyage ou pour l’assurance.",
    "tagline_en": "Before buying, a trip, or for insurance.",
    "body": "L’inspection passe en revue les points essentiels du véhicule : freins, pneus, suspension, direction, éclairage, fuites, échappement et état général, avec un rapport des travaux à prévoir. Utile avant d’acheter un véhicule d’occasion, avant un long voyage ou lorsqu’un assureur la demande.",
    "body_en": "An inspection reviews the vehicle’s key points: brakes, tires, suspension, steering, lights, leaks, exhaust and general condition, with a report of the work to plan. Useful before buying a used vehicle, before a long trip, or when an insurer asks for one.",
    "signs": "[\"Achat d’un véhicule d’occasion\", \"Long voyage à venir\", \"Demande de l’assureur\", \"Bruits ou fuites inexpliqués\"]",
    "signs_en": "[\"Buying a used vehicle\", \"A long trip ahead\", \"Insurer request\", \"Unexplained noises or leaks\"]",
    "confirmed": 1
  }
];
