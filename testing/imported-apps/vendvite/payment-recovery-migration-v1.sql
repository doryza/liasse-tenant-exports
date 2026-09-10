-- Durable PayPal attempts and cross-process leases; monetary snapshots are unchanged.
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS payment_recovery JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS payment_check_after TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS payment_lease_until TIMESTAMPTZ;
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS payment_lease_token TEXT;
CREATE INDEX IF NOT EXISTS broker_campaigns_payment_recovery_due ON broker_campaigns(payment_check_after) WHERE kind='paid';
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS checkout_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS broker_campaigns_pending_checkout ON broker_campaigns(broker_id,checkout_key) WHERE kind='paid' AND payment_status='pending' AND checkout_key IS NOT NULL;
