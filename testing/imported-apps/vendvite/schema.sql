CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS site_visits (id SERIAL PRIMARY KEY, path TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, title TEXT NOT NULL, content TEXT, excerpt TEXT, image_url TEXT, category TEXT, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, author TEXT NOT NULL, neighborhood TEXT, quote TEXT, sale_result TEXT, image_url TEXT, sort_order INTEGER DEFAULT 0, published INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS leads (id SERIAL PRIMARY KEY, name TEXT, email TEXT, phone TEXT, address TEXT, lat DOUBLE PRECISION, lng DOUBLE PRECISION, timeframe TEXT, status TEXT DEFAULT 'nouveau', notes TEXT, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS brokers (id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, full_name TEXT NOT NULL, agency TEXT, phone TEXT, email TEXT NOT NULL, target_region TEXT, status TEXT DEFAULT 'invited', published INTEGER DEFAULT 0, profile JSONB DEFAULT '{}'::jsonb, paypal_subscription_id TEXT, paypal_sandbox_subscription_id TEXT, paypal_sandbox_active INTEGER NOT NULL DEFAULT 0, paypal_sandbox_expires_at TIMESTAMPTZ, membership_started_at TIMESTAMPTZ, membership_expires_at TIMESTAMPTZ, last_seen_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS broker_tokens (id SERIAL PRIMARY KEY, broker_id INTEGER NOT NULL, token_hash TEXT NOT NULL, purpose TEXT DEFAULT 'access', expires_at TIMESTAMPTZ, used_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS broker_leads (id SERIAL PRIMARY KEY, broker_id INTEGER NOT NULL, name TEXT, email TEXT, phone TEXT, address TEXT, lat DOUBLE PRECISION, lng DOUBLE PRECISION, timeframe TEXT, status TEXT DEFAULT 'nouveau', notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS broker_events (id SERIAL PRIMARY KEY, broker_id INTEGER, kind TEXT, detail TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS broker_invoices (id SERIAL PRIMARY KEY, broker_id INTEGER NOT NULL, invoice_number TEXT UNIQUE, payment_key TEXT UNIQUE NOT NULL, paypal_subscription_id TEXT NOT NULL, paypal_transaction_id TEXT, payment_time TIMESTAMPTZ NOT NULL, period_start TIMESTAMPTZ NOT NULL, period_end TIMESTAMPTZ NOT NULL, subtotal_cents INTEGER NOT NULL, gst_cents INTEGER NOT NULL DEFAULT 0, qst_cents INTEGER NOT NULL DEFAULT 0, total_cents INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'CAD', is_test INTEGER NOT NULL DEFAULT 0, paypal_mode TEXT NOT NULL DEFAULT 'live', emailed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS broker_campaigns (id SERIAL PRIMARY KEY, broker_id INTEGER NOT NULL, kind TEXT NOT NULL DEFAULT 'included', status TEXT NOT NULL DEFAULT 'confirmed', payment_status TEXT NOT NULL DEFAULT 'none', centre_label TEXT, centre_lat DOUBLE PRECISION, centre_lng DOUBLE PRECISION, radius_m INTEGER NOT NULL DEFAULT 0, quantity INTEGER NOT NULL DEFAULT 0, address_count INTEGER NOT NULL DEFAULT 0, addresses JSONB NOT NULL DEFAULT '[]'::jsonb, city TEXT, province TEXT NOT NULL DEFAULT 'QC', notes TEXT, subtotal_cents INTEGER NOT NULL DEFAULT 0, gst_cents INTEGER NOT NULL DEFAULT 0, qst_cents INTEGER NOT NULL DEFAULT 0, total_cents INTEGER NOT NULL DEFAULT 0, paypal_order_id TEXT, paypal_capture_id TEXT, paypal_mode TEXT NOT NULL DEFAULT 'live', is_test INTEGER NOT NULL DEFAULT 0, quota_period DATE, deadline_at TIMESTAMPTZ, mailed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

-- Homepage pricing experiment. Additive; no existing business data changes.
CREATE TABLE IF NOT EXISTS homepage_experiments (
  experiment TEXT PRIMARY KEY, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  winner TEXT CHECK (winner IN ('visible','gated')), next_look INTEGER NOT NULL DEFAULT 0,
  checked_at TIMESTAMPTZ, decided_at TIMESTAMPTZ, last_result JSONB
);
CREATE TABLE IF NOT EXISTS homepage_visitors (
  experiment TEXT NOT NULL REFERENCES homepage_experiments(experiment),
  visitor_id TEXT NOT NULL, variant TEXT NOT NULL CHECK (variant IN ('visible','gated')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), exposed_at TIMESTAMPTZ,
  form_started_at TIMESTAMPTZ, cta_at TIMESTAMPTZ, applied_at TIMESTAMPTZ,
  broker_id INTEGER REFERENCES brokers(id), PRIMARY KEY (experiment,visitor_id), UNIQUE (experiment,broker_id)
);
CREATE INDEX IF NOT EXISTS homepage_visitors_exposure_idx ON homepage_visitors(experiment,variant,exposed_at);
INSERT INTO homepage_experiments (experiment) VALUES ('homepage-price-v1') ON CONFLICT DO NOTHING;
-- Persistent broker access and optimistic profile saving (additive).
ALTER TABLE broker_tokens ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS profile_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS auth_valid_after TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS broker_sessions (
 id BIGSERIAL PRIMARY KEY, broker_id INTEGER NOT NULL REFERENCES brokers(id), token_hash TEXT UNIQUE NOT NULL,
 device_label TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 idle_expires_at TIMESTAMPTZ NOT NULL, absolute_expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS broker_sessions_broker_idx ON broker_sessions(broker_id,last_seen_at);
CREATE TABLE IF NOT EXISTS broker_login_limits(bucket_key TEXT PRIMARY KEY,hits INTEGER NOT NULL,window_started_at TIMESTAMPTZ NOT NULL,last_request_at TIMESTAMPTZ NOT NULL);
-- Campaign studio: private drafts and cached public property analysis.
CREATE TABLE IF NOT EXISTS broker_campaign_drafts (broker_id INTEGER PRIMARY KEY REFERENCES brokers(id),revision INTEGER NOT NULL DEFAULT 0,data JSONB NOT NULL DEFAULT '{}',updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS campaign_property_cache (cache_key TEXT PRIMARY KEY,payload JSONB NOT NULL,expires_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS campaign_request_limits (broker_id INTEGER NOT NULL REFERENCES brokers(id),bucket TEXT NOT NULL,window_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),hits INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(broker_id,bucket));

-- Mailing-service offer and agent acquisition campaigns (generation 68+).
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS access_plan TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS mailing_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS broker_campaigns_mailing_token ON broker_campaigns(mailing_token) WHERE mailing_token IS NOT NULL;
CREATE TABLE IF NOT EXISTS solicitation_campaigns(id SERIAL PRIMARY KEY,name TEXT NOT NULL,format TEXT NOT NULL DEFAULT 'duplex',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS solicitation_agents(id SERIAL PRIMARY KEY,campaign_id INTEGER NOT NULL REFERENCES solicitation_campaigns(id),tag TEXT UNIQUE NOT NULL,name TEXT NOT NULL,agency TEXT NOT NULL DEFAULT '',title TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',photo_url TEXT NOT NULL DEFAULT '',address1 TEXT NOT NULL,address2 TEXT NOT NULL,broker_id INTEGER REFERENCES brokers(id),visits INTEGER NOT NULL DEFAULT 0,last_visited_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS solicitation_agents_campaign ON solicitation_agents(campaign_id);
CREATE TABLE IF NOT EXISTS mailing_signup_limits(key TEXT PRIMARY KEY,last_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
