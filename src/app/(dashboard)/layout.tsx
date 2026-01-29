'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
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
    <div className="flex h-screen flex-col md:flex-row">
      {/* Mobile header with hamburger menu - shown on mobile only */}
      <MobileHeader onSignOut={handleSignOut} />

      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar onSignOut={handleSignOut} />
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-muted/40">{children}</main>
    </div>
  )
}
