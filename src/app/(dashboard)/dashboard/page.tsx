import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AppStatusBadge,
  DeploymentStatusBadge,
  EnvironmentBadge,
} from '@/components/ui/status-badge'
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
import { statusColors } from '@/lib/design-tokens'
import type { DeploymentStatus, AppStatus } from '@/types/database'

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

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:border-primary/50 dark:hover:border-orange-500/50 transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.name}
                  </CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-orange-500/10 group-hover:bg-primary/20 dark:group-hover:bg-orange-500/20 transition-colors">
                    <stat.icon className="h-4 w-4 text-primary dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
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
                    <EnvironmentBadge environment={env} label={env} />
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
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-muted/30 hover:bg-muted/70 dark:hover:bg-muted/50 transition-colors"
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
                          <EnvironmentBadge
                            environment={deployment.environment.slug}
                            label={deployment.environment.name}
                            size="xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DeploymentStatusBadge
                          status={deployment.status as DeploymentStatus}
                          size="sm"
                        />
                        {deployment.url && (
                          <a
                            href={deployment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary dark:text-orange-400 hover:text-primary/80 dark:hover:text-orange-300"
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
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-muted/30 hover:bg-muted/70 dark:hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium truncate">{app.name}</span>
                      <AppStatusBadge status={app.status as AppStatus} size="sm" />
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
            <div className="flex flex-wrap gap-3">
              <Link href="/applications/new">
                <Button variant="outline" size="sm" className="dark:border-orange-500/20 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10">
                  <AppWindow className="mr-2 h-4 w-4" />
                  New Application
                </Button>
              </Link>
              <Link href="/deployments/new">
                <Button variant="outline" size="sm" className="dark:border-orange-500/20 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10">
                  <Rocket className="mr-2 h-4 w-4" />
                  New Deployment
                </Button>
              </Link>
              <Link href="/providers">
                <Button variant="outline" size="sm" className="dark:border-orange-500/20 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10">
                  <Cloud className="mr-2 h-4 w-4" />
                  Manage Providers
                </Button>
              </Link>
              <Link href="/tags">
                <Button variant="outline" size="sm" className="dark:border-orange-500/20 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10">
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
