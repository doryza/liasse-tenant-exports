CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS site_visits (id SERIAL PRIMARY KEY, path TEXT, visited_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, title TEXT NOT NULL, content TEXT, image_url TEXT, category TEXT, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS vehicles (id SERIAL PRIMARY KEY, make TEXT NOT NULL, model TEXT NOT NULL, year INTEGER NOT NULL, price INTEGER NOT NULL DEFAULT 0, mileage INTEGER DEFAULT 0, transmission TEXT, fuel_type TEXT, body_type TEXT, color TEXT, vin TEXT, description TEXT, image_url TEXT, featured INTEGER DEFAULT 0, sold INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS appointments (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT, phone TEXT NOT NULL, vehicle_id INTEGER, preferred_date TEXT, message TEXT, status TEXT DEFAULT 'pending', image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, author TEXT NOT NULL, rating INTEGER DEFAULT 5, content TEXT, image_url TEXT, vehicle_purchased TEXT, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS form_submissions (id SERIAL PRIMARY KEY, type TEXT, name TEXT, email TEXT, phone TEXT, message TEXT, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
