/**
 * Garage Patrice Tremblay — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "injection",
    "icon": "spark",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
    "name": "Injection",
    "name_en": "Fuel injection",
    "tagline": "Injecteurs, pompe et capteurs : le bon mélange, au bon moment.",
    "tagline_en": "Injectors, pump and sensors: the right mixture at the right time.",
    "body": "Le système d’injection dose l’essence envoyée au moteur. Un injecteur encrassé ou un capteur fatigué fait perdre de la puissance et augmenter la consommation. Le diagnostic commence par la lecture des codes d’erreur, puis vérifie la pression d’essence, les injecteurs et les capteurs.",
    "body_en": "The injection system meters the fuel sent to the engine. A clogged injector or a tired sensor costs power and raises fuel use. The diagnosis starts by reading the fault codes, then checks fuel pressure, the injectors and the sensors.",
    "signs": "[\"Démarrage difficile, surtout à froid\",\"Ralenti irrégulier ou le moteur qui cale\",\"Consommation d’essence en hausse\",\"Voyant « Check engine » allumé\"]",
    "signs_en": "[\"Hard starts, especially when cold\",\"Rough idle or the engine stalls\",\"Rising fuel consumption\",\"A \\\"Check engine\\\" light\"]",
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
  }
];
