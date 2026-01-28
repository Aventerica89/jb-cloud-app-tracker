'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { saveVercelSettings, deleteVercelSettings } from '@/lib/actions/settings'
import { testVercelConnection } from '@/lib/actions/vercel'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react'

interface VercelTokenFormProps {
  hasToken: boolean
  currentTeamId?: string | null
}

export function VercelTokenForm({ hasToken, currentTeamId }: VercelTokenFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  async function handleTest(formData: FormData) {
    setIsTesting(true)
    setTestResult(null)

    const token = formData.get('vercel_token') as string
    const teamId = formData.get('vercel_team_id') as string

    if (!token) {
      toast.error('Please enter a Vercel token')
      setIsTesting(false)
      return
    }

    const result = await testVercelConnection(token, teamId || undefined)

    if (result.success) {
      setTestResult('success')
      toast.success('Connection successful')
    } else {
      setTestResult('error')
      toast.error(result.error || 'Connection failed')
    }

    setIsTesting(false)
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    const result = await saveVercelSettings(formData)

    if (result.success) {
      toast.success('Vercel settings saved')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to save settings')
    }

    setIsLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to remove your Vercel token?')) {
      return
    }

    setIsLoading(true)

    const result = await deleteVercelSettings()

    if (result.success) {
      toast.success('Vercel token removed')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to remove token')
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vercel Integration</CardTitle>
        <CardDescription>
          Connect your Vercel account to sync deployments automatically.
          {hasToken && (
            <span className="block mt-1 text-green-600 dark:text-green-400">
              Token configured
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="vercel_token">
              Vercel API Token {hasToken ? '(enter new token to replace)' : '*'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="vercel_token"
                name="vercel_token"
                type="password"
                placeholder={hasToken ? '********' : 'Enter your Vercel API token'}
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
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                vercel.com/account/tokens
              </a>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vercel_team_id">Team ID (optional)</Label>
            <Input
              id="vercel_team_id"
              name="vercel_team_id"
              placeholder="team_..."
              defaultValue={currentTeamId || ''}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use your personal account. Find your team ID in Vercel settings.
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
