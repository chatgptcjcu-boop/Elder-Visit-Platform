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
