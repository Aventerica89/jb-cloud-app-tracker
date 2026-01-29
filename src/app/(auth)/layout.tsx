import { Cloud } from 'lucide-react'
import { BlurBlobBg } from '@/components/ui/blur-blob-bg'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <BlurBlobBg />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Cloud className="h-8 w-8 text-orange-500" />
          <span className="text-2xl font-bold">Cloud App Tracker</span>
        </div>
        {children}
      </div>
    </div>
  )
}
