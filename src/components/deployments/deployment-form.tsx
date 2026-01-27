'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDeployment, updateDeployment } from '@/lib/actions/deployments'
import { toast } from 'sonner'
import type {
  Application,
  CloudProvider,
  Environment,
  Deployment,
  DeploymentStatus,
} from '@/types/database'

interface DeploymentFormProps {
  applications: Application[]
  providers: CloudProvider[]
  environments: Environment[]
  deployment?: Deployment
  defaultApplicationId?: string
}

const statusOptions = [
  { value: 'deployed', label: 'Deployed' },
  { value: 'pending', label: 'Pending' },
  { value: 'building', label: 'Building' },
  { value: 'failed', label: 'Failed' },
  { value: 'rolled_back', label: 'Rolled Back' },
]

export function DeploymentForm({
  applications,
  providers,
  environments,
  deployment,
  defaultApplicationId,
}: DeploymentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [applicationId, setApplicationId] = useState(
    deployment?.application_id || defaultApplicationId || ''
  )
  const [providerId, setProviderId] = useState(deployment?.provider_id || '')
  const [environmentId, setEnvironmentId] = useState(
    deployment?.environment_id || ''
  )
  const [status, setStatus] = useState<DeploymentStatus>(
    deployment?.status || 'deployed'
  )

  const isEditing = !!deployment

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    formData.set('application_id', applicationId)
    formData.set('provider_id', providerId)
    formData.set('environment_id', environmentId)
    formData.set('status', status)

    if (isEditing) {
      formData.set('id', deployment.id)
    }

    const action = isEditing ? updateDeployment : createDeployment
    const result = await action(formData)

    if (result.success) {
      toast.success(
        isEditing
          ? 'Deployment updated successfully'
          : 'Deployment created successfully'
      )
      if (isEditing) {
        router.push(`/deployments/${deployment.id}`)
      } else {
        router.push('/deployments')
      }
    } else {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  const activeProviders = providers.filter((p) => p.is_active)

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="application_id">Application *</Label>
        <Select value={applicationId} onValueChange={setApplicationId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select application" />
          </SelectTrigger>
          <SelectContent>
            {applications.map((app) => (
              <SelectItem key={app.id} value={app.id}>
                {app.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="provider_id">Provider *</Label>
        <Select value={providerId} onValueChange={setProviderId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {activeProviders.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="environment_id">Environment *</Label>
        <Select value={environmentId} onValueChange={setEnvironmentId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select environment" />
          </SelectTrigger>
          <SelectContent>
            {environments.map((env) => (
              <SelectItem key={env.id} value={env.id}>
                {env.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="url">Deployment URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          placeholder="https://my-app.vercel.app"
          defaultValue={deployment?.url || ''}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="branch">Branch</Label>
          <Input
            id="branch"
            name="branch"
            placeholder="main"
            defaultValue={deployment?.branch || ''}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="commit_sha">Commit SHA</Label>
          <Input
            id="commit_sha"
            name="commit_sha"
            placeholder="abc123"
            maxLength={40}
            defaultValue={deployment?.commit_sha || ''}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as DeploymentStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
              ? 'Update Deployment'
              : 'Create Deployment'}
        </Button>
      </div>
    </form>
  )
}
