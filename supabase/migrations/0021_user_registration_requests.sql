create table if not exists public.workspace_registration_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) on delete cascade,
  email text not null,
  full_name text not null,
  requested_unit_name text,
  requested_workspace_id uuid references public.workspaces(id) on delete set null,
  requested_role_key text not null,
  status text not null default 'pending_workspace_review',
  review_note text,
  reviewed_by uuid references public.accounts(id),
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_workspace_registration_requests_workspace
on public.workspace_registration_requests(requested_workspace_id, submitted_at desc);

create index if not exists idx_workspace_registration_requests_status
on public.workspace_registration_requests(status, submitted_at desc);

alter table public.workspace_registration_requests enable row level security;

create policy "workspace members can read registration requests"
on public.workspace_registration_requests for select
using (
  requested_workspace_id is not null
  and public.is_active_workspace_member(requested_workspace_id)
);

create policy "workspace members can update registration requests"
on public.workspace_registration_requests for update
using (
  requested_workspace_id is not null
  and public.is_active_workspace_member(requested_workspace_id)
);
