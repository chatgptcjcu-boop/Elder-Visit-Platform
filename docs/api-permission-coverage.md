# API Permission Coverage

## 已接後端權限檢查

| API | 方法 | 權限 |
| --- | --- | --- |
| `/api/cases` | GET | `cases.read` |
| `/api/cases` | POST | `cases.update` |
| `/api/assignments` | GET | `assignment.manage` |
| `/api/assignments` | POST | `assignment.confirm` |
| `/api/users` | GET | `users.manage` |
| `/api/users` | POST | `users.review` |
| `/api/notifications` | GET | `notifications.manage` |
| `/api/notifications` | POST | `notifications.manage` or `notifications.send` |
| `/api/audit/decision` | POST | `audit.approve` or `audit.reject` |
| `/api/audit/run-checks` | POST | `audit.run` |
| `/api/exports/create` | POST | `exports.create` |
| `/api/import/preview` | POST | `cases.import` |
| `/api/onboarding/publish` | POST | `onboarding.publish` |
| `/api/payments/calculate` | POST | `payments.calculate` |
| `/api/payments/lock` | POST | `payments.lock` |
| `/api/payments/batch` | POST | `payments.calculate` |
| `/api/visits/submit` | POST | `visits.submit` |
| `/api/workspace/settings` | GET | `workspace.manage` |
| `/api/workspace/settings` | POST | `workspace.update` or `sponsors.manage` |
| `/api/workspace/soft-delete` | POST | `workspace.soft_delete` |
| `/api/blueprints/migration-preview` | POST | `workspace.update` |
| `/api/kpi` | GET | `kpi.read` |
| `/api/consent` | GET | `consent.manage` |
| `/api/engines` | GET | `engines.manage` |
| `/api/pricing` | GET | `pricing.manage` |
| `/api/permissions` | GET | `permissions.manage` |
| `/api/workspaces` | GET | `dashboard.read` |
| `/api/system/status` | GET | `system.read` |

## 尚待 Supabase RLS 強化

目前後端權限使用 demo role cookie 驗證 capability。正式接 Supabase 後，API 需要改為：

1. 從 Supabase Auth session 找出 `account_id`。
2. 依 `workspace_memberships` 找出該使用者在 workspace 的角色。
3. 從 `workspace_roles` 或 `effective_permissions` 讀取 capabilities。
4. 每筆資料查詢都加上 `workspace_id` 條件。
5. 高風險寫入同步寫入 `workspace_activity_logs`。
