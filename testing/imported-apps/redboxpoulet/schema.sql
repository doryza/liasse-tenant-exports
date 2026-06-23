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
