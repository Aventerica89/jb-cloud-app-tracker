import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { apiCreateSessionSchema } from '@/lib/validations/session'

// Create a Supabase client with service role key for API access
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

// Verify API token from Authorization header
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
 * GET /api/sessions
 * List sessions for an application
 * Query params: application_id (required)
 */
export async function GET(request: NextRequest) {
  // Verify API token
  if (!verifyApiToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get('application_id')

  if (!applicationId) {
    return NextResponse.json(
      { error: 'application_id is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('claude_sessions')
      .select('*')
      .eq('application_id', applicationId)
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessions: data })
  } catch (err) {
    console.error('Sessions GET error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sessions
 * Create a new session from Claude Code /end command
 */
export async function POST(request: NextRequest) {
  // Verify API token
  if (!verifyApiToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate input
    const parsed = apiCreateSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Verify application exists
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('id', parsed.data.application_id)
      .single()

    if (appError || !app) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Calculate duration if ended_at is provided
    let durationMinutes: number | undefined
    if (parsed.data.ended_at) {
      const startTime = new Date(parsed.data.started_at).getTime()
      const endTime = new Date(parsed.data.ended_at).getTime()
      durationMinutes = Math.round((endTime - startTime) / (1000 * 60))
    }

    // Calculate total tokens if not provided
    let tokensTotal: number | undefined
    if (parsed.data.tokens_input && parsed.data.tokens_output) {
      tokensTotal = parsed.data.tokens_input + parsed.data.tokens_output
    }

    // Insert session
    const { data, error } = await supabase
      .from('claude_sessions')
      .insert({
        ...parsed.data,
        duration_minutes: durationMinutes,
        tokens_total: tokensTotal,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        session_id: data.id,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Sessions POST error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sessions
 * Update an existing session
 * Body: { id: string, ...updates }
 */
export async function PATCH(request: NextRequest) {
  // Verify API token
  if (!verifyApiToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'Session id is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Get current session to calculate duration
    const { data: existing, error: fetchError } = await supabase
      .from('claude_sessions')
      .select('started_at')
      .eq('id', body.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Calculate duration if ending the session
    let durationMinutes: number | undefined
    if (body.ended_at && existing.started_at) {
      const startTime = new Date(existing.started_at).getTime()
      const endTime = new Date(body.ended_at).getTime()
      durationMinutes = Math.round((endTime - startTime) / (1000 * 60))
    }

    // Calculate total tokens if both provided
    let tokensTotal: number | undefined
    if (body.tokens_input && body.tokens_output) {
      tokensTotal = body.tokens_input + body.tokens_output
    }

    // Update session
    const { error } = await supabase
      .from('claude_sessions')
      .update({
        ...body,
        id: undefined, // Don't try to update the ID
        duration_minutes: durationMinutes ?? body.duration_minutes,
        tokens_total: tokensTotal ?? body.tokens_total,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)

    if (error) {
      console.error('Error updating session:', error)
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Sessions PATCH error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
