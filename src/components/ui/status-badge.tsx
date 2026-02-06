/**
 * StatusBadge Component
 *
 * Reusable badge component for displaying status with consistent styling
 * Supports app, deployment, environment, and semantic status types
 *
 * Accessibility features:
 * - Proper ARIA labels for screen readers
 * - Semantic HTML
 * - Optional visual indicators
 */

import { Badge } from '@/components/ui/badge'
import { getStatusColor, formatStatus } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import type { AppStatus, DeploymentStatus } from '@/types/database'

interface StatusBadgeProps {
  /**
   * Type of status to display
   */
  type: 'app' | 'deployment' | 'environment' | 'semantic'

  /**
   * Status value
   */
  status: AppStatus | DeploymentStatus | string

  /**
   * Optional custom label (overrides formatted status)
   */
  label?: string

  /**
   * Optional icon to display before the text
   */
  icon?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Whether to show a pulse animation for active/in-progress states
   */
  animated?: boolean

  /**
   * Size variant
   */
  size?: 'default' | 'sm' | 'xs'
}

const sizeClasses = {
  default: 'text-sm px-2.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  xs: 'text-xs px-1.5 py-0',
}

const pulseStatuses = ['building', 'pending', 'maintenance']

export function StatusBadge({
  type,
  status,
  label,
  icon,
  className,
  animated = false,
  size = 'default',
}: StatusBadgeProps) {
  const statusStr = String(status)
  const displayLabel = label || formatStatus(statusStr)
  const colorClasses = getStatusColor(type, statusStr)
  const shouldPulse = animated && pulseStatuses.includes(statusStr)

  return (
    <Badge
      variant="outline"
      className={cn(
        colorClasses,
        sizeClasses[size],
        shouldPulse && 'animate-pulse',
        'inline-flex items-center gap-1 font-medium',
        className
      )}
      aria-label={`Status: ${displayLabel}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{displayLabel}</span>
    </Badge>
  )
}

/**
 * Specialized status badge components for common use cases
 */

interface AppStatusBadgeProps extends Omit<StatusBadgeProps, 'type' | 'status'> {
  status: AppStatus
}

export function AppStatusBadge({ status, ...props }: AppStatusBadgeProps) {
  return (
    <StatusBadge
      type="app"
      status={status}
      animated={status === 'maintenance'}
      {...props}
    />
  )
}

interface DeploymentStatusBadgeProps extends Omit<StatusBadgeProps, 'type' | 'status'> {
  status: DeploymentStatus
}

export function DeploymentStatusBadge({
  status,
  ...props
}: DeploymentStatusBadgeProps) {
  return (
    <StatusBadge
      type="deployment"
      status={status}
      animated={status === 'building' || status === 'pending'}
      {...props}
    />
  )
}

interface EnvironmentBadgeProps extends Omit<StatusBadgeProps, 'type' | 'status'> {
  environment: string
  label?: string
}

export function EnvironmentBadge({
  environment,
  label,
  ...props
}: EnvironmentBadgeProps) {
  return (
    <StatusBadge
      type="environment"
      status={environment}
      label={label}
      {...props}
    />
  )
}
