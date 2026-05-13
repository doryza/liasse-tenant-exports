CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS site_visits (id SERIAL PRIMARY KEY, path TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, title TEXT NOT NULL, content TEXT, image_url TEXT, category TEXT, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS plans (id SERIAL PRIMARY KEY, name TEXT NOT NULL, name_en TEXT, description TEXT, description_en TEXT, price_cents INTEGER NOT NULL DEFAULT 0, duration_days INTEGER NOT NULL DEFAULT 30, features TEXT, features_en TEXT, image_url TEXT, badge TEXT, featured INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0, active INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, user_id INTEGER, plan_id INTEGER, customer_name TEXT, customer_email TEXT, customer_phone TEXT, amount_cents INTEGER NOT NULL DEFAULT 0, currency TEXT DEFAULT 'CAD', status TEXT DEFAULT 'pending', payment_method TEXT, payment_ref TEXT, notes TEXT, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS subscriptions (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, plan_id INTEGER, order_id INTEGER, status TEXT DEFAULT 'active', starts_at TIMESTAMPTZ DEFAULT NOW(), expires_at TIMESTAMPTZ, m3u_url TEXT, credentials_username TEXT, credentials_password TEXT, firstaru_m3u_url TEXT, firstaru_credentials_username TEXT, firstaru_credentials_password TEXT, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, author TEXT NOT NULL, role TEXT, content TEXT NOT NULL, content_en TEXT, rating INTEGER DEFAULT 5, avatar_url TEXT, image_url TEXT, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS channels (id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT, country TEXT, logo_url TEXT, image_url TEXT, featured INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS submissions (id SERIAL PRIMARY KEY, name TEXT, email TEXT, phone TEXT, subject TEXT, message TEXT, status TEXT DEFAULT 'new', image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

-- === voice-module-v1 START ===
CREATE TABLE IF NOT EXISTS voice_submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER,
  fields JSONB NOT NULL,
  language TEXT,
  voice_session_id TEXT,
  status TEXT DEFAULT 'new',
  assigned_to_sales_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_voice_submissions_status ON voice_submissions (status);
CREATE INDEX IF NOT EXISTS idx_voice_submissions_created ON voice_submissions (created_at DESC);
-- === voice-module-v1 END ===
