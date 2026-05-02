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
