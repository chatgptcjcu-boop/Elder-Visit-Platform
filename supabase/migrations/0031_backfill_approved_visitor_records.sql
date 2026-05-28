-- Backfill approved visitor registrations into the operational visitor records.
-- This is safe to re-run: inserts use conflict checks and updates only fill missing links/codes.

insert into public.accounts (
  email,
  full_name,
  status,
  updated_at
)
select distinct on (lower(wrr.email))
  lower(wrr.email),
  wrr.full_name,
  'active',
  now()
from public.workspace_registration_requests wrr
left join public.accounts existing
  on lower(existing.email) = lower(wrr.email)
where wrr.status = 'approved'
  and wrr.requested_role_key = 'visitor'
  and wrr.requested_workspace_id is not null
  and existing.id is null
order by lower(wrr.email), wrr.reviewed_at desc nulls last, wrr.submitted_at desc
on conflict (email) do nothing;

update public.workspace_registration_requests wrr
set account_id = accounts.id
from public.accounts accounts
where wrr.account_id is null
  and lower(accounts.email) = lower(wrr.email)
  and wrr.status = 'approved'
  and wrr.requested_role_key = 'visitor'
  and wrr.requested_workspace_id is not null;

insert into public.workspace_memberships (
  workspace_id,
  account_id,
  role_name,
  capabilities,
  status,
  updated_at
)
select distinct
  wrr.requested_workspace_id,
  wrr.account_id,
  'visitor',
  '["dashboard.read", "visits.submit"]'::jsonb,
  'active',
  now()
from public.workspace_registration_requests wrr
where wrr.status = 'approved'
  and wrr.requested_role_key = 'visitor'
  and wrr.requested_workspace_id is not null
  and wrr.account_id is not null
on conflict (workspace_id, account_id) do update
set
  role_name = excluded.role_name,
  capabilities = excluded.capabilities,
  status = 'active',
  updated_at = now();

with existing_max as (
  select
    workspace_id,
    worker_type,
    coalesce(
      max(
        nullif(substring(visitor_code from '(\d+)$'), '')::int
      ),
      0
    ) as max_seq
  from public.visitor_profiles
  where visitor_code is not null
  group by workspace_id, worker_type
),
missing_profiles as (
  select
    wrr.*,
    case
      when wrr.worker_group = 'social_affairs' then 'social_affairs'
      when wrr.worker_group = 'civil_affairs' then 'civil_affairs'
      else 'civil_affairs'
    end as backfill_worker_type
  from public.workspace_registration_requests wrr
  left join public.visitor_profiles vp
    on vp.workspace_id = wrr.requested_workspace_id
   and vp.account_id = wrr.account_id
  where wrr.status = 'approved'
    and wrr.requested_role_key = 'visitor'
    and wrr.requested_workspace_id is not null
    and wrr.account_id is not null
    and vp.id is null
),
numbered_profiles as (
  select
    missing_profiles.*,
    row_number() over (
      partition by requested_workspace_id, backfill_worker_type
      order by reviewed_at nulls last, submitted_at, id
    ) as backfill_seq
  from missing_profiles
)
insert into public.visitor_profiles (
  workspace_id,
  account_id,
  full_name,
  status,
  worker_type,
  visitor_code,
  visitor_certificate_no,
  certificate_status,
  training_date,
  root_unit_name,
  department_name,
  job_title,
  display_name,
  gender,
  national_id,
  official_email,
  phone,
  headshot_processed_url,
  social_bureau_review_status,
  social_bureau_reviewed_at,
  profile_completion_status,
  profile_completed_at,
  profile_reviewed_at,
  qr_code_payload,
  qr_code_generated_at,
  is_assignable,
  updated_at
)
select
  requested_workspace_id,
  account_id,
  full_name,
  case
    when coalesce(phone, '') <> ''
      and coalesce(national_id, '') <> ''
      and coalesce(headshot_processed_url, '') <> ''
    then 'available'
    else 'pending_profile_completion'
  end,
  backfill_worker_type,
  coalesce(
    visitor_code,
    concat(
      'EV-115-YH-',
      case when backfill_worker_type = 'social_affairs' then 'SOC' else 'CIV' end,
      '-',
      lpad(
        (
          coalesce(existing_max.max_seq, 0) + numbered_profiles.backfill_seq
        )::text,
        4,
        '0'
      )
    )
  ),
  visitor_certificate_no,
  case when coalesce(visitor_certificate_no, '') <> '' then 'valid' else 'missing' end,
  training_completed_at,
  root_unit_name,
  department_name,
  job_title,
  coalesce(display_name, full_name),
  case when gender in ('男', '女', '其他') then gender else '其他' end,
  national_id,
  coalesce(official_email, email),
  phone,
  headshot_processed_url,
  'approved',
  coalesce(social_bureau_reviewed_at, reviewed_at, now()),
  case
    when coalesce(profile_completion_status, '') in ('verified', 'returned') then profile_completion_status
    when coalesce(phone, '') <> ''
      and coalesce(national_id, '') <> ''
      and coalesce(headshot_processed_url, '') <> ''
    then 'submitted'
    else 'incomplete'
  end,
  case
    when coalesce(phone, '') <> ''
      and coalesce(national_id, '') <> ''
      and coalesce(headshot_processed_url, '') <> ''
    then coalesce(profile_submitted_at, reviewed_at, submitted_at, now())
    else null
  end,
  profile_reviewed_at,
  concat(
    coalesce(nullif(current_setting('app.public_site_url', true), ''), 'https://elder-visit-platform.vercel.app'),
    '/verify/visitor/',
    coalesce(
      visitor_code,
      concat(
        'EV-115-YH-',
        case when backfill_worker_type = 'social_affairs' then 'SOC' else 'CIV' end,
        '-',
        lpad(
          (
            coalesce(existing_max.max_seq, 0) + numbered_profiles.backfill_seq
          )::text,
          4,
          '0'
        )
      )
    )
  ),
  now(),
  false,
  now()
