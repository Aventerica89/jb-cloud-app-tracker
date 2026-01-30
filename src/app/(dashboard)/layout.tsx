'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { DarkModeTexture } from '@/components/ui/dark-mode-texture'
import { signOut } from '@/lib/actions/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="relative flex h-screen flex-col md:flex-row">
      {/* Dark mode texture background - shows in the "cracks" between cards */}
      <DarkModeTexture variant="background" />

      {/* Mobile header with hamburger menu - shown on mobile only */}
      <MobileHeader onSignOut={handleSignOut} />

      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block relative z-10">
        <Sidebar onSignOut={handleSignOut} />
      </div>

      {/* Main content area */}
      <main className="relative z-10 flex-1 overflow-auto bg-muted/40 dark:bg-transparent">{children}</main>
    </div>
  )
}
