-- Add GitHub fields to user_settings
alter table user_settings
  add column if not exists github_token text,
  add column if not exists github_username text;

-- Add GitHub repo name to applications
alter table applications
  add column if not exists github_repo_name text;
