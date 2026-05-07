-- placeholder for future column additions

-- === voice-module-v1 START ===
CREATE TABLE IF NOT EXISTS voice_submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER,
  fields JSONB NOT NULL,
  language TEXT,
  voice_session_id TEXT,
  status TEXT DEFAULT 'new',
  assigned_to_sales_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_voice_submissions_status ON voice_submissions (status);
CREATE INDEX IF NOT EXISTS idx_voice_submissions_created ON voice_submissions (created_at DESC);
-- === voice-module-v1 END ===
