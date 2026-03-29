-- PlayBoard Database Schema
-- Run this in the Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Tables
-- ============================================================

create table team_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  avatar_url text,
  created_at timestamptz default now()
);

create table labels (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo','in_progress','in_review','done')),
  priority text not null default 'normal'
    check (priority in ('low','normal','high')),
  due_date date,
  position integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table task_assignees (
  task_id uuid references tasks(id) on delete cascade,
  member_id uuid references team_members(id) on delete cascade,
  primary key (task_id, member_id)
);

create table task_labels (
  task_id uuid references tasks(id) on delete cascade,
  label_id uuid references labels(id) on delete cascade,
  primary key (task_id, label_id)
);

create table comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table activity_log (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table tasks enable row level security;
alter table team_members enable row level security;
alter table labels enable row level security;
alter table comments enable row level security;
alter table activity_log enable row level security;
alter table task_assignees enable row level security;
alter table task_labels enable row level security;

-- Optimized RLS policies: (select auth.uid()) avoids per-row re-evaluation
create policy "Users own their tasks"
  on tasks for all using ((select auth.uid()) = user_id);

create policy "Users own their team members"
  on team_members for all using ((select auth.uid()) = user_id);

create policy "Users own their labels"
  on labels for all using ((select auth.uid()) = user_id);

create policy "Users own their comments"
  on comments for all using ((select auth.uid()) = user_id);

create policy "Users own their activity"
  on activity_log for all using ((select auth.uid()) = user_id);

create policy "task_assignees via task owner"
  on task_assignees for all using (
    exists (select 1 from tasks where tasks.id = task_id
            and tasks.user_id = (select auth.uid()))
  );

create policy "task_labels via task owner"
  on task_labels for all using (
    exists (select 1 from tasks where tasks.id = task_id
            and tasks.user_id = (select auth.uid()))
  );

-- ============================================================
-- Trigger: auto-update updated_at
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = '';

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- ============================================================
-- Performance indexes
-- ============================================================

create index tasks_user_id_status_idx on tasks(user_id, status);
create index tasks_due_date_idx on tasks(due_date) where due_date is not null;
create index comments_task_id_idx on comments(task_id);
create index comments_user_id_idx on comments(user_id);
create index activity_log_task_id_idx on activity_log(task_id);
create index activity_log_user_id_idx on activity_log(user_id);
create index task_assignees_task_id_idx on task_assignees(task_id);
create index task_assignees_member_id_idx on task_assignees(member_id);
create index task_labels_task_id_idx on task_labels(task_id);
create index task_labels_label_id_idx on task_labels(label_id);
create index labels_user_id_idx on labels(user_id);
create index team_members_user_id_idx on team_members(user_id);
