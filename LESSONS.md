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

## Lesson: Sensitive photos need private file storage and controlled exports

- **Trigger:** Approved visitor rosters need to export headshots for 200 or more volunteers.
- **Cause:** Embedding image data in CSV or JSON makes exports oversized and obscures who can copy the actual photo files.
- **Rule:** Store headshots in a private attachment bucket, expose previews through short-lived authorized URLs, and export photos as permission-checked ZIP files named by the permanent visitor code.
- **Evidence:** `lib/domain/visitor-headshots.ts`, `app/api/users/export-headshots/route.ts`, and `supabase/migrations/0029_visitor_headshot_storage.sql`.
- **Added on:** 2026-05-24

## Lesson: Assignment eligibility must be server-enforced

- **Trigger:** Approved visitors still pass through invitation, activation, profile completion and remittance review before assignment.
- **Cause:** A visible management button alone cannot prevent early assignment confirmation or stale client state.
- **Rule:** Treat approval, account activation, required document completion and assignment eligibility as separate statuses, and enforce all eligibility checks in the server action that marks a visitor assignable.
- **Evidence:** `app/api/users/verify-visitor-profile/route.ts`, `components/workspace/users-panel.tsx`, and `supabase/migrations/0030_visitor_remittance_storage_qr_site.sql`.
- **Added on:** 2026-05-24

## Lesson: Payment documents must be exported separately from identity photos

- **Trigger:** Managers need to retrieve volunteer passbook images for remittance review after profile completion.
- **Cause:** Combining payment documents with headshots expands unnecessary access to sensitive banking evidence.
- **Rule:** Store passbook images in a private bucket and export them through an explicit, permission-checked ZIP action with a sensitive-data warning and visitor-code filenames, separately from headshot exports.
- **Evidence:** `lib/domain/visitor-documents.ts`, `app/api/users/export-passbooks/route.ts`, and `components/workspace/users-panel.tsx`.
- **Added on:** 2026-05-25

## Lesson: Public collection entry must not expose demo credentials

- **Trigger:** The production site is opened for volunteer registration intake before account invitation email is enabled.
- **Cause:** A login-first page that lists test users and passwords exposes internal testing access and obscures the public submission workflow.
- **Rule:** Route the public home entry to registration, keep login fields empty, and store any demo credential reference only in a locally ignored file.
- **Evidence:** `app/page.tsx`, `components/auth/login-panel.tsx`, `components/auth/register-panel.tsx`, and `.gitignore`.
- **Added on:** 2026-05-25

## Lesson: Batch review must reuse single-record governance logic

- **Trigger:** Managers need to approve dozens of visitor registrations in one action.
- **Cause:** A direct batch update would skip account creation, workspace membership, visitor profile, visitor code, and QR code side effects that the single approval path already owns.
- **Rule:** Batch review should iterate through the same domain function used by single-record review and only add aggregation, confirmation, and result reporting around it.
- **Evidence:** `lib/domain/user-management.ts`, `app/api/users/batch-review/route.ts`, and `components/workspace/users-panel.tsx`.
- **Added on:** 2026-05-28

## Lesson: Approved rosters need reconciliation after schema changes

- **Trigger:** Approved visitor counts did not match membership/profile counts after registration workflow changes.
- **Cause:** Older records could be approved without all later side-effect tables being populated, while the UI read only the newest registration rows.
- **Rule:** When approval side effects add new destination tables, include an idempotent backfill migration and avoid hard-coded list limits that hide older operational records.
- **Evidence:** `supabase/migrations/0031_backfill_approved_visitor_records.sql` and `lib/domain/user-management.ts`.
- **Added on:** 2026-05-28
