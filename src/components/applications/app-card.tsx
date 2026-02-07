'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppStatusBadge } from '@/components/ui/status-badge'
import { AppFavicon } from '@/components/applications/app-favicon'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ExternalLink, GitBranch, Globe, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interactiveStates } from '@/lib/design-tokens'
import type { ApplicationWithRelations } from '@/types/database'
import { getProviderIcon } from '@/lib/utils/provider-icons'
import { RelativeTime } from '@/components/ui/relative-time'

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

function getUniqueProviders(
  deployments: ApplicationWithRelations['deployments']
) {
  const seen = new Set<string>()
  return deployments.reduce<Array<{ slug: string; name: string }>>(
    (acc, d) => {
      const slug = (d.provider as { slug: string })?.slug
      if (slug && !seen.has(slug)) {
        seen.add(slug)
        acc.push({ slug, name: (d.provider as { name: string })?.name })
      }
      return acc
    },
    []
  )
}

function getProductionUrl(
  deployments: ApplicationWithRelations['deployments']
): string | null {
  const prodDeployment = deployments.find(
    (d) =>
      (d.environment as { slug: string })?.slug === 'production' &&
      d.status === 'deployed' &&
      d.url
  )
  return prodDeployment?.url ?? null
}

export function AppCard({ app }: AppCardProps) {
  const router = useRouter()
  const uniqueProviders = getUniqueProviders(app.deployments)
  const productionUrl = getProductionUrl(app.deployments)

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
    <TooltipProvider>
      <Card
        className={cn(
          'h-full group flex flex-col',
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
        <CardContent className="space-y-3 flex-1 flex flex-col">
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

          {/* Provider icons */}
          {uniqueProviders.length > 0 && (
            <div className="flex items-center gap-1.5">
              {uniqueProviders.slice(0, 4).map(({ slug, name }) => {
                const Icon = getProviderIcon(slug)
                return (
                  <Tooltip key={slug}>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{name}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
              {uniqueProviders.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{uniqueProviders.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Quick links + deployment count */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-auto mt-auto">
            {app.live_url && (
              <Tooltip>
                <TooltipTrigger asChild>
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
                  >
                    <Globe className="h-3 w-3" />
                    Live
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{app.live_url}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {app.repository_url && (
              <Tooltip>
                <TooltipTrigger asChild>
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
                  >
                    <GitBranch className="h-3 w-3" />
                    Repo
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{app.repository_url}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {productionUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={productionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-1',
                      interactiveStates.link.base,
                      interactiveStates.link.hover,
                      interactiveStates.link.focus
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Prod
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{productionUrl}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {app.deployments && app.deployments.length > 0 && (
              <span className="flex items-center gap-1">
                <Rocket className="h-3 w-3" />
                {app.deployments.length}
              </span>
            )}
          </div>

          {/* Relative time */}
          <div className="text-xs text-muted-foreground">
            <RelativeTime
              date={app.updated_at}
              className="text-xs text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
