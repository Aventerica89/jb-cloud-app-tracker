/**
 * Card Skeleton Components
 *
 * Skeleton loaders for different card types
 * Provides visual feedback during data loading
 *
 * Accessibility:
 * - ARIA attributes for screen readers
 * - Proper loading announcements
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Generic Card Skeleton
 */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn('h-full', className)} aria-busy="true" aria-label="Loading content">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Application Card Skeleton
 * Matches the structure of AppCard component
 */
export function AppCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn('h-full', className)} aria-busy="true" aria-label="Loading application">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Links footer */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Deployment Card Skeleton
 * Matches the structure of DeploymentCard component
 */
export function DeploymentCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn('h-full', className)} aria-busy="true" aria-label="Loading deployment">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Provider and Environment badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Branch */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Footer with date and link */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Stat Card Skeleton
 * For dashboard statistics cards
 */
export function StatCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn('h-full', className)} aria-busy="true" aria-label="Loading statistic">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-16" />
      </CardContent>
    </Card>
  )
}

/**
 * List Item Skeleton
 * For list views (recent deployments, applications, etc.)
 */
export function ListItemSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg bg-muted/50',
        className
      )}
      aria-busy="true"
      aria-label="Loading item"
    >
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  )
}

/**
 * Grid Skeleton
 * Displays multiple card skeletons in a grid
 */
interface GridSkeletonProps {
  count?: number
  type?: 'card' | 'app' | 'deployment' | 'stat'
  className?: string
}

export function GridSkeleton({
  count = 6,
  type = 'card',
  className,
}: GridSkeletonProps) {
  const SkeletonComponent = {
    card: CardSkeleton,
    app: AppCardSkeleton,
    deployment: DeploymentCardSkeleton,
    stat: StatCardSkeleton,
  }[type]

  return (
    <div
      className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonComponent key={i} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * List Skeleton
 * Displays multiple list item skeletons
 */
interface ListSkeletonProps {
  count?: number
  className?: string
}

export function ListSkeleton({ count = 5, className }: ListSkeletonProps) {
  return (
    <div
      className={cn('space-y-3', className)}
      role="status"
      aria-label="Loading list"
    >
      {Array.from({ length: count }, (_, i) => (
        <ListItemSkeleton key={i} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}
