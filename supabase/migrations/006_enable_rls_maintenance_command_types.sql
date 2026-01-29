-- Enable RLS on maintenance_command_types table
ALTER TABLE maintenance_command_types ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view maintenance command types (read-only reference data)
CREATE POLICY "Anyone can view maintenance command types"
  ON maintenance_command_types
  FOR SELECT
  USING (true);
