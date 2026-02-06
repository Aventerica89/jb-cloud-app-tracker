import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { Vercel } from '@vercel/sdk'

interface GitHubRepo {
  name: string
  description: string | null
  url: string
  isPrivate: boolean
  pushedAt: string
  primaryLanguage: { name: string } | null
  topics: string[]
}

interface VercelProjectInfo {
  projectId: string
  liveUrl: string
}

interface CloudflareProjectInfo {
  projectName: string
  liveUrl: string
}

type VercelLookup = Record<string, VercelProjectInfo>
type CloudflareLookup = Record<string, CloudflareProjectInfo>

// GitHub usernames: alphanumeric + hyphens, 1-39 chars, no leading hyphen
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/

// Cloudflare account IDs: 32-char hex string
const CF_ACCOUNT_ID_RE = /^[a-f0-9]{32}$/

// Hardcoded fallback maps for known repos
const HARDCODED_VERCEL: VercelLookup = {
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

const HARDCODED_CLOUDFLARE: CloudflareLookup = {
  'jb-cloud-docs': {
    projectName: 'jb-cloud-docs',
    liveUrl: 'https://docs.jbcloud.app',
  },
  'cf-url-shortener': {
    projectName: 'cf-url-shortener',
    liveUrl: 'https://jb.link',
  },
}

interface UserSettings {
  vercel_token: string | null
  vercel_team_id: string | null
  cloudflare_token: string | null
  cloudflare_account_id: string | null
}

async function getUserSettings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<UserSettings> {
  const { data } = await supabase
    .from('user_settings')
    .select(
      'vercel_token, vercel_team_id, cloudflare_token, cloudflare_account_id'
    )
    .eq('user_id', userId)
    .single()

  return {
    vercel_token: data?.vercel_token ?? null,
    vercel_team_id: data?.vercel_team_id ?? null,
    cloudflare_token: data?.cloudflare_token ?? null,
    cloudflare_account_id: data?.cloudflare_account_id ?? null,
  }
}

interface VercelApiProject {
  id: string
  name: string
  link?: {
    type?: string
    repo?: string
  }
  targets?: {
    production?: {
      alias?: string[]
    }
  }
  alias?: Array<{ domain: string }>
}

async function buildVercelLookup(
  token: string,
  teamId: string | null
): Promise<VercelLookup> {
  try {
    const vercel = new Vercel({ bearerToken: token })
    const response = await vercel.projects.getProjects({
      teamId: teamId || undefined,
      limit: '100',
    })

    const projects: VercelApiProject[] = Array.isArray(response)
      ? response
      : ((response as { projects?: VercelApiProject[] }).projects || [])

    const lookup: VercelLookup = {}

    for (const project of projects) {
      // Extract live URL: prefer custom domain over .vercel.app
      const productionAliases = project.targets?.production?.alias || []
      const customAlias = productionAliases.find(
        (a) => !a.endsWith('.vercel.app')
      )
      const liveUrl = customAlias
        ? `https://${customAlias}`
        : productionAliases[0]
          ? `https://${productionAliases[0]}`
          : ''

      const info: VercelProjectInfo = {
        projectId: project.id,
        liveUrl,
      }

      // Primary key: GitHub repo name from link (strip "owner/" prefix)
      if (project.link?.repo) {
        const repoName = project.link.repo.includes('/')
          ? project.link.repo.split('/').pop()!
          : project.link.repo
        lookup[repoName] = info
      }

      // Fallback key: Vercel project name (only if not already set)
      if (!lookup[project.name]) {
        lookup[project.name] = info
      }
    }

    return lookup
  } catch (err) {
    console.error(
      'Failed to fetch Vercel projects:',
      err instanceof Error ? err.message : 'Unknown error'
    )
    return {}
  }
}

interface CloudflareApiProject {
  name: string
  subdomain: string
  domains?: string[]
  source?: {
    config?: {
      repo_name?: string
    }
  }
}

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

async function buildCloudflareLookup(
  token: string,
  accountId: string
): Promise<CloudflareLookup> {
  if (!CF_ACCOUNT_ID_RE.test(accountId)) {
    console.error('Invalid Cloudflare account ID format')
    return {}
  }

  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/pages/projects`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Cloudflare API error:', response.status)
      return {}
    }

    const data = await response.json()
    const projects: CloudflareApiProject[] = data.result || []

    const lookup: CloudflareLookup = {}

    for (const project of projects) {
      const liveUrl = project.domains?.[0]
        ? `https://${project.domains[0]}`
        : `https://${project.subdomain}`

      const info: CloudflareProjectInfo = {
        projectName: project.name,
        liveUrl,
      }

      // Primary key: GitHub repo name from source config
      if (project.source?.config?.repo_name) {
        lookup[project.source.config.repo_name] = info
      }

      // Fallback key: Cloudflare project name
      if (!lookup[project.name]) {
        lookup[project.name] = info
      }
    }

    return lookup
  } catch (err) {
    console.error(
      'Failed to fetch Cloudflare projects:',
      err instanceof Error ? err.message : 'Unknown error'
    )
    return {}
  }
}

