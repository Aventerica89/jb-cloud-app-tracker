'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getVercelDeployments } from './vercel'
import { getCloudflareDeployments } from './cloudflare'
import { getGitHubDeployments } from './github'
import { mapGitHubStatus, mapGitHubEnvironment } from '@/lib/utils/github-mappers'
import { getEnvironments } from './environments'
import type { ActionResult } from '@/types/actions'
import type { DeploymentStatus, VercelDeployment, CloudflareDeployment } from '@/types/database'

function mapVercelStateToStatus(state: VercelDeployment['state']): DeploymentStatus {
  switch (state) {
    case 'READY':
      return 'deployed'
    case 'ERROR':
      return 'failed'
    case 'BUILDING':
    case 'INITIALIZING':
      return 'building'
    case 'QUEUED':
      return 'pending'
    case 'CANCELED':
      return 'rolled_back'
    default:
      return 'pending'
  }
}

export async function syncVercelDeployments(
  applicationId: string
): Promise<ActionResult<{ synced: number; created: number; updated: number }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get the application and verify ownership
  const { data: app, error: appError } = await supabase
    .from('applications')
    .select('id, vercel_project_id, user_id')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (appError || !app) {
    return { success: false, error: 'Application not found' }
  }

  if (!app.vercel_project_id) {
    return { success: false, error: 'No Vercel project linked to this application' }
  }

  // Find the Vercel provider for this user
  const { data: vercelProvider, error: providerError } = await supabase
    .from('cloud_providers')
    .select('id')
    .eq('user_id', user.id)
    .eq('slug', 'vercel')
    .single()

  if (providerError || !vercelProvider) {
    return { success: false, error: 'Vercel provider not found. Please ensure you have a Vercel provider configured.' }
  }

  // Get environments for mapping
  const environments = await getEnvironments()
  const productionEnv = environments.find((e) => e.slug === 'production')
  const stagingEnv = environments.find((e) => e.slug === 'staging')

  if (!productionEnv || !stagingEnv) {
    return { success: false, error: 'Required environments not found' }
  }

  // Fetch deployments from Vercel
  const vercelDeployments = await getVercelDeployments(app.vercel_project_id)

  if (vercelDeployments.length === 0) {
    return {
      success: true,
      data: { synced: 0, created: 0, updated: 0 },
    }
  }

  let created = 0
  let updated = 0

  for (const vd of vercelDeployments) {
    const externalId = `vercel:${vd.uid}`
    const environmentId = vd.target === 'production' ? productionEnv.id : stagingEnv.id
    const status = mapVercelStateToStatus(vd.state)
    const deployedAt = new Date(vd.createdAt).toISOString()
    const url = vd.url ? `https://${vd.url}` : null

    // Check if deployment already exists
    const { data: existing } = await supabase
      .from('deployments')
      .select('id, status')
      .eq('application_id', applicationId)
      .eq('external_id', externalId)
      .single()

    if (existing) {
      // Update if status changed
      if (existing.status !== status) {
        await supabase
          .from('deployments')
          .update({
            status,
            url,
            branch: vd.meta?.githubCommitRef || null,
            commit_sha: vd.meta?.githubCommitSha || null,
          })
          .eq('id', existing.id)
        updated++
      }
    } else {
      // Create new deployment
      const { error: insertError } = await supabase.from('deployments').insert({
        application_id: applicationId,
        provider_id: vercelProvider.id,
        environment_id: environmentId,
        external_id: externalId,
        url,
        branch: vd.meta?.githubCommitRef || null,
        commit_sha: vd.meta?.githubCommitSha || null,
        status,
        deployed_at: deployedAt,
      })

      if (!insertError) {
        created++
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/deployments')
  revalidatePath(`/applications/${applicationId}`)

  return {
    success: true,
    data: {
      synced: vercelDeployments.length,
      created,
      updated,
    },
  }
}

function mapCloudflareStageToStatus(stage: CloudflareDeployment['latest_stage']): DeploymentStatus {
  if (stage.name === 'deploy' && stage.status === 'success') {
    return 'deployed'
  }
  if (stage.status === 'failure') {
    return 'failed'
  }
  if (stage.status === 'canceled') {
    return 'rolled_back'
  }
  if (stage.status === 'active') {
    return 'building'
  }
  return 'pending'
}

export async function syncCloudflareDeployments(
  applicationId: string
): Promise<ActionResult<{ synced: number; created: number; updated: number }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get the application and verify ownership
  const { data: app, error: appError } = await supabase
    .from('applications')
    .select('id, cloudflare_project_name, user_id')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (appError || !app) {
    return { success: false, error: 'Application not found' }
  }

  if (!app.cloudflare_project_name) {
    return { success: false, error: 'No Cloudflare project linked to this application' }
  }

  // Find the Cloudflare provider for this user
  const { data: cloudflareProvider, error: providerError } = await supabase
    .from('cloud_providers')
    .select('id')
    .eq('user_id', user.id)
    .eq('slug', 'cloudflare')
    .single()

  if (providerError || !cloudflareProvider) {
    return { success: false, error: 'Cloudflare provider not found. Please ensure you have a Cloudflare provider configured.' }
  }

  // Get environments for mapping
  const environments = await getEnvironments()
  const productionEnv = environments.find((e) => e.slug === 'production')
  const stagingEnv = environments.find((e) => e.slug === 'staging')

  if (!productionEnv || !stagingEnv) {
    return { success: false, error: 'Required environments not found' }
  }

  // Fetch deployments from Cloudflare
  const cloudflareDeployments = await getCloudflareDeployments(app.cloudflare_project_name)

  if (cloudflareDeployments.length === 0) {
    return {
      success: true,
      data: { synced: 0, created: 0, updated: 0 },
    }
  }

  let created = 0
  let updated = 0

  for (const cd of cloudflareDeployments) {
    const externalId = `cloudflare:${cd.id}`
    const environmentId = cd.environment === 'production' ? productionEnv.id : stagingEnv.id
    const status = mapCloudflareStageToStatus(cd.latest_stage)
    const deployedAt = new Date(cd.created_on).toISOString()
    const url = cd.url ? (cd.url.startsWith('http') ? cd.url : `https://${cd.url}`) : null

    // Check if deployment already exists
    const { data: existing } = await supabase
      .from('deployments')
      .select('id, status')
      .eq('application_id', applicationId)
      .eq('external_id', externalId)
      .single()

    if (existing) {
      // Update if status changed
      if (existing.status !== status) {
        await supabase
          .from('deployments')
          .update({
            status,
            url,
            branch: cd.deployment_trigger?.metadata?.branch || null,
            commit_sha: cd.deployment_trigger?.metadata?.commit_hash || null,
          })
          .eq('id', existing.id)
        updated++
      }
    } else {
      // Create new deployment
      const { error: insertError } = await supabase.from('deployments').insert({
        application_id: applicationId,
        provider_id: cloudflareProvider.id,
        environment_id: environmentId,
        external_id: externalId,
        url,
        branch: cd.deployment_trigger?.metadata?.branch || null,
        commit_sha: cd.deployment_trigger?.metadata?.commit_hash || null,
        status,
        deployed_at: deployedAt,
      })

      if (!insertError) {
        created++
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/deployments')
  revalidatePath(`/applications/${applicationId}`)

  return {
    success: true,
    data: {
      synced: cloudflareDeployments.length,
      created,
      updated,
    },
  }
}

export async function syncGitHubDeployments(
  applicationId: string
): Promise<ActionResult<{ synced: number; created: number; updated: number }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: app, error: appError } = await supabase
    .from('applications')
    .select('id, github_repo_name, user_id')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (appError || !app) {
    return { success: false, error: 'Application not found' }
  }

  if (!app.github_repo_name) {
    return { success: false, error: 'No GitHub repo linked' }
  }

  // Find GitHub provider
  const { data: githubProvider } = await supabase
    .from('cloud_providers')
    .select('id')
    .eq('user_id', user.id)
    .eq('slug', 'github')
    .single()

  if (!githubProvider) {
    return { success: false, error: 'GitHub provider not found' }
  }

  const environments = await getEnvironments()
  const envMap: Record<string, string> = {}
  for (const env of environments) {
    envMap[env.slug] = env.id
  }

  const [owner, repo] = app.github_repo_name.split('/')
  if (!owner || !repo) {
    return { success: false, error: 'Invalid repo name format' }
  }

  const ghDeployments = await getGitHubDeployments(owner, repo)

  if (ghDeployments.length === 0) {
    return { success: true, data: { synced: 0, created: 0, updated: 0 } }
  }

  let created = 0
  let updated = 0

  for (const { deployment: gd, latestStatus } of ghDeployments) {
    const externalId = `github:${gd.id}`
    const envSlug = mapGitHubEnvironment(gd.environment)
    const environmentId = envMap[envSlug] || envMap.development
    const status = mapGitHubStatus(latestStatus?.state ?? null)
    const deployedAt = new Date(gd.created_at).toISOString()
    const url = latestStatus?.environment_url ?? null

    const { data: existing } = await supabase
      .from('deployments')
      .select('id, status')
      .eq('application_id', applicationId)
      .eq('external_id', externalId)
      .single()

    if (existing) {
      if (existing.status !== status) {
        await supabase
          .from('deployments')
          .update({ status, url })
          .eq('id', existing.id)
        updated++
      }
    } else {
      const { error: insertError } = await supabase.from('deployments').insert({
        application_id: applicationId,
        provider_id: githubProvider.id,
        environment_id: environmentId,
        external_id: externalId,
        url,
        branch: gd.ref || null,
        commit_sha: gd.sha || null,
        status,
        deployed_at: deployedAt,
      })

      if (!insertError) {
        created++
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/deployments')
  revalidatePath(`/applications/${applicationId}`)

  return {
    success: true,
    data: { synced: ghDeployments.length, created, updated },
  }
}
