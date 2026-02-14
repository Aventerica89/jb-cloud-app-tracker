'use server'

import { Vercel } from '@vercel/sdk'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'

interface CloudflareWorkerInfo {
  scriptName: string
}

type CloudflareWorkerLookup = Record<string, CloudflareWorkerInfo>

interface AutoConnectResult {
  vercel: string[]
  cloudflare: string[]
  workers: string[]
  github: string[]
  alreadyConnected: number
  noRepoUrl: number
}

interface VercelProjectInfo {
  projectId: string
  liveUrl: string
}

interface CloudflareProjectInfo {
  projectName: string
  liveUrl: string
}

type VercelLookup = Record<string, VercelProjectInfo>
type CloudflareLookup = Record<string, CloudflareProjectInfo>

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'
const CF_ACCOUNT_ID_RE = /^[a-f0-9]{32}$/

interface VercelApiProject {
  id: string
  name: string
  link?: {
    type?: string
    repo?: string
  }
  targets?: {
    production?: {
      alias?: string[]
    }
  }
}

interface CloudflareApiProject {
  name: string
  subdomain: string
  domains?: string[]
  source?: {
    config?: {
      repo_name?: string
    }
  }
}

function extractRepoName(url: string): string | null {
  try {
    const pathname = new URL(url).pathname
    const segments = pathname.split('/').filter(Boolean)
    return segments.length >= 2 ? segments[segments.length - 1] : null
  } catch {
    return null
  }
}

function extractOwnerRepo(url: string): string | null {
  try {
    const pathname = new URL(url).pathname
    const segments = pathname.split('/').filter(Boolean)
    return segments.length >= 2 ? `${segments[0]}/${segments[1]}` : null
  } catch {
    return null
  }
}

async function buildVercelLookup(
  token: string,
  teamId: string | null
): Promise<VercelLookup> {
  try {
    const vercel = new Vercel({ bearerToken: token })
    const response = await vercel.projects.getProjects({
      teamId: teamId || undefined,
      limit: '100',
    })

    const projects: VercelApiProject[] = Array.isArray(response)
      ? response
      : ((response as { projects?: VercelApiProject[] }).projects || [])

    const lookup: VercelLookup = {}

    for (const project of projects) {
      const productionAliases = project.targets?.production?.alias || []
      const customAlias = productionAliases.find(
        (a) => !a.endsWith('.vercel.app')
      )
      const liveUrl = customAlias
        ? `https://${customAlias}`
        : productionAliases[0]
          ? `https://${productionAliases[0]}`
          : ''

      const info: VercelProjectInfo = {
        projectId: project.id,
        liveUrl,
      }

      if (project.link?.repo) {
        const repoName = project.link.repo.includes('/')
          ? (project.link.repo.split('/').pop() || project.link.repo)
          : project.link.repo
        lookup[repoName] = info
      }

      if (!lookup[project.name]) {
        lookup[project.name] = info
      }
    }

    return lookup
  } catch (err) {
    console.error(
      'Failed to fetch Vercel projects:',
      err instanceof Error ? err.message : 'Unknown error'
    )
    return {}
  }
}

async function buildCloudflareLookup(
  token: string,
  accountId: string
): Promise<CloudflareLookup> {
  if (!CF_ACCOUNT_ID_RE.test(accountId)) {
    console.error('Invalid Cloudflare account ID format')
    return {}
  }

  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/pages/projects`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Cloudflare API error:', response.status)
      return {}
    }

    const data = await response.json()
    const projects: CloudflareApiProject[] = data.result || []

    const lookup: CloudflareLookup = {}

    for (const project of projects) {
      const liveUrl = project.domains?.[0]
        ? `https://${project.domains[0]}`
        : `https://${project.subdomain}`

      const info: CloudflareProjectInfo = {
        projectName: project.name,
        liveUrl,
      }

      if (project.source?.config?.repo_name) {
        lookup[project.source.config.repo_name] = info
      }

      if (!lookup[project.name]) {
        lookup[project.name] = info
      }
    }

    return lookup
  } catch (err) {
    console.error(
      'Failed to fetch Cloudflare projects:',
      err instanceof Error ? err.message : 'Unknown error'
    )
    return {}
  }
}

