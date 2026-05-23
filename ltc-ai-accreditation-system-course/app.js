const slides = [
  ["01", "課程封面", "創業產品雛形", "長照機構用生成式 AI 實作評鑑管理系統", "這是一門給長榮大學醫管系大三大四的專題課：把長照評鑑痛點，轉成一個能展示、能討論、能迭代的系統產品雛形。", ["目標不是背 AI 名詞，而是做出可展示的管理工具。", "專題成果要能說清楚場域問題、使用者、資料流與產品價值。", "全程使用假資料與去識別化案例，不碰真實住民個資。"], "cover"],
  ["02", "專題成果", "今天要完成什麼", "最後不是交報告，而是交一個產品故事", "學生最後要能展示一個長照評鑑管理系統 MVP，並說明生成式 AI 如何協助需求整理、原型製作與品質改善。", ["一個可操作的線上原型。", "一份需求與資料欄位說明。", "一套 Prompt 包與 AI 使用揭露。"], "product"],
  ["03", "場域問題", "評鑑不是考試", "評鑑管理的本質是日常品質營運", "長照機構準備評鑑時，真正困難不是不知道要做，而是資料、責任、期限、佐證與改善紀錄常常分散。", ["文件找得到嗎？", "誰負責補件？", "缺失有沒有追蹤到關閉？", "主管能不能一眼看到準備狀態？"], "problem"],
  ["04", "學科連結", "醫管系角色", "醫管系學生適合把制度翻譯成系統", "醫管訓練本來就橫跨制度、流程、品質、成本與資訊管理。這個專題把這些能力整合成一個產品雛形。", ["把評鑑指標轉成管理欄位。", "把現場流程轉成系統任務。", "把品質改善轉成追蹤機制。"], "matrix"],
  ["05", "使用者", "系統服務誰", "先定義使用者，再決定功能", "長照評鑑管理系統不是給一個抽象的機構使用，而是服務不同角色的工作壓力。", ["機構負責人：看整體風險與進度。", "行政窗口：整理指標、文件與期限。", "照護主管：補充現場紀錄與改善。", "稽核/顧問：檢查缺口並提出建議。"], "users"],
  ["06", "痛點地圖", "從混亂到系統", "把評鑑痛點整理成產品機會", "學生要學會把抱怨轉成系統需求：每個痛點都要能對應到資料欄位、操作流程或視覺化回饋。", ["痛點：資料散落。功能：佐證資料庫。", "痛點：進度不清。功能：儀表板。", "痛點：改善斷掉。功能：缺失追蹤。"], "flow"],
  ["07", "資料倫理", "不能碰真實個資", "產品雛形必須先守住資料邊界", "長照場域涉及健康、家庭、照護與身分資料。課堂原型只能使用假資料、模擬案例與去識別化欄位。", ["不用真實住民姓名與身分證字號。", "照片、錄音、病歷與照護紀錄不得直接上傳。", "所有案例以模擬資料替代。"], "risk"],
  ["08", "需求拆解", "評鑑指標變需求", "把文字規定翻成系統可管理的單位", "一條評鑑要求可以拆成：指標、佐證、責任人、頻率、狀態、風險、改善紀錄。這就是系統資料模型的起點。", ["指標：要達成什麼。", "佐證：用什麼證明。", "責任：誰處理。", "狀態：目前進度如何。"], "schema"],
  ["09", "AI 工作流", "生成式 AI 做什麼", "AI 是需求分析與產出加速器，不是制度負責人", "AI 可以幫忙整理、分類、產生草稿、提出檢核問題；但專業判斷、資料邊界與責任歸屬仍由人決定。", ["AI 整理評鑑文字。", "AI 產生欄位表與假資料。", "AI 協助撰寫改善建議。", "人負責驗證與決策。"], "ai"],
  ["10", "Prompt 方法", "Prompt 五欄法", "把任務講清楚，AI 才能穩定產出", "每次請 AI 幫忙時，至少說清楚任務、背景、資料、格式與限制。這會直接影響專題產出的品質。", ["任務：要 AI 做什麼。", "背景：醫管/長照/評鑑脈絡。", "資料：貼入指標或案例。", "格式：表格、JSON、清單或頁面。", "限制：不得使用個資，不得杜撰法規。"], "prompt"],
  ["11", "MVP", "產品最小範圍", "第一版只做能展示價值的核心功能", "專題不是一次做完整商用系統。先做 MVP：讓主管看見進度、讓窗口管理佐證、讓團隊追蹤改善。", ["首頁儀表板。", "評鑑指標清單。", "佐證資料管理。", "缺失改善追蹤。", "AI 助理提示區。"], "mvp"],
  ["12", "首頁", "儀表板", "主管第一眼要看到風險與進度", "首頁不是裝飾，而是決策畫面。它應該快速回答：現在準備到哪裡？最危險的是什麼？誰需要支援？", ["整體完成率。", "高風險指標。", "逾期補件。", "本週應處理事項。"], "dashboard"],
  ["13", "指標", "指標清單", "把評鑑要求變成可追蹤任務", "指標清單要讓學生理解管理系統的核心：每個指標都要有分類、狀態、責任人與佐證要求。", ["分類：行政、照護、環境、品質。", "狀態：未開始、進行中、待複核、完成。", "責任人：行政或照護主管。"], "list"],
  ["14", "佐證", "文件管理", "文件不是堆資料，是回答評鑑問題", "佐證資料要能連回指標，並保留版本、日期、負責人與缺口說明。這是評鑑準備最容易失控的地方。", ["每份文件連到一個或多個指標。", "標示是否有效、過期或待補。", "保留補件原因與下一步。"], "docs"],
  ["15", "改善", "缺失追蹤", "缺失沒有關閉，就不是改善", "評鑑管理系統要讓缺失從發現、原因、對策、責任、期限到複核形成閉環。", ["發現問題。", "判斷原因。", "提出對策。", "設定期限。", "完成複核。"], "improve"],
  ["16", "AI 助理", "系統裡的 AI", "AI 助理要嵌在工作流，不是另外開一個聊天框", "產品雛形中的 AI 助理應該幫使用者完成具體任務，例如產生檢核問題、改善摘要、會議紀錄與缺口清單。", ["根據指標產生檢核問題。", "根據缺失草擬改善計畫。", "把會議紀錄轉成待辦事項。"], "assistant"],
  ["17", "資料模型", "欄位設計", "好的欄位讓系統後面可以長大", "學生需要設計基本資料表，而不是只做漂亮頁面。資料模型決定產品能不能被管理、被查詢、被擴充。", ["Indicator：評鑑指標。", "Evidence：佐證資料。", "Finding：缺失與風險。", "Action：改善行動。", "User：角色與責任。"], "schema"],
  ["18", "小組分工", "專題團隊", "每個人都要有可交付成果", "大三大四專題應該像產品小隊。每個角色都要能說出自己負責的產出，不要只把工作丟給會寫程式的人。", ["PM/場域研究：問題與使用者。", "資料設計：欄位與假資料。", "AI 工作流：Prompt 與輸出檢查。", "原型製作：頁面與互動。", "QA/發表：驗收與展示。"], "team"],
  ["19", "Codex", "從規格到原型", "Codex 負責執行，但你要給它清楚的工作包", "學生要練習把需求、資料欄位、頁面、限制與驗收條件交給 Codex，而不是只說「幫我做一個系統」。", ["先寫專案 brief。", "再給資料模型與頁面清單。", "要求本機驗證與修正。", "最後整理 README 與發佈。"], "codex"],
  ["20", "驗收", "怎麼判斷做得好", "產品雛形要用真實場景驗收", "驗收不是問畫面好不好看，而是問使用者能不能完成評鑑管理任務。", ["主管能看懂目前風險嗎？", "行政能知道缺什麼文件嗎？", "照護主管能追蹤改善嗎？", "AI 輸出有來源與限制嗎？"], "check"],
  ["21", "展示", "發表腳本", "展示要講產品價值，不是逐頁唸功能", "學生發表時要先講問題，再講使用者，再展示流程，最後說明 AI 如何幫忙與有哪些限制。", ["1 分鐘：場域痛點。", "2 分鐘：產品流程。", "1 分鐘：AI 工作流。", "1 分鐘：風險與下一步。"], "pitch"],
  ["22", "創業視角", "產品雛形", "把專題當成一個可驗證的產品假設", "這不是要學生真的創業，而是練習產品思考：誰願意用？為什麼現在的方法不夠？這個系統節省什麼成本？", ["使用者：中小型長照機構。", "價值：降低評鑑準備混亂。", "差異：AI 協助文件整理與改善追蹤。"], "startup"],
  ["23", "風險", "限制與揭露", "AI 專案要把不能做的事情說清楚", "醫管領域的 AI 產品必須主動揭露限制，包括資料品質、法規更新、模型幻覺、個資與專業責任。", ["不得宣稱 AI 自動通過評鑑。", "不得使用未授權資料。", "AI 建議必須由人審核。"], "risk"],
  ["24", "收尾", "期末帶走", "醫管系學生要帶走一套可複製的 AI 產品方法", "完成這個專題後，學生不只會用 AI，而是會把場域問題轉成資料、流程、原型、驗收與產品故事。", ["從問題開始。", "用 AI 加速整理與實作。", "用管理邏輯驗收系統。", "用 GitHub 展示成果。"], "close"],
  ["A01", "附錄", "Prompt 五欄卡", "每次請 AI 協作前，先填五欄", "五欄法是學生最容易複製的提示詞框架，能降低亂問、亂改與亂產出的風險。", ["任務：請 AI 產出什麼。", "背景：長照機構與評鑑情境。", "資料：貼入指標或假資料。", "格式：指定表格或 JSON。", "限制：不得杜撰，不碰個資。"], "prompt"],
  ["A02", "附錄", "指標整理卡", "把評鑑要求轉成資料欄位", "每個指標都要被整理成可查、可追、可分派的管理單位。", ["指標名稱。", "管理分類。", "佐證文件。", "責任角色。", "目前狀態。", "風險等級。"], "list"],
  ["A03", "附錄", "MVP 功能卡", "第一版只做核心流程", "避免專題膨脹。先讓五個核心頁面跑通，再談進階功能。", ["Dashboard。", "指標清單。", "佐證管理。", "缺失追蹤。", "AI 助理。"], "mvp"],
  ["A04", "附錄", "Codex 交接卡", "把工作交給 Codex 前要準備什麼", "Codex 的品質取決於你交代得多清楚。交接卡可以讓學生練習像產品經理一樣描述需求。", ["目標與使用者。", "頁面清單。", "資料欄位。", "假資料。", "驗收條件。"], "codex"],
  ["A05", "附錄", "發表檢查卡", "展示前先確認故事完整", "好的專題發表要兼顧場域、產品、AI、限制與下一步。", ["有明確痛點。", "有可操作原型。", "有 AI 協作證據。", "有資料倫理說明。", "有下一版規劃。"], "check"],
  ["A06", "附錄", "AI 使用揭露卡", "把 AI 用在哪裡說清楚", "學生要學會誠實揭露 AI 在專題中的角色，這也是未來職場與研究的重要能力。", ["AI 協助資料整理。", "AI 協助程式與頁面草稿。", "AI 協助測試與修正。", "人負責審核與決策。"], "ai"]
];

