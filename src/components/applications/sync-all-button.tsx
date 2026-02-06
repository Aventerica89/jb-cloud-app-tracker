'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { syncVercelDeployments, syncCloudflareDeployments } from '@/lib/actions/sync'
import { getApplications } from '@/lib/actions/applications'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

export function SyncAllButton() {
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()

  async function handleSync() {
    setIsSyncing(true)
    try {
      const apps = await getApplications()
      let totalSynced = 0
      let totalFailed = 0

      const syncPromises = apps.flatMap((app) => {
        const promises: Promise<unknown>[] = []
        if (app.vercel_project_id) {
          promises.push(
            syncVercelDeployments(app.id)
              .then((r) => {
                if (r.success && r.data) totalSynced += r.data.synced
              })
              .catch(() => { totalFailed++ })
          )
        }
        if (app.cloudflare_project_name) {
          promises.push(
            syncCloudflareDeployments(app.id)
              .then((r) => {
                if (r.success && r.data) totalSynced += r.data.synced
              })
              .catch(() => { totalFailed++ })
          )
        }
        return promises
      })

      await Promise.all(syncPromises)
      if (totalFailed > 0) {
        toast.warning(`Synced ${totalSynced} deployments, but ${totalFailed} sync(s) failed`)
      } else {
        toast.success(`Synced ${totalSynced} deployments across all apps`)
      }
      router.refresh()
    } catch {
      toast.error('Failed to sync some deployments')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleSync}
          disabled={isSyncing}
          aria-label="Sync all deployments"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Sync all deployments</TooltipContent>
    </Tooltip>
  )
}
