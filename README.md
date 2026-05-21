# Elder Visit Platform

## 繁體中文說明

這個專案目前不只是一個老人訪視系統，也已經內建一套可重複使用的 AI 協作開發流程。  
如果你要開始新任務，建議先從 `task:new`、`task:orchestrate`、`task:close` 這三個指令開始。

獨居長者訪查管理平台 v2.4

This project follows the stored system specification in `docs/spec-v2.4.pdf` and `docs/spec-v2.4-extracted.md`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible components
- Supabase
- PostgreSQL
- PWA-ready structure

## Development

Install dependencies after Node.js and npm are available:

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` before connecting Supabase.

## Deployment

See `DEPLOYMENT.md` for the Vercel + Supabase publishing checklist.

## Project Operating Documents

- `AGENTS.md` — agentic development workflow and role rules
- `LESSONS.md` — durable project lessons
- `DESIGN-SYSTEM.md` — current visual language and review criteria
- `RELEASE-CHECKLIST.md` — release verification and deployment boundary checks
- `docs/task-brief-template.md` — standard task kickoff brief
- `docs/pwa-home-screen-review.md` — mobile home-screen icon and installability review

## Start a New Task

Generate a fresh task brief:

```bash
npm run task:new -- --title "Improve missed-visit flow" --slug improve-missed-visit-flow --ui
```

Useful flags:

- `--ui` — include Design / UX review
- `--pwa` — include App Icon / PWA review
- `--release` — include release-state checks

Then generate the companion orchestration plan:

```bash
npm run task:orchestrate -- --file docs/tasks/2026-05-17-roll-out-v6-workflow.md
```

任務完成前，產生收尾檢查：

```bash
npm run task:close -- --file docs/tasks/2026-05-17-roll-out-v6-workflow.md
```
