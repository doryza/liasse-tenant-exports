CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS site_visits (id SERIAL PRIMARY KEY, path TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, title TEXT NOT NULL, content TEXT, excerpt TEXT, image_url TEXT, category TEXT, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS services (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, details TEXT, image_url TEXT, icon TEXT, price TEXT, duration TEXT, featured INTEGER DEFAULT 0, display_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, author TEXT NOT NULL, role TEXT, content TEXT NOT NULL, rating INTEGER DEFAULT 5, image_url TEXT, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS appointments (id SERIAL PRIMARY KEY, parent_name TEXT NOT NULL, parent_email TEXT, parent_phone TEXT, child_name TEXT, child_age TEXT, child_grade TEXT, service_id INTEGER, service_name TEXT, preferred_date TEXT, preferred_time TEXT, message TEXT, status TEXT DEFAULT 'pending', image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS form_submissions (id SERIAL PRIMARY KEY, name TEXT, email TEXT, phone TEXT, subject TEXT, message TEXT, image_url TEXT, status TEXT DEFAULT 'new', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS faqs (id SERIAL PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, display_order INTEGER DEFAULT 0, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());