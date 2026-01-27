import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppWindow, Cloud, Rocket, Tags } from 'lucide-react'

// Placeholder stats - will be replaced with real data
const stats = [
  { name: 'Total Applications', value: '0', icon: AppWindow },
  { name: 'Deployments', value: '0', icon: Rocket },
  { name: 'Cloud Providers', value: '0', icon: Cloud },
  { name: 'Tags', value: '0', icon: Tags },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        description="Overview of your cloud applications"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder for recent activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No deployments yet. Add your first application to get started.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Set up your Supabase credentials to enable full functionality.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
