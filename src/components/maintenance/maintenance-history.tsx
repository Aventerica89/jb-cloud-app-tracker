'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { MaintenanceRunWithRelations } from '@/types/database'

type Props = {
  runs: MaintenanceRunWithRelations[]
}

export function MaintenanceHistory({ runs }: Props) {
  if (runs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>No maintenance runs recorded yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const statusIcons = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    failed: <XCircle className="h-4 w-4 text-red-600" />,
    pending: <Clock className="h-4 w-4 text-gray-600" />,
    running: <Clock className="h-4 w-4 text-blue-600" />,
    skipped: <Clock className="h-4 w-4 text-gray-600" />,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance History</CardTitle>
        <CardDescription>
          {runs.length} maintenance run{runs.length === 1 ? '' : 's'} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="flex items-start gap-3 border rounded-lg p-3"
            >
              <div className="mt-0.5">
                {statusIcons[run.status as keyof typeof statusIcons]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{run.command_type.name}</span>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: run.command_type.color + '15',
                      borderColor: run.command_type.color + '40',
                      color: run.command_type.color,
                    }}
                  >
                    {run.command_type.slug}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {format(new Date(run.run_at), 'PPpp')}
                </div>
                {run.notes && (
                  <div className="text-sm mt-2 p-2 bg-muted rounded">
                    {run.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
