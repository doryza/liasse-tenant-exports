ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS history_policy JSONB NOT NULL DEFAULT '{"mode":"off"}'::jsonb;
CREATE TABLE IF NOT EXISTS production_broker_locks (
 broker_id INTEGER PRIMARY KEY REFERENCES brokers(id),
 owner TEXT NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL
);
