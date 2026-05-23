CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS site_visits (id SERIAL PRIMARY KEY, path TEXT, visited_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, title TEXT NOT NULL, content TEXT, image_url TEXT, category TEXT, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS businesses (id SERIAL PRIMARY KEY, user_id INTEGER, business_name TEXT NOT NULL, contact_name TEXT, contact_email TEXT, contact_phone TEXT, mailing_address TEXT, notes TEXT, status TEXT DEFAULT 'pending', credit_limit DOUBLE PRECISION DEFAULT 1000, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS pickup_locations (id SERIAL PRIMARY KEY, business_id INTEGER, label TEXT NOT NULL, address TEXT NOT NULL, lat DOUBLE PRECISION, lng DOUBLE PRECISION, contact_name TEXT, contact_phone TEXT, notes TEXT, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS deliveries (id SERIAL PRIMARY KEY, business_id INTEGER, pickup_location_id INTEGER, pickup_address TEXT, pickup_lat DOUBLE PRECISION, pickup_lng DOUBLE PRECISION, destination_address TEXT, destination_lat DOUBLE PRECISION, destination_lng DOUBLE PRECISION, recipient_name TEXT, recipient_phone TEXT, package_description TEXT, service_level TEXT, distance_km DOUBLE PRECISION, price DOUBLE PRECISION, status TEXT DEFAULT 'pending', notes TEXT, image_url TEXT, scheduled_at TIMESTAMPTZ, delivered_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS rates (id SERIAL PRIMARY KEY, service_level TEXT UNIQUE NOT NULL, display_name_fr TEXT, display_name_en TEXT, base_price DOUBLE PRECISION DEFAULT 10, price_per_km DOUBLE PRECISION DEFAULT 2, cutoff_time TEXT, description_fr TEXT, description_en TEXT, image_url TEXT, active INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS form_submissions (id SERIAL PRIMARY KEY, name TEXT, email TEXT, phone TEXT, subject TEXT, message TEXT, created_at TIMESTAMPTZ DEFAULT NOW());