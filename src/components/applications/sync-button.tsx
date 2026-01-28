'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { syncVercelDeployments } from '@/lib/actions/sync'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

interface SyncButtonProps {
  applicationId: string
  hasVercelProject: boolean
}

export function SyncButton({ applicationId, hasVercelProject }: SyncButtonProps) {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)

  if (!hasVercelProject) {
    return null
  }

  async function handleSync() {
    setIsSyncing(true)

    const result = await syncVercelDeployments(applicationId)

    if (result.success) {
      if (result.data) {
        const { synced, created, updated } = result.data
        if (synced === 0) {
          toast.info('No deployments found on Vercel')
        } else {
          toast.success(
            `Synced ${synced} deployments (${created} new, ${updated} updated)`
          )
        }
      }
      router.refresh()
    } else {
      toast.error(result.error)
    }

    setIsSyncing(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync Vercel'}
    </Button>
  )
}
