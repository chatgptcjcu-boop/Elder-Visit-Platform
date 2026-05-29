# 訪員註冊後登入、補資料與唯一編碼開發補充規劃

日期：2026-05-21
狀態：待確認後實作
範圍：訪員註冊、承辦審核、登入啟用、前台自補資料、後台補資料、唯一編碼、QR Code 追蹤

## 1. 這次補充要解決的問題

目前系統已經有訪員註冊與後台審核雛形，但整體流程還沒有完全閉合。主要缺口如下：

1. 訪員送出註冊後，可以進入後台待審，但審核通過後尚未自動建立正式登入帳號。
2. 管理者可以在後台補訪員資料，但訪員本人尚未有前台「我的資料」頁可自行補資料。
3. 資料庫有 UUID 類型的唯一 ID，但尚未有適合管理、搜尋、列印、QR Code 使用的人可讀訪員編碼。
4. 通過審核後，還缺少「已邀請登入、已設定密碼、資料已補齊、可派案」這些狀態。
5. 志工名單未來會到 200 人以上，需要更清楚的批次管理、篩選、匯出與追蹤流程。

本文件先把下一階段要補的開發項目整理清楚，確認後再實作。

## 2. 目前系統已做到的部分

### 2.1 訪員註冊

目前前台已有訪員註冊表單，可填寫：

- 姓名
- Email
- 身分證字號
- 手機
- 單位
- 部門
- 職稱
- 志工 / 民政 / 社政類型
- 受訓日期
- 訪員證號
- 備註
- 自拍證件照

送出後會寫入 `workspace_registration_requests`。

### 2.2 後台審核

目前管理者可在使用者管理中查看註冊申請，並做核准或退回。

核准後目前會建立或更新：

- `accounts`
- `workspace_memberships`
- `visitor_profiles`
- `workspace_registration_requests`

因此後台可以知道此人是已通過的訪員，也能進入派案與資格管理邏輯。

### 2.3 後台補資料

目前後台已有訪員資格管理方向，管理者可以整理訪員資格、受訓、證號、匯款等資料。

但這仍偏向管理者集中維護，不是訪員本人登入後自行補資料。

### 2.4 登入

目前登入支援兩種模式：

- 示範帳號登入，例如 `visitor@eldervisit.org`
- Supabase Auth 正式帳號登入

但「新註冊訪員審核通過後，自動建立 Supabase Auth 帳號或寄出設定密碼信」尚未完成。

## 3. 應補上的完整流程

建議正式流程如下：

1. 訪員從前台註冊入口送出資料。
2. 系統產生一筆註冊申請編號。
3. 承辦管理者在後台審核。
4. 審核通過後，系統產生正式訪員編碼。
5. 系統建立或啟用 Supabase Auth 登入帳號。
6. 系統寄出設定密碼邀請信，或由後台產生一次性啟用連結。
7. 訪員設定密碼後登入。
8. 第一次登入若資料未補齊，導向「我的資料」頁。
9. 訪員補齊允許自行維護的資料。
10. 管理者後台覆核資料完整度。
11. 狀態改為可派案。
12. 後續派案、訪視、核銷、匯出都使用同一組訪員編碼追蹤。

## 4. 建議新增狀態

### 4.1 註冊申請狀態

`workspace_registration_requests.status`

- `pending`：待審
- `approved`：已通過
- `rejected`：已退回

### 4.2 登入啟用狀態

建議新增：

- `auth_invite_status`
- `auth_invited_at`
- `auth_activated_at`

狀態建議：

- `not_sent`：尚未發送登入邀請
- `sent`：已發送邀請
- `activated`：已設定密碼並可登入
- `failed`：發送失敗

### 4.3 個人資料完整度狀態

建議新增：

- `profile_completion_status`
- `profile_completed_at`
- `profile_reviewed_at`

狀態建議：

- `incomplete`：資料未補齊
- `submitted`：訪員已補完，待管理者確認
- `verified`：管理者已確認
- `returned`：退回補件

### 4.4 派案可用狀態

建議將「可否派案」獨立判斷：

- 帳號已啟用
- 訪員編碼已建立
- 資料完整度已確認
- 受訓資料符合要求
- 匯款資料符合核銷要求
- 狀態為可派案

## 5. 訪員唯一編碼規則

目前資料庫有 UUID，但不適合給管理者、志工、QR Code 與匯出報表使用。

建議新增 `visitor_code`，作為人可讀的正式訪員編碼。

### 5.1 編碼格式

建議格式：

```text
EV-115-YH-CIV-0001
```

欄位意義：

- `EV`：Elder Visit
- `115`：年度
- `YH`：永和區
- `CIV`：民政
- `0001`：流水號

