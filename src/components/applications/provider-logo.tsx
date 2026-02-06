'use client'

import Image from 'next/image'
import { Cloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProviderLogo } from '@/lib/provider-logos'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

interface ProviderLogoProps {
  slug: string
  name?: string
  size?: number
  className?: string
  showTooltip?: boolean
}

export function ProviderLogo({
  slug,
  name,
  size = 20,
  className,
  showTooltip = true,
}: ProviderLogoProps) {
  const logoInfo = getProviderLogo(slug)

  const img = logoInfo ? (
    <Image
      src={logoInfo.logo}
      alt={name || slug}
      width={size}
      height={size}
      className={cn('shrink-0 dark:brightness-0 dark:invert', className)}
      style={
        logoInfo.darkColor
          ? undefined
          : { filter: 'none' }
      }
    />
  ) : (
    <Cloud
      className={cn('shrink-0 text-muted-foreground', className)}
      style={{ width: size, height: size }}
    />
  )

  if (!showTooltip || !name) return img

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{img}</span>
      </TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  )
}
