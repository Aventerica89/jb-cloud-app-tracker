'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAppFaviconUrl } from '@/lib/provider-logos'

interface AppFaviconProps {
  url?: string | null
  name: string
  size?: number
  className?: string
}

export function AppFavicon({ url, name, size = 20, className }: AppFaviconProps) {
  const [error, setError] = useState(false)

  const faviconUrl = url ? getAppFaviconUrl(url) : null

  if (!faviconUrl || error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded bg-muted shrink-0',
          className
        )}
        style={{ width: size, height: size }}
      >
        <Globe className="text-muted-foreground" style={{ width: size * 0.6, height: size * 0.6 }} />
      </div>
    )
  }

  return (
    <Image
      src={faviconUrl}
      alt={`${name} favicon`}
      width={size}
      height={size}
      className={cn('rounded shrink-0', className)}
      onError={() => setError(true)}
      unoptimized
    />
  )
}
