-- Add Firstaru server credential columns to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS firstaru_m3u_url TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS firstaru_credentials_username TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS firstaru_credentials_password TEXT;

-- Add Edge server credential columns to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS edge_m3u_url TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS edge_credentials_username TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS edge_credentials_password TEXT;

-- Add Omega server credential columns to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS omega_m3u_url TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS omega_credentials_username TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS omega_credentials_password TEXT;

-- Add Trex server credential columns to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trex_m3u_url TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trex_credentials_username TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trex_credentials_password TEXT;

-- Formuler devices table
CREATE TABLE IF NOT EXISTS formuler_products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  features TEXT,
  features_en TEXT,
  image_url TEXT,
  badge TEXT,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
