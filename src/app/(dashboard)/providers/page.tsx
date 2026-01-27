import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Cloud } from 'lucide-react'

export default function ProvidersPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Cloud Providers"
        description="Manage your cloud provider configurations"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </Header>

      <div className="flex-1 p-6">
        {/* Empty state */}
        <Card className="flex flex-col items-center justify-center p-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Cloud className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No providers yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Default providers will be created when you sign up with Supabase
              configured. You can also add custom providers.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add custom provider
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
