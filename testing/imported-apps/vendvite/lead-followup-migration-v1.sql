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
