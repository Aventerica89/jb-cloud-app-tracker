# Component Implementation Patterns

Quick reference guide for implementing common UI patterns in the jb-cloud-app-tracker application.

## Table of Contents

1. [Interactive Cards](#interactive-cards)
2. [Status Badges](#status-badges)
3. [Loading States](#loading-states)
4. [Empty States](#empty-states)
5. [Forms with Validation](#forms-with-validation)
6. [Async Action Buttons](#async-action-buttons)
7. [Lists and Grids](#lists-and-grids)
8. [Links with Accessibility](#links-with-accessibility)

---

## Interactive Cards

### Pattern: Clickable Card with Keyboard Support

```tsx
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { interactiveStates } from '@/lib/design-tokens'
import { useRouter } from 'next/navigation'

function ClickableCard({ item }) {
  const router = useRouter()

  function handleClick() {
    router.push(`/items/${item.id}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/items/${item.id}`)
    }
  }

  return (
    <Card
      className={cn(
        'h-full group',
        interactiveStates.card.base,
        interactiveStates.card.hover,
        interactiveStates.card.focus,
        interactiveStates.card.active
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`View ${item.name}`}
    >
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

**Key Points:**
- Always include `tabIndex={0}` for keyboard focus
- Handle both Enter and Space keys
- Add `role="article"` or `role="button"` as appropriate
- Include descriptive `aria-label`
- Use design token interactive states

---

## Status Badges

### Pattern: Application Status Badge

```tsx
import { AppStatusBadge } from '@/components/ui/status-badge'

function ApplicationStatus({ status }) {
  return <AppStatusBadge status={status} size="sm" />
}
```

### Pattern: Deployment Status Badge

```tsx
import { DeploymentStatusBadge } from '@/components/ui/status-badge'

function DeploymentStatus({ status }) {
  return <DeploymentStatusBadge status={status} /> // Auto-animates for building/pending
}
```

### Pattern: Environment Badge

```tsx
import { EnvironmentBadge } from '@/components/ui/status-badge'

function EnvBadge({ environment }) {
  return (
    <EnvironmentBadge
      environment={environment.slug}
      label={environment.name}
      size="sm"
    />
  )
}
```

### Pattern: Custom Status Badge

```tsx
import { StatusBadge } from '@/components/ui/status-badge'
import { CheckCircle } from 'lucide-react'

function CustomBadge() {
  return (
    <StatusBadge
      type="semantic"
      status="success"
      label="Verified"
      icon={<CheckCircle />}
      animated={false}
    />
  )
}
```

---

## Loading States

### Pattern: Page-Level Loading with Suspense

```tsx
import { Suspense } from 'react'
import { GridSkeleton } from '@/components/ui/card-skeleton'

function ApplicationsPage() {
  return (
    <div>
      <Header title="Applications" />

      <Suspense fallback={<GridSkeleton type="app" count={6} />}>
        <ApplicationsList />
      </Suspense>
    </div>
  )
}
```

### Pattern: List Loading

```tsx
import { Suspense } from 'react'
import { ListSkeleton } from '@/components/ui/card-skeleton'

function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deployments</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ListSkeleton count={5} />}>
          <DeploymentList />
        </Suspense>
      </CardContent>
    </Card>
  )
}
```

### Pattern: Stat Cards Loading

```tsx
import { GridSkeleton } from '@/components/ui/card-skeleton'

function DashboardStats() {
  return (
    <Suspense fallback={
      <GridSkeleton type="stat" count={4} className="md:grid-cols-4" />
    }>
      <StatsGrid />
    </Suspense>
  )
}
```

---

## Empty States

### Pattern: No Data (First Time User)

```tsx
import { EmptyState } from '@/components/ui/empty-state'
import { AppWindow } from 'lucide-react'

function ApplicationsList({ applications }) {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={AppWindow}
        title="No applications yet"
        description="Start tracking your cloud applications by adding your first one."
        action={{
          label: 'Add your first application',
          href: '/applications/new'
        }}
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {applications.map(app => <AppCard key={app.id} app={app} />)}
    </div>
  )
}
```

### Pattern: No Search Results (Filtered)

```tsx
import { FilteredEmptyState } from '@/components/ui/empty-state'
import { Search } from 'lucide-react'

function SearchResults({ results, hasFilters, onClearFilters }) {
  if (results.length === 0 && hasFilters) {
    return (
      <FilteredEmptyState
        icon={Search}
        onClearFilters={onClearFilters}
      />
    )
  }

  return <ResultsList results={results} />
}
```

### Pattern: Compact Empty State (in a card)

```tsx
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

function DocumentsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={FileText}
          title="No documents"
          description="Upload your first document."
          size="compact"
          action={{
            label: 'Upload',
            onClick: handleUpload
          }}
        />
      </CardContent>
    </Card>
  )
}
```

---

## Forms with Validation

### Pattern: Text Input with Validation

```tsx
import { TextInputField } from '@/components/ui/form-field'
import { useState } from 'react'

function ApplicationForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  return (
    <form>
      <TextInputField
        id="name"
        label="Application Name"
        required
        maxLength={100}
        showCount
        helpText="Choose a unique name for your application"
        error={errors.name}
        placeholder="My Awesome App"
      />
    </form>
  )
}
```

### Pattern: Textarea with Character Count

```tsx
import { TextareaField } from '@/components/ui/form-field'
import { useState } from 'react'

function DescriptionInput() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  return (
    <TextareaField
      id="description"
      label="Description"
      rows={4}
      maxLength={500}
      showCount
      helpText="Describe what this application does"
      error={errors.description}
      placeholder="Enter a description..."
    />
  )
}
```

### Pattern: Select with Validation

```tsx
import { FormField } from '@/components/ui/form-field'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

