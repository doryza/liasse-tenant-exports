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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
