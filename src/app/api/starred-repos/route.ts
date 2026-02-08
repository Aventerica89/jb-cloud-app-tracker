import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get GitHub token from user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('github_token, github_username')
      .eq('user_id', user.id)
      .single()

    if (!settings?.github_token || !settings?.github_username) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 400 }
      )
    }

    // Fetch starred repos from GitHub API
    const response = await fetch(
      `https://api.github.com/users/${settings.github_username}/starred?per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${settings.github_token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const repos = await response.json()

    // Transform the data to include only what we need
    const transformedRepos = repos.map((repo: any) => ({
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      language: repo.language,
    }))

    return NextResponse.json({ repos: transformedRepos })
  } catch (error) {
    console.error('Failed to fetch starred repos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch starred repositories' },
      { status: 500 }
    )
  }
}
