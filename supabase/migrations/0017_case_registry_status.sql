create table if not exists public.case_status_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid references public.accounts(id),
  changed_at timestamptz not null default now()
);

create index if not exists idx_case_status_logs_workspace
on public.case_status_logs(workspace_id, changed_at desc);

alter table public.case_status_logs enable row level security;

create policy "workspace members can read case status logs"
on public.case_status_logs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create case status logs"
on public.case_status_logs for insert
with check (public.is_active_workspace_member(workspace_id));
