import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import {
  ArrowLeft,
  Pencil,
  ExternalLink,
  GitBranch,
  Globe,
} from 'lucide-react'
import { getApplication, getApplicationDeployments } from '@/lib/actions/applications'
import { getTodos } from '@/lib/actions/todos'
import { getNotes } from '@/lib/actions/notes'
import { ProviderLogo } from '@/components/applications/provider-logo'
import { DeleteApplicationButton } from '@/components/applications/delete-app-button'
import { AutoSync } from '@/components/applications/auto-sync'
import {
  getLatestMaintenanceStatus,
  getMaintenanceRuns,
  getMaintenanceCommandTypes,
} from '@/lib/actions/maintenance'
import { getSessionStats } from '@/lib/actions/sessions'
import { DetailTabs } from '@/components/applications/detail-tabs'
import { DeploymentsTab } from '@/components/applications/deployments-tab'
import { TodosTab } from '@/components/applications/todos-tab'
import { NotesTab } from '@/components/applications/notes-tab'
import { GitHubTab } from '@/components/applications/github-tab'
import { MaintenanceTab } from '@/components/applications/maintenance-tab'
import { SessionsTab } from '@/components/applications/sessions-tab'
import { hasGitHubToken } from '@/lib/actions/settings'
import { appStatusColors } from '@/lib/utils/status-colors'
import { RelativeTime } from '@/components/ui/relative-time'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

function TabsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-80" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}

export default async function ApplicationDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { tab } = await searchParams
  const app = await getApplication(id)

  if (!app) {
    notFound()
  }

  // Fetch all data in parallel with error handling
  const [
    maintenanceStatus,
    maintenanceRuns,
    commandTypes,
    sessionStats,
    { data: initialDeployments, hasMore },
    initialTodos,
    initialNotes,
    hasGitHub,
  ] = await Promise.all([
    getLatestMaintenanceStatus(id).catch((err) => {
      console.error('Failed to fetch maintenance status:', err)
      return []
    }),
    getMaintenanceRuns(id).catch((err) => {
      console.error('Failed to fetch maintenance runs:', err)
      return []
    }),
    getMaintenanceCommandTypes().catch((err) => {
      console.error('Failed to fetch command types:', err)
      return []
    }),
    getSessionStats(id).catch((err) => {
      console.error('Failed to fetch session stats:', err)
      return {
        total_sessions: 0,
        total_duration_minutes: 0,
        total_tokens: 0,
        total_commits: 0,
      }
    }),
    getApplicationDeployments(id),
    getTodos(id),
    getNotes(id),
    hasGitHubToken().catch(() => false),
  ])

  const hasGitHubRepo = !!app.github_repo_name
  const [ghOwner, ghRepo] = app.github_repo_name?.split('/') ?? []

  return (
    <div className="flex flex-col h-full">
      <AutoSync
        applicationId={app.id}
        hasVercelProject={!!app.vercel_project_id}
        hasCloudflareProject={!!app.cloudflare_project_name}
        hasGitHubRepo={hasGitHubRepo}
      />
      <Header title={app.display_name || app.name} description={app.description || undefined}>
        <div className="flex items-center gap-2">
          <Link href="/applications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Link href={`/applications/${app.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteApplicationButton id={app.id} name={app.name} />
        </div>
      </Header>

      {/* App metadata - compact section above tabs */}
      <div className="shrink-0 px-6 py-4 border-b border-border dark:border-orange-500/20 space-y-3">
        {/* Breadcrumb navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/applications">Applications</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{app.display_name || app.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Status, links, tags, and tech stack - single row */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="outline" className={appStatusColors[app.status]}>
            {app.status}
          </Badge>

          {app.live_url && (
            <a
              href={app.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Globe className="h-3.5 w-3.5" />
              {(() => {
                try { return new URL(app.live_url).hostname } catch { return 'Live' }
              })()}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {app.repository_url && (
            <a
              href={app.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Repository
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <RelativeTime
            date={app.updated_at}
            className="text-muted-foreground"
          />

          {/* Tags */}
          {app.tags && app.tags.length > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              {app.tags.map((tag) => (
                <Link key={tag.id} href={`/applications?tags=${tag.id}`}>
                  <Badge
                    variant="outline"
                    className="hover:opacity-80 transition-opacity cursor-pointer text-xs"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      borderColor: `${tag.color}40`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </>
          )}

          {/* Tech Stack */}
          {app.tech_stack && app.tech_stack.length > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              {app.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Full-width tabbed navigation - attached right below metadata */}
      <Suspense fallback={<TabsSkeleton />}>
        <DetailTabs
          appId={app.id}
          deploymentsContent={
            <DeploymentsTab
              applicationId={app.id}
              initialDeployments={initialDeployments}
              hasMore={hasMore}
              hasVercelProject={!!app.vercel_project_id}
              hasCloudflareProject={!!app.cloudflare_project_name}
              hasGitHubRepo={hasGitHubRepo}
            />
          }
          todosContent={
            <TodosTab
              applicationId={app.id}
              initialTodos={initialTodos}
            />
          }
          notesContent={
            <NotesTab
              applicationId={app.id}
              initialNotes={initialNotes}
            />
          }
          githubContent={
            hasGitHubRepo && ghOwner && ghRepo ? (
              <GitHubTab
                applicationId={app.id}
                owner={ghOwner}
                repo={ghRepo}
                hasGitHubToken={hasGitHub}
              />
            ) : undefined
          }
          maintenanceContent={
            <MaintenanceTab
              applicationId={app.id}
              statuses={maintenanceStatus}
              runs={maintenanceRuns}
              commandTypes={commandTypes}
            />
          }
          sessionsContent={
            <SessionsTab
              applicationId={app.id}
              stats={sessionStats}
            />
          }
        />
      </Suspense>
    </div>
  )
}
