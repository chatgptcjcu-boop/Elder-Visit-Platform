# Task Brief: Public visitor registration entry

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

正式站台優先提供訪員註冊收件入口，公開畫面不再揭露測試帳號密碼；既有邀請啟用與管理測試仍可由知悉帳密的人員操作。

## Scope

### In scope

- 將網站首頁導向訪員註冊頁。
- 移除公開登入頁的預填帳密、示範帳號卡片與角色提示內容。
- 強化註冊頁的送件、審核與登入啟用流程提示。
- 以本機忽略檔案保存測試帳密，不納入 GitHub 或正式部署。

### Out of scope

- 關閉後端示範帳號登入 fallback。
- 啟用 Supabase SMTP 或完成訪員邀請寄信。
- 修改訪員註冊資料欄位與核准流程。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `docs/visitor-login-profile-completion-plan.md`
- Related files: `components/auth/login-panel.tsx`, `components/auth/register-panel.tsx`

## Likely Files

- `app/page.tsx`
- `components/auth/login-panel.tsx`
- `components/auth/register-panel.tsx`
- `.gitignore`
- `private/demo-login-accounts.txt` (local only)

## Risks / Ambiguities

- 公開移除帳密後，管理者仍需知道測試登入資料所在位置。
- demo fallback 仍存在於後端，正式全面啟用帳號前需另行決定是否關閉。

## User-Facing Impact

- Visible UI impact expected.

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | Public auth entry components, root route, local credential ignore rule | Working change |
| Design / UX Agent | Review hierarchy, copy, color, icons, and field usability | Visible UI only | Design review notes / corrections |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Run final checks and confirm deploy state | Release path | Verified release status |

## Acceptance Criteria

- 正式網址首頁首先呈現訪員註冊入口。
- `/login` 初始 Email 與密碼為空白，公開 DOM 不顯示測試帳號或密碼。
- 邀請連結進入 `/login?invited=1` 時仍可設定新密碼。
- `/register` 清楚說明送件、照片、審核及啟用通知流程，並保留已有帳號登入連結。
- 本機測試帳密文字檔被 git ignore，不會被 commit 或發布。

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Design / UX review completed
- [x] Release state checked separately from local build success

## Lessons to Capture

- 正式公開收件入口不可同頁公開示範登入憑證；測試資料應與部署產物分離。

## Completion Notes

- 實際修改：公開首頁導向註冊入口；登入頁移除示範帳密與預填資料；註冊頁加入四步驟申請流程；測試帳密改存本機忽略檔。
- 已完成驗證：`npm run build`、建置完成後依序執行 `npm run typecheck -- --pretty false` 與 `npm run lint`；本機正式模式回歸確認公開登入 HTML 不含測試憑證，手動輸入測試帳密仍可登入；推送 GitHub 後已確認 Vercel 正式網址呈現新版註冊入口與乾淨登入頁。
- 設計判斷：收件期間以「訪員註冊」作為公開主要入口，登入僅提供已收到邀請或既有帳號者使用，避免同一畫面混用公開申請與內部測試。
- 尚待後續決策：正式寄信 SMTP 與 production 是否完全關閉 demo fallback。
