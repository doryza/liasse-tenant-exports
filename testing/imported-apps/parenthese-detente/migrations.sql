ALTER TABLE services ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS tagline_fr TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS tagline_en TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS region TEXT;

-- Granular booking availability (weekly windows + blackout dates), added 2026-07
CREATE TABLE IF NOT EXISTS availability_rules (id SERIAL PRIMARY KEY, day_of_week INTEGER NOT NULL, start_time TEXT NOT NULL DEFAULT '09:00', end_time TEXT NOT NULL DEFAULT '19:00', service_id INTEGER, label TEXT, valid_from DATE, valid_to DATE, active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS blackout_dates (id SERIAL PRIMARY KEY, start_date DATE NOT NULL, end_date DATE, reason TEXT, service_id INTEGER, active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE availability_rules ADD COLUMN IF NOT EXISTS valid_from DATE;
ALTER TABLE availability_rules ADD COLUMN IF NOT EXISTS valid_to DATE;
ALTER TABLE availability_rules ADD COLUMN IF NOT EXISTS label TEXT;

-- Seed default weekly windows (Mon-Sat) from the previous global hours, only if none exist yet.
INSERT INTO availability_rules (day_of_week, start_time, end_time, service_id, active, sort_order, created_at, updated_at)
SELECT t.d,
       COALESCE((SELECT value FROM admin_settings WHERE key = 'booking_start'), '09:00'),
       COALESCE((SELECT value FROM admin_settings WHERE key = 'booking_end'), '19:00'),
       NULL, true, t.d, NOW(), NOW()
FROM (VALUES (1),(2),(3),(4),(5),(6)) AS t(d)
WHERE NOT EXISTS (SELECT 1 FROM availability_rules);
