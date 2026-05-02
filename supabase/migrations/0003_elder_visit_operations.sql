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
