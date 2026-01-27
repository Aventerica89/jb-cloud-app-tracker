import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AppWindow,
  Cloud,
  Rocket,
  Tags,
  Plus,
  ExternalLink,
  ArrowRight,
} from 'lucide-react'
import {
  getDashboardStats,
  getRecentDeployments,
  getRecentApplications,
} from '@/lib/actions/stats'
import type { DeploymentStatus, AppStatus } from '@/types/database'

const statusColors: Record<DeploymentStatus, string> = {
  deployed: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  building: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  rolled_back: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

const appStatusColors: Record<AppStatus, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  archived: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  maintenance: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}

const environmentColors: Record<string, string> = {
  development: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  staging: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  production: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
}

export default async function DashboardPage() {
  const [stats, recentDeployments, recentApps] = await Promise.all([
    getDashboardStats(),
    getRecentDeployments(5),
    getRecentApplications(5),
  ])

  const statCards = [
    {
      name: 'Total Applications',
      value: stats.totalApplications.toString(),
      icon: AppWindow,
      href: '/applications',
    },
    {
      name: 'Deployments',
      value: stats.totalDeployments.toString(),
      icon: Rocket,
      href: '/deployments',
    },
    {
      name: 'Cloud Providers',
      value: stats.activeProviders.toString(),
      icon: Cloud,
      href: '/providers',
    },
    {
      name: 'Tags',
      value: stats.totalTags.toString(),
      icon: Tags,
      href: '/tags',
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        description="Overview of your cloud applications"
      >
        <Link href="/applications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
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
            </Link>
          ))}
        </div>

        {/* Environment Distribution */}
        {stats.totalDeployments > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Deployments by Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {Object.entries(stats.environmentCounts).map(([env, count]) => (
                  <div key={env} className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        environmentColors[env] ||
                        'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }
                    >
                      {env}
                    </Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Deployments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Deployments</CardTitle>
              {recentDeployments.length > 0 && (
                <Link href="/deployments">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {recentDeployments.length === 0 ? (
                <div className="text-center py-6">
                  <Rocket className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No deployments yet
                  </p>
                  <Link href="/deployments/new">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Deployment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDeployments.map((deployment) => (
                    <div
                      key={deployment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/applications/${deployment.application.id}`}
                          className="font-medium hover:underline truncate block"
                        >
                          {deployment.application.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {deployment.provider.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              environmentColors[deployment.environment.slug] ||
                              ''
                            }`}
                          >
                            {deployment.environment.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            statusColors[
                              deployment.status as DeploymentStatus
                            ] || ''
                          }
                        >
                          {deployment.status}
                        </Badge>
                        {deployment.url && (
                          <a
                            href={deployment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              {recentApps.length > 0 && (
                <Link href="/applications">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {recentApps.length === 0 ? (
                <div className="text-center py-6">
                  <AppWindow className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No applications yet
                  </p>
                  <Link href="/applications/new">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Application
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApps.map((app) => (
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <span className="font-medium truncate">{app.name}</span>
                      <Badge
                        variant="outline"
                        className={appStatusColors[app.status as AppStatus]}
                      >
                        {app.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Link href="/applications/new">
                <Button variant="outline" size="sm">
                  <AppWindow className="mr-2 h-4 w-4" />
                  New Application
                </Button>
              </Link>
              <Link href="/deployments/new">
                <Button variant="outline" size="sm">
                  <Rocket className="mr-2 h-4 w-4" />
                  New Deployment
                </Button>
              </Link>
              <Link href="/providers">
                <Button variant="outline" size="sm">
                  <Cloud className="mr-2 h-4 w-4" />
                  Manage Providers
                </Button>
              </Link>
              <Link href="/tags">
                <Button variant="outline" size="sm">
                  <Tags className="mr-2 h-4 w-4" />
                  Manage Tags
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
