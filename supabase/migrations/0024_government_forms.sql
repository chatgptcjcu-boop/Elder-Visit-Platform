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
