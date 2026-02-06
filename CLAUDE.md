# jb-cloud-app-tracker

Next.js 16 app to track cloud applications across multiple providers (Vercel, Cloudflare, Railway, etc.) with integrated Claude Code session tracking and maintenance management.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm test             # Run Vitest unit tests
npm run test:coverage # Run tests with coverage
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run build        # Production build
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Validation**: Zod 4
- **Forms**: React Hook Form + Hookform Resolvers
- **Testing**: Vitest + Testing Library
- **Icons**: Lucide React
- **AI**: Anthropic SDK (for GitHub import descriptions)
- **Integrations**: Vercel SDK, Cloudflare API

## Architecture

```
src/
├── app/
│   ├── (auth)/              # Public auth routes
│   │   ├── login/           # Email + Google OAuth
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── callback/        # OAuth callback handler
│   ├── (dashboard)/         # Protected routes (requires auth)
│   │   ├── dashboard/       # Overview stats
│   │   ├── applications/    # App CRUD + sessions
│   │   ├── deployments/     # Deployment tracking
│   │   ├── providers/       # Provider config
│   │   ├── settings/        # User profile + API tokens
│   │   └── tags/            # Tag management
│   └── api/                 # API routes (external integrations)
│       ├── sessions/        # Claude Code session tracking
│       ├── import-github/   # GitHub repo import
│       └── delete-all-apps/ # Bulk operations
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── applications/        # App cards, filters, forms
│   ├── deployments/         # Deployment cards, forms
│   ├── maintenance/         # Maintenance checklist, history
│   ├── sessions/            # Session list, stats
│   ├── settings/            # Token forms, changelog, profile
│   ├── tags/                # Tag dialogs, actions
│   ├── layout/              # Header, sidebar, mobile nav
│   └── user/                # User avatar
├── lib/
│   ├── supabase/            # Client factories (client, server, middleware)
│   ├── actions/             # Server Actions (all mutations)
│   ├── validations/         # Zod schemas (form validation)
│   ├── utils.ts             # Utilities (cn, date formatting)
│   └── changelog.ts         # Version history
├── hooks/
│   └── use-current-user.ts  # Auth state hook
└── types/
    ├── database.ts          # All database types + API types
    └── actions.ts           # ActionResult type
```

## Database Schema

### Entity Relationships

```
users (Supabase Auth)
  ├──< applications
  │     ├──< deployments >── cloud_providers
  │     ├──< claude_sessions
  │     ├──< maintenance_runs >── maintenance_command_types (shared)
  │     └──>< tags (via application_tags)
  ├──< cloud_providers
  ├──< tags
  └──< user_settings

environments (shared reference data)
maintenance_command_types (shared reference data)
```

### Core Tables

**applications**
- User-owned apps with metadata
- Fields: name, description, status, tech_stack[], repository_url, live_url
- Integration fields: vercel_project_id, cloudflare_project_name
- RLS: Direct user ownership via `user_id`

**deployments**
- Links apps to cloud providers + environments
- Fields: url, branch, commit_sha, status, external_id, deployed_at
- RLS: Ownership through application

**cloud_providers**
- User-owned provider instances (Vercel, Cloudflare, Railway, etc.)
- Seeded on signup with common providers
- Fields: name, slug, icon_name, base_url, is_active
- RLS: Direct user ownership via `user_id`

**environments** (shared)
- Reference data: Development, Staging, Production
- No RLS - read-only for all users

**tags**
- User-owned labels with colors
- Fields: name, color
- Many-to-many with applications via `application_tags`
- RLS: Direct user ownership via `user_id`

**user_settings**
- API tokens for integrations (encrypted JSONB)
- Fields: vercel_token, vercel_team_id, cloudflare_token, cloudflare_account_id
- RLS: Direct user ownership via `user_id`

**claude_sessions** (NEW)
- Tracks Claude Code development sessions
- Fields: started_at, ended_at, duration_minutes
- Git context: starting_branch, ending_branch, commits_count
- Token metrics: tokens_input, tokens_output, tokens_total
- Content: summary, accomplishments[], next_steps[], files_changed[]
- Integration: context_id (links to ~/.claude/contexts/{id}.md), maintenance_runs[]
- Source: session_source enum (claude-code, claude-ai, mixed)
- RLS: Ownership through application (indirect)

