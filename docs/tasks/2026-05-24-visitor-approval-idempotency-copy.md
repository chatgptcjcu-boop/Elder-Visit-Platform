# Task Brief: Fix visitor approval idempotency and user-facing copy

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

讓承辦管理者在手機上核准訪員申請時，可明確看到完成狀態且不會因重複點擊造成重複啟動流程；一般操作畫面僅顯示業務語言，不暴露資料庫實作名稱。

## Scope

### In scope

- 將已核准或已退回申請視為不可重複執行的終態。
- 避免同一審核動作因連點或請求重送而重複啟動成員與訪員資格建立。
- 待審卡片處理期間鎖定操作，成功後自動從待審佇列移除。
- 將審核、註冊與資格確認區的可見訊息改為業務用語。

### Out of scope

- QR Code 圖檔、查驗頁與正式網址修正。
- 既有資料庫中疑似重複申請的實際刪除或合併。
- 正式發布與線上部署。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/visitor-login-profile-completion-plan.md`
- Related files: `lib/domain/user-management.ts`, `components/workspace/users-panel.tsx`, `app/api/users/verify-visitor-profile/route.ts`

## Likely Files

- `lib/domain/user-management.ts`
- `components/workspace/users-panel.tsx`
- `app/api/users/verify-visitor-profile/route.ts`
- `LESSONS.md`

## Risks / Ambiguities

- 如果只限制前端按鈕而不限制後端，手機連點或網路重送仍可能重複執行。
- 現有重複顯示可能包含重複申請或測試帳號，需要另以資料查詢判定，不能直接刪除。

## User-Facing Impact

- Visible UI impact expected.

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement approval terminal-state handling and UI response | Domain and users panel | Working change |
| Design / UX Agent | Review action feedback and user-facing copy | Users panel messages | Clear business wording |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- 已完成審核的申請再次操作時，不再建立或更新成員關係。
- 成功核准後該申請立即離開待審卡片佇列，繼續下一筆。
- 審核操作執行期間，核准、退回與略過操作皆不可再次觸發。
- 一般使用者可見訊息不出現 `Supabase`、`workspace_membership` 或 `visitor_profiles`。
- 型別檢查、lint 與 production build 通過。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed

## Lessons to Capture

- 審核類動作必須同時具備後端冪等與前端明確完成狀態，不能依賴使用者不重複點擊。

## Completion Notes

- 已完成修改：審核 API 將已完成決策視為終態，條件式狀態更新可阻止同一筆同時重送；使用者管理將結果改為短暫通知並移除可見技術用語。
- 已執行驗證：型別檢查、lint、production build、關鍵文案掃描與本機路由載入通過；本機資料無已通過申請，因此未以正式資料執行重送核准。
- 後續待確認：既有重複資料是否存在仍應另以正式資料查詢確認；QR Code 圖檔與查驗頁不在本次範圍。
