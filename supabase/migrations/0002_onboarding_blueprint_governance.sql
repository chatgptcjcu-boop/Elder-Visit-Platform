create table public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  current_step text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.onboarding_sessions(id) on delete cascade,
  step_key text not null,
  question_key text not null,
  answer_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.blueprint_versions (
  id uuid primary key default gen_random_uuid(),
  blueprint_id uuid not null references public.platform_blueprints(id) on delete cascade,
  version text not null,
  config jsonb not null default '{}'::jsonb,
  migration_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (blueprint_id, version)
);

create table public.workspace_blueprint_binding (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  blueprint_id uuid not null references public.platform_blueprints(id),
  blueprint_version_id uuid not null references public.blueprint_versions(id),
  binding_status text not null default 'locked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create table public.ai_setup_recommendations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  recommendation_type text not null,
  recommendation_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_recommendation_confidence (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references public.ai_setup_recommendations(id) on delete cascade,
  confidence_score numeric not null check (confidence_score >= 0 and confidence_score <= 100),
  reasoning_summary text,
  matched_blueprints jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  plan_name text not null,
  plan_type text not null,
  price numeric not null default 0,
  billing_cycle text,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.pricing_plan_limits (
  id uuid primary key default gen_random_uuid(),
  pricing_plan_id uuid not null references public.pricing_plans(id) on delete cascade,
  limit_key text not null,
  limit_value numeric not null,
  created_at timestamptz not null default now(),
  unique (pricing_plan_id, limit_key)
);

create table public.workspace_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  pricing_plan_id uuid not null references public.pricing_plans(id),
  status text not null default 'active',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  unique (workspace_id)
);

create table public.usage_metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  metric_key text not null,
  metric_value numeric not null default 0,
  period_start date,
  period_end date,
  created_at timestamptz not null default now()
);

create table public.log_retention_policies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  entity_type text not null,
  retention_months int not null default 12,
  archive_after_months int not null default 12,
  created_at timestamptz not null default now()
);

create table public.archived_logs (
  id uuid primary key default gen_random_uuid(),
  log_type text not null,
  source_log_id uuid,
  archived_data jsonb not null default '{}'::jsonb,
  archived_at timestamptz not null default now()
);

create table public.workspace_responsibility (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legal_owner_name text,
  responsible_person text,
  insurance_info text,
  service_disclaimer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

alter table public.onboarding_sessions enable row level security;
alter table public.onboarding_answers enable row level security;
alter table public.blueprint_versions enable row level security;
alter table public.workspace_blueprint_binding enable row level security;
alter table public.ai_setup_recommendations enable row level security;
alter table public.ai_recommendation_confidence enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.pricing_plan_limits enable row level security;
alter table public.workspace_subscriptions enable row level security;
alter table public.usage_metrics enable row level security;
alter table public.log_retention_policies enable row level security;
alter table public.archived_logs enable row level security;
alter table public.workspace_responsibility enable row level security;

create policy "users can read onboarding sessions"
on public.onboarding_sessions for select
using (account_id = public.current_account_id());

create policy "users can read onboarding answers"
on public.onboarding_answers for select
using (
  exists (
    select 1
    from public.onboarding_sessions os
    where os.id = onboarding_answers.session_id
      and os.account_id = public.current_account_id()
  )
);

create policy "active blueprint versions are readable"
on public.blueprint_versions for select
using (is_active = true);

create policy "workspace members can read blueprint binding"
on public.workspace_blueprint_binding for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read ai recommendations"
on public.ai_setup_recommendations for select
using (
  workspace_id is not null
  and public.is_active_workspace_member(workspace_id)
);

create policy "active pricing plans are readable"
on public.pricing_plans for select
using (is_active = true);

create policy "active pricing limits are readable"
on public.pricing_plan_limits for select
using (
  exists (
    select 1
    from public.pricing_plans pp
    where pp.id = pricing_plan_limits.pricing_plan_id
      and pp.is_active = true
  )
);

create policy "workspace members can read subscriptions"
on public.workspace_subscriptions for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read usage metrics"
on public.usage_metrics for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read log policies"
on public.log_retention_policies for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read responsibility"
on public.workspace_responsibility for select
using (public.is_active_workspace_member(workspace_id));
