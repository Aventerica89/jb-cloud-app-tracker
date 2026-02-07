import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeploymentStatusBadge, EnvironmentBadge } from '@/components/ui/status-badge'
import { ExternalLink, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interactiveStates } from '@/lib/design-tokens'
import { getProviderIcon } from '@/lib/utils/provider-icons'
import { RelativeTime } from '@/components/ui/relative-time'
import type {
  CloudProvider,
  Environment,
  DeploymentStatus,
} from '@/types/database'

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
  const ProviderIcon = getProviderIcon(deployment.provider.slug)

  return (
    <Card
      className={cn(
        interactiveStates.card.base,
        interactiveStates.card.hover
      )}
      role="article"
      aria-label={`Deployment of ${deployment.application.name} to ${deployment.environment.name}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/applications/${deployment.application.id}`}
            className={cn(
              interactiveStates.link.base,
              interactiveStates.link.hover,
              interactiveStates.link.focus
            )}
            aria-label={`View application: ${deployment.application.name}`}
          >
            <CardTitle className="text-lg line-clamp-1">
              {deployment.application.name}
            </CardTitle>
          </Link>
          <DeploymentStatusBadge status={deployment.status} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <ProviderIcon className="h-3 w-3" />
            {deployment.provider.name}
          </Badge>
          <EnvironmentBadge
            environment={deployment.environment.slug}
            label={deployment.environment.name}
            size="sm"
          />
        </div>

        {deployment.branch && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <GitBranch className="h-3 w-3" aria-hidden="true" />
            <span className="truncate" aria-label={`Branch: ${deployment.branch}`}>
              {deployment.branch}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <RelativeTime
            date={deployment.deployed_at}
            className="text-xs text-muted-foreground"
          />

          {deployment.url && (
            <a
              href={deployment.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-1 text-sm text-primary',
                interactiveStates.link.base,
                interactiveStates.link.hover,
                interactiveStates.link.focus
              )}
              aria-label={`Visit deployment: ${deployment.url}`}
            >
              Visit
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
