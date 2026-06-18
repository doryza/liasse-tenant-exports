-- Ristorante Voga — schema. Marketing site (no online ordering, no member
-- accounts). Everything visible on the site is editable from the admin backend.

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

-- Food menu categories (Zuppe, Insalate, Sfizi, Risotto, Pizza, Pasta, ...).
CREATE TABLE IF NOT EXISTS menu_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  subtitle_fr TEXT,
  subtitle_en TEXT,
  position INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food menu items. Two-value prices ($13/$18) are stored in sizes_json as
-- [{label_fr,label_en,price}, ...]; single-price items just use `price`.
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  price DOUBLE PRECISION,
  sizes_json TEXT,
  category TEXT,
  image_url TEXT,
  position INTEGER DEFAULT 0,
  is_signature INTEGER DEFAULT 0,
  available INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wine list. Backend-editable; populated from the Carte des vins. price_glass
-- / price_bottle are optional (leave blank to show "—").
CREATE TABLE IF NOT EXISTS wine_items (
  id SERIAL PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  producer TEXT,
  region_fr TEXT,
  region_en TEXT,
  varietal TEXT,
  vintage TEXT,
  description_fr TEXT,
  description_en TEXT,
  price_glass DOUBLE PRECISION,
  price_bottle DOUBLE PRECISION,
  category TEXT,
  position INTEGER DEFAULT 0,
  available INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seven-course tasting ("Menu Dégustation — Vivez l'expérience"). Courses are
-- backend-editable; the price + intro live in admin_settings.
CREATE TABLE IF NOT EXISTS tasting_courses (
  id SERIAL PRIMARY KEY,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  position INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo gallery. Unique descriptive alt text per image (FR + EN).
CREATE TABLE IF NOT EXISTS gallery_images (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_fr TEXT,
  alt_en TEXT,
  caption_fr TEXT,
  caption_en TEXT,
  category TEXT,
  position INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operator-curated guest reviews / testimonials (paste real reviews only).
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  quote_fr TEXT,
  quote_en TEXT,
  source TEXT,
  review_date TEXT,
  position INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions (the "current promotion" band). Window-scoped + active flag.
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  badge_fr TEXT,
  badge_en TEXT,
  image_url TEXT,
  cta_label_fr TEXT,
  cta_label_en TEXT,
  cta_url TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  position INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- General contact-form submissions. NOT a reservation channel — the form copy
-- states this explicitly and reservations go through the third-party widget.
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  locale TEXT,
  handled INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages(created_at DESC);

-- Mirror of placed Liasse takeout orders, keyed to the platform-provisioned
-- per-app `users` table (user_id = users.id). Liasse stays the source of truth;
-- this persists the current order + 90-day history for the customer. No FK to
-- `users` (that table is platform-managed and created outside this schema).
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  liasse_order_id TEXT UNIQUE,
  order_number INTEGER,
  order_type TEXT,
  status TEXT DEFAULT 'pending',
  items JSONB,
  subtotal_cents INTEGER,
  total_cents INTEGER,
  tax_breakdown JSONB,
  customer_name TEXT,
  pickup_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);
