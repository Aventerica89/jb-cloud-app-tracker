'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { AppStatusBadge } from '@/components/ui/status-badge'
import { AppFavicon } from '@/components/applications/app-favicon'
import { ProviderLogo } from '@/components/applications/provider-logo'
import { ExternalLink, GitBranch, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interactiveStates } from '@/lib/design-tokens'
import type { ApplicationWithRelations } from '@/types/database'

interface AppListItemProps {
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

export function AppListItem({ app }: AppListItemProps) {
  const router = useRouter()

  const repoName = app.repository_url ? extractRepoName(app.repository_url) : null
  const displayName = app.display_name || app.name
  const showRepoName = repoName && repoName !== app.name && repoName !== displayName

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg border bg-card',
        interactiveStates.card.base,
        interactiveStates.card.hover,
        interactiveStates.card.focus,
        'active:scale-[0.995]'
      )}
      onClick={() => router.push(`/applications/${app.id}`)}
      onKeyDown={(e) => {
        if (e.currentTarget !== e.target) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push(`/applications/${app.id}`)
        }
      }}
      tabIndex={0}
      role="article"
      aria-label={`Application: ${displayName}, Status: ${app.status}`}
    >
      {/* Favicon */}
      <AppFavicon url={app.live_url || app.repository_url} name={displayName} size={28} />

      {/* Name & repo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{displayName}</span>
          {showRepoName && (
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">
              {repoName}
            </span>
          )}
        </div>
        {app.description && (
          <p className="text-xs text-muted-foreground truncate">{app.description}</p>
        )}
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {app.tags?.slice(0, 3).map((tag) => (
          <Link
            key={tag.id}
            href={`/applications?tags=${tag.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 hover:opacity-80"
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
        {app.tags && app.tags.length > 3 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            +{app.tags.length - 3}
          </Badge>
        )}
      </div>

      {/* Provider icons */}
      <div className="hidden lg:flex items-center gap-1.5 shrink-0">
        {app.deployments
          ?.filter((d) => d.provider)
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
            <ProviderLogo
              key={d.provider!.id}
              slug={d.provider!.slug}
              name={d.provider!.name}
              size={16}
            />
          ))}
      </div>

      {/* Status */}
      <AppStatusBadge status={app.status} size="sm" />

      {/* Links */}
      <div className="flex items-center gap-2 shrink-0">
        {app.live_url && (
          <a
            href={app.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary dark:text-orange-400 hover:opacity-70"
            onClick={(e) => e.stopPropagation()}
            aria-label="Live site"
          >
            <Globe className="h-3.5 w-3.5" />
          </a>
        )}
        {app.repository_url && (
          <a
            href={app.repository_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
            aria-label="Repository"
          >
            <GitBranch className="h-3.5 w-3.5" />
          </a>
        )}
        {app.deployments?.find((d) => d.url) && (
          <a
            href={app.deployments.find((d) => d.url)!.url!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary dark:text-orange-400 hover:opacity-70"
            onClick={(e) => e.stopPropagation()}
            aria-label="Deployment"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
