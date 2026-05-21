# PWA Home-Screen Review

## 繁體中文說明

這份檢查表用來確認「加入手機桌面後」的產品體驗。  
它看的不是只有網站頁面，而是使用者在手機桌面看到的圖示、安裝後的辨識度，以及啟動時是否仍像同一個產品。

## Purpose

Use this checklist when changing the elder-visit platform's installability, manifest metadata, or mobile home-screen presentation.

## Current Baseline

The project currently includes:

- `public/manifest.webmanifest`
- `public/icons/app-icon-192.png`
- `public/icons/app-icon-512.png`
- `public/icons/apple-touch-icon.png`
- `public/icons/favicon-16.png`
- `public/icons/favicon-32.png`
- `app/icon.png`
- `app/apple-icon.png`

Current manifest settings:

- `display: "standalone"`
- `theme_color: "#4FA878"`
- `background_color: "#F6FAF7"`
- `start_url: "/dashboard"`

## Review Checklist

### 1. Icon Family

- [ ] The icon remains recognizable at small sizes.
- [ ] The icon style matches the calm care-oriented product language.
- [ ] Favicon, Apple touch icon, and app icon feel like one family.
- [ ] The icon does not rely on tiny text or fragile details.

### 2. Manifest Completeness

- [ ] `name`, `short_name`, `start_url`, `display`, `theme_color`, and `background_color` are correct.
- [ ] Manifest icon paths resolve correctly.
- [ ] Declared sizes match actual files.
- [ ] Add `purpose: "maskable"` variants if Android adaptive cropping becomes a target requirement.

### 3. Platform-Specific Behavior

- [ ] Android home-screen install behavior was checked when relevant.
- [ ] iOS add-to-home-screen behavior was checked separately when relevant.
- [ ] A changed icon was tested after reinstalling / refreshing the shortcut if cached assets were suspected.

### 4. Launch Experience

- [ ] Theme and background colors feel coherent with the app shell.
- [ ] Launching from the home screen still feels like the same product.
- [ ] The icon is distinct enough for field users to recognize quickly among other apps.

## Current Improvement Opportunities

- Add maskable icon variants if Android launcher polish becomes important.
- Keep the existing green-led palette unless there is a deliberate brand redesign.
- When revising the logo, verify the small-size icon separately instead of assuming the full lockup scales down well.

## Related References

- `docs/pwa-offline-checklist.md`
- `public/manifest.webmanifest`
- `DESIGN-SYSTEM.md`
- `AGENTS.md`
