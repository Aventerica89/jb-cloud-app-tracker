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
import { toast } from 'sonner'
import { Loader2, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { autoConnectProviders } from '@/lib/actions/auto-connect'

interface ConnectResult {
  vercel: string[]
  cloudflare: string[]
  workers: string[]
  github: string[]
  alreadyConnected: number
  noRepoUrl: number
}

export function AutoConnectButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ConnectResult | null>(null)

  async function handleConnect() {
    if (isLoading) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await autoConnectProviders()

      if (!response.success) {
        toast.error(response.error)
        return
      }

      const data = response.data!
      setResult(data)

      const totalConnected = data.vercel.length + data.cloudflare.length + data.workers.length + data.github.length
      if (totalConnected > 0) {
        toast.success(`Connected ${totalConnected} applications`)
        router.refresh()
      } else {
        toast.info('No new connections found')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Auto-connect failed'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setResult(null)
    }
  }

  const totalConnected = result
    ? result.vercel.length + result.cloudflare.length + result.workers.length + result.github.length
    : 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Zap className="mr-2 h-4 w-4" />
          Auto-Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Auto-Connect Providers</DialogTitle>
          <DialogDescription>
            Scan your Vercel and Cloudflare projects and match them to existing
            applications by repository URL. Also links GitHub repos for deployment sync.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result && (
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning providers...
                </>
              ) : (
                'Scan & Connect'
              )}
            </Button>
          )}

          {result && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {totalConnected === 0 && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    No new connections found
                  </p>
                  {result.alreadyConnected > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {result.alreadyConnected} app(s) already connected
                    </p>
                  )}
                  {result.noRepoUrl > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {result.noRepoUrl} app(s) have no repository URL
                    </p>
                  )}
                </div>
              )}

              {result.vercel.length > 0 && (
                <div className="rounded-md bg-green-500/10 p-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Vercel ({result.vercel.length})
                  </p>
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                    {result.vercel.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.cloudflare.length > 0 && (
                <div className="rounded-md bg-green-500/10 p-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Cloudflare ({result.cloudflare.length})
                  </p>
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                    {result.cloudflare.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.workers.length > 0 && (
                <div className="rounded-md bg-green-500/10 p-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    CF Workers ({result.workers.length})
                  </p>
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                    {result.workers.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.github.length > 0 && (
                <div className="rounded-md bg-green-500/10 p-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    GitHub ({result.github.length})
                  </p>
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                    {result.github.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {totalConnected > 0 && (
                <Button
                  variant="outline"
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    'Scan Again'
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
