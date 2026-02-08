'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Rocket, CheckSquare, FileText, Github, Wrench, Terminal } from 'lucide-react'
import type { ReactNode } from 'react'

interface DetailTabsProps {
  appId: string
  deploymentsContent: ReactNode
  todosContent: ReactNode
  notesContent: ReactNode
  githubContent?: ReactNode
  maintenanceContent: ReactNode
  sessionsContent: ReactNode
}

export function DetailTabs({
  appId,
  deploymentsContent,
  todosContent,
  notesContent,
  githubContent,
  maintenanceContent,
  sessionsContent,
}: DetailTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'deployments'

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'deployments') {
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    const query = params.toString()
    router.push(`/applications/${appId}${query ? `?${query}` : ''}`)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
      {/* Full-width tab bar with transparent backdrop - matches header */}
      <div className="shrink-0 border-b border-border dark:border-orange-500/20 backdrop-blur-md bg-card/95 dark:bg-card/90">
        <div className="px-6">
          <TabsList className="h-12 bg-transparent p-0 gap-1">
            <TabsTrigger value="deployments" className="gap-1.5">
              <Rocket className="h-4 w-4" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="todos" className="gap-1.5">
              <CheckSquare className="h-4 w-4" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
            {githubContent && (
              <TabsTrigger value="github" className="gap-1.5">
                <Github className="h-4 w-4" />
                GitHub
              </TabsTrigger>
            )}
            <TabsTrigger value="maintenance" className="gap-1.5">
              <Wrench className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1.5">
              <Terminal className="h-4 w-4" />
              Sessions
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Tab content with padding */}
      <div className="flex-1 overflow-auto">
        <TabsContent value="deployments" className="p-6 mt-0">
          {deploymentsContent}
        </TabsContent>

        <TabsContent value="todos" className="p-6 mt-0">
          {todosContent}
        </TabsContent>

        <TabsContent value="notes" className="p-6 mt-0">
          {notesContent}
        </TabsContent>

        {githubContent && (
          <TabsContent value="github" className="p-6 mt-0">
            {githubContent}
          </TabsContent>
        )}

        <TabsContent value="maintenance" className="p-6 mt-0">
          {maintenanceContent}
        </TabsContent>

        <TabsContent value="sessions" className="p-6 mt-0">
          {sessionsContent}
        </TabsContent>
      </div>
    </Tabs>
  )
}
