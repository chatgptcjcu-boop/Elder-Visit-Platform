create table if not exists public.visitor_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  full_name text not null,
  district_coverage jsonb not null default '[]'::jsonb,
  active_task_count int not null default 0,
  max_daily_tasks int not null default 0,
  trained_modules jsonb not null default '[]'::jsonb,
  status text not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid,
  visit_schedule_id uuid,
  visitor_profile_id uuid references public.visitor_profiles(id) on delete set null,
  score int not null default 0,
  status text not null default 'recommended',
  reasons jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  confirmed_by uuid references public.accounts(id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_visitor_profiles_workspace
on public.visitor_profiles(workspace_id, status);

create index if not exists idx_assignment_recommendations_workspace
on public.assignment_recommendations(workspace_id, created_at desc);

alter table public.visitor_profiles enable row level security;
alter table public.assignment_recommendations enable row level security;

create policy "workspace members can read visitor profiles"
on public.visitor_profiles for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read assignment recommendations"
on public.assignment_recommendations for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create assignment recommendations"
on public.assignment_recommendations for insert
with check (public.is_active_workspace_member(workspace_id));
