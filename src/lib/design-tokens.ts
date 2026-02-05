/**
 * Centralized Design Tokens
 *
 * Following the 8px grid system and consistent color semantics
 * Based on ui-designer plugin principles for rapid implementation
 */

import type { AppStatus, DeploymentStatus } from '@/types/database'

/**
 * Status Color Mappings
 * Using Tailwind's color system with consistent alpha channels
 */
export const statusColors = {
  // Application Statuses
  app: {
    active: 'bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-500/20 dark:border-green-500/30',
    inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20 dark:bg-gray-500/20 dark:border-gray-500/30',
    archived: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20 dark:border-amber-500/30',
    maintenance: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20 dark:border-blue-500/30',
  } as Record<AppStatus, string>,

  // Deployment Statuses
  deployment: {
    deployed: 'bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-500/20 dark:border-green-500/30',
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 dark:bg-yellow-500/20 dark:border-yellow-500/30',
    building: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20 dark:border-blue-500/30',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20 dark:border-red-500/30',
    rolled_back: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20 dark:border-amber-500/30',
  } as Record<DeploymentStatus, string>,

  // Environment Colors
  environment: {
    development: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/20 dark:border-slate-500/30',
    staging: 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-500/20 dark:border-purple-500/30',
    production: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20 dark:border-emerald-500/30',
  } as Record<string, string>,

  // Semantic States
  semantic: {
    success: 'bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-500/20 dark:border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 dark:bg-yellow-500/20 dark:border-yellow-500/30',
    error: 'bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20 dark:border-red-500/30',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20 dark:border-blue-500/30',
  },
}

/**
 * Spacing System (8px grid)
 * Aligned with Tailwind's spacing scale
 */
export const spacing = {
  xs: 'gap-1', // 4px
  sm: 'gap-2', // 8px
  md: 'gap-3', // 12px
  lg: 'gap-4', // 16px
  xl: 'gap-6', // 24px
  '2xl': 'gap-8', // 32px
} as const

/**
 * Interactive State Classes
 * Consistent hover, focus, and active states
 */
export const interactiveStates = {
  card: {
    base: 'transition-all duration-200 cursor-pointer',
    hover: 'hover:border-primary/50 dark:hover:border-orange-500/50 hover:shadow-md',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    active: 'active:scale-[0.98]',
  },
  button: {
    base: 'transition-all duration-200',
    hover: 'hover:scale-105',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    active: 'active:scale-95',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
  },
  link: {
    base: 'transition-colors duration-200',
    hover: 'hover:underline hover:text-foreground dark:hover:text-orange-300',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded',
  },
} as const

/**
 * Typography Scale (mobile-first)
 * Following design system best practices
 */
export const typography = {
  display: 'text-4xl md:text-5xl font-bold leading-tight',
  h1: 'text-3xl md:text-4xl font-bold leading-tight',
  h2: 'text-2xl md:text-3xl font-semibold leading-snug',
  h3: 'text-xl md:text-2xl font-semibold leading-snug',
  h4: 'text-lg md:text-xl font-semibold',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-relaxed',
  tiny: 'text-xs leading-normal',
} as const

/**
 * Animation Durations
 * Consistent timing for transitions
 */
export const animations = {
  fast: 'duration-150',
  base: 'duration-200',
  slow: 'duration-300',
  slower: 'duration-500',
} as const

/**
 * Z-Index Scale
 * Prevents z-index conflicts
 */
export const zIndex = {
  base: 'z-0',
  raised: 'z-10',
  dropdown: 'z-20',
  overlay: 'z-30',
  modal: 'z-40',
  toast: 'z-50',
} as const

/**
 * Helper to get status color classes
 */
export function getStatusColor(
  type: 'app' | 'deployment' | 'environment' | 'semantic',
  status: string
): string {
  const colorMap = statusColors[type] as Record<string, string>
  return colorMap[status] || statusColors.semantic.info
}

/**
 * Helper to format status text
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
