import { Header } from '@/components/layout/header'
import { VercelTokenForm } from '@/components/settings/vercel-token-form'
import { getUserSettings } from '@/lib/actions/settings'

export default async function SettingsPage() {
  const settings = await getUserSettings()

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        description="Configure integrations and preferences"
      />

      <div className="flex-1 p-6 space-y-6 max-w-2xl">
        <VercelTokenForm
          hasToken={!!settings?.vercel_token}
          currentTeamId={settings?.vercel_team_id}
        />
      </div>
    </div>
  )
}
