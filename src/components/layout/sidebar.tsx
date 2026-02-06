'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  AppWindow,
  Cloud,
  Tags,
  Rocket,
  Settings,
  LogOut,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UserAvatar } from '@/components/user/user-avatar'
import { useCurrentUser } from '@/hooks/use-current-user'
import { DarkModeTexture } from '@/components/ui/dark-mode-texture'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: AppWindow },
  { name: 'Deployments', href: '/deployments', icon: Rocket },
  { name: 'Providers', href: '/providers', icon: Cloud },
  { name: 'Tags', href: '/tags', icon: Tags },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  onSignOut?: () => void
}

export function Sidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useCurrentUser()

  return (
    <div className="relative flex h-full w-64 flex-col bg-card dark:bg-card/95 border-r border-border dark:border-orange-500/20 overflow-hidden">
      {/* Dark mode texture for sidebar */}
      <DarkModeTexture variant="sidebar" />
      {/* Logo */}
      <div className="relative z-10 flex h-16 items-center gap-2 px-6 border-b border-border dark:border-orange-500/20 bg-card dark:bg-card/90 backdrop-blur-sm">
        <Cloud className="h-6 w-6 text-primary dark:text-orange-400" />
        <span className="font-semibold text-lg">Cloud Tracker</span>
      </div>

      {/* Search (Cmd+K) */}
      <div className="relative z-10 px-3 pt-4 pb-2">
        <button
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
          }}
          className="flex items-center gap-3 w-full rounded-lg border border-border dark:border-orange-500/20 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section and secondary navigation */}
      <div className="relative z-10 px-3 py-4 border-t border-border dark:border-orange-500/20 bg-card dark:bg-card/90 backdrop-blur-sm">
        {/* User info */}
        {user && (
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 mb-2 hover:bg-accent transition-colors"
          >
            <UserAvatar
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </Link>
        )}

        <Separator className="my-2" />

        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
