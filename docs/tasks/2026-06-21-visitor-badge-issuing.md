# Task Brief: 訪員證發證列印與電子證

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

讓承辦管理者可對已通過訪員產生正式訪員證，支援紙本列印、公開 QR 查驗，以及訪員掃描紙本 QR 後輸入序號領取手機電子證。

## Scope

### In scope

- 新增 `visitor_badges` 發證資料表與發證快照。
- 後台使用者管理新增批次發證與列印入口。
- 建立紙本列印頁，可用瀏覽器列印或另存 PDF。
- 建立公開訪員證查驗頁。
- 建立掃 QR 後輸入序號領取電子證流程。
- 電子證可在手機上輸出 PNG 圖檔。

### Out of scope

- 本階段不做精準 A4 專用紙張版型管理。
- 本階段不接實體製卡廠或大量郵寄流程。
- 本階段不做離線錢包憑證。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/rbac-auth-plan.md`
- Related files: `components/workspace/users-panel.tsx`, `lib/domain/visitor-badges.ts`, `supabase/migrations/0034_visitor_badges.sql`

## Likely Files

- `supabase/migrations/0034_visitor_badges.sql`
- `lib/domain/visitor-badges.ts`
- `app/api/users/visitor-badges/route.ts`
- `app/api/badges/claim/route.ts`
- `app/verify/visitor/[visitor_code]/page.tsx`
- `app/badge/claim/[token]/page.tsx`
- `app/workspace/users/badges/print/page.tsx`
- `components/badges/*`
- `components/workspace/users-panel.tsx`

## Risks / Ambiguities

- 發證功能依賴 `visitor_profiles` 已有 `visitor_code` 與大頭照。
- QR 領取 token 只存在雜湊，使用者必須保留紙本序號才能領取電子證。
- 線上使用前需先執行 `0034_visitor_badges.sql` migration。

## User-Facing Impact

- Visible UI impact expected.

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | Visitor badge data, API, pages and user management UI | Working change |
| Design / UX Agent | Review hierarchy, copy, color, icons, and field usability | Visible UI only | Design review notes / corrections |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Run final checks and confirm deploy state | Release path | Verified release status |

## Acceptance Criteria

- 管理者可在已通過訪員名冊中產生訪員證。
- 已發過有效證者重複發證時沿用既有證，不建立多張 active 證。
- 列印頁顯示照片、姓名、單位、職稱、訪員編碼、QR 與序號。
- QR 查驗頁可顯示有效 / 查無有效訪員證。
- 領取頁輸入序號後可顯示電子證並下載 PNG。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed
- [ ] Release state checked separately from local build success

## Lessons to Capture

- 訪員證需以發證快照保存，不應只即時讀目前最新個資。

## Completion Notes

- What changed: 新增發證資料表、發證 API、列印頁、查驗頁、領取頁與後台入口。
- What was verified: `npm run typecheck`、`npm run lint`、`npm run build` 通過。
- What remains undecided: 是否後續要做精準 A4 卡片模板與 server-side PDF。
