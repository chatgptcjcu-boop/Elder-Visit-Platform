-- Combined Supabase migrations. Run individual files in production when possible.

-- supabase/migrations/0001_governance_schema.sql
create extension if not exists pgcrypto;

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  full_name text,
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  unit_name text not null,
  unit_type text,
  city text,
  district text,
  logo_url text,
  theme_color text,
  status text not null default 'active',
  created_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.unit_memberships (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  role_name text not null,
  status text not null default 'active',
  joined_at timestamptz,
  invited_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, account_id)
);

create table public.platform_blueprints (
  id uuid primary key default gen_random_uuid(),
  blueprint_name text not null,
  blueprint_type text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_name text not null,
  workspace_type text,
  blueprint_id uuid references public.platform_blueprints(id),
  status text not null default 'draft',
  created_by uuid references public.accounts(id),
  deleted_at timestamptz,
  deleted_by uuid references public.accounts(id),
  restore_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  role_name text not null,
  capabilities jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, account_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  email text not null,
  invited_role text not null,
  invite_token text unique not null,
  status text not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workspace_logo text,
  workspace_theme_color text,
  enabled_modules jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create table public.workspace_blueprint_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  blueprint_id uuid not null references public.platform_blueprints(id),
  applied_at timestamptz not null default now(),
  applied_by uuid references public.accounts(id),
  config_snapshot jsonb not null default '{}'::jsonb
);

create table public.workspace_activity_logs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_account_id uuid references public.accounts(id),
  action_key text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.consent_forms (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid,
  visit_id uuid,
  signed boolean not null default false,
  signature_type text,
  signature_url text,
  signed_date date,
  consent_scope jsonb not null default '[]'::jsonb,
  consent_expiry_date date,
  revoked boolean not null default false,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.effective_permissions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  permissions jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (account_id, workspace_id)
);

create index idx_unit_memberships_account on public.unit_memberships(account_id);
create index idx_workspace_memberships_account on public.workspace_memberships(account_id);
create index idx_workspaces_unit on public.workspaces(unit_id);
create index idx_workspace_logs_workspace on public.workspace_activity_logs(workspace_id, created_at desc);

alter table public.accounts enable row level security;
alter table public.units enable row level security;
alter table public.unit_memberships enable row level security;
alter table public.platform_blueprints enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.workspace_blueprint_history enable row level security;
alter table public.workspace_activity_logs enable row level security;
alter table public.consent_forms enable row level security;
alter table public.effective_permissions enable row level security;

create or replace function public.current_account_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
  from public.accounts
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_active_unit_member(target_unit_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.unit_memberships
    where unit_id = target_unit_id
      and account_id = public.current_account_id()
      and status = 'active'
  )
$$;

create or replace function public.is_active_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_memberships
    where workspace_id = target_workspace_id
      and account_id = public.current_account_id()
      and status = 'active'
  )
$$;

create policy "accounts can read self"
on public.accounts for select
using (auth.uid() = auth_user_id);

create policy "accounts can update self"
on public.accounts for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

create policy "members can read their units"
on public.units for select
using (public.is_active_unit_member(id));

create policy "members can read unit memberships"
on public.unit_memberships for select
using (public.is_active_unit_member(unit_id));

create policy "active blueprints are readable"
on public.platform_blueprints for select
using (is_active = true);

create policy "members can read their workspaces"
on public.workspaces for select
using (
  deleted_at is null
  and public.is_active_workspace_member(id)
);

create policy "workspace members can read memberships"
on public.workspace_memberships for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read settings"
on public.workspace_settings for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read blueprint history"
on public.workspace_blueprint_history for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read activity logs"
on public.workspace_activity_logs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read consent forms"
on public.consent_forms for select
using (public.is_active_workspace_member(workspace_id));

create policy "users can read effective permissions"
on public.effective_permissions for select
using (account_id = public.current_account_id());


-- supabase/migrations/0002_onboarding_blueprint_governance.sql
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


-- supabase/migrations/0003_elder_visit_operations.sql
create table public.elder_cases (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_code text not null,
  name text not null,
  id_number text,
  birth_date date,
  phone text,
  address text,
  district text,
  risk_level text,
  status text not null default 'pending',
  assigned_to uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, case_code)
);

create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  certificate_number text,
  photo_url text,
  training_completed boolean not null default false,
  training_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, account_id)
);

