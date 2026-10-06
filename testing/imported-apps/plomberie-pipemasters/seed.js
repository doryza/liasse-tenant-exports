'use strict';
// First install only. Every setting also has a default in lib/store.js, so the site is
// complete even when this never runs; this only writes the launch switches explicitly off.
const GATES = ['contact_verified', 'address_verified', 'hours_verified', 'privacy_approved', 'messages_enabled', 'live_actions_enabled', 'documents_enabled'];
module.exports = async function (db) {
 for (const key of GATES) await db.run('INSERT INTO admin_settings(key, value) VALUES($1, $2) ON CONFLICT(key) DO NOTHING', [key, '0']);
};
