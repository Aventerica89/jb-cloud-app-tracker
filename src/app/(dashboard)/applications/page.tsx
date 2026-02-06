import Link from 'next/link'
import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { EmptyState, FilteredEmptyState } from '@/components/ui/empty-state'
import { GridSkeleton } from '@/components/ui/card-skeleton'
import { Plus, AppWindow } from 'lucide-react'
import { getApplications } from '@/lib/actions/applications'
import { getTags } from '@/lib/actions/tags'
import { AppCard } from '@/components/applications/app-card'
import { AppListItem } from '@/components/applications/app-list-item'
import { AppCompactCard } from '@/components/applications/app-compact-card'
import { AppFilters } from '@/components/applications/app-filters'
import { ViewToggle, type ViewMode } from '@/components/applications/view-toggle'
import { TagFilterBar } from '@/components/applications/tag-filter-bar'
import { SyncAllButton } from '@/components/applications/sync-all-button'
import { GitHubImportButton } from '@/components/applications/github-import-button'
import { AutoConnectButton } from '@/components/applications/auto-connect-button'

interface Props {
  searchParams: Promise<{ search?: string; status?: string; view?: string; tags?: string }>
}

async function ApplicationsList({
  search,
  status,
  view = 'grid',
  tags,
}: {
  search?: string
  status?: string
  view?: ViewMode
  tags?: string[]
}) {
  const applications = await getApplications({ search, status, tags })

  if (applications.length === 0) {
    const hasFilters = search || (status && status !== 'all') || (tags && tags.length > 0)

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

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {applications.map((app) => (
          <AppListItem key={app.id} app={app} />
        ))}
      </div>
    )
  }

  if (view === 'compact') {
    return (
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {applications.map((app) => (
          <AppCompactCard key={app.id} app={app} />
        ))}
      </div>
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

async function TagFilterBarWrapper() {
  const tags = await getTags()
  return <TagFilterBar tags={tags} />
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const params = await searchParams
  const { search, status, view } = params
  const tagIds = params.tags?.split(',').filter(Boolean)

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Applications"
        description="Manage your cloud applications"
      >
        <div className="flex items-center gap-2">
          <SyncAllButton />
          <AutoConnectButton />
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <Suspense fallback={null}>
              <AppFilters />
            </Suspense>
          </div>
          <Suspense fallback={null}>
            <ViewToggle />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <TagFilterBarWrapper />
        </Suspense>

        <Suspense fallback={<GridSkeleton type="app" count={6} />}>
          <ApplicationsList
            search={search}
            status={status}
            view={(view as ViewMode) || 'grid'}
            tags={tagIds}
          />
        </Suspense>
      </div>
    </div>
  )
}
