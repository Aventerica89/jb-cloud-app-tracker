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

export function AppFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

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

  const handleSearch = (value: string) => {
    startTransition(() => {
      const queryString = createQueryString({ search: value || null })
      router.push(`/applications${queryString ? `?${queryString}` : ''}`)
    })
  }

  const handleStatusChange = (value: string) => {
    startTransition(() => {
      const queryString = createQueryString({ status: value })
      router.push(`/applications${queryString ? `?${queryString}` : ''}`)
    })
  }

  const clearFilters = () => {
    startTransition(() => {
      router.push('/applications')
    })
  }

  const hasFilters = search || status !== 'all'

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search applications..."
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
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
      {isPending && (
        <div className="flex items-center text-sm text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  )
}
