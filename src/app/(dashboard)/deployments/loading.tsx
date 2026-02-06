import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { GridSkeleton } from '@/components/ui/card-skeleton'
import { Plus } from 'lucide-react'

export default function DeploymentsLoading() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Deployments"
        description="Track deployments across all applications"
      >
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Deployment
        </Button>
      </Header>

      <div className="flex-1 p-6">
        <GridSkeleton type="deployment" count={6} />
      </div>
    </div>
  )
}
