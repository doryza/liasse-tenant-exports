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

-- Postal solicitation batches and manual shipment tracking (2026-09-07).
ALTER TABLE solicitation_campaigns ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE solicitation_campaigns ADD COLUMN IF NOT EXISTS batch_number INTEGER;
ALTER TABLE solicitation_campaigns ADD COLUMN IF NOT EXISTS batch_summary JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS solicitation_campaigns_batch_number ON solicitation_campaigns(batch_number) WHERE batch_number IS NOT NULL;
ALTER TABLE solicitation_agents ADD COLUMN IF NOT EXISTS source_key TEXT;
ALTER TABLE solicitation_agents ADD COLUMN IF NOT EXISTS source_meta JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS solicitation_agents_source_key ON solicitation_agents(source_key) WHERE source_key IS NOT NULL;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS production JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS agent_page_activity (
 token_hash TEXT PRIMARY KEY, visitor_hash TEXT NOT NULL, agent_id INTEGER REFERENCES solicitation_agents(id), broker_id INTEGER REFERENCES brokers(id),
 kind TEXT NOT NULL CHECK(kind IN ('invitation','mailer')), first_seen_at TIMESTAMPTZ, last_seen_at TIMESTAMPTZ, active BOOLEAN NOT NULL DEFAULT false, issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_page_activity_agent ON agent_page_activity(agent_id,last_seen_at);
CREATE INDEX IF NOT EXISTS agent_page_activity_broker ON agent_page_activity(broker_id,last_seen_at);
CREATE INDEX IF NOT EXISTS agent_page_activity_recent ON agent_page_activity(last_seen_at) WHERE first_seen_at IS NOT NULL;

-- Integrated tracking-auth-migration-v1.sql
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE solicitation_agents ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE broker_tokens ADD COLUMN IF NOT EXISTS invitation_id INTEGER REFERENCES solicitation_agents(id);
CREATE TABLE IF NOT EXISTS solicitation_claims (
 agent_id INTEGER NOT NULL REFERENCES solicitation_agents(id),
 broker_id INTEGER NOT NULL REFERENCES brokers(id),
 started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 verified_at TIMESTAMPTZ,
 PRIMARY KEY(agent_id,broker_id)
);
UPDATE brokers b SET email_verified_at=v.verified_at FROM (SELECT broker_id,MIN(used_at) verified_at FROM broker_tokens WHERE used_at IS NOT NULL GROUP BY broker_id) v WHERE b.id=v.broker_id AND b.email_verified_at IS NULL;
INSERT INTO solicitation_claims(agent_id,broker_id,started_at,verified_at) SELECT a.id,a.broker_id,COALESCE(b.created_at,NOW()),b.email_verified_at FROM solicitation_agents a JOIN brokers b ON b.id=a.broker_id ON CONFLICT(agent_id,broker_id) DO NOTHING;
UPDATE solicitation_agents a SET claimed_at=b.email_verified_at FROM brokers b WHERE b.id=a.broker_id AND b.email_verified_at IS NOT NULL AND a.claimed_at IS NULL;
ALTER TABLE agent_page_activity ADD COLUMN IF NOT EXISTS campaign_id INTEGER REFERENCES broker_campaigns(id);
ALTER TABLE agent_page_activity ADD COLUMN IF NOT EXISTS recipient_hash TEXT;
CREATE INDEX IF NOT EXISTS agent_page_activity_campaign_idx ON agent_page_activity(campaign_id,last_seen_at) WHERE campaign_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS operations_job_runs (
 name TEXT PRIMARY KEY,
 started_at TIMESTAMPTZ,
 finished_at TIMESTAMPTZ,
 last_error TEXT,
 details JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE operations_job_runs ADD COLUMN IF NOT EXISTS lease_until TIMESTAMPTZ;
ALTER TABLE operations_job_runs ADD COLUMN IF NOT EXISTS lease_token TEXT;

-- Integrated payment-recovery-migration-v1.sql
-- Durable PayPal attempts and cross-process leases; monetary snapshots are unchanged.
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS payment_recovery JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS payment_check_after TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS payment_lease_until TIMESTAMPTZ;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS payment_lease_token TEXT;
CREATE INDEX IF NOT EXISTS broker_campaigns_payment_recovery_due ON broker_campaigns(payment_check_after) WHERE kind='paid';
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS checkout_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS broker_campaigns_pending_checkout ON broker_campaigns(broker_id,checkout_key) WHERE kind='paid' AND payment_status='pending' AND checkout_key IS NOT NULL;

-- Integrated production-migration-v2.sql
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS history_policy JSONB NOT NULL DEFAULT '{"mode":"off"}'::jsonb;
CREATE TABLE IF NOT EXISTS production_broker_locks (
 broker_id INTEGER PRIMARY KEY REFERENCES brokers(id),
 owner TEXT NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL
);

-- Integrated lead-followup-migration-v1.sql
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS campaign_id INTEGER REFERENCES broker_campaigns(id);
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS recipient_id TEXT;
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'fr';
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS submission_key TEXT;
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS duplicate_key TEXT;
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS duplicate_window BIGINT;
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS response_due_at TIMESTAMPTZ;
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS analysis_delivered_at TIMESTAMPTZ;
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS delivery_method TEXT;
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS delivery_reference TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS broker_leads_submission_idx ON broker_leads(broker_id,submission_key);
CREATE UNIQUE INDEX IF NOT EXISTS broker_leads_duplicate_idx ON broker_leads(broker_id,duplicate_key,duplicate_window);
CREATE INDEX IF NOT EXISTS broker_leads_campaign_idx ON broker_leads(campaign_id,created_at);
CREATE INDEX IF NOT EXISTS broker_leads_due_idx ON broker_leads(response_due_at) WHERE contacted_at IS NULL;
CREATE TABLE IF NOT EXISTS notification_jobs (
 id BIGSERIAL PRIMARY KEY, job_key TEXT NOT NULL UNIQUE, kind TEXT NOT NULL,
 payload JSONB NOT NULL, broker_id INTEGER, lead_id INTEGER, campaign_id INTEGER,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','failed','cancelled')),
 attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 lease_token TEXT, lease_until TIMESTAMPTZ, sent_at TIMESTAMPTZ, last_error TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notification_jobs_due_idx ON notification_jobs(status,next_attempt_at);
CREATE INDEX IF NOT EXISTS notification_jobs_lead_idx ON notification_jobs(lead_id);
CREATE TABLE IF NOT EXISTS lead_request_limits (
 scope_hash TEXT PRIMARY KEY, window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 requests INTEGER NOT NULL DEFAULT 1
);

-- Integrated sandbox-migration-v1.sql
-- Test requests follow the real workflow while retaining their own identity.
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS is_test INTEGER NOT NULL DEFAULT 0 CHECK(is_test IN (0,1));
ALTER TABLE notification_jobs ADD COLUMN IF NOT EXISTS is_test INTEGER NOT NULL DEFAULT 0 CHECK(is_test IN (0,1));
ALTER TABLE notification_jobs ADD COLUMN IF NOT EXISTS delivery_mode TEXT NOT NULL DEFAULT 'email' CHECK(delivery_mode IN ('email','preview'));
UPDATE broker_leads l SET is_test=1 FROM broker_campaigns c WHERE l.campaign_id=c.id AND (c.is_test=1 OR c.paypal_mode='sandbox') AND l.is_test=0;
-- Keep an accurate record of older test messages that were really emailed.
UPDATE notification_jobs n SET is_test=1,delivery_mode=CASE WHEN status='sent' AND sent_at IS NOT NULL THEN delivery_mode ELSE 'preview' END WHERE n.is_test=0 AND (EXISTS(SELECT 1 FROM broker_campaigns c WHERE c.id=n.campaign_id AND (c.is_test=1 OR c.paypal_mode='sandbox')) OR EXISTS(SELECT 1 FROM broker_leads l WHERE l.id=n.lead_id AND l.is_test=1));
DROP INDEX IF EXISTS broker_leads_submission_idx;
CREATE UNIQUE INDEX IF NOT EXISTS broker_leads_submission_mode_idx ON broker_leads(broker_id,is_test,submission_key);
CREATE INDEX IF NOT EXISTS broker_leads_mode_inbox_idx ON broker_leads(broker_id,is_test,created_at DESC);
CREATE INDEX IF NOT EXISTS notification_jobs_mode_idx ON notification_jobs(is_test,status,created_at DESC);
CREATE INDEX IF NOT EXISTS notification_jobs_preview_broker_idx ON notification_jobs(broker_id,created_at DESC) WHERE delivery_mode='preview';

ALTER TABLE broker_invoices ADD COLUMN IF NOT EXISTS email_previewed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS broker_sandbox_campaign_drafts (broker_id INTEGER PRIMARY KEY REFERENCES brokers(id),revision INTEGER NOT NULL DEFAULT 0,data JSONB NOT NULL DEFAULT '{}',updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

ALTER TABLE brokers ADD COLUMN IF NOT EXISTS sandbox_billing_address JSONB;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS sandbox_billing_confirmed_at TIMESTAMPTZ;
