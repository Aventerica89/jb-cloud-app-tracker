'use server'

import { createClient } from '@/lib/supabase/server'

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  provider: string | null
  createdAt: string | null
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Extract user metadata (varies by provider)
  const metadata = user.user_metadata || {}

  // Name can be in different fields depending on provider
  const name = metadata.full_name || metadata.name || metadata.preferred_username || null

  // Avatar URL can be in different fields
  const avatarUrl = metadata.avatar_url || metadata.picture || null

  // Get the provider from identities
  const provider = user.app_metadata?.provider ||
    (user.identities?.[0]?.provider) ||
    null

  return {
    id: user.id,
    email: user.email || '',
    name,
    avatarUrl,
    provider,
    createdAt: user.created_at || null,
  }
}