from numbered_profiles
left join existing_max
  on existing_max.workspace_id = numbered_profiles.requested_workspace_id
 and existing_max.worker_type = numbered_profiles.backfill_worker_type;

update public.visitor_profiles vp
set
  full_name = coalesce(vp.full_name, wrr.full_name),
  worker_type = case
    when vp.worker_type is null or vp.worker_type = 'general'
    then case
      when wrr.worker_group = 'social_affairs' then 'social_affairs'
      else 'civil_affairs'
    end
    else vp.worker_type
  end,
  visitor_certificate_no = coalesce(vp.visitor_certificate_no, wrr.visitor_certificate_no),
  certificate_status = case
    when coalesce(vp.visitor_certificate_no, wrr.visitor_certificate_no, '') <> '' then 'valid'
    else vp.certificate_status
  end,
  training_date = coalesce(vp.training_date, wrr.training_completed_at),
  root_unit_name = coalesce(vp.root_unit_name, wrr.root_unit_name),
  department_name = coalesce(vp.department_name, wrr.department_name),
  job_title = coalesce(vp.job_title, wrr.job_title),
  display_name = coalesce(vp.display_name, wrr.display_name, wrr.full_name),
  gender = coalesce(vp.gender, case when wrr.gender in ('男', '女', '其他') then wrr.gender else '其他' end),
  national_id = coalesce(vp.national_id, wrr.national_id),
  official_email = coalesce(vp.official_email, wrr.official_email, wrr.email),
  phone = coalesce(vp.phone, wrr.phone),
  headshot_processed_url = coalesce(vp.headshot_processed_url, wrr.headshot_processed_url),
  social_bureau_review_status = 'approved',
  social_bureau_reviewed_at = coalesce(vp.social_bureau_reviewed_at, wrr.social_bureau_reviewed_at, wrr.reviewed_at, now()),
  updated_at = now()
from public.workspace_registration_requests wrr
where wrr.status = 'approved'
  and wrr.requested_role_key = 'visitor'
  and wrr.requested_workspace_id = vp.workspace_id
  and wrr.account_id = vp.account_id;

update public.workspace_registration_requests wrr
set
  visitor_code = vp.visitor_code,
  qr_code_payload = vp.qr_code_payload,
  social_bureau_review_status = case
    when wrr.social_bureau_review_status = 'approved' then wrr.social_bureau_review_status
    else 'approved'
  end,
  social_bureau_reviewed_at = coalesce(wrr.social_bureau_reviewed_at, wrr.reviewed_at, now()),
  profile_completion_status = case
    when wrr.profile_completion_status in ('verified', 'returned') then wrr.profile_completion_status
    when vp.profile_completion_status is not null then vp.profile_completion_status
    else wrr.profile_completion_status
  end
from public.visitor_profiles vp
where wrr.status = 'approved'
  and wrr.requested_role_key = 'visitor'
  and wrr.requested_workspace_id = vp.workspace_id
  and wrr.account_id = vp.account_id
  and (
    wrr.visitor_code is null
    or wrr.qr_code_payload is null
    or wrr.social_bureau_review_status <> 'approved'
  );
