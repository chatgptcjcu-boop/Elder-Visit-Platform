const slides = [
  {
    type: "課程定位",
    kicker: "Lesson 01",
    title: "評鑑不是突擊考試，是日常品質管理的外部檢核",
    lead: "這份示範講義把長照機構評鑑 115 拆成經營者、主管、第一線同仁都能理解的準備節奏。",
    points: ["先建立共同語言，再看指標。", "把文件、現場、紀錄、改善連成一條線。", "每一頁都可以替換成你的正式教材內容。"],
    visual: "cover",
    prompt:
      "請製作一張 16:9 課程封面圖，主題是「長照機構評鑑 115」。畫面包含照護團隊、文件夾、機構環境與品質改善循環。風格冷靜、可信任、適合成人教育講義，不要使用誇張卡通，不要放入真實機構名稱。"
  },
  {
    type: "學習目標",
    kicker: "Lesson 02",
    title: "四個學習目標：知道、會準備、會查核、會改善",
    lead: "課程不只說明評鑑條文，而是協助學員把抽象要求轉成日常工作清單。",
    points: ["知道評鑑看什麼。", "會整理佐證資料。", "會用現場動線檢查風險。", "會把缺失改成追蹤改善。"],
    visual: "pillars",
    prompt:
      "請生成一張四象限教學圖，標題為「長照機構評鑑 115 學習目標」。四象限分別是知道、準備、查核、改善。每一格使用長照機構常見元素：照護紀錄、交班、環境巡檢、改善會議。繁體中文，文字精簡。"
  },
  {
    type: "準備流程",
    kicker: "Lesson 03",
    title: "從資料盤點到現場演練，先排出 30 天準備節奏",
    lead: "最小可行流程是：盤點資料、補缺口、現場走查、主管複核。這能避免最後一週才開始救火。",
    points: ["第 1 週：盤點評鑑指標與文件。", "第 2 週：補齊缺口與責任分工。", "第 3 週：現場動線與照護紀錄演練。", "第 4 週：主管複核與改善追蹤。"],
    visual: "flow",
    prompt:
      "請製作一張 30 天長照機構評鑑準備流程圖，四階段為資料盤點、缺口補件、現場演練、主管複核。風格像專業培訓投影片，適合機構主管使用，繁體中文。"
  },
  {
    type: "文件佐證",
    kicker: "Lesson 04",
    title: "文件不是堆起來，是要能回答評鑑委員的問題",
    lead: "每一份文件都要能對應到一個管理問題：誰負責、何時做、做了什麼、怎麼追蹤。",
    points: ["制度文件：說明規則與責任。", "執行紀錄：證明工作有發生。", "異常紀錄：保留風險與處置。", "改善紀錄：證明機構會學習。"],
    visual: "documents",
    prompt:
      "請生成一張長照機構評鑑文件佐證整理圖。畫面有四類資料夾：制度文件、執行紀錄、異常紀錄、改善紀錄。用清楚圖示與短標籤呈現，適合放在講義頁。"
  },
  {
    type: "現場查核",
    kicker: "Lesson 05",
    title: "現場查核看的是一致性：說的、寫的、做的要對得上",
    lead: "準備評鑑時，主管應該用走動式查核，讓制度文件回到照護現場。",
    points: ["照護人員是否知道流程。", "紀錄是否符合實際服務。", "環境與設備是否支援安全。", "主管是否能說明改善邏輯。"],
    visual: "onsite",
    prompt:
      "請製作一張長照機構現場查核示意圖，呈現主管在機構內走查，檢視照護紀錄、環境安全、交班溝通與改善追蹤。畫面清楚、有教學感、繁體中文標籤。"
  },
  {
    type: "行動清單",
    kicker: "Lesson 06",
    title: "下一步：把課程變成你的機構評鑑作戰板",
    lead: "正式製作時，只要把真實指標、內部表單、照片與案例放入素材夾，Codex 就能依模板生成講義。",
    points: ["建立素材夾：指標、表單、照片、案例。", "先產出 6 頁示範，再擴充到完整課程。", "每頁保留 Prompt，方便改版與交接。", "完成後做桌機與手機寬度驗收。"],
    visual: "score",
    prompt:
      "請生成一張長照機構評鑑課程收尾頁，主題是「把課程變成評鑑作戰板」。畫面包含待辦清單、進度環、主管會議桌與改善追蹤板。風格專業、安定、繁體中文。"
  }
];

let currentIndex = 0;
const noteKeyPrefix = "ltc-accreditation-115-note-";

const els = {
  nav: document.querySelector("#slideNav"),
  counter: document.querySelector("#slideCounter"),
  type: document.querySelector("#slideType"),
  visual: document.querySelector("#slideVisual"),
  kicker: document.querySelector("#slideKicker"),
  title: document.querySelector("#slideTitle"),
  lead: document.querySelector("#slideLead"),
  points: document.querySelector("#slidePoints"),
  prompt: document.querySelector("#promptText"),
  note: document.querySelector("#noteInput"),
  prev: document.querySelector("#prevBtn"),
  next: document.querySelector("#nextBtn"),
  copyPrompt: document.querySelector("#copyPromptBtn"),
  exportNotes: document.querySelector("#exportNotesBtn"),
  fullscreen: document.querySelector("#fullscreenBtn")
};

