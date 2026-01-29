// Enums
export type AppStatus = 'active' | 'inactive' | 'archived' | 'maintenance'
export type DeploymentStatus = 'pending' | 'building' | 'deployed' | 'failed' | 'rolled_back'
export type MaintenanceStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

// User Settings
export interface UserSettings {
  user_id: string
  vercel_token: string | null
  vercel_team_id: string | null
  cloudflare_token: string | null
  cloudflare_account_id: string | null
  created_at: string
  updated_at: string
}

// Base types (from database)
export interface CloudProvider {
  id: string
  user_id: string
  name: string
  slug: string
  icon_name: string | null
  base_url: string | null
  is_active: boolean
  created_at: string
}

export interface Environment {
  id: string
  name: string
  slug: string
  sort_order: number
}

export interface Application {
  id: string
  user_id: string
  name: string
  description: string | null
  repository_url: string | null
  live_url: string | null
  tech_stack: string[]
  status: AppStatus
  vercel_project_id: string | null
  cloudflare_project_name: string | null
  created_at: string
  updated_at: string
}

export interface Deployment {
  id: string
  application_id: string
  provider_id: string
  environment_id: string
  url: string | null
  branch: string | null
  commit_sha: string | null
  status: DeploymentStatus
  external_id: string | null
  deployed_at: string
  created_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
}

export interface ApplicationTag {
  application_id: string
  tag_id: string
}

export interface MaintenanceCommandType {
  id: string
  name: string
  slug: string
  description: string | null
  recommended_frequency_days: number
  icon: string | null
  color: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface MaintenanceRun {
  id: string
  application_id: string
  command_type_id: string
  status: MaintenanceStatus
  results: Record<string, unknown> | null
  notes: string | null
  run_at: string
  created_at: string
}

// Extended types (with relations)
export interface ApplicationWithRelations extends Application {
  deployments: DeploymentWithRelations[]
  tags: Tag[]
}

export interface DeploymentWithRelations extends Deployment {
  provider: CloudProvider
  environment: Environment
}

export interface MaintenanceRunWithRelations extends MaintenanceRun {
  command_type: MaintenanceCommandType
}

export interface MaintenanceStatusItem {
  command_type: MaintenanceCommandType
  last_run_at: string | null
  last_status: string | null
  days_since_run: number | null
  is_overdue: boolean
  never_run: boolean
}

// Input types (for forms/mutations)
export interface CreateApplicationInput {
  name: string
  description?: string
  repository_url?: string
  live_url?: string
  tech_stack?: string[]
  status?: AppStatus
  tag_ids?: string[]
  vercel_project_id?: string
  cloudflare_project_name?: string
}

export interface UpdateApplicationInput {
  id: string
  name?: string
  description?: string
  repository_url?: string
  live_url?: string
  tech_stack?: string[]
  status?: AppStatus
  tag_ids?: string[]
  vercel_project_id?: string
  cloudflare_project_name?: string
}

export interface CreateDeploymentInput {
  application_id: string
  provider_id: string
  environment_id: string
  url?: string
  branch?: string
  commit_sha?: string
  status?: DeploymentStatus
  deployed_at?: string
}

export interface CreateProviderInput {
  name: string
  slug: string
  icon_name?: string
  base_url?: string
}

export interface CreateTagInput {
  name: string
  color?: string
}

// Vercel API types
export interface VercelProject {
  id: string
  name: string
  framework: string | null
  updatedAt: number
}

export interface VercelDeployment {
  uid: string
  name: string
  url: string | null
  state: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'CANCELED' | 'INITIALIZING'
  target: 'production' | 'preview' | null
  createdAt: number
  meta?: {
    githubCommitRef?: string
    githubCommitSha?: string
  }
}

// Cloudflare API types
export interface CloudflareProject {
  name: string
  subdomain: string
  production_branch: string
  created_on: string
}

export interface CloudflareDeployment {
  id: string
  project_name: string
  url: string | null
  environment: 'production' | 'preview'
  deployment_trigger: {
    metadata?: {
      branch?: string
      commit_hash?: string
    }
  }
  latest_stage: {
    name: string
    status: 'active' | 'idle' | 'canceled' | 'failure' | 'success'
  }
  created_on: string
}
