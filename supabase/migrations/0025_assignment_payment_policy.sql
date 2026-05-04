alter table public.elder_cases
  add column if not exists village text,
  add column if not exists required_visitor_types jsonb not null default '[]'::jsonb,
  add column if not exists co_visit_required boolean not null default false;

alter table public.visit_schedule
  add column if not exists co_visitor_id uuid references public.visitors(id) on delete set null,
  add column if not exists closure_policy text,
  add column if not exists can_close_after_attempt int not null default 3;

alter table public.visit_records
  add column if not exists missed_visit_sequence int,
  add column if not exists closure_reason text,
  add column if not exists closure_confirmed_by uuid references public.accounts(id) on delete set null,
  add column if not exists closure_confirmed_at timestamptz;

alter table public.visitors
  add column if not exists worker_type text not null default 'general',
  add column if not exists village_coverage jsonb not null default '[]'::jsonb,
  add column if not exists certificate_status text not null default 'missing',
  add column if not exists bank_account_last5 text,
  add column if not exists remittance_ready boolean not null default false;

alter table public.visitor_profiles
  add column if not exists worker_type text not null default 'general',
  add column if not exists village_coverage jsonb not null default '[]'::jsonb,
  add column if not exists visitor_certificate_no text,
  add column if not exists certificate_status text not null default 'missing',
  add column if not exists training_date date,
  add column if not exists bank_account_last5 text,
  add column if not exists remittance_ready boolean not null default false;

alter table public.payment_batch_items
  add column if not exists visit_fee numeric not null default 0,
  add column if not exists data_processing_fee numeric not null default 0;

create table if not exists public.payment_fee_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  rule_code text not null,
  visit_fee numeric not null default 180,
  data_processing_fee numeric not null default 30,
  currency text not null default 'TWD',
  effective_from date not null default current_date,
  effective_to date,
  status text not null default 'active',
  review_note text,
  created_by uuid references public.accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, rule_code, effective_from)
);

create index if not exists idx_elder_cases_village
on public.elder_cases(workspace_id, district, village);

create index if not exists idx_visitors_worker_type
on public.visitors(workspace_id, worker_type, certificate_status, remittance_ready);

create index if not exists idx_payment_fee_rules_workspace
on public.payment_fee_rules(workspace_id, status, effective_from desc);

alter table public.payment_fee_rules enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'visitor_profiles'
      and policyname = 'workspace members can create visitor profiles'
  ) then
    create policy "workspace members can create visitor profiles"
    on public.visitor_profiles for insert
    with check (public.is_active_workspace_member(workspace_id));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'visitor_profiles'
      and policyname = 'workspace members can update visitor profiles'
  ) then
    create policy "workspace members can update visitor profiles"
    on public.visitor_profiles for update
    using (public.is_active_workspace_member(workspace_id))
    with check (public.is_active_workspace_member(workspace_id));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'visitor_profiles'
      and policyname = 'workspace members can delete visitor profiles'
  ) then
    create policy "workspace members can delete visitor profiles"
    on public.visitor_profiles for delete
    using (public.is_active_workspace_member(workspace_id));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_fee_rules'
      and policyname = 'workspace members can read payment fee rules'
  ) then
    create policy "workspace members can read payment fee rules"
    on public.payment_fee_rules for select
    using (public.is_active_workspace_member(workspace_id));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_fee_rules'
      and policyname = 'workspace members can create payment fee rules'
  ) then
    create policy "workspace members can create payment fee rules"
    on public.payment_fee_rules for insert
    with check (public.is_active_workspace_member(workspace_id));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_fee_rules'
      and policyname = 'workspace members can update payment fee rules'
  ) then
    create policy "workspace members can update payment fee rules"
    on public.payment_fee_rules for update
    using (public.is_active_workspace_member(workspace_id))
    with check (public.is_active_workspace_member(workspace_id));
  end if;
end $$;
