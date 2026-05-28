# Task Brief: Batch approve visitor registrations

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

承辦管理者可在使用者管理的待審核頁，一次核准目前所有待審核訪員，不必逐筆翻卡按「核准加入」。

## Scope

### In scope

- 新增批次核准 API，沿用逐筆審核的 Supabase 寫入、帳號、工作空間成員與訪員檔案建立邏輯。
- 在待審核翻卡區加入「整批核准」操作與確認提示。
- 批次完成後重新載入名冊與儀表板數字，避免畫面停留在舊狀態。
- 防止批次處理中重複送出。

### Out of scope

- 批次退回。
- 自動寄送登入邀請。
- 依條件勾選部分核准。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/visitor-login-profile-completion-plan.md`
- Related files: `components/workspace/users-panel.tsx`, `lib/domain/user-management.ts`, `app/api/users/route.ts`

## Likely Files

- `components/workspace/users-panel.tsx`
- `lib/domain/user-management.ts`
- `lib/domain/types.ts`
- `app/api/users/batch-review/route.ts`

## Risks / Ambiguities

- 整批核准屬於高影響操作，需要明確顯示將處理的筆數與完成結果。
- 必須沿用逐筆審核邏輯，避免 batch 寫入與單筆審核產生不同狀態。
- 若部分資料已被其他管理者審核，批次結果需能回報成功、略過與失敗筆數。

## User-Facing Impact

- Visible UI impact expected.

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | User management UI, batch review API, review domain logic | Working change |
| Design / UX Agent | Review hierarchy, copy, color, icons, and field usability | Visible UI only | Design review notes / corrections |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- 待審核頁有整批核准入口，顯示目前待核准筆數。
- 按下整批核准前有確認提示。
- 整批核准會將所有待審核申請轉為已通過，並建立原本逐筆核准會建立的帳號、成員與訪員資料。
- 批次處理中按鈕停用，不會重複送出。
- 完成後使用者管理儀表板數字與待審核翻卡內容更新。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed

## Lessons to Capture

- 大量審核功能必須共用逐筆審核邏輯，避免批次路徑繞過治理狀態更新。

## Completion Notes

- 實際修改：新增整批核准 API 與待審核頁操作鈕，批次核准共用逐筆審核邏輯並回報成功、略過與失敗筆數。
- 已完成驗證：`npm run typecheck -- --pretty false`、`npm run lint`、`NPM_CONFIG_CACHE=/tmp/codex-npm-cache npm run build`。
- 設計判斷：整批核准放在待審核翻卡標題列，明確顯示筆數、處理中狀態與後續仍需寄送邀請的提醒，避免和逐筆核准混淆。
- 尚待後續決策：是否再加「勾選部分核准」與「批次退回」。
