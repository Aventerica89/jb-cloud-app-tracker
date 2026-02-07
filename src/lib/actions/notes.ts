'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createNoteSchema, updateNoteSchema } from '@/lib/validations/note'
import type { ActionResult } from '@/types/actions'
import type { AppNote } from '@/types/database'

export async function getNotes(applicationId: string): Promise<AppNote[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('app_notes')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createNote(
  applicationId: string,
  content: string
): Promise<ActionResult<AppNote>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = createNoteSchema.safeParse({
    application_id: applicationId,
    content,
  })
  if (!parsed.success) {
    return { success: false, error: 'Validation failed' }
  }

  const { data, error } = await supabase
    .from('app_notes')
    .insert({
      application_id: applicationId,
      user_id: user.id,
      content: parsed.data.content,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  return { success: true, data }
}

export async function updateNote(
  id: string,
  content: string,
  applicationId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = updateNoteSchema.safeParse({ id, content })
  if (!parsed.success) {
    return { success: false, error: 'Validation failed' }
  }

  const { error } = await supabase
    .from('app_notes')
    .update({ content: parsed.data.content })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  return { success: true }
}

export async function deleteNote(
  id: string,
  applicationId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('app_notes')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  return { success: true }
}
