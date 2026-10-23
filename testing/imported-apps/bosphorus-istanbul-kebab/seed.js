const settings = [
  [
    "business_name",
    "Bosphorus Istanbul Kebab"
  ],
  [
    "contact_phone",
    "(450) 486-4388"
  ],
  [
    "business_address",
    "6275, boulevard Taschereau\nBrossard (Québec) J4Z 1A6"
  ],
  [
    "maps_url",
    "https://www.google.com/maps/dir/?api=1&destination=45.473676,-73.466564"
  ],
  [
    "order_url",
    ""
  ],
  [
    "hours_fr",
    ""
  ],
  [
    "hours_en",
    ""
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
    "https://media.liasse.tech/upload/v1792447649/business_logos/bosphorus_istanbul_kebab_835.jpg"
  ],
  [
    "_p_hero_image_url",
    "https://media.liasse.tech/upload/v1792447539/tapavis_menu/835/rehost_ea823036d782adc213bc.jpg"
  ],
  [
    "_p_bowl_image_url",
    "https://media.liasse.tech/upload/v1792447601/tapavis_menu/835/rehost_b44288e5929793ad6677.jpg"
  ]
];
module.exports = async function(db) { for (const [key,value] of settings) await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[key,value]); };
