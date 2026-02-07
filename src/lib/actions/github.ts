'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  GitHubDeployment,
  GitHubDeploymentStatus,
  GitHubRepo,
} from '@/types/database'

const GITHUB_API = 'https://api.github.com'

async function getGitHubToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_settings')
    .select('github_token')
    .eq('user_id', user.id)
    .single()

  return data?.github_token ?? null
}

async function githubFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`GitHub API error ${response.status}: ${body}`)
  }

  return response.json()
}

export async function testGitHubConnection(token: string): Promise<{
  valid: boolean
  username?: string
  error?: string
}> {
  try {
    const user = await githubFetch<{ login: string }>(
      '/user',
      token
    )
    return { valid: true, username: user.login }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

export async function getGitHubRepos(): Promise<GitHubRepo[]> {
  const token = await getGitHubToken()
  if (!token) return []

  try {
    return await githubFetch<GitHubRepo[]>(
      '/user/repos?sort=updated&per_page=100&type=owner'
    , token)
  } catch {
    return []
  }
}

export async function getGitHubDeployments(
  owner: string,
  repo: string
): Promise<Array<{
  deployment: GitHubDeployment
  latestStatus: GitHubDeploymentStatus | null
}>> {
  const token = await getGitHubToken()
  if (!token) return []

  try {
    const deployments = await githubFetch<GitHubDeployment[]>(
      `/repos/${owner}/${repo}/deployments?per_page=30`,
      token
    )

    // Fetch latest status for each deployment in parallel
    const withStatuses = await Promise.all(
      deployments.map(async (deployment) => {
        try {
          const statuses = await githubFetch<GitHubDeploymentStatus[]>(
            `/repos/${owner}/${repo}/deployments/${deployment.id}/statuses?per_page=1`,
            token
          )
          return {
            deployment,
            latestStatus: statuses[0] ?? null,
          }
        } catch {
          return { deployment, latestStatus: null }
        }
      })
    )

    return withStatuses
  } catch {
    return []
  }
}

