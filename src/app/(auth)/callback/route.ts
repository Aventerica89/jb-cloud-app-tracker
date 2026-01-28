import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function isValidRedirect(path: string): boolean {
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
  const safeNext = isValidRedirect(next) ? next : '/dashboard'

  if (code) {
    const response = NextResponse.redirect(`${origin}${safeNext}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers.get('cookie')?.split('; ').map(cookie => {
              const [name, value] = cookie.split('=')
              return { name, value }
            }) ?? []
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }

    console.error('OAuth callback error:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
