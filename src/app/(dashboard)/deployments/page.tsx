import Link from 'next/link'
import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Plus, Rocket } from 'lucide-react'
import { getDeployments } from '@/lib/actions/deployments'
import { getProviders } from '@/lib/actions/providers'
import { DeploymentCard } from '@/components/deployments/deployment-card'
import { DeploymentFilters } from '@/components/deployments/deployment-filters'
import { UrlPagination } from '@/components/ui/url-pagination'
import { EmptyState } from '@/components/ui/empty-state'

interface Props {
  searchParams: Promise<{
    search?: string
    status?: string
    provider?: string
    environment?: string
    page?: string
  }>
}

function DeploymentsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

async function DeploymentsList({
  search,
  status,
  provider,
  environment,
  page,
}: {
  search?: string
  status?: string
  provider?: string
  environment?: string
  page: number
}) {
  const limit = 12
  const { data: deployments, total } = await getDeployments({
    search,
    status,
    provider,
    environment,
    page,
    limit,
  })
  const totalPages = Math.ceil(total / limit)
  const hasFilters = search || (status && status !== 'all') ||
    (provider && provider !== 'all') || (environment && environment !== 'all')

  if (deployments.length === 0) {
    return (
      <EmptyState
        icon={Rocket}
        title={hasFilters ? 'No deployments found' : 'No deployments yet'}
        description={
          hasFilters
            ? 'Try adjusting your filters to find what you\'re looking for.'
            : 'Track your application deployments across providers and environments.'
        }
        action={
          !hasFilters ? {
            label: 'Add your first deployment',
            href: '/deployments/new',
          } : undefined
        }
      />
    )
  }

  const searchParamsForPagination: Record<string, string> = {}
  if (search) searchParamsForPagination.search = search
  if (status && status !== 'all') searchParamsForPagination.status = status
  if (provider && provider !== 'all') searchParamsForPagination.provider = provider
  if (environment && environment !== 'all') searchParamsForPagination.environment = environment

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deployments.map((deployment) => (
          <DeploymentCard key={deployment.id} deployment={deployment} />
        ))}
      </div>
      <UrlPagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/deployments"
        searchParams={searchParamsForPagination}
      />
    </>
  )
}

export default async function DeploymentsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  const providers = await getProviders()

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
        <Suspense fallback={null}>
          <DeploymentFilters providers={providers} />
        </Suspense>

        <Suspense fallback={<DeploymentsGridSkeleton />}>
          <DeploymentsList
            search={params.search}
            status={params.status}
            provider={params.provider}
            environment={params.environment}
            page={page}
          />
        </Suspense>
      </div>
    </div>
  )
}
