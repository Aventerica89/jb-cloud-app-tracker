'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createDeploymentSchema,
  updateDeploymentSchema,
} from '@/lib/validations/deployment'
import type { ActionResult } from '@/types/actions'
import type { Deployment, DeploymentWithRelations } from '@/types/database'

interface DeploymentWithApplication extends DeploymentWithRelations {
  application: {
    id: string
    name: string
  }
}

interface GetDeploymentsOptions {
  search?: string
  status?: string
  provider?: string
  environment?: string
  page?: number
  limit?: number
}

interface PaginatedDeployments {
  data: DeploymentWithApplication[]
  total: number
}

export async function getDeployments(
  options: GetDeploymentsOptions = {}
): Promise<PaginatedDeployments> {
  const supabase = await createClient()
  const { search, status, provider, environment, page = 1, limit = 12 } = options

  let query = supabase
    .from('deployments')
    .select(
      `
      *,
      provider:cloud_providers (*),
      environment:environments (*),
      application:applications (id, name)
    `,
      { count: 'exact' }
    )

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (provider && provider !== 'all') {
    query = query.eq('provider_id', provider)
  }

  if (environment && environment !== 'all') {
    // Look up environment ID from slug
    const { data: envData } = await supabase
      .from('environments')
      .select('id')
      .eq('slug', environment)
      .single()
    if (envData) {
      query = query.eq('environment_id', envData.id)
    }
  }

  if (search) {
    const sanitized = search
      .replace(/[\\%_]/g, '\\$&')
      .replace(/[(),.:]/g, '')
    // Look up matching application IDs first
    const { data: matchingApps } = await supabase
      .from('applications')
      .select('id')
      .ilike('name', `%${sanitized}%`)
    if (matchingApps && matchingApps.length > 0) {
      query = query.in(
        'application_id',
        matchingApps.map((a) => a.id)
      )
    } else {
      // No matching apps, return empty
      return { data: [], total: 0 }
    }
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query
    .order('deployed_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    data: (data || []) as DeploymentWithApplication[],
    total: count ?? 0,
  }
}

export async function getDeployment(
  id: string
): Promise<DeploymentWithApplication | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deployments')
    .select(
      `
      *,
      provider:cloud_providers (*),
      environment:environments (*),
      application:applications (id, name)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as DeploymentWithApplication
}

export async function createDeployment(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const rawData = {
    application_id: formData.get('application_id'),
    provider_id: formData.get('provider_id'),
    environment_id: formData.get('environment_id'),
    url: formData.get('url') || '',
    branch: formData.get('branch') || '',
    commit_sha: formData.get('commit_sha') || '',
    status: formData.get('status') || 'deployed',
    deployed_at: formData.get('deployed_at') || new Date().toISOString(),
  }

  const parsed = createDeploymentSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  // Clean up empty strings to null
  const deploymentData = {
    ...parsed.data,
    url: parsed.data.url || null,
    branch: parsed.data.branch || null,
    commit_sha: parsed.data.commit_sha || null,
  }

  const { data, error } = await supabase
    .from('deployments')
    .insert(deploymentData)
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/deployments')
  revalidatePath(`/applications/${parsed.data.application_id}`)
  return { success: true, data: { id: data.id } }
}

export async function updateDeployment(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const rawData = {
    id: formData.get('id'),
    application_id: formData.get('application_id') || undefined,
    provider_id: formData.get('provider_id') || undefined,
    environment_id: formData.get('environment_id') || undefined,
    url: formData.get('url') ?? undefined,
    branch: formData.get('branch') ?? undefined,
    commit_sha: formData.get('commit_sha') ?? undefined,
    status: formData.get('status') || undefined,
    deployed_at: formData.get('deployed_at') || undefined,
  }

  const parsed = updateDeploymentSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { id, ...updateData } = parsed.data

  // Clean up empty strings to null for optional fields
  const cleanData = Object.fromEntries(
    Object.entries(updateData).map(([key, value]) => [
      key,
      value === '' ? null : value,
    ])
  )

  const { error } = await supabase
    .from('deployments')
    .update(cleanData)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/deployments')
  revalidatePath(`/deployments/${id}`)
  if (updateData.application_id) {
    revalidatePath(`/applications/${updateData.application_id}`)
  }
  return { success: true }
}

export async function deleteDeployment(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get the deployment first to know the application_id for revalidation
  const { data: deployment } = await supabase
    .from('deployments')
    .select('application_id')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('deployments').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/deployments')
  if (deployment?.application_id) {
    revalidatePath(`/applications/${deployment.application_id}`)
  }
  return { success: true }
}
