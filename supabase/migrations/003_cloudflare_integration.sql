-- Cloudflare API Integration Migration
-- Adds support for syncing deployments from Cloudflare Pages

-- Add Cloudflare fields to user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS cloudflare_token TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS cloudflare_account_id TEXT;

-- Add Cloudflare project ID to applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cloudflare_project_name TEXT;

-- Index for lookup by Cloudflare project
CREATE INDEX IF NOT EXISTS idx_applications_cloudflare_project ON applications(cloudflare_project_name)
    WHERE cloudflare_project_name IS NOT NULL;
