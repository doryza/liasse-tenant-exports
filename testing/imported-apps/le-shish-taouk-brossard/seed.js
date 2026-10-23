// Defaults for the owner-editable settings. Kept as one literal array so the
// platform's push step (extendAdminSettingsFromSeed) can add any new default
// without touching values the owner already changed.
//
// Facts come from the restaurant's command.restaurant record (2026-10-19):
// phone, address, logo, order-page photo and the Google rating it syncs.
// Hours are left empty on purpose: the hours on file there are a 24/7
// placeholder, so the Hours block stays hidden until the owner fills it in.

const settings = [
  ['business_name', 'Le Shish Taouk'],
  ['contact_phone', '(450) 724-9999'],
  ['business_address', '9105-E, boulevard Taschereau\nBrossard (Québec) J4Y 3B8'],
  ['maps_url', 'https://www.google.com/maps/search/?api=1&query=Le%20Shish%20Taouk%20Brossard&query_place_id=ChIJc8ugzLAPyUwRd_H7F0Gl-JA'],
  ['order_url', ''],
  ['hours_fr', ''],
  ['hours_en', ''],
  ['rating_enabled', '1'],
  ['rating_value', '4.8'],
  ['rating_count', '1356'],
  ['_p_nav_logo_url', 'https://media.liasse.tech/upload/v1792441549/business_logos/2bql34nlqvpa70xf646k.jpg'],
  ['_p_hero_image_url', 'https://media.liasse.tech/upload/v1792442042/business_order_heroes/vfzjfatv877jdjbl9kov.jpg'],
];

module.exports = async function (db) {
  for (const [key, value] of settings) {
    await db.run(
      'INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO NOTHING',
      [key, value]
    );
  }
};
