'use client'

import { useMemo } from 'react'
import { useGitHubPolling } from '@/hooks/use-github-polling'
import { GitHubSummaryBar } from '@/components/applications/github-summary-bar'
import { GitHubToolbar } from '@/components/applications/github-toolbar'
import {
  PullRequestsSection,
  IssuesSection,
  CommitsSection,
  ActionsSection,
  ReleasesSection,
} from '@/components/applications/github-sections'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Github, KeyRound } from 'lucide-react'
import type { GitHubSummaryStats } from '@/types/github'

interface GitHubTabProps {
  applicationId: string
  owner: string
  repo: string
  hasGitHubToken: boolean
}

export function GitHubTab({
  applicationId,
  owner,
  repo,
  hasGitHubToken,
}: GitHubTabProps) {
  const { data, isLoading, isRefreshing, error, lastSyncedAt, refresh } =
    useGitHubPolling({
      owner,
      repo,
      enabled: hasGitHubToken,
    })

  const stats = useMemo((): GitHubSummaryStats | null => {
    if (!data) return null

    const latestRun = data.workflowRuns[0] ?? null
    let latestActionStatus: GitHubSummaryStats['latestActionStatus'] = null
    if (latestRun) {
      latestActionStatus =
        latestRun.status !== 'completed'
          ? latestRun.status
          : latestRun.conclusion
    }

    return {
      openPRs: data.pullRequests.filter((pr) => pr.state === 'open').length,
      openIssues: data.issues.filter((i) => i.state === 'open').length,
      latestActionStatus,
      latestRelease: data.releases[0]?.tag_name ?? null,
    }
  }, [data])

  const repoUrl = `https://github.com/${owner}/${repo}`

  if (!hasGitHubToken) {
    return (
      <EmptyState
        icon={KeyRound}
        title="GitHub token required"
        description="Connect your GitHub account to see PRs, issues, commits, actions, and releases."
        action={{ label: 'Go to Settings', href: '/settings' }}
      />
    )
  }

  if (error && !data) {
    return (
      <EmptyState
        icon={Github}
        title="Failed to load GitHub data"
        description={error}
        action={{ label: 'Retry', onClick: refresh }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-28" />
          ))}
        </div>
        <Skeleton className="h-8 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <GitHubSummaryBar stats={stats} isLoading={isLoading} />
      <GitHubToolbar
        lastSyncedAt={lastSyncedAt}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      <div className="space-y-3">
        <PullRequestsSection
          pullRequests={data?.pullRequests ?? []}
          repoUrl={repoUrl}
        />
        <IssuesSection
          issues={data?.issues ?? []}
          repoUrl={repoUrl}
        />
        <CommitsSection
          commits={data?.commits ?? []}
          repoUrl={repoUrl}
        />
        <ActionsSection
          workflowRuns={data?.workflowRuns ?? []}
          repoUrl={repoUrl}
        />
        <ReleasesSection
          releases={data?.releases ?? []}
          repoUrl={repoUrl}
        />
      </div>
    </div>
  )
}
