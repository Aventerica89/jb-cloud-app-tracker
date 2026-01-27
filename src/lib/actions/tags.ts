'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createTagSchema, updateTagSchema } from '@/lib/validations/tag'
import type { ActionResult } from '@/types/actions'
import type { Tag } from '@/types/database'

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function getTag(id: string): Promise<Tag | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createTag(
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
    color: formData.get('color') || '#3b82f6',
  }

  const parsed = createTagSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({ ...parsed.data, user_id: user.id })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A tag with this name already exists' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/tags')
  revalidatePath('/applications')
  return { success: true, data: { id: data.id } }
}

export async function updateTag(formData: FormData): Promise<ActionResult> {
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
    color: formData.get('color') || undefined,
  }

  const parsed = updateTagSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { id, ...updateData } = parsed.data

  const { error } = await supabase.from('tags').update(updateData).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A tag with this name already exists' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/tags')
  revalidatePath('/applications')
  return { success: true }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase.from('tags').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/tags')
  revalidatePath('/applications')
  return { success: true }
}
