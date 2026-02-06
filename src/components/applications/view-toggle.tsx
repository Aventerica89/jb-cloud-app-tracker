'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { LayoutGrid, List, Grid3X3 } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

export type ViewMode = 'grid' | 'list' | 'compact'

interface ViewToggleProps {
  className?: string
}

export function ViewToggle({ className }: ViewToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const VALID_VIEWS: ViewMode[] = ['grid', 'list', 'compact']
  const rawView = searchParams.get('view')
  const currentView: ViewMode = rawView && VALID_VIEWS.includes(rawView as ViewMode)
    ? (rawView as ViewMode)
    : 'grid'

  const handleViewChange = useCallback(
    (value: string) => {
      if (!value) return
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'grid') {
          params.delete('view')
        } else {
          params.set('view', value)
        }
        const query = params.toString()
        router.push(`/applications${query ? `?${query}` : ''}`)
      })
    },
    [router, searchParams, startTransition]
  )

  return (
    <ToggleGroup
      type="single"
      value={currentView}
      onValueChange={handleViewChange}
      variant="outline"
      size="sm"
      className={className}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>Grid view</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>List view</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="compact" aria-label="Compact grid">
            <Grid3X3 className="h-4 w-4" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>Compact grid</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  )
}
