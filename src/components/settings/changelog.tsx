import { Plus, RefreshCw, Wrench, Minus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { changelog, type ChangelogEntry } from '@/lib/changelog'

const typeConfig = {
  added: {
    label: 'Added',
    icon: Plus,
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  changed: {
    label: 'Changed',
    icon: RefreshCw,
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  fixed: {
    label: 'Fixed',
    icon: Wrench,
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  removed: {
    label: 'Removed',
    icon: Minus,
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
}

function ChangelogVersion({ entry }: { entry: ChangelogEntry }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono">
          v{entry.version}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
      <ul className="space-y-2">
        {entry.changes.map((change, index) => {
          const config = typeConfig[change.type]
          const Icon = config.icon
          return (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Badge
                variant="outline"
                className={`${config.className} shrink-0 gap-1 text-xs`}
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </Badge>
              <span className="text-muted-foreground">{change.description}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Changelog() {
  const latestVersion = changelog[0]?.version || '1.0.0'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Changelog
          <Badge variant="secondary" className="font-mono text-xs">
            v{latestVersion}
          </Badge>
        </CardTitle>
        <CardDescription>Recent updates and improvements</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-6">
            {changelog.map((entry) => (
              <ChangelogVersion key={entry.version} entry={entry} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
