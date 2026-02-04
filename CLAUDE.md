# jb-cloud-app-tracker

Next.js 15 app to track cloud applications across multiple providers (Vercel, Cloudflare, Railway, etc.).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm test             # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run build        # Production build
```

## Architecture

```
src/
├── app/
│   ├── (auth)/           # Login, signup (public)
│   └── (dashboard)/      # Protected routes
│       ├── dashboard/    # Overview stats
│       ├── applications/ # App CRUD
│       ├── deployments/  # Deployment tracking
│       ├── providers/    # Provider config
│       ├── settings/     # API tokens
│       └── tags/         # Tag management
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── [feature]/        # Feature-specific
├── lib/
│   ├── supabase/         # Client + server clients
│   ├── actions/          # Server Actions
│   ├── schemas/          # Zod validation
│   └── utils/            # Utilities
├── hooks/                # Custom React hooks
└── types/                # TypeScript types
```

## Database Schema

```
applications --< deployments >-- cloud_providers
applications >--< tags (via application_tags)
deployments >-- environments
```

### Core Tables
- `applications` - name, description, status, tech_stack
- `cloud_providers` - user-owned (Vercel, Cloudflare, etc.)
- `deployments` - links apps to providers + environments
- `environments` - shared (dev, staging, production)
- `tags` - user-owned labels
- `user_settings` - API tokens for integrations

## Key Patterns

- **Server Actions** for all mutations (type-safe, in `lib/actions/`)
- **React Server Components** for data fetching
- **Row-Level Security** on all Supabase tables
- **Zod schemas** for all form validation (`lib/schemas/`)
- User-owned providers seeded on signup

## Provider Integrations

### Vercel
- Token stored in `user_settings`
- Sync via `lib/actions/vercel.ts` + `lib/actions/sync.ts`
- Status mapping: READY→deployed, ERROR→failed, BUILDING→building

### Cloudflare
- Token + Account ID in `user_settings`
- Sync via `lib/actions/cloudflare.ts`
- Needs "Cloudflare Pages:Read" permission

### Auto-Sync
- Triggers 500ms after app detail page load
- Syncs Vercel + Cloudflare in parallel
- Component: `components/applications/auto-sync.tsx`

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Gotchas

- RLS policies require `auth.uid()` - all queries must have authenticated user
- Server Actions must use `createServerClient` not `createBrowserClient`
- Vercel API returns `state`, Cloudflare returns `stage` - different field names
- Provider tokens stored encrypted in `user_settings.settings` JSONB column
- Auto-sync uses `router.refresh()` after completion - don't call setState after
- Supabase Auth redirect URLs must be configured in dashboard for production

## Testing

```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e

# Type check before commit
npm run typecheck
```

## Deployment

1. Push to GitHub
2. Import in Vercel dashboard
3. Add env vars (SUPABASE_* + APP_URL)
4. Update Supabase Auth redirect URLs to production domain
