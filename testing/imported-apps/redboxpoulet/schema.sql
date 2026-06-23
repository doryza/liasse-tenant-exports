-- RED BOX — Poulet Nashville. Marketing site (5 pages: Accueil, Menu, Notre
-- Promesse, Franchise, Contact). No online ordering / no member accounts.
-- Business facts, menu and page imagery are all editable from the admin backend.

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

-- Menu groups: solo (Les Boîtes Solo), grosse (La Grosse Boîte — feature),
-- burgers (Les Burgers & Extras). `served_note_*` carries the "served with…"
-- line shown under the group heading.
CREATE TABLE IF NOT EXISTS menu_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  served_note_fr TEXT,
  served_note_en TEXT,
  position INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items. is_popular => "Le Populaire" badge. is_extra => rendered in the
-- compact extras price-list instead of a photo card.
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
  is_popular INTEGER DEFAULT 0,
  is_extra INTEGER DEFAULT 0,
  available INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- General contact-form submissions (Contact page).
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

-- Franchise applications (Franchise page form). "Toutes les demandes sont
-- confidentielles."
CREATE TABLE IF NOT EXISTS franchise_requests (
  id SERIAL PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  experience TEXT,
  locale TEXT,
  handled INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS franchise_requests_created_idx ON franchise_requests(created_at DESC);

-- Ordering history mirror (native Liasse Restaurants ordering, Option A). Liasse
-- stays the source of truth; this is a read-through cache so a customer's current
-- order + 90-day history follow them. No FK to the platform-managed `users` table.
-- (Exclude from any public _db-snapshot export — it can hold customer PII.)
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
