create table public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid references public.elder_cases(id) on delete set null,
  visit_id uuid references public.visit_records(id) on delete set null,
  incident_type text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  description text,
  created_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  template_name text not null,
  channel text not null,
  subject_template text,
  body_template text not null,
  variables jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_rules (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  event_key text not null,
  template_id uuid not null references public.notification_templates(id) on delete cascade,
  conditions jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipient_account_id uuid references public.accounts(id) on delete set null,
  event_key text not null,
  channel text not null,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.incident_reports enable row level security;
alter table public.notification_templates enable row level security;
alter table public.notification_rules enable row level security;
alter table public.notification_logs enable row level security;

create policy "workspace members can read incidents"
on public.incident_reports for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can insert incidents"
on public.incident_reports for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read notification templates"
on public.notification_templates for select
using (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can read notification rules"
on public.notification_rules for select
using (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can read notification logs"
on public.notification_logs for select
using (public.is_active_workspace_member(workspace_id));
