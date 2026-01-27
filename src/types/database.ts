// Enums
export type AppStatus = 'active' | 'inactive' | 'archived' | 'maintenance'
export type DeploymentStatus = 'pending' | 'building' | 'deployed' | 'failed' | 'rolled_back'

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
  tech_stack: string[]
  status: AppStatus
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

// Extended types (with relations)
export interface ApplicationWithRelations extends Application {
  deployments: DeploymentWithRelations[]
  tags: Tag[]
}

export interface DeploymentWithRelations extends Deployment {
  provider: CloudProvider
  environment: Environment
}

// Input types (for forms/mutations)
export interface CreateApplicationInput {
  name: string
  description?: string
  repository_url?: string
  tech_stack?: string[]
  status?: AppStatus
  tag_ids?: string[]
}

export interface UpdateApplicationInput {
  id: string
  name?: string
  description?: string
  repository_url?: string
  tech_stack?: string[]
  status?: AppStatus
  tag_ids?: string[]
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
