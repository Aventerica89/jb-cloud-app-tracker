# UI Design System Documentation

This document outlines the comprehensive UI design improvements implemented using the ui-designer plugin principles. The design system focuses on rapid implementation, accessibility, consistency, and developer experience.

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Component Library](#component-library)
3. [Accessibility Guidelines](#accessibility-guidelines)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

---

## Design Tokens

Located in `/src/lib/design-tokens.ts`

### Color System

All status colors follow a consistent pattern with proper dark mode support:

```typescript
import { statusColors, getStatusColor } from '@/lib/design-tokens'

// Application statuses
statusColors.app.active       // Green
statusColors.app.inactive     // Gray
statusColors.app.archived     // Amber
statusColors.app.maintenance  // Blue

// Deployment statuses
statusColors.deployment.deployed     // Green
statusColors.deployment.pending      // Yellow
statusColors.deployment.building     // Blue
statusColors.deployment.failed       // Red
statusColors.deployment.rolled_back  // Amber

// Environment colors
statusColors.environment.development // Slate
statusColors.environment.staging     // Purple
statusColors.environment.production  // Emerald

// Semantic states
statusColors.semantic.success  // Green
statusColors.semantic.warning  // Yellow
statusColors.semantic.error    // Red
statusColors.semantic.info     // Blue
```

### Spacing System (8px Grid)

```typescript
import { spacing } from '@/lib/design-tokens'

spacing.xs    // 4px  (gap-1)
spacing.sm    // 8px  (gap-2)
spacing.md    // 12px (gap-3)
spacing.lg    // 16px (gap-4)
spacing.xl    // 24px (gap-6)
spacing['2xl'] // 32px (gap-8)
```

### Interactive States

Consistent hover, focus, and active states for all interactive elements:

```typescript
import { interactiveStates } from '@/lib/design-tokens'

// For clickable cards
interactiveStates.card.base   // Base transition
interactiveStates.card.hover  // Hover effects
interactiveStates.card.focus  // Focus ring
interactiveStates.card.active // Click animation

// For buttons
interactiveStates.button.base     // Base transition
interactiveStates.button.hover    // Hover scale
interactiveStates.button.focus    // Focus ring
interactiveStates.button.active   // Active scale
interactiveStates.button.disabled // Disabled state

// For links
interactiveStates.link.base   // Base transition
interactiveStates.link.hover  // Hover underline
interactiveStates.link.focus  // Focus ring
```

### Typography Scale

Mobile-first typography system:

```typescript
import { typography } from '@/lib/design-tokens'

typography.display  // 4xl md:5xl - Hero text
typography.h1       // 3xl md:4xl - Page titles
typography.h2       // 2xl md:3xl - Section headers
typography.h3       // xl md:2xl  - Subsections
typography.h4       // lg md:xl   - Card titles
typography.body     // base       - Body text
typography.small    // sm         - Secondary text
typography.tiny     // xs         - Metadata
```

---

## Component Library

### StatusBadge (`/src/components/ui/status-badge.tsx`)

Reusable badge component with automatic animations for in-progress states.

**Features:**
- Consistent styling across all status types
- Automatic pulse animation for building/pending states
- Proper ARIA labels
- Multiple size variants

**Usage:**

```tsx
import { AppStatusBadge, DeploymentStatusBadge, EnvironmentBadge } from '@/components/ui/status-badge'

// Application status
<AppStatusBadge status="active" />
<AppStatusBadge status="maintenance" /> // Auto-animated

// Deployment status
<DeploymentStatusBadge status="building" /> // Auto-animated
<DeploymentStatusBadge status="deployed" />

// Environment badge
<EnvironmentBadge environment="production" label="Production" />

// Custom badge
<StatusBadge
  type="semantic"
  status="success"
  label="All good!"
  icon={<CheckIcon />}
  size="sm"
/>
```

### EmptyState (`/src/components/ui/empty-state.tsx`)

Consistent empty/no-data state component with accessibility support.

**Features:**
- Configurable icon, title, description, and action
- Responsive design
- Screen reader announcements
- Compact and default size variants

**Usage:**

```tsx
import { EmptyState, FilteredEmptyState } from '@/components/ui/empty-state'
import { AppWindow } from 'lucide-react'

// Basic empty state
<EmptyState
  icon={AppWindow}
  title="No applications yet"
  description="Start tracking your cloud applications by adding your first one."
  action={{
    label: 'Add your first application',
    href: '/applications/new'
  }}
/>

// Filtered results (no results found)
<FilteredEmptyState
  icon={SearchIcon}
  onClearFilters={() => router.push('/applications')}
/>

// Compact variant
<EmptyState
  icon={FileIcon}
  title="No files"
  description="Upload your first file to get started."
  size="compact"
/>
```

### Card Skeletons (`/src/components/ui/card-skeleton.tsx`)

Skeleton loaders for all card types with proper accessibility.

**Features:**
- Matches the structure of actual components
- ARIA busy states
- Grid and list layouts
- Multiple card types

**Usage:**

```tsx
import {
  AppCardSkeleton,
  DeploymentCardSkeleton,
  StatCardSkeleton,
  GridSkeleton,
  ListSkeleton
} from '@/components/ui/card-skeleton'

// Single skeletons
<AppCardSkeleton />
<DeploymentCardSkeleton />
<StatCardSkeleton />

// Grid of skeletons
<GridSkeleton type="app" count={6} />
<GridSkeleton type="deployment" count={4} />
<GridSkeleton type="stat" count={4} />

// List of skeletons
<ListSkeleton count={5} />
```

### FormField Components (`/src/components/ui/form-field.tsx`)

Enhanced form fields with validation, errors, and help text.

**Features:**
- Automatic error state styling
- Character count for text inputs
- Help text and success messages
- Proper ARIA attributes
- Real-time validation feedback

**Usage:**

```tsx
import { FormField, TextInputField, TextareaField } from '@/components/ui/form-field'

// Basic form field wrapper
<FormField
  id="name"
  label="Application Name"
  required
  helpText="Choose a unique name for your application"
  error={errors.name}
>
  <Input id="name" name="name" />
</FormField>

// Text input with character count
<TextInputField
  id="name"
  label="Application Name"
  required
  maxLength={100}
  showCount
  helpText="Choose a unique name"
  error={errors.name}
/>

// Textarea with character count
<TextareaField
  id="description"
  label="Description"
  rows={4}
  maxLength={500}
  showCount
  helpText="Describe what this application does"
/>
```

### LoadingButton (`/src/components/ui/loading-button.tsx`)

Button with built-in loading, success, and error states.

**Features:**
- Loading spinner
- Success/error indicators
- Automatic state transitions
- Accessible announcements
- Hook for async actions

**Usage:**

```tsx
import { LoadingButton, useLoadingButton } from '@/components/ui/loading-button'

// Manual state management
<LoadingButton
  state={isLoading ? 'loading' : 'idle'}
  loadingText="Saving..."
  successText="Saved!"
  errorText="Failed to save"
>
  Save Changes
</LoadingButton>

// With hook for async actions
function MyForm() {
  const saveButton = useLoadingButton({
    onSuccess: () => toast.success('Saved!'),
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
      onClick={handleSave}
    >
      Save
    </LoadingButton>
  )
}
```

---

## Accessibility Guidelines

### Keyboard Navigation

All interactive components support keyboard navigation:

- **Cards**: Focusable with `tabIndex={0}`, respond to Enter/Space keys
- **Links**: Proper focus states with visible outlines
- **Buttons**: Standard button accessibility
- **Forms**: Tab order follows visual flow

### ARIA Attributes

Proper ARIA attributes are included in all components:

```tsx
// Cards
<Card
  role="article"
  aria-label={`Application: ${app.name}, Status: ${app.status}`}
>

// Links
<a
  href={url}
  aria-label={`Visit live site: ${url}`}
>

// Status badges
<Badge aria-label={`Status: ${status}`}>

// Loading states
<div aria-busy="true" aria-label="Loading content">

// Error messages
<p role="alert" aria-live="assertive">{error}</p>

// Success messages
<p role="status" aria-live="polite">{success}</p>
```

### Screen Reader Support

- Loading states announce "Loading..." to screen readers
- Success/error messages use appropriate ARIA live regions
- All icons have `aria-hidden="true"` with descriptive text nearby
- Empty states use `role="status"` for announcements

### Focus Management

All interactive elements have visible focus states:

```tsx
className={cn(
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2'
)}
```

---

## Usage Examples

### Updating an Existing Card Component

**Before:**

```tsx
<Card className="hover:border-primary/50">
  <CardHeader>
    <CardTitle>{app.name}</CardTitle>
    <Badge className="bg-green-500/10 text-green-500">
      {app.status}
    </Badge>
  </CardHeader>
</Card>
```

**After:**

```tsx
import { AppStatusBadge } from '@/components/ui/status-badge'
import { interactiveStates } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

<Card
  className={cn(
    interactiveStates.card.base,
    interactiveStates.card.hover,
    interactiveStates.card.focus,
    interactiveStates.card.active
  )}
  tabIndex={0}
  role="article"
  aria-label={`Application: ${app.name}, Status: ${app.status}`}
>
  <CardHeader>
    <CardTitle>{app.name}</CardTitle>
    <AppStatusBadge status={app.status} size="sm" />
  </CardHeader>
</Card>
```

### Creating a Loading State

**Before:**

```tsx
{isLoading && <div>Loading...</div>}
{!isLoading && applications.map(app => <AppCard app={app} />)}
```

**After:**

```tsx
import { GridSkeleton } from '@/components/ui/card-skeleton'

<Suspense fallback={<GridSkeleton type="app" count={6} />}>
  <ApplicationsList />
</Suspense>
```

### Handling Empty States

**Before:**

```tsx
{applications.length === 0 && (
  <div>
    <p>No applications</p>
    <Button>Add Application</Button>
  </div>
)}
```

**After:**

```tsx
import { EmptyState } from '@/components/ui/empty-state'
import { AppWindow } from 'lucide-react'

{applications.length === 0 && (
  <EmptyState
    icon={AppWindow}
    title="No applications yet"
    description="Start tracking your cloud applications."
    action={{
      label: 'Add your first application',
      href: '/applications/new'
    }}
  />
)}
```

---

## Best Practices

### 1. Always Use Design Tokens

✅ **Do:**
```tsx
import { interactiveStates } from '@/lib/design-tokens'

<Card className={cn(
  interactiveStates.card.base,
  interactiveStates.card.hover
)}>
```

❌ **Don't:**
```tsx
<Card className="hover:border-primary/50 transition-all">
```

### 2. Use Specialized Components

✅ **Do:**
```tsx
import { AppStatusBadge } from '@/components/ui/status-badge'

<AppStatusBadge status="active" />
```

❌ **Don't:**
```tsx
<Badge className="bg-green-500/10 text-green-500">active</Badge>
```

### 3. Always Add Accessibility Attributes

✅ **Do:**
```tsx
<a
  href={url}
  aria-label={`Visit ${app.name}`}
>
  <ExternalLink className="h-4 w-4" aria-hidden="true" />
  Visit
</a>
```

❌ **Don't:**
```tsx
<a href={url}>
  <ExternalLink className="h-4 w-4" />
  Visit
</a>
```

### 4. Use Proper Loading States

✅ **Do:**
```tsx
<Suspense fallback={<GridSkeleton type="app" count={6} />}>
  <ApplicationsList />
</Suspense>
```

❌ **Don't:**
```tsx
{isLoading ? <div>Loading...</div> : <ApplicationsList />}
```

### 5. Consistent Error Handling

✅ **Do:**
```tsx
<TextInputField
  id="name"
  label="Name"
  error={errors.name}
  helpText="Enter a unique name"
/>
```

❌ **Don't:**
```tsx
<div>
  <Label>Name</Label>
  <Input />
  {errors.name && <span className="text-red-500">{errors.name}</span>}
</div>
```

---

## Component Checklist

When creating or updating components, ensure:

- [ ] Uses design tokens from `/src/lib/design-tokens.ts`
- [ ] Includes proper ARIA attributes
- [ ] Has keyboard navigation support
- [ ] Implements focus states from `interactiveStates`
- [ ] Includes loading states where applicable
- [ ] Has error and success states for forms
- [ ] Uses skeleton loaders for async content
- [ ] Has responsive design (mobile-first)
- [ ] Follows consistent spacing (8px grid)
- [ ] Uses specialized components (StatusBadge, EmptyState, etc.)

---

## Migration Guide

### Step 1: Import Design Tokens

```tsx
import {
  statusColors,
  interactiveStates,
  spacing
} from '@/lib/design-tokens'
```

### Step 2: Replace Inline Styles with Tokens

Find all instances of inline status colors and replace with `statusColors` or specialized components.

### Step 3: Add Accessibility Attributes

Add `aria-label`, `role`, and `aria-live` attributes to all interactive elements.

### Step 4: Implement Loading States

Replace generic loading text with skeleton components.

### Step 5: Use EmptyState Component

Replace custom empty states with the `EmptyState` component.

### Step 6: Update Forms

Wrap form fields with `FormField`, `TextInputField`, or `TextareaField` components.

---

## File Reference

| File Path | Purpose |
|-----------|---------|
| `/src/lib/design-tokens.ts` | Centralized design tokens |
| `/src/components/ui/status-badge.tsx` | Status badge components |
| `/src/components/ui/empty-state.tsx` | Empty state components |
| `/src/components/ui/card-skeleton.tsx` | Loading skeleton components |
| `/src/components/ui/form-field.tsx` | Enhanced form field components |
| `/src/components/ui/loading-button.tsx` | Loading button component |

---

## Support

For questions or issues with the design system, refer to:

1. This documentation
2. Component source code (all components are fully documented)
3. The ui-designer plugin principles in the codebase

---

**Last Updated:** 2026-02-05
**Design System Version:** 1.0.0