function StatusSelect({ value, onChange, error }) {
  return (
    <FormField
      id="status"
      label="Status"
      required
      error={error}
      helpText="Select the current application status"
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  )
}
```

---

## Async Action Buttons

### Pattern: Save Button with Loading State

```tsx
import { LoadingButton, useLoadingButton } from '@/components/ui/loading-button'
import { toast } from 'sonner'

function SaveForm() {
  const saveButton = useLoadingButton({
    onSuccess: () => toast.success('Saved successfully!'),
    onError: (error) => toast.error(error.message)
  })

  async function handleSave() {
    await saveButton.execute(async () => {
      await saveData()
    })
  }

  return (
    <LoadingButton
      state={saveButton.state}
      loadingText="Saving..."
      successText="Saved!"
      onClick={handleSave}
    >
      Save Changes
    </LoadingButton>
  )
}
```

### Pattern: Delete Button with Confirmation

```tsx
import { LoadingButton } from '@/components/ui/loading-button'
import { useState } from 'react'

function DeleteButton({ onDelete }) {
  const [state, setState] = useState('idle')

  async function handleDelete() {
    if (!confirm('Are you sure?')) return

    setState('loading')
    try {
      await onDelete()
      setState('success')
    } catch (error) {
      setState('error')
    }
  }

  return (
    <LoadingButton
      state={state}
      variant="destructive"
      loadingText="Deleting..."
      successText="Deleted"
      errorText="Failed"
      onClick={handleDelete}
    >
      Delete
    </LoadingButton>
  )
}
```

---

## Lists and Grids

### Pattern: Responsive Grid

```tsx
function ApplicationsGrid({ applications }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {applications.map(app => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  )
}
```

### Pattern: List with Spacing

```tsx
import { spacing } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

function DeploymentList({ deployments }) {
  return (
    <div className={cn('space-y-3', spacing.md)}>
      {deployments.map(deployment => (
        <DeploymentItem key={deployment.id} deployment={deployment} />
      ))}
    </div>
  )
}
```

---

## Links with Accessibility

### Pattern: External Link

```tsx
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interactiveStates } from '@/lib/design-tokens'

function ExternalLinkComponent({ href, children, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-1 text-primary',
        interactiveStates.link.base,
        interactiveStates.link.hover,
        interactiveStates.link.focus
      )}
      aria-label={label || `Open ${href} in new tab`}
    >
      {children}
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  )
}
```

### Pattern: Navigation Link

```tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { interactiveStates } from '@/lib/design-tokens'

function NavLink({ href, children, isActive }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
        interactiveStates.link.base,
        interactiveStates.link.focus,
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {children}
    </Link>
  )
}
```

### Pattern: Link that stops event propagation (in a card)

```tsx
function CardWithLink({ app }) {
  return (
    <Card onClick={() => router.push(`/apps/${app.id}`)}>
      <CardContent>
        <h3>{app.name}</h3>
        <a
          href={app.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()} // Prevent card click
          className={cn(
            'flex items-center gap-1',
            interactiveStates.link.hover
          )}
          aria-label={`Visit ${app.name} live site`}
        >
          <Globe className="h-3 w-3" aria-hidden="true" />
          Visit Site
        </a>
      </CardContent>
    </Card>
  )
}
```

---

## Common Gotchas

### 1. Event Propagation in Nested Interactives

When you have links inside clickable cards, stop propagation:

```tsx
<Card onClick={handleCardClick}>
  <a
    href={url}
    onClick={(e) => e.stopPropagation()}
  >
    Link
  </a>
</Card>
```

### 2. Focus States on Custom Elements

Always add proper focus states to custom interactive elements:

```tsx
<div
  role="button"
  tabIndex={0}
  className={cn(
    'cursor-pointer',
    interactiveStates.button.focus
  )}
  onKeyDown={handleKeyDown}
>
```

### 3. Loading State Announcements

Loading states should announce to screen readers:

```tsx
<div
  aria-busy="true"
  aria-label="Loading applications"
>
  <Skeleton />
</div>
```

### 4. Icon Accessibility

Icons should be hidden from screen readers when text is present:

```tsx
<button>
  <Save className="h-4 w-4" aria-hidden="true" />
  Save
</button>
```

But exposed when they're the only content:

```tsx
<button aria-label="Save">
  <Save className="h-4 w-4" />
</button>
```

---

## Quick Reference

| Need | Component | Import |
|------|-----------|--------|
| Status badge | `AppStatusBadge` | `@/components/ui/status-badge` |
| Empty state | `EmptyState` | `@/components/ui/empty-state` |
| Loading skeleton | `GridSkeleton` | `@/components/ui/card-skeleton` |
| Form field | `TextInputField` | `@/components/ui/form-field` |
| Loading button | `LoadingButton` | `@/components/ui/loading-button` |
| Design tokens | `interactiveStates` | `@/lib/design-tokens` |

---

**Last Updated:** 2026-02-05
