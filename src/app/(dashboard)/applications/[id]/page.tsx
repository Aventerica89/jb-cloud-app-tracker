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
  Rocket,
  Terminal,
} from 'lucide-react'
import { getApplication, getApplicationDeployments } from '@/lib/actions/applications'
import { getTodos } from '@/lib/actions/todos'
import { getNotes } from '@/lib/actions/notes'
import { ProviderLogo } from '@/components/applications/provider-logo'
import { DeleteApplicationButton } from '@/components/applications/delete-app-button'
import { AutoSync } from '@/components/applications/auto-sync'
import { MaintenanceChecklist } from '@/components/maintenance/maintenance-checklist'
import { MaintenanceHistory } from '@/components/maintenance/maintenance-history'
import { AddMaintenanceRunDialog } from '@/components/maintenance/add-maintenance-run-dialog'
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

      <div className="flex-1 overflow-auto p-6 space-y-6">
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

        {/* Status, links, and meta */}
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="outline" className={appStatusColors[app.status]}>
            {app.status}
          </Badge>

          {app.live_url && (
            <a
              href={app.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Globe className="h-4 w-4" />
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
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <GitBranch className="h-4 w-4" />
              Repository
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <RelativeTime
            date={app.updated_at}
            className="text-sm text-muted-foreground"
          />
        </div>

        {/* Tags - clickable, link to filtered applications */}
        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <Link key={tag.id} href={`/applications?tags=${tag.id}`}>
                <Badge
                  variant="outline"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
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
          </div>
        )}

        {/* Tech Stack */}
        {app.tech_stack && app.tech_stack.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {app.tech_stack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabbed content - deployments/todos/notes */}
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
          />
        </Suspense>

        {/* Maintenance */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Maintenance</h2>
          <AddMaintenanceRunDialog
            applicationId={app.id}
            commandTypes={commandTypes}
          />
        </div>

        <MaintenanceChecklist
          applicationId={app.id}
          statuses={maintenanceStatus}
        />

        <MaintenanceHistory runs={maintenanceRuns} />

        {/* Sessions */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Claude Sessions</h2>
          <Link href={`/applications/${app.id}/sessions`}>
            <Button variant="outline" size="sm">
              <Terminal className="mr-2 h-4 w-4" />
              View All Sessions
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Session Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionStats.total_sessions > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold">{sessionStats.total_sessions}</p>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sessionStats.total_duration_minutes < 60
                      ? `${sessionStats.total_duration_minutes}m`
                      : `${Math.round(sessionStats.total_duration_minutes / 60)}h`}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{sessionStats.total_commits}</p>
                  <p className="text-sm text-muted-foreground">Commits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sessionStats.total_tokens >= 1000
                      ? `${(sessionStats.total_tokens / 1000).toFixed(0)}K`
                      : sessionStats.total_tokens}
                  </p>
                  <p className="text-sm text-muted-foreground">Tokens</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No Claude Code sessions recorded yet. Sessions are automatically
                created when you run <code>/end</code> in Claude Code.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
