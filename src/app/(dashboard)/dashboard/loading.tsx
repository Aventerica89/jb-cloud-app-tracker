import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatCardSkeleton, ListSkeleton } from '@/components/ui/card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        description="Overview of your cloud applications"
      >
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </Header>

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Recent Activity Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <ListSkeleton count={3} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <ListSkeleton count={3} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
