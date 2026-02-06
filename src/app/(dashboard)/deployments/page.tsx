import Link from 'next/link'
import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { GridSkeleton } from '@/components/ui/card-skeleton'
import { Plus, Rocket } from 'lucide-react'
import { getDeployments } from '@/lib/actions/deployments'
import { DeploymentCard } from '@/components/deployments/deployment-card'

async function DeploymentsList() {
  const deployments = await getDeployments()

  if (deployments.length === 0) {
    return (
      <EmptyState
        icon={Rocket}
        title="No deployments yet"
        description="Track your application deployments across different providers and environments."
        action={{
          label: 'Add your first deployment',
          href: '/deployments/new',
        }}
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {deployments.map((deployment) => (
        <DeploymentCard key={deployment.id} deployment={deployment} />
      ))}
    </div>
  )
}

export default function DeploymentsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Deployments"
        description="Track deployments across all applications"
      >
        <Link href="/deployments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Deployment
          </Button>
        </Link>
      </Header>

      <div className="flex-1 overflow-auto p-6">
        <Suspense fallback={<GridSkeleton type="deployment" count={6} />}>
          <DeploymentsList />
        </Suspense>
      </div>
    </div>
  )
}
