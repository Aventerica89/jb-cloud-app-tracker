'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { getVercelProjects } from '@/lib/actions/vercel'
import { Loader2 } from 'lucide-react'
import type { VercelProject } from '@/types/database'

interface VercelProjectSelectProps {
  value?: string | null
  onChange: (value: string) => void
  hasToken: boolean
}

export function VercelProjectSelect({
  value,
  onChange,
  hasToken,
}: VercelProjectSelectProps) {
  const [projects, setProjects] = useState<VercelProject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasToken) return

    async function loadProjects() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getVercelProjects()
        setProjects(data)
      } catch (err) {
        setError('Failed to load Vercel projects')
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [hasToken])

  if (!hasToken) {
    return (
      <div className="grid gap-2">
        <Label>Vercel Project</Label>
        <p className="text-sm text-muted-foreground">
          Configure your Vercel token in{' '}
          <a href="/settings" className="text-primary hover:underline">
            Settings
          </a>{' '}
          to link this app to a Vercel project.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-2">
        <Label>Vercel Project</Label>
        <div className="flex items-center gap-2 h-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading projects...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-2">
        <Label>Vercel Project</Label>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="vercel_project">Vercel Project</Label>
      <Select value={value || 'none'} onValueChange={(v) => onChange(v === 'none' ? '' : v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select a Vercel project (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
              {project.framework && (
                <span className="ml-2 text-muted-foreground">
                  ({project.framework})
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Link to a Vercel project to sync deployments automatically.
      </p>
    </div>
  )
}
