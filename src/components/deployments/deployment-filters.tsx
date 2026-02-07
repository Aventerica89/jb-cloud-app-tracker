'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CloudProvider } from '@/types/database'

interface DeploymentFiltersProps {
  providers: CloudProvider[]
}

export function DeploymentFilters({ providers }: DeploymentFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const provider = searchParams.get('provider') || 'all'
  const environment = searchParams.get('environment') || 'all'

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      // Reset to page 1 when filters change
      newSearchParams.delete('page')

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, value)
        }
      })

      return newSearchParams.toString()
    },
    [searchParams]
  )

  const navigate = (params: Record<string, string | null>) => {
    startTransition(() => {
      const queryString = createQueryString(params)
      router.push(`/deployments${queryString ? `?${queryString}` : ''}`)
    })
  }

  const clearFilters = () => {
    startTransition(() => {
      router.push('/deployments')
    })
  }

  const hasFilters =
    search ||
    status !== 'all' ||
    provider !== 'all' ||
    environment !== 'all'

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by app name..."
            defaultValue={search}
            onChange={(e) => navigate({ search: e.target.value || null })}
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={(v) => navigate({ status: v })}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="deployed">Deployed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="building">Building</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="rolled_back">Rolled back</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={provider}
          onValueChange={(v) => navigate({ provider: v })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            {providers
              .filter((p) => p.is_active)
              .map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={environment}
          onValueChange={(v) => navigate({ environment: v })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All environments</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>

      {isPending && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
    </div>
  )
}
