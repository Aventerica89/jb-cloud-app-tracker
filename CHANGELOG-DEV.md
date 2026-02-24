# Developer Log

Technical log. Updated on every deploy.

<!-- Entries added automatically by deploy hook -->

### 2026-02-18 04:07 · 243e22e · v0.0.0
FIX      security — session ownership checks + dependency updates

### 2026-02-18 04:03 · 16a2324 · v0.0.0
DOCS     changelog — add v1.5.0 changelog entry

### 2026-02-18 04:02 · 5f73c9e · v0.0.0
FEAT     core — complete 9-task plan: context menus, display_name, visual polish, GitHub provider

### 2026-02-15 05:51 · ec2f02c · v0.0.0
FEAT     security — strengthen security headers with environment-aware CSP

### 2026-02-13 20:18 · ef8a2c8 · v0.0.0
FEAT     cloudflare — add Cloudflare Workers deployment sync

### 2026-02-13 19:12 · fb066c4 · v0.0.0
FIX      deployment — complete deployment sync pipeline for GitHub provider

### 2026-02-08 22:11 · a8de416 · v0.0.0
FIX      api — remove display_name from applications API (migration not run)

### 2026-02-08 21:54 · 5fc8a36 · v0.0.0
FEAT     api — add /api/applications endpoint for cross-app integration

### 2026-02-07 18:00 · 6324f37 · v0.0.0
FIX      ui — move tabs above breadcrumbs with transparent backdrop

### 2026-02-07 17:54 · 14141c8 · v0.0.0
FEAT     ui — redesign tab navigation with full-width header-attached tabs

### 2026-02-07 00:01 · 50bc8ec · v0.0.0
FIX      ui — SelectItem empty string value crashes edit page

### 2026-02-06 23:48 · f8ab509 · v0.0.0
FEAT     github — add GitHub tab to application detail page

### 2026-02-06 22:31 · cd75803 · v0.0.0
FEAT     core — complete 6-phase cloud tracker refinement

### 2026-02-06 15:50 · 61fb24e · v0.0.0
FEAT     core — add bidirectional relationships and logos

### 2026-02-06 15:31 · 8ffe727 · v0.0.0
FEAT     ui — add UI enhancements, provider logos, and improved navigation

### 2026-02-05 20:32 · f9a09c0 · v0.0.0
FEAT     settings — add tabbed navigation to Settings page with changelog tab

### 2026-02-05 19:51 · 9a9472f · v0.0.0
FEAT     integration — add Auto-Connect button to match apps with Vercel/Cloudflare projects

### 2026-02-05 19:40 · 31d0e0e · v0.0.0
FIX      config — remove invalid health_timeout key from supabase config

### 2026-02-05 19:24 · 5f0e04c · v0.0.0
FEAT     integration — auto-connect GitHub repos to Vercel/Cloudflare during import

### 2026-02-05 18:22 · 002a78f · v0.0.0
FEAT     ui — add LocalTime component for timezone-aware date display

### 2026-02-05 18:20 · ea9c298 · v0.0.0
FIX      layout — restructure page layout so header stays fixed while content scrolls

### 2026-02-05 18:14 · 3ba5673 · v0.0.0
FIX      layout — make page header sticky so it doesn't scroll away

### 2026-02-05 18:12 · 8498f29 · v0.0.0
FIX      ui — remove duplicate tech_stack badges from app cards

### 2026-02-05 18:07 · d215855 · v0.0.0
FEAT     ui — improve UX consistency across pages

### 2026-02-05 17:44 · 13b028e · v0.0.0
FIX      types — useRef TypeScript error for React 19 compatibility

### 2026-02-05 17:03 · 294d766 · v0.0.0
FIX      ui — fix app card links

### 2026-02-05 15:44 · 688c15f · v0.0.0
FIX      core — add error handling to app detail page and enhance deployment links

### 2026-02-04 13:52 · 2ee6f38 · v0.0.0
DOCS     readme — add custom logo and enhanced badges to README

### 2026-02-04 13:42 · 0de632c · v0.0.0
DOCS     core — add CLAUDE.md for AI-assisted development context

### 2026-02-04 13:05 · f5125b0 · v0.0.0
DOCS     readme — replace boilerplate with comprehensive project README

