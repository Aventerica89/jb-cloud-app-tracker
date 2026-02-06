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
  Server,
  Calendar,
  Hash,
} from 'lucide-react'
import { getDeployment } from '@/lib/actions/deployments'
import { DeleteDeploymentButton } from '@/components/deployments/delete-deployment-button'
import type { DeploymentStatus } from '@/types/database'

const statusColors: Record<DeploymentStatus, string> = {
  deployed: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  building: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  rolled_back: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

const environmentColors: Record<string, string> = {
  development: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  staging: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  production: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function DeploymentDetailPage({ params }: Props) {
  const { id } = await params
  const deployment = await getDeployment(id)

  if (!deployment) {
    notFound()
  }

  const envColor =
    environmentColors[deployment.environment.slug] ||
    'bg-gray-500/10 text-gray-500 border-gray-500/20'

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${deployment.application.name} Deployment`}
        description={`${deployment.provider.name} - ${deployment.environment.name}`}
      >
        <div className="flex items-center gap-2">
          <Link href="/deployments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Link href={`/deployments/${deployment.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteDeploymentButton
            id={deployment.id}
            applicationName={deployment.application.name}
            providerName={deployment.provider.name}
          />
        </div>
      </Header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Status and environment */}
        <div className="flex flex-wrap items-center gap-4">
          <Badge
            variant="outline"
            className={statusColors[deployment.status]}
          >
            {deployment.status.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className={envColor}>
            {deployment.environment.name}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{deployment.provider.name}</p>
              {deployment.provider.base_url && (
                <a
                  href={deployment.provider.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Visit provider
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Deployed At
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {new Date(deployment.deployed_at).toLocaleDateString(
                  undefined,
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(deployment.deployed_at).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          {deployment.url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {deployment.url}
                </a>
              </CardContent>
            </Card>
          )}

          {deployment.branch && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Branch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium font-mono">{deployment.branch}</p>
                {deployment.commit_sha && (
                  <p className="text-sm text-muted-foreground font-mono">
                    {deployment.commit_sha.substring(0, 7)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!deployment.branch && deployment.commit_sha && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Commit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium font-mono">
                  {deployment.commit_sha.substring(0, 7)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Application link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Application</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/applications/${deployment.application.id}`}
              className="text-primary hover:underline font-medium"
            >
              {deployment.application.name}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
