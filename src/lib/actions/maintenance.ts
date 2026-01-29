'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/actions'
import type {
  MaintenanceRunWithRelations,
  MaintenanceCommandType,
  MaintenanceStatusItem,
} from '@/types/database'
import {
  createMaintenanceRunSchema,
  updateMaintenanceRunSchema,
} from '@/lib/validations/maintenance'

/**
 * Get all maintenance command types (reference data)
 */
export async function getMaintenanceCommandTypes(): Promise<
  MaintenanceCommandType[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('maintenance_command_types')
    .select('*')
    .order('sort_order')

  if (error) {
    console.error('Error fetching command types:', error)
    throw new Error('Failed to fetch maintenance command types')
  }

  return data || []
}

/**
 * Get maintenance runs for a specific application
 */
export async function getMaintenanceRuns(
  applicationId: string
): Promise<MaintenanceRunWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('maintenance_runs')
    .select(
      `
      *,
      command_type:maintenance_command_types (*)
    `
    )
    .eq('application_id', applicationId)
    .order('run_at', { ascending: false })

  if (error) {
    console.error('Error fetching maintenance runs:', error)
    throw new Error('Failed to fetch maintenance runs')
  }

  return (
    data?.map((run) => ({
      ...run,
      command_type: run.command_type as unknown as MaintenanceCommandType,
    })) || []
  )
}

/**
 * Get latest maintenance run per command type for an application
 */
export async function getLatestMaintenanceStatus(
  applicationId: string
): Promise<MaintenanceStatusItem[]> {
  const supabase = await createClient()

  // Get all active command types
  const { data: commandTypes, error: typesError } = await supabase
    .from('maintenance_command_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (typesError) {
    console.error('Error fetching command types:', typesError)
    throw new Error('Failed to fetch maintenance command types')
  }

  // Get latest run for each command type
  const { data: runs, error: runsError } = await supabase
    .from('maintenance_runs')
    .select('command_type_id, run_at, status')
    .eq('application_id', applicationId)
    .order('run_at', { ascending: false })

  if (runsError) {
    console.error('Error fetching latest status:', runsError)
    throw new Error('Failed to fetch maintenance status')
  }

  // Group by command_type_id and take the latest
  const latestByType = new Map<string, { run_at: string; status: string }>()
  runs?.forEach((run) => {
    if (!latestByType.has(run.command_type_id)) {
      latestByType.set(run.command_type_id, {
        run_at: run.run_at,
        status: run.status,
      })
    }
  })

  // Build status for each command type
  return (commandTypes || []).map((type) => {
    const latestRun = latestByType.get(type.id)
    const daysSinceRun = latestRun
      ? Math.floor(
          (Date.now() - new Date(latestRun.run_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null

    return {
      command_type: type,
      last_run_at: latestRun?.run_at || null,
      last_status: latestRun?.status || null,
      days_since_run: daysSinceRun,
      is_overdue:
        daysSinceRun !== null &&
        daysSinceRun > type.recommended_frequency_days,
      never_run: !latestRun,
    }
  })
}

/**
 * Create a new maintenance run
 */
export async function createMaintenanceRun(
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

  // Extract and validate
  const resultsRaw = formData.get('results')
  const notesRaw = formData.get('notes')

  const rawData = {
    application_id: formData.get('application_id'),
    command_type_id: formData.get('command_type_id'),
    status: formData.get('status') || 'completed',
    results: resultsRaw
      ? typeof resultsRaw === 'string'
        ? JSON.parse(resultsRaw)
        : resultsRaw
      : undefined,
    notes: notesRaw || undefined,
    run_at: formData.get('run_at') || new Date().toISOString(),
  }

  const parsed = createMaintenanceRunSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  // Verify user owns the application (RLS will also check, but fail fast here)
  const { data: app, error: appError } = await supabase
    .from('applications')
    .select('id')
    .eq('id', parsed.data.application_id)
    .eq('user_id', user.id)
    .single()

  if (appError || !app) {
    return { success: false, error: 'Application not found or access denied' }
  }

  // Insert (no user_id needed - ownership checked through application)
  const { data, error } = await supabase
    .from('maintenance_runs')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) {
    console.error('Error creating maintenance run:', error)
    return { success: false, error: 'Failed to create maintenance run' }
  }

  // Revalidate
  revalidatePath('/dashboard')
  revalidatePath('/applications')
  revalidatePath(`/applications/${parsed.data.application_id}`)

  return { success: true, data: { id: data.id } }
}

/**
 * Update maintenance run
 */
export async function updateMaintenanceRun(
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

  // Extract and validate
  const rawData = {
    id: formData.get('id'),
    status: formData.get('status') || undefined,
    results: formData.get('results') || undefined,
    notes: formData.get('notes') || undefined,
  }

  const parsed = updateMaintenanceRunSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  // Update
  const { error } = await supabase
    .from('maintenance_runs')
    .update(parsed.data)
    .eq('id', parsed.data.id)

  if (error) {
    console.error('Error updating maintenance run:', error)
    return { success: false, error: 'Failed to update maintenance run' }
  }

  // Revalidate (need to get application_id first)
  const { data: run } = await supabase
    .from('maintenance_runs')
    .select('application_id')
    .eq('id', parsed.data.id)
    .single()

  if (run) {
    revalidatePath(`/applications/${run.application_id}`)
  }
  revalidatePath('/dashboard')

  return { success: true }
}

/**
 * Delete maintenance run
 */
export async function deleteMaintenanceRun(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get application_id before deleting
  const { data: run } = await supabase
    .from('maintenance_runs')
    .select('application_id')
    .eq('id', id)
    .single()

  // Delete
  const { error } = await supabase.from('maintenance_runs').delete().eq('id', id)

  if (error) {
    console.error('Error deleting maintenance run:', error)
    return { success: false, error: 'Failed to delete maintenance run' }
  }

  // Revalidate
  if (run) {
    revalidatePath(`/applications/${run.application_id}`)
  }
  revalidatePath('/dashboard')

  return { success: true }
}
