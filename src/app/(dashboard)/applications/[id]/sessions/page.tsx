import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getApplication } from '@/lib/actions/applications'
import { getSessions, getSessionStats } from '@/lib/actions/sessions'
import { SessionList } from '@/components/sessions/session-list'
import { SessionStats } from '@/components/sessions/session-stats'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SessionsPage({ params }: Props) {
  const { id } = await params
  const app = await getApplication(id)

  if (!app) {
    notFound()
  }

  // Fetch sessions and stats in parallel
  const [sessions, stats] = await Promise.all([
    getSessions(id),
    getSessionStats(id),
  ])

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${app.name} - Sessions`}
        description="Claude Code development sessions for this application"
      >
        <div className="flex items-center gap-2">
          <Link href={`/applications/${app.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>
      </Header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <SessionStats stats={stats} />

        {/* Sessions List */}
        <SessionList sessions={sessions} />
      </div>
    </div>
  )
}
