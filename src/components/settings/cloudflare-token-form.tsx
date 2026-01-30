'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { saveCloudflareSettings, deleteCloudflareSettings } from '@/lib/actions/settings'
import { testCloudflareConnection } from '@/lib/actions/cloudflare'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react'

interface CloudflareTokenFormProps {
  hasToken: boolean
  currentAccountId?: string | null
}

export function CloudflareTokenForm({ hasToken, currentAccountId }: CloudflareTokenFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  async function handleTest(formData: FormData) {
    setIsTesting(true)
    setTestResult(null)

    const token = formData.get('cloudflare_token') as string
    const accountId = formData.get('cloudflare_account_id') as string

    if (!token || !accountId) {
      toast.error('Please enter both token and account ID')
      setIsTesting(false)
      return
    }

    const result = await testCloudflareConnection(token, accountId)

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

    const result = await saveCloudflareSettings(formData)

    if (result.success) {
      toast.success('Cloudflare settings saved')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to save settings')
    }

    setIsLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to remove your Cloudflare token?')) {
      return
    }

    setIsLoading(true)

    const result = await deleteCloudflareSettings()

    if (result.success) {
      toast.success('Cloudflare token removed')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to remove token')
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cloudflare Integration</CardTitle>
        <CardDescription>
          Connect your Cloudflare account to sync Pages deployments.
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
            <Label htmlFor="cloudflare_token">
              Cloudflare API Token {hasToken ? '(enter new token to replace)' : '*'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="cloudflare_token"
                name="cloudflare_token"
                type="password"
                placeholder={hasToken ? '********' : 'Enter your Cloudflare API token'}
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
                href="https://dash.cloudflare.com/profile/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                dash.cloudflare.com/profile/api-tokens
              </a>
              {' '}with &quot;Cloudflare Pages:Read&quot; permission.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cloudflare_account_id">Account ID *</Label>
            <Input
              id="cloudflare_account_id"
              name="cloudflare_account_id"
              placeholder="Enter your Cloudflare account ID"
              defaultValue={currentAccountId || ''}
              required={!hasToken}
            />
            <p className="text-xs text-muted-foreground">
              Find your account ID in Cloudflare dashboard URL or Workers & Pages overview.
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
