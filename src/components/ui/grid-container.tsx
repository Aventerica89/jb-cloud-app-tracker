import { cn } from '@/lib/utils'
import type { GridDensity } from '@/hooks/use-grid-density'

const gridClasses: Record<GridDensity, string> = {
  compact: 'grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  normal: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  large: 'grid gap-6 sm:grid-cols-1 lg:grid-cols-2',
}

interface GridContainerProps {
  density: GridDensity
  children: React.ReactNode
  className?: string
}

export function GridContainer({
  density,
  children,
  className,
}: GridContainerProps) {
  return (
    <div className={cn(gridClasses[density], className)}>
      {children}
    </div>
  )
}
