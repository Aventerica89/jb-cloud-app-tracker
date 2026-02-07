'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { RelativeTime } from '@/components/ui/relative-time'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, CircleDot, ExternalLink, MessageSquare } from 'lucide-react'
import { githubIssueStateColors, defaultStatusColor } from '@/lib/utils/status-colors'
import type { GitHubIssue } from '@/types/github'

interface IssuesSectionProps {
  issues: GitHubIssue[]
  repoUrl: string
}

export function IssuesSection({ issues, repoUrl }: IssuesSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <CircleDot className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Issues</span>
          <Badge variant="secondary" className="text-xs">
            {issues.length}
          </Badge>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-1">
        {issues.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">No issues found</p>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline truncate"
                  >
                    {issue.title}
                  </a>
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={githubIssueStateColors[issue.state] ?? defaultStatusColor}
                  >
                    {issue.state}
                  </Badge>
                  {issue.labels.map((label) => (
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
                  {issue.assignees.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {issue.assignees.map((a) => a.login).join(', ')}
                    </span>
                  )}
                  {issue.comments > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {issue.comments}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <RelativeTime date={issue.updated_at} className="text-xs text-muted-foreground" />
              </div>
            </div>
          ))
        )}
        {issues.length > 0 && (
          <a
            href={`${repoUrl}/issues`}
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
