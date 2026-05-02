export type SponsorVisibilityLevel = "subtle" | "standard" | "featured";

export type SponsorPartner = {
  id: string;
  name: string;
  shortName: string;
  industry: string;
  logoText: string;
  logoUrl: string;
  themeColor: string;
  contributionLabel: string;
  visibilityLevel: SponsorVisibilityLevel;
  activeFrom: string;
  activeTo: string;
};

export type SponsorPlacement = {
  key: string;
  label: string;
  surface: "admin" | "visitor" | "public_report";
  location: string;
  exposureLevel: SponsorVisibilityLevel;
  governanceNote: string;
  status: "active" | "recommended" | "planned";
};

export const sponsorPartners: SponsorPartner[] = [
  {
    id: "sp_warmcare",
    name: "暖心企業公益基金",
    shortName: "暖心公益",
    industry: "企業公益 / ESG",
    logoText: "暖",
    logoUrl: "",
    themeColor: "#0f766e",
    contributionLabel: "支持獨居長者關懷訪查",
    visibilityLevel: "standard",
    activeFrom: "2026-01-01",
    activeTo: "2026-12-31",
  },
  {
    id: "sp_citygood",
    name: "城市共好股份有限公司",
    shortName: "城市共好",
    industry: "在地企業",
    logoText: "共",
    logoUrl: "",
    themeColor: "#2563eb",
    contributionLabel: "支持訪員交通與成果報告",
    visibilityLevel: "subtle",
    activeFrom: "2026-03-01",
    activeTo: "2026-12-31",
  },
];

export const sponsorPlacements: SponsorPlacement[] = [
  {
    key: "admin_header",
    label: "後台頂部聯名",
    surface: "admin",
    location: "所有後台頁面的右上方，使用小型標籤呈現。",
    exposureLevel: "subtle",
    governanceNote: "不干擾派案、稽核與訪查操作，只顯示主要贊助夥伴。",
    status: "active",
  },
  {
    key: "dashboard_impact",
    label: "Dashboard 成果露出",
    surface: "admin",
    location: "總覽頁工作摘要上方或下方，顯示贊助企業與公益成果。",
    exposureLevel: "standard",
    governanceNote: "只呈現彙整數據，不顯示長者姓名、電話、地址或個案內容。",
    status: "recommended",
  },
  {
    key: "public_report_cover",
    label: "成果報告封面",
    surface: "public_report",
    location: "匯出 PDF、簡報、公開成果頁的封面或頁尾。",
    exposureLevel: "featured",
    governanceNote: "需套用同意治理與匿名化規則，僅輸出可公開揭露資料。",
    status: "planned",
  },
  {
    key: "visitor_complete",
    label: "訪查完成感謝列",
    surface: "visitor",
    location: "訪員送出訪查後的完成頁底部。",
    exposureLevel: "subtle",
    governanceNote: "不得出現在填寫個資與同意書欄位中，避免使用者誤解資料流向。",
    status: "planned",
  },
];

export function getPrimarySponsor() {
  return sponsorPartners[0];
}

export function getSponsorPlacementPlan() {
  return sponsorPlacements;
}