社政訪員範例：

```text
EV-115-YH-SOC-0001
```

一般志工範例：

```text
EV-115-YH-VOL-0001
```

### 5.2 編碼產生時機

建議在「審核通過」時產生正式 `visitor_code`。

原因：

- 未通過者不應占用正式訪員編號。
- 正式編號可代表此人已成為本工作空間可管理的訪員。
- 後續 QR Code、識別證、派案、核銷都可使用同一組編號。

### 5.3 QR Code 使用方式

QR Code 建議不要直接放身分證字號或手機。

建議 QR Code 內容使用：

```text
eldervisit://visitor/EV-115-YH-CIV-0001
```

或使用正式網址：

```text
https://elder-visit-platform.vercel.app/verify/visitor/EV-115-YH-CIV-0001
```

未來可用於：

- 志工識別證
- 管理者快速查資料
- 訪視任務身份確認
- 匯出名冊核對
- LINE 綁定身份

## 6. 志工前台「我的資料」頁

建議新增：

```text
/visitor/profile
```

用途是讓已通過審核的訪員登入後自行補資料。

### 6.1 志工可自行修改欄位

建議開放：

- 手機
- 聯絡 Email
- 大頭照 / 證件照
- 緊急聯絡人
- 緊急聯絡電話
- 匯款帳號末五碼
- 可服務里別
- 可服務時段
- 備註
- 受訓證明上傳

### 6.2 志工不可自行修改欄位

以下欄位應由管理者維護或覆核：

- 角色
- 工作空間
- 單位核定狀態
- 審核狀態
- 訪員正式編碼
- 受訓是否有效
- 可否派案
- 社會局覆核狀態
- 匯款是否可核銷

### 6.3 首次登入導引

若志工第一次登入且資料未完整，系統應顯示：

```text
請先完成訪員基本資料，完成後承辦管理者才可正式派案。
```

並導向：

```text
/visitor/profile
```

## 7. 後台使用者管理應調整

使用者管理建議拆成較清楚的分頁：

1. 儀表板
   - 待審註冊
   - 已通過未邀請
   - 已邀請未啟用
   - 資料待補
   - 可派案訪員

2. 註冊審核
   - 查看申請資料
   - 核准
   - 退回
   - 要求補件

3. 登入邀請
   - 發送設定密碼信
   - 重寄邀請
   - 查看邀請狀態

4. 訪員名冊
   - 查詢
   - 篩選單位、職稱、里別、民政 / 社政 / 志工
   - 匯出 CSV
   - 匯出照片索引
   - 匯出完整 JSON

5. 資料補完
   - 管理者補資料
   - 檢查志工自補資料
   - 退回補件
   - 標記已確認

6. 識別與 QR Code
   - 產生訪員編碼
   - 產生 QR Code
   - 匯出識別證資料

## 8. 建議資料表更新

### 8.1 `workspace_registration_requests`

建議新增：

- `registration_code`
- `auth_invite_status`
- `auth_invited_at`
- `auth_activated_at`
- `profile_completion_status`
- `profile_submitted_at`
- `profile_reviewed_at`
- `profile_return_reason`

### 8.2 `visitor_profiles`

建議新增：

- `visitor_code`
- `profile_completion_status`
- `profile_completed_at`
- `profile_reviewed_at`
- `emergency_contact_name`
- `emergency_contact_phone`
- `service_availability`
- `qr_code_payload`
- `qr_code_generated_at`
- `is_assignable`

### 8.3 `accounts`

建議確認或新增：

- `auth_user_id`
- `email`
- `full_name`
- `status`
- `last_login_at`

`auth_user_id` 需要對應 Supabase Auth 的使用者 ID，這樣才不會只在 public table 有帳號，卻無法登入。

## 9. 建議 API 更新

### 9.1 後台審核與邀請

新增或擴充：

```text
POST /api/users/review-registration
POST /api/users/invite-approved-visitor
POST /api/users/resend-visitor-invite
```

用途：

- 審核通過
- 建立正式訪員編碼
- 建立 Supabase Auth 使用者
- 發送設定密碼邀請
- 記錄邀請狀態

### 9.2 志工前台補資料

新增：

```text
GET /api/visitor/profile
PATCH /api/visitor/profile
```

用途：

- 志工讀取自己的資料
- 志工更新允許自行維護的欄位
- 不允許更新角色、審核狀態、可派案狀態等治理欄位

### 9.3 QR Code

新增：

```text
POST /api/users/visitor-qrcode
```

用途：

- 依 `visitor_code` 產生 QR Code payload
- 未來可擴充成 PNG / SVG 匯出

## 10. 權限規則

### 10.1 管理者

可以：

