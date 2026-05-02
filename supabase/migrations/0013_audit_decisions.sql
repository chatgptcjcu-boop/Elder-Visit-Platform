create table if not exists public.audit_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  audit_record_id uuid,
  visit_record_id uuid,
  decision text not null,
  supervisor_note text,
  override_warnings boolean not null default false,
  decided_by uuid references public.accounts(id),
  decided_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_audit_decisions_workspace
on public.audit_decisions(workspace_id, decided_at desc);

alter table public.audit_decisions enable row level security;

create policy "workspace members can read audit decisions"
on public.audit_decisions for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create audit decisions"
on public.audit_decisions for insert
with check (public.is_active_workspace_member(workspace_id));
