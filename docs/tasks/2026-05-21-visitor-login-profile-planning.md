# Task Brief: Visitor login profile completion planning

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

建立訪員註冊後續流程的第一階段基礎，讓資料庫與程式型別可保存註冊申請編號、登入邀請狀態、個人資料補完狀態、正式訪員編碼與 QR Code payload。

## Scope

### In scope

- 新增 Supabase migration `0027_visitor_identity_profile_completion.sql`。
- 更新註冊申請與訪員資格檔欄位。
- 更新程式型別與註冊/審核資料映射。
- 註冊送出時產生申請編號。
- 審核通過建立訪員資格檔時產生正式訪員編碼與 QR Code payload。
- 更新 Supabase README 與補充規劃文件。

### Out of scope

- 志工前台 `/visitor/profile` 自補資料頁。
- QR Code 圖檔輸出與識別證版型。
- 後台使用者管理分頁重整。
- 邀請信點擊後的設定密碼 / 啟用頁。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/user-registration-workflow.md`
- Related files: `docs/visitor-login-profile-completion-plan.md`, `supabase/migrations/0027_visitor_identity_profile_completion.sql`, `lib/domain/user-management.ts`

## Likely Files

- `supabase/migrations/0027_visitor_identity_profile_completion.sql`
- `app/api/users/invite-approved-visitor/route.ts`
- `components/workspace/users-panel.tsx`
- `supabase/apply_all.sql`
- `supabase/README.md`
- `lib/domain/types.ts`
- `lib/domain/user-management.ts`
- `lib/supabase/database.types.ts`
- `docs/user-registration-workflow.md`
- `docs/visitor-login-profile-completion-plan.md`

## Risks / Ambiguities

- 正式登入邀請需要第二階段使用 Supabase Auth Admin API，且必須保護 `SUPABASE_SERVICE_ROLE_KEY`。
- 訪員編碼目前以工作空間、年度、區域與民政/社政類型產生流水號；大量併發審核時仍需依 unique index 防重。
- QR Code payload 目前先存網址字串，尚未輸出 PNG/SVG。

## User-Facing Impact

- 第一階段主要是資料底層準備，前台畫面不會有明顯變化。
- 後續審核通過後，資料庫會開始保存正式訪員編碼與 QR Code payload。
- 第二階段已讓後台可以對已通過訪員發送或重寄登入邀請。

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement first-stage identity and profile-completion data foundation | Supabase migration, domain types, registration review mapping | Persisted codes and workflow statuses |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- 0027 migration 可新增登入邀請、資料補完、訪員編碼與 QR Code 欄位。
- 註冊送出資料會寫入 `registration_code` 與 profile completion 狀態。
- 訪員審核通過後會在 `visitor_profiles` 寫入 `visitor_code` 與 `qr_code_payload`。
- 後台已通過訪員名冊可發送登入邀請並更新邀請狀態。
- 程式型別、lint、build 都通過。

## Verification

- [x] `npm run typecheck -- --pretty false`
- [x] `npm run lint`
- [x] `npm run build`

## Lessons to Capture

- 訪員註冊審核通過不等於可登入；登入邀請、資料補完、可派案狀態要分開管理。

## Completion Notes

- What changed: 新增 0027 migration、更新 Supabase README、補上註冊/審核資料映射與訪員編碼產生，並新增已通過訪員登入邀請 API 與後台操作。
- What was verified: typecheck、lint、build。
- What remains undecided: 邀請信點擊後的設定密碼頁、志工可自行補資料欄位最終清單、QR Code 掃描後公開或登入後查看。

## Phase 2 Notes

- Added backend invitation endpoint for approved visitors.
- Added invite and resend actions in the approved visitor registry.
- Successful Supabase Auth invites update `auth_invite_status`, `auth_invited_at`, and `accounts.auth_user_id`.
- The actual set-password callback page remains a follow-up.