- 審核註冊
- 發送登入邀請
- 修改訪員核心資料
- 補資料
- 標記可派案
- 匯出名冊與照片索引
- 產生 QR Code

### 10.2 督導

可以：

- 查看訪員名冊
- 查看資格狀態
- 查看可派案狀態
- 協助確認資料完整性

不建議直接修改：

- 登入邀請
- 角色
- 正式訪員編碼

### 10.3 訪員

可以：

- 查看自己的資料
- 補自己的允許欄位
- 上傳或更新大頭照
- 查看自己的任務與草稿

不可：

- 改角色
- 改審核狀態
- 改訪員編碼
- 改可派案狀態
- 看其他訪員資料

## 11. 分階段開發建議

### 第一階段：補資料與登入流程規格落地

目標：

- 建立資料表 migration
- 新增訪員編碼欄位
- 新增登入邀請欄位
- 新增資料完整度欄位

驗收：

- 資料庫可保存註冊、審核、邀請、補資料、編碼狀態。

### 第二階段：審核通過後建立登入邀請

目標：

- 後台核准後產生 `visitor_code`
- 建立 Supabase Auth 帳號或邀請
- 更新邀請狀態

驗收：

- 新訪員通過審核後，可收到或取得登入啟用方式。

### 第三階段：志工前台我的資料

目標：

- 新增 `/visitor/profile`
- 新增自補資料 API
- 首次登入導向補資料

驗收：

- 志工可登入後補自己的資料。
- 不可修改治理欄位。

### 第四階段：後台使用者管理重整

目標：

- 使用者管理改成儀表板加分頁
- 加入已通過未邀請、已邀請未啟用、待補資料、可派案訪員
- 補上管理者補資料與退回補件

驗收：

- 管理者可清楚管理 200 位以上志工。

### 第五階段：QR Code 與匯出

目標：

- 依 `visitor_code` 產生 QR Code payload
- 匯出名冊時包含 `visitor_code`
- 匯出照片索引與 QR Code 欄位

驗收：

- 每位訪員都有可追蹤的唯一編碼與 QR Code 資料。

## 12. 目前仍不夠完整的地方

1. Supabase Auth 邀請信流程尚未實作。
2. 新註冊志工尚不能自動取得正式登入帳號。
3. 志工本人尚不能登入後自行補資料。
4. 訪員正式編碼尚未自動產生。
5. QR Code 還沒有資料結構與產生流程。
6. 後台使用者管理仍需要再分頁化，否則 200 人以上會難以管理。
7. 補資料後的「管理者確認」流程還不完整。
8. 可派案狀態應由資料完整度、受訓、匯款、審核狀態共同判斷，目前還不夠嚴謹。
9. 大頭照目前已有裁切與白底處理，但真正 AI 去背尚未串接外部服務。
10. 正式上線前，需要確認 Vercel 環境變數、Supabase RLS、Service Role 使用範圍與安全性。

## 13. 建議確認事項

開發前建議先確認以下決策：

1. 訪員編碼是否採用 `EV-年度-區域-類型-流水號`。
2. 類型是否使用 `VOL`、`CIV`、`SOC`。
3. 審核通過後是否一定寄出設定密碼信。
4. 是否允許管理者手動產生一次性初始密碼。
5. 志工可自行補哪些欄位。
6. 匯款資料是否只保存末五碼，避免保存完整帳號造成資安風險。
7. QR Code 掃描後要顯示公開查驗頁，還是只允許登入後台查看。
8. 「可派案」是否需要管理者最後按一次確認。

## 14. 建議下一步

若確認本文件方向，下一步可以開始實作：

1. 建立 migration：登入邀請、補資料狀態、訪員編碼、QR Code 欄位。
2. 調整審核通過邏輯：產生 `visitor_code`，並準備建立 Supabase Auth 邀請。
3. 新增志工前台 `/visitor/profile`。
4. 重整後台使用者管理為儀表板與分頁。
5. 補上 QR Code 與匯出欄位。

## 15. 第一階段執行紀錄

日期：2026-05-21

已完成：

1. 新增 `supabase/migrations/0027_visitor_identity_profile_completion.sql`。
2. 註冊申請新增申請編號、登入邀請狀態、資料補完狀態、訪員編碼與 QR Code payload 欄位。
3. 訪員資格檔新增正式訪員編碼、資料補完狀態、緊急聯絡人欄位、服務時段、QR Code payload 與可派案狀態。
4. 註冊送出時會準備 `registration_code` 與資料補完狀態。
5. 審核通過建立訪員資格檔時會產生 `visitor_code`，格式接近 `EV-115-YH-CIV-0001`。
6. QR Code payload 先保存為 `https://elder-visit-platform.vercel.app/verify/visitor/{visitor_code}`。

