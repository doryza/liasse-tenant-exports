const settings = [
  [
    "business_name",
    "Gokul Sweets"
  ],
  [
    "contact_phone",
    "(438) 988-6077"
  ],
  [
    "business_address",
    "3250, boulevard de Rome · Local 10\nBrossard (Québec) J4Y 1V9"
  ],
  [
    "maps_url",
    "https://www.google.com/maps/dir/?api=1&destination=45.4504655,-73.4552039"
  ],
  [
    "order_url",
    ""
  ],
  [
    "hours_fr",
    "Lundi · 16 h – 21 h\nMardi au samedi · 12 h – 21 h\nDimanche · 11 h 59 – 21 h"
  ],
  [
    "hours_en",
    "Monday · 4–9 p.m.\nTuesday–Saturday · Noon–9 p.m.\nSunday · 11:59 a.m.–9 p.m."
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
    "https://media.liasse.tech/upload/v1792457467/business_logos/gokul_sweets_840_wordmark.jpg"
  ],
  [
    "_p_hero_image_url",
    "https://media.liasse.tech/upload/v1792457710/tapavis_menu/840/rehost_7cfaa466aca72a368757.jpg"
  ],
  [
    "_p_bowl_image_url",
    "https://media.liasse.tech/upload/v1792457737/tapavis_menu/840/rehost_479332677862efd67732.jpg"
  ]
];
module.exports = async function(db) { for (const [key,value] of settings) await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[key,value]); };
