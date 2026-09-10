ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS production JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS agent_page_activity (
 token_hash TEXT PRIMARY KEY, visitor_hash TEXT NOT NULL, agent_id INTEGER REFERENCES solicitation_agents(id), broker_id INTEGER REFERENCES brokers(id),
 kind TEXT NOT NULL CHECK(kind IN ('invitation','mailer')), first_seen_at TIMESTAMPTZ, last_seen_at TIMESTAMPTZ, active BOOLEAN NOT NULL DEFAULT false, issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_page_activity_agent ON agent_page_activity(agent_id,last_seen_at);
CREATE INDEX IF NOT EXISTS agent_page_activity_broker ON agent_page_activity(broker_id,last_seen_at);
CREATE INDEX IF NOT EXISTS agent_page_activity_recent ON agent_page_activity(last_seen_at) WHERE first_seen_at IS NOT NULL;
