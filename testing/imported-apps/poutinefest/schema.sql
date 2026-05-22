CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_visits (
  id SERIAL PRIMARY KEY,
  path TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  category TEXT,
  published INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  price DOUBLE PRECISION,
  category TEXT,
  image_url TEXT,
  position INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  available INTEGER DEFAULT 1,
  sizes_json TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  position INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO menu_categories (slug, name_fr, name_en, position) VALUES ('classique', 'Classiques', 'Classics', 1) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (slug, name_fr, name_en, position) VALUES ('signature', 'Signatures', 'Signatures', 2) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (slug, name_fr, name_en, position) VALUES ('vegan', 'Végé', 'Veggie', 3) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (slug, name_fr, name_en, position) VALUES ('dessert', 'Desserts', 'Desserts', 4) ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS delivery_platforms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  link_url TEXT,
  position INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  event_date DATE NOT NULL,
  event_type TEXT,
  location TEXT,
  guests INTEGER,
  message TEXT,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  image_url TEXT,
  discount_label TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  max_claims INTEGER,
  max_per_user INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offer_claims (
  id SERIAL PRIMARY KEY,
  offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'claimed',
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ,
  redeemed_by_user_id INTEGER
);
CREATE INDEX IF NOT EXISTS offer_claims_short_code_idx ON offer_claims(short_code);
CREATE INDEX IF NOT EXISTS offer_claims_user_idx ON offer_claims(user_id);
CREATE INDEX IF NOT EXISTS offer_claims_offer_idx ON offer_claims(offer_id);

-- Keychain attribution ledger. Records WHICH platform user (pwa_users via
-- services.auth) was first associated with WHICH keychain ID, so the
-- TapContact upsell email fires exactly once per (user, keychain) pair.
--
-- Workflow: NFC scan → visitor lands on any tenant page with ?keychain=<id>
-- → middleware drops a `keychain_attribution` cookie → visitor clicks the
-- platform Connexion button → OTP via platform → returns logged in →
-- post-auth middleware detects (req.user + cookie) → INSERT row + send
-- upsell + set keychain_show_review cookie. The review modal partial
-- (included in footer.ejs) renders on the next render based on that
-- cookie.
--
-- Previous schema had email/otp_code/otp_expires_at because the original
-- design built a parallel /signup form. We pivoted to use the platform's
-- existing auth instead — those columns are now dropped via the ALTER
-- statements below. The DROP COLUMN IF EXISTS makes this idempotent for
-- both fresh tenants and ones that already had the old schema.
CREATE TABLE IF NOT EXISTS keychain_visitors (
  id SERIAL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  keychain_id TEXT NOT NULL,
  upsell_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE keychain_visitors ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE keychain_visitors ALTER COLUMN email DROP NOT NULL;
ALTER TABLE keychain_visitors DROP COLUMN IF EXISTS otp_code;
ALTER TABLE keychain_visitors DROP COLUMN IF EXISTS otp_expires_at;
ALTER TABLE keychain_visitors DROP COLUMN IF EXISTS email_verified_at;
CREATE UNIQUE INDEX IF NOT EXISTS keychain_visitors_user_keychain_idx
  ON keychain_visitors(user_id, keychain_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS keychain_visitors_keychain_id_idx ON keychain_visitors(keychain_id);
