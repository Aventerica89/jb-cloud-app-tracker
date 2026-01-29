import { UserAvatar } from '@/components/user/user-avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UserProfile as UserProfileType } from '@/lib/actions/user'

interface UserProfileProps {
  user: UserProfileType
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getProviderLabel(provider: string | null): string {
  if (!provider) return 'Email'
  const labels: Record<string, string> = {
    google: 'Google',
    github: 'GitHub',
    email: 'Email',
  }
  return labels[provider] || provider
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <UserAvatar
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            size="lg"
            className="h-16 w-16"
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">
                {user.name || 'No name set'}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {getProviderLabel(user.provider)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
