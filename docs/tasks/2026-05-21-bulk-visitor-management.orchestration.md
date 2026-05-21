# Orchestration Plan: Bulk visitor management

Source brief: `docs/tasks/2026-05-21-bulk-visitor-management.md`

## 繁體中文說明

這份文件是任務的半自動編排建議。它會根據 task brief 的內容，幫你先判斷：

- 這次需要哪些 Agent
- 開始前要補哪些資訊
- 哪些文件要一起檢查
- 任務收尾前要完成哪些確認

## Recommended Roles

1. **Planner / Lead** — confirm goal, scope, and acceptance criteria.
2. **Builder** — implement the functional change.
3. **Design / UX Agent** — review visual hierarchy, icon use, copy, and mobile usability.
4. **Reviewer / QA** — verify edge cases and requirement fit.
5. **Release / Ops** — run release checks and confirm live state.

## Why These Roles Were Selected

- UI-sensitive work detected: **yes**
- PWA / home-screen work detected: **no**
- Release-sensitive work detected: **yes**

## Before Starting

- [x] Goal and acceptance criteria are filled in.
- [x] Likely files are listed.
- [x] Risks / ambiguities are explicit.
- [x] Existing product language to preserve is identified.

## Documents to Review or Update

- `AGENTS.md`
- `LESSONS.md`
- `RELEASE-CHECKLIST.md`
- `DESIGN-SYSTEM.md`

## Suggested Execution Order

1. Complete the task brief.
2. Confirm whether any workstreams can truly run in parallel.
3. Implement the builder scope.
4. Run Design / UX review.
5. Run PWA review only if installability changed.
6. Run Reviewer / QA checks.
7. Run Release / Ops checks if shipping is intended.
8. Capture durable lessons before closing the task.

## Before Closing

- [x] `npm run typecheck` completed.
- [x] `npm run lint` completed.
- [x] `npm run build` completed.
- [x] Durable lessons were considered for `LESSONS.md`.
- [x] Design / UX review completed.
- [x] Local verification and live deployment state were reported separately.

## Completion Summary

1. 已通過訪員名冊改成可分頁、勾選與批次處理。
2. 已完成 `typecheck`、`lint`、`build`。
3. 設計判斷：大量名冊先用狀態分頁降低資訊量，批次操作清楚標示作用範圍。
4. 經驗已補入 `LESSONS.md`。
5. 後續仍可補 ZIP 照片包與 Supabase Storage 正式附件儲存。
