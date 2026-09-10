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
