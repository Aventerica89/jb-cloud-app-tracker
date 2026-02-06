'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Toggle } from '@/components/ui/toggle'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Tag } from '@/types/database'

interface TagFilterBarProps {
  tags: Tag[]
}

export function TagFilterBar({ tags }: TagFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeTagIds = searchParams.get('tags')?.split(',').filter(Boolean) || []

  const toggleTag = useCallback(
    (tagId: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        const current = params.get('tags')?.split(',').filter(Boolean) || []

        let updated: string[]
        if (current.includes(tagId)) {
          updated = current.filter((id) => id !== tagId)
        } else {
          updated = [...current, tagId]
        }

        if (updated.length === 0) {
          params.delete('tags')
        } else {
          params.set('tags', updated.join(','))
        }

        const query = params.toString()
        router.push(`/applications${query ? `?${query}` : ''}`)
      })
    },
    [router, searchParams, startTransition]
  )

  const clearTags = useCallback(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('tags')
      const query = params.toString()
      router.push(`/applications${query ? `?${query}` : ''}`)
    })
  }, [router, searchParams, startTransition])

  if (tags.length === 0) return null

  return (
    <div className="flex items-center gap-2 mb-4">
      <ScrollArea className="flex-1 whitespace-nowrap">
        <div className="flex gap-1.5 pb-1">
          {tags.map((tag) => {
            const isActive = activeTagIds.includes(tag.id)
            return (
              <Toggle
                key={tag.id}
                size="sm"
                pressed={isActive}
                onPressedChange={() => toggleTag(tag.id)}
                className="shrink-0 gap-1.5 rounded-full px-3 data-[state=on]:text-white"
                style={
                  isActive
                    ? {
                        backgroundColor: tag.color,
                        borderColor: tag.color,
                      }
                    : {
                        borderColor: `${tag.color}40`,
                        color: tag.color,
                      }
                }
                aria-label={`Filter by ${tag.name}`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: isActive ? 'white' : tag.color }}
                />
                {tag.name}
              </Toggle>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {activeTagIds.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearTags}
          className="shrink-0 text-muted-foreground"
          disabled={isPending}
        >
          <X className="h-3 w-3 mr-1" />
          Clear ({activeTagIds.length})
        </Button>
      )}
    </div>
  )
}
