'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/actions'
import type { UserSettings } from '@/types/database'

export async function getUserSettings(): Promise<UserSettings | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function hasVercelToken(): Promise<boolean> {
  const settings = await getUserSettings()
  return !!settings?.vercel_token
}

export async function hasCloudflareToken(): Promise<boolean> {
  const settings = await getUserSettings()
  return !!settings?.cloudflare_token && !!settings?.cloudflare_account_id
}

export async function hasGitHubToken(): Promise<boolean> {
  const settings = await getUserSettings()
  return !!settings?.github_token
}

export async function saveVercelSettings(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const vercelToken = formData.get('vercel_token') as string
  const vercelTeamId = (formData.get('vercel_team_id') as string) || null

  if (!vercelToken) {
    return { success: false, error: 'Vercel token is required' }
  }

  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: user.id,
      vercel_token: vercelToken,
      vercel_team_id: vercelTeamId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/applications')
  return { success: true }
}

export async function deleteVercelSettings(): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('user_settings')
    .update({
      vercel_token: null,
      vercel_team_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/applications')
  return { success: true }
}

export async function saveCloudflareSettings(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const cloudflareToken = formData.get('cloudflare_token') as string
  const cloudflareAccountId = formData.get('cloudflare_account_id') as string

  if (!cloudflareToken || !cloudflareAccountId) {
    return { success: false, error: 'Cloudflare token and account ID are required' }
  }

  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: user.id,
      cloudflare_token: cloudflareToken,
      cloudflare_account_id: cloudflareAccountId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/applications')
  return { success: true }
}

export async function deleteCloudflareSettings(): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('user_settings')
    .update({
      cloudflare_token: null,
      cloudflare_account_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/applications')
  return { success: true }
}

export async function saveGitHubSettings(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const githubToken = formData.get('github_token') as string
  const githubUsername = (formData.get('github_username') as string) || null

  if (!githubToken) {
    return { success: false, error: 'GitHub token is required' }
  }

  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: user.id,
      github_token: githubToken,
      github_username: githubUsername,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/applications')
  return { success: true }
}

export async function deleteGitHubSettings(): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('user_settings')
    .update({
      github_token: null,
      github_username: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/applications')
  return { success: true }
}