// Determine tech stack from language and repo name
function getTechStack(
  repo: GitHubRepo,
  vercelMap: VercelLookup,
  cloudflareMap: CloudflareLookup
): string[] {
  const stack: string[] = []

  if (repo.primaryLanguage?.name) {
    stack.push(repo.primaryLanguage.name)
  }

  const combined = (
    `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`
  ).toLowerCase()

  if (combined.includes('next') || vercelMap[repo.name]) {
    stack.push('Next.js')
  }
  if (combined.includes('astro')) {
    stack.push('Astro')
  }
  if (combined.includes('react') && !stack.includes('Next.js')) {
    stack.push('React')
  }
  if (
    combined.includes('cloudflare') ||
    combined.includes('worker') ||
    cloudflareMap[repo.name]
  ) {
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
  if (repo.description) {
    return repo.description
  }

  if (!anthropic) {
    return null
  }

  try {
    const topicsStr = repo.topics.join(', ') || 'none'
    const langStr = repo.primaryLanguage?.name || 'unknown language'
    const prompt = [
      `Write a brief 1-sentence description for a GitHub repository`,
      `named "${repo.name}" that uses ${langStr}.`,
      `Topics: ${topicsStr}.`,
      `Be concise and professional, no marketing speak.`,
    ].join(' ')

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text.trim()
    }
  } catch {
    // Ignore AI errors
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
    const { username = 'Aventerica89' } = await request
      .json()
      .catch(() => ({}))

    if (!GITHUB_USERNAME_RE.test(username)) {
      return NextResponse.json(
        { error: 'Invalid GitHub username format' },
        { status: 400 }
      )
    }

    // Fetch user settings and build dynamic lookup maps in parallel
    const settings = await getUserSettings(supabase, user.id)

    const [dynamicVercel, dynamicCloudflare] = await Promise.all([
      settings.vercel_token
        ? buildVercelLookup(settings.vercel_token, settings.vercel_team_id)
        : Promise.resolve({} as VercelLookup),
      settings.cloudflare_token && settings.cloudflare_account_id
        ? buildCloudflareLookup(
            settings.cloudflare_token,
            settings.cloudflare_account_id
          )
        : Promise.resolve({} as CloudflareLookup),
    ])

    // Merge maps: dynamic takes priority over hardcoded
    const vercelMap: VercelLookup = { ...HARDCODED_VERCEL, ...dynamicVercel }
    const cloudflareMap: CloudflareLookup = {
      ...HARDCODED_CLOUDFLARE,
      ...dynamicCloudflare,
    }

    // Track which repos were auto-connected via dynamic lookup
    const autoConnected = {
      vercel: [] as string[],
      cloudflare: [] as string[],
    }

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
      return NextResponse.json(
        { error: 'Failed to fetch GitHub repos' },
        { status: 500 }
      )
    }

    const ghRepos = await ghResponse.json()

    const repos: GitHubRepo[] = ghRepos.map(
      (r: Record<string, unknown>) => ({
        name: r.name as string,
        description: r.description as string | null,
        url: r.html_url as string,
        isPrivate: r.private as boolean,
        pushedAt: r.pushed_at as string,
        primaryLanguage: r.language
          ? { name: r.language as string }
          : null,
        topics: (r.topics as string[]) || [],
      })
    )

    // Get existing applications to avoid duplicates
    const { data: existingApps } = await supabase
      .from('applications')
      .select('repository_url')
      .eq('user_id', user.id)

    const existingUrls = new Set(
      existingApps?.map((a) => a.repository_url) || []
    )

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
      autoConnected,
    }

    for (const repo of repos) {
      if (existingUrls.has(repo.url)) {
        results.skipped.push(`${repo.name} (already exists)`)
        continue
      }

      const vercelProject = vercelMap[repo.name]
      const cloudflareProject = cloudflareMap[repo.name]

      if (repo.isPrivate && !vercelProject && !cloudflareProject) {
        results.skipped.push(`${repo.name} (private, no known deployment)`)
        continue
      }

      try {
        const techStack = getTechStack(repo, vercelMap, cloudflareMap)
        const description = await generateDescription(repo, anthropic)
        const liveUrl =
          vercelProject?.liveUrl || cloudflareProject?.liveUrl || null

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
            cloudflare_project_name:
              cloudflareProject?.projectName || null,
          })
          .select('id')
          .single()

        if (appError) throw appError

        // Track auto-connected repos (matched dynamically, not hardcoded)
        if (vercelProject && !HARDCODED_VERCEL[repo.name]) {
          autoConnected.vercel.push(repo.name)
        }
        if (cloudflareProject && !HARDCODED_CLOUDFLARE[repo.name]) {
          autoConnected.cloudflare.push(repo.name)
        }

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
        results.errors.push(
          `${repo.name}: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
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
