import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

function verifyApiToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice(7)
  const validToken = process.env.CLAUDE_CODE_API_TOKEN

  if (!validToken) {
    console.error('CLAUDE_CODE_API_TOKEN not configured')
    return false
  }

  return token === validToken
}

/**
 * GET /api/applications
 * Returns a slim list of all applications for cross-app integration.
 * Auth: Bearer CLAUDE_CODE_API_TOKEN
 */
export async function GET(request: NextRequest) {
  if (!verifyApiToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('applications')
      .select('id, name, status, tech_stack, live_url, repository_url')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ applications: data })
  } catch (err) {
    console.error('Applications GET error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
