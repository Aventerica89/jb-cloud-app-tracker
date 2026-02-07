'use server'

import type { ActionResult } from '@/types/actions'
import type {
  GitHubTabData,
  GitHubPullRequest,
  GitHubIssue,
  GitHubCommit,
  GitHubWorkflowRunsResponse,
  GitHubRelease,
} from '@/types/github'
import { getGitHubToken, githubFetch } from '@/lib/github-client'

export async function getGitHubTabData(
  owner: string,
  repo: string
): Promise<ActionResult<GitHubTabData>> {
  const token = await getGitHubToken()
  if (!token) {
    return { success: false, error: 'No GitHub token configured' }
  }

  const base = `/repos/${owner}/${repo}`

  const [prs, issues, commits, actions, releases] = await Promise.allSettled([
    githubFetch<GitHubPullRequest[]>(
      `${base}/pulls?state=all&per_page=10&sort=updated`,
      token
    ),
    githubFetch<GitHubIssue[]>(
      `${base}/issues?state=all&per_page=10&sort=updated`,
      token
    ),
    githubFetch<GitHubCommit[]>(
      `${base}/commits?per_page=20`,
      token
    ),
    githubFetch<GitHubWorkflowRunsResponse>(
      `${base}/actions/runs?per_page=10`,
      token
    ),
    githubFetch<GitHubRelease[]>(
      `${base}/releases?per_page=5`,
      token
    ),
  ])

  // Filter issues to exclude pull requests
  const rawIssues = issues.status === 'fulfilled' ? issues.value : []
  const filteredIssues = rawIssues.filter((issue) => !issue.pull_request)

  return {
    success: true,
    data: {
      pullRequests: prs.status === 'fulfilled' ? prs.value : [],
      issues: filteredIssues,
      commits: commits.status === 'fulfilled' ? commits.value : [],
      workflowRuns:
        actions.status === 'fulfilled'
          ? actions.value.workflow_runs
          : [],
      releases: releases.status === 'fulfilled' ? releases.value : [],
      fetchedAt: new Date().toISOString(),
    },
  }
}
