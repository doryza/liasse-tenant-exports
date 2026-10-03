/**
 * Lancia Autotecnica — the services its PagesJaunes listing names, in the listing's
 * order (confirmed: 1). Descriptions are general automotive guidance, never
 * claims about this garage's prices, warranties or team.
 */
module.exports = [
  {
    "slug": "carrosserie",
    "icon": "wrench",
    "duration_min": 120,
    "bookable": 1,
    "featured": 1,
    "name": "Carrosserie",
    "name_en": "Body work",
    "tagline": "Bosses, rayures, pièces de carrosserie.",
    "tagline_en": "Dents, scratches, body panels.",
    "body": "La carrosserie protège le véhicule et sa structure. Après un accrochage ou avec le temps, une évaluation détermine ce qui se répare et ce qui se remplace. Réservez pour une évaluation : le travail est chiffré avant de commencer.",
    "body_en": "The body protects the vehicle and its structure. After a scrape or over time, an assessment decides what can be repaired and what must be replaced. Book an assessment: the work is estimated before it starts.",
    "signs": "[\"Bosse ou éraflure après un accrochage\", \"Pièce de carrosserie qui bouge\", \"Rouille qui perce\", \"Porte ou capot qui ferme mal\"]",
    "signs_en": "[\"A dent or scrape after a bump\", \"A loose body panel\", \"Rust coming through\", \"A door or hood that won’t close right\"]",
    "confirmed": 1
  },
  {
    "slug": "pare-brise",
    "icon": "wrench",
    "duration_min": 90,
    "bookable": 1,
    "featured": 1,
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
    "slug": "remorquage",
    "icon": "tow",
    "duration_min": 0,
    "bookable": 0,
    "featured": 1,
    "option": "towing",
    "name": "Remorquage",
    "name_en": "Towing",
    "tagline": "Le véhicule ne roule plus? Appelez le garage.",
    "tagline_en": "Car won’t move? Call the garage.",
    "body": "En panne à Saint-Léonard ou dans les environs? Appelez directement le garage. Au moment de réserver, vous pouvez aussi indiquer que le véhicule doit être remorqué et l’adresse où il se trouve : le garage vous rappelle pour organiser la prise en charge.",
    "body_en": "Broken down in Saint-Léonard or nearby? Call the garage directly. When booking, you can also say the vehicle needs a tow and where it is: the garage calls you back to arrange the pickup.",
    "signs": "[\"Le véhicule ne démarre plus\", \"Voyant rouge ou surchauffe sur la route\", \"Accident ou crevaison sans roue de secours\"]",
    "signs_en": "[\"The car will not start\", \"A red warning light or overheating on the road\", \"An accident or a flat without a spare\"]",
    "confirmed": 1
  },
  {
    "slug": "esthetique-automobile",
    "icon": "oil",
    "duration_min": 180,
    "bookable": 1,
    "featured": 1,
    "name": "Esthétique automobile",
    "name_en": "Car detailing",
    "tagline": "Nettoyage intérieur et extérieur en profondeur.",
    "tagline_en": "Deep interior and exterior cleaning.",
    "body": "L’esthétique redonne de l’éclat au véhicule : lavage et décontamination de la peinture, protection, nettoyage des sièges, tapis et plastiques. Après un hiver de calcium et de sel, c’est aussi une façon de protéger la carrosserie.",
    "body_en": "Detailing brings a vehicle back to life: paint wash and decontamination, protection, and cleaning of seats, carpets and trim. After a winter of salt and calcium, it also protects the body.",
    "signs": "[\"Fin de l’hiver et du sel\", \"Avant de vendre le véhicule\", \"Taches ou odeurs à l’intérieur\", \"Peinture terne\"]",
    "signs_en": "[\"End of the salt season\", \"Before selling the vehicle\", \"Stains or odours inside\", \"Dull paint\"]",
    "confirmed": 1
  }
];
