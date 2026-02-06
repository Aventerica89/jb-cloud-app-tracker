import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Tags, AppWindow } from 'lucide-react'
import { getTagsWithCounts } from '@/lib/actions/tags'
import { AddTagDialog } from '@/components/tags/add-tag-dialog'
import { TagActions } from '@/components/tags/tag-actions'

export default async function TagsPage() {
  const tags = await getTagsWithCounts()

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

      <div className="flex-1 overflow-auto p-6">
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
              <Card key={tag.id} className="relative group hover:border-primary/50 dark:hover:border-orange-500/50 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{
                          backgroundColor: tag.color,
                          boxShadow: `0 0 0 2px var(--card), 0 0 0 4px ${tag.color}40`
                        }}
                      />
                      <span className="font-semibold">{tag.name}</span>
                    </div>
                    <TagActions tag={tag} />
                  </div>

                  {/* Application count */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <AppWindow className="h-4 w-4" />
                      <span>{tag.app_count} {tag.app_count === 1 ? 'app' : 'apps'}</span>
                    </div>
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: `${tag.color}15`,
                        borderColor: `${tag.color}40`,
                        color: tag.color,
                      }}
                    >
                      {tag.color}
                    </Badge>
                  </div>

                  {/* Link to applications - uses tags filter param */}
                  {tag.app_count > 0 && (
                    <Link
                      href={`/applications?tags=${tag.id}`}
                      className="block text-xs text-primary dark:text-orange-400 hover:underline"
                    >
                      View applications →
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
