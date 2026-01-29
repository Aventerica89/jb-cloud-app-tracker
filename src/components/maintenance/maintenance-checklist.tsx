'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Clock, AlertCircle, Play } from 'lucide-react'
import { useState } from 'react'
import type { MaintenanceStatusItem } from '@/types/database'

type Props = {
  applicationId: string
  statuses: MaintenanceStatusItem[]
  onRunCommand?: (commandTypeId: string) => Promise<void>
}

export function MaintenanceChecklist({
  applicationId,
  statuses,
  onRunCommand,
}: Props) {
  const [running, setRunning] = useState<string | null>(null)

  const handleRun = async (commandTypeId: string) => {
    if (!onRunCommand) return
    setRunning(commandTypeId)
    try {
      await onRunCommand(commandTypeId)
    } finally {
      setRunning(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Checklist</CardTitle>
        <CardDescription>
          Track when maintenance commands were last run
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statuses.map((status) => (
            <div
              key={status.command_type.id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: status.command_type.color }}
                />
                <div>
                  <div className="font-medium">{status.command_type.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {status.last_run_at ? (
                      <>
                        Last run{' '}
                        {formatDistanceToNow(new Date(status.last_run_at), {
                          addSuffix: true,
                        })}
                      </>
                    ) : (
                      'Never run'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {status.never_run ? (
                  <Badge variant="outline" className="gap-1 text-gray-600">
                    <Clock className="h-3 w-3" />
                    Not tracked yet
                  </Badge>
                ) : status.is_overdue ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Overdue ({status.days_since_run}d ago)
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 text-green-600 border-green-600/20"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Up to date
                  </Badge>
                )}

                {onRunCommand && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRun(status.command_type.id)}
                    disabled={running === status.command_type.id}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {running === status.command_type.id
                      ? 'Running...'
                      : 'Run'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
