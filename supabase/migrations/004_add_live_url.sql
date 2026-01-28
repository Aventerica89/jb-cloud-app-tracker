-- Add live_url column to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS live_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_live_url ON applications(live_url) WHERE live_url IS NOT NULL;
