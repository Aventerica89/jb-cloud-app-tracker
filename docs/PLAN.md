# Implementation Plan: jb-cloud-app-tracker

## Overview

A personal web application for tracking cloud applications across multiple providers (Vercel, Railway, Cloudflare, etc.). Built with Next.js 15 App Router, Supabase for database and auth, deployed on Vercel.

---

## MVP Scope Definition

### In Scope (v1 - MVP)

**Core Features:**
- User authentication (Supabase Auth with email/password)
- Dashboard with stats overview
- Application CRUD (create, read, update, delete)
- Deployment tracking (link apps to providers + environments)
- Cloud provider management (seeded defaults + custom)
- Tag management with many-to-many relationships
- Basic search/filter on applications list
- Dark mode support
- Responsive design (mobile-first)

### Deferred (v2+)

- Social auth (GitHub, Google)
- Deployment notifications/webhooks
- Import from provider APIs (Vercel API, etc.)
- Team/organization support
- Activity audit log
- Bulk operations
- Export functionality (CSV/JSON)
- Custom fields on applications
- Deployment health monitoring
- Cost tracking

### Out of Scope

- Multi-tenancy/SaaS features
- Billing/subscriptions
- Real-time collaboration
- Mobile native apps
- Custom domain management
- CI/CD integration

---

## Implementation Phases

### Phase 1: Foundation

**Goal**: Project setup with auth working and basic layout

#### 1.1 Project Initialization

| Task | Action |
|------|--------|
| Create Next.js 15 project | `npx create-next-app@latest` with App Router, TypeScript, Tailwind |
| Install dependencies | `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lucide-react` |
| Install dev dependencies | `vitest`, `@testing-library/react`, `playwright` |
| Configure TypeScript strict | Enable `strict: true`, configure path aliases |
| Setup v0/shadcn | Initialize with slate colors |
| Create environment files | `.env.local`, `.env.example` |

#### 1.2 Supabase Setup

| Task | Action |
|------|--------|
| Create Supabase project | New project in Supabase Dashboard |
| Create environments migration | Create environments table + seed data |
| Create providers migration | Create cloud_providers table + RLS |
| Create tags migration | Create tags table + RLS |
| Create applications migration | Create applications table + RLS |
| Create app_tags migration | Create junction table + RLS |
| Create deployments migration | Create deployments table + RLS |
| Create signup trigger | Seed default providers on user signup |

#### 1.3 Supabase Client Setup

| Task | Action |
|------|--------|
| Create browser client | `createBrowserClient` |
| Create server client | Server client with cookies |
| Create middleware | Session refresh middleware |
| Generate TypeScript types | `supabase gen types typescript` |

#### 1.4 Authentication

| Task | Action |
|------|--------|
| Create auth layout | Centered card layout for auth pages |
| Create login page | Email/password login form |
| Create signup page | Email/password signup form |
| Create auth actions | Server actions: signIn, signUp, signOut |
| Create auth callback route | Handle Supabase auth callback |
| Protect dashboard routes | Redirect unauthenticated users |

#### 1.5 Base Layout

| Task | Action |
|------|--------|
| Create root layout | HTML structure, fonts, metadata |
| Create theme provider | next-themes integration |
| Create dashboard layout | Sidebar + main content area |
| Create sidebar component | Navigation links, user menu |
| Create header component | Page title, breadcrumbs, actions |
| Create dashboard home | Dashboard placeholder |

**Definition of Done:**
- [ ] Project runs locally with `npm run dev`
- [ ] User can sign up and receive confirmation email
- [ ] User can log in and see dashboard
- [ ] User can log out
- [ ] Default providers seeded on signup
- [ ] Unauthenticated users redirected to login

---

### Phase 2: Core Data Management

**Goal**: Full CRUD for providers, tags, and applications

#### 2.1 Shared Components

| Task | Action |
|------|--------|
| Install shadcn components | button, input, form, dialog, table, select, badge, dropdown-menu, toast |
| Create form wrapper | Reusable form with error handling |
| Create confirm dialog | Delete confirmation modal |
| Create empty state | No data placeholder |
| Create loading skeleton | Loading placeholder |

#### 2.2 Validation Schemas

| Task | Action |
|------|--------|
| Create provider schema | Zod schema for provider validation |
| Create tag schema | Zod schema for tag validation |
| Create application schema | Zod schema for application validation |
| Create deployment schema | Zod schema for deployment validation |

#### 2.3 Provider Management

