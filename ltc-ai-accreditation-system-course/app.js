const slides = [
  ["01", "課程封面", "創業產品雛形", "長照機構用生成式 AI 實作評鑑管理系統", "這是一門給長榮大學醫管系大三大四的專題課：把長照評鑑痛點，轉成一個能展示、能討論、能迭代的系統產品雛形。", ["目標不是背 AI 名詞，而是做出可展示的管理工具。", "專題成果要能說清楚場域問題、使用者、資料流與產品價值。", "全程使用假資料與去識別化案例，不碰真實住民個資。"], "cover"],
  ["02", "課程地圖", "48+8 完整版", "從場域問題走到可發佈產品", "完整版把課程拆成問題理解、AI 工作流、MVP 設計、Codex 實作、驗收發表與創業判斷六段。", ["48 頁主講義建立完整專題流程。", "8 頁附錄卡提供課堂快速查用工具。", "每頁都有可複製 Prompt 方便學生延伸。"], "flow"],
  ["03", "專題成果", "今天要完成什麼", "最後不是交報告，而是交一個產品故事", "學生最後要能展示一個長照評鑑管理系統 MVP，並說明生成式 AI 如何協助需求整理、原型製作與品質改善。", ["一個可操作的線上原型。", "一份需求與資料欄位說明。", "一套 Prompt 包與 AI 使用揭露。"], "product"],
  ["04", "學習成果", "學生能力圖", "醫管專題要同時訓練場域、資料、產品與 AI", "本課程的學習成果不是單一工具操作，而是讓學生能把管理問題轉成系統化產出。", ["能描述長照評鑑管理痛點。", "能設計資料欄位與工作流程。", "能用 AI 協助產出與驗證。", "能公開展示產品雛形。"], "matrix"],
  ["05", "場域問題", "評鑑不是考試", "評鑑管理的本質是日常品質營運", "長照機構準備評鑑時，真正困難不是不知道要做，而是資料、責任、期限、佐證與改善紀錄常常分散。", ["文件找得到嗎？", "誰負責補件？", "缺失有沒有追蹤到關閉？", "主管能不能一眼看到準備狀態？"], "problem"],
  ["06", "長照場域", "機構營運脈絡", "評鑑系統要理解照護現場的節奏", "長照機構每天同時處理照護、人力、紀錄、家屬溝通與行政文件，系統必須降低負擔而不是增加表單。", ["評鑑資料來自日常作業。", "照護同仁時間有限，流程要簡單。", "主管需要看見風險，不只看文件數量。"], "users"],
  ["07", "學科連結", "醫管系角色", "醫管系學生適合把制度翻譯成系統", "醫管訓練本來就橫跨制度、流程、品質、成本與資訊管理。這個專題把這些能力整合成一個產品雛形。", ["把評鑑指標轉成管理欄位。", "把現場流程轉成系統任務。", "把品質改善轉成追蹤機制。"], "matrix"],
  ["08", "使用者", "系統服務誰", "先定義使用者，再決定功能", "長照評鑑管理系統不是給一個抽象的機構使用，而是服務不同角色的工作壓力。", ["機構負責人：看整體風險與進度。", "行政窗口：整理指標、文件與期限。", "照護主管：補充現場紀錄與改善。", "稽核/顧問：檢查缺口並提出建議。"], "users"],
  ["09", "使用情境", "一天中的評鑑管理", "把系統放回真實工作日，功能才會有優先順序", "學生要想像行政窗口、主管與照護同仁一天如何遇到評鑑資料需求，從情境推導畫面與提醒。", ["早上看本週待辦與逾期。", "中午補上會議紀錄與佐證。", "下午主管複核缺失改善。"], "flow"],
  ["10", "痛點地圖", "從混亂到系統", "把評鑑痛點整理成產品機會", "學生要學會把抱怨轉成系統需求：每個痛點都要能對應到資料欄位、操作流程或視覺化回饋。", ["痛點：資料散落。功能：佐證資料庫。", "痛點：進度不清。功能：儀表板。", "痛點：改善斷掉。功能：缺失追蹤。"], "flow"],
  ["11", "資料倫理", "不能碰真實個資", "產品雛形必須先守住資料邊界", "長照場域涉及健康、家庭、照護與身分資料。課堂原型只能使用假資料、模擬案例與去識別化欄位。", ["不用真實住民姓名與身分證字號。", "照片、錄音、病歷與照護紀錄不得直接上傳。", "所有案例以模擬資料替代。"], "risk"],
  ["12", "問題定義", "專題題目不是口號", "把題目寫成可驗證的產品假設", "好的專題題目要說清楚對象、問題、方法與成果，而不是只把 AI、長照與評鑑三個詞放在一起。", ["誰遇到問題？", "現在怎麼處理？", "系統改善哪個成本或風險？", "如何驗證有用？"], "startup"],
  ["13", "需求拆解", "評鑑指標變需求", "把文字規定翻成系統可管理的單位", "一條評鑑要求可以拆成：指標、佐證、責任人、頻率、狀態、風險、改善紀錄。這就是系統資料模型的起點。", ["指標：要達成什麼。", "佐證：用什麼證明。", "責任：誰處理。", "狀態：目前進度如何。"], "schema"],
  ["14", "指標分類", "從章節到模組", "分類方式會決定使用者怎麼找資料", "學生可以先用行政管理、照護品質、環境安全、人力訓練、權益保障與持續改善等示範分類建立資訊架構。", ["分類要符合使用者語言。", "分類不要太細，先能管理。", "每個分類要能連到負責角色。"], "list"],
  ["15", "佐證邏輯", "文件不是附件", "佐證資料要回答管理問題", "文件管理的重點不是上傳檔案，而是讓主管知道它證明哪個指標、是否有效、是否需要補件。", ["佐證要連到指標。", "佐證要有日期與版本。", "佐證要有有效性狀態。"], "docs"],
  ["16", "缺失閉環", "改善不是備註", "缺失追蹤要形成可複核的管理循環", "缺失改善如果沒有原因、行動、期限、責任與複核，就只是文字紀錄，不能支撐管理。", ["發現問題。", "分析原因。", "設定行動。", "追蹤期限。", "主管複核。"], "improve"],
  ["17", "AI 工作流", "生成式 AI 做什麼", "AI 是需求分析與產出加速器，不是制度負責人", "AI 可以幫忙整理、分類、產生草稿、提出檢核問題；但專業判斷、資料邊界與責任歸屬仍由人決定。", ["AI 整理評鑑文字。", "AI 產生欄位表與假資料。", "AI 協助撰寫改善建議。", "人負責驗證與決策。"], "ai"],
  ["18", "AI 任務清單", "適合交給 AI 的工作", "把 AI 用在可檢查、可修正、可追溯的任務", "醫管專題使用 AI 時，優先挑選能被人審核的產出，例如摘要、分類、欄位草稿、假資料與測試案例。", ["摘要長文件。", "轉成表格。", "產生假資料。", "建立測試清單。"], "ai"],
  ["19", "Prompt 方法", "Prompt 五欄法", "把任務講清楚，AI 才能穩定產出", "每次請 AI 幫忙時，至少說清楚任務、背景、資料、格式與限制。這會直接影響專題產出的品質。", ["任務：要 AI 做什麼。", "背景：醫管/長照/評鑑脈絡。", "資料：貼入指標或案例。", "格式：表格、JSON、清單或頁面。", "限制：不得使用個資，不得杜撰法規。"], "prompt"],
  ["20", "Prompt 迭代", "第一次輸出通常不是答案", "把 AI 當成協作草稿，不是最終稿", "學生要練習追問、要求格式修正、要求補充欄位與要求列出不確定處，讓輸出逐步接近可用。", ["先要求初稿。", "再要求補缺漏。", "再要求轉成系統格式。", "最後由人審核。"], "prompt"],
  ["21", "資料來源", "來源與版本", "沒有來源的內容不能進入專題結論", "長照評鑑相關內容要記錄來源、版本與適用範圍；若沒有正式來源，就只能標成示範資料。", ["標示來源文件名稱。", "標示年度與版本。", "區分正式資料與課堂假資料。"], "risk"],
  ["22", "假資料", "可展示但不傷害", "好的假資料讓產品能演示，又不暴露真實個資", "學生應設計足夠真實的模擬機構、指標、文件、缺失與改善紀錄，但不得使用任何可識別個人或機構的資料。", ["使用模擬機構名稱。", "使用代碼取代個人。", "保留管理情境的真實性。"], "schema"],
  ["23", "MVP", "產品最小範圍", "第一版只做能展示價值的核心功能", "專題不是一次做完整商用系統。先做 MVP：讓主管看見進度、讓窗口管理佐證、讓團隊追蹤改善。", ["首頁儀表板。", "評鑑指標清單。", "佐證資料管理。", "缺失改善追蹤。", "AI 助理提示區。"], "mvp"],
  ["24", "首頁", "儀表板", "主管第一眼要看到風險與進度", "首頁不是裝飾，而是決策畫面。它應該快速回答：現在準備到哪裡？最危險的是什麼？誰需要支援？", ["整體完成率。", "高風險指標。", "逾期補件。", "本週應處理事項。"], "dashboard"],
  ["25", "指標", "指標清單", "把評鑑要求變成可追蹤任務", "指標清單要讓學生理解管理系統的核心：每個指標都要有分類、狀態、責任人與佐證要求。", ["分類：行政、照護、環境、品質。", "狀態：未開始、進行中、待複核、完成。", "責任人：行政或照護主管。"], "list"],
  ["26", "佐證", "文件管理", "文件不是堆資料，是回答評鑑問題", "佐證資料要能連回指標，並保留版本、日期、負責人與缺口說明。這是評鑑準備最容易失控的地方。", ["每份文件連到一個或多個指標。", "標示是否有效、過期或待補。", "保留補件原因與下一步。"], "docs"],
  ["27", "改善", "缺失追蹤", "缺失沒有關閉，就不是改善", "評鑑管理系統要讓缺失從發現、原因、對策、責任、期限到複核形成閉環。", ["發現問題。", "判斷原因。", "提出對策。", "設定期限。", "完成複核。"], "improve"],
  ["28", "AI 助理", "系統裡的 AI", "AI 助理要嵌在工作流，不是另外開一個聊天框", "產品雛形中的 AI 助理應該幫使用者完成具體任務，例如產生檢核問題、改善摘要、會議紀錄與缺口清單。", ["根據指標產生檢核問題。", "根據缺失草擬改善計畫。", "把會議紀錄轉成待辦事項。"], "assistant"],
  ["29", "報告輸出", "主管摘要", "系統要能把管理狀態整理成可溝通的摘要", "產品雛形可以加入一鍵產生本週風險摘要、補件清單與改善進度的示範功能。", ["本週完成事項。", "逾期與高風險項目。", "需要主管決策的問題。"], "docs"],
  ["30", "權限角色", "誰能看什麼", "評鑑管理系統也要有基本權限概念", "即使是靜態雛形，也要讓學生說明不同角色看到的資料與能做的操作不同。", ["主管：看全局與複核。", "行政：維護文件與期限。", "照護主管：補現場紀錄。", "顧問：只看檢查與建議。"], "users"],
  ["31", "資料模型", "欄位設計", "好的欄位讓系統後面可以長大", "學生需要設計基本資料表，而不是只做漂亮頁面。資料模型決定產品能不能被管理、被查詢、被擴充。", ["Indicator：評鑑指標。", "Evidence：佐證資料。", "Finding：缺失與風險。", "Action：改善行動。", "User：角色與責任。"], "schema"],
  ["32", "資料關聯", "從表格到流程", "資料之間的關係比單一欄位更重要", "指標、佐證、缺失與改善行動要能互相連結，使用者才不會在不同頁面重複找資料。", ["一個指標有多份佐證。", "一個缺失對應一個指標。", "一個改善行動要有責任人與期限。"], "schema"],
  ["33", "小組分工", "專題團隊", "每個人都要有可交付成果", "大三大四專題應該像產品小隊。每個角色都要能說出自己負責的產出，不要只把工作丟給會寫程式的人。", ["PM/場域研究：問題與使用者。", "資料設計：欄位與假資料。", "AI 工作流：Prompt 與輸出檢查。", "原型製作：頁面與互動。", "QA/發表：驗收與展示。"], "team"],
  ["34", "專案管理", "週次與里程碑", "專題要用小步快跑，而不是期末前一次趕工", "建議以六週節奏完成：問題定義、資料模型、AI 工作流、原型實作、驗收修正、成果發表。", ["第 1 週：題目與使用者。", "第 2 週：欄位與假資料。", "第 3-4 週：原型。", "第 5 週：驗收。", "第 6 週：發表。"], "flow"],
  ["35", "Codex", "從規格到原型", "Codex 負責執行，但你要給它清楚的工作包", "學生要練習把需求、資料欄位、頁面、限制與驗收條件交給 Codex，而不是只說「幫我做一個系統」。", ["先寫專案 brief。", "再給資料模型與頁面清單。", "要求本機驗證與修正。", "最後整理 README 與發佈。"], "codex"],
  ["36", "AGENTS.md", "專案操作手冊", "把團隊規則寫進專案，而不是靠口頭提醒", "學生可以用 AGENTS.md 記錄專案目標、資料邊界、驗證方式、發佈規則與 AI 使用限制。", ["寫明不得使用真實個資。", "寫明驗證命令。", "寫明發佈前檢查。"], "codex"],
  ["37", "第一輪指令", "請 Codex 建 MVP", "第一次實作指令要包含清楚範圍", "給 Codex 的第一輪任務應該包含頁面、資料欄位、假資料、互動與驗收條件，避免產出變成空泛 demo。", ["建立 5 個核心頁。", "放入假資料。", "加入基本互動。", "提供 README。"], "prompt"],
  ["38", "第二輪指令", "修正與產品化", "第二輪不是加功能，而是讓流程更像真實工作", "學生要學會根據截圖、操作測試與使用者情境，請 Codex 修正資訊層級、狀態標示與手機版操作。", ["修正資訊過密。", "補空狀態與錯誤狀態。", "改善手機閱讀。"], "check"],
  ["39", "UI 原則", "醫管系產品不要做成海報", "營運工具要安靜、清楚、可掃描", "長照評鑑系統應該像工作台，不像宣傳頁。重點是資訊層級、狀態清楚與下一步明確。", ["少用裝飾性大圖。", "多用表格、狀態與篩選。", "讓下一步操作清楚。"], "dashboard"],
  ["40", "手機版", "現場可用性", "很多管理工作會在現場或會議中被打開", "即使專題不是正式產品，也要檢查手機寬度，確保目錄、卡片、按鈕與文字不互相擠壓。", ["手機第一屏要看到主要內容。", "按鈕要可點。", "長文字要能換行。"], "check"],
  ["41", "驗收", "怎麼判斷做得好", "產品雛形要用真實場景驗收", "驗收不是問畫面好不好看，而是問使用者能不能完成評鑑管理任務。", ["主管能看懂目前風險嗎？", "行政能知道缺什麼文件嗎？", "照護主管能追蹤改善嗎？", "AI 輸出有來源與限制嗎？"], "check"],
  ["42", "測試案例", "用任務測試系統", "測試要模擬使用者任務，而不是只看頁面有沒有打開", "每組至少設計五個測試任務，確認使用者能從問題一路完成到紀錄或匯出。", ["找出逾期佐證。", "新增一筆缺失。", "產生改善建議。", "匯出週報摘要。"], "check"],
  ["43", "展示", "發表腳本", "展示要講產品價值，不是逐頁唸功能", "學生發表時要先講問題，再講使用者，再展示流程，最後說明 AI 如何幫忙與有哪些限制。", ["1 分鐘：場域痛點。", "2 分鐘：產品流程。", "1 分鐘：AI 工作流。", "1 分鐘：風險與下一步。"], "pitch"],
  ["44", "創業視角", "產品雛形", "把專題當成一個可驗證的產品假設", "這不是要學生真的創業，而是練習產品思考：誰願意用？為什麼現在的方法不夠？這個系統節省什麼成本？", ["使用者：中小型長照機構。", "價值：降低評鑑準備混亂。", "差異：AI 協助文件整理與改善追蹤。"], "startup"],
  ["45", "商業模式", "誰會付費", "產品雛形也要能說出可能的採用理由", "學生不必做財務模型，但要能描述機構、顧問、教育訓練或協會可能如何使用這個工具。", ["機構內部評鑑準備。", "顧問輔導工具。", "教育訓練教材。"], "startup"],
  ["46", "風險", "限制與揭露", "AI 專案要把不能做的事情說清楚", "醫管領域的 AI 產品必須主動揭露限制，包括資料品質、法規更新、模型幻覺、個資與專業責任。", ["不得宣稱 AI 自動通過評鑑。", "不得使用未授權資料。", "AI 建議必須由人審核。"], "risk"],
  ["47", "履歷作品", "怎麼展示成果", "把專題整理成可被看懂的作品集", "學生可以把 GitHub Pages、README、截圖、資料模型與 AI 使用揭露整理成履歷作品，呈現醫管與 AI 產品能力。", ["一句話說明產品。", "三張流程截圖。", "一份 Prompt 包。", "一段風險揭露。"], "pitch"],
  ["48", "收尾", "期末帶走", "醫管系學生要帶走一套可複製的 AI 產品方法", "完成這個專題後，學生不只會用 AI，而是會把場域問題轉成資料、流程、原型、驗收與產品故事。", ["從問題開始。", "用 AI 加速整理與實作。", "用管理邏輯驗收系統。", "用 GitHub 展示成果。"], "close"],
  ["A01", "附錄", "Prompt 五欄卡", "每次請 AI 協作前，先填五欄", "五欄法是學生最容易複製的提示詞框架，能降低亂問、亂改與亂產出的風險。", ["任務：請 AI 產出什麼。", "背景：長照機構與評鑑情境。", "資料：貼入指標或假資料。", "格式：指定表格或 JSON。", "限制：不得杜撰，不碰個資。"], "prompt"],
  ["A02", "附錄", "指標整理卡", "把評鑑要求轉成資料欄位", "每個指標都要被整理成可查、可追、可分派的管理單位。", ["指標名稱。", "管理分類。", "佐證文件。", "責任角色。", "目前狀態。", "風險等級。"], "list"],
  ["A03", "附錄", "佐證文件卡", "文件要能證明指標，不只是被存放", "每份佐證都應該能回答它對應哪個指標、何時更新、誰負責與目前是否有效。", ["文件名稱。", "對應指標。", "版本日期。", "有效狀態。", "補件說明。"], "docs"],
  ["A04", "附錄", "MVP 功能卡", "第一版只做核心流程", "避免專題膨脹。先讓五個核心頁面跑通，再談進階功能。", ["Dashboard。", "指標清單。", "佐證管理。", "缺失追蹤。", "AI 助理。"], "mvp"],
  ["A05", "附錄", "Codex 交接卡", "把工作交給 Codex 前要準備什麼", "Codex 的品質取決於你交代得多清楚。交接卡可以讓學生練習像產品經理一樣描述需求。", ["目標與使用者。", "頁面清單。", "資料欄位。", "假資料。", "驗收條件。"], "codex"],
  ["A06", "附錄", "驗收測試卡", "用任務檢查產品，而不是用感覺評分", "每組都應該用清楚的任務測試系統，確認流程真的可操作。", ["找高風險指標。", "補一份佐證。", "新增缺失。", "產生改善摘要。", "匯出報告。"], "check"],
  ["A07", "附錄", "發表檢查卡", "展示前先確認故事完整", "好的專題發表要兼顧場域、產品、AI、限制與下一步。", ["有明確痛點。", "有可操作原型。", "有 AI 協作證據。", "有資料倫理說明。", "有下一版規劃。"], "pitch"],
  ["A08", "附錄", "AI 使用揭露卡", "把 AI 用在哪裡說清楚", "學生要學會誠實揭露 AI 在專題中的角色，這也是未來職場與研究的重要能力。", ["AI 協助資料整理。", "AI 協助程式與頁面草稿。", "AI 協助測試與修正。", "人負責審核與決策。"], "ai"]
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
