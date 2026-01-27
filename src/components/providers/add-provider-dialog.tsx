'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProvider } from '@/lib/actions/providers'
import { toast } from 'sonner'

interface AddProviderDialogProps {
  children: React.ReactNode
}

export function AddProviderDialog({ children }: AddProviderDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    // Auto-generate slug from name if not provided
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    if (!slug && name) {
      formData.set(
        'slug',
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      )
    }

    const result = await createProvider(formData)

    if (result.success) {
      toast.success('Provider created successfully')
      setOpen(false)
    } else {
      toast.error(result.error)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Provider</DialogTitle>
          <DialogDescription>
            Add a new cloud provider to track your deployments.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., AWS, Heroku"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="Auto-generated from name"
              />
              <p className="text-xs text-muted-foreground">
                Lowercase identifier (auto-generated if empty)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="base_url">Website URL</Label>
              <Input
                id="base_url"
                name="base_url"
                type="url"
                placeholder="https://example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon_name">Icon Name</Label>
              <Input
                id="icon_name"
                name="icon_name"
                placeholder="e.g., cloud, server"
              />
              <p className="text-xs text-muted-foreground">
                Lucide icon name (optional)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Provider'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
