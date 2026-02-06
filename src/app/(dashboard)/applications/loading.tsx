import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

export default function ApplicationsLoading() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Applications"
        description="Manage your cloud applications"
      >
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </Header>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
        </div>

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
      </div>
    </div>
  )
}