const prompts = slides.map((slide) => {
  const [, , , title, lead, points] = slide;
  return `任務：請協助製作「${title}」這一頁的課程內容或專題產出。\n\n背景：課程對象是長榮大學醫管系大三大四學生，專題方向是「長照機構用生成式 AI 實作評鑑管理系統」，定位為創業/產品雛形。\n\n本頁重點：${lead}\n\n請依以下重點輸出：\n${points.map((point) => `- ${point}`).join("\n")}\n\n格式限制：使用繁體中文；不要使用真實住民個資；不要杜撰官方法規條文；若需要評鑑指標，請標示為示範欄位，等待正式來源確認。`;
});

let current = 0;
const notePrefix = "ltc-ai-accreditation-course-note-";

const $ = (selector) => document.querySelector(selector);
const els = {
  toc: $("#toc"),
  slideNo: $("#slideNo"),
  slideSection: $("#slideSection"),
  visual: $("#visual"),
  kicker: $("#kicker"),
  title: $("#title"),
  lead: $("#lead"),
  points: $("#points"),
  promptTitle: $("#promptTitle"),
  summary: $("#summary"),
  prompt: $("#prompt"),
  notes: $("#notes"),
  promptPanel: $("#promptPanel")
};

function visual(kind, title) {
  if (kind === "cover") {
    return `<div class="visual-card"><p class="visual-title">長照 AI 評鑑系統</p><div class="ring">MVP</div><div class="badge-row"><div class="badge">場域問題</div><div class="badge">AI 工作流</div><div class="badge">產品雛形</div></div></div>`;
  }
  if (["flow", "improve", "codex", "pitch"].includes(kind)) {
    return `<div class="visual-card"><p class="visual-title">${title}</p><div class="flow-row"><div class="step">01<small>定義問題</small></div><div class="step">02<small>整理資料</small></div><div class="step">03<small>建立原型</small></div><div class="step">04<small>驗收迭代</small></div></div></div>`;
  }
  if (["matrix", "users", "schema", "team"].includes(kind)) {
    return `<div class="visual-card"><p class="visual-title">${title}</p><div class="matrix"><div class="cell">角色<small>誰使用</small></div><div class="cell">資料<small>管理什麼</small></div><div class="cell">流程<small>怎麼完成</small></div><div class="cell">價值<small>改善什麼</small></div></div></div>`;
  }
  if (["risk", "check"].includes(kind)) {
    return `<div class="visual-card"><p class="visual-title">${title}</p><div class="stack"><div class="badge">資料邊界<small>假資料與去識別化</small></div><div class="badge">人工審核<small>AI 輸出不可直接當結論</small></div><div class="badge">責任揭露<small>說清楚 AI 用在哪裡</small></div></div></div>`;
  }
  return `<div class="visual-card"><p class="visual-title">${title}</p><div class="ring">${kind === "dashboard" ? "80%" : "AI"}</div><div class="badge-row"><div class="badge">指標</div><div class="badge">佐證</div><div class="badge">改善</div></div></div>`;
}

