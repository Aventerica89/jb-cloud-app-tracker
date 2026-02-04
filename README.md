<p align="center">
  <img src="public/icons/icon.svg" alt="Cloud App Tracker" width="128" height="128">
</p>

<h1 align="center">Cloud App Tracker</h1>

<p align="center">
  <strong>Track and manage cloud applications across multiple providers</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black" alt="Next.js 15">
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green" alt="Supabase">
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#integrations">Integrations</a>
</p>

---

## The Problem

When you deploy apps across Vercel, Cloudflare, Railway, and other providers, it's hard to track:
- What's deployed where?
- What's the current status?
- When was it last updated?

Cloud App Tracker gives you a single dashboard to see everything.

## Features

- **Unified Dashboard** - See all your apps in one place
- **Provider Integration** - Auto-sync from Vercel and Cloudflare
- **Deployment Tracking** - History of all deployments with status
- **Tags & Organization** - Categorize apps your way
- **Dark Mode** - Easy on the eyes
- **Auto-Sync** - Updates when you view an app

## Demo

```
┌─────────────────────────────────────────────────────────────┐
│  Cloud App Tracker                          🌙  Settings    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Dashboard                                                  │
│  ├── 12 Applications                                        │
│  ├── 47 Deployments                                         │
│  └── 4 Providers                                            │
│                                                             │
│  Recent Deployments                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ claude-codex    Vercel     deployed    2 min ago    │   │
│  │ URLsToGo        Cloudflare deployed    1 hour ago   │   │
│  │ jb-cloud-docs   Vercel     deployed    12 hours ago │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites

- Node.js 18+
- Supabase account
- Vercel/Cloudflare accounts (for integrations)

### Setup

```bash
# Clone the repo
git clone https://github.com/Aventerica89/jb-cloud-app-tracker.git
cd jb-cloud-app-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Integrations

### Vercel

1. Go to **Settings** > Add Vercel API Token
2. Edit an app > Select Vercel Project
3. Click **Sync Vercel** to import deployments

### Cloudflare Pages

1. Go to **Settings** > Add Cloudflare Token + Account ID
2. Edit an app > Select Cloudflare Project
3. Click **Sync Cloudflare** to import deployments

### Status Mapping

| Provider Status | Local Status |
|----------------|--------------|
| READY / success | deployed |
| ERROR / failure | failed |
| BUILDING / active | building |
| QUEUED | pending |
| CANCELED | rolled_back |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| UI | Tailwind CSS + shadcn/ui |
| Testing | Vitest + Playwright |

## Development

```bash
# Run dev server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Type check
npm run typecheck

# Build for production
npm run build
```

## License

MIT