尚未完成，留到後續階段：

1. 寄出 Supabase Auth 設定密碼邀請信。
2. 志工前台 `/visitor/profile` 自行補資料頁。
3. QR Code PNG / SVG 圖檔輸出。
4. 後台使用者管理重新分頁。
5. 可派案狀態的最後覆核按鈕。

## 16. 第二階段執行紀錄

日期：2026-05-21

已完成：

1. 新增 `POST /api/users/invite-approved-visitor`。
2. 後台已通過訪員名冊加入「發送登入邀請」與「重寄登入邀請」操作。
3. 發送邀請時呼叫 Supabase Auth Admin `inviteUserByEmail`。
4. 邀請成功後會更新 `workspace_registration_requests.auth_invite_status` 與 `auth_invited_at`。
5. 若 Supabase Auth 回傳 user id，會同步寫入 `accounts.auth_user_id`。
6. 已通過訪員名冊與 CSV 匯出加入註冊申請編號、訪員正式編碼、登入邀請狀態、資料補完狀態與 QR Code payload。

尚未完成，留到下一階段：

1. 建立邀請信點擊後的設定密碼 / 啟用頁。
2. 志工登入後的 `/visitor/profile` 自補資料頁。
3. 管理者確認資料補完並切換 `is_assignable`。

## 17. 第三階段部分執行紀錄

日期：2026-05-21

已完成：

1. `/login?invited=1` 會顯示訪員帳號啟用區塊。
2. 若 Supabase 邀請信帶回 `access_token` 與 `refresh_token`，登入頁會建立暫時 session。
3. 訪員可在登入頁設定新密碼。
4. 密碼設定完成後會登出暫時 session，提示使用 Email 與新密碼登入。
5. 正式 Supabase Auth 登入成功後，系統會同步 `auth_invite_status = activated` 與 `auth_activated_at`。

尚未完成：

1. 志工登入後自動導向 `/visitor/profile`。
2. `/visitor/profile` 自補資料頁與 API。
3. 管理者覆核資料補完並標記可派案。

## 18. 第四階段部分執行紀錄

日期：2026-05-21

已完成：

1. 新增 `GET /api/visitor/profile` 與 `PATCH /api/visitor/profile`。
2. 新增 `/visitor/profile` 我的資料頁。
3. 訪員可自行補：聯絡 Email、手機、緊急聯絡人、緊急聯絡電話、匯款銀行、銀行代碼、分行、戶名、帳號末五碼、存摺封面或匯款資料附件、可服務時段、可服務里別。
4. 自補資料送出後會把 `profile_completion_status` 更新為 `submitted`，等待管理者確認。
5. 訪員工作流程導覽新增「資料」步驟。
6. 正式 Supabase 訪員登入後預設導向 `/visitor/profile`。
7. 新增 `POST /api/users/verify-visitor-profile`。
8. 後台已通過訪員名冊可將補完資料與匯款資料確認為「可派案」。
9. 新增 `supabase/migrations/0028_visitor_remittance_documents.sql`，保存銀行與存摺附件欄位。

尚未完成：

1. 訪員自行重新上傳證件照與補件流程。
2. 退回補件原因與通知。
3. QR Code 圖檔輸出與識別證版型。
4. 存摺附件目前先保存為資料欄位；正式大量使用時應改接 Supabase Storage 並加上檔案權限控管。

## 19. 第五階段流程收斂紀錄

日期：2026-05-24

已完成：

1. 後台訪員名冊以「待邀請、待啟用、待補資料、可派案」呈現核准後的後續階段，手機版同樣可切換。
2. 已寄送邀請者重寄前需確認，後台顯示最近寄送時間與累計寄送次數；已完成帳號啟用者不再允許重寄登入邀請。
3. 管理者確認可派案的 API 會檢查帳號啟用、教育訓練、手機、證件照、銀行資料與存摺附件，不再只依前端按鈕狀態通過。
4. 新增 `supabase/migrations/0030_visitor_remittance_storage_qr_site.sql`，存摺封面可改存私有 Storage，既有 inline 資料仍保持相容。
5. 新產生的 QR Code 以 `NEXT_PUBLIC_APP_URL` 為基底，預設正式網址為 `https://elder-visit-platform.vercel.app`；`0030` 亦會修正舊 Netlify payload。
6. 後台可將勾選訪員的存摺附件獨立匯出為 ZIP，檔名依訪員正式編碼，並附匯款附件索引與敏感資料使用提示。

仍屬後續：

1. 訪員重新提交證件照的正式補件操作。
2. 退回補件原因、通知與稽核紀錄的完整閉環。
3. QR Code 圖檔輸出與識別證版型。
