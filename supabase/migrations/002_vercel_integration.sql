-- Vercel API Integration Migration
-- Adds support for syncing deployments from Vercel

-- 1. User settings for API tokens
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    vercel_token TEXT,
    vercel_team_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger for user_settings
CREATE TRIGGER user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- RLS for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
    ON user_settings FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Add Vercel project ID to applications
ALTER TABLE applications ADD COLUMN vercel_project_id TEXT;

-- Index for lookup by Vercel project
CREATE INDEX idx_applications_vercel_project ON applications(vercel_project_id)
    WHERE vercel_project_id IS NOT NULL;

-- 3. Add external ID to deployments for deduplication
ALTER TABLE deployments ADD COLUMN external_id TEXT;

-- Unique constraint: one external deployment per application
CREATE UNIQUE INDEX idx_deployments_external_id
    ON deployments(application_id, external_id)
    WHERE external_id IS NOT NULL;
