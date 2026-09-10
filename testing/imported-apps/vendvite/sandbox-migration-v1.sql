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