**maintenance_runs**
- Tracks maintenance tasks per application
- Fields: command_type_id, status, results (JSONB), notes, run_at
- Status: pending, running, completed, failed, skipped
- RLS: Ownership through application (indirect)

**maintenance_command_types** (shared)
- Reference data for maintenance types
- Seeded with: Security Review, Code Review, Architecture Review, Test Coverage, Dependency Updates, Performance Audit
- Fields: name, slug, description, recommended_frequency_days, icon, color, sort_order
- No RLS - read-only for all users

### Database Migrations

Located in `supabase/migrations/`:
1. `001_initial_schema.sql` - Core tables + RLS
2. `002_vercel_integration.sql` - Vercel project linking
3. `003_cloudflare_integration.sql` - Cloudflare project linking
4. `004_add_live_url.sql` - Live URL field
5. `005_create_maintenance_tables.sql` - Maintenance tracking
6. `006_enable_rls_maintenance_command_types.sql` - RLS policies
7. `007_create_sessions_table.sql` - Claude sessions tracking

## Key Patterns

### Data Fetching & Mutations

- **React Server Components** for all data fetching (no client-side queries)
- **Server Actions** for all mutations (`lib/actions/*.ts`)
  - Type-safe with Zod validation
  - Return `ActionResult<T>` with success/error/fieldErrors
  - Use `createClient()` from `lib/supabase/server`
  - Always check auth via `supabase.auth.getUser()`
  - Call `revalidatePath()` after mutations

### Authentication & Authorization

- **Row-Level Security** on all tables
  - Direct ownership: `WHERE user_id = auth.uid()`
  - Indirect ownership: `EXISTS (SELECT 1 FROM applications WHERE applications.id = table.application_id AND applications.user_id = auth.uid())`
  - Used for: claude_sessions, maintenance_runs, deployments
- **Auth patterns**:
  - Email/password signup/login
  - Google OAuth (via `/api/auth/login/google` route)
  - Password reset flow (forgot-password → email → reset-password)
  - Middleware protects `/dashboard/*` routes

### Form Validation

- **Zod schemas** in `lib/validations/*.ts`
  - Separate schemas for create/update operations
  - API-specific schemas for external endpoints
  - FormData parsing in Server Actions
  - JSON field parsing: `JSON.parse(formData.get('field'))` for arrays/objects

### Error Handling

- **Graceful degradation** on detail pages:
  ```typescript
  const [data1, data2] = await Promise.all([
    getData1().catch(err => {
      console.error('Failed:', err)
      return defaultValue
    }),
    getData2().catch(err => defaultValue)
  ])
  ```
  - Prevents entire page crash if one feature fails
  - Used extensively on application detail page

### API Routes

- **External integrations** via `/api/*` (not Server Actions)
- **Bearer token auth**: `Authorization: Bearer {CLAUDE_CODE_API_TOKEN}`
- **Service role key**: Use `createClient(url, serviceRoleKey)` to bypass RLS
- Used for: Claude Code session tracking, GitHub import

### Component Organization

- **UI components** in `components/ui/` (shadcn/ui)
- **Feature components** in `components/{feature}/`
- **Layout components** in `components/layout/`
- **Dialogs** for create/edit operations (inline, not separate pages)
- **Loading states** with `loading.tsx` files

## Features

### Application Management
- CRUD operations for cloud applications
- Tech stack tags (TypeScript, Next.js, React, etc.)
- Status tracking (active, inactive, archived, maintenance)
- Repository URL + Live URL linking
- Filtering by status and tags
- Bulk GitHub import with AI-generated descriptions

### Deployment Tracking
- Link apps to cloud providers + environments
- Manual deployment creation
- Auto-sync from Vercel and Cloudflare APIs
- Deployment status tracking
- Branch and commit SHA tracking
- Direct links to deployment URLs

### Maintenance Management
- Pre-defined maintenance command types (Security Review, Code Review, etc.)
- Track when maintenance tasks were last run
- Overdue detection based on recommended frequency
- Results stored as flexible JSONB
- Visual checklist on app detail page
- History view with notes

