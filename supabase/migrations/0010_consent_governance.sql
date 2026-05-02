create table if not exists public.consent_usage_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  consent_form_id uuid references public.consent_forms(id) on delete set null,
  actor_account_id uuid references public.accounts(id),
  purpose text not null,
  entity_type text not null,
  entity_id uuid,
  personal_data_included boolean not null default false,
  redacted_columns jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_consent_forms_workspace_case
on public.consent_forms(workspace_id, case_id);

create index if not exists idx_consent_forms_expiry
on public.consent_forms(workspace_id, consent_expiry_date)
where revoked = false;

create index if not exists idx_consent_usage_logs_workspace
on public.consent_usage_logs(workspace_id, created_at desc);

alter table public.consent_usage_logs enable row level security;

create policy "workspace members can read consent usage logs"
on public.consent_usage_logs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create consent usage logs"
on public.consent_usage_logs for insert
with check (public.is_active_workspace_member(workspace_id));
