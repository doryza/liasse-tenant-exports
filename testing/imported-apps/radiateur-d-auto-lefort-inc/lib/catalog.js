/**
 * Radiateur D’Auto Lefort — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
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
    "slug": "mecanique-generale",
    "icon": "wrench",
    "duration_min": 60,
    "bookable": 1,
    "featured": 1,
    "name": "Mécanique générale",
    "name_en": "General repair",
    "tagline": "Diagnostic, freins, courroies, direction : on trouve la cause, on répare.",
    "tagline_en": "Diagnostics, brakes, belts, steering: we find the cause and fix it.",
    "body": "Un bruit nouveau, un voyant qui s’allume, une conduite qui a changé : la mécanique générale commence par un diagnostic. Le véhicule est inspecté, les codes d’erreur sont lus, et vous recevez une explication claire de ce qui se passe avant toute réparation.\nFreins, courroies, direction, démarreur, alternateur, batterie : la plupart des réparations courantes se font dans la même visite.",
    "body_en": "A new noise, a warning light, a car that drives differently: general repair starts with a diagnosis. The vehicle is inspected, fault codes are read, and you get a clear explanation of what is going on before any repair.\nBrakes, belts, steering, starter, alternator, battery: most everyday repairs are handled in the same visit.",
    "signs": "[\"Un voyant « Check engine » allumé\",\"Grincement ou vibration au freinage\",\"Difficulté à démarrer\",\"Odeur de brûlé ou fuite sous le véhicule\"]",
    "signs_en": "[\"A \\\"Check engine\\\" light\",\"Squealing or vibration when braking\",\"Hard starts\",\"A burning smell or a leak under the car\"]",
    "confirmed": 1
  }
];
