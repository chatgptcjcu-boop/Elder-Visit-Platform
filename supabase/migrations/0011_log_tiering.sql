alter table public.log_retention_policies
  add column if not exists tier text not null default 'active',
  add column if not exists contains_personal_data boolean not null default false,
  add column if not exists estimated_rows bigint not null default 0;

alter table public.archived_logs
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists archive_tier text not null default 'warm_archive',
  add column if not exists purge_after timestamptz,
  add column if not exists contains_personal_data boolean not null default false;

create index if not exists idx_log_retention_tier
on public.log_retention_policies(workspace_id, tier);

create index if not exists idx_archived_logs_workspace_tier
on public.archived_logs(workspace_id, archive_tier, archived_at desc);

create index if not exists idx_archived_logs_purge
on public.archived_logs(purge_after)
where purge_after is not null;
