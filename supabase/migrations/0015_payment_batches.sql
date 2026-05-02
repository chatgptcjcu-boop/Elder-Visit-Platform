create table if not exists public.payment_batches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  batch_no text not null,
  status text not null default 'draft',
  item_count int not null default 0,
  total_amount numeric not null default 0,
  warnings jsonb not null default '[]'::jsonb,
  created_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  exported_at timestamptz,
  unique (workspace_id, batch_no)
);

create table if not exists public.payment_batch_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  batch_id uuid not null references public.payment_batches(id) on delete cascade,
  payment_lock_id uuid references public.payment_locks(id) on delete set null,
  case_code text,
  elder_name text,
  total_fee numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_batches_workspace
on public.payment_batches(workspace_id, created_at desc);

create index if not exists idx_payment_batch_items_batch
on public.payment_batch_items(batch_id);

alter table public.payment_batches enable row level security;
alter table public.payment_batch_items enable row level security;

create policy "workspace members can read payment batches"
on public.payment_batches for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create payment batches"
on public.payment_batches for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read payment batch items"
on public.payment_batch_items for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create payment batch items"
on public.payment_batch_items for insert
with check (public.is_active_workspace_member(workspace_id));
