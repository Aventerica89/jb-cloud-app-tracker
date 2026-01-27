import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, GitBranch, Server } from 'lucide-react'
import type {
  CloudProvider,
  Environment,
  DeploymentStatus,
} from '@/types/database'

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

interface DeploymentCardProps {
  deployment: {
    id: string
    url: string | null
    branch: string | null
    status: DeploymentStatus
    deployed_at: string
    provider: CloudProvider
    environment: Environment
    application: {
      id: string
      name: string
    }
  }
}

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  const envColor =
    environmentColors[deployment.environment.slug] ||
    'bg-gray-500/10 text-gray-500 border-gray-500/20'

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/applications/${deployment.application.id}`}
            className="hover:underline"
          >
            <CardTitle className="text-lg line-clamp-1">
              {deployment.application.name}
            </CardTitle>
          </Link>
          <Badge variant="outline" className={statusColors[deployment.status]}>
            {deployment.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Server className="h-3 w-3" />
            {deployment.provider.name}
          </Badge>
          <Badge variant="outline" className={envColor}>
            {deployment.environment.name}
          </Badge>
        </div>

        {deployment.branch && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <GitBranch className="h-3 w-3" />
            <span className="truncate">{deployment.branch}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {new Date(deployment.deployed_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          {deployment.url && (
            <a
              href={deployment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Visit
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
