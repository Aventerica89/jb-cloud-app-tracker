import type { GitHubDeploymentStatus, DeploymentStatus } from '@/types/database'

export function mapGitHubStatus(
  state: GitHubDeploymentStatus['state'] | null
): DeploymentStatus {
  if (!state) return 'pending'

  const mapping: Record<GitHubDeploymentStatus['state'], DeploymentStatus> = {
    success: 'deployed',
    error: 'failed',
    failure: 'failed',
    pending: 'pending',
    queued: 'pending',
    in_progress: 'building',
    inactive: 'rolled_back',
  }

  return mapping[state] ?? 'pending'
}

export function mapGitHubEnvironment(
  env: string
): 'production' | 'staging' | 'development' {
  const lower = env.toLowerCase()
  if (lower.includes('prod')) return 'production'
  if (lower.includes('stag') || lower.includes('preview')) return 'staging'
  return 'development'
}
