# Task Brief: Supabase SQL execution helper

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

Reduce the risk and effort of manually applying Supabase SQL migrations through the SQL Editor by generating a single ordered SQL bundle from the repository's migration files.

## Scope

### In scope

- Add a local helper script that combines selected Supabase migrations in filename order.
- Support selecting a migration range and optionally appending `seed.sql`.
- Support copying the generated SQL to the macOS clipboard for one-paste SQL Editor usage.

### Out of scope

- Direct database execution, because this environment currently has neither `supabase` CLI nor `psql`, and database credentials should not be stored in the repository.
- Changes to the schema SQL itself.

## Relevant References

- Product spec: `docs/spec-v2.4.pdf`
- Workflow doc: `supabase/README.md`
- Related files:
- `supabase/README.md`
- `supabase/migrations/*.sql`
- `supabase/seed.sql`
- `package.json`
- `scripts/build-supabase-sql-bundle.mjs`

## Likely Files

- `scripts/build-supabase-sql-bundle.mjs`
- `package.json`
- `.gitignore`
- `supabase/README.md`

## Risks / Ambiguities

- Re-running old seed data or non-idempotent SQL can still fail or duplicate data; the helper should make the selected range explicit.
- SQL Editor errors are easier to isolate by applying a smaller range rather than the whole schema.
- Direct push automation requires a trusted local credential flow that is not available yet.

## User-Facing Impact

- The user can generate one SQL bundle and paste once into Supabase SQL Editor instead of opening each migration file manually.

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |
| Builder | Implement the SQL bundle helper | `scripts/build-supabase-sql-bundle.mjs`, `package.json`, `supabase/README.md` | Working `npm run db:bundle` command |
| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |
| Release / Ops | Confirm whether release work is needed | Local verification only | Release decision |

## Acceptance Criteria

- `npm run db:bundle` writes an ordered SQL bundle from all migrations.
- `npm run db:bundle -- --from 0031 --to 0032 --clipboard` writes and copies only the selected range.
- The helper prints the first and last included migrations.
- Generated SQL output is ignored by git.

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`

## Lessons to Capture

- Added a durable lesson: SQL Editor workflows should use a generated paste bundle before falling back to file-by-file copying.

## Completion Notes

- Changed: Added `npm run db:bundle`, documented it in `supabase/README.md`, ignored generated `tmp/` SQL files, and recorded the lesson.
- Verified: `db:bundle` list/range/clipboard paths, `npm run typecheck -- --pretty false`, `npm run lint`, and `npm run build`.
- Still undecided: Direct database execution still requires either Supabase CLI, `psql`, or a trusted credential flow.
