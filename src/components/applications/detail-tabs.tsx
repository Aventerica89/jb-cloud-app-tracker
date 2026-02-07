'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Rocket, CheckSquare, FileText, Github } from 'lucide-react'
import type { ReactNode } from 'react'

interface DetailTabsProps {
  appId: string
  deploymentsContent: ReactNode
  todosContent: ReactNode
  notesContent: ReactNode
  githubContent?: ReactNode
}

export function DetailTabs({
  appId,
  deploymentsContent,
  todosContent,
  notesContent,
  githubContent,
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
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
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
      </TabsList>

      <TabsContent value="deployments" className="mt-4">
        {deploymentsContent}
      </TabsContent>

      <TabsContent value="todos" className="mt-4">
        {todosContent}
      </TabsContent>

      <TabsContent value="notes" className="mt-4">
        {notesContent}
      </TabsContent>

      {githubContent && (
        <TabsContent value="github" className="mt-4">
          {githubContent}
        </TabsContent>
      )}
    </Tabs>
  )
}
