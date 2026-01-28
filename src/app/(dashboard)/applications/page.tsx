import Link from 'next/link'
import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, AppWindow } from 'lucide-react'
import { getApplications } from '@/lib/actions/applications'
import { AppCard } from '@/components/applications/app-card'
import { AppFilters } from '@/components/applications/app-filters'
import { GitHubImportButton } from '@/components/applications/github-import-button'

interface Props {
  searchParams: Promise<{ search?: string; status?: string }>
}

function ApplicationsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

async function ApplicationsList({
  search,
  status,
}: {
  search?: string
  status?: string
}) {
  const applications = await getApplications({ search, status })

  if (applications.length === 0) {
    const hasFilters = search || (status && status !== 'all')

    return (
      <Card className="flex flex-col items-center justify-center p-12">
        <CardContent className="flex flex-col items-center text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <AppWindow className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {hasFilters ? 'No applications found' : 'No applications yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {hasFilters
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Start tracking your cloud applications by adding your first one.'}
          </p>
          {!hasFilters && (
            <Link href="/applications/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add your first application
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {applications.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  )
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const { search, status } = await searchParams

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Applications"
        description="Manage your cloud applications"
      >
        <div className="flex items-center gap-2">
          <GitHubImportButton />
          <Link href="/applications/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </Link>
        </div>
      </Header>

      <div className="flex-1 p-6">
        <Suspense fallback={null}>
          <AppFilters />
        </Suspense>

        <Suspense fallback={<ApplicationsGridSkeleton />}>
          <ApplicationsList search={search} status={status} />
        </Suspense>
      </div>
    </div>
  )
}
