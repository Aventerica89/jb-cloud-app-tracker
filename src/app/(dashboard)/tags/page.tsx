import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Tags } from 'lucide-react'
import { getTags } from '@/lib/actions/tags'
import { AddTagDialog } from '@/components/tags/add-tag-dialog'
import { TagActions } from '@/components/tags/tag-actions'

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div className="flex flex-col h-full">
      <Header title="Tags" description="Organize your applications with tags">
        <AddTagDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </AddTagDialog>
      </Header>

      <div className="flex-1 p-6">
        {tags.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12">
            <CardContent className="flex flex-col items-center text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Tags className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tags yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Create tags to organize and filter your applications.
              </p>
              <AddTagDialog>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first tag
                </Button>
              </AddTagDialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tags.map((tag) => (
              <Card key={tag.id} className="relative">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <TagActions tag={tag} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
