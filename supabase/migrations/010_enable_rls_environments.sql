-- Enable RLS on environments table (was missed in initial schema)
-- Fixes Supabase Security Advisor warning
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend only, no anon access needed)
CREATE POLICY "Allow service role full access"
  ON environments
  FOR ALL
  USING (true)
  WITH CHECK (true);