create table public.training_records (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  visitor_id uuid not null references public.visitors(id) on delete cascade,
  course_name text not null,
  hours numeric,
  certificate_url text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visit_schedule (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid not null references public.elder_cases(id) on delete cascade,
  visitor_id uuid not null references public.visitors(id) on delete cascade,
  visit_date timestamptz,
  visit_attempt int not null default 1,
  status text not null default 'pending',
  assignment_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visit_records (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid not null references public.elder_cases(id) on delete cascade,
  visitor_id uuid not null references public.visitors(id) on delete cascade,
  schedule_id uuid references public.visit_schedule(id) on delete set null,
  visit_date timestamptz not null default now(),
  visit_result text not null,
  health_status text,
  living_status text,
  notes text,
  gps_lat numeric,
  gps_lng numeric,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.consent_forms
  add constraint consent_forms_case_fk foreign key (case_id) references public.elder_cases(id) on delete cascade,
  add constraint consent_forms_visit_fk foreign key (visit_id) references public.visit_records(id) on delete set null;

create index idx_elder_cases_workspace on public.elder_cases(workspace_id, status, risk_level);
create index idx_visit_schedule_visitor on public.visit_schedule(visitor_id, visit_date);
create index idx_visit_records_workspace on public.visit_records(workspace_id, visit_date desc);

alter table public.elder_cases enable row level security;
alter table public.visitors enable row level security;
alter table public.training_records enable row level security;
alter table public.visit_schedule enable row level security;
alter table public.visit_records enable row level security;

create policy "workspace members can read elder cases"
on public.elder_cases for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read visitors"
on public.visitors for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read training records"
on public.training_records for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read visit schedule"
on public.visit_schedule for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read visit records"
on public.visit_records for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can insert visit records"
on public.visit_records for insert
with check (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0004_workspace_settings_governance.sql
create index idx_workspace_settings_workspace on public.workspace_settings(workspace_id);
create index idx_workspace_responsibility_workspace on public.workspace_responsibility(workspace_id);
create index idx_log_retention_workspace on public.log_retention_policies(workspace_id, entity_type);

alter table public.workspace_settings
  add column if not exists settings_version int not null default 1;

alter table public.workspace_responsibility
  add column if not exists updated_by uuid references public.accounts(id);

create table if not exists public.workspace_soft_delete_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  deleted_by uuid references public.accounts(id),
  deleted_at timestamptz not null default now(),
  restore_deadline timestamptz not null,
  reason text,
  restored_at timestamptz,
  restored_by uuid references public.accounts(id),
  created_at timestamptz not null default now()
);

alter table public.workspace_soft_delete_events enable row level security;

create policy "workspace members can read soft delete events"
on public.workspace_soft_delete_events for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace managers can insert soft delete events"
on public.workspace_soft_delete_events for insert
with check (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0005_import_engine.sql
create table public.import_templates (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_name text not null,
  target_entity text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.import_field_mappings (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.import_templates(id) on delete cascade,
  source_column text not null,
  target_field text not null,
  is_required boolean not null default false,
  default_value text,
  created_at timestamptz not null default now()
);

create table public.custom_fields (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  entity_type text not null,
  field_name text not null,
  field_type text not null,
  is_required boolean not null default false,
  show_in_form boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.custom_field_values (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  custom_field_id uuid not null references public.custom_fields(id) on delete cascade,
  value jsonb not null default 'null'::jsonb,
  created_at timestamptz not null default now()
);

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_id uuid references public.import_templates(id) on delete set null,
  file_url text,
  status text not null default 'preview',
  created_by uuid references public.accounts(id),
  created_at timestamptz not null default now()
);

create table public.import_job_rows (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_number int not null,
  raw_data jsonb not null default '{}'::jsonb,
  parsed_data jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.import_templates enable row level security;
alter table public.import_field_mappings enable row level security;
alter table public.custom_fields enable row level security;
alter table public.custom_field_values enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_job_rows enable row level security;

create policy "workspace members can read import templates"
on public.import_templates for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read custom fields"
on public.custom_fields for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read custom field values"
on public.custom_field_values for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read import jobs"
on public.import_jobs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can insert import jobs"
on public.import_jobs for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read import rows"
on public.import_job_rows for select
using (
  exists (
    select 1
    from public.import_jobs job
    where job.id = import_job_rows.import_job_id
      and public.is_active_workspace_member(job.workspace_id)
  )
);


-- supabase/migrations/0006_parameter_engines.sql
create table public.form_templates (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  template_name text not null,
  version text not null default '1.0.0',
  entity_type text not null default 'generic',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.form_sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.form_templates(id) on delete cascade,
  section_name text not null,
  sort_order int not null default 0
);

create table public.form_fields (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.form_sections(id) on delete cascade,
  field_key text not null,
  field_label text not null,
  field_type text not null,
  options jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  sort_order int not null default 0
);

create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_id uuid not null references public.form_templates(id),
  entity_type text not null,
  entity_id uuid,
  submitted_by uuid references public.accounts(id),
  submitted_at timestamptz not null default now()
);

create table public.form_submission_values (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.form_submissions(id) on delete cascade,
  field_key text not null,
  value jsonb not null default 'null'::jsonb
);

create table public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  template_name text not null,
  entity_type text not null,
  version text not null default '1.0.0',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workflow_templates(id) on delete cascade,
  step_key text not null,
  step_name text not null,
  sort_order int not null default 0
);

create table public.workflow_transitions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workflow_templates(id) on delete cascade,
  from_step text not null,
  to_step text not null,
  allowed_roles jsonb not null default '[]'::jsonb,
  conditions jsonb not null default '{}'::jsonb
);

create table public.workflow_instances (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_id uuid not null references public.workflow_templates(id),
  entity_type text not null,
  entity_id uuid,
  current_step text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workflow_instance_logs (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.workflow_instances(id) on delete cascade,
  from_step text,
  to_step text not null,
  action_by uuid references public.accounts(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.export_templates (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  template_name text not null,
  export_type text not null,
  entity_type text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.export_columns (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.export_templates(id) on delete cascade,
  column_key text not null,
  column_label text not null,
  source_path text not null,
  sort_order int not null default 0,
  formatter text
);

create table public.kpi_templates (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  template_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kpi_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.kpi_templates(id) on delete cascade,
  kpi_key text not null,
  kpi_name text not null,
  calculation_source text,
  calculation_config jsonb not null default '{}'::jsonb,
  target_value numeric,
  sort_order int not null default 0
);

create table public.kpi_results (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kpi_item_id uuid not null references public.kpi_items(id) on delete cascade,
  result_value numeric,
  period_start date,
  period_end date,
  calculated_at timestamptz not null default now()
);

create table public.kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  snapshot_name text not null,
  snapshot_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.form_templates enable row level security;
alter table public.form_submissions enable row level security;
alter table public.workflow_templates enable row level security;
alter table public.workflow_instances enable row level security;
alter table public.export_templates enable row level security;
alter table public.kpi_templates enable row level security;
alter table public.kpi_results enable row level security;
alter table public.kpi_snapshots enable row level security;

create policy "workspace members can read form templates"
on public.form_templates for select
using (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can read form submissions"
on public.form_submissions for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read workflow templates"
on public.workflow_templates for select
using (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can read workflow instances"
on public.workflow_instances for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read export templates"
on public.export_templates for select
using (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can read kpi templates"
on public.kpi_templates for select
using (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can read kpi results"
on public.kpi_results for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read kpi snapshots"
on public.kpi_snapshots for select
using (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0007_incidents_notifications.sql
create table public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid references public.elder_cases(id) on delete set null,
  visit_id uuid references public.visit_records(id) on delete set null,
  incident_type text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  description text,
  created_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  template_name text not null,
  channel text not null,
  subject_template text,
  body_template text not null,
  variables jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_rules (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  event_key text not null,
  template_id uuid not null references public.notification_templates(id) on delete cascade,
  conditions jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipient_account_id uuid references public.accounts(id) on delete set null,
  event_key text not null,
  channel text not null,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.incident_reports enable row level security;
alter table public.notification_templates enable row level security;
alter table public.notification_rules enable row level security;
alter table public.notification_logs enable row level security;

create policy "workspace members can read incidents"
on public.incident_reports for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can insert incidents"
on public.incident_reports for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read notification templates"
on public.notification_templates for select
using (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can read notification rules"
on public.notification_rules for select
using (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can read notification logs"
on public.notification_logs for select
using (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0008_export_jobs.sql
create table public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_id uuid references public.export_templates(id) on delete set null,
  status text not null default 'pending',
  file_url text,
  created_by uuid references public.accounts(id),
  created_at timestamptz not null default now()
);

create table public.export_logs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  export_job_id uuid not null references public.export_jobs(id) on delete cascade,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.export_jobs enable row level security;
alter table public.export_logs enable row level security;

create policy "workspace members can read export jobs"
on public.export_jobs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can insert export jobs"
on public.export_jobs for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read export logs"
on public.export_logs for select
using (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0009_auth_account_bridge.sql
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accounts (
    auth_user_id,
    email,
    full_name,
    status
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.email, ''),
    'active'
  )
  on conflict (auth_user_id) do update
  set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create policy "authenticated users can insert own account"
on public.accounts for insert
with check (auth.uid() = auth_user_id);


-- supabase/migrations/0010_consent_governance.sql
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


-- supabase/migrations/0011_log_tiering.sql
alter table public.log_retention_policies
  add column if not exists tier text not null default 'active',
  add column if not exists contains_personal_data boolean not null default false,
  add column if not exists estimated_rows bigint not null default 0;

alter table public.archived_logs
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists archive_tier text not null default 'warm_archive',
  add column if not exists purge_after timestamptz,
  add column if not exists contains_personal_data boolean not null default false;

create index if not exists idx_log_retention_tier
on public.log_retention_policies(workspace_id, tier);

create index if not exists idx_archived_logs_workspace_tier
on public.archived_logs(workspace_id, archive_tier, archived_at desc);

create index if not exists idx_archived_logs_purge
on public.archived_logs(purge_after)
where purge_after is not null;


-- supabase/migrations/0012_blueprint_migration_previews.sql
create table if not exists public.blueprint_migration_previews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  blueprint_id uuid references public.platform_blueprints(id),
  from_version text not null,
  to_version text not null,
  status text not null default 'preview_only',
  can_auto_apply boolean not null default false,
  impacts jsonb not null default '[]'::jsonb,
  required_approvals jsonb not null default '[]'::jsonb,
  generated_by uuid references public.accounts(id),
  generated_at timestamptz not null default now()
);

create index if not exists idx_blueprint_migration_previews_workspace
on public.blueprint_migration_previews(workspace_id, generated_at desc);

alter table public.blueprint_migration_previews enable row level security;

create policy "workspace members can read blueprint migration previews"
on public.blueprint_migration_previews for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create blueprint migration previews"
on public.blueprint_migration_previews for insert
with check (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0013_audit_decisions.sql
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


-- supabase/migrations/0014_payment_locks.sql
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


-- supabase/migrations/0015_payment_batches.sql
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


-- supabase/migrations/0016_assignment_recommendations.sql
create table if not exists public.visitor_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  full_name text not null,
  district_coverage jsonb not null default '[]'::jsonb,
  active_task_count int not null default 0,
  max_daily_tasks int not null default 0,
  trained_modules jsonb not null default '[]'::jsonb,
  status text not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid,
  visit_schedule_id uuid,
  visitor_profile_id uuid references public.visitor_profiles(id) on delete set null,
  score int not null default 0,
  status text not null default 'recommended',
  reasons jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  confirmed_by uuid references public.accounts(id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_visitor_profiles_workspace
on public.visitor_profiles(workspace_id, status);

create index if not exists idx_assignment_recommendations_workspace
on public.assignment_recommendations(workspace_id, created_at desc);

alter table public.visitor_profiles enable row level security;
alter table public.assignment_recommendations enable row level security;

create policy "workspace members can read visitor profiles"
on public.visitor_profiles for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read assignment recommendations"
on public.assignment_recommendations for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create assignment recommendations"
on public.assignment_recommendations for insert
with check (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0017_case_registry_status.sql
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


-- supabase/migrations/0018_kpi_reports.sql
create table if not exists public.kpi_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_id text not null,
  period_label text not null,
  generated_at timestamptz not null default now(),
  generated_by uuid references public.accounts(id),
  warnings jsonb not null default '[]'::jsonb
);

create table if not exists public.kpi_report_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  report_id uuid not null references public.kpi_reports(id) on delete cascade,
  item_key text not null,
  item_label text not null,
  target_value numeric not null default 0,
  current_value numeric not null default 0,
  unit text,
  status text not null,
  gap numeric not null default 0,
  trend text not null default 'flat'
);

create index if not exists idx_kpi_reports_workspace
on public.kpi_reports(workspace_id, generated_at desc);

create index if not exists idx_kpi_report_items_report
on public.kpi_report_items(report_id);

alter table public.kpi_reports enable row level security;
alter table public.kpi_report_items enable row level security;

create policy "workspace members can read kpi reports"
on public.kpi_reports for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create kpi reports"
on public.kpi_reports for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read kpi report items"
on public.kpi_report_items for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create kpi report items"
on public.kpi_report_items for insert
with check (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0019_incident_decisions.sql
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


-- supabase/migrations/0020_role_permissions.sql
create table if not exists public.workspace_roles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role_key text not null,
  role_label text not null,
  description text,
  capabilities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, role_key)
);

create table if not exists public.workspace_permission_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_account_id uuid references public.accounts(id),
  target_account_id uuid references public.accounts(id),
  action text not null,
  before_role text,
  after_role text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_workspace_roles_workspace
on public.workspace_roles(workspace_id, role_key);

create index if not exists idx_workspace_permission_logs_workspace
on public.workspace_permission_logs(workspace_id, created_at desc);

alter table public.workspace_roles enable row level security;
alter table public.workspace_permission_logs enable row level security;

create policy "workspace members can read roles"
on public.workspace_roles for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read permission logs"
on public.workspace_permission_logs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace managers can create permission logs"
on public.workspace_permission_logs for insert
with check (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0021_user_registration_requests.sql
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


-- supabase/migrations/0022_sponsor_governance.sql
create table if not exists public.sponsor_partners (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sponsor_name text not null,
  short_name text,
  industry text,
  logo_text text,
  logo_url text,
  theme_color text,
  contribution_label text,
  visibility_level text not null default 'standard',
  active_from date,
  active_to date,
  status text not null default 'active',
  created_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsor_exposure_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  primary_sponsor_id uuid references public.sponsor_partners(id) on delete set null,
  enabled boolean not null default false,
  exposure_level text not null default 'subtle',
  placements jsonb not null default '{}'::jsonb,
  disclosure_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create table if not exists public.sponsor_exposure_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sponsor_id uuid references public.sponsor_partners(id) on delete set null,
  actor_account_id uuid references public.accounts(id),
  action text not null,
  placement_key text,
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sponsor_partners_workspace
on public.sponsor_partners(workspace_id, status);

create index if not exists idx_sponsor_exposure_logs_workspace
on public.sponsor_exposure_logs(workspace_id, created_at desc);

alter table public.sponsor_partners enable row level security;
alter table public.sponsor_exposure_settings enable row level security;
alter table public.sponsor_exposure_logs enable row level security;

create policy "workspace members can read sponsor partners"
on public.sponsor_partners for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read sponsor exposure settings"
on public.sponsor_exposure_settings for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read sponsor exposure logs"
on public.sponsor_exposure_logs for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can manage sponsor partners"
on public.sponsor_partners for all
using (public.is_active_workspace_member(workspace_id))
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can manage sponsor exposure settings"
on public.sponsor_exposure_settings for all
using (public.is_active_workspace_member(workspace_id))
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create sponsor exposure logs"
on public.sponsor_exposure_logs for insert
with check (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0023_workgroup_communications.sql
create table if not exists public.workgroup_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  content text not null,
  audience text not null check (audience in ('public', 'group', 'individual')),
  target_label text not null,
  channels text[] not null default array['in_app'],
  priority text not null default 'normal' check (priority in ('normal', 'important', 'urgent')),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  sender_account_id uuid references public.accounts(id) on delete set null,
  sender_name text not null,
  related_module text not null default 'general',
  line_forwarding boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workgroup_message_recipients (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.workgroup_messages(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipient_account_id uuid references public.accounts(id) on delete set null,
  recipient_name text not null,
  role_label text not null,
  group_label text not null,
  line_user_id text,
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  delivery_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.workgroup_message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.workgroup_messages(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_account_id uuid references public.accounts(id) on delete set null,
  author_name text not null,
  role_label text not null,
  content text not null,
  source text not null check (source in ('in_app', 'line')),
  line_event_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.line_channel_bindings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  line_user_id text not null,
  display_name text,
  status text not null default 'active',
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, line_user_id)
);

create index if not exists idx_workgroup_messages_workspace_status
  on public.workgroup_messages(workspace_id, status, published_at desc);

create index if not exists idx_workgroup_message_recipients_message
  on public.workgroup_message_recipients(message_id, read_at);

create index if not exists idx_workgroup_message_replies_message
  on public.workgroup_message_replies(message_id, created_at desc);

alter table public.workgroup_messages enable row level security;
alter table public.workgroup_message_recipients enable row level security;
alter table public.workgroup_message_replies enable row level security;
alter table public.line_channel_bindings enable row level security;

create policy "workspace members can read workgroup messages"
on public.workgroup_messages for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create workgroup messages"
on public.workgroup_messages for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read message recipients"
on public.workgroup_message_recipients for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can manage message recipients"
on public.workgroup_message_recipients for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can update own message read state"
on public.workgroup_message_recipients for update
using (public.is_active_workspace_member(workspace_id))
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read message replies"
on public.workgroup_message_replies for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create message replies"
on public.workgroup_message_replies for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read line bindings"
on public.line_channel_bindings for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can manage own line binding"
on public.line_channel_bindings for all
using (public.is_active_workspace_member(workspace_id))
with check (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0024_government_forms.sql
create table if not exists public.government_form_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('care_visit', 'personal_data_consent', 'social_worker_confidentiality', 'civil_affairs_confidentiality')),
  owner_agency text not null,
  version text not null,
  source_file text,
  use_timing text,
  retention_note text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.government_form_sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.government_form_templates(id) on delete cascade,
  title text not null,
  purpose text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.government_form_fields (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.government_form_sections(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null check (field_type in ('text', 'date', 'single_choice', 'multi_choice', 'number', 'signature', 'address')),
  required boolean not null default false,
  sensitive boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (section_id, field_key)
);

create table if not exists public.government_care_visit_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_id uuid references public.government_form_templates(id) on delete set null,
  case_id uuid references public.elder_cases(id) on delete cascade,
  schedule_id uuid references public.visit_schedule(id) on delete set null,
  visitor_account_id uuid references public.accounts(id) on delete set null,
  form_values jsonb not null default '{}'::jsonb,
  special_color_result text,
  consent_record_id uuid,
  submitted_at timestamptz,
  audit_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.government_consent_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_id uuid references public.government_form_templates(id) on delete set null,
  case_id uuid references public.elder_cases(id) on delete cascade,
  signer_name text not null,
  personal_data_use_consent boolean not null,
  health_database_link_consent boolean,
  signature_data_url text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.visitor_confidentiality_agreements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_id uuid references public.government_form_templates(id) on delete set null,
  visitor_account_id uuid references public.accounts(id) on delete set null,
  agreement_kind text not null check (agreement_kind in ('social_worker_confidentiality', 'civil_affairs_confidentiality')),
  signer_name text not null,
  identity_type text not null,
  national_id text,
  phone text,
  confidentiality_confirmed boolean not null default false,
  signature_data_url text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_government_form_templates_workspace_kind
  on public.government_form_templates(workspace_id, kind);

create index if not exists idx_government_care_visit_records_workspace_case
  on public.government_care_visit_records(workspace_id, case_id, submitted_at desc);

create index if not exists idx_government_consent_records_workspace_case
  on public.government_consent_records(workspace_id, case_id, signed_at desc);

create index if not exists idx_visitor_confidentiality_workspace_user
  on public.visitor_confidentiality_agreements(workspace_id, visitor_account_id, agreement_kind);

alter table public.government_form_templates enable row level security;
alter table public.government_form_sections enable row level security;
alter table public.government_form_fields enable row level security;
alter table public.government_care_visit_records enable row level security;
alter table public.government_consent_records enable row level security;
alter table public.visitor_confidentiality_agreements enable row level security;

create policy "workspace members can read government form templates"
on public.government_form_templates for select
using (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can manage government form templates"
on public.government_form_templates for all
using (workspace_id is null or public.is_active_workspace_member(workspace_id))
with check (workspace_id is null or public.is_active_workspace_member(workspace_id));

create policy "workspace members can read government form sections"
on public.government_form_sections for select
using (
  exists (
    select 1
    from public.government_form_templates templates
    where templates.id = template_id
      and (templates.workspace_id is null or public.is_active_workspace_member(templates.workspace_id))
  )
);

create policy "workspace members can manage government form sections"
on public.government_form_sections for all
using (
  exists (
    select 1
    from public.government_form_templates templates
    where templates.id = template_id
      and (templates.workspace_id is null or public.is_active_workspace_member(templates.workspace_id))
  )
)
with check (
  exists (
    select 1
    from public.government_form_templates templates
    where templates.id = template_id
      and (templates.workspace_id is null or public.is_active_workspace_member(templates.workspace_id))
  )
);

create policy "workspace members can read government form fields"
on public.government_form_fields for select
using (
  exists (
    select 1
    from public.government_form_sections sections
    join public.government_form_templates templates on templates.id = sections.template_id
    where sections.id = section_id
      and (templates.workspace_id is null or public.is_active_workspace_member(templates.workspace_id))
  )
);

create policy "workspace members can manage government form fields"
on public.government_form_fields for all
using (
  exists (
    select 1
    from public.government_form_sections sections
    join public.government_form_templates templates on templates.id = sections.template_id
    where sections.id = section_id
      and (templates.workspace_id is null or public.is_active_workspace_member(templates.workspace_id))
  )
)
with check (
  exists (
    select 1
    from public.government_form_sections sections
    join public.government_form_templates templates on templates.id = sections.template_id
    where sections.id = section_id
      and (templates.workspace_id is null or public.is_active_workspace_member(templates.workspace_id))
  )
);

create policy "workspace members can read care visit records"
on public.government_care_visit_records for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create care visit records"
on public.government_care_visit_records for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can update care visit records"
on public.government_care_visit_records for update
using (public.is_active_workspace_member(workspace_id))
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read government consent records"
on public.government_consent_records for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create government consent records"
on public.government_consent_records for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read confidentiality agreements"
on public.visitor_confidentiality_agreements for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create confidentiality agreements"
on public.visitor_confidentiality_agreements for insert
with check (public.is_active_workspace_member(workspace_id));


-- supabase/migrations/0025_assignment_payment_policy.sql
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


-- supabase/seed.sql
insert into public.platform_blueprints (
  id,
  blueprint_name,
  blueprint_type,
  description,
  config,
  is_active
) values
(
  '11111111-1111-4111-8111-111111111111',
  '獨居長者訪查 Blueprint',
  'elder_visit',
  '名冊匯入、派案、訪查、同意書、稽核、核銷、KPI 與政府格式匯出。',
  '{
    "modules": ["case_import", "assignment", "visit_form", "consent", "audit", "payment", "kpi", "export"],
    "first_market_fit": true
  }'::jsonb,
  true
),
(
  '22222222-2222-4222-8222-222222222222',
  '宮廟巡檢與公益服務 Blueprint',
  'temple_governance',
  '巡檢、志工任務、成果報表、課程與證書的第二階段擴展藍圖。',
  '{
    "modules": ["inspection", "volunteer_tasks", "reports", "courses", "certificates"],
    "first_market_fit": false
  }'::jsonb,
  true
) on conflict (id) do nothing;

insert into public.blueprint_versions (
  id,
  blueprint_id,
  version,
  config,
  migration_notes,
  is_active
) values
(
  '11111111-aaaa-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  '1.0.0',
  '{"binding_default": "locked"}'::jsonb,
  'Initial elder visit blueprint.',
  true
),
(
  '22222222-aaaa-4222-8222-222222222222',
  '22222222-2222-4222-8222-222222222222',
  '0.8.0',
  '{"binding_default": "legacy"}'::jsonb,
  'Expansion blueprint retained for second-stage market.',
  true
) on conflict (blueprint_id, version) do nothing;

insert into public.pricing_plans (
  id,
  plan_name,
  plan_type,
  price,
  billing_cycle,
  features,
  is_active
) values
(
  '33333333-3333-4333-8333-333333333333',
  '社福訪查專案版',
  'per_workspace',
  0,
  'monthly',
  '{"modules": ["import", "assignment", "audit", "payment", "export", "kpi"]}'::jsonb,
  true
),
(
  '44444444-4444-4444-8444-444444444444',
  '公益治理基礎版',
  'per_unit',
  0,
  'monthly',
  '{"modules": ["workspace", "forms", "tasks", "basic_reports"]}'::jsonb,
  true
) on conflict (id) do nothing;

insert into public.pricing_plan_limits (
  pricing_plan_id,
  limit_key,
  limit_value
) values
('33333333-3333-4333-8333-333333333333', 'max_users', 30),
('33333333-3333-4333-8333-333333333333', 'max_workspaces', 3),
('33333333-3333-4333-8333-333333333333', 'max_cases', 500),
('33333333-3333-4333-8333-333333333333', 'max_exports', 50),
('44444444-4444-4444-8444-444444444444', 'max_users', 10),
('44444444-4444-4444-8444-444444444444', 'max_workspaces', 1),
('44444444-4444-4444-8444-444444444444', 'max_forms', 8)
on conflict (pricing_plan_id, limit_key) do update
set limit_value = excluded.limit_value;

insert into public.accounts (
  id,
  email,
  full_name,
  status
) values
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'manager@eldervisit.org',
  '示範承辦人',
  'active'
),
(
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'visitor@eldervisit.org',
  '示範訪員',
  'active'
) on conflict (id) do nothing;

insert into public.units (
  id,
  unit_name,
  unit_type,
  city,
  district,
  status,
  created_by
) values
(
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  '示範公所',
  'government',
  '臺中市',
  '北區',
  'active',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) on conflict (id) do nothing;

insert into public.unit_memberships (
  unit_id,
  account_id,
  role_name,
  status,
  joined_at
) values
(
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'unit_admin',
  'active',
  now()
),
(
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'visitor',
  'active',
  now()
) on conflict (unit_id, account_id) do nothing;

insert into public.workspaces (
  id,
  unit_id,
  workspace_name,
  workspace_type,
  blueprint_id,
  status,
  created_by
) values
(
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  '115 年獨居長者訪查',
  'elder_visit',
  '11111111-1111-4111-8111-111111111111',
  'active',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) on conflict (id) do nothing;

insert into public.workspace_memberships (
  workspace_id,
  account_id,
  role_name,
  capabilities,
  status
) values
(
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'workspace_manager',
  '["dashboard.read", "workspace.manage", "cases.read", "cases.import", "assignment.manage", "audit.run", "payments.calculate", "exports.create"]'::jsonb,
  'active'
),
(
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'visitor',
  '["dashboard.read", "visits.submit"]'::jsonb,
  'active'
) on conflict (workspace_id, account_id) do nothing;

insert into public.payment_fee_rules (
  workspace_id,
  rule_code,
  visit_fee,
  data_processing_fee,
  currency,
  effective_from,
  status,
  review_note,
  created_by
) values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'elder_visit_default_115',
  180,
  30,
  'TWD',
  '2026-04-25',
  'active',
  '訪視費 180 元、資料處理費 30 元。',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) on conflict (workspace_id, rule_code, effective_from) do update
set
  visit_fee = excluded.visit_fee,
  data_processing_fee = excluded.data_processing_fee,
  currency = excluded.currency,
  status = excluded.status,
  review_note = excluded.review_note,
  updated_at = now();


-- supabase/migrations/0027_visitor_identity_profile_completion.sql
alter table public.workspace_registration_requests
  add column if not exists registration_code text,
  add column if not exists auth_invite_status text not null default 'not_sent',
  add column if not exists auth_invited_at timestamptz,
  add column if not exists auth_activated_at timestamptz,
  add column if not exists profile_completion_status text not null default 'incomplete',
  add column if not exists profile_submitted_at timestamptz,
  add column if not exists profile_reviewed_at timestamptz,
  add column if not exists profile_return_reason text,
  add column if not exists visitor_code text,
  add column if not exists qr_code_payload text;

alter table public.visitor_profiles
  add column if not exists visitor_code text,
  add column if not exists profile_completion_status text not null default 'incomplete',
  add column if not exists profile_completed_at timestamptz,
  add column if not exists profile_reviewed_at timestamptz,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists service_availability jsonb not null default '{}'::jsonb,
  add column if not exists qr_code_payload text,
  add column if not exists qr_code_generated_at timestamptz,
  add column if not exists is_assignable boolean not null default false;

create unique index if not exists idx_workspace_registration_requests_registration_code
on public.workspace_registration_requests(registration_code)
where registration_code is not null;

create unique index if not exists idx_workspace_registration_requests_visitor_code
on public.workspace_registration_requests(visitor_code)
where visitor_code is not null;

create unique index if not exists idx_visitor_profiles_visitor_code
on public.visitor_profiles(visitor_code)
where visitor_code is not null;

create index if not exists idx_workspace_registration_requests_auth_invite
on public.workspace_registration_requests(requested_workspace_id, auth_invite_status, status);

create index if not exists idx_workspace_registration_requests_profile_completion
on public.workspace_registration_requests(requested_workspace_id, profile_completion_status, status);

create index if not exists idx_visitor_profiles_assignable
on public.visitor_profiles(workspace_id, is_assignable, status);

create index if not exists idx_visitor_profiles_profile_completion
on public.visitor_profiles(workspace_id, profile_completion_status, status);

update public.workspace_registration_requests
set registration_code = concat(
  'REG-115-YH-',
  lpad(row_numbered.seq::text, 4, '0')
)
from (
  select id, row_number() over (order by submitted_at, created_at, id) as seq
  from public.workspace_registration_requests
  where registration_code is null
) as row_numbered
where public.workspace_registration_requests.id = row_numbered.id;

update public.visitor_profiles
set
  visitor_code = concat(
    'EV-115-YH-',
    case
      when worker_type = 'civil_affairs' then 'CIV'
      when worker_type = 'social_affairs' then 'SOC'
      else 'VOL'
    end,
    '-',
    lpad(row_numbered.seq::text, 4, '0')
  ),
  qr_code_payload = concat(
    'https://eldervisit.netlify.app/verify/visitor/',
    'EV-115-YH-',
    case
      when worker_type = 'civil_affairs' then 'CIV'
      when worker_type = 'social_affairs' then 'SOC'
      else 'VOL'
    end,
    '-',
    lpad(row_numbered.seq::text, 4, '0')
  ),
  qr_code_generated_at = coalesce(qr_code_generated_at, now()),
  profile_completion_status = case
    when coalesce(phone, '') <> ''
      and coalesce(national_id, '') <> ''
      and coalesce(headshot_processed_url, '') <> ''
    then 'submitted'
    else profile_completion_status
  end
from (
  select id, row_number() over (partition by workspace_id, worker_type order by created_at, id) as seq
  from public.visitor_profiles
  where visitor_code is null
) as row_numbered
where public.visitor_profiles.id = row_numbered.id;

update public.workspace_registration_requests
set
  visitor_code = public.visitor_profiles.visitor_code,
  qr_code_payload = public.visitor_profiles.qr_code_payload
from public.visitor_profiles
where public.workspace_registration_requests.account_id = public.visitor_profiles.account_id
  and public.workspace_registration_requests.requested_workspace_id = public.visitor_profiles.workspace_id
  and public.workspace_registration_requests.visitor_code is null;


-- supabase/migrations/0028_visitor_remittance_documents.sql
alter table public.visitor_profiles
  add column if not exists bank_account_last5 text,
  add column if not exists remittance_ready boolean not null default false,
  add column if not exists bank_name text,
  add column if not exists bank_code text,
  add column if not exists bank_branch_name text,
  add column if not exists bank_account_name text,
  add column if not exists passbook_cover_url text,
  add column if not exists passbook_uploaded_at timestamptz,
  add column if not exists remittance_review_status text not null default 'pending',
  add column if not exists remittance_reviewed_at timestamptz,
  add column if not exists remittance_review_note text;

create index if not exists idx_visitor_profiles_remittance_review
on public.visitor_profiles(workspace_id, remittance_review_status, remittance_ready);


-- supabase/migrations/0029_visitor_headshot_storage.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'visitor-headshots',
  'visitor-headshots',
  false,
  1000000,
  array['image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- supabase/migrations/0030_visitor_remittance_storage_qr_site.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'visitor-remittance-documents',
  'visitor-remittance-documents',
  false,
  600000,
  array['image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.workspace_registration_requests
  add column if not exists auth_invite_sent_count integer not null default 0;

update public.workspace_registration_requests
set auth_invite_sent_count = 1
where auth_invite_status in ('sent', 'activated')
  and auth_invite_sent_count = 0;

update public.visitor_profiles
set qr_code_payload = replace(
  qr_code_payload,
  'https://eldervisit.netlify.app',
  'https://elder-visit-platform.vercel.app'
)
where qr_code_payload like 'https://eldervisit.netlify.app/%';

update public.workspace_registration_requests
set qr_code_payload = replace(
  qr_code_payload,
  'https://eldervisit.netlify.app',
  'https://elder-visit-platform.vercel.app'
)
where qr_code_payload like 'https://eldervisit.netlify.app/%';
