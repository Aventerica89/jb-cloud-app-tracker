'use client'

import { useState } from 'react'
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
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
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

interface MobileNavProps {
  onSignOut?: () => void
}

export function MobileNav({ onSignOut }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user } = useCurrentUser()

  const handleNavClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 overflow-hidden">
        {/* Dark mode texture */}
        <DarkModeTexture variant="sidebar" />

        <SheetHeader className="relative z-10 border-b border-border dark:border-orange-500/20 px-6 py-4 bg-card dark:bg-card/90">
          <SheetTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary dark:text-orange-400" />
            Cloud Tracker
          </SheetTitle>
        </SheetHeader>

        <nav className="relative z-10 flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
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

        <div className="relative z-10 px-3 py-4 border-t border-border dark:border-orange-500/20 bg-card dark:bg-card/90">
          {/* User info */}
          {user && (
            <Link
              href="/settings"
              onClick={handleNavClick}
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
                onClick={handleNavClick}
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
            onClick={() => {
              handleNavClick()
              onSignOut?.()
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
