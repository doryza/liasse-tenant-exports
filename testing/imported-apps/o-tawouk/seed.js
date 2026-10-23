const settings = [
  [
    "business_name",
    "O Tawouk"
  ],
  [
    "contact_phone",
    "(450) 486-4100"
  ],
  [
    "business_address",
    "1025, boulevard du Quartier\nBrossard (Québec) J4Z 3R9"
  ],
  [
    "maps_url",
    "https://www.google.com/maps/dir/?api=1&destination=45.4565738,-73.419483"
  ],
  [
    "order_url",
    ""
  ],
  [
    "hours_fr",
    "Lundi au dimanche · 11 h – 21 h"
  ],
  [
    "hours_en",
    "Monday to Sunday · 11 a.m.–9 p.m."
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
    "https://media.liasse.tech/upload/v1792455017/business_logos/o_tawouk_rooster_837_v2.png"
  ],
  [
    "_p_hero_image_url",
    "https://media.liasse.tech/upload/v1792452178/tapavis_menu/837/rehost_93b1ece6d112db9eca6d.jpg"
  ],
  [
    "_p_bowl_image_url",
    "https://media.liasse.tech/upload/v1792452136/tapavis_menu/837/rehost_e7fac94f2e3e7fdbb8b7.jpg"
  ]
];
module.exports = async function(db) { for (const [key,value] of settings) await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[key,value]); };
