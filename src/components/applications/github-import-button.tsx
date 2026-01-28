'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Github, CheckCircle2 } from 'lucide-react'

interface ImportResult {
  imported: string[]
  skipped: string[]
  errors: string[]
}

export function GitHubImportButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [username, setUsername] = useState('Aventerica89')

  async function handleImport() {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/import-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data)

      if (data.imported.length > 0) {
        toast.success(`Imported ${data.imported.length} applications`)
        router.refresh()
      } else if (data.skipped.length > 0) {
        toast.info('No new applications to import')
      } else {
        toast.warning('No applications found')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Github className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from GitHub</DialogTitle>
          <DialogDescription>
            Import repositories as applications. Automatically detects deployments
            and generates descriptions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">GitHub Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
            />
          </div>

          <Button
            onClick={handleImport}
            disabled={isLoading || !username}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Repositories'
            )}
          </Button>

          {result && (
            <div className="space-y-3 pt-2 max-h-64 overflow-y-auto">
              {result.imported.length > 0 && (
                <div className="rounded-md bg-green-500/10 p-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Imported ({result.imported.length})
                  </p>
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                    {result.imported.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.skipped.length > 0 && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Skipped ({result.skipped.length})
                  </p>
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                    {result.skipped.slice(0, 10).map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                    {result.skipped.length > 10 && (
                      <li>...and {result.skipped.length - 10} more</li>
                    )}
                  </ul>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="rounded-md bg-red-500/10 p-3">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Errors ({result.errors.length})
                  </p>
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                    {result.errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
