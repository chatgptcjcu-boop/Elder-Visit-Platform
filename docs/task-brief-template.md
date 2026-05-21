# Task Brief Template

## 繁體中文說明

這份模板是每個新任務的起點。  
先把問題定義清楚，再決定要不要拆工、要不要啟動 Design / UX Agent、是否需要發布。

## Goal

Describe the user outcome, not only the technical change.

## Scope

What is included, and what is explicitly out of scope?

## Relevant References

- Product spec:
- Workflow doc:
- Related files:

## Likely Files

- 

## Risks / Ambiguities

- 

## User-Facing Impact

- 

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead |  |  |  |
| Builder |  |  |  |
| Design / UX Agent |  |  |  |
| App Icon / PWA Agent |  |  |  |
| Reviewer / QA |  |  |  |
| Release / Ops |  |  |  |

## Acceptance Criteria

- 

## Verification

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`

## Lessons to Capture

- 

## Generator

For a fresh task file under `docs/tasks/`, prefer:

```bash
npm run task:new -- --title "Short task title" --slug short-task-slug
```

Optional flags:

- `--ui`
- `--pwa`
- `--release`

After the task brief is created, generate the semi-automatic orchestration companion:

```bash
npm run task:orchestrate -- --file docs/tasks/YYYY-MM-DD-short-task-slug.md
```

任務完成前，請再執行：

```bash
npm run task:close -- --file docs/tasks/YYYY-MM-DD-short-task-slug.md
```
