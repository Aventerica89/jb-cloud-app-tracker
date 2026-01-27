import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Tags } from 'lucide-react'

export default function TagsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Tags" description="Organize your applications with tags">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </Header>

      <div className="flex-1 p-6">
        {/* Empty state */}
        <Card className="flex flex-col items-center justify-center p-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Tags className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tags yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Create tags to organize and filter your applications.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create your first tag
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
