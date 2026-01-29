'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '?'
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = 'default',
  className,
}: UserAvatarProps) {
  const initials = getInitials(name, email)

  return (
    <Avatar size={size} className={cn(className)}>
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={name || email || 'User avatar'}
        />
      )}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
