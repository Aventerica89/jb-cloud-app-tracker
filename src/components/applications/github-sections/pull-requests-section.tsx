'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { RelativeTime } from '@/components/ui/relative-time'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ExternalLink, GitPullRequest, MessageSquare } from 'lucide-react'
import { githubPRStateColors, defaultStatusColor } from '@/lib/utils/status-colors'
import type { GitHubPullRequest } from '@/types/github'

interface PullRequestsSectionProps {
  pullRequests: GitHubPullRequest[]
  repoUrl: string
}

function getPRState(pr: GitHubPullRequest): string {
  if (pr.state === 'closed' && pr.merged_at) return 'merged'
  return pr.state
}

export function PullRequestsSection({ pullRequests, repoUrl }: PullRequestsSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Pull Requests</span>
          <Badge variant="secondary" className="text-xs">
            {pullRequests.length}
          </Badge>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-1">
        {pullRequests.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">No pull requests found</p>
        ) : (
          pullRequests.map((pr) => {
            const state = getPRState(pr)
            return (
              <div
                key={pr.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {pr.title}
                    </a>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={githubPRStateColors[state] ?? defaultStatusColor}
                    >
                      {state}
                    </Badge>
                    {pr.draft && (
                      <Badge variant="outline" className="text-xs">
                        draft
                      </Badge>
                    )}
                    {pr.labels.map((label) => (
                      <Badge
                        key={label.name}
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: `#${label.color}15`,
                          borderColor: `#${label.color}40`,
                          color: `#${label.color}`,
                        }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                    {pr.comments > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {pr.comments}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">{pr.user.login}</span>
                  <RelativeTime date={pr.updated_at} className="text-xs text-muted-foreground" />
                </div>
              </div>
            )
          })
        )}
        {pullRequests.length > 0 && (
          <a
            href={`${repoUrl}/pulls`}
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
