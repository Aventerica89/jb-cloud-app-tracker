'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { syncVercelDeployments, syncCloudflareDeployments } from '@/lib/actions/sync'

interface AutoSyncProps {
  applicationId: string
  hasVercelProject: boolean
  hasCloudflareProject: boolean
}

export function AutoSync({ applicationId, hasVercelProject, hasCloudflareProject }: AutoSyncProps) {
  const router = useRouter()
  const hasSynced = useRef(false)

  useEffect(() => {
    if (hasSynced.current) return
    if (!hasVercelProject && !hasCloudflareProject) return

    hasSynced.current = true

    async function autoSync() {
      const promises: Promise<unknown>[] = []

      if (hasVercelProject) {
        promises.push(syncVercelDeployments(applicationId))
      }

      if (hasCloudflareProject) {
        promises.push(syncCloudflareDeployments(applicationId))
      }

      if (promises.length > 0) {
        await Promise.all(promises)
        router.refresh()
      }
    }

    // Small delay to avoid blocking initial render
    const timeout = setTimeout(autoSync, 500)
    return () => clearTimeout(timeout)
  }, [applicationId, hasVercelProject, hasCloudflareProject, router])

  // This component renders nothing
  return null
}
