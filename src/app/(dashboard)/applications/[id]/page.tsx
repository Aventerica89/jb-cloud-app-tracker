import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Pencil,
  ExternalLink,
  GitBranch,
  Rocket,
} from 'lucide-react'
import { getApplication } from '@/lib/actions/applications'
import { DeleteApplicationButton } from '@/components/applications/delete-app-button'
import { SyncButton } from '@/components/applications/sync-button'
import { AutoSync } from '@/components/applications/auto-sync'

const statusColors = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  archived: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  maintenance: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params
  const app = await getApplication(id)

  if (!app) {
    notFound()
  }

  return (
    <div className="flex flex-col h-full">
      <AutoSync
        applicationId={app.id}
        hasVercelProject={!!app.vercel_project_id}
        hasCloudflareProject={!!app.cloudflare_project_name}
      />
      <Header title={app.name} description={app.description || undefined}>
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

      <div className="flex-1 p-6 space-y-6">
        {/* Status and meta */}
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="outline" className={statusColors[app.status]}>
            {app.status}
          </Badge>

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
        </div>

        {/* Tags */}
        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{
                  backgroundColor: `${tag.color}15`,
                  borderColor: `${tag.color}40`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
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

        {/* Deployments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <div className="flex items-center gap-2">
              <SyncButton
                applicationId={app.id}
                hasVercelProject={!!app.vercel_project_id}
                hasCloudflareProject={!!app.cloudflare_project_name}
              />
              <Link href={`/deployments/new?app=${app.id}`}>
                <Button size="sm">
                  <Rocket className="mr-2 h-4 w-4" />
                  Add Deployment
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {app.deployments && app.deployments.length > 0 ? (
              <div className="space-y-3">
                {app.deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">
                          {deployment.provider?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deployment.environment?.name}
                        </p>
                      </div>
                    </div>
                    {deployment.url && (
                      <a
                        href={deployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Visit
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No deployments yet. Add a deployment to track where this app is
                hosted.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
