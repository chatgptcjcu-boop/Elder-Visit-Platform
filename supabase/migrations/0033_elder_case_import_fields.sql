alter table public.elder_cases
  add column if not exists gender text,
  add column if not exists service_unit text,
  add column if not exists mobile_phone text,
  add column if not exists line_id_status text,
  add column if not exists line_id_note text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_relationship text,
  add column if not exists emergency_contact_phone text,
  add column if not exists household_city text,
  add column if not exists household_district text,
  add column if not exists household_village text,
  add column if not exists household_address text,
  add column if not exists residence_city text,
  add column if not exists residence_district text,
  add column if not exists residence_village text,
  add column if not exists residence_address text,
  add column if not exists residence_address_note text,
  add column if not exists solitary_status text,
  add column if not exists source_sheet_name text,
  add column if not exists source_row_number int,
  add column if not exists import_batch_code text,
  add column if not exists import_visit_result text,
  add column if not exists import_visitor_name text,
  add column if not exists raw_import_data jsonb not null default '{}'::jsonb;

create index if not exists idx_elder_cases_id_number
on public.elder_cases(workspace_id, id_number)
where id_number is not null;

create index if not exists idx_elder_cases_import_batch
on public.elder_cases(workspace_id, import_batch_code, source_sheet_name);

create index if not exists idx_elder_cases_residence_area
on public.elder_cases(workspace_id, residence_district, residence_village);
