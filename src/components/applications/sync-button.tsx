'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { syncVercelDeployments, syncCloudflareDeployments } from '@/lib/actions/sync'
import { toast } from 'sonner'
import { RefreshCw, Cloud } from 'lucide-react'

interface SyncButtonProps {
  applicationId: string
  hasVercelProject: boolean
  hasCloudflareProject?: boolean
}

export function SyncButton({ applicationId, hasVercelProject, hasCloudflareProject = false }: SyncButtonProps) {
  const router = useRouter()
  const [isSyncingVercel, setIsSyncingVercel] = useState(false)
  const [isSyncingCloudflare, setIsSyncingCloudflare] = useState(false)

  async function handleVercelSync() {
    setIsSyncingVercel(true)

    const result = await syncVercelDeployments(applicationId)

    if (result.success) {
      if (result.data) {
        const { synced, created, updated } = result.data
        if (synced === 0) {
          toast.info('No deployments found on Vercel')
        } else {
          toast.success(
            `Synced ${synced} Vercel deployments (${created} new, ${updated} updated)`
          )
        }
      }
      router.refresh()
    } else {
      toast.error(result.error)
    }

    setIsSyncingVercel(false)
  }

  async function handleCloudflareSync() {
    setIsSyncingCloudflare(true)

    const result = await syncCloudflareDeployments(applicationId)

    if (result.success) {
      if (result.data) {
        const { synced, created, updated } = result.data
        if (synced === 0) {
          toast.info('No deployments found on Cloudflare')
        } else {
          toast.success(
            `Synced ${synced} Cloudflare deployments (${created} new, ${updated} updated)`
          )
        }
      }
      router.refresh()
    } else {
      toast.error(result.error)
    }

    setIsSyncingCloudflare(false)
  }

  if (!hasVercelProject && !hasCloudflareProject) {
    return null
  }

  return (
    <div className="flex gap-2">
      {hasVercelProject && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleVercelSync}
          disabled={isSyncingVercel}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncingVercel ? 'animate-spin' : ''}`} />
          {isSyncingVercel ? 'Syncing...' : 'Sync Vercel'}
        </Button>
      )}
      {hasCloudflareProject && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCloudflareSync}
          disabled={isSyncingCloudflare}
        >
          <Cloud className={`mr-2 h-4 w-4 ${isSyncingCloudflare ? 'animate-spin' : ''}`} />
          {isSyncingCloudflare ? 'Syncing...' : 'Sync Cloudflare'}
        </Button>
      )}
    </div>
  )
}
