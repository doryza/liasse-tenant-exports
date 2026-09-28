/**
 * First install only. Nothing here is invented: the name comes from the
 * account, contact details stay as the account gave them (see lib/settings.js
 * defaults), and the owner fills the rest from /admin.
 */
module.exports = async function seed(db, services) {
  const c = (services && services.config) || {};
  const rows = [
    ['_seed_version', '1'],
    ['full_name', c.businessName || c.displayName || 'Dory Zawahry'],
    ['theme', 'ivoire'],
    ['theme_font', 'serif'],
    ['show_text', '0'],
  ];
  for (const [key, value] of rows) {
    await db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO NOTHING', [key, value]);
  }
};
