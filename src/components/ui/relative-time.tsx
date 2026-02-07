'use client'

import { useEffect, useState } from 'react'
import { formatRelativeTime } from '@/lib/utils/format-relative-time'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface RelativeTimeProps {
  date: string
  className?: string
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [relative, setRelative] = useState<string | null>(null)

  const absolute = new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  useEffect(() => {
    setRelative(formatRelativeTime(date))

    const interval = setInterval(() => {
      setRelative(formatRelativeTime(date))
    }, 60_000)

    return () => clearInterval(interval)
  }, [date])

  // Show absolute during SSR to avoid hydration mismatch
  if (relative === null) {
    return <span className={className}>{absolute}</span>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>{relative}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{absolute}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
