# 發佈上線檢查表

## 目前狀態

本專案已可執行正式建置，並已具備 Supabase 連線設定、SQL migration、登入 API 與示範帳號 fallback。

## 上線平台

建議使用：

- GitHub：保存程式碼
- Vercel：發佈 Next.js 網站
- Supabase：資料庫、Auth、Storage

## Vercel 必填環境變數

到 Vercel Project Settings -> Environment Variables 新增：

```env
NEXT_PUBLIC_SUPABASE_URL=https://ojypmuzlqdmnpdyeaszc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase publishable / anon key
NEXT_PUBLIC_APP_URL=https://elder-visit-platform.vercel.app
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service role key
```

注意：

- 不要把 `service_role key` 放進 `NEXT_PUBLIC_*`。
- `SUPABASE_SERVICE_ROLE_KEY` 是後端管理任務使用的非公開環境變數，不能外流到瀏覽器。
- Vercel 環境變數異動後需要重新部署，新的部署才會讀到新值。

## Supabase 已完成項目

- 已建立 `supabase/migrations/0001` 到 `0024`
- 已建立 `supabase/seed.sql`
- 已產生可貼到 SQL Editor 的 `supabase/apply_all.sql`
- SQL 已由使用者回報執行成功

## 發佈流程

1. 將專案推到 GitHub。
2. 到 Vercel 選擇 Import Git Repository。
3. Framework 選 Next.js。
4. Build command 使用 `npm run build`。
5. 新增上方 Supabase 環境變數。
6. Deploy。
7. Vercel 產生網址後，到 Supabase Auth 設定：
   - Site URL：`https://elder-visit-platform.vercel.app`
   - Redirect URLs：加入 `https://elder-visit-platform.vercel.app/login` 與需要的邀請/驗證回跳網址

## 上線後測試

1. 開啟 `https://elder-visit-platform.vercel.app`。
2. 登入 `manager@eldervisit.org / manager123` 確認示範 fallback 可用。
3. 建立正式 Supabase Auth 使用者後，再用正式帳號測試登入。
4. 檢查以下頁面：
   - `/dashboard`
   - `/manager/cases`
   - `/manager/assignments`
   - `/manager/forms`
   - `/manager/exports`
   - `/workspace/users`
   - `/workspace/settings`
   - `/system/status`

## 尚需正式化

- 將 mock fallback 逐步替換為 Supabase 真資料。
- 建立正式 Supabase Auth 使用者與 workspace membership。
- 將上傳 LOGO、訪查照片改接 Supabase Storage。
- 建立 production RLS 測試案例。
