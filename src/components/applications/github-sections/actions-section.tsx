'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { RelativeTime } from '@/components/ui/relative-time'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ExternalLink, Zap } from 'lucide-react'
import { githubActionStatusColors, defaultStatusColor } from '@/lib/utils/status-colors'
import type { GitHubWorkflowRun } from '@/types/github'

interface ActionsSectionProps {
  workflowRuns: GitHubWorkflowRun[]
  repoUrl: string
}

function getRunStatusLabel(run: GitHubWorkflowRun): string {
  if (run.status !== 'completed') return run.status
  return run.conclusion ?? 'unknown'
}

function getRunStatusColor(run: GitHubWorkflowRun): string {
  const label = getRunStatusLabel(run)
  return githubActionStatusColors[label] ?? defaultStatusColor
}

export function ActionsSection({ workflowRuns, repoUrl }: ActionsSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Actions</span>
          <Badge variant="secondary" className="text-xs">
            {workflowRuns.length}
          </Badge>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-1">
        {workflowRuns.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">No workflow runs found</p>
        ) : (
          workflowRuns.map((run) => {
            const statusLabel = getRunStatusLabel(run)
            return (
              <div
                key={run.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={run.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {run.name}
                    </a>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={getRunStatusColor(run)}>
                      {statusLabel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{run.head_branch}</span>
                    <span className="text-xs text-muted-foreground">#{run.run_number}</span>
                    <span className="text-xs text-muted-foreground">{run.event}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <RelativeTime date={run.created_at} className="text-xs text-muted-foreground" />
                </div>
              </div>
            )
          })
        )}
        {workflowRuns.length > 0 && (
          <a
            href={`${repoUrl}/actions`}
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
