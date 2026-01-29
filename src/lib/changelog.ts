export interface ChangelogEntry {
  version: string
  date: string
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed'
    description: string
  }[]
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '2026-01-29',
    changes: [
      { type: 'added', description: 'User avatars in sidebar and mobile navigation' },
      { type: 'added', description: 'User profile section in settings' },
      { type: 'added', description: 'Mobile app support with PWA configuration' },
      { type: 'added', description: 'Responsive mobile navigation drawer' },
      { type: 'added', description: 'Google OAuth login' },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-01-28',
    changes: [
      { type: 'added', description: 'Animated wave pattern background' },
      { type: 'added', description: 'Infrastructure improvements' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-01-27',
    changes: [
      { type: 'added', description: 'Maintenance command scheduling system' },
      { type: 'fixed', description: 'Date-fns dependency issue' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-01-26',
    changes: [
      { type: 'added', description: 'GitHub import with AI descriptions and live URLs' },
      { type: 'added', description: 'Auto-sync deployments on page view' },
      { type: 'added', description: 'Cloudflare Pages integration' },
      { type: 'added', description: 'Vercel integration' },
      { type: 'added', description: 'Application management with tags' },
      { type: 'added', description: 'Deployment tracking across providers' },
      { type: 'added', description: 'Dashboard with statistics' },
      { type: 'added', description: 'Dark mode support' },
    ],
  },
]
