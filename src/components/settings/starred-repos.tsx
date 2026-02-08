'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Star, GitFork, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Repo {
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
}

export function StarredRepos() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchStarredRepos() {
    setLoading(true)
    try {
      // This is a placeholder - you'll need to implement the actual API call
      // using the gh CLI via a server action or API route
      const response = await fetch('/api/starred-repos')
      if (!response.ok) throw new Error('Failed to fetch starred repos')
      const data = await response.json()
      setRepos(data.repos || [])
    } catch (error) {
      toast.error('Failed to fetch starred repositories')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Starred Repositories</h2>
          <p className="text-sm text-muted-foreground">
            View and manage your starred GitHub repositories
          </p>
        </div>
        <Button onClick={fetchStarredRepos} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Load Starred Repos'}
        </Button>
      </div>

      {repos.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No starred repositories loaded. Click the button above to fetch your starred repos.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {repos.map((repo) => (
          <Card key={repo.full_name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      {repo.full_name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardTitle>
                  {repo.description && (
                    <CardDescription className="mt-1">
                      {repo.description}
                    </CardDescription>
                  )}
                </div>
                {repo.language && (
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    {repo.language}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {repo.stargazers_count.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5" />
                  {repo.forks_count.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
