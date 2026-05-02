create table if not exists public.workspace_roles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role_key text not null,
  role_label text not null,
  description text,
  capabilities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, role_key)
);

create table if not exists public.workspace_permission_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_account_id uuid references public.accounts(id),
  target_account_id uuid references public.accounts(id),
  action text not null,
  before_role text,
  after_role text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_workspace_roles_workspace
on public.workspace_roles(workspace_id, role_key);

create index if not exists idx_workspace_permission_logs_workspace
on public.workspace_permission_logs(workspace_id, created_at desc);

alter table public.workspace_roles enable row level security;
alter table public.workspace_permission_logs enable row level security;

create policy "workspace members can read roles"
on public.workspace_roles for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read permission logs"
on public.workspace_permission_logs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace managers can create permission logs"
on public.workspace_permission_logs for insert
with check (public.is_active_workspace_member(workspace_id));