| Task | Action |
|------|--------|
| Create providers page | List providers with RSC |
| Create provider actions | getProviders, createProvider, updateProvider, deleteProvider |
| Create provider form | Name, icon URL, color picker |
| Create provider list | Table with edit/delete actions |
| Create add/edit provider dialogs | Modals with provider form |

#### 2.4 Tag Management

| Task | Action |
|------|--------|
| Create tags page | List tags with RSC |
| Create tag actions | getTags, createTag, updateTag, deleteTag |
| Create tag form | Name, color picker |
| Create tag list | Grid of tag badges with actions |
| Create tag badge | Colored badge component |

#### 2.5 Application Management

| Task | Action |
|------|--------|
| Create applications page | List applications with RSC |
| Create application actions | getApplications, getApplication, create, update, delete |
| Create application form | Full form with tag multi-select |
| Create application list | Card grid with status, tags |
| Create application card | Name, status, tech stack, tags preview |
| Create new application page | Full-page form |
| Create application detail page | Detail view with deployments |
| Create edit application page | Edit form |

**Definition of Done:**
- [ ] Provider CRUD works
- [ ] Tag CRUD works
- [ ] Application CRUD works
- [ ] Tags can be added/removed from applications
- [ ] Form validation shows errors
- [ ] Delete confirmations work
- [ ] Empty states display correctly

---

### Phase 3: Deployments

**Goal**: Track deployments linking applications to providers and environments

#### 3.1 Environment Data

| Task | Action |
|------|--------|
| Create environment actions | getEnvironments (read-only) |
| Create environment badge | Colored badge per environment |

#### 3.2 Deployment Management

| Task | Action |
|------|--------|
| Create deployment actions | getDeployments, getDeploymentsByApp, create, update, delete |
| Create deployment form | Application, provider, environment selects |
| Create deployment list | Table with all deployments |
| Create deployment card | Provider, environment, URL, status |
| Create deployments page | All deployments list |
| Create new/edit deployment pages | Full-page forms |

#### 3.3 Application Detail Enhancements

| Task | Action |
|------|--------|
| Create app deployments section | Deployments grid for app detail |
| Add deployment from app | Quick add deployment modal |
| Deployment timeline | Chronological deployment history |

**Definition of Done:**
- [ ] Deployment CRUD works from main deployments page
- [ ] Deployments display on application detail page
- [ ] Can add deployment from application detail
- [ ] Environment badges display correctly
- [ ] Provider icons/colors display correctly
- [ ] Deployment URLs are clickable

---

### Phase 4: Dashboard

**Goal**: Overview with stats, charts, and recent activity

#### 4.1 Dashboard Data

| Task | Action |
|------|--------|
| Create stats actions | getDashboardStats (counts, recent activity) |
| Define stats types | TypeScript interfaces for dashboard data |

#### 4.2 Dashboard Components

| Task | Action |
|------|--------|
| Create stats card | Icon, label, value, change indicator |
| Create stats grid | Grid of stat cards |
| Create recent deployments | Last 5 deployments list |
| Create apps by status chart | Donut chart (active/archived/deprecated) |
| Create provider distribution | Bar chart of deployments per provider |
| Create quick actions | Add app, add deployment buttons |

#### 4.3 Dashboard Assembly

| Task | Action |
|------|--------|
| Build dashboard page | Compose all dashboard components |
| Add loading states | Skeleton dashboard |

**Definition of Done:**
- [ ] Stats cards show correct counts
- [ ] Recent deployments list shows last 5
- [ ] Charts render correctly
- [ ] Quick actions navigate to correct pages
- [ ] Dashboard loads under 2 seconds
- [ ] Responsive on mobile

---

### Phase 5: Polish

**Goal**: Search, filter, dark mode, and UX refinements

#### 5.1 Search and Filter

| Task | Action |
|------|--------|
| Create search input | Debounced search input |
| Create filter bar | Status, provider, tag filters |
| Update applications query | Add search and filter parameters |
| Implement URL state | Sync filters with URL params |
| Update applications page | Wire up search/filter |

#### 5.2 Dark Mode

| Task | Action |
|------|--------|
| Install next-themes | Add next-themes dependency |
| Configure theme provider | Wrap app with ThemeProvider |
| Create theme toggle | Sun/moon icon toggle |
| Add to header | Include theme toggle |
| Verify dark classes | Ensure dark: variants applied |

#### 5.3 UX Enhancements

| Task | Action |
|------|--------|
| Add toast notifications | Success/error toasts for actions |
| Wire toasts to actions | Add toast triggers |
| Add page transitions | Subtle fade transitions |
| Keyboard shortcuts | Cmd+K for search, etc. |
| Accessibility audit | ARIA labels, focus states, contrast |

#### 5.4 Error Handling

