# Task Brief: Bulk visitor management

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

讓承辦管理者面對 200 多位志工時，可以用狀態分頁、搜尋、勾選與批次作業快速處理，不需要在一條很長的名單中逐筆判斷。

## Scope

### In scope

- 已通過訪員名冊增加狀態分頁。
- 支援目前清單全選、單筆勾選與批次操作。
- 批次發送登入邀請、批次確認可派案。
- 匯出功能可依已勾選名單輸出。

### Out of scope

- 真正 ZIP 照片包產生。
- Supabase Storage 正式附件搬移。
- 待審核申請的批次核准與批次退回。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/visitor-login-profile-completion-plan.md`
- Related files:
  - `components/workspace/users-panel.tsx`
  - `lib/domain/types.ts`

## Likely Files

- `components/workspace/users-panel.tsx`
- `docs/tasks/2026-05-21-bulk-visitor-management.md`
- `LESSONS.md`

## Risks / Ambiguities

- 批次操作若沒有明確範圍，管理者可能誤以為只處理勾選資料；介面需說明未勾選時會套用目前分頁與搜尋結果。
- 手機版必須避免表格比例過寬，需維持卡片式勾選。

## User-Facing Impact

- Visible UI impact expected.

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | `components/workspace/users-panel.tsx` | Working change |
| Design / UX Agent | Review hierarchy, copy, color, icons, and field usability | Visible UI only | Design review notes / corrections |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- 已通過訪員名冊有「全部、待發邀請、待補/待確認、待匯款確認、已可派案」分頁。
- 手機卡片與桌機表格都能勾選資料。
- 未勾選時，批次按鈕套用目前篩選結果；有勾選時，只套用勾選資料。
- 匯出 CSV / 照片索引 / JSON 會優先使用已勾選資料。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed

## Lessons to Capture

- 大量名冊管理應先用狀態分頁與批次範圍說明降低誤操作。

## Completion Notes

- 實際改動：已通過訪員名冊加入狀態分頁、勾選、批次邀請、批次確認與勾選匯出。
- 驗證結果：`npm run typecheck -- --pretty false`、`npm run lint`、`npm run build`。
- 未決事項：ZIP 照片包與 Supabase Storage 正式附件儲存仍待後續階段。
