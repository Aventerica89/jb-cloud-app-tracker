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

  // Use database-level relation fetching for better performance
  // Single query fetches providers with their deployments
  const { data: providers, error: providersError } = await supabase
    .from('cloud_providers')
    .select(`
      *,
      deployments(application_id)
    `)
    .order('name')

  if (providersError) throw providersError

  // Transform the response to include counts
  return (providers || []).map(provider => {
    const deployments = (provider.deployments || []) as { application_id: string }[]
    const uniqueApps = new Set(deployments.map(d => d.application_id))

    // Remove the deployments field and add counts
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { deployments: _deps, ...providerData } = provider
    return {
      ...providerData,
      deployment_count: deployments.length,
      app_count: uniqueApps.size,
    }
  })
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
