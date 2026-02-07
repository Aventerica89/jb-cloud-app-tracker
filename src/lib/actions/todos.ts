'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createTodoSchema, updateTodoSchema } from '@/lib/validations/todo'
import type { ActionResult } from '@/types/actions'
import type { AppTodo } from '@/types/database'

export async function getTodos(applicationId: string): Promise<AppTodo[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('app_todos')
    .select('*')
    .eq('application_id', applicationId)
    .order('sort_order')
    .order('created_at')

  if (error) throw error
  return data || []
}

export async function createTodo(
  applicationId: string,
  text: string
): Promise<ActionResult<AppTodo>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = createTodoSchema.safeParse({
    application_id: applicationId,
    text,
  })
  if (!parsed.success) {
    return { success: false, error: 'Validation failed' }
  }

  // Get max sort_order for this app
  const { data: maxData } = await supabase
    .from('app_todos')
    .select('sort_order')
    .eq('application_id', applicationId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxData?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('app_todos')
    .insert({
      application_id: applicationId,
      user_id: user.id,
      text: parsed.data.text,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  return { success: true, data }
}

export async function toggleTodo(
  id: string,
  completed: boolean,
  applicationId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('app_todos')
    .update({ completed })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  return { success: true }
}

export async function updateTodo(
  id: string,
  text: string,
  applicationId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = updateTodoSchema.safeParse({ id, text })
  if (!parsed.success) {
    return { success: false, error: 'Validation failed' }
  }

  const { error } = await supabase
    .from('app_todos')
    .update({ text: parsed.data.text })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  return { success: true }
}

export async function deleteTodo(
  id: string,
  applicationId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('app_todos')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  return { success: true }
}

export async function reorderTodos(
  applicationId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Update each todo's sort_order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('app_todos')
      .update({ sort_order: index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    return { success: false, error: failed.error.message }
  }

  revalidatePath(`/applications/${applicationId}`)
  return { success: true }
}