### 2026-02-03 20:59 · d2bd7f9 · v0.0.0
FEAT     sessions — add Claude Code sessions tracking feature

### 2026-02-02 19:39 · 7a868ea · v0.0.0
CHORE    git — add worktree setup script

### 2026-01-30 16:48 · 3dcf84d · v0.0.0
FIX      ui — address code review feedback: UI consistency and query optimization

### 2026-01-30 15:05 · 2a8ef62 · v0.0.0
FEAT     ui — enhance dark mode styling and improve dashboard UI components

### 2026-01-29 12:41 · 67e328d · v0.0.0
FEAT     mobile — setup mobile app improvements

### 2026-01-29 11:42 · 184fbe7 · v0.0.0
FEAT     mobile — setup mobile app enhancements

### 2026-01-29 08:01 · 55dfc7b · v0.0.0
FEAT     pwa — add mobile app support with PWA configuration

### 2026-01-29 03:04 · eff88ea · v0.0.0
FEAT     ui — add animated wave pattern background and infrastructure improvements

### 2026-01-29 00:10 · f12f26a · v0.0.0
FIX      deps — add date-fns dependency

### 2026-01-28 23:53 · e67f3e4 · v0.0.0
FEAT     maintenance — add maintenance command scheduling system

### 2026-01-28 16:20 · 31f1688 · v0.0.0
FIX      types — resolve TypeScript null check in getOrCreateTag

### 2026-01-28 15:57 · b445d6a · v0.0.0
FEAT     github — add GitHub import with AI descriptions and live URLs

### 2026-01-28 14:42 · 71eecf5 · v0.0.0
FIX      auth — remove onClick handler from server component

### 2026-01-28 13:20 · a15f5d7 · v0.0.0
FIX      auth — use route handler for Google OAuth instead of server action

### 2026-01-28 13:12 · 813672f · v0.0.0
FIX      auth — callback route cookie handling for OAuth

### 2026-01-28 12:08 · 87454bf · v0.0.0
FEAT     auth — add Supabase config with Google OAuth

### 2026-01-28 11:50 · 41ebb6b · v0.0.0
FEAT     auth — add Google OAuth sign-in

### 2026-01-28 03:50 · e9ea3e3 · v0.0.0
FEAT     auth — add forgot password and reset password flow

### 2026-01-28 02:25 · 21fbfda · v0.0.0
FIX      db — update seed_user_providers trigger with proper security context

### 2026-01-28 02:23 · 0c0e690 · v0.0.0
FEAT     cloudflare — add Cloudflare integration, auto-sync, and security hardening

### 2026-01-28 00:45 · 1fc57a0 · v0.0.0
FEAT     vercel — add Vercel API integration for deployment sync

### 2026-01-27 17:10 · a83a340 · v0.0.0
DOCS     deployment — add deployment instructions and mark all phases complete

### 2026-01-27 17:10 · 5da36bc · v0.0.0
FEAT     testing — add Phase 6: Testing infrastructure

### 2026-01-27 00:43 · 2f8a48d · v0.0.0
DOCS     core — update implementation status to reflect completed phases

### 2026-01-27 00:43 · d109408 · v0.0.0
FEAT     polish — add Phase 5: Polish

### 2026-01-27 00:41 · 0efb58a · v0.0.0
FEAT     deployments — add Phase 4: Dashboard

### 2026-01-27 00:39 · 2645ad5 · v0.0.0
FEAT     deployments — add Phase 3: Deployments

### 2026-01-27 00:34 · 4baae87 · v0.0.0
FEAT     core — add Phase 2: Core Data Management

### 2026-01-27 00:24 · 2949455 · v0.0.0
FIX      ui — resolve hydration mismatch in theme toggle

### 2026-01-27 00:16 · 03f45d8 · v0.0.0
FEAT     db — add database migrations with RLS and provider seeding

### 2026-01-26 23:40 · 51cfb92 · v0.0.0
FIX      build — remove tw-animate-css import causing build errors

### 2026-01-26 23:19 · 1e6610f · v0.0.0
FEAT     auth — add Phase 1 foundation: auth and layout

### 2026-01-26 23:04 · 9de1211 · v0.0.0
FEAT     core — initialize Next.js 15 project

### 2026-01-26 22:51 · 1ca7ebf · v0.0.0
CHORE    core — initialize project with architecture and implementation plan
