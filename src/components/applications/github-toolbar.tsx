'use client'

import { Button } from '@/components/ui/button'
import { RelativeTime } from '@/components/ui/relative-time'
import { RefreshCw } from 'lucide-react'

interface GitHubToolbarProps {
  lastSyncedAt: string | null
  isRefreshing: boolean
  onRefresh: () => void
}

export function GitHubToolbar({ lastSyncedAt, isRefreshing, onRefresh }: GitHubToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-xs font-medium text-green-500">Live</span>
        {lastSyncedAt && (
          <>
            <span className="text-xs text-muted-foreground">Last synced</span>
            <RelativeTime date={lastSyncedAt} className="text-xs text-muted-foreground" />
          </>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  )
}
