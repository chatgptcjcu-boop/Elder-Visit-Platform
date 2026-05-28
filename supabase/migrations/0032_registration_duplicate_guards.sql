create index if not exists idx_wrr_duplicate_guard_email
on public.workspace_registration_requests(requested_workspace_id, email)
where requested_role_key = 'visitor' and status <> 'rejected';

create index if not exists idx_wrr_duplicate_guard_official_email
on public.workspace_registration_requests(requested_workspace_id, official_email)
where requested_role_key = 'visitor'
  and status <> 'rejected'
  and official_email is not null;

create index if not exists idx_wrr_duplicate_guard_national_id
on public.workspace_registration_requests(requested_workspace_id, national_id)
where requested_role_key = 'visitor'
  and status <> 'rejected'
  and national_id is not null;

create index if not exists idx_wrr_duplicate_guard_phone
on public.workspace_registration_requests(requested_workspace_id, phone)
where requested_role_key = 'visitor'
  and status <> 'rejected'
  and phone is not null;

create index if not exists idx_visitor_profiles_duplicate_guard_official_email
on public.visitor_profiles(workspace_id, official_email)
where official_email is not null;

create index if not exists idx_visitor_profiles_duplicate_guard_national_id
on public.visitor_profiles(workspace_id, national_id)
where national_id is not null;

create index if not exists idx_visitor_profiles_duplicate_guard_phone
on public.visitor_profiles(workspace_id, phone)
where phone is not null;
