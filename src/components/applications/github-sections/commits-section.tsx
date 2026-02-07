'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { RelativeTime } from '@/components/ui/relative-time'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, GitCommit, ExternalLink } from 'lucide-react'
import type { GitHubCommit } from '@/types/github'

interface CommitsSectionProps {
  commits: GitHubCommit[]
  repoUrl: string
}

export function CommitsSection({ commits, repoUrl }: CommitsSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Recent Commits</span>
          <Badge variant="secondary" className="text-xs">
            {commits.length}
          </Badge>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-1">
        {commits.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">No commits found</p>
        ) : (
          commits.map((commit) => {
            const firstLine = commit.commit.message.split('\n')[0]
            const shortSha = commit.sha.slice(0, 7)
            const authorName = commit.author?.login ?? commit.commit.author.name

            return (
              <div
                key={commit.sha}
                className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm truncate">{firstLine}</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {shortSha}
                    </a>
                    <span className="text-xs text-muted-foreground">{authorName}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <RelativeTime
                    date={commit.commit.author.date}
                    className="text-xs text-muted-foreground"
                  />
                </div>
              </div>
            )
          })
        )}
        {commits.length > 0 && (
          <a
            href={`${repoUrl}/commits`}
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
