'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  githubPRStateColors,
  githubIssueStateColors,
  githubActionStatusColors,
  defaultStatusColor,
} from '@/lib/utils/status-colors'
import { GitPullRequest, CircleDot, Zap, Tag } from 'lucide-react'
import type { GitHubSummaryStats } from '@/types/github'

interface GitHubSummaryBarProps {
  stats: GitHubSummaryStats | null
  isLoading: boolean
}

export function GitHubSummaryBar({ stats, isLoading }: GitHubSummaryBarProps) {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-7 w-28" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <GitPullRequest className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className={githubPRStateColors.open}>
          {stats.openPRs} open PR{stats.openPRs !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex items-center gap-1.5">
        <CircleDot className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className={githubIssueStateColors.open}>
          {stats.openIssues} open issue{stats.openIssues !== 1 ? 's' : ''}
        </Badge>
      </div>

      {stats.latestActionStatus && (
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant="outline"
            className={githubActionStatusColors[stats.latestActionStatus] ?? defaultStatusColor}
          >
            {stats.latestActionStatus}
          </Badge>
        </div>
      )}

      {stats.latestRelease && (
        <div className="flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">{stats.latestRelease}</Badge>
        </div>
      )}
    </div>
  )
}
