import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { getDeployment } from '@/lib/actions/deployments'
import { getApplications } from '@/lib/actions/applications'
import { getProviders } from '@/lib/actions/providers'
import { getEnvironments } from '@/lib/actions/environments'
import { DeploymentForm } from '@/components/deployments/deployment-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditDeploymentPage({ params }: Props) {
  const { id } = await params
  const [deployment, applications, providers, environments] = await Promise.all(
    [getDeployment(id), getApplications(), getProviders(), getEnvironments()]
  )

  if (!deployment) {
    notFound()
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Edit Deployment"
        description={`${deployment.application.name} - ${deployment.provider.name}`}
      >
        <Link href={`/deployments/${deployment.id}`}>
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
              deployment={deployment}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
