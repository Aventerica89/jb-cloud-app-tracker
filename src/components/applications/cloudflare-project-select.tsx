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
import { getCloudflareProjects } from '@/lib/actions/cloudflare'
import { Loader2 } from 'lucide-react'
import type { CloudflareProject } from '@/types/database'

interface CloudflareProjectSelectProps {
  value?: string | null
  onChange: (value: string) => void
  hasToken: boolean
}

export function CloudflareProjectSelect({
  value,
  onChange,
  hasToken,
}: CloudflareProjectSelectProps) {
  const [projects, setProjects] = useState<CloudflareProject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasToken) return

    async function loadProjects() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getCloudflareProjects()
        setProjects(data)
      } catch (err) {
        setError('Failed to load Cloudflare projects')
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [hasToken])

  if (!hasToken) {
    return (
      <div className="grid gap-2">
        <Label>Cloudflare Pages Project</Label>
        <p className="text-sm text-muted-foreground">
          Configure your Cloudflare token in{' '}
          <a href="/settings" className="text-primary hover:underline">
            Settings
          </a>{' '}
          to link this app to a Cloudflare Pages project.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-2">
        <Label>Cloudflare Pages Project</Label>
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
        <Label>Cloudflare Pages Project</Label>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="cloudflare_project">Cloudflare Pages Project</Label>
      <Select value={value || 'none'} onValueChange={(v) => onChange(v === 'none' ? '' : v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select a Cloudflare project (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.name} value={project.name}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Link to a Cloudflare Pages project to sync deployments.
      </p>
    </div>
  )
}