### Claude Code Session Tracking
- Automatic session creation via `/api/sessions` (called by Claude Code `/end` command)
- Tracks git activity (branches, commits)
- Token usage metrics (input, output, total)
- Session duration and timing
- Accomplishments and next steps
- Files changed tracking
- Links to maintenance runs created during session
- Security findings capture
- Session stats on dashboard and app detail pages

### GitHub Import
- Bulk import repos from GitHub username
- AI-generated descriptions (Claude 3.5 Haiku) if repo has no description
- Auto-detects tech stack from language + topics
- Hardcoded mappings for known Vercel/Cloudflare projects
- Auto-creates tags and links to apps
- Skips private repos without known deployments

### User Management
- Email/password authentication
- Google OAuth login
- Password reset flow
- User avatars (via Gravatar fallback)
- Profile display in settings
- API token management (Vercel, Cloudflare)

### UI/UX
- Dark mode (next-themes)
- Mobile-responsive with drawer navigation
- PWA support (mobile app installation)
- Animated wave pattern background
- Loading states on routes
- Toast notifications (sonner)
- Accessible UI components (Radix UI)

## Provider Integrations

### Vercel
- **Setup**: Add token in Settings → Vercel Token
- **Storage**: Token + optional team_id in `user_settings.vercel_token`
- **Actions**: `lib/actions/vercel.ts` (list projects, list deployments, sync)
- **Status mapping**:
  - READY → deployed
  - ERROR → failed
  - BUILDING → building
  - QUEUED → building
  - CANCELED → failed
- **Sync**: Auto-syncs on app detail page load (500ms delay)
- **API**: Uses `@vercel/sdk`

### Cloudflare
- **Setup**: Add token + account ID in Settings → Cloudflare Token
- **Storage**: Token + account_id in `user_settings.cloudflare_token`
- **Actions**: `lib/actions/cloudflare.ts` (list projects, list deployments, sync)
- **Permissions needed**: "Cloudflare Pages:Read"
- **Status mapping**:
  - latest_stage.status = 'success' → deployed
  - latest_stage.status = 'failure' → failed
  - latest_stage.status = 'active' → building
- **Sync**: Auto-syncs on app detail page load (500ms delay)
- **API**: Direct fetch to `https://api.cloudflare.com/client/v4`

### Auto-Sync
- **Trigger**: 500ms after app detail page load (`useEffect` in `components/applications/auto-sync.tsx`)
- **Behavior**: Syncs Vercel + Cloudflare in parallel
- **Updates**: Only syncs if project ID/name is configured
- **Refresh**: Calls `router.refresh()` after completion to update page
- **Error handling**: Silent failures (logged to console)

## Environment Variables

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Server-side only, bypasses RLS

# Required - App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to production domain in prod

# Optional - AI Features
ANTHROPIC_API_KEY=sk-ant-xxx...  # For GitHub import AI descriptions (uses claude-3-5-haiku-20241022)

