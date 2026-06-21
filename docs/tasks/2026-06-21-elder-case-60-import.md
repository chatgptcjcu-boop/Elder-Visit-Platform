# Task Brief: 完成個案名冊 60 筆匯入流程

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

讓管理者可把 `派案訪視測試資料_合併60筆.csv` 完整解析、檢核欄位對應，並在確認後正式寫入 Supabase 老人個案名冊，用於後續派案與訪視流程測試。

## Scope

### In scope

- CSV 完整 60 筆解析，不再只預覽前 5 筆。
- 建立測試檔欄位到 `elder_cases` 的正式欄位對應。
- 寫入時保留原始匯入資料到 `raw_import_data`。
- 寫入時以工作空間與個案編碼查重，避免重複新增。
- 在名冊匯入 UI 增加正式寫入按鈕與結果回饋。

### Out of scope

- 本次不直接批次建立派案排程。
- 本次不新增資料庫 migration，優先使用既有 `0033_elder_case_import_fields.sql` 欄位。
- 本次不自動部署線上環境。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/development-plan-v2.4.md`
- Related files: `lib/domain/imports.ts`, `components/import/import-preview-tool.tsx`, `app/api/import/commit/route.ts`

## Likely Files

- `lib/domain/imports.ts`
- `components/import/import-preview-tool.tsx`
- `app/api/import/commit/route.ts`

## Risks / Ambiguities

- CSV 年齡沒有出生年月日，正式寫入時以年齡估算 `birth_date` 的年度，並在 `raw_import_data` 標記 `birth_date_basis`。
- 測試資料的中老里別覆蓋未完全等同原先抽樣描述，但不影響匯入流程測試。
- 寫入流程依賴正式環境的 `SUPABASE_SERVICE_ROLE_KEY`。

## User-Facing Impact

- 管理者在名冊匯入頁可看到完整筆數、欄位對應、檢核結果，並手動確認後寫入名冊。

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | Import parser, import UI, import API | Working change |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Run final checks and confirm deploy state | Release path | Verified release status |

## Acceptance Criteria

- CSV 解析顯示總筆數 60、可匯入 60、需修正 0。
- 欄位對應包含測試編號、個案類型、姓名、年齡、戶籍里、訪視地址、主要電話、備用電話、派案優先級等欄位。
- 正式寫入會略過資料庫已存在的相同個案編碼。
- `npm run typecheck`、`npm run lint`、`npm run build` 通過。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [ ] Release state checked separately from local build success

## Lessons to Capture

- 匯入預覽不能只檢查前幾筆，正式匯入前必須以完整資料列做 validation。

## Completion Notes

- What changed: 完整 CSV 解析、60 筆檢核、正式寫入 API、匯入 UI 寫入按鈕與結果回饋。
- What was verified: 本地解析 60/60 通過，typecheck/lint/build 通過。
- What remains undecided: 線上部署與實際 Supabase 寫入需由管理者在正式環境按下確認寫入，或後續指定由代理代為測試。
