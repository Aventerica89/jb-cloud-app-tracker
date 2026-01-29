-- Create maintenance_command_types table (reference/shared data)
CREATE TABLE maintenance_command_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  recommended_frequency_days INT NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#3b82f6',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed maintenance command types
INSERT INTO maintenance_command_types (name, slug, description, recommended_frequency_days, icon, color, sort_order) VALUES
  ('Security Review', 'security', 'Security audit and vulnerability scan', 7, 'Shield', '#ef4444', 1),
  ('Code Review', 'code-review', 'Code quality and best practices review', 30, 'Code', '#3b82f6', 2),
  ('Architecture Review', 'structure', 'Architecture and file organization review', 90, 'Building', '#8b5cf6', 3),
  ('Test Coverage', 'test-coverage', 'Test coverage analysis', 30, 'TestTube', '#10b981', 4),
  ('Dependency Updates', 'dependencies', 'Dependency updates and security patches', 7, 'Package', '#f59e0b', 5),
  ('Performance Audit', 'performance', 'Performance profiling and optimization', 90, 'Zap', '#ec4899', 6);

-- Create maintenance_runs table (user-owned data)
CREATE TABLE maintenance_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  command_type_id UUID NOT NULL REFERENCES maintenance_command_types(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'completed',
  results JSONB,
  notes TEXT,
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for maintenance_runs (optimized)
CREATE INDEX idx_maintenance_runs_application_id ON maintenance_runs(application_id);
CREATE INDEX idx_maintenance_runs_command_type_id ON maintenance_runs(command_type_id);
CREATE INDEX idx_maintenance_runs_run_at ON maintenance_runs(run_at DESC);
-- Composite index for "latest run per command type" queries (critical for performance)
CREATE INDEX idx_maintenance_runs_app_command_run ON maintenance_runs(application_id, command_type_id, run_at DESC);

-- Enable RLS on maintenance_runs
ALTER TABLE maintenance_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (check ownership through application, not user_id)
CREATE POLICY "Users can view maintenance runs for their applications"
  ON maintenance_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = maintenance_runs.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create maintenance runs for their applications"
  ON maintenance_runs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = maintenance_runs.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update maintenance runs for their applications"
  ON maintenance_runs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = maintenance_runs.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete maintenance runs for their applications"
  ON maintenance_runs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = maintenance_runs.application_id
      AND applications.user_id = auth.uid()
    )
  );
