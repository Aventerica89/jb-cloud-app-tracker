'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, GitBranch, Rocket } from 'lucide-react'
import { RelativeTime } from '@/components/ui/relative-time'
import { EmptyState } from '@/components/ui/empty-state'
import { getProviderIcon } from '@/lib/utils/provider-icons'
import {
  deploymentStatusColors,
  environmentColors,
  defaultStatusColor,
} from '@/lib/utils/status-colors'
import { getApplicationDeployments } from '@/lib/actions/applications'
import { SyncButton } from '@/components/applications/sync-button'
import type { DeploymentWithRelations } from '@/types/database'

interface DeploymentsTabProps {
  applicationId: string
  initialDeployments: DeploymentWithRelations[]
  hasMore: boolean
  hasVercelProject: boolean
  hasCloudflareProject: boolean
  hasGitHubRepo?: boolean
}

export function DeploymentsTab({
  applicationId,
  initialDeployments,
  hasMore: initialHasMore,
  hasVercelProject,
  hasCloudflareProject,
  hasGitHubRepo = false,
}: DeploymentsTabProps) {
  const [deployments, setDeployments] =
    useState<DeploymentWithRelations[]>(initialDeployments)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  function loadMore() {
    const nextPage = page + 1
    startTransition(async () => {
      const result = await getApplicationDeployments(applicationId, nextPage)
      setDeployments((prev) => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setPage(nextPage)
    })
  }

  if (deployments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <SyncButton
            applicationId={applicationId}
            hasVercelProject={hasVercelProject}
            hasCloudflareProject={hasCloudflareProject}
            hasGitHubRepo={hasGitHubRepo}
          />
          <Link href={`/deployments/new?app=${applicationId}`}>
            <Button size="sm">
              <Rocket className="mr-2 h-4 w-4" />
              Add Deployment
            </Button>
          </Link>
        </div>
        <EmptyState
          icon={Rocket}
          title="No deployments yet"
          description="Add a deployment to track where this app is hosted."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SyncButton
          applicationId={applicationId}
          hasVercelProject={hasVercelProject}
          hasCloudflareProject={hasCloudflareProject}
        />
        <Link href={`/deployments/new?app=${applicationId}`}>
          <Button size="sm">
            <Rocket className="mr-2 h-4 w-4" />
            Add Deployment
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {deployments.map((deployment) => {
          const ProviderIcon = getProviderIcon(deployment.provider?.slug || '')
          const envColor =
            environmentColors[deployment.environment?.slug || ''] ||
            defaultStatusColor

          return (
            <div
              key={deployment.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <ProviderIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={envColor}>
                      {deployment.environment?.name}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={deploymentStatusColors[deployment.status]}
                    >
                      {deployment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {deployment.branch && (
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">
                          {deployment.branch}
                        </span>
                      </span>
                    )}
                    <RelativeTime
                      date={deployment.deployed_at}
                      className="text-xs text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
              {deployment.url && (
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline shrink-0 ml-2"
                >
                  Visit
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isPending}
          >
            {isPending ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}
