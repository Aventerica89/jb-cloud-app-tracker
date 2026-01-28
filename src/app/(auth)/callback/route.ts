import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isValidRedirect(path: string): boolean {
  // Must start with / but not // (protocol-relative URL)
  // Must not contain protocol or encoded characters that could bypass validation
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('://') &&
    !path.includes('%2f') &&
    !path.includes('%2F') &&
    !path.includes('\\')
  )
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Validate redirect to prevent open redirect attacks
  const safeNext = isValidRedirect(next) ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
