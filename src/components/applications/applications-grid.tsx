'use client'

import { useGridDensity } from '@/hooks/use-grid-density'
import { GridDensityToggle } from '@/components/ui/grid-density-toggle'
import { GridContainer } from '@/components/ui/grid-container'
import { AppCard } from '@/components/applications/app-card'
import { AppContextMenu } from '@/components/applications/app-context-menu'
import type { ApplicationWithRelations } from '@/types/database'

interface ApplicationsGridProps {
  applications: ApplicationWithRelations[]
}

export function ApplicationsGrid({ applications }: ApplicationsGridProps) {
  const { density, setDensity } = useGridDensity()

  return (
    <>
      <div className="flex justify-end mb-4">
        <GridDensityToggle density={density} onDensityChange={setDensity} />
      </div>
      <GridContainer density={density}>
        {applications.map((app) => (
          <AppContextMenu key={app.id} app={app}>
            <AppCard app={app} />
          </AppContextMenu>
        ))}
      </GridContainer>
    </>
  )
}
