# Task Closeout: 訪員證發證列印與電子證

來源任務簡報：`docs/tasks/2026-06-21-visitor-badge-issuing.md`
來源編排計畫：`docs/tasks/2026-06-21-visitor-badge-issuing.orchestration.md`

## 繁體中文說明

這份文件用來在任務結束前做最後收尾。它不是自動宣布任務完成，而是幫你檢查：

1. 還有哪些核取項目沒有完成
2. 任務簡報是否仍保留空白佔位文字
3. 是否需要把經驗回寫到專案文件
4. 是否還需要補設計、PWA 或發布狀態說明

## Closeout Summary

- Unchecked checklist items found: **11**
- Placeholder text still present in brief: **yes**
- Lesson capture should be considered: **no**
- Design follow-up may be needed: **yes**
- PWA follow-up may be needed: **no**
- Release-state follow-up may be needed: **yes**

## 尚未完成的檢查項目

- [ ] Release state checked separately from local build success
- [ ] Goal and acceptance criteria are filled in.
- [ ] Likely files are listed.
- [ ] Risks / ambiguities are explicit.
- [ ] Existing product language to preserve is identified.
- [ ] `npm run typecheck` completed.
- [ ] `npm run lint` completed.
- [ ] `npm run build` completed.
- [ ] Durable lessons were considered for `LESSONS.md`.
- [ ] Design / UX review completed.
- [ ] Local verification and live deployment state were reported separately.

## 建議補寫的文件

- `LESSONS.md`：目前沒有明顯提示。
- `DESIGN-SYSTEM.md`：若新增了新的設計判斷或元件模式，請確認是否要更新。
- `docs/pwa-home-screen-review.md`：目前沒有明顯提示。
- `RELEASE-CHECKLIST.md`：若本次涉及發布，請補足真實發布狀態。

## 完成前最後回答

1. 這次實際改了什麼？
2. 實際跑了哪些驗證？
3. 做了哪些設計 / UX 判斷？
4. 有哪些經驗值得寫回 `LESSONS.md`？
5. 是否已清楚區分：
   - 本地修改
   - 本地驗證
   - Git 狀態
   - 線上部署狀態

## 建議結論

目前仍有未完成項目或佔位內容，建議先補齊後再宣告任務完成。
