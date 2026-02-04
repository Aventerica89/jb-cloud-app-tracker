'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, formatDistanceToNow } from 'date-fns'
import {
  GitBranch,
  GitCommit,
  Clock,
  FileText,
  Zap,
  Terminal,
  Globe,
  Shuffle,
} from 'lucide-react'
import type { ClaudeSession } from '@/types/database'

type Props = {
  sessions: ClaudeSession[]
}

const sourceConfig = {
  'claude-code': {
    label: 'Claude Code',
    icon: Terminal,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  'claude-ai': {
    label: 'claude.ai',
    icon: Globe,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  mixed: {
    label: 'Mixed',
    icon: Shuffle,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '-'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function formatTokens(tokens: number | null): string {
  if (!tokens) return '-'
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return tokens.toString()
}

export function SessionList({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>No Claude Code sessions recorded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sessions are automatically created when you run <code>/end</code> in
            Claude Code. They track your development time, commits, and context.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>
          {sessions.length} Claude Code session{sessions.length === 1 ? '' : 's'}{' '}
          recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => {
            const source = sourceConfig[session.session_source]
            const SourceIcon = source.icon

            return (
              <div
                key={session.id}
                className="border rounded-lg p-4 space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {format(new Date(session.started_at), 'PPP')}
                    </span>
                    <Badge variant="outline" className={source.color}>
                      <SourceIcon className="h-3 w-3 mr-1" />
                      {source.label}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(session.started_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Metrics row */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(session.duration_minutes)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <GitCommit className="h-4 w-4" />
                    <span>
                      {session.commits_count}{' '}
                      {session.commits_count === 1 ? 'commit' : 'commits'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>
                      {session.files_changed?.length || 0} files
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>{formatTokens(session.tokens_total)} tokens</span>
                  </div>
                </div>

                {/* Branch info */}
                {(session.starting_branch || session.ending_branch) && (
                  <div className="flex items-center gap-2 text-sm">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs">
                      {session.starting_branch || '?'}
                    </span>
                    {session.ending_branch &&
                      session.ending_branch !== session.starting_branch && (
                        <>
                          <span className="text-muted-foreground">-&gt;</span>
                          <span className="font-mono text-xs">
                            {session.ending_branch}
                          </span>
                        </>
                      )}
                  </div>
                )}

                {/* Summary */}
                {session.summary && (
                  <div className="text-sm text-muted-foreground">
                    {session.summary}
                  </div>
                )}

                {/* Accomplishments */}
                {session.accomplishments && session.accomplishments.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Accomplished
                    </p>
                    <ul className="text-sm space-y-1">
                      {session.accomplishments.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                      {session.accomplishments.length > 3 && (
                        <li className="text-muted-foreground text-xs">
                          +{session.accomplishments.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Maintenance badges */}
                {session.maintenance_runs &&
                  session.maintenance_runs.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Maintenance:
                      </span>
                      <div className="flex gap-1">
                        {session.maintenance_runs.map((runId, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            Run #{i + 1}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
