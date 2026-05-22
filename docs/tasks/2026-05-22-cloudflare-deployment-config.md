# Task Brief: Cloudflare deployment config

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

讓 Cloudflare Workers Builds 可以穩定發佈本專案，避免自動產生的 OpenNext/Wrangler 設定把 `WORKER_SELF_REFERENCE` 指到不存在的 Worker。

## Scope

### In scope

- 固定 Cloudflare Worker 名稱與 OpenNext 輸出設定。
- 補上 Cloudflare 專用建置/預覽/發佈指令，保留 Netlify 既有 `npm run build`。
- 補上 OpenNext/Workers 建置輸出忽略規則。

### Out of scope

- 不更動 Supabase 資料庫結構。
- 不在本機直接替使用者登入 Cloudflare 執行正式發佈。
- 不修改目前 Netlify 發佈設定。

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `RELEASE-CHECKLIST.md`
- Related files: `package.json`, `wrangler.jsonc`, `open-next.config.ts`, `.gitignore`, `public/_headers`

## Likely Files

- `package.json`
- `package-lock.json`
- `wrangler.jsonc`
- `open-next.config.ts`
- `.gitignore`
- `public/_headers`

## Risks / Ambiguities

- Cloudflare Workers Builds 目前儀表板仍可能使用舊指令；推上 GitHub 後仍需把 Cloudflare 的建置命令調整為 Cloudflare 專用指令。
- 先前建置紀錄暴露過 Supabase service role key，正式上線前應輪替該 key。

## User-Facing Impact

GitHub 更新後，Cloudflare 可用固定設定重新建置；管理員不需要每次手動修正錯誤的 Worker 綁定名稱。

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the functional change | To be filled after inspection | Working change |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Run final checks and confirm deploy state | Release path | Verified release status |

## Acceptance Criteria

- `npm run typecheck -- --pretty false` passes.
- `npm run lint` passes.
- `npm run build` passes for the existing Netlify path.
- `npm run cf:build` can generate `.open-next/worker.js` without the old self-reference binding mismatch.

## Verification

- [x] `npm run typecheck -- --pretty false`
- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run cf:build`
- [x] `npx wrangler deploy --dry-run`
- [x] Release state checked separately from local build success

## Lessons to Capture

已補充 `LESSONS.md`：Cloudflare Workers 發佈需要提交固定的 Wrangler/OpenNext 設定，避免自動推斷錯誤 Worker 名稱。

## Completion Notes

- What changed: 新增 Cloudflare Workers/OpenNext 固定設定、Cloudflare 專用指令、靜態資源快取標頭與忽略規則。
- What was verified: typecheck、lint、Next build、OpenNext Cloudflare build、Wrangler dry-run。
- What remains undecided: Cloudflare 儀表板需改用 `npm run cf:build` 作為建置命令；正式線上重新部署需由 Cloudflare 自動部署或使用者授權後執行。
