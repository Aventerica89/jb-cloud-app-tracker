'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import {
  AppWindow,
  Rocket,
  Cloud,
  Tags,
  Settings,
  LayoutDashboard,
  Plus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

interface SearchableItem {
  id: string
  label: string
  description?: string
  href: string
  icon: React.ReactNode
  group: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const navigationItems: SearchableItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Overview and stats',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      group: 'Navigation',
    },
    {
      id: 'applications',
      label: 'Applications',
      description: 'View all applications',
      href: '/applications',
      icon: <AppWindow className="h-4 w-4" />,
      group: 'Navigation',
    },
    {
      id: 'deployments',
      label: 'Deployments',
      description: 'View all deployments',
      href: '/deployments',
      icon: <Rocket className="h-4 w-4" />,
      group: 'Navigation',
    },
    {
      id: 'providers',
      label: 'Providers',
      description: 'Manage cloud providers',
      href: '/providers',
      icon: <Cloud className="h-4 w-4" />,
      group: 'Navigation',
    },
    {
      id: 'tags',
      label: 'Tags',
      description: 'Manage tags',
      href: '/tags',
      icon: <Tags className="h-4 w-4" />,
      group: 'Navigation',
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'User settings and API tokens',
      href: '/settings',
      icon: <Settings className="h-4 w-4" />,
      group: 'Navigation',
    },
  ]

  const actionItems: SearchableItem[] = [
    {
      id: 'new-app',
      label: 'New Application',
      description: 'Create a new application',
      href: '/applications/new',
      icon: <Plus className="h-4 w-4" />,
      group: 'Actions',
    },
    {
      id: 'new-deployment',
      label: 'New Deployment',
      description: 'Add a deployment',
      href: '/deployments/new',
      icon: <Rocket className="h-4 w-4" />,
      group: 'Actions',
    },
  ]

  const filterItems: SearchableItem[] = [
    {
      id: 'filter-active',
      label: 'Active Applications',
      description: 'Filter by active status',
      href: '/applications?status=active',
      icon: <AppWindow className="h-4 w-4" />,
      group: 'Filters',
    },
    {
      id: 'filter-maintenance',
      label: 'Maintenance Applications',
      description: 'Filter by maintenance status',
      href: '/applications?status=maintenance',
      icon: <RefreshCw className="h-4 w-4" />,
      group: 'Filters',
    },
    {
      id: 'filter-inactive',
      label: 'Inactive Applications',
      description: 'Filter by inactive status',
      href: '/applications?status=inactive',
      icon: <AppWindow className="h-4 w-4" />,
      group: 'Filters',
    },
  ]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search applications, pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.description}`}
              onSelect={() => handleSelect(item.href)}
            >
              {item.icon}
              <div className="flex flex-col">
                <span>{item.label}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {actionItems.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.description}`}
              onSelect={() => handleSelect(item.href)}
            >
              {item.icon}
              <div className="flex flex-col">
                <span>{item.label}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Filters">
          {filterItems.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.description}`}
              onSelect={() => handleSelect(item.href)}
            >
              {item.icon}
              <div className="flex flex-col">
                <span>{item.label}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
