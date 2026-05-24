insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'visitor-remittance-documents',
  'visitor-remittance-documents',
  false,
  600000,
  array['image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.workspace_registration_requests
  add column if not exists auth_invite_sent_count integer not null default 0;

update public.workspace_registration_requests
set auth_invite_sent_count = 1
where auth_invite_status in ('sent', 'activated')
  and auth_invite_sent_count = 0;

update public.visitor_profiles
set qr_code_payload = replace(
  qr_code_payload,
  'https://eldervisit.netlify.app',
  'https://elder-visit-platform.vercel.app'
)
where qr_code_payload like 'https://eldervisit.netlify.app/%';

update public.workspace_registration_requests
set qr_code_payload = replace(
  qr_code_payload,
  'https://eldervisit.netlify.app',
  'https://elder-visit-platform.vercel.app'
)
where qr_code_payload like 'https://eldervisit.netlify.app/%';