# Optional - Claude Code Integration
CLAUDE_CODE_API_TOKEN=your-secret-token  # Bearer token for /api/sessions endpoint
```

**Environment Loading**:
- Uses `.env.local` for local development
- Has `.env.local.tpl` template for 1Password injection: `npm run env:inject`
- `.env.local` is gitignored

## Gotchas & Common Issues

### Authentication & RLS

- **RLS requires `auth.uid()`**: All Supabase queries need authenticated user. Server Actions must call `supabase.auth.getUser()` first.
- **Indirect ownership pattern**: For `claude_sessions` and `maintenance_runs`, RLS checks ownership through the parent `applications` table:
  ```sql
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = claude_sessions.application_id
    AND applications.user_id = auth.uid()
  )
  ```
- **API routes bypass RLS**: `/api/*` routes use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS. Must implement own auth checks (Bearer token).
- **Client factories**:
  - Server Actions: `createClient()` from `lib/supabase/server`
  - Client Components: `createClient()` from `lib/supabase/client`
  - API Routes: Manual `createClient(url, serviceRoleKey)` from `@supabase/supabase-js`
  - Never mix them!

### Form Handling

- **FormData parsing**: Server Actions receive FormData, not JSON
  - Strings: `formData.get('field')`
  - Numbers: `Number(formData.get('field'))`
  - JSON arrays/objects: `JSON.parse(formData.get('field') as string)`
  - Optional strings: Use `.optional().or(z.literal(''))` in Zod to handle empty strings
- **Validation errors**: Return `{ success: false, fieldErrors }` for form-level errors
- **Revalidation**: Always call `revalidatePath()` after mutations to refresh cached data

### Provider APIs

- **Different field names**:
  - Vercel uses `state` (READY, ERROR, BUILDING)
  - Cloudflare uses `latest_stage.status` (success, failure, active)
- **Different date formats**:
  - Vercel: Unix timestamp in milliseconds
  - Cloudflare: ISO 8601 string
- **Rate limits**: Both APIs have rate limits. No retry logic currently implemented.
- **Team context**: Vercel supports team_id, Cloudflare needs account_id

### Auto-Sync Behavior

- **Timing**: 500ms delay after mount to avoid flash of unsync'd data
- **Router refresh**: Calls `router.refresh()` after sync - don't update component state after this
- **Parallel execution**: Syncs both providers simultaneously, not sequentially
- **Silent failures**: Errors logged but don't block page render
- **Conditional**: Only syncs if `vercel_project_id` or `cloudflare_project_name` is set

### Error Handling

- **Detail page pattern**: Use `Promise.all()` with `.catch()` to prevent page crashes:
  ```typescript
  const [data, otherData] = await Promise.all([
    getData().catch(err => {
      console.error('Failed:', err)
      return defaultValue
    })
  ])
  ```
- **Database errors**: Log to console, return user-friendly message
- **External API errors**: Catch and return default values to prevent page crashes

### Database

- **JSONB fields**: Used for flexible data (results, settings, accomplishments, etc.)
  - Insert: Pass JavaScript object directly
  - Query: Use `->>` for text, `->` for JSON
- **Timestamps**: Always use `TIMESTAMPTZ` for timezone support
- **Cascades**: `ON DELETE CASCADE` used for one-to-many relationships (app → deployments, app → sessions)
- **Indexes**: Composite indexes for common queries (app_id + date)

### GitHub Import

- **Hardcoded mappings**: Known Vercel/Cloudflare projects in `app/api/import-github/route.ts`
  - Modify `VERCEL_PROJECTS` and `CLOUDFLARE_PROJECTS` maps for new projects
- **Private repos**: Skipped unless they have a known deployment mapping
- **AI descriptions**: Requires `ANTHROPIC_API_KEY`, gracefully degrades if missing
- **Rate limiting**: No pagination - only imports first 100 repos

### Sessions API

- **Authentication**: Uses Bearer token (`CLAUDE_CODE_API_TOKEN`), not Supabase auth
- **Service role**: Bypasses RLS - must verify application exists before insert
- **Duration calculation**: Auto-calculated from `started_at` and `ended_at` if provided
- **Token totals**: Auto-calculated from `tokens_input` + `tokens_output` if both provided

### Production

- **Auth redirect URLs**: Must configure in Supabase dashboard:
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/auth/callback/google`
- **CORS**: API routes need CORS headers for external calls (currently not implemented)
- **Service role key**: Never expose in client-side code - server-side only!

## Testing

### Unit Tests (Vitest)

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
```

**Setup**:
- Framework: Vitest + Testing Library + jsdom
- Config: `vitest.config.ts`
- Test files: `*.test.ts` or `*.test.tsx`
- Setup: `src/test/setup.ts` (imports @testing-library/jest-dom)

**Current coverage**:
- Validation schemas: `lib/validations/*.test.ts`
- UI components: `components/ui/*.test.tsx`

**Best practices**:
- Test Zod schemas with valid/invalid inputs
- Test form validation error messages
- Mock Supabase client for Server Actions
- Use `render()` from @testing-library/react
- Use `screen.getByRole()` for queries

### Type Checking

```bash
npm run typecheck     # Run TypeScript compiler
```

- **Strict mode**: Enabled in `tsconfig.json`
- **Path aliases**: `@/*` maps to `src/*`
- **Type errors**: CI fails on type errors

### Linting

```bash
npm run lint          # ESLint check
```

- **Config**: Next.js ESLint config
- **Plugins**: React, TypeScript, Next.js rules

## API Endpoints

### POST /api/sessions
Create a Claude Code session (external integration).

**Auth**: Bearer token (CLAUDE_CODE_API_TOKEN)

**Request**:
```json
{
  "application_id": "uuid",
  "started_at": "2026-01-26T10:00:00Z",
  "ended_at": "2026-01-26T11:30:00Z",
  "starting_branch": "main",
  "ending_branch": "feature/new-thing",
  "commits_count": 5,
  "context_id": "abc123",
  "session_source": "claude-code",
  "tokens_input": 10000,
  "tokens_output": 5000,
  "summary": "Added new feature X",
  "accomplishments": ["Implemented feature", "Fixed bugs"],
  "next_steps": ["Add tests", "Deploy"],
  "files_changed": ["src/app.ts", "src/lib.ts"],
  "maintenance_runs": ["uuid1", "uuid2"]
}
```

**Response**:
```json
{
  "success": true,
  "session_id": "uuid"
}
```

### GET /api/sessions?application_id=uuid
List sessions for an application.

**Auth**: Bearer token

**Response**:
```json
{
  "sessions": [...]
}
```

### PATCH /api/sessions
Update a session (e.g., end it).

**Auth**: Bearer token

**Request**:
```json
{
  "id": "uuid",
  "ended_at": "2026-01-26T11:30:00Z",
  "tokens_output": 5000,
  "accomplishments": ["..."]
}
```

### POST /api/import-github
Import repositories from GitHub.

**Auth**: Supabase auth (checks user session)

**Request**:
```json
{
  "username": "github-username"
}
```

**Response**:
```json
{
  "imported": ["repo1", "repo2"],
  "skipped": ["repo3 (already exists)", "repo4 (private, no known deployment)"],
  "errors": ["repo5: Error message"]
}
```

## File Structure Reference

```
/home/user/jb-cloud-app-tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── applications/
│   │   │   │   ├── page.tsx (list view)
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx (detail view)
│   │   │   │       ├── edit/page.tsx
│   │   │   │       └── sessions/page.tsx
│   │   │   ├── deployments/page.tsx
│   │   │   ├── providers/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── tags/page.tsx
│   │   ├── api/
│   │   │   ├── sessions/route.ts
│   │   │   ├── import-github/route.ts
│   │   │   └── delete-all-apps/route.ts
│   │   ├── layout.tsx (root layout)
│   │   └── page.tsx (landing page)
│   ├── components/
│   │   ├── ui/ (shadcn/ui components)
│   │   ├── applications/
│   │   ├── deployments/
│   │   ├── maintenance/
│   │   ├── sessions/
│   │   ├── settings/
│   │   ├── tags/
│   │   ├── layout/
│   │   └── user/
│   ├── lib/
│   │   ├── actions/ (Server Actions)
│   │   ├── supabase/ (Client factories)
│   │   ├── validations/ (Zod schemas)
│   │   ├── utils.ts
│   │   └── changelog.ts
│   ├── hooks/
│   ├── types/
│   └── test/
├── supabase/
│   └── migrations/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── next.config.ts
└── CLAUDE.md (this file)
```

## Deployment

### Vercel Deployment

1. **Push to GitHub**: Commit all changes
2. **Import project**: Connect GitHub repo in Vercel dashboard
3. **Environment variables**: Add in Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_APP_URL (set to production domain)
   ANTHROPIC_API_KEY (optional)
   CLAUDE_CODE_API_TOKEN (optional)
   ```
4. **Deploy**: Vercel auto-deploys on push to main
5. **Supabase config**: Update Auth redirect URLs in Supabase dashboard:
   - Add `https://yourdomain.com/auth/callback`
   - Add `https://yourdomain.com/auth/callback/google` (if using OAuth)

### Database Setup

1. **Create Supabase project**: https://supabase.com
2. **Run migrations**: In Supabase SQL editor, run each migration file in order
3. **Enable Auth**: Configure email templates and redirect URLs
4. **Test RLS**: Ensure policies are working correctly

## Development Tips

### Adding a New Feature

1. **Database first**: Create migration in `supabase/migrations/`
2. **Types**: Add types to `src/types/database.ts`
3. **Validation**: Create Zod schema in `src/lib/validations/`
4. **Server Action**: Add action in `src/lib/actions/`
5. **UI**: Create components in `src/components/`
6. **Page**: Add route in `src/app/`
7. **Test**: Add test for validation schema

### Common Tasks

**Add a new cloud provider**:
1. Add to `cloud_providers` seed data
2. Add integration file in `lib/actions/` (copy vercel.ts pattern)
3. Add token fields to `user_settings`
4. Add form in settings page
5. Add sync logic to `lib/actions/sync.ts`

**Add a new maintenance command type**:
1. Insert into `maintenance_command_types` table
2. No code changes needed - UI auto-updates

**Add a new page**:
1. Create `page.tsx` in appropriate route folder
2. Use Server Component for data fetching
3. Add to sidebar navigation in `components/layout/sidebar.tsx`
4. Add to mobile nav in `components/layout/mobile-nav.tsx`

### Debugging

- **RLS errors**: Check `auth.uid()` is set and policies are correct
- **Server Action errors**: Check console logs (both client and server)
- **Type errors**: Run `npm run typecheck`
- **Supabase errors**: Check Supabase logs in dashboard
- **API errors**: Check Network tab for response details

## Changelog

See `src/lib/changelog.ts` for full version history.

**Latest (v1.3.0)**:
- User avatars and profiles
- Google OAuth login
- Mobile PWA support
- Responsive navigation

## Session Context (for next Claude)

### PR #12 — Bidirectional Navigation, Logos, Multi-View (Feb 2026)

**What was built:**
- 13 provider brand logo SVGs in `public/logos/` + `src/lib/provider-logos.ts` utility
- Custom Cloud Tracker favicon (`src/app/icon.svg`, `src/app/apple-icon.tsx`)
- Grid/List/Compact view toggle (`src/components/applications/view-toggle.tsx`)
- Tag filter toggle bar with multi-select (`src/components/applications/tag-filter-bar.tsx`)
- Breadcrumb navigation on app detail + sessions pages
- Clickable tags throughout (filter applications list via `?tags=id1,id2`)
- Command palette Cmd+K (`src/components/layout/command-palette.tsx`)
- Context menu on app cards (`src/components/applications/app-context-menu.tsx`)
- Sync-all button (`src/components/applications/sync-all-button.tsx`)
- App favicons via Google Favicon API (`src/components/applications/app-favicon.tsx`)
- display_name field for applications (migration 008)
- 11 new shadcn/ui components (toggle, breadcrumb, command, context-menu, scroll-area, tooltip, hover-card, collapsible, progress, switch)

**PR review fixes applied:**
- Provider links go to `/deployments?provider=${id}` (not generic /deployments)
- CSS selector typo fixed in command.tsx
- Progress component passes value prop for accessibility
- Sync-all tracks failures separately with warning toast
- noopener,noreferrer on window.open calls (tabnabbing fix)
- View query param validated against allowed modes

### Approved but NOT yet implemented:
- Magic UI animated grid background
- Magic UI dock for quick actions
- Motion Primitives fade transitions for view switching
- GitHub as a provider with auto-sync
- Wire AppContextMenu into AppCard (component exists at `src/components/applications/app-context-menu.tsx`, not integrated)
- Add display_name to create/edit forms + Zod schemas
- Run migration `008_add_display_name.sql` against Supabase

### User Preferences
- Prefers actual brand asset icons/favicons over icon libraries
- Wants bidirectional navigation everywhere
- Uses dark mode with orange accent theme

### Known Issues
- shadcn CLI (`npx shadcn add`) may 403 in sandboxed environments — create components manually
- Pre-existing test file errors in `blur-blob-bg.test.tsx` (missing vitest types) — unrelated to new work
- Production build can fail due to Google Fonts TLS issues in sandboxed envs — not a code issue, typecheck is the reliable gate

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zod**: https://zod.dev
- **Vercel SDK**: https://vercel.com/docs/rest-api
- **Cloudflare API**: https://developers.cloudflare.com/api
