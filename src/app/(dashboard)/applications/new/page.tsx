import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { getTags } from '@/lib/actions/tags'
import { hasVercelToken, hasCloudflareToken, hasGitHubToken } from '@/lib/actions/settings'
import { ApplicationForm } from '@/components/applications/application-form'

export default async function NewApplicationPage() {
  const [tags, hasVercel, hasCloudflare, hasGitHub] = await Promise.all([
    getTags(),
    hasVercelToken(),
    hasCloudflareToken(),
    hasGitHubToken(),
  ])

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

      <div className="flex-1 overflow-auto p-6">
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <ApplicationForm tags={tags} hasVercelToken={hasVercel} hasCloudflareToken={hasCloudflare} hasGitHubToken={hasGitHub} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
