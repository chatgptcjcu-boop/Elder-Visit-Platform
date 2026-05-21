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
