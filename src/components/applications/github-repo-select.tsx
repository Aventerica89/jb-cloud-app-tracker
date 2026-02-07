'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { getGitHubRepos } from '@/lib/actions/github'
import type { GitHubRepo } from '@/types/database'

interface GitHubRepoSelectProps {
  value?: string | null
  hasToken: boolean
}

export function GitHubRepoSelect({ value, hasToken }: GitHubRepoSelectProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!hasToken) return

    setIsLoading(true)
    getGitHubRepos()
      .then(setRepos)
      .finally(() => setIsLoading(false))
  }, [hasToken])

  if (!hasToken) {
    return (
      <div className="grid gap-2">
        <Label>GitHub Repository</Label>
        <p className="text-sm text-muted-foreground">
          Add a GitHub token in Settings to link repositories.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="github_repo_name">GitHub Repository</Label>
      <Select name="github_repo_name" defaultValue={value || ''}>
        <SelectTrigger id="github_repo_name">
          <SelectValue
            placeholder={isLoading ? 'Loading repos...' : 'Select a repository'}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {repos.map((repo) => (
            <SelectItem key={repo.full_name} value={repo.full_name}>
              {repo.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Link a GitHub repository to sync deployments.
      </p>
    </div>
  )
}
