import { Cloud } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-8 flex items-center gap-2">
        <Cloud className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">Cloud App Tracker</span>
      </div>
      {children}
    </div>
  )
}
