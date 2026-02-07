// GitHub API response types for the GitHub tab

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  draft: boolean
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
  labels: Array<{
    name: string
    color: string
  }>
  created_at: string
  updated_at: string
  merged_at: string | null
  comments: number
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
  labels: Array<{
    name: string
    color: string
  }>
  assignees: Array<{
    login: string
    avatar_url: string
  }>
  comments: number
  created_at: string
  updated_at: string
  pull_request?: { url: string }
}

export interface GitHubCommit {
  sha: string
  html_url: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
  } | null
}

export interface GitHubWorkflowRun {
  id: number
  name: string
  head_branch: string
  run_number: number
  event: string
  status: 'queued' | 'in_progress' | 'completed'
  conclusion:
    | 'success'
    | 'failure'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null
  html_url: string
  created_at: string
  updated_at: string
}

export interface GitHubWorkflowRunsResponse {
  total_count: number
  workflow_runs: GitHubWorkflowRun[]
}

export interface GitHubRelease {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  draft: boolean
  prerelease: boolean
  html_url: string
  published_at: string | null
  created_at: string
  author: {
    login: string
    avatar_url: string
  }
}

export interface GitHubTabData {
  pullRequests: GitHubPullRequest[]
  issues: GitHubIssue[]
  commits: GitHubCommit[]
  workflowRuns: GitHubWorkflowRun[]
  releases: GitHubRelease[]
  fetchedAt: string
}

export interface GitHubSummaryStats {
  openPRs: number
  openIssues: number
  latestActionStatus: GitHubWorkflowRun['conclusion'] | 'in_progress' | 'queued' | null
  latestRelease: string | null
}
