'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Github, CheckCircle2 } from 'lucide-react'

interface ImportResult {
  imported: string[]
  skipped: string[]
  errors: string[]
}

export function GitHubImportForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  async function handleImport(formData: FormData) {
    setIsLoading(true)
    setResult(null)

    const username = formData.get('github_username') as string

    if (!username) {
      toast.error('Please enter a GitHub username')
      setIsLoading(false)
      return
    }

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Import from GitHub
        </CardTitle>
        <CardDescription>
          Import your GitHub repositories as applications. Automatically detects
          Vercel and Cloudflare deployments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="github_username">GitHub Username</Label>
            <div className="flex gap-2">
              <Input
                id="github_username"
                name="github_username"
                placeholder="Aventerica89"
                defaultValue="Aventerica89"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={(e) => {
                  const form = e.currentTarget.closest('form')
                  if (form) handleImport(new FormData(form))
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Repos'
                )}
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-3 pt-2">
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
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside max-h-32 overflow-y-auto">
                    {result.skipped.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
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
        </form>
      </CardContent>
    </Card>
  )
}
