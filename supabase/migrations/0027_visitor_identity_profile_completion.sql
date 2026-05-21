alter table public.workspace_registration_requests
  add column if not exists registration_code text,
  add column if not exists auth_invite_status text not null default 'not_sent',
  add column if not exists auth_invited_at timestamptz,
  add column if not exists auth_activated_at timestamptz,
  add column if not exists profile_completion_status text not null default 'incomplete',
  add column if not exists profile_submitted_at timestamptz,
  add column if not exists profile_reviewed_at timestamptz,
  add column if not exists profile_return_reason text,
  add column if not exists visitor_code text,
  add column if not exists qr_code_payload text;

alter table public.visitor_profiles
  add column if not exists visitor_code text,
  add column if not exists profile_completion_status text not null default 'incomplete',
  add column if not exists profile_completed_at timestamptz,
  add column if not exists profile_reviewed_at timestamptz,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists service_availability jsonb not null default '{}'::jsonb,
  add column if not exists qr_code_payload text,
  add column if not exists qr_code_generated_at timestamptz,
  add column if not exists is_assignable boolean not null default false;

create unique index if not exists idx_workspace_registration_requests_registration_code
on public.workspace_registration_requests(registration_code)
where registration_code is not null;

create unique index if not exists idx_workspace_registration_requests_visitor_code
on public.workspace_registration_requests(visitor_code)
where visitor_code is not null;

create unique index if not exists idx_visitor_profiles_visitor_code
on public.visitor_profiles(visitor_code)
where visitor_code is not null;

create index if not exists idx_workspace_registration_requests_auth_invite
on public.workspace_registration_requests(requested_workspace_id, auth_invite_status, status);

create index if not exists idx_workspace_registration_requests_profile_completion
on public.workspace_registration_requests(requested_workspace_id, profile_completion_status, status);

create index if not exists idx_visitor_profiles_assignable
on public.visitor_profiles(workspace_id, is_assignable, status);

create index if not exists idx_visitor_profiles_profile_completion
on public.visitor_profiles(workspace_id, profile_completion_status, status);

update public.workspace_registration_requests
set registration_code = concat(
  'REG-115-YH-',
  lpad(row_numbered.seq::text, 4, '0')
)
from (
  select id, row_number() over (order by submitted_at, created_at, id) as seq
  from public.workspace_registration_requests
  where registration_code is null
) as row_numbered
where public.workspace_registration_requests.id = row_numbered.id;

update public.visitor_profiles
set
  visitor_code = concat(
    'EV-115-YH-',
    case
      when worker_type = 'civil_affairs' then 'CIV'
      when worker_type = 'social_affairs' then 'SOC'
      else 'VOL'
    end,
    '-',
    lpad(row_numbered.seq::text, 4, '0')
  ),
  qr_code_payload = concat(
    'https://eldervisit.netlify.app/verify/visitor/',
    'EV-115-YH-',
    case
      when worker_type = 'civil_affairs' then 'CIV'
      when worker_type = 'social_affairs' then 'SOC'
      else 'VOL'
    end,
    '-',
    lpad(row_numbered.seq::text, 4, '0')
  ),
  qr_code_generated_at = coalesce(qr_code_generated_at, now()),
  profile_completion_status = case
    when coalesce(phone, '') <> ''
      and coalesce(national_id, '') <> ''
      and coalesce(headshot_processed_url, '') <> ''
    then 'submitted'
    else profile_completion_status
  end
from (
  select id, row_number() over (partition by workspace_id, worker_type order by created_at, id) as seq
  from public.visitor_profiles
  where visitor_code is null
) as row_numbered
where public.visitor_profiles.id = row_numbered.id;

update public.workspace_registration_requests
set
  visitor_code = public.visitor_profiles.visitor_code,
  qr_code_payload = public.visitor_profiles.qr_code_payload
from public.visitor_profiles
where public.workspace_registration_requests.account_id = public.visitor_profiles.account_id
  and public.workspace_registration_requests.requested_workspace_id = public.visitor_profiles.workspace_id
  and public.workspace_registration_requests.visitor_code is null;
