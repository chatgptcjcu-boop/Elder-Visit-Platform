create table if not exists public.incident_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  incident_report_id uuid,
  action text not null,
  note text,
  notification_preview text,
  handled_by uuid references public.accounts(id),
  handled_at timestamptz not null default now()
);

create index if not exists idx_incident_decisions_workspace
on public.incident_decisions(workspace_id, handled_at desc);

alter table public.incident_decisions enable row level security;

create policy "workspace members can read incident decisions"
on public.incident_decisions for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create incident decisions"
on public.incident_decisions for insert
with check (public.is_active_workspace_member(workspace_id));
