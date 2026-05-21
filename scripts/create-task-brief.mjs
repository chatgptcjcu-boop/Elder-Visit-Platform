#!/usr/bin/env node

import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

function usage() {
  console.log(`
Usage:
  npm run task:new -- --title "Short task title" --slug short-task-slug [--ui] [--pwa] [--release]

Options:
  --title    Human-readable task title
  --slug     Lowercase file slug used in docs/tasks/<date>-<slug>.md
  --ui       Include Design / UX Agent workstream and checklist
  --pwa      Include App Icon / PWA Agent workstream and checklist
  --release  Include explicit Release / Ops emphasis
`);
}

const title = getArg("title");
const slug = getArg("slug");
const includeUi = hasFlag("ui");
const includePwa = hasFlag("pwa");
const includeRelease = hasFlag("release");

if (!title || !slug) {
  usage();
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error("Error: --slug must use lowercase letters, digits, and hyphens only.");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const outputPath = join("docs", "tasks", `${today}-${slug}.md`);

if (existsSync(outputPath)) {
  console.error(`Error: ${outputPath} already exists.`);
  process.exit(1);
}

const workstreams = [
  "| Planner / Lead | Frame goal, scope, risks, and acceptance criteria | Planning docs | Approved task brief |",
  "| Builder | Implement the functional change | To be filled after inspection | Working change |",
];

if (includeUi) {
  workstreams.push(
    "| Design / UX Agent | Review hierarchy, copy, color, icons, and field usability | Visible UI only | Design review notes / corrections |",
  );
}

if (includePwa) {
  workstreams.push(
    "| App Icon / PWA Agent | Review manifest, home-screen icons, installability, and launch polish | Manifest / icon assets | PWA review notes / corrections |",
  );
}

workstreams.push(
  "| Reviewer / QA | Inspect edge cases and verify against requirements | Diff + test surface | Review findings |",
);

if (includeRelease) {
  workstreams.push(
    "| Release / Ops | Run final checks and confirm deploy state | Release path | Verified release status |",
  );
} else {
  workstreams.push(
    "| Release / Ops | Confirm whether release work is needed | Release path if applicable | Release decision |",
  );
}

const checkboxes = [
  "- [ ] `npm run typecheck`",
  "- [ ] `npm run lint`",
  "- [ ] `npm run build`",
];

if (includeUi) {
  checkboxes.push("- [ ] Design / UX review completed");
}

if (includePwa) {
  checkboxes.push("- [ ] App Icon / PWA review completed");
}

if (includeRelease) {
  checkboxes.push("- [ ] Release state checked separately from local build success");
}

const content = `# Task Brief: ${title}

## 繁體中文說明

這份文件用來在任務開始前先把方向講清楚，避免還沒定義目標就直接進入開發。
請先補完目標、範圍、風險、驗收條件，再決定哪些 Agent 需要參與。

## Goal

Describe the user outcome, not only the technical change.

## Scope

### In scope

- 

### Out of scope

- 

## Relevant References

- Product spec: \`docs/spec-v2.4.pdf\`
- Workflow doc:
- Related files:

## Likely Files

- 

## Risks / Ambiguities

- 

## User-Facing Impact

- ${includeUi ? "Visible UI impact expected." : "To be confirmed."}

## Workstreams

| Owner | Task | Write Scope | Expected Output |
| --- | --- | --- | --- |
${workstreams.join("\n")}

## Acceptance Criteria

- 

## Verification

${checkboxes.join("\n")}

## Lessons to Capture

- What should be added to \`LESSONS.md\` if this task reveals a durable project rule?

## Completion Notes

- What changed:
- What was verified:
- What remains undecided:
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, content, "utf8");
console.log(`Created ${outputPath}`);
