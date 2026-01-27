import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { getApplications } from '@/lib/actions/applications'
import { getProviders } from '@/lib/actions/providers'
import { getEnvironments } from '@/lib/actions/environments'
import { DeploymentForm } from '@/components/deployments/deployment-form'

interface Props {
  searchParams: Promise<{ app?: string }>
}

export default async function NewDeploymentPage({ searchParams }: Props) {
  const { app: defaultAppId } = await searchParams

  const [applications, providers, environments] = await Promise.all([
    getApplications(),
    getProviders(),
    getEnvironments(),
  ])

  return (
    <div className="flex flex-col h-full">
      <Header
        title="New Deployment"
        description="Track a new deployment for an application"
      >
        <Link href="/deployments">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6">
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <DeploymentForm
              applications={applications}
              providers={providers}
              environments={environments}
              defaultApplicationId={defaultAppId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
