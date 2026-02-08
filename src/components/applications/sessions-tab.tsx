'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Terminal } from 'lucide-react'

interface SessionsTabProps {
  applicationId: string
  stats: {
    total_sessions: number
    total_duration_minutes: number
    total_tokens: number
    total_commits: number
  }
}

export function SessionsTab({ applicationId, stats }: SessionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Claude Sessions</h2>
        <Link href={`/applications/${applicationId}/sessions`}>
          <Button variant="outline" size="sm">
            <Terminal className="mr-2 h-4 w-4" />
            View All Sessions
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.total_sessions > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold">{stats.total_sessions}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.total_duration_minutes < 60
                    ? `${stats.total_duration_minutes}m`
                    : `${Math.round(stats.total_duration_minutes / 60)}h`}
                </p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_commits}</p>
                <p className="text-sm text-muted-foreground">Commits</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.total_tokens >= 1000
                    ? `${(stats.total_tokens / 1000).toFixed(0)}K`
                    : stats.total_tokens}
                </p>
                <p className="text-sm text-muted-foreground">Tokens</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No Claude Code sessions recorded yet. Sessions are automatically
              created when you run <code>/end</code> in Claude Code.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
