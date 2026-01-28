# jb-cloud-app-tracker

A personal web application to track and manage cloud applications across multiple providers.

## Project Overview

**Description**: Track and manage cloud applications, inventory cloud resources, and monitor app deployments across multiple providers (Vercel, Cloudflare, Railway, AWS, etc.)

**Problem Solved**:
- Hard to track what's deployed where across multiple providers
- Need visibility into cloud apps with no central place to see all applications
- Managing app lifecycle from development to production

**Users**: Personal use

**Docs Sync**: Yes (docs.jbcloud.app)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| UI | Tailwind CSS + v0 components |
| Icons | Lucide React |
| Validation | Zod |
| Testing | Vitest + Playwright |

---

## Key Architecture Decisions

1. **Server Actions** for all mutations (type-safe, less boilerplate)
2. **React Server Components** for data fetching (streaming, caching)
3. **Row-Level Security** on all tables (data isolation)
4. **User-owned providers** with seeded defaults on signup
5. **Shared environments** table (dev, staging, production)

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup
│   ├── (dashboard)/      # Protected routes
│   │   ├── dashboard/    # Overview stats
│   │   ├── applications/ # App management
│   │   ├── deployments/  # Deployment tracking
│   │   ├── providers/    # Provider config
│   │   ├── settings/     # User settings (API tokens)
│   │   └── tags/         # Tag management
├── components/
│   ├── ui/               # v0/shadcn components
│   ├── forms/            # Form components
│   └── [feature]/        # Feature components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── actions/          # Server actions
│   ├── schemas/          # Zod validation
│   └── utils/            # Utilities
├── hooks/                # Custom React hooks
└── types/                # TypeScript types
```

---

## Database Schema

### Core Tables

- **applications** - Cloud apps with name, description, status, tech_stack
- **cloud_providers** - User-owned providers (Vercel, Cloudflare, etc.)
- **deployments** - Links apps to providers and environments
- **environments** - Shared table (dev, staging, production)
- **tags** - User-owned labels for organizing apps
- **application_tags** - Junction table for many-to-many
- **user_settings** - API tokens for provider integrations

### Key Relationships

```
applications --< deployments >-- cloud_providers
applications >--< tags (via application_tags)
deployments >-- environments
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build
```

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Implementation Status

See `docs/PLAN.md` for detailed implementation plan.

### Phases

- [x] Phase 1: Foundation (auth, layout)
- [x] Phase 2: Core Data (providers, tags, applications)
- [x] Phase 3: Deployments
- [x] Phase 4: Dashboard
- [x] Phase 5: Polish (search, dark mode)
- [x] Phase 6: Launch (testing, deploy)
- [x] Phase 7: Vercel Integration (API sync)
- [x] Phase 8: Cloudflare Integration (API sync)
- [x] Phase 9: Auto-sync deployments on page view

---

## Documentation

- `docs/ARCHITECTURE.md` - System architecture and design decisions
- `docs/PLAN.md` - Implementation plan with tasks and dependencies

---

## Style Guide

| Element | Value |
|---------|-------|
| Primary Color | Blue (#3b82f6) |
| Neutrals | Slate scale |
| Font (Sans) | Inter |
| Font (Mono) | JetBrains Mono |
| Border Radius | 8px default |
| Dark Mode | System preference + toggle |

---

## Coding Standards

- TypeScript strict mode
- Zod validation for all inputs
- Server Actions for mutations
- Immutable patterns (never mutate)
- Small files (200-400 lines typical)
- 80%+ test coverage target

---

## Deployment

### Vercel Deployment

1. Push to GitHub repository
2. Import project in Vercel dashboard
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)
4. Deploy

### Supabase Configuration

1. Update Supabase Auth settings with production URL:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/callback`

---

## Provider Integrations

### Vercel Integration

Sync deployments automatically from Vercel:

1. Go to **Settings** and add your Vercel API token
   - Get token from: https://vercel.com/account/tokens
2. Edit an application and select a **Vercel Project** from dropdown
3. Click **Sync Vercel** on app detail page to import deployments

**Status Mapping:**
| Vercel State | Local Status |
|--------------|--------------|
| READY | deployed |
| ERROR | failed |
| BUILDING | building |
| QUEUED | pending |
| CANCELED | rolled_back |

**Files:**
- `src/lib/actions/vercel.ts` - Vercel API client
- `src/lib/actions/sync.ts` - Deployment sync logic
- `src/lib/actions/settings.ts` - Token storage
- `src/components/settings/vercel-token-form.tsx` - Token UI

### Cloudflare Integration

Sync deployments automatically from Cloudflare Pages:

1. Go to **Settings** and add your Cloudflare API token and Account ID
   - Get token from: https://dash.cloudflare.com/profile/api-tokens
   - Token needs "Cloudflare Pages:Read" permission
   - Find Account ID in your Cloudflare dashboard URL or Workers & Pages overview
2. Edit an application and select a **Cloudflare Pages Project** from dropdown
3. Click **Sync Cloudflare** on app detail page to import deployments

**Status Mapping:**
| Cloudflare Stage | Local Status |
|------------------|--------------|
| deploy + success | deployed |
| failure | failed |
| canceled | rolled_back |
| active | building |
| other | pending |

**Files:**
- `src/lib/actions/cloudflare.ts` - Cloudflare API client
- `src/lib/actions/sync.ts` - Deployment sync logic (shared with Vercel)
- `src/lib/actions/settings.ts` - Token storage
- `src/components/settings/cloudflare-token-form.tsx` - Token UI
- `src/components/applications/cloudflare-project-select.tsx` - Project selector

### Auto-Sync

Deployments are automatically synced when viewing an application detail page:

- Triggers 500ms after page load (non-blocking)
- Syncs both Vercel and Cloudflare in parallel if configured
- Refreshes the page data after sync completes
- Manual sync buttons still available for on-demand refresh

**Files:**
- `src/components/applications/auto-sync.tsx` - Auto-sync client component
