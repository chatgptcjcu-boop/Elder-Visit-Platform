# Task Brief: Formal visitor registration and photos

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

讓訪員註冊、後台核准與個人補資料都走正式 Supabase 寫入流程；註冊自拍照必須可由手機拍攝或相簿選取，存摺照片必須以較小、黑白、節省空間的方式保存。

## Scope

### In scope

- 訪員註冊送出必須正式寫入 Supabase，失敗時清楚提示，不再假裝送出成功。
- 後台「核准加入」必須更新正式 Supabase 註冊資料，不能再對展示資料做假核准。
- 註冊自拍證件照改為必填，可拍照或選擇手機照片，先保存小尺寸預覽。
- 個人補資料的存摺照片改為 image-only，上傳前縮小、轉黑白並壓縮。
- API 端拒絕過大的存摺照片資料，降低長期收 200 多位志工時的儲存風險。

### Out of scope

- AI 去背、白底證件照精修與外部影像 AI 服務串接。
- Supabase Storage 或 Google Drive 附件長期保存架構。
- 批次匯出照片包與批次審核流程。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/rbac-auth-plan.md`
- Related files:
  - `lib/domain/user-management.ts`
  - `components/workspace/users-panel.tsx`
  - `components/visitor/visitor-profile-panel.tsx`
  - `app/api/users/visitor-registration/route.ts`
  - `app/api/users/route.ts`
  - `app/api/visitor/profile/route.ts`

## Likely Files

- `lib/domain/user-management.ts`
- `lib/domain/types.ts`
- `components/workspace/users-panel.tsx`
- `components/visitor/visitor-profile-panel.tsx`
- `app/api/users/visitor-registration/route.ts`
- `app/api/users/route.ts`
- `app/api/visitor/profile/route.ts`

## Risks / Ambiguities

- 現階段仍以資料 URL 保存照片，長期大量使用建議下一階段改接 Supabase Storage。
- 手機相機壓縮品質需在清晰度與儲存大小之間取平衡。
- 若正式環境缺少 Supabase service role key，註冊與核准會正確失敗，需要由後台環境變數修正。

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

- 訪員註冊缺少自拍證件照時不能送出。
- 註冊 API 寫入 Supabase 失敗時回傳錯誤，不產生記憶體 fallback 成功狀態。
- 使用者管理頁在 Supabase 已設定時只顯示正式資料庫註冊資料，不混入展示資料。
- 後台核准加入若無法寫入 Supabase，畫面收到錯誤狀態。
- 存摺照片只接受圖片，前端會壓縮成黑白小尺寸 JPEG，後端拒絕非圖片或過大資料。

## Verification

- [x] `npm run typecheck -- --pretty false`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed

## Lessons to Capture

- 大量志工註冊流程不能再用 fallback 成功狀態，正式環境缺少資料庫寫入能力時應明確失敗。

## Completion Notes

- What changed: 註冊與審核改為正式 Supabase 寫入；自拍證件照必填；存摺照片改為黑白壓縮保存。
- What was verified: typecheck、lint、build 均通過。
- What remains undecided: 長期照片附件是否改用 Supabase Storage 或外部雲端目錄。
