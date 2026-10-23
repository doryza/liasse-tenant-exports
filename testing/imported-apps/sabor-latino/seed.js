const settings = [
  [
    "business_name",
    "Sabor Latino Cuisine"
  ],
  [
    "contact_phone",
    "(514) 947-4991"
  ],
  [
    "business_address",
    "7800, boulevard Taschereau · Local 131\nBrossard (Québec) J4X 1C2"
  ],
  [
    "maps_url",
    "https://www.google.com/maps/dir/?api=1&destination=45.4534494,-73.4679891"
  ],
  [
    "order_url",
    ""
  ],
  [
    "hours_fr",
    "Lundi au mercredi · 10 h – 18 h 15\nJeudi et vendredi · 10 h – 20 h 15\nSamedi et dimanche · 9 h – 18 h 15"
  ],
  [
    "hours_en",
    "Monday–Wednesday · 10 a.m.–6:15 p.m.\nThursday–Friday · 10 a.m.–8:15 p.m.\nSaturday–Sunday · 9 a.m.–6:15 p.m."
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
    "https://media.liasse.tech/upload/v1792455936/business_logos/sabor_latino_838_wordmark.jpg"
  ],
  [
    "_p_hero_image_url",
    "https://media.liasse.tech/upload/v1792455872/tapavis_menu/838/rehost_2ceb0a7067973e6b4ff1.jpg"
  ],
  [
    "_p_bowl_image_url",
    "https://media.liasse.tech/upload/v1792455923/tapavis_menu/838/rehost_51a735fff5eb8ead54ff.jpg"
  ],
  [
    "_p_storefront_image_url",
    "https://media.liasse.tech/upload/v1792455744/business_logos/sabor_latino_838_storefront.jpg"
  ]
];
module.exports = async function(db) { for (const [key,value] of settings) await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[key,value]); };
