# Design System Notes

## 繁體中文說明

這份文件用來維持老人訪視系統的設計一致性。  
未來新增畫面時，先確認是否延續這裡的色彩、圖示、留白、元件與使用情境，再決定是否真的需要創造新模式。

## Product Feel

The elder-visit platform should feel:

- calm
- trustworthy
- warm
- operationally clear
- usable under time pressure on mobile devices

It should avoid flashy enterprise styling, novelty colors, and visual complexity that competes with the work.

## Foundations

- **Primary color:** calm green-led identity from `app/globals.css`
- **Secondary / muted surfaces:** soft low-stress neutrals for structure
- **Accent usage:** warm emphasis only when it improves comprehension
- **Destructive usage:** reserve for real blocking or risk states
- **Icon family:** `lucide-react`
- **Shape language:** rounded cards, light borders, restrained shadows
- **Spacing rhythm:** measured, mobile-first, readable in field workflows

## Reusable Patterns

- **Buttons:** use existing variants before inventing new treatments.
- **Cards:** prefer bordered surfaces with clear grouping and modest emphasis.
- **Forms:** make the next action obvious and reduce avoidable errors through copy and conditional logic.
- **Status messaging:** use semantic color consistently; do not over-color routine states.
- **Empty / loading / error states:** treat them as part of the product, not leftovers.

## Design Review Questions

- Does this still feel like the same product?
- Is the next action obvious without explanation?
- Did we reuse existing colors, icons, and components before creating new ones?
- Would a visitor or supervisor understand this under time pressure on a phone?
- Did the change reduce mistakes, or only make the screen look busier?

## Current Concrete References

- `app/globals.css`
- `components/layout/brand-logo.tsx`
- `components/ui/button.tsx`
- `components/auth/login-panel.tsx`
- `components/audit/audit-queue-card.tsx`
