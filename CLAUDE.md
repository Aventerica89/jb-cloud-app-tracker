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

- [ ] Phase 1: Foundation (auth, layout)
- [ ] Phase 2: Core Data (providers, tags, applications)
- [ ] Phase 3: Deployments
- [ ] Phase 4: Dashboard
- [ ] Phase 5: Polish (search, dark mode)
- [ ] Phase 6: Launch (testing, deploy)

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
