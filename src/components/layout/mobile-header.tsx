'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Moon, Sun, Cloud } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MobileNav } from '@/components/layout/mobile-nav'
import { UserAvatar } from '@/components/user/user-avatar'
import { useCurrentUser } from '@/hooks/use-current-user'
import { DarkModeTexture } from '@/components/ui/dark-mode-texture'

// Hydration-safe mounted detection
const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

interface MobileHeaderProps {
  onSignOut?: () => void
}

export function MobileHeader({ onSignOut }: MobileHeaderProps) {
  const { setTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)
  const { user } = useCurrentUser()

  return (
    <header className="relative flex h-14 items-center justify-between border-b border-border dark:border-orange-500/20 bg-card dark:bg-card/95 px-4 md:hidden overflow-hidden">
      {/* Dark mode texture */}
      <DarkModeTexture variant="sidebar" />

      <div className="relative z-10 flex items-center gap-2">
        <MobileNav onSignOut={onSignOut} />
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary dark:text-orange-400" />
          <span className="font-semibold">Cloud Tracker</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2">
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {user && (
          <Link href="/settings">
            <UserAvatar
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
              size="sm"
            />
          </Link>
        )}
      </div>
    </header>
  )
}
