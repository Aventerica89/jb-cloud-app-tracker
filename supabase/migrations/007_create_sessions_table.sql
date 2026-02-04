-- Create session_source enum
CREATE TYPE session_source AS ENUM ('claude-code', 'claude-ai', 'mixed');

-- Create claude_sessions table (user-owned data through application)
CREATE TABLE claude_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  -- Session timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INT,

  -- Git context
  starting_branch TEXT,
  ending_branch TEXT,
  commits_count INT DEFAULT 0,

  -- Claude context
  context_id TEXT,
  session_source session_source DEFAULT 'claude-code',

  -- Token usage metrics
  tokens_input INT,
  tokens_output INT,
  tokens_total INT,

  -- Content
  summary TEXT,
  accomplishments JSONB DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  files_changed JSONB DEFAULT '[]'::jsonb,

  -- Maintenance integration
  maintenance_runs JSONB DEFAULT '[]'::jsonb,
  security_findings JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for claude_sessions
CREATE INDEX idx_sessions_application_id ON claude_sessions(application_id);
CREATE INDEX idx_sessions_started_at ON claude_sessions(started_at DESC);
CREATE INDEX idx_sessions_context_id ON claude_sessions(context_id);
-- Composite index for "sessions by app sorted by date" queries
CREATE INDEX idx_sessions_app_date ON claude_sessions(application_id, started_at DESC);

-- Enable RLS on claude_sessions
ALTER TABLE claude_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (check ownership through application)
CREATE POLICY "Users can view sessions for their applications"
  ON claude_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = claude_sessions.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions for their applications"
  ON claude_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = claude_sessions.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sessions for their applications"
  ON claude_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = claude_sessions.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sessions for their applications"
  ON claude_sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = claude_sessions.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER update_claude_sessions_updated_at
  BEFORE UPDATE ON claude_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE claude_sessions IS 'Tracks Claude Code development sessions linked to applications';
COMMENT ON COLUMN claude_sessions.context_id IS 'Links to ~/.claude/contexts/{id}.md file';
COMMENT ON COLUMN claude_sessions.session_source IS 'Where the session ran: claude-code, claude-ai, or mixed';
COMMENT ON COLUMN claude_sessions.maintenance_runs IS 'Array of maintenance run IDs created during this session';
COMMENT ON COLUMN claude_sessions.security_findings IS 'Auto-captured security findings from /security command';
