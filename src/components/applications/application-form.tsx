'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  createApplication,
  updateApplication,
} from '@/lib/actions/applications'
import { VercelProjectSelect } from './vercel-project-select'
import { CloudflareProjectSelect } from './cloudflare-project-select'
import { toast } from 'sonner'
import type { Application, Tag, AppStatus } from '@/types/database'

interface ApplicationFormProps {
  application?: Application & { tags?: Tag[] }
  tags: Tag[]
  hasVercelToken?: boolean
  hasCloudflareToken?: boolean
}

export function ApplicationForm({ application, tags, hasVercelToken = false, hasCloudflareToken = false }: ApplicationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<AppStatus>(
    application?.status || 'active'
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(
    application?.tags?.map((t) => t.id) || []
  )
  const [vercelProjectId, setVercelProjectId] = useState<string>(
    application?.vercel_project_id || ''
  )
  const [cloudflareProjectName, setCloudflareProjectName] = useState<string>(
    application?.cloudflare_project_name || ''
  )

  const isEditing = !!application

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    formData.set('status', status)
    formData.set('tag_ids', selectedTags.join(','))
    formData.set('vercel_project_id', vercelProjectId)
    formData.set('cloudflare_project_name', cloudflareProjectName)

    if (isEditing) {
      formData.set('id', application.id)
    }

    const action = isEditing ? updateApplication : createApplication
    const result = await action(formData)

    if (result.success) {
      toast.success(
        isEditing
          ? 'Application updated successfully'
          : 'Application created successfully'
      )
      if (isEditing) {
        router.push(`/applications/${application.id}`)
      } else if ('data' in result && result.data?.id) {
        router.push(`/applications/${result.data.id}`)
      } else {
        router.push('/applications')
      }
    } else {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  function handleTagToggle(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="My Awesome App"
          required
          maxLength={100}
          defaultValue={application?.name || ''}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What does this application do?"
          rows={3}
          maxLength={500}
          defaultValue={application?.description || ''}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="repository_url">Repository URL</Label>
        <Input
          id="repository_url"
          name="repository_url"
          type="url"
          placeholder="https://github.com/user/repo"
          defaultValue={application?.repository_url || ''}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="live_url">Live URL</Label>
        <Input
          id="live_url"
          name="live_url"
          type="url"
          placeholder="https://myapp.vercel.app"
          defaultValue={application?.live_url || ''}
        />
        <p className="text-xs text-muted-foreground">
          Production URL where the app is deployed
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tech_stack">Tech Stack</Label>
        <Input
          id="tech_stack"
          name="tech_stack"
          placeholder="React, Node.js, PostgreSQL"
          defaultValue={application?.tech_stack?.join(', ') || ''}
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated list of technologies
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as AppStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tags.length > 0 && (
        <div className="grid gap-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => handleTagToggle(tag.id)}
                />
                <label
                  htmlFor={`tag-${tag.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <VercelProjectSelect
        value={vercelProjectId}
        onChange={setVercelProjectId}
        hasToken={hasVercelToken}
      />

      <CloudflareProjectSelect
        value={cloudflareProjectName}
        onChange={setCloudflareProjectName}
        hasToken={hasCloudflareToken}
      />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
              ? 'Update Application'
              : 'Create Application'}
        </Button>
      </div>
    </form>
  )
}
