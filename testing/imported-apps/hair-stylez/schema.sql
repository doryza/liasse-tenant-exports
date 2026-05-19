CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS site_visits (id SERIAL PRIMARY KEY, path TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, title TEXT NOT NULL, title_en TEXT, content TEXT, content_en TEXT, image_url TEXT, category TEXT, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS services (id SERIAL PRIMARY KEY, name TEXT NOT NULL, name_en TEXT, description TEXT, description_en TEXT, duration_minutes INTEGER DEFAULT 60, price DOUBLE PRECISION DEFAULT 0, image_url TEXT, category TEXT, featured INTEGER DEFAULT 0, active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS stylists (id SERIAL PRIMARY KEY, name TEXT NOT NULL, title TEXT, title_en TEXT, bio TEXT, bio_en TEXT, image_url TEXT, instagram TEXT, email TEXT, phone TEXT, active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS stylist_availability (id SERIAL PRIMARY KEY, stylist_id INTEGER REFERENCES stylists(id) ON DELETE CASCADE, day_of_week INTEGER NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS stylist_time_off (id SERIAL PRIMARY KEY, stylist_id INTEGER REFERENCES stylists(id) ON DELETE CASCADE, off_date DATE NOT NULL, reason TEXT, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS appointments (id SERIAL PRIMARY KEY, user_id INTEGER, stylist_id INTEGER REFERENCES stylists(id) ON DELETE SET NULL, service_id INTEGER REFERENCES services(id) ON DELETE SET NULL, client_name TEXT NOT NULL, client_email TEXT, client_phone TEXT, appointment_date DATE NOT NULL, appointment_time TEXT NOT NULL, duration_minutes INTEGER DEFAULT 60, notes TEXT, status TEXT DEFAULT 'pending', image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS form_submissions (id SERIAL PRIMARY KEY, form_type TEXT, name TEXT, email TEXT, phone TEXT, message TEXT, image_url TEXT, status TEXT DEFAULT 'new', created_at TIMESTAMPTZ DEFAULT NOW());

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_stylist ON appointments(stylist_id);
CREATE INDEX IF NOT EXISTS idx_availability_stylist ON stylist_availability(stylist_id);