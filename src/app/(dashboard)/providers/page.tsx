import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Cloud, ExternalLink, Rocket, AppWindow } from 'lucide-react'
import { getProvidersWithCounts } from '@/lib/actions/providers'
import { AddProviderDialog } from '@/components/providers/add-provider-dialog'
import { ProviderActions } from '@/components/providers/provider-actions'

export default async function ProvidersPage() {
  const providers = await getProvidersWithCounts()

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Cloud Providers"
        description="Manage your cloud provider configurations"
      >
        <AddProviderDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </AddProviderDialog>
      </Header>

      <div className="flex-1 overflow-auto p-6">
        {providers.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12">
            <CardContent className="flex flex-col items-center text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Cloud className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No providers yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Add cloud providers to track your deployments across different
                platforms.
              </p>
              <AddProviderDialog>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first provider
                </Button>
              </AddProviderDialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Card key={provider.id} className="relative group hover:border-primary/50 dark:hover:border-orange-500/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-orange-500/10">
                        <Cloud className="h-5 w-5 text-primary dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {provider.slug}
                        </code>
                      </div>
                    </div>
                    <ProviderActions provider={provider} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <AppWindow className="h-4 w-4" />
                      <span>{provider.app_count} {provider.app_count === 1 ? 'app' : 'apps'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Rocket className="h-4 w-4" />
                      <span>{provider.deployment_count} {provider.deployment_count === 1 ? 'deployment' : 'deployments'}</span>
                    </div>
                  </div>

                  {/* URL and Status */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    {provider.base_url ? (
                      <a
                        href={provider.base_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {new URL(provider.base_url).hostname}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">No URL</span>
                    )}
                    <Badge
                      variant={provider.is_active ? 'default' : 'secondary'}
                      className={provider.is_active ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : ''}
                    >
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Link to deployments */}
                  {provider.deployment_count > 0 && (
                    <Link
                      href={`/deployments?provider=${provider.id}`}
                      className="block text-xs text-primary dark:text-orange-400 hover:underline"
                    >
                      View deployments →
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
