-- Add Firstaru server credential columns to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS firstaru_m3u_url TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS firstaru_credentials_username TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS firstaru_credentials_password TEXT;
