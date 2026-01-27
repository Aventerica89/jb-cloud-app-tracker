'use server'

import { createClient } from '@/lib/supabase/server'
import type { Environment } from '@/types/database'

export async function getEnvironments(): Promise<Environment[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('environments')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error

  return data || []
}

export async function getEnvironment(id: string): Promise<Environment | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('environments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}
