-- App Todos
create table app_todos (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_app_todos_application on app_todos(application_id);
create index idx_app_todos_user on app_todos(user_id);

alter table app_todos enable row level security;

create policy "Users can view their own todos"
  on app_todos for select
  using (user_id = auth.uid());

create policy "Users can create their own todos"
  on app_todos for insert
  with check (user_id = auth.uid());

create policy "Users can update their own todos"
  on app_todos for update
  using (user_id = auth.uid());

create policy "Users can delete their own todos"
  on app_todos for delete
  using (user_id = auth.uid());

-- App Notes
create table app_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_app_notes_application on app_notes(application_id);
create index idx_app_notes_user on app_notes(user_id);

alter table app_notes enable row level security;

create policy "Users can view their own notes"
  on app_notes for select
  using (user_id = auth.uid());

create policy "Users can create their own notes"
  on app_notes for insert
  with check (user_id = auth.uid());

create policy "Users can update their own notes"
  on app_notes for update
  using (user_id = auth.uid());

create policy "Users can delete their own notes"
  on app_notes for delete
  using (user_id = auth.uid());

-- Auto-update updated_at trigger for notes
create trigger update_app_notes_updated_at
  before update on app_notes
  for each row
  execute function update_updated_at();
