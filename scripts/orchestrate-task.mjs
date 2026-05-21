#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

function usage() {
  console.log(`
Usage:
  npm run task:orchestrate -- --file docs/tasks/<task-file>.md
`);
}

const file = getArg("file");

if (!file) {
  usage();
  process.exit(1);
}

if (!existsSync(file)) {
  console.error(`Error: ${file} does not exist.`);
  process.exit(1);
}

const brief = readFileSync(file, "utf8");
const lower = brief.toLowerCase();
const taskName = brief.match(/^# Task Brief:\s*(.+)$/m)?.[1] ?? basename(file, ".md");

const includeUi =
  lower.includes("design / ux agent") ||
  /\bui\b/.test(lower) ||
  lower.includes("visible ui") ||
  lower.includes("icon") ||
  lower.includes("color") ||
  lower.includes("layout");

const includePwa =
  lower.includes("app icon / pwa agent") ||
  lower.includes("pwa") ||
  lower.includes("manifest") ||
  lower.includes("home-screen") ||
  lower.includes("installability");

const includeRelease =
  lower.includes("release / ops") ||
  lower.includes("deploy") ||
  lower.includes("release state") ||
  lower.includes("publish");

const docsToReview = [
  "`AGENTS.md`",
  "`LESSONS.md`",
  "`RELEASE-CHECKLIST.md`",
];

if (includeUi) {
  docsToReview.push("`DESIGN-SYSTEM.md`");
}

if (includePwa) {
  docsToReview.push("`docs/pwa-home-screen-review.md`");
}

const recommendedRoles = [
  "1. **Planner / Lead** — confirm goal, scope, and acceptance criteria.",
  "2. **Builder** — implement the functional change.",
];

if (includeUi) {
  recommendedRoles.push(
    "3. **Design / UX Agent** — review visual hierarchy, icon use, copy, and mobile usability.",
  );
}

if (includePwa) {
  recommendedRoles.push(
    `${recommendedRoles.length + 1}. **App Icon / PWA Agent** — review manifest, home-screen icon quality, and installability.`,
  );
}

recommendedRoles.push(
  `${recommendedRoles.length + 1}. **Reviewer / QA** — verify edge cases and requirement fit.`,
);
recommendedRoles.push(
  `${recommendedRoles.length + 1}. **Release / Ops** — ${includeRelease ? "run release checks and confirm live state." : "decide whether release work is needed."}`,
);

const beforeStart = [
  "- [ ] Goal and acceptance criteria are filled in.",
  "- [ ] Likely files are listed.",
  "- [ ] Risks / ambiguities are explicit.",
];

if (includeUi) {
  beforeStart.push("- [ ] Existing product language to preserve is identified.");
}

if (includePwa) {
  beforeStart.push("- [ ] Target install surfaces are identified (browser tab, iOS home screen, Android launcher).");
}

const beforeFinish = [
  "- [ ] `npm run typecheck` completed.",
  "- [ ] `npm run lint` completed.",
  "- [ ] `npm run build` completed.",
  "- [ ] Durable lessons were considered for `LESSONS.md`.",
];

if (includeUi) {
  beforeFinish.push("- [ ] Design / UX review completed.");
}

if (includePwa) {
  beforeFinish.push("- [ ] App Icon / PWA review completed.");
}

if (includeRelease) {
  beforeFinish.push("- [ ] Local verification and live deployment state were reported separately.");
}

const outputFile = file.replace(/\.md$/, ".orchestration.md");
const content = `# Orchestration Plan: ${taskName}

Source brief: \`${file}\`

## 繁體中文說明

這份文件是任務的半自動編排建議。它會根據 task brief 的內容，幫你先判斷：

- 這次需要哪些 Agent
- 開始前要補哪些資訊
- 哪些文件要一起檢查
- 任務收尾前要完成哪些確認

## Recommended Roles

${recommendedRoles.join("\n")}

## Why These Roles Were Selected

- UI-sensitive work detected: **${includeUi ? "yes" : "no"}**
- PWA / home-screen work detected: **${includePwa ? "yes" : "no"}**
- Release-sensitive work detected: **${includeRelease ? "yes" : "no"}**

## Before Starting

${beforeStart.join("\n")}

## Documents to Review or Update

${docsToReview.map((item) => `- ${item}`).join("\n")}

## Suggested Execution Order

1. Complete the task brief.
2. Confirm whether any workstreams can truly run in parallel.
3. Implement the builder scope.
4. Run ${includeUi ? "Design / UX review" : "a light UI sanity check if visible behavior changed"}.
5. Run ${includePwa ? "App Icon / PWA review" : "PWA review only if installability changed"}.
6. Run Reviewer / QA checks.
7. Run Release / Ops checks if shipping is intended.
8. Capture durable lessons before closing the task.

## Before Closing

${beforeFinish.join("\n")}

## Completion Prompt

When the task is done, answer:

1. What changed?
2. What was verified?
3. What design / UX judgment was applied?
4. What lesson should be kept for future work?
5. Is anything still undecided?
`;

writeFileSync(outputFile, content, "utf8");
console.log(`Created ${outputFile}`);
console.log(`Roles: ${recommendedRoles.length}`);
console.log(`UI review: ${includeUi ? "yes" : "no"}`);
console.log(`PWA review: ${includePwa ? "yes" : "no"}`);
console.log(`Release review: ${includeRelease ? "yes" : "no"}`);
