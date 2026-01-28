import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { getApplication } from '@/lib/actions/applications'
import { getTags } from '@/lib/actions/tags'
import { hasVercelToken, hasCloudflareToken } from '@/lib/actions/settings'
import { ApplicationForm } from '@/components/applications/application-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditApplicationPage({ params }: Props) {
  const { id } = await params
  const [application, tags, hasVercel, hasCloudflare] = await Promise.all([
    getApplication(id),
    getTags(),
    hasVercelToken(),
    hasCloudflareToken(),
  ])

  if (!application) {
    notFound()
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Edit Application"
        description={`Editing ${application.name}`}
      >
        <Link href={`/applications/${application.id}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6">
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <ApplicationForm application={application} tags={tags} hasVercelToken={hasVercel} hasCloudflareToken={hasCloudflare} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
