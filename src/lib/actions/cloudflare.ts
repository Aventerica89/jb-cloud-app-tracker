'use server'

import { createClient } from '@/lib/supabase/server'
import type { CloudflareProject, CloudflareDeployment } from '@/types/database'

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

interface CloudflareCredentials {
  token: string
  accountId: string
}

async function getCloudflareCredentials(): Promise<CloudflareCredentials | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: settings } = await supabase
    .from('user_settings')
    .select('cloudflare_token, cloudflare_account_id')
    .eq('user_id', user.id)
    .single()

  if (!settings?.cloudflare_token || !settings?.cloudflare_account_id) return null

  return {
    token: settings.cloudflare_token,
    accountId: settings.cloudflare_account_id,
  }
}

async function cloudflareRequest<T>(
  endpoint: string,
  credentials: CloudflareCredentials
): Promise<T | null> {
  const response = await fetch(`${CLOUDFLARE_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${credentials.token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    console.error('Cloudflare API error:', response.status, response.statusText)
    return null
  }

  const data = await response.json()
  return data.result
}

export async function getCloudflareProjects(): Promise<CloudflareProject[]> {
  const credentials = await getCloudflareCredentials()
  if (!credentials) return []

  const result = await cloudflareRequest<CloudflareProject[]>(
    `/accounts/${credentials.accountId}/pages/projects`,
    credentials
  )

  return result || []
}

export async function getCloudflareDeployments(
  projectName: string
): Promise<CloudflareDeployment[]> {
  const credentials = await getCloudflareCredentials()
  if (!credentials) return []

  const result = await cloudflareRequest<CloudflareDeployment[]>(
    `/accounts/${credentials.accountId}/pages/projects/${projectName}/deployments`,
    credentials
  )

  return result || []
}

export async function testCloudflareConnection(
  token: string,
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/pages/projects`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const data = await response.json()
      return {
        success: false,
        error: data.errors?.[0]?.message || 'Failed to connect to Cloudflare',
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to Cloudflare',
    }
  }
}
