import Link from 'next/link'
import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { EmptyState, FilteredEmptyState } from '@/components/ui/empty-state'
import { GridSkeleton } from '@/components/ui/card-skeleton'
import { Plus, AppWindow } from 'lucide-react'
import { getApplications } from '@/lib/actions/applications'
import { AppCard } from '@/components/applications/app-card'
import { AppFilters } from '@/components/applications/app-filters'
import { GitHubImportButton } from '@/components/applications/github-import-button'

interface Props {
  searchParams: Promise<{ search?: string; status?: string }>
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

    if (hasFilters) {
      return <FilteredEmptyState icon={AppWindow} />
    }

    return (
      <EmptyState
        icon={AppWindow}
        title="No applications yet"
        description="Start tracking your cloud applications by adding your first one."
        action={{
          label: 'Add your first application',
          href: '/applications/new',
        }}
      />
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

      <div className="flex-1 overflow-auto p-6">
        <Suspense fallback={null}>
          <AppFilters />
        </Suspense>

        <Suspense fallback={<GridSkeleton type="app" count={6} />}>
          <ApplicationsList search={search} status={status} />
        </Suspense>
      </div>
    </div>
  )
}
