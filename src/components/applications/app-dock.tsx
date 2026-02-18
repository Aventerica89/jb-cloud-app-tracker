'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dock, DockIcon } from '@/components/ui/dock'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  Plus,
  RefreshCw,
  Github,
  LayoutGrid,
  List,
  Grid3X3,
} from 'lucide-react'
import { syncVercelDeployments, syncCloudflareDeployments, syncCloudflareWorkerDeployments, syncGitHubDeployments } from '@/lib/actions/sync'
import { getApplications } from '@/lib/actions/applications'
import { toast } from 'sonner'
import type { ViewMode } from '@/components/applications/view-toggle'

export function AppDock() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSyncing, setIsSyncing] = useState(false)
  const [, startTransition] = useTransition()

  const VALID_VIEWS: ViewMode[] = ['grid', 'list', 'compact']
  const rawView = searchParams.get('view')
  const currentView: ViewMode = rawView && VALID_VIEWS.includes(rawView as ViewMode)
    ? (rawView as ViewMode)
    : 'grid'

  const setView = useCallback(
    (view: ViewMode) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (view === 'grid') {
          params.delete('view')
        } else {
          params.set('view', view)
        }
        const query = params.toString()
        router.push(`/applications${query ? `?${query}` : ''}`)
      })
    },
    [router, searchParams, startTransition]
  )

  const handleSyncAll = useCallback(async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      const apps = await getApplications()
      let totalSynced = 0

      const syncPromises = apps.flatMap((app) => {
        const promises: Promise<unknown>[] = []
        if (app.vercel_project_id) {
          promises.push(
            syncVercelDeployments(app.id)
              .then((r) => { if (r.success && r.data) totalSynced += r.data.synced })
              .catch(() => {})
          )
        }
        if (app.cloudflare_project_name) {
          promises.push(
            syncCloudflareDeployments(app.id)
              .then((r) => { if (r.success && r.data) totalSynced += r.data.synced })
              .catch(() => {})
          )
        }
        if (app.cloudflare_worker_name) {
          promises.push(
            syncCloudflareWorkerDeployments(app.id)
              .then((r) => { if (r.success && r.data) totalSynced += r.data.synced })
              .catch(() => {})
          )
        }
        if (app.github_repo_name) {
          promises.push(
            syncGitHubDeployments(app.id)
              .then((r) => { if (r.success && r.data) totalSynced += r.data.synced })
              .catch(() => {})
          )
        }
        return promises
      })

      await Promise.all(syncPromises)
      toast.success(`Synced ${totalSynced} deployments`)
      router.refresh()
    } catch {
      toast.error('Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, router])

  const viewIcons: Record<ViewMode, typeof LayoutGrid> = {
    grid: LayoutGrid,
    list: List,
    compact: Grid3X3,
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Dock
        iconSize={36}
        iconMagnification={52}
        iconDistance={120}
        direction="bottom"
        className="bg-background/80 border-border"
      >
        <DockIcon onClick={() => router.push('/applications/new')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Plus className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent side="top">Add Application</TooltipContent>
          </Tooltip>
        </DockIcon>

        <DockIcon onClick={handleSyncAll}>
          <Tooltip>
            <TooltipTrigger asChild>
              <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </TooltipTrigger>
            <TooltipContent side="top">Sync All</TooltipContent>
          </Tooltip>
        </DockIcon>

        <DockIcon onClick={() => router.push('/applications?import=github')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Github className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent side="top">Import GitHub</TooltipContent>
          </Tooltip>
        </DockIcon>

        {VALID_VIEWS.map((view) => {
          const Icon = viewIcons[view]
          return (
            <DockIcon
              key={view}
              onClick={() => setView(view)}
              className={currentView === view ? 'bg-primary/10 text-primary' : ''}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Icon className="h-5 w-5" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  {view.charAt(0).toUpperCase() + view.slice(1)} view
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          )
        })}
      </Dock>
    </div>
  )
}
