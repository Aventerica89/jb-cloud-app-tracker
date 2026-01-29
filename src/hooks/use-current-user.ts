'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface CurrentUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

function mapAuthUserToCurrentUser(authUser: User | null | undefined): CurrentUser | null {
  if (!authUser) {
    return null
  }
  const metadata = authUser.user_metadata || {}
  return {
    id: authUser.id,
    email: authUser.email || '',
    name: metadata.full_name || metadata.name || metadata.preferred_username || null,
    avatarUrl: metadata.avatar_url || metadata.picture || null,
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      setUser(mapAuthUserToCurrentUser(authUser))
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapAuthUserToCurrentUser(session?.user))
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
