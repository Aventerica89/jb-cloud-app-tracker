import { Header } from '@/components/layout/header'
import { UserProfile } from '@/components/settings/user-profile'
import { VercelTokenForm } from '@/components/settings/vercel-token-form'
import { CloudflareTokenForm } from '@/components/settings/cloudflare-token-form'
import { GitHubTokenForm } from '@/components/settings/github-token-form'
import { GitHubImportForm } from '@/components/settings/github-import-form'
import { Changelog } from '@/components/settings/changelog'
import { StarredRepos } from '@/components/settings/starred-repos'
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

      {/* Full-width tabs attached to header */}
      <Tabs defaultValue="connections" className="flex-1 flex flex-col">
        <div className="border-b border-border dark:border-orange-500/20">
          <div className="px-6">
            <TabsList className="h-12 bg-transparent p-0 gap-1">
              <TabsTrigger value="connections">API Connections</TabsTrigger>
              <TabsTrigger value="starred">Starred Repos</TabsTrigger>
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="connections" className="p-6 mt-0 max-w-2xl space-y-6">
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

          <TabsContent value="starred" className="p-6 mt-0 max-w-4xl">
            <StarredRepos />
          </TabsContent>

          <TabsContent value="changelog" className="p-6 mt-0 max-w-4xl">
            <Changelog />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
