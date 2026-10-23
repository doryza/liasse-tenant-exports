// Verified contact information; unverified hours and ratings remain hidden.
const settings = [
  [
    "business_name",
    "La Maison Des Grillades"
  ],
  [
    "contact_phone",
    "(579) 723-1060"
  ],
  [
    "business_address",
    "8265, boulevard Taschereau, local 105\nBrossard (Québec) J4Y 1A4"
  ],
  [
    "maps_url",
    "https://www.google.com/maps/search/?api=1&query=La%20Maison%20Des%20Grillades%208265%20Boulevard%20Taschereau%20Brossard"
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
    "https://media.liasse.tech/upload/v1792445252/business_logos/yxkzrrhc4dxd7tcme2rq.png"
  ],
  [
    "_p_hero_image_url",
    "https://media.liasse.tech/upload/v1792443858/tapavis_menu/834/rehost_78f3c9319d2f1af13abe.jpg"
  ],
  [
    "_p_bowl_image_url",
    "https://media.liasse.tech/upload/v1792443866/tapavis_menu/834/rehost_0abfc1e4f64992947f39.jpg"
  ]
];
module.exports = async function(db) { for (const [key,value] of settings) await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[key,value]); };