async function buildCloudflareWorkerLookup(
  token: string,
  accountId: string
): Promise<CloudflareWorkerLookup> {
  if (!CF_ACCOUNT_ID_RE.test(accountId)) {
    return {}
  }

  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/workers/scripts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Cloudflare Workers API error:', response.status)
      return {}
    }

    const data = await response.json()
    const scripts: Array<{ id: string; script?: string }> = data.result || []

    const lookup: CloudflareWorkerLookup = {}
    for (const script of scripts) {
      const name = script.id
      lookup[name] = { scriptName: name }
    }

    return lookup
  } catch (err) {
    console.error(
      'Failed to fetch Cloudflare Workers:',
      err instanceof Error ? err.message : 'Unknown error'
    )
    return {}
  }
}

export async function autoConnectProviders(): Promise<
  ActionResult<AutoConnectResult>
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: settings } = await supabase
    .from('user_settings')
    .select(
      'vercel_token, vercel_team_id, cloudflare_token, cloudflare_account_id'
    )
    .eq('user_id', user.id)
    .single()

  const hasVercel = !!settings?.vercel_token
  const hasCloudflare =
    !!settings?.cloudflare_token && !!settings?.cloudflare_account_id

  const { data: apps } = await supabase
    .from('applications')
    .select(
      'id, name, repository_url, vercel_project_id, cloudflare_project_name, cloudflare_worker_name, github_repo_name, live_url'
    )
    .eq('user_id', user.id)

  if (!apps || apps.length === 0) {
    return { success: false, error: 'No applications found' }
  }

  const [vercelMap, cloudflareMap, workerMap] = await Promise.all([
    hasVercel && settings?.vercel_token
      ? buildVercelLookup(settings.vercel_token, settings.vercel_team_id)
      : Promise.resolve({} as VercelLookup),
    hasCloudflare && settings?.cloudflare_token && settings?.cloudflare_account_id
      ? buildCloudflareLookup(
          settings.cloudflare_token,
          settings.cloudflare_account_id
        )
      : Promise.resolve({} as CloudflareLookup),
    hasCloudflare && settings?.cloudflare_token && settings?.cloudflare_account_id
      ? buildCloudflareWorkerLookup(
          settings.cloudflare_token,
          settings.cloudflare_account_id
        )
      : Promise.resolve({} as CloudflareWorkerLookup),
  ])

  const vercelConnected: string[] = []
  const cloudflareConnected: string[] = []
  const workersConnected: string[] = []
  const githubConnected: string[] = []
  let alreadyConnected = 0
  let noRepoUrl = 0
  const pendingUpdates: Array<{ id: string; updates: Record<string, string> }> = []

  for (const app of apps) {
    if (!app.repository_url) {
      noRepoUrl++
      continue
    }

    const repoName = extractRepoName(app.repository_url)
    if (!repoName) {
      noRepoUrl++
      continue
    }

    const hasExistingConnection =
      app.vercel_project_id || app.cloudflare_project_name
    const vercelMatch = vercelMap[repoName]
    const cloudflareMatch = cloudflareMap[repoName]

    const updates: Record<string, string> = {}
    let connected = false

    if (vercelMatch && !app.vercel_project_id) {
      updates.vercel_project_id = vercelMatch.projectId
      if (!app.live_url && vercelMatch.liveUrl) {
        updates.live_url = vercelMatch.liveUrl
      }
      connected = true
      vercelConnected.push(app.name)
    }

    if (cloudflareMatch && !app.cloudflare_project_name) {
      updates.cloudflare_project_name = cloudflareMatch.projectName
      if (!app.live_url && !updates.live_url && cloudflareMatch.liveUrl) {
        updates.live_url = cloudflareMatch.liveUrl
      }
      connected = true
      cloudflareConnected.push(app.name)
    }

    const workerMatch = workerMap[repoName]
    if (workerMatch && !app.cloudflare_worker_name) {
      updates.cloudflare_worker_name = workerMatch.scriptName
      connected = true
      workersConnected.push(app.name)
    }

    if (!app.github_repo_name && app.repository_url?.includes('github.com')) {
      const ownerRepo = extractOwnerRepo(app.repository_url)
      if (ownerRepo) {
        updates.github_repo_name = ownerRepo
        connected = true
        githubConnected.push(app.name)
      }
    }

    if (connected) {
      pendingUpdates.push({ id: app.id, updates })
    } else if (hasExistingConnection) {
      alreadyConnected++
    }
  }

  await Promise.allSettled(
    pendingUpdates.map(({ id, updates }) =>
      supabase.from('applications').update(updates).eq('id', id)
    )
  )

  const result: AutoConnectResult = {
    vercel: vercelConnected,
    cloudflare: cloudflareConnected,
    workers: workersConnected,
    github: githubConnected,
    alreadyConnected,
    noRepoUrl,
  }

  revalidatePath('/applications')
  revalidatePath('/dashboard')

  return { success: true, data: result }
}
