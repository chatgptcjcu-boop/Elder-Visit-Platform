create table if not exists public.payment_locks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  payment_record_id uuid,
  locked_by uuid references public.accounts(id),
  locked_at timestamptz not null default now(),
  total_fee numeric not null default 0,
  export_ready boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_payment_locks_workspace
on public.payment_locks(workspace_id, locked_at desc);

alter table public.payment_locks enable row level security;

create policy "workspace members can read payment locks"
on public.payment_locks for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create payment locks"
on public.payment_locks for insert
with check (public.is_active_workspace_member(workspace_id));