| Task | Action |
|------|--------|
| Create error boundary | Global error boundary |
| Create not-found page | 404 page |
| Create dashboard error | Dashboard-specific error |
| Handle action errors | Consistent error responses |

**Definition of Done:**
- [ ] Search filters applications by name
- [ ] Status/provider/tag filters work
- [ ] Filters persist in URL (shareable)
- [ ] Dark mode toggle works and persists
- [ ] Toast notifications appear for all actions
- [ ] Error pages display correctly
- [ ] Accessibility audit passes

---

### Phase 6: Testing and Launch

**Goal**: Comprehensive testing, documentation, and production deployment

#### 6.1 Unit Tests

| Task | Action |
|------|--------|
| Test validation schemas | All Zod schemas |
| Test utility functions | Date formatting, etc. |
| Test hooks | Custom hooks |

#### 6.2 Integration Tests

| Task | Action |
|------|--------|
| Test auth flows | Login, signup, logout |
| Test server actions | All CRUD actions |

#### 6.3 E2E Tests

| Task | Action |
|------|--------|
| Setup Playwright | Configure Playwright |
| Auth E2E | Full auth user journey |
| Applications E2E | Full CRUD user journey |
| Deployments E2E | Deployment management |
| Dashboard E2E | Dashboard interactions |

#### 6.4 Documentation

| Task | Action |
|------|--------|
| Create README | Project overview, setup instructions |
| Create CONTRIBUTING | Development guidelines |
| Create API docs | Server actions documentation |
| Create database docs | Schema documentation |

#### 6.5 Production Deployment

| Task | Action |
|------|--------|
| Create Vercel project | Link to GitHub repo |
| Configure env variables | Set Supabase credentials |
| Enable Supabase production | Configure production settings |
| Configure RLS policies | Verify all policies active |
| Smoke test production | Full manual test on prod |

**Definition of Done:**
- [ ] 80%+ test coverage
- [ ] All E2E tests pass
- [ ] README complete with setup instructions
- [ ] Production deployment works
- [ ] All environment variables configured
- [ ] RLS policies verified in production
- [ ] Lighthouse score 90+ (performance, accessibility)

---

## Task Dependencies Graph

```
Phase 1 (Foundation)
├── 1.1 Project Setup
│   └── 1.2 Supabase Setup
│       └── 1.3 Supabase Client
│           └── 1.4 Authentication
│               └── 1.5 Base Layout

Phase 2 (Core Data) ← Phase 1
├── 2.1 Shared Components
├── 2.2 Validation Schemas (parallel)
├── 2.3 Provider Management ← 2.1, 2.2
├── 2.4 Tag Management ← 2.1, 2.2
└── 2.5 Application Management ← 2.1, 2.2, 2.4

Phase 3 (Deployments) ← Phase 2
├── 3.1 Environment Data
├── 3.2 Deployment Management ← 3.1
└── 3.3 App Detail Enhancements ← 3.2

Phase 4 (Dashboard) ← Phase 2, Phase 3
├── 4.1 Dashboard Data
├── 4.2 Dashboard Components ← 4.1
└── 4.3 Dashboard Assembly ← 4.2

Phase 5 (Polish) ← Phase 4
├── 5.1 Search/Filter
├── 5.2 Dark Mode (parallel)
├── 5.3 UX Enhancements ← 5.1
└── 5.4 Error Handling (parallel)

Phase 6 (Launch) ← Phase 5
├── 6.1 Unit Tests (parallel)
├── 6.2 Integration Tests (parallel)
├── 6.3 E2E Tests ← 6.1, 6.2
├── 6.4 Documentation (parallel)
└── 6.5 Production Deployment ← 6.3, 6.4
```

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Supabase RLS complexity** | High | Write comprehensive RLS tests; verify each policy |
| **Auth session handling** | Medium | Follow Supabase SSR docs exactly; test refresh |
| **Server Actions errors** | Medium | Wrap in try/catch; consistent error shapes; Zod validation |
| **Scope creep** | Medium | Strict MVP definition; defer nice-to-haves |
| **RLS bypass** | Critical | Test every policy; use security-reviewer agent |

---

## Success Criteria

### MVP Complete When:
- [ ] All 6 phases complete
- [ ] No critical or high security vulnerabilities
- [ ] Lighthouse performance 90+
- [ ] Lighthouse accessibility 90+
- [ ] Zero console errors in production
- [ ] 80%+ test coverage

---

## Next Steps

1. Review this plan
2. Initialize Next.js 15 project
3. Begin Phase 1: Foundation
4. Use TDD approach where applicable
5. Commit incrementally
