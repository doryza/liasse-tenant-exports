-- =====================================================================
-- Idempotent schema migrations replayed on every Push to Live.
-- Postgres' ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS make
-- this safe to re-run.
-- =====================================================================

-- Link a soumission/contact submission back to the platform tenant user
-- who created it (when authenticated). Lets /mon-compte filter submissions
-- per visitor without leaking other people's requests.
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS user_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON contact_submissions(user_id);

-- Sales-team feature: admin invites a sales person, the invitee activates
-- via OTP that must match the email or mobile the admin entered, and the
-- sales person then sees a dedicated dashboard listing soumissions admin
-- has assigned to them.
--
-- sales_team_members holds the admin-entered contact + the activation
-- state. user_id is null until the invitee completes activation, at which
-- point it links to the regular tenant users.id row their OTP created.
-- The unique index on invite_token makes the magic-link lookup O(1) and
-- prevents collisions when the random token is regenerated on resend.
CREATE TABLE IF NOT EXISTS sales_team_members (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  mobile TEXT,
  title TEXT,
  invite_token TEXT NOT NULL,
  invite_sent_at TIMESTAMPTZ DEFAULT NOW(),
  invite_accepted_at TIMESTAMPTZ,
  user_id INTEGER,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_team_invite_token ON sales_team_members(invite_token);
CREATE INDEX IF NOT EXISTS idx_sales_team_user_id ON sales_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_team_email_lower ON sales_team_members((LOWER(email)));

-- Per-soumission assignment. assigned_to_sales_id references
-- sales_team_members.id; null means unassigned (admin still owns it).
-- assigned_at is captured for audit + sorting newest-assigned-first on
-- the sales dashboard.
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS assigned_to_sales_id INTEGER;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_contact_submissions_assigned_to_sales ON contact_submissions(assigned_to_sales_id);
