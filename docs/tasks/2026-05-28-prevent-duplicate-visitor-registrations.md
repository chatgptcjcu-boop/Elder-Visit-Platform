# Task Brief: Prevent duplicate visitor registrations

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

避免訪員重複註冊再次造成「已通過申請數」與「正式訪員名冊數」不一致，並讓後台統計與匯出以正式訪員資料為準。

## Scope

### In scope

- 公開註冊送出前，先查同工作空間是否已有相同信箱、公務信箱、身分證字號或手機。
- 若已存在正式訪員或待審 / 已通過申請，回覆清楚的使用者訊息並停止新增。
- 使用者管理工作台的正式名冊、待邀請、待啟用、待補資料、可派案與匯出來源改以正式訪員編碼為準。
- 新增 Supabase 查重索引 migration，避免大量資料下查詢變慢。

### Out of scope

- 不清除既有歷史重複申請資料，既有資料清理由人工 SQL 已另行處理。
- 不新增強制唯一限制，避免現有歷史資料導致 migration 失敗。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/rbac-auth-plan.md`
- Related files: `lib/domain/user-management.ts`, `components/workspace/users-panel.tsx`, `supabase/README.md`, `LESSONS.md`

## Likely Files

- `lib/domain/user-management.ts`
- `components/workspace/users-panel.tsx`
- `supabase/migrations/0032_registration_duplicate_guards.sql`
- `supabase/README.md`
- `LESSONS.md`

## Risks / Ambiguities

- 申請表仍保留歷史重複資料，因此正式名冊統計不可再直接使用 raw registration request count。
- 直接加 unique constraint 可能因既有資料衝突而失敗，本次先採查重邏輯與索引輔助。
- 正式資料庫仍需在 Supabase SQL Editor 執行 `0032`，本地程式修改不等於資料庫已套用。

## User-Facing Impact

- 重複註冊時會直接提示「已有待審 / 已通過申請」或「已有正式訪員」，不會再新增第二筆。
- 使用者管理頁的正式名冊、匯出 CSV、照片 ZIP 與存摺附件 ZIP 不再混入沒有正式訪員編碼的歷史申請。

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement duplicate guard and formal roster source | Domain + users panel + migration | Working change |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- 新註冊若撞到正式訪員資料，必須停止新增並顯示可理解訊息。
- 新註冊若撞到未退回的既有申請，必須停止新增並顯示可理解訊息。
- 後台正式名冊與匯出只列入有正式訪員編碼的已通過資料。
- Supabase README 包含新 migration 執行順序。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`

## Lessons to Capture

- 已補上「Public registration must check duplicates before insert」。

## Completion Notes

- What changed: 註冊前查重、正式名冊統計來源修正、Supabase 查重索引 migration。
- What was verified: typecheck、lint、build。
- What remains undecided: 正式資料庫需由使用者在 Supabase SQL Editor 執行 `0032_registration_duplicate_guards.sql`。
