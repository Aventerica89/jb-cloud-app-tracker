'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

interface DarkModeTextureProps {
  variant?: 'background' | 'sidebar'
  className?: string
}

// Hydration-safe mounted detection
const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function DarkModeTexture({ variant = 'background', className = '' }: DarkModeTextureProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)

  // Don't render anything in light mode or before mounting
  if (!mounted || resolvedTheme !== 'dark') {
    return null
  }

  const isSidebar = variant === 'sidebar'

  // Sidebar uses more subtle texture, background uses slightly more visible
  const dotOpacity = isSidebar ? 0.25 : 0.35
  const waveOpacity = isSidebar ? 0.08 : 0.12

  return (
    <>
      <style jsx global>{`
        @keyframes dark-wave-rain {
          0% {
            background-position: 0px 220px, 3px 220px, 151.5px 337.5px, 25px 24px, 28px 24px, 176.5px 150px;
          }
          to {
            background-position: 0px 6800px, 3px 6800px, 151.5px 6917.5px, 25px 13632px, 28px 13632px, 176.5px 13758px;
          }
        }
      `}</style>

      <div
        className={`pointer-events-none ${className}`}
        style={{
          position: isSidebar ? 'absolute' : 'fixed',
          inset: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {/* Animated wave/rain lines - subtle version */}
        <div
          style={{
            position: 'absolute',
            inset: '-145%',
            rotate: '-45deg',
            opacity: waveOpacity,
            backgroundImage: `
              radial-gradient(4px 100px at 0px 235px, #fa0, #0000),
              radial-gradient(4px 100px at 300px 235px, #fa0, #0000),
              radial-gradient(3px 4px at 150px 117.5px, #f00 100%, #0000 150%),
              radial-gradient(4px 100px at 0px 252px, #fa0, #0000),
              radial-gradient(4px 100px at 300px 252px, #fa0, #0000),
              radial-gradient(3px 4px at 150px 126px, #f00 100%, #0000 150%)
            `,
            backgroundSize: '300px 235px, 300px 235px, 300px 235px, 300px 252px, 300px 252px, 300px 252px',
            animation: 'dark-wave-rain 200s linear infinite',
          }}
        />

        {/* Dotted grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            backgroundImage: `radial-gradient(circle, rgba(251, 140, 0, ${dotOpacity}) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>
    </>
  )
}
