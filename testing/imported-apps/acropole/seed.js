const settings = [
  [
    "business_name",
    "Acropole"
  ],
  [
    "contact_phone",
    "(450) 465-8585"
  ],
  [
    "business_address",
    "838, boulevard Provencher\nBrossard (Québec) J4W 1Y6"
  ],
  [
    "maps_url",
    "https://www.google.com/maps/dir/?api=1&destination=45.4728526,-73.4881796"
  ],
  [
    "order_url",
    ""
  ],
  [
    "hours_fr",
    "Lundi · 16 h – 20 h 45\nMardi au jeudi et dimanche · 11 h 30 – 20 h 45\nVendredi et samedi · 11 h 30 – 21 h 45"
  ],
  [
    "hours_en",
    "Monday · 4–8:45 p.m.\nTuesday–Thursday & Sunday · 11:30 a.m.–8:45 p.m.\nFriday–Saturday · 11:30 a.m.–9:45 p.m."
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
    "https://media.liasse.tech/upload/v1792458776/business_logos/acropole_841_wordmark.jpg"
  ],
  [
    "_p_hero_image_url",
    "https://media.liasse.tech/upload/v1792458709/tapavis_menu/841/rehost_262589ff7f40899b290b.jpg"
  ],
  [
    "_p_bowl_image_url",
    "https://media.liasse.tech/upload/v1792458726/tapavis_menu/841/rehost_06dca88b4aa892964d91.jpg"
  ]
];
module.exports = async function(db) { for (const [key,value] of settings) await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[key,value]); };
