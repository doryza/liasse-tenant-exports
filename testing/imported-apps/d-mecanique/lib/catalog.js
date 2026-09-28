/**
 * D Mécanique — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "antirouille",
    "icon": "oil",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Traitement antirouille",
    "name_en": "Rustproofing",
    "tagline": "Protéger le dessous du véhicule contre le sel.",
    "tagline_en": "Protect the underbody from road salt.",
    "body": "Le sel et le calcium de nos routes attaquent le dessous des véhicules. Un traitement antirouille appliqué chaque année, idéalement à l’automne, protège le châssis, les bas de caisse et les conduites.",
    "body_en": "Salt and calcium on our roads attack the underside of vehicles. A rustproofing treatment applied every year, ideally in the fall, protects the frame, rocker panels and lines.",
    "signs": "[\"Avant l’hiver\", \"Taches de rouille sur le châssis\", \"Véhicule neuf ou récent\", \"Bas de caisse qui bullent\"]",
    "signs_en": "[\"Before winter\", \"Rust spots on the frame\", \"A new or recent vehicle\", \"Bubbling rocker panels\"]",
    "confirmed": 1
  },
  {
    "slug": "silencieux",
    "icon": "exhaust",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Silencieux et échappement",
    "name_en": "Muffler & exhaust",
    "tagline": "Un échappement étanche, silencieux et conforme.",
    "tagline_en": "An exhaust that is sealed, quiet and compliant.",
    "body": "Le sel de nos hivers est dur pour l’échappement. Un silencieux percé ou un tuyau rouillé rend la voiture bruyante et peut laisser entrer des gaz dans l’habitacle. L’inspection couvre le silencieux, les tuyaux, les supports et les joints.",
    "body_en": "Winter road salt is hard on an exhaust. A holed muffler or a rusted pipe makes the car loud and can let fumes into the cabin. The inspection covers the muffler, pipes, hangers and gaskets.",
    "signs": "[\"Grondement plus fort qu’avant\",\"Cliquetis sous le véhicule\",\"Odeur de gaz d’échappement dans l’habitacle\"]",
    "signs_en": "[\"A louder rumble than before\",\"Rattling under the car\",\"Exhaust smell inside the cabin\"]",
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
    "slug": "pneus",
    "icon": "wheel",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Vente et pose de pneus",
    "name_en": "Tire sales and mounting",
    "tagline": "Pneus neufs, pose et balancement.",
    "tagline_en": "New tires, mounting and balancing.",
    "body": "Au changement de saison ou quand l’usure l’exige, les pneus sont montés sur les jantes, balancés et installés, puis la pression est ajustée. Demandez conseil pour choisir des pneus adaptés à votre véhicule et à votre conduite.",
    "body_en": "At the seasonal change or when wear calls for it, tires are mounted on the rims, balanced and installed, and the pressure is set. Ask for advice to choose tires suited to your vehicle and driving.",
    "signs": "[\"Changement de saison\", \"Témoin d’usure atteint\", \"Vibration à haute vitesse\", \"Flanc fissuré ou bosselé\"]",
    "signs_en": "[\"Change of season\", \"Tread-wear bar reached\", \"Vibration at highway speed\", \"Cracked or bulging sidewall\"]",
    "confirmed": 1
  },
  {
    "slug": "pare-brise",
    "icon": "wrench",
    "duration_min": 90,
    "bookable": 1,
    "featured": 0,
    "name": "Remplacement de pare-brise",
    "name_en": "Windshield replacement",
    "tagline": "Pare-brise fissuré ou endommagé.",
    "tagline_en": "Cracked or damaged windshield.",
    "body": "Une fissure dans le pare-brise s’agrandit avec le gel, les secousses et le dégivrage. Le remplacement comprend la dépose, la préparation du cadre et la pose d’un pare-brise neuf avec un adhésif adapté.",
    "body_en": "A crack in the windshield grows with frost, bumps and defrosting. Replacement covers removal, preparing the frame and fitting a new windshield with a suitable adhesive.",
    "signs": "[\"Fissure qui s’agrandit\", \"Impact dans le champ de vision\", \"Infiltration d’eau\"]",
    "signs_en": "[\"A crack that keeps growing\", \"A chip in the line of sight\", \"Water leaking in\"]",
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
