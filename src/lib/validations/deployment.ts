import { z } from 'zod'

export const deploymentStatusSchema = z.enum([
  'pending',
  'building',
  'deployed',
  'failed',
  'rolled_back',
])

export const createDeploymentSchema = z.object({
  application_id: z.string().uuid('Invalid application'),
  provider_id: z.string().uuid('Invalid provider'),
  environment_id: z.string().uuid('Invalid environment'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  branch: z.string().max(100).optional().or(z.literal('')),
  commit_sha: z.string().max(40).optional().or(z.literal('')),
  status: deploymentStatusSchema.default('deployed'),
  deployed_at: z.string().optional(),
})

export const updateDeploymentSchema = z.object({
  id: z.string().uuid('Invalid deployment ID'),
  application_id: z.string().uuid('Invalid application').optional(),
  provider_id: z.string().uuid('Invalid provider').optional(),
  environment_id: z.string().uuid('Invalid environment').optional(),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  branch: z.string().max(100).optional().or(z.literal('')),
  commit_sha: z.string().max(40).optional().or(z.literal('')),
  status: deploymentStatusSchema.optional(),
  deployed_at: z.string().optional(),
})

export type CreateDeploymentInput = z.infer<typeof createDeploymentSchema>
export type UpdateDeploymentInput = z.infer<typeof updateDeploymentSchema>
