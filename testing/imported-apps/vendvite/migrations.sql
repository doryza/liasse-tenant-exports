ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS sale_result TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
CREATE TABLE IF NOT EXISTS brokers (id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, full_name TEXT NOT NULL, agency TEXT, phone TEXT, email TEXT NOT NULL, target_region TEXT, status TEXT DEFAULT 'invited', published INTEGER DEFAULT 0, profile JSONB DEFAULT '{}'::jsonb, paypal_subscription_id TEXT, paypal_sandbox_subscription_id TEXT, paypal_sandbox_active INTEGER NOT NULL DEFAULT 0, paypal_sandbox_expires_at TIMESTAMPTZ, membership_started_at TIMESTAMPTZ, membership_expires_at TIMESTAMPTZ, last_seen_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS target_region TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS paypal_sandbox_subscription_id TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS paypal_sandbox_active INTEGER NOT NULL DEFAULT 0;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS paypal_sandbox_expires_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS brokers_email_lower_idx ON brokers (LOWER(email));
CREATE TABLE IF NOT EXISTS broker_tokens (id SERIAL PRIMARY KEY, broker_id INTEGER NOT NULL, token_hash TEXT NOT NULL, purpose TEXT DEFAULT 'access', expires_at TIMESTAMPTZ, used_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS broker_tokens_hash_idx ON broker_tokens (token_hash);
CREATE INDEX IF NOT EXISTS broker_tokens_broker_idx ON broker_tokens (broker_id);
CREATE TABLE IF NOT EXISTS broker_leads (id SERIAL PRIMARY KEY, broker_id INTEGER NOT NULL, name TEXT, email TEXT, phone TEXT, address TEXT, lat DOUBLE PRECISION, lng DOUBLE PRECISION, timeframe TEXT, status TEXT DEFAULT 'nouveau', notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS broker_leads_broker_idx ON broker_leads (broker_id, created_at DESC);
CREATE TABLE IF NOT EXISTS broker_events (id SERIAL PRIMARY KEY, broker_id INTEGER, kind TEXT, detail TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS broker_events_broker_idx ON broker_events (broker_id, created_at DESC);
CREATE TABLE IF NOT EXISTS broker_invoices (id SERIAL PRIMARY KEY, broker_id INTEGER NOT NULL, invoice_number TEXT UNIQUE, payment_key TEXT UNIQUE NOT NULL, paypal_subscription_id TEXT NOT NULL, paypal_transaction_id TEXT, payment_time TIMESTAMPTZ NOT NULL, period_start TIMESTAMPTZ NOT NULL, period_end TIMESTAMPTZ NOT NULL, subtotal_cents INTEGER NOT NULL, gst_cents INTEGER NOT NULL DEFAULT 0, qst_cents INTEGER NOT NULL DEFAULT 0, total_cents INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'CAD', is_test INTEGER NOT NULL DEFAULT 0, paypal_mode TEXT NOT NULL DEFAULT 'live', emailed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE broker_invoices ADD COLUMN IF NOT EXISTS is_test INTEGER NOT NULL DEFAULT 0;
ALTER TABLE broker_invoices ADD COLUMN IF NOT EXISTS paypal_mode TEXT NOT NULL DEFAULT 'live';
CREATE INDEX IF NOT EXISTS broker_invoices_broker_idx ON broker_invoices (broker_id, payment_time DESC);
CREATE INDEX IF NOT EXISTS broker_invoices_subscription_idx ON broker_invoices (paypal_subscription_id, payment_time DESC);
UPDATE brokers b
SET paypal_sandbox_active=1,
    paypal_sandbox_expires_at=GREATEST(COALESCE(b.paypal_sandbox_expires_at,'epoch'::timestamptz), paid.period_end),
    updated_at=NOW()
FROM (
  SELECT broker_id, MAX(period_end) AS period_end
  FROM broker_invoices
  WHERE COALESCE(is_test,0)=1 AND paypal_mode='sandbox'
  GROUP BY broker_id
) paid
WHERE b.id=paid.broker_id AND b.paypal_sandbox_expires_at IS NULL AND paid.period_end>NOW();
CREATE TABLE IF NOT EXISTS broker_campaigns (id SERIAL PRIMARY KEY, broker_id INTEGER NOT NULL, kind TEXT NOT NULL DEFAULT 'included', status TEXT NOT NULL DEFAULT 'confirmed', payment_status TEXT NOT NULL DEFAULT 'none', centre_label TEXT, centre_lat DOUBLE PRECISION, centre_lng DOUBLE PRECISION, radius_m INTEGER NOT NULL DEFAULT 0, quantity INTEGER NOT NULL DEFAULT 0, address_count INTEGER NOT NULL DEFAULT 0, addresses JSONB NOT NULL DEFAULT '[]'::jsonb, city TEXT, province TEXT NOT NULL DEFAULT 'QC', notes TEXT, subtotal_cents INTEGER NOT NULL DEFAULT 0, gst_cents INTEGER NOT NULL DEFAULT 0, qst_cents INTEGER NOT NULL DEFAULT 0, total_cents INTEGER NOT NULL DEFAULT 0, paypal_order_id TEXT, paypal_capture_id TEXT, paypal_mode TEXT NOT NULL DEFAULT 'live', is_test INTEGER NOT NULL DEFAULT 0, quota_period DATE, deadline_at TIMESTAMPTZ, mailed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT 'QC';
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS is_test INTEGER NOT NULL DEFAULT 0;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS broker_campaigns_broker_idx ON broker_campaigns (broker_id, created_at DESC);
CREATE INDEX IF NOT EXISTS broker_campaigns_status_idx ON broker_campaigns (status, created_at DESC);
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'included';
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS gst_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS qst_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS total_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS paypal_mode TEXT NOT NULL DEFAULT 'live';
CREATE UNIQUE INDEX IF NOT EXISTS broker_campaigns_order_idx ON broker_campaigns (paypal_order_id) WHERE paypal_order_id IS NOT NULL;
ALTER TABLE broker_invoices ALTER COLUMN paypal_subscription_id DROP NOT NULL;
ALTER TABLE broker_invoices ALTER COLUMN period_start DROP NOT NULL;
ALTER TABLE broker_invoices ALTER COLUMN period_end DROP NOT NULL;
ALTER TABLE broker_invoices ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'subscription';
ALTER TABLE broker_invoices ADD COLUMN IF NOT EXISTS campaign_id INTEGER;
ALTER TABLE broker_invoices ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS quota_period DATE;
DROP INDEX IF EXISTS broker_campaigns_quota_idx;
CREATE UNIQUE INDEX IF NOT EXISTS broker_campaigns_credit_idx ON broker_campaigns (broker_id, quota_period) WHERE quota_period IS NOT NULL AND status<>'cancelled' AND is_test=0;

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
