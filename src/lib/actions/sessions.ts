'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/actions'
import type { ClaudeSession, ClaudeSessionWithRelations } from '@/types/database'
import {
  createSessionSchema,
  updateSessionSchema,
} from '@/lib/validations/session'

/**
 * Get all sessions for a specific application
 */
export async function getSessions(
  applicationId: string
): Promise<ClaudeSession[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claude_sessions')
    .select('*')
    .eq('application_id', applicationId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    throw new Error('Failed to fetch sessions')
  }

  return data || []
}

/**
 * Get a single session by ID
 */
export async function getSession(id: string): Promise<ClaudeSession | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claude_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching session:', error)
    throw new Error('Failed to fetch session')
  }

  return data
}

/**
 * Get session with application relation
 */
export async function getSessionWithApplication(
  id: string
): Promise<ClaudeSessionWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claude_sessions')
    .select(
      `
      *,
      application:applications (*)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching session:', error)
    throw new Error('Failed to fetch session')
  }

  return data as ClaudeSessionWithRelations
}

/**
 * Get recent sessions across all applications (for dashboard)
 */
export async function getRecentSessions(
  limit: number = 10
): Promise<ClaudeSessionWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claude_sessions')
    .select(
      `
      *,
      application:applications (*)
    `
    )
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent sessions:', error)
    throw new Error('Failed to fetch recent sessions')
  }

  return (data || []) as ClaudeSessionWithRelations[]
}

/**
 * Get session statistics for an application
 */
export async function getSessionStats(applicationId: string): Promise<{
  total_sessions: number
  total_duration_minutes: number
  total_tokens: number
  total_commits: number
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claude_sessions')
    .select('duration_minutes, tokens_total, commits_count')
    .eq('application_id', applicationId)

  if (error) {
    console.error('Error fetching session stats:', error)
    throw new Error('Failed to fetch session stats')
  }

  const stats = (data || []).reduce(
    (acc, session) => ({
      total_sessions: acc.total_sessions + 1,
      total_duration_minutes:
        acc.total_duration_minutes + (session.duration_minutes || 0),
      total_tokens: acc.total_tokens + (session.tokens_total || 0),
      total_commits: acc.total_commits + (session.commits_count || 0),
    }),
    {
      total_sessions: 0,
      total_duration_minutes: 0,
      total_tokens: 0,
      total_commits: 0,
    }
  )

  return stats
}

/**
 * Create a new session
 */
export async function createSession(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Extract and parse JSON fields
  const accomplishmentsRaw = formData.get('accomplishments')
  const nextStepsRaw = formData.get('next_steps')
  const filesChangedRaw = formData.get('files_changed')
  const maintenanceRunsRaw = formData.get('maintenance_runs')
  const securityFindingsRaw = formData.get('security_findings')

  const rawData = {
    application_id: formData.get('application_id'),
    started_at: formData.get('started_at') || new Date().toISOString(),
    ended_at: formData.get('ended_at') || undefined,
    duration_minutes: formData.get('duration_minutes')
      ? Number(formData.get('duration_minutes'))
      : undefined,
    starting_branch: formData.get('starting_branch') || undefined,
    ending_branch: formData.get('ending_branch') || undefined,
    commits_count: formData.get('commits_count')
      ? Number(formData.get('commits_count'))
      : 0,
    context_id: formData.get('context_id') || undefined,
    session_source: formData.get('session_source') || 'claude-code',
    tokens_input: formData.get('tokens_input')
      ? Number(formData.get('tokens_input'))
      : undefined,
    tokens_output: formData.get('tokens_output')
      ? Number(formData.get('tokens_output'))
      : undefined,
    tokens_total: formData.get('tokens_total')
      ? Number(formData.get('tokens_total'))
      : undefined,
    summary: formData.get('summary') || undefined,
    accomplishments: accomplishmentsRaw
      ? JSON.parse(accomplishmentsRaw as string)
      : [],
    next_steps: nextStepsRaw ? JSON.parse(nextStepsRaw as string) : [],
    files_changed: filesChangedRaw ? JSON.parse(filesChangedRaw as string) : [],
    maintenance_runs: maintenanceRunsRaw
      ? JSON.parse(maintenanceRunsRaw as string)
      : [],
    security_findings: securityFindingsRaw
      ? JSON.parse(securityFindingsRaw as string)
      : undefined,
  }

  const parsed = createSessionSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  // Verify user owns the application
  const { data: app, error: appError } = await supabase
    .from('applications')
    .select('id')
    .eq('id', parsed.data.application_id)
    .eq('user_id', user.id)
    .single()

  if (appError || !app) {
    return { success: false, error: 'Application not found or access denied' }
  }

  // Insert
  const { data, error } = await supabase
    .from('claude_sessions')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) {
    console.error('Error creating session:', error)
    return { success: false, error: 'Failed to create session' }
  }

  // Revalidate
  revalidatePath('/dashboard')
  revalidatePath('/applications')
  revalidatePath(`/applications/${parsed.data.application_id}`)
  revalidatePath(`/applications/${parsed.data.application_id}/sessions`)

  return { success: true, data: { id: data.id } }
}

/**
 * Update session
 */
export async function updateSession(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Extract and parse JSON fields
  const accomplishmentsRaw = formData.get('accomplishments')
  const nextStepsRaw = formData.get('next_steps')
  const filesChangedRaw = formData.get('files_changed')
  const maintenanceRunsRaw = formData.get('maintenance_runs')
  const securityFindingsRaw = formData.get('security_findings')

  const rawData = {
    id: formData.get('id'),
    ended_at: formData.get('ended_at') || undefined,
    duration_minutes: formData.get('duration_minutes')
      ? Number(formData.get('duration_minutes'))
      : undefined,
    ending_branch: formData.get('ending_branch') || undefined,
    commits_count: formData.get('commits_count')
      ? Number(formData.get('commits_count'))
      : undefined,
    session_source: formData.get('session_source') || undefined,
    tokens_input: formData.get('tokens_input')
      ? Number(formData.get('tokens_input'))
      : undefined,
    tokens_output: formData.get('tokens_output')
      ? Number(formData.get('tokens_output'))
      : undefined,
    tokens_total: formData.get('tokens_total')
      ? Number(formData.get('tokens_total'))
      : undefined,
    summary: formData.get('summary') || undefined,
    accomplishments: accomplishmentsRaw
      ? JSON.parse(accomplishmentsRaw as string)
      : undefined,
    next_steps: nextStepsRaw ? JSON.parse(nextStepsRaw as string) : undefined,
    files_changed: filesChangedRaw
      ? JSON.parse(filesChangedRaw as string)
      : undefined,
    maintenance_runs: maintenanceRunsRaw
      ? JSON.parse(maintenanceRunsRaw as string)
      : undefined,
    security_findings: securityFindingsRaw
      ? JSON.parse(securityFindingsRaw as string)
      : undefined,
  }

  const parsed = updateSessionSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  // Update
  const { error } = await supabase
    .from('claude_sessions')
    .update(parsed.data)
    .eq('id', parsed.data.id)

  if (error) {
    console.error('Error updating session:', error)
    return { success: false, error: 'Failed to update session' }
  }

  // Get application_id for revalidation
  const { data: session } = await supabase
    .from('claude_sessions')
    .select('application_id')
    .eq('id', parsed.data.id)
    .single()

  if (session) {
    revalidatePath(`/applications/${session.application_id}`)
    revalidatePath(`/applications/${session.application_id}/sessions`)
  }
  revalidatePath('/dashboard')

  return { success: true }
}

/**
 * Delete session
 */
export async function deleteSession(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get application_id before deleting
  const { data: session } = await supabase
    .from('claude_sessions')
    .select('application_id')
    .eq('id', id)
    .single()

  // Delete
  const { error } = await supabase
    .from('claude_sessions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting session:', error)
    return { success: false, error: 'Failed to delete session' }
  }

  // Revalidate
  if (session) {
    revalidatePath(`/applications/${session.application_id}`)
    revalidatePath(`/applications/${session.application_id}/sessions`)
  }
  revalidatePath('/dashboard')

  return { success: true }
}
