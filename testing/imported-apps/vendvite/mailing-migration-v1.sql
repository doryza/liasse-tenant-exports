
-- Mailing-service offer and agent acquisition campaigns (generation 68+).
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS access_plan TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE broker_campaigns ADD COLUMN IF NOT EXISTS mailing_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS broker_campaigns_mailing_token ON broker_campaigns(mailing_token) WHERE mailing_token IS NOT NULL;
CREATE TABLE IF NOT EXISTS solicitation_campaigns(id SERIAL PRIMARY KEY,name TEXT NOT NULL,format TEXT NOT NULL DEFAULT 'duplex',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS solicitation_agents(id SERIAL PRIMARY KEY,campaign_id INTEGER NOT NULL REFERENCES solicitation_campaigns(id),tag TEXT UNIQUE NOT NULL,name TEXT NOT NULL,agency TEXT NOT NULL DEFAULT '',title TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',photo_url TEXT NOT NULL DEFAULT '',address1 TEXT NOT NULL,address2 TEXT NOT NULL,broker_id INTEGER REFERENCES brokers(id),visits INTEGER NOT NULL DEFAULT 0,last_visited_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS solicitation_agents_campaign ON solicitation_agents(campaign_id);
CREATE TABLE IF NOT EXISTS mailing_signup_limits(key TEXT PRIMARY KEY,last_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
