# Task Brief: Visitor headshot storage and photo export

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

讓訪員可以在手機明確選擇拍照或相簿上傳證件照，並讓承辦匯出名冊時取得以正式訪員編碼命名的照片檔案包，而不是資料字串。

## Scope

### In scope

- 註冊證件照提供「啟動相機」與「從相簿選擇」兩個明確入口。
- 新增私有 Supabase Storage bucket，讓新上傳證件照可保存為 JPG 檔案。
- 新增以訪員編碼命名的照片 ZIP 匯出，並附照片索引 CSV。
- 保持既有資料欄位照片可匯出，讓尚未搬移的舊資料不失效。
- 移除 CSV / JSON 直接夾帶影像資料字串的匯出設計。

### Out of scope

- AI 去背、白底重製與證件照智能修圖。
- 舊照片資料的批次搬移作業。
- 存摺附件 Storage 搬移。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/visitor-login-profile-completion-plan.md`
- Related files:
  - `components/workspace/users-panel.tsx`
  - `lib/domain/user-management.ts`
  - `app/api/users/export-headshots/route.ts`
  - `supabase/migrations/0029_visitor_headshot_storage.sql`

## Likely Files

- `components/workspace/users-panel.tsx`
- `lib/domain/user-management.ts`
- `lib/domain/visitor-headshots.ts`
- `app/api/users/export-headshots/route.ts`
- `supabase/migrations/0029_visitor_headshot_storage.sql`
- `supabase/README.md`

## Risks / Ambiguities

- Storage migration 尚未在正式 Supabase 執行前，新註冊必須維持原有可寫入行為。
- 照片是個資，bucket 必須為私有，且下載必須受使用者管理權限保護。
- 舊資料仍以 data URL 保存，ZIP 匯出必須兼容舊、新兩種來源。

## User-Facing Impact

- Visible UI impact expected.

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement private photo storage, ZIP export, and mobile photo input | `lib/domain/visitor-headshots.ts`, `app/api/users/export-headshots/route.ts`, `components/workspace/users-panel.tsx` | Working change |
| Design / UX Agent | Review hierarchy, copy, color, icons, and field usability | Visible UI only | Design review notes / corrections |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Run final checks and confirm deploy state | Release path | Verified release status |

## Acceptance Criteria

- 手機註冊畫面同時顯示相機與相簿選擇操作。
- 執行 `0029` migration 後，新證件照會優先寫入私有 Storage，列表仍可預覽。
- 已通過名冊可下載 ZIP，照片檔名使用 `訪員正式編碼_證件照.jpg`。
- 匯出 ZIP 僅允許具有使用者管理權限的人員操作。
- 尚未搬移的 data URL 照片仍可被 ZIP 正確輸出。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed
- [x] Release state checked separately from local build success

## Lessons to Capture

- 敏感影像不得以大型資料字串作為正式匯出格式，應以私有檔案儲存配合授權匯出。

## Completion Notes

- What changed: 註冊證件照新增相機/相簿入口；後台增加受權限保護的證件照 ZIP 匯出；新增私有 Storage bucket migration；新照片可優先轉存 Storage，舊 data URL 仍可匯出。
- What was verified: `npm run typecheck -- --pretty false`、`npm run lint`、`npm run build`；本地 `/register` 可看到兩種照片入口；訪員角色呼叫 ZIP 匯出 API 回傳 403；Vercel 線上 `/register` 已顯示相簿入口；線上 ZIP 實際包含 `證件照/EV-115-YH-CIV-1150_證件照.jpg`。
- What remains undecided: 正式 Supabase 尚需執行 `0029` 以啟用新照片的私有 Storage 落檔；其後是否另安排既有照片批次搬移；AI 去背仍屬後續階段。