function renderToc() {
  els.toc.innerHTML = slides
    .map(([no, section, kicker, title], index) => {
      return `<button class="toc-button" type="button" data-index="${index}" aria-current="${index === current}"><strong>${no} ${title}</strong><span>${section}｜${kicker}</span></button>`;
    })
    .join("");
}

function render() {
  const [no, section, kicker, title, lead, points, visualKind] = slides[current];
  els.slideNo.textContent = `${current + 1} / ${slides.length}`;
  els.slideSection.textContent = `${section}｜${no}`;
  els.visual.innerHTML = visual(visualKind, title);
  els.kicker.textContent = kicker;
  els.title.textContent = title;
  els.lead.textContent = lead;
  els.points.innerHTML = points.map((point) => `<li>${point}</li>`).join("");
  els.promptTitle.textContent = `${no} ${title}`;
  els.summary.textContent = lead;
  els.prompt.textContent = prompts[current];
  els.notes.value = localStorage.getItem(notePrefix + no) || "";
  renderToc();
}

function go(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  render();
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
  return Promise.resolve();
}

function exportNotes() {
  const text = slides
    .map(([no, , , title]) => `# ${no} ${title}\n\n${localStorage.getItem(notePrefix + no) || "（尚未填寫）"}`)
    .join("\n\n---\n\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ltc-ai-accreditation-course-notes.txt";
  link.click();
  URL.revokeObjectURL(url);
}

els.toc.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (button) go(Number(button.dataset.index));
});