function visualMarkup(kind) {
  if (kind === "cover") {
    return `
      <div class="visual-grid">
        <p class="visual-title">長照機構評鑑 115</p>
        <div class="score-ring">115</div>
        <div class="visual-pill-row">
          <div class="visual-pill">文件準備</div>
          <div class="visual-pill">現場查核</div>
          <div class="visual-pill">品質改善</div>
        </div>
      </div>`;
  }
  if (kind === "pillars") {
    return `
      <div class="visual-grid visual-matrix">
        <div class="visual-cell">知道<small>掌握評鑑看點</small></div>
        <div class="visual-cell">準備<small>整理佐證資料</small></div>
        <div class="visual-cell">查核<small>走查現場風險</small></div>
        <div class="visual-cell">改善<small>追蹤缺失閉環</small></div>
      </div>`;
  }
  if (kind === "flow") {
    return `
      <div class="visual-grid">
        <p class="visual-title">30 天準備節奏</p>
        <div class="visual-flow">
          <div class="visual-step">01 盤點<small>指標、表單、紀錄</small></div>
          <div class="visual-step">02 補件<small>缺口、責任、期限</small></div>
          <div class="visual-step">03 演練<small>動線、問答、紀錄</small></div>
          <div class="visual-step">04 複核<small>主管確認與改善</small></div>
        </div>
      </div>`;
  }
  if (kind === "documents") {
    return `
      <div class="visual-grid visual-matrix">
        <div class="visual-cell">制度文件<small>規則、SOP、責任</small></div>
        <div class="visual-cell">執行紀錄<small>服務、交班、訓練</small></div>
        <div class="visual-cell">異常紀錄<small>事件、處置、通報</small></div>
        <div class="visual-cell">改善紀錄<small>原因、對策、追蹤</small></div>
      </div>`;
  }
  if (kind === "onsite") {
    return `
      <div class="visual-grid">
        <p class="visual-title">說的、寫的、做的</p>
        <div class="visual-pill-row">
          <div class="visual-pill">制度說明</div>
          <div class="visual-pill">紀錄佐證</div>
          <div class="visual-pill">現場行為</div>
          <div class="visual-pill">主管問答</div>
        </div>
      </div>`;
  }
  return `
    <div class="visual-grid">
      <p class="visual-title">評鑑作戰板</p>
      <div class="score-ring">80%</div>
      <div class="visual-pill-row">
        <div class="visual-pill">待補件</div>
        <div class="visual-pill">待演練</div>
        <div class="visual-pill">待複核</div>
      </div>
    </div>`;
}

function renderNav() {
  els.nav.innerHTML = slides
    .map(
      (slide, index) => `
        <button class="nav-item" type="button" data-index="${index}" aria-current="${index === currentIndex}">
          <strong>${String(index + 1).padStart(2, "0")} ${slide.title}</strong>
          <span>${slide.type}</span>
        </button>`
    )
    .join("");
}

function renderSlide() {
  const slide = slides[currentIndex];
  els.counter.textContent = `${currentIndex + 1} / ${slides.length}`;
  els.type.textContent = slide.type;
  els.visual.innerHTML = visualMarkup(slide.visual);
  els.kicker.textContent = slide.kicker;
  els.title.textContent = slide.title;
  els.lead.textContent = slide.lead;
  els.points.innerHTML = slide.points.map((point) => `<li>${point}</li>`).join("");
  els.prompt.textContent = slide.prompt;
  els.note.value = localStorage.getItem(`${noteKeyPrefix}${currentIndex}`) || "";
  renderNav();
}

function goToSlide(index) {
  currentIndex = Math.max(0, Math.min(slides.length - 1, index));
  renderSlide();
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function exportNotes() {
  const body = slides
    .map((slide, index) => {
      const note = localStorage.getItem(`${noteKeyPrefix}${index}`) || "";
      return `# ${index + 1}. ${slide.title}\n\n${note || "（尚未填寫）"}`;
    })
    .join("\n\n---\n\n");
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "long-term-care-accreditation-115-notes.txt";
  link.click();
  URL.revokeObjectURL(url);
}

els.nav.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  goToSlide(Number(button.dataset.index));
});

els.prev.addEventListener("click", () => goToSlide(currentIndex - 1));
els.next.addEventListener("click", () => goToSlide(currentIndex + 1));
els.note.addEventListener("input", () => {
  localStorage.setItem(`${noteKeyPrefix}${currentIndex}`, els.note.value);
});
els.copyPrompt.addEventListener("click", () => {
  copyText(slides[currentIndex].prompt);
  els.copyPrompt.textContent = "已複製";
  window.setTimeout(() => {
    els.copyPrompt.textContent = "複製";
  }, 1200);
});
els.exportNotes.addEventListener("click", exportNotes);
els.fullscreen.addEventListener("click", () => {
  const target = document.querySelector(".stage-wrap");
  if (!document.fullscreenElement) {
    target.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") goToSlide(currentIndex - 1);
  if (event.key === "ArrowRight") goToSlide(currentIndex + 1);
});

renderSlide();
