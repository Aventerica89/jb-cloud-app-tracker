'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { syncVercelDeployments, syncCloudflareDeployments, syncGitHubDeployments } from '@/lib/actions/sync'

interface AutoSyncProps {
  applicationId: string
  hasVercelProject: boolean
  hasCloudflareProject: boolean
  hasGitHubRepo?: boolean
}

export function AutoSync({
  applicationId,
  hasVercelProject,
  hasCloudflareProject,
  hasGitHubRepo = false,
}: AutoSyncProps) {
  const router = useRouter()
  const hasSynced = useRef(false)

  useEffect(() => {
    if (hasSynced.current) return
    if (!hasVercelProject && !hasCloudflareProject && !hasGitHubRepo) return

    hasSynced.current = true

    async function autoSync() {
      const promises: Promise<unknown>[] = []

      if (hasVercelProject) {
        promises.push(syncVercelDeployments(applicationId))
      }

      if (hasCloudflareProject) {
        promises.push(syncCloudflareDeployments(applicationId))
      }

      if (hasGitHubRepo) {
        promises.push(syncGitHubDeployments(applicationId))
      }

      if (promises.length > 0) {
        await Promise.all(promises)
        router.refresh()
      }
    }

    const timeout = setTimeout(autoSync, 500)
    return () => clearTimeout(timeout)
  }, [applicationId, hasVercelProject, hasCloudflareProject, hasGitHubRepo, router])

  return null
}
