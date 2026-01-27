import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Rocket } from 'lucide-react'
import { getDeployments } from '@/lib/actions/deployments'
import { DeploymentCard } from '@/components/deployments/deployment-card'

export default async function DeploymentsPage() {
  const deployments = await getDeployments()

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

      <div className="flex-1 p-6">
        {deployments.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12">
            <CardContent className="flex flex-col items-center text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Rocket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No deployments yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Track your application deployments across different providers
                and environments.
              </p>
              <Link href="/deployments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first deployment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deployments.map((deployment) => (
              <DeploymentCard key={deployment.id} deployment={deployment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
