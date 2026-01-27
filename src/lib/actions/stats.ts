'use server'

import { createClient } from '@/lib/supabase/server'
import type { DeploymentWithRelations } from '@/types/database'

interface DashboardStats {
  totalApplications: number
  totalDeployments: number
  activeProviders: number
  totalTags: number
  statusCounts: {
    active: number
    inactive: number
    maintenance: number
    archived: number
  }
  environmentCounts: {
    development: number
    staging: number
    production: number
  }
}

interface RecentDeployment {
  id: string
  url: string | null
  status: string
  deployed_at: string
  application: {
    id: string
    name: string
  }
  provider: {
    id: string
    name: string
  }
  environment: {
    id: string
    name: string
    slug: string
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const [
    applicationsRes,
    deploymentsRes,
    providersRes,
    tagsRes,
    environmentsRes,
  ] = await Promise.all([
    supabase.from('applications').select('status'),
    supabase.from('deployments').select('environment_id'),
    supabase.from('cloud_providers').select('id').eq('is_active', true),
    supabase.from('tags').select('id'),
    supabase.from('environments').select('id, slug'),
  ])

  const applications = applicationsRes.data || []
  const deployments = deploymentsRes.data || []
  const providers = providersRes.data || []
  const tags = tagsRes.data || []
  const environments = environmentsRes.data || []

  const statusCounts = {
    active: 0,
    inactive: 0,
    maintenance: 0,
    archived: 0,
  }

  for (const app of applications) {
    const status = app.status as keyof typeof statusCounts
    if (status in statusCounts) {
      statusCounts[status]++
    }
  }

  const environmentMap = new Map(environments.map((e) => [e.id, e.slug]))
  const environmentCounts = {
    development: 0,
    staging: 0,
    production: 0,
  }

  for (const deployment of deployments) {
    const slug = environmentMap.get(deployment.environment_id)
    if (slug && slug in environmentCounts) {
      environmentCounts[slug as keyof typeof environmentCounts]++
    }
  }

  return {
    totalApplications: applications.length,
    totalDeployments: deployments.length,
    activeProviders: providers.length,
    totalTags: tags.length,
    statusCounts,
    environmentCounts,
  }
}

export async function getRecentDeployments(
  limit = 5
): Promise<RecentDeployment[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deployments')
    .select(
      `
      id,
      url,
      status,
      deployed_at,
      application:applications!inner (id, name),
      provider:cloud_providers!inner (id, name),
      environment:environments!inner (id, name, slug)
    `
    )
    .order('deployed_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  // Transform data to ensure relations are objects, not arrays
  return (data || []).map((d) => ({
    id: d.id,
    url: d.url,
    status: d.status,
    deployed_at: d.deployed_at,
    application: d.application as unknown as { id: string; name: string },
    provider: d.provider as unknown as { id: string; name: string },
    environment: d.environment as unknown as {
      id: string
      name: string
      slug: string
    },
  }))
}

export async function getRecentApplications(limit = 5) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select('id, name, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return data || []
}
