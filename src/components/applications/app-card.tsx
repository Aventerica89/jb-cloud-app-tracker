'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppStatusBadge } from '@/components/ui/status-badge'
import { ExternalLink, GitBranch, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interactiveStates } from '@/lib/design-tokens'
import type { ApplicationWithRelations } from '@/types/database'

interface AppCardProps {
  app: ApplicationWithRelations
}

export function AppCard({ app }: AppCardProps) {
  const router = useRouter()

  function handleCardClick() {
    router.push(`/applications/${app.id}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/applications/${app.id}`)
    }
  }

  return (
    <Card
      className={cn(
        'h-full group',
        interactiveStates.card.base,
        interactiveStates.card.hover,
        interactiveStates.card.focus,
        interactiveStates.card.active
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`Application: ${app.name}, Status: ${app.status}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1">{app.name}</CardTitle>
          <AppStatusBadge status={app.status} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {app.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {app.description}
          </p>
        )}

        {app.tech_stack && app.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {app.tech_stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {app.tech_stack.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{app.tech_stack.length - 4}
              </Badge>
            )}
          </div>
        )}

        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {app.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{
                  backgroundColor: `${tag.color}15`,
                  borderColor: `${tag.color}40`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {app.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{app.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
          {app.live_url && (
            <a
              href={app.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-1 text-primary dark:text-orange-400',
                interactiveStates.link.base,
                interactiveStates.link.hover,
                interactiveStates.link.focus
              )}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Visit live site: ${app.live_url}`}
            >
              <Globe className="h-3 w-3" aria-hidden="true" />
              Live
            </a>
          )}
          {app.repository_url && (
            <a
              href={app.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-1',
                interactiveStates.link.base,
                interactiveStates.link.hover,
                interactiveStates.link.focus
              )}
              onClick={(e) => e.stopPropagation()}
              aria-label={`View repository: ${app.repository_url}`}
            >
              <GitBranch className="h-3 w-3" aria-hidden="true" />
              Repo
            </a>
          )}
          {app.deployments && app.deployments.length > 0 && (
            <>
              {app.deployments
                .filter((d) => d.url)
                .slice(0, 2)
                .map((deployment) => (
                  <a
                    key={deployment.id}
                    href={deployment.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-1 text-primary dark:text-orange-400 ml-auto',
                      interactiveStates.link.base,
                      interactiveStates.link.hover,
                      interactiveStates.link.focus
                    )}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open ${deployment.environment?.name || 'deployment'} on ${deployment.provider?.name}`}
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    {deployment.environment?.name || 'Deploy'}
                  </a>
                ))}
              {app.deployments.filter((d) => d.url).length > 2 && (
                <span
                  className="text-primary/70 dark:text-orange-400/70"
                  aria-label={`${app.deployments.filter((d) => d.url).length - 2} more deployments`}
                >
                  +{app.deployments.filter((d) => d.url).length - 2}
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
