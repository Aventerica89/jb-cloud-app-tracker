'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createApplicationSchema,
  updateApplicationSchema,
} from '@/lib/validations/application'
import type { ActionResult } from '@/types/actions'
import type { Application, ApplicationWithRelations } from '@/types/database'

interface GetApplicationsOptions {
  search?: string
  status?: string
}

export async function getApplications(
  options: GetApplicationsOptions = {}
): Promise<ApplicationWithRelations[]> {
  const supabase = await createClient()

  let query = supabase.from('applications').select(
    `
      *,
      application_tags (
        tag:tags (*)
      ),
      deployments (
        *,
        provider:cloud_providers (*),
        environment:environments (*)
      )
    `
  )

  if (options.search) {
    // Sanitize search input to prevent filter injection
    // Escape special PostgREST characters and SQL wildcards
    const sanitizedSearch = options.search
      .replace(/[\\%_]/g, '\\$&')  // Escape SQL wildcards
      .replace(/[(),.:]/g, '')     // Remove PostgREST special chars
    query = query.or(
      `name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`
    )
  }

  if (options.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  const { data, error } = await query.order('updated_at', { ascending: false })

  if (error) throw error

  // Transform nested tags and deployments structure
  return (data || []).map((app) => ({
    ...app,
    tags: app.application_tags?.map((at: { tag: unknown }) => at.tag) || [],
    deployments:
      app.deployments?.map((d: Record<string, unknown>) => ({
        ...d,
        provider: d.provider,
        environment: d.environment,
      })) || [],
  }))
}

export async function getApplication(
  id: string
): Promise<ApplicationWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      *,
      application_tags (
        tag:tags (*)
      ),
      deployments (
        *,
        provider:cloud_providers (*),
        environment:environments (*)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return {
    ...data,
    tags: data.application_tags?.map((at: { tag: unknown }) => at.tag) || [],
    deployments:
      data.deployments?.map((d: Record<string, unknown>) => ({
        ...d,
        provider: d.provider,
        environment: d.environment,
      })) || [],
  }
}

export async function createApplication(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const techStackRaw = formData.get('tech_stack')
  const tagIdsRaw = formData.get('tag_ids')

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    repository_url: formData.get('repository_url') || undefined,
    live_url: formData.get('live_url') || undefined,
    tech_stack: techStackRaw
      ? String(techStackRaw)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    status: formData.get('status') || 'active',
    tag_ids: tagIdsRaw
      ? String(tagIdsRaw)
          .split(',')
          .filter(Boolean)
      : [],
    vercel_project_id: formData.get('vercel_project_id') || undefined,
    cloudflare_project_name: formData.get('cloudflare_project_name') || undefined,
  }

  const parsed = createApplicationSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { tag_ids, vercel_project_id, cloudflare_project_name, live_url, ...applicationData } = parsed.data

  const { data, error } = await supabase
    .from('applications')
    .insert({
      ...applicationData,
      user_id: user.id,
      live_url: live_url || null,
      vercel_project_id: vercel_project_id || null,
      cloudflare_project_name: cloudflare_project_name || null,
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Handle tags
  if (tag_ids.length > 0) {
    const { error: tagError } = await supabase.from('application_tags').insert(
      tag_ids.map((tag_id) => ({
        application_id: data.id,
        tag_id,
      }))
    )
    if (tagError) {
      console.error('Error adding tags:', tagError)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/applications')
  return { success: true, data: { id: data.id } }
}

export async function updateApplication(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const techStackRaw = formData.get('tech_stack')
  const tagIdsRaw = formData.get('tag_ids')

  const rawData = {
    id: formData.get('id'),
    name: formData.get('name') || undefined,
    description: formData.get('description'),
    repository_url: formData.get('repository_url'),
    live_url: formData.get('live_url'),
    tech_stack: techStackRaw
      ? String(techStackRaw)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    status: formData.get('status') || undefined,
    tag_ids: tagIdsRaw !== null
      ? String(tagIdsRaw || '')
          .split(',')
          .filter(Boolean)
      : undefined,
    vercel_project_id: formData.get('vercel_project_id'),
    cloudflare_project_name: formData.get('cloudflare_project_name'),
  }

  const parsed = updateApplicationSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { id, tag_ids, vercel_project_id, cloudflare_project_name, live_url, ...updateData } = parsed.data

  const { error } = await supabase
    .from('applications')
    .update({
      ...updateData,
      live_url: live_url === '' ? null : live_url,
      vercel_project_id: vercel_project_id === '' ? null : vercel_project_id,
      cloudflare_project_name: cloudflare_project_name === '' ? null : cloudflare_project_name,
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Update tags if provided
  if (tag_ids !== undefined) {
    // Remove existing tags
    await supabase.from('application_tags').delete().eq('application_id', id)

    // Add new tags
    if (tag_ids.length > 0) {
      const { error: tagError } = await supabase.from('application_tags').insert(
        tag_ids.map((tag_id) => ({
          application_id: id,
          tag_id,
        }))
      )
      if (tagError) {
        console.error('Error updating tags:', tagError)
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/applications')
  revalidatePath(`/applications/${id}`)
  return { success: true }
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase.from('applications').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/applications')
  return { success: true }
}
