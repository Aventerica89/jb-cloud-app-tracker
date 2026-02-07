'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getGitHubTabData } from '@/lib/actions/github-tab'
import type { GitHubTabData } from '@/types/github'

const POLL_INTERVAL = 60_000

interface UseGitHubPollingOptions {
  owner: string
  repo: string
  enabled: boolean
}

interface UseGitHubPollingResult {
  data: GitHubTabData | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastSyncedAt: string | null
  refresh: () => void
}

export function useGitHubPolling({
  owner,
  repo,
  enabled,
}: UseGitHubPollingOptions): UseGitHubPollingResult {
  const [data, setData] = useState<GitHubTabData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMountedRef = useRef(true)

  const fetchData = useCallback(
    async (isInitial: boolean) => {
      if (!enabled) return

      if (isInitial) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      const result = await getGitHubTabData(owner, repo)

      if (!isMountedRef.current) return

      if (result.success && result.data) {
        setData(result.data)
        setLastSyncedAt(result.data.fetchedAt)
        setError(null)
      } else if (!result.success) {
        setError(result.error)
      }

      setIsLoading(false)
      setIsRefreshing(false)
    },
    [owner, repo, enabled]
  )

  const refresh = useCallback(() => {
    fetchData(false)
  }, [fetchData])

  // Initial fetch + polling
  useEffect(() => {
    isMountedRef.current = true
    if (!enabled) return

    fetchData(true)

    intervalRef.current = setInterval(() => {
      if (!document.hidden) {
        fetchData(false)
      }
    }, POLL_INTERVAL)

    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, fetchData])

  // Resume polling when tab becomes visible
  useEffect(() => {
    if (!enabled) return

    function handleVisibilityChange() {
      if (!document.hidden) {
        fetchData(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, fetchData])

  return { data, isLoading, isRefreshing, error, lastSyncedAt, refresh }
}
