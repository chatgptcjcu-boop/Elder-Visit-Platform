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
```

注意：

- 不要把 `service_role key` 放進 `NEXT_PUBLIC_*`。
- `service_role key` 只有後端管理任務需要時才可放在非公開環境變數。

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
   - Site URL：填 Vercel 網址
   - Redirect URLs：加入 Vercel 網址與 `/login`

## 上線後測試

1. 開啟 Vercel 網址。
2. 登入 `manager@example.org / manager123` 確認示範 fallback 可用。
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
