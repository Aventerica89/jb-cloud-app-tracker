import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Cloud, ExternalLink } from 'lucide-react'
import { getProviders } from '@/lib/actions/providers'
import { AddProviderDialog } from '@/components/providers/add-provider-dialog'
import { ProviderActions } from '@/components/providers/provider-actions'

export default async function ProvidersPage() {
  const providers = await getProviders()

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

      <div className="flex-1 p-6">
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
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      {provider.name}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {provider.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {provider.base_url ? (
                        <a
                          href={provider.base_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {new URL(provider.base_url).hostname}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={provider.is_active ? 'default' : 'secondary'}
                      >
                        {provider.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ProviderActions provider={provider} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}
