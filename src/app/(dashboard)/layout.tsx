'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
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
    <div className="flex h-screen">
      <Sidebar onSignOut={handleSignOut} />
      <main className="flex-1 overflow-auto bg-muted/40">{children}</main>
    </div>
  )
}
