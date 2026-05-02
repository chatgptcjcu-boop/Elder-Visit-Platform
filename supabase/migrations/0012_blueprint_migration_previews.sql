create table if not exists public.blueprint_migration_previews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  blueprint_id uuid references public.platform_blueprints(id),
  from_version text not null,
  to_version text not null,
  status text not null default 'preview_only',
  can_auto_apply boolean not null default false,
  impacts jsonb not null default '[]'::jsonb,
  required_approvals jsonb not null default '[]'::jsonb,
  generated_by uuid references public.accounts(id),
  generated_at timestamptz not null default now()
);

create index if not exists idx_blueprint_migration_previews_workspace
on public.blueprint_migration_previews(workspace_id, generated_at desc);

alter table public.blueprint_migration_previews enable row level security;

create policy "workspace members can read blueprint migration previews"
on public.blueprint_migration_previews for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create blueprint migration previews"
on public.blueprint_migration_previews for insert
with check (public.is_active_workspace_member(workspace_id));
