import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

interface GitHubRepo {
  name: string
  description: string | null
  url: string
  isPrivate: boolean
  pushedAt: string
  primaryLanguage: { name: string } | null
  topics: string[]
}

// Map of known repos to their Vercel project IDs and live URLs
const VERCEL_PROJECTS: Record<string, { projectId: string; liveUrl: string }> = {
  'jb-cloud-app-tracker': {
    projectId: 'prj_ayujWJxysqauv5djgo9LmMoMqc66',
    liveUrl: 'https://apps.jbcloud.app',
  },
  'jb-cloud-wp-manager': {
    projectId: 'prj_pA1EhEsoeosEQVz5JBBYYGr1pIbW',
    liveUrl: 'https://wp.jbcloud.app',
  },
  'med-spa-ranker': {
    projectId: 'prj_Hg3zIym5rLLRvCPfE5MExwRZ0AIm',
    liveUrl: 'https://astra.agency',
  },
}

// Map of known repos to their Cloudflare project names and live URLs
const CLOUDFLARE_PROJECTS: Record<string, { projectName: string; liveUrl: string }> = {
  'jb-cloud-docs': {
    projectName: 'jb-cloud-docs',
    liveUrl: 'https://docs.jbcloud.app',
  },
  'cf-url-shortener': {
    projectName: 'cf-url-shortener',
    liveUrl: 'https://jb.link',
  },
}

// Determine tech stack from language and repo name
function getTechStack(repo: GitHubRepo): string[] {
  const stack: string[] = []

  if (repo.primaryLanguage?.name) {
    stack.push(repo.primaryLanguage.name)
  }

  // Infer frameworks from repo names/descriptions
  const combined = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase()

  if (combined.includes('next') || VERCEL_PROJECTS[repo.name]) {
    stack.push('Next.js')
  }
  if (combined.includes('astro')) {
    stack.push('Astro')
  }
  if (combined.includes('react') && !stack.includes('Next.js')) {
    stack.push('React')
  }
  if (combined.includes('cloudflare') || combined.includes('worker') || CLOUDFLARE_PROJECTS[repo.name]) {
    stack.push('Cloudflare')
  }
  if (combined.includes('supabase')) {
    stack.push('Supabase')
  }
  if (combined.includes('swift') || repo.primaryLanguage?.name === 'Swift') {
    stack.push('macOS')
  }

  return [...new Set(stack)]
}

// Generate AI description for a repo
async function generateDescription(
  repo: GitHubRepo,
  anthropic: Anthropic | null
): Promise<string | null> {
  // If repo already has a description, use it
  if (repo.description) {
    return repo.description
  }

  // If no Anthropic client, return null
  if (!anthropic) {
    return null
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Write a brief 1-sentence description for a GitHub repository named "${repo.name}" that uses ${repo.primaryLanguage?.name || 'unknown language'}. Topics: ${repo.topics.join(', ') || 'none'}. Be concise and professional, no marketing speak.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text.trim()
    }
  } catch {
    // Ignore AI errors, just return null
  }

  return null
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Initialize Anthropic client if API key is available
  let anthropic: Anthropic | null = null
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }

  try {
    // Get GitHub username from request or use default
    const { username = 'Aventerica89' } = await request.json().catch(() => ({}))

    // Fetch repos from GitHub API
    const ghResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'jb-cloud-app-tracker',
        },
      }
    )

    if (!ghResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch GitHub repos' }, { status: 500 })
    }

    const ghRepos = await ghResponse.json()

    // Transform to our format
    const repos: GitHubRepo[] = ghRepos.map((r: Record<string, unknown>) => ({
      name: r.name as string,
      description: r.description as string | null,
      url: r.html_url as string,
      isPrivate: r.private as boolean,
      pushedAt: r.pushed_at as string,
      primaryLanguage: r.language ? { name: r.language as string } : null,
      topics: (r.topics as string[]) || [],
    }))

    // Get existing applications to avoid duplicates
    const { data: existingApps } = await supabase
      .from('applications')
      .select('repository_url')
      .eq('user_id', user.id)

    const existingUrls = new Set(existingApps?.map((a) => a.repository_url) || [])

    // Create or get tags
    const tagColors: Record<string, string> = {
      TypeScript: '#3178c6',
      JavaScript: '#f7df1e',
      'Next.js': '#000000',
      React: '#61dafb',
      Astro: '#ff5d01',
      Swift: '#fa7343',
      Cloudflare: '#f38020',
      Supabase: '#3ecf8e',
      MDX: '#fcb32c',
      Shell: '#89e051',
      macOS: '#000000',
    }

    const tagCache = new Map<string, string>()

    const userId = user.id

    async function getOrCreateTag(name: string): Promise<string> {
      if (tagCache.has(name)) return tagCache.get(name)!

      // Check if exists
      const { data: existing } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', userId)
        .eq('name', name)
        .single()

      if (existing) {
        tagCache.set(name, existing.id)
        return existing.id
      }

      // Create new tag
      const { data: newTag } = await supabase
        .from('tags')
        .insert({
          user_id: userId,
          name,
          color: tagColors[name] || '#6b7280',
        })
        .select('id')
        .single()

      if (newTag) {
        tagCache.set(name, newTag.id)
        return newTag.id
      }

      throw new Error(`Failed to create tag: ${name}`)
    }

    const results = {
      imported: [] as string[],
      skipped: [] as string[],
      errors: [] as string[],
    }

    // Import each repo
    for (const repo of repos) {
      // Skip if already exists
      if (existingUrls.has(repo.url)) {
        results.skipped.push(`${repo.name} (already exists)`)
        continue
      }

      // Get deployment info
      const vercelProject = VERCEL_PROJECTS[repo.name]
      const cloudflareProject = CLOUDFLARE_PROJECTS[repo.name]

      // Skip private repos without deployment config
      if (repo.isPrivate && !vercelProject && !cloudflareProject) {
        results.skipped.push(`${repo.name} (private, no known deployment)`)
        continue
      }

      try {
        const techStack = getTechStack(repo)

        // Generate description if missing
        const description = await generateDescription(repo, anthropic)

        // Determine live URL
        const liveUrl = vercelProject?.liveUrl || cloudflareProject?.liveUrl || null

        // Create application
        const { data: app, error: appError } = await supabase
          .from('applications')
          .insert({
            user_id: user.id,
            name: repo.name,
            description,
            repository_url: repo.url,
            live_url: liveUrl,
            tech_stack: techStack,
            status: 'active',
            vercel_project_id: vercelProject?.projectId || null,
            cloudflare_project_name: cloudflareProject?.projectName || null,
          })
          .select('id')
          .single()

        if (appError) throw appError

        // Add tags
        for (const tech of techStack) {
          try {
            const tagId = await getOrCreateTag(tech)
            await supabase.from('application_tags').insert({
              application_id: app.id,
              tag_id: tagId,
            })
          } catch {
            // Ignore tag errors
          }
        }

        results.imported.push(repo.name)
      } catch (err) {
        results.errors.push(`${repo.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Import failed' },
      { status: 500 }
    )
  }
}
