# Lessons

## 繁體中文說明

這份文件用來保存「下次不要再重複踩坑」的專案經驗。  
只有當一個發現具備重複價值、會影響未來判斷時，才應該記錄在這裡；不要把一次性的小插曲全部塞進來。

## Lesson: Missed-visit evidence is conditional

- **Trigger:** The visit workflow was interpreted as requiring photo evidence for every visit.
- **Cause:** The wording did not clearly distinguish ordinary visits from missed visits.
- **Rule:** Require `未遇佐證照片` and `未遇定位` only when `visitResult === "未遇"`.
- **Evidence:** `lib/domain/visits.ts` and `components/visitor/visit-dialogue-form.tsx`.
- **Added on:** 2026-05-17

## Lesson: Build success is not deployment confirmation

- **Trigger:** A completed local build could be mistaken for a published site.
- **Cause:** Local verification, git state, and Netlify deployment are separate stages.
- **Rule:** Report local edits, local checks, git push state, and live deployment state separately.
- **Evidence:** `DEPLOYMENT.md` and the Netlify publish workflow.
- **Added on:** 2026-05-17

## Lesson: Prefer the reliable verification path in this workspace

- **Trigger:** Local dev mode can become unstable in the synced workspace.
- **Cause:** File watching may hit `EMFILE` limits.
- **Rule:** Use `npm run typecheck`, `npm run lint`, and `npm run build` as the primary verification gate; use build/start when dev-server watching is unreliable.
- **Evidence:** Repeated project verification history in this checkout.
- **Added on:** 2026-05-17

## Lesson: Visitor registration must mirror official rosters

- **Trigger:** New visitor registration had to support the New Taipei visitor roster and later Social Affairs Bureau review.
- **Cause:** If registration fields differ from the official roster, export, review, and assignment eligibility need manual cleanup later.
- **Rule:** Keep visitor registration fields aligned with the official roster first, then add product-only fields such as display name, headshot preview, and workflow status around that core.
- **Evidence:** `components/workspace/users-panel.tsx`, `lib/domain/types.ts`, and `supabase/migrations/0026_visitor_registration_review.sql`.
- **Added on:** 2026-05-20

## Lesson: Visitor approval is not the same as login readiness

- **Trigger:** Approved visitors appeared in management data but did not have a clear way to log in or complete their own profile.
- **Cause:** Workspace approval, Supabase Auth invitation, profile completion, and assignment eligibility are separate states.
- **Rule:** Track `auth_invite_status`, `profile_completion_status`, `visitor_code`, and `is_assignable` separately so administrators can see where each visitor is blocked.
- **Evidence:** `docs/visitor-login-profile-completion-plan.md` and `supabase/migrations/0027_visitor_identity_profile_completion.sql`.
- **Added on:** 2026-05-21

## Lesson: Large visitor rosters need scoped batch actions

- **Trigger:** A workflow expected to handle 200+ volunteers could not rely on a single long approved-user list.
- **Cause:** Without state tabs and explicit batch scope, administrators must manually infer which users need invitations, profile checks, remittance review, or export.
- **Rule:** Large operational rosters should expose state-based tabs, visible selection counts, and clear rules for whether batch actions apply to selected rows or the current filtered view.
- **Evidence:** `components/workspace/users-panel.tsx` and `docs/tasks/2026-05-21-bulk-visitor-management.md`.
- **Added on:** 2026-05-21

## Lesson: Cloudflare Workers needs committed deployment config

- **Trigger:** Cloudflare Workers Builds generated a bad `WORKER_SELF_REFERENCE` service binding during deployment.
- **Cause:** The repository did not include stable Wrangler/OpenNext configuration, so Cloudflare inferred the Worker name from project/package metadata.
- **Rule:** Keep `wrangler.jsonc` and `open-next.config.ts` committed, and make the self-reference service match the actual Worker name before relying on auto deployments.
- **Evidence:** `wrangler.jsonc`, `open-next.config.ts`, and `docs/tasks/2026-05-22-cloudflare-deployment-config.md`.
- **Added on:** 2026-05-22

## Lesson: Approval actions must be idempotent and visibly terminal

- **Trigger:** A manager tapped visitor approval again because the mobile card did not clearly show that processing had completed.
- **Cause:** A final-state action remained visually actionable while the completion message was separated from the card.
- **Rule:** Approval workflows must treat completed decisions as terminal on the server and immediately remove or relabel completed actions in the interface.
- **Evidence:** `lib/domain/user-management.ts` and `components/workspace/users-panel.tsx`.
- **Added on:** 2026-05-24
