'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createProviderSchema, updateProviderSchema } from '@/lib/validations/provider'
import type { ActionResult } from '@/types/actions'
import type { CloudProvider } from '@/types/database'

export async function getProviders(): Promise<CloudProvider[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cloud_providers')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export type ProviderWithCounts = CloudProvider & {
  deployment_count: number
  app_count: number
}

export async function getProvidersWithCounts(): Promise<ProviderWithCounts[]> {
  const supabase = await createClient()

  // Get providers with deployment counts
  const { data: providers, error: providersError } = await supabase
    .from('cloud_providers')
    .select('*')
    .order('name')

  if (providersError) throw providersError

  // Get deployment counts per provider
  const { data: deploymentCounts, error: deploymentError } = await supabase
    .from('deployments')
    .select('provider_id, application_id')

  if (deploymentError) throw deploymentError

  // Calculate counts for each provider
  const providerStats = new Map<string, { deployments: number; apps: Set<string> }>()

  for (const deployment of deploymentCounts || []) {
    if (!providerStats.has(deployment.provider_id)) {
      providerStats.set(deployment.provider_id, { deployments: 0, apps: new Set() })
    }
    const stats = providerStats.get(deployment.provider_id)!
    stats.deployments++
    stats.apps.add(deployment.application_id)
  }

  return (providers || []).map(provider => ({
    ...provider,
    deployment_count: providerStats.get(provider.id)?.deployments || 0,
    app_count: providerStats.get(provider.id)?.apps.size || 0,
  }))
}

export async function getProvider(id: string): Promise<CloudProvider | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cloud_providers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createProvider(
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
    name: formData.get('name'),
    slug: formData.get('slug'),
    icon_name: formData.get('icon_name') || undefined,
    base_url: formData.get('base_url') || undefined,
  }

  const parsed = createProviderSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await supabase
    .from('cloud_providers')
    .insert({ ...parsed.data, user_id: user.id })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A provider with this slug already exists' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/providers')
  return { success: true, data: { id: data.id } }
}

export async function updateProvider(
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
    name: formData.get('name') || undefined,
    slug: formData.get('slug') || undefined,
    icon_name: formData.get('icon_name'),
    base_url: formData.get('base_url'),
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = updateProviderSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { id, ...updateData } = parsed.data

  const { error } = await supabase
    .from('cloud_providers')
    .update(updateData)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A provider with this slug already exists' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/providers')
  return { success: true }
}

export async function deleteProvider(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('cloud_providers')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return { success: false, error: 'Cannot delete provider with existing deployments' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/providers')
  return { success: true }
}
