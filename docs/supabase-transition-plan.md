# Supabase Transition Plan

## 目標

把目前的 mock data 與 localStorage 設定逐步移到 Supabase，並保留治理 SaaS 需要的多人登入、角色權限、審核、留痕與資料封存。

## 優先資料表

| 功能 | 目前狀態 | Supabase 表 |
| --- | --- | --- |
| 帳號與工作空間 | mock / cookie demo role | `accounts`, `units`, `workspaces`, `workspace_memberships`, `workspace_roles` |
| 權限矩陣 | TypeScript 常數 | `workspace_roles`, `effective_permissions`, `workspace_permission_logs` |
| 名冊 | mock data | `elder_cases`, `case_status_logs` |
| 派案 | mock data | `visit_schedules`, `assignment_recommendations` |
| 訪查 | mock form state | `visit_records`, `consent_forms`, `audit_queue` |
| 稽核與核銷 | mock calculation | `audit_decisions`, `payment_locks`, `payment_batches` |
| 匯出 | generated preview | `export_jobs`, `export_job_logs` |
| 使用者註冊審核 | mock request list | `user_registration_requests`, `workspace_memberships` |
| 贊助企業聯名 | localStorage | `sponsor_partners`, `sponsor_exposure_settings`, `sponsor_exposure_logs` |
| 系統設定 | localStorage | `workspace_settings`, `log_retention_policies`, `workspace_activity_logs` |

## API 權限原則

1. 前端按鈕只負責改善體驗，不作為安全邊界。
2. 所有 POST / PATCH / DELETE 必須在 API route 先檢查 capability。
3. Supabase RLS 是最後一層資料邊界，至少要檢查 `workspace_id` 是否屬於目前使用者。
4. 高風險操作需寫入 activity log，例如權限變更、Soft Delete、核銷鎖定、匯出、贊助企業露出修改。

## 下一步落地順序

1. Auth：把 `demo_role` cookie 改成 Supabase Auth session + `workspace_memberships`。
2. RBAC：把 `workspaceRoles` 寫入 `workspace_roles`，登入後同步到 `effective_permissions`。
3. Cases：把 `elderCases` 改讀 `elder_cases`，新增 `case_status_logs`。
4. Sponsors：把 `localStorage` 的贊助企業設定改接 `sponsor_partners` 和 `sponsor_exposure_settings`。
5. Audit Logs：所有資料變更 API 寫入 `workspace_activity_logs`。
