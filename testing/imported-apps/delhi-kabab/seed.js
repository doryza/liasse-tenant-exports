const settings = [
  [
    "business_name",
    "Delhi Kabab"
  ],
  [
    "contact_phone",
    "(450) 678-6535"
  ],
  [
    "business_address",
    "6185, boulevard Taschereau\nBrossard (Québec) J4Z 1A6"
  ],
  [
    "maps_url",
    "https://www.google.com/maps/dir/?api=1&destination=45.474573,-73.4657372"
  ],
  [
    "order_url",
    ""
  ],
  [
    "hours_fr",
    "Lundi au dimanche · 16 h – 21 h"
  ],
  [
    "hours_en",
    "Monday to Sunday · 4–9 p.m."
  ],
  [
    "rating_enabled",
    "0"
  ],
  [
    "rating_value",
    ""
  ],
  [
    "rating_count",
    ""
  ],
  [
    "_p_nav_logo_url",
    "https://media.liasse.tech/upload/v1792450499/business_logos/delhi_kabab_836.png"
  ],
  [
    "_p_hero_image_url",
    "https://media.liasse.tech/upload/v1792450477/tapavis_menu/836/rehost_8f7bdda542b8626cdce0.jpg"
  ],
  [
    "_p_bowl_image_url",
    "https://media.liasse.tech/upload/v1792450491/tapavis_menu/836/rehost_a7ab756e33abe6f8262e.jpg"
  ]
];
module.exports = async function(db) { for (const [key,value] of settings) await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[key,value]); };
