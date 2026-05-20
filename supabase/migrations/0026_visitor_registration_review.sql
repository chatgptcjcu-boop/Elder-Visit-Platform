alter table public.workspace_registration_requests
  add column if not exists root_unit_name text,
  add column if not exists department_name text,
  add column if not exists department_other text,
  add column if not exists job_title text,
  add column if not exists job_title_other text,
  add column if not exists display_name text,
  add column if not exists gender text,
  add column if not exists national_id text,
  add column if not exists worker_group text,
  add column if not exists official_email text,
  add column if not exists phone text,
  add column if not exists training_completed boolean not null default false,
  add column if not exists training_completed_at date,
  add column if not exists visitor_certificate_no text,
  add column if not exists headshot_original_url text,
  add column if not exists headshot_processed_url text,
  add column if not exists social_bureau_review_status text not null default 'not_sent',
  add column if not exists social_bureau_reviewed_at timestamptz,
  add column if not exists social_bureau_review_note text;

alter table public.visitor_profiles
  add column if not exists root_unit_name text,
  add column if not exists department_name text,
  add column if not exists job_title text,
  add column if not exists display_name text,
  add column if not exists gender text,
  add column if not exists national_id text,
  add column if not exists official_email text,
  add column if not exists phone text,
  add column if not exists headshot_processed_url text,
  add column if not exists social_bureau_review_status text not null default 'not_sent',
  add column if not exists social_bureau_reviewed_at timestamptz;

create index if not exists idx_workspace_registration_requests_worker_group
on public.workspace_registration_requests(requested_workspace_id, worker_group, status);

create index if not exists idx_workspace_registration_requests_social_bureau
on public.workspace_registration_requests(requested_workspace_id, social_bureau_review_status, submitted_at desc);
