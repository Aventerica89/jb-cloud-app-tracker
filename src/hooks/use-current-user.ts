'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CurrentUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
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

      if (authUser) {
        const metadata = authUser.user_metadata || {}
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: metadata.full_name || metadata.name || null,
          avatarUrl: metadata.avatar_url || metadata.picture || null,
        })
      }
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {}
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: metadata.full_name || metadata.name || null,
          avatarUrl: metadata.avatar_url || metadata.picture || null,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
