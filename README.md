# Elder Visit Platform

獨居長者訪查管理平台 v2.4

This project follows the stored system specification in `docs/spec-v2.4.pdf` and `docs/spec-v2.4-extracted.md`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible components
- Supabase
- PostgreSQL
- PWA-ready structure

## Development

Install dependencies after Node.js and npm are available:

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` before connecting Supabase.

## Deployment

See `DEPLOYMENT.md` for the Vercel + Supabase publishing checklist.
