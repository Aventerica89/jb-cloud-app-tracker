'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { saveGitHubSettings, deleteGitHubSettings } from '@/lib/actions/settings'
import { testGitHubConnection } from '@/lib/actions/github'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react'

interface GitHubTokenFormProps {
  hasToken: boolean
  currentUsername?: string | null
}

export function GitHubTokenForm({ hasToken, currentUsername }: GitHubTokenFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  async function handleTest(formData: FormData) {
    setIsTesting(true)
    setTestResult(null)

    const token = formData.get('github_token') as string
    if (!token) {
      toast.error('Please enter a GitHub token')
      setIsTesting(false)
      return
    }

    const result = await testGitHubConnection(token)

    if (result.valid) {
      setTestResult('success')
      toast.success(`Connected as ${result.username}`)
    } else {
      setTestResult('error')
      toast.error(result.error || 'Connection failed')
    }

    setIsTesting(false)
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    const result = await saveGitHubSettings(formData)

    if (result.success) {
      toast.success('GitHub settings saved')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to save settings')
    }

    setIsLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Remove your GitHub token?')) return

    setIsLoading(true)

    const result = await deleteGitHubSettings()

    if (result.success) {
      toast.success('GitHub token removed')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to remove token')
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Integration</CardTitle>
        <CardDescription>
          Connect your GitHub account to sync deployments from repositories.
          {hasToken && (
            <span className="block mt-1 text-green-600 dark:text-green-400">
              Token configured{currentUsername ? ` (${currentUsername})` : ''}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="github_token">
              Personal Access Token {hasToken ? '(enter new to replace)' : '*'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="github_token"
                name="github_token"
                type="password"
                placeholder={hasToken ? '********' : 'ghp_...'}
                required={!hasToken}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  const form = e.currentTarget.closest('form')
                  if (form) handleTest(new FormData(form))
                }}
                disabled={isTesting}
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : testResult === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : testResult === 'error' ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  'Test'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                github.com/settings/tokens
              </a>
              {' '}with <code className="text-xs bg-muted px-1 rounded">repo</code> scope.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="github_username">GitHub Username</Label>
            <Input
              id="github_username"
              name="github_username"
              placeholder="your-username"
              defaultValue={currentUsername || ''}
            />
            <p className="text-xs text-muted-foreground">
              Used to fetch your repositories. Auto-detected on test.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            {hasToken && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Token
              </Button>
            )}
            <Button
              type="button"
              onClick={(e) => {
                const form = e.currentTarget.closest('form')
                if (form) handleSubmit(new FormData(form))
              }}
              disabled={isLoading}
              className={hasToken ? '' : 'ml-auto'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
