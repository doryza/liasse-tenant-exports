/**
 * Atelier de Mécanique G.D. — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
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
    "slug": "equilibrage-rotation-pneus",
    "icon": "wheel",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
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
    "slug": "alignement",
    "icon": "wheel",
    "duration_min": 60,
    "bookable": 1,
    "featured": 0,
    "name": "Alignement des roues",
    "name_en": "Wheel alignment",
    "tagline": "Une auto qui roule droit et des pneus qui durent.",
    "tagline_en": "A car that tracks straight and tires that last.",
    "body": "L’alignement règle l’angle des roues selon les données du fabricant. Un nid-de-poule, un choc contre une bordure ou des pièces de suspension usées suffisent à le dérégler : le véhicule tire d’un côté et les pneus s’usent de façon inégale. On le vérifie aussi après le remplacement de pièces de direction ou de suspension.",
    "body_en": "An alignment sets the wheel angles to the maker’s specifications. A pothole, a hit against a curb or worn suspension parts are enough to throw it off: the car pulls to one side and the tires wear unevenly. It is also checked after steering or suspension parts are replaced.",
    "signs": "[\"Le véhicule tire d’un côté\", \"Volant décentré en ligne droite\", \"Usure inégale des pneus\", \"Après un choc contre une bordure\"]",
    "signs_en": "[\"The car pulls to one side\", \"Steering wheel off-centre when driving straight\", \"Uneven tire wear\", \"After hitting a curb\"]",
    "confirmed": 1
  }
];
