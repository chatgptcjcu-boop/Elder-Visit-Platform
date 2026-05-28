# Task Brief: Backfill approved visitor records

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

補齊改版前或批次核准後已通過訪員的正式資料，讓「已通過名單、工作空間訪員身分、訪員正式資料」三層資料一致，避免後台名冊漏人。

## Scope

### In scope

- 新增 Supabase migration，從已核准的訪員註冊申請補齊 `accounts`、`workspace_memberships`、`visitor_profiles`。
- 回寫缺漏的 `visitor_code` 與 `qr_code_payload`。
- 放寬後台使用者管理讀取上限，避免 100 筆限制造成名單誤判。
- 更新 Supabase README 與 durable lesson。

### Out of scope

- 不直接修改正式資料庫；由使用者在 Supabase SQL Editor 執行 migration。
- 不變更審核 UI 流程與 email 邀請流程。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/visitor-login-profile-completion-plan.md`
- Related files:
- `lib/domain/user-management.ts`
- `supabase/migrations/0031_backfill_approved_visitor_records.sql`
- `supabase/README.md`

## Likely Files

- `lib/domain/user-management.ts`
- `supabase/migrations/0031_backfill_approved_visitor_records.sql`
- `supabase/README.md`
- `LESSONS.md`

## Risks / Ambiguities

- 補齊 SQL 必須只處理已核准訪員，避免把待審或退回資料誤建成正式訪員。
- 既有資料可能已部分建立，migration 必須可重複執行且不造成 duplicate membership/profile。
- 訪員編碼需避開既有 `visitor_code` unique index。

## User-Facing Impact

- 後台已通過名單會更接近正式資料庫狀態，改版前核准的訪員可被正式名冊與後續派案流程看見。

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | Supabase migration, user management data limit, docs | Working reconciliation change |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- 已核准訪員缺 `account_id` 時會補齊對應 `accounts` 並回寫。
- 已核准訪員缺 `workspace_memberships` 時會補齊 active visitor membership。
- 已核准訪員缺 `visitor_profiles` 時會建立正式訪員資料、訪員編碼與 QR。
- 已有資料不重複建立，migration 可再次執行。
- 使用者管理頁不再只抓最新 100 筆。

## Verification

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`

## Lessons to Capture

- What should be added to `LESSONS.md` if this task reveals a durable project rule?

## Completion Notes

- What changed:
- What was verified:
- What remains undecided:
