# Page 1
●
●
●
●
●
●
●
獨居長者訪查管理平台－系統開發規格書 發⼼構公格後派前後台＋派案＋核銷＋稽核發⼼構公格前案
ChatGPT Codex 系統開發規格書 v2.4
⽂件名稱
獨居長者訪查管理平台－系統開發規格書 發⼼構公格後派前台訪員＋後台管理＋派案＋稽核＋核銷發⼼構公格前案
版本資訊
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
修訂重點 發⼼構公格後規 依 Red Team 再次收斂 ｡ 新增 Workspace Soft Delete､Blueprint 
Binding､AI Confidence Layer､Plan Limits､Consent Governance､Log 
Tiering發⼼構公格前派並 強 化 第 ⼀ 市 場 聚 焦 與 平 台 限 制 機 制｡
定位 發⼼構公格後規 可參數化的公益治理 SaaS 平台
核⼼架構 發⼼構公格後規 個⼈先進來 → 單位承接治理 → ⼯作空間承接專案
開發⼯具 發⼼構公格後規ChatGPT Codex
技術⽅向 發⼼構公格後規Next.js App Router + TypeScript + Tailwind + shadcn/ui + Supabase + 
PostgreSQL + PWA
⼀､v2.1 核⼼修訂結論
本版不再以單⼀ ｢獨居長者訪查系統｣ 為唯⼀邏輯 發⼼構公格前派 ⽽是重新定義為 發⼼構公格後規
Account 個⼈帳號
→ Unit 單位治理
→ Workspace 專案⼯作空間
→ Blueprint 平台藍圖
→ Parameter Engines 參數化引擎群
→ Operational Data 實際業務資料
本平台的第⼀個落地場景仍是 ｢獨居長者訪查管理｣ 發⼼構公格前派 但底層架構需同時⽀援 發⼼構公格後規
社會局 / 公所訪查
宮廟管理師課程
宮廟巡檢管理
志⼯服務管理
ESG 公益成效管理
贊助企業曝光與回饋報表
課程 ､ 實作任務 ､ 評核與證書
因此 發⼼構公格前派 表單 ､ 流程 ､ 派案 ､ 稽核 ､ 計價核銷 ､ 通知 ､ 匯出報表 ､KPI､課 程 證 書 與 贊 助
露出 發⼼構公格前派 都必須從⼀開始納入參數化架構 發⼼構公格前派 不應作為後期外掛 ｡

# Page 2
●
●
●
●
●
●
⼆､v2.4 第⼀市場聚焦與平台限制
本版開始限制平台擴張 ｡
v2.4 不再新增⼤量功能 發⼼構公格前派 ⽽是強化 發⼼構公格後規
第⼀市場聚焦
＋
Workspace 可控
＋
Blueprint 穩定
＋
AI 建議可信度
＋
法規治理
＋
長期維運能⼒
第⼀個 Go-To-Market
v2.4 明確定義 發⼼構公格後規
第⼀市場
獨居長者訪查解決⽅案
原因 發⼼構公格後規
有政府與社福預算
有核銷需求
有 KPI 需求
有稽核需求
有派案需求
有固定流程
宮廟治理與志⼯治理仍保留 發⼼構公格前派 但屬第⼆階段擴展 ｡
平台限制原則
1. 不允許無限制建立 Workspace
2. 不允許 Blueprint 被直接覆寫
3. AI 不可直接決定配置
4. 每個 Workspace 必須有責任⼈
5. Pricing 必須限制使⽤量
三､v2.3 聚焦定位
本版不再擴張功能範圍 發⼼構公格前派 ⽽是聚焦於 發⼼構公格後規
平台地基穩定
＋
解決⽅案聚焦

# Page 3
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
＋
治理與責任明確
＋
可銷售與可落地
v2.3 的核⼼⽅向不是增加更多功能 發⼼構公格前派 ⽽是避免平台複雜度失控 ｡
v2.3 收斂原則
1. 外部只賣三種⽅案
獨居長者訪查解決⽅案
宮廟治理解決⽅案
志⼯治理解決⽅案
2. Blueprint 不無限擴張
Blueprint 僅允許核⼼類型 ｡
3. Workspace 有⽣命週期與類型
避免專案無限增加 ｡
4. AI 不直接建立配置
AI 僅提供建議 ｡
5. 權限查詢需可快取
避免 RLS 複雜度造成效能問題 ｡
三､v2.2 聚焦定位
本版不再將平台對外描述為⼤型綜合系統 發⼼構公格前派 ⽽是以三個清楚的解決⽅案切入市場 ｡
對外產品定位
1. 獨居長者訪查解決⽅案
適⽤ 發⼼構公格後規
社會局
區公所
社福單位
長照據點
核⼼模組 發⼼構公格後規
名冊匯入
派案
訪查
同意書
核銷
稽核
KPI
報表
2. 宮廟治理解決⽅案
適⽤ 發⼼構公格後規
宮廟
宗教團體
宮廟管理師
地⽅⽂化組織

# Page 4
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
核⼼模組 發⼼構公格後規
巡檢
志⼯管理
活動紀錄
宮務流程
課程與證書
成果報表
贊助企業曝光
3. 志⼯治理解決⽅案
適⽤ 發⼼構公格後規
基⾦會
協會
社區組織
志⼯隊
核⼼模組 發⼼構公格後規
志⼯排班
服務紀錄
任務派發
時數統計
KPI
公益成果報表
核⼼原則
外部銷售講 ｢解決⽅案｣ ｡
內部技術維持 ｢公益治理平台｣ ｡
對外 發⼼構公格後規 解決⽅案
對內 發⼼構公格後規 可參數化公益治理平台
三､平 台 總 設 計 原 則
1. 個⼈先進來
平台入⼝是個⼈帳號 ｡ 第⼀位使⽤者可能是公所承辦⼈ ､ 宮廟主委 ､ 協會秘書 ､ 課程
學員 ､ 志⼯ ､ 講師或企業 ESG 窗⼝ ｡
個⼈帳號只代表登入者本⾝ 發⼼構公格前派 不直接承接正式資料責任 ｡
2. 單位承接治理
正式資料歸屬於 Unit｡Unit 代表治理主體 發⼼構公格前派 例如社會局 ､ 公所 ､ 宮廟 ､ 協會 ､ 基⾦
會､臺 灣 道 法 總 會､企 業 ESG 專案辦公室 ｡
Unit 管理品牌 ､ 成員 ､ 權限 ､ 可⽤模組與單位層級設定 ｡
3. ⼯作空間承接專案
Workspace 代表單位底下的⼀個具體專案或⼯作場域 ｡
例如 發⼼構公格後規
115 年獨居長者訪查
宮廟管理師第 1 期課程
某宮廟年度公益服務
某企業 ESG 長者關懷專案

# Page 5
●
1.
2.
3.
4.
5.
6.
宮廟安全巡檢專案
所有實際業務資料需綁定 unit_id 與 workspace_id｡
4. 參數化模組⼀開始就是核⼼
平台不得把訪查表 ､ 流程 ､ ⾦額 ､ 稽核條件 ､ 通知⽂字 ､ 報表欄位或 KPI 寫死在程式
碼內 ｡
所有可因單位 ､ 年度 ､ 專案 ､ 政策或課程⽽改變的邏輯 發⼼構公格前派 均需由模板 ､ 規則 ､ 版本與
條件管理 ｡
三､核 ⼼ 資 料 治 理 模 型
Account
↓
Unit Membership
↓
Unit
↓
Workspace Membership
↓
Workspace
↓
Blueprint
↓
Forms / Workflows / Rules / Reports / KPI / Sponsors
↓
Cases / Visits / Payments / Courses / Certificates / Logs
核⼼資料邊界
層級 功能
Account 個⼈登入與⾝份
Unit 單位治理 ､ 品牌 ､ 成員 ､ 授權
Workspace 專案資料 ､ 流程 ､ 表單 ､KPI､核 銷
Blueprint 快速建立某類⼯作空間
Parameter Engines 可調整規則與模板
Operational Data 實際訪查 ､ 課程 ､ 核銷 ､ 贊助與報表
資料
四､主 要 使 ⽤ 者 ⽇ 記
1. 宮廟管理師學員
學員建立個⼈帳號 ｡
選擇 ｢我是課程學員｣ ｡
建立個⼈⽰範 Workspace｡
套⽤ ｢宮廟巡檢與公益服務 Blueprint｣｡
練習表單 ､ 志⼯任務與成果報表 ｡
返回宮廟後 發⼼構公格前派 邀請主委加入 ｡

# Page 6
7.
1.
2.
3.
4.
5.
6.
1.
2.
3.
4.
將⽰範 Workspace 轉為正式 Unit 底下的正式 Workspace｡
此設計讓課程不只教觀念 發⼼構公格前派 也提供學員可帶回宮廟使⽤的數位⼯具 ｡
2. 公所承辦⼈
承辦⼈建立個⼈帳號 ｡
選擇 ｢我是單位管理者｣ ｡
建立或加入公所 Unit｡
建立 ｢115 年獨居長者訪查｣Workspace｡
套⽤ ｢獨居長者訪查 Blueprint｣｡
匯入名冊 ､ 派案 ､ 稽核 ､ 核銷與匯出報表 ｡
3. 臺灣道法總會
總會建立 Unit｡
建立多個 Workspace發⼼構公格後規課 程､巡 檢､公 益 服 務､贊 助 合 作｡
每個 Workspace 套⽤不同 Blueprint｡
統⼀管理學員 ､ 講師 ､ 評核 ､ 證書 ､ 贊助企業與成果報表 ｡
五､v2.1 資料庫總架構
A. ⾝份與治理資料表
accounts
id uuid primary key
email text unique not null
full_name text
avatar_url text
status text default 'active'
created_at timestamp default now()
updated_at timestamp default now()
units
id uuid primary key
unit_name text not null
unit_type text
city text
district text
logo_url text
theme_color text
status text default 'active'
created_by uuid references accounts(id)
created_at timestamp default now()
updated_at timestamp default now()
unit_memberships
id uuid primary key

# Page 7
unit_id uuid references units(id)
account_id uuid references accounts(id)
role_name text
status text default 'active'
joined_at timestamp
invited_by uuid references accounts(id)
created_at timestamp default now()
updated_at timestamp default now()
workspaces
id uuid primary key
unit_id uuid references units(id)
workspace_name text not null
workspace_type text
blueprint_id uuid
status text default 'draft'
created_by uuid references accounts(id)
created_at timestamp default now()
updated_at timestamp default now()
workspace_memberships
id uuid primary key
workspace_id uuid references workspaces(id)
account_id uuid references accounts(id)
role_name text
capabilities jsonb
status text default 'active'
created_at timestamp default now()
updated_at timestamp default now()
invitations
id uuid primary key
unit_id uuid references units(id)
workspace_id uuid references workspaces(id)
email text
invited_role text
invite_token text unique
status text default 'pending'
expires_at timestamp
created_at timestamp default now()

# Page 8
B. Blueprint 與啟動精靈資料表
onboarding_sessions
id uuid primary key
account_id uuid references accounts(id)
unit_id uuid references units(id)
workspace_id uuid references workspaces(id)
current_step text
status text default 'draft'
created_at timestamp default now()
updated_at timestamp default now()
onboarding_answers
id uuid primary key
session_id uuid references onboarding_sessions(id)
step_key text
question_key text
answer_value jsonb
created_at timestamp default now()
platform_blueprints
id uuid primary key
blueprint_name text
blueprint_type text
description text
config jsonb
is_active boolean default true
created_at timestamp default now()
updated_at timestamp default now()
workspace_blueprint_history
id uuid primary key
workspace_id uuid references workspaces(id)
blueprint_id uuid references platform_blueprints(id)
applied_at timestamp default now()
applied_by uuid references accounts(id)
config_snapshot jsonb

# Page 9
workspace_settings
id uuid primary key
workspace_id uuid references workspaces(id)
workspace_logo text
workspace_theme_color text
enabled_modules jsonb
settings jsonb
created_at timestamp default now()
updated_at timestamp default now()
C. 權限與能⼒資料表
role_capability_templates
id uuid primary key
template_name text
role_name text
capabilities jsonb
is_active boolean default true
created_at timestamp default now()
updated_at timestamp default now()
unit_role_capabilities
id uuid primary key
unit_id uuid references units(id)
role_name text
capabilities jsonb
created_at timestamp default now()
updated_at timestamp default now()
workspace_role_capabilities
id uuid primary key
workspace_id uuid references workspaces(id)
role_name text
capabilities jsonb
created_at timestamp default now()
updated_at timestamp default now()

# Page 10
D. 獨居長者訪查核⼼資料表
elder_cases
id uuid primary key
unit_id uuid references units(id)
workspace_id uuid references workspaces(id)
case_code text
name text
id_number text
birth_date date
phone text
address text
district text
risk_level text
status text default 'pending'
assigned_to uuid references accounts(id)
created_at timestamp default now()
updated_at timestamp default now()
visitors
id uuid primary key
unit_id uuid references units(id)
workspace_id uuid references workspaces(id)
account_id uuid references accounts(id)
certificate_number text
photo_url text
training_completed boolean default false
training_date date
is_active boolean default true
created_at timestamp default now()
updated_at timestamp default now()
training_records
id uuid primary key
unit_id uuid references units(id)
workspace_id uuid references workspaces(id)
visitor_id uuid references visitors(id)
course_name text
hours numeric
certificate_url text

# Page 11
completed boolean default false
created_at timestamp default now()
updated_at timestamp default now()
visit_schedule
id uuid primary key
unit_id uuid references units(id)
workspace_id uuid references workspaces(id)
case_id uuid references elder_cases(id)
visitor_id uuid references visitors(id)
visit_date timestamp
visit_attempt int default 1
status text default 'pending'
created_at timestamp default now()
updated_at timestamp default now()
visit_records
id uuid primary key
unit_id uuid references units(id)
workspace_id uuid references workspaces(id)
case_id uuid references elder_cases(id)
visitor_id uuid references visitors(id)
schedule_id uuid references visit_schedule(id)
visit_date timestamp
visit_result text
notes text
gps_lat numeric
gps_lng numeric
photo_url text
created_at timestamp default now()
updated_at timestamp default now()
consent_forms
id uuid primary key
unit_id uuid references units(id)
workspace_id uuid references workspaces(id)
case_id uuid references elder_cases(id)
visit_id uuid references visit_records(id)
signed boolean default false
signature_type text
signature_url text

# Page 12
signed_date date
created_at timestamp default now()
updated_at timestamp default now()
六､參 數 化 引 擎 總 覽
本系統從 v2.1 起發⼼構公格前派不 再 把 下 列 功 能 視 為 後 期 擴 充發⼼構公格前派⽽ 是 平 台 核 ⼼｡
引擎 ⽬的
表單引擎 讓不同 Workspace 使⽤不同表單
流程引擎 控制案件 ､ 課程 ､ 核銷 ､ 證書流程
匯入引擎 ⽀援不同名冊欄位
派案規則引擎 ⽀援⾃動推薦與派案限制
稽核規則引擎 ⽀援不同稽核條件
計價核銷引擎 ⽀援不同單位與專案的費⽤規則
通知模板引擎 ⽀援不同通知⽂案與觸發條件
匯出報表引擎 ⽀援不同 Excel / CSV / PDF 格式
KPI 指標引擎 ⽀援不同效益指標
課程證書引擎 ⽀援宮廟管理師課程與證書
贊助企業引擎 ⽀援企業 LOGO､訊 息､曝 光 與 成 效
報表
七､參 數 化 引 擎 資 料 表 設 計
1. 表單引擎
form_templates(id, unit_id, workspace_id, template_name, version, is_active, 
created_at, updated_at)
form_sections(id, template_id, section_name, sort_order)
form_fields(id, section_id, field_key, field_label, field_type, options jsonb, 
is_required boolean, sort_order int)
form_submissions(id, unit_id, workspace_id, template_id, entity_type, 
entity_id, submitted_by, submitted_at)
form_submission_values(id, submission_id, field_key, value jsonb)
2. 流程引擎
workflow_templates(id, unit_id, workspace_id, template_name, entity_type, 
version, is_active)
workflow_steps(id, template_id, step_key, step_name, sort_order)
workflow_transitions(id, template_id, from_step, to_step, allowed_roles jsonb, 
conditions jsonb)
workflow_instances(id, unit_id, workspace_id, template_id, entity_type, 
entity_id, current_step, status)

# Page 13
workflow_instance_logs(id, instance_id, from_step, to_step, action_by, 
metadata jsonb, created_at)
3. 動態匯入引擎
import_templates(id, unit_id, workspace_id, template_name, target_entity, 
is_active)
import_field_mappings(id, template_id, source_column, target_field, 
is_required, default_value)
custom_fields(id, unit_id, workspace_id, entity_type, field_name, field_type, 
is_required, show_in_form)
custom_field_values(id, unit_id, workspace_id, entity_type, entity_id, 
custom_field_id, value jsonb)
import_jobs(id, unit_id, workspace_id, template_id, file_url, status, created_by, 
created_at)
import_job_rows(id, import_job_id, row_number, raw_data jsonb, parsed_data 
jsonb, status, error_message)
4. 派案規則引擎
assignment_rule_sets(id, unit_id, workspace_id, rule_set_name, 
effective_start_date, effective_end_date, is_active)
assignment_rule_items(id, rule_set_id, rule_key, condition jsonb, action jsonb, 
priority int, is_active)
assignment_execution_logs(id, unit_id, workspace_id, case_id, rule_set_id, 
result jsonb, executed_at)
5. 稽核規則引擎
audit_rule_sets(id, unit_id, workspace_id, rule_set_name, effective_start_date, 
effective_end_date, is_active)
audit_check_items(id, rule_set_id, check_key, check_label, severity, condition 
jsonb, blocking boolean, is_active)
audit_rule_execution_logs(id, unit_id, workspace_id, entity_type, entity_id, 
rule_set_id, result jsonb, executed_at)
audit_records(id, unit_id, workspace_id, entity_type, entity_id, auditor_id, 
audit_result, comments, created_at)
6. 參數化計價與核銷引擎
payment_rule_sets(id, unit_id, workspace_id, rule_set_name, 
effective_start_date, effective_end_date, is_active)
payment_rule_items(id, rule_set_id, result_key, visit_fee numeric, data_fee 

# Page 14
numeric, audit_fee numeric, other_fee numeric, requires_audit boolean, 
requires_consent boolean, requires_three_attempts boolean, is_active)
payment_conditions(id, rule_item_id, condition_type, operator, 
condition_value, adjustment_type, adjustment_amount numeric, 
blocks_payment boolean)
payment_records(id, unit_id, workspace_id, case_id, visit_id, rule_set_id, 
rule_item_id, visit_fee numeric, data_fee numeric, audit_fee numeric, other_fee 
numeric, total_fee numeric, status text, calculation_detail jsonb, created_at)
payment_calculation_logs(id, payment_record_id, rule_set_id, rule_item_id, 
calculation_detail jsonb, calculated_at)
payment_batches(id, unit_id, workspace_id, batch_name, start_date, 
end_date, total_amount numeric, export_url, status, created_at)
7. 通知模板引擎
notification_templates(id, unit_id, workspace_id, template_name, channel, 
subject_template, body_template, variables jsonb, is_active)
notification_rules(id, unit_id, workspace_id, event_key, template_id, conditions 
jsonb, is_active)
notification_logs(id, unit_id, workspace_id, recipient_account_id, event_key, 
channel, content jsonb, status, sent_at)
8. 匯出報表引擎
export_templates(id, unit_id, workspace_id, template_name, export_type, 
entity_type, is_active)
export_columns(id, template_id, column_key, column_label, source_path, 
sort_order, formatter text)
export_jobs(id, unit_id, workspace_id, template_id, status, file_url, created_by, 
created_at)
export_logs(id, unit_id, workspace_id, export_job_id, metadata jsonb, 
created_at)
9. KPI 指標引擎
kpi_templates(id, unit_id, workspace_id, template_name, is_active)
kpi_items(id, template_id, kpi_key, kpi_name, calculation_source, 
calculation_config jsonb, target_value numeric, sort_order int)
kpi_results(id, unit_id, workspace_id, kpi_item_id, result_value numeric, 
period_start date, period_end date, calculated_at)
kpi_snapshots(id, unit_id, workspace_id, snapshot_name, snapshot_data 
jsonb, created_at)

# Page 15
●
●
●
●
●
●
10. 課程與證書引擎
course_templates(id, unit_id, workspace_id, course_name, description, 
total_hours numeric, is_active)
course_modules(id, course_template_id, module_name, hours numeric, 
sort_order int)
course_sessions(id, unit_id, workspace_id, course_template_id, session_name, 
start_date, end_date, status)
enrollments(id, unit_id, workspace_id, course_session_id, account_id, status, 
enrolled_at)
attendance_records(id, unit_id, workspace_id, course_session_id, account_id, 
attended_at, hours numeric)
competency_assessments(id, unit_id, workspace_id, course_session_id, 
account_id, assessor_id, result jsonb, assessed_at)
certificate_templates(id, unit_id, workspace_id, template_name, layout_config 
jsonb, is_active)
certificates(id, unit_id, workspace_id, certificate_template_id, account_id, 
certificate_no, issued_at, verification_code, status)
11. 贊助企業引擎
sponsors(id, unit_id, workspace_id, sponsor_name, logo_url, website_url, 
contact_name, contact_email, authorization_file_url, is_active)
sponsorship_packages(id, unit_id, workspace_id, package_name, 
package_level, start_date, end_date, price numeric, benefits jsonb, is_active)
sponsor_placements(id, unit_id, workspace_id, sponsor_id, package_id, 
placement_key, placement_name, page_scope, display_order int, 
max_impressions int, start_date, end_date, is_active)
sponsor_messages(id, sponsor_id, message_title, message_body, cta_text, 
cta_url, locale, is_active)
sponsor_impression_logs(id, unit_id, workspace_id, sponsor_id, 
placement_key, account_id, entity_type, entity_id, impression_at, metadata 
jsonb)
八､前 台 與 後 台 UI 原則
訪員 / 學員 / 志⼯端
⼿機優先
PWA
任務清單採通訊式列表
案件填報採對話式問答
下⽅固定選單
主⾊可依 Workspace 或 Unit 設定

# Page 16
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
不使⽤ LINE 商標 ､Logo､原 始 icon 或完整視覺識別
管理後台
Dashboard 卡片化
⼯作空間選擇器
表單 ､ 流程 ､ 規則集中管理
稽核與核銷⼀⾴式操作
可依 Workspace 切換資料
九､Layered Configuration
⽬的
避免過度參數化造成管理者迷失 ｡
系統需依使⽤者熟悉度與管理能⼒ 發⼼構公格前派 提供分層設定模式 ｡
Level 1訊賣⽅外､訂⼀簡 單 模 式
適⽤ 發⼼構公格後規
公所承辦⼈
宮廟主委
志⼯隊長
可設定 發⼼構公格後規
選擇 Blueprint
啟⽤模組
選擇主題顏⾊
指派⾓⾊
選擇預設流程與表單
不可直接修改 發⼼構公格後規
Rule JSON
Workflow Condition
KPI Formula
Payment Logic
Level 2訊賣⽅外､訂⼀進 階 模 式
適⽤ 發⼼構公格後規
專案管理者
督導
系統管理者
可設定 發⼼構公格後規
表單
派案規則
通知模板
KPI 項⽬
報表欄位
Level 3訊賣⽅外､訂⼀專 家 模 式
適⽤ 發⼼構公格後規
平台管理者
顧問
SaaS 維運團隊
可設定 發⼼構公格後規
Workflow Engine

# Page 17
●
●
●
●
●
●
●
Payment Rule Engine
Audit Engine
Sponsor Placement
Rule Conditions
JSON Config
資料表建議
configuration_levels
id uuid primary key
level_key text
level_name text
description text
created_at timestamp
workspace_configuration_levels
id uuid primary key
workspace_id uuid references workspaces(id)
configuration_level text
created_at timestamp
updated_at timestamp
⼗､Workspace Lifecycle 與 Scope
⽬的
避免 Workspace 過度膨脹 ｡
Workspace 不只是狀態 發⼼構公格前派 還需要明確⽤途類型 ｡
Workspace Scope
新增欄位 發⼼構公格後規
workspaces.workspace_scope
operational
project
temporary
sandbox
Scope 定義
operational
長期運作型 ｡
例如 發⼼構公格後規
長者訪查
宮務管理

# Page 18
●
●
●
●
●
●
●
志⼯管理
project
有開始與結束⽇期 ｡
例如 發⼼構公格後規
某年度公益專案
ESG 合作案
temporary
短期活動 ｡
例如 發⼼構公格後規
法會
⼀次性活動
sandbox
試⽤與教學 ｡
例如 發⼼構公格後規
學員練習
Demo
建議新增欄位
workspaces
workspace_scope text
start_date date nullable
end_date date nullable
archive_date date nullable
⼗⼀ ､Workspace Lifecycle
⽬的
避免 Workspace 永久存在 發⼼構公格前派 導致資料混亂與效能下降 ｡
每個 Workspace 必須具備⽣命週期 ｡
狀態
draft
active
paused
archived
closed
狀態定義
draft
尚未發佈 ｡
active
正式運⾏ ｡

# Page 19
●
●
●
●
●
●
paused
暫停使⽤ ｡
archived
不可新增資料 發⼼構公格前派 但保留查詢 ｡
closed
專案結束 發⼼構公格前派 不可再操作 ｡
建議資料表
workspace_lifecycle_logs
id uuid primary key
workspace_id uuid references workspaces(id)
previous_status text
new_status text
changed_by uuid references accounts(id)
reason text
created_at timestamp
workspace_archive_policies
id uuid primary key
workspace_id uuid references workspaces(id)
archive_after_days int
auto_archive boolean
created_at timestamp
updated_at timestamp
⼗⼆ ､AI Setup Suggestion Mode
核⼼修訂
AI Setup Assistant 不可直接建立 Workspace｡
AI 僅可 發⼼構公格後規
分析需求
推薦 Blueprint
推薦模組
推薦⾓⾊
推薦流程
推薦 KPI
建立權限仍由使⽤者確認 ｡
新流程
使⽤者回答
↓
AI 分析
↓

# Page 20
●
●
●
●
●
●
●
●
產⽣建議配置
↓
使⽤者確認
↓
建立 Workspace
新增資料表
ai_setup_recommendations
id uuid primary key
session_id uuid references ai_setup_sessions(id)
recommendation_type text
recommendation_data jsonb
accepted boolean default false
created_at timestamp
AI 原則
AI 不可 發⼼構公格後規
⾃動發布 Workspace
⾃動啟⽤核銷
⾃動建立付款規則
⾃動啟⽤⾼權限⾓⾊
AI 只能提出建議 ｡
⼗三 ､AI Setup Assistant
⽬的
降低設定⾨檻 ｡
系統不應要求使⽤者理解 發⼼構公格後規
Workflow
Rule Engine
KPI
Export Template
改為問答式建立 Workspace｡
AI 問答流程
你是誰 描如灣式綜切清
你代表哪個單位 描如灣式綜切清
你想管理什麼 描如灣式綜切清
有多少⼈參與 描如灣式綜切清
需不需要核銷 描如灣式綜切清
要不要訪查 描如灣式綜切清
需要哪些報表 描如灣式綜切清

# Page 21
●
●
●
●
●
●
●
AI 根據答案 發⼼構公格後規
建立 Workspace
套⽤ Blueprint
建立⾓⾊
建立表單
建立流程
建立 KPI
建立通知
建議資料表
ai_setup_sessions
id uuid primary key
account_id uuid references accounts(id)
unit_id uuid references units(id)
workspace_id uuid references workspaces(id)
status text
created_at timestamp
updated_at timestamp
ai_setup_answers
id uuid primary key
session_id uuid references ai_setup_sessions(id)
question_key text
answer_value jsonb
created_at timestamp
ai_generated_configs
id uuid primary key
workspace_id uuid references workspaces(id)
config_type text
config_snapshot jsonb
created_at timestamp
⼗⼆ ､Onboarding v2.2 流程
第⼀段 訊賣⽅外､訂⼀Account Onboarding
你是誰 描如灣式綜切清

# Page 22
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
選項 發⼼構公格後規
個⼈試⽤者
單位管理者
被邀請加入者
課程學員
贊助企業窗⼝
第⼆段 訊賣⽅外､訂⼀Unit Onboarding
你是否已有單位 描如灣式綜切清
選項 發⼼構公格後規
建立新單位
加入既有單位
稍後再建立
第三段 訊賣⽅外､訂⼀Workspace Onboarding
你要建立什麼⼯作空間 描如灣式綜切清
選項 發⼼構公格後規
獨居長者訪查
宮廟管理師課程
宮廟巡檢
志⼯服務
ESG 專案
⾃訂專案
第四段 訊賣⽅外､訂⼀Blueprint 套⽤
系統依 Workspace 類型產⽣ 發⼼構公格後規
預設⾓⾊
預設表單
預設流程
預設派案規則
預設稽核規則
預設計價核銷規則
預設通知模板
預設匯出報表
預設 KPI
預設贊助露出⽅案
第五段 訊賣⽅外､訂⼀ 預覽與發佈
發佈前顯⽰ 發⼼構公格後規
Workspace 名稱
已啟⽤模組
⾓⾊與能⼒
表單與流程

# Page 23
●
●
●
1.
2.
3.
4.
規則與報表
KPI Dashboard
贊助露出位置
發佈後才建立正式 Workspace 設定與成員權限 ｡
⼗四 ､Blueprint Governance
⽬的
避免 Blueprint 無限制增加與版本失控 ｡
新增資料表
blueprint_versions
id uuid primary key
blueprint_id uuid references platform_blueprints(id)
version text
config_snapshot jsonb
published_by uuid references accounts(id)
publish_status text
created_at timestamp
blueprint_governance
id uuid primary key
blueprint_id uuid references platform_blueprints(id)
owner_account_id uuid references accounts(id)
review_required boolean default true
review_notes text
created_at timestamp
updated_at timestamp
publish_status
draft
review
published
archived
Blueprint 規則
Blueprint 必須具備 owner｡
Blueprint 修改需保留版本 ｡
已被 Workspace 使⽤的 Blueprint 不可直接覆寫 ｡
新版 Blueprint 需重新 publish｡

# Page 24
1.
2.
3.
4.
⼗五 ､Workspace Soft Delete
⽬的
避免 Workspace 被誤刪導致所有資料失效 ｡
Workspace 不允許 Hard Delete｡
僅允許 發⼼構公格後規
archive
close
soft_delete
restore
新增欄位
workspaces
deleted_at timestamp nullable
deleted_by uuid nullable
restore_deadline timestamp nullable
規則
Soft Delete 後不可操作 ｡
保留資料與關聯 ｡
可於 restore_deadline 前恢復 ｡
超過期限⾃動轉 archived｡
⼗六 ､Blueprint Binding
⽬的
避免 Blueprint 更新造成 Workspace 結構不⼀致 ｡
新增資料表
workspace_blueprint_binding
id uuid primary key
workspace_id uuid references workspaces(id)
blueprint_id uuid references platform_blueprints(id)
blueprint_version_id uuid references blueprint_versions(id)
binding_status text
created_at timestamp
updated_at timestamp
binding_status
locked
upgradable

# Page 25
1.
2.
3.
4.
●
●
●
●
migrated
legacy
規則
Workspace 建立時綁定 Blueprint 版本 ｡
Blueprint 更新後不直接影響既有 Workspace｡
Workspace 可選擇升級 ｡
升級需產⽣ migration preview｡
⼗七 ､AI Confidence Layer
⽬的
提升 AI Setup 建議可信度 ｡
新增資料表
ai_recommendation_confidence
id uuid primary key
recommendation_id uuid references ai_setup_recommendations(id)
confidence_score numeric
reasoning_summary text
matched_blueprints jsonb
created_at timestamp
AI 顯⽰內容
每項建議需顯⽰ 發⼼構公格後規
建議原因
配置來源
信⼼分數
是否符合第⼀市場
範例
推薦 發⼼構公格後規 獨居長者訪查 Blueprint
Confidence: 92%
原因 發⼼構公格後規
- 需要派案
- 需要核銷
- 需要長者名冊
⼗八 ､Plan Limits
⽬的
避免 Pricing 只有價格 發⼼構公格前派 沒有使⽤限制 ｡

# Page 26
●
●
新增資料表
pricing_plan_limits
id uuid primary key
pricing_plan_id uuid references pricing_plans(id)
limit_key text
limit_value numeric
created_at timestamp
常⾒限制
max_users
max_workspaces
max_cases
max_exports
max_forms
max_notifications
驗證規則
建立資料時需檢查 發⼼構公格後規
是否超過⽅案限制
超過後 發⼼構公格後規
阻擋建立
提⽰升級
⼗九 ､Consent Governance
⽬的
避免長者與志⼯資料被不當使⽤ ｡
新增欄位
consent_forms
consent_scope jsonb
consent_expiry_date date
revoked boolean default false
revoked_at timestamp nullable
consent_scope
internal_use
government_report

# Page 27
1.
2.
3.
4.
anonymous_kpi
research_use
sponsor_reporting
規則
匯出前需檢查 consent_scope｡
KPI 使⽤需符合 consent_scope｡
贊助報表不得使⽤個⼈識別資料 ｡
若 revoked=true發⼼構公格前派不 得 再 使 ⽤｡
⼆⼗ ､Log Tiering
⽬的
避免 logs 長期爆炸 ｡
Log 分層
active_logs
最近 12 個⽉ ｡
archive_logs
12 個⽉後⾃動封存 ｡
cold_storage
超過 36 個⽉ ｡
新增資料表
log_retention_policies
id uuid primary key
workspace_id uuid references workspaces(id)
entity_type text
retention_months int
archive_after_months int
created_at timestamp
archived_logs
id uuid primary key
log_type text
source_log_id uuid
archived_data jsonb
archived_at timestamp
⼆⼗⼀ ､Pricing Engine
⽬的
讓平台可商業化與授權 ｡

# Page 28
●
●
●
定價模型
per_unit
依單位收費 ｡
per_workspace
依專案空間收費 ｡
per_user
依活躍使⽤者數收費 ｡
per_case
依案件數收費 ｡
addon_modules
依模組收費 ｡
例如 發⼼構公格後規
Sponsor Module
KPI Engine
Course Engine
新增資料表
pricing_plans
id uuid primary key
plan_name text
plan_type text
price numeric
billing_cycle text
features jsonb
is_active boolean default true
created_at timestamp
workspace_subscriptions
id uuid primary key
workspace_id uuid references workspaces(id)
pricing_plan_id uuid references pricing_plans(id)
status text
start_date date
end_date date
created_at timestamp
usage_metrics
id uuid primary key
workspace_id uuid references workspaces(id)
metric_key text
metric_value numeric

# Page 29
●
●
●
●
●
●
●
●
period_start date
period_end date
created_at timestamp
⼆⼗⼆ ､Permission Cache Layer
⽬的
避免 Supabase RLS 查詢過度複雜 ｡
新增資料表
effective_permissions
id uuid primary key
account_id uuid references accounts(id)
workspace_id uuid references workspaces(id)
permissions jsonb
last_synced_at timestamp
created_at timestamp
⽤途
登入時同步 發⼼構公格後規
role
capability
workspace access
避免每次查詢都多重 join｡
⼆⼗三 ､Responsibility Layer
⽬的
明確界定責任歸屬 ｡
每個 Workspace 必須指定
責任單位
法定代表
管理者
保險資訊
服務聲明
新增資料表
workspace_responsibility
id uuid primary key
workspace_id uuid references workspaces(id)
legal_owner_name text
responsible_person text
insurance_info text
service_disclaimer text

# Page 30
created_at timestamp
updated_at timestamp
⼆⼗四 ､ 核⼼ API / Server Actions
POST /api/onboarding/account
POST /api/onboarding/unit
POST /api/onboarding/workspace
POST /api/onboarding/publish
GET /api/workspaces
POST /api/workspaces/switch
POST /api/import/preview
POST /api/import/commit
POST /api/forms/submit
POST /api/workflow/transition
POST /api/assignment/recommend
POST /api/assignment/assign
POST /api/visits/submit
POST /api/incidents/create
POST /api/payments/calculate
POST /api/audit/run-checks
POST /api/audit/approve
POST /api/audit/reject
POST /api/exports/create
POST /api/notifications/send
POST /api/certificates/issue
GET /api/kpi/dashboard
⼆⼗五 ､Codex v2.4 開發 Phase
Phase 0訊賣⽅外､訂⼀專 案 骨 架
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立 elder-visit-platform 專案 ｡
技術 發⼼構公格後規Next.js App Router､TypeScript､Tailwind CSS､shadcn/ui､Supabase､
PostgreSQL､PWA｡
請建立 發⼼構公格後規
1. 基本 Layout
2. Supabase client
3. .env.example
4. mobile-first responsive 架構

# Page 31
5. 通訊式 UI 基礎元件
6. 下⽅固定選單元件
7. Dashboard 基礎框架
8. Workspace Selector 基礎⾴
9. Onboarding Wizard 基礎⾴
限制 發⼼構公格後規 不可使⽤ LINE 商標 ､Logo､原 始 icon 或完整視覺識別 ｡
Phase 1訊賣⽅外､訂⼀Account → Unit → Workspace 治理架構
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立平台三層治理模型 ｡
請建立資料表 發⼼構公格後規
- accounts
- units
- unit_memberships
- workspaces
- workspace_memberships
- invitations
- workspace_settings
- workspace_blueprint_history
- workspace_activity_logs
要求 發⼼構公格後規
1. Account 可加入多個 Unit｡
2. Unit 可建立多個 Workspace｡
3. Workspace 可套⽤不同 Blueprint｡
4. 使⽤者在不同 Workspace 可有不同 role 與 capabilities｡
5. 建立 RLS發⼼構公格後規所 有 業 務 資 料 需 依 unit_id + workspace_id 控制存取 ｡
Phase 2訊賣⽅外､訂⼀Blueprint 與 Onboarding v2.1
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立 Account Onboarding､Unit Onboarding､Workspace Onboarding｡
請建立資料表 發⼼構公格後規
- onboarding_sessions
- onboarding_answers
- platform_blueprints
- role_capability_templates
- unit_role_capabilities
- workspace_role_capabilities

# Page 32
⾴⾯ 發⼼構公格後規
/onboarding/account
/onboarding/unit
/onboarding/workspace
/onboarding/preview
/onboarding/publish
要求 發⼼構公格後規
1. 使⽤者先完成 Account Onboarding｡
2. 再建立或加入 Unit｡
3. 再建立 Workspace｡
4. 選擇 Blueprint｡
5. 發佈後建立 workspace_settings､workspace_memberships､預 設 模 板 與 規 則｡
Phase 3訊賣⽅外､訂⼀登 入､Workspace Selector 與動態選單
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立登入後的 Workspace 導向 ｡
需求 發⼼構公格後規
1. 登入後讀取 account｡
2. 讀取可⽤ Unit 與 Workspace｡
3. 若未完成 onboarding發⼼構公格前派導 向 onboarding｡
4. 若有多個 Workspace發⼼構公格前派導 向 /workspace/select｡
5. 選定 Workspace 後發⼼構公格前派依 workspace_memberships.capabilities 產⽣功能選單 ｡
6. 所有查詢需帶入 current_workspace_id｡
Phase 4訊賣⽅外､訂⼀動 態 匯 入 引 擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立不寫死欄位的匯入機制 ｡
請建立 發⼼構公格後規
- import_templates
- import_field_mappings
- custom_fields
- custom_field_values
- import_jobs
- import_job_rows
功能 發⼼構公格後規
1. 讀取 CSV / Excel 第⼀列欄位 ｡

# Page 33
2. 管理者可對應到系統欄位 ｡
3. 可儲存為 Workspace 匯入模板 ｡
4. 未對應欄位可轉成 custom_fields｡
5. 匯入資料需寫入 unit_id + workspace_id｡
Phase 5訊賣⽅外､訂⼀表 單 引 擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立所有訪查表 ､ 巡檢表 ､ 課程評核表共⽤的表單引擎 ｡
請建立 發⼼構公格後規
- form_templates
- form_sections
- form_fields
- form_submissions
- form_submission_values
需求 發⼼構公格後規
1. ⽀援表單版本 ｡
2. ⽀援欄位類型 text､number､date､select､multi_select､boolean､file､
signature､gps､photo｡
3. 表單可綁定 Workspace｡
4. 前台可依模板動態渲染 ｡
Phase 6訊賣⽅外､訂⼀流 程 引 擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立流程狀態與⾓⾊轉換規則 ｡
請建立 發⼼構公格後規
- workflow_templates
- workflow_steps
- workflow_transitions
- workflow_instances
- workflow_instance_logs
需求 發⼼構公格後規
1. ⽀援訪查 ､ 課程 ､ 核銷 ､ 證書流程 ｡
2. 每個 Workspace 可有不同流程 ｡
3. 轉換需檢查 role + capability｡
4. 所有流程異動需寫入 logs｡

# Page 34
Phase 7訊賣⽅外､訂⼀訪 查 業 務 資 料 與 訪 員 端 UI
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立獨居長者訪查第⼀個落地場景 ｡
請建立 發⼼構公格後規
- elder_cases
- visitors
- training_records
- visit_schedule
- visit_records
- consent_forms
⾴⾯ 發⼼構公格後規
/visitor/tasks
/visitor/records
/visitor/notifications
/visitor/me
/visitor/visits/[schedule_id]
需求 發⼼構公格後規
1. 訪員端採⼿機優先 ｡
2. 任務列表採通訊式清單 ｡
3. 訪查⾴採對話式問答 ｡
4. 表單由 form_templates 渲染 ｡
5. 流程由 workflow_templates 控制 ｡
6. 所有資料需寫入 unit_id + workspace_id｡
Phase 8訊賣⽅外､訂⼀派 案 規 則 引 擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立可參數化派案推薦與限制 ｡
請建立 發⼼構公格後規
- assignment_rule_sets
- assignment_rule_items
- assignment_execution_logs
需求 發⼼構公格後規
1. ⽀援⼈⼯派案 ｡
2. ⽀援依規則推薦訪員 ｡
3. 條件可包含地區 ､ 風險 ､ 訪員資格 ､ 可服務時段 ､ 負荷量 ､ ⼆⼈⼀組 ､ 偏遠地區 ｡
4. 顯⽰推薦原因 ｡

# Page 35
5. 所有推薦需寫入 logs｡
Phase 9訊賣⽅外､訂⼀異 常 通 報 與 通 知 模 板 引 擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立異常通報與通知模板 ｡
請建立 發⼼構公格後規
- incident_reports
- notification_templates
- notification_rules
- notification_logs
需求 發⼼構公格後規
1. 異常類型可由 Workspace 設定 ｡
2. 通知模板⽀援變數 ｡
3. ⽀援 in_app､email､LINE､SMS 預留 ｡
4. 異常可觸發督導通知與 KPI｡
Phase 10訊賣⽅外､訂⼀參 數 化 計 價 與 核 銷 引 擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立不寫死⾦額的 payment rule engine｡
請建立 發⼼構公格後規
- payment_rule_sets
- payment_rule_items
- payment_conditions
- payment_records
- payment_calculation_logs
- payment_batches
需求 發⼼構公格後規
1. 規則綁定 unit_id + workspace_id｡
2. ⽀援規則版本與⽣效⽇期 ｡
3. ⽀援 success / not_found / refused 或⾃訂 result_key｡
4. ⽀援同意書 ､ 三次訪視 ､GPS､照 片､稽 核 通 過 等 條 件｡
5. calculatePayment(visit_record_id) 依規則產⽣ payment_records｡
6. ⾦額不得由前端修改 ｡
7. 稽核後⾦額鎖定 ｡

# Page 36
Phase 11訊賣⽅外､訂⼀稽 核 規 則 引 擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立⾃動檢核與⼈⼯覆核 ｡
請建立 發⼼構公格後規
- audit_rule_sets
- audit_check_items
- audit_rule_execution_logs
- audit_records
需求 發⼼構公格後規
1. 稽核規則綁定 Workspace｡
2. blocking 未通過不得核准 ｡
3. warning 可由主管覆核 ｡
4. 稽核結果需影響 payment_records.status｡
Phase 12訊賣⽅外､訂⼀匯 出 報 表 引 擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立可參數化 Excel / CSV 匯出 ｡
請建立 發⼼構公格後規
- export_templates
- export_columns
- export_jobs
- export_logs
需求 發⼼構公格後規
1. 報表欄位不寫死 ｡
2. ⽀援核銷報表 ､ 訪查成果 ､KPI､贊 助 曝 光､課 程 證 書｡
3. Manager 只能匯出⾃⼰ Workspace｡
4. Admin 可跨 Workspace 匯出 ｡
Phase 13訊賣⽅外､訂⼀Dashboard 與 KPI 引擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立可設定 KPI Dashboard｡
請建立 發⼼構公格後規
- kpi_templates
- kpi_items

# Page 37
- kpi_results
- kpi_snapshots
需求 發⼼構公格後規
1. KPI 由 Workspace 模板定義 ｡
2. ⽀援訪查完成率 ､ 拒訪率 ､ 未遇率 ､ 核銷準確率 ､ 志⼯時數 ､ 課程通過率 ､ 贊助曝
光次數 ｡
3. Dashboard 依使⽤者 Workspace 與 capabilities 顯⽰資料 ｡
Phase 14訊賣⽅外､訂⼀課 程 與 證 書 引 擎
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立宮廟管理師課程與證書能⼒ ｡
請建立 發⼼構公格後規
- course_templates
- course_modules
- course_sessions
- enrollments
- attendance_records
- competency_assessments
- certificate_templates
- certificates
需求 發⼼構公格後規
1. ⽀援課程報名 ､ 出席 ､ 評核與發證 ｡
2. 實作任務可綁定 Workspace 表單或任務 ｡
3. 證書可查驗 ｡
4. 證書可依 sponsor_placements 顯⽰授權 LOGO｡
Phase 15訊賣⽅外､訂⼀贊 助 企 業 參 數 化 模 組
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立贊助企業 LOGO､訊 息､曝 光 與 成 果 回 報｡
請建立 發⼼構公格後規
- sponsors
- sponsorship_packages
- sponsor_placements
- sponsor_messages
- sponsor_impression_logs
需求 發⼼構公格後規

# Page 38
1. 贊助設定綁定 Workspace｡
2. ⽀援 LOGO､訊 息､CTA､曝 光 位 置､曝 光 期 間｡
3. 每次曝光寫入 sponsor_impression_logs｡
4. 可匯出贊助曝光成果報表 ｡
5. sponsor 需保留 authorization_file_url｡
Phase 16訊賣⽅外､訂⼀單 位 與 Workspace 設定
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立管理設定⾴ ｡
⾴⾯ 發⼼構公格後規
/admin/units
/manager/settings
/workspace/settings
功能 發⼼構公格後規
1. 單位名稱 ､Logo､主 ⾊｡
2. Workspace 名稱 ､Logo､主 ⾊｡
3. 啟⽤模組 ｡
4. 管理成員與邀請 ｡
5. 管理 Blueprint､表 單､流 程､規 則､報 表､KPI､贊 助｡
Phase 17訊賣⽅外､訂⼀測 試 資 料 與 驗 收
版本 發⼼構公格後規v2.4
⽇期 發⼼構公格後規2026-04-25
任務 發⼼構公格後規 建立多場景 seed data 與驗收流程 ｡
測試資料 發⼼構公格後規
1. 3 個 Account｡
2. 3 個 Unit｡
3. 每個 Unit ⾄少 2 個 Workspace｡
4. 每個 Workspace 使⽤不同 Blueprint｡
5. 測試獨居長者訪查 ､ 宮廟管理師課程 ､ESG 贊助專案 ｡
6. 測試不同表單 ､ 流程 ､ 計價 ､ 稽核 ､ 通知 ､ 報表 ､KPI｡
7. 測試 workspace selector 與 RLS 資料隔離 ｡
請提供 發⼼構公格後規
- 測試步驟
- 驗收清單
- 已知限制
- 下⼀階段建議

# Page 39
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
●
⼆⼗六 ､ 商品化定位
1. 公益治理基礎版
適⽤ 發⼼構公格後規 宮廟 ､ 社區 ､ 志⼯隊 ｡
包含 發⼼構公格後規
個⼈帳號
單位管理
Workspace
表單引擎
任務管理
基本報表
2. 社福訪查專案版
適⽤ 發⼼構公格後規 公所 ､ 社福單位 ､ 協會 ｡
包含 發⼼構公格後規
動態名冊匯入
派案規則
訪查表單
稽核規則
參數化核銷
政府格式匯出
3. 宮廟管理師教育版
適⽤ 發⼼構公格後規 臺灣道法總會 ､ 課程單位 ､ 宮廟管理師學員 ｡
包含 發⼼構公格後規
課程管理
出席紀錄
實作任務
能⼒評核
證書發放
學員帶回宮廟使⽤的⽰範 Workspace
4. ESG 贊助版
適⽤ 發⼼構公格後規 企業 ､ 基⾦會 ､ 公益合作專案 ｡
包含 發⼼構公格後規
贊助商管理
LOGO 授權紀錄
曝光⽅案
KPI 成效報表
公益成果匯出
⼆⼗七 ､ 侵權與合規控管
1. 通訊式 UI
可採⽤聊天式或通訊式操作體驗 發⼼構公格前派 但不得使⽤ LINE 商標 ､Logo､原 始 icon､完 整 視
覺識別或⾜以造成混淆的命名 ｡
建議名稱 發⼼構公格後規

# Page 40
●
●
●
●
●
●
通訊式任務介⾯
對話式填報流程
聊天式⼯作流
2. 政府表單
政府⽂件可作為流程與欄位參考 ｡ 商業產品應轉化為⾃⼰的表單模板 ､ 欄位結構與流
程設定 發⼼構公格前派 不應直接複製政府 PDF 版⾯ ｡
3. 贊助企業 LOGO
使⽤企業 LOGO 前需取得授權 發⼼構公格前派 並將授權⽂件存入 
sponsors.authorization_file_url｡
4. 宮廟管理師證書
證書需明確標⽰為訓練單位或協會證書 發⼼構公格前派 不得誤導為國家證照 發⼼構公格前派 除非未來取得相應法
定授權 ｡
5. 個資與敏感資料
獨居長者訪查涉及個資與可能的健康 ､ ⼼理 ､ ⽣活風險資料 發⼼構公格前派 需落實 發⼼構公格後規
RLS 資料隔離
操作紀錄
最⼩權限
匯出紀錄
同意書保存
檔案存取權限
⼆⼗八 ､ 開發順序建議
第⼀階段先做平台地基 發⼼構公格後規
Phase 0 → Phase 1 → Phase 2 → Phase 3
第⼆階段做參數化核⼼ 發⼼構公格後規
Phase 4 → Phase 5 → Phase 6 → Phase 8 → Phase 10 → Phase 11 → Phase 12
第三階段做獨居長者訪查落地場景 發⼼構公格後規
Phase 7 → Phase 9 → Phase 13
第四階段做宮廟管理師與商品化模組 發⼼構公格後規
Phase 14 → Phase 15 → Phase 16 → Phase 17
每次交給 Codex 執⾏⼀個 Phase發⼼構公格前派並 要 求 回 覆發⼼構公格後規

# Page 41
1. 修改了哪些檔案
2. 新增了哪些資料表
3. 如何執⾏ migration
4. 如何測試
5. 驗收條件
6. 尚未完成或風險事項
⼆⼗九 ､ 最終定位
本系統 v2.1 的定位是 發⼼構公格後規
以個⼈帳號為入⼝ ､ 以單位為治理主體 ､ 以⼯作空間承接專案 ､ 以參數化引擎⽀援多
場景的公益治理 SaaS 平台 ｡
獨居長者訪查是第⼀個落地應⽤ ｡ 宮廟管理師 ､ 志⼯服務 ､ESG 贊助 ､ 課程證書與公
益成果管理 發⼼構公格前派 是同⼀平台架構下的延伸應⽤ ｡