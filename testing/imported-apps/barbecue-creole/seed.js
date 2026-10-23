const settings = [
  [
    "business_name",
    "Barbecue Créole"
  ],
  [
    "contact_phone",
    "(450) 445-5176"
  ],
  [
    "business_address",
    "5625, Grande Allée\nBrossard (Québec) J4Z 3G3"
  ],
  [
    "maps_url",
    "https://www.google.com/maps/dir/?api=1&destination=45.4747982,-73.4443739"
  ],
  [
    "order_url",
    ""
  ],
  [
    "hours_fr",
    "Lundi au samedi · 11 h 30 – 23 h\nDimanche · 12 h – 22 h 45"
  ],
  [
    "hours_en",
    "Monday–Saturday · 11:30 a.m.–11 p.m.\nSunday · Noon–10:45 p.m."
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
    "https://media.liasse.tech/upload/v1792456636/business_logos/barbecue_creole_839_wordmark.jpg"
  ],
  [
    "_p_hero_image_url",
    "https://media.liasse.tech/upload/v1792456628/tapavis_menu/839/rehost_29082bf5dcc4068c69da.jpg"
  ],
  [
    "_p_bowl_image_url",
    "https://media.liasse.tech/upload/v1792456636/tapavis_menu/839/rehost_580be9bebf126cfa2d98.jpg"
  ]
];
module.exports = async function(db) { for (const [key,value] of settings) await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[key,value]); };
