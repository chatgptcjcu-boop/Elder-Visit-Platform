create table if not exists public.visitor_badges (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  visitor_profile_id uuid not null references public.visitor_profiles(id) on delete cascade,
  visitor_code text not null,
  badge_number text not null,
  badge_serial text not null,
  claim_token_hash text not null,
  status text not null default 'active',
  valid_from date not null default current_date,
  valid_until date,
  issued_at timestamptz not null default now(),
  issued_by uuid references public.accounts(id) on delete set null,
  printed_at timestamptz,
  claimed_at timestamptz,
  revoked_at timestamptz,
  qr_code_payload text not null,
  badge_snapshot jsonb not null default '{}'::jsonb,
  badge_image_url text,
  badge_pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_visitor_badges_badge_number
on public.visitor_badges(badge_number);

create unique index if not exists idx_visitor_badges_claim_token_hash
on public.visitor_badges(claim_token_hash);

create unique index if not exists idx_visitor_badges_active_profile
on public.visitor_badges(visitor_profile_id)
where status = 'active';

create index if not exists idx_visitor_badges_workspace_status
on public.visitor_badges(workspace_id, status, issued_at desc);

create index if not exists idx_visitor_badges_visitor_code
on public.visitor_badges(visitor_code);

alter table public.visitor_badges enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'visitor_badges'
      and policyname = 'workspace members can read visitor badges'
  ) then
    create policy "workspace members can read visitor badges"
    on public.visitor_badges for select
    using (public.is_active_workspace_member(workspace_id));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'visitor_badges'
      and policyname = 'workspace managers can insert visitor badges'
  ) then
    create policy "workspace managers can insert visitor badges"
    on public.visitor_badges for insert
    with check (public.is_active_workspace_member(workspace_id));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'visitor_badges'
      and policyname = 'workspace managers can update visitor badges'
  ) then
    create policy "workspace managers can update visitor badges"
    on public.visitor_badges for update
    using (public.is_active_workspace_member(workspace_id))
    with check (public.is_active_workspace_member(workspace_id));
  end if;
end $$;
