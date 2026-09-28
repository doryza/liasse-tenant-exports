CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS links (id SERIAL PRIMARY KEY, kind TEXT NOT NULL CHECK (kind IN ('linkedin','instagram','facebook','x','tiktok','youtube','github','behance','calendar','portfolio','website','other')), label_fr TEXT, label_en TEXT, url TEXT NOT NULL, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS card_events (id SERIAL PRIMARY KEY, kind TEXT NOT NULL CHECK (kind IN ('view','download')), created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS card_events_kind_time ON card_events (kind, created_at);
