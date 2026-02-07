'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { RelativeTime } from '@/components/ui/relative-time'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ExternalLink, Tag } from 'lucide-react'
import type { GitHubRelease } from '@/types/github'

interface ReleasesSectionProps {
  releases: GitHubRelease[]
  repoUrl: string
}

export function ReleasesSection({ releases, repoUrl }: ReleasesSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Releases</span>
          <Badge variant="secondary" className="text-xs">
            {releases.length}
          </Badge>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-1">
        {releases.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">No releases found</p>
        ) : (
          releases.map((release) => {
            const displayName = release.name || release.tag_name
            const bodyPreview = release.body
              ? release.body.slice(0, 200) + (release.body.length > 200 ? '...' : '')
              : null
            const dateStr = release.published_at ?? release.created_at

            return (
              <div
                key={release.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={release.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline"
                    >
                      {release.tag_name}
                    </a>
                    {release.name && release.name !== release.tag_name && (
                      <span className="text-sm text-muted-foreground truncate">
                        {release.name}
                      </span>
                    )}
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {release.prerelease && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs"
                      >
                        pre-release
                      </Badge>
                    )}
                    {release.draft && (
                      <Badge variant="outline" className="text-xs">
                        draft
                      </Badge>
                    )}
                  </div>
                  {bodyPreview && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {bodyPreview}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <RelativeTime date={dateStr} className="text-xs text-muted-foreground" />
                </div>
              </div>
            )
          })
        )}
        {releases.length > 0 && (
          <a
            href={`${repoUrl}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all on GitHub
          </a>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
