'use client'

import { useRouter } from 'next/navigation'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  AppWindow,
  Pencil,
  ExternalLink,
  GitBranch,
  Globe,
  RefreshCw,
  Copy,
  Rocket,
  Tags,
} from 'lucide-react'
import { syncVercelDeployments, syncCloudflareDeployments } from '@/lib/actions/sync'
import { toast } from 'sonner'
import type { ApplicationWithRelations } from '@/types/database'

interface AppContextMenuProps {
  app: ApplicationWithRelations
  children: React.ReactNode
}

export function AppContextMenu({ app, children }: AppContextMenuProps) {
  const router = useRouter()

  const handleSync = async () => {
    const promises: Promise<unknown>[] = []
    if (app.vercel_project_id) {
      promises.push(syncVercelDeployments(app.id))
    }
    if (app.cloudflare_project_name) {
      promises.push(syncCloudflareDeployments(app.id))
    }
    if (promises.length === 0) {
      toast.info('No providers configured for sync')
      return
    }
    toast.promise(Promise.all(promises), {
      loading: 'Syncing deployments...',
      success: () => {
        router.refresh()
        return 'Deployments synced'
      },
      error: 'Sync failed',
    })
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={() => router.push(`/applications/${app.id}`)}>
          <AppWindow className="h-4 w-4 mr-2" />
          View Details
        </ContextMenuItem>
        <ContextMenuItem onClick={() => router.push(`/applications/${app.id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </ContextMenuItem>

        <ContextMenuSeparator />

        {app.live_url && (
          <ContextMenuItem onClick={() => window.open(app.live_url!, '_blank', 'noopener,noreferrer')}>
            <Globe className="h-4 w-4 mr-2" />
            Open Live Site
          </ContextMenuItem>
        )}
        {app.repository_url && (
          <ContextMenuItem onClick={() => window.open(app.repository_url!, '_blank', 'noopener,noreferrer')}>
            <GitBranch className="h-4 w-4 mr-2" />
            Open Repository
          </ContextMenuItem>
        )}
        {(app.live_url || app.repository_url) && <ContextMenuSeparator />}

        {app.live_url && (
          <ContextMenuItem onClick={() => handleCopyUrl(app.live_url!)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Live URL
          </ContextMenuItem>
        )}
        {app.repository_url && (
          <ContextMenuItem onClick={() => handleCopyUrl(app.repository_url!)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Repo URL
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleSync}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Deployments
        </ContextMenuItem>
        <ContextMenuItem onClick={() => router.push(`/applications/${app.id}/sessions`)}>
          <Rocket className="h-4 w-4 mr-2" />
          View Sessions
        </ContextMenuItem>
        {app.tags && app.tags.length > 0 && (
          <ContextMenuItem onClick={() => router.push(`/applications?tags=${app.tags[0].id}`)}>
            <Tags className="h-4 w-4 mr-2" />
            Filter by &quot;{app.tags[0].name}&quot;
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
