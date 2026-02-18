import { z } from 'zod'

export const appStatusSchema = z.enum(['active', 'inactive', 'archived', 'maintenance'])

export const createApplicationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  display_name: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(500).optional(),
  repository_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  live_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tech_stack: z.array(z.string()).default([]),
  status: appStatusSchema.default('active'),
  tag_ids: z.array(z.string().uuid()).default([]),
  vercel_project_id: z.string().optional().or(z.literal('')),
  cloudflare_project_name: z.string().optional().or(z.literal('')),
  github_repo_name: z.string().optional().or(z.literal('')),
})

export const updateApplicationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100).optional(),
  display_name: z.string().max(100).optional().or(z.literal('')).nullable(),
  description: z.string().max(500).optional().nullable(),
  repository_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  live_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  tech_stack: z.array(z.string()).optional(),
  status: appStatusSchema.optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
  vercel_project_id: z.string().optional().or(z.literal('')).nullable(),
  cloudflare_project_name: z.string().optional().or(z.literal('')).nullable(),
  github_repo_name: z.string().optional().or(z.literal('')).nullable(),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>