$("#prevBtn").addEventListener("click", () => go(current - 1));
$("#nextBtn").addEventListener("click", () => go(current + 1));
$("#copyPromptBtn").addEventListener("click", () => {
  copyText(prompts[current]);
  $("#copyPromptBtn").textContent = "已複製";
  setTimeout(() => ($("#copyPromptBtn").textContent = "複製"), 1200);
});
$("#exportNotesBtn").addEventListener("click", exportNotes);
$("#fullscreenBtn").addEventListener("click", () => {
  const target = $("#slide");
  if (document.fullscreenElement) document.exitFullscreen?.();
  else target.requestFullscreen?.();
});
$("#toggleToc").addEventListener("click", () => {
  els.toc.classList.toggle("is-hidden");
  $("#toggleToc").textContent = els.toc.classList.contains("is-hidden") ? "顯示目錄" : "隱藏目錄";
});
$("#togglePrompt").addEventListener("click", () => {
  els.promptPanel.classList.toggle("is-hidden");
  $("#togglePrompt").textContent = els.promptPanel.classList.contains("is-hidden") ? "顯示 Prompt" : "隱藏 Prompt";
});
els.notes.addEventListener("input", () => {
  const [no] = slides[current];
  localStorage.setItem(notePrefix + no, els.notes.value);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") go(current - 1);
  if (event.key === "ArrowRight") go(current + 1);
});

if (window.matchMedia("(max-width: 720px)").matches) {
  els.toc.classList.add("is-hidden");
  $("#toggleToc").textContent = "顯示目錄";
}

render();
