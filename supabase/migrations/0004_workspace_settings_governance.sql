create index idx_workspace_settings_workspace on public.workspace_settings(workspace_id);
create index idx_workspace_responsibility_workspace on public.workspace_responsibility(workspace_id);
create index idx_log_retention_workspace on public.log_retention_policies(workspace_id, entity_type);

alter table public.workspace_settings
  add column if not exists settings_version int not null default 1;

alter table public.workspace_responsibility
  add column if not exists updated_by uuid references public.accounts(id);

create table if not exists public.workspace_soft_delete_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  deleted_by uuid references public.accounts(id),
  deleted_at timestamptz not null default now(),
  restore_deadline timestamptz not null,
  reason text,
  restored_at timestamptz,
  restored_by uuid references public.accounts(id),
  created_at timestamptz not null default now()
);

alter table public.workspace_soft_delete_events enable row level security;

create policy "workspace members can read soft delete events"
on public.workspace_soft_delete_events for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace managers can insert soft delete events"
on public.workspace_soft_delete_events for insert
with check (public.is_active_workspace_member(workspace_id));
