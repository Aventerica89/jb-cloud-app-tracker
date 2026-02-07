import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UrlPaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string>
}

function buildUrl(
  basePath: string,
  page: number,
  searchParams?: Record<string, string>
) {
  const params = new URLSearchParams(searchParams)
  if (page > 1) {
    params.set('page', String(page))
  } else {
    params.delete('page')
  }
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export function UrlPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: UrlPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4 pt-6">
      {currentPage > 1 ? (
        <Link href={buildUrl(basePath, currentPage - 1, searchParams)}>
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link href={buildUrl(basePath, currentPage + 1, searchParams)}>
          <Button variant="outline" size="sm">
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
