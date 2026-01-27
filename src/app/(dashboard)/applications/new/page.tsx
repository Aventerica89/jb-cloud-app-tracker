'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { createApplication } from '@/lib/actions/applications'
import { toast } from 'sonner'

export default function NewApplicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('active')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    formData.set('status', status)

    const result = await createApplication(formData)

    if (result.success) {
      toast.success('Application created successfully')
      router.push(`/applications/${result.data?.id}`)
    } else {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="New Application" description="Add a new cloud application">
        <Link href="/applications">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6">
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <form action={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Awesome App"
                  required
                  maxLength={100}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What does this application do?"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="repository_url">Repository URL</Label>
                <Input
                  id="repository_url"
                  name="repository_url"
                  type="url"
                  placeholder="https://github.com/user/repo"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tech_stack">Tech Stack</Label>
                <Input
                  id="tech_stack"
                  name="tech_stack"
                  placeholder="React, Node.js, PostgreSQL"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of technologies
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/applications">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
