'use client'

import { useSyncExternalStore } from 'react'

// Hydration-safe mounted detection
const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

interface LocalTimeProps {
  /**
   * ISO date string or Date object
   */
  date: string | Date

  /**
   * Date formatting options
   */
  options?: Intl.DateTimeFormatOptions

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Fallback text to show during SSR
   */
  fallback?: string
}

const defaultOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}

/**
 * Client-side time display that shows dates in the user's local timezone.
 * Uses hydration-safe mounting to prevent SSR/client mismatch.
 */
export function LocalTime({
  date,
  options = defaultOptions,
  className,
  fallback = '...',
}: LocalTimeProps) {
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const isoString = dateObj.toISOString()

  if (!mounted) {
    return (
      <time className={className} dateTime={isoString}>
        {fallback}
      </time>
    )
  }

  return (
    <time className={className} dateTime={isoString}>
      {dateObj.toLocaleString(undefined, options)}
    </time>
  )
}

/**
 * Relative time display (e.g., "2 hours ago")
 */
export function RelativeTime({
  date,
  className,
}: {
  date: string | Date
  className?: string
}) {
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const isoString = dateObj.toISOString()

  if (!mounted) {
    return (
      <time className={className} dateTime={isoString}>
        ...
      </time>
    )
  }

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  let relativeText: string
  if (diffMins < 1) {
    relativeText = 'just now'
  } else if (diffMins < 60) {
    relativeText = `${diffMins}m ago`
  } else if (diffHours < 24) {
    relativeText = `${diffHours}h ago`
  } else if (diffDays < 7) {
    relativeText = `${diffDays}d ago`
  } else {
    relativeText = dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <time className={className} dateTime={isoString} title={dateObj.toLocaleString()}>
      {relativeText}
    </time>
  )
}
