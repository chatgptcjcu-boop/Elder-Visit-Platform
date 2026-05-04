insert into public.platform_blueprints (
  id,
  blueprint_name,
  blueprint_type,
  description,
  config,
  is_active
) values
(
  '11111111-1111-4111-8111-111111111111',
  '獨居長者訪查 Blueprint',
  'elder_visit',
  '名冊匯入、派案、訪查、同意書、稽核、核銷、KPI 與政府格式匯出。',
  '{
    "modules": ["case_import", "assignment", "visit_form", "consent", "audit", "payment", "kpi", "export"],
    "first_market_fit": true
  }'::jsonb,
  true
),
(
  '22222222-2222-4222-8222-222222222222',
  '宮廟巡檢與公益服務 Blueprint',
  'temple_governance',
  '巡檢、志工任務、成果報表、課程與證書的第二階段擴展藍圖。',
  '{
    "modules": ["inspection", "volunteer_tasks", "reports", "courses", "certificates"],
    "first_market_fit": false
  }'::jsonb,
  true
) on conflict (id) do nothing;

insert into public.blueprint_versions (
  id,
  blueprint_id,
  version,
  config,
  migration_notes,
  is_active
) values
(
  '11111111-aaaa-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  '1.0.0',
  '{"binding_default": "locked"}'::jsonb,
  'Initial elder visit blueprint.',
  true
),
(
  '22222222-aaaa-4222-8222-222222222222',
  '22222222-2222-4222-8222-222222222222',
  '0.8.0',
  '{"binding_default": "legacy"}'::jsonb,
  'Expansion blueprint retained for second-stage market.',
  true
) on conflict (blueprint_id, version) do nothing;

insert into public.pricing_plans (
  id,
  plan_name,
  plan_type,
  price,
  billing_cycle,
  features,
  is_active
) values
(
  '33333333-3333-4333-8333-333333333333',
  '社福訪查專案版',
  'per_workspace',
  0,
  'monthly',
  '{"modules": ["import", "assignment", "audit", "payment", "export", "kpi"]}'::jsonb,
  true
),
(
  '44444444-4444-4444-8444-444444444444',
  '公益治理基礎版',
  'per_unit',
  0,
  'monthly',
  '{"modules": ["workspace", "forms", "tasks", "basic_reports"]}'::jsonb,
  true
) on conflict (id) do nothing;

insert into public.pricing_plan_limits (
  pricing_plan_id,
  limit_key,
  limit_value
) values
('33333333-3333-4333-8333-333333333333', 'max_users', 30),
('33333333-3333-4333-8333-333333333333', 'max_workspaces', 3),
('33333333-3333-4333-8333-333333333333', 'max_cases', 500),
('33333333-3333-4333-8333-333333333333', 'max_exports', 50),
('44444444-4444-4444-8444-444444444444', 'max_users', 10),
('44444444-4444-4444-8444-444444444444', 'max_workspaces', 1),
('44444444-4444-4444-8444-444444444444', 'max_forms', 8)
on conflict (pricing_plan_id, limit_key) do update
set limit_value = excluded.limit_value;

insert into public.accounts (
  id,
  email,
  full_name,
  status
) values
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'manager@example.org',
  '示範承辦人',
  'active'
),
(
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'visitor@example.org',
  '示範訪員',
  'active'
) on conflict (id) do nothing;

insert into public.units (
  id,
  unit_name,
  unit_type,
  city,
  district,
  status,
  created_by
) values
(
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  '示範公所',
  'government',
  '臺中市',
  '北區',
  'active',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) on conflict (id) do nothing;

insert into public.unit_memberships (
  unit_id,
  account_id,
  role_name,
  status,
  joined_at
) values
(
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'unit_admin',
  'active',
  now()
),
(
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'visitor',
  'active',
  now()
) on conflict (unit_id, account_id) do nothing;

insert into public.workspaces (
  id,
  unit_id,
  workspace_name,
  workspace_type,
  blueprint_id,
  status,
  created_by
) values
(
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  '115 年獨居長者訪查',
  'elder_visit',
  '11111111-1111-4111-8111-111111111111',
  'active',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) on conflict (id) do nothing;

insert into public.workspace_memberships (
  workspace_id,
  account_id,
  role_name,
  capabilities,
  status
) values
(
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'workspace_manager',
  '["dashboard.read", "workspace.manage", "cases.read", "cases.import", "assignment.manage", "audit.run", "payments.calculate", "exports.create"]'::jsonb,
  'active'
),
(
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'visitor',
  '["dashboard.read", "visits.submit"]'::jsonb,
  'active'
) on conflict (workspace_id, account_id) do nothing;

insert into public.payment_fee_rules (
  workspace_id,
  rule_code,
  visit_fee,
  data_processing_fee,
  currency,
  effective_from,
  status,
  review_note,
  created_by
) values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'elder_visit_default_115',
  180,
  30,
  'TWD',
  '2026-04-25',
  'active',
  '訪視費 180 元、資料處理費 30 元。',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) on conflict (workspace_id, rule_code, effective_from) do update
set
  visit_fee = excluded.visit_fee,
  data_processing_fee = excluded.data_processing_fee,
  currency = excluded.currency,
  status = excluded.status,
  review_note = excluded.review_note,
  updated_at = now();
