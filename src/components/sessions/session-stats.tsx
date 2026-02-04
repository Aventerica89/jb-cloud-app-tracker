'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, GitCommit, Zap, Terminal } from 'lucide-react'

type Props = {
  stats: {
    total_sessions: number
    total_duration_minutes: number
    total_tokens: number
    total_commits: number
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days}d ${remainingHours}h`
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return tokens.toString()
}

export function SessionStats({ stats }: Props) {
  const statCards = [
    {
      title: 'Total Sessions',
      value: stats.total_sessions.toString(),
      icon: Terminal,
      color: 'text-blue-500',
    },
    {
      title: 'Total Time',
      value: formatDuration(stats.total_duration_minutes),
      icon: Clock,
      color: 'text-green-500',
    },
    {
      title: 'Total Commits',
      value: stats.total_commits.toString(),
      icon: GitCommit,
      color: 'text-purple-500',
    },
    {
      title: 'Total Tokens',
      value: formatTokens(stats.total_tokens),
      icon: Zap,
      color: 'text-amber-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
