# Task Brief: Yonghe 75 plus demo import 100

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

先建立永和區 75 歲以上名冊的前 100 筆試匯入批次，讓派案、訪視、表單與後續核銷流程可以先用真實清冊欄位驗證，確認順利後再處理完整清冊匯入。

## Scope

### In scope

- 依使用者指定規則產生個案編碼：`YH-115-075-000001` 起跳。
- 建立 100 筆永和區 75 歲以上清冊試匯入個案。
- 建立對應訪視排程，讓訪員端可看到任務。
- 補上永和區民政與社政測試訪員，讓派案推薦可以依區域與身分匹配。
- 保留匯入批次碼與來源工作表資訊，方便日後替換成正式清冊資料。

### Out of scope

- 本次不匯入完整 7,000 多筆名冊。
- 本次不直接寫入正式 Supabase 個案資料表。
- 本次只接前 100 筆，不匯入其餘 7,057 筆。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc:
- Related files: `lib/domain/yh-75-demo-data.ts`, `lib/domain/mock-data.ts`, `lib/domain/assignments.ts`

## Likely Files

- `lib/domain/yh-75-demo-data.ts`
- `lib/domain/mock-data.ts`
- `lib/domain/assignments.ts`

## Risks / Ambiguities

- 使用者後續提供的 `1150528_(永和區)獨老個案清冊_無加密.xlsx` 已可解析。
- 試匯入資料必須明確標記批次與來源列號，避免後續完整匯入時無法追溯。
- 派案流程需要可用的永和訪員，否則推薦分數會因跨區或身分不符而失真。

## User-Facing Impact

- 管理端與訪員端會多看到 100 筆永和 75 歲以上試匯入任務，用於流程壓測與派案驗證。

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | `lib/domain/yh-75-demo-data.ts`, `lib/domain/mock-data.ts`, `lib/domain/assignments.ts` | Working 100-record pilot batch |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- 系統存在 100 筆 `YH-115-075-*` 試匯入個案。
- 第一筆編碼為 `YH-115-075-000001`，第 100 筆為 `YH-115-075-000100`。
- 每筆測試個案都有對應訪視排程。
- 派案推薦可找到永和區民政或社政測試訪員。
- 型別檢查、lint 與 build 通過。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`

## Lessons to Capture

- 大量清冊先以 100 筆試匯入驗證流程，確認欄位、派案與訪視都順再進完整匯入。

## Completion Notes

- What changed: Added a marked 100-record Yonghe 75-plus pilot batch from the unencrypted workbook, connected it to mock case data and visit schedules, and added Yonghe civil/social demo visitors for assignment scoring.
- What was verified: The code rule, batch marker, typecheck, lint and production build all passed locally.
- What remains undecided: The remaining 7,057 rows are intentionally not imported yet; full import should wait until the 100-record pilot flow is reviewed.
