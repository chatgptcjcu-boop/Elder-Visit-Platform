# Task Brief: Visitor activation and remittance workflow hardening

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

把訪員從「核准註冊」到「啟用登入、補齊匯款資料、確認可派案」整理成可追蹤且不會誤操作的正式流程，並將敏感的存摺附件改為私有檔案保存。

## Scope

### In scope

- 後台已通過訪員清單增加清楚的待邀請、待啟用、待補資料、可派案狀態分流。
- 已寄邀請與已啟用訪員的操作防呆、邀請時間及累計寄送次數提示。
- QR Code payload 改用正式站台網址設定，並提供既有資料更新 migration。
- 確認可派案 API 加入必要資料與帳號啟用檢核。
- 存摺封面以 Supabase 私有 Storage 保存，保留既有 inline 資料相容讀取。
- 後台以獨立受權限控制 ZIP 匯出存摺附件，附件檔名採訪員正式編碼並附匯款附件索引。

### Out of scope

- AI 證件照去背或美化。
- 郵件範本視覺客製化與簡訊通知。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/visitor-login-profile-completion-plan.md`
- Related files: `supabase/migrations/0027_visitor_identity_profile_completion.sql`, `supabase/migrations/0028_visitor_remittance_documents.sql`, `supabase/migrations/0029_visitor_headshot_storage.sql`

## Likely Files

- `components/workspace/users-panel.tsx`
- `lib/domain/user-management.ts`
- `app/api/users/verify-visitor-profile/route.ts`
- `app/api/visitor/profile/route.ts`
- `app/api/users/export-passbooks/route.ts`
- `lib/domain/visitor-documents.ts`
- `supabase/migrations/0030_visitor_remittance_storage_qr_site.sql`
- `supabase/README.md`

## Risks / Ambiguities

- 已寄出的邀請必須留下寄送次數、允許管理者明確重寄，但不可讓已啟用帳號重新收到啟用邀請。
- 既有存摺 inline data 需相容，避免 migration 前的資料無法讀取。
- 正式站台網址未來可能更換，因此新資料需使用環境設定而非再次寫死舊 host。

## User-Facing Impact

- Visible UI impact expected.

## Product Language to Preserve

- 使用既有 `care_mint` 綠色層次與精簡卡片密度，不新增突兀的警示色面板。
- 將操作名稱維持為業務語言：「待邀請」、「待啟用」、「待補資料」、「可派案」，不向使用者顯示資料表或 API 名稱。

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement activation status, eligibility validation and private remittance storage | Application and migration files listed above | Working change |
| Design / UX Agent | Review hierarchy, copy, color, icons, and field usability | Visible UI only | Design review notes / corrections |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |

## Acceptance Criteria

- 後台能分辨核准後仍待寄信、待啟用、待補資料及可派案的人數與清單。
- 已啟用訪員不可重寄登入邀請；已寄送未啟用者重寄前有明確提示，且後台可看到寄送次數。
- 未完成啟用、證件照、教育訓練、聯絡資料、銀行與存摺資料者無法被確認為可派案。
- 訪員新上傳的存摺照片優先寫入私有 Storage；舊 inline 照片仍可正常顯示狀態。
- 存摺附件可由後台以獨立 ZIP 匯出，不與證件照混包，並在匯出前提示敏感資料用途限制。
- 新產生 QR Code 使用 `NEXT_PUBLIC_APP_URL` 或正式站台預設值，migration 可更新舊 Netlify payload。

## Verification

- [x] `npm run typecheck -- --pretty false`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed

## Lessons to Capture

- 將「核准」與「可派案」區分，敏感匯款附件必須用私有檔案保存。

## Completion Notes

- Implemented: 後台狀態與操作改為五段流程；邀請增加寄送次數紀錄與啟用後重寄阻擋；可派案由 API 檢核資料齊備；存摺附件改以私有 Storage 優先保存並可獨立 ZIP 匯出；QR Code 改用正式網址設定。
- Verified: `npm run typecheck -- --pretty false`、`npm run lint`、`git diff --check`、`npm run build` 通過；本機確認未登入導回登入頁及管理頁狀態文字可載入。
- Pending release actions: 確認正式 Supabase 已執行 `0030_visitor_remittance_storage_qr_site.sql` 且部署環境具備 `NEXT_PUBLIC_APP_URL` 後，推送並部署至 Vercel，再完成測試註冊與邀請啟用流程。
