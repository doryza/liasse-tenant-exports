-- Le Shish Taouk — the site's own data is only its settings. The menu lives
-- in command.restaurant and is read from its public feed (lib/menu.js).
CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());
