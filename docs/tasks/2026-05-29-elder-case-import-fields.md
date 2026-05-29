# Task Brief: Add elder case import fields

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

補齊老人個案名冊欄位，讓新北市/永和區獨老個案清冊中的重要資料不會在匯入時遺失，並先提出分批匯入子系統規劃供確認。

## Scope

### In scope

- 新增 `elder_cases` 匯入保存欄位 migration。
- 更新 `ElderCase` 型別與 Supabase repository 欄位讀取。
- 更新匯入預覽欄位對應提示。
- 建立分批匯入子系統規劃文件。

### Out of scope

- 本次不建立正式匯入批次資料表與 commit API。
- 本次不把 Excel 寫入正式資料庫。
- 本次不發布到正式站。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/elder-case-batch-import-plan.md`
- Related files: `supabase/migrations/0033_elder_case_import_fields.sql`, `lib/domain/types.ts`, `lib/repositories/supabase.ts`, `lib/domain/imports.ts`

## Likely Files

- `supabase/migrations/0033_elder_case_import_fields.sql`
- `lib/domain/types.ts`
- `lib/repositories/supabase.ts`
- `lib/domain/imports.ts`
- `supabase/README.md`
- `docs/elder-case-batch-import-plan.md`

## Risks / Ambiguities

- 使用者提供的「無密碼」檔案實際仍是 `CDFV2 Encrypted`，系統正式匯入需要密碼處理或要求另存為真正標準 `.xlsx`。
- `訪視結果` 與 `訪員姓名` 應保留為匯入來源欄位，不應直接覆蓋正式訪視紀錄或派案紀錄。

## User-Facing Impact

- 後續個案名冊匯入可保存性別、Line、緊急聯絡人、戶籍/居住地址與來源追蹤資料。

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | Schema, types, repository, import hints | Working change |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- `0033` 新增欄位涵蓋 Excel 重要欄位。
- 既有個案名冊與派案讀取不因新增欄位而中斷。
- 分批匯入子系統規劃清楚說明批次狀態、欄位對應、檢核與寫入流程。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`

## Lessons to Capture

- 已新增政府 Excel 匯入前要確認真實檔案容器的經驗。

## Completion Notes

- What changed: 新增 `0033` migration、個案型別與 Supabase 讀取欄位、匯入欄位提示、分批匯入規劃文件。
- What was verified: `npm run typecheck -- --pretty false`、`npm run lint`、`NPM_CONFIG_CACHE=/tmp/codex-npm-cache npm run build`。
- What remains undecided: 分批匯入子系統尚待使用者確認後再建表與開發 commit API。
