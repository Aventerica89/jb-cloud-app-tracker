'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppStatusBadge } from '@/components/ui/status-badge'
import { AppFavicon } from '@/components/applications/app-favicon'
import { cn } from '@/lib/utils'
import { interactiveStates } from '@/lib/design-tokens'
import type { ApplicationWithRelations } from '@/types/database'

interface AppCompactCardProps {
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

export function AppCompactCard({ app }: AppCompactCardProps) {
  const router = useRouter()

  const repoName = app.repository_url ? extractRepoName(app.repository_url) : null
  const displayName = app.display_name || app.name
  const showRepoName = repoName && repoName !== app.name && repoName !== displayName

  return (
    <Card
      className={cn(
        'group',
        interactiveStates.card.base,
        interactiveStates.card.hover,
        interactiveStates.card.focus,
        interactiveStates.card.active
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
      <CardContent className="p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <AppFavicon url={app.live_url || app.repository_url} name={displayName} size={18} />
          <span className="font-medium text-sm truncate flex-1">{displayName}</span>
          <AppStatusBadge status={app.status} size="sm" />
        </div>

        {showRepoName && (
          <p className="text-[10px] text-muted-foreground truncate pl-[26px]">{repoName}</p>
        )}

        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-0.5 pl-[26px]">
            {app.tags.slice(0, 2).map((tag) => (
              <Link
                key={tag.id}
                href={`/applications?tags=${tag.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 h-4 hover:opacity-80"
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
            {app.tags.length > 2 && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                +{app.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
