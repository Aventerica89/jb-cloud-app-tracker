/**
 * EmptyState Component
 *
 * Consistent empty/no-data state component with accessibility support
 * Used across the application for better UX when no data is available
 *
 * Features:
 * - Semantic HTML structure
 * - Configurable icon, title, description, and action
 * - Responsive design
 * - ARIA announcements for screen readers
 */

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon?: LucideIcon

  /**
   * Main heading text
   */
  title: string

  /**
   * Supporting description text
   */
  description?: string

  /**
   * Optional action button configuration
   */
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }

  /**
   * Additional CSS classes for the container
   */
  className?: string

  /**
   * Size variant
   */
  size?: 'default' | 'compact'
}

const sizeConfig = {
  default: {
    container: 'p-12',
    icon: 'h-12 w-12 mb-4',
    iconWrapper: 'rounded-full bg-muted p-4',
    title: 'text-lg font-semibold mb-2',
    description: 'text-sm text-muted-foreground mb-4 max-w-sm',
  },
  compact: {
    container: 'p-8',
    icon: 'h-8 w-8 mb-3',
    iconWrapper: 'rounded-full bg-muted p-3',
    title: 'text-base font-semibold mb-1.5',
    description: 'text-xs text-muted-foreground mb-3 max-w-xs',
  },
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'default',
}: EmptyStateProps) {
  const config = sizeConfig[size]

  return (
    <Card className={cn('flex flex-col items-center justify-center', className)}>
      <CardContent className={cn('flex flex-col items-center text-center', config.container)}>
        {Icon && (
          <div className={config.iconWrapper}>
            <Icon
              className={cn(config.icon, 'text-muted-foreground')}
              aria-hidden="true"
            />
          </div>
        )}

        <h3 className={config.title} role="status" aria-live="polite">
          {title}
        </h3>

        {description && (
          <p className={config.description}>
            {description}
          </p>
        )}

        {action && (
          <>
            {action.href ? (
              <a href={action.href}>
                <Button size={size === 'compact' ? 'sm' : 'default'}>
                  {action.label}
                </Button>
              </a>
            ) : (
              <Button
                onClick={action.onClick}
                size={size === 'compact' ? 'sm' : 'default'}
              >
                {action.label}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Specialized empty state for filtered results
 */
interface FilteredEmptyStateProps extends Omit<EmptyStateProps, 'title' | 'description'> {
  /**
   * Custom title (optional, defaults to "No results found")
   */
  title?: string

  /**
   * Custom description (optional, has sensible default)
   */
  description?: string

  /**
   * Callback to clear filters
   */
  onClearFilters?: () => void
}

export function FilteredEmptyState({
  title = 'No results found',
  description = "Try adjusting your search or filters to find what you're looking for.",
  onClearFilters,
  ...props
}: FilteredEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        onClearFilters
          ? {
              label: 'Clear filters',
              onClick: onClearFilters,
            }
          : undefined
      }
      {...props}
    />
  )
}
