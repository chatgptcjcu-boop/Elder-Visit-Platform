export type VisitGuideStage = {
  id: string;
  title: string;
  goal: string;
  openingLine: string;
  formSections: Array<{
    label: string;
    href: string;
  }>;
  checks: string[];
};

export const visitGuidePrecheck = {
  title: "訪視前行政確認",
  goal: "出發前先對照名冊，現場只做簡短核對，避免讓長者覺得被盤問。",
  checks: ["姓名", "性別", "出生年月日", "身分證字號", "戶籍地址", "實際居住地址"],
};

export const visitGuideStages: VisitGuideStage[] = [
  {
    id: "identity-family-contact",
    title: "第一階段：居住、家庭與聯絡方式",
    goal: "先破冰，再確認獨居狀況、教育程度、婚姻、子女、親友互動與緊急聯絡人。",
    openingLine:
      "阿公/阿嬤你好，我是區公所訪視人員，今天來關心你最近生活狀況，也幫公所確認資料有沒有正確。",
    formSections: [
      { label: "基本資料", href: "#care-form-section-1" },
      { label: "居住與家庭支持", href: "#care-form-section-2" },
    ],
    checks: [
      "先從住家環境、樓梯或電梯切入，降低被問卷訪談的壓力。",
      "確認是否一人獨居，或同住者是否也無照顧能力。",
      "補齊電話、手機、Line 與緊急聯絡人。",
    ],
  },
  {
    id: "health-food-medical",
    title: "第二階段：身體健康與飲食",
    goal: "取得健康自評、身高體重、食慾、慢性病、住院急診、視力與聽力狀況。",
    openingLine:
      "最近吃得還可以嗎？身體有沒有哪裡比較不舒服，或最近三個月有沒有去急診、住院或開刀？",
    formSections: [{ label: "身體狀況", href: "#care-form-section-3" }],
    checks: [
      "身高、體重可以用長者自述，必要時註記為估計值。",
      "慢性病以長者平常用藥或就醫經驗協助回想。",
      "視力、聽力可透過現場互動觀察，不必一開始直接判斷。",
    ],
  },
  {
    id: "social-mood-difficulty",
    title: "第三階段：社交、困難與近期心情",
    goal: "了解日常活動、資訊來源、生活困難、煩惱、求助對象與過去兩週情緒風險。",
    openingLine:
      "平常在家都做些什麼？最近有沒有遇到比較麻煩或讓你煩惱的事情？如果需要幫忙，通常會找誰？",
    formSections: [{ label: "生活困難、情緒與活動", href: "#care-form-section-4" }],
    checks: [
      "敏感題先用生活近況帶入，再問孤單、低落或失去興趣。",
      "若提到詐騙、經濟、就醫、餐食或交通困難，應留下明確註記。",
      "若出現自傷或自殺意念，需在觀察題中記錄並送督導追蹤。",
    ],
  },
  {
    id: "service-consent",
    title: "第四階段：服務宣導與同意",
    goal: "說明可用服務，確認服務意願，完成個資同意與健康資料串聯意願。",
    openingLine:
      "公所有社區據點、關懷、電話問安、送餐和緊急救援裝置等服務，我幫你勾選有興趣或需要的項目。",
    formSections: [
      { label: "服務意願", href: "#care-form-section-4" },
      { label: "個資同意", href: "#visit-consent-section" },
    ],
    checks: [
      "用白話說明資料只作為關懷服務、政府回報與統計使用。",
      "同意書需完成簽名、蓋章或手印，未完成會進入督導覆核。",
      "服務意願有勾選時，後續應能進入轉介或追蹤流程。",
    ],
  },
  {
    id: "field-observation",
    title: "現場觀察任務：不要直接問，請用眼睛看",
    goal: "把居家安全、自我照顧、衛生、動線與精神狀況用觀察方式補入表單。",
    openingLine:
      "這一段不需要照文字問長者，請在訪談過程中自然觀察並記錄。",
    formSections: [{ label: "訪查員觀察題", href: "#care-form-section-5" }],
    checks: [
      "電氣：延長線是否插滿、電線裸露、照明是否足夠。",
      "消防與動線：熱水器通風、火源旁雜物、警報器、出入動線。",
      "衛生與自我照顧：髒亂、蟲害、通風、衣著、異味、行動能力。",
      "精神狀況：若長者提到不想活、死了比較快活等語句，需記錄並通報督導。",
    ],
  },
];
