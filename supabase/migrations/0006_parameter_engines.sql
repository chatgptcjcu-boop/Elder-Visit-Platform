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
