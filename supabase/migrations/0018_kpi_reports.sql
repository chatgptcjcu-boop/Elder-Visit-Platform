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
