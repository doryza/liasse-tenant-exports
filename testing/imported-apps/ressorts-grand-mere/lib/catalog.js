/**
 * Ressorts Grand-Mère — the services its PagesJaunes listing names, in the listing's
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
    "slug": "soudure",
    "icon": "spark",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Soudure",
    "name_en": "Welding",
    "tagline": "Réparations soudées : échappement, supports, pièces.",
    "tagline_en": "Welded repairs: exhaust, brackets, parts.",
    "body": "La soudure répare ce qui ne se remplace pas facilement : un tuyau d’échappement percé, un support fissuré, une pièce métallique à refaire. Apportez le véhicule ou décrivez la pièce : le garage évalue si la réparation soudée est possible et sûre.",
    "body_en": "Welding fixes what can’t easily be replaced: a holed exhaust pipe, a cracked bracket, a metal part to rebuild. Bring the vehicle or describe the part: the garage assesses whether a welded repair is possible and safe.",
    "signs": "[\"Échappement percé ou bruyant\", \"Support ou crochet fissuré\", \"Pièce métallique cassée\"]",
    "signs_en": "[\"A holed or loud exhaust\", \"A cracked bracket or hanger\", \"A broken metal part\"]",
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
  }
];
