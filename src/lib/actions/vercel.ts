'use server'

import { Vercel } from '@vercel/sdk'
import { createClient } from '@/lib/supabase/server'
import type { VercelProject, VercelDeployment } from '@/types/database'

async function getVercelClient(): Promise<Vercel | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: settings } = await supabase
    .from('user_settings')
    .select('vercel_token, vercel_team_id')
    .eq('user_id', user.id)
    .single()

  if (!settings?.vercel_token) return null

  return new Vercel({
    bearerToken: settings.vercel_token,
  })
}

async function getTeamId(): Promise<string | undefined> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return undefined

  const { data: settings } = await supabase
    .from('user_settings')
    .select('vercel_team_id')
    .eq('user_id', user.id)
    .single()

  return settings?.vercel_team_id || undefined
}

interface VercelProjectResponse {
  id: string
  name: string
  framework?: string | null
  updatedAt?: number
}

interface VercelDeploymentResponse {
  uid: string
  name: string
  url?: string | null
  state?: string
  target?: string | null
  createdAt?: number
  meta?: Record<string, unknown>
}

export async function getVercelProjects(): Promise<VercelProject[]> {
  const vercel = await getVercelClient()
  if (!vercel) return []

  const teamId = await getTeamId()

  const response = await vercel.projects.getProjects({
    teamId,
    limit: '100',
  })

  // The response can be an array directly or have a projects property
  const projects = Array.isArray(response)
    ? response
    : (response as { projects?: VercelProjectResponse[] }).projects || []

  return projects.map((project: VercelProjectResponse) => ({
    id: project.id,
    name: project.name,
    framework: project.framework || null,
    updatedAt: project.updatedAt || Date.now(),
  }))
}

export async function getVercelDeployments(
  projectId: string
): Promise<VercelDeployment[]> {
  const vercel = await getVercelClient()
  if (!vercel) return []

  const teamId = await getTeamId()

  const response = await vercel.deployments.getDeployments({
    projectId,
    teamId,
    limit: 50,
  })

  // The response can be an array directly or have a deployments property
  const deployments = Array.isArray(response)
    ? response
    : (response as { deployments?: VercelDeploymentResponse[] }).deployments || []

  return deployments
    .filter((d: VercelDeploymentResponse) => d.createdAt !== undefined)
    .map((deployment: VercelDeploymentResponse) => ({
      uid: deployment.uid,
      name: deployment.name,
      url: deployment.url || null,
      state: (deployment.state || 'QUEUED') as VercelDeployment['state'],
      target: (deployment.target || null) as VercelDeployment['target'],
      createdAt: deployment.createdAt as number,
      meta: deployment.meta as VercelDeployment['meta'],
    }))
}

export async function testVercelConnection(
  token: string,
  teamId?: string
): Promise<{ success: boolean; error?: string }> {
  const vercel = new Vercel({
    bearerToken: token,
  })

  try {
    await vercel.user.getAuthUser()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to Vercel',
    }
  }
}
