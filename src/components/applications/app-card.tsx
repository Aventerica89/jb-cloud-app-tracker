'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppStatusBadge } from '@/components/ui/status-badge'
import { AppFavicon } from '@/components/applications/app-favicon'
import { ProviderLogo } from '@/components/applications/provider-logo'
import { ExternalLink, GitBranch, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interactiveStates } from '@/lib/design-tokens'
import type { ApplicationWithRelations } from '@/types/database'

interface AppCardProps {
  app: ApplicationWithRelations
}

function extractRepoName(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean)
    return parts.length >= 2 ? parts[parts.length - 1] : null
  } catch {
    return null
  }
}

export function AppCard({ app }: AppCardProps) {
  const router = useRouter()

  const repoName = app.repository_url ? extractRepoName(app.repository_url) : null
  const displayName = app.display_name || app.name
  const showRepoName = repoName && repoName !== app.name && repoName !== displayName

  function handleCardClick() {
    router.push(`/applications/${app.id}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.currentTarget !== e.target) return
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
      aria-label={`Application: ${displayName}, Status: ${app.status}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AppFavicon
              url={app.live_url || app.repository_url}
              name={displayName}
              size={22}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg line-clamp-1">{displayName}</CardTitle>
              {showRepoName && (
                <p className="text-xs text-muted-foreground truncate">{repoName}</p>
              )}
            </div>
          </div>
          <AppStatusBadge status={app.status} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {app.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {app.description}
          </p>
        )}

        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {app.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/applications?tags=${tag.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  variant="outline"
                  className="text-xs hover:opacity-80 transition-opacity"
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
            {app.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{app.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
          {/* Provider logos */}
          {app.deployments && app.deployments.length > 0 && (
            <div className="flex items-center gap-1">
              {app.deployments
                .filter((d) => d.provider)
                .reduce(
                  (unique, d) => {
                    if (!unique.find((u) => u.provider?.slug === d.provider?.slug)) {
                      unique.push(d)
                    }
                    return unique
                  },
                  [] as typeof app.deployments
                )
                .slice(0, 3)
                .map((d) => (
                  <Link
                    key={d.provider!.id}
                    href={`/providers`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ProviderLogo
                      slug={d.provider!.slug}
                      name={d.provider!.name}
                      size={14}
                    />
                  </Link>
                ))}
            </div>
          )}

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
