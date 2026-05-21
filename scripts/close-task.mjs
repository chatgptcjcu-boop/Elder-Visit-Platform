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
  npm run task:close -- --file docs/tasks/<task-file>.md
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

const orchestrationFile = file.replace(/\.md$/, ".orchestration.md");
const brief = readFileSync(file, "utf8");
const orchestration = existsSync(orchestrationFile)
  ? readFileSync(orchestrationFile, "utf8")
  : "";
const taskName = brief.match(/^# Task Brief:\s*(.+)$/m)?.[1] ?? basename(file, ".md");

const unchecked = [...`${brief}\n${orchestration}`.matchAll(/^- \[ \] (.+)$/gm)].map((match) => match[1]);
const containsPlaceholder = [
  "Describe the user outcome, not only the technical change.",
  "What changed:",
  "What was verified:",
  "What remains undecided:",
].some((needle) => brief.includes(needle));

const lessonPrompt = brief.includes("LESSONS.md");
const designPrompt = orchestration.includes("Design / UX review completed");
const pwaPrompt = orchestration.includes("App Icon / PWA review completed");
const releasePrompt = orchestration.includes("live deployment state");

const outputFile = file.replace(/\.md$/, ".closeout.md");
const content = `# Task Closeout: ${taskName}

來源任務簡報：\`${file}\`
${existsSync(orchestrationFile) ? `來源編排計畫：\`${orchestrationFile}\`` : "來源編排計畫：尚未建立"}

## 繁體中文說明

這份文件用來在任務結束前做最後收尾。它不是自動宣布任務完成，而是幫你檢查：

1. 還有哪些核取項目沒有完成
2. 任務簡報是否仍保留空白佔位文字
3. 是否需要把經驗回寫到專案文件
4. 是否還需要補設計、PWA 或發布狀態說明

## Closeout Summary

- Unchecked checklist items found: **${unchecked.length}**
- Placeholder text still present in brief: **${containsPlaceholder ? "yes" : "no"}**
- Lesson capture should be considered: **${lessonPrompt ? "yes" : "no"}**
- Design follow-up may be needed: **${designPrompt ? "yes" : "no"}**
- PWA follow-up may be needed: **${pwaPrompt ? "yes" : "no"}**
- Release-state follow-up may be needed: **${releasePrompt ? "yes" : "no"}**

## 尚未完成的檢查項目

${unchecked.length ? unchecked.map((item) => `- [ ] ${item}`).join("\n") : "- 無"}

## 建議補寫的文件

- \`LESSONS.md\`：${lessonPrompt ? "若本次任務形成可重複使用的規則，請補寫。" : "目前沒有明顯提示。"}
- \`DESIGN-SYSTEM.md\`：${designPrompt ? "若新增了新的設計判斷或元件模式，請確認是否要更新。" : "目前沒有明顯提示。"}
- \`docs/pwa-home-screen-review.md\`：${pwaPrompt ? "若有 manifest、icon 或安裝體驗調整，請確認是否要更新。" : "目前沒有明顯提示。"}
- \`RELEASE-CHECKLIST.md\`：${releasePrompt ? "若本次涉及發布，請補足真實發布狀態。" : "目前沒有明顯提示。"}

## 完成前最後回答

1. 這次實際改了什麼？
2. 實際跑了哪些驗證？
3. 做了哪些設計 / UX 判斷？
4. 有哪些經驗值得寫回 \`LESSONS.md\`？
5. 是否已清楚區分：
   - 本地修改
   - 本地驗證
   - Git 狀態
   - 線上部署狀態

## 建議結論

${unchecked.length || containsPlaceholder
  ? "目前仍有未完成項目或佔位內容，建議先補齊後再宣告任務完成。"
  : "目前沒有偵測到明顯遺漏，可以進入最終人工確認。"}
`;

writeFileSync(outputFile, content, "utf8");
console.log(`Created ${outputFile}`);
console.log(`Unchecked items: ${unchecked.length}`);
console.log(`Placeholders remain: ${containsPlaceholder ? "yes" : "no"}`);
