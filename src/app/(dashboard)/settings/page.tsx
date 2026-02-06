import { Header } from '@/components/layout/header'
import { UserProfile } from '@/components/settings/user-profile'
import { VercelTokenForm } from '@/components/settings/vercel-token-form'
import { CloudflareTokenForm } from '@/components/settings/cloudflare-token-form'
import { GitHubImportForm } from '@/components/settings/github-import-form'
import { Changelog } from '@/components/settings/changelog'
import { getUserSettings } from '@/lib/actions/settings'
import { getCurrentUser } from '@/lib/actions/user'

export default async function SettingsPage() {
  const [settings, user] = await Promise.all([
    getUserSettings(),
    getCurrentUser(),
  ])

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        description="Configure integrations and preferences"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-2xl">
        {user && <UserProfile user={user} />}

        <VercelTokenForm
          hasToken={!!settings?.vercel_token}
          currentTeamId={settings?.vercel_team_id}
        />
        <CloudflareTokenForm
          hasToken={!!settings?.cloudflare_token}
          currentAccountId={settings?.cloudflare_account_id}
        />
        <GitHubImportForm />

        <Changelog />
      </div>
    </div>
  )
}
