# User Registration and Workspace Membership Workflow

## 核心觀念

使用者不是單獨存在於系統內，而是必須經過：

1. Account: 個人帳號
2. Unit: 所屬單位
3. Workspace: 參與的專案工作空間
4. Role: 在該 Workspace 的角色
5. Capabilities: 該角色可執行的功能

因此，同一個使用者未來可以在不同 Workspace 擁有不同角色。

## 啟動流程

1. 使用者註冊帳號
   - 輸入姓名、Email、密碼
   - 完成 Email 驗證

2. 使用者選擇單位
   - 選擇既有 Unit
   - 或提出建立新 Unit 申請

3. 使用者申請加入 Workspace
   - 選擇要加入的 Workspace
   - 填寫申請原因
   - 可提出期望角色，例如訪員、督導、檢視者

4. Workspace 管理者審核
   - 核准：建立 workspace_membership
   - 退回：保留註冊帳號，但不授權進入 Workspace
   - 指派角色：決定該使用者在 Workspace 內的權限

5. 使用者登入系統
   - 系統讀取 session
   - 查詢 workspace_membership
   - 展開 role capabilities
   - 依權限顯示不同選單、頁面與操作按鈕

## 畫面差異

- 訪員登入：看到任務、草稿、填報畫面
- 督導登入：看到名冊、稽核、通報
- 承辦管理者登入：看到名冊、派案、稽核、核銷、匯出、使用者管理
- 擁有者登入：看到所有功能與權限設定
- 唯讀者登入：只看總覽與名冊

## 目前已實作

- `/login`: 示範帳號登入，依帳號寫入角色 cookie
- `/workspace/users`: 使用者註冊審核與加入 Workspace 流程
- `/api/users`: 註冊審核 API
- `/workspace/permissions`: 角色與權限矩陣
- `AppShell`: 依角色 capabilities 顯示不同導覽
- `/manager/audit`: 依權限控制核准與核銷鎖定

## 正式資料表建議

- `accounts`: 個人帳號
- `units`: 單位
- `workspaces`: 工作空間
- `workspace_registration_requests`: 加入 Workspace 申請
- `workspace_memberships`: 使用者與 Workspace 的角色關聯
- `workspace_roles`: 角色與 capability 設定
- `workspace_permission_logs`: 權限與角色異動紀錄
