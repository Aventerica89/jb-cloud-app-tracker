'use client'

import { LayoutGrid, Grid2x2, Grid3x3 } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { GridDensity } from '@/hooks/use-grid-density'

interface GridDensityToggleProps {
  density: GridDensity
  onDensityChange: (value: GridDensity) => void
}

const options = [
  { value: 'compact' as const, icon: Grid3x3, label: 'Compact' },
  { value: 'normal' as const, icon: Grid2x2, label: 'Normal' },
  { value: 'large' as const, icon: LayoutGrid, label: 'Large' },
]

export function GridDensityToggle({
  density,
  onDensityChange,
}: GridDensityToggleProps) {
  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={density}
        onValueChange={(value) => {
          if (value) onDensityChange(value as GridDensity)
        }}
        className="border rounded-md"
      >
        {options.map(({ value, icon: Icon, label }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={value}
                size="sm"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  )
}
