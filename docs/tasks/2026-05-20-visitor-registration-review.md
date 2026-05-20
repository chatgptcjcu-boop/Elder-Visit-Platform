# Task Brief: 訪員註冊與審核流程

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

讓新訪員可以依公所清冊欄位完成註冊資料、自拍證件照預覽與送審，承辦管理者可在使用者管理頁看到可審核的訪員申請。

## Scope

### In scope

- 在使用者管理頁新增「新訪員註冊」表單。
- 依 Excel 清冊欄位納入姓名、性別、身分證字號、民政/社政、職稱、公務信箱、教育訓練與覆核狀態。
- 依「單位-姓名-職稱」產生訪員暱稱。
- 增加手機自拍上傳與白底一寸證件照預覽。
- 增加 mock API 送審流程與 Supabase 欄位 migration。

### Out of scope

- AI 去背與正式證件照裁切演算法。
- 真實 Supabase 寫入與 Auth 註冊串接。
- 社會局外部系統送審 API。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/new-taipei-care-form-workflow.md`
- Related files: `components/workspace/users-panel.tsx`, `lib/domain/user-management.ts`, `lib/domain/types.ts`, `supabase/migrations/0026_visitor_registration_review.sql`

## Likely Files

- `components/workspace/users-panel.tsx`
- `app/api/users/visitor-registration/route.ts`
- `lib/domain/user-management.ts`
- `lib/domain/types.ts`
- `supabase/README.md`
- `supabase/migrations/0026_visitor_registration_review.sql`

## Risks / Ambiguities

- 自拍證件照目前只做上傳與預覽，尚未做 AI 去背。
- 新註冊資料目前仍是 mock/server memory flow，正式多人使用前要接 Supabase insert。
- 身分證字號屬個資，正式上線前需補加密、遮罩與存取稽核。

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

- 使用者管理頁可填寫新訪員註冊資料並送出。
- 審核清單可看到暱稱、民政/社政、職稱、教育訓練、訪員證與社會局覆核狀態。
- Supabase migration 已補齊註冊與訪員資格所需欄位。
- 型別檢查、lint、正式 build 通過。

## Verification

- [x] `npm run typecheck -- --pretty false`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed

## Lessons to Capture

- 訪員註冊欄位要直接對齊政府清冊欄位，避免後續匯出與社會局覆核資料再轉換。

## Completion Notes

- What changed: 新增訪員註冊表、審核卡片欄位、mock API 與 Supabase migration。
- What was verified: typecheck、lint、build。
- What remains undecided: AI 去背、正式 Supabase insert、個資加密與遮罩策略。
