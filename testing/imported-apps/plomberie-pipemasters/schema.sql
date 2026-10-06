CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS customers (
 id SERIAL PRIMARY KEY, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT,
 language TEXT NOT NULL DEFAULT 'fr', notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plumbing_requests (
 id SERIAL PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL,
 service_id TEXT, message TEXT NOT NULL, language TEXT NOT NULL DEFAULT 'fr',
 status TEXT NOT NULL DEFAULT 'new', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE plumbing_requests ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE plumbing_requests ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE plumbing_requests ADD COLUMN IF NOT EXISTS urgency TEXT;
ALTER TABLE plumbing_requests ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE plumbing_requests ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'web';
ALTER TABLE plumbing_requests ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE plumbing_requests ADD COLUMN IF NOT EXISTS customer_id INTEGER;
ALTER TABLE plumbing_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE plumbing_requests ALTER COLUMN address DROP NOT NULL;
UPDATE plumbing_requests SET status = 'done' WHERE status = 'closed';

CREATE TABLE IF NOT EXISTS documents (
 id SERIAL PRIMARY KEY, kind TEXT NOT NULL, number TEXT UNIQUE, token TEXT NOT NULL UNIQUE,
 customer_id INTEGER REFERENCES customers(id), request_id INTEGER, source_id INTEGER,
 status TEXT NOT NULL DEFAULT 'draft', language TEXT NOT NULL DEFAULT 'fr', title TEXT NOT NULL DEFAULT '',
 property_address TEXT, issued_on DATE, valid_until DATE, due_on DATE, charge_taxes INTEGER NOT NULL DEFAULT 1,
 subtotal_cents INTEGER NOT NULL DEFAULT 0, tps_cents INTEGER NOT NULL DEFAULT 0, tvq_cents INTEGER NOT NULL DEFAULT 0, total_cents INTEGER NOT NULL DEFAULT 0,
 terms TEXT, notes TEXT, sent_at TIMESTAMPTZ, viewed_at TIMESTAMPTZ, decided_at TIMESTAMPTZ, decided_name TEXT, decline_reason TEXT,
 paid_on DATE, payment_method TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS documents_kind_status ON documents(kind, status);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tax_rates TEXT;

CREATE TABLE IF NOT EXISTS document_lines (
 id SERIAL PRIMARY KEY, document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
 position INTEGER NOT NULL DEFAULT 0, kind TEXT NOT NULL DEFAULT 'labour', description TEXT NOT NULL,
 quantity NUMERIC(10,2) NOT NULL DEFAULT 1, unit_cents INTEGER NOT NULL DEFAULT 0, total_cents INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS document_events (
 id SERIAL PRIMARY KEY, document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
 kind TEXT NOT NULL, detail TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_counters (kind TEXT PRIMARY KEY, next_number INTEGER NOT NULL);
