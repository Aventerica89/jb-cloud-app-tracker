-- Add display_name column to applications table
-- Allows users to set a custom display name different from the repo/project name
ALTER TABLE applications ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add comment
COMMENT ON COLUMN applications.display_name IS 'Optional custom display name. When set, shown as primary name with original name shown as secondary.';
