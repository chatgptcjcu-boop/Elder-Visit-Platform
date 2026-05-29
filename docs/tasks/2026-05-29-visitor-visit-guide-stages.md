# Task Brief: Visitor visit guide stages

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

把《獨居長者普查訪視指南》轉成訪員訪視頁內的分階段導覽，讓訪員依現場對話順序操作，而不是只看到一長串表單欄位。

## Scope

### In scope

- 新增訪視前行政確認、四階段訪談、現場觀察任務的導覽資料。
- 將導覽放入訪員訪視頁，並連到對應的關懷表區段與同意書區段。
- 將同意範圍按鈕改成中文顯示。
- 更新流程文件與可重複使用的開發經驗。

### Out of scope

- 不新增資料庫欄位。
- 不變更正式送出 API、稽核 API 或核銷計算。
- 不處理線上部署。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/new-taipei-care-form-workflow.md`
- Related files: `components/visitor/visit-dialogue-form.tsx`, `lib/domain/visit-guide.ts`

## Likely Files

- `lib/domain/visit-guide.ts`
- `components/visitor/visit-dialogue-form.tsx`
- `docs/new-taipei-care-form-workflow.md`
- `LESSONS.md`

## Risks / Ambiguities

- 訪員頁已經有較多內容，新增導覽必須使用百葉窗，避免手機版更長更亂。
- PDF 指南是操作話術與觀察提醒，不應直接取代表單必填檢核。
- 同意書與健康資料串聯需要中文化，但不能改變既有儲存值。

## User-Facing Impact

- Visible UI impact expected.

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | To be filled after inspection | Working change |
| Design / UX Agent | Review hierarchy, copy, color, icons, and field usability | Visible UI only | Design review notes / corrections |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- 訪員訪視頁上方顯示「訪視指南」。
- 導覽包含訪視前行政確認、四個訪談階段與現場觀察任務。
- 每個階段提供建議開場、對應填表區與檢核重點。
- 導覽可收合展開，手機版不一次攤開所有內容。
- 關懷表、同意書、未遇照片定位與送出流程仍維持原本可用。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed

## Lessons to Capture

- What should be added to `LESSONS.md` if this task reveals a durable project rule?

## Completion Notes

- What changed: 新增訪視指南資料與訪員頁分階段導覽，更新同意範圍中文標籤與流程文件。
- What was verified: `npm run typecheck -- --pretty false`、`npm run lint`、`NPM_CONFIG_CACHE=/tmp/codex-npm-cache npm run build`。
- What remains undecided: 是否將每個導覽階段加入可勾選完成狀態，或把階段完成紀錄寫入正式資料庫。
