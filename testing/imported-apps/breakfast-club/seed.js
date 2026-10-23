const settings = [
  [
    "business_name",
    "Le Breakfast Club · Piazza Pazza"
  ],
  [
    "contact_phone",
    "(450) 678-1441"
  ],
  [
    "business_address",
    "7575, boulevard Taschereau\nBrossard (Québec) J4Y 1A2"
  ],
  [
    "maps_url",
    "https://www.google.com/maps/dir/?api=1&destination=45.457245,-73.4642867"
  ],
  [
    "order_url",
    ""
  ],
  [
    "hours_fr",
    "Lundi · fermé\nMardi et jeudi · 8 h – 22 h\nMercredi · 8 h 30 – 22 h\nVendredi et samedi · 8 h – 22 h 45\nDimanche · 8 h 30 – 16 h"
  ],
  [
    "hours_en",
    "Monday · closed\nTuesday & Thursday · 8 a.m.–10 p.m.\nWednesday · 8:30 a.m.–10 p.m.\nFriday & Saturday · 8 a.m.–10:45 p.m.\nSunday · 8:30 a.m.–4 p.m."
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
    "https://media.liasse.tech/upload/v1792460105/business_logos/breakfast_club_842_logo.jpg"
  ],
  [
    "_p_hero_image_url",
    "https://media.liasse.tech/upload/v1792460092/tenant_breakfast_club/breakfast_club_842_b775c2de1ce1.jpg"
  ],
  [
    "_p_bowl_image_url",
    "https://media.liasse.tech/upload/v1792460103/tenant_breakfast_club/breakfast_club_842_db86c4d2a12c.jpg"
  ]
];
module.exports = async function(db) { for (const [key,value] of settings) await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[key,value]); };
