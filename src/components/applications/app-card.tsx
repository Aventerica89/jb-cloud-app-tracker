import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, GitBranch } from 'lucide-react'
import type { ApplicationWithRelations } from '@/types/database'

const statusColors = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  archived: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  maintenance: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}

interface AppCardProps {
  app: ApplicationWithRelations
}

export function AppCard({ app }: AppCardProps) {
  return (
    <Link href={`/applications/${app.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1">{app.name}</CardTitle>
            <Badge
              variant="outline"
              className={statusColors[app.status]}
            >
              {app.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {app.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {app.description}
            </p>
          )}

          {app.tech_stack && app.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {app.tech_stack.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {app.tech_stack.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{app.tech_stack.length - 4}
                </Badge>
              )}
            </div>
          )}

          {app.tags && app.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {app.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    borderColor: `${tag.color}40`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {app.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{app.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            {app.repository_url && (
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                Repository
              </span>
            )}
            {app.deployments && app.deployments.length > 0 && (
              <span className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {app.deployments.length} deployment
                {app.deployments.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
