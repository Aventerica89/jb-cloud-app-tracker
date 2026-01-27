import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, AppWindow } from 'lucide-react'
import { getApplications } from '@/lib/actions/applications'
import { AppCard } from '@/components/applications/app-card'

export default async function ApplicationsPage() {
  const applications = await getApplications()

  return (
    <div className="flex flex-col h-full">
      <Header title="Applications" description="Manage your cloud applications">
        <Link href="/applications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6">
        {applications.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12">
            <CardContent className="flex flex-col items-center text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AppWindow className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Start tracking your cloud applications by adding your first one.
              </p>
              <Link href="/applications/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first application
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
