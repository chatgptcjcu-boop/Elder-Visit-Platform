create extension if not exists pgcrypto;

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  full_name text,
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  unit_name text not null,
  unit_type text,
  city text,
  district text,
  logo_url text,
  theme_color text,
  status text not null default 'active',
  created_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.unit_memberships (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  role_name text not null,
  status text not null default 'active',
  joined_at timestamptz,
  invited_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, account_id)
);

create table public.platform_blueprints (
  id uuid primary key default gen_random_uuid(),
  blueprint_name text not null,
  blueprint_type text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_name text not null,
  workspace_type text,
  blueprint_id uuid references public.platform_blueprints(id),
  status text not null default 'draft',
  created_by uuid references public.accounts(id),
  deleted_at timestamptz,
  deleted_by uuid references public.accounts(id),
  restore_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  role_name text not null,
  capabilities jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, account_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  email text not null,
  invited_role text not null,
  invite_token text unique not null,
  status text not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workspace_logo text,
  workspace_theme_color text,
  enabled_modules jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create table public.workspace_blueprint_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  blueprint_id uuid not null references public.platform_blueprints(id),
  applied_at timestamptz not null default now(),
  applied_by uuid references public.accounts(id),
  config_snapshot jsonb not null default '{}'::jsonb
);

create table public.workspace_activity_logs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_account_id uuid references public.accounts(id),
  action_key text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.consent_forms (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid,
  visit_id uuid,
  signed boolean not null default false,
  signature_type text,
  signature_url text,
  signed_date date,
  consent_scope jsonb not null default '[]'::jsonb,
  consent_expiry_date date,
  revoked boolean not null default false,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.effective_permissions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  permissions jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (account_id, workspace_id)
);

create index idx_unit_memberships_account on public.unit_memberships(account_id);
create index idx_workspace_memberships_account on public.workspace_memberships(account_id);
create index idx_workspaces_unit on public.workspaces(unit_id);
create index idx_workspace_logs_workspace on public.workspace_activity_logs(workspace_id, created_at desc);

alter table public.accounts enable row level security;
alter table public.units enable row level security;
alter table public.unit_memberships enable row level security;
alter table public.platform_blueprints enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.workspace_blueprint_history enable row level security;
alter table public.workspace_activity_logs enable row level security;
alter table public.consent_forms enable row level security;
alter table public.effective_permissions enable row level security;

create or replace function public.current_account_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
  from public.accounts
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_active_unit_member(target_unit_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.unit_memberships
    where unit_id = target_unit_id
      and account_id = public.current_account_id()
      and status = 'active'
  )
$$;

create or replace function public.is_active_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_memberships
    where workspace_id = target_workspace_id
      and account_id = public.current_account_id()
      and status = 'active'
  )
$$;

create policy "accounts can read self"
on public.accounts for select
using (auth.uid() = auth_user_id);

create policy "accounts can update self"
on public.accounts for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

create policy "members can read their units"
on public.units for select
using (public.is_active_unit_member(id));

create policy "members can read unit memberships"
on public.unit_memberships for select
using (public.is_active_unit_member(unit_id));

create policy "active blueprints are readable"
on public.platform_blueprints for select
using (is_active = true);

create policy "members can read their workspaces"
on public.workspaces for select
using (
  deleted_at is null
  and public.is_active_workspace_member(id)
);

create policy "workspace members can read memberships"
on public.workspace_memberships for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read settings"
on public.workspace_settings for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read blueprint history"
on public.workspace_blueprint_history for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read activity logs"
on public.workspace_activity_logs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read consent forms"
on public.consent_forms for select
using (public.is_active_workspace_member(workspace_id));

create policy "users can read effective permissions"
on public.effective_permissions for select
using (account_id = public.current_account_id());
