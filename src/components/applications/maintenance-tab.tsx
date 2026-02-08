'use client'

import { MaintenanceChecklist } from '@/components/maintenance/maintenance-checklist'
import { MaintenanceHistory } from '@/components/maintenance/maintenance-history'
import { AddMaintenanceRunDialog } from '@/components/maintenance/add-maintenance-run-dialog'
import type { MaintenanceStatusItem, MaintenanceRunWithRelations, MaintenanceCommandType } from '@/types/database'

interface MaintenanceTabProps {
  applicationId: string
  statuses: MaintenanceStatusItem[]
  runs: MaintenanceRunWithRelations[]
  commandTypes: MaintenanceCommandType[]
}

export function MaintenanceTab({
  applicationId,
  statuses,
  runs,
  commandTypes,
}: MaintenanceTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Maintenance Checklist</h2>
        <AddMaintenanceRunDialog
          applicationId={applicationId}
          commandTypes={commandTypes}
        />
      </div>

      <MaintenanceChecklist
        applicationId={applicationId}
        statuses={statuses}
      />

      <div className="pt-6">
        <h3 className="text-xl font-semibold mb-4">History</h3>
        <MaintenanceHistory runs={runs} />
      </div>
    </div>
  )
}
