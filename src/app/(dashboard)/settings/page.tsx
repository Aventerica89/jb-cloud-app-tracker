import { Header } from '@/components/layout/header'
import { UserProfile } from '@/components/settings/user-profile'
import { VercelTokenForm } from '@/components/settings/vercel-token-form'
import { CloudflareTokenForm } from '@/components/settings/cloudflare-token-form'
import { GitHubTokenForm } from '@/components/settings/github-token-form'
import { GitHubImportForm } from '@/components/settings/github-import-form'
import { Changelog } from '@/components/settings/changelog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="connections" className="max-w-2xl">
          <TabsList>
            <TabsTrigger value="connections">API Connections</TabsTrigger>
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
          </TabsList>
          <TabsContent value="connections" className="space-y-6">
            {user && <UserProfile user={user} />}
            <VercelTokenForm
              hasToken={!!settings?.vercel_token}
              currentTeamId={settings?.vercel_team_id}
            />
            <CloudflareTokenForm
              hasToken={!!settings?.cloudflare_token}
              currentAccountId={settings?.cloudflare_account_id}
            />
            <GitHubTokenForm
              hasToken={!!settings?.github_token}
              currentUsername={settings?.github_username}
            />
            <GitHubImportForm />
          </TabsContent>
          <TabsContent value="changelog">
            <Changelog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
