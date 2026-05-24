# Supabase 資料庫建立說明

## 執行方式

目前專案已整理好 `supabase/migrations` 內的 SQL。若尚未安裝 Supabase CLI，可先用 Supabase 後台的 SQL Editor 手動執行。

請依照檔名順序執行：

1. `0001_governance_schema.sql`
2. `0002_onboarding_blueprint_governance.sql`
3. `0003_elder_visit_operations.sql`
4. `0004_workspace_settings_governance.sql`
5. `0005_import_engine.sql`
6. `0006_parameter_engines.sql`
7. `0007_incidents_notifications.sql`
8. `0008_export_jobs.sql`
9. `0009_auth_account_bridge.sql`
10. `0010_consent_governance.sql`
11. `0011_log_tiering.sql`
12. `0012_blueprint_migration_previews.sql`
13. `0013_audit_decisions.sql`
14. `0014_payment_locks.sql`
15. `0015_payment_batches.sql`
16. `0016_assignment_recommendations.sql`
17. `0017_case_registry_status.sql`
18. `0018_kpi_reports.sql`
19. `0019_incident_decisions.sql`
20. `0020_role_permissions.sql`
21. `0021_user_registration_requests.sql`
22. `0022_sponsor_governance.sql`
23. `0023_workgroup_communications.sql`
24. `0024_government_forms.sql`
25. `0025_assignment_payment_policy.sql`
26. `0026_visitor_registration_review.sql`
27. `0027_visitor_identity_profile_completion.sql`
28. `0028_visitor_remittance_documents.sql`
29. `0029_visitor_headshot_storage.sql`
30. `0030_visitor_remittance_storage_qr_site.sql`

最後再執行：

- `seed.sql`

## 模組對應

- 帳號、單位、工作空間、角色、權限：`0001`, `0009`, `0020`, `0021`, `0026`, `0027`
- 啟動流程、藍圖、方案限制、AI 建議：`0002`, `0012`
- 名冊、訪員、派案、訪查紀錄：`0003`, `0016`, `0017`, `0025`, `0026`, `0027`
- 空間規則、停用復原、贊助企業聯名：`0004`, `0022`
- 匯入欄位、客製欄位：`0005`
- 表單、流程模板、匯出模板、KPI：`0006`, `0018`, `0024`
- 異常通報、通知、工作群組訊息、LINE 綁定：`0007`, `0019`, `0023`
- 匯出、核銷、付款鎖定、費率參數、訪員匯款資料：`0008`, `0014`, `0015`, `0025`, `0028`, `0030`
- 訪員證件照私有附件儲存：`0029`
- 訪員存摺私有附件儲存與 QR 正式網址修正：`0030`
- 個資同意治理與使用紀錄：`0010`
- 日誌分層與保留政策：`0011`

## 注意事項

- `anon public key` 可以放在 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
- `service_role key` 不要貼在前端，也不要放入 `NEXT_PUBLIC_*`。
- 訪員公開註冊會由伺服器端寫入 `workspace_registration_requests`，正式環境需設定 `SUPABASE_SERVICE_ROLE_KEY`，否則系統會只保留暫存 fallback。
- 執行 `0029` 後，新註冊的證件照會優先保存至私有 `visitor-headshots` bucket；既有資料欄位照片仍可由後台匯出流程相容讀取。
- 執行 `0030` 後，訪員新上傳的存摺封面會優先保存至私有 `visitor-remittance-documents` bucket，既有舊 Netlify QR 連結會修正到正式 Vercel 網址，登入邀請亦會累計寄送次數供後台辨識重寄紀錄。
- 正式環境可設定 `NEXT_PUBLIC_APP_URL` 作為新產生 QR Code 的網址基底，例如 `https://elder-visit-platform.vercel.app`。
- 目前程式已有 Supabase 連線設定，但 repository 仍有 mock fallback。資料表建立後，下一步才是逐頁把資料來源改成 Supabase 查詢。
- RLS 已在 migration 中啟用，正式接資料時要以登入帳號、工作空間成員與角色權限做查詢範圍控管。
