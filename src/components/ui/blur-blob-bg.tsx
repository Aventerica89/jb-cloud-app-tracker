'use client'

interface BlurBlobBgProps {
  variant?: 'default' | 'subtle'
  className?: string
}

export function BlurBlobBg({ variant = 'default', className = '' }: BlurBlobBgProps) {
  return <div className={`blob-bg-container ${variant === 'subtle' ? 'subtle' : ''} ${className}`} />
}
