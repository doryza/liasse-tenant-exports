/**
 * Mécanique P.L. — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
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
    "featured": 1,
    "name": "Alignement des roues",
    "name_en": "Wheel alignment",
    "tagline": "Une auto qui roule droit et des pneus qui durent.",
    "tagline_en": "A car that tracks straight and tires that last.",
    "body": "L’alignement règle l’angle des roues selon les données du fabricant. Un nid-de-poule, un choc contre une bordure ou des pièces de suspension usées suffisent à le dérégler : le véhicule tire d’un côté et les pneus s’usent de façon inégale. On le vérifie aussi après le remplacement de pièces de direction ou de suspension.",
    "body_en": "An alignment sets the wheel angles to the maker’s specifications. A pothole, a hit against a curb or worn suspension parts are enough to throw it off: the car pulls to one side and the tires wear unevenly. It is also checked after steering or suspension parts are replaced.",
    "signs": "[\"Le véhicule tire d’un côté\", \"Volant décentré en ligne droite\", \"Usure inégale des pneus\", \"Après un choc contre une bordure\"]",
    "signs_en": "[\"The car pulls to one side\", \"Steering wheel off-centre when driving straight\", \"Uneven tire wear\", \"After hitting a curb\"]",
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
