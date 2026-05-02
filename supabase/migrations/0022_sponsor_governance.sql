create table if not exists public.sponsor_partners (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sponsor_name text not null,
  short_name text,
  industry text,
  logo_text text,
  logo_url text,
  theme_color text,
  contribution_label text,
  visibility_level text not null default 'standard',
  active_from date,
  active_to date,
  status text not null default 'active',
  created_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsor_exposure_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  primary_sponsor_id uuid references public.sponsor_partners(id) on delete set null,
  enabled boolean not null default false,
  exposure_level text not null default 'subtle',
  placements jsonb not null default '{}'::jsonb,
  disclosure_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create table if not exists public.sponsor_exposure_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sponsor_id uuid references public.sponsor_partners(id) on delete set null,
  actor_account_id uuid references public.accounts(id),
  action text not null,
  placement_key text,
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sponsor_partners_workspace
on public.sponsor_partners(workspace_id, status);

create index if not exists idx_sponsor_exposure_logs_workspace
on public.sponsor_exposure_logs(workspace_id, created_at desc);

alter table public.sponsor_partners enable row level security;
alter table public.sponsor_exposure_settings enable row level security;
alter table public.sponsor_exposure_logs enable row level security;

create policy "workspace members can read sponsor partners"
on public.sponsor_partners for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read sponsor exposure settings"
on public.sponsor_exposure_settings for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read sponsor exposure logs"
on public.sponsor_exposure_logs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can manage sponsor partners"
on public.sponsor_partners for all
using (public.is_active_workspace_member(workspace_id))
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can manage sponsor exposure settings"
on public.sponsor_exposure_settings for all
using (public.is_active_workspace_member(workspace_id))
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create sponsor exposure logs"
on public.sponsor_exposure_logs for insert
with check (public.is_active_workspace_member(workspace_id));
