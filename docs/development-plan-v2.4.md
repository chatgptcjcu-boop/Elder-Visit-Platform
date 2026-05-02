# Development Plan v2.4

Source of truth:

- `docs/spec-v2.4.pdf`
- `docs/spec-v2.4-extracted.md`

## Product Focus

The first market is the elder visit solution. Temple governance, volunteer governance, ESG sponsorship, courses, and certificates remain future expansion paths under the same parameterized governance platform.

## Phase Order

1. Phase 0: Project skeleton
2. Phase 1: Account, Unit, Workspace governance schema
3. Phase 2: Blueprint and onboarding
4. Phase 3: Login, workspace selector, dynamic menu
5. Phase 4 onward: Parameter engines and elder visit domain workflows

## Phase 0 Acceptance

- Next.js App Router skeleton exists.
- TypeScript and Tailwind are configured.
- Supabase client helpers exist.
- `.env.example` exists.
- Mobile-first layout exists.
- Conversational UI primitives exist.
- Bottom navigation exists.
- Dashboard shell exists.
- Workspace selector exists.
- Onboarding wizard exists.
- No LINE trademarks, logos, icons, or full visual identity are used.

## Current Constraints

- Dependencies are declared but not installed in this workspace because `npm` is not currently available in the shell path.
- Supabase project URL and anon key are placeholders until a Supabase project is created.
